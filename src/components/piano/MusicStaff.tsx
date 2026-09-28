import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { TargetNote } from '../../types/piano';
import { getStaffDiatonicStep } from '../../utils/musicMath';

interface MusicStaffProps {
  notes: TargetNote[];
  currentIndex: number;
  isNoteCorrect: boolean;
  isNoteWobbly: boolean;
  timeSignature?: [number, number];
  activeMidi?: number;
  lastHitTimestamp?: number;
  bpm?: number;
  isMetronomeActive?: boolean;
  className?: string;
}

export const MusicStaff: React.FC<MusicStaffProps> = ({
  notes,
  currentIndex,
  isNoteCorrect,
  isNoteWobbly,
  timeSignature = [4, 4],
  activeMidi,
  lastHitTimestamp = 0,
  bpm = 80,
  isMetronomeActive = false,
  className = '',
}) => {
  // Staff geometry - Enlarged for tablets and children's visual clarity
  const lineSpacing = 18; // 18px between staff lines
  const staffTopY = 56;
  const svgWidth = 760;
  const leftMargin = 120; // Clef + Time signature
  const rightMargin = 40;

  // D3 Scales for exact subpixel alignment on iPad Safari & all screen resolutions
  // 5 lines:
  // Line 5 (top) = 56px
  // Line 1 (bottom) = 128px
  const staffLineScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([1, 5])
      .range([staffTopY + 4 * lineSpacing, staffTopY]);
  }, [staffTopY, lineSpacing]);

  // Diatonic pitch step to Y coordinate using D3 continuous scale
  // C4 (step 0, 1 ledger line below Line 1) -> 146px
  // E4 (step 2, Line 1) -> 128px
  // B4 (step 6, Line 3 middle line) -> 92px
  // F5 (step 10, Line 5 top line) -> 56px
  // A5 (step 12, 1 ledger line above Line 5) -> 38px
  const diatonicYScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, 10])
      .range([146, 56]);
  }, []);

  const calculateNoteY = (midiNote: number): number => {
    const diatonicStep = getStaffDiatonicStep(midiNote);
    return diatonicYScale(diatonicStep);
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

  const enrichedNotes: EnrichedNoteItem[] = useMemo(() => {
    let accBeats = 0;
    let autoMIdx = 0;

    return notes.map((note, globalIndex) => {
      const duration = note.durationBeats || 1;
      let mIdx = note.measureIndex;
      const currentBeatInMeasure = accBeats % beatsPerMeasure;

      if (mIdx === undefined) {
        mIdx = autoMIdx;
        accBeats += duration;
        if (accBeats >= beatsPerMeasure * (autoMIdx + 1)) {
          autoMIdx++;
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
  }, [notes, beatsPerMeasure]);

  // Calculate sliding focus window for tablet screen responsiveness
  const MAX_VISIBLE_NOTES = 8;
  const totalNotesCount = enrichedNotes.length;

  let windowStart = 0;
  if (totalNotesCount > MAX_VISIBLE_NOTES) {
    windowStart = Math.max(0, Math.min(totalNotesCount - MAX_VISIBLE_NOTES, currentIndex - 2));
  }
  const windowEnd = Math.min(totalNotesCount, windowStart + MAX_VISIBLE_NOTES);
  const visibleItems = enrichedNotes.slice(windowStart, windowEnd);

  // Active item & Measure
  const currentItem = enrichedNotes[currentIndex];

  // D3 Horizontal Scale for Note Placement
  const availableWidth = svgWidth - leftMargin - rightMargin;
  const noteSpacing = visibleItems.length > 0 ? availableWidth / visibleItems.length : 80;

  const noteXScale = useMemo(() => {
    const count = visibleItems.length;
    if (count <= 1) return () => leftMargin + availableWidth / 2;
    return d3.scaleLinear()
      .domain([0, count - 1])
      .range([leftMargin + noteSpacing / 2, svgWidth - rightMargin - noteSpacing / 2]);
  }, [visibleItems.length, leftMargin, availableWidth, svgWidth, rightMargin, noteSpacing]);

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

  // Target Note Coordinates for the Beat Glow Cursor
  const targetRelativeIndex = currentIndex - windowStart;
  const isTargetVisible = targetRelativeIndex >= 0 && targetRelativeIndex < visibleItems.length;
  const targetX = isTargetVisible ? noteXScale(targetRelativeIndex) : null;
  const targetY = currentItem ? calculateNoteY(currentItem.note.midiNote) : null;

  // Real-time MIDI recognition match
  const isMidiMatched = Boolean(
    activeMidi !== undefined &&
    currentItem &&
    activeMidi === currentItem.note.midiNote
  );

  return (
    <div className={`w-full select-none flex flex-col gap-2 ${className}`}>
      {/* Visual Duration & Tablet Window Navigator Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-amber-50/95 border-2 border-amber-300 rounded-2xl text-xs md:text-sm shadow-sm">
        {/* Note Duration Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-amber-950 font-black flex items-center gap-1.5">
            <span>🎼</span>
            <span>五線譜節奏符號:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-black">
            <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className="w-3.5 h-2.5 rounded-full border-2 border-amber-600 bg-white inline-block -rotate-12" />
              <span>全音符 (4拍)</span>
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

        {/* Dynamic Beat Glow Status Indicator Tag */}
        <div className="flex items-center gap-2">
          {targetX !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-xs rounded-xl shadow-sm animate-pulse">
              <span>✨</span>
              <span>節拍發光指標 · D3.js 精準同步</span>
            </div>
          )}

          {/* Time Signature Info */}
          <div className="flex items-center gap-2 text-xs md:text-sm font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300">
            <span>拍號 {timeSignature[0]}/{timeSignature[1]} 拍</span>
            {totalNotesCount > MAX_VISIBLE_NOTES && (
              <span>
                · 視窗 {windowStart + 1}~{windowEnd} / 共 {totalNotesCount} 音
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SVG Canvas with D3 Exact Calculation & Subpixel Alignment */}
      <div className="relative w-full bg-gradient-to-b from-amber-50/90 via-white to-amber-50/90 rounded-3xl shadow-md border-3 border-amber-300 flex items-center justify-center p-1 sm:p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} 220`}
          className="w-full h-auto max-h-[250px]"
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="geometricPrecision"
        >
          <defs>
            {/* Glow Filters for dynamic beat indicator */}
            <filter id="staffNoteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2563EB" floodOpacity="0.4" />
            </filter>
            <filter id="staffCorrectGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#10B981" floodOpacity="0.95" />
            </filter>
            <filter id="targetPillGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.45" />
            </filter>
            <filter id="beatLaserGlow" x="-50%" y="-20%" width="200%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#3B82F6" floodOpacity="0.8" />
            </filter>
            <filter id="midiHitRippleGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#10B981" floodOpacity="0.9" />
            </filter>

            {/* Linear Gradients for Dynamic Beat Indicator Beam */}
            <linearGradient id="beatBeamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
              <stop offset="25%" stopColor="#60A5FA" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="beatHitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
              <stop offset="30%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#059669" stopOpacity="1" />
              <stop offset="70%" stopColor="#FBBF24" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 5 Staff Lines - D3 Calculated exact coordinate positions */}
          {[1, 2, 3, 4, 5].map((lineNum) => {
            const y = staffLineScale(lineNum);
            return (
              <line
                key={`line-${lineNum}`}
                x1="20"
                y1={y}
                x2={svgWidth - 20}
                y2={y}
                stroke="#334155"
                strokeWidth="2.2"
                shapeRendering="geometricPrecision"
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

          {/* ========================================================================= */}
          {/* Dynamic Beat Glow Cursor & Laser Indicator (動態節拍發光指標)              */}
          {/* Real-time synchronization with MIDI recognition and metronome             */}
          {/* ========================================================================= */}
          {targetX !== null && targetY !== null && (
            <g className="transition-all duration-150 pointer-events-none">
              {/* 1. Full Vertical Laser Beat Guide Beam */}
              <line
                x1={targetX}
                y1={16}
                x2={targetX}
                y2={204}
                stroke={isNoteCorrect || isMidiMatched ? 'url(#beatHitGradient)' : 'url(#beatBeamGradient)'}
                strokeWidth={isNoteCorrect || isMidiMatched ? '5' : '3.5'}
                filter="url(#beatLaserGlow)"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* 2. Top Beacon Pointer with animated rhythmic bounce */}
              <g transform={`translate(${targetX}, 14)`}>
                <polygon
                  points="0,10 -10,-2 10,-2"
                  fill={isNoteCorrect || isMidiMatched ? '#059669' : '#2563EB'}
                  className="animate-bounce"
                />
                <circle
                  cx="0"
                  cy="-5"
                  r="4"
                  fill={isNoteCorrect || isMidiMatched ? '#34D399' : '#60A5FA'}
                  className="animate-ping"
                />
              </g>

              {/* 3. Orbiting Pulsating Beat Halo around active notehead */}
              <circle
                cx={targetX}
                cy={targetY}
                r="22"
                fill="none"
                stroke={isNoteCorrect || isMidiMatched ? '#10B981' : '#3B82F6'}
                strokeWidth="2.5"
                strokeDasharray="4 3"
                opacity={0.8}
                className="animate-spin"
                style={{ transformOrigin: `${targetX}px ${targetY}px`, animationDuration: '4s' }}
              />

              {/* 4. Instant MIDI Hit Ripple Wave upon sound identification */}
              {(isNoteCorrect || isMidiMatched || lastHitTimestamp > 0) && (
                <circle
                  cx={targetX}
                  cy={targetY}
                  r="30"
                  fill="none"
                  stroke={isNoteCorrect || isMidiMatched ? '#10B981' : '#F59E0B'}
                  strokeWidth="3.2"
                  opacity={0.9}
                  filter="url(#midiHitRippleGlow)"
                  className="animate-ping"
                  style={{ animationDuration: '0.9s', animationIterationCount: 2 }}
                />
              )}

              {/* 5. Bottom Beat Counter Tag */}
              <g transform={`translate(${targetX}, 198)`}>
                <rect
                  x="-28"
                  y="-12"
                  width="56"
                  height="18"
                  rx="9"
                  fill={isNoteCorrect || isMidiMatched ? '#059669' : '#1D4ED8'}
                  className="shadow-sm"
                />
                <text
                  x="0"
                  y="1"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  第 {currentItem?.beatInMeasure || 1} 拍
                </text>
              </g>
            </g>
          )}

          {/* Render Visible Notes using D3 Coordinate Scale */}
          {visibleItems.map((item, relIndex) => {
            const { note, globalIndex, durationBeats } = item;
            const isTarget = globalIndex === currentIndex;
            const isPast = globalIndex < currentIndex;
            const noteX = noteXScale(relIndex);
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

            // Stem direction (Up if below middle line B4, Down if above)
            const stemPointsUp = noteY > 92;
            const stemX = stemPointsUp ? noteX + 11 : noteX - 11;
            const stemStartY = noteY;
            const stemEndY = stemPointsUp ? noteY - 42 : noteY + 42;

            // Finger number position
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
                      height={176}
                      rx={22}
                      fill={isNoteCorrect ? '#DCFCE7' : '#EFF6FF'}
                      stroke={isNoteCorrect ? '#10B981' : '#3B82F6'}
                      strokeWidth="2.5"
                      opacity={0.88}
                      filter="url(#targetPillGlow)"
                    />
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
                    shapeRendering="geometricPrecision"
                  />
                ))}

                {/* Sharp Accidental ♯ */}
                {isSharp && (
                  <g transform={`translate(${noteX - 18}, ${noteY})`}>
                    <line x1="-3" y1="-10" x2="-3" y2="10" stroke={primaryColor} strokeWidth="1.6" />
                    <line x1="3" y1="-10" x2="3" y2="10" stroke={primaryColor} strokeWidth="1.6" />
                    <line x1="-7" y1="-2" x2="7" y2="-5" stroke={primaryColor} strokeWidth="2.6" strokeLinecap="round" />
                    <line x1="-7" y1="4" x2="7" y2="1" stroke={primaryColor} strokeWidth="2.6" strokeLinecap="round" />
                  </g>
                )}

                {/* Flat Accidental ♭ */}
                {isFlat && (
                  <g transform={`translate(${noteX - 18}, ${noteY})`}>
                    <line x1="-4" y1="-12" x2="-4" y2="8" stroke={primaryColor} strokeWidth="2" />
                    <path d="M -4 0 C 2 -4, 4 4, -4 8" fill="none" stroke={primaryColor} strokeWidth="2.4" />
                  </g>
                )}

                {/* Note Head - Exact D3 Alignment */}
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

                {/* Note Stem */}
                {hasStem && (
                  <line
                    x1={stemX}
                    y1={stemStartY}
                    x2={stemX}
                    y2={stemEndY}
                    stroke={primaryColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    shapeRendering="geometricPrecision"
                  />
                )}

                {/* Eighth Note Flag */}
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

                {/* Sixteenth Note Flags */}
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
                          ? `M ${stemX} ${stemEndY + 9} Q ${stemX + 14} ${stemEndY + 21} ${stemX + 12} ${stemEndY + 35} Q ${stemX + 6} ${stemEndY + 25} ${stemX} ${stemEndY + 21}`
                          : `M ${stemX} ${stemEndY - 9} Q ${stemX + 14} ${stemEndY - 21} ${stemX + 12} ${stemEndY - 35} Q ${stemX + 6} ${stemEndY - 25} ${stemX} ${stemEndY - 21}`
                      }
                      fill={primaryColor}
                    />
                  </g>
                )}

                {/* Finger Number Tag */}
                {note.fingerNumber && (
                  <g transform={`translate(${noteX}, ${fingerY})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill={isTarget ? (isNoteCorrect ? '#10B981' : '#2563EB') : '#E2E8F0'}
                      stroke={isTarget ? '#FFFFFF' : '#94A3B8'}
                      strokeWidth="2"
                      className="shadow-sm"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={isTarget ? '#FFFFFF' : '#1E293B'}
                    >
                      {note.fingerNumber}
                    </text>
                  </g>
                )}

                {/* Solfege Name & Note Name Below/Above */}
                <g transform={`translate(${noteX}, ${noteY > 92 ? noteY - 24 : noteY + 26})`}>
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="900"
                    fill={isTarget ? (isNoteCorrect ? '#059669' : '#1D4ED8') : '#64748B'}
                  >
                    {note.solfege}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
