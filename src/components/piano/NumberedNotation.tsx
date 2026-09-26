import React from 'react';
import { TargetNote } from '../../types/piano';

interface NumberedNotationProps {
  notes: TargetNote[];
  currentIndex: number;
  className?: string;
}

export const NumberedNotation: React.FC<NumberedNotationProps> = ({
  notes,
  currentIndex,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto py-2 px-3.5 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-slate-900/80 rounded-2xl border-2 border-amber-500/30 shadow-inner ${className}`}>
      <span className="text-xs md:text-sm font-black text-amber-400 mr-1 shrink-0 select-none flex items-center gap-1">
        <span>🔢</span>
        <span>簡譜:</span>
      </span>
      {notes.map((note, idx) => {
        const isTarget = idx === currentIndex;
        const isPast = idx < currentIndex;
        const isHighOctave = note.midiNote >= 72; // C5 has a dot on top
        const isLowOctave = note.midiNote < 60; // Below Middle C has dot below

        return (
          <div
            key={`num-${note.id}`}
            className={`flex flex-col items-center justify-center min-w-[42px] md:min-w-[50px] px-2 py-1.5 rounded-xl transition-all ${
              isTarget
                ? 'bg-gradient-to-b from-amber-300 to-amber-400 text-slate-950 font-black scale-110 shadow-lg ring-4 ring-amber-300/80'
                : isPast
                ? 'bg-slate-800/40 text-slate-500 font-medium'
                : 'bg-slate-800/80 text-white font-bold border border-slate-700/60'
            }`}
          >
            {/* Octave dot above if C5 or higher */}
            {isHighOctave && (
              <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${isTarget ? 'bg-slate-950' : 'bg-amber-400'}`} />
            )}
            <span className="text-xl md:text-2xl leading-none font-mono font-black">
              {note.numbered.replace('̇', '').replace('̣', '')}
            </span>
            {/* Octave dot below if below C4 */}
            {isLowOctave && (
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isTarget ? 'bg-slate-950' : 'bg-blue-400'}`} />
            )}
            <span className={`text-[11px] md:text-xs leading-tight mt-1 font-black ${isTarget ? 'text-slate-950' : 'text-slate-300'}`}>
              {note.lyrics || note.solfege}
            </span>
          </div>
        );
      })}
    </div>
  );
};
