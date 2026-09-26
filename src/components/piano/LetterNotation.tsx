import React from 'react';
import { TargetNote } from '../../types/piano';

interface LetterNotationProps {
  notes: TargetNote[];
  currentIndex: number;
  className?: string;
}

export const LetterNotation: React.FC<LetterNotationProps> = ({
  notes,
  currentIndex,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto py-2 px-3.5 bg-gradient-to-r from-blue-500/10 via-slate-900/80 to-slate-900/80 rounded-2xl border-2 border-blue-500/30 shadow-inner ${className}`}>
      <span className="text-xs md:text-sm font-black text-blue-400 mr-1 shrink-0 select-none flex items-center gap-1">
        <span>🔤</span>
        <span>音名:</span>
      </span>
      {notes.map((note, idx) => {
        const isTarget = idx === currentIndex;
        const isPast = idx < currentIndex;
        const letter = note.noteName.replace(/\d/, '');

        return (
          <div
            key={`letter-${note.id}`}
            className={`flex flex-col items-center justify-center min-w-[42px] md:min-w-[50px] px-2 py-1.5 rounded-xl transition-all ${
              isTarget
                ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white font-black scale-110 shadow-lg ring-4 ring-blue-400/80'
                : isPast
                ? 'bg-slate-800/40 text-slate-500 font-medium'
                : 'bg-slate-800/80 text-white font-bold border border-slate-700/60'
            }`}
          >
            <span className="text-xl md:text-2xl leading-none font-sans font-black">
              {letter}
            </span>
            <span className={`text-[11px] md:text-xs leading-tight mt-1 font-black ${isTarget ? 'text-blue-100' : 'text-slate-300'}`}>
              {note.fingerNumber} 指
            </span>
          </div>
        );
      })}
    </div>
  );
};
