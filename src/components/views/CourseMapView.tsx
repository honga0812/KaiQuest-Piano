import React, { useState } from 'react';
import { Lesson, UserProgress, AgeBand } from '../../types/piano';
import { LESSONS_DATABASE, DIFFICULTY_LEVEL_INFO } from '../../data/lessons';
import { AGE_STAGES_INFO } from '../../data/curriculumStages';
import { KaiCharacter } from '../mascot/KaiCharacter';
import { KaiAndFriendsEnsemble, EliLionSvg, KabutoBeetleSvg, PicoDolphinSvg, RexDinoSvg, ExplorerKaiSvg } from '../mascot/AnimalFriends';
import { CartoonIslandMap } from './CartoonIslandMap';
import { WeeklyLearningPlan } from './WeeklyLearningPlan';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { speechGuide } from '../../utils/speechGuide';

interface CourseMapViewProps {
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onSelectAge?: (age: AgeBand) => void;
  onOpenGym?: () => void;
  onOpenConcert?: () => void;
  onOpenRhythm?: () => void;
  className?: string;
}

export type MapViewTab = 'lessons' | 'plan' | 'concert' | 'mentors';

export const CourseMapView: React.FC<CourseMapViewProps> = ({
  progress,
  onSelectLesson,
  onSelectAge,
  onOpenGym,
  onOpenConcert,
  onOpenRhythm,
  className = '',
}) => {
  const currentAge = progress.userAge;
  const currentStageInfo = AGE_STAGES_INFO[currentAge];

  // Tablet-Native Segmented Tab Navigation:
  const [activeTab, setActiveTab] = useState<MapViewTab>('lessons');

  // Sub-view toggle in lessons tab: Cartoon Map (default!) or Card Grid
  const [lessonDisplayMode, setLessonDisplayMode] = useState<'map' | 'grid'>('map');

  // Filters within the lessons tab
  const [quarterFilter, setQuarterFilter] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [difficultyFilter, setDifficultyFilter] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [viewFilter, setViewFilter] = useState<'focused' | 'all'>('focused');

  // Filter lessons
  const ageLessons = LESSONS_DATABASE.filter((l) => l.ageBand === currentAge);
  let baseLessons = viewFilter === 'focused' ? ageLessons : LESSONS_DATABASE;

  if (viewFilter === 'focused' && quarterFilter !== 0) {
    baseLessons = baseLessons.filter((l) => l.quarter === quarterFilter);
  }

  if (difficultyFilter !== 0) {
    baseLessons = baseLessons.filter((l) => l.difficultyLevel === difficultyFilter);
  }

  const displayedLessons = baseLessons;

  // Stats calculation
  const totalStars = Object.values(progress.completedLessons).reduce((acc, l) => acc + l.stars, 0);
  const currentAgeCompletedCount = ageLessons.filter(
    (l) => !!progress.completedLessons[l.id] && progress.completedLessons[l.id].stars > 0
  ).length;

  // Identify next recommended lesson for quick CTA
  const nextRecommendedLesson: Lesson =
    ageLessons.find(
      (l) => !progress.completedLessons[l.id] || progress.completedLessons[l.id].stars < 1
    ) || ageLessons[0];

  const speakLessonGuide = (lesson: Lesson) => {
    const prompt = `第 ${lesson.lessonNumber} 課《${lesson.songName}》，${lesson.title}！練習重點：${lesson.storyScene || '手型要像握住一顆小蘋果，跟著節奏穩健彈奏'}。探險家 Kai 為你加油！`;
    speechGuide.speak(prompt, {
      emotion: 'friendly',
    });
  };

  const handleLessonCardClick = (lesson: Lesson, isUnlocked: boolean) => {
    if (!isUnlocked) {
      pianoSynth.playGentlePrompt();
      return;
    }
    pianoSynth.playCorrectHitSound();
    speechGuide.stop();
    onSelectLesson(lesson);
  };

  return (
    <div className={`flex flex-col gap-3 w-full max-w-7xl mx-auto p-2.5 md:p-4 select-none ${className}`}>
      {/* ========================================================================= */}
      {/* 1. Tablet Command Strip (平板緊湊頂部即時狀態列) - 免長滑動即知進度與快速開始 */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-3 md:p-3.5 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3 text-left">
        {/* Left: Island Stage + Rapid Age Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-xl shadow-xs text-slate-950 shrink-0">
              {currentAge === 4 ? '🌱' : currentAge === 5 ? '🖐️' : currentAge === 6 ? '🚀' : '👑'}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base md:text-lg font-black text-slate-950">
                  {currentStageInfo.islandName}
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full font-mono">
                  {currentAge} 歲階段
                </span>
              </div>
              <span className="text-xs text-slate-500 font-bold block truncate max-w-xs md:max-w-sm">
                {currentStageInfo.stageTitle} · {currentStageInfo.tempoRange}
              </span>
            </div>
          </div>

          {/* Rapid Age Switcher Pills (專為平板拇指點擊設計) */}
          {onSelectAge && (
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 ml-auto sm:ml-2">
              {([4, 5, 6, 7] as AgeBand[]).map((age) => (
                <button
                  key={age}
                  onClick={() => {
                    onSelectAge(age);
                    setQuarterFilter(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-black transition active:scale-95 flex items-center gap-1 ${
                    currentAge === age
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`切換至 ${age} 歲課程地圖`}
                >
                  <span>{age === 4 ? '🌱' : age === 5 ? '🖐️' : age === 6 ? '🚀' : '👑'}</span>
                  <span>{age}歲</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center/Right: Quick Metrics & One-Tap Direct Practice Button */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          {/* Metrics */}
          <div className="flex items-center gap-2 text-xs md:text-sm font-black text-slate-700 bg-amber-50/80 px-3 py-1.5 rounded-2xl border border-amber-200">
            <span className="text-amber-600 font-mono">
              ⭐ {currentAgeCompletedCount * 3}/36 星
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-blue-700 font-mono">
              🏅 {progress.unlockedBadges.length} 徽章
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-orange-600 font-mono">
              🔥 {progress.longestStreak} 連勝
            </span>
          </div>

          {/* Quick Launch CTA (一鍵直達今日進度) */}
          <button
            onClick={() => handleLessonCardClick(nextRecommendedLesson, true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs md:text-sm rounded-2xl shadow-md transition active:scale-95"
            title={`立即開始第 ${nextRecommendedLesson.lessonNumber} 課「${nextRecommendedLesson.title}」`}
          >
            <span>🚀 推薦進度：</span>
            <span className="truncate max-w-[140px] md:max-w-[180px]">
              第 {nextRecommendedLesson.lessonNumber} 課《{nextRecommendedLesson.songName}》
            </span>
            <span>➔</span>
          </button>

          {/* Quick Rhythm Catch Mini-Game Launch */}
          {onOpenRhythm && (
            <button
              onClick={onOpenRhythm}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs md:text-sm rounded-2xl shadow-md transition active:scale-95"
              title="挑戰全新「節奏音符捕捉」小遊戲"
            >
              <span>⚡</span>
              <span>節奏捕捉</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Tablet Native Segmented Nav Bar (大按鈕分頁切換列) - 避免垂直無限堆疊   */}
      {/* ========================================================================= */}
      <nav
        className="flex items-center bg-white p-1.5 rounded-2xl border-2 border-amber-300 shadow-xs text-sm font-black gap-1.5 overflow-x-auto scrollbar-none"
        aria-label="課程地圖分區切換"
      >
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 active:scale-95 ${
            activeTab === 'lessons'
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-700 hover:text-slate-950 hover:bg-amber-50'
          }`}
        >
          <span className="text-base">🗺️</span>
          <span>冒險關卡</span>
          <span className="text-xs bg-white/80 text-amber-950 px-2 py-0.2 rounded-full font-mono font-black">
            {ageLessons.length}堂
          </span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 active:scale-95 relative ${
            activeTab === 'plan'
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-700 hover:text-slate-950 hover:bg-amber-50'
          }`}
        >
          <span className="text-base">📅</span>
          <span>本週學習計畫</span>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab('concert')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 active:scale-95 ${
            activeTab === 'concert'
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-700 hover:text-slate-950 hover:bg-amber-50'
          }`}
        >
          <span className="text-base">🎹</span>
          <span>全曲與哈農</span>
          <span className="text-xs opacity-80 font-normal">28金曲</span>
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 active:scale-95 ${
            activeTab === 'mentors'
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-700 hover:text-slate-950 hover:bg-amber-50'
          }`}
        >
          <span className="text-base">🐾</span>
          <span>導師團與教學指引</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* Tab 1: 冒險關卡地圖 (Adventure Lessons) - 預設顯示生動卡通島地圖！          */}
      {/* ========================================================================= */}
      {activeTab === 'lessons' && (
        <div className="flex flex-col gap-3 animate-fade-in text-left">
          {/* Sub-bar: Map / Grid Switcher + Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-amber-200 rounded-2xl p-2 md:p-2.5 text-xs md:text-sm shadow-xs">
            {/* View Mode Toggle (Map vs Grid) */}
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-700 mr-1">檢視方式：</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setLessonDisplayMode('map')}
                  className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 ${
                    lessonDisplayMode === 'map'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🗺️</span>
                  <span>奇幻冒險島地圖 (小朋友最愛)</span>
                </button>
                <button
                  onClick={() => setLessonDisplayMode('grid')}
                  className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 ${
                    lessonDisplayMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>📜</span>
                  <span>關卡卡片清單</span>
                </button>
              </div>
            </div>

            {/* If in Grid mode, show quarter filters */}
            {lessonDisplayMode === 'grid' && (
              <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200 overflow-x-auto">
                {[
                  { q: 0, label: '🌈 全部' },
                  { q: 1, label: '🌸 Q1 萌芽' },
                  { q: 2, label: '☀️ Q2 力量' },
                  { q: 3, label: '🍁 Q3 飛翔' },
                  { q: 4, label: '❄️ Q4 大師' },
                ].map((tab) => (
                  <button
                    key={tab.q}
                    onClick={() => setQuarterFilter(tab.q as 0 | 1 | 2 | 3 | 4)}
                    className={`px-2.5 py-1 rounded-lg font-black whitespace-nowrap transition ${
                      quarterFilter === tab.q
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Helper indicator */}
            <div className="text-xs text-slate-500 font-bold ml-auto hidden sm:block">
              {lessonDisplayMode === 'map' ? '🌟 點擊地圖上的站點或動物夥伴即可互動' : `共 ${displayedLessons.length} 堂課程`}
            </div>
          </div>

          {/* 1. Primary View: Cartoon Adventure Island Map (平板一屏盡收眼底，免往下拉) */}
          {lessonDisplayMode === 'map' && (
            <div className="animate-fade-in">
              <CartoonIslandMap
                lessons={ageLessons}
                currentAge={currentAge}
                progress={progress}
                onSelectLesson={onSelectLesson}
              />
            </div>
          )}

          {/* 2. Secondary View: Lessons Grid (卡片清單模式) */}
          {lessonDisplayMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fade-in">
              {displayedLessons.map((lesson) => {
                const comp = progress.completedLessons[lesson.id];
                const isCompleted = !!comp && comp.stars > 0;
                const lessonIdx = lesson.lessonNumber - 1;
                const isUnlocked =
                  lessonIdx === 0 ||
                  !!progress.completedLessons[`lesson-${lessonIdx}`] ||
                  lesson.ageBand === currentAge;
                const starsEarned = comp?.stars || 0;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonCardClick(lesson, isUnlocked)}
                    className={`rounded-3xl p-4.5 border-2 text-left flex flex-col justify-between transition-all duration-200 relative group cursor-pointer ${
                      !isUnlocked
                        ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                        : isCompleted
                        ? 'bg-gradient-to-b from-emerald-50/95 to-white border-emerald-300 shadow-xs hover:shadow-md hover:border-emerald-400'
                        : 'bg-white border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Top Bar: Number + Title + Stars + Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isUnlocked
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {lesson.lessonNumber}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-800 font-mono">
                              第 {lesson.weekNumber || lesson.lessonNumber} 週
                            </span>
                            <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                              Q{lesson.quarter || 1}
                            </span>
                          </div>
                          <span className="text-sm font-black text-blue-600 truncate max-w-[150px]">
                            《{lesson.songName}》
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Stars */}
                        <div className="flex items-center text-base">
                          {[1, 2, 3].map((s) => (
                            <span
                              key={s}
                              className={s <= starsEarned ? 'text-amber-400 drop-shadow-xs font-black' : 'text-slate-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        {/* Badge Icon */}
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border ${
                            isCompleted
                              ? 'bg-amber-200 border-amber-400 shadow-2xs'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}
                          title={lesson.badgeTitle}
                        >
                          {isCompleted ? lesson.badgeIcon : '🔒'}
                        </span>
                      </div>
                    </div>

                    {/* Title & Lore snippet */}
                    <div className="flex flex-col gap-1 mb-2">
                      <h3 className="text-base md:text-lg font-black text-slate-900 line-clamp-1 group-hover:text-amber-900">
                        {lesson.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-600 font-bold leading-relaxed line-clamp-2">
                        {lesson.storyScene}
                      </p>
                    </div>

                    {/* 直觀視覺化進度條（星級顯示 - 0/3 ~ 3/3 星級） */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex flex-col gap-1.5 my-1.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span>⭐ 星級進度：</span>
                          <span
                            className={
                              starsEarned === 3
                                ? 'text-emerald-700 font-black'
                                : starsEarned === 2
                                ? 'text-blue-700 font-black'
                                : starsEarned === 1
                                ? 'text-amber-700 font-black'
                                : 'text-slate-400 font-bold'
                            }
                          >
                            {starsEarned === 3
                              ? '★★★ 完美大師 (3/3星)'
                              : starsEarned === 2
                              ? '★★ 熟練掌握 (2/3星)'
                              : starsEarned === 1
                              ? '★ 初學達成 (1/3星)'
                              : '尚未挑戰 (0/3星)'}
                          </span>
                        </span>
                        <span className="font-mono text-slate-500 font-black text-xs">
                          {Math.round((starsEarned / 3) * 100)}%
                        </span>
                      </div>

                      {/* Visual segmented progress track */}
                      <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            starsEarned === 3
                              ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 shadow-xs'
                              : starsEarned === 2
                              ? 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-xs'
                              : starsEarned === 1
                              ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-xs'
                              : 'bg-transparent'
                          }`}
                          style={{ width: `${(starsEarned / 3) * 100}%` }}
                        />
                      </div>

                      {/* 3 Step Milestone Indicators */}
                      <div className="flex items-center justify-between px-1 text-[11px] font-black">
                        {[1, 2, 3].map((star) => (
                          <span
                            key={`milestone-${lesson.id}-${star}`}
                            className={`flex items-center gap-0.5 ${
                              star <= starsEarned
                                ? 'text-amber-500 drop-shadow-xs font-black'
                                : 'text-slate-300 font-bold'
                            }`}
                          >
                            <span>{star <= starsEarned ? '★' : '☆'}</span>
                            <span>{star === 1 ? '銅牌' : star === 2 ? '銀牌' : '金牌'}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills pill */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 mb-2 truncate">
                      <strong className="text-amber-950 font-black">焦點：</strong>
                      <span>{lesson.techniqueChallenges[0]?.focusSkill || '圓手拱門與獨立落鍵'}</span>
                    </div>

                    {/* 4 階段進階路徑迷你標籤 (1.技巧 -> 2.主歌 -> 3.副歌 -> 4.全曲) */}
                    <div className="flex items-center justify-between gap-1 text-[11px] font-black text-slate-600 mb-2.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
                      <span className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded-md border border-amber-200">1.技巧</span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded-md border border-blue-200">2.主歌</span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded-md border border-purple-200">3.副歌</span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-md border border-emerald-200">4.全曲👑</span>
                    </div>

                    {/* Bottom Action row - iPad 橫向解析度足夠點擊區域 (>= 48px) + 輕微彈跳動畫提示 */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs md:text-sm gap-2">
                      <span className="text-slate-400 font-bold font-mono text-xs">
                        {lesson.songChallenges[0]?.bpm || 60} BPM · {lesson.keySignature || 'C大調'}
                      </span>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakLessonGuide(lesson);
                          }}
                          className="w-11 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 flex items-center justify-center text-base shadow-xs transition active:scale-95 shrink-0"
                          title="聽取本課 AI 語音導覽"
                        >
                          🔊
                        </button>

                        <button
                          type="button"
                          disabled={!isUnlocked}
                        className={`min-h-[48px] px-5 py-3 rounded-2xl font-black text-sm md:text-base transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-2 border-emerald-300 animate-kid-bounce'
                            : isUnlocked
                            ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 border-2 border-white animate-kid-bounce shadow-amber-300/60'
                            : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed opacity-75'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <span>✨</span>
                            <span>再次練習</span>
                            <span>➔</span>
                          </>
                        ) : isUnlocked ? (
                          <>
                            <span>👉</span>
                            <span>開始練琴</span>
                            <span>➔</span>
                          </>
                        ) : (
                          <>
                            <span>🔒</span>
                            <span>未解鎖</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 2: 本週學習計畫 (Weekly Learning Plan) - 專屬完整展示，1 鍵即達         */}
      {/* ========================================================================= */}
      {activeTab === 'plan' && (
        <div className="animate-fade-in">
          <WeeklyLearningPlan
            progress={progress}
            onSelectLesson={onSelectLesson}
            onOpenGym={onOpenGym}
            onOpenConcert={onOpenConcert}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 3: 全曲名曲與哈農演奏殿堂 (Concert & Hanon Repertoire)                  */}
      {/* ========================================================================= */}
      {activeTab === 'concert' && (
        <div className="bg-gradient-to-br from-amber-50 via-white to-sky-50 border-3 border-amber-300 rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 text-left animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-4xl shadow-md text-slate-950 shrink-0">
              🎹
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 font-mono">
                  Master Repertoire Hall
                </span>
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  熱門
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-950">
                全曲名曲演奏與哈農流暢跑動 (4~7 歲完整曲庫)
              </h3>
              <p className="text-xs md:text-sm text-slate-600 font-bold max-w-xl leading-relaxed">
                精選世界名曲《小星星》、《歡樂頌》、《給愛麗絲》、《卡農》等 28 首鋼琴傑作，以及 16 首專為幼兒獨立指力設計的哈農鋼琴體操！
              </p>
            </div>
          </div>

          {onOpenConcert && (
            <button
              onClick={() => {
                pianoSynth.playCorrectHitSound();
                onOpenConcert();
              }}
              className="px-6 py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-base md:text-lg rounded-2xl shadow-lg transition active:scale-95 border-2 border-white flex items-center gap-2 shrink-0"
            >
              <span>✨</span>
              <span>進入演奏殿堂</span>
              <span>➔</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 4: 奇幻島動物導師團與教學重點 (Mentors & Stage Lore)                   */}
      {/* ========================================================================= */}
      {activeTab === 'mentors' && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          {/* Stage Pedagogy Card */}
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-xs">
                {currentAge === 4 ? '🌱' : currentAge === 5 ? '🖐️' : currentAge === 6 ? '🚀' : '👑'}
              </span>
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-950">
                  {currentStageInfo.islandName} · {currentStageInfo.stageTitle}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 font-bold mt-0.5">
                  {currentStageInfo.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-100">
              <span className="text-xs md:text-sm font-black text-slate-700 mr-1">本年齡教學重點：</span>
              {currentStageInfo.focusHighlights.map((focus, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl text-xs md:text-sm bg-sky-50 border border-sky-200 text-sky-900 font-bold flex items-center gap-1"
                >
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{focus}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Storyboard Animal Friends Ensemble Showcase */}
          <div className="bg-gradient-to-r from-amber-50 via-white to-sky-50 border-2 border-amber-300 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4 text-center">
            <div className="flex items-center justify-between px-2 flex-wrap gap-2 text-left">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🐾</span>
                <div>
                  <span className="text-base md:text-lg font-black text-slate-900 block">
                    探險家 Kai 與奇幻動物好友團
                  </span>
                  <span className="text-xs md:text-sm text-slate-600 font-bold block">
                    暖暖獅子 Eli、甲蟲 Kabuto、躍動海豚 Pico 與森林小恐龍 Rex 陪你探索鋼琴島！
                  </span>
                </div>
              </div>
              <span className="text-xs md:text-sm font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
                🌟 故事板原創角色陣容
              </span>
            </div>

            {/* Individual Animal Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="bg-white p-3 rounded-2xl border border-amber-200 flex flex-col items-center shadow-xs">
                <ExplorerKaiSvg size={100} mood="celebrating" />
                <span className="text-xs md:text-sm font-black text-slate-900 mt-1">🧭 探險家 Kai</span>
                <span className="text-[11px] text-amber-700 font-bold">主角琴童 · 金K徽章</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-amber-200 flex flex-col items-center shadow-xs">
                <EliLionSvg size={90} mood="happy" />
                <span className="text-xs md:text-sm font-black text-amber-900 mt-1">🦁 暖暖獅子 Eli</span>
                <span className="text-[11px] text-amber-700 font-bold">圓花瓣鬃毛 · 水藍領巾</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-amber-200 flex flex-col items-center shadow-xs">
                <KabutoBeetleSvg size={80} />
                <span className="text-xs md:text-sm font-black text-blue-900 mt-1">🪲 甲蟲 Kabuto</span>
                <span className="text-[11px] text-blue-700 font-bold">深藍黃斑點 · 帥氣角</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-amber-200 flex flex-col items-center shadow-xs">
                <PicoDolphinSvg size={85} />
                <span className="text-xs md:text-sm font-black text-sky-900 mt-1">🐬 躍動海豚 Pico</span>
                <span className="text-[11px] text-sky-700 font-bold">躍起水花 · 橘色領圈</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-amber-200 flex flex-col items-center shadow-xs col-span-2 sm:col-span-1">
                <RexDinoSvg size={85} />
                <span className="text-xs md:text-sm font-black text-emerald-900 mt-1">🦖 森林恐龍 Rex</span>
                <span className="text-[11px] text-emerald-700 font-bold">背部圓板 · 紫色護腕</span>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200">
              <KaiAndFriendsEnsemble />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
