import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TargetNote, HintToggles, InputMode, PianoNoteEvent, AgeBand } from '../../types/piano';
import { FullPiece, FULL_SONGS_COLLECTION, HANON_TECHNIQUES_COLLECTION } from '../../data/fullSongsAndHanon';
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
import { speechGuide } from '../../utils/speechGuide';

interface FullSongVirtuosoViewProps {
  inputMode: InputMode;
  onBackToMap: () => void;
  className?: string;
}

export const FullSongVirtuosoView: React.FC<FullSongVirtuosoViewProps> = ({
  inputMode,
  onBackToMap,
  className = '',
}) => {
  // Category tab: 'song' or 'hanon'
  const [selectedCategory, setSelectedCategory] = useState<'song' | 'hanon'>('song');
  // Age filter: 4 | 5 | 6 | 7 | 'all'
  const [selectedAge, setSelectedAge] = useState<AgeBand | 'all'>('all');

  // Currently available pieces based on category and age filter
  const allCategoryPieces = selectedCategory === 'song' ? FULL_SONGS_COLLECTION : HANON_TECHNIQUES_COLLECTION;
  const filteredPieces = selectedAge === 'all'
    ? allCategoryPieces
    : allCategoryPieces.filter(p => p.targetAge === selectedAge);

  const [currentPiece, setCurrentPiece] = useState<FullPiece>(filteredPieces[0] || allCategoryPieces[0]);

  // Performance state
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isNoteCorrect, setIsNoteCorrect] = useState(false);
  const [isNoteWobbly, setIsNoteWobbly] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [characterMood, setCharacterMood] = useState<CharacterMood>('listening');
  const [mascotText, setMascotText] = useState('準備好了嗎？從頭到尾流暢彈奏！');
  const [mascotEn, setMascotEn] = useState('Play fluently from start to finish!');

  // Metronome & Tempo
  const [bpm, setBpm] = useState(currentPiece.bpm);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);

  // Live pitch monitor state
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

  // Mic state & diagnostic modal
  const [isMicRunning, setIsMicRunning] = useState(micAdapter.getIsRunning());
  const [micError, setMicError] = useState<string | null>(null);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // 4 Hint toggles
  const [hints, setHints] = useState<HintToggles>({
    staff: true,
    numbered: true,
    letter: true,
    keyboard: true,
  });

  // Switch piece
  const handleSelectPiece = (piece: FullPiece) => {
    setCurrentPiece(piece);
    setBpm(piece.bpm);
    setCurrentNoteIndex(0);
    setComboStreak(0);
    setMaxCombo(0);
    setTotalErrors(0);
    setShowCompletionModal(false);
    setCharacterMood('listening');
    setMascotText(`準備彈奏《${piece.title}》！`);
    setMascotEn(piece.titleEn);
  };

  // Reset current piece
  const handleRestartPiece = () => {
    setCurrentNoteIndex(0);
    setComboStreak(0);
    setMaxCombo(0);
    setTotalErrors(0);
    setShowCompletionModal(false);
    setCharacterMood('listening');
    setMascotText('重新開始，放鬆手指享受旋律！');
    setMascotEn('Restart! Relax your hands and enjoy!');
  };

  // Metronome loop
  useEffect(() => {
    if (!isMetronomeActive) return;
    const intervalMs = (60 / bpm) * 1000;
    let beat = 0;
    const interval = setInterval(() => {
      pianoSynth.playMetronomeTick(beat % currentPiece.timeSignature[0] === 0);
      beat++;
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isMetronomeActive, bpm, currentPiece.timeSignature]);

  // Mic status subscription
  useEffect(() => {
    setIsMicRunning(micAdapter.getIsRunning());
    setNoiseThreshold(micAdapter.getNoiseGateThreshold());
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
      setMicError((err as Error).message || '啟動麥克風失敗');
    }
  };

  const notes = currentPiece.notes;
  const currentTargetNote: TargetNote | undefined = notes[currentNoteIndex];

  // Note hit success handler
  const handleNoteSuccess = useCallback(() => {
    isAdvancingRef.current = true;
    setIsNoteCorrect(true);
    setIsNoteWobbly(false);
    setCharacterMood('excited');

    setLastHitTimestamp(Date.now());
    setComboStreak((prev) => {
      const next = prev + 1;
      setMaxCombo((m) => Math.max(m, next));
      return next;
    });

    // 🌟 Play sparkling success hit sound effect!
    pianoSynth.playCorrectHitSound();

    // Subtle celebration sparkle
    if ((currentNoteIndex + 1) % 3 === 0) {
      confetti({
        particleCount: 16,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#34D399', '#60A5FA', '#F43F5E'],
        disableForReducedMotion: true,
      });
    }

    const nextIndex = currentNoteIndex + 1;

    setTimeout(() => {
      setIsNoteCorrect(false);
      isAdvancingRef.current = false;
      if (nextIndex < notes.length) {
        setCurrentNoteIndex(nextIndex);
        setCharacterMood('listening');
        if (selectedCategory === 'hanon') {
          setMascotText('手指跑動真漂亮！繼續流暢連奏！');
          setMascotEn('Great finger flow! Keep going!');
        } else {
          setMascotText('彈得好！繼續下一個音！');
          setMascotEn('Nice! Next note!');
        }
      } else {
        // Complete full piece with varied celebration speech!
        setShowCompletionModal(true);
        pianoSynth.playFanfare();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });

        const virtuosoPraises = [
          `你成功了！完整彈奏完《${currentPiece.title}》，你是最棒的鋼琴大師！繼續加油！`,
          `你是最棒的！全曲零中斷流暢演奏，表現太震撼了！繼續加油！`,
          `繼續加油！你成功征服了《${currentPiece.title}》，節奏與指法太穩健了！`,
          `太厲害了！音符像行雲流水一樣動聽，你成功了，你是最棒的！`,
          `你做到了！這是一場大師級的完整演出，大家都為你鼓掌，繼續加油！`,
        ];
        const randomPraise = virtuosoPraises[Math.floor(Math.random() * virtuosoPraises.length)];
        speechGuide.speak(randomPraise, { emotion: 'excited' });
      }
    }, 220);
  }, [currentNoteIndex, notes.length, selectedCategory]);

  // Note miss handler
  const handleNoteMiss = useCallback((playedNoteName: string) => {
    setComboStreak(0);
    setTotalErrors((prev) => prev + 1);
    setCharacterMood('encouraging');
    setMascotText(`剛才聽到了 ${playedNoteName}，目標是 ${currentTargetNote?.noteName} 喔！`);
    setMascotEn(`Target is ${currentTargetNote?.noteName}`);
  }, [currentTargetNote]);

  // Subscribe to live audio or MIDI inputs
  useEffect(() => {
    let unsubNote: (() => void) | undefined;
    let unsubPitch: (() => void) | undefined;

    const handleIncomingNote = (event: PianoNoteEvent) => {
      setLiveActiveMidi(event.midiNote);
      setDetectedNoteName(event.noteName);
      setLiveFreq(event.frequencyHz || 0);
      setLiveCents(event.centsOff || 0);

      // If currently advancing, ignore trailing sound waves
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

      if (!currentTargetNote) return;

      const isOctaveEquivalent = currentTargetNote.allowOctaveShift && (event.midiNote % 12 === currentTargetNote.midiNote % 12);
      const isTargetMatch = event.midiNote === currentTargetNote.midiNote || isOctaveEquivalent;

      if (isTargetMatch) {
        if (event.onsetId !== undefined) {
          lastHandledOnsetIdRef.current = event.onsetId;
        }
        lastSuccessTimeRef.current = now;
        lastSuccessMidiRef.current = currentTargetNote.midiNote;
        handleNoteSuccess();
      } else {
        handleNoteMiss(event.noteName);
      }

      setTimeout(() => {
        setLiveActiveMidi(undefined);
      }, 200);
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
  }, [inputMode, currentTargetNote, currentNoteIndex, handleNoteSuccess, handleNoteMiss]);

  // Sliding window for long sheet music so notes don't get squished (window size 8 notes)
  const windowSize = 8;
  const windowStartIndex = Math.max(0, Math.min(notes.length - windowSize, Math.floor(currentNoteIndex / windowSize) * windowSize));
  const visibleNotes = notes.slice(windowStartIndex, windowStartIndex + windowSize);
  const relativeIndex = currentNoteIndex - windowStartIndex;

  const currentMeasureNumber = (currentTargetNote?.measureIndex ?? 0) + 1;
  const progressPercent = Math.round(((currentNoteIndex) / notes.length) * 100);

  return (
    <div className={`w-full max-w-6xl mx-auto px-3 py-2 flex flex-col gap-3 select-none ${className}`}>
      {/* Top Header Bar - Bright & Cheerful */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-3 border-amber-300 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBackToMap}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-sm font-black transition border-2 border-amber-300 shadow-sm active:scale-95"
          >
            <span>←</span>
            <span>返回地圖</span>
          </button>

          {/* Category Switcher: Full Songs vs Hanon Techniques */}
          <div className="flex items-center bg-amber-50 p-1.5 rounded-2xl border-2 border-amber-200 shadow-sm">
            <button
              onClick={() => {
                setSelectedCategory('song');
                const pieces = selectedAge === 'all' ? FULL_SONGS_COLLECTION : FULL_SONGS_COLLECTION.filter(p => p.targetAge === selectedAge);
                handleSelectPiece(pieces[0] || FULL_SONGS_COLLECTION[0]);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-2 ${
                selectedCategory === 'song'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎵</span>
              <span>全曲名曲演奏</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory('hanon');
                const pieces = selectedAge === 'all' ? HANON_TECHNIQUES_COLLECTION : HANON_TECHNIQUES_COLLECTION.filter(p => p.targetAge === selectedAge);
                handleSelectPiece(pieces[0] || HANON_TECHNIQUES_COLLECTION[0]);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-2 ${
                selectedCategory === 'hanon'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎹</span>
              <span>哈農流暢跑動</span>
            </button>
          </div>

          {/* Age Filter Selector */}
          <div className="flex items-center bg-amber-50 p-1 rounded-2xl border-2 border-amber-200 shadow-sm text-xs">
            {(['all', 4, 5, 6, 7] as const).map((ag) => (
              <button
                key={ag}
                onClick={() => {
                  setSelectedAge(ag);
                  const pool = selectedCategory === 'song' ? FULL_SONGS_COLLECTION : HANON_TECHNIQUES_COLLECTION;
                  const matching = ag === 'all' ? pool : pool.filter(p => p.targetAge === ag);
                  if (matching.length > 0) {
                    handleSelectPiece(matching[0]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-black transition flex items-center gap-1 ${
                  selectedAge === ag
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{ag === 'all' ? '🌈' : ag === 4 ? '🌱' : ag === 5 ? '🖐️' : ag === 6 ? '🚀' : '👑'}</span>
                <span>{ag === 'all' ? '全部年齡' : `${ag} 歲`}</span>
              </button>
            ))}
          </div>

          <span className="text-xs text-amber-900 font-bold hidden md:inline">
            (共 {filteredPieces.length} 首)
          </span>
        </div>

        {/* Piece Selection Dropdown / Carousel Chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-xl py-1 scrollbar-thin">
          {filteredPieces.map((piece) => (
            <button
              key={piece.id}
              onClick={() => handleSelectPiece(piece)}
              className={`px-3 py-1.5 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition border-2 flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 ${
                currentPiece.id === piece.id
                  ? selectedCategory === 'song'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300'
                  : 'bg-amber-50/80 text-slate-700 border-amber-200 hover:bg-amber-100 hover:text-slate-950'
              }`}
            >
              <span className="text-xs text-amber-800 font-mono font-black">[{piece.targetAge}歲]</span>
              <span>{piece.title.replace(/[《》]/g, '')}</span>
              <span className="text-xs text-amber-600 font-mono">{'★'.repeat(piece.difficulty)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Performance Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left: Mascot & Piece Info (3 Cols) */}
        <div className="lg:col-span-3 bg-white border-3 border-amber-300 rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-sm text-left">
          <div>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${
                selectedCategory === 'song'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : 'bg-amber-100 text-amber-950 border-amber-300'
              }`}>
                {selectedCategory === 'song' ? '全曲一氣呵成' : '哈農連續跑動'}
              </span>
              <span className="text-xs text-slate-600 font-bold font-mono">
                {currentPiece.composerOrOrigin}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-2 leading-snug">
              {currentPiece.title}
            </h3>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed font-medium">
              {currentPiece.subtitle}
            </p>
          </div>

          {/* Mascot Guidance */}
          <div className="flex flex-col items-center">
            <KaiCharacter
              mood={characterMood}
              comboStreak={comboStreak}
              lastHitTimestamp={lastHitTimestamp}
              speechText={mascotText}
              speechEn={mascotEn}
              size="md"
            />
          </div>

          {/* Performance Stats: Progress & Combo */}
          <div className="flex flex-col gap-2 pt-3 border-t-2 border-amber-100 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-bold">演奏進度:</span>
              <span className="font-mono font-black text-slate-900">
                {currentNoteIndex} / {notes.length} 音符 ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-300">
              <div
                className={`h-full transition-all duration-150 ${
                  selectedCategory === 'song' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-600 font-bold">目前連擊:</span>
              <span className={`font-mono font-black text-base flex items-center gap-1 ${
                comboStreak >= 5 ? 'text-amber-600 animate-pulse' : 'text-slate-800'
              }`}>
                {comboStreak >= 5 && <span>🔥</span>}
                <span>{comboStreak} Combo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sheet Music & Player Controls (9 Cols) */}
        <div className="lg:col-span-9 flex flex-col gap-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border-3 border-amber-300 rounded-3xl px-5 py-3 text-sm shadow-sm">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Metronome Toggle */}
              <button
                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm transition border-2 shadow-sm active:scale-95 ${
                  isMetronomeActive
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md'
                    : 'bg-amber-50 text-slate-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>⏱️</span>
                <span>節拍器: {isMetronomeActive ? '開' : '關'}</span>
              </button>

              {/* Tempo Slider */}
              <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-2xl border-2 border-amber-200">
                <span className="text-slate-700 font-mono font-bold text-xs">BPM:</span>
                <input
                  type="range"
                  min="50"
                  max="130"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-24 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono font-black text-slate-900 text-sm w-8">{bpm}</span>
              </div>
            </div>

            {/* Restart & Diagnostic */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRestartPiece}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-2xl font-black text-sm transition border-2 border-amber-300 shadow-sm active:scale-95"
              >
                🔄 重頭彈奏
              </button>
              <button
                onClick={() => setShowScaleModal(true)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-2xl font-black text-sm transition border-2 border-blue-300 shadow-sm active:scale-95"
              >
                🎵 音階聽辨調校
              </button>
            </div>
          </div>

          {/* Microphone banner if inactive */}
          {inputMode === 'microphone' && !isMicRunning && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-3 border-emerald-400 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3 text-left">
                <span className="text-3xl">🎙️</span>
                <div>
                  <span className="text-base font-black text-emerald-950 block">麥克風聽琴辨識尚未啟動</span>
                  <span className="text-sm text-emerald-800 font-bold block">
                    {micError || '點擊右方按鈕開啟麥克風，即可在實體鋼琴上彈奏辨識！'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleActivateMic}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-black rounded-2xl shadow-lg transition flex items-center gap-2 animate-pulse active:scale-95"
              >
                <span>🎙️</span>
                <span>點擊開啟麥克風聽琴</span>
              </button>
            </div>
          )}

          {/* 4 Hint Toggles Bar */}
          <div className="flex items-center justify-between bg-white border-2 border-amber-200 rounded-2xl px-4 py-2 text-sm shadow-xs flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-slate-700 font-black text-xs md:text-sm">譜面提示開關:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHints({ ...hints, staff: !hints.staff })}
                  className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-black transition ${
                    hints.staff ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  五線譜
                </button>
                <button
                  onClick={() => setHints({ ...hints, numbered: !hints.numbered })}
                  className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-black transition ${
                    hints.numbered ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  簡譜 (1 2 3)
                </button>
                <button
                  onClick={() => setHints({ ...hints, letter: !hints.letter })}
                  className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-black transition ${
                    hints.letter ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  音名唱名 (C D E)
                </button>
                <button
                  onClick={() => setHints({ ...hints, keyboard: !hints.keyboard })}
                  className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-black transition ${
                    hints.keyboard ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  琴鍵提示
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-600 font-mono font-bold">
              第 <strong className="text-slate-900 text-sm font-black">{currentMeasureNumber}</strong> 小節 (視窗 {windowStartIndex + 1}~{Math.min(notes.length, windowStartIndex + windowSize)})
            </div>
          </div>

          {/* Notation Display Cards */}
          <div className="bg-white border-3 border-amber-300 rounded-3xl p-4 flex flex-col gap-3 shadow-md">
            {hints.staff && (
              <MusicStaff
                notes={visibleNotes}
                currentIndex={relativeIndex}
                isNoteCorrect={isNoteCorrect}
                isNoteWobbly={isNoteWobbly}
                timeSignature={currentPiece.timeSignature || [4, 4]}
              />
            )}

            {hints.numbered && (
              <NumberedNotation
                notes={visibleNotes}
                currentIndex={relativeIndex}
              />
            )}

            {hints.letter && (
              <LetterNotation
                notes={visibleNotes}
                currentIndex={relativeIndex}
              />
            )}
          </div>

          {/* Real-time Pitch Monitor with High-Sensitivity Noise Gate */}
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
      </div>

      {/* Bottom Piano Keyboard */}
      {hints.keyboard && (
        <div className="shrink-0 pt-1">
          <DynamicKeyboard
            currentTargetNote={currentTargetNote}
            liveActiveMidiNote={liveActiveMidi}
            showFingerNumbers={true}
            notes={currentPiece.notes}
            onKeyPress={(midiNote) => {
              setLiveActiveMidi(midiNote);
              if (currentTargetNote && midiNote === currentTargetNote.midiNote) {
                handleNoteSuccess();
              } else {
                handleNoteMiss(`音符 ${midiNote}`);
              }
              setTimeout(() => setLiveActiveMidi(undefined), 200);
            }}
          />
        </div>
      )}

      {/* Full Piece Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 md:p-8 max-w-md w-full text-center flex flex-col items-center gap-4 shadow-2xl text-slate-900">
            <span className="text-6xl animate-bounce">🏆</span>
            <div>
              <span className="px-4 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border-2 border-amber-300">
                {selectedCategory === 'song' ? '全曲演奏大師！' : '哈農手指流暢大師！'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
                恭喜完整彈奏《{currentPiece.title}》！
              </h2>
              <p className="text-sm text-slate-700 font-bold mt-2 leading-relaxed">
                從頭到尾零中斷彈奏，你的手指力量與敏捷度大幅提升！
              </p>
            </div>

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-3 gap-3 w-full pt-2">
              <div className="bg-amber-50 p-3 rounded-2xl border-2 border-amber-200 flex flex-col items-center shadow-xs">
                <span className="text-xs text-slate-600 font-bold">完成音符</span>
                <span className="text-lg font-black text-emerald-600 font-mono">{notes.length}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border-2 border-amber-200 flex flex-col items-center shadow-xs">
                <span className="text-xs text-slate-600 font-bold">最高連擊</span>
                <span className="text-lg font-black text-amber-600 font-mono">{maxCombo} 🔥</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border-2 border-amber-200 flex flex-col items-center shadow-xs">
                <span className="text-xs text-slate-600 font-bold">失誤次數</span>
                <span className="text-lg font-black text-blue-600 font-mono">{totalErrors}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full pt-3">
              <button
                onClick={() => {
                  speechGuide.stop();
                  handleRestartPiece();
                }}
                className="flex-1 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm transition border-2 border-amber-300 shadow-sm active:scale-95"
              >
                🔄 再彈一次
              </button>
              <button
                onClick={() => {
                  speechGuide.stop();
                  setShowCompletionModal(false);
                  const currentIndex = filteredPieces.findIndex((p) => p.id === currentPiece.id);
                  const nextPiece = filteredPieces[(currentIndex + 1) % filteredPieces.length];
                  if (nextPiece) {
                    handleSelectPiece(nextPiece);
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm transition shadow-lg active:scale-95"
              >
                下一首曲目 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scale Recognition Diagnostic Modal */}
      <ScaleRecognitionModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
      />
    </div>
  );
};
