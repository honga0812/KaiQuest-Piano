import { UserProgress, DailyCheckInRecord, CheckInState, MUSIC_EXPLORER_BADGE } from '../types/piano';
import { saveUserProgress, loadUserProgress } from './storage';

export const QUALIFIED_PRACTICE_SECONDS = 300; // 5 minutes = 300 seconds
export const MUSIC_EXPLORER_BADGE_ID = MUSIC_EXPLORER_BADGE.id;

/**
 * Returns the local date string in YYYY-MM-DD format
 */
export function formatLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a date string shifted by `daysOffset` days from `baseDateStr`
 */
export function getShiftedDate(baseDateStr: string, daysOffset: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + daysOffset);
  return formatLocalDate(date);
}

/**
 * Calculates current streak and longest streak from history
 */
export function calculateStreakFromHistory(
  history: Record<string, DailyCheckInRecord>,
  todayStr: string = formatLocalDate()
): { currentStreak: number; longestStreak: number; isTodayQualified: boolean } {
  const todayRecord = history[todayStr];
  const isTodayQualified = Boolean(todayRecord && todayRecord.isQualified);

  // Calculate current streak
  let currentStreak = 0;
  if (isTodayQualified) {
    currentStreak = 1;
    let prevDate = getShiftedDate(todayStr, -1);
    while (history[prevDate] && history[prevDate].isQualified) {
      currentStreak++;
      prevDate = getShiftedDate(prevDate, -1);
    }
  } else {
    // If today is not yet qualified, the active streak from yesterday still counts toward current active streak
    let prevDate = getShiftedDate(todayStr, -1);
    while (history[prevDate] && history[prevDate].isQualified) {
      currentStreak++;
      prevDate = getShiftedDate(prevDate, -1);
    }
  }

  // Calculate longest streak across all recorded history
  const allDates = Object.keys(history).sort();
  let maxStreak = 0;
  let runningStreak = 0;
  let lastCheckedDate: string | null = null;

  for (const dateStr of allDates) {
    const rec = history[dateStr];
    if (rec && rec.isQualified) {
      if (lastCheckedDate && getShiftedDate(lastCheckedDate, 1) === dateStr) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
      lastCheckedDate = dateStr;
      if (runningStreak > maxStreak) {
        maxStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
      lastCheckedDate = null;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(maxStreak, currentStreak),
    isTodayQualified,
  };
}

/**
 * Initializes or normalizes the check-in state on UserProgress
 */
export function ensureCheckInState(progress: UserProgress): UserProgress {
  const todayStr = formatLocalDate();
  const existingState = progress.checkInState || {
    currentStreak: 0,
    longestStreak: progress.longestStreak || 0,
    lastCheckInDate: todayStr,
    history: {},
    musicExplorerUnlocked: progress.unlockedBadges.includes(MUSIC_EXPLORER_BADGE_ID),
  };

  const history = { ...existingState.history };
  const existingToday = history[todayStr];

  if (!existingToday) {
    history[todayStr] = {
      date: todayStr,
      practiceSeconds: 0,
      isQualified: false,
      openedAt: Date.now(),
      lastActiveAt: Date.now(),
    };
  } else {
    history[todayStr] = {
      ...existingToday,
      lastActiveAt: Date.now(),
    };
  }

  const { currentStreak, longestStreak } = calculateStreakFromHistory(history, todayStr);
  const musicExplorerUnlocked =
    existingState.musicExplorerUnlocked ||
    progress.unlockedBadges.includes(MUSIC_EXPLORER_BADGE_ID) ||
    currentStreak >= 3;

  const unlockedBadges = [...progress.unlockedBadges];
  if (musicExplorerUnlocked && !unlockedBadges.includes(MUSIC_EXPLORER_BADGE_ID)) {
    unlockedBadges.push(MUSIC_EXPLORER_BADGE_ID);
  }

  const updatedProgress: UserProgress = {
    ...progress,
    unlockedBadges,
    longestStreak: Math.max(progress.longestStreak || 0, longestStreak),
    checkInState: {
      ...existingState,
      currentStreak,
      longestStreak,
      lastCheckInDate: todayStr,
      history,
      musicExplorerUnlocked,
      unlockedAt: musicExplorerUnlocked ? (existingState.unlockedAt || Date.now()) : undefined,
    },
  };

  saveUserProgress(updatedProgress);
  return updatedProgress;
}

/**
 * Accumulates daily practice time and checks if 5 min + 3 consecutive days milestone is met
 */
export function addDailyPracticeSeconds(
  progress: UserProgress,
  secondsDelta: number
): {
  updatedProgress: UserProgress;
  newlyAwardedMusicExplorer: boolean;
  isNewlyQualifiedToday: boolean;
} {
  if (secondsDelta <= 0) {
    return { updatedProgress: progress, newlyAwardedMusicExplorer: false, isNewlyQualifiedToday: false };
  }

  const todayStr = formatLocalDate();
  const state = progress.checkInState || {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: todayStr,
    history: {},
    musicExplorerUnlocked: false,
  };

  const history = { ...state.history };
  const prevToday = history[todayStr] || {
    date: todayStr,
    practiceSeconds: 0,
    isQualified: false,
    openedAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  const wasQualifiedBefore = prevToday.isQualified;
  const newSeconds = prevToday.practiceSeconds + secondsDelta;
  const isNowQualified = newSeconds >= QUALIFIED_PRACTICE_SECONDS;
  const isNewlyQualifiedToday = !wasQualifiedBefore && isNowQualified;

  history[todayStr] = {
    ...prevToday,
    practiceSeconds: newSeconds,
    isQualified: isNowQualified,
    lastActiveAt: Date.now(),
  };

  const { currentStreak, longestStreak } = calculateStreakFromHistory(history, todayStr);
  const wasBadgeUnlockedBefore =
    state.musicExplorerUnlocked || progress.unlockedBadges.includes(MUSIC_EXPLORER_BADGE_ID);

  // Condition: consecutive 3 days opened app and practiced > 5 mins
  // When current streak reaches >= 3 days, award the badge!
  let newlyAwardedMusicExplorer = false;
  let isBadgeUnlocked = wasBadgeUnlockedBefore;
  let unlockedAt = state.unlockedAt;

  if (currentStreak >= 3 && !wasBadgeUnlockedBefore) {
    isBadgeUnlocked = true;
    newlyAwardedMusicExplorer = true;
    unlockedAt = Date.now();
  }

  const unlockedBadges = [...progress.unlockedBadges];
  if (isBadgeUnlocked && !unlockedBadges.includes(MUSIC_EXPLORER_BADGE_ID)) {
    unlockedBadges.push(MUSIC_EXPLORER_BADGE_ID);
  }

  const updatedProgress: UserProgress = {
    ...progress,
    unlockedBadges,
    longestStreak: Math.max(progress.longestStreak || 0, longestStreak),
    checkInState: {
      ...state,
      currentStreak,
      longestStreak,
      lastCheckInDate: todayStr,
      history,
      musicExplorerUnlocked: isBadgeUnlocked,
      unlockedAt,
    },
  };

  saveUserProgress(updatedProgress);
  return { updatedProgress, newlyAwardedMusicExplorer, isNewlyQualifiedToday };
}

/**
 * Testing Simulation: Simulates adding practice minutes to today
 */
export function simulateAddTodayPracticeTime(minutes: number): {
  updatedProgress: UserProgress;
  newlyAwardedMusicExplorer: boolean;
} {
  const current = loadUserProgress();
  const ensured = ensureCheckInState(current);
  const result = addDailyPracticeSeconds(ensured, minutes * 60);
  return { updatedProgress: result.updatedProgress, newlyAwardedMusicExplorer: result.newlyAwardedMusicExplorer };
}

/**
 * Testing Simulation: Simulates consecutive days of practice (e.g. 2 previous days + today)
 */
export function simulateConsecutivePracticeDays(
  consecutiveDays: number,
  includeTodayQualified: boolean = true
): {
  updatedProgress: UserProgress;
  newlyAwardedMusicExplorer: boolean;
} {
  const current = loadUserProgress();
  const todayStr = formatLocalDate();
  const history: Record<string, DailyCheckInRecord> = { ...(current.checkInState?.history || {}) };

  // Set previous days
  for (let i = consecutiveDays - 1; i >= 1; i--) {
    const pastDate = getShiftedDate(todayStr, -i);
    history[pastDate] = {
      date: pastDate,
      practiceSeconds: QUALIFIED_PRACTICE_SECONDS + 60, // 6 minutes
      isQualified: true,
      openedAt: Date.now() - i * 86400000,
      lastActiveAt: Date.now() - i * 86400000 + 360000,
    };
  }

  // Set today
  const todaySecs = includeTodayQualified ? QUALIFIED_PRACTICE_SECONDS + 30 : 120;
  history[todayStr] = {
    date: todayStr,
    practiceSeconds: todaySecs,
    isQualified: includeTodayQualified,
    openedAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  const { currentStreak, longestStreak } = calculateStreakFromHistory(history, todayStr);
  const wasBadgeUnlockedBefore =
    Boolean(current.checkInState?.musicExplorerUnlocked) ||
    current.unlockedBadges.includes(MUSIC_EXPLORER_BADGE_ID);

  let newlyAwardedMusicExplorer = false;
  let isBadgeUnlocked = wasBadgeUnlockedBefore;
  let unlockedAt = current.checkInState?.unlockedAt;

  if (currentStreak >= 3 && !wasBadgeUnlockedBefore) {
    isBadgeUnlocked = true;
    newlyAwardedMusicExplorer = true;
    unlockedAt = Date.now();
  }

  const unlockedBadges = [...current.unlockedBadges];
  if (isBadgeUnlocked && !unlockedBadges.includes(MUSIC_EXPLORER_BADGE_ID)) {
    unlockedBadges.push(MUSIC_EXPLORER_BADGE_ID);
  }

  const updatedProgress: UserProgress = {
    ...current,
    unlockedBadges,
    longestStreak: Math.max(current.longestStreak || 0, longestStreak),
    checkInState: {
      currentStreak,
      longestStreak,
      lastCheckInDate: todayStr,
      history,
      musicExplorerUnlocked: isBadgeUnlocked,
      unlockedAt,
    },
  };

  saveUserProgress(updatedProgress);
  return { updatedProgress, newlyAwardedMusicExplorer };
}

/**
 * Testing Simulation: Resets check-in records for fresh testing
 */
export function resetCheckInHistory(): UserProgress {
  const current = loadUserProgress();
  const todayStr = formatLocalDate();
  
  // Remove badge-music-explorer from unlocked badges
  const unlockedBadges = current.unlockedBadges.filter((b) => b !== MUSIC_EXPLORER_BADGE_ID);

  const updatedProgress: UserProgress = {
    ...current,
    unlockedBadges,
    checkInState: {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: todayStr,
      history: {
        [todayStr]: {
          date: todayStr,
          practiceSeconds: 0,
          isQualified: false,
          openedAt: Date.now(),
          lastActiveAt: Date.now(),
        },
      },
      musicExplorerUnlocked: false,
      unlockedAt: undefined,
    },
  };

  saveUserProgress(updatedProgress);
  return updatedProgress;
}
