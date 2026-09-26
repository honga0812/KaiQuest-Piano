import React from 'react';
import { TargetNote } from '../../types/piano';
import { getStaffDiatonicStep } from '../../utils/musicMath';

interface MusicStaffProps {
  notes: TargetNote[];
  currentIndex: number;
  isNoteCorrect: boolean;
  isNoteWobbly: boolean;
  timeSignature?: [number, number];
  className?: string;
}

export const MusicStaff: React.FC<MusicStaffProps> = ({
  notes,
  currentIndex,
  isNoteCorrect,
  isNoteWobbly,
  timeSignature = [4, 4],
  className = '',
}) => {
  // Staff geometry - Enlarged for tablets and children's visual clarity
  const lineSpacing = 18; // 18px between staff lines
  const staffTopY = 56;
  // 5 lines at Y:
  // Line 5 (F5) = 56
  // Line 4 (D5) = 74
  // Line 3 (B4) = 92 (Middle line)
  // Line 2 (G4) = 110
  // Line 1 (E4) = 128
  // Middle C (C4) is 1 ledger line below Line 1: Y = 128 + 18 = 146

  const calculateNoteY = (midiNote: number): number => {
    const diatonicStep = getStaffDiatonicStep(midiNote);
    // C4 (step 0) -> Y = 146
    // Each diatonic step moves Y by (lineSpacing / 2) = 9px
    return 146 - diatonicStep * (lineSpacing / 2);
  };

  // Group notes into measures based on note.measureIndex or calculated beats
  const beatsPerMeasure = timeSignature[0] || 4;
  let accumulatedBeats = 0;
  let autoMeasureIndex = 0;

  interface EnrichedNoteItem {
    note: TargetNote;
    globalIndex: number;
    measureIdx: number;
    durationBeats: number;
    beatInMeasure: number;
  }

  const enrichedNotes: EnrichedNoteItem[] = notes.map((note, globalIndex) => {
    const duration = note.durationBeats || 1;
    let mIdx = note.measureIndex;
    let currentBeatInMeasure = accumulatedBeats % beatsPerMeasure;

    if (mIdx === undefined) {
      mIdx = autoMeasureIndex;
      accumulatedBeats += duration;
      if (accumulatedBeats >= beatsPerMeasure * (autoMeasureIndex + 1)) {
        autoMeasureIndex++;
      }
    }

    return {
      note,
      globalIndex,
      measureIdx: mIdx,
      durationBeats: duration,
      beatInMeasure: currentBeatInMeasure + 1,
    };
  });

  // Calculate sliding focus window for tablet screen responsiveness
  // A tablet viewport shows 6-8 notes comfortably without squishing or cutting off
  const MAX_VISIBLE_NOTES = 8;
  const totalNotesCount = enrichedNotes.length;

  let windowStart = 0;
  if (totalNotesCount > MAX_VISIBLE_NOTES) {
    windowStart = Math.max(0, Math.min(totalNotesCount - MAX_VISIBLE_NOTES, currentIndex - 2));
  }
  const windowEnd = Math.min(totalNotesCount, windowStart + MAX_VISIBLE_NOTES);
  const visibleItems = enrichedNotes.slice(windowStart, windowEnd);

  // Active measure highlight
  const currentItem = enrichedNotes[currentIndex];
  const activeMeasureIdx = currentItem ? currentItem.measureIdx : 0;

  // Responsive SVG canvas dimensions
  const svgWidth = 760;
  const leftMargin = 120; // Clef + Time signature
  const rightMargin = 40;
  const availableWidth = svgWidth - leftMargin - rightMargin;
  const noteSpacing = visibleItems.length > 0 ? availableWidth / visibleItems.length : 80;

  // Helper for all ledger lines
  const getLedgerLinesY = (noteY: number): number[] => {
    const lines: number[] = [];
    // Below Line 1 (Y=128): ledger lines at 146, 164, 182...
    if (noteY >= 142) {
      for (let ly = 146; ly <= noteY + 5; ly += 18) {
        lines.push(ly);
      }
    }
    // Above Line 5 (Y=56): ledger lines at 38, 20, 2...
    if (noteY <= 42) {
      for (let ly = 38; ly >= noteY - 5; ly -= 18) {
        lines.push(ly);
      }
    }
    return lines;
  };

  return (
    <div className={`w-full select-none flex flex-col gap-2 ${className}`}>
      {/* Visual Duration & Tablet Window Navigator Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-amber-50/95 border-2 border-amber-300 rounded-2xl text-xs md:text-sm shadow-sm">
        {/* Note Duration Badges - iOS & iPad friendly (no unicode SMP tofu blocks) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-amber-950 font-black flex items-center gap-1.5">
            <span>🎼</span>
            <span>五線譜節奏符號:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-black">
            <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className="w-3.5 h-2.5 rounded-full border-2 border-amber-600 bg-white inline-block -rotate-12" />
              <span>全音符 (空心4拍)</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className="flex items-center -rotate-12">
                <span className="w-3.5 h-2.5 rounded-full border-2 border-amber-600 bg-white inline-block" />
                <span className="w-0.5 h-3.5 bg-amber-800 inline-block -ml-0.5 -mt-2" />
              </span>
              <span>二分音符 (2拍)</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className="flex items-center -rotate-12">
                <span className="w-3.5 h-2.5 rounded-full bg-slate-900 inline-block" />
                <span className="w-0.5 h-3.5 bg-slate-900 inline-block -ml-0.5 -mt-2" />
              </span>
              <span>四分音符 (1拍)</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className="flex items-center -rotate-12">
                <span className="w-3 h-2 rounded-full bg-slate-900 inline-block" />
                <span className="w-0.5 h-3 bg-slate-900 inline-block -ml-0.5 -mt-2" />
                <span className="w-1.5 h-1.5 rounded-tr-full border-t border-r border-slate-900 -ml-0.5 -mt-2" />
              </span>
              <span>八分音符 (½拍)</span>
            </span>
          </div>
        </div>

        {/* Window Range & Time Signature Info */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
          <span>拍號 {timeSignature[0]}/{timeSignature[1]} 拍</span>
          {totalNotesCount > MAX_VISIBLE_NOTES && (
            <span>
              · 視窗 {windowStart + 1}~{windowEnd} / 共 {totalNotesCount} 音
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas - Responsive fluid scaling for any tablet without overflow clipping */}
      <div className="relative w-full bg-gradient-to-b from-amber-50/90 via-white to-amber-50/90 rounded-3xl shadow-md border-3 border-amber-300 flex items-center justify-center p-1 sm:p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} 220`}
          className="w-full h-auto max-h-[250px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="staffNoteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2563EB" floodOpacity="0.4" />
            </filter>
            <filter id="staffCorrectGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10B981" floodOpacity="0.9" />
            </filter>
            <filter id="targetPillGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 5 Staff Lines - Bold, clear slate-700 */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = staffTopY + i * lineSpacing;
            return (
              <line
                key={`line-${i}`}
                x1="20"
                y1={y}
                x2={svgWidth - 20}
                y2={y}
                stroke="#334155"
                strokeWidth="2.2"
              />
            );
          })}

          {/* Treble Clef Graphic (High resolution G Clef SVG) */}
          <g transform="translate(32, 28) scale(1.05)">
            <path
              d="M 28 82 C 28 92, 18 100, 8 100 C -2 100, -8 92, -8 82 C -8 72, 4 64, 18 64 C 36 64, 46 78, 46 95 C 46 116, 26 135, -2 135 C -28 135, -44 114, -44 85 C -44 50, -18 20, 12 -15 L 12 -45 C 12 -58, 2 -68, -8 -68 C -18 -68, -24 -60, -22 -50 L -22 -30"
              fill="none"
              stroke="#0F172A"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="82" r="6.5" fill="#0F172A" />
          </g>

          {/* Time Signature (拍號 4/4 or 3/4) */}
          <g transform="translate(90, 8)">
            <text x="0" y="84" fontSize="32" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
              {timeSignature[0]}
            </text>
            <text x="0" y="118" fontSize="32" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
              {timeSignature[1]}
            </text>
          </g>

          {/* Render Visible Notes */}
          {visibleItems.map((item, relIndex) => {
            const { note, globalIndex, durationBeats, measureIdx } = item;
            const isTarget = globalIndex === currentIndex;
            const isPast = globalIndex < currentIndex;
            const noteX = leftMargin + relIndex * noteSpacing + noteSpacing / 2;
            const noteY = calculateNoteY(note.midiNote);

            // Ledger Lines
            const ledgerYList = getLedgerLinesY(noteY);

            // Accurate Duration Typology
            const isWholeNote = durationBeats >= 3.5;
            const isDottedHalf = durationBeats >= 2.5 && durationBeats < 3.5;
            const isHalfNote = durationBeats >= 1.75 && durationBeats < 2.5;
            const isDottedQuarter = durationBeats >= 1.25 && durationBeats < 1.75;
            const isSixteenthNote = durationBeats <= 0.35;
            const isEighthNote = !isSixteenthNote && durationBeats <= 0.75;

            const isHollow = isWholeNote || isDottedHalf || isHalfNote;
            const hasStem = !isWholeNote;
            const hasDot = isDottedHalf || isDottedQuarter;

            // Accidentals check (# or b)
            const isSharp = note.noteName.includes('#');
            const isFlat = note.noteName.includes('b');

            // Stem direction:
            // Notes below middle line B4 (Y > 92): stem points UP on right side (+11)
            // Notes at or above middle line B4 (Y <= 92): stem points DOWN on left side (-11)
            const stemPointsUp = noteY > 92;
            const stemX = stemPointsUp ? noteX + 11 : noteX - 11;
            const stemStartY = noteY;
            const stemEndY = stemPointsUp ? noteY - 42 : noteY + 42;

            // Finger number position: placed cleanly at Y=172 (below) or Y=34 (above) so it NEVER clashes with staff lines!
            const fingerY = noteY > 92 ? 172 : 34;

            // Colors
            const primaryColor = isPast
              ? '#94A3B8'
              : isTarget
              ? isNoteCorrect
                ? '#10B981'
                : '#2563EB'
              : '#0F172A';

            return (
              <g
                key={`staff-note-${note.id}-${globalIndex}`}
                className={`transition-all duration-200 ${
                  isTarget && isNoteWobbly ? 'animate-wiggle' : ''
                }`}
              >
                {/* Target Column Highlight Pill */}
                {isTarget && (
                  <g>
                    <rect
                      x={noteX - 22}
                      y={20}
                      width={44}
                      height={180}
                      rx={22}
                      fill={isNoteCorrect ? '#DCFCE7' : '#EFF6FF'}
                      stroke={isNoteCorrect ? '#10B981' : '#3B82F6'}
                      strokeWidth="2.5"
                      opacity={0.88}
                      filter="url(#targetPillGlow)"
                    />
                    {/* Bouncing Pointer Arrow */}
                    <g transform={`translate(${noteX}, 16)`} className="animate-bounce">
                      <polygon
                        points="0,8 -8,-2 8,-2"
                        fill={isNoteCorrect ? '#059669' : '#2563EB'}
                      />
                    </g>
                  </g>
                )}

                {/* Ledger Lines */}
                {ledgerYList.map((ly) => (
                  <line
                    key={`ledger-${note.id}-${ly}`}
                    x1={noteX - 18}
                    y1={ly}
                    x2={noteX + 18}
                    y2={ly}
                    stroke="#334155"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                ))}

                {/* Sharp Accidental ♯ in front of notehead */}
                {isSharp && (
                  <g transform={`translate(${noteX - 18}, ${noteY})`}>
                    <line x1="-3" y1="-10" x2="-3" y2="10" stroke={primaryColor} strokeWidth="1.6" />
                    <line x1="3" y1="-10" x2="3" y2="10" stroke={primaryColor} strokeWidth="1.6" />
                    <line x1="-7" y1="-2" x2="7" y2="-5" stroke={primaryColor} strokeWidth="2.6" strokeLinecap="round" />
                    <line x1="-7" y1="4" x2="7" y2="1" stroke={primaryColor} strokeWidth="2.6" strokeLinecap="round" />
                  </g>
                )}

                {/* Flat Accidental ♭ in front of notehead */}
                {isFlat && (
                  <g transform={`translate(${noteX - 18}, ${noteY})`}>
                    <line x1="-4" y1="-12" x2="-4" y2="8" stroke={primaryColor} strokeWidth="2" />
                    <path d="M -4 0 C 2 -4, 4 4, -4 8" fill="none" stroke={primaryColor} strokeWidth="2.4" />
                  </g>
                )}

                {/* Note Head - Enlarged oval for tablet visual clarity */}
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx={isWholeNote ? '13.5' : '12'}
                  ry={isWholeNote ? '9.5' : '8.5'}
                  transform={`rotate(-22 ${noteX} ${noteY})`}
                  fill={
                    isHollow
                      ? isTarget
                        ? isNoteCorrect
                          ? '#D1FAE5'
                          : '#DBEAFE'
                        : '#FFFFFF'
                      : primaryColor
                  }
                  stroke={primaryColor}
                  strokeWidth={isHollow ? (isWholeNote ? '4.2' : '3.6') : '1.5'}
                  filter={isTarget ? (isNoteCorrect ? 'url(#staffCorrectGlow)' : 'url(#staffNoteGlow)') : undefined}
                />

                {/* Dot for Dotted Notes */}
                {hasDot && (
                  <circle
                    cx={noteX + 17}
                    cy={noteY - 2}
                    r="4"
                    fill={isTarget ? (isNoteCorrect ? '#10B981' : '#2563EB') : '#0F172A'}
                  />
                )}

                {/* Note Stem (符幹) */}
                {hasStem && (
                  <line
                    x1={stemX}
                    y1={stemStartY}
                    x2={stemX}
                    y2={stemEndY}
                    stroke={primaryColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Eighth Note Flag (八分符尾) */}
                {isEighthNote && (
                  <path
                    d={
                      stemPointsUp
                        ? `M ${stemX} ${stemEndY} Q ${stemX + 14} ${stemEndY + 12} ${stemX + 12} ${stemEndY + 26} Q ${stemX + 6} ${stemEndY + 16} ${stemX} ${stemEndY + 12}`
                        : `M ${stemX} ${stemEndY} Q ${stemX + 14} ${stemEndY - 12} ${stemX + 12} ${stemEndY - 26} Q ${stemX + 6} ${stemEndY - 16} ${stemX} ${stemEndY - 12}`
                    }
                    fill={primaryColor}
                  />
                )}

                {/* Sixteenth Note Flags (十六分雙符尾) */}
                {isSixteenthNote && (
                  <g>
                    <path
                      d={
                        stemPointsUp
                          ? `M ${stemX} ${stemEndY} Q ${stemX + 14} ${stemEndY + 12} ${stemX + 12} ${stemEndY + 26} Q ${stemX + 6} ${stemEndY + 16} ${stemX} ${stemEndY + 12}`
                          : `M ${stemX} ${stemEndY} Q ${stemX + 14} ${stemEndY - 12} ${stemX + 12} ${stemEndY - 26} Q ${stemX + 6} ${stemEndY - 16} ${stemX} ${stemEndY - 12}`
                      }
                      fill={primaryColor}
                    />
                    <path
                      d={
                        stemPointsUp
                          ? `M ${stemX} ${stemEndY + 8} Q ${stemX + 14} ${stemEndY + 20} ${stemX + 12} ${stemEndY + 34} Q ${stemX + 6} ${stemEndY + 24} ${stemX} ${stemEndY + 20}`
                          : `M ${stemX} ${stemEndY - 8} Q ${stemX + 14} ${stemEndY - 20} ${stemX + 12} ${stemEndY - 34} Q ${stemX + 6} ${stemEndY - 24} ${stemX} ${stemEndY - 20}`
                      }
                      fill={primaryColor}
                    />
                  </g>
                )}

                {/* Finger Number Tag - Placed cleanly in non-interfering zone */}
                <g transform={`translate(${noteX}, ${fingerY})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="10.5"
                    fill={isTarget ? '#2563EB' : '#FFFFFF'}
                    stroke={isTarget ? '#1D4ED8' : '#CBD5E1'}
                    strokeWidth="2"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.12))"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={isTarget ? '#FFFFFF' : '#1E293B'}
                  >
                    {note.fingerNumber}
                  </text>
                </g>

                {/* Solfege / Lyric Under Note - Large typography for children */}
                <text
                  x={noteX}
                  y={staffTopY + 4 * lineSpacing + 42}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="900"
                  fontFamily="sans-serif"
                  fill={isTarget ? (isNoteCorrect ? '#059669' : '#1D4ED8') : '#0F172A'}
                >
                  {note.lyrics || note.solfege}
                </text>

                {/* Secondary label: Note Name & Numbered (e.g. C4 · 1) */}
                <text
                  x={noteX}
                  y={staffTopY + 4 * lineSpacing + 58}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="800"
                  fontFamily="sans-serif"
                  fill={isTarget ? '#2563EB' : '#64748B'}
                >
                  {note.noteName} ({note.numbered})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
