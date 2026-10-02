export interface RhythmCatchNote {
  id: string;
  midiNote: number;
  noteName: string;
  solfege: string;
  laneIndex: number;
  timeBeat: number; // Beat timestamp
  durationBeats: number;
  lyrics?: string;
}

export interface RhythmCatchLane {
  noteName: string;
  midiNote: number;
  solfege: string;
  keyLabel: string;
  keyNum: string;
  colorHex: string;
  tailwindBg: string;
  tailwindBorder: string;
  tailwindText: string;
  glowColor: string;
}

export interface RhythmCatchTrack {
  id: string;
  title: string;
  titleEn: string;
  composer: string;
  category: 'beginner' | 'classic' | 'arcade' | 'speed';
  difficulty: 'easy' | 'normal' | 'hard' | 'master';
  bpm: number;
  timeSignature: [number, number];
  mentor: 'kai' | 'eli_lion' | 'sanjuro' | 'gaga_duck' | 'guanguan_bunny';
  mentorName: string;
  mentorAvatar: string;
  themeDescription: string;
  lanes: RhythmCatchLane[];
  notes: RhythmCatchNote[];
  totalBeats: number;
  badgeName: string;
  badgeIcon: string;
}

// 5 Standard Reference Lanes (C4, D4, E4, F4, G4)
export const STANDARD_5_LANES: RhythmCatchLane[] = [
  {
    noteName: 'C4',
    midiNote: 60,
    solfege: 'Do',
    keyLabel: 'D',
    keyNum: '1',
    colorHex: '#EF4444',
    tailwindBg: 'bg-rose-500',
    tailwindBorder: 'border-rose-400',
    tailwindText: 'text-rose-400',
    glowColor: 'rgba(239, 68, 68, 0.6)',
  },
  {
    noteName: 'D4',
    midiNote: 62,
    solfege: 'Re',
    keyLabel: 'F',
    keyNum: '2',
    colorHex: '#F97316',
    tailwindBg: 'bg-amber-500',
    tailwindBorder: 'border-amber-400',
    tailwindText: 'text-amber-400',
    glowColor: 'rgba(249, 115, 22, 0.6)',
  },
  {
    noteName: 'E4',
    midiNote: 64,
    solfege: 'Mi',
    keyLabel: 'J',
    keyNum: '3',
    colorHex: '#EAB308',
    tailwindBg: 'bg-yellow-400',
    tailwindBorder: 'border-yellow-300',
    tailwindText: 'text-yellow-400',
    glowColor: 'rgba(234, 179, 8, 0.6)',
  },
  {
    noteName: 'F4',
    midiNote: 65,
    solfege: 'Fa',
    keyLabel: 'K',
    keyNum: '4',
    colorHex: '#10B981',
    tailwindBg: 'bg-emerald-500',
    tailwindBorder: 'border-emerald-400',
    tailwindText: 'text-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.6)',
  },
  {
    noteName: 'G4',
    midiNote: 67,
    solfege: 'Sol',
    keyLabel: 'L',
    keyNum: '5',
    colorHex: '#0EA5E9',
    tailwindBg: 'bg-sky-500',
    tailwindBorder: 'border-sky-400',
    tailwindText: 'text-sky-400',
    glowColor: 'rgba(14, 165, 233, 0.6)',
  },
];

// 3 Lanes for Young Children (C4, D4, E4)
export const STANDARD_3_LANES: RhythmCatchLane[] = [
  STANDARD_5_LANES[0],
  STANDARD_5_LANES[1],
  STANDARD_5_LANES[2],
];

// 4 Lanes for Intermediate (C4, D4, E4, G4)
export const STANDARD_4_LANES: RhythmCatchLane[] = [
  STANDARD_5_LANES[0],
  STANDARD_5_LANES[1],
  STANDARD_5_LANES[2],
  STANDARD_5_LANES[4],
];

export const RHYTHM_CATCH_TRACKS: RhythmCatchTrack[] = [
  // 1. Hot Cross Buns - 3 Lanes Beginner Track
  {
    id: 'track-hot-cross-buns',
    title: '熱十字麵包',
    titleEn: 'Hot Cross Buns',
    composer: '英國經典童謠',
    category: 'beginner',
    difficulty: 'easy',
    bpm: 66,
    timeSignature: [4, 4],
    mentor: 'eli_lion',
    mentorName: '艾力獅',
    mentorAvatar: '🦁',
    themeDescription: '美味麵包出爐！跟隨圓潤下行 3-2-1 拍點精準捕捉音符！',
    badgeName: '美味麵包節拍王',
    badgeIcon: '🍞',
    lanes: STANDARD_3_LANES,
    notes: [
      // Measure 1: E4, D4, C4-
      { id: 'hcb-1', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 0, durationBeats: 1, lyrics: '熱' },
      { id: 'hcb-2', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 1, durationBeats: 1, lyrics: '十' },
      { id: 'hcb-3', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 2, durationBeats: 2, lyrics: '字' },

      // Measure 2: E4, D4, C4-
      { id: 'hcb-4', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 4, durationBeats: 1, lyrics: '熱' },
      { id: 'hcb-5', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 5, durationBeats: 1, lyrics: '十' },
      { id: 'hcb-6', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 6, durationBeats: 2, lyrics: '字' },

      // Measure 3: C4 C4 C4 C4
      { id: 'hcb-7', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 8, durationBeats: 1, lyrics: '一' },
      { id: 'hcb-8', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 9, durationBeats: 1, lyrics: '塊' },
      { id: 'hcb-9', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 10, durationBeats: 1, lyrics: '錢' },
      { id: 'hcb-10', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 11, durationBeats: 1, lyrics: '買' },

      // Measure 4: D4 D4 D4 D4
      { id: 'hcb-11', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 12, durationBeats: 1, lyrics: '兩' },
      { id: 'hcb-12', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 13, durationBeats: 1, lyrics: '塊' },
      { id: 'hcb-13', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 14, durationBeats: 1, lyrics: '錢' },
      { id: 'hcb-14', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 15, durationBeats: 1, lyrics: '呀' },

      // Measure 5: E4, D4, C4-
      { id: 'hcb-15', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 16, durationBeats: 1, lyrics: '熱' },
      { id: 'hcb-16', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 17, durationBeats: 1, lyrics: '十' },
      { id: 'hcb-17', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 18, durationBeats: 2, lyrics: '字！' },
    ],
    totalBeats: 21,
  },

  // 2. Mary Had a Little Lamb - 3 Lanes Classic Track
  {
    id: 'track-mary-lamb',
    title: '瑪莉有隻小綿羊',
    titleEn: 'Mary Had a Little Lamb',
    composer: '19世紀經典童謠',
    category: 'classic',
    difficulty: 'normal',
    bpm: 74,
    timeSignature: [4, 4],
    mentor: 'guanguan_bunny',
    mentorName: '冠冠小兔',
    mentorAvatar: '🐰',
    themeDescription: '像小綿羊般歡快跳躍！考驗連續同音跳動與穩定拍點！',
    badgeName: '輕快小羊蹦跳星',
    badgeIcon: '🐑',
    lanes: STANDARD_3_LANES,
    notes: [
      // Measure 1: E D C D
      { id: 'm-1', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 0, durationBeats: 1, lyrics: '瑪' },
      { id: 'm-2', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 1, durationBeats: 1, lyrics: '莉' },
      { id: 'm-3', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 2, durationBeats: 1, lyrics: '有' },
      { id: 'm-4', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 3, durationBeats: 1, lyrics: '隻' },

      // Measure 2: E E E-
      { id: 'm-5', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 4, durationBeats: 1, lyrics: '小' },
      { id: 'm-6', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 5, durationBeats: 1, lyrics: '綿' },
      { id: 'm-7', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 6, durationBeats: 2, lyrics: '羊' },

      // Measure 3: D D D-
      { id: 'm-8', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 8, durationBeats: 1, lyrics: '小' },
      { id: 'm-9', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 9, durationBeats: 1, lyrics: '綿' },
      { id: 'm-10', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 10, durationBeats: 2, lyrics: '羊' },

      // Measure 4: E E E- (or E G G)
      { id: 'm-11', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 12, durationBeats: 1, lyrics: '小' },
      { id: 'm-12', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 13, durationBeats: 1, lyrics: '綿' },
      { id: 'm-13', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 14, durationBeats: 2, lyrics: '羊' },

      // Measure 5: E D C D
      { id: 'm-14', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 16, durationBeats: 1, lyrics: '白' },
      { id: 'm-15', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 17, durationBeats: 1, lyrics: '毛' },
      { id: 'm-16', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 18, durationBeats: 1, lyrics: '像' },
      { id: 'm-17', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 19, durationBeats: 1, lyrics: '雪' },

      // Measure 6: E E E E
      { id: 'm-18', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 20, durationBeats: 1, lyrics: '一' },
      { id: 'm-19', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 21, durationBeats: 1, lyrics: '樣' },
      { id: 'm-20', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 22, durationBeats: 1, lyrics: '軟' },
      { id: 'm-21', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 23, durationBeats: 1, lyrics: '綿' },

      // Measure 7: D D E D
      { id: 'm-22', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 24, durationBeats: 1, lyrics: '非' },
      { id: 'm-23', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 25, durationBeats: 1, lyrics: '常' },
      { id: 'm-24', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 26, durationBeats: 1, lyrics: '可' },
      { id: 'm-25', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 27, durationBeats: 1, lyrics: '愛' },

      // Measure 8: C---
      { id: 'm-26', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 28, durationBeats: 4, lyrics: '呀！' },
    ],
    totalBeats: 33,
  },

  // 3. Twinkle Twinkle Little Star - 5 Lanes Classic Track
  {
    id: 'track-twinkle-star',
    title: '小星星',
    titleEn: 'Twinkle Twinkle Little Star',
    composer: '莫札特主題童謠',
    category: 'classic',
    difficulty: 'normal',
    bpm: 82,
    timeSignature: [4, 4],
    mentor: 'kai',
    mentorName: 'Kai 探險狐',
    mentorAvatar: '🦊',
    themeDescription: '夜空中閃閃發光的五彩音符！跟隨旋律在 5 個軌道中穿梭！',
    badgeName: '閃爍星空節奏大師',
    badgeIcon: '✨',
    lanes: STANDARD_5_LANES,
    notes: [
      // Measure 1: C C G G
      { id: 'tw-1', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 0, durationBeats: 1, lyrics: '一' },
      { id: 'tw-2', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 1, durationBeats: 1, lyrics: '閃' },
      { id: 'tw-3', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 2, durationBeats: 1, lyrics: '一' },
      { id: 'tw-4', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 3, durationBeats: 1, lyrics: '閃' },

      // Measure 2: G G G- (using G4 on lane 4)
      { id: 'tw-5', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 4, durationBeats: 1, lyrics: '亮' },
      { id: 'tw-6', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 5, durationBeats: 1, lyrics: '晶' },
      { id: 'tw-7', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 6, durationBeats: 2, lyrics: '晶' },

      // Measure 3: F F E E
      { id: 'tw-8', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 8, durationBeats: 1, lyrics: '滿' },
      { id: 'tw-9', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 9, durationBeats: 1, lyrics: '天' },
      { id: 'tw-10', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 10, durationBeats: 1, lyrics: '都' },
      { id: 'tw-11', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 11, durationBeats: 1, lyrics: '是' },

      // Measure 4: D D C-
      { id: 'tw-12', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 12, durationBeats: 1, lyrics: '小' },
      { id: 'tw-13', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 13, durationBeats: 1, lyrics: '星' },
      { id: 'tw-14', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 14, durationBeats: 2, lyrics: '星' },

      // Measure 5: G G F F
      { id: 'tw-15', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 16, durationBeats: 1, lyrics: '掛' },
      { id: 'tw-16', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 17, durationBeats: 1, lyrics: '在' },
      { id: 'tw-17', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 18, durationBeats: 1, lyrics: '天' },
      { id: 'tw-18', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 19, durationBeats: 1, lyrics: '上' },

      // Measure 6: E E D-
      { id: 'tw-19', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 20, durationBeats: 1, lyrics: '放' },
      { id: 'tw-20', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 21, durationBeats: 1, lyrics: '光' },
      { id: 'tw-21', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 22, durationBeats: 2, lyrics: '明' },

      // Measure 7: C C G G
      { id: 'tw-22', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 24, durationBeats: 1, lyrics: '好' },
      { id: 'tw-23', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 25, durationBeats: 1, lyrics: '像' },
      { id: 'tw-24', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 26, durationBeats: 1, lyrics: '許' },
      { id: 'tw-25', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 27, durationBeats: 1, lyrics: '多' },

      // Measure 8: F F E E
      { id: 'tw-26', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 28, durationBeats: 1, lyrics: '小' },
      { id: 'tw-27', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 29, durationBeats: 1, lyrics: '眼' },
      { id: 'tw-28', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 30, durationBeats: 1, lyrics: '睛' },
      { id: 'tw-29', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 31, durationBeats: 1, lyrics: '眨' },

      // Measure 9: C---
      { id: 'tw-30', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 32, durationBeats: 4, lyrics: '呀！' },
    ],
    totalBeats: 37,
  },

  // 4. Ode to Joy - 5 Lanes Uplifting Anthem
  {
    id: 'track-ode-to-joy',
    title: '貝多芬《歡樂頌》',
    titleEn: 'Ode to Joy',
    composer: '貝多芬 第九號交響曲',
    category: 'classic',
    difficulty: 'hard',
    bpm: 90,
    timeSignature: [4, 4],
    mentor: 'sanjuro',
    mentorName: '三十郎大師',
    mentorAvatar: '🎯',
    themeDescription: '磅礡輝煌的古典盛典！手指像武士般敏捷精準！',
    badgeName: '歡樂頌神射大師',
    badgeIcon: '👑',
    lanes: STANDARD_5_LANES,
    notes: [
      // Measure 1: E E F G
      { id: 'otj-1', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 0, durationBeats: 1, lyrics: '歡' },
      { id: 'otj-2', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 1, durationBeats: 1, lyrics: '樂' },
      { id: 'otj-3', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 2, durationBeats: 1, lyrics: '女' },
      { id: 'otj-4', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 3, durationBeats: 1, lyrics: '神' },

      // Measure 2: G F E D
      { id: 'otj-5', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 4, durationBeats: 1, lyrics: '聖' },
      { id: 'otj-6', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 5, durationBeats: 1, lyrics: '潔' },
      { id: 'otj-7', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 6, durationBeats: 1, lyrics: '美' },
      { id: 'otj-8', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 7, durationBeats: 1, lyrics: '麗' },

      // Measure 3: C C D E
      { id: 'otj-9', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 8, durationBeats: 1, lyrics: '燦' },
      { id: 'otj-10', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 9, durationBeats: 1, lyrics: '爛' },
      { id: 'otj-11', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 10, durationBeats: 1, lyrics: '光' },
      { id: 'otj-12', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 11, durationBeats: 1, lyrics: '芒' },

      // Measure 4: E. D D-
      { id: 'otj-13', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 12, durationBeats: 1.5, lyrics: '照' },
      { id: 'otj-14', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 13.5, durationBeats: 0.5, lyrics: '大' },
      { id: 'otj-15', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 14, durationBeats: 2, lyrics: '地' },

      // Measure 5: E E F G
      { id: 'otj-16', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 16, durationBeats: 1, lyrics: '我' },
      { id: 'otj-17', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 17, durationBeats: 1, lyrics: '們' },
      { id: 'otj-18', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 18, durationBeats: 1, lyrics: '心' },
      { id: 'otj-19', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 19, durationBeats: 1, lyrics: '中' },

      // Measure 6: G F E D
      { id: 'otj-20', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 4, timeBeat: 20, durationBeats: 1, lyrics: '充' },
      { id: 'otj-21', midiNote: 65, noteName: 'F4', solfege: 'Fa', laneIndex: 3, timeBeat: 21, durationBeats: 1, lyrics: '滿' },
      { id: 'otj-22', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 22, durationBeats: 1, lyrics: '熱' },
      { id: 'otj-23', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 23, durationBeats: 1, lyrics: '情' },

      // Measure 7: C C D E
      { id: 'otj-24', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 24, durationBeats: 1, lyrics: '來' },
      { id: 'otj-25', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 25, durationBeats: 1, lyrics: '到' },
      { id: 'otj-26', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 26, durationBeats: 1, lyrics: '你' },
      { id: 'otj-27', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 27, durationBeats: 1, lyrics: '的' },

      // Measure 8: D. C C-
      { id: 'otj-28', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 28, durationBeats: 1.5, lyrics: '殿' },
      { id: 'otj-29', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 29.5, durationBeats: 0.5, lyrics: '堂' },
      { id: 'otj-30', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 30, durationBeats: 2, lyrics: '裡！' },
    ],
    totalBeats: 34,
  },

  // 5. Endless Beat Rush - Arcade Special Mode
  {
    id: 'track-beat-rush',
    title: '極速節奏衝鋒',
    titleEn: 'Rhythm Beat Rush',
    composer: 'AI Studio 原創節奏挑戰',
    category: 'speed',
    difficulty: 'master',
    bpm: 100,
    timeSignature: [4, 4],
    mentor: 'gaga_duck',
    mentorName: '嘎嘎嘎水鴨',
    mentorAvatar: '🦆',
    themeDescription: '連環八分音符與切分節拍！測試你的神級手速與極限精準度！',
    badgeName: '音速狂潮傳奇',
    badgeIcon: '⚡',
    lanes: STANDARD_4_LANES,
    notes: [
      { id: 'br-1', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 0, durationBeats: 1, lyrics: '1' },
      { id: 'br-2', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 1, durationBeats: 1, lyrics: '2' },
      { id: 'br-3', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 2, durationBeats: 1, lyrics: '3' },
      { id: 'br-4', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 3, timeBeat: 3, durationBeats: 1, lyrics: '4' },

      { id: 'br-5', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 4, durationBeats: 0.5, lyrics: '跳' },
      { id: 'br-6', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 4.5, durationBeats: 0.5, lyrics: '跳' },
      { id: 'br-7', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 5, durationBeats: 0.5, lyrics: '衝' },
      { id: 'br-8', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 5.5, durationBeats: 0.5, lyrics: '衝' },
      { id: 'br-9', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 3, timeBeat: 6, durationBeats: 2, lyrics: '穩！' },

      { id: 'br-10', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 8, durationBeats: 0.5, lyrics: '快' },
      { id: 'br-11', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 8.5, durationBeats: 0.5, lyrics: '步' },
      { id: 'br-12', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 9, durationBeats: 0.5, lyrics: '前' },
      { id: 'br-13', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 3, timeBeat: 9.5, durationBeats: 0.5, lyrics: '進' },
      { id: 'br-14', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 3, timeBeat: 10, durationBeats: 1, lyrics: '閃' },
      { id: 'br-15', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 11, durationBeats: 1, lyrics: '耀' },

      { id: 'br-16', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 12, durationBeats: 0.5, lyrics: '雙' },
      { id: 'br-17', midiNote: 62, noteName: 'D4', solfege: 'Re', laneIndex: 1, timeBeat: 12.5, durationBeats: 0.5, lyrics: '手' },
      { id: 'br-18', midiNote: 64, noteName: 'E4', solfege: 'Mi', laneIndex: 2, timeBeat: 13, durationBeats: 0.5, lyrics: '輪' },
      { id: 'br-19', midiNote: 67, noteName: 'G4', solfege: 'Sol', laneIndex: 3, timeBeat: 13.5, durationBeats: 0.5, lyrics: '動' },
      { id: 'br-20', midiNote: 60, noteName: 'C4', solfege: 'Do', laneIndex: 0, timeBeat: 14, durationBeats: 2, lyrics: '勝！' },
    ],
    totalBeats: 18,
  },
];
