import { AgeBand } from '../types/piano';

export interface AgeStageInfo {
  ageBand: AgeBand;
  islandName: string;
  stageTitle: string;
  description: string;
  focusHighlights: string[];
  tempoRange: string;
  recommendedBpmRange: [number, number];
  primaryCharacters: string[];
}

export const AGE_STAGES_INFO: Record<AgeBand, AgeStageInfo> = {
  4: {
    ageBand: 4,
    islandName: '萌芽啟蒙島',
    stageTitle: '三音探索與圓手洞',
    description: '專為 4 歲小肌肉設計：以艾力獅手型、中央 C 探索、3-2-1 順序落鍵與大音符可視化為主，快樂建立琴鍵直覺！',
    focusHighlights: [
      '艾力獅圓手洞 (握雞蛋手型)',
      '中央 C 與黑鍵兩朵菇識別',
      '右手 1-2-3 指天然重力落鍵',
      '四分音符與二分音符節奏拍打',
    ],
    tempoRange: 'BPM 55 ~ 65 (緩慢穩健)',
    recommendedBpmRange: [55, 65],
    primaryCharacters: ['eli_lion', 'kai', 'sanjuro'],
  },
  5: {
    ageBand: 5,
    islandName: '躍升節奏島',
    stageTitle: '五指平衡與雙手輪替',
    description: '專為 5 歲骨骼力量定制：開展全部 5 指獨立站立、4-5 弱指強化、雙手輪流接力與八分音符活潑跳進！',
    focusHighlights: [
      'C-D-E-F-G 五音位置全手掌平衡',
      '第 4 指與第 5 指獨立支撐',
      '雙手大拇指 (C4) 接力輪流演奏',
      '四分音符與八分音符快速轉換',
    ],
    tempoRange: 'BPM 65 ~ 75 (輕快活躍)',
    recommendedBpmRange: [65, 75],
    primaryCharacters: ['guanguan_bunny', 'kai', 'gaga_duck'],
  },
  6: {
    ageBand: 6,
    islandName: '低音躍進島',
    stageTitle: '低音譜表與左手力量',
    description: '專為 6 歲左手獨立性設計：系統掌握低音譜表 (Bass Clef 𝄢)、左手 C3-G3 五指基礎、左手低音旋律與伴奏型，奠定雙手合奏的穩固基石！',
    focusHighlights: [
      '低音譜表 (Bass Clef 𝄢) 讀譜直覺',
      '左手小指 (5指) 與大拇指獨立支撐',
      '左手 C3-D3-E3-F3-G3 低音五指位置',
      '低音伴奏型 (長音低音、跳音低音與和弦)',
    ],
    tempoRange: 'BPM 72 ~ 85 (沉穩有力)',
    recommendedBpmRange: [72, 85],
    primaryCharacters: ['kabuto_beetle', 'kai', 'rex_dino'],
  },
  7: {
    ageBand: 7,
    islandName: '雙手大師島',
    stageTitle: '雙手大譜表與左右合奏',
    description: '專為 7 歲雙手協調期設計：左右雙手同時彈奏、雙手大譜表 (Grand Staff) 即時閱讀、右手優美主旋律與左手和弦伴奏完美合體！',
    focusHighlights: [
      '雙手大譜表 (Grand Staff) 高低音同時呈現',
      '左右手不同節奏與指法獨立協調',
      '右手主旋律 + 左手低音伴奏雙手合奏',
      '貝多芬、舒伯特、莫札特傳世名曲雙手演奏',
    ],
    tempoRange: 'BPM 80 ~ 95+ (大師風采)',
    recommendedBpmRange: [80, 95],
    primaryCharacters: ['kai', 'eli_lion', 'sanjuro', 'guanguan_bunny'],
  },
};
