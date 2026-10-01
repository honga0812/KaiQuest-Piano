import { PianoInputAdapter, PianoNoteEvent, CalibrationResult } from '../types/piano';
import { frequencyToMidi, midiToNoteName, midiToSolfege, midiToNumbered } from '../utils/musicMath';

export class MicrophoneInputAdapter implements PianoInputAdapter {
  public id: 'microphone' = 'microphone';
  public name = '麥克風辨音 (iPad / 筆電)';

  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private preGainNode: GainNode | null = null;
  private animationFrameId: number | null = null;
  private listeners: Set<(event: PianoNoteEvent) => void> = new Set();
  private pitchListeners: Set<(data: { frequency: number; midiNote: number; cents: number; rms: number; threshold?: number; isAboveThreshold?: boolean; noteName: string; sensitivityMode?: 'tablet-high' | 'normal' | 'low-noise' }) => void> = new Set();
  private statusListeners: Set<(status: { isListening: boolean; error?: string }) => void> = new Set();

  private buffer: Float32Array<ArrayBuffer> | null = null;
  private isRunning = false;
  private lastError: string | null = null;

  // Calibration & Noise Gate settings
  // Default to 'normal' for balanced room acoustic piano and noise rejection
  private sensitivityMode: 'tablet-high' | 'normal' | 'low-noise' = 'normal';
  private noiseFloorRms = 0.003; // Baseline noise floor
  private dynamicNoiseFloor = 0.003; // Continuously adapted ambient room noise floor
  private noiseGateThreshold = 0.010; // Calibrated gate (~ -40 dB) preventing room murmur from triggering notes
  private micSensitivity = 1.5; // Balanced digital hardware pre-gain
  private minConfidence = 0.52; // High-confidence acoustic piano harmonic threshold (cuts out speech & noise)
  private minGlobalMaxVal = 0.50; // Autocorrelation peak threshold
  private pitchToleranceCents = 48;

  // State tracking for onset & note stability
  private candidateMidi = 0;
  private candidateConfidence = 0;
  private candidateFramesCount = 0;
  private readonly requiredStableFrames = 3; // Require at least 3 consecutive frames (~50ms) of consistent pitch
  private lastEmittedMidi = 0;
  private lastEmittedTime = 0;
  private lastEmittedOnsetId = 0;
  private currentOnsetId = 0;
  private peakNoteRms = 0;
  private smoothedDecayRms = 0;
  private lastRms = 0;
  private isNoteReleased = true; // Tracks whether physical key release / damper mute occurred
  private consecutiveSilentFrames = 0;

  public isSupported(): boolean {
    return !!(typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  public getSensitivityMode(): 'tablet-high' | 'normal' | 'low-noise' {
    return this.sensitivityMode;
  }

  public setSensitivityMode(mode: 'tablet-high' | 'normal' | 'low-noise'): void {
    this.sensitivityMode = mode;
    if (mode === 'tablet-high') {
      this.micSensitivity = 1.8;
      this.noiseGateThreshold = 0.007;
      this.minConfidence = 0.46;
      this.minGlobalMaxVal = 0.45;
    } else if (mode === 'normal') {
      this.micSensitivity = 1.5;
      this.noiseGateThreshold = 0.010;
      this.minConfidence = 0.52;
      this.minGlobalMaxVal = 0.50;
    } else if (mode === 'low-noise') {
      this.micSensitivity = 1.0;
      this.noiseGateThreshold = 0.018;
      this.minConfidence = 0.58;
      this.minGlobalMaxVal = 0.56;
    }

    if (this.preGainNode && this.audioCtx) {
      try {
        this.preGainNode.gain.setValueAtTime(this.micSensitivity, this.audioCtx.currentTime);
      } catch {
        // ignore
      }
    }
  }

  public getMicSensitivity(): number {
    return this.micSensitivity;
  }

  public setMicSensitivity(gain: number): void {
    this.micSensitivity = Math.max(0.5, Math.min(5.0, gain));
    if (this.preGainNode && this.audioCtx) {
      try {
        this.preGainNode.gain.setValueAtTime(this.micSensitivity, this.audioCtx.currentTime);
      } catch {
        // ignore
      }
    }
  }

  public getNoiseGateThreshold(): number {
    return this.noiseGateThreshold;
  }

  public setNoiseGateThreshold(threshold: number): void {
    this.noiseGateThreshold = Math.max(0.0008, Math.min(0.08, threshold));
  }

  public async start(): Promise<void> {
    if (this.isRunning && this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      this.notifyStatus(true);
      return;
    }

    try {
      this.lastError = null;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的瀏覽器或連線環境不支援 getUserMedia 麥克風音訊（需要 HTTPS 安全連線）。');
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
      } catch {
        // Fallback for devices/browsers that reject custom audio constraints
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      }

      this.mediaStream.getTracks().forEach((track) => {
        track.onended = () => {
          if (this.isRunning) {
            console.warn('Microphone track ended, attempting auto-reconnect...');
            this.reconnect();
          }
        };
      });

      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);

      // Piano-specific Bandpass Filter Pipeline:
      // 1. High-pass filter cuts off AC hum, room rumble, table thumps below 65 Hz (C2)
      this.highpassFilter = this.audioCtx.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.value = 65;
      this.highpassFilter.Q.value = 0.707;

      // 2. Low-pass filter cuts off mouth sibilance, hiss, keyboard clatter above 2100 Hz (C7)
      this.lowpassFilter = this.audioCtx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.value = 2100;
      this.lowpassFilter.Q.value = 0.707;

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048; // 2048 samples gives good low-frequency resolution down to ~65Hz
      this.analyser.smoothingTimeConstant = 0.05;

      this.preGainNode = this.audioCtx.createGain();
      this.preGainNode.gain.setValueAtTime(this.micSensitivity, this.audioCtx.currentTime);

      // Chain: source -> highpass -> lowpass -> preGainNode -> analyser
      source.connect(this.highpassFilter);
      this.highpassFilter.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.preGainNode);
      this.preGainNode.connect(this.analyser);

      this.buffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;
      this.isRunning = true;
      this.notifyStatus(true);
      this.processAudioLoop();
    } catch (err) {
      this.stop();
      const errorObj = err as Error;
      let userFriendlyMessage = '無法啟動麥克風。';
      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        userFriendlyMessage = '麥克風權限已被瀏覽器阻擋（或先前點選過「封鎖」）。請點擊網址列左側的 🔒 鎖頭圖示，將麥克風改為「允許」並重新整理頁面。若在嵌入視窗內，請點擊右上方在新分頁開啟！';
      } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
        userFriendlyMessage = '未偵測到麥克風硬體裝置，請確認裝置內建麥克風或外接耳機麥克風已正常連接。';
      } else if (errorObj.name === 'NotReadableError' || errorObj.name === 'TrackStartError') {
        userFriendlyMessage = '麥克風可能被其他視訊或通話軟體（如 Zoom、FaceTime）佔用中，請關閉後重試。';
      } else if (errorObj.message) {
        userFriendlyMessage = errorObj.message;
      }

      this.lastError = userFriendlyMessage;
      this.notifyStatus(false, this.lastError);
      throw new Error(userFriendlyMessage);
    }
  }

  public async ensureRunning(): Promise<boolean> {
    if (this.isRunning && this.audioCtx && this.audioCtx.state === 'running') {
      return true;
    }
    if (this.isRunning && this.audioCtx && (this.audioCtx.state === 'suspended' || (this.audioCtx.state as string) === 'interrupted')) {
      await this.audioCtx.resume().catch(() => {});
      return true;
    }
    try {
      await this.start();
      return true;
    } catch {
      return false;
    }
  }

  public async reconnect(): Promise<void> {
    this.stop();
    try {
      await this.start();
    } catch (e) {
      console.warn('Mic auto-reconnect failed:', e);
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.notifyStatus(false);
  }

  public subscribe(listener: (event: PianoNoteEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribePitchMonitor(listener: (data: { frequency: number; midiNote: number; cents: number; rms: number; threshold?: number; isAboveThreshold?: boolean; noteName: string; sensitivityMode?: 'tablet-high' | 'normal' | 'low-noise' }) => void): () => void {
    this.pitchListeners.add(listener);
    return () => {
      this.pitchListeners.delete(listener);
    };
  }

  public subscribePitch(listener: (data: { frequencyHz: number; centsOff: number; rmsLevel: number; closestNoteName: string; midiNote: number }) => void): () => void {
    const forwarder = (data: { frequency: number; midiNote: number; cents: number; rms: number; noteName: string }) => {
      listener({
        frequencyHz: data.frequency,
        centsOff: data.cents,
        rmsLevel: data.rms,
        closestNoteName: data.noteName,
        midiNote: data.midiNote,
      });
    };
    this.pitchListeners.add(forwarder);
    return () => {
      this.pitchListeners.delete(forwarder);
    };
  }

  public subscribeStatus(listener: (status: { isListening: boolean; error?: string }) => void): () => void {
    this.statusListeners.add(listener);
    listener({ isListening: this.isRunning, error: this.lastError || undefined });
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(isListening: boolean, error?: string): void {
    this.statusListeners.forEach(listener => listener({ isListening, error }));
  }

  public async calibrate(options?: Partial<CalibrationResult>): Promise<CalibrationResult> {
    if (options?.ambientNoiseFloorDb !== undefined) {
      // Convert dB to linear RMS
      this.noiseFloorRms = Math.max(0.002, Math.pow(10, options.ambientNoiseFloorDb / 20) * 1.25);
    }
    if (options?.pitchToleranceCents !== undefined) {
      this.pitchToleranceCents = options.pitchToleranceCents;
    }
    if (options?.micSensitivity !== undefined) {
      this.micSensitivity = options.micSensitivity;
    }

    return {
      ambientNoiseFloorDb: Math.round(20 * Math.log10(this.noiseFloorRms)),
      micSensitivity: this.micSensitivity,
      pitchToleranceCents: this.pitchToleranceCents,
      middleCFrequency: options?.middleCFrequency || 261.63,
      isCalibrated: true,
      calibratedAt: Date.now(),
    };
  }

  private processAudioLoop = (): void => {
    if (!this.isRunning || !this.analyser || !this.buffer || !this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    this.analyser.getFloatTimeDomainData(this.buffer);

    // 1. Calculate RMS energy of filtered audio
    let sumSquares = 0;
    const len = this.buffer.length;
    for (let i = 0; i < len; i++) {
      sumSquares += this.buffer[i] * this.buffer[i];
    }
    const rawRms = Math.sqrt(sumSquares / len);
    const rms = rawRms * this.micSensitivity;

    // Adapt background noise floor continuously during non-note / quiet periods
    if (rms < this.noiseGateThreshold * 1.6) {
      this.dynamicNoiseFloor = this.dynamicNoiseFloor * 0.95 + rms * 0.05;
    }

    // 2. Adaptive Effective Noise Gate:
    // Requires signal to exceed preset noiseGateThreshold AND float at least 2.8x above ambient noise floor!
    // Completely stops laptop fans, air-conditioner hum, and room whispers from opening the gate.
    const effectiveThreshold = Math.max(this.noiseGateThreshold, this.dynamicNoiseFloor * 2.8);
    const isAboveThreshold = rms >= effectiveThreshold;

    let frequency = 0;
    let confidence = 0;

    if (isAboveThreshold) {
      // Analyze pitch ONLY when sound energy truly exceeds ambient noise
      const pitchResult = this.detectPitchNSDF(this.buffer, this.audioCtx.sampleRate);
      frequency = pitchResult.frequency;
      confidence = pitchResult.confidence;
    }

    const now = Date.now();

    // 3. Piano Specific Range & Timbre Filter:
    // Piano notes for curriculum & scales lie strictly between C2 (65.4 Hz) and C7 (2093 Hz).
    // Struck piano strings have clear harmonic periodicity (confidence >= minConfidence ~0.52),
    // whereas room noise, rustling, and speech fricatives have low confidence.
    const isPianoFrequency = frequency >= 65 && frequency <= 2100;
    const isPianoTimbre = confidence >= this.minConfidence;

    if (isAboveThreshold && isPianoFrequency && isPianoTimbre) {
      // Valid piano tone detected: reset silence counter
      this.consecutiveSilentFrames = 0;

      const { midiNote, cents, noteName } = frequencyToMidi(frequency);

      // Track peak volume and smooth decay curve of active note
      if (rms > this.peakNoteRms) {
        this.peakNoteRms = rms;
        this.smoothedDecayRms = rms;
      } else {
        // As note rings out, smoothly follow exponential decay
        this.smoothedDecayRms = this.smoothedDecayRms * 0.94 + rms * 0.06;
      }

      // Notify pitch monitor subscribers (tuner / gauge UI) with threshold info
      this.pitchListeners.forEach(listener => {
        listener({
          frequency,
          midiNote,
          cents,
          rms,
          threshold: effectiveThreshold,
          isAboveThreshold: true,
          noteName,
          sensitivityMode: this.sensitivityMode,
        });
      });

      // Stability and onset check
      if (midiNote === this.candidateMidi) {
        this.candidateFramesCount++;
      } else {
        this.candidateMidi = midiNote;
        this.candidateConfidence = confidence;
        this.candidateFramesCount = 1;
      }

      // Check if candidate note reached stability window
      // Require at least 3 consecutive frames (~50ms) for new notes to reject ambient transients!
      const isDifferentNote = midiNote !== this.lastEmittedMidi;
      const neededFrames = isDifferentNote ? this.requiredStableFrames : 2;

      if (this.candidateFramesCount >= neededFrames) {
        const timeSinceLastEmit = now - this.lastEmittedTime;

        // PHYSICAL RE-ATTACK & ONSET TRIGGER CONDITIONS:
        // 1. Different pitch struck (e.g. C4 -> D4): require minimum 110ms transition and attack presence
        const isDifferentAttack = rms > effectiveThreshold * 1.15 || rms > this.lastRms * 1.1;
        const triggerDifferent = isDifferentNote && timeSinceLastEmit > 110 && isDifferentAttack;

        // 2. Same pitch (e.g. C4 -> C4 re-strike):
        // Note MUST either have physically released (isNoteReleased) after at least 350ms,
        // OR have a genuine distinct hammer attack surge (rms surged by 2.5x+ over smoothed decay after 350ms).
        const isAttackSurge = (rms > this.smoothedDecayRms * 2.5 && rms > effectiveThreshold * 1.5 && timeSinceLastEmit > 350);
        const isReleasedRetrigger = this.isNoteReleased && timeSinceLastEmit > 330;
        const triggerSame = !isDifferentNote && (isReleasedRetrigger || isAttackSurge);

        if (triggerDifferent || triggerSame) {
          this.currentOnsetId++;
          this.lastEmittedMidi = midiNote;
          this.lastEmittedTime = now;
          this.lastEmittedOnsetId = this.currentOnsetId;
          this.peakNoteRms = rms;
          this.smoothedDecayRms = rms;
          this.isNoteReleased = false; // Note is now actively vibrating, not released

          const event: PianoNoteEvent = {
            midiNote,
            noteName,
            solfege: midiToSolfege(midiNote),
            numbered: midiToNumbered(midiNote),
            frequencyHz: Math.round(frequency * 10) / 10,
            centsOff: cents,
            startedAtMs: now,
            durationMs: 300,
            velocity: Math.min(127, Math.max(30, Math.round(rms * 300))),
            confidence,
            source: 'microphone',
            onsetId: this.currentOnsetId,
          };

          this.listeners.forEach(listener => listener(event));
        }
      }
    } else {
      // Signal fell below threshold or is non-piano noise
      this.consecutiveSilentFrames++;

      // Only mark note as physically released if silence/drop persists for at least 8 consecutive frames (~130ms)
      // This prevents momentary micro-dips from piano unison string beating from falsely marking the held note as released!
      if (this.consecutiveSilentFrames >= 8) {
        this.isNoteReleased = true;
      }

      // Only clear lastEmittedMidi after genuine sustained silence for at least 20 frames (~320ms)
      // NEVER clear it after 250ms while a piano note might still be sustaining!
      if (this.consecutiveSilentFrames >= 20) {
        this.lastEmittedMidi = 0;
        this.peakNoteRms = 0;
        this.smoothedDecayRms = 0;
        this.candidateFramesCount = 0;
        this.candidateMidi = 0;
      }

      // Update pitch monitor with idle state and threshold status
      this.pitchListeners.forEach(listener => {
        listener({
          frequency: 0,
          midiNote: 0,
          cents: 0,
          rms,
          threshold: this.noiseGateThreshold,
          isAboveThreshold: false,
          noteName: '',
        });
      });
    }

    this.lastRms = rms;
    this.animationFrameId = requestAnimationFrame(this.processAudioLoop);
  };

  /**
   * McLeod Pitch Method (MPM) via Normalized Square Difference Function (NSDF)
   * Highly resistant to octave jumping and harmonic interference in piano timbres.
   */
  private detectPitchNSDF(buffer: Float32Array<ArrayBufferLike>, sampleRate: number): { frequency: number; confidence: number } {
    const minFreq = 65; // C2 (~65.4 Hz)
    const maxFreq = 2100; // C7 (~2093 Hz)

    const minPeriod = Math.floor(sampleRate / maxFreq);
    const maxPeriod = Math.min(Math.floor(sampleRate / minFreq), Math.floor(buffer.length / 2));

    const length = buffer.length;
    const windowSize = length - maxPeriod;
    if (windowSize <= 0) return { frequency: 0, confidence: 0 };

    // Energy for lag 0
    let energy0 = 0;
    for (let j = 0; j < windowSize; j++) {
      energy0 += buffer[j] * buffer[j];
    }
    if (energy0 < 1e-5) {
      return { frequency: 0, confidence: 0 };
    }

    // Allocate NSDF array
    const nsdf = new Float32Array(maxPeriod + 1);
    nsdf[0] = 1.0;

    for (let tau = 1; tau <= maxPeriod; tau++) {
      let r = 0;
      let energyTau = 0;
      for (let j = 0; j < windowSize; j++) {
        const x0 = buffer[j];
        const xt = buffer[j + tau];
        r += x0 * xt;
        energyTau += xt * xt;
      }
      const m = energy0 + energyTau;
      nsdf[tau] = m > 1e-6 ? (2 * r) / m : 0;
    }

    // Peak picking:
    // 1. Identify intervals of positive zero-crossings
    // 2. Find local maxima in each positive interval
    const peaks: { tau: number; val: number }[] = [];
    let isPositive = false;
    let localMaxVal = -1;
    let localMaxTau = -1;

    for (let tau = minPeriod; tau <= maxPeriod; tau++) {
      const val = nsdf[tau];
      if (val > 0) {
        if (!isPositive) {
          isPositive = true;
          localMaxVal = val;
          localMaxTau = tau;
        } else if (val > localMaxVal) {
          localMaxVal = val;
          localMaxTau = tau;
        }
      } else {
        if (isPositive) {
          if (localMaxTau > 0 && localMaxVal > 0.40) {
            peaks.push({ tau: localMaxTau, val: localMaxVal });
          }
          isPositive = false;
          localMaxVal = -1;
          localMaxTau = -1;
        }
      }
    }
    if (isPositive && localMaxTau > 0 && localMaxVal > 0.40) {
      peaks.push({ tau: localMaxTau, val: localMaxVal });
    }

    if (peaks.length === 0) {
      return { frequency: 0, confidence: 0 };
    }

    // Find highest peak
    let globalMaxVal = 0;
    for (const p of peaks) {
      if (p.val > globalMaxVal) globalMaxVal = p.val;
    }

    if (globalMaxVal < this.minGlobalMaxVal) {
      return { frequency: 0, confidence: 0 };
    }

    // MPM key step: pick the FIRST peak that is at least 0.82 of globalMaxVal
    // This prevents picking period doubling (octave below)!
    const threshold = 0.82 * globalMaxVal;
    let chosenPeak = peaks[0];
    for (const p of peaks) {
      if (p.val >= threshold) {
        chosenPeak = p;
        break;
      }
    }

    const tau = chosenPeak.tau;
    // Parabolic interpolation for sub-sample accuracy
    let refinedTau = tau;
    if (tau > 0 && tau < maxPeriod) {
      const s0 = nsdf[tau - 1];
      const s1 = nsdf[tau];
      const s2 = nsdf[tau + 1];
      const denom = 2 * (2 * s1 - s0 - s2);
      if (Math.abs(denom) > 1e-6) {
        const delta = (s2 - s0) / denom;
        refinedTau = tau + delta;
      }
    }

    const frequency = sampleRate / refinedTau;
    return {
      frequency,
      confidence: chosenPeak.val,
    };
  }
}

export const micAdapter = new MicrophoneInputAdapter();
