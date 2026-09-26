import React, { useCallback, useMemo } from 'react';
import { generatePianoKeys } from '../../utils/musicMath';
import { TargetNote } from '../../types/piano';
import { pianoSynth } from '../../audio/pianoSynthesizer';

interface DynamicKeyboardProps {
  currentTargetNote?: TargetNote;
  liveActiveMidiNote?: number;
  onKeyPress?: (midiNote: number) => void;
  showFingerNumbers?: boolean;
  className?: string;
}

// Rainbow Color Palette for Pitch Classes (Orff & Kodaly Method for Children)
const PITCH_RAINBOW_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Do: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  Re: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  Mi: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  Fa: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  Sol: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-300' },
  La: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  Ti: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
};

export const DynamicKeyboard: React.FC<DynamicKeyboardProps> = ({
  currentTargetNote,
  liveActiveMidiNote,
  onKeyPress,
  showFingerNumbers = true,
  className = '',
}) => {
  // Generate keys from A3 (57) to F5 (77) - 21 keys, ideal width and key size on tablets
  const keys = useMemo(() => generatePianoKeys(57, 77), []);

  const whiteKeys = useMemo(() => keys.filter((k) => !k.isBlack), [keys]);
  const blackKeys = useMemo(() => keys.filter((k) => k.isBlack), [keys]);

  const handleKeyTrigger = useCallback(
    (midiNote: number) => {
      // Play zero-latency acoustic piano sound
      pianoSynth.playNote(midiNote, 0.8, 1.2);
      // Notify lesson controller
      onKeyPress?.(midiNote);
    },
    [onKeyPress]
  );

  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* Keyboard Bed Container - Tablet Full-Screen Optimized with Warm Candy Framing */}
      <div className="relative w-full h-[200px] md:h-[250px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-3 shadow-2xl border-4 border-amber-300/40 flex justify-center overflow-hidden">
        {/* Felt Red Rail at top of keys */}
        <div className="absolute top-3 left-3 right-3 h-4 bg-gradient-to-r from-red-800 via-rose-600 to-red-800 rounded-t-2xl z-20 shadow-inner flex items-center justify-center">
          <span className="text-[10px] text-red-200/80 font-bold tracking-widest uppercase">
            KaiQuest Acoustic Keyboard
          </span>
        </div>

        {/* White Keys Row */}
        <div className="relative flex w-full h-full justify-between items-stretch">
          {whiteKeys.map((key) => {
            const isTarget = currentTargetNote?.midiNote === key.midiNote;
            const isLivePressed = liveActiveMidiNote === key.midiNote;
            const isMiddleC = key.midiNote === 60;
            const colorTheme = PITCH_RAINBOW_COLORS[key.solfege] || {
              bg: 'bg-slate-100',
              text: 'text-slate-800',
              border: 'border-slate-300',
            };

            return (
              <button
                key={`white-${key.midiNote}`}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeyTrigger(key.midiNote);
                }}
                className={`relative flex-1 h-full mx-[1.5px] md:mx-[3px] rounded-b-2xl border border-slate-300/90 transition-all duration-75 flex flex-col justify-end items-center pb-3 active:scale-[0.98] ${
                  isLivePressed
                    ? 'bg-gradient-to-b from-emerald-100 to-emerald-300 ring-4 ring-emerald-500 translate-y-2 shadow-inner'
                    : isTarget
                    ? 'bg-gradient-to-b from-amber-50 via-yellow-100 to-amber-200 ring-4 ring-amber-400 ring-offset-2 animate-target-key shadow-2xl'
                    : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 hover:bg-slate-50 shadow'
                }`}
                style={{
                  boxShadow: isLivePressed
                    ? 'inset 0 4px 8px rgba(0,0,0,0.35)'
                    : isTarget
                    ? '0 8px 18px rgba(245, 158, 11, 0.5)'
                    : '0 4px 8px rgba(0,0,0,0.18)',
                }}
              >
                {/* Middle C marker Badge */}
                {isMiddleC && (
                  <span
                    className="absolute top-6 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs md:text-sm font-black shadow-lg border-2 border-white animate-pulse"
                    title="中央 C (Middle C)"
                  >
                    C4
                  </span>
                )}

                {/* Target finger number indicator - Extra Large & Prominent for Kids */}
                {isTarget && showFingerNumbers && currentTargetNote && (
                  <div className="absolute bottom-20 md:bottom-24 flex flex-col items-center animate-bounce z-30">
                    <span className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-blue-600 text-white text-base md:text-xl font-black shadow-2xl border-2 border-white ring-4 ring-blue-300">
                      {currentTargetNote.fingerNumber}
                    </span>
                    <span className="text-[11px] md:text-xs font-black text-blue-800 bg-white/95 px-2 py-0.5 rounded-full shadow-md mt-1 border border-blue-300">
                      {currentTargetNote.hand === 'left' ? '左手' : '右手'}
                    </span>
                  </div>
                )}

                {/* Large Note Labels - Substantially Enlarged for Tablets */}
                <div className="flex flex-col items-center gap-0.5">
                  {/* English Note Name (C4, D4, E4...) */}
                  <span className="text-lg md:text-2xl font-black text-slate-800 leading-none tracking-tight">
                    {key.label}
                  </span>

                  {/* Solfege Bubble (Do, Re, Mi...) with Rainbow colors */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs md:text-sm font-black border leading-none ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border}`}
                  >
                    {key.solfege}
                  </span>

                  {/* Numbered Notation (1, 2, 3...) */}
                  <span className="text-xs md:text-sm font-bold text-slate-500 font-mono leading-none mt-0.5">
                    {key.numbered}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Black Keys Layer */}
        {blackKeys.map((key) => {
          const isTarget = currentTargetNote?.midiNote === key.midiNote;
          const isLivePressed = liveActiveMidiNote === key.midiNote;

          const precedingWhiteKeysCount = whiteKeys.filter((wk) => wk.midiNote < key.midiNote).length;
          const whiteKeyWidthPercent = 100 / whiteKeys.length;
          const leftPercent = (precedingWhiteKeysCount - 0.32) * whiteKeyWidthPercent;
          const keyWidthPercent = whiteKeyWidthPercent * 0.64;

          return (
            <button
              key={`black-${key.midiNote}`}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleKeyTrigger(key.midiNote);
              }}
              style={{
                left: `${leftPercent}%`,
                width: `${keyWidthPercent}%`,
                height: '62%',
              }}
              className={`absolute top-4 z-10 rounded-b-2xl transition-all duration-75 flex flex-col justify-end items-center pb-3 active:scale-[0.98] ${
                isLivePressed
                  ? 'bg-gradient-to-b from-emerald-300 to-emerald-500 ring-4 ring-emerald-300 translate-y-1.5'
                  : isTarget
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 ring-4 ring-amber-300 animate-target-key text-slate-950 font-black'
                  : 'bg-gradient-to-b from-slate-800 via-slate-950 to-slate-900 border-x border-b border-black shadow-xl hover:bg-slate-800'
              }`}
            >
              {isTarget && showFingerNumbers && currentTargetNote && (
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white text-xs md:text-sm font-black mb-2 shadow-lg border-2 border-white">
                  {currentTargetNote.fingerNumber}
                </span>
              )}

              <span
                className={`text-xs md:text-sm font-black leading-tight ${
                  isTarget ? 'text-slate-950' : 'text-slate-200'
                }`}
              >
                {key.label}
              </span>
              <span
                className={`text-[10px] md:text-xs font-bold leading-none ${
                  isTarget ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {key.solfege}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
