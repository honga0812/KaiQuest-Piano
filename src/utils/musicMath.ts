export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const SOLFEGE_NAMES = ['Do', 'Di', 'Re', 'Ri', 'Mi', 'Fa', 'Fi', 'Sol', 'Si', 'La', 'Li', 'Ti'];
export const NUMBERED_NAMES = ['1', '1#', '2', '2#', '3', '4', '4#', '5', '5#', '6', '6#', '7'];

/**
 * Converts MIDI note number (e.g. 60) to note name with octave (e.g. "C4")
 */
export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Converts MIDI note number to Solfege syllable (e.g. 60 -> "Do")
 */
export function midiToSolfege(midi: number): string {
  const noteIndex = midi % 12;
  return SOLFEGE_NAMES[noteIndex];
}

/**
 * Converts MIDI note number to Numbered Musical Notation (簡譜) (e.g. 60 -> "1")
 */
export function midiToNumbered(midi: number): string {
  const noteIndex = midi % 12;
  return NUMBERED_NAMES[noteIndex];
}

/**
 * Gets exact standard pitch frequency for a given MIDI note (A4 = 440 Hz)
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Converts frequency in Hz to nearest MIDI note and cents deviation (-50 to +50)
 */
export function frequencyToMidi(frequency: number): { midiNote: number; cents: number; noteName: string } {
  if (frequency <= 0) {
    return { midiNote: 0, cents: 0, noteName: '' };
  }
  const fractionalMidi = 69 + 12 * Math.log2(frequency / 440);
  const midiNote = Math.round(fractionalMidi);
  const targetFreq = midiToFrequency(midiNote);
  const cents = Math.round(1200 * Math.log2(frequency / targetFreq));
  return {
    midiNote,
    cents: Math.max(-50, Math.min(50, cents)),
    noteName: midiToNoteName(midiNote),
  };
}

/**
 * Calculates staff Y position relative to middle line (B4 = 0)
 * Each step in the diatonic scale is 1 position unit (line to space to line)
 */
export function getStaffDiatonicStep(midi: number): number {
  // Base diatonic steps relative to C4 (Middle C = 0)
  // C4 = 0, D4 = 1, E4 = 2, F4 = 3, G4 = 4, A4 = 5, B4 = 6, C5 = 7...
  const semitonesFromC = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = midi % 12;
  const diatonicWithinOctave = semitonesFromC[pitchClass];
  
  // Middle C is C4 (octave 4) -> step 0
  const totalDiatonicStep = (octave - 4) * 7 + diatonicWithinOctave;
  return totalDiatonicStep;
}

/**
 * Generates an array of keys for the interactive dynamic keyboard
 * Default range: F3 (53) to G5 (79) (covers all Season 1 lessons with plenty of headroom)
 */
export interface KeyboardKeyDef {
  midiNote: number;
  noteName: string;
  isBlack: boolean;
  solfege: string;
  numbered: string;
  label: string;
}

export function generatePianoKeys(startMidi = 57, endMidi = 77): KeyboardKeyDef[] {
  // Default range A3 (57) to F5 (77), perfectly centered around Middle C (60)
  const keys: KeyboardKeyDef[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    const noteIndex = m % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(noteIndex);
    keys.push({
      midiNote: m,
      noteName: midiToNoteName(m),
      isBlack,
      solfege: midiToSolfege(m),
      numbered: midiToNumbered(m),
      label: midiToNoteName(m).replace(/\d/, ''),
    });
  }
  return keys;
}
