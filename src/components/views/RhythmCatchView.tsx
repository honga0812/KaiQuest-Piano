import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RhythmCatchTrack,
  RhythmCatchNote,
  RHYTHM_CATCH_TRACKS,
} from '../../data/rhythmCatchSongs';
import { InputMode, PianoNoteEvent } from '../../types/piano';
import { micAdapter } from '../../audio/microphoneAdapter';
import { midiAdapter } from '../../audio/midiAdapter';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { speechGuide } from '../../utils/speechGuide';
import confetti from 'canvas-confetti';

interface RhythmCatchViewProps {
  onBackToMap: () => void;
  inputMode?: InputMode;
  className?: string;
}

type JudgmentType = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

interface JudgmentDisplay {
  id: string;
  type: JudgmentType;
  laneIndex: number;
  offsetMs: number;
  timestamp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
}

// Fallback helper for drawing rounded rectangle on older canvas contexts
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

export const RhythmCatchView: React.FC<RhythmCatchViewProps> = ({
  onBackToMap,
  inputMode: initialInputMode = 'microphone',
  className = '',
}) => {
  // Track & Playback state
  const [selectedTrack, setSelectedTrack] = useState<RhythmCatchTrack>(RHYTHM_CATCH_TRACKS[0]);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [activeInputMode, setActiveInputMode] = useState<InputMode | 'keyboard'>(initialInputMode);
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState<boolean>(true);

  // Game Engine State
  const [gameState, setGameState] = useState<'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'FINISHED'>('IDLE');
  const [countdownNumber, setCountdownNumber] = useState<number>(3);

  // Score & Performance State
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [judgmentsCount, setJudgmentsCount] = useState<Record<JudgmentType, number>>({
    PERFECT: 0,
    GREAT: 0,
    GOOD: 0,
    MISS: 0,
  });
  const [lastOffsetMs, setLastOffsetMs] = useState<number | null>(null);
  const [currentJudgment, setCurrentJudgment] = useState<JudgmentDisplay | null>(null);
  const [activeLanesState, setActiveLanesState] = useState<boolean[]>(() =>
    new Array(selectedTrack.lanes.length).fill(false)
  );

  // Microphone status
  const [isMicRunning, setIsMicRunning] = useState<boolean>(micAdapter.getIsRunning());
  const [lastDetectedPitch, setLastDetectedPitch] = useState<string>('');

  // High score tracking
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem('rhythm_catch_high_scores');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Time & Animation Refs
  const gameStartTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const activeLanesRef = useRef<boolean[]>(new Array(selectedTrack.lanes.length).fill(false));

  // Note State Machine (tracked by ref for 60fps loop)
  const notesStateRef = useRef<
    (RhythmCatchNote & {
      targetTimeMs: number;
      isHit: boolean;
      isMissed: boolean;
    })[]
  >([]);

  // Metronome beat tracker ref
  const lastTickBeatRef = useRef<number>(-1);

  // Fall speed: milliseconds from top of runway to hit line
  // 1800ms gives a smooth, readable descent
  const fallDurationMs = Math.round(1800 / speedMultiplier);

  // Prepare notes for active track
  const prepareTrackNotes = useCallback(
    (track: RhythmCatchTrack, speed: number) => {
      const msPerBeat = 60000 / (track.bpm * speed);
      // 2400ms lead-in time so child can feel the rhythm before first note
      const leadInMs = 2400;

      notesStateRef.current = track.notes.map((n) => ({
        ...n,
        targetTimeMs: leadInMs + n.timeBeat * msPerBeat,
        isHit: false,
        isMissed: false,
      }));
    },
    []
  );

  // Check microphone adapter status
  useEffect(() => {
    setIsMicRunning(micAdapter.getIsRunning());
    const unsub = micAdapter.subscribeStatus((st) => {
      setIsMicRunning(st.isListening);
    });
    return unsub;
  }, []);

  // Update active lanes ref & state on track change
  useEffect(() => {
    const emptyLanes = new Array(selectedTrack.lanes.length).fill(false);
    activeLanesRef.current = emptyLanes;
    setActiveLanesState(emptyLanes);
    prepareTrackNotes(selectedTrack, speedMultiplier);
  }, [selectedTrack, speedMultiplier, prepareTrackNotes]);

  // Particle burst helper
  const spawnParticles = (x: number, y: number, color: string, count = 18) => {
    const particles = particlesRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 5 + 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
      });
    }
  };

  // Trigger judgment action
  const recordJudgment = useCallback(
    (type: JudgmentType, laneIndex: number, offsetMs: number) => {
      setJudgmentsCount((prev) => ({
        ...prev,
        [type]: prev[type] + 1,
      }));

      pianoSynth.playRhythmHit(type);

      if (type === 'MISS') {
        setCombo(0);
        setLastOffsetMs(null);
        setCurrentJudgment({
          id: Math.random().toString(),
          type: 'MISS',
          laneIndex,
          offsetMs: 0,
          timestamp: Date.now(),
        });
      } else {
        setCombo((prevCombo) => {
          const nextCombo = prevCombo + 1;
          setMaxCombo((prevMax) => Math.max(prevMax, nextCombo));

          // Check if hitting 10 combo for Fever
          if (nextCombo === 10) {
            pianoSynth.playComboFeverSound();
          }

          // Multiplier: 1x (0-4), 2x (5-9), 3x (10-19, Fever), 4x (20+)
          const multiplier = nextCombo >= 20 ? 4 : nextCombo >= 10 ? 3 : nextCombo >= 5 ? 2 : 1;
          const points = type === 'PERFECT' ? 100 : type === 'GREAT' ? 70 : 40;
          setScore((s) => s + points * multiplier);

          return nextCombo;
        });

        setLastOffsetMs(offsetMs);
        setCurrentJudgment({
          id: Math.random().toString(),
          type,
          laneIndex,
          offsetMs,
          timestamp: Date.now(),
        });

        // Spawn visual particles on canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const dpr = window.devicePixelRatio || 1;
          const cssWidth = canvas.width / dpr;
          const cssHeight = canvas.height / dpr;
          const laneCount = selectedTrack.lanes.length;
          const laneWidth = cssWidth / laneCount;
          const px = (laneIndex + 0.5) * laneWidth;
          const py = cssHeight * 0.82; // Hit line level
          const laneColor = selectedTrack.lanes[laneIndex]?.colorHex || '#38BDF8';
          spawnParticles(px, py, laneColor, type === 'PERFECT' ? 24 : 14);
        }
      }
    },
    [selectedTrack.lanes]
  );

  // Core Lane Hit Handler (called by Keyboard, Touch/Click, Mic, MIDI)
  const handleLaneHit = useCallback(
    (laneIndex: number) => {
      if (gameState !== 'PLAYING') return;

      const lane = selectedTrack.lanes[laneIndex];
      if (!lane) return;

      // Play authentic acoustic piano sound for this note
      pianoSynth.playNote(lane.midiNote, 0.85, 0.7);

      // Flash hit lane visually in both Ref and State
      activeLanesRef.current[laneIndex] = true;
      setActiveLanesState((prev) => {
        const next = [...prev];
        next[laneIndex] = true;
        return next;
      });

      setTimeout(() => {
        activeLanesRef.current[laneIndex] = false;
        setActiveLanesState((prev) => {
          const next = [...prev];
          next[laneIndex] = false;
          return next;
        });
      }, 160);

      // Calculate current song elapsed time
      const currentTimeMs = performance.now() - gameStartTimeRef.current - pausedDurationRef.current;

      // Find the closest active unhit note in this specific lane
      const windowMs = 220; // Hit timing tolerance window
      let closestNoteIndex = -1;
      let minDelta = Infinity;

      const notes = notesStateRef.current;
      for (let i = 0; i < notes.length; i++) {
        const n = notes[i];
        if (n.laneIndex === laneIndex && !n.isHit && !n.isMissed) {
          const delta = currentTimeMs - n.targetTimeMs;
          const absDelta = Math.abs(delta);
          if (absDelta <= windowMs && absDelta < minDelta) {
            minDelta = absDelta;
            closestNoteIndex = i;
          }
        }
      }

      if (closestNoteIndex !== -1) {
        const targetNote = notes[closestNoteIndex];
        targetNote.isHit = true;

        const offsetMs = Math.round(currentTimeMs - targetNote.targetTimeMs);
        const absOffset = Math.abs(offsetMs);

        let judgment: JudgmentType = 'GOOD';
        if (absOffset <= 55) {
          judgment = 'PERFECT';
        } else if (absOffset <= 125) {
          judgment = 'GREAT';
        } else {
          judgment = 'GOOD';
        }

        recordJudgment(judgment, laneIndex, offsetMs);
      }
    },
    [gameState, selectedTrack.lanes, recordJudgment]
  );

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();

      // Find matching lane
      const laneIndex = selectedTrack.lanes.findIndex(
        (l) => l.keyLabel === key || l.keyNum === key
      );

      if (laneIndex !== -1) {
        e.preventDefault();
        handleLaneHit(laneIndex);
      } else if (e.code === 'Space') {
        // Space bar: hit the lane of the lowest unhit note currently near the hit line!
        e.preventDefault();
        const currentTimeMs = performance.now() - gameStartTimeRef.current - pausedDurationRef.current;
        let bestLane = -1;
        let minDelta = Infinity;
        notesStateRef.current.forEach((n) => {
          if (!n.isHit && !n.isMissed) {
            const absDelta = Math.abs(currentTimeMs - n.targetTimeMs);
            if (absDelta <= 220 && absDelta < minDelta) {
              minDelta = absDelta;
              bestLane = n.laneIndex;
            }
          }
        });
        if (bestLane !== -1) {
          handleLaneHit(bestLane);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTrack.lanes, handleLaneHit]);

  // Microphone and MIDI Integration
  useEffect(() => {
    let unsubNote: (() => void) | undefined;

    const handleAcousticEvent = (ev: PianoNoteEvent) => {
      setLastDetectedPitch(ev.noteName);

      // Check if event corresponds to any lane in current track
      const laneIndex = selectedTrack.lanes.findIndex((l) => {
        return (
          l.midiNote === ev.midiNote ||
          l.noteName === ev.noteName ||
          l.midiNote % 12 === ev.midiNote % 12
        );
      });

      if (laneIndex !== -1) {
        handleLaneHit(laneIndex);
      }
    };

    if (activeInputMode === 'microphone') {
      unsubNote = micAdapter.subscribe(handleAcousticEvent);
    } else if (activeInputMode === 'midi') {
      unsubNote = midiAdapter.subscribe(handleAcousticEvent);
    }

    return () => {
      unsubNote?.();
    };
  }, [activeInputMode, selectedTrack.lanes, handleLaneHit]);

  // Start / Restart Countdown
  const handleStartGame = () => {
    prepareTrackNotes(selectedTrack, speedMultiplier);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setJudgmentsCount({ PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 });
    setLastOffsetMs(null);
    setCurrentJudgment(null);
    pausedDurationRef.current = 0;
    lastTickBeatRef.current = -1;

    setCountdownNumber(3);
    setGameState('COUNTDOWN');

    // Countdown sounds
    pianoSynth.playMetronomeTick(true);

    const timer1 = setTimeout(() => {
      setCountdownNumber(2);
      pianoSynth.playMetronomeTick(false);
    }, 800);

    const timer2 = setTimeout(() => {
      setCountdownNumber(1);
      pianoSynth.playMetronomeTick(false);
    }, 1600);

    const timer3 = setTimeout(() => {
      setGameState('PLAYING');
      pianoSynth.playMetronomeTick(true);
      gameStartTimeRef.current = performance.now();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Pause / Resume
  const handlePauseToggle = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      pauseTimeRef.current = performance.now();
    } else if (gameState === 'PAUSED') {
      pausedDurationRef.current += performance.now() - pauseTimeRef.current;
      setGameState('PLAYING');
    }
  };

  // Canvas Size Synchronization Helper (handles DevicePixelRatio for High-DPI / Retina screens)
  const syncCanvasDpi = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
  }, []);

  useEffect(() => {
    syncCanvasDpi();
    window.addEventListener('resize', syncCanvasDpi);
    return () => window.removeEventListener('resize', syncCanvasDpi);
  }, [syncCanvasDpi]);

  // Main 60fps Native Canvas Game Loop - Renders smooth falling colored notes!
  useEffect(() => {
    let isRunning = true;

    const gameLoop = () => {
      if (!isRunning) return;

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const expectedW = Math.floor(rect.width * dpr);
        const expectedH = Math.floor(rect.height * dpr);

        if (canvas.width !== expectedW || canvas.height !== expectedH) {
          canvas.width = expectedW;
          canvas.height = expectedH;
        }

        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          const width = canvas.width / dpr;
          const height = canvas.height / dpr;

          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, width, height);

          const lanes = selectedTrack.lanes;
          const laneCount = lanes.length;
          const laneWidth = width / laneCount;
          const hitY = height * 0.82;

          // 1. Draw Lane Dividers & Active Key Beams
          for (let i = 0; i < laneCount; i++) {
            const lane = lanes[i];
            const laneX = i * laneWidth;
            const isLaneActive = activeLanesRef.current[i];

            // Divider line
            if (i > 0) {
              ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(laneX, 0);
              ctx.lineTo(laneX, height);
              ctx.stroke();
            }

            // Faint vertical guide in lane center
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.moveTo(laneX + laneWidth / 2, 0);
            ctx.lineTo(laneX + laneWidth / 2, height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Active hit beam
            if (isLaneActive) {
              const beamGrad = ctx.createLinearGradient(0, height, 0, 0);
              beamGrad.addColorStop(0, lane.glowColor);
              beamGrad.addColorStop(0.65, 'transparent');
              ctx.fillStyle = beamGrad;
              ctx.fillRect(laneX, 0, laneWidth, height);
            }
          }

          // 2. Draw Glowing Hit Target Line
          const lineGrad = ctx.createLinearGradient(0, hitY, width, hitY);
          lineGrad.addColorStop(0, 'rgba(34, 211, 238, 0.1)');
          lineGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.95)');
          lineGrad.addColorStop(1, 'rgba(34, 211, 238, 0.1)');
          ctx.strokeStyle = lineGrad;
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, hitY);
          ctx.lineTo(width, hitY);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 3. Draw Target Rings for Each Lane
          for (let i = 0; i < laneCount; i++) {
            const lane = lanes[i];
            const cx = (i + 0.5) * laneWidth;
            const isLaneActive = activeLanesRef.current[i];
            const baseRadius = Math.min(laneWidth * 0.36, 32);
            const radius = isLaneActive ? baseRadius * 1.25 : baseRadius;

            // Outer target circle
            ctx.beginPath();
            ctx.arc(cx, hitY, radius, 0, Math.PI * 2);
            if (isLaneActive) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fill();
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 3;
              ctx.shadowColor = '#FFFFFF';
              ctx.shadowBlur = 20;
            } else {
              ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
              ctx.fill();
              ctx.strokeStyle = lane.colorHex;
              ctx.lineWidth = 2.5;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Center target pip
            ctx.beginPath();
            ctx.arc(cx, hitY, isLaneActive ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = isLaneActive ? '#FFFFFF' : lane.colorHex;
            ctx.fill();
          }

          // 4. Live Game Simulation (Notes falling, metronome, miss checks)
          if (gameState === 'PLAYING') {
            const now = performance.now();
            const elapsedMs = now - gameStartTimeRef.current - pausedDurationRef.current;
            const msPerBeat = 60000 / (selectedTrack.bpm * speedMultiplier);

            // Metronome Beat Sound
            if (isMetronomeEnabled) {
              const leadInMs = 2400;
              if (elapsedMs >= leadInMs) {
                const currentBeat = Math.floor((elapsedMs - leadInMs) / msPerBeat);
                if (currentBeat > lastTickBeatRef.current && currentBeat < selectedTrack.totalBeats) {
                  lastTickBeatRef.current = currentBeat;
                  const isAccent = currentBeat % selectedTrack.timeSignature[0] === 0;
                  pianoSynth.playMetronomeTick(isAccent);
                }
              }
            }

            // Check Missed Notes
            const notes = notesStateRef.current;
            for (let i = 0; i < notes.length; i++) {
              const n = notes[i];
              if (!n.isHit && !n.isMissed) {
                if (elapsedMs - n.targetTimeMs > 200) {
                  n.isMissed = true;
                  recordJudgment('MISS', n.laneIndex, 0);
                }
              }
            }

            // Check Completion
            const allResolved = notes.every((n) => n.isHit || n.isMissed);
            const lastNoteTarget = notes[notes.length - 1]?.targetTimeMs || 0;
            if (allResolved && elapsedMs > lastNoteTarget + 800) {
              setGameState('FINISHED');
              confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
              const praise = '你是最棒的！節奏掌握得太出色了，聽你的琴聲就像在聽一場歡樂的音樂會！';
              speechGuide.speak(praise, { emotion: 'celebrating' });
            }

            // 5. Render Silky-Smooth Falling Colored Notes!
            for (let i = 0; i < notes.length; i++) {
              const note = notes[i];
              if (note.isHit || note.isMissed) continue;

              const timeUntilHit = note.targetTimeMs - elapsedMs;
              // Render if within active window (from top of runway to slightly past hit line)
              if (timeUntilHit > fallDurationMs || timeUntilHit < -180) continue;

              // Smooth 0.0 -> 1.0 progress as note falls from top (0) to hit line (hitY)
              const progress = 1.0 - timeUntilHit / fallDurationMs;
              const noteY = progress * hitY;

              const lane = lanes[note.laneIndex];
              if (!lane) continue;

              const laneCenterX = (note.laneIndex + 0.5) * laneWidth;
              const noteW = Math.min(laneWidth * 0.84, 96);
              const noteH = 46;
              const noteX = laneCenterX - noteW / 2;
              const noteTopY = noteY - noteH / 2;

              // Motion streak trail behind note
              const trailHeight = 36;
              const trailGrad = ctx.createLinearGradient(laneCenterX, noteTopY, laneCenterX, noteTopY - trailHeight);
              trailGrad.addColorStop(0, lane.glowColor);
              trailGrad.addColorStop(1, 'transparent');
              ctx.fillStyle = trailGrad;
              ctx.beginPath();
              ctx.moveTo(noteX + 8, noteTopY);
              ctx.lineTo(laneCenterX, noteTopY - trailHeight);
              ctx.lineTo(noteX + noteW - 8, noteTopY);
              ctx.closePath();
              ctx.fill();

              // Glowing note pill body
              ctx.save();
              ctx.shadowColor = lane.glowColor;
              ctx.shadowBlur = 18;

              // Gradient fill
              const noteGrad = ctx.createLinearGradient(noteX, noteTopY, noteX, noteTopY + noteH);
              noteGrad.addColorStop(0, '#FFFFFF');
              noteGrad.addColorStop(0.35, lane.colorHex);
              noteGrad.addColorStop(1, lane.colorHex);

              ctx.fillStyle = noteGrad;
              drawRoundedRect(ctx, noteX, noteTopY, noteW, noteH, 16);
              ctx.fill();

              // Border
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.lineWidth = 2.5;
              ctx.stroke();
              ctx.restore();

              // Solfege text (e.g. Do, Re, Mi)
              ctx.fillStyle = '#FFFFFF';
              ctx.font = '900 17px system-ui, -apple-system, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
              ctx.shadowBlur = 4;
              ctx.fillText(note.solfege, laneCenterX, noteY - 6);

              // Lyric or Note Name text (e.g. "熱", "C4")
              ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
              ctx.font = '700 12px system-ui, -apple-system, sans-serif';
              ctx.fillText(note.lyrics || note.noteName, laneCenterX, noteY + 11);
              ctx.shadowBlur = 0;
            }
          }

          // 6. Draw Animated Particles
          const particles = particlesRef.current;
          for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
            const p = particles[pIdx];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
              particles.splice(pIdx, 1);
            } else {
              ctx.save();
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, selectedTrack, speedMultiplier, isMetronomeEnabled, recordJudgment]);

  // Save High Score on Finished
  useEffect(() => {
    if (gameState === 'FINISHED') {
      const prevBest = highScores[selectedTrack.id] || 0;
      if (score > prevBest) {
        const nextScores = { ...highScores, [selectedTrack.id]: score };
        setHighScores(nextScores);
        try {
          localStorage.setItem('rhythm_catch_high_scores', JSON.stringify(nextScores));
        } catch {
          // ignore
        }
      }
    }
  }, [gameState, score, selectedTrack.id, highScores]);

  // Calculate Accuracy Percentage
  const totalNotes = selectedTrack.notes.length;
  const totalHits =
    judgmentsCount.PERFECT + judgmentsCount.GREAT + judgmentsCount.GOOD;
  const accuracyPercent =
    totalNotes > 0 ? Math.round((totalHits / totalNotes) * 100) : 0;

  // Calculate Letter Grade
  const calculateGrade = () => {
    if (accuracyPercent >= 98 && judgmentsCount.PERFECT >= totalNotes * 0.8) return 'SSS';
    if (accuracyPercent >= 95) return 'SS';
    if (accuracyPercent >= 90) return 'S';
    if (accuracyPercent >= 80) return 'A';
    if (accuracyPercent >= 65) return 'B';
    return 'C';
  };

  const isFever = combo >= 10;

  return (
    <div className={`w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden ${className}`}>
      {/* Top Header HUD */}
      <header className="h-16 px-4 md:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 z-20 backdrop-blur-md">
        {/* Left: Back & Track Name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToMap}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-semibold border border-slate-700 transition active:scale-95 whitespace-nowrap flex items-center gap-1.5"
            title="返回主選單"
          >
            <span>←</span>
            <span className="hidden sm:inline">返回</span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm md:text-base font-black text-amber-300 truncate">
                ⚡ {selectedTrack.title}
              </span>
              <span className="hidden sm:inline text-xs text-slate-400">
                · {selectedTrack.composer}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{selectedTrack.lanes.length} 軌道</span>
              <span>·</span>
              <span>{Math.round(selectedTrack.bpm * speedMultiplier)} BPM</span>
            </div>
          </div>
        </div>

        {/* Center: Live Performance Score & Combo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 tracking-wider uppercase">Score</span>
            <span className="text-base sm:text-xl md:text-2xl font-black font-mono tabular-nums text-white tracking-tight">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 tracking-wider uppercase">Combo</span>
            <div className="flex items-center gap-1">
              <span
                className={`text-base sm:text-xl md:text-2xl font-black font-mono tabular-nums transition-transform ${
                  isFever
                    ? 'text-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse'
                    : combo > 0
                    ? 'text-sky-400'
                    : 'text-slate-500'
                }`}
              >
                {combo}
              </span>
              {isFever && (
                <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                  Fever!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Controls & Input Mode */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Metronome Toggle */}
          <button
            onClick={() => setIsMetronomeEnabled(!isMetronomeEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold transition ${
              isMetronomeEnabled
                ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={isMetronomeEnabled ? '節拍音效：開啟' : '節拍音效：關閉'}
          >
            {isMetronomeEnabled ? '🔔 節拍' : '🔕 靜音'}
          </button>

          {/* Input Mode Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setActiveInputMode('keyboard')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeInputMode === 'keyboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ⌨️ 鍵盤
            </button>
            <button
              onClick={async () => {
                setActiveInputMode('microphone');
                if (!isMicRunning) {
                  try {
                    await micAdapter.start();
                    setIsMicRunning(true);
                  } catch {
                    // ignore
                  }
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeInputMode === 'microphone'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🎙️ 聽琴
            </button>
            <button
              onClick={() => setActiveInputMode('midi')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                activeInputMode === 'midi'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🎹 MIDI
            </button>
          </div>

          {/* Pause / Play button */}
          {gameState === 'PLAYING' && (
            <button
              onClick={handlePauseToggle}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition active:scale-95"
              title="暫停"
            >
              ⏸
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 overflow-hidden">
        {/* Left Side: Track Selection & Settings Drawer */}
        <aside className="w-full md:w-72 lg:w-80 bg-slate-900/60 border-r border-slate-800 p-3 sm:p-4 flex flex-col gap-3 shrink-0 overflow-y-auto z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              精選曲目清單
            </span>
            <span className="text-xs text-amber-400 font-mono">
              最佳: {(highScores[selectedTrack.id] || 0).toLocaleString()}
            </span>
          </div>

          {/* Track Cards */}
          <div className="flex flex-col gap-2">
            {RHYTHM_CATCH_TRACKS.map((track) => {
              const isSelected = track.id === selectedTrack.id;
              const trackBest = highScores[track.id];
              return (
                <button
                  key={track.id}
                  onClick={() => {
                    if (gameState === 'PLAYING') setGameState('IDLE');
                    setSelectedTrack(track);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{track.badgeIcon}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate">
                        {track.title}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {track.mentorName} · {track.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {trackBest !== undefined && (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                      ★ {trackBest}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Speed Multiplier Segmented Control */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400">速度乘數 (Tempo)</span>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {[
                { val: 0.75, label: '0.75x' },
                { val: 1.0, label: '1.0x' },
                { val: 1.25, label: '1.25x' },
                { val: 1.5, label: '1.5x' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setSpeedMultiplier(val)}
                  className={`py-1 rounded-lg text-xs font-semibold transition ${
                    speedMultiplier === val
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Timing Offset Gauge (Educational Precision Meter) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">精準打擊校正儀</span>
              <span
                className={`font-mono font-bold ${
                  lastOffsetMs === null
                    ? 'text-slate-500'
                    : Math.abs(lastOffsetMs) <= 55
                    ? 'text-emerald-400'
                    : Math.abs(lastOffsetMs) <= 125
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {lastOffsetMs === null
                  ? '-- ms'
                  : `${lastOffsetMs > 0 ? '+' : ''}${lastOffsetMs}ms`}
              </span>
            </div>

            {/* Visual Balance Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full relative overflow-hidden flex items-center justify-center">
              {/* Center Perfect Zone */}
              <div className="w-6 h-full bg-emerald-500/40 border-x border-emerald-400/60" />
              {/* Pointer Indicator */}
              {lastOffsetMs !== null && (
                <div
                  className="absolute top-0 bottom-0 w-2 rounded-full bg-amber-300 shadow-md transition-all duration-75"
                  style={{
                    left: `${Math.min(96, Math.max(4, 50 + (lastOffsetMs / 200) * 50))}%`,
                    transform: 'translateX(-50%)',
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>◀ 偏快 (Early)</span>
              <span className="text-emerald-400">◎ 完美</span>
              <span>偏慢 (Late) ▶</span>
            </div>
          </div>

          {/* Microphone & Pitch Live Feedback */}
          {activeInputMode === 'microphone' && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isMicRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="text-emerald-300 font-medium">琴音辨識模式</span>
              </div>
              <span className="font-mono text-emerald-200 font-bold">
                {lastDetectedPitch ? `音高: ${lastDetectedPitch}` : '等待落鍵...'}
              </span>
            </div>
          )}
        </aside>

        {/* Center: Rhythm Runway Playfield Container */}
        <div className="flex-1 relative flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
          {/* Vertical Rhythm Runway with Canvas Engine */}
          <div className="w-full h-full max-w-2xl mx-auto relative border-x border-slate-800/80 bg-slate-950/40 shadow-2xl flex flex-col overflow-hidden">
            {/* Native 60fps Rhythm Engine Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
            />

            {/* Floating Live Judgment Popup */}
            {currentJudgment && Date.now() - currentJudgment.timestamp < 650 && (
              <div
                key={currentJudgment.id}
                className="absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none animate-bounce"
              >
                <span
                  className={`text-2xl md:text-4xl font-black italic tracking-wider drop-shadow-md ${
                    currentJudgment.type === 'PERFECT'
                      ? 'text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.9)]'
                      : currentJudgment.type === 'GREAT'
                      ? 'text-sky-300 drop-shadow-[0_0_12px_rgba(125,211,252,0.8)]'
                      : currentJudgment.type === 'GOOD'
                      ? 'text-emerald-300'
                      : 'text-rose-400'
                  }`}
                >
                  {currentJudgment.type === 'PERFECT'
                    ? '★ PERFECT ★'
                    : currentJudgment.type === 'GREAT'
                    ? 'GREAT!'
                    : currentJudgment.type === 'GOOD'
                    ? 'GOOD'
                    : 'MISS'}
                </span>
                {currentJudgment.type !== 'MISS' && (
                  <span className="text-xs font-mono font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700">
                    {currentJudgment.offsetMs > 0 ? '+' : ''}
                    {currentJudgment.offsetMs} ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bottom Hit Pads for Touch / Mouse / Visual Input (Touch targets >= 56px) */}
          <div className="w-full max-w-2xl mx-auto px-2 py-3 bg-slate-900/90 border-t border-slate-800 flex gap-2 justify-center z-15 backdrop-blur-md">
            {selectedTrack.lanes.map((lane, index) => {
              const isActive = activeLanesState[index];
              return (
                <button
                  key={`pad-${index}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleLaneHit(index);
                  }}
                  className={`flex-1 py-3 sm:py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 cursor-pointer touch-manipulation ${
                    isActive
                      ? 'bg-white text-slate-900 border-white scale-102 shadow-[0_0_20px_white]'
                      : 'bg-slate-800/90 hover:bg-slate-800 text-white'
                  }`}
                  style={{
                    borderColor: isActive ? '#FFFFFF' : lane.colorHex,
                  }}
                >
                  <span className="text-base sm:text-lg font-black leading-tight">
                    {lane.solfege}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                    <span className="px-1.5 py-0.2 bg-slate-950/70 rounded border border-slate-700">
                      {lane.keyLabel}
                    </span>
                    <span>/</span>
                    <span className="px-1.5 py-0.2 bg-slate-950/70 rounded border border-slate-700">
                      {lane.keyNum}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Idle / Title Overlay Screen */}
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 p-1 flex items-center justify-center shadow-2xl mb-4 animate-pulse">
                <span className="text-5xl">{selectedTrack.badgeIcon}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                ⚡ 節奏捕捉 Rhythm Catch
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed mb-6">
                彩色音符從天而降！當音符緩緩落下至底部判定線的瞬間，
                <br />
                <strong>敲擊琴鍵、敲擊電腦鍵盤或輕觸螢幕</strong>，訓練精準節拍節奏感！
              </p>

              {/* Input Mode Guide */}
              <div className="grid grid-cols-3 gap-2 max-w-md w-full mb-6 text-left">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-xs font-bold text-sky-400 block mb-0.5">⌨️ 電腦鍵盤</span>
                  <span className="text-[11px] text-slate-400 block">
                    按鍵 {selectedTrack.lanes.map((l) => l.keyLabel).join(', ')} 或 1~5
                  </span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-xs font-bold text-emerald-400 block mb-0.5">🎙️ 真實鋼琴</span>
                  <span className="text-[11px] text-slate-400 block">
                    麥克風即時聽琴，精準辨識彈奏
                  </span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-xs font-bold text-purple-400 block mb-0.5">📱 螢幕觸控</span>
                  <span className="text-[11px] text-slate-400 block">
                    輕敲底部彩色打擊板即時打拍
                  </span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-base md:text-lg font-black shadow-xl shadow-blue-500/30 transition-all active:scale-95"
              >
                ▶ 開始挑戰 《{selectedTrack.title}》
              </button>
            </div>
          )}

          {/* Countdown Overlay (3-2-1-GO!) */}
          {gameState === 'COUNTDOWN' && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-30 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-7xl sm:text-9xl font-black font-mono text-amber-400 animate-ping">
                {countdownNumber}
              </span>
              <span className="text-base text-slate-300 font-bold mt-4">
                準備好，聽節拍落鍵！
              </span>
            </div>
          )}

          {/* Pause Overlay */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4 p-6">
              <h3 className="text-2xl font-black text-white">遊戲已暫停</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePauseToggle}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition active:scale-95"
                >
                  ▶ 繼續遊戲
                </button>
                <button
                  onClick={handleStartGame}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition active:scale-95"
                >
                  🔄 重新開始
                </button>
              </div>
            </div>
          )}

          {/* Victory & Completion Summary Modal */}
          {gameState === 'FINISHED' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg z-30 flex flex-col items-center justify-center p-4 overflow-y-auto">
              <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-fade-in">
                {/* Grade Badge */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-3xl font-black shadow-lg mb-3 ring-4 ring-amber-300/40">
                  {calculateGrade()}
                </div>

                <h3 className="text-2xl font-black text-white">通關大成功！</h3>
                <p className="text-xs text-amber-300 font-bold mb-4">
                  {selectedTrack.themeDescription}
                </p>

                {/* Score & Accuracy Breakdown */}
                <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 mb-5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs text-slate-400">總得分</span>
                    <span className="text-xl font-mono font-black text-amber-300">
                      {score.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs text-slate-400">最大連擊 (Max Combo)</span>
                    <span className="text-sm font-mono font-black text-sky-400">
                      {maxCombo} Combo
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-xs text-slate-400">節奏準確率 (Accuracy)</span>
                    <span className="text-sm font-mono font-black text-emerald-400">
                      {accuracyPercent}%
                    </span>
                  </div>

                  {/* Timing Counts */}
                  <div className="grid grid-cols-4 gap-1 pt-1 text-center font-mono">
                    <div className="bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/20">
                      <span className="text-[10px] text-amber-400 block font-bold">PERFECT</span>
                      <span className="text-xs font-black text-white">{judgmentsCount.PERFECT}</span>
                    </div>
                    <div className="bg-sky-950/40 p-1.5 rounded-lg border border-sky-500/20">
                      <span className="text-[10px] text-sky-400 block font-bold">GREAT</span>
                      <span className="text-xs font-black text-white">{judgmentsCount.GREAT}</span>
                    </div>
                    <div className="bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-400 block font-bold">GOOD</span>
                      <span className="text-xs font-black text-white">{judgmentsCount.GOOD}</span>
                    </div>
                    <div className="bg-rose-950/40 p-1.5 rounded-lg border border-rose-500/20">
                      <span className="text-[10px] text-rose-400 block font-bold">MISS</span>
                      <span className="text-xs font-black text-white">{judgmentsCount.MISS}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={handleStartGame}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-sm shadow-md transition active:scale-95"
                  >
                    🔄 再玩一次
                  </button>
                  <button
                    onClick={() => {
                      const curIndex = RHYTHM_CATCH_TRACKS.findIndex((t) => t.id === selectedTrack.id);
                      const nextTrack = RHYTHM_CATCH_TRACKS[(curIndex + 1) % RHYTHM_CATCH_TRACKS.length];
                      setSelectedTrack(nextTrack);
                      setGameState('IDLE');
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-black text-sm transition active:scale-95"
                  >
                    ⏭ 下一首挑戰
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
