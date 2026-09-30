import React, { useState } from 'react';
import { Lesson, UserProgress, AgeBand } from '../../types/piano';
import { LESSONS_DATABASE, calculateLessonDifficulty } from '../../data/lessons';
import { AGE_STAGES_INFO } from '../../data/curriculumStages';
import { TECHNIQUE_GAMES, TechniqueGameDef } from '../../data/techniqueGames';
import { ExplorerKaiSvg, EliLionSvg } from '../mascot/AnimalFriends';
import { pianoSynth } from '../../audio/pianoSynthesizer';

interface WeeklyLearningPlanProps {
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onOpenGym?: () => void;
  onOpenConcert?: () => void;
  className?: string;
}

export type PlanPace = 'steady' | 'focused' | 'gentle';

export const WeeklyLearningPlan: React.FC<WeeklyLearningPlanProps> = ({
  progress,
  onSelectLesson,
  onOpenGym,
  onOpenConcert,
  className = '',
}) => {
  const currentAge = progress.userAge;
  const currentStageInfo = AGE_STAGES_INFO[currentAge];

  // Learning pace selection (標準 5-8分鐘 / 衝刺 8-12分鐘 / 輕量 3-5分鐘)
  const [pace, setPace] = useState<PlanPace>('steady');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Time multiplier based on pace
  const paceConfig = {
    gentle: {
      label: '輕鬆探索',
      dailyMin: '3 ~ 5 分鐘',
      times: { technique: 3, song: 5, gym: 4, milestone: 4 },
      desc: '適合初接觸鋼琴或專注力正在建立的小琴童',
    },
    steady: {
      label: '穩健扎根（推薦）',
      dailyMin: '5 ~ 8 分鐘',
      times: { technique: 4, song: 7, gym: 5, milestone: 5 },
      desc: '符合兒童生理與認知黃金節奏，也是完成每日簽到的最佳長度',
    },
    focused: {
      label: '專注衝刺',
      dailyMin: '8 ~ 12 分鐘',
      times: { technique: 6, song: 10, gym: 7, milestone: 7 },
      desc: '適合進度快速、挑戰更高音樂連貫度與雙手平衡的小琴童',
    },
  }[pace];

  // Current age lessons
  const ageLessons = LESSONS_DATABASE.filter((l) => l.ageBand === currentAge);

  // 1. Identify Target Core Lesson
  // Look for the first lesson in current age that is not completed (stars === 0 or undefined)
  // Or the first lesson with < 3 stars that can be polished
  const firstIncompleteLesson = ageLessons.find(
    (l) => !progress.completedLessons[l.id] || progress.completedLessons[l.id].stars < 1
  );
  const needsPolishLesson = ageLessons.find(
    (l) => progress.completedLessons[l.id] && progress.completedLessons[l.id].stars < 3
  );

  // Target primary lesson for this week
  const targetLesson: Lesson = firstIncompleteLesson || needsPolishLesson || ageLessons[0];
  const targetCompletion = progress.completedLessons[targetLesson.id];
  const targetStars = targetCompletion?.stars || 0;

  // Previous lesson for confidence review
  const targetIndex = ageLessons.findIndex((l) => l.id === targetLesson.id);
  const previousLesson: Lesson | null = targetIndex > 0 ? ageLessons[targetIndex - 1] : null;

  // 2. Select matching Technique Drill
  // Match an aligned game from TECHNIQUE_GAMES based on age or lesson focus skill
  const matchedTechniqueGame: TechniqueGameDef =
    TECHNIQUE_GAMES[targetIndex % TECHNIQUE_GAMES.length] || TECHNIQUE_GAMES[0];

  const primaryTechniqueChallenge = targetLesson.techniqueChallenges[0];
  const primarySongChallenge = targetLesson.songChallenges[0];
  const expansionChallenge = targetLesson.songChallenges[1] || targetLesson.performanceChallenges[0];

  // 3. Four Weekly Mission Tasks
  interface MissionTask {
    id: string;
    category: 'technique' | 'song' | 'gym' | 'milestone';
    title: string;
    subtitle: string;
    focusSkill: string;
    estimatedMinutes: number;
    isCompleted: boolean;
    badgeLabel: string;
    icon: string;
    onAction: () => void;
    actionLabel: string;
  }

  const missions: MissionTask[] = [
    {
      id: 'task-warmup-technique',
      category: 'technique',
      title: `熱身指法專項：${primaryTechniqueChallenge?.title || '手型與手指獨立'}`,
      subtitle: `掌握「${primaryTechniqueChallenge?.focusSkill || '基礎落鍵與支撐'}」，以穩定放鬆的觸鍵開啟練琴！`,
      focusSkill: primaryTechniqueChallenge?.focusSkill || '手腕放鬆與指尖支撐',
      estimatedMinutes: paceConfig.times.technique,
      // Considered done if child has stars on the lesson or practiced today
      isCompleted: targetStars >= 1,
      badgeLabel: '第 1 階段 · 技術熱身',
      icon: '🖐️',
      onAction: () => {
        pianoSynth.playCorrectHitSound();
        onSelectLesson(targetLesson);
      },
      actionLabel: '開始熱身 ➔',
    },
    {
      id: 'task-core-song',
      category: 'song',
      title: `核心新曲攻堅：《${targetLesson.songName}》`,
      subtitle: `${targetLesson.storyScene} · 節奏 ${primarySongChallenge?.bpm || 60} BPM · ${targetLesson.keySignature || 'C大調'}`,
      focusSkill: '左右手指法定位、音準識別與節拍穩定',
      estimatedMinutes: paceConfig.times.song,
      isCompleted: targetStars >= 1,
      badgeLabel: '第 2 階段 · 核心新曲',
      icon: '🎼',
      onAction: () => {
        pianoSynth.playCorrectHitSound();
        onSelectLesson(targetLesson);
      },
      actionLabel: '挑戰新曲 ➔',
    },
    {
      id: 'task-technique-game',
      category: 'gym',
      title: `技巧趣味特訓：${matchedTechniqueGame.name}`,
      subtitle: `${matchedTechniqueGame.shortDesc}（${matchedTechniqueGame.mentorName} 導師指引）`,
      focusSkill: matchedTechniqueGame.category,
      estimatedMinutes: paceConfig.times.gym,
      isCompleted: targetStars >= 2,
      badgeLabel: '第 3 階段 · 技巧遊戲',
      icon: matchedTechniqueGame.badgeIcon || '🎪',
      onAction: () => {
        pianoSynth.playCorrectHitSound();
        if (onOpenGym) {
          onOpenGym();
        } else {
          onSelectLesson(targetLesson);
        }
      },
      actionLabel: onOpenGym ? '進入技巧特訓 ➔' : '拓展練習 ➔',
    },
    {
      id: 'task-milestone-stars',
      category: 'milestone',
      title: `榮譽金牌任務：解鎖「${targetLesson.badgeTitle}」`,
      subtitle: `在第 ${targetLesson.lessonNumber} 課達成 3 顆星滿分演奏，將徽章帶回榮譽殿堂！`,
      focusSkill: '全曲連貫如歌、零失誤演奏與舞台自信',
      estimatedMinutes: paceConfig.times.milestone,
      isCompleted: targetStars === 3,
      badgeLabel: '第 4 階段 · 榮譽勳章',
      icon: targetLesson.badgeIcon || '🏅',
      onAction: () => {
        pianoSynth.playCorrectHitSound();
        onSelectLesson(targetLesson);
      },
      actionLabel: '衝刺三星滿分 ➔',
    },
  ];

  // Calculated Progress & Time Stats
  const completedMissionsCount = missions.filter((m) => m.isCompleted).length;
  const totalEstimatedMinutes = missions.reduce((sum, m) => sum + m.estimatedMinutes, 0);
  const remainingEstimatedMinutes = missions
    .filter((m) => !m.isCompleted)
    .reduce((sum, m) => sum + m.estimatedMinutes, 0);

  const progressPercent = Math.round((completedMissionsCount / missions.length) * 100);

  // Mascot dynamic coach speech
  const getCoachSpeech = () => {
    if (completedMissionsCount === 4) {
      return `太優秀了！本週 ${targetLesson.title} 的所有學習目標已 100% 達成！準備好邁向下一週的新探險了嗎？`;
    }
    if (completedMissionsCount >= 2) {
      return `好棒的進度！本週計畫已完成過半！只要再專注練習約 ${remainingEstimatedMinutes} 分鐘，就能榮獲 ${targetLesson.badgeTitle}！`;
    }
    return `探險家 Kai 為你量身打造了本週學習計畫！每天只要練 5~8 分鐘，輕鬆攻下《${targetLesson.songName}》！`;
  };

  // First uncompleted mission to launch
  const nextRecommendedMission = missions.find((m) => !m.isCompleted) || missions[0];

  return (
    <section
      className={`bg-gradient-to-br from-amber-50/90 via-white to-sky-50/90 border-3 border-amber-300 rounded-3xl p-5 md:p-7 shadow-lg flex flex-col gap-5 text-left text-slate-800 relative overflow-hidden select-none ${className}`}
      aria-label="本週學習計畫"
    >
      {/* Decorative musical backdrop flare */}
      <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

      {/* Header Deck: Title, Age Stage Context & Collapsible Toggle */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-amber-200/80 pb-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-3xl shadow-md text-white shrink-0">
            📅
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 font-mono">
                Smart Weekly Practice Roadmap
              </span>
              <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                本週推薦
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {currentStageInfo.islandName} · 第 {targetLesson.lessonNumber} 課
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-950 mt-0.5 flex items-center gap-2">
              <span>本週專屬學習計畫</span>
              <span className="text-sm md:text-base font-bold text-amber-800">
                —《{targetLesson.title}》
              </span>
            </h2>

            <p className="text-xs md:text-sm text-slate-600 font-bold mt-0.5">
              依據孩子在 {currentAge} 歲階段的學習歷程智能分析，自動規劃熱身、新曲、技巧與三星挑戰！
            </p>
          </div>
        </div>

        {/* Pace Selector & Collapse Toggle */}
        <div className="flex items-center gap-2.5 ml-auto flex-wrap">
          {/* Pace Mode Switcher */}
          <div className="flex items-center bg-white/90 p-1 rounded-2xl border-2 border-amber-200 shadow-2xs text-xs font-black">
            {(['gentle', 'steady', 'focused'] as PlanPace[]).map((p) => {
              const active = pace === p;
              const label = p === 'gentle' ? '輕量' : p === 'steady' ? '標準 (推薦)' : '衝刺';
              return (
                <button
                  key={p}
                  onClick={() => setPace(p)}
                  className={`px-3 py-1.5 rounded-xl transition active:scale-95 ${
                    active
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={p === 'steady' ? '每日 5-8 分鐘（達標每日簽到）' : p === 'gentle' ? '每日 3-5 分鐘' : '每日 8-12 分鐘'}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-9 h-9 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center font-black text-sm transition active:scale-95 border border-amber-300 shrink-0"
            title={isExpanded ? '收起學習計畫' : '展開學習計畫'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Main Body (Collapsible) */}
      {isExpanded && (
        <div className="flex flex-col gap-5 relative z-10 animate-fade-in">
          {/* Dashboard Summary Strip: Mascot Coach + Time Estimates + Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white/90 border-2 border-amber-200 rounded-3xl p-4 md:p-5 shadow-xs">
            {/* Left: Kai Coach Speech */}
            <div className="lg:col-span-5 flex items-center gap-3.5 border-b lg:border-b-0 lg:border-r border-amber-100 pb-3 lg:pb-0 lg:pr-4">
              <div className="shrink-0">
                <ExplorerKaiSvg size={52} mood={completedMissionsCount >= 2 ? 'celebrating' : 'happy'} />
              </div>
              <div className="flex flex-col text-xs leading-relaxed">
                <span className="font-black text-amber-900 block text-xs">
                  導師 Kai 的本週叮嚀：
                </span>
                <span className="text-slate-700 font-bold mt-0.5">
                  {getCoachSpeech()}
                </span>
              </div>
            </div>

            {/* Middle: Progress Meter */}
            <div className="lg:col-span-4 flex flex-col gap-2 border-b lg:border-b-0 lg:border-r border-amber-100 pb-3 lg:pb-0 lg:pr-4">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-700">本週學習計畫進度</span>
                <span className="text-amber-800 font-mono">
                  {completedMissionsCount} / {missions.length} 關卡完成 ({progressPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-amber-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <span>建議節奏：{paceConfig.dailyMin}</span>
                <span className="text-emerald-700 font-black">
                  {completedMissionsCount === 4 ? '🎉 全部完成' : `尚有 ${missions.length - completedMissionsCount} 項待完成`}
                </span>
              </div>
            </div>

            {/* Right: Estimated Completion Time Badges & Fast Launch */}
            <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black">
                <span className="text-slate-500">預估本週總需：</span>
                <span className="text-base text-slate-950 font-mono font-black">
                  約 {totalEstimatedMinutes} 分鐘
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black">
                <span className="text-amber-700">預估剩餘時間：</span>
                <span className="text-sm font-mono text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  約 {remainingEstimatedMinutes} 分鐘
                </span>
              </div>

              {/* Fast Launch Next Task Button */}
              <button
                onClick={nextRecommendedMission.onAction}
                className="w-full lg:w-auto mt-1 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-md transition active:scale-95 border-2 border-white flex items-center justify-center gap-1.5"
              >
                <span>🚀</span>
                <span>
                  {completedMissionsCount === 4 ? '再次複習本週曲目' : '一鍵開始今日推薦任務'}
                </span>
              </button>
            </div>
          </div>

          {/* 4 Mission Cards Grid (Recommended Practice Stages) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {missions.map((m, idx) => {
              return (
                <div
                  key={m.id}
                  className={`rounded-3xl p-4.5 border-2 flex flex-col justify-between gap-3 transition-all relative group ${
                    m.isCompleted
                      ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                      : 'bg-white border-amber-200/90 hover:border-amber-400 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Card Header Tag & Estimated Time */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        m.isCompleted
                          ? 'bg-emerald-200 text-emerald-950 font-bold'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {m.badgeLabel}
                    </span>

                    {/* Estimated Time Badge */}
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-mono">
                      ⏱️ 預估 {m.estimatedMinutes} 分
                    </span>
                  </div>

                  {/* Card Main Info */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-amber-100 text-slate-950 flex items-center justify-center text-lg shadow-2xs shrink-0">
                        {m.icon}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-amber-900">
                        {m.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 font-bold leading-relaxed line-clamp-2">
                      {m.subtitle}
                    </p>

                    <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                      <strong className="text-amber-900">技能焦點：</strong>
                      <span>{m.focusSkill}</span>
                    </div>
                  </div>

                  {/* Card Bottom: Status & Action Trigger */}
                  <div className="flex items-center justify-between pt-2 border-t border-amber-100/80 gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      {m.isCompleted ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span>✓</span>
                          <span>已達標</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 flex items-center gap-1">
                          <span>⏳</span>
                          <span>待完成</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={m.onAction}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition active:scale-95 shadow-2xs ${
                        m.isCompleted
                          ? 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      }`}
                    >
                      {m.isCompleted ? '再次練習 ➔' : m.actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Reinforcement & Confidence Tip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-100/60 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 font-bold">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-xl shrink-0">💡</span>
              <div>
                <span>
                  <strong>每日簽到連動：</strong>每天只要完成本週計畫中任意 1 ~ 2 項練習（累積滿 5 分鐘），即可自動點亮今日打卡，累積 3 天領取<strong>「音樂探索家」紀念勳章</strong>！
                </span>
                {previousLesson && (
                  <span className="block text-slate-700 mt-0.5">
                    重溫舊曲小秘訣：練習新曲前，可先彈一次第 {previousLesson.lessonNumber} 課《{previousLesson.songName}》熱身手部記憶喔！
                  </span>
                )}
              </div>
            </div>

            {previousLesson && (
              <button
                onClick={() => {
                  pianoSynth.playCorrectHitSound();
                  onSelectLesson(previousLesson);
                }}
                className="shrink-0 px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-xl font-black text-xs transition active:scale-95 shadow-2xs"
              >
                複習上週《{previousLesson.songName}》➔
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
