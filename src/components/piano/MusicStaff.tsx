import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { TargetNote, CharacterFriend } from '../../types/piano';
import { getStaffDiatonicStep } from '../../utils/musicMath';
import { TrebleClefGlyph, BassClefGlyph } from './MusicSvgSymbols';

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
  mentorId?: CharacterFriend;
  accuracyRate?: number;
  comboStreak?: number;
  clef?: 'treble' | 'bass';
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
  mentorId = 'eli_lion',
  accuracyRate = 100,
  comboStreak = 0,
  clef,
  className = '',
}) => {
  // Staff geometry - Enlarged for tablets and children's visual clarity
  const lineSpacing = 18; // 18px between staff lines
  const staffTopY = 56;
  const svgWidth = 760;
  const leftMargin = 120; // Clef + Time signature
  const rightMargin = 40;

  // Accompanying Mentor Theme Configuration
  const mentorConfigs: Record<
    CharacterFriend,
    { emoji: string; name: string; color: string; glowColor: string; strokeColor: string }
  > = {
    kai: { emoji: '🧭', name: 'Kai', color: '#F59E0B', glowColor: '#F59E0B', strokeColor: '#B45309' },
    eli_lion: { emoji: '🦁', name: 'Eli', color: '#F59E0B', glowColor: '#EA580C', strokeColor: '#C2410C' },
    kabuto_beetle: { emoji: '🪲', name: 'Kabuto', color: '#2563EB', glowColor: '#1D4ED8', strokeColor: '#1E3A8A' },
    pico_dolphin: { emoji: '🐬', name: 'Pico', color: '#0284C7', glowColor: '#38BDF8', strokeColor: '#0369A1' },
    rex_dino: { emoji: '🦖', name: 'Rex', color: '#10B981', glowColor: '#059669', strokeColor: '#047857' },
  };

  const currentMentor = mentorConfigs[mentorId] || mentorConfigs.eli_lion;

  // Effective Clef: auto-detect from notes if not explicitly passed
  const effectiveClef: 'treble' | 'bass' = useMemo(() => {
    if (clef) return clef;
    if (notes && notes.length > 0) {
      const leftOrBassCount = notes.filter((n) => n.hand === 'left' || n.midiNote < 60).length;
      if (leftOrBassCount > notes.length / 2) return 'bass';
    }
    return 'treble';
  }, [clef, notes]);

  // D3 Scales for exact subpixel alignment on iPad Safari & all screen resolutions
  const staffLineScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([1, 5])
      .range([staffTopY + 4 * lineSpacing, staffTopY]);
  }, [staffTopY, lineSpacing]);

  // Exact note Y calculation for Treble or Bass clef
  const calculateNoteY = (midiNote: number): number => {
    const diatonicStep = getStaffDiatonicStep(midiNote);
    if (effectiveClef === 'bass') {
      // Bass clef: Line 5 (A3, step -2) = 56, Line 4 (F3, step -4) = 74, Line 1 (G2, step -10) = 128, C4 (step 0) = 38
      return staffTopY - (diatonicStep + 2) * 9;
    }
    // Treble clef: Line 5 (F5, step 10) = 56, Line 1 (E4, step 2) = 128, C4 (step 0) = 146
    return staffTopY + 90 - diatonicStep * 9;
  };

  // Group notes into measures based on note.measureIndex or calculated beats
  const beatsPerMeasure = timeSignature[0] || 4;

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
    if (noteY >= 142) {
      for (let ly = 146; ly <= noteY + 5; ly += 18) {
        lines.push(ly);
      }
    }
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
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-amber-50/95 border-2 border-amber-300 rounded-2xl text-xs md:text-sm shadow-sm">
        {/* Dynamic Accompanying Mentor Rhythmic Guidance Status */}
        <div className="flex items-center gap-2">
          {targetX !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-xs rounded-xl shadow-sm">
              <span className="text-sm">{currentMentor.emoji}</span>
              <span>隨行導師 {currentMentor.name} 節拍同步</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 font-mono text-[10px]">
                準確度 {accuracyRate}%
              </span>
            </div>
          )}

          {comboStreak > 2 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-xs animate-bounce">
              🔥 {comboStreak} 連擊能量
            </span>
          )}
        </div>

        {/* Time Signature Info */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 ml-auto">
          <span>拍號 {timeSignature[0]}/{timeSignature[1]} 拍</span>
          {totalNotesCount > MAX_VISIBLE_NOTES && (
            <span>
              · {windowStart + 1}~{windowEnd} / 共 {totalNotesCount} 音
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas with D3 Exact Calculation & Accompanying Mentor Glow Indicator */}
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
            <filter id="mentorBeamGlow" x="-50%" y="-20%" width="200%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor={currentMentor.color} floodOpacity="0.8" />
            </filter>
            <filter id="mentorRippleGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor={currentMentor.glowColor} floodOpacity="0.95" />
            </filter>

            {/* Linear Gradients for Dynamic Beat Indicator Beam */}
            <linearGradient id="beatBeamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentMentor.color} stopOpacity="0" />
              <stop offset="25%" stopColor={currentMentor.color} stopOpacity="0.65" />
              <stop offset="60%" stopColor="#2563EB" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="beatHitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
              <stop offset="30%" stopColor="#34D399" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#059669" stopOpacity="1" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="1" />
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

          {/* Standard Vector Clef Glyphs (Treble G-Clef or Bass F-Clef) */}
          {effectiveClef === 'bass' ? (
            <BassClefGlyph x={32} y={staffTopY} lineSpacing={lineSpacing} color="#0F172A" />
          ) : (
            <TrebleClefGlyph x={32} y={staffTopY} lineSpacing={lineSpacing} color="#0F172A" />
          )}

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
          {/* Dynamic Beat Glow Cursor & Mentor Beacon Indicator (隨行導師節拍光柱指標)  */}
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
                strokeWidth={isNoteCorrect || isMidiMatched ? '5.5' : '3.8'}
                filter="url(#mentorBeamGlow)"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* 2. Top Mentor Beacon Emblem & Animated Pointer */}
              <g transform={`translate(${targetX}, 13)`}>
                {/* Pointer Arrow */}
                <polygon
                  points="0,11 -9,-1 9,-1"
                  fill={isNoteCorrect || isMidiMatched ? '#059669' : currentMentor.color}
                  className="animate-bounce"
                />
                {/* Mini Mentor Emblem Badge */}
                <circle
                  cx="0"
                  cy="-7"
                  r="9"
                  fill="#FFFFFF"
                  stroke={currentMentor.color}
                  strokeWidth="2"
                  className="shadow-sm"
                />
                <text
                  x="0"
                  y="-3.5"
                  fontSize="11"
                  textAnchor="middle"
                  className="select-none"
                >
                  {currentMentor.emoji}
                </text>
              </g>

              {/* 3. Orbiting Pulsating Beat Halo around active notehead */}
              <circle
                cx={targetX}
                cy={targetY}
                r="22"
                fill="none"
                stroke={isNoteCorrect || isMidiMatched ? '#10B981' : currentMentor.color}
                strokeWidth="2.6"
                strokeDasharray="4 3"
                opacity={0.85}
                className="animate-spin"
                style={{ transformOrigin: `${targetX}px ${targetY}px`, animationDuration: '4s' }}
              />

              {/* 4. Mentor Resonance Ripple Waves upon correct hit */}
              {(isNoteCorrect || isMidiMatched || lastHitTimestamp > 0) && (
                <g>
                  {/* Outer Ripple */}
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r="32"
                    fill="none"
                    stroke={currentMentor.color}
                    strokeWidth="3.2"
                    opacity={0.9}
                    filter="url(#mentorRippleGlow)"
                    className="animate-ping"
                    style={{ animationDuration: '0.8s', animationIterationCount: 2 }}
                  />
                  {/* Inner Sparkling Burst */}
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r="18"
                    fill={currentMentor.color}
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />
                </g>
              )}

              {/* 5. Bottom Beat Counter Tag with Mentor Identity */}
              <g transform={`translate(${targetX}, 198)`}>
                <rect
                  x="-32"
                  y="-12"
                  width="64"
                  height="18"
                  rx="9"
                  fill={isNoteCorrect || isMidiMatched ? '#059669' : currentMentor.strokeColor}
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
                      stroke={isNoteCorrect ? '#10B981' : currentMentor.color}
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
