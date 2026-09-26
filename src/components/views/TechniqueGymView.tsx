import React, { useState, useEffect } from 'react';
import { TECHNIQUE_GAMES, TechniqueGameDef } from '../../data/techniqueGames';
import { AnimalMentor } from '../mascot/AnimalMentor';
import { MusicStaff } from '../piano/MusicStaff';
import { DynamicKeyboard } from '../piano/DynamicKeyboard';
import { TargetNote, InputMode, PianoNoteEvent } from '../../types/piano';
import { micAdapter } from '../../audio/microphoneAdapter';
import { midiAdapter } from '../../audio/midiAdapter';
import confetti from 'canvas-confetti';
import { pianoSynth } from '../../audio/pianoSynthesizer';

interface TechniqueGymViewProps {
  onBackToMap: () => void;
  inputMode?: InputMode;
  className?: string;
}

export const TechniqueGymView: React.FC<TechniqueGymViewProps> = ({
  inputMode = 'microphone',
  className = '',
}) => {
  const [selectedGame, setSelectedGame] = useState<TechniqueGameDef>(TECHNIQUE_GAMES[0]);
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [tempo, setTempo] = useState(selectedGame.bpm);
  const [liveDetectedNote, setLiveDetectedNote] = useState('');
  const [liveMidiNote, setLiveMidiNote] = useState<number | undefined>(undefined);
  const [isMicRunning, setIsMicRunning] = useState(micAdapter.getIsRunning());

  useEffect(() => {
    setIsMicRunning(micAdapter.getIsRunning());
    const unsubStatus = micAdapter.subscribeStatus((st) => {
      setIsMicRunning(st.isListening);
    });
    return unsubStatus;
  }, []);

  const handleActivateMic = async () => {
    try {
      await micAdapter.start();
      setIsMicRunning(true);
    } catch {
      // ignore
    }
  };

  const handleSelectGame = (game: TechniqueGameDef) => {
    setSelectedGame(game);
    setCurrentNoteIdx(0);
    setIsGameCompleted(false);
    setTempo(game.bpm);
  };

  const handleKeyTrigger = (midiNote: number) => {
    const target = selectedGame.notes[currentNoteIdx];
    if (!target) return;

    setLiveMidiNote(midiNote);
    setTimeout(() => setLiveMidiNote(undefined), 250);

    const isMatch = midiNote === target.midiNote || (target.allowOctaveShift && midiNote % 12 === target.midiNote % 12);

    if (isMatch) {
      pianoSynth.playCorrectHitSound();
      const next = currentNoteIdx + 1;
      if (next < selectedGame.notes.length) {
        setCurrentNoteIdx(next);
      } else {
        // Completed!
        setIsGameCompleted(true);
        pianoSynth.playFanfare();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // Subscribe to microphone and MIDI
  useEffect(() => {
    let unsubNote: (() => void) | undefined;

    const handleEvent = (ev: PianoNoteEvent) => {
      setLiveDetectedNote(ev.noteName);
      handleKeyTrigger(ev.midiNote);
    };

    if (inputMode === 'microphone') {
      unsubNote = micAdapter.subscribe(handleEvent);
    } else if (inputMode === 'midi') {
      unsubNote = midiAdapter.subscribe(handleEvent);
    }

    return () => {
      unsubNote?.();
    };
  }, [inputMode, currentNoteIdx, selectedGame]);

  const currentTarget: TargetNote | undefined = selectedGame.notes[currentNoteIdx];

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-6 select-none flex flex-col gap-6 ${className}`}>
      {/* Header - Bright & Cheerful */}
      <div className="flex flex-col gap-1.5 text-left bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black uppercase tracking-wider text-amber-600 font-mono">
            Technique Gym
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-sm font-black text-amber-800">
            十種兒童趣味琴技特訓館
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-amber-950 tracking-tight">
          動物導師技巧道場
        </h1>
        <p className="text-base text-slate-700 font-bold">
          跟著艾力獅練手型、跟三十郎大師練指法接力、跟嘎嘎鴨練習滑順連奏！
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Game Cards List */}
        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
          {TECHNIQUE_GAMES.map((game) => {
            const isSelected = selectedGame.id === game.id;
            return (
              <div
                key={game.id}
                onClick={() => handleSelectGame(game)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 text-left shadow-xs active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 border-white text-slate-950 shadow-md scale-102'
                    : 'bg-white border-amber-200 hover:bg-amber-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <AnimalMentor type={game.mentor} size="sm" />
                  <div>
                    <h3 className={`text-base font-black ${isSelected ? 'text-slate-950' : 'text-amber-950'}`}>
                      {game.name}
                    </h3>
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                      {game.category} · {game.bpm} BPM
                    </span>
                  </div>
                </div>
                <span className="text-2xl" title={game.badgeName}>
                  {game.badgeIcon}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side: Interactive Training Sandbox */}
        <div className="lg:col-span-2 bg-white border-3 border-amber-300 rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-5 shadow-md text-slate-900">
          {/* Top Mentor Advice */}
          <div className="flex items-center gap-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 shadow-xs">
            <AnimalMentor type={selectedGame.mentor} size="md" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-900">
                  {selectedGame.mentorName} 老師提示:
                </span>
                <span className="text-xs font-black bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full">
                  {selectedGame.category}
                </span>
              </div>
              <p className="text-base text-slate-800 mt-1 font-bold leading-relaxed">
                {selectedGame.instruction}
              </p>
            </div>
          </div>

          {/* Interactive Music Staff */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-black text-amber-950">
              <span>五線譜指法目標</span>
              <span className="font-mono text-base text-blue-700">
                進度: {currentNoteIdx} / {selectedGame.notes.length}
              </span>
            </div>
            <MusicStaff
              notes={selectedGame.notes}
              currentIndex={currentNoteIdx}
              isNoteCorrect={false}
              isNoteWobbly={false}
            />
          </div>

          {/* Interactive Keyboard Sandbox */}
          <div>
            <div className="flex flex-wrap items-center justify-between text-sm font-black text-slate-700 mb-2 gap-2">
              <div className="flex items-center gap-2">
                <span>在鋼琴彈奏或點擊琴鍵練習：</span>
                {inputMode === 'microphone' && (
                  !isMicRunning ? (
                    <button
                      onClick={handleActivateMic}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs transition active:scale-95 shadow-sm"
                    >
                      🎙️ 點擊開啟麥克風聽琴
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 flex items-center gap-1 font-mono font-black">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      麥克風聆聽中 {liveDetectedNote && `(已聽到: ${liveDetectedNote})`}
                    </span>
                  )
                )}
              </div>
              {currentTarget && (
                <span className="font-black text-amber-900 font-mono text-sm bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
                  目標: {currentTarget.noteName} (指法 {currentTarget.fingerNumber})
                </span>
              )}
            </div>
            <DynamicKeyboard
              currentTargetNote={currentTarget}
              liveActiveMidiNote={liveMidiNote}
              onKeyPress={handleKeyTrigger}
            />
          </div>

          {/* Completion Celebration Banner */}
          {isGameCompleted && (
            <div className="bg-emerald-100 border-2 border-emerald-400 rounded-3xl p-5 flex items-center justify-between animate-fade-in shadow-md">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{selectedGame.badgeIcon}</span>
                <div className="text-left">
                  <div className="text-lg font-black text-emerald-950">
                    特訓大成功！獲得「{selectedGame.badgeName}」！
                  </div>
                  <div className="text-sm font-bold text-emerald-800">
                    你的手指敏捷度與音準大幅提升！
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentNoteIdx(0);
                  setIsGameCompleted(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-base font-black rounded-2xl shadow transition active:scale-95"
              >
                再練一次 🔄
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
