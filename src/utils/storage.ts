import { UserProgress, AgeBand, InputMode, CalibrationResult } from '../types/piano';

const STORAGE_KEY = 'kaiquest_piano_progress_v1';

const DEFAULT_CALIBRATION: CalibrationResult = {
  ambientNoiseFloorDb: -42,
  micSensitivity: 1.0,
  pitchToleranceCents: 50,
  middleCFrequency: 261.63,
  isCalibrated: false,
};

const DEFAULT_PROGRESS: UserProgress = {
  userAge: 5,
  selectedInputMode: 'microphone',
  completedLessons: {},
  unlockedBadges: [],
  longestStreak: 0,
  totalNotesPlayed: 0,
  calibration: DEFAULT_CALIBRATION,
  teacherNotes: ['歡迎來到 KaiQuest 鋼琴奇幻冒險！準備好展開美妙的音樂旅程！'],
  studentName: '小琴童探險家',
};

export function loadUserProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      calibration: {
        ...DEFAULT_CALIBRATION,
        ...(parsed.calibration || {}),
      },
    };
  } catch (err) {
    console.error('Failed to load local progress:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage:', err);
  }
}

export function recordLessonCompletion(
  lessonId: string,
  stars: number,
  score: number,
  bpm: number,
  badgeId?: string
): UserProgress {
  const current = loadUserProgress();
  const existing = current.completedLessons[lessonId] || { stars: 0, bestScore: 0, bestBpm: 0, completedAt: 0 };

  const updatedLessons = {
    ...current.completedLessons,
    [lessonId]: {
      stars: Math.max(existing.stars, stars),
      bestScore: Math.max(existing.bestScore, score),
      bestBpm: Math.max(existing.bestBpm, bpm),
      completedAt: Date.now(),
    },
  };

  const unlockedBadges = [...current.unlockedBadges];
  if (badgeId && !unlockedBadges.includes(badgeId)) {
    unlockedBadges.push(badgeId);
  }

  const updatedProgress: UserProgress = {
    ...current,
    completedLessons: updatedLessons,
    unlockedBadges,
  };

  saveUserProgress(updatedProgress);
  return updatedProgress;
}

export function updateCalibration(calibration: CalibrationResult): void {
  const current = loadUserProgress();
  current.calibration = calibration;
  saveUserProgress(current);
}

export function setUserAge(age: AgeBand): void {
  const current = loadUserProgress();
  current.userAge = age;
  saveUserProgress(current);
}

export function setInputModePreference(mode: InputMode): void {
  const current = loadUserProgress();
  current.selectedInputMode = mode;
  saveUserProgress(current);
}

export function exportProgressToJson(): void {
  const progress = loadUserProgress();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `KaiQuest_Piano_Progress_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function clearAllLocalData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
