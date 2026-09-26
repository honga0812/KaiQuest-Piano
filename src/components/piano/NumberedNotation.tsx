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
    <div className={`flex items-center gap-2.5 overflow-x-auto py-2.5 px-4 bg-white rounded-2xl border-2 border-amber-300 shadow-sm ${className}`}>
      <span className="text-sm md:text-base font-black text-amber-950 mr-1 shrink-0 select-none flex items-center gap-1.5">
        <span>🔢</span>
        <span>簡譜:</span>
      </span>
      {notes.map((note, idx) => {
        const isTarget = idx === currentIndex;
        const isPast = idx < currentIndex;
        const isHighOctave = note.midiNote >= 72; // C5 has dot above
        const isLowOctave = note.midiNote < 60; // Below Middle C has dot below

        return (
          <div
            key={`num-${note.id}-${idx}`}
            className={`flex flex-col items-center justify-center min-w-[48px] md:min-w-[56px] px-2.5 py-2 rounded-2xl transition-all shadow-xs ${
              isTarget
                ? 'bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black scale-110 shadow-md ring-3 ring-amber-300 border-2 border-white'
                : isPast
                ? 'bg-slate-100 text-slate-400 font-medium'
                : 'bg-amber-50 hover:bg-amber-100 text-slate-900 font-black border-2 border-amber-200'
            }`}
          >
            {/* Octave dot above if C5 or higher */}
            {isHighOctave && (
              <span className={`w-2 h-2 rounded-full mb-0.5 ${isTarget ? 'bg-slate-950' : 'bg-amber-600'}`} />
            )}
            <span className="text-2xl md:text-3xl leading-none font-mono font-black">
              {note.numbered.replace('̇', '').replace('̣', '')}
            </span>
            {/* Octave dot below if below C4 */}
            {isLowOctave && (
              <span className={`w-2 h-2 rounded-full mt-0.5 ${isTarget ? 'bg-slate-950' : 'bg-blue-600'}`} />
            )}
            <span className={`text-xs md:text-sm leading-tight mt-1 font-black ${isTarget ? 'text-slate-950' : 'text-slate-700'}`}>
              {note.lyrics || note.solfege}
            </span>
          </div>
        );
      })}
    </div>
  );
};
