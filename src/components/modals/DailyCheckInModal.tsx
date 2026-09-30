import React, { useState } from 'react';
import { UserProgress, MUSIC_EXPLORER_BADGE } from '../../types/piano';
import {
  formatLocalDate,
  QUALIFIED_PRACTICE_SECONDS,
  simulateAddTodayPracticeTime,
  simulateConsecutivePracticeDays,
  resetCheckInHistory,
} from '../../utils/checkInStorage';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { ExplorerKaiSvg } from '../mascot/AnimalFriends';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  onOpenBadges?: () => void;
  onOpenLessons?: () => void;
  onOpenFreeplay?: () => void;
  onMusicExplorerAwarded?: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
  onOpenBadges,
  onOpenLessons,
  onOpenFreeplay,
  onMusicExplorerAwarded,
}) => {
  const [showDevTools, setShowDevTools] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = formatLocalDate();
  const checkInState = progress.checkInState;
  const todayRecord = checkInState?.history?.[todayStr];
  const todaySeconds = todayRecord?.practiceSeconds || 0;
  const isTodayQualified = todaySeconds >= QUALIFIED_PRACTICE_SECONDS;
  const currentStreak = checkInState?.currentStreak || 0;
  const longestStreak = checkInState?.longestStreak || 0;
  const isMusicExplorerUnlocked =
    Boolean(checkInState?.musicExplorerUnlocked) ||
    progress.unlockedBadges.includes(MUSIC_EXPLORER_BADGE.id);

  // Time remaining to qualify today
  const secondsLeft = Math.max(0, QUALIFIED_PRACTICE_SECONDS - todaySeconds);
  const minutesLeft = Math.ceil(secondsLeft / 60);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} 分 ${s < 10 ? '0' : ''}${s} 秒`;
  };

  const todayProgressPercent = Math.min(
    100,
    Math.round((todaySeconds / QUALIFIED_PRACTICE_SECONDS) * 100)
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulating today +5 minutes
  const handleSimulateToday5Min = () => {
    pianoSynth.playCorrectHitSound();
    const result = simulateAddTodayPracticeTime(5);
    onUpdateProgress(result.updatedProgress);
    if (result.newlyAwardedMusicExplorer && onMusicExplorerAwarded) {
      onMusicExplorerAwarded();
    } else {
      showToast('⚡ 今日練琴已補滿 5 分鐘！今日簽到已達標！');
    }
  };

  // Simulating consecutive 3 days to trigger badge issuance
  const handleSimulateConsecutive3Days = () => {
    pianoSynth.playCorrectHitSound();
    const result = simulateConsecutivePracticeDays(3, true);
    onUpdateProgress(result.updatedProgress);
    if (result.newlyAwardedMusicExplorer && onMusicExplorerAwarded) {
      onMusicExplorerAwarded();
    } else {
      showToast('🚀 已模擬連續 3 天完成練琴！勳章已發放！');
    }
  };

  // Resetting check-in records
  const handleResetCheckIn = () => {
    const reset = resetCheckInHistory();
    onUpdateProgress(reset);
    showToast('🔄 已重設簽到測試紀錄。');
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in select-none text-left"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-300 flex flex-col gap-5 text-slate-800 animate-scale-up max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-black text-base transition active:scale-95"
          title="關閉"
        >
          ✕
        </button>

        {/* Header with Mascot Kai */}
        <div className="flex items-center gap-4 border-b-2 border-amber-100 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-3xl shadow-md shrink-0">
            📅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 font-mono">
                Daily Check-In & Practice Tracker
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                每日簽到
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-950 mt-0.5">
              每日練琴簽到儀表板
            </h2>
            <p className="text-xs text-slate-600 font-bold mt-0.5">
              每天開啟 App 練習滿 5 分鐘即算完成簽到，連續 3 天即可獲取專屬紀念勳章！
            </p>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-500 text-white text-xs font-black p-3 rounded-2xl shadow-md text-center animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* Zone 1: Today's Practice Status Box */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 md:p-5 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span>⏱️</span>
              <span>今日練習時長紀錄（{todayStr}）</span>
            </span>
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-full shadow-xs ${
                isTodayQualified
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-200 text-amber-950'
              }`}
            >
              {isTodayQualified ? '✅ 今日已達標' : '⏳ 練琴進行中'}
            </span>
          </div>

          {/* Time display & progress bar */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-black text-slate-950 font-mono">
              {formatTime(todaySeconds)}
            </span>
            <span className="text-xs md:text-sm font-bold text-slate-600 font-mono">
              / 目標 5 分 00 秒
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-amber-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTodayQualified
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${todayProgressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              {isTodayQualified ? (
                <span className="text-emerald-700 font-black">
                  🎉 太棒了！今天已練習超過 5 分鐘，成功完成今日簽到！
                </span>
              ) : (
                <span className="text-amber-800">
                  💪 還差約 {minutesLeft} 分鐘（{secondsLeft} 秒）達標！彈奏課程樂曲或自由練習都會自動計時喔！
                </span>
              )}
            </span>
            <span className="font-mono font-black text-slate-800 shrink-0 ml-2">
              {todayProgressPercent}%
            </span>
          </div>
        </div>

        {/* Zone 2: The 3-Day Consecutive Challenge Trail to "音樂探索家" */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">
                🧭 連續 3 天挑戰：解鎖「音樂探索家」紀念勳章
              </span>
            </div>
            <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>🔥</span>
              <span>連續 {currentStreak} 天</span>
            </span>
          </div>

          {/* 3 Step Milestone Nodes */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {/* Day 1 */}
            <div
              className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition ${
                currentStreak >= 1
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                  currentStreak >= 1
                    ? 'bg-emerald-500 text-white shadow'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStreak >= 1 ? '✓' : '1'}
              </div>
              <span className="text-xs font-black">第 1 天</span>
              <span className="text-[10px] font-bold">
                {currentStreak >= 1 ? '已達標 5分鐘' : '練習 5 分鐘'}
              </span>
            </div>

            {/* Day 2 */}
            <div
              className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition ${
                currentStreak >= 2
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                  currentStreak >= 2
                    ? 'bg-emerald-500 text-white shadow'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStreak >= 2 ? '✓' : '2'}
              </div>
              <span className="text-xs font-black">第 2 天</span>
              <span className="text-[10px] font-bold">
                {currentStreak >= 2 ? '已達標 5分鐘' : '練習 5 分鐘'}
              </span>
            </div>

            {/* Day 3 - Final Milestone */}
            <div
              className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition relative ${
                currentStreak >= 3
                  ? 'bg-gradient-to-b from-amber-100 to-amber-200 border-amber-400 text-amber-950 shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                  currentStreak >= 3
                    ? 'bg-amber-400 ring-2 ring-amber-500 shadow text-slate-900'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStreak >= 3 ? '🧭' : '3'}
              </div>
              <span className="text-xs font-black">第 3 天</span>
              <span className="text-[10px] font-black text-amber-800">
                {currentStreak >= 3 ? '🎉 勳章達成！' : '解鎖音樂探索家'}
              </span>
            </div>
          </div>

          {/* Commemorative Badge Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
              isMusicExplorerUnlocked
                ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-amber-400 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl shrink-0">
                {isMusicExplorerUnlocked ? '🧭' : '🔒'}
              </span>
              <div>
                <span className="text-xs font-black text-amber-900 block">
                  「音樂探索家」紀念勳章
                </span>
                <span className="text-[11px] font-bold text-slate-600 block">
                  {isMusicExplorerUnlocked
                    ? '已成功領取並保存在榮譽殿堂！'
                    : `目前進度：連續 ${currentStreak} / 3 天達標`}
                </span>
              </div>
            </div>

            {isMusicExplorerUnlocked && onOpenBadges && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBadges();
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-xs transition active:scale-95 whitespace-nowrap"
              >
                前往查看 ➔
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Quick Navigation to Practice */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenLessons && (
            <button
              onClick={() => {
                onClose();
                onOpenLessons();
              }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs md:text-sm rounded-2xl shadow-md transition active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <span>🗺️</span>
              <span>前往課程地圖練琴</span>
            </button>
          )}

          {onOpenFreeplay && (
            <button
              onClick={() => {
                onClose();
                onOpenFreeplay();
              }}
              className="flex-1 py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs md:text-sm rounded-2xl border-2 border-amber-300 transition active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <span>🌈</span>
              <span>自由彈奏練琴</span>
            </button>
          )}
        </div>

        {/* Zone 4: Simulation & Testing Assistant (快速驗證小工具) */}
        <div className="border-t-2 border-slate-100 pt-3">
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
          >
            <span>🛠️</span>
            <span>{showDevTools ? '收起測試驗證工具' : '展開簽到測試小工具（方便驗證 3 天連續效果）'}</span>
            <span className="text-[10px]">{showDevTools ? '▲' : '▼'}</span>
          </button>

          {showDevTools && (
            <div className="mt-2 p-3 bg-slate-100/90 rounded-2xl border border-slate-300 flex flex-col gap-2 text-xs">
              <span className="font-black text-slate-700">
                🧪 快速測試助手（可立即模擬練琴滿 5 分鐘及連續 3 天頒獎）：
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSimulateToday5Min}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95"
                  title="將今日練習時間增加至 5 分鐘，立即觸發今日達標"
                >
                  ⚡ 今日補滿 5 分鐘
                </button>
                <button
                  onClick={handleSimulateConsecutive3Days}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl active:scale-95"
                  title="模擬連續 3 天每日練習超過 5 分鐘，自動發放「音樂探索家」紀念勳章"
                >
                  🚀 模擬連續 3 天達標發放勳章
                </button>
                <button
                  onClick={handleResetCheckIn}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl border border-rose-300 active:scale-95 ml-auto"
                  title="清除所有簽到紀錄並重設「音樂探索家」徽章解鎖狀態"
                >
                  🔄 重設簽到紀錄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
