import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Lesson, Challenge, TargetNote, HintToggles, InputMode, PianoNoteEvent, CharacterFriend } from '../../types/piano';
import { micAdapter } from '../../audio/microphoneAdapter';
import { midiAdapter } from '../../audio/midiAdapter';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { KaiCharacter, CharacterMood } from '../mascot/KaiCharacter';
import { EliLionSvg, KabutoBeetleSvg, PicoDolphinSvg, RexDinoSvg } from '../mascot/AnimalFriends';
import { MusicStaff } from '../piano/MusicStaff';
import { NumberedNotation } from '../piano/NumberedNotation';
import { LetterNotation } from '../piano/LetterNotation';
import { DynamicKeyboard } from '../piano/DynamicKeyboard';
import { ScaleRecognitionModal } from '../modals/ScaleRecognitionModal';
import { MagneticStudioDock } from '../layout/MagneticStudioDock';

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

  // Accuracy calculation state
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulHits, setSuccessfulHits] = useState(0);

  // Traveling Companion Mentor state (🦁 Eli, 🪲 Kabuto, 🐬 Pico, 🦖 Rex)
  const [activeMentor, setActiveMentor] = useState<CharacterFriend>(() => {
    if (currentChallenge.character === 'eli_lion') return 'eli_lion';
    if (currentChallenge.character === 'kabuto_beetle' || currentChallenge.character === 'sanjuro') return 'kabuto_beetle';
    if (currentChallenge.character === 'pico_dolphin' || currentChallenge.character === 'gaga_duck') return 'pico_dolphin';
    if (currentChallenge.character === 'rex_dino') return 'rex_dino';
    return 'eli_lion';
  });

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

  // 4 Hint toggles (default: clean layout with Staff + Keyboard)
  const [hints, setHints] = useState<HintToggles>({
    staff: true,
    numbered: false,
    letter: false,
    keyboard: true,
  });

  const metronomeTimerRef = useRef<number | null>(null);
  const beatCountRef = useRef(0);

  const notes = currentChallenge.notes;
  const currentTargetNote: TargetNote | undefined = notes[currentNoteIndex];

  // Calculate real-time accuracy percentage
  const accuracyRate = totalAttempts > 0 ? Math.round((successfulHits / totalAttempts) * 100) : 100;

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
    setTotalAttempts(0);
    setSuccessfulHits(0);
    setCharacterMood('listening');
    setMascotText(newChallenge.characterPrompt);
    setMascotEn(newChallenge.characterPromptEn);
    setShowCompletionModal(false);

    if (newChallenge.character === 'eli_lion') setActiveMentor('eli_lion');
    else if (newChallenge.character === 'kabuto_beetle' || newChallenge.character === 'sanjuro') setActiveMentor('kabuto_beetle');
    else if (newChallenge.character === 'pico_dolphin' || newChallenge.character === 'gaga_duck') setActiveMentor('pico_dolphin');
    else if (newChallenge.character === 'rex_dino') setActiveMentor('rex_dino');
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

      if (isAdvancingRef.current) return;

      const now = Date.now();
      if (event.onsetId && event.onsetId === lastHandledOnsetIdRef.current) return;

      if (
        now - lastSuccessTimeRef.current < 260 &&
        lastSuccessMidiRef.current === event.midiNote
      ) {
        return;
      }

      if (event.onsetId) {
        lastHandledOnsetIdRef.current = event.onsetId;
      }

      if (!currentTargetNote) return;

      const isMatch =
        event.midiNote === currentTargetNote.midiNote ||
        (currentTargetNote.allowOctaveShift &&
          (event.midiNote === currentTargetNote.midiNote + 12 ||
            event.midiNote === currentTargetNote.midiNote - 12));

      if (isMatch) {
        lastSuccessTimeRef.current = now;
        lastSuccessMidiRef.current = event.midiNote;
        handleNoteSuccess();
      } else {
        const targetOctaveDiff = Math.abs(event.midiNote - currentTargetNote.midiNote);
        if (targetOctaveDiff <= 2 && Math.abs(event.centsOff ?? 0) > 35) {
          setIsNoteWobbly(true);
          setTimeout(() => setIsNoteWobbly(false), 300);
        } else {
          handleNoteMiss(event.noteName);
        }
      }
    };

    if (inputMode === 'midi') {
      unsubNote = midiAdapter.subscribe(handleIncomingNote);
    } else {
      unsubNote = micAdapter.subscribe(handleIncomingNote);
      unsubPitch = micAdapter.subscribePitch((data) => {
        setLiveFreq(data.frequencyHz);
        setLiveCents(data.centsOff);
        setLiveRms(data.rmsLevel);
        setDetectedNoteName(data.closestNoteName);
      });
    }

    return () => {
      if (unsubNote) unsubNote();
      if (unsubPitch) unsubPitch();
    };
  }, [inputMode, currentTargetNote]);

  // Handle note success with Accompanying Mentor live encouragement
  const handleNoteSuccess = useCallback(() => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    const hitTime = Date.now();
    setLastHitTimestamp(hitTime);
    setIsNoteCorrect(true);
    setIsNoteWobbly(false);
    setConsecutiveErrors(0);

    setSuccessfulHits((prev) => prev + 1);
    setTotalAttempts((prev) => prev + 1);

    const newStreak = comboStreak + 1;
    setComboStreak(newStreak);

    pianoSynth.playCorrectHitSound();

    // Minor confetti celebration on streak
    if (newStreak >= 4 && newStreak % 3 === 0) {
      confetti({
        particleCount: 18,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#34D399', '#60A5FA', '#F43F5E'],
        disableForReducedMotion: true,
      });
    }

    // Dynamic Companion Mentor Speech Encouragement
    const mentorName =
      activeMentor === 'eli_lion'
        ? '獅子 Eli'
        : activeMentor === 'kabuto_beetle'
        ? '甲蟲 Kabuto'
        : activeMentor === 'pico_dolphin'
        ? '海豚 Pico'
        : '恐龍 Rex';

    const nextIndex = currentNoteIndex + 1;

    setTimeout(() => {
      setIsNoteCorrect(false);
      isAdvancingRef.current = false;
      if (nextIndex < notes.length) {
        setCurrentNoteIndex(nextIndex);
        setCharacterMood('listening');

        if (newStreak >= 8) {
          setMascotText(`${mentorName}：太神啦！大師級五線譜連擊！`);
          setMascotEn(`Super Combo x${newStreak}! 👑`);
        } else if (newStreak >= 5) {
          setMascotText(`${mentorName}：火焰連擊！手感節奏太棒了！`);
          setMascotEn(`Fire Combo x${newStreak}! 🔥`);
        } else if (newStreak >= 3) {
          setMascotText(`${mentorName}：連續命中！保持這個旋律！`);
          setMascotEn(`Awesome Streak x${newStreak}! ⭐`);
        } else {
          setMascotText(`${mentorName}：彈對了！好棒的音符～`);
          setMascotEn('Great note! ♪');
        }
      } else {
        // Complete current challenge!
        handleChallengeClear();
      }
    }, 280);
  }, [currentNoteIndex, notes.length, comboStreak, activeMentor]);

  // Handle note miss with non-punitive gentle guidance
  const handleNoteMiss = useCallback((playedNoteName: string) => {
    setIsNoteWobbly(true);
    setTotalAttempts((prev) => prev + 1);

    const mentorName =
      activeMentor === 'eli_lion'
        ? '獅子 Eli'
        : activeMentor === 'kabuto_beetle'
        ? '甲蟲 Kabuto'
        : activeMentor === 'pico_dolphin'
        ? '海豚 Pico'
        : '恐龍 Rex';

    setConsecutiveErrors((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setBpm((currBpm) => Math.max(60, currBpm - 4));
        setHints((prevHints) => ({ ...prevHints, keyboard: true }));
        setMascotText(`${mentorName}：沒關係慢慢來！看著發光的琴鍵，我們一起彈～`);
        setMascotEn('Take your time! Look at the glowing key!');
        setCharacterMood('encouraging');
      } else {
        setMascotText(`${mentorName}：你彈了 ${playedNoteName}，目標是 ${currentTargetNote?.noteName} 喔！`);
        setMascotEn(`Target is ${currentTargetNote?.noteName}!`);
        setCharacterMood('holding');
      }
      return next;
    });

    setTimeout(() => {
      setIsNoteWobbly(false);
    }, 450);
  }, [currentTargetNote, activeMentor]);

  // Challenge Clear Celebration
  const handleChallengeClear = () => {
    setCharacterMood('celebrating');
    pianoSynth.playFanfare();

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
    });

    let stars = 1;
    if (accuracyRate >= 85 && consecutiveErrors === 0) stars = 3;
    else if (accuracyRate >= 65) stars = 2;

    setStarsAwarded(stars);
    setShowCompletionModal(true);

    onCompleteLesson(stars, Math.round(accuracyRate * 10), bpm, lesson.badgeId);
  };

  // Play audio demonstration
  const playDemo = async () => {
    if (isPlayingDemo) return;
    setIsPlayingDemo(true);
    setCharacterMood('excited');
    setMascotText('請仔細聽隨行導師的示範演奏喔！');
    setMascotEn('Listen carefully to the demonstration!');

    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      setCurrentNoteIndex(i);
      setLiveActiveMidi(n.midiNote);
      pianoSynth.playPianoNote(n.midiNote, 0.85, 0.7);
      await new Promise((res) => setTimeout(res, (60 / bpm) * 1000 * (n.durationBeats || 1)));
    }

    setLiveActiveMidi(undefined);
    setIsPlayingDemo(false);
    setCurrentNoteIndex(0);
    setCharacterMood('excited');
    setMascotText('輪到你演奏囉！Ready, Go!');
    setMascotEn('Your Turn! Ready, Go!');
  };

  return (
    <div className={`flex flex-col min-h-full w-full max-w-6xl mx-auto px-2 md:px-5 py-2 select-none overflow-y-auto justify-between gap-3 pb-24 ${className}`}>
      {/* ========================================================================= */}
      {/* 1. Top Minimal Header Deck (極簡頂部功能列)                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/95 border-3 border-amber-300 rounded-3xl p-3 md:p-4 shadow-sm shrink-0">
        {/* Back Button & Song Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMap}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-sm md:text-base font-black rounded-2xl border-2 border-amber-300 transition shadow-sm active:scale-95"
          >
            <span>←</span>
            <span>返回地圖</span>
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-black text-amber-950 tracking-tight leading-tight line-clamp-1">
              {lesson.songName} · {currentChallenge.title}
            </h2>
            <span className="text-xs text-amber-800 font-extrabold">
              {currentChallenge.titleEn}
            </span>
          </div>
        </div>

        {/* 3 Challenge Tier Tabs */}
        <div className="flex items-center bg-amber-100/80 rounded-2xl p-1 border-2 border-amber-300 shadow-sm">
          {allChallenges.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => switchChallenge(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap active:scale-95 ${
                activeChallengeIndex === idx
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                  : 'text-amber-950 hover:bg-amber-200/70'
              }`}
            >
              {ch.type === 'technique' ? '1. 技巧特訓' : ch.type === 'song' ? '2. 歌曲挑戰' : '3. 舞台表演'}
            </button>
          ))}
        </div>

        {/* Quick Progress & Accuracy Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-3.5 py-2 rounded-2xl text-xs md:text-sm font-black text-amber-950 shadow-sm">
            <span className="text-amber-900">進度:</span>
            <span className="font-mono text-blue-700">
              {currentNoteIndex} / {notes.length}
            </span>
            {comboStreak > 1 && (
              <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full font-black text-xs animate-bounce shadow-sm">
                🔥{comboStreak}連擊
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Microphone prompt banner if mic not running */}
      {inputMode === 'microphone' && !isMicRunning && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-400 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎙️</span>
            <div>
              <span className="text-sm font-black text-emerald-950 block">麥克風聽琴尚未啟動</span>
              <span className="text-xs text-emerald-800 font-bold block">
                {micError || '點選右側按鈕開啟麥克風，即可聽琴即時辨音！'}
              </span>
            </div>
          </div>
          <button
            onClick={handleActivateMic}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-black rounded-xl shadow transition animate-pulse"
          >
            點擊開啟麥克風
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Middle Interactive Musical Stage (五線譜 + 隨行導師與目標指法)          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-center gap-2 my-1">
        {/* Mascot & Traveling Companion Mentor Dynamic Guidance */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Kai & Active Companion Character */}
            <KaiCharacter
              mood={characterMood}
              companion={activeMentor === 'kai' ? 'none' : (activeMentor as any)}
              comboStreak={comboStreak}
              lastHitTimestamp={lastHitTimestamp}
              speechText={mascotText}
              speechEn={mascotEn}
              size="md"
            />
          </div>

          {/* Current Target Focus Chip */}
          {currentTargetNote && (
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 border-2 border-white px-5 py-2.5 rounded-2xl shadow-md text-slate-950">
              <span className="text-xs md:text-sm font-black">🎯 目標指法:</span>
              <span className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base md:text-lg border-2 border-white shadow-sm">
                {currentTargetNote.fingerNumber}
              </span>
              <span className="text-sm md:text-base font-black font-mono">
                {currentTargetNote.hand === 'left' ? '左手' : '右手'} {currentTargetNote.noteName} ({currentTargetNote.solfege})
              </span>
            </div>
          )}
        </div>

        {/* 1. 五線譜 (Staff) with D3.js and Accompanying Mentor Beat Glow Indicator */}
        {hints.staff && (
          <MusicStaff
            notes={notes}
            currentIndex={currentNoteIndex}
            isNoteCorrect={isNoteCorrect}
            isNoteWobbly={isNoteWobbly}
            timeSignature={currentChallenge.timeSignature || [4, 4]}
            activeMidi={liveActiveMidi}
            lastHitTimestamp={lastHitTimestamp}
            bpm={bpm}
            isMetronomeActive={isMetronomeActive}
            mentorId={activeMentor}
            accuracyRate={accuracyRate}
            comboStreak={comboStreak}
          />
        )}

        {/* 2 & 3. 簡譜與字母音名 (僅在磁吸抽屜中開啟時顯示，保持畫面純淨) */}
        {(hints.numbered || hints.letter) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-fade-in">
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
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. Bottom Dynamic Keyboard (底部鋼琴琴鍵)                                  */}
      {/* ========================================================================= */}
      {hints.keyboard && (
        <div className="shrink-0 pt-1">
          <DynamicKeyboard
            currentTargetNote={currentTargetNote}
            liveActiveMidiNote={liveActiveMidi}
            showFingerNumbers={true}
            onKeyPress={(midiNote) => {
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

      {/* ========================================================================= */}
      {/* 4. Magnetic Floating Studio Dock (磁吸式隨行輔助工具島)                      */}
      {/* Replaces clutter with an elegant, touch-friendly floating drawer           */}
      {/* ========================================================================= */}
      <MagneticStudioDock
        activeMentor={activeMentor}
        onSelectMentor={(mentor) => {
          setActiveMentor(mentor);
          pianoSynth.playCorrectHitSound();
        }}
        accuracyRate={accuracyRate}
        comboStreak={comboStreak}
        totalNotes={notes.length}
        currentNoteIndex={currentNoteIndex}
        hints={hints}
        onToggleHint={(key) => setHints((prev) => ({ ...prev, [key]: !prev[key] }))}
        bpm={bpm}
        onChangeBpm={setBpm}
        isMetronomeActive={isMetronomeActive}
        onToggleMetronome={() => setIsMetronomeActive(!isMetronomeActive)}
        onPlayDemo={playDemo}
        isPlayingDemo={isPlayingDemo}
        onOpenScaleModal={() => setShowScaleModal(true)}
        detectedNoteName={detectedNoteName}
        centsOff={liveCents}
        rmsLevel={liveRms}
        isMicRunning={isMicRunning}
        onActivateMic={handleActivateMic}
        inputMode={inputMode}
      />

      {/* Scale Recognition Modal */}
      <ScaleRecognitionModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
      />

      {/* Challenge Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in text-slate-900 select-none">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-400 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center text-5xl shadow-md border-2 border-amber-300 animate-bounce">
              {activeMentor === 'eli_lion' && <EliLionSvg size={70} />}
              {activeMentor === 'kabuto_beetle' && <KabutoBeetleSvg size={65} />}
              {activeMentor === 'pico_dolphin' && <PicoDolphinSvg size={65} />}
              {activeMentor === 'rex_dino' && <RexDinoSvg size={65} />}
              {activeMentor === 'kai' && <EliLionSvg size={70} />}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-amber-700 font-extrabold text-xs uppercase tracking-widest">
                Challenge Complete!
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                🎉 挑戰成功，小探險家！
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {currentChallenge.title} 演奏完畢！
              </p>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-2 text-3xl text-amber-400 my-1">
              {[1, 2, 3].map((s) => (
                <span
                  key={`star-${s}`}
                  className={`transition-all ${s <= starsAwarded ? 'scale-110 drop-shadow' : 'opacity-25 grayscale'}`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Summary stat */}
            <div className="grid grid-cols-2 gap-2 w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="flex flex-col">
                <span className="text-slate-500 font-bold">辨音準確率</span>
                <span className="text-base font-black text-emerald-600">{accuracyRate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-bold">演奏速度</span>
                <span className="text-base font-black text-blue-600">{bpm} BPM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setCurrentNoteIndex(0);
                  setComboStreak(0);
                  setTotalAttempts(0);
                  setSuccessfulHits(0);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition active:scale-95"
              >
                再練一次 🔄
              </button>

              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  if (activeChallengeIndex < allChallenges.length - 1) {
                    switchChallenge(activeChallengeIndex + 1);
                  } else {
                    onBackToMap();
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md transition active:scale-95"
              >
                {activeChallengeIndex < allChallenges.length - 1 ? '下一關 ➔' : '返回地圖 ➔'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
