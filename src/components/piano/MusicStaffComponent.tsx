import React, { useState } from 'react';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { TrebleClefGlyph, BassClefGlyph, AltoClefGlyph } from './MusicSvgSymbols';

export type ClefMode = 'grand' | 'alto' | 'tenor' | 'treble' | 'bass';

export interface MusicStaffItem {
  id: string;
  noteName: string; // e.g. "C4", "G4"
  solfege: string; // "Do", "Sol"
  midiNote: number; // 60, 67
  positionLabel: string; // "第 3 線", "第 2 間", "下加 1 線"
  lineOrSpace: 'line' | 'space' | 'ledger';
  indexNum: number; // line 1~5, space 1~4
  clef?: 'treble' | 'bass' | 'alto' | 'tenor';
  color?: string;
  hand?: 'right' | 'left' | 'both';
  instrument?: string; // e.g. "鋼琴右手", "中提琴 Viola"
}

export interface MusicStaffComponentProps {
  clef: ClefMode;
  notes?: MusicStaffItem[];
  selectedMidi?: number;
  highlightLine?: number;
  highlightSpace?: number;
  highlightMidi?: number;
  onNoteClick?: (note: MusicStaffItem) => void;
  showLabels?: boolean;
  showPianoKeys?: boolean;
  interactive?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const MusicStaffComponent: React.FC<MusicStaffComponentProps> = ({
  clef,
  notes,
  selectedMidi,
  highlightLine,
  highlightSpace,
  highlightMidi,
  onNoteClick,
  showLabels = true,
  showPianoKeys = true,
  interactive = true,
  title,
  subtitle,
  className = '',
}) => {
  const [internalSelectedMidi, setInternalSelectedMidi] = useState<number | undefined>(selectedMidi);
  const [activeNoteInfo, setActiveNoteInfo] = useState<MusicStaffItem | null>(null);

  const activeMidi = selectedMidi !== undefined ? selectedMidi : internalSelectedMidi;

  // Geometry configuration
  const lineSpacing = 18; // 18px between staff lines
  const staffWidth = 760;

  // Built-in educational note collections
  const defaultTrebleNotes: MusicStaffItem[] = [
    { id: 't-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '下加 1 線 (中央C)', lineOrSpace: 'ledger', indexNum: 0, clef: 'treble', hand: 'right' },
    { id: 't-d4', noteName: 'D4', solfege: 'Re', midiNote: 62, positionLabel: '下加 1 間', lineOrSpace: 'space', indexNum: 0, clef: 'treble', hand: 'right' },
    { id: 't-e4', noteName: 'E4', solfege: 'Mi', midiNote: 64, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1, clef: 'treble', hand: 'right' },
    { id: 't-f4', noteName: 'F4', solfege: 'Fa', midiNote: 65, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1, clef: 'treble', hand: 'right' },
    { id: 't-g4', noteName: 'G4', solfege: 'Sol', midiNote: 67, positionLabel: '第 2 線 (G譜號中心)', lineOrSpace: 'line', indexNum: 2, clef: 'treble', hand: 'right' },
    { id: 't-a4', noteName: 'A4', solfege: 'La', midiNote: 69, positionLabel: '第 2 間', lineOrSpace: 'space', indexNum: 2, clef: 'treble', hand: 'right' },
    { id: 't-b4', noteName: 'B4', solfege: 'Ti', midiNote: 71, positionLabel: '第 3 線 (中線)', lineOrSpace: 'line', indexNum: 3, clef: 'treble', hand: 'right' },
    { id: 't-c5', noteName: 'C5', solfege: 'Do', midiNote: 72, positionLabel: '第 3 間', lineOrSpace: 'space', indexNum: 3, clef: 'treble', hand: 'right' },
    { id: 't-d5', noteName: 'D5', solfege: 'Re', midiNote: 74, positionLabel: '第 4 線', lineOrSpace: 'line', indexNum: 4, clef: 'treble', hand: 'right' },
    { id: 't-e5', noteName: 'E5', solfege: 'Mi', midiNote: 76, positionLabel: '第 4 間', lineOrSpace: 'space', indexNum: 4, clef: 'treble', hand: 'right' },
    { id: 't-f5', noteName: 'F5', solfege: 'Fa', midiNote: 77, positionLabel: '第 5 線', lineOrSpace: 'line', indexNum: 5, clef: 'treble', hand: 'right' },
  ];

  const defaultBassNotes: MusicStaffItem[] = [
    { id: 'b-g2', noteName: 'G2', solfege: 'Sol', midiNote: 43, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1, clef: 'bass', hand: 'left' },
    { id: 'b-a2', noteName: 'A2', solfege: 'La', midiNote: 45, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1, clef: 'bass', hand: 'left' },
    { id: 'b-b2', noteName: 'B2', solfege: 'Ti', midiNote: 47, positionLabel: '第 2 線', lineOrSpace: 'line', indexNum: 2, clef: 'bass', hand: 'left' },
    { id: 'b-c3', noteName: 'C3', solfege: 'Do', midiNote: 48, positionLabel: '第 2 間', lineOrSpace: 'space', indexNum: 2, clef: 'bass', hand: 'left' },
    { id: 'b-d3', noteName: 'D3', solfege: 'Re', midiNote: 50, positionLabel: '第 3 線 (中線)', lineOrSpace: 'line', indexNum: 3, clef: 'bass', hand: 'left' },
    { id: 'b-e3', noteName: 'E3', solfege: 'Mi', midiNote: 52, positionLabel: '第 3 間', lineOrSpace: 'space', indexNum: 3, clef: 'bass', hand: 'left' },
    { id: 'b-f3', noteName: 'F3', solfege: 'Fa', midiNote: 53, positionLabel: '第 4 線 (F譜號中心)', lineOrSpace: 'line', indexNum: 4, clef: 'bass', hand: 'left' },
    { id: 'b-g3', noteName: 'G3', solfege: 'Sol', midiNote: 55, positionLabel: '第 4 間', lineOrSpace: 'space', indexNum: 4, clef: 'bass', hand: 'left' },
    { id: 'b-a3', noteName: 'A3', solfege: 'La', midiNote: 57, positionLabel: '第 5 線', lineOrSpace: 'line', indexNum: 5, clef: 'bass', hand: 'left' },
    { id: 'b-b3', noteName: 'B3', solfege: 'Ti', midiNote: 59, positionLabel: '上加 1 間', lineOrSpace: 'space', indexNum: 5, clef: 'bass', hand: 'left' },
    { id: 'b-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '上加 1 線 (中央C)', lineOrSpace: 'ledger', indexNum: 6, clef: 'bass', hand: 'left' },
  ];

  const defaultAltoNotes: MusicStaffItem[] = [
    { id: 'a-f3', noteName: 'F3', solfege: 'Fa', midiNote: 53, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-g3', noteName: 'G3', solfege: 'Sol', midiNote: 55, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-a3', noteName: 'A3', solfege: 'La', midiNote: 57, positionLabel: '第 2 線', lineOrSpace: 'line', indexNum: 2, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-b3', noteName: 'B3', solfege: 'Ti', midiNote: 59, positionLabel: '第 2 間', lineOrSpace: 'space', indexNum: 2, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '第 3 線 (🌟中央C指引)', lineOrSpace: 'line', indexNum: 3, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-d4', noteName: 'D4', solfege: 'Re', midiNote: 62, positionLabel: '第 3 間', lineOrSpace: 'space', indexNum: 3, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-e4', noteName: 'E4', solfege: 'Mi', midiNote: 64, positionLabel: '第 4 線', lineOrSpace: 'line', indexNum: 4, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-f4', noteName: 'F4', solfege: 'Fa', midiNote: 65, positionLabel: '第 4 間', lineOrSpace: 'space', indexNum: 4, clef: 'alto', instrument: '中提琴 Viola' },
    { id: 'a-g4', noteName: 'G4', solfege: 'Sol', midiNote: 67, positionLabel: '第 5 線', lineOrSpace: 'line', indexNum: 5, clef: 'alto', instrument: '中提琴 Viola' },
  ];

  const defaultTenorNotes: MusicStaffItem[] = [
    { id: 'tn-d3', noteName: 'D3', solfege: 'Re', midiNote: 50, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1, clef: 'tenor', instrument: '大提琴/長號 Cello/Trombone' },
    { id: 'tn-e3', noteName: 'E3', solfege: 'Mi', midiNote: 52, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1, clef: 'tenor', instrument: '大提琴/長號' },
    { id: 'tn-f3', noteName: 'F3', solfege: 'Fa', midiNote: 53, positionLabel: '第 2 線', lineOrSpace: 'line', indexNum: 2, clef: 'tenor', instrument: '大提琴/長號' },
    { id: 'tn-g3', noteName: 'G3', solfege: 'Sol', midiNote: 55, positionLabel: '第 2 間', lineOrSpace: 'space', indexNum: 2, clef: 'tenor', instrument: '大提琴/長號' },
    { id: 'tn-a3', noteName: 'A3', solfege: 'La', midiNote: 57, positionLabel: '第 3 線', lineOrSpace: 'line', indexNum: 3, clef: 'tenor', instrument: '大提琴/長號' },
    { id: 'tn-b3', noteName: 'B3', solfege: 'Ti', midiNote: 59, positionLabel: '第 3 間', lineOrSpace: 'space', indexNum: 3, clef: 'tenor', instrument: '大提琴/長號' },
    { id: 'tn-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '第 4 線 (🌟中央C指引)', lineOrSpace: 'line', indexNum: 4, clef: 'tenor', instrument: '大提琴/長號' },
    { id: 'tn-d4', noteName: 'D4', solfege: 'Re', midiNote: 62, positionLabel: '第 4 間', lineOrSpace: 'space', indexNum: 4, clef: 'tenor', instrument: '大提琴/長號' },
    { id: 'tn-e4', noteName: 'E4', solfege: 'Mi', midiNote: 64, positionLabel: '第 5 線', lineOrSpace: 'line', indexNum: 5, clef: 'tenor', instrument: '大提琴/長號' },
  ];

  const activeNotes = notes || (
    clef === 'treble' ? defaultTrebleNotes :
    clef === 'bass' ? defaultBassNotes :
    clef === 'alto' ? defaultAltoNotes :
    clef === 'tenor' ? defaultTenorNotes :
    [...defaultTrebleNotes, ...defaultBassNotes]
  );

  const handleNoteItemClick = (note: MusicStaffItem) => {
    if (!interactive) return;
    setInternalSelectedMidi(note.midiNote);
    setActiveNoteInfo(note);
    pianoSynth.playPianoNote(note.midiNote, 0.9, 1.2);
    onNoteClick?.(note);
  };

  // Convert MIDI note to diatonic step from C4 (0 = C4, 1 = D4, 2 = E4, -1 = B3, etc.)
  const getDiatonicStep = (midi: number): number => {
    const semitonesFromC = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1; // 4 for C4 (midi 60)
    const diatonicInOctave = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][semitonesFromC];
    return (octave - 4) * 7 + diatonicInOctave;
  };

  /**
   * Treble staff note Y calculation
   * Line 5 (F5, step 10) = topY
   * Line 4 (D5, step 8) = topY + 18
   * Line 3 (B4, step 6) = topY + 36
   * Line 2 (G4, step 4) = topY + 54
   * Line 1 (E4, step 2) = topY + 72
   * Lower Ledger 1 (C4, step 0) = topY + 90
   */
  const getTrebleY = (diatonicStepFromC4: number, topY = 36): number => {
    return topY + 90 - diatonicStepFromC4 * 9;
  };

  /**
   * Bass staff note Y calculation
   * Upper Ledger 1 (C4, step 0) = topY - 18
   * Line 5 (A3, step -2) = topY
   * Line 4 (F3, step -4) = topY + 18
   * Line 3 (D3, step -6) = topY + 36
   * Line 2 (B2, step -8) = topY + 54
   * Line 1 (G2, step -10) = topY + 72
   */
  const getBassY = (diatonicStepFromC4: number, topY = 36): number => {
    return topY - (diatonicStepFromC4 + 2) * 9;
  };

  /**
   * Alto staff note Y calculation
   * Line 3 (C4, step 0) = topY + 36 (Center notch of C-clef)
   */
  const getAltoY = (diatonicStepFromC4: number, topY = 36): number => {
    return topY + 36 - diatonicStepFromC4 * 9;
  };

  // Helper to render ledger lines when a note is placed above or below the 5 lines
  const renderLedgerLines = (noteX: number, noteY: number, staffTop: number) => {
    const lines: React.ReactNode[] = [];
    const staffBottom = staffTop + 72; // Line 1

    // Notes below Line 1
    if (noteY >= staffBottom + 14) {
      for (let ly = staffBottom + 18; ly <= noteY + 4; ly += 18) {
        lines.push(
          <line
            key={`ledger-b-${ly}`}
            x1={noteX - 16}
            y1={ly}
            x2={noteX + 16}
            y2={ly}
            stroke="#334155"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      }
    }

    // Notes above Line 5
    if (noteY <= staffTop - 14) {
      for (let ly = staffTop - 18; ly >= noteY - 4; ly -= 18) {
        lines.push(
          <line
            key={`ledger-a-${ly}`}
            x1={noteX - 16}
            y1={ly}
            x2={noteX + 16}
            y2={ly}
            stroke="#334155"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      }
    }

    return lines;
  };

  return (
    <div className={`w-full flex flex-col gap-3.5 select-none ${className}`}>
      {/* Header Info */}
      {(title || subtitle) && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-left px-1">
          <div>
            {title && <h3 className="text-lg md:text-xl font-black text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-600 font-bold mt-0.5">{subtitle}</p>}
          </div>
          <div className="text-xs font-black text-amber-950 bg-amber-200/90 px-3.5 py-1.5 rounded-full border border-amber-300 shadow-xs">
            👆 點擊任一音符可即時發聲對照
          </div>
        </div>
      )}

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-x-auto bg-gradient-to-b from-amber-50/95 via-white to-amber-50/95 rounded-3xl shadow-xl border-2 border-amber-300/80 p-3 scrollbar-thin">
        <svg
          viewBox={clef === 'grand' ? `0 0 ${staffWidth} 320` : `0 0 ${staffWidth} 180`}
          className="w-full h-auto min-w-[620px]"
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="geometricPrecision"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          <defs>
            <filter id="musicStaffGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#2563EB" floodOpacity="0.6" />
            </filter>
            <filter id="goldStarGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* ======================================================= */}
          {/* 1. GRAND STAFF (大譜表: 高音譜 + 低音譜 + 中央C彩虹橋) */}
          {/* ======================================================= */}
          {clef === 'grand' && (
            <g>
              {/* Orchestral Brace on the left */}
              <path
                d="M 40,32 C 28,32 20,80 20,135 C 20,150 14,152 8,152 C 14,152 20,154 20,169 C 20,224 28,272 40,272 L 36,272 C 24,272 16,224 16,169 C 16,154 10,152 4,152 C 10,152 16,150 16,135 C 16,80 24,32 36,32 Z"
                fill="#1E293B"
              />
              <line x1="42" y1="36" x2="42" y2="268" stroke="#1E293B" strokeWidth="4" />

              {/* Upper Treble Staff Header Text */}
              <text x="52" y="24" fontSize="12" fontWeight="900" fill="#2563EB" fontFamily="sans-serif">
                🎼 高音譜表 (右手旋律區 · Treble Staff)
              </text>
              {/* Lower Bass Staff Header Text */}
              <text x="52" y="184" fontSize="12" fontWeight="900" fill="#7C3AED" fontFamily="sans-serif">
                🎵 低音譜表 (左手伴奏區 · Bass Staff)
              </text>

              {/* Treble 5 lines (Y = 36, 54, 72, 90, 108) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 36 + i * 18;
                const lineNum = 5 - i;
                const isHighlight = highlightLine === lineNum;
                return (
                  <g key={`grand-tline-${i}`}>
                    <line
                      x1="42"
                      y1={y}
                      x2={staffWidth - 25}
                      y2={y}
                      stroke={isHighlight ? '#2563EB' : '#334155'}
                      strokeWidth={isHighlight ? 3.5 : 1.8}
                    />
                    {showLabels && (
                      <text x={staffWidth - 20} y={y + 3.5} fontSize="9" fontWeight="800" fill={isHighlight ? '#2563EB' : '#64748B'}>
                        第{lineNum}線 {lineNum === 2 ? '(G4)' : ''}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Treble G-Clef Vector Glyph (Exact placement on Line 5 = 36) */}
              <TrebleClefGlyph x={48} y={36} lineSpacing={18} color="#1E293B" />

              {/* Central Middle C Floating Bridge (Y = 152) */}
              <g transform="translate(0, 152)">
                <line x1="160" y1="0" x2={staffWidth - 120} y2="0" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                <rect x="200" y="-12" width="320" height="24" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="360" y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B45309" fontFamily="sans-serif">
                  🌟 中央 C (C4) 彩虹橋：高音譜下加1線 (Y=126) ＝ 低音譜上加1線 (Y=178)
                </text>
              </g>

              {/* Bass 5 lines (Y = 196, 214, 232, 250, 268) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 196 + i * 18;
                const lineNum = 5 - i;
                const isHighlight = highlightLine === lineNum;
                return (
                  <g key={`grand-bline-${i}`}>
                    <line
                      x1="42"
                      y1={y}
                      x2={staffWidth - 25}
                      y2={y}
                      stroke={isHighlight ? '#7C3AED' : '#334155'}
                      strokeWidth={isHighlight ? 3.5 : 1.8}
                    />
                    {showLabels && (
                      <text x={staffWidth - 20} y={y + 3.5} fontSize="9" fontWeight="800" fill={isHighlight ? '#7C3AED' : '#64748B'}>
                        第{lineNum}線 {lineNum === 4 ? '(F3)' : ''}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Bass F-Clef Vector Glyph (Exact placement on Line 5 = 196) */}
              <BassClefGlyph x={48} y={196} lineSpacing={18} color="#1E293B" />

              {/* Interactive Notes on Grand Staff */}
              {/* 1. Treble Notes */}
              {defaultTrebleNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isHighlighted = highlightMidi === note.midiNote;
                const diatonicStep = getDiatonicStep(note.midiNote);
                const noteY = getTrebleY(diatonicStep, 36);

                const noteSpacing = 50;
                const noteX = 145 + idx * noteSpacing;
                const primaryColor = isSelected ? '#10B981' : isHighlighted ? '#F59E0B' : '#2563EB';

                return (
                  <g
                    key={`gt-${note.id}`}
                    onClick={() => handleNoteItemClick(note)}
                    className="cursor-pointer group"
                  >
                    {/* Dynamic Ledger Lines */}
                    {renderLedgerLines(noteX, noteY, 36)}

                    {/* Note Head Ellipse */}
                    <ellipse
                      cx={noteX}
                      cy={noteY}
                      rx="11.5"
                      ry="8"
                      transform={`rotate(-22 ${noteX} ${noteY})`}
                      fill={primaryColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* Stem */}
                    <line
                      x1={noteX + 9}
                      y1={noteY}
                      x2={noteX + 9}
                      y2={noteY - 30}
                      stroke={primaryColor}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />

                    {/* Note Solfege Badge */}
                    <g transform={`translate(${noteX}, ${noteY > 72 ? noteY + 19 : noteY - 34})`}>
                      <rect
                        x="-17"
                        y="-7.5"
                        width="34"
                        height="15"
                        rx="7.5"
                        fill={isSelected ? '#10B981' : '#2563EB'}
                        className="shadow-xs"
                      />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF">
                        {note.solfege}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 2. Bass Notes */}
              {defaultBassNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isHighlighted = highlightMidi === note.midiNote;
                const diatonicStep = getDiatonicStep(note.midiNote);
                const noteY = getBassY(diatonicStep, 196);

                const noteSpacing = 50;
                const noteX = 145 + idx * noteSpacing;
                const primaryColor = isSelected ? '#10B981' : isHighlighted ? '#F59E0B' : '#7C3AED';

                return (
                  <g
                    key={`gb-${note.id}`}
                    onClick={() => handleNoteItemClick(note)}
                    className="cursor-pointer group"
                  >
                    {/* Dynamic Ledger Lines */}
                    {renderLedgerLines(noteX, noteY, 196)}

                    {/* Note Head Ellipse */}
                    <ellipse
                      cx={noteX}
                      cy={noteY}
                      rx="11.5"
                      ry="8"
                      transform={`rotate(-22 ${noteX} ${noteY})`}
                      fill={primaryColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* Stem */}
                    <line
                      x1={noteX + 9}
                      y1={noteY}
                      x2={noteX + 9}
                      y2={noteY - 30}
                      stroke={primaryColor}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />

                    {/* Note Solfege Badge */}
                    <g transform={`translate(${noteX}, ${noteY > 232 ? noteY + 19 : noteY - 34})`}>
                      <rect
                        x="-17"
                        y="-7.5"
                        width="34"
                        height="15"
                        rx="7.5"
                        fill={isSelected ? '#10B981' : '#7C3AED'}
                        className="shadow-xs"
                      />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF">
                        {note.solfege}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ======================================================= */}
          {/* 2. ALTO CLEF SINGLE STAFF */}
          {/* ======================================================= */}
          {clef === 'alto' && (
            <g>
              <text x="52" y="24" fontSize="12" fontWeight="900" fill="#D97706" fontFamily="sans-serif">
                🎻 中音譜表 (Alto Clef / C 譜號) · 中提琴 (Viola) 必修
              </text>

              {[0, 1, 2, 3, 4].map((i) => {
                const y = 36 + i * 18;
                const lineNum = 5 - i;
                const isLine = highlightLine !== undefined ? highlightLine === lineNum : lineNum === 3;
                return (
                  <g key={`a-line-${i}`}>
                    <line
                      x1="45"
                      y1={y}
                      x2={staffWidth - 30}
                      y2={y}
                      stroke={isLine ? '#F59E0B' : '#334155'}
                      strokeWidth={isLine ? 3.5 : 1.8}
                    />
                    {isLine && (
                      <rect
                        x="45"
                        y={y - 8}
                        width={staffWidth - 75}
                        height="16"
                        fill="#FEF3C7"
                        opacity="0.3"
                      />
                    )}
                    {showLabels && (
                      <text x={staffWidth - 25} y={y + 4} fontSize="10" fontWeight="800" fill={isLine ? '#B45309' : '#64748B'}>
                        第{lineNum}線 {lineNum === 3 ? '(中央C Do線)' : ''}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Alto C-Clef Vector Glyph */}
              <AltoClefGlyph x={48} y={36} lineSpacing={18} color="#D97706" />

              {activeNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isC4 = note.midiNote === 60;
                const diatonicStep = getDiatonicStep(note.midiNote);
                const noteY = getAltoY(diatonicStep, 36);
                const noteSpacing = Math.min(52, (staffWidth - 190) / (activeNotes.length || 1));
                const noteX = 145 + idx * noteSpacing;
                const noteColor = isSelected ? '#10B981' : isC4 ? '#D97706' : '#0F172A';

                return (
                  <g key={note.id} onClick={() => handleNoteItemClick(note)} className="cursor-pointer group">
                    {renderLedgerLines(noteX, noteY, 36)}
                    <ellipse
                      cx={noteX}
                      cy={noteY}
                      rx="11.5"
                      ry="8"
                      transform={`rotate(-22 ${noteX} ${noteY})`}
                      fill={noteColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <line x1={noteX + 9} y1={noteY} x2={noteX + 9} y2={noteY - 30} stroke={noteColor} strokeWidth="2.4" strokeLinecap="round" />
                    <g transform={`translate(${noteX}, ${noteY > 72 ? noteY + 19 : noteY - 34})`}>
                      <rect x="-17" y="-7.5" width="34" height="15" rx="7.5" fill={isC4 ? '#D97706' : isSelected ? '#10B981' : '#1E293B'} />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF">{note.solfege}</text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ======================================================= */}
          {/* 3. TREBLE CLEF SINGLE STAFF */}
          {/* ======================================================= */}
          {clef === 'treble' && (
            <g>
              <text x="52" y="24" fontSize="12" fontWeight="900" fill="#2563EB" fontFamily="sans-serif">
                🎼 高音譜表 (Treble Staff / G 譜號)
              </text>

              {[0, 1, 2, 3, 4].map((i) => {
                const y = 36 + i * 18;
                const lineNum = 5 - i;
                const isLine = highlightLine !== undefined ? highlightLine === lineNum : lineNum === 2;
                return (
                  <g key={`t-line-${i}`}>
                    <line x1="45" y1={y} x2={staffWidth - 30} y2={y} stroke={isLine ? '#2563EB' : '#334155'} strokeWidth={isLine ? 3.5 : 1.8} />
                    {isLine && <rect x="45" y={y - 8} width={staffWidth - 75} height="16" fill="#DBEAFE" opacity="0.3" />}
                    {showLabels && (
                      <text x={staffWidth - 25} y={y + 4} fontSize="10" fontWeight="800" fill={isLine ? '#2563EB' : '#64748B'}>
                        第{lineNum}線 {lineNum === 2 ? '(G4 Sol線)' : ''}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Treble G-Clef Vector Glyph (Exact placement on Line 5 = 36) */}
              <TrebleClefGlyph x={48} y={36} lineSpacing={18} color="#2563EB" />

              {activeNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isG4 = note.midiNote === 67;
                const diatonicStep = getDiatonicStep(note.midiNote);
                // Correct formula: Line 5 is at 36. C4 is at 36 + 90 = 126. E4 (line 1) is at 108. G4 (line 2) is at 90.
                const noteY = getTrebleY(diatonicStep, 36);
                const noteSpacing = Math.min(52, (staffWidth - 190) / (activeNotes.length || 1));
                const noteX = 145 + idx * noteSpacing;
                const noteColor = isSelected ? '#10B981' : isG4 ? '#2563EB' : '#0F172A';

                return (
                  <g key={note.id} onClick={() => handleNoteItemClick(note)} className="cursor-pointer group">
                    {/* Dynamic Ledger Lines */}
                    {renderLedgerLines(noteX, noteY, 36)}

                    <ellipse
                      cx={noteX}
                      cy={noteY}
                      rx="11.5"
                      ry="8"
                      transform={`rotate(-22 ${noteX} ${noteY})`}
                      fill={noteColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />
                    <line x1={noteX + 9} y1={noteY} x2={noteX + 9} y2={noteY - 30} stroke={noteColor} strokeWidth="2.4" strokeLinecap="round" />
                    <g transform={`translate(${noteX}, ${noteY > 72 ? noteY + 19 : noteY - 34})`}>
                      <rect x="-17" y="-7.5" width="34" height="15" rx="7.5" fill={isG4 ? '#2563EB' : isSelected ? '#10B981' : '#1E293B'} />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF">{note.solfege}</text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ======================================================= */}
          {/* 4. BASS CLEF SINGLE STAFF */}
          {/* ======================================================= */}
          {clef === 'bass' && (
            <g>
              <text x="52" y="24" fontSize="12" fontWeight="900" fill="#7C3AED" fontFamily="sans-serif">
                🎵 低音譜表 (Bass Staff / F 譜號)
              </text>

              {[0, 1, 2, 3, 4].map((i) => {
                const y = 36 + i * 18;
                const lineNum = 5 - i;
                const isLine = highlightLine !== undefined ? highlightLine === lineNum : lineNum === 4;
                return (
                  <g key={`b-line-${i}`}>
                    <line x1="45" y1={y} x2={staffWidth - 30} y2={y} stroke={isLine ? '#7C3AED' : '#334155'} strokeWidth={isLine ? 3.5 : 1.8} />
                    {isLine && <rect x="45" y={y - 8} width={staffWidth - 75} height="16" fill="#EDE9FE" opacity="0.3" />}
                    {showLabels && (
                      <text x={staffWidth - 25} y={y + 4} fontSize="10" fontWeight="800" fill={isLine ? '#7C3AED' : '#64748B'}>
                        第{lineNum}線 {lineNum === 4 ? '(F3 Fa線)' : ''}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Bass F-Clef Vector Glyph (Exact placement on Line 5 = 36) */}
              <BassClefGlyph x={48} y={36} lineSpacing={18} color="#7C3AED" />

              {activeNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isF3 = note.midiNote === 53;
                const diatonicStep = getDiatonicStep(note.midiNote);
                // Correct formula: Line 5 is at 36. Line 4 (F3) is at 54. Line 1 (G2) is at 108. C4 is at 18.
                const noteY = getBassY(diatonicStep, 36);
                const noteSpacing = Math.min(52, (staffWidth - 190) / (activeNotes.length || 1));
                const noteX = 145 + idx * noteSpacing;
                const noteColor = isSelected ? '#10B981' : isF3 ? '#7C3AED' : '#0F172A';

                return (
                  <g key={note.id} onClick={() => handleNoteItemClick(note)} className="cursor-pointer group">
                    {/* Dynamic Ledger Lines */}
                    {renderLedgerLines(noteX, noteY, 36)}

                    <ellipse
                      cx={noteX}
                      cy={noteY}
                      rx="11.5"
                      ry="8"
                      transform={`rotate(-22 ${noteX} ${noteY})`}
                      fill={noteColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />
                    <line x1={noteX + 9} y1={noteY} x2={noteX + 9} y2={noteY - 30} stroke={noteColor} strokeWidth="2.4" strokeLinecap="round" />
                    <g transform={`translate(${noteX}, ${noteY > 72 ? noteY + 19 : noteY - 34})`}>
                      <rect x="-17" y="-7.5" width="34" height="15" rx="7.5" fill={isF3 ? '#7C3AED' : isSelected ? '#10B981' : '#1E293B'} />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF">{note.solfege}</text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Selected Note Inspector Banner */}
      {activeNoteInfo && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-md animate-fade-in">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => pianoSynth.playPianoNote(activeNoteInfo.midiNote, 0.9, 1.2)}
              className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-md transition active:scale-95 shrink-0"
              title="重聽音高"
            >
              ▶
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black text-slate-900">
                  音名：{activeNoteInfo.noteName} ({activeNoteInfo.solfege})
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-200 text-amber-950 border border-amber-300">
                  {activeNoteInfo.positionLabel}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-0.5 font-bold">
                {activeNoteInfo.instrument ? `使用樂器：${activeNoteInfo.instrument}` : activeNoteInfo.hand === 'left' ? '鋼琴常由左手演奏 🖐️' : '鋼琴常由右手演奏 🖐️'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-mono font-black bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 text-amber-900 shadow-xs">
            MIDI #{activeNoteInfo.midiNote}
          </div>
        </div>
      )}

      {/* Synchronized Mini Piano Keys Strip for direct pitch visual alignment */}
      {showPianoKeys && (
        <div className="bg-white border-2 border-amber-200 rounded-3xl p-4 flex flex-col gap-3 text-left shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 font-bold flex items-center gap-2">
              <span className="text-lg">🎹</span>
              <span>五線譜與鋼琴鍵盤即時對照（點擊琴鍵或上方音符同步亮起）：</span>
            </span>
            {activeMidi && (
              <span className="text-amber-900 font-black bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300 text-xs">
                當前鎖定：MIDI #{activeMidi}
              </span>
            )}
          </div>

          <div className="relative flex justify-center items-start overflow-x-auto py-1">
            {/* White keys (C3 to B4) */}
            <div className="flex relative">
              {[
                { midi: 48, name: 'C3' },
                { midi: 50, name: 'D3' },
                { midi: 52, name: 'E3' },
                { midi: 53, name: 'F3' },
                { midi: 55, name: 'G3' },
                { midi: 57, name: 'A3' },
                { midi: 59, name: 'B3' },
                { midi: 60, name: 'C4 (中央C)' },
                { midi: 62, name: 'D4' },
                { midi: 64, name: 'E4' },
                { midi: 65, name: 'F4' },
                { midi: 67, name: 'G4' },
                { midi: 69, name: 'A4' },
                { midi: 71, name: 'B4' },
                { midi: 72, name: 'C5' },
              ].map((key) => {
                const isActive = activeMidi === key.midi;
                const isCenterC = key.midi === 60;

                return (
                  <button
                    key={key.midi}
                    onClick={() => {
                      setInternalSelectedMidi(key.midi);
                      pianoSynth.playPianoNote(key.midi);
                    }}
                    className={`w-10 md:w-12 h-32 rounded-b-2xl border-2 border-slate-300 flex flex-col justify-end items-center pb-2.5 text-xs md:text-sm font-black transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-xl scale-105 z-10 border-amber-500'
                        : isCenterC
                        ? 'bg-amber-100 text-amber-950 font-black border-amber-400'
                        : 'bg-white text-slate-800 hover:bg-amber-50'
                    }`}
                  >
                    <span>{key.name.split(' ')[0]}</span>
                    {isCenterC && <span className="text-[10px] font-black text-amber-800">中央C</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
