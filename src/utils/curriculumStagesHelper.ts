import { Lesson, Challenge, TargetNote } from '../types/piano';
import { FULL_SONGS_COLLECTION, FullPiece } from '../data/fullSongsAndHanon';

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
 * Searches the Golden Classics collection for an authentic, complete full piece
 * matching the lesson title or songName.
 */
function matchFullSong(lesson: Lesson): FullPiece | undefined {
  const normName = (lesson.songName || '').toLowerCase().replace(/[\s《》·]/g, '');
  const normTitle = (lesson.title || '').toLowerCase().replace(/[\s《》·]/g, '');

  const matchRules: Array<{ keywords: string[]; id: string }> = [
    { keywords: ['熱十字麵包', 'hotcrossbuns'], id: 'full-hot-cross-buns' },
    { keywords: ['瑪莉有隻小綿羊', 'maryhadalittlelamb', '小綿羊'], id: 'full-mary-lamb' },
    { keywords: ['布穀鳥', '布穀', 'cuckoo'], id: 'full-cuckoo' },
    { keywords: ['小星星', 'twinkle'], id: lesson.ageBand === 4 ? 'full-twinkle-age4' : 'full-twinkle-full' },
    { keywords: ['倫敦鐵橋', 'londonbridge'], id: lesson.ageBand === 4 ? 'full-london-bridge-age4' : 'full-london-bridge' },
    { keywords: ['小蜜蜂', '採蜜', 'littlebee', 'buzzingbee'], id: 'full-little-bee' },
    { keywords: ['大鐘與小鐘', '大鐘', 'clock'], id: 'full-clock-chime' },
    { keywords: ['兩隻老虎', 'twotigers'], id: 'full-two-tigers' },
    { keywords: ['歡樂頌', '貝多芬', 'odetojoy'], id: 'full-ode-to-joy' },
    { keywords: ['小步舞曲', '巴哈', 'minuet'], id: 'full-bach-minuet-age5' },
    { keywords: ['粉刷匠', 'littlepainter', 'painter'], id: 'full-painter' },
    { keywords: ['洋娃娃與小熊跳舞', 'dollandbeardance', '洋娃娃'], id: 'full-doll-bear-dance' },
    { keywords: ['老麥克唐納', '農場', 'oldmacdonald'], id: 'full-old-macdonald' },
    { keywords: ['小白花', '雪山之歌', 'edelweiss'], id: 'full-edelweiss' },
    { keywords: ['水手號角舞曲', '水手號角', 'sailorhornpipe'], id: 'full-sailor-hornpipe' },
    { keywords: ['天鵝湖', 'swanlake'], id: 'full-swan-lake' },
    { keywords: ['卡農', 'canon'], id: 'full-canon' },
    { keywords: ['綠袖子', 'greensleeves'], id: 'full-greensleeves' },
    { keywords: ['野玫瑰', 'wildrose', 'heidenröslein'], id: 'full-wild-rose' },
    { keywords: ['月光', 'clairdelune'], id: 'full-clair-de-lune' },
    { keywords: ['火車快飛', 'traingoesfast'], id: 'full-train-fast' },
    { keywords: ['土耳其進行曲', 'turca', '莫札特土耳其'], id: 'full-rondo-alla-turca' },
    { keywords: ['給愛麗絲', '緻愛麗絲', '愛麗絲', 'furelise', 'elise'], id: 'full-fur-elise' },
    { keywords: ['拉德茨基', '拉德斯基', 'radetzky'], id: 'full-radetzky-march' },
    { keywords: ['莫札特小奏鳴曲', '小奏鳴曲', '奏鳴曲', 'sonatina'], id: 'full-mozart-sonatina' },
    { keywords: ['康康舞曲', '康康', 'cancan'], id: 'full-can-can' },
    { keywords: ['蕭邦夜曲', '夜曲', 'nocturne'], id: 'full-chopin-nocturne' },
  ];

  for (const rule of matchRules) {
    if (rule.keywords.some((kw) => normName.includes(kw) || normTitle.includes(kw))) {
      const piece = FULL_SONGS_COLLECTION.find((p) => p.id === rule.id);
      if (piece) return piece;
    }
  }

  // Fallback: direct title match
  return FULL_SONGS_COLLECTION.find((p) => {
    const pTitle = p.title.replace(/[\s《》·]/g, '');
    return normName.includes(pTitle) || pTitle.includes(normName);
  });
}

/**
 * Ensures that no practice stage is too short (e.g. 2 or 3 notes).
 * Musically expands short motifs into a complete, rhythmic 10-14 note practice phrase
 * with forward-and-return phrasing, steady measures, and rewarding articulation.
 */
function ensureSubstantialNotes(rawNotes: TargetNote[], minCount = 10, stagePrefix = 'stg'): TargetNote[] {
  if (!rawNotes || rawNotes.length === 0) return [];
  if (rawNotes.length >= minCount) {
    return rawNotes.map((n, i) => ({ ...n, id: `${stagePrefix}-${n.id || i}-${i}` }));
  }

  // Build a musical round-trip phrase: forward -> return / repeat -> tonic resolution
  const sequenceNotes: TargetNote[] = [];
  const forward = [...rawNotes];
  const backward = [...rawNotes].reverse();

  // Pattern building: Forward + Backward + Forward to create a natural musical phrase
  let cycle = 0;
  while (sequenceNotes.length < minCount) {
    const stepList = cycle % 2 === 0 ? forward : backward;
    for (const note of stepList) {
      sequenceNotes.push(note);
      if (sequenceNotes.length >= minCount) break;
    }
    cycle++;
  }

  // Measure formatting & lyric assignment
  let globalMeasure = 0;
  let beatsInCurrent = 0;

  return sequenceNotes.map((baseNote, index) => {
    const duration = baseNote.durationBeats || 1;
    const isLast = index === sequenceNotes.length - 1;
    const measureIndex = globalMeasure;

    beatsInCurrent += duration;
    if (beatsInCurrent >= 4) {
      globalMeasure++;
      beatsInCurrent = 0;
    }

    let lyric = baseNote.lyrics;
    if (isLast) {
      lyric = '過關！';
    } else if (index % 4 === 0) {
      lyric = '站穩';
    } else if (index % 4 === 2) {
      lyric = '連貫';
    }

    return {
      ...baseNote,
      id: `${stagePrefix}-phrase-${index}`,
      measureIndex,
      durationBeats: duration,
      lyrics: lyric,
    };
  });
}

/**
 * Standardizes a Lesson into exactly 4 progressive pedagogical stages:
 * Stage 1: 技巧練習 (熱身技巧，保證至少 10-14 音符充分練習，徹底告別 2~3 音太簡短)
 * Stage 2: 歌曲主歌 (完整主歌樂段，至少 10-16 音符)
 * Stage 3: 歌曲副歌 (完整副歌樂段，至少 10-16 音符)
 * Stage 4: 全曲大挑戰 (真正完整的全曲演奏，涵蓋完整旋律)
 */
export function getStandardizedLessonStages(lesson: Lesson): Challenge[] {
  const matchedFullPiece = matchFullSong(lesson);

  // -------------------------------------------------------------
  // Stage 1: 技巧練習 (Technique) - 充分熱身，保證至少 10 音符
  // -------------------------------------------------------------
  const rawTechnique = lesson.techniqueChallenges[0];
  const rawTechNotes = rawTechnique?.notes && rawTechnique.notes.length > 0
    ? rawTechnique.notes
    : (lesson.songChallenges[0]?.notes || []).slice(0, 4);

  const techniqueNotes = ensureSubstantialNotes(rawTechNotes, 10, `${lesson.id}-t`);

  const stage1: Challenge = {
    ...(rawTechnique || {
      id: `${lesson.id}-t1`,
      type: 'technique' as const,
      title: `${lesson.songName} · 基礎指法熱身`,
      titleEn: 'Technique Foundation Warm-up',
      subtitle: '手掌放鬆抱雞蛋，指尖站立均勻觸鍵！',
      character: 'eli_lion' as const,
      characterPrompt: '吼！手掌拱度要做好，讓手指像珍珠般自然落下！',
      characterPromptEn: 'Keep round hand arch with smooth finger drops!',
      bpm: 68,
      timeSignature: [4, 4] as [number, number],
      focusSkill: '手指獨立與手型支撐',
      description: '完成基礎手型與重點音符敲擊練習。',
      notes: techniqueNotes,
    }),
    id: `${lesson.id}-stage-technique`,
    type: 'technique',
    stageNumber: 1,
    stageRole: 'technique',
    title: rawTechnique?.title ? (rawTechnique.title.startsWith('1.') ? rawTechnique.title : `1. 技巧練習 · ${rawTechnique.title}`) : `1. 技巧練習 · ${lesson.songName} 基本功`,
    subtitle: rawTechnique?.subtitle || '連貫敲擊熱身，建立手指站立與重心穩定度。',
    notes: techniqueNotes,
  };

  // -------------------------------------------------------------
  // Determine Verse, Chorus, and Full Song Notes
  // -------------------------------------------------------------
  let fullSongNotes: TargetNote[] = [];
  let verseNotes: TargetNote[] = [];
  let chorusNotes: TargetNote[] = [];

  if (matchedFullPiece && matchedFullPiece.notes.length >= 8) {
    // Authenticated Golden Masterpiece available!
    fullSongNotes = matchedFullPiece.notes.map((n, idx) => ({
      ...n,
      id: `${lesson.id}-full-${idx}`,
    }));

    const mid = Math.ceil(fullSongNotes.length / 2);
    verseNotes = fullSongNotes.slice(0, mid).map((n, idx) => ({
      ...n,
      id: `${lesson.id}-v-${idx}`,
    }));
    chorusNotes = fullSongNotes.slice(mid).map((n, idx) => ({
      ...n,
      id: `${lesson.id}-c-${idx}`,
    }));
  } else {
    // Use lesson's own song challenge notes, ensuring substantial length
    const songPool = lesson.songChallenges;
    if (songPool.length >= 2) {
      verseNotes = ensureSubstantialNotes(songPool[0].notes, 10, `${lesson.id}-v`);
      chorusNotes = ensureSubstantialNotes(songPool[1].notes, 10, `${lesson.id}-c`);
      // Combine verse + chorus + reprise to ensure a real full song experience (>= 20 notes)
      fullSongNotes = [
        ...verseNotes.map((n, i) => ({ ...n, id: `${lesson.id}-full-v-${i}` })),
        ...chorusNotes.map((n, i) => ({ ...n, id: `${lesson.id}-full-c-${i}` })),
        ...verseNotes.slice(0, Math.min(8, verseNotes.length)).map((n, i) => ({
          ...n,
          id: `${lesson.id}-full-rep-${i}`,
          lyrics: i === Math.min(8, verseNotes.length) - 1 ? '全曲完！' : n.lyrics,
        })),
      ];
    } else if (songPool.length === 1) {
      const allNotes = songPool[0].notes;
      if (allNotes.length >= 16) {
        const mid = Math.ceil(allNotes.length / 2);
        verseNotes = allNotes.slice(0, mid).map((n, i) => ({ ...n, id: `${lesson.id}-v-${i}` }));
        chorusNotes = allNotes.slice(mid).map((n, i) => ({ ...n, id: `${lesson.id}-c-${i}` }));
        fullSongNotes = allNotes.map((n, i) => ({ ...n, id: `${lesson.id}-full-${i}` }));
      } else {
        // Expand to complete musical experience with A-B-A full piece structure
        verseNotes = ensureSubstantialNotes(allNotes, 10, `${lesson.id}-v`);
        chorusNotes = ensureSubstantialNotes(allNotes.slice().reverse(), 10, `${lesson.id}-c`);
        fullSongNotes = [
          ...verseNotes.map((n, i) => ({ ...n, id: `${lesson.id}-full-v-${i}` })),
          ...chorusNotes.map((n, i) => ({ ...n, id: `${lesson.id}-full-c-${i}` })),
        ];
      }
    } else {
      const perfNotes = lesson.performanceChallenges[0]?.notes || [];
      verseNotes = ensureSubstantialNotes(perfNotes, 10, `${lesson.id}-v`);
      chorusNotes = ensureSubstantialNotes(perfNotes.slice().reverse(), 10, `${lesson.id}-c`);
      fullSongNotes = [
        ...verseNotes.map((n, i) => ({ ...n, id: `${lesson.id}-full-v-${i}` })),
        ...chorusNotes.map((n, i) => ({ ...n, id: `${lesson.id}-full-c-${i}` })),
      ];
    }
  }

  // -------------------------------------------------------------
  // Stage 2: 歌曲主歌 (Verse)
  // -------------------------------------------------------------
  const baseVerse = lesson.songChallenges[0] || lesson.performanceChallenges[0] || stage1;
  const stage2: Challenge = {
    ...baseVerse,
    id: `${lesson.id}-stage-verse`,
    type: 'song',
    stageNumber: 2,
    stageRole: 'verse',
    title: `2. 歌曲主歌 · 《${lesson.songName}》主歌樂段 (${verseNotes.length}音符)`,
    titleEn: 'Verse Section Practice',
    subtitle: '拆解完整主歌旋律，熟悉手指走動方向與節奏銜接。',
    characterPrompt: '放輕鬆！跟著主歌旋律一句一句彈好，指法要站穩喔！',
    characterPromptEn: 'Play the verse phrases with clear finger articulation!',
    notes: verseNotes,
    focusSkill: '主歌旋律線條與手指走位',
  };

  // -------------------------------------------------------------
  // Stage 3: 歌曲副歌 (Chorus)
  // -------------------------------------------------------------
  const baseChorus = lesson.songChallenges[1] || lesson.songChallenges[0] || lesson.performanceChallenges[0] || stage1;
  const stage3: Challenge = {
    ...baseChorus,
    id: `${lesson.id}-stage-chorus`,
    type: 'song',
    stageNumber: 3,
    stageRole: 'chorus',
    title: `3. 歌曲副歌 · 《${lesson.songName}》副歌樂段 (${chorusNotes.length}音符)`,
    titleEn: 'Chorus Section Progression',
    subtitle: '副歌樂段轉折與高潮！注意高低音轉換與弱指敏捷性。',
    characterPrompt: '副歌來囉！像小海豚躍出水面一樣，彈出活潑跳動的聲音！',
    characterPromptEn: 'Bring high energy into the chorus phrase!',
    notes: chorusNotes,
    focusSkill: '副歌旋律高潮與音程跨度',
  };

  // -------------------------------------------------------------
  // Stage 4: 全曲大挑戰 (Full Song) - 真正的全曲演奏！
  // -------------------------------------------------------------
  const basePerf = lesson.performanceChallenges[0] || lesson.songChallenges[0] || stage1;
  const stage4: Challenge = {
    ...basePerf,
    id: `${lesson.id}-stage-full`,
    type: 'performance',
    stageNumber: 4,
    stageRole: 'full_song',
    title: `4. 全曲大挑戰 · 《${lesson.songName}》完整演奏 (${fullSongNotes.length}音符全曲)`,
    titleEn: 'Full Song Grand Concert Challenge',
    subtitle: matchedFullPiece?.subtitle || '恭喜來到第 4 舞台！從頭到尾彈完完整樂曲，登頂大師榮譽！',
    characterPrompt: matchedFullPiece?.characterPrompt || '你成功了，來到最後的第 4 舞台！把主歌與副歌連起來，你是最棒的，彈出最完整的全曲！',
    characterPromptEn: matchedFullPiece?.characterPromptEn || 'Grand finale! Play the complete song with confidence!',
    bpm: matchedFullPiece?.bpm || basePerf.bpm || 76,
    timeSignature: matchedFullPiece?.timeSignature || basePerf.timeSignature || [4, 4],
    notes: fullSongNotes,
    focusSkill: matchedFullPiece?.focusSkill || '全曲連貫彈奏與音樂完整性',
    description: matchedFullPiece?.description || '演奏全曲完整樂段，達到音樂會級別的完整呈現。',
  };

  return [stage1, stage2, stage3, stage4];
}
