import React, { useState } from 'react';
import * as d3 from 'd3';
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
  const staffWidth = 720;

  // Built-in educational note collections
  const defaultTrebleNotes: MusicStaffItem[] = [
    { id: 't-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '下加 1 線 (中央C)', lineOrSpace: 'ledger', indexNum: 0, clef: 'treble', hand: 'right' },
    { id: 't-d4', noteName: 'D4', solfege: 'Re', midiNote: 62, positionLabel: '下加 1 間', lineOrSpace: 'space', indexNum: 0, clef: 'treble', hand: 'right' },
    { id: 't-e4', noteName: 'E4', solfege: 'Mi', midiNote: 64, positionLabel: '第 1 線', lineOrSpace: 'line', indexNum: 1, clef: 'treble', hand: 'right' },
    { id: 't-f4', noteName: 'F4', solfege: 'Fa', midiNote: 65, positionLabel: '第 1 間', lineOrSpace: 'space', indexNum: 1, clef: 'treble', hand: 'right' },
    { id: 't-g4', noteName: 'G4', solfege: 'Sol', midiNote: 67, positionLabel: '第 2 線 (G譜號旋轉中心)', lineOrSpace: 'line', indexNum: 2, clef: 'treble', hand: 'right' },
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
    { id: 'b-f3', noteName: 'F3', solfege: 'Fa', midiNote: 53, positionLabel: '第 4 線 (F譜號雙點中心)', lineOrSpace: 'line', indexNum: 4, clef: 'bass', hand: 'left' },
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
    { id: 'a-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '第 3 線 (🌟C譜號凹口指引：中央C！)', lineOrSpace: 'line', indexNum: 3, clef: 'alto', instrument: '中提琴 Viola' },
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
    { id: 'tn-c4', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '第 4 線 (🌟C譜號凹口指引：中央C！)', lineOrSpace: 'line', indexNum: 4, clef: 'tenor', instrument: '大提琴/長號' },
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

  // Coordinates helper for Treble staff (Line 5=top, Line 1=bottom)
  const getTrebleY = (diatonicStepFromC4: number, topY = 40): number => {
    // C4 (step 0) -> Line 1 (E4, step 2) is at topY + 4 * 18 = topY + 72
    // C4 is 2 steps below E4 -> topY + 72 + 2 * 9 = topY + 90
    return topY + 90 - diatonicStepFromC4 * 9;
  };

  // Coordinates helper for Bass staff
  const getBassY = (diatonicStepFromC4: number, topY = 170): number => {
    // C4 (step 0) is topY - 18 = ledger line above Line 5 (A3)
    return topY - 18 - diatonicStepFromC4 * 9;
  };

  // Coordinates helper for Alto staff (Line 3 is C4, step 0!)
  const getAltoY = (diatonicStepFromC4: number, topY = 40): number => {
    // Line 3 is topY + 2 * 18 = topY + 36. C4 is exactly on Line 3.
    return topY + 36 - diatonicStepFromC4 * 9;
  };

  // Convert MIDI note to diatonic step from C4 (0 = C4, 1 = D4, 2 = E4, -1 = B3, etc.)
  const getDiatonicStep = (midi: number): number => {
    const semitonesFromC = (midi % 12 + 12) % 12;
    const octave = Math.floor(midi / 12) - 1; // 4 for C4 (60)
    const diatonicInOctave = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][semitonesFromC];
    return (octave - 4) * 7 + diatonicInOctave;
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
          viewBox={clef === 'grand' ? `0 0 ${staffWidth} 300` : `0 0 ${staffWidth} 175`}
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
              <text x="52" y="24" fontSize="11" fontWeight="900" fill="#2563EB" fontFamily="sans-serif">
                🎼 高音譜表 (右手旋律區 · Treble Staff)
              </text>
              {/* Lower Bass Staff Header Text */}
              <text x="52" y="162" fontSize="11" fontWeight="900" fill="#7C3AED" fontFamily="sans-serif">
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
                        第{lineNum}線
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Treble 4 spaces highlight band */}
              {highlightSpace && (
                <rect
                  x="42"
                  y={108 - highlightSpace * 18}
                  width={staffWidth - 67}
                  height="18"
                  fill="#DBEAFE"
                  opacity="0.45"
                  rx="4"
                />
              )}

              {/* Treble G-Clef Vector Glyph */}
              <TrebleClefGlyph x={48} y={24} scale={0.88} color="#1E293B" />

              {/* Central Middle C Floating Bridge (Y = 138) */}
              <g transform="translate(0, 138)">
                <line x1="160" y1="0" x2={staffWidth - 120} y2="0" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                <rect x="220" y="-12" width="280" height="24" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="360" y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B45309" fontFamily="sans-serif">
                  🌟 中央 C (C4) 彩虹橋：高音譜下加1線 = 低音譜上加1線
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
                        第{lineNum}線
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Bass 4 spaces highlight band */}
              {highlightSpace && (
                <rect
                  x="42"
                  y={268 - highlightSpace * 18}
                  width={staffWidth - 67}
                  height="18"
                  fill="#EDE9FE"
                  opacity="0.45"
                  rx="4"
                />
              )}


              {/* Bass F-Clef Vector Glyph */}
              <BassClefGlyph x={50} y={196} scale={0.95} color="#1E293B" />

              {/* Interactive Notes on Grand Staff */}
              {activeNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isHighlighted = highlightMidi === note.midiNote;
                const diatonicStep = getDiatonicStep(note.midiNote);

                // Note Y coordinate: choose treble or bass calculation
                const isTrebleNote = note.midiNote >= 60;
                const noteY = isTrebleNote
                  ? getTrebleY(diatonicStep, 20)
                  : getBassY(diatonicStep, 178);

                const noteSpacing = 52;
                const noteX = 140 + (idx % 11) * noteSpacing;

                const primaryColor = isSelected ? '#10B981' : isHighlighted ? '#F59E0B' : isTrebleNote ? '#2563EB' : '#7C3AED';

                return (
                  <g
                    key={note.id}
                    onClick={() => handleNoteItemClick(note)}
                    className="cursor-pointer group transition-all duration-200"
                  >
                    {/* Middle C Ledger Line */}
                    {note.midiNote === 60 && (
                      <line x1={noteX - 16} y1={noteY} x2={noteX + 16} y2={noteY} stroke="#B45309" strokeWidth="2.5" />
                    )}

                    {/* Aura on select */}
                    {(isSelected || isHighlighted) && (
                      <circle cx={noteX} cy={noteY} r="18" fill={isSelected ? '#DCFCE7' : '#FEF3C7'} opacity="0.8" filter="url(#musicStaffGlow)" />
                    )}

                    {/* Note Head */}
                    <ellipse
                      cx={noteX}
                      cy={noteY}
                      rx="10.5"
                      ry="7.5"
                      transform={`rotate(-22 ${noteX} ${noteY})`}
                      fill={isSelected ? '#10B981' : primaryColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />

                    {/* Note Stem */}
                    <line
                      x1={noteX + 9}
                      y1={noteY}
                      x2={noteX + 9}
                      y2={noteY - 32}
                      stroke={primaryColor}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />

                    {/* Note Pitch Badge */}
                    <g transform={`translate(${noteX}, ${noteY > 150 ? noteY + 22 : noteY - 38})`}>
                      <rect x="-17" y="-8" width="34" height="16" rx="8" fill={isSelected ? '#10B981' : '#1E293B'} />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
                        {note.solfege}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ======================================================= */}
          {/* 2. ALTO CLEF (中音譜表: C 譜號中心缺口精準鎖定第 3 線！) */}
          {/* ======================================================= */}
          {clef === 'alto' && (
            <g>
              {/* Header Title */}
              <text x="52" y="24" fontSize="12" fontWeight="900" fill="#D97706" fontFamily="sans-serif">
                🎻 中音譜表 (Alto Clef / C 譜號) · 中提琴 (Viola) 必修
              </text>

              {/* 5 Lines (Y = 36, 54, 72, 90, 108) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 36 + i * 18;
                const lineNum = 5 - i;
                const isLine3 = lineNum === 3;
                return (
                  <g key={`alto-line-${i}`}>
                    <line
                      x1="45"
                      y1={y}
                      x2={staffWidth - 30}
                      y2={y}
                      stroke={isLine3 ? '#D97706' : '#334155'}
                      strokeWidth={isLine3 ? 3.5 : 1.8}
                    />
                    {isLine3 && (
                      <rect x="45" y={y - 8} width={staffWidth - 75} height="16" fill="#FEF3C7" opacity="0.25" />
                    )}
                    {showLabels && (
                      <text x={staffWidth - 25} y={y + 4} fontSize="10" fontWeight="800" fill={isLine3 ? '#D97706' : '#64748B'}>
                        第{lineNum}線 {isLine3 ? '(C4 中央C)' : ''}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* C-Clef SVG Glyph with Center Notch on Line 3 (Y = 72) */}
              <g transform="translate(60, 36)">
                <rect x="8" y="0" width="3.5" height="72" fill="#1E293B" />
                <rect x="14" y="0" width="6" height="72" fill="#1E293B" />
                {/* Upper arch */}
                <path d="M 20,0 C 34,0 44,14 44,24 C 44,32 36,36 28,36 C 36,36 44,40 44,48 C 44,58 34,72 20,72" fill="none" stroke="#1E293B" strokeWidth="5" />
                {/* Center Notch pointing directly at Line 3 (Y = 36) */}
                <polygon points="26,36 34,31 34,41" fill="#F59E0B" filter="url(#goldStarGlow)" />
              </g>

              {/* Center Notch Pointer Banner */}
              <g transform="translate(120, 26)">
                <rect x="0" y="0" width="220" height="20" rx="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="110" y="14" textAnchor="middle" fontSize="10" fontWeight="900" fill="#B45309">
                  👈 C 譜號凹口指引：第 3 線就是中央 C！
                </text>
              </g>

              {/* Alto Notes */}
              {activeNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isC4 = note.midiNote === 60;
                const diatonicStep = getDiatonicStep(note.midiNote);
                const noteY = getAltoY(diatonicStep, 36);
                const noteX = 175 + idx * 56;

                const noteColor = isSelected ? '#10B981' : isC4 ? '#D97706' : '#2563EB';

                return (
                  <g
                    key={note.id}
                    onClick={() => handleNoteItemClick(note)}
                    className="cursor-pointer group transition-all duration-200"
                  >
                    {isC4 && (
                      <circle cx={noteX} cy={noteY} r="18" fill="#FEF3C7" opacity="0.85" filter="url(#goldStarGlow)" />
                    )}

                    <ellipse
                      cx={noteX}
                      cy={noteY}
                      rx="11"
                      ry="8"
                      transform={`rotate(-22 ${noteX} ${noteY})`}
                      fill={noteColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />

                    <line x1={noteX + 9} y1={noteY} x2={noteX + 9} y2={noteY - 32} stroke={noteColor} strokeWidth="2.5" strokeLinecap="round" />

                    <g transform={`translate(${noteX}, ${noteY > 80 ? noteY + 20 : noteY - 38})`}>
                      <rect x="-18" y="-8" width="36" height="16" rx="8" fill={isC4 ? '#F59E0B' : isSelected ? '#10B981' : '#1E293B'} />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
                        {note.noteName}
                      </text>
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

              {/* Treble space highlight band */}
              {highlightSpace && (
                <rect
                  x="45"
                  y={108 - highlightSpace * 18}
                  width={staffWidth - 75}
                  height="18"
                  fill="#DBEAFE"
                  opacity="0.45"
                  rx="4"
                />
              )}

              {/* Treble G-Clef Vector Glyph */}
              <TrebleClefGlyph x={48} y={24} scale={0.88} color="#2563EB" />

              {activeNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isG4 = note.midiNote === 67;
                const isC4 = note.midiNote === 60;
                const diatonicStep = getDiatonicStep(note.midiNote);
                const noteY = getTrebleY(diatonicStep, 18);
                const noteX = 145 + idx * 48;
                const noteColor = isSelected ? '#10B981' : isG4 ? '#2563EB' : '#0F172A';

                return (
                  <g key={note.id} onClick={() => handleNoteItemClick(note)} className="cursor-pointer group">
                    {isC4 && <line x1={noteX - 16} y1={noteY} x2={noteX + 16} y2={noteY} stroke="#334155" strokeWidth="2.5" />}
                    <ellipse cx={noteX} cy={noteY} rx="11" ry="8" transform={`rotate(-22 ${noteX} ${noteY})`} fill={noteColor} stroke="#FFFFFF" strokeWidth="1.5" />
                    <line x1={noteX + 9} y1={noteY} x2={noteX + 9} y2={noteY - 32} stroke={noteColor} strokeWidth="2.5" strokeLinecap="round" />
                    <g transform={`translate(${noteX}, ${noteY > 80 ? noteY + 20 : noteY - 38})`}>
                      <rect x="-18" y="-8" width="36" height="16" rx="8" fill={isG4 ? '#2563EB' : isSelected ? '#10B981' : '#1E293B'} />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF">{note.solfege}</text>
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

              {/* Bass space highlight band */}
              {highlightSpace && (
                <rect
                  x="45"
                  y={108 - highlightSpace * 18}
                  width={staffWidth - 75}
                  height="18"
                  fill="#EDE9FE"
                  opacity="0.45"
                  rx="4"
                />
              )}


              {/* Bass F-Clef Vector Glyph */}
              <BassClefGlyph x={50} y={36} scale={0.95} color="#7C3AED" />

              {activeNotes.map((note, idx) => {
                const isSelected = activeMidi === note.midiNote;
                const isF3 = note.midiNote === 53;
                const isC4 = note.midiNote === 60;
                const diatonicStep = getDiatonicStep(note.midiNote);
                const noteY = getBassY(diatonicStep, 36);
                const noteX = 145 + idx * 48;
                const noteColor = isSelected ? '#10B981' : isF3 ? '#7C3AED' : '#0F172A';

                return (
                  <g key={note.id} onClick={() => handleNoteItemClick(note)} className="cursor-pointer group">
                    {isC4 && <line x1={noteX - 16} y1={noteY} x2={noteX + 16} y2={noteY} stroke="#334155" strokeWidth="2.5" />}
                    <ellipse cx={noteX} cy={noteY} rx="11" ry="8" transform={`rotate(-22 ${noteX} ${noteY})`} fill={noteColor} stroke="#FFFFFF" strokeWidth="1.5" />
                    <line x1={noteX + 9} y1={noteY} x2={noteX + 9} y2={noteY - 32} stroke={noteColor} strokeWidth="2.5" strokeLinecap="round" />
                    <g transform={`translate(${noteX}, ${noteY > 80 ? noteY + 20 : noteY - 38})`}>
                      <rect x="-18" y="-8" width="36" height="16" rx="8" fill={isF3 ? '#7C3AED' : isSelected ? '#10B981' : '#1E293B'} />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF">{note.solfege}</text>
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
            {/* 14 White keys (C3 to B4) */}
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
