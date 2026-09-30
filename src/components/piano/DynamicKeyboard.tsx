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
    <div className={`relative w-full select-none pt-12 sm:pt-14 ${className}`}>


      {/* Keyboard Bed Container - Tablet & Laptop Optimized Proportions */}
      <div className="relative w-full h-[145px] sm:h-[160px] md:h-[185px] max-h-[195px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-2 md:p-2.5 shadow-2xl border-3 border-amber-300/40 flex justify-center overflow-visible">
        {/* Felt Red Rail at top of keys (z-20) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 h-3.5 bg-gradient-to-r from-red-800 via-rose-600 to-red-800 rounded-t-2xl z-20 shadow-inner flex items-center justify-center">
          <span className="text-[10px] text-red-200/90 font-black tracking-widest uppercase">
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
                className={`relative flex-1 h-full mx-[1.5px] md:mx-[2.5px] rounded-b-2xl border border-slate-300/90 transition-all duration-75 flex flex-col justify-end items-center pb-2.5 active:scale-[0.98] ${
                  isLivePressed
                    ? 'bg-gradient-to-b from-emerald-100 to-emerald-300 ring-4 ring-emerald-500 translate-y-1.5 shadow-inner'
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
                    className="absolute top-5 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs md:text-sm font-black shadow-lg border-2 border-white animate-pulse"
                    title="中央 C (Middle C)"
                  >
                    C4
                  </span>
                )}

                {/* Overhead Floating Target Finger Beacon - Perfectly centered above target key */}
                {isTarget && showFingerNumbers && currentTargetNote && (
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none animate-bounce whitespace-nowrap">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-2xl border-2 border-white ring-4 ring-amber-400/90 drop-shadow-xl">
                      <span className="text-[11px] sm:text-xs font-black">
                        {currentTargetNote.hand === 'left' ? '👈 左手' : '👉 右手'}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md border border-white">
                        {currentTargetNote.fingerNumber}
                      </span>
                      <span className="text-[11px] sm:text-xs font-mono font-black text-amber-200">
                        {currentTargetNote.noteName}
                      </span>
                      <span className="text-[11px] sm:text-xs font-black bg-white/20 px-1.5 py-0.2 rounded-md">
                        {currentTargetNote.solfege}
                      </span>
                    </div>
                    {/* Downward target pointer triangle pointing straight down to key center */}
                    <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[9px] border-t-indigo-700 -mt-0.5 filter drop-shadow-md" />
                  </div>
                )}

                {/* Sub-label Finger indicator on Key body */}
                {isTarget && showFingerNumbers && currentTargetNote && (
                  <span className="relative z-30 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center mb-1 shadow-md border-2 border-white ring-2 ring-blue-300">
                    {currentTargetNote.fingerNumber}
                  </span>
                )}

                {/* Large Note Labels - Substantially Enlarged for Tablets */}
                <div className="flex flex-col items-center gap-0.5">
                  {/* English Note Name (C4, D4, E4...) */}
                  <span className="text-xl md:text-2xl font-black text-slate-800 leading-none tracking-tight">
                    {key.label}
                  </span>

                  {/* Solfege Bubble (Do, Re, Mi...) with Rainbow colors */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs md:text-sm font-black border leading-none ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border}`}
                  >
                    {key.solfege}
                  </span>

                  {/* Numbered Notation (1, 2, 3...) */}
                  <span className="text-xs md:text-sm font-black text-slate-600 font-mono leading-none mt-0.5">
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
              {/* Overhead Floating Target Finger Beacon for Black Key - Perfectly centered */}
              {isTarget && showFingerNumbers && currentTargetNote && (
                <div className="absolute -top-18 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none animate-bounce whitespace-nowrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-2xl border-2 border-white ring-4 ring-amber-400/90 drop-shadow-xl">
                    <span className="text-[11px] sm:text-xs font-black">
                      {currentTargetNote.hand === 'left' ? '👈 左手' : '👉 右手'}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md border border-white">
                      {currentTargetNote.fingerNumber}
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-black text-amber-200">
                      {currentTargetNote.noteName}
                    </span>
                    <span className="text-[11px] sm:text-xs font-black bg-white/20 px-1.5 py-0.2 rounded-md">
                      {currentTargetNote.solfege}
                    </span>
                  </div>
                  <div className="w-0 h-0 border-x-[7px] border-x-transparent border-t-[9px] border-t-indigo-700 -mt-0.5 filter drop-shadow-md" />
                </div>
              )}

              {isTarget && showFingerNumbers && currentTargetNote && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[11px] font-black mb-1 shadow-md border border-white">
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
