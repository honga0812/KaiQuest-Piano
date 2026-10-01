import { Lesson, Challenge, DifficultyLevel } from '../types/piano';
import { LESSONS_AGE_4 } from './lessonsAge4';
import { LESSONS_AGE_5 } from './lessonsAge5';
import { LESSONS_AGE_6 } from './lessonsAge6';
import { LESSONS_AGE_7 } from './lessonsAge7';

// Calculate appropriate difficulty level for a lesson
export function calculateLessonDifficulty(ageBand: number, quarter: number = 1): DifficultyLevel {
  if (ageBand === 4) {
    return quarter >= 3 ? 2 : 1;
  }
  if (ageBand === 5) {
    return quarter >= 3 ? 3 : 2;
  }
  if (ageBand === 6) {
    return quarter >= 3 ? 4 : 3;
  }
  return quarter >= 3 ? 5 : 4;
}

// Difficulty Level metadata for display & badge
export const DIFFICULTY_LEVEL_INFO: Record<DifficultyLevel, {
  level: DifficultyLevel;
  title: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  starsCount: number;
}> = {
  1: {
    level: 1,
    title: 'Level 1 萌芽入門',
    subtitle: '三音探索 · 圓手拱門 · 基礎落鍵',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/70 text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
    starsCount: 1,
  },
  2: {
    level: 2,
    title: 'Level 2 穩健扎根',
    subtitle: '五指獨立 · 雙手輪替 · 八分節奏',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/70 text-blue-300',
    badgeBorder: 'border-blue-500/40',
    starsCount: 2,
  },
  3: {
    level: 3,
    title: 'Level 3 靈活進階',
    subtitle: '穿指跨指 · 圓舞三拍 · 斷連對比',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/70 text-purple-300',
    badgeBorder: 'border-purple-500/40',
    starsCount: 3,
  },
  4: {
    level: 4,
    title: 'Level 4 華麗躍升',
    subtitle: '黑鍵升降 · 半音跑動 · 經典名家',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/70 text-amber-300',
    badgeBorder: 'border-amber-500/40',
    starsCount: 4,
  },
  5: {
    level: 5,
    title: 'Level 5 皇家大師',
    subtitle: '大八度琶音 · 奏鳴曲結晶 · 演奏家風采',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/70 text-rose-300',
    badgeBorder: 'border-rose-500/40',
    starsCount: 5,
  },
};

// Enrich all lessons with 4 weekly sessions and Difficulty Level system
function enrichLessonsWithWeeklyCycle(rawLessons: Lesson[]): Lesson[] {
  return rawLessons.map((lesson) => {
    const diffLevel = calculateLessonDifficulty(lesson.ageBand, lesson.quarter || 1);

    // Ensure technique challenges have difficultyLevel
    const techniqueChallenges: Challenge[] = lesson.techniqueChallenges.map((c) => ({
      ...c,
      difficultyLevel: diffLevel,
    }));

    // Ensure song challenges have at least 2 sessions (Day 2 phrase A + Day 3 phrase B / hands expansion)
    let songChallenges: Challenge[] = [...lesson.songChallenges];
    if (songChallenges.length === 1) {
      const primarySong = songChallenges[0];
      // Create Day 3 expansion challenge: Legato & Rhythm Polish
      const day3Challenge: Challenge = {
        id: `${primarySong.id}-day3-expansion`,
        type: 'song',
        title: `${primarySong.title} (第3堂：雙手配合與節奏拓展)`,
        titleEn: `${primarySong.titleEn} (Day 3: Hands Coordination & Phrasing)`,
        subtitle: `在第2堂的基礎上，加入更穩健的手指重心轉移與流暢如歌的旋律連音！`,
        character: primarySong.character || 'kai',
        characterPrompt: '你成功了，邁向新進度！今天我們要把旋律彈得像歌唱一樣連貫動聽，繼續加油！',
        characterPromptEn: 'Sing through the piano keys with smooth legato!',
        bpm: Math.min(120, primarySong.bpm + 4),
        timeSignature: primarySong.timeSignature || [4, 4],
        focusSkill: '如歌連奏、呼吸句法與雙手平衡',
        description: '以流暢的觸鍵完整演繹樂曲。',
        difficultyLevel: diffLevel,
        notes: primarySong.notes.map((n, idx) => ({
          ...n,
          id: `${n.id}-d3-${idx}`,
        })),
      };
      songChallenges.push(day3Challenge);
    }

    // Ensure performance challenge has difficultyLevel
    const performanceChallenges: Challenge[] = lesson.performanceChallenges.map((c) => ({
      ...c,
      difficultyLevel: diffLevel,
    }));

    return {
      ...lesson,
      difficultyLevel: diffLevel,
      techniqueChallenges,
      songChallenges,
      performanceChallenges,
    };
  });
}

// 52-Week Year-Round Progressive 4-Age Curriculum Database
// 48 Weekly Milestones x 4 Sessions per Week = 192 Structured Year-Round Practices
export const LESSONS_DATABASE: Lesson[] = enrichLessonsWithWeeklyCycle([
  ...LESSONS_AGE_4,
  ...LESSONS_AGE_5,
  ...LESSONS_AGE_6,
  ...LESSONS_AGE_7,
]);

export { LESSONS_AGE_4, LESSONS_AGE_5, LESSONS_AGE_6, LESSONS_AGE_7 };
