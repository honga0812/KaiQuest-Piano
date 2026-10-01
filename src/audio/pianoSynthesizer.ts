import { midiToFrequency } from '../utils/musicMath';

class PianoSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeVoices: Map<number, { oscillators: OscillatorNode[]; gain: GainNode }> = new Map();

  constructor() {
    this.attachAutoUnlock();
  }

  private attachAutoUnlock(): void {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
  }

  public async resume(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx && (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted')) {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Triggers a realistic acoustic piano note
   */
  public playNote(midiNote: number, velocity = 0.8, duration = 1.2): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const freq = midiToFrequency(midiNote);

    // Stop existing voice on this note if any
    this.stopNote(midiNote);

    // Voice envelope
    const voiceGain = ctx.createGain();
    const vel = Math.max(0.1, Math.min(1.0, velocity));
    voiceGain.gain.setValueAtTime(0.0001, now);
    // Instant attack (hammer impact)
    voiceGain.gain.linearRampToValueAtTime(vel * 0.6, now + 0.008);
    // Exponential acoustic decay
    voiceGain.gain.exponentialRampToValueAtTime(vel * 0.25, now + 0.2);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Multi-harmonic synthesis for warm acoustic piano timbre
    const harmonics = [
      { mult: 1, amp: 1.0, type: 'sine' as OscillatorType },
      { mult: 2, amp: 0.5, type: 'sine' as OscillatorType },
      { mult: 3, amp: 0.25, type: 'triangle' as OscillatorType },
      { mult: 4, amp: 0.12, type: 'sine' as OscillatorType },
      { mult: 5, amp: 0.05, type: 'sine' as OscillatorType },
    ];

    const oscs: OscillatorNode[] = [];

    harmonics.forEach(({ mult, amp, type }) => {
      const osc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      
      osc.type = type;
      // Slight acoustic string detuning
      const detune = (Math.random() - 0.5) * 4;
      osc.frequency.setValueAtTime(freq * mult, now);
      osc.detune.setValueAtTime(detune, now);
      
      harmGain.gain.setValueAtTime(amp, now);
      
      osc.connect(harmGain);
      harmGain.connect(voiceGain);
      osc.start(now);
      osc.stop(now + duration + 0.1);
      oscs.push(osc);
    });

    // Felt hammer thump transient
    try {
      const bufferSize = ctx.sampleRate * 0.03; // 30ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(Math.min(freq * 2, 2800), now);
      noiseFilter.Q.setValueAtTime(1.5, now);
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(vel * 0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      noise.connect(noiseFilter);
      noiseFilter.connect(voiceGain);
      noise.start(now);
    } catch {
      // Audio buffer creation fallback if needed
    }

    voiceGain.connect(this.masterGain!);
    this.activeVoices.set(midiNote, { oscillators: oscs, gain: voiceGain });

    // Clean up from active voices map after duration
    setTimeout(() => {
      this.activeVoices.delete(midiNote);
    }, (duration + 0.1) * 1000);
  }

  public stopNote(midiNote: number): void {
    const voice = this.activeVoices.get(midiNote);
    if (voice && this.ctx) {
      const now = this.ctx.currentTime;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
      setTimeout(() => {
        voice.oscillators.forEach(o => {
          try { o.stop(); } catch { /* ignore */ }
        });
        this.activeVoices.delete(midiNote);
      }, 60);
    }
  }

  /**
   * Metronome click sound
   */
  public playMetronomeTick(isAccent = false): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(isAccent ? 0.35 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Victory star fanfare
   */
  public playFanfare(): void {
    const notes = [60, 64, 67, 72, 76]; // C E G C E
    notes.forEach((n, idx) => {
      setTimeout(() => {
        this.playNote(n, 0.7, 1.0);
      }, idx * 110);
    });
  }

  /**
   * Gentle reminder chime when note is near but needs holding
   */
  public playGentlePrompt(): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(580, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Crisp, sparkling hit sound effect when pitch recognition is correct
   * Gentle, cheerful glockenspiel/bell chime with pleasant harmonic ring
   */
  public playCorrectHitSound(): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;

    // High sparkling chime with sweet harmonics (E6 + B6 bell sparkle)
    const baseFreq = 1318.5; // E6
    const harmFreq = 1975.5; // B6

    // Primary bell oscillator
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(0.16, now + 0.004);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(this.masterGain!);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Sparkle shimmer overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(harmFreq, now);

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.006);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(now);
    osc2.stop(now + 0.18);
  }

  /**
   * Helper alias for playNote
   */
  public playPianoNote(midiNote: number, velocity = 0.8, duration = 1.2): void {
    this.playNote(midiNote, velocity, duration);
  }

  /**
   * Sparkling celebration chime
   */
  public playCelebrationChime(): void {
    this.playFanfare();
  }
}

export const pianoSynth = new PianoSynthesizer();
