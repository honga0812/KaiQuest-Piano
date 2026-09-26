import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Lesson, Challenge, TargetNote, HintToggles, InputMode, PianoNoteEvent } from '../../types/piano';
import { micAdapter } from '../../audio/microphoneAdapter';
import { midiAdapter } from '../../audio/midiAdapter';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { KaiCharacter, CharacterMood } from '../mascot/KaiCharacter';
import { MusicStaff } from '../piano/MusicStaff';
import { NumberedNotation } from '../piano/NumberedNotation';
import { LetterNotation } from '../piano/LetterNotation';
import { DynamicKeyboard } from '../piano/DynamicKeyboard';
import { PitchMonitorBar } from '../piano/PitchMonitorBar';
import { ScaleRecognitionModal } from '../modals/ScaleRecognitionModal';
import { FoxPracticeCorner } from '../mascot/FoxPracticeCorner';

interface LessonInteractiveViewProps {
  lesson: Lesson;
  inputMode: InputMode;
  onBackToMap: () => void;
  onCompleteLesson: (stars: number, score: number, bpm: number, badgeId?: string) => void;
  className?: string;
}

export const LessonInteractiveView: React.FC<LessonInteractiveViewProps> = ({
  lesson,
  inputMode,
  onBackToMap,
  onCompleteLesson,
  className = '',
}) => {
  // Available challenges in this lesson
  const allChallenges = [
    ...lesson.techniqueChallenges,
    ...lesson.songChallenges,
    ...lesson.performanceChallenges,
  ];

  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const currentChallenge: Challenge = allChallenges[activeChallengeIndex] || allChallenges[0];

  // Note progress state
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  // Metronome and Tempo state
  const [bpm, setBpm] = useState(currentChallenge.bpm || 80);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Feedback states
  const [characterMood, setCharacterMood] = useState<CharacterMood>('listening');
  const [mascotText, setMascotText] = useState(currentChallenge.characterPrompt);
  const [mascotEn, setMascotEn] = useState(currentChallenge.characterPromptEn);
  const [isNoteCorrect, setIsNoteCorrect] = useState(false);
  const [isNoteWobbly, setIsNoteWobbly] = useState(false);

  // Real-time Pitch Monitor state
  const [detectedNoteName, setDetectedNoteName] = useState('');
  const [liveCents, setLiveCents] = useState(0);
  const [liveFreq, setLiveFreq] = useState(0);
  const [liveRms, setLiveRms] = useState(0);
  const [liveActiveMidi, setLiveActiveMidi] = useState<number | undefined>(undefined);
  const [isAboveThreshold, setIsAboveThreshold] = useState(false);
  const [noiseThreshold, setNoiseThreshold] = useState(micAdapter.getNoiseGateThreshold());
  const [lastHitTimestamp, setLastHitTimestamp] = useState<number>(0);
  const isAdvancingRef = useRef(false);
  const lastHandledOnsetIdRef = useRef<number | null>(null);
  const lastSuccessTimeRef = useRef<number>(0);
  const lastSuccessMidiRef = useRef<number | null>(null);

  // Mic state & scale tester modal
  const [isMicRunning, setIsMicRunning] = useState(micAdapter.getIsRunning());
  const [micError, setMicError] = useState<string | null>(null);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Challenge Complete modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [starsAwarded, setStarsAwarded] = useState(3);

  // 4 Hint toggles (can be independently toggled by teacher/parent)
  const [hints, setHints] = useState<HintToggles>({
    staff: true,
    numbered: true,
    letter: true,
    keyboard: true,
  });

  const metronomeTimerRef = useRef<number | null>(null);
  const beatCountRef = useRef(0);

  const notes = currentChallenge.notes;
  const currentTargetNote: TargetNote | undefined = notes[currentNoteIndex];

  // Listen for microphone status changes
  useEffect(() => {
    setIsMicRunning(micAdapter.getIsRunning());
    const unsub = micAdapter.subscribeStatus((st) => {
      setIsMicRunning(st.isListening);
      if (st.error) setMicError(st.error);
    });
    return unsub;
  }, []);

  const handleActivateMic = async () => {
    try {
      setMicError(null);
      await micAdapter.start();
      setIsMicRunning(true);
    } catch (err) {
      setMicError((err as Error).message || '啟動麥克風失敗，請檢查瀏覽器權限');
    }
  };

  // Switch challenge when index changes
  const switchChallenge = (idx: number) => {
    setActiveChallengeIndex(idx);
    const newChallenge = allChallenges[idx];
    setBpm(newChallenge.bpm);
    setCurrentNoteIndex(0);
    setComboStreak(0);
    setConsecutiveErrors(0);
    setCharacterMood('listening');
    setMascotText(newChallenge.characterPrompt);
    setMascotEn(newChallenge.characterPromptEn);
    setShowCompletionModal(false);
  };

  // Metronome tick loop
  useEffect(() => {
    if (!isMetronomeActive) {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
      return;
    }
    const intervalMs = (60 / bpm) * 1000;
    metronomeTimerRef.current = window.setInterval(() => {
      beatCountRef.current = (beatCountRef.current + 1) % 4;
      pianoSynth.playMetronomeTick(beatCountRef.current === 0);
    }, intervalMs);

    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, [isMetronomeActive, bpm]);

  // Subscribe to live audio or MIDI inputs
  useEffect(() => {
    let unsubNote: (() => void) | undefined;
    let unsubPitch: (() => void) | undefined;

    const handleIncomingNote = (event: PianoNoteEvent) => {
      setLiveActiveMidi(event.midiNote);
      setDetectedNoteName(event.noteName);
      setLiveFreq(event.frequencyHz || 0);
      setLiveCents(event.centsOff || 0);

      // If currently advancing to next note, ignore lingering resonance
      if (isAdvancingRef.current) return;

      // Prevent duplicate processing of the exact same physical strike
      if (event.onsetId !== undefined && event.onsetId === lastHandledOnsetIdRef.current) {
        return;
      }

      // Acoustic Resonance & Double-Hit Safeguard:
      // When the note just played was the SAME pitch (e.g. C4 -> C4),
      // acoustic piano string resonance will ring for 500ms+.
      // Require at least 380ms cooldown for same-pitch note, and 220ms for different notes!
      const now = Date.now();
      const isSameAsLastSuccess = lastSuccessMidiRef.current !== null &&
        (event.midiNote === lastSuccessMidiRef.current || (event.midiNote % 12 === lastSuccessMidiRef.current % 12));
      const minCooldown = isSameAsLastSuccess ? 380 : 220;

      if (now - lastSuccessTimeRef.current < minCooldown) {
        return;
      }

      // Verify against current target note
      if (!currentTargetNote) return;

      const isOctaveEquivalent = currentTargetNote.allowOctaveShift && (event.midiNote % 12 === currentTargetNote.midiNote % 12);
      const isTargetMatch = event.midiNote === currentTargetNote.midiNote || isOctaveEquivalent;

      if (isTargetMatch) {
        if (event.onsetId !== undefined) {
          lastHandledOnsetIdRef.current = event.onsetId;
        }
        lastSuccessTimeRef.current = now;
        lastSuccessMidiRef.current = currentTargetNote.midiNote;
        // Correct note hit!
        handleNoteSuccess();
      } else {
        // Wrong note hit (non-punitive)
        handleNoteMiss(event.noteName);
      }

      // Reset live key visual after 250ms
      setTimeout(() => {
        setLiveActiveMidi(undefined);
      }, 250);
    };

    if (inputMode === 'microphone') {
      unsubNote = micAdapter.subscribe(handleIncomingNote);
      unsubPitch = micAdapter.subscribePitchMonitor?.((data) => {
        setLiveRms(data.rms);
        setIsAboveThreshold(!!data.isAboveThreshold);
        if (data.threshold !== undefined) {
          setNoiseThreshold(data.threshold);
        }
        if (data.frequency > 0) {
          setDetectedNoteName(data.noteName);
          setLiveFreq(data.frequency);
          setLiveCents(data.cents);
          // Check if wobbly
          if (Math.abs(data.cents) > 25 && Math.abs(data.cents) <= 48) {
            setIsNoteWobbly(true);
          } else {
            setIsNoteWobbly(false);
          }
        }
      });
    } else if (inputMode === 'midi') {
      unsubNote = midiAdapter.subscribe(handleIncomingNote);
    }

    return () => {
      unsubNote?.();
      unsubPitch?.();
    };
  }, [inputMode, currentTargetNote, currentNoteIndex]);

  // Handle note success
  const handleNoteSuccess = useCallback(() => {
    isAdvancingRef.current = true;
    setIsNoteCorrect(true);
    setIsNoteWobbly(false);
    setCharacterMood('excited');
    const newStreak = comboStreak + 1;
    setComboStreak(newStreak);
    setLastHitTimestamp(Date.now());

    // Play sparkling success hit sound effect
    pianoSynth.playCorrectHitSound();

    // Mini confetti sparkle on screen
    confetti({
      particleCount: 18,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#FBBF24', '#34D399', '#60A5FA', '#F43F5E'],
      disableForReducedMotion: true,
    });

    const nextIndex = currentNoteIndex + 1;

    setTimeout(() => {
      setIsNoteCorrect(false);
      isAdvancingRef.current = false;
      if (nextIndex < notes.length) {
        setCurrentNoteIndex(nextIndex);
        setCharacterMood('listening');
        if (newStreak >= 8) {
          setMascotText('太神啦！鋼琴小大師 Kai 為你拍手！');
          setMascotEn(`Super Combo x${newStreak}! 👑`);
        } else if (newStreak >= 5) {
          setMascotText('火焰連擊！手感太順暢了！');
          setMascotEn(`Fire Combo x${newStreak}! 🔥`);
        } else if (newStreak >= 3) {
          setMascotText('好聽！保持這個節奏！');
          setMascotEn(`Awesome Streak x${newStreak}! ⭐`);
        } else {
          setMascotText('彈對了！好棒的聲音！');
          setMascotEn('Great note! ♪');
        }
      } else {
        // Complete current challenge!
        handleChallengeClear();
      }
    }, 280);
  }, [currentNoteIndex, notes.length, inputMode, comboStreak]);

  // Handle note miss (Non-punitive child experience!)
  const handleNoteMiss = useCallback((playedNoteName: string) => {
    setIsNoteWobbly(true);
    setConsecutiveErrors((prev) => {
      const next = prev + 1;
      // Adaptive help after 3 misses
      if (next >= 3) {
        // Auto lower BPM slightly
        setBpm((currBpm) => Math.max(60, currBpm - 6));
        // Ensure keyboard hint is enabled to assist
        setHints((prevHints) => ({ ...prevHints, keyboard: true }));
        setMascotText(`沒關係慢慢來！試試大拇指或看著發光的琴鍵～`);
        setMascotEn('Take your time! Look at the glowing key!');
        setCharacterMood('encouraging');
      } else {
        setMascotText(`你彈了 ${playedNoteName}，目標是 ${currentTargetNote?.noteName} 喔！`);
        setMascotEn(`Target is ${currentTargetNote?.noteName}!`);
        setCharacterMood('holding');
      }
      return next;
    });

    setTimeout(() => {
      setIsNoteWobbly(false);
    }, 450);
  }, [currentTargetNote]);

  // Challenge Clear Celebration
  const handleChallengeClear = () => {
    setCharacterMood('celebrating');
    pianoSynth.playFanfare();

    // Full screen confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
    });

    const stars = consecutiveErrors === 0 ? 3 : consecutiveErrors <= 2 ? 2 : 1;
    setStarsAwarded(stars);
    setShowCompletionModal(true);

    // Save progress to storage
    onCompleteLesson(stars, 100 - consecutiveErrors * 5, bpm, lesson.badgeId);
  };

  // Play Model Song Demo
  const playDemo = async () => {
    if (isPlayingDemo) return;
    setIsPlayingDemo(true);
    setCharacterMood('listening');
    setMascotText('閉上眼睛聽 Kai 為你示範這首歌曲！');
    setMascotEn('Listen to the model demonstration!');

    const noteDurationMs = (60 / bpm) * 1000;
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      setCurrentNoteIndex(i);
      setLiveActiveMidi(note.midiNote);
      pianoSynth.playNote(note.midiNote, 0.75, note.durationBeats * 0.8);
      await new Promise((r) => setTimeout(r, note.durationBeats * noteDurationMs));
    }

    setLiveActiveMidi(undefined);
    setIsPlayingDemo(false);
    setCurrentNoteIndex(0);
    setCharacterMood('excited');
    setMascotText('輪到你演奏囉！Ready, Go!');
    setMascotEn('Your Turn! Ready, Go!');
  };

  return (
    <div className={`flex flex-col h-full w-full max-w-6xl mx-auto px-3 md:px-6 py-2 select-none overflow-hidden justify-between ${className}`}>
      {/* Top Header Control Deck */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              ← 課程地圖
            </button>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight line-clamp-1">
                {lesson.songName} · {currentChallenge.title}
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentChallenge.titleEn}
              </span>
            </div>
          </div>

          {/* 3 Tier Challenge Tabs (技巧 25% | 歌曲 50% | 表演 25%) */}
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            {allChallenges.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => switchChallenge(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeChallengeIndex === idx
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ch.type === 'technique' ? '1. 技巧' : ch.type === 'song' ? '2. 歌曲' : '3. 表演'}
              </button>
            ))}
          </div>

          {/* Metronome & Demo Play Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScaleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold rounded-xl border border-indigo-500/40 transition shadow-sm"
              title="測試鋼琴音階聽辨"
            >
              <span>🎵</span>
              <span className="hidden sm:inline">音階辨識測試</span>
            </button>

            <button
              onClick={playDemo}
              disabled={isPlayingDemo}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow transition"
              title="示範演奏這首歌"
            >
              <span>▶</span>
              <span className="hidden sm:inline">示範聽聽</span>
            </button>

            <button
              onClick={() => setIsMetronomeActive(!isMetronomeActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                isMetronomeActive
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="開關節拍器"
            >
              <span>⏱️</span>
              <span className="font-mono">{bpm} BPM</span>
            </button>
          </div>
        </div>

        {/* Microphone prompt banner if mic not running */}
        {inputMode === 'microphone' && !isMicRunning && (
          <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-emerald-500/70 rounded-2xl p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-xl">🎙️</span>
              <div className="max-w-xl">
                <span className="text-xs font-bold text-white block">麥克風聽琴辨識尚未啟動</span>
                <span className="text-[11px] text-emerald-300 leading-snug block">
                  {micError
                    ? micError
                    : '點擊右方按鈕開啟麥克風。若瀏覽器沒有跳出允許提示，請點擊網址列左側 🔒 鎖頭圖示手動改為「允許」，或點擊「在新分頁獨立開啟」！'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 text-xs font-semibold rounded-xl border border-blue-400/40 transition whitespace-nowrap"
              >
                在新分頁開啟 ↗
              </a>
              <button
                onClick={handleActivateMic}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg transition flex items-center gap-1.5 animate-pulse whitespace-nowrap"
              >
                <span>🎙️</span>
                <span>點擊開啟麥克風聽琴</span>
              </button>
            </div>
          </div>
        )}

        {/* 4 Hint Toggles Bar (五線譜 / 簡譜 / 字母 / 動態鍵盤) */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">譜面提示開關:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setHints({ ...hints, staff: !hints.staff })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  hints.staff ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                五線譜
              </button>
              <button
                onClick={() => setHints({ ...hints, numbered: !hints.numbered })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  hints.numbered ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                簡譜
              </button>
              <button
                onClick={() => setHints({ ...hints, letter: !hints.letter })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  hints.letter ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                C-D-E 字母
              </button>
              <button
                onClick={() => setHints({ ...hints, keyboard: !hints.keyboard })}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  hints.keyboard ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                琴鍵指法
              </button>
            </div>
          </div>

          {/* Phrase combo status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">進度:</span>
            <span className="font-mono font-bold text-amber-400">
              {currentNoteIndex} / {notes.length}
            </span>
            {comboStreak > 1 && (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold text-[10px] animate-pulse">
                🔥 {comboStreak} 連擊!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Interactive Musical Stage */}
      <div className="flex-1 flex flex-col justify-center gap-2 my-1">
        {/* Mascot & Speech - Enlarged & Interactive */}
        <div className="flex items-center justify-between gap-3">
          <KaiCharacter
            mood={characterMood}
            comboStreak={comboStreak}
            lastHitTimestamp={lastHitTimestamp}
            speechText={mascotText}
            speechEn={mascotEn}
            size="lg"
          />

          {/* Current Target Focus Chip - Enlarged for Tablet */}
          {currentTargetNote && (
            <div className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 border-2 border-amber-400 px-5 py-2.5 rounded-3xl shadow-xl animate-pulse">
              <span className="text-xs md:text-sm font-black text-amber-300">🎯 目標指法:</span>
              <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base md:text-lg border-2 border-white shadow-lg">
                {currentTargetNote.fingerNumber}
              </span>
              <span className="text-base md:text-lg font-black text-white font-mono">
                {currentTargetNote.hand === 'left' ? '左手' : '右手'} {currentTargetNote.noteName} ({currentTargetNote.solfege})
              </span>
            </div>
          )}
        </div>

        {/* 1. 五線譜 (Staff) with accurate note duration and measure concepts */}
        {hints.staff && (
          <MusicStaff
            notes={notes}
            currentIndex={currentNoteIndex}
            isNoteCorrect={isNoteCorrect}
            isNoteWobbly={isNoteWobbly}
            timeSignature={currentChallenge.timeSignature || [4, 4]}
          />
        )}

        {/* 2 & 3. 簡譜與字母音名 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {hints.numbered && (
            <NumberedNotation
              notes={notes}
              currentIndex={currentNoteIndex}
            />
          )}
          {hints.letter && (
            <LetterNotation
              notes={notes}
              currentIndex={currentNoteIndex}
            />
          )}
        </div>

        {/* Real-time Pitch Monitor & Cents Needle */}
        <PitchMonitorBar
          currentDetectedNoteName={detectedNoteName}
          centsOff={liveCents}
          frequencyHz={liveFreq}
          rmsLevel={liveRms}
          isStable={!isNoteWobbly && isNoteCorrect}
          targetNoteName={currentTargetNote?.noteName}
          isListening={inputMode === 'microphone' ? isMicRunning : true}
          onActivateMic={inputMode === 'microphone' ? handleActivateMic : undefined}
          noiseThreshold={noiseThreshold}
          isAboveThreshold={isAboveThreshold}
        />
      </div>

      {/* Bottom Dynamic Keyboard */}
      {hints.keyboard && (
        <div className="shrink-0 pt-1">
          <DynamicKeyboard
            currentTargetNote={currentTargetNote}
            liveActiveMidiNote={liveActiveMidi}
            showFingerNumbers={true}
            onKeyPress={(midiNote) => {
              // Direct screen key tap support
              setLiveActiveMidi(midiNote);
              if (currentTargetNote && midiNote === currentTargetNote.midiNote) {
                handleNoteSuccess();
              } else {
                handleNoteMiss(`音符 ${midiNote}`);
              }
              setTimeout(() => setLiveActiveMidi(undefined), 250);
            }}
          />
        </div>
      )}

      {/* Real-time Scale Recognition & Tuner Modal */}
      <ScaleRecognitionModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
      />

      {/* Dynamic Animated Fox Mascot Corner Widget (Reacts in Real-time to Accuracy & Completion) */}
      <FoxPracticeCorner
        currentNoteIndex={currentNoteIndex}
        totalNotes={notes.length}
        comboStreak={comboStreak}
        consecutiveErrors={consecutiveErrors}
        isNoteCorrect={isNoteCorrect}
        isNoteWobbly={isNoteWobbly}
        accuracyPercent={
          currentNoteIndex + consecutiveErrors > 0
            ? Math.max(0, Math.round((currentNoteIndex / (currentNoteIndex + consecutiveErrors)) * 100))
            : 100
        }
      />

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center gap-4">
            <KaiCharacter
              mood="celebrating"
              speechText="Bravo! 你順利通過了這個關卡！"
              speechEn="Challenge Completed!"
              size="lg"
            />

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 text-3xl">
              {[1, 2, 3].map((starIdx) => (
                <span
                  key={starIdx}
                  className={`transition-all duration-300 ${
                    starIdx <= starsAwarded ? 'text-amber-400 scale-125' : 'text-slate-700'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="text-slate-200 text-sm">
              獲得 <strong className="text-amber-400">{starsAwarded} 顆星</strong>！解鎖「{lesson.badgeTitle}」！
            </div>

            <div className="w-full flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setCurrentNoteIndex(0);
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
              >
                再練一次
              </button>
              {activeChallengeIndex < allChallenges.length - 1 ? (
                <button
                  onClick={() => switchChallenge(activeChallengeIndex + 1)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                >
                  下一關卡 →
                </button>
              ) : (
                <button
                  onClick={onBackToMap}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                >
                  回課程地圖 🗺️
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
