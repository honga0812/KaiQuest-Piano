import { midiToFrequency } from '../utils/musicMath';

export interface BGMTrack {
  id: string;
  name: string;
  composer: string;
  tempo: number; // in BPM
  notes: { midi: number; duration: number }[]; // duration in beats
}

export const BGM_PLAYLIST: BGMTrack[] = [
  {
    id: 'twinkle',
    name: '小星星輕音樂',
    composer: '莫札特主題',
    tempo: 72,
    notes: [
      { midi: 60, duration: 1 }, { midi: 60, duration: 1 }, { midi: 67, duration: 1 }, { midi: 67, duration: 1 },
      { midi: 69, duration: 1 }, { midi: 69, duration: 1 }, { midi: 67, duration: 2 },
      { midi: 65, duration: 1 }, { midi: 65, duration: 1 }, { midi: 64, duration: 1 }, { midi: 64, duration: 1 },
      { midi: 62, duration: 1 }, { midi: 62, duration: 1 }, { midi: 60, duration: 2 },
      { midi: 67, duration: 1 }, { midi: 67, duration: 1 }, { midi: 65, duration: 1 }, { midi: 65, duration: 1 },
      { midi: 64, duration: 1 }, { midi: 64, duration: 1 }, { midi: 62, duration: 2 },
      { midi: 67, duration: 1 }, { midi: 67, duration: 1 }, { midi: 65, duration: 1 }, { midi: 65, duration: 1 },
      { midi: 64, duration: 1 }, { midi: 64, duration: 1 }, { midi: 62, duration: 2 },
      { midi: 60, duration: 1 }, { midi: 60, duration: 1 }, { midi: 67, duration: 1 }, { midi: 67, duration: 1 },
      { midi: 69, duration: 1 }, { midi: 69, duration: 1 }, { midi: 67, duration: 2 },
      { midi: 65, duration: 1 }, { midi: 65, duration: 1 }, { midi: 64, duration: 1 }, { midi: 64, duration: 1 },
      { midi: 62, duration: 1 }, { midi: 62, duration: 1 }, { midi: 60, duration: 3 },
    ],
  },
  {
    id: 'ode_to_joy',
    name: '快樂頌微風旋律',
    composer: '貝多芬',
    tempo: 80,
    notes: [
      { midi: 64, duration: 1 }, { midi: 64, duration: 1 }, { midi: 65, duration: 1 }, { midi: 67, duration: 1 },
      { midi: 67, duration: 1 }, { midi: 65, duration: 1 }, { midi: 64, duration: 1 }, { midi: 62, duration: 1 },
      { midi: 60, duration: 1 }, { midi: 60, duration: 1 }, { midi: 62, duration: 1 }, { midi: 64, duration: 1 },
      { midi: 64, duration: 1.5 }, { midi: 62, duration: 0.5 }, { midi: 62, duration: 2 },
      { midi: 64, duration: 1 }, { midi: 64, duration: 1 }, { midi: 65, duration: 1 }, { midi: 67, duration: 1 },
      { midi: 67, duration: 1 }, { midi: 65, duration: 1 }, { midi: 64, duration: 1 }, { midi: 62, duration: 1 },
      { midi: 60, duration: 1 }, { midi: 60, duration: 1 }, { midi: 62, duration: 1 }, { midi: 64, duration: 1 },
      { midi: 62, duration: 1.5 }, { midi: 60, duration: 0.5 }, { midi: 60, duration: 2 },
    ],
  },
  {
    id: 'mary_lamb',
    name: '瑪莉有隻小羊',
    composer: '童謠輕曲',
    tempo: 78,
    notes: [
      { midi: 64, duration: 1 }, { midi: 62, duration: 1 }, { midi: 60, duration: 1 }, { midi: 62, duration: 1 },
      { midi: 64, duration: 1 }, { midi: 64, duration: 1 }, { midi: 64, duration: 2 },
      { midi: 62, duration: 1 }, { midi: 62, duration: 1 }, { midi: 62, duration: 2 },
      { midi: 64, duration: 1 }, { midi: 67, duration: 1 }, { midi: 67, duration: 2 },
      { midi: 64, duration: 1 }, { midi: 62, duration: 1 }, { midi: 60, duration: 1 }, { midi: 62, duration: 1 },
      { midi: 64, duration: 1 }, { midi: 64, duration: 1 }, { midi: 64, duration: 1 }, { midi: 64, duration: 1 },
      { midi: 62, duration: 1 }, { midi: 62, duration: 1 }, { midi: 64, duration: 1 }, { midi: 62, duration: 1 },
      { midi: 60, duration: 3 },
    ],
  },
  {
    id: 'brahms_lullaby',
    name: '布拉姆斯搖籃曲',
    composer: '布拉姆斯',
    tempo: 68,
    notes: [
      { midi: 64, duration: 1 }, { midi: 64, duration: 1.5 }, { midi: 67, duration: 0.5 },
      { midi: 64, duration: 1 }, { midi: 64, duration: 1.5 }, { midi: 67, duration: 0.5 },
      { midi: 64, duration: 1 }, { midi: 67, duration: 1 }, { midi: 72, duration: 2 },
      { midi: 71, duration: 1.5 }, { midi: 69, duration: 0.5 }, { midi: 69, duration: 1 },
      { midi: 67, duration: 2 },
    ],
  },
];

class BGMManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isLessonMuted = false;
  private currentTrackIndex = 0;
  private noteTimer: number | null = null;
  private currentNoteIndex = 0;
  private userEnabled = false; // By default off or on per user preference
  private volume = 0.12; // soft background level (12%)
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Check saved state
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kai_bgm_enabled');
      if (saved !== null) {
        this.userEnabled = saved === 'true';
      }
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play sweet, warm acoustic celesta / bell piano tone
   */
  private playSoftTone(midi: number, durationSec: number): void {
    if (!this.isPlaying || this.isLessonMuted || !this.userEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const freq = midiToFrequency(midi);

      const osc = ctx.createOscillator();
      const oscHarm = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscHarm.type = 'triangle';
      oscHarm.frequency.setValueAtTime(freq * 2, now);

      // Soft music-box / celesta envelope
      toneGain.gain.setValueAtTime(0.0001, now);
      toneGain.gain.linearRampToValueAtTime(this.volume * 0.9, now + 0.04);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 1.15);

      osc.connect(toneGain);
      oscHarm.connect(toneGain);
      toneGain.connect(this.masterGain!);

      osc.start(now);
      oscHarm.start(now);
      osc.stop(now + durationSec * 1.2);
      oscHarm.stop(now + durationSec * 1.2);
    } catch {
      // AudioContext may be suspended or awaiting gesture
    }
  }

  private scheduleNextNote(): void {
    if (!this.isPlaying || this.isLessonMuted || !this.userEnabled) return;

    const track = BGM_PLAYLIST[this.currentTrackIndex];
    if (!track) return;

    const note = track.notes[this.currentNoteIndex];
    const beatMs = (60 / track.tempo) * 1000;
    const noteDurationMs = note.duration * beatMs;

    this.playSoftTone(note.midi, note.duration * (60 / track.tempo));

    this.currentNoteIndex++;
    if (this.currentNoteIndex >= track.notes.length) {
      this.currentNoteIndex = 0;
      // Loop or go to next track
      this.currentTrackIndex = (this.currentTrackIndex + 1) % BGM_PLAYLIST.length;
      this.notify();
    }

    this.noteTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, noteDurationMs);
  }

  public start(): void {
    if (this.isPlaying) return;
    this.userEnabled = true;
    this.isPlaying = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kai_bgm_enabled', 'true');
    }
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.scheduleNextNote();
    this.notify();
  }

  public stop(): void {
    this.isPlaying = false;
    this.userEnabled = false;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kai_bgm_enabled', 'false');
    }
    if (this.noteTimer !== null) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
    this.notify();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Automatically pauses when child enters a lesson so practice and mic detection are 100% clean
   */
  public pauseForLesson(): void {
    this.isLessonMuted = true;
    if (this.noteTimer !== null) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
    this.notify();
  }

  /**
   * Automatically resumes softly when child leaves the lesson
   */
  public resumeFromLesson(): void {
    this.isLessonMuted = false;
    if (this.userEnabled && !this.isPlaying) {
      this.start();
    } else if (this.userEnabled && this.isPlaying && this.noteTimer === null) {
      this.scheduleNextNote();
    }
    this.notify();
  }

  public nextTrack(): void {
    if (this.noteTimer !== null) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
    this.currentTrackIndex = (this.currentTrackIndex + 1) % BGM_PLAYLIST.length;
    this.currentNoteIndex = 0;
    if (this.isPlaying && !this.isLessonMuted) {
      this.scheduleNextNote();
    }
    this.notify();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(0.3, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public getState() {
    return {
      isPlaying: this.isPlaying && !this.isLessonMuted && this.userEnabled,
      userEnabled: this.userEnabled,
      isLessonMuted: this.isLessonMuted,
      currentTrack: BGM_PLAYLIST[this.currentTrackIndex],
      volume: this.volume,
    };
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb());
  }
}

export const bgmManager = new BGMManager();
