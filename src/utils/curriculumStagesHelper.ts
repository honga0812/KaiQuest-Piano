import { Lesson, Challenge, TargetNote } from '../types/piano';

export interface StageBadgeMeta {
  stage: 1 | 2 | 3 | 4;
  role: 'technique' | 'verse' | 'chorus' | 'full_song';
  badgeLabel: string;
  shortLabel: string;
  tabTitle: string;
  description: string;
  icon: string;
  colorClass: string;
}

export const STAGE_METAS: Record<1 | 2 | 3 | 4, StageBadgeMeta> = {
  1: {
    stage: 1,
    role: 'technique',
    badgeLabel: '第 1 關 · 技巧練習',
    shortLabel: '1. 技巧',
    tabTitle: '1. 技巧練習',
    description: '基本功熱身、手型拱度與指法獨立性訓練',
    icon: '🖐️',
    colorClass: 'from-amber-500 to-orange-500',
  },
  2: {
    stage: 2,
    role: 'verse',
    badgeLabel: '第 2 關 · 歌曲主歌',
    shortLabel: '2. 主歌',
    tabTitle: '2. 歌曲主歌',
    description: '核心旋律主歌樂段拆解，建立音符銜接與節奏感',
    icon: '🎵',
    colorClass: 'from-blue-600 to-indigo-600',
  },
  3: {
    stage: 3,
    role: 'chorus',
    badgeLabel: '第 3 關 · 歌曲副歌',
    shortLabel: '3. 副歌',
    tabTitle: '3. 歌曲副歌',
    description: '副歌樂段躍進與高低音跳動，強化手指跨越記憶',
    icon: '🎶',
    colorClass: 'from-purple-600 to-pink-600',
  },
  4: {
    stage: 4,
    role: 'full_song',
    badgeLabel: '第 4 關 · 全曲大挑戰',
    shortLabel: '4. 全曲',
    tabTitle: '4. 全曲大挑戰',
    description: '大師舞台！貫穿主歌與副歌，完整連貫彈奏全曲',
    icon: '👑',
    colorClass: 'from-emerald-600 to-teal-600',
  },
};

/**
 * Standardizes a Lesson into exactly 4 progressive pedagogical stages:
 * Stage 1: 技巧初探 (熱身技巧練習)
 * Stage 2: 歌曲主歌 (主歌樂段)
 * Stage 3: 歌曲副歌 (副歌樂段)
 * Stage 4: 全曲大挑戰 (彈完完整全曲)
 */
export function getStandardizedLessonStages(lesson: Lesson): Challenge[] {
  // Stage 1: Technique challenge
  const baseTechnique = lesson.techniqueChallenges[0] || {
    id: `${lesson.id}-t1`,
    type: 'technique' as const,
    title: `${lesson.songName} · 基礎指法熱身`,
    titleEn: 'Technique Foundation Warm-up',
    subtitle: '手掌放鬆抱雞蛋，指尖站立均勻觸鍵！',
    character: 'eli_lion' as const,
    characterPrompt: '吼！手掌拱度要做好，讓手指像珍珠般自然落下！',
    characterPromptEn: 'Keep round hand arch with smooth finger drops!',
    bpm: 65,
    timeSignature: [4, 4] as [number, number],
    focusSkill: '手指獨立與手型支撐',
    description: '完成基礎手型與重點音符敲擊練習。',
    notes: (lesson.songChallenges[0]?.notes || []).slice(0, 4),
  };

  const stage1: Challenge = {
    ...baseTechnique,
    stageNumber: 1,
    stageRole: 'technique',
    title: baseTechnique.title.startsWith('1.') ? baseTechnique.title : `1. 技巧練習 · ${baseTechnique.title}`,
  };

  // Base song pool for Verse and Chorus
  const songPool = lesson.songChallenges;
  let verseNotes: TargetNote[] = [];
  let chorusNotes: TargetNote[] = [];

  if (songPool.length >= 2) {
    // If lesson already has multiple song challenges, 1st is Verse, 2nd is Chorus
    verseNotes = songPool[0].notes;
    chorusNotes = songPool[1].notes;
  } else if (songPool.length === 1) {
    const allNotes = songPool[0].notes;
    if (allNotes.length <= 4) {
      verseNotes = allNotes;
      chorusNotes = allNotes.map((n, i) => ({ ...n, id: `${n.id}-ch-${i}` }));
    } else {
      const mid = Math.ceil(allNotes.length / 2);
      verseNotes = allNotes.slice(0, mid);
      chorusNotes = allNotes.slice(mid);
    }
  } else {
    // Fallback notes from performance challenge
    const perfNotes = lesson.performanceChallenges[0]?.notes || [];
    const mid = Math.ceil(perfNotes.length / 2);
    verseNotes = perfNotes.slice(0, mid);
    chorusNotes = perfNotes.slice(mid);
  }

  // Stage 2: 歌曲主歌 (Verse)
  const baseVerse = songPool[0] || lesson.performanceChallenges[0] || stage1;
  const stage2: Challenge = {
    ...baseVerse,
    id: `${lesson.id}-stage-verse`,
    type: 'song',
    stageNumber: 2,
    stageRole: 'verse',
    title: `2. 歌曲主歌 · 《${lesson.songName}》主歌樂段`,
    titleEn: 'Verse Section Practice',
    subtitle: '拆解第一段主歌旋律，熟悉手指走動方向與節奏。',
    characterPrompt: '放輕鬆！跟著主歌旋律一句一句彈好，指法要站穩喔！',
    characterPromptEn: 'Play the verse phrases with clear finger articulation!',
    notes: verseNotes,
    focusSkill: '主歌旋律線條與手指走位',
  };

  // Stage 3: 歌曲副歌 (Chorus)
  const baseChorus = songPool[1] || songPool[0] || lesson.performanceChallenges[0] || stage1;
  const stage3: Challenge = {
    ...baseChorus,
    id: `${lesson.id}-stage-chorus`,
    type: 'song',
    stageNumber: 3,
    stageRole: 'chorus',
    title: `3. 歌曲副歌 · 《${lesson.songName}》副歌樂段`,
    titleEn: 'Chorus Section Progression',
    subtitle: '副歌樂段轉折與高潮！注意高低音轉換與弱指敏捷性。',
    characterPrompt: '副歌來囉！像小海豚躍出水面一樣，彈出活潑跳動的聲音！',
    characterPromptEn: 'Bring high energy into the chorus phrase!',
    notes: chorusNotes,
    focusSkill: '副歌旋律高潮與音程跨度',
  };

  // Stage 4: 全曲大挑戰 (Full Song)
  // Combines Verse + Chorus (or full performance challenge if it has complete song notes)
  const fullNotes: TargetNote[] = [
    ...verseNotes.map((n, idx) => ({ ...n, id: `${lesson.id}-full-v-${idx}` })),
    ...chorusNotes.map((n, idx) => ({ ...n, id: `${lesson.id}-full-c-${idx}` })),
  ];

  const basePerf = lesson.performanceChallenges[0] || songPool[0] || stage1;
  const stage4: Challenge = {
    ...basePerf,
    id: `${lesson.id}-stage-full`,
    type: 'performance',
    stageNumber: 4,
    stageRole: 'full_song',
    title: `4. 全曲大挑戰 · 《${lesson.songName}》完整演奏`,
    titleEn: 'Full Song Grand Concert Challenge',
    subtitle: '恭喜來到第 4 舞台！從頭到尾彈完完整樂曲，登頂大師榮譽！',
    characterPrompt: '太棒了！這是最後的第 4 舞台，把主歌與副歌連起來，彈出最棒的全曲！',
    characterPromptEn: 'Grand finale! Play the complete song with confidence!',
    notes: fullNotes.length >= 6 ? fullNotes : (basePerf.notes.length > fullNotes.length ? basePerf.notes : fullNotes),
    focusSkill: '全曲連貫彈奏與音樂完整性',
  };

  return [stage1, stage2, stage3, stage4];
}
