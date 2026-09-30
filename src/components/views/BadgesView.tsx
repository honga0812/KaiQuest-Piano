import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProgress, Lesson, MUSIC_EXPLORER_BADGE, CommemorativeBadge } from '../../types/piano';
import { LESSONS_DATABASE } from '../../data/lessons';
import { exportProgressToJson } from '../../utils/storage';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { ExplorerKaiSvg, EliLionSvg, KabutoBeetleSvg } from '../mascot/AnimalFriends';
import { formatLocalDate, QUALIFIED_PRACTICE_SECONDS } from '../../utils/checkInStorage';

interface BadgesViewProps {
  progress: UserProgress;
  onUpdateStudentName?: (name: string) => void;
  onOpenCheckInModal?: () => void;
  className?: string;
}

export const BadgesView: React.FC<BadgesViewProps> = ({
  progress,
  onOpenCheckInModal,
  className = '',
}) => {
  const [studentName, setStudentName] = useState(progress.studentName || '小琴童探險家');
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedBadgeLesson, setSelectedBadgeLesson] = useState<Lesson | null>(null);
  const [selectedCommemorativeBadge, setSelectedCommemorativeBadge] = useState<CommemorativeBadge | null>(null);
  const [hasNewBadgeAlert, setHasNewBadgeAlert] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'special' | 'lessons'>('all');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const [poppingBadgeId, setPoppingBadgeId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevBadgeCountRef = useRef<number | null>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Calculate stats
  const totalStars = Object.values(progress.completedLessons).reduce((sum, l) => sum + l.stars, 0);
  const lessonsCompletedCount = Object.keys(progress.completedLessons).length;

  const todayStr = formatLocalDate();
  const checkInState = progress.checkInState;
  const todayRecord = checkInState?.history?.[todayStr];
  const todaySeconds = todayRecord?.practiceSeconds || 0;
  const currentStreak = checkInState?.currentStreak || 0;
  const isMusicExplorerUnlocked =
    Boolean(checkInState?.musicExplorerUnlocked) ||
    progress.unlockedBadges.includes(MUSIC_EXPLORER_BADGE.id);

  // Multi-burst fireworks celebratory animation
  const triggerFireworks = (playAudio = true) => {
    if (playAudio) {
      pianoSynth.playFanfare();
    }

    const duration = 2.4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 2000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 45 * (timeLeft / duration);

      // Left blast
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
      // Right blast
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 },
        colors: ['#FBBF24', '#34D399', '#60A5FA', '#F43F5E', '#A855F7'],
      });
    }, 250);
  };

  // Check if newly unlocked badges need celebration upon entering view
  useEffect(() => {
    const currentUnlockedCount = progress.unlockedBadges.length;
    const storedLastCountStr = localStorage.getItem('kaiquest_last_celebrated_badge_count');
    const storedLastCount = storedLastCountStr !== null ? parseInt(storedLastCountStr, 10) : 0;

    if (currentUnlockedCount > storedLastCount) {
      setHasNewBadgeAlert(true);
      triggerFireworks(true);
      localStorage.setItem('kaiquest_last_celebrated_badge_count', currentUnlockedCount.toString());
    }

    prevBadgeCountRef.current = currentUnlockedCount;
  }, [progress.unlockedBadges.length]);

  const handleCardClick = (lesson: Lesson, isUnlocked: boolean) => {
    if (isUnlocked) {
      setPoppingBadgeId(lesson.badgeId);
      triggerFireworks(true);
      setTimeout(() => {
        setSelectedBadgeLesson(lesson);
        setPoppingBadgeId(null);
      }, 300);
    } else {
      setSelectedBadgeLesson(lesson);
      pianoSynth.playGentlePrompt();
    }
  };

  const handleCommemorativeCardClick = (badge: CommemorativeBadge) => {
    if (isMusicExplorerUnlocked) {
      setPoppingBadgeId(badge.id);
      triggerFireworks(true);
      setTimeout(() => {
        setSelectedCommemorativeBadge(badge);
        setPoppingBadgeId(null);
      }, 300);
    } else {
      setSelectedCommemorativeBadge(badge);
      pianoSynth.playGentlePrompt();
    }
  };

  const formatMinutesSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}分${s < 10 ? '0' : ''}${s}秒`;
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-6 select-none flex flex-col gap-6 ${className}`}>
      {/* Newly Unlocked Badge Celebratory Announcement Banner */}
      {hasNewBadgeAlert && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 border-3 border-white rounded-3xl p-4 md:p-5 shadow-xl text-slate-950 flex flex-wrap items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3 text-left">
            <span className="w-12 h-12 rounded-2xl bg-white/90 text-3xl flex items-center justify-center shadow-md">
              🎆
            </span>
            <div>
              <span className="text-base md:text-lg font-black block">
                🎉 哇！太厲害了！你解鎖了新的榮譽徽章！
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-900 block opacity-95">
                每一步鋼琴練習都在閃閃發光，點擊下方徽章卡片查看成就細節吧！
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => triggerFireworks(true)}
              className="px-4 py-2 bg-slate-950 text-amber-300 font-black rounded-xl text-xs md:text-sm shadow hover:bg-slate-900 transition active:scale-95"
            >
              🎆 再次放煙火慶祝
            </button>
            <button
              onClick={() => setHasNewBadgeAlert(false)}
              className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-slate-900 flex items-center justify-center font-black text-sm"
              title="關閉提示"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Deck - Bright & Cheerful */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-white border-3 border-amber-300 rounded-3xl p-6 md:p-8 shadow-sm text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-wider text-amber-600 font-mono">
              Achievements & Honors
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-sm font-black text-amber-800">
              成就榮譽殿堂
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-950 mt-1">
            探險家成就徽章與結業證書
          </h1>
          <p className="text-base text-slate-700 mt-1 max-w-xl font-bold">
            包含<strong>每日簽到紀念勳章</strong>與<strong>課程挑戰成就徽章</strong>！持之以恆練琴，點亮整座音樂榮譽星空！
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onOpenCheckInModal && (
            <button
              onClick={onOpenCheckInModal}
              className="flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-sm md:text-base rounded-2xl shadow-md transition active:scale-95 border-2 border-white"
              title="查看每日簽到與打卡進度"
            >
              <span>📅</span>
              <span>每日簽到打卡</span>
            </button>
          )}

          <button
            onClick={() => triggerFireworks(true)}
            className="flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-sm md:text-base rounded-2xl shadow-md transition active:scale-95 border-2 border-white"
            title="放煙火粒子慶祝"
          >
            <span>🎆</span>
            <span>放煙火慶祝</span>
          </button>

          <button
            onClick={() => setShowCertificate(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-sm md:text-base rounded-2xl shadow-md transition active:scale-95 border-2 border-white"
          >
            🎓 查看探險家結業證書
          </button>
          <button
            onClick={exportProgressToJson}
            className="px-4 py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm md:text-base rounded-2xl border-2 border-amber-300 transition active:scale-95 shadow-sm"
            title="下載學習成果 JSON"
          >
            📥 匯出進度
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Featured Special Commemorative Badge Showcase: 「音樂探索家」紀念勳章      */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-3 border-amber-400 rounded-3xl p-5 md:p-6 shadow-md flex flex-col gap-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow-xs">
              🌟
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-950 flex items-center gap-2">
                <span>特別紀念勳章專區</span>
                <span className="text-xs bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded-full font-mono">
                  Special Milestone
                </span>
              </h2>
              <span className="text-xs text-slate-600 font-bold">
                達成特定連續天數或專注練琴目標，即可解鎖獨一無二的專屬紀念獎牌！
              </span>
            </div>
          </div>

          {onOpenCheckInModal && (
            <button
              onClick={onOpenCheckInModal}
              className="text-xs md:text-sm font-black text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition active:scale-95 flex items-center gap-1.5"
            >
              <span>⏱️</span>
              <span>查看今日打卡狀態 ➔</span>
            </button>
          )}
        </div>

        {/* Featured Music Explorer Card */}
        <div
          onClick={() => handleCommemorativeCardClick(MUSIC_EXPLORER_BADGE)}
          className={`cursor-pointer rounded-3xl p-5 md:p-6 border-3 transition-all flex flex-col md:flex-row items-center justify-between gap-5 relative group ${
            isMusicExplorerUnlocked
              ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-amber-400 shadow-lg hover:shadow-xl hover:border-amber-500 hover:-translate-y-0.5'
              : 'bg-white/80 border-slate-200 hover:border-amber-300 opacity-90 hover:opacity-100'
          }`}
        >
          {/* Badge Icon & Info */}
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-5xl md:text-6xl shrink-0 shadow-lg transition-transform group-hover:scale-105 ${
                isMusicExplorerUnlocked
                  ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 ring-4 ring-amber-300 shadow-amber-400/50'
                  : 'bg-slate-100 ring-2 ring-slate-200 text-slate-400'
              }`}
            >
              {isMusicExplorerUnlocked ? MUSIC_EXPLORER_BADGE.icon : '🔒'}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 font-mono">
                  Daily Check-in Commemorative Badge
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs ${
                    isMusicExplorerUnlocked
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isMusicExplorerUnlocked ? '✅ 已榮獲' : `🔒 進行中 (${currentStreak}/3 天)`}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-slate-950 flex items-center gap-2">
                <span>{MUSIC_EXPLORER_BADGE.title}</span>
                <span className="text-base text-amber-600 font-normal">紀念勳章</span>
              </h3>

              <p className="text-xs md:text-sm text-slate-700 font-bold max-w-lg leading-relaxed">
                {MUSIC_EXPLORER_BADGE.description}
              </p>

              {/* Requirement pill */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="bg-white/80 border border-amber-300 text-amber-950 font-bold px-2.5 py-1 rounded-xl">
                  🎯 解鎖條件：連續 3 天開啟 App 且每日練習超過 5 分鐘
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  今日練習：{formatMinutesSeconds(todaySeconds)} / 5分鐘
                </span>
              </div>
            </div>
          </div>

          {/* Right Action / Progress Pod */}
          <div className="flex flex-col items-center md:items-end justify-center gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-amber-200 pt-3 md:pt-0 md:pl-5">
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="text-orange-600">🔥 連續打卡：</span>
              <span className="text-base font-black text-slate-900 font-mono">
                {currentStreak} 天
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-emerald-700 font-mono">目標 3 天</span>
            </div>

            {/* 3-Dot Progress Indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${
                  currentStreak >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}
                title="第 1 天達標"
              >
                {currentStreak >= 1 ? '✓' : '1'}
              </span>
              <span className="text-slate-300 font-black">―</span>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${
                  currentStreak >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}
                title="第 2 天達標"
              >
                {currentStreak >= 2 ? '✓' : '2'}
              </span>
              <span className="text-slate-300 font-black">―</span>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${
                  isMusicExplorerUnlocked ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500' : 'bg-slate-200 text-slate-600'
                }`}
                title="第 3 天解鎖音樂探索家勳章"
              >
                {isMusicExplorerUnlocked ? '🧭' : '3'}
              </span>
            </div>

            <button
              type="button"
              className={`mt-1 px-4 py-2 rounded-xl text-xs md:text-sm font-black transition active:scale-95 shadow-xs ${
                isMusicExplorerUnlocked
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isMusicExplorerUnlocked ? '查看榮譽詳情 ➔' : '查看簽到進度 ➔'}
            </button>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Tablet View Mode Switcher */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 flex-wrap gap-2 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-black text-slate-900">
            全部榮譽勳章名錄
          </span>
          <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full font-mono">
            已解鎖 {progress.unlockedBadges.length} / {LESSONS_DATABASE.length + 1}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Tablet Display Mode Switcher */}
          <div className="flex items-center bg-amber-50 p-1 rounded-2xl border border-amber-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'carousel'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              title="平板手勢水平滑動查看"
            >
              <span>📱</span>
              <span>水平滑動捲軸 (平板推薦)</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              title="全覽網格排列"
            >
              <span>🔲</span>
              <span>網格排列</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1.5 rounded-xl transition ${
                filterCategory === 'all'
                  ? 'bg-white text-slate-900 font-black shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              全部 ({LESSONS_DATABASE.length + 1})
            </button>
            <button
              onClick={() => setFilterCategory('special')}
              className={`px-2.5 py-1.5 rounded-xl transition ${
                filterCategory === 'special'
                  ? 'bg-white text-amber-900 font-black shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              特別紀念 (1)
            </button>
            <button
              onClick={() => setFilterCategory('lessons')}
              className={`px-2.5 py-1.5 rounded-xl transition ${
                filterCategory === 'lessons'
                  ? 'bg-white text-blue-900 font-black shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              課程挑戰 ({LESSONS_DATABASE.length})
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Controls if in Carousel Mode */}
      {viewMode === 'carousel' && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-bold">
          <span className="flex items-center gap-1.5">
            <span>👈👉</span>
            <span>手指左右滑動或點擊兩側箭頭瀏覽全部勳章，點擊已解鎖勳章即刻放大慶祝！</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition active:scale-95 border border-slate-200 shadow-xs flex items-center gap-1"
            >
              <span>◀</span>
              <span>向左滑</span>
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition active:scale-95 border border-slate-200 shadow-xs flex items-center gap-1"
            >
              <span>向右滑</span>
              <span>▶</span>
            </button>
          </div>
        </div>
      )}

      {/* Badges Container: Either Horizontal Swiping Ribbon or Responsive Grid */}
      <div
        ref={scrollContainerRef}
        className={
          viewMode === 'carousel'
            ? 'flex overflow-x-auto gap-4 pb-4 pt-1 px-1 snap-x snap-mandatory scrollbar-thin scroll-smooth'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
        }
      >
        {/* If viewing All or Special, show the Music Explorer Commemorative Badge in the grid too! */}
        {(filterCategory === 'all' || filterCategory === 'special') && (
          <button
            type="button"
            onClick={() => handleCommemorativeCardClick(MUSIC_EXPLORER_BADGE)}
            className={`p-5 rounded-3xl border-3 text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-300 shadow-sm group active:scale-95 cursor-pointer relative ${
              viewMode === 'carousel' ? 'w-48 sm:w-56 shrink-0 snap-center min-h-[220px]' : ''
            } ${
              poppingBadgeId === MUSIC_EXPLORER_BADGE.id
                ? 'scale-125 rotate-3 z-50 ring-4 ring-amber-400 shadow-2xl bg-amber-200'
                : isMusicExplorerUnlocked
                ? 'bg-gradient-to-b from-amber-100/95 to-amber-200/90 border-amber-400 shadow-md hover:shadow-xl hover:border-amber-500 hover:-translate-y-1'
                : 'bg-white border-amber-200 opacity-80 hover:opacity-100 hover:border-amber-300'
            }`}
            title={isMusicExplorerUnlocked ? '點擊查看「音樂探索家」紀念勳章詳情' : '連續 3 天每日練習滿 5 分鐘解鎖'}
          >
            {/* Special Commemorative Tag */}
            <div className="absolute top-2 right-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black shadow-xs">
              特別紀念
            </div>

            {/* Badge Icon */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner transition-transform group-hover:scale-110 ${
                isMusicExplorerUnlocked
                  ? 'bg-amber-300/90 ring-3 ring-amber-400 shadow-amber-300/50'
                  : 'bg-slate-100 ring-2 ring-slate-200 text-slate-400'
              }`}
            >
              {isMusicExplorerUnlocked ? MUSIC_EXPLORER_BADGE.icon : '🔒'}
            </div>

            {/* Title & Info */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-amber-900">
                {MUSIC_EXPLORER_BADGE.title}
              </span>
              <span className="text-xs text-amber-800 font-bold font-mono">
                連續 3 天 5分鐘
              </span>
            </div>

            {/* Status tip */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                isMusicExplorerUnlocked
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isMusicExplorerUnlocked ? '查看紀念 ➔' : `連續 ${currentStreak}/3 天 ➔`}
            </span>
          </button>
        )}

        {/* Regular Lesson Badges */}
        {(filterCategory === 'all' || filterCategory === 'lessons') &&
          LESSONS_DATABASE.map((lesson) => {
            const isUnlocked =
              progress.unlockedBadges.includes(lesson.badgeId) ||
              Boolean(progress.completedLessons[lesson.id] && progress.completedLessons[lesson.id].stars > 0);
            const completion = progress.completedLessons[lesson.id];
            const isPopping = poppingBadgeId === lesson.badgeId;

            return (
              <button
                key={lesson.badgeId}
                type="button"
                onClick={() => handleCardClick(lesson, isUnlocked)}
                className={`p-5 rounded-3xl border-3 text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-300 shadow-sm group active:scale-95 cursor-pointer relative ${
                  viewMode === 'carousel' ? 'w-48 sm:w-56 shrink-0 snap-center min-h-[220px]' : ''
                } ${
                  isPopping
                    ? 'scale-125 rotate-3 z-50 ring-4 ring-amber-400 shadow-2xl bg-amber-200'
                    : isUnlocked
                    ? 'bg-gradient-to-b from-amber-50/95 to-amber-100/90 border-amber-400 shadow-md hover:shadow-xl hover:border-amber-500 hover:-translate-y-1'
                    : 'bg-white border-slate-200 opacity-65 hover:opacity-90 hover:border-slate-300'
                }`}
                title={isUnlocked ? `點擊查看「${lesson.badgeTitle}」詳情` : `尚未解鎖「${lesson.badgeTitle}」`}
              >
                {/* Unlocked Star Ribbon Tag */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2.5 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs flex items-center gap-0.5">
                    <span>★</span>
                    <span>{completion ? completion.stars : 3}</span>
                  </div>
                )}

                {/* Badge Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner transition-transform group-hover:scale-110 ${
                    isUnlocked
                      ? 'bg-amber-200/80 ring-3 ring-amber-400 shadow-amber-300/40'
                      : 'bg-slate-100 ring-2 ring-slate-200'
                  }`}
                >
                  {isUnlocked ? lesson.badgeIcon : '🔒'}
                </div>

                {/* Title & Lesson info */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-amber-900">
                    {lesson.badgeTitle}
                  </span>
                  <span className="text-xs text-amber-800 font-bold font-mono">
                    第 {lesson.lessonNumber} 課
                  </span>
                </div>

                {/* Tap to view tip */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isUnlocked ? '查看榮譽 ➔' : '解鎖說明 ➔'}
                </span>
              </button>
            );
          })}
      </div>

      {/* ========================================================================= */}
      {/* Commemorative Badge Details Modal (特別紀念勳章詳細彈窗)                   */}
      {/* ========================================================================= */}
      {selectedCommemorativeBadge && (
        <div
          className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fade-in text-left select-none"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-400 flex flex-col gap-5 text-slate-800 animate-scale-up max-h-[90vh] overflow-y-auto scrollbar-thin">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCommemorativeBadge(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-black text-base transition active:scale-95"
              title="關閉"
            >
              ✕
            </button>

            {/* Header with Magnified Bouncy Animated Badge */}
            <div className="flex items-center gap-4 border-b-2 border-amber-100 pb-4">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center text-6xl shadow-2xl shrink-0 transition-transform ${
                  isMusicExplorerUnlocked
                    ? 'bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 ring-6 ring-amber-300 shadow-amber-400/60 scale-110 animate-bounce'
                    : 'bg-slate-100 ring-3 ring-slate-200 text-slate-400'
                }`}
              >
                {isMusicExplorerUnlocked ? selectedCommemorativeBadge.icon : '🔒'}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 font-mono">
                    ★ 特別紀念榮譽 ★
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isMusicExplorerUnlocked
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isMusicExplorerUnlocked ? '✅ 已解鎖獲得' : '🔒 進行中'}
                  </span>
                  {isMusicExplorerUnlocked && (
                    <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full animate-pulse">
                      ✨ 閃耀綻放中
                    </span>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-black text-slate-950">
                  {selectedCommemorativeBadge.title}紀念勳章
                </h2>

                <span className="text-xs text-slate-500 font-mono">
                  Badge ID: {selectedCommemorativeBadge.id}
                </span>
              </div>
            </div>

            {/* Lore & Story */}
            <div className="flex flex-col gap-3 text-sm">
              <div className="bg-amber-50/90 border-2 border-amber-200 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-xs font-black text-amber-900 uppercase">
                  📜 勳章背景與榮譽象徵
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-bold">
                  {selectedCommemorativeBadge.description}
                </p>
              </div>

              {/* Requirement Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <span>🎯 達成要求</span>
                  <span className="text-amber-700">{selectedCommemorativeBadge.requirement}</span>
                </div>

                {/* Progress bars */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 block text-[10px] font-bold">目前連續天數</span>
                    <span className="text-base font-black text-orange-600">
                      🔥 {currentStreak} / 3 天
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-slate-500 block text-[10px] font-bold">今日練習時長</span>
                    <span className="text-base font-black text-blue-700">
                      ⏱️ {formatMinutesSeconds(todaySeconds)} / 5分
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              {isMusicExplorerUnlocked ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-3xl">🎉</span>
                  <div className="text-xs text-emerald-950 font-bold leading-relaxed">
                    <strong>恭喜小琴童！</strong>此榮譽勳章已正式歸入你的個人榮譽星空，代表你具備持續不懈、勇於探索的卓越音樂精神！
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-3xl">💪</span>
                  <div className="text-xs text-amber-950 font-bold leading-relaxed">
                    <strong>加油！再接再厲！</strong>只要連續三天每日練習超過 5 分鐘，系統就會自動發放「{selectedCommemorativeBadge.title}」專屬紀念勳章喔！
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {isMusicExplorerUnlocked ? (
                <button
                  onClick={() => triggerFireworks(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs md:text-sm shadow-md transition active:scale-95 border-2 border-white"
                >
                  <span>🎆</span>
                  <span>放煙火慶祝此勳章！</span>
                </button>
              ) : (
                onOpenCheckInModal && (
                  <button
                    onClick={() => {
                      setSelectedCommemorativeBadge(null);
                      onOpenCheckInModal();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-sm"
                  >
                    <span>📅</span>
                    <span>開啟每日簽到儀表板</span>
                  </button>
                )
              )}

              <button
                onClick={() => setSelectedCommemorativeBadge(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs md:text-sm shadow transition ml-auto"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Lesson Badge Details Modal (課程徽章詳細說明彈窗)                         */}
      {/* ========================================================================= */}
      {selectedBadgeLesson && (() => {
        const isUnlocked =
          progress.unlockedBadges.includes(selectedBadgeLesson.badgeId) ||
          Boolean(progress.completedLessons[selectedBadgeLesson.id] && progress.completedLessons[selectedBadgeLesson.id].stars > 0);
        const completion = progress.completedLessons[selectedBadgeLesson.id];

        return (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fade-in text-left select-none"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-300 flex flex-col gap-5 text-slate-800 animate-scale-up max-h-[90vh] overflow-y-auto scrollbar-thin">
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadgeLesson(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-black text-base transition active:scale-95"
                title="關閉"
              >
                ✕
              </button>

              {/* Modal Top Header with Large Glowing Bouncy Badge Icon */}
              <div className="flex items-center gap-4 border-b-2 border-amber-100 pb-4">
                <div
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center text-6xl shadow-2xl shrink-0 transition-transform ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 ring-6 ring-amber-300 shadow-amber-400/60 scale-110 animate-bounce'
                      : 'bg-slate-100 ring-3 ring-slate-200 text-slate-400'
                  }`}
                >
                  {isUnlocked ? selectedBadgeLesson.badgeIcon : '🔒'}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 font-mono">
                      第 {selectedBadgeLesson.lessonNumber} 課榮譽徽章
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isUnlocked ? '✅ 已解鎖獲得' : '🔒 尚未解鎖'}
                    </span>
                    {isUnlocked && (
                      <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full animate-pulse">
                        ✨ 閃耀綻放中
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-slate-950">
                    {selectedBadgeLesson.badgeTitle}
                  </h2>

                  <span className="text-xs text-slate-500 font-mono">
                    Badge ID: {selectedBadgeLesson.badgeId}
                  </span>
                </div>
              </div>

              {/* Course & Musical Lore Information */}
              <div className="flex flex-col gap-3 text-sm">
                <div className="bg-amber-50/90 border-2 border-amber-200 rounded-2xl p-4 flex flex-col gap-1.5">
                  <span className="text-xs font-black text-amber-900 uppercase">
                    🎼 對應樂曲與故事章節
                  </span>
                  <div className="text-base font-black text-slate-900">
                    {selectedBadgeLesson.title}（{selectedBadgeLesson.songName}）
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedBadgeLesson.storyScene}
                  </p>
                </div>

                {/* Focus skills */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 font-bold block mb-0.5">調性與拍號</span>
                    <span className="text-slate-900 font-black">
                      {selectedBadgeLesson.keySignature || 'C大調'} · 4/4拍
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 font-bold block mb-0.5">訓練核心指法</span>
                    <span className="text-slate-900 font-black truncate block">
                      {selectedBadgeLesson.techniqueChallenges[0]?.focusSkill || '基礎落鍵與獨立性'}
                    </span>
                  </div>
                </div>

                {/* Achievement Records or Unlock Condition */}
                {isUnlocked ? (
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 uppercase">
                        🏆 你的歷程成就紀錄
                      </span>
                      <span className="text-amber-500 text-sm font-black tracking-widest">
                        {'★'.repeat(completion?.stars || 3)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="bg-white p-2 rounded-xl shadow-xs border border-emerald-200">
                        <span className="text-slate-500 block text-[10px]">最高得分</span>
                        <span className="text-sm font-black text-emerald-700">
                          {completion?.bestScore || 100} 分
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl shadow-xs border border-emerald-200">
                        <span className="text-slate-500 block text-[10px]">最高演奏速度</span>
                        <span className="text-sm font-black text-blue-700">
                          {completion?.bestBpm || 80} BPM
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl shadow-xs border border-emerald-200">
                        <span className="text-slate-500 block text-[10px]">獲得星級</span>
                        <span className="text-sm font-black text-amber-600">
                          {completion?.stars || 3} 顆星
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 flex flex-col gap-1.5 text-xs text-amber-950 font-medium">
                    <strong className="text-sm font-black text-amber-900 block">
                      🔒 如何解鎖這個榮譽徽章？
                    </strong>
                    <p className="leading-relaxed">
                      請在主頁切換至<strong>「課程地圖」</strong>，前往<strong>第 {selectedBadgeLesson.lessonNumber} 課「{selectedBadgeLesson.title}」</strong>，順利完成熱身技巧、核心樂曲與挑戰任務，就能把這個徽章帶回榮譽殿堂囉！
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-2 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {isUnlocked ? (
                  <button
                    onClick={() => triggerFireworks(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs md:text-sm shadow-md transition active:scale-95 border-2 border-white"
                  >
                    <span>🎆</span>
                    <span>放煙火慶祝此徽章！</span>
                  </button>
                ) : (
                  <button
                    onClick={() => pianoSynth.playCorrectHitSound()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition active:scale-95"
                  >
                    <span>🔊</span>
                    <span>試聽榮譽提示音</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedBadgeLesson(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs md:text-sm shadow transition ml-auto"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-amber-100 text-slate-900 rounded-3xl p-8 shadow-2xl border-8 border-amber-400 flex flex-col items-center text-center gap-4">
            {/* Close button */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 font-bold text-lg"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-widest text-xs">
              ★ KaiQuest Piano Adventure Official Certificate ★
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              小小鋼琴探險家榮譽證書
            </h2>

            <p className="text-sm text-slate-700 max-w-md">
              茲證明卓越的小音樂家在鋼琴島的奇幻歷險中，展現了無與倫比的熱情、穩定的指法與靈敏的音準！
            </p>

            {/* Child's Name Input Field */}
            <div className="flex items-center gap-2 my-2">
              <span className="text-sm font-bold text-slate-800">頒發給：</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-xl md:text-2xl font-black text-blue-900 border-b-2 border-slate-800 bg-transparent text-center focus:outline-none px-2"
              />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-6 bg-white/70 rounded-2xl p-4 w-full max-w-md border border-amber-300">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">完成課數</span>
                <span className="text-xl font-black text-slate-900">{lessonsCompletedCount} / 12</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">獲得星星</span>
                <span className="text-xl font-black text-amber-600">{totalStars} ★</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">解鎖徽章</span>
                <span className="text-xl font-black text-blue-600">{progress.unlockedBadges.length} 🏅</span>
              </div>
            </div>

            {/* Music Explorer Special Seal if unlocked */}
            {isMusicExplorerUnlocked && (
              <div className="bg-amber-200/80 border-2 border-amber-400 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-black text-amber-950 shadow-xs animate-pulse">
                <span>🧭</span>
                <span>榮譽加註：已通過「音樂探索家」連續 3 天每日 5 分鐘專注認證！</span>
              </div>
            )}

            {/* Mentor Stamps & Signatures */}
            <div className="flex items-center justify-center gap-4 py-1">
              <div className="flex flex-col items-center">
                <ExplorerKaiSvg size={58} mood="celebrating" />
                <span className="text-[10px] font-black text-amber-900">探險家 Kai</span>
              </div>
              <div className="flex flex-col items-center">
                <EliLionSvg size={50} mood="happy" />
                <span className="text-[10px] font-black text-amber-900">獅子 Eli</span>
              </div>
              <div className="flex flex-col items-center">
                <KabutoBeetleSvg size={42} />
                <span className="text-[10px] font-black text-blue-900">甲蟲 Kabuto</span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full max-w-md pt-3 text-xs text-slate-600 border-t border-amber-300">
              <div className="text-left font-mono">
                證書發行日期: {new Date().toLocaleDateString('zh-TW')}
              </div>
              <div className="text-right font-bold text-slate-800">
                Kai & 動物導師團 敬頒
              </div>
            </div>

            {/* Print & Fireworks Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => triggerFireworks(true)}
                className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow transition active:scale-95"
              >
                🎆 歡慶證書放煙火
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
              >
                🖨️ 列印證書保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
