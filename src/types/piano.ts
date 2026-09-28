export type AgeBand = 4 | 5 | 6 | 7;

export type InputMode = 'microphone' | 'midi' | 'touch';

export interface PianoNoteEvent {
  midiNote: number; // 60 = C4, 62 = D4, etc.
  noteName: string; // e.g., "C4", "D4"
  solfege: string; // "Do", "Re", "Mi"
  numbered: string; // "1", "2", "3"
  frequencyHz?: number;
  centsOff?: number; // -50 to +50 cents deviation
  startedAtMs: number;
  durationMs?: number;
  velocity?: number; // 0 - 127
  confidence: number; // 0 - 1
  source: InputMode;
  onsetId?: number; // Unique physical key strike identifier to prevent duplicate triggers
}

export interface PianoInputAdapter {
  id: InputMode;
  name: string;
  isSupported(): boolean;
  start(): Promise<void>;
  stop(): void;
  calibrate(options?: Partial<CalibrationResult>): Promise<CalibrationResult>;
  subscribe(listener: (event: PianoNoteEvent) => void): () => void;
  subscribePitchMonitor?(listener: (data: { frequency: number; midiNote: number; cents: number; rms: number; threshold?: number; isAboveThreshold?: boolean; noteName: string }) => void): () => void;
}

export interface CalibrationResult {
  ambientNoiseFloorDb: number; // e.g. -45 dB
  micSensitivity: number; // multiplier
  pitchToleranceCents: number; // default +-50 cents
  middleCFrequency: number; // calibrated Hz, target ~261.63 Hz
  isCalibrated: boolean;
  calibratedAt?: number;
}

export interface TargetNote {
  id: string;
  midiNote: number;
  noteName: string;
  solfege: string;
  numbered: string;
  durationBeats: number; // 1, 2, 4
  fingerNumber: 1 | 2 | 3 | 4 | 5;
  hand: 'right' | 'left';
  lyrics?: string;
  lyricEn?: string;
  measureIndex: number;
  allowOctaveShift?: boolean;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type ChallengeType = 'technique' | 'song' | 'performance';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  titleEn: string;
  subtitle: string;
  character: 'kai' | 'eli_lion' | 'kabuto_beetle' | 'pico_dolphin' | 'rex_dino' | 'sanjuro' | 'gaga_duck' | 'guanguan_bunny';
  characterPrompt: string;
  characterPromptEn: string;
  notes: TargetNote[];
  bpm: number;
  timeSignature: [number, number]; // [4, 4], [3, 4], [2, 4]
  focusSkill: string;
  description: string;
  difficultyLevel?: DifficultyLevel;
  minStarsRequirement?: number;
}

export interface Lesson {
  id: string;
  lessonNumber: number;
  ageBand: AgeBand;
  quarter?: 1 | 2 | 3 | 4;
  weekNumber?: number;
  sessionNumber?: 1 | 2 | 3 | 4; // 每週 4 堂課 (第 1~4 堂課)
  sessionTitle?: string; // 課堂類型：熱身技巧日、核心樂曲日、強化拓展日、挑戰任務日
  difficultyLevel?: DifficultyLevel; // 難度等級 1 ~ 5
  title: string;
  titleEn: string;
  songName: string;
  storyScene: string;
  techniqueChallenges: Challenge[]; // 熱身技巧
  songChallenges: Challenge[]; // 核心樂曲
  performanceChallenges: Challenge[]; // 挑戰任務
  keySignature: string; // e.g., "C Major", "G Major"
  badgeId: string;
  badgeTitle: string;
  badgeIcon: string;
}

export interface HintToggles {
  staff: boolean; // 五線譜
  numbered: boolean; // 簡譜
  letter: boolean; // CDE 字母
  keyboard: boolean; // 動態鍵盤指法
}

export interface UserProgress {
  userAge: AgeBand;
  selectedInputMode: InputMode;
  completedLessons: Record<string, { stars: number; bestScore: number; bestBpm: number; completedAt: number }>;
  unlockedBadges: string[];
  longestStreak: number;
  totalNotesPlayed: number;
  calibration: CalibrationResult;
  teacherNotes: string[];
  studentName: string;
}
