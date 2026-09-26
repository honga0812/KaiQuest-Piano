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
    <div className={`flex items-center gap-2.5 overflow-x-auto py-2.5 px-4 bg-white rounded-2xl border-2 border-sky-300 shadow-sm ${className}`}>
      <span className="text-sm md:text-base font-black text-sky-950 mr-1 shrink-0 select-none flex items-center gap-1.5">
        <span>🔤</span>
        <span>音名:</span>
      </span>
      {notes.map((note, idx) => {
        const isTarget = idx === currentIndex;
        const isPast = idx < currentIndex;
        const letter = note.noteName.replace(/\d/, '');

        return (
          <div
            key={`letter-${note.id}-${idx}`}
            className={`flex flex-col items-center justify-center min-w-[48px] md:min-w-[56px] px-2.5 py-2 rounded-2xl transition-all shadow-xs ${
              isTarget
                ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white font-black scale-110 shadow-md ring-3 ring-blue-300 border-2 border-white'
                : isPast
                ? 'bg-slate-100 text-slate-400 font-medium'
                : 'bg-sky-50 hover:bg-sky-100 text-slate-900 font-black border-2 border-sky-200'
            }`}
          >
            <span className="text-2xl md:text-3xl leading-none font-sans font-black">
              {letter}
            </span>
            <span className={`text-xs md:text-sm leading-tight mt-1 font-black ${isTarget ? 'text-sky-100' : 'text-slate-700'}`}>
              {note.fingerNumber} 指
            </span>
          </div>
        );
      })}
    </div>
  );
};
