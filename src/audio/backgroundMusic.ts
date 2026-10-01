/**
 * Gentle Background Music (BGM) Engine for Kai's Musical World
 *
 * Synthesizes soft, comforting music box / gentle acoustic piano lullabies
 * using Web Audio API so it works 100% reliably, offline, with zero external network lag.
 *
 * Automatically pauses during lesson practice and resumes when returning to maps!
 */

export interface BgmTrack {
  id: string;
  name: string;
  composer: string;
  bpm: number;
  notes: { midi: number; duration: number }[]; // duration in beats
}

export const BGM_PLAYLIST: BgmTrack[] = [
  {
    id: 'twinkle',
    name: '小星星 (溫柔八音盒)',
    composer: '莫札特主題',
    bpm: 68,
    notes: [
      { midi: 72, duration: 1 }, { midi: 72, duration: 1 }, { midi: 79, duration: 1 }, { midi: 79, duration: 1 },
      { midi: 81, duration: 1 }, { midi: 81, duration: 1 }, { midi: 79, duration: 2 },
      { midi: 77, duration: 1 }, { midi: 77, duration: 1 }, { midi: 76, duration: 1 }, { midi: 76, duration: 1 },
      { midi: 74, duration: 1 }, { midi: 74, duration: 1 }, { midi: 72, duration: 2 },
      { midi: 79, duration: 1 }, { midi: 79, duration: 1 }, { midi: 77, duration: 1 }, { midi: 77, duration: 1 },
      { midi: 76, duration: 1 }, { midi: 76, duration: 1 }, { midi: 74, duration: 2 },
      { midi: 79, duration: 1 }, { midi: 79, duration: 1 }, { midi: 77, duration: 1 }, { midi: 77, duration: 1 },
      { midi: 76, duration: 1 }, { midi: 76, duration: 1 }, { midi: 74, duration: 2 },
      { midi: 72, duration: 1 }, { midi: 72, duration: 1 }, { midi: 79, duration: 1 }, { midi: 79, duration: 1 },
      { midi: 81, duration: 1 }, { midi: 81, duration: 1 }, { midi: 79, duration: 2 },
      { midi: 77, duration: 1 }, { midi: 77, duration: 1 }, { midi: 76, duration: 1 }, { midi: 76, duration: 1 },
      { midi: 74, duration: 1 }, { midi: 74, duration: 1 }, { midi: 72, duration: 2.5 },
    ],
  },
  {
    id: 'mary',
    name: '瑪莉有隻小羊 (童趣小品)',
    composer: '傳統兒歌',
    bpm: 72,
    notes: [
      { midi: 76, duration: 1 }, { midi: 74, duration: 1 }, { midi: 72, duration: 1 }, { midi: 74, duration: 1 },
      { midi: 76, duration: 1 }, { midi: 76, duration: 1 }, { midi: 76, duration: 2 },
      { midi: 74, duration: 1 }, { midi: 74, duration: 1 }, { midi: 74, duration: 2 },
      { midi: 76, duration: 1 }, { midi: 79, duration: 1 }, { midi: 79, duration: 2 },
      { midi: 76, duration: 1 }, { midi: 74, duration: 1 }, { midi: 72, duration: 1 }, { midi: 74, duration: 1 },
      { midi: 76, duration: 1 }, { midi: 76, duration: 1 }, { midi: 76, duration: 1 }, { midi: 76, duration: 1 },
      { midi: 74, duration: 1 }, { midi: 74, duration: 1 }, { midi: 76, duration: 1 }, { midi: 74, duration: 1 },
      { midi: 72, duration: 3 },
    ],
  },
  {
    id: 'bee',
    name: '小蜜蜂 (森林微風)',
    composer: '波希米亞民謠',
    bpm: 76,
    notes: [
      { midi: 79, duration: 1 }, { midi: 76, duration: 1 }, { midi: 76, duration: 2 },
      { midi: 77, duration: 1 }, { midi: 74, duration: 1 }, { midi: 74, duration: 2 },
      { midi: 72, duration: 1 }, { midi: 74, duration: 1 }, { midi: 76, duration: 1 }, { midi: 77, duration: 1 },
      { midi: 79, duration: 1 }, { midi: 79, duration: 1 }, { midi: 79, duration: 2 },
      { midi: 79, duration: 1 }, { midi: 76, duration: 1 }, { midi: 76, duration: 2 },
      { midi: 77, duration: 1 }, { midi: 74, duration: 1 }, { midi: 74, duration: 2 },
      { midi: 72, duration: 1 }, { midi: 76, duration: 1 }, { midi: 79, duration: 1 }, { midi: 79, duration: 1 },
      { midi: 72, duration: 3 },
    ],
  },
];

class BackgroundMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.16; // Soft gentle background volume (16%)
  private currentTrackIdx = 0;
  private noteTimer: ReturnType<typeof setTimeout> | null = null;
  private noteIdx = 0;
  private isPausedByLesson = false;
  private listeners: Set<() => void> = new Set();

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private playMusicBoxNote(midi: number, durationSec: number): void {
    if (this.isMuted || !this.isPlaying) return;
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const freq = this.midiToFreq(midi);

    // Warm, bell-like music box oscillator pair
    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Second chime harmonic (2x freq with slight shimmer detuning)
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, now);
    oscHarmonic.detune.setValueAtTime(2.5, now);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.25, now);

    // Soft music box envelope (instant bell ping + smooth chime decay)
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(2.5, durationSec * 1.4));

    osc.connect(gain);
    oscHarmonic.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 2.5);
    oscHarmonic.stop(now + 2.5);
  }

  private scheduleNextNote(): void {
    if (!this.isPlaying) return;
    const track = BGM_PLAYLIST[this.currentTrackIdx];
    if (!track) return;

    if (this.noteIdx >= track.notes.length) {
      // Loop to beginning of track or next track with a relaxing 1.5s pause
      this.noteIdx = 0;
      this.noteTimer = setTimeout(() => {
        this.scheduleNextNote();
      }, 1500);
      return;
    }

    const n = track.notes[this.noteIdx];
    const beatMs = (60 / track.bpm) * 1000;
    const durationMs = n.duration * beatMs;

    this.playMusicBoxNote(n.midi, durationMs / 1000);
    this.noteIdx++;

    this.noteTimer = setTimeout(() => {
      this.scheduleNextNote();
    }, durationMs);
  }

  public start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.isPausedByLesson = false;
    this.scheduleNextNote();
    this.notify();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.noteTimer) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
    this.notify();
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime
      );
    }
    this.notify();
  }

  public nextTrack(): void {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % BGM_PLAYLIST.length;
    this.noteIdx = 0;
    if (this.noteTimer) {
      clearTimeout(this.noteTimer);
      this.noteTimer = null;
    }
    if (this.isPlaying) {
      this.scheduleNextNote();
    }
    this.notify();
  }

  /**
   * Called automatically when entering a lesson practice view
   */
  public autoPauseForLesson(): void {
    if (this.isPlaying) {
      this.isPausedByLesson = true;
      this.pause();
    }
  }

  /**
   * Called automatically when leaving a lesson view back to maps
   */
  public autoResumeFromLesson(): void {
    if (this.isPausedByLesson) {
      this.isPausedByLesson = false;
      this.start();
    }
  }

  public setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1.0, v));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrack: BGM_PLAYLIST[this.currentTrackIdx],
      currentTrackIdx: this.currentTrackIdx,
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const bgmEngine = new BackgroundMusicEngine();
