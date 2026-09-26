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
  const lineSpacing = 18; // Spacious 18px between staff lines
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

  // Group notes by measure
  const notesByMeasure: { measureIndex: number; notes: EnrichedNoteItem[] }[] = [];
  enrichedNotes.forEach((item) => {
    let group = notesByMeasure.find((g) => g.measureIndex === item.measureIdx);
    if (!group) {
      group = { measureIndex: item.measureIdx, notes: [] };
      notesByMeasure.push(group);
    }
    group.notes.push(item);
  });

  // Active measure highlight
  const currentItem = enrichedNotes[currentIndex];
  const activeMeasureIdx = currentItem ? currentItem.measureIdx : 0;

  // Calculate layout geometry
  const leftMargin = 125; // Clef + Time signature + legend space
  const noteSpacing = Math.max(72, Math.min(105, 820 / Math.max(1, notes.length)));
  const totalContentWidth = Math.max(860, leftMargin + notes.length * noteSpacing + 120);

  return (
    <div className={`w-full overflow-x-auto select-none py-1 scrollbar-thin ${className}`}>
      {/* Visual Duration Cheat-Sheet Pill Header for Children */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 mb-1.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-amber-800 font-black flex items-center gap-1 text-xs">
            <span>🎼</span>
            <span>五線譜音符與小節說明:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="px-2 py-0.5 rounded-full bg-white border border-amber-300 text-slate-800 flex items-center gap-1">
              <span className="text-base leading-none">𝅝</span> 全音符 (空心無幹, 4拍)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-amber-300 text-slate-800 flex items-center gap-1">
              <span className="text-base leading-none">𝅗𝅥</span> 二分音符 (空心有幹, 2拍)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-amber-300 text-slate-800 flex items-center gap-1">
              <span className="text-base leading-none">𝅘𝅥</span> 四分音符 (實心有幹, 1拍)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-amber-300 text-slate-800 flex items-center gap-1">
              <span className="text-base leading-none">𝅘𝅥𝅮</span> 八分音符 (實心單尾, ½拍)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-amber-300 text-slate-800 flex items-center gap-1">
              <span className="text-base leading-none">𝅘𝅥𝅯</span> 十六分音符 (實心雙尾, ¼拍)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
          <span>拍號：{timeSignature[0]}/{timeSignature[1]} 拍</span>
          <span>·</span>
          <span>每小節滿 {timeSignature[0]} 拍劃一條小節線</span>
        </div>
      </div>

      <div className="relative min-w-[800px] h-[230px] bg-gradient-to-b from-amber-50/95 via-white to-amber-50/90 rounded-3xl shadow-lg border-2 border-amber-300/90 flex items-center px-4 overflow-hidden">
        <svg viewBox={`0 0 ${totalContentWidth} 220`} className="w-full h-full">
          <defs>
            <filter id="staffNoteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2563EB" floodOpacity="0.5" />
            </filter>
            <filter id="staffCorrectGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10B981" floodOpacity="0.9" />
            </filter>
            <filter id="targetPillGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Measure background pastel ribbons for active measure distinction */}
          {notesByMeasure.map((group) => {
            const firstNoteGlobalIdx = group.notes[0].globalIndex;
            const lastNoteGlobalIdx = group.notes[group.notes.length - 1].globalIndex;
            const mStartX = leftMargin + firstNoteGlobalIdx * noteSpacing - 32;
            const mEndX = leftMargin + lastNoteGlobalIdx * noteSpacing + 42;
            const isCurrentMeasure = group.measureIndex === activeMeasureIdx;

            return (
              <g key={`measure-bg-${group.measureIndex}`}>
                {isCurrentMeasure && (
                  <rect
                    x={mStartX}
                    y={12}
                    width={mEndX - mStartX}
                    height={196}
                    rx={18}
                    fill="#FEF3C7"
                    fillOpacity="0.55"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                )}
                {/* Measure Label Ribbon at top */}
                <g transform={`translate(${(mStartX + mEndX) / 2}, 26)`}>
                  <rect
                    x="-42"
                    y="-14"
                    width="84"
                    height="20"
                    rx="10"
                    fill={isCurrentMeasure ? '#2563EB' : '#F1F5F9'}
                    stroke={isCurrentMeasure ? '#1D4ED8' : '#CBD5E1'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="0"
                    fontSize="11"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={isCurrentMeasure ? '#FFFFFF' : '#475569'}
                    textAnchor="middle"
                  >
                    第 {group.measureIndex + 1} 小節
                  </text>
                </g>
              </g>
            );
          })}

          {/* 5 Staff Lines - Thicker and prominent */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = staffTopY + i * lineSpacing;
            return (
              <line
                key={`line-${i}`}
                x1="24"
                y1={y}
                x2={totalContentWidth - 24}
                y2={y}
                stroke="#475569"
                strokeWidth="2.4"
              />
            );
          })}

          {/* Treble Clef Graphic (High resolution G Clef) */}
          <g transform="translate(34, 28) scale(1.05)">
            <path
              d="M 28 82 C 28 92, 18 100, 8 100 C -2 100, -8 92, -8 82 C -8 72, 4 64, 18 64 C 36 64, 46 78, 46 95 C 46 116, 26 135, -2 135 C -28 135, -44 114, -44 85 C -44 50, -18 20, 12 -15 L 12 -45 C 12 -58, 2 -68, -8 -68 C -18 -68, -24 -60, -22 -50 L -22 -30"
              fill="none"
              stroke="#0F172A"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="82" r="7" fill="#0F172A" />
          </g>

          {/* Time Signature (拍號 e.g. 4/4 or 3/4) - High contrast & large */}
          <g transform="translate(94, 6)">
            <text x="0" y="86" fontSize="36" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
              {timeSignature[0]}
            </text>
            <text x="0" y="122" fontSize="36" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
              {timeSignature[1]}
            </text>
          </g>

          {/* Measure Barlines & Final Double Barline (清晰貫穿五線小節線) */}
          {notesByMeasure.map((group, mIdx) => {
            const firstNoteGlobalIdx = group.notes[0].globalIndex;
            const lastNoteGlobalIdx = group.notes[group.notes.length - 1].globalIndex;
            const measureStartX = leftMargin + firstNoteGlobalIdx * noteSpacing - 30;
            const measureEndX = leftMargin + lastNoteGlobalIdx * noteSpacing + 42;

            return (
              <g key={`barline-${group.measureIndex}`}>
                {/* Barline at the boundary between measures (drawn before measure if not first) */}
                {mIdx > 0 && (
                  <g>
                    {/* Vertical Barline across staff */}
                    <line
                      x1={measureStartX}
                      y1={staffTopY}
                      x2={measureStartX}
                      y2={staffTopY + 4 * lineSpacing}
                      stroke="#1E293B"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    {/* Little bar divider dot at bottom */}
                    <circle cx={measureStartX} cy={staffTopY + 4 * lineSpacing + 8} r="3" fill="#64748B" />
                  </g>
                )}

                {/* Final Double Barline at the conclusion of sheet music */}
                {mIdx === notesByMeasure.length - 1 && (
                  <g>
                    <line
                      x1={measureEndX}
                      y1={staffTopY}
                      x2={measureEndX}
                      y2={staffTopY + 4 * lineSpacing}
                      stroke="#0F172A"
                      strokeWidth="2.5"
                    />
                    <line
                      x1={measureEndX + 7}
                      y1={staffTopY}
                      x2={measureEndX + 7}
                      y2={staffTopY + 4 * lineSpacing}
                      stroke="#0F172A"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                    />
                    <text
                      x={measureEndX + 16}
                      y={staffTopY + 2 * lineSpacing + 4}
                      fontSize="11"
                      fontWeight="900"
                      fill="#0F172A"
                      fontFamily="sans-serif"
                    >
                      完
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Notes with Explicit Duration Typology & Enlarged Head */}
          {enrichedNotes.map((item) => {
            const { note, globalIndex, durationBeats } = item;
            const isTarget = globalIndex === currentIndex;
            const isPast = globalIndex < currentIndex;
            const noteX = leftMargin + globalIndex * noteSpacing;
            const noteY = calculateNoteY(note.midiNote);

            // Ledger Lines:
            // C4 (midi 60) -> Y = 146 (1 ledger line below Line 1)
            // A3 (midi 57) -> Y = 164 (2 ledger lines below)
            // A5 (midi 81) -> Y = 38 (1 ledger line above)
            const needsLedgerC4 = note.midiNote === 60;
            const needsLedgerA3 = note.midiNote <= 58;
            const needsLedgerA5 = note.midiNote >= 81;

            // Accurate Duration Typology:
            // Whole Note (全音符 4 拍): hollow oval, NO stem
            // Dotted Half Note (附點二分 3 拍): hollow oval + stem + dot
            // Half Note (二分音符 2 拍): hollow oval + stem
            // Dotted Quarter Note (附點四分 1.5 拍): solid oval + stem + dot
            // Quarter Note (四分音符 1 拍): solid oval + stem
            // Eighth Note (八分音符 0.5 拍 / ½ 拍): solid oval + stem + 1 flag (單符尾)
            // Sixteenth Note (十六分音符 0.25 拍 / ¼ 拍): solid oval + stem + 2 flags (雙符尾)
            const isWholeNote = durationBeats >= 3.5;
            const isDottedHalf = durationBeats >= 2.5 && durationBeats < 3.5;
            const isHalfNote = durationBeats >= 1.75 && durationBeats < 2.5;
            const isDottedQuarter = durationBeats >= 1.25 && durationBeats < 1.75;
            const isSixteenthNote = durationBeats <= 0.35;
            const isEighthNote = !isSixteenthNote && durationBeats <= 0.75;
            const isQuarterNote = !isWholeNote && !isDottedHalf && !isHalfNote && !isDottedQuarter && !isEighthNote && !isSixteenthNote;

            const isHollow = isWholeNote || isDottedHalf || isHalfNote;
            const hasStem = !isWholeNote;
            const hasDot = isDottedHalf || isDottedQuarter;

            // Stem direction:
            // Notes below middle line B4 (Y > 92): stem points UP on right side (+11)
            // Notes at or above middle line B4 (Y <= 92): stem points DOWN on left side (-11)
            const stemPointsUp = noteY > 92;
            const stemX = stemPointsUp ? noteX + 11 : noteX - 11;
            const stemStartY = noteY;
            const stemEndY = stemPointsUp ? noteY - 44 : noteY + 44;

            // Palette
            const primaryColor = isPast
              ? '#94A3B8'
              : isTarget
              ? isNoteCorrect
                ? '#10B981'
                : '#2563EB'
              : '#0F172A';

            return (
              <g
                key={note.id}
                className={`transition-all duration-200 ${
                  isTarget && isNoteWobbly ? 'animate-wiggle' : ''
                }`}
              >
                {/* Ledger lines */}
                {needsLedgerC4 && (
                  <line
                    x1={noteX - 20}
                    y1={146}
                    x2={noteX + 20}
                    y2={146}
                    stroke="#334155"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {needsLedgerA3 && (
                  <>
                    <line x1={noteX - 20} y1={146} x2={noteX + 20} y2={146} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                    <line x1={noteX - 20} y1={164} x2={noteX + 20} y2={164} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  </>
                )}
                {needsLedgerA5 && (
                  <line x1={noteX - 20} y1={38} x2={noteX + 20} y2={38} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Target cursor column indicator */}
                {isTarget && (
                  <g>
                    {/* Glowing highlight capsule behind target note */}
                    <rect
                      x={noteX - 25}
                      y={24}
                      width={50}
                      height={172}
                      rx={25}
                      fill={isNoteCorrect ? '#DCFCE7' : '#EFF6FF'}
                      stroke={isNoteCorrect ? '#10B981' : '#3B82F6'}
                      strokeWidth="3"
                      opacity={0.9}
                      filter="url(#targetPillGlow)"
                      className="animate-pulse"
                    />
                    {/* Bouncing cursor chevron above note */}
                    <g transform={`translate(${noteX}, 20)`} className="animate-bounce">
                      <polygon
                        points="0,9 -9,-2 9,-2"
                        fill={isNoteCorrect ? '#059669' : '#2563EB'}
                      />
                    </g>
                  </g>
                )}

                {/* Note Head - Enlarged for Tablet & Visual Impact: rx=13, ry=9.5 */}
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx={isWholeNote ? '14' : '12.5'}
                  ry={isWholeNote ? '10' : '9'}
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
                  strokeWidth={isHollow ? (isWholeNote ? '4.5' : '3.8') : '1.5'}
                  filter={isTarget ? (isNoteCorrect ? 'url(#staffCorrectGlow)' : 'url(#staffNoteGlow)') : undefined}
                />

                {/* Dotted Note Dot (附點) */}
                {hasDot && (
                  <circle
                    cx={noteX + 18}
                    cy={noteY - 2}
                    r="4.2"
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
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                )}

                {/* Eighth Note Flag (八分音符單符尾 - ½拍) */}
                {isEighthNote && (
                  <path
                    d={
                      stemPointsUp
                        ? `M ${stemX} ${stemEndY} Q ${stemX + 16} ${stemEndY + 14} ${stemX + 14} ${stemEndY + 28} Q ${stemX + 8} ${stemEndY + 18} ${stemX} ${stemEndY + 14}`
                        : `M ${stemX} ${stemEndY} Q ${stemX + 16} ${stemEndY - 14} ${stemX + 14} ${stemEndY - 28} Q ${stemX + 8} ${stemEndY - 18} ${stemX} ${stemEndY - 14}`
                    }
                    fill={primaryColor}
                  />
                )}

                {/* Sixteenth Note Flags (十六分音符雙符尾 - ¼拍) */}
                {isSixteenthNote && (
                  <g>
                    {/* First upper flag */}
                    <path
                      d={
                        stemPointsUp
                          ? `M ${stemX} ${stemEndY} Q ${stemX + 16} ${stemEndY + 14} ${stemX + 14} ${stemEndY + 28} Q ${stemX + 8} ${stemEndY + 18} ${stemX} ${stemEndY + 14}`
                          : `M ${stemX} ${stemEndY} Q ${stemX + 16} ${stemEndY - 14} ${stemX + 14} ${stemEndY - 28} Q ${stemX + 8} ${stemEndY - 18} ${stemX} ${stemEndY - 14}`
                      }
                      fill={primaryColor}
                    />
                    {/* Second parallel lower flag */}
                    <path
                      d={
                        stemPointsUp
                          ? `M ${stemX} ${stemEndY + 10} Q ${stemX + 16} ${stemEndY + 24} ${stemX + 14} ${stemEndY + 38} Q ${stemX + 8} ${stemEndY + 28} ${stemX} ${stemEndY + 24}`
                          : `M ${stemX} ${stemEndY - 10} Q ${stemX + 16} ${stemEndY - 24} ${stemX + 14} ${stemEndY - 38} Q ${stemX + 8} ${stemEndY - 28} ${stemX} ${stemEndY - 24}`
                      }
                      fill={primaryColor}
                    />
                  </g>
                )}

                {/* Finger Number Tag - Extra Prominent Circle */}
                <g transform={`translate(${noteX}, ${noteY > 92 ? noteY - 22 : noteY + 30})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="11"
                    fill={isTarget ? '#2563EB' : '#F1F5F9'}
                    stroke={isTarget ? '#1D4ED8' : '#94A3B8'}
                    strokeWidth="2"
                    filter="drop-shadow(0 1px 3px rgba(0,0,0,0.15))"
                  />
                  <text
                    x="0"
                    y="4.5"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={isTarget ? '#FFFFFF' : '#1E293B'}
                  >
                    {note.fingerNumber}
                  </text>
                </g>

                {/* Duration Capsule Badge (幾分音符幾拍標籤 - 醒目好懂) */}
                <g transform={`translate(${noteX}, ${staffTopY + 4 * lineSpacing + 32})`}>
                  <rect
                    x="-26"
                    y="-9"
                    width="52"
                    height="18"
                    rx="9"
                    fill={
                      isTarget
                        ? isNoteCorrect
                          ? '#10B981'
                          : '#2563EB'
                        : isWholeNote
                        ? '#FEF3C7'
                        : isHalfNote || isDottedHalf
                        ? '#E0E7FF'
                        : isSixteenthNote
                        ? '#CCFBF1'
                        : isEighthNote
                        ? '#FCE7F3'
                        : '#F1F5F9'
                    }
                    stroke={isTarget ? 'transparent' : '#CBD5E1'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={
                      isTarget
                        ? '#FFFFFF'
                        : isWholeNote
                        ? '#B45309'
                        : isHalfNote || isDottedHalf
                        ? '#3730A3'
                        : isSixteenthNote
                        ? '#0F766E'
                        : isEighthNote
                        ? '#9D174D'
                        : '#334155'
                    }
                  >
                    {isWholeNote
                      ? '全 4拍'
                      : isDottedHalf
                      ? '附點 3拍'
                      : isHalfNote
                      ? '二分 2拍'
                      : isDottedQuarter
                      ? '附點 1½拍'
                      : isSixteenthNote
                      ? '十六分 ¼拍'
                      : isEighthNote
                      ? '八分 ½拍'
                      : '四分 1拍'}
                  </text>
                </g>

                {/* Solfege / Lyric Under Note - Large Tablet Typography */}
                <text
                  x={noteX}
                  y={staffTopY + 4 * lineSpacing + 62}
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
                  y={staffTopY + 4 * lineSpacing + 78}
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
