import React, { useState } from 'react';
import { Lesson, UserProgress, AgeBand } from '../../types/piano';
import { LESSONS_DATABASE, DIFFICULTY_LEVEL_INFO } from '../../data/lessons';
import { AGE_STAGES_INFO } from '../../data/curriculumStages';
import { KaiCharacter } from '../mascot/KaiCharacter';
import { KaiAndFriendsEnsemble } from '../mascot/AnimalFriends';

interface CourseMapViewProps {
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onSelectAge?: (age: AgeBand) => void;
  onOpenConcert?: () => void;
  className?: string;
}

export const CourseMapView: React.FC<CourseMapViewProps> = ({
  progress,
  onSelectLesson,
  onSelectAge,
  onOpenConcert,
  className = '',
}) => {
  const currentAge = progress.userAge;
  const currentStageInfo = AGE_STAGES_INFO[currentAge];

  // View filter: 'focused' (current age 12 lessons) or 'all' (all 48 lessons)
  const [viewFilter, setViewFilter] = useState<'focused' | 'all'>('focused');
  // Quarter filter for current age
  const [quarterFilter, setQuarterFilter] = useState<0 | 1 | 2 | 3 | 4>(0); // 0 = all quarters
  // Difficulty Level filter: 0 = all, 1 = Level 1, ..., 5 = Level 5
  const [difficultyFilter, setDifficultyFilter] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  // Category / Module focus filter
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'technique' | 'song' | 'performance'>('all');

  // Displayed lessons with filters applied
  const ageLessons = LESSONS_DATABASE.filter((l) => l.ageBand === currentAge);
  let baseLessons = viewFilter === 'focused' ? ageLessons : LESSONS_DATABASE;

  if (viewFilter === 'focused' && quarterFilter !== 0) {
    baseLessons = baseLessons.filter((l) => l.quarter === quarterFilter);
  }

  if (difficultyFilter !== 0) {
    baseLessons = baseLessons.filter((l) => l.difficultyLevel === difficultyFilter);
  }

  const displayedLessons = baseLessons;

  // Calculate total stars
  const totalStars = Object.values(progress.completedLessons).reduce((acc, l) => acc + l.stars, 0);
  const currentAgeCompletedCount = ageLessons.filter(
    (l) => !!progress.completedLessons[l.id] && progress.completedLessons[l.id].stars > 0
  ).length;

  return (
    <div className={`flex flex-col gap-5 w-full max-w-6xl mx-auto p-4 md:p-6 select-none ${className}`}>
      {/* Header Banner - Candy Gradient for Kids */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-amber-600 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-300/40">
        <div className="flex flex-col gap-2 text-left z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-300 font-mono bg-yellow-950/60 px-2.5 py-0.5 rounded-full border border-yellow-400/40">
              52 週年度漸進體系 · 4 ~ 7 歲分齡鋼琴島
            </span>
            <span className="text-white text-xs">·</span>
            <span className="text-xs text-amber-100 font-extrabold">
              當前年齡：{currentAge} 歲
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight text-balance drop-shadow-md">
            KaiQuest 奇幻鋼琴島冒險地圖
          </h1>
          <p className="text-xs md:text-sm text-blue-100 max-w-xl font-bold leading-relaxed">
            為 4歲、5歲、6歲、7歲兒童生理發展與骨骼力量量身定制！年度 52 週 48 堂系統進階課程，每週一練，從三音圓手型到皇家大師！
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white font-extrabold">
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/50 px-3 py-1 rounded-xl border border-amber-400/30">
              <span>⭐</span>
              <span>{totalStars} / 144 星星 (本歲 {currentAgeCompletedCount * 3}/36)</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-200 bg-blue-950/50 px-3 py-1 rounded-xl border border-blue-400/30">
              <span>🏅</span>
              <span>{progress.unlockedBadges.length} / 48 徽章</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-400/30">
              <span>🔥</span>
              <span>連續通關 {progress.longestStreak} 課</span>
            </div>
          </div>
        </div>

        {/* Mascot with Eli Lion Companion */}
        <div className="z-10 shrink-0">
          <KaiCharacter
            mood="excited"
            companion="eli_lion"
            speechText={`歡迎來到 ${currentStageInfo.islandName}！探險家 Kai 與動物夥伴們已準備好出發！`}
            speechEn="Ready for Adventure!"
            size="lg"
          />
        </div>

        {/* Decorative Musical Circles */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* Storyboard Animal Friends Expedition Showcase */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-sky-50 border-3 border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col gap-3 text-center">
        <div className="flex items-center justify-between px-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-left">
            <span className="text-2xl">🐾</span>
            <div>
              <span className="text-sm font-black text-slate-900 block">
                探險家 Kai 與奇幻動物好友團
              </span>
              <span className="text-xs text-slate-600 font-bold block">
                獅子 Eli、甲蟲 Kabuto、海豚 Pico 與恐龍 Rex 陪你探索鋼琴島！
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shadow-xs">
            🌟 故事板官方角色大集合
          </span>
        </div>
        <KaiAndFriendsEnsemble />
      </div>

      {/* Dedicated Age-Stage Pedagogical Card - Bright & Cheerful */}
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-lg flex flex-col gap-4 text-left text-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shrink-0 shadow-sm">
              {currentAge === 4 ? '🌱' : currentAge === 5 ? '🖐️' : currentAge === 6 ? '🚀' : '👑'}
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  {currentStageInfo.islandName} · {currentStageInfo.stageTitle}
                </h2>
                <span className="px-3.5 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-sm">
                  12 堂年度精選里程碑
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 font-bold">
                {currentStageInfo.description}
              </p>
            </div>
          </div>

          {/* Quick Age Switcher Pills */}
          {onSelectAge && (
            <div className="flex items-center bg-amber-50 p-1.5 rounded-2xl border-2 border-amber-200 shadow-sm">
              {([4, 5, 6, 7] as AgeBand[]).map((age) => (
                <button
                  key={age}
                  onClick={() => {
                    onSelectAge(age);
                    setQuarterFilter(0);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition flex items-center gap-1.5 active:scale-95 ${
                    currentAge === age
                      ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-md scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/50'
                  }`}
                >
                  <span className="text-base">{age === 4 ? '🌱' : age === 5 ? '🖐️' : age === 6 ? '🚀' : '👑'}</span>
                  <span>{age} 歲</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Focus Skill Tags */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t-2 border-amber-100">
          <span className="text-sm text-slate-700 font-black mr-1">本年齡教學重點：</span>
          {currentStageInfo.focusHighlights.map((focus, i) => (
            <span
              key={i}
              className="px-3.5 py-1.5 rounded-xl text-xs md:text-sm bg-sky-50 border border-sky-200 text-sky-900 font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <span className="text-emerald-600 font-black">✓</span>
              <span>{focus}</span>
            </span>
          ))}
          <span className="ml-auto text-xs md:text-sm text-amber-900 font-mono font-black bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-300">
            推薦節奏：{currentStageInfo.tempoRange}
          </span>
        </div>
      </div>

      {/* Full Songs & Hanon Virtuoso Gateway Card */}
      {onOpenConcert && (
        <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-2 border-amber-300 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-md text-slate-800">
          <div className="flex items-center gap-4 text-left">
            <span className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm shrink-0">
              🎹
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900">
                  👑 全曲名曲演奏與哈農流暢跑動 (4~7 歲完整曲庫)
                </h3>
                <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  熱門
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 font-bold">
                收錄 28 首世界金曲（《小星星》、《歡樂頌》、《給愛麗絲》、《卡農》等）與 16 首哈農手指體操！
              </p>
            </div>
          </div>

          <button
            onClick={onOpenConcert}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-sm md:text-base rounded-2xl shadow-md transition transform active:scale-95 flex items-center gap-2"
          >
            <span>✨</span>
            <span>進入全曲與哈農演奏殿堂</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* Quarter / Seasonal Roadmap Filter for Annual Curriculum */}
      {/* Quarter / Seasonal Roadmap Filter for Annual Curriculum */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-slate-800">
        <div className="flex items-center gap-2 text-left">
          <span className="text-lg md:text-xl font-black text-slate-900">
            {viewFilter === 'focused' ? `【${currentAge} 歲 52 週年度漸進課堂】` : '【全島 48 堂年度大滿貫】'}
          </span>
          <span className="text-sm text-amber-900 font-bold bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            {displayedLessons.length} 堂課
          </span>
        </div>

        {/* View Mode & Quarter Selector */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {viewFilter === 'focused' && (
            <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-amber-200 shadow-sm">
              {[
                { q: 0, label: '🌈 全部季度' },
                { q: 1, label: '🌸 Q1 萌芽' },
                { q: 2, label: '☀️ Q2 力量' },
                { q: 3, label: '🍁 Q3 飛翔' },
                { q: 4, label: '❄️ Q4 大師' },
              ].map((tab) => (
                <button
                  key={tab.q}
                  onClick={() => setQuarterFilter(tab.q as 0 | 1 | 2 | 3 | 4)}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs md:text-sm transition whitespace-nowrap ${
                    quarterFilter === tab.q
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center bg-white p-1 rounded-2xl border-2 border-amber-200 shadow-sm">
            <button
              onClick={() => {
                setViewFilter('focused');
                setQuarterFilter(0);
                setDifficultyFilter(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-black transition ${
                viewFilter === 'focused' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentAge} 歲推薦課程
            </button>
            <button
              onClick={() => {
                setViewFilter('all');
                setQuarterFilter(0);
                setDifficultyFilter(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-black transition ${
                viewFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 48 堂全景
            </button>
          </div>
        </div>
      </div>

      {/* Difficulty Level System Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border-2 border-amber-200 shadow-sm text-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-amber-900 font-black text-sm flex items-center gap-1.5">
            <span className="text-base">⭐</span>
            <span>難度等級篩選:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { lvl: 0, label: '全部難度' },
              { lvl: 1, label: 'Level 1 萌芽' },
              { lvl: 2, label: 'Level 2 扎根' },
              { lvl: 3, label: 'Level 3 靈活' },
              { lvl: 4, label: 'Level 4 躍升' },
              { lvl: 5, label: 'Level 5 大師' },
            ].map((d) => (
              <button
                key={d.lvl}
                onClick={() => setDifficultyFilter(d.lvl as 0 | 1 | 2 | 3 | 4 | 5)}
                className={`px-3 py-1.5 rounded-xl font-black transition text-xs md:text-sm active:scale-95 ${
                  difficultyFilter === d.lvl
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black border border-amber-500'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-amber-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-amber-900 font-black bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full">
          每週至少 4 堂課 · 循環練琴體系
        </div>
      </div>

      {/* Weekly 4-Class Practice Routine Info Card */}
      <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-2 border-amber-200 rounded-3xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-800 shadow-sm">
        <div className="flex items-center gap-2.5 text-left">
          <span className="text-2xl">📅</span>
          <div>
            <span className="font-black text-slate-900 text-base">4~7 歲每週 4 堂課循環練琴架構</span>
            <p className="text-xs text-slate-600 font-bold mt-0.5">每週劃分三大核心模組，確保幼兒年度循環練習量：</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-black">
          <span className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-950 border border-sky-300 shadow-xs">
            🥊 第 1 堂：熱身技巧
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
            🎶 第 2 堂：核心樂曲
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-950 border border-purple-300 shadow-xs">
            🖐️ 第 3 堂：雙手拓展
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-xs">
            🏆 第 4 堂：挑戰任務
          </span>
        </div>
      </div>

      {/* Lessons Grid - Large Tablet Friendly Cards with Candy Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedLessons.map((lesson) => {
          const comp = progress.completedLessons[lesson.id];
          const isCompleted = !!comp && comp.stars > 0;
          // Unlocked logic
          const lessonIdx = lesson.lessonNumber - 1;
          const isUnlocked =
            lessonIdx === 0 ||
            !!progress.completedLessons[`lesson-${lessonIdx}`] ||
            lesson.ageBand === currentAge;
          const starsEarned = comp?.stars || 0;
          const diffInfo = DIFFICULTY_LEVEL_INFO[lesson.difficultyLevel || 1];

          const totalChallengesCount =
            lesson.techniqueChallenges.length +
            lesson.songChallenges.length +
            lesson.performanceChallenges.length;

          return (
            <div
              key={lesson.id}
              onClick={() => isUnlocked && onSelectLesson(lesson)}
              className={`relative rounded-3xl p-5 border text-left flex flex-col justify-between transition-all duration-200 ${
                !isUnlocked
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                  : 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-slate-700/80 hover:border-amber-400 hover:shadow-2xl hover:scale-[1.02] cursor-pointer'
              }`}
            >
              {/* Top row: Lesson badge, age pill and number */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-md ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : isUnlocked
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {lesson.lessonNumber}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-800 border border-slate-700 text-amber-300 font-mono">
                        {lesson.ageBand} 歲 · 第 {lesson.weekNumber || lesson.lessonNumber} 週
                      </span>
                      {/* Difficulty Level Pill */}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${diffInfo.badgeBg} ${diffInfo.badgeBorder}`}>
                        {diffInfo.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {lesson.quarter ? `第 ${lesson.quarter} 季度` : '階段必修'} · 每週 4 堂練習課
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Star Rating Display */}
                  <div className="flex items-center gap-0.5 text-sm">
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={s <= starsEarned ? 'text-amber-400 drop-shadow' : 'text-slate-700'}>
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Badge Icon preview */}
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border ${
                      isCompleted
                        ? 'bg-amber-400/20 border-amber-400/60 shadow-md'
                        : 'bg-slate-800/80 border-slate-700 text-slate-600'
                    }`}
                    title={lesson.badgeTitle}
                  >
                    {lesson.badgeIcon}
                  </span>
                </div>
              </div>

              {/* Middle: Title, song name & story scene */}
              <div className="flex-1 flex flex-col justify-start mb-3">
                <span className="text-xs font-black text-blue-400 block mb-1">
                  曲目：《{lesson.songName}》
                </span>
                <h3 className="text-base md:text-lg font-black text-white tracking-tight leading-snug line-clamp-1">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-300/90 mt-1 line-clamp-2 leading-relaxed font-medium">
                  {lesson.storyScene}
                </p>

                {/* 4 Weekly Practice Sessions Mini Badges */}
                <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] font-extrabold">
                  <div className="bg-blue-950/50 border border-blue-500/30 text-blue-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <span>🥊</span>
                    <span className="truncate">第1堂: 熱身技巧</span>
                  </div>
                  <div className="bg-amber-950/50 border border-amber-500/30 text-amber-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <span>🎶</span>
                    <span className="truncate">第2堂: 核心樂曲</span>
                  </div>
                  <div className="bg-purple-950/50 border border-purple-500/30 text-purple-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <span>🖐️</span>
                    <span className="truncate">第3堂: 雙手拓展</span>
                  </div>
                  <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                    <span>🏆</span>
                    <span className="truncate">第4堂: 挑戰任務</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Challenges summary & action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <span className="text-indigo-300 font-black">{totalChallengesCount} 堂課</span>
                  <span>·</span>
                  <span className="text-amber-300">{lesson.techniqueChallenges[0]?.bpm || 70} BPM</span>
                  <span>·</span>
                  <span className="text-blue-300 font-mono font-bold">
                    {lesson.songChallenges[0]?.notes.length || 10} 音符
                  </span>
                </div>

                <button
                  disabled={!isUnlocked}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                      : isUnlocked
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md scale-100 hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? '再次練習' : isUnlocked ? '開始練琴 ➔' : '尚未解鎖'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
