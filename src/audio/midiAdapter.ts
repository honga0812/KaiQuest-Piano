import { PianoInputAdapter, PianoNoteEvent, CalibrationResult } from '../types/piano';
import { midiToFrequency, midiToNoteName, midiToSolfege, midiToNumbered } from '../utils/musicMath';

interface MIDIPort {
  id: string;
  name?: string;
  state: 'connected' | 'disconnected';
  type: 'input' | 'output';
  onmidimessage?: ((event: { data: Uint8Array }) => void) | null;
}

interface MIDIAccessLike {
  inputs: Map<string, MIDIPort> | { forEach: (callback: (input: MIDIPort) => void) => void };
  onstatechange?: (() => void) | null;
}

export class MidiInputAdapter implements PianoInputAdapter {
  public id: 'midi' = 'midi';
  public name = 'USB MIDI 鍵盤 (電腦 Chrome / Edge)';

  private midiAccess: MIDIAccessLike | null = null;
  private listeners: Set<(event: PianoNoteEvent) => void> = new Set();
  private connectedDeviceNames: string[] = [];

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async start(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('此瀏覽器不支援 Web MIDI API。建議使用桌面 Chrome 或 Edge，或改用麥克風模式。');
    }

    try {
      const nav = navigator as unknown as { requestMIDIAccess: (options?: { sysex?: boolean }) => Promise<MIDIAccessLike> };
      this.midiAccess = await nav.requestMIDIAccess({ sysex: false });

      this.updateConnectedDevices();

      this.midiAccess.onstatechange = () => {
        this.updateConnectedDevices();
        this.bindInputs();
      };

      this.bindInputs();
    } catch (err) {
      throw new Error(`無法連接 MIDI 設備: ${(err as Error).message}`);
    }
  }

  private updateConnectedDevices(): void {
    if (!this.midiAccess) return;
    const names: string[] = [];
    this.midiAccess.inputs.forEach((input: MIDIPort) => {
      if (input.name && input.state === 'connected') {
        names.push(input.name);
      }
    });
    this.connectedDeviceNames = names;
  }

  public getConnectedDevices(): string[] {
    return this.connectedDeviceNames;
  }

  private bindInputs(): void {
    if (!this.midiAccess) return;

    this.midiAccess.inputs.forEach((input: MIDIPort) => {
      input.onmidimessage = this.handleMidiMessage;
    });
  }

  private handleMidiMessage = (message: { data: Uint8Array }): void => {
    const data = message.data;
    if (!data || data.length < 3) return;

    const command = data[0] >> 4;
    const midiNote = data[1];
    const velocity = data[2];

    // 0x9 = Note On, 0x8 = Note Off
    if (command === 0x9 && velocity > 0) {
      const now = Date.now();
      const event: PianoNoteEvent = {
        midiNote,
        noteName: midiToNoteName(midiNote),
        solfege: midiToSolfege(midiNote),
        numbered: midiToNumbered(midiNote),
        frequencyHz: midiToFrequency(midiNote),
        centsOff: 0,
        startedAtMs: now,
        velocity,
        confidence: 1.0,
        source: 'midi',
      };

      this.listeners.forEach(listener => listener(event));
    }
  };

  public stop(): void {
    if (this.midiAccess) {
      this.midiAccess.inputs.forEach((input: MIDIPort) => {
        input.onmidimessage = null;
      });
      this.midiAccess.onstatechange = null;
      this.midiAccess = null;
    }
  }

  public subscribe(listener: (event: PianoNoteEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async calibrate(): Promise<CalibrationResult> {
    return {
      ambientNoiseFloorDb: -60,
      micSensitivity: 1.0,
      pitchToleranceCents: 15,
      middleCFrequency: 261.63,
      isCalibrated: true,
      calibratedAt: Date.now(),
    };
  }
}

export const midiAdapter = new MidiInputAdapter();
