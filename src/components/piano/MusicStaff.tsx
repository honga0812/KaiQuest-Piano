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
  clef?: 'treble' | 'bass' | 'grand';
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

  // Check if both hands are used in this exercise or if grand staff is explicitly requested
  const isGrandStaff = useMemo(() => {
    if (clef === 'grand') return true;
    if (!notes || notes.length === 0) return false;
    const hasLeftHand = notes.some((n) => n.hand === 'left' || n.midiNote < 60);
    const hasRightHand = notes.some((n) => n.hand === 'right' || n.midiNote >= 60);
    return (hasLeftHand && hasRightHand) || hasLeftHand;
  }, [clef, notes]);

  // Single Staff geometry parameters
  const singleLineSpacing = 18;
  const singleStaffTopY = 60;

  // Grand Staff geometry parameters (Double 5-line systems: Treble top, Bass bottom)
  const grandLineSpacing = 13.5;
  const trebleTopY = 32; // Treble Line 5 at y=32, Line 1 at y=86
  const bassTopY = 130;  // Bass Line 5 at y=130, Line 1 at y=184

  // Effective Clef for Single-staff mode
  const effectiveClef: 'treble' | 'bass' = useMemo(() => {
    if (clef && clef !== 'grand') return clef;
    if (notes && notes.length > 0) {
      const leftOrBassCount = notes.filter((n) => n.hand === 'left' || n.midiNote < 60).length;
      if (leftOrBassCount > notes.length / 2) return 'bass';
    }
    return 'treble';
  }, [clef, notes]);

  // D3 Scales for exact subpixel alignment on iPad Safari & all screen resolutions
  const singleStaffLineScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([1, 5])
      .range([singleStaffTopY + 4 * singleLineSpacing, singleStaffTopY]);
  }, [singleStaffTopY, singleLineSpacing]);

  // Exact note Y calculation for Grand Staff or Single Clef
  const calculateNoteY = (midiNote: number, hand?: 'left' | 'right'): number => {
    const diatonicStep = getStaffDiatonicStep(midiNote);
    if (isGrandStaff) {
      const isLeft = hand === 'left' || (!hand && (midiNote < 60 || diatonicStep < 0));
      if (isLeft) {
        // Bass staff: Line 5 (A3, step -2) = bassTopY (130), Line 1 (G2, step -10) = 130 + 54 = 184
        return bassTopY - (diatonicStep + 2) * (grandLineSpacing / 2);
      } else {
        // Treble staff: Line 5 (F5, step 10) = trebleTopY (32), Line 1 (E4, step 2) = 32 + 54 = 86
        return trebleTopY + 54 - (diatonicStep - 2) * (grandLineSpacing / 2);
      }
    }

    if (effectiveClef === 'bass') {
      return singleStaffTopY - (diatonicStep + 2) * 9;
    }
    return singleStaffTopY + 90 - diatonicStep * 9;
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
  const MAX_VISIBLE_NOTES = isGrandStaff ? 7 : 8;
  const totalNotesCount = enrichedNotes.length;

  let windowStart = 0;
  if (totalNotesCount > MAX_VISIBLE_NOTES) {
    windowStart = Math.max(0, Math.min(totalNotesCount - MAX_VISIBLE_NOTES, currentIndex - 2));
  }
  const windowEnd = Math.min(totalNotesCount, windowStart + MAX_VISIBLE_NOTES);
  const visibleItems = enrichedNotes.slice(windowStart, windowEnd);

  // Active item & Measure
  const currentItem = enrichedNotes[currentIndex];

  // Note horizontal spacing via D3 Linear Scale
  const availableWidth = svgWidth - leftMargin - rightMargin;
  const noteSpacing = availableWidth / (visibleItems.length || 1);

  const noteXScale = useMemo(() => {
    const count = visibleItems.length;
    if (count <= 1) return () => leftMargin + availableWidth / 2;
    return d3.scaleLinear()
      .domain([0, count - 1])
      .range([leftMargin + noteSpacing / 2, svgWidth - rightMargin - noteSpacing / 2]);
  }, [visibleItems.length, leftMargin, availableWidth, svgWidth, rightMargin, noteSpacing]);

  // Comprehensive calculation for ledger lines
  const getLedgerLinesY = (noteY: number, isLeftHand?: boolean): number[] => {
    const lines: number[] = [];
    if (isGrandStaff) {
      if (isLeftHand) {
        const bassLine1 = bassTopY + 4 * grandLineSpacing; // 184
        // Above bass staff (Middle C at y=107.5)
        if (noteY <= bassTopY - grandLineSpacing / 2) {
          for (let ly = bassTopY - grandLineSpacing; ly >= noteY - 3; ly -= grandLineSpacing) {
            lines.push(ly);
          }
        }
        // Below bass staff
        if (noteY >= bassLine1 + grandLineSpacing / 2) {
          for (let ly = bassLine1 + grandLineSpacing; ly <= noteY + 3; ly += grandLineSpacing) {
            lines.push(ly);
          }
        }
      } else {
        const trebleLine1 = trebleTopY + 4 * grandLineSpacing; // 86
        // Below treble staff (Middle C at y=108.5)
        if (noteY >= trebleLine1 + grandLineSpacing / 2) {
          for (let ly = trebleLine1 + grandLineSpacing; ly <= noteY + 3; ly += grandLineSpacing) {
            lines.push(ly);
          }
        }
        // Above treble staff
        if (noteY <= trebleTopY - grandLineSpacing / 2) {
          for (let ly = trebleTopY - grandLineSpacing; ly >= noteY - 3; ly -= grandLineSpacing) {
            lines.push(ly);
          }
        }
      }
      return lines;
    }

    const line1Y = singleStaffTopY + 4 * singleLineSpacing; // 132
    if (noteY >= line1Y + singleLineSpacing - 4) {
      for (let ly = line1Y + singleLineSpacing; ly <= noteY + 5; ly += singleLineSpacing) {
        lines.push(ly);
      }
    }
    if (noteY <= singleStaffTopY - singleLineSpacing + 4) {
      for (let ly = singleStaffTopY - singleLineSpacing; ly >= noteY - 5; ly -= singleLineSpacing) {
        lines.push(ly);
      }
    }
    return lines;
  };

  // Target Note Coordinates for the Beat Glow Cursor
  const targetRelativeIndex = currentIndex - windowStart;
  const isTargetVisible = targetRelativeIndex >= 0 && targetRelativeIndex < visibleItems.length;
  const targetX = isTargetVisible ? noteXScale(targetRelativeIndex) : null;
  const targetY = currentItem ? calculateNoteY(currentItem.note.midiNote, currentItem.note.hand) : null;

  // Real-time MIDI recognition match
  const isMidiMatched = Boolean(
    activeMidi !== undefined &&
    currentItem &&
    activeMidi === currentItem.note.midiNote
  );

  const canvasHeight = isGrandStaff ? 295 : 255;

  return (
    <div className={`w-full select-none flex flex-col gap-1 sm:gap-1.5 ${className}`}>
      {/* Header Deck: Clef & Grand Staff indicator + Mentor Info */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-1 bg-amber-50/95 border-2 border-amber-300 rounded-2xl text-xs md:text-sm shadow-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-black text-amber-950">
            <span>{currentMentor.emoji}</span>
            <span>{currentMentor.name} 陪你練琴</span>
          </span>

          {/* Clef / Grand Staff Mode Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs flex items-center gap-1 ${
              isGrandStaff
                ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white'
                : effectiveClef === 'bass'
                ? 'bg-blue-600 text-white'
                : 'bg-amber-400 text-slate-950'
            }`}
          >
            {isGrandStaff ? '🎹 雙手大譜表 (Grand Staff)' : effectiveClef === 'bass' ? '𝄢 低音譜表 (左手)' : '𝄞 高音譜表 (右手)'}
          </span>
        </div>

        {/* Time Signature Info */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-xl border border-amber-300 ml-auto">
          <span>拍號 {timeSignature[0]}/{timeSignature[1]} 拍</span>
          {totalNotesCount > MAX_VISIBLE_NOTES && (
            <span>
              · {windowStart + 1}~{windowEnd} / 共 {totalNotesCount} 音
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas: Dual Staves for Grand Staff or Single Staff */}
      <div className="relative w-full bg-gradient-to-b from-amber-50/90 via-white to-amber-50/90 rounded-3xl shadow-sm border-2 border-amber-300 flex items-center justify-center p-1 sm:p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${canvasHeight}`}
          className="w-full h-auto max-h-[220px] sm:max-h-[240px] md:max-h-[270px]"
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <filter id="staffNoteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#2563EB" floodOpacity="0.4" />
            </filter>
            <filter id="staffCorrectGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#10B981" floodOpacity="0.95" />
            </filter>
            <filter id="mentorBeamGlow" x="-50%" y="-20%" width="200%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor={currentMentor.color} floodOpacity="0.8" />
            </filter>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.15" />
            </filter>

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

          {/* ========================================================================= */}
          {/* 1. STAFF LINES & CLEF DRAWING                                             */}
          {/* ========================================================================= */}
          {isGrandStaff ? (
            <g id="grand-staff-system">
              {/* Grand Staff Brace & Left Connecting Barline */}
              <path
                d="M 28,32 C 16,50 16,90 8,108 C 16,126 16,166 28,184"
                fill="none"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line x1="28" y1="32" x2="28" y2="184" stroke="#0F172A" strokeWidth="2.5" />

              {/* Upper Treble Staff (右手 5 線) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = trebleTopY + i * grandLineSpacing;
                return (
                  <line
                    key={`treble-line-${i}`}
                    x1="28"
                    y1={y}
                    x2={svgWidth - 20}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                );
              })}

              {/* Lower Bass Staff (左手 5 線) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = bassTopY + i * grandLineSpacing;
                return (
                  <line
                    key={`bass-line-${i}`}
                    x1="28"
                    y1={y}
                    x2={svgWidth - 20}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1.8"
                  />
                );
              })}

              {/* Treble Clef Glyph at Upper Staff */}
              <TrebleClefGlyph x={34} y={trebleTopY - 4} lineSpacing={grandLineSpacing} color="#0F172A" />

              {/* Bass Clef Glyph at Lower Staff */}
              <BassClefGlyph x={34} y={bassTopY} lineSpacing={grandLineSpacing} color="#0F172A" />

              {/* Upper & Lower Time Signature */}
              <g transform={`translate(84, ${trebleTopY})`}>
                <text x="0" y="24" fontSize="24" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
                  {timeSignature[0]}
                </text>
                <text x="0" y="48" fontSize="24" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
                  {timeSignature[1]}
                </text>
              </g>

              <g transform={`translate(84, ${bassTopY})`}>
                <text x="0" y="24" fontSize="24" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
                  {timeSignature[0]}
                </text>
                <text x="0" y="48" fontSize="24" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
                  {timeSignature[1]}
                </text>
              </g>

              {/* Dedicated Hand Label Badges */}
              <g transform="translate(108, 20)">
                <rect x="-24" y="-8" width="48" height="15" rx="7.5" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.2" />
                <text x="0" y="3" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#EA580C">右手 𝄞</text>
              </g>
              <g transform="translate(108, 196)">
                <rect x="-24" y="-8" width="48" height="15" rx="7.5" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.2" />
                <text x="0" y="3" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#1D4ED8">左手 𝄢</text>
              </g>
            </g>
          ) : (
            <g id="single-staff-system">
              {/* Single Staff 5 Lines */}
              {[1, 2, 3, 4, 5].map((lineNum) => {
                const y = singleStaffLineScale(lineNum);
                return (
                  <line
                    key={`line-${lineNum}`}
                    x1="20"
                    y1={y}
                    x2={svgWidth - 20}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="2.2"
                  />
                );
              })}

              {effectiveClef === 'bass' ? (
                <BassClefGlyph x={32} y={singleStaffTopY} lineSpacing={singleLineSpacing} color="#0F172A" />
              ) : (
                <TrebleClefGlyph x={32} y={singleStaffTopY} lineSpacing={singleLineSpacing} color="#0F172A" />
              )}

              <g transform={`translate(90, ${singleStaffTopY})`}>
                <text x="0" y="28" fontSize="30" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
                  {timeSignature[0]}
                </text>
                <text x="0" y="62" fontSize="30" fontWeight="bold" fontFamily="serif" fill="#0F172A" textAnchor="middle">
                  {timeSignature[1]}
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* 2. DYNAMIC BEAT GLOW CURSOR & MENTOR BEACON INDICATOR                      */}
          {/* ========================================================================= */}
          {targetX !== null && targetY !== null && (
            <g className="transition-all duration-150 pointer-events-none">
              {/* Full Vertical Laser Guide Beam */}
              <line
                x1={targetX}
                y1={12}
                x2={targetX}
                y2={canvasHeight - 20}
                stroke={isNoteCorrect || isMidiMatched ? 'url(#beatHitGradient)' : 'url(#beatBeamGradient)'}
                strokeWidth={isNoteCorrect || isMidiMatched ? '5.5' : '3.8'}
                filter="url(#mentorBeamGlow)"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Top Mentor Emblem Pointer */}
              <g transform={`translate(${targetX}, 12)`}>
                <polygon
                  points="0,10 -7,0 7,0"
                  fill={isNoteCorrect || isMidiMatched ? '#059669' : currentMentor.color}
                />
                <circle cx="0" cy="-6" r="8" fill="#FFFFFF" stroke={currentMentor.color} strokeWidth="2" />
                <text x="0" y="-2.5" fontSize="10" textAnchor="middle">
                  {currentMentor.emoji}
                </text>
              </g>

              {/* Precision Target Prompt Ring - Exactly centered on Target Note Head */}
              <g transform={`translate(${targetX}, ${targetY})`}>
                {/* Outer animated halo ellipse matching note orientation */}
                <ellipse
                  rx="18.5"
                  ry="14"
                  transform="rotate(-24)"
                  fill="none"
                  stroke={
                    isNoteCorrect || isMidiMatched
                      ? '#34D399'
                      : currentItem?.note.hand === 'left'
                      ? '#60A5FA'
                      : '#FBBF24'
                  }
                  strokeWidth="1.8"
                  opacity="0.8"
                  className="animate-ping"
                />
                {/* Inner precision focus ring with dashed guide */}
                <ellipse
                  rx="15"
                  ry="11.5"
                  transform="rotate(-24)"
                  fill={
                    isNoteCorrect || isMidiMatched
                      ? 'rgba(16, 185, 129, 0.35)'
                      : currentItem?.note.hand === 'left'
                      ? 'rgba(37, 99, 235, 0.25)'
                      : 'rgba(245, 158, 11, 0.25)'
                  }
                  stroke={
                    isNoteCorrect || isMidiMatched
                      ? '#10B981'
                      : currentItem?.note.hand === 'left'
                      ? '#2563EB'
                      : currentMentor.color
                  }
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                {/* Precision 4-direction targeting ticks pointing directly to note center */}
                <line x1="0" y1="-18" x2="0" y2="-13" stroke={isNoteCorrect || isMidiMatched ? '#10B981' : currentMentor.strokeColor} strokeWidth="2.2" strokeLinecap="round" />
                <line x1="0" y1="13" x2="0" y2="18" stroke={isNoteCorrect || isMidiMatched ? '#10B981' : currentMentor.strokeColor} strokeWidth="2.2" strokeLinecap="round" />
                <line x1="-19" y1="0" x2="-14" y2="0" stroke={isNoteCorrect || isMidiMatched ? '#10B981' : currentMentor.strokeColor} strokeWidth="2.2" strokeLinecap="round" />
                <line x1="14" y1="0" x2="19" y2="0" stroke={isNoteCorrect || isMidiMatched ? '#10B981' : currentMentor.strokeColor} strokeWidth="2.2" strokeLinecap="round" />
              </g>

              {/* Bottom Beat Counter Tag */}
              <g transform={`translate(${targetX}, ${canvasHeight - 16})`}>
                <rect
                  x="-30"
                  y="-10"
                  width="60"
                  height="18"
                  rx="9"
                  fill={isNoteCorrect || isMidiMatched ? '#059669' : currentMentor.strokeColor}
                />
                <text x="0" y="2.5" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle">
                  第 {currentItem?.beatInMeasure || 1} 拍
                </text>
              </g>
            </g>
          )}

          {/* ========================================================================= */}
          {/* 3. VISIBLE NOTES RENDERING                                                */}
          {/* ========================================================================= */}
          {visibleItems.map((item, relIndex) => {
            const { note, globalIndex, durationBeats } = item;
            const isTarget = globalIndex === currentIndex;
            const isPast = globalIndex < currentIndex;
            const noteX = noteXScale(relIndex);
            const isLeftHand = note.hand === 'left';
            const noteY = calculateNoteY(note.midiNote, note.hand);

            // Ledger lines
            const ledgerYList = getLedgerLinesY(noteY, isLeftHand);

            // Note Duration classification
            const isWholeNote = durationBeats >= 3.5;
            const isDottedHalf = durationBeats >= 2.5 && durationBeats < 3.5;
            const isHalfNote = durationBeats >= 1.75 && durationBeats < 2.5;
            const isDottedQuarter = durationBeats >= 1.25 && durationBeats < 1.75;
            const isSixteenthNote = durationBeats <= 0.35;
            const isEighthNote = !isSixteenthNote && durationBeats <= 0.75;

            const isHollow = isWholeNote || isDottedHalf || isHalfNote;
            const hasStem = !isWholeNote;
            const hasDot = isDottedHalf || isDottedQuarter;

            // Accidentals check
            const isSharp = note.noteName.includes('#');
            const isFlat = note.noteName.includes('b');

            // Stem direction & length
            const stemPointsUp = isGrandStaff ? !isLeftHand : noteY >= 96;
            const stemX = stemPointsUp ? noteX + 9 : noteX - 9;
            const stemStartY = noteY;
            const stemEndY = stemPointsUp ? noteY - 30 : noteY + 30;

            // Finger number position - carefully separated so it never overlaps staff lines or solfege
            const fingerY = isGrandStaff
              ? isLeftHand
                ? (stemPointsUp ? Math.max(116, noteY - 26) : Math.min(216, noteY + 28))
                : (stemPointsUp ? Math.max(14, noteY - 30) : Math.min(94, noteY + 28))
              : (stemPointsUp ? Math.max(16, noteY - 36) : Math.min(canvasHeight - 34, noteY + 36));

            // Hand Color Scheme:
            // Right Hand (右手): Vibrant Coral/Orange `#EA580C`
            // Left Hand (左手): Royal Blue/Indigo `#2563EB`
            const handColor = isLeftHand ? '#2563EB' : '#EA580C';
            const handBg = isLeftHand ? '#EFF6FF' : '#FFF7ED';
            const handBorder = isLeftHand ? '#3B82F6' : '#F97316';

            return (
              <g
                key={`note-${globalIndex}`}
                className={`transition-opacity duration-150 ${
                  isTarget
                    ? 'font-black opacity-100'
                    : isPast
                    ? 'opacity-70'
                    : 'opacity-90'
                }`}
              >
                {/* Ledger Lines */}
                {ledgerYList.map((ly, lIdx) => (
                  <line
                    key={`ledger-${globalIndex}-${lIdx}`}
                    x1={noteX - 16}
                    y1={ly}
                    x2={noteX + 16}
                    y2={ly}
                    stroke="#1E293B"
                    strokeWidth="2.2"
                  />
                ))}

                {/* Accidental (# or b) */}
                {isSharp && (
                  <text
                    x={noteX - 18}
                    y={noteY + 5}
                    fontSize="18"
                    fontWeight="bold"
                    fill={isTarget ? handColor : '#0F172A'}
                    textAnchor="middle"
                  >
                    ♯
                  </text>
                )}
                {isFlat && (
                  <text
                    x={noteX - 18}
                    y={noteY + 4}
                    fontSize="18"
                    fontWeight="bold"
                    fill={isTarget ? handColor : '#0F172A'}
                    textAnchor="middle"
                  >
                    ♭
                  </text>
                )}

                {/* Note Stem */}
                {hasStem && (
                  <line
                    x1={stemX}
                    y1={stemStartY}
                    x2={stemX}
                    y2={stemEndY}
                    stroke={isTarget ? handColor : '#0F172A'}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                )}

                {/* Flag for eighth/sixteenth note */}
                {hasStem && (isEighthNote || isSixteenthNote) && (
                  <path
                    d={
                      stemPointsUp
                        ? `M ${stemX} ${stemEndY} C ${stemX + 10} ${stemEndY + 8}, ${stemX + 12} ${stemEndY + 18}, ${stemX + 5} ${stemEndY + 22}`
                        : `M ${stemX} ${stemEndY} C ${stemX + 10} ${stemEndY - 8}, ${stemX + 12} ${stemEndY - 18}, ${stemX + 5} ${stemEndY - 22}`
                    }
                    fill="none"
                    stroke={isTarget ? handColor : '#0F172A'}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                )}

                {/* Note Head (Rotated Ellipse) */}
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx={isTarget ? 11.5 : 10}
                  ry={isTarget ? 8.5 : 7.5}
                  transform={`rotate(-24 ${noteX} ${noteY})`}
                  fill={
                    isHollow
                      ? '#FFFFFF'
                      : isTarget
                      ? isNoteCorrect || isMidiMatched
                        ? '#10B981'
                        : handColor
                      : '#0F172A'
                  }
                  stroke={isTarget ? handColor : '#0F172A'}
                  strokeWidth={isHollow ? '2.8' : '1.5'}
                  filter={isTarget ? 'url(#staffNoteGlow)' : undefined}
                />

                {/* Dot for dotted notes */}
                {hasDot && (
                  <circle
                    cx={noteX + 15}
                    cy={noteY - 2}
                    r="2.8"
                    fill={isTarget ? handColor : '#0F172A'}
                  />
                )}

                {/* Finger Number Pill with Hand Identifier */}
                {note.fingerNumber !== undefined && (
                  <g transform={`translate(${noteX}, ${fingerY})`}>
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="20"
                      rx="10"
                      fill={isTarget ? (isLeftHand ? '#2563EB' : '#EA580C') : handBg}
                      stroke={isTarget ? '#FFFFFF' : handBorder}
                      strokeWidth="1.5"
                      filter="url(#softShadow)"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="900"
                      fill={isTarget ? '#FFFFFF' : handColor}
                    >
                      {isGrandStaff ? (isLeftHand ? `L${note.fingerNumber}` : `R${note.fingerNumber}`) : note.fingerNumber}
                    </text>
                  </g>
                )}

                {/* Solfege & Lyric below staff system on consistent baseline */}
                {(() => {
                  const baselineSolfegeY = isGrandStaff
                    ? (isLeftHand ? 250 : 110)
                    : 180;
                  return (
                    <g transform={`translate(${noteX}, ${baselineSolfegeY})`}>
                      <rect
                        x="-15"
                        y="-9"
                        width="30"
                        height="17"
                        rx="8.5"
                        fill={isTarget ? handColor : '#F1F5F9'}
                        stroke={isTarget ? '#FFFFFF' : '#CBD5E1'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="900"
                        fill={isTarget ? '#FFFFFF' : '#334155'}
                      >
                        {note.solfege}
                      </text>
                      {note.lyrics && (
                        <text
                          x="0"
                          y="19"
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="bold"
                          fill={isTarget ? '#0F172A' : '#475569'}
                        >
                          {note.lyrics}
                        </text>
                      )}
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
