import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { TrebleClefGlyph, BassClefGlyph, AltoClefGlyph } from './MusicSvgSymbols';

export type ClefType = 'treble' | 'bass' | 'alto' | 'grand';

export interface TheoryStaffNoteItem {
  id: string;
  noteName: string;
  solfege: string;
  midiNote: number;
  positionLabel: string; // e.g. "第 2 線", "第 3 間", "下加 1 線"
  lineOrSpace: 'line' | 'space' | 'ledger';
  indexNum: number; // line 1-5 or space 1-4
  clef?: 'treble' | 'bass' | 'alto';
  duration?: 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'dotted_half';
  beatsLabel?: string;
  highlightColor?: string;
}

interface TheoryStaffInteractiveProps {
  clef: ClefType;
  notes?: TheoryStaffNoteItem[];
  highlightLine?: number; // 1 to 5
  highlightSpace?: number; // 1 to 4
  highlightMidi?: number;
  selectedMidi?: number;
  onSelectNote?: (note: TheoryStaffNoteItem) => void;
  showLineSpaceLabels?: boolean;
  interactive?: boolean;
  className?: string;
  compact?: boolean; // for mini quiz auxiliary view
}

export const TheoryStaffInteractive: React.FC<TheoryStaffInteractiveProps> = ({
  clef,
  notes,
  highlightLine,
  highlightSpace,
  highlightMidi,
  selectedMidi,
  onSelectNote,
  showLineSpaceLabels = true,
  interactive = true,
  className = '',
  compact = false,
}) => {
  const [hoveredMidi, setHoveredMidi] = useState<number | null>(null);

  // Standard geometry with D3 exact scales
  const lineSpacing = compact ? 14 : 18;
  const staffWidth = compact ? 440 : 680;

  // Treble default notes (C4 up to F5)
  const defaultTrebleNotes: TheoryStaffNoteItem[] = [
    { id: 't-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '下加 1 線', lineOrSpace: 'ledger', indexNum: 0 },
    { id: 't-d4', noteName: 'D4', solfege: 'Re', midiNote: 62, positionLabel: '下加 1 間', lineOrSpace: 'space', indexNum: 0 },
    { id: 't-e4', noteName: 'E4', solfege: 'Mi', midiNote: 64, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1 },
    { id: 't-f4', noteName: 'Fa', solfege: 'Fa', midiNote: 65, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1 },
    { id: 't-g4', noteName: 'G4', solfege: 'Sol', midiNote: 67, positionLabel: '第 2 線 (G譜號中心)', lineOrSpace: 'line', indexNum: 2 },
    { id: 't-a4', noteName: 'A4', solfege: 'La', midiNote: 69, positionLabel: '第 2 間', lineOrSpace: 'space', indexNum: 2 },
    { id: 't-b4', noteName: 'B4', solfege: 'Ti', midiNote: 71, positionLabel: '第 3 線 (中線)', lineOrSpace: 'line', indexNum: 3 },
    { id: 't-c5', noteName: 'C5', solfege: 'Do', midiNote: 72, positionLabel: '第 3 間', lineOrSpace: 'space', indexNum: 3 },
    { id: 't-d5', noteName: 'D5', solfege: 'Re', midiNote: 74, positionLabel: '第 4 線', lineOrSpace: 'line', indexNum: 4 },
    { id: 't-e5', noteName: 'E5', solfege: 'Mi', midiNote: 76, positionLabel: '第 4 間', lineOrSpace: 'space', indexNum: 4 },
    { id: 't-f5', noteName: 'F5', solfege: 'Fa', midiNote: 77, positionLabel: '第 5 線', lineOrSpace: 'line', indexNum: 5 },
  ];

  // Bass default notes (G2 up to C4)
  const defaultBassNotes: TheoryStaffNoteItem[] = [
    { id: 'b-g2', noteName: 'G2', solfege: 'Sol', midiNote: 43, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1 },
    { id: 'b-a2', noteName: 'A2', solfege: 'La', midiNote: 45, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1 },
    { id: 'b-b2', noteName: 'B2', solfege: 'Ti', midiNote: 47, positionLabel: '第 2 線', lineOrSpace: 'line', indexNum: 2 },
    { id: 'b-c3', noteName: 'C3', solfege: 'Do', midiNote: 48, positionLabel: '第 2 間', lineOrSpace: 'space', indexNum: 2 },
    { id: 'b-d3', noteName: 'D3', solfege: 'Re', midiNote: 50, positionLabel: '第 3 線 (中線)', lineOrSpace: 'line', indexNum: 3 },
    { id: 'b-e3', noteName: 'E3', solfege: 'Mi', midiNote: 52, positionLabel: '第 3 間', lineOrSpace: 'space', indexNum: 3 },
    { id: 'b-f3', noteName: 'F3', solfege: 'Fa', midiNote: 53, positionLabel: '第 4 線 (F譜號中心)', lineOrSpace: 'line', indexNum: 4 },
    { id: 'b-g3', noteName: 'G3', solfege: 'Sol', midiNote: 55, positionLabel: '第 4 間', lineOrSpace: 'space', indexNum: 4 },
    { id: 'b-a3', noteName: 'A3', solfege: 'La', midiNote: 57, positionLabel: '第 5 線', lineOrSpace: 'line', indexNum: 5 },
    { id: 'b-b3', noteName: 'B3', solfege: 'Ti', midiNote: 59, positionLabel: '上加 1 間', lineOrSpace: 'space', indexNum: 5 },
    { id: 'b-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '上加 1 線 (中央C)', lineOrSpace: 'ledger', indexNum: 6 },
  ];

  // Alto default notes (F3 up to G4, C4 right on Line 3!)
  const defaultAltoNotes: TheoryStaffNoteItem[] = [
    { id: 'a-f3', noteName: 'F3', solfege: 'Fa', midiNote: 53, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1 },
    { id: 'a-g3', noteName: 'G3', solfege: 'Sol', midiNote: 55, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1 },
    { id: 'a-a3', noteName: 'A3', solfege: 'La', midiNote: 57, positionLabel: '第 2 線', lineOrSpace: 'line', indexNum: 2 },
    { id: 'a-b3', noteName: 'B3', solfege: 'Ti', midiNote: 59, positionLabel: '第 2 間', lineOrSpace: 'space', indexNum: 2 },
    { id: 'a-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '第 3 線 (🌟中央C中心！)', lineOrSpace: 'line', indexNum: 3 },
    { id: 'a-d4', noteName: 'D4', solfege: 'Re', midiNote: 62, positionLabel: '第 3 間', lineOrSpace: 'space', indexNum: 3 },
    { id: 'a-e4', noteName: 'E4', solfege: 'Mi', midiNote: 64, positionLabel: '第 4 線', lineOrSpace: 'line', indexNum: 4 },
    { id: 'a-f4', noteName: 'F4', solfege: 'Fa', midiNote: 65, positionLabel: '第 4 間', lineOrSpace: 'space', indexNum: 4 },
    { id: 'a-g4', noteName: 'G4', solfege: 'Sol', midiNote: 67, positionLabel: '第 5 線', lineOrSpace: 'line', indexNum: 5 },
  ];

  const activeNotes = notes || (
    clef === 'treble' ? defaultTrebleNotes :
    clef === 'bass' ? defaultBassNotes :
    clef === 'alto' ? defaultAltoNotes :
    []
  );

  const handleNoteClick = (noteItem: TheoryStaffNoteItem) => {
    if (!interactive) return;
    pianoSynth.playPianoNote(noteItem.midiNote, 0.9, 0.8);
    onSelectNote?.(noteItem);
  };

  // Grand Staff Geometry & D3 Scales
  if (clef === 'grand') {
    const trebleTopY = compact ? 26 : 34;
    const bassTopY = trebleTopY + 4 * lineSpacing + (compact ? 36 : 48);
    const totalGrandHeight = bassTopY + 4 * lineSpacing + (compact ? 30 : 42);
    const middleCY = (trebleTopY + 4 * lineSpacing + bassTopY) / 2;

    const grandNotesTreble = defaultTrebleNotes.slice(0, 7);
    const grandNotesBass = defaultBassNotes.slice(3, 10);

    // D3 Scales for Grand Staff
    const trebleLineScale = d3.scaleLinear()
      .domain([1, 5])
      .range([trebleTopY + 4 * lineSpacing, trebleTopY]);

    const bassLineScale = d3.scaleLinear()
      .domain([1, 5])
      .range([bassTopY + 4 * lineSpacing, bassTopY]);

    // D3 Horizontal Scale for notes
    const grandTrebleXScale = d3.scaleLinear()
      .domain([0, grandNotesTreble.length - 1])
      .range([150, 150 + (grandNotesTreble.length - 1) * 44]);

    const grandBassXScale = d3.scaleLinear()
      .domain([0, grandNotesBass.length - 1])
      .range([150, 150 + (grandNotesBass.length - 1) * 44]);

    return (
      <div className={`w-full overflow-x-auto select-none p-2 ${className}`}>
        <div className="relative min-w-[580px] bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950/70 rounded-3xl p-4 border-2 border-indigo-500/40 shadow-xl">
          <div className="flex items-center justify-between mb-2 px-2 text-xs">
            <span className="font-black text-amber-300 flex items-center gap-1.5">
              <span>🌌</span>
              <span>大譜表 (The Grand Staff) · D3.js 動態精確對齊 · 中央 C (C4) 相連</span>
            </span>
            <span className="text-[11px] text-slate-400 font-bold bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-700">
              點擊音符立即發聲 🔊
            </span>
          </div>

          <svg
            viewBox={`0 0 ${staffWidth + 40} ${totalGrandHeight}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          >
            {/* Connecting Brace (中括號) on left */}
            <path
              d={`M 36,${trebleTopY - 6} C 16,${trebleTopY + 20} 22,${middleCY - 14} 12,${middleCY} C 22,${middleCY + 14} 16,${bassTopY + 4 * lineSpacing - 20} 36,${bassTopY + 4 * lineSpacing + 6} C 20,${bassTopY + 4 * lineSpacing - 10} 28,${middleCY + 10} 20,${middleCY} C 28,${middleCY - 10} 20,${trebleTopY + 10} 36,${trebleTopY - 6} Z`}
              fill="#F59E0B"
              opacity="0.9"
            />
            {/* Left vertical bar joining both staves */}
            <line x1="38" y1={trebleTopY} x2="38" y2={bassTopY + 4 * lineSpacing} stroke="#CBD5E1" strokeWidth="2.5" />

            {/* Treble 5 lines - calculated via D3 scale */}
            {[1, 2, 3, 4, 5].map((lineNum) => {
              const y = trebleLineScale(lineNum);
              return (
                <line key={`gt-l-${lineNum}`} x1="38" y1={y} x2={staffWidth + 20} y2={y} stroke="#64748B" strokeWidth="1.8" />
              );
            })}

            {/* Treble Clef Sign */}
            <TrebleClefGlyph x={50} y={trebleTopY - 6} scale={compact ? 0.72 : 0.86} color="#60A5FA" />
            <text x="56" y={trebleTopY - 10} fontSize="11" fill="#93C5FD" fontWeight="900">
              右手高音區 (Treble)
            </text>

            {/* Bass 5 lines - calculated via D3 scale */}
            {[1, 2, 3, 4, 5].map((lineNum) => {
              const y = bassLineScale(lineNum);
              return (
                <line key={`gb-l-${lineNum}`} x1="38" y1={y} x2={staffWidth + 20} y2={y} stroke="#64748B" strokeWidth="1.8" />
              );
            })}

            {/* Bass Clef Sign */}
            <BassClefGlyph x={50} y={bassTopY - 2} scale={compact ? 0.76 : 0.92} color="#C084FC" />
            <text x="56" y={bassTopY - 10} fontSize="11" fill="#D8B4FE" fontWeight="900">
              左手低音區 (Bass)
            </text>

            {/* Middle C (C4) Central Bridge */}
            <g
              onClick={() => handleNoteClick({ id: 'mid-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '中央 C4 (彩虹橋)', lineOrSpace: 'ledger', indexNum: 0 })}
              className="cursor-pointer group"
            >
              <line x1={staffWidth / 2 - 28} y1={middleCY} x2={staffWidth / 2 + 28} y2={middleCY} stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <ellipse
                cx={staffWidth / 2}
                cy={middleCY}
                rx="12"
                ry="8.5"
                transform={`rotate(-22 ${staffWidth / 2} ${middleCY})`}
                fill="#FBBF24"
                stroke="#B45309"
                strokeWidth="2.5"
                className="group-hover:scale-125 transition-transform"
              />
              <text x={staffWidth / 2} y={middleCY - 16} textAnchor="middle" fontSize="12" fontWeight="900" fill="#FDE047">
                🌟 中央 C (Do)
              </text>
              <text x={staffWidth / 2} y={middleCY + 22} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FDE68A">
                高音譜下加1線 = 低音譜上加1線
              </text>
            </g>

            {/* Treble sample notes on right side */}
            {grandNotesTreble.map((note, idx) => {
              const x = grandTrebleXScale(idx);
              const diatonicStepsFromC4 = note.midiNote === 60 ? 0 :
                note.midiNote === 62 ? 1 :
                note.midiNote === 64 ? 2 :
                note.midiNote === 65 ? 3 :
                note.midiNote === 67 ? 4 :
                note.midiNote === 69 ? 5 : 6;
              const y = (trebleTopY + 4 * lineSpacing + lineSpacing) - diatonicStepsFromC4 * (lineSpacing / 2);

              return (
                <g key={`gn-t-${note.id}`} onClick={() => handleNoteClick(note)} className="cursor-pointer group">
                  {note.midiNote === 60 && (
                    <line x1={x - 16} y1={y} x2={x + 16} y2={y} stroke="#CBD5E1" strokeWidth="2.5" />
                  )}
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="9.5"
                    ry="7"
                    transform={`rotate(-22 ${x} ${y})`}
                    fill="#60A5FA"
                    stroke="#1D4ED8"
                    strokeWidth="2"
                    className="group-hover:scale-125 transition-transform"
                  />
                  <line x1={x + 9} y1={y} x2={x + 9} y2={y - 28} stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" />
                  <text x={x} y={y - 32} textAnchor="middle" fontSize="10" fontWeight="900" fill="#93C5FD">
                    {note.noteName}
                  </text>
                  <text x={x} y={y + 18} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#CBD5E1">
                    {note.solfege}
                  </text>
                </g>
              );
            })}

            {/* Bass sample notes on right side */}
            {grandNotesBass.map((note, idx) => {
              const x = grandBassXScale(idx);
              const stepFromG2 = note.midiNote === 48 ? 3 :
                note.midiNote === 50 ? 4 :
                note.midiNote === 52 ? 5 :
                note.midiNote === 53 ? 6 :
                note.midiNote === 55 ? 7 :
                note.midiNote === 57 ? 8 : 9;
              const y = (bassTopY + 4 * lineSpacing) - stepFromG2 * (lineSpacing / 2);

              return (
                <g key={`gn-b-${note.id}`} onClick={() => handleNoteClick(note)} className="cursor-pointer group">
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="9.5"
                    ry="7"
                    transform={`rotate(-22 ${x} ${y})`}
                    fill="#C084FC"
                    stroke="#7E22CE"
                    strokeWidth="2"
                    className="group-hover:scale-125 transition-transform"
                  />
                  <line x1={x + 9} y1={y} x2={x + 9} y2={y - 28} stroke="#C084FC" strokeWidth="2.2" strokeLinecap="round" />
                  <text x={x} y={y - 32} textAnchor="middle" fontSize="10" fontWeight="900" fill="#E9D5FF">
                    {note.noteName}
                  </text>
                  <text x={x} y={y + 18} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#CBD5E1">
                    {note.solfege}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  // Single Clef Staff geometry & D3 Scales (Treble, Bass, or Alto)
  const staffTopY = compact ? 24 : 36;
  const totalHeight = staffTopY + 4 * lineSpacing + (compact ? 52 : 72);

  // D3 Scales for exact subpixel alignment on iPad Safari:
  // Line 1 is at bottom (staffTopY + 4 * lineSpacing)
  // Line 5 is at top (staffTopY)
  const staffLineScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([1, 5])
      .range([staffTopY + 4 * lineSpacing, staffTopY]);
  }, [staffTopY, lineSpacing]);

  // Space scale: Space 1 is between line 1 & 2, space 4 is between line 4 & 5
  const staffSpaceScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([1, 4])
      .range([staffTopY + 3.5 * lineSpacing, staffTopY + 0.5 * lineSpacing]);
  }, [staffTopY, lineSpacing]);

  // Horizontal Scale for distributing notes
  const leftMargin = compact ? 84 : 124;
  const rightMargin = 40;
  const availableWidth = staffWidth - leftMargin - rightMargin;

  const noteXScale = useMemo(() => {
    const total = activeNotes.length;
    if (total <= 1) return () => leftMargin + availableWidth / 2;
    return d3.scaleLinear()
      .domain([0, total - 1])
      .range([leftMargin, staffWidth - rightMargin]);
  }, [activeNotes.length, leftMargin, availableWidth, staffWidth, rightMargin]);

  // Precise Note Coordinate calculation using D3 continuous pitch scale
  const getNoteCoordinates = (note: TheoryStaffNoteItem, index: number) => {
    const x = noteXScale(index);
    let y = staffLineScale(3); // default line 3

    if (clef === 'treble') {
      // E4 (midi 64) is Line 1 (domain 2)
      // C4 (midi 60) is step 0 (domain 0, 1 ledger line below Line 1)
      const diatonicFromC4 = note.midiNote === 60 ? 0 :
        note.midiNote === 62 ? 1 :
        note.midiNote === 64 ? 2 :
        note.midiNote === 65 ? 3 :
        note.midiNote === 67 ? 4 :
        note.midiNote === 69 ? 5 :
        note.midiNote === 71 ? 6 :
        note.midiNote === 72 ? 7 :
        note.midiNote === 74 ? 8 :
        note.midiNote === 76 ? 9 : 10;
      // D3 diatonic pitch scale: step 0 -> Y of C4, step 2 -> Line 1 (E4), step 10 -> Line 5 (F5)
      y = (staffTopY + 5 * lineSpacing) - diatonicFromC4 * (lineSpacing / 2);
    } else if (clef === 'bass') {
      // G2 (midi 43) is Line 1
      const diatonicFromG2 = note.midiNote === 43 ? 0 :
        note.midiNote === 45 ? 1 :
        note.midiNote === 47 ? 2 :
        note.midiNote === 48 ? 3 :
        note.midiNote === 50 ? 4 :
        note.midiNote === 52 ? 5 :
        note.midiNote === 53 ? 6 :
        note.midiNote === 55 ? 7 :
        note.midiNote === 57 ? 8 :
        note.midiNote === 59 ? 9 : 10;
      y = (staffTopY + 4 * lineSpacing) - diatonicFromG2 * (lineSpacing / 2);
    } else if (clef === 'alto') {
      // Line 3 is C4 (Middle C)
      const diatonicFromC4 = note.midiNote === 53 ? -4 :
        note.midiNote === 55 ? -3 :
        note.midiNote === 57 ? -2 :
        note.midiNote === 59 ? -1 :
        note.midiNote === 60 ? 0 :
        note.midiNote === 62 ? 1 :
        note.midiNote === 64 ? 2 :
        note.midiNote === 65 ? 3 : 4;
      y = (staffTopY + 2 * lineSpacing) - diatonicFromC4 * (lineSpacing / 2);
    }

    return { x, y };
  };

  return (
    <div className={`w-full overflow-x-auto select-none ${className}`}>
      <div className="relative min-w-[500px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-4 border-2 border-slate-800 shadow-xl">
        {/* Header Indicator */}
        <div className="flex items-center justify-between mb-2 px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">
              {clef === 'treble' ? '🎼' : clef === 'bass' ? '🎵' : '🎻'}
            </span>
            <span className="font-black text-white">
              {clef === 'treble' ? '高音五線譜 (Treble G-Clef)' :
               clef === 'bass' ? '低音五線譜 (Bass F-Clef)' :
               '中音五線譜 (Alto C-Clef · C譜號)'}
            </span>
            <span className="text-[11px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-400/30">
              {clef === 'treble' ? 'G4 位於第 2 線' :
               clef === 'bass' ? 'F3 位於第 4 線' :
               '中央 C4 位於第 3 線'}
            </span>
          </div>
          {interactive && (
            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
              點擊音符試聽琴音 🔊
            </span>
          )}
        </div>

        <svg
          viewBox={`0 0 ${staffWidth} ${totalHeight}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="geometricPrecision"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          <defs>
            <filter id="theoryGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#F59E0B" floodOpacity="0.8" />
            </filter>
            <filter id="activeNoteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#3B82F6" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Highlighted Line Background (calculated via D3) */}
          {highlightLine && (
            <rect
              x="50"
              y={staffLineScale(highlightLine) - lineSpacing / 2}
              width={staffWidth - 70}
              height={lineSpacing}
              fill="#F59E0B"
              fillOpacity="0.18"
              rx="6"
            />
          )}

          {/* Highlighted Space Background (calculated via D3) */}
          {highlightSpace && (
            <rect
              x="50"
              y={staffSpaceScale(highlightSpace) - lineSpacing / 2}
              width={staffWidth - 70}
              height={lineSpacing}
              fill="#3B82F6"
              fillOpacity="0.18"
              rx="6"
            />
          )}

          {/* Left Vertical Start Bar Line */}
          <line x1="50" y1={staffTopY} x2="50" y2={staffTopY + 4 * lineSpacing} stroke="#CBD5E1" strokeWidth="2.5" />

          {/* 5 Horizontal Staff Lines - D3 Exact Mathematical Layout */}
          {[1, 2, 3, 4, 5].map((lineNum) => {
            const y = staffLineScale(lineNum);
            const isTargetLine = highlightLine === lineNum;

            return (
              <g key={`staff-line-${lineNum}`}>
                <line
                  x1="50"
                  y1={y}
                  x2={staffWidth - 20}
                  y2={y}
                  stroke={isTargetLine ? '#F59E0B' : '#64748B'}
                  strokeWidth={isTargetLine ? '2.5' : '1.8'}
                  shapeRendering="geometricPrecision"
                />
                {/* Left Line Label (第1線 ~ 第5線) */}
                {showLineSpaceLabels && !compact && (
                  <text
                    x="42"
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="9.5"
                    fontWeight="800"
                    fill={isTargetLine ? '#F59E0B' : '#94A3B8'}
                  >
                    第{lineNum}線
                  </text>
                )}
              </g>
            );
          })}

          {/* Right Space Labels (第1間 ~ 第4間) via D3 scale */}
          {showLineSpaceLabels && !compact && [1, 2, 3, 4].map((spaceNum) => {
            const y = staffSpaceScale(spaceNum);
            const isTargetSpace = highlightSpace === spaceNum;

            return (
              <text
                key={`space-label-${spaceNum}`}
                x={staffWidth - 12}
                y={y + 3.5}
                textAnchor="start"
                fontSize="9.5"
                fontWeight="800"
                fill={isTargetSpace ? '#60A5FA' : '#64748B'}
              >
                第{spaceNum}間
              </text>
            );
          })}

          {/* Vector Clef Signs */}
          {clef === 'treble' && (
            <TrebleClefGlyph x={58} y={staffTopY - 6} scale={compact ? 0.75 : 0.92} color="#38BDF8" />
          )}

          {clef === 'bass' && (
            <BassClefGlyph x={58} y={staffTopY - 2} scale={compact ? 0.8 : 0.96} color="#A855F7" />
          )}

          {clef === 'alto' && (
            <AltoClefGlyph x={58} y={staffTopY} scale={compact ? 0.8 : 0.95} color="#F59E0B" />
          )}

          {/* Interactive Notes on Staff */}
          {activeNotes.map((note, idx) => {
            const { x, y } = getNoteCoordinates(note, idx);
            const isSelected = selectedMidi === note.midiNote || highlightMidi === note.midiNote;
            const isHovered = hoveredMidi === note.midiNote;

            // Ledger line detection
            const needsLedgerBelow = y >= staffTopY + 4 * lineSpacing + lineSpacing;
            const needsLedgerAbove = y <= staffTopY - lineSpacing;

            return (
              <g
                key={note.id}
                onClick={() => handleNoteClick(note)}
                onMouseEnter={() => setHoveredMidi(note.midiNote)}
                onMouseLeave={() => setHoveredMidi(null)}
                className={`transition-all duration-150 ${interactive ? 'cursor-pointer' : ''}`}
              >
                {/* Ledger Lines */}
                {needsLedgerBelow && (
                  <line
                    x1={x - 18}
                    y1={staffTopY + 5 * lineSpacing}
                    x2={x + 18}
                    y2={staffTopY + 5 * lineSpacing}
                    stroke="#CBD5E1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}
                {needsLedgerAbove && (
                  <line
                    x1={x - 18}
                    y1={staffTopY - lineSpacing}
                    x2={x + 18}
                    y2={staffTopY - lineSpacing}
                    stroke="#CBD5E1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Target Glow Ring if selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="18"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    className="animate-pulse"
                    filter="url(#theoryGlow)"
                  />
                )}

                {/* Notehead (Oval) */}
                <ellipse
                  cx={x}
                  cy={y}
                  rx={compact ? '9' : '11.5'}
                  ry={compact ? '6.5' : '8.5'}
                  transform={`rotate(-22 ${x} ${y})`}
                  fill={
                    isSelected
                      ? '#FBBF24'
                      : isHovered
                      ? '#60A5FA'
                      : note.lineOrSpace === 'line'
                      ? '#38BDF8'
                      : '#EC4899'
                  }
                  stroke={isSelected ? '#B45309' : '#0F172A'}
                  strokeWidth="1.8"
                  className="transition-colors"
                />

                {/* Stem */}
                <line
                  x1={y > staffTopY + 2 * lineSpacing ? x + 10 : x - 10}
                  y1={y}
                  x2={y > staffTopY + 2 * lineSpacing ? x + 10 : x - 10}
                  y2={y > staffTopY + 2 * lineSpacing ? y - 36 : y + 36}
                  stroke={isSelected ? '#F59E0B' : '#94A3B8'}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* Top Note Name Badge (e.g. C4, E4) */}
                <g transform={`translate(${x}, ${y > staffTopY + 2 * lineSpacing ? y - 44 : y - 20})`}>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fontSize={compact ? '9' : '11'}
                    fontWeight="900"
                    fill={isSelected ? '#FDE047' : '#FFFFFF'}
                  >
                    {note.noteName}
                  </text>
                </g>

                {/* Bottom Solfege & Position Label */}
                <g transform={`translate(${x}, ${staffTopY + 4 * lineSpacing + (compact ? 22 : 30)})`}>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fontSize={compact ? '10' : '12'}
                    fontWeight="900"
                    fill={isSelected ? '#FBBF24' : '#E2E8F0'}
                  >
                    {note.solfege}
                  </text>
                  {!compact && (
                    <text
                      x="0"
                      y="14"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={note.lineOrSpace === 'line' ? '#38BDF8' : '#F472B6'}
                    >
                      {note.positionLabel}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
