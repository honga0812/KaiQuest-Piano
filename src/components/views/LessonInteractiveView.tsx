import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { ThematicCelebrationModal } from '../celebration/ThematicCelebrationModal';
import { MagneticStudioDock } from '../layout/MagneticStudioDock';
import { getStandardizedLessonStages, STAGE_METAS } from '../../utils/curriculumStagesHelper';
import { speechGuide } from '../../utils/speechGuide';

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
  // Standardized 4-Stage Pedagogical Progression for every lesson:
  // Stage 1: 技巧初探 -> Stage 2: 歌曲主歌 -> Stage 3: 歌曲副歌 -> Stage 4: 全曲大挑戰
  const allChallenges = useMemo(() => getStandardizedLessonStages(lesson), [lesson]);

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

  // Real-time Rhythm Accuracy & Cartoon Note Mascot state
  const [rhythmAccuracy, setRhythmAccuracy] = useState<number>(92);
  const [isRhythmStable, setIsRhythmStable] = useState<boolean>(true);
  const [noteSwayDirection, setNoteSwayDirection] = useState<'left' | 'right'>('left');
  const lastHitTimeRef = useRef<number>(0);
  const isChallengeClearedRef = useRef<boolean>(false);
  const hasCelebratedRef = useRef<boolean>(false);

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
  const lastMissTimeRef = useRef(0);

  const notes = currentChallenge.notes;
  const currentTargetNote: TargetNote | undefined = notes[currentNoteIndex];

  // Calculate real-time accuracy percentage
  const accuracyRate = totalAttempts > 0 ? Math.round((successfulHits / totalAttempts) * 100) : 100;

  // Instantly cut off any ongoing AI voice tour from map or preview modals
  useEffect(() => {
    speechGuide.stop();
    return () => {
      speechGuide.stop();
    };
  }, []);

  // Listen for microphone status changes & auto-ensure mic running in mic mode
  useEffect(() => {
    setIsMicRunning(micAdapter.getIsRunning());
    const unsub = micAdapter.subscribeStatus((st) => {
      setIsMicRunning(st.isListening);
      if (st.error) setMicError(st.error);
    });

    if (inputMode === 'microphone') {
      micAdapter.ensureRunning().catch(() => {});
    }

    return unsub;
  }, [inputMode]);

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
    setRhythmAccuracy(92);
    setIsRhythmStable(true);
    lastHitTimeRef.current = 0;
    isChallengeClearedRef.current = false;
    hasCelebratedRef.current = false;
    isAdvancingRef.current = false;

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
      setNoteSwayDirection((prev) => (prev === 'left' ? 'right' : 'left'));
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

      if (isAdvancingRef.current || isChallengeClearedRef.current) return;

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
        // Microphone Noise Safeguards:
        // When sound comes from microphone, prevent ambient noise or speech from accumulating false errors
        if (event.source === 'microphone') {
          // 1. Ignore out-of-range sub-bass rumble (<48) or ultra-high squeaks (>88)
          if (event.midiNote < 48 || event.midiNote > 88) return;
          // 2. Reject low-confidence non-piano timbre
          if ((event.confidence ?? 1) < 0.55) return;
          // 3. Debounce miss penalties: at least 650ms cooldown so a single room noise never counts as multiple misses
          if (now - lastMissTimeRef.current < 650) return;
        }

        const targetOctaveDiff = Math.abs(event.midiNote - currentTargetNote.midiNote);
        if (targetOctaveDiff <= 2 && Math.abs(event.centsOff ?? 0) > 35) {
          setIsNoteWobbly(true);
          setTimeout(() => setIsNoteWobbly(false), 300);
        } else {
          lastMissTimeRef.current = now;
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
    if (isAdvancingRef.current || isChallengeClearedRef.current) return;
    isAdvancingRef.current = true;

    const hitTime = Date.now();
    setLastHitTimestamp(hitTime);
    setIsNoteCorrect(true);
    setIsNoteWobbly(false);
    setConsecutiveErrors(0);

    // Calculate real-time rhythm stability
    if (lastHitTimeRef.current > 0) {
      const delta = hitTime - lastHitTimeRef.current;
      const expectedMs = (currentTargetNote?.durationBeats || 1) * (60 / bpm) * 1000;
      const diffRatio = Math.abs(delta - expectedMs) / expectedMs;
      let instantRhythm = 100;
      if (diffRatio <= 0.20) {
        instantRhythm = 100;
      } else if (diffRatio <= 0.38) {
        instantRhythm = 88;
      } else if (diffRatio <= 0.58) {
        instantRhythm = 70;
      } else {
        instantRhythm = 50;
      }
      setRhythmAccuracy((prev) => Math.min(100, Math.max(30, Math.round(prev * 0.55 + instantRhythm * 0.45))));
      setIsRhythmStable(instantRhythm >= 80);
    } else {
      setIsRhythmStable(true);
    }
    lastHitTimeRef.current = hitTime;
    setNoteSwayDirection((prev) => (prev === 'left' ? 'right' : 'left'));

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

    // Check if challenge is completed on this last note!
    if (nextIndex >= notes.length) {
      if (hasCelebratedRef.current) return;
      hasCelebratedRef.current = true;
      isChallengeClearedRef.current = true;
      isAdvancingRef.current = true;
      setTimeout(() => {
        setIsNoteCorrect(false);
        handleChallengeClear();
      }, 250);
      return;
    }

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
      }
    }, 280);
  }, [currentNoteIndex, notes.length, comboStreak, activeMentor, currentTargetNote, bpm]);

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
    <div className={`flex flex-col min-h-0 h-full max-h-[calc(100vh-68px)] w-full max-w-7xl mx-auto px-2 md:px-4 py-1 select-none overflow-y-auto lg:overflow-hidden justify-between gap-1 sm:gap-1.5 ${className}`}>
      {/* ========================================================================= */}
      {/* 1. Top Minimal Header Deck (極簡頂部功能列) - 平板與電腦通用比例設計        */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 bg-white/95 border-2 border-amber-300 rounded-2xl p-2 md:p-2.5 shadow-xs shrink-0">
        {/* Back Button & Song Info */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onBackToMap}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs md:text-sm font-black rounded-xl border border-amber-300 transition shadow-xs active:scale-95 shrink-0"
          >
            <span>←</span>
            <span>返回地圖</span>
          </button>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-amber-950 tracking-tight leading-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {lesson.songName} · {currentChallenge.title}
            </h2>
            <span className="text-[11px] md:text-xs text-amber-800 font-extrabold block truncate max-w-[180px] sm:max-w-xs">
              {currentChallenge.titleEn}
            </span>
          </div>
        </div>

        {/* 4 Pedagogical Stage Tabs: 1. 技巧 -> 2. 主歌 -> 3. 副歌 -> 4. 全曲 */}
        <div className="flex items-center bg-amber-100/90 rounded-xl p-0.5 border border-amber-300 shadow-xs">
          {allChallenges.map((ch, idx) => {
            const meta = STAGE_METAS[(idx + 1) as 1 | 2 | 3 | 4] || {
              shortLabel: `${idx + 1}. 關卡`,
              tabTitle: `${idx + 1}. 關卡`,
              icon: '⭐',
              description: '',
            };
            const isActive = activeChallengeIndex === idx;

            return (
              <button
                key={ch.id}
                onClick={() => switchChallenge(idx)}
                className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-black transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-black'
                    : 'text-amber-950 hover:bg-amber-200/70'
                }`}
                title={meta.description}
              >
                <span className="hidden sm:inline">{meta.icon}</span>
                <span>{meta.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Progress & Accuracy Pill */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl text-xs md:text-sm font-black text-amber-950 shadow-xs">
            <span className="text-amber-900">進度:</span>
            <span className="font-mono text-blue-700 text-sm md:text-base font-black">
              {currentNoteIndex} / {notes.length}
            </span>
            {comboStreak > 1 && (
              <span className="bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-black text-[11px] md:text-xs shadow-xs">
                🔥{comboStreak}連擊
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Microphone prompt banner if mic not running */}
      {inputMode === 'microphone' && !isMicRunning && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-400 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-1.5 shadow-xs text-left shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎙️</span>
            <div>
              <span className="text-xs md:text-sm font-black text-emerald-950 block">麥克風聽琴尚未啟動</span>
              <span className="text-[11px] md:text-xs text-emerald-800 font-bold block">
                {micError || '點選右側按鈕開啟麥克風，即可聽琴即時辨音！'}
              </span>
            </div>
          </div>
          <button
            onClick={handleActivateMic}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-black rounded-xl shadow-xs transition active:scale-95"
          >
            點擊開啟麥克風
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Middle Interactive Musical Stage (五線譜 + 隨行導師與目標指法)          */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-1 my-0.5 overflow-hidden">
        {/* Mascot & Traveling Companion Mentor Dynamic Guidance */}
        <div className="flex items-center justify-between gap-2 shrink-0 px-1">
          <div className="flex items-center gap-2">
            {/* Kai & Active Companion Character - Size optimized for complete tablet/laptop display */}
            <KaiCharacter
              mood={characterMood}
              companion={activeMentor === 'kai' ? 'none' : (activeMentor as any)}
              comboStreak={comboStreak}
              lastHitTimestamp={lastHitTimestamp}
              speechText={mascotText}
              speechEn={mascotEn}
              size="sm"
            />
          </div>

          {/* Current Target Focus Chip - High Impact for Left Hand vs Right Hand */}
          {currentTargetNote && (
            <div
              className={`flex items-center gap-2 md:gap-3 border-2 border-white px-3 py-1.5 md:px-4 md:py-2 rounded-2xl shadow-md shrink-0 transition-all ${
                currentTargetNote.hand === 'left'
                  ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white ring-2 ring-blue-300'
                  : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 ring-2 ring-amber-300'
              }`}
            >
              <span className="text-xs sm:text-sm md:text-base font-black flex items-center gap-1">
                <span>{currentTargetNote.hand === 'left' ? '🖐️ 左手' : '✋ 右手'}</span>
                <span className="text-[10px] sm:text-xs opacity-90 font-mono">
                  ({currentTargetNote.hand === 'left' ? '低音譜 𝄢' : '高音譜 𝄞'})
                </span>
              </span>
              <span
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-black flex items-center justify-center text-base md:text-xl border-2 border-white shadow-xs shrink-0 ${
                  currentTargetNote.hand === 'left'
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-white'
                    : 'bg-blue-600 text-white ring-2 ring-white'
                }`}
              >
                {currentTargetNote.fingerNumber}
              </span>
              <span className="text-xs sm:text-sm md:text-base font-black font-mono">
                {currentTargetNote.noteName} ({currentTargetNote.solfege})
              </span>
            </div>
          )}
        </div>

        {/* Real-time Rhythm Accuracy Bar & Glowing Cartoon Musical Note Mascot */}
        <div className="bg-gradient-to-r from-amber-50/90 via-white to-blue-50/90 border-2 border-amber-300 rounded-2xl px-3 py-1.5 shadow-xs flex items-center justify-between gap-3 shrink-0">
          {/* Left: Cute Cartoon Musical Note that sways with rhythm and glows when stable */}
          <div className="flex items-center gap-2">
            <div
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all duration-300 transform select-none ${
                noteSwayDirection === 'left' ? '-rotate-12 scale-105' : 'rotate-12 scale-105'
              } ${
                isRhythmStable
                  ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.85)] ring-3 ring-amber-300 animate-pulse text-slate-950'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
              title={isRhythmStable ? '節奏穩定！音符閃亮發光中！' : '跟著節拍敲擊，音符就會發光喔！'}
            >
              <span className="text-lg sm:text-xl">🎵</span>
              {isRhythmStable && (
                <span className="absolute -top-1 -right-1 text-xs animate-ping">✨</span>
              )}
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  即時節奏
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.2 rounded-full transition-colors ${
                    isRhythmStable
                      ? 'bg-amber-400 text-slate-950 animate-bounce'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isRhythmStable ? '✨ 節奏發光中！' : '🎶 跟隨節拍'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold hidden sm:block">
                {isRhythmStable ? '節奏非常穩定，手感太棒了！' : '聆聽節奏，跟著節拍器穩健落鍵～'}
              </span>
            </div>
          </div>

          {/* Right: Live Rhythm Accuracy Progress Bar */}
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-slate-600 flex items-center gap-1">
                <span>⏱️ 節奏穩定度</span>
                <span className="text-amber-800 font-mono">({bpm} BPM)</span>
              </span>
              <span
                className={`font-mono text-xs font-black ${
                  rhythmAccuracy >= 85
                    ? 'text-emerald-600'
                    : rhythmAccuracy >= 70
                    ? 'text-blue-600'
                    : 'text-amber-600'
                }`}
              >
                {rhythmAccuracy}% {rhythmAccuracy >= 85 ? '🌟 完美' : '👍 穩健'}
              </span>
            </div>

            <div className="relative w-full h-2.5 bg-slate-200/90 rounded-full overflow-hidden p-0.5 border border-slate-300">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  rhythmAccuracy >= 85
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                    : rhythmAccuracy >= 70
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400'
                }`}
                style={{ width: `${Math.max(10, Math.min(100, rhythmAccuracy))}%` }}
              />
            </div>
          </div>
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
            clef={lesson.ageBand >= 6 ? 'grand' : undefined}
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
            notes={notes}
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

      {/* Thematic Bespoke Level Celebration Modal */}
      {showCompletionModal && (
        <ThematicCelebrationModal
          lesson={lesson}
          activeMentor={activeMentor}
          starsAwarded={starsAwarded}
          accuracyRate={accuracyRate}
          bpm={bpm}
          stageNumber={(activeChallengeIndex + 1) as 1 | 2 | 3 | 4}
          stageTitle={allChallenges[activeChallengeIndex]?.title}
          proceedLabel={
            activeChallengeIndex < allChallenges.length - 1
              ? `前往：${STAGE_METAS[(activeChallengeIndex + 2) as 1 | 2 | 3 | 4]?.shortLabel || '下一關'}`
              : '👑 全曲通關！返回地圖'
          }
          onRetry={() => {
            hasCelebratedRef.current = false;
            isChallengeClearedRef.current = false;
            isAdvancingRef.current = false;
            setShowCompletionModal(false);
            setCurrentNoteIndex(0);
            setComboStreak(0);
            setTotalAttempts(0);
            setSuccessfulHits(0);
          }}
          onProceed={() => {
            hasCelebratedRef.current = false;
            isChallengeClearedRef.current = false;
            isAdvancingRef.current = false;
            setShowCompletionModal(false);
            if (activeChallengeIndex < allChallenges.length - 1) {
              switchChallenge(activeChallengeIndex + 1);
            } else {
              onBackToMap();
            }
          }}
        />
      )}
    </div>
  );
};
