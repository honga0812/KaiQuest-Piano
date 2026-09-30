import { useEffect, useRef, useState, useCallback } from 'react';
import { UserProgress } from '../types/piano';
import {
  ensureCheckInState,
  addDailyPracticeSeconds,
  formatLocalDate,
  QUALIFIED_PRACTICE_SECONDS,
} from '../utils/checkInStorage';

interface UseDailyPracticeTimerOptions {
  progress: UserProgress;
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  currentTab: string;
  onMusicExplorerAwarded?: () => void;
}

export function useDailyPracticeTimer({
  progress,
  setProgress,
  currentTab,
  onMusicExplorerAwarded,
}: UseDailyPracticeTimerOptions) {
  const accumulatedSecondsRef = useRef(0);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const onAwardedRef = useRef(onMusicExplorerAwarded);
  onAwardedRef.current = onMusicExplorerAwarded;

  // Initialize today's check-in on first mount
  useEffect(() => {
    setProgress((prev) => ensureCheckInState(prev));
  }, [setProgress]);

  // Flush accumulated practice seconds to persistent storage
  const flushSeconds = useCallback(() => {
    if (accumulatedSecondsRef.current <= 0) return;
    const delta = accumulatedSecondsRef.current;
    accumulatedSecondsRef.current = 0;

    const result = addDailyPracticeSeconds(progressRef.current, delta);
    setProgress(result.updatedProgress);

    if (result.newlyAwardedMusicExplorer) {
      if (onAwardedRef.current) {
        onAwardedRef.current();
      }
    }
  }, [setProgress]);

  // Main 1-second interval ticker
  useEffect(() => {
    const isPracticeTab = ['lesson', 'concert', 'gym', 'freeplay', 'theory', 'map'].includes(currentTab);

    const interval = setInterval(() => {
      // Don't accumulate if document is hidden in background
      if (typeof document !== 'undefined' && document.hidden) return;

      if (isPracticeTab) {
        accumulatedSecondsRef.current += 1;

        // Flush every 5 seconds to storage
        if (accumulatedSecondsRef.current >= 5) {
          flushSeconds();
        }
      }
    }, 1000);

    const handleVisibility = () => {
      if (document.hidden) {
        flushSeconds();
      }
    };

    const handleBeforeUnload = () => {
      flushSeconds();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      flushSeconds();
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentTab, flushSeconds]);

  const todayStr = formatLocalDate();
  const todayRecord = progress.checkInState?.history?.[todayStr];
  const todaySeconds = (todayRecord?.practiceSeconds || 0) + accumulatedSecondsRef.current;
  const isTodayQualified = todaySeconds >= QUALIFIED_PRACTICE_SECONDS;
  const currentStreak = progress.checkInState?.currentStreak || 0;
  const isMusicExplorerUnlocked = Boolean(progress.checkInState?.musicExplorerUnlocked);

  return {
    todaySeconds,
    isTodayQualified,
    currentStreak,
    isMusicExplorerUnlocked,
    flushSeconds,
  };
}
