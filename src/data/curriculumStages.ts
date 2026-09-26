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
    islandName: '流暢躍進島',
    stageTitle: '穿指跨越與如歌連音',
    description: '專為 6 歲快速協調期設計：大拇指穿指 (Thumb-under) 預備、斷奏 (Staccato) 與連音 (Legato) 觸鍵對比、3/4 拍圓舞曲搖曳！',
    focusHighlights: [
      '1指穿指與3/4指跨指平滑過渡',
      '彈簧般手腕斷奏 (Staccato) 敏捷反應',
      '如歌連奏 (Legato) 手腕重量自然轉移',
      '3/4 拍與 2/4 拍不同拍號韻律控制',
    ],
    tempoRange: 'BPM 75 ~ 88 (如歌流暢)',
    recommendedBpmRange: [75, 88],
    primaryCharacters: ['sanjuro', 'kai', 'eli_lion'],
  },
  7: {
    ageBand: 7,
    islandName: '皇家大師島',
    stageTitle: '古典傳世與全音域飛躍',
    description: '專為 7 歲大師演奏期設計：半音階、黑鍵升降記號、經典名家主題 (貝多芬、莫札特、巴哈、蕭邦) 與快速八度琶音！',
    focusHighlights: [
      '黑鍵升降號 (F# / D# / G#) 敏捷定位',
      '貝多芬半音階細膩顆粒感跑動',
      '莫札特古典奏鳴曲結晶音色與華麗裝飾',
      '雙八度分解和弦大瀑布與音樂表現力',
    ],
    tempoRange: 'BPM 85 ~ 100+ (演奏家風采)',
    recommendedBpmRange: [85, 100],
    primaryCharacters: ['kai', 'eli_lion', 'sanjuro', 'guanguan_bunny'],
  },
};
