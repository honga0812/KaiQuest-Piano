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
      {/* Header */}
      <div className="flex flex-col gap-1 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
            Technique Gym
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-xs text-slate-400">
            十種兒童趣味琴技特訓館
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          動物導師技巧道場
        </h1>
        <p className="text-xs md:text-sm text-slate-300">
          跟著艾力獅練手型、跟三十郎大師練指法接力、跟嘎嘎鴨練習滑順連奏！
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Game Cards List */}
        <div className="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
          {TECHNIQUE_GAMES.map((game) => {
            const isSelected = selectedGame.id === game.id;
            return (
              <div
                key={game.id}
                onClick={() => handleSelectGame(game)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AnimalMentor type={game.mentor} size="sm" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {game.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {game.category} · {game.bpm} BPM
                    </span>
                  </div>
                </div>
                <span className="text-xl" title={game.badgeName}>
                  {game.badgeIcon}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side: Interactive Training Sandbox */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col justify-between gap-4 shadow-xl">
          {/* Top Mentor Advice */}
          <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
            <AnimalMentor type={selectedGame.mentor} size="md" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {selectedGame.mentorName} 老師提示:
                </span>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  {selectedGame.category}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                {selectedGame.instruction}
              </p>
            </div>
          </div>

          {/* Interactive Music Staff */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>五線譜指法目標</span>
              <span className="font-mono">
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
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mb-1 gap-2">
              <div className="flex items-center gap-2">
                <span>在鋼琴彈奏或點擊琴鍵練習：</span>
                {inputMode === 'microphone' && (
                  !isMicRunning ? (
                    <button
                      onClick={handleActivateMic}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] animate-pulse shadow"
                    >
                      🎙️ 點擊開啟麥克風聽琴
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      麥克風聆聽中 {liveDetectedNote && `(已聽到: ${liveDetectedNote})`}
                    </span>
                  )
                )}
              </div>
              {currentTarget && (
                <span className="font-bold text-amber-400 font-mono">
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
            <div className="bg-emerald-950/70 border border-emerald-500 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedGame.badgeIcon}</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">
                    特訓大成功！獲得「{selectedGame.badgeName}」！
                  </div>
                  <div className="text-xs text-emerald-300">
                    你的手指敏捷度與音準大幅提升！
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentNoteIdx(0);
                  setIsGameCompleted(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
              >
                再練一次
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
