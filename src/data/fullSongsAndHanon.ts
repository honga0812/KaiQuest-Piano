import { TargetNote, AgeBand } from '../types/piano';
import { GOLDEN_SONGS_AGE_4_AND_5 } from './goldenSongsAge4And5';
import { GOLDEN_SONGS_AGE_6_AND_7 } from './goldenSongsAge6And7';
import { ALL_HANON_TECHNIQUES } from './hanonTechniquesData';

export interface FullPiece {
  id: string;
  category: 'song' | 'hanon';
  title: string;
  titleEn: string;
  subtitle: string;
  composerOrOrigin: string;
  character: 'kai' | 'eli_lion' | 'sanjuro' | 'gaga_duck' | 'guanguan_bunny';
  characterPrompt: string;
  characterPromptEn: string;
  bpm: number;
  timeSignature: [number, number];
  keySignature: string;
  focusSkill: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  targetAge: AgeBand;
  notes: TargetNote[];
}

// -------------------------------------------------------------
// 1. ALL GOLDEN CLASSICS (CATEGORIZED BY AGE 4, 5, 6, 7)
// -------------------------------------------------------------
export const FULL_SONGS_COLLECTION: FullPiece[] = [
  ...GOLDEN_SONGS_AGE_4_AND_5,
  ...GOLDEN_SONGS_AGE_6_AND_7,
];

// -------------------------------------------------------------
// 2. ALL HANON TECHNIQUE FLOW EXERCISES (AGES 4, 5, 6, 7)
// -------------------------------------------------------------
export const HANON_TECHNIQUES_COLLECTION: FullPiece[] = [
  ...ALL_HANON_TECHNIQUES,
];

export function getPiecesByCategoryAndAge(category: 'song' | 'hanon', age: 'all' | AgeBand): FullPiece[] {
  const collection = category === 'song' ? FULL_SONGS_COLLECTION : HANON_TECHNIQUES_COLLECTION;
  if (age === 'all') return collection;
  return collection.filter((p) => p.targetAge === age);
}
