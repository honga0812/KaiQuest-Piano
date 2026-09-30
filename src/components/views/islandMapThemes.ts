import { AgeBand } from '../../types/piano';

export interface StationThematicCoord {
  x: number;
  y: number;
  name: string;
  solfege: string;
  landmark: string;
  labelPosition: 'top' | 'bottom' | 'left' | 'right';
  animalGuide: 'kai' | 'eli_lion' | 'rex_dino' | 'pico_dolphin' | 'kabuto_beetle' | 'none';
  perchOffset: { x: number; y: number; facing: 'left' | 'right'; bubbleDir: 'top' | 'bottom' | 'left' | 'right' };
}

export interface IslandMapThemeConfig {
  id: string;
  ageBand: AgeBand;
  islandName: string;
  themeTitle: string;
  description: string;
  skyGradient: { from: string; mid: string; to: string };
  islandTerrain: {
    outer: string;
    inner: string;
    roadSurface: string;
    roadBorder: string;
    shoreSand: string;
  };
  landmassOuterPath: string;
  landmassInnerPath: string;
  atmosphereBadge: string;
  sceneryType: 'sunny_beach' | 'emerald_forest' | 'deep_ocean' | 'cliff_apex';
  stations: StationThematicCoord[];
}

// =========================================================================
// ZERO-OVERLAP MASTER COORDINATES:
// 12 Spacious Perimeter Waypoints with 140~180px distance between every node.
// - Stations 1-5 (South Coast): y = 505, x = 110, 270, 430, 590, 750 (labels at bottom)
// - Stations 6-8 (East Ascent): (880, 420), (900, 280), (860, 160) (labels at right/top)
// - Stations 9-12 (North Ridge): y = 110, x = 720, 540, 360, 180 (labels at top)
// - 350px OPEN CLEARING IN THE CENTER for animals, scenic focal points & Kai!
// =========================================================================

// -------------------------------------------------------------
// AGE 4: 萌芽啟蒙島 · 陽光金沙海灘 (Sunny Tropical Starter Island)
// -------------------------------------------------------------
const AGE_4_STATIONS: StationThematicCoord[] = [
  { x: 110, y: 505, name: '陽光金沙起點', solfege: 'Do', landmark: '🏖️', labelPosition: 'bottom', animalGuide: 'kai', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 270, y: 505, name: '麵包香香磨坊', solfege: 'Re', landmark: '🥐', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 430, y: 505, name: '恐龍音階草地', solfege: 'Mi', landmark: '🦖', labelPosition: 'bottom', animalGuide: 'rex_dino', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 590, y: 505, name: '蜜蜂花海山谷', solfege: 'Fa', landmark: '🐝', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 750, y: 505, name: '海豚跳水清泉', solfege: 'Sol', landmark: '🐬', labelPosition: 'bottom', animalGuide: 'pico_dolphin', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 880, y: 420, name: '獅子拱門岩壁', solfege: 'La', landmark: '🦁', labelPosition: 'right', animalGuide: 'eli_lion', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 900, y: 280, name: '甲蟲節奏巨塔', solfege: 'Ti', landmark: '🪲', labelPosition: 'right', animalGuide: 'kabuto_beetle', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 860, y: 160, name: '晚安星辰海灣', solfege: 'Do高', landmark: '🌙', labelPosition: 'right', animalGuide: 'none', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'bottom' } },
  { x: 720, y: 110, name: '音樂鳴笛小火車', solfege: 'Re高', landmark: '🚂', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 540, y: 110, name: '彩虹琴鍵拱橋', solfege: 'Mi高', landmark: '🌉', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 360, y: 110, name: '星光小天文台', solfege: 'Fa高', landmark: '⭐', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
  { x: 180, y: 120, name: '黃金榮譽城堡', solfege: 'Sol高', landmark: '👑', labelPosition: 'top', animalGuide: 'kai', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
];

// -------------------------------------------------------------
// AGE 5: 躍升節奏島 · 翡翠巨石魔法森林 (Emerald Megalith Forest)
// -------------------------------------------------------------
const AGE_5_STATIONS: StationThematicCoord[] = [
  { x: 110, y: 505, name: '森林探險大本營', solfege: 'Do', landmark: '🏕️', labelPosition: 'bottom', animalGuide: 'kai', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 270, y: 505, name: '夜光七彩魔菇林', solfege: 'Re', landmark: '🍄', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 430, y: 505, name: '遠古巨石音階陣', solfege: 'Mi', landmark: '🗿', labelPosition: 'bottom', animalGuide: 'rex_dino', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 590, y: 505, name: '千年古樹藤蔓居', solfege: 'Fa', landmark: '🌲', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 750, y: 505, name: '浮木節奏清溪流', solfege: 'Sol', landmark: '🪵', labelPosition: 'bottom', animalGuide: 'pico_dolphin', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 880, y: 420, name: '智慧貓頭鷹鐘塔', solfege: 'La', landmark: '🦉', labelPosition: 'right', animalGuide: 'eli_lion', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 900, y: 280, name: '迴音怪石堆石陣', solfege: 'Ti', landmark: '🪨', labelPosition: 'right', animalGuide: 'kabuto_beetle', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 860, y: 160, name: '螢光蝴蝶幻秘谷', solfege: 'Do高', landmark: '🦋', labelPosition: 'right', animalGuide: 'none', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'bottom' } },
  { x: 720, y: 110, name: '迷宮青藤靈泉池', solfege: 'Re高', landmark: '🌿', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 540, y: 110, name: '古精靈石雕拱門', solfege: 'Mi高', landmark: '🗝️', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 360, y: 110, name: '星宿祭壇羅盤岩', solfege: 'Fa高', landmark: '🧭', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
  { x: 180, y: 120, name: '翡翠精靈神殿堡', solfege: 'Sol高', landmark: '🏰', labelPosition: 'top', animalGuide: 'kai', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
];

// -------------------------------------------------------------
// AGE 6: 流暢躍進島 · 亞特蘭提斯神秘海底世界 (Atlantis Deep Ocean)
// -------------------------------------------------------------
const AGE_6_STATIONS: StationThematicCoord[] = [
  { x: 110, y: 505, name: '潛水探險出發點', solfege: 'Do', landmark: '🤿', labelPosition: 'bottom', animalGuide: 'kai', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 270, y: 505, name: '搖曳七彩珊瑚礁', solfege: 'Re', landmark: '🪸', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 430, y: 505, name: '珍珠貝殼音階琴', solfege: 'Mi', landmark: '🐚', labelPosition: 'bottom', animalGuide: 'rex_dino', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 590, y: 505, name: '飛躍海豚逐浪灣', solfege: 'Fa', landmark: '🐬', labelPosition: 'bottom', animalGuide: 'pico_dolphin', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 750, y: 505, name: '海盜沉船藏寶鐵錨', solfege: 'Sol', landmark: '⚓', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 880, y: 420, name: '洋流旋轉大漩渦', solfege: 'La', landmark: '🌊', labelPosition: 'right', animalGuide: 'eli_lion', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 900, y: 280, name: '夜光發光水母窟', solfege: 'Ti', landmark: '🪼', labelPosition: 'right', animalGuide: 'kabuto_beetle', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 860, y: 160, name: '藍鯨低鳴深海溝', solfege: 'Do高', landmark: '🐋', labelPosition: 'right', animalGuide: 'none', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'bottom' } },
  { x: 720, y: 110, name: '海神三叉戟祭台', solfege: 'Re高', landmark: '🔱', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 540, y: 110, name: '沉沒神殿大立柱', solfege: 'Mi高', landmark: '🏛️', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 360, y: 110, name: '幽光深邃海溝槽', solfege: 'Fa高', landmark: '🌌', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
  { x: 180, y: 120, name: '波塞頓水晶水殿', solfege: 'Sol高', landmark: '👑', labelPosition: 'top', animalGuide: 'kai', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
];

// -------------------------------------------------------------
// AGE 7: 皇家大師島 · 蒼穹雷雲雪峰懸崖峭壁 (Thunder Cliff Apex)
// -------------------------------------------------------------
const AGE_7_STATIONS: StationThematicCoord[] = [
  { x: 110, y: 505, name: '險峰攀登集結營', solfege: 'Do', landmark: '🧗', labelPosition: 'bottom', animalGuide: 'kai', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 270, y: 505, name: '雷霆破風大裂谷', solfege: 'Re', landmark: '⚡', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 430, y: 505, name: '金雕巨巢突岩崖', solfege: 'Mi', landmark: '🦅', labelPosition: 'bottom', animalGuide: 'rex_dino', perchOffset: { x: 0, y: -72, facing: 'right', bubbleDir: 'top' } },
  { x: 590, y: 505, name: '深淵鐵索搖晃橋', solfege: 'Fa', landmark: '🌉', labelPosition: 'bottom', animalGuide: 'none', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 750, y: 505, name: '冰川萬年回音窟', solfege: 'Sol', landmark: '🏔️', labelPosition: 'bottom', animalGuide: 'pico_dolphin', perchOffset: { x: 0, y: -72, facing: 'left', bubbleDir: 'top' } },
  { x: 880, y: 420, name: '暴風雪音符風口', solfege: 'La', landmark: '❄️', labelPosition: 'right', animalGuide: 'eli_lion', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 900, y: 280, name: '刀削峭壁攀爬壁', solfege: 'Ti', landmark: '🧗‍♂️', labelPosition: 'right', animalGuide: 'kabuto_beetle', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'left' } },
  { x: 860, y: 160, name: '熔岩裂隙灼熱道', solfege: 'Do高', landmark: '🌋', labelPosition: 'right', animalGuide: 'none', perchOffset: { x: -68, y: 0, facing: 'left', bubbleDir: 'bottom' } },
  { x: 720, y: 110, name: '極光夜空觀星台', solfege: 'Re高', landmark: '🌠', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 540, y: 110, name: '試煉巨龍脊骨岩', solfege: 'Mi高', landmark: '🛡️', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'left', bubbleDir: 'bottom' } },
  { x: 360, y: 110, name: '王者石中拔劍台', solfege: 'Fa高', landmark: '⚔️', labelPosition: 'top', animalGuide: 'none', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
  { x: 180, y: 120, name: '雲巔金頂大師宮', solfege: 'Sol高', landmark: '👑', labelPosition: 'top', animalGuide: 'kai', perchOffset: { x: 0, y: 68, facing: 'right', bubbleDir: 'bottom' } },
];

export const ISLAND_MAP_THEMES: Record<AgeBand, IslandMapThemeConfig> = {
  4: {
    id: 'theme-age-4-sunny-beach',
    ageBand: 4,
    islandName: '萌芽啟蒙島 · 陽光金沙海灘',
    themeTitle: '童趣溫暖海島 · 零重疊清晰大視野',
    description: '最適合 4 歲啟蒙！海風、彩虹、小蘑菇與溫暖金沙海灘，寬敞清晰大路徑。',
    skyGradient: { from: '#38BDF8', mid: '#0284C7', to: '#0369A1' },
    islandTerrain: {
      outer: '#FEF08A', // Warm golden sand beach
      inner: '#4ADE80', // Vibrant green grassy meadow
      roadSurface: '#F59E0B',
      roadBorder: '#B45309',
      shoreSand: '#FDE047',
    },
    // Distinctive gentle, organic island shape with soft bays
    landmassOuterPath:
      'M 50,540 C 30,420 50,320 120,240 C 190,160 300,75 500,65 C 720,55 860,80 940,160 C 990,220 970,360 930,460 C 890,550 780,590 620,595 C 450,600 290,590 150,575 C 80,565 55,555 50,540 Z',
    landmassInnerPath:
      'M 70,520 C 50,410 70,310 140,230 C 210,150 320,95 500,85 C 700,75 830,100 910,175 C 955,230 935,350 895,445 C 855,525 760,570 610,575 C 450,580 300,570 165,555 C 95,545 75,535 70,520 Z',
    atmosphereBadge: '🏖️ 4歲 陽光海島入門',
    sceneryType: 'sunny_beach',
    stations: AGE_4_STATIONS,
  },
  5: {
    id: 'theme-age-5-emerald-forest',
    ageBand: 5,
    islandName: '躍升節奏島 · 翡翠巨石魔法森林',
    themeTitle: '巨石陣古樹秘境 · 森林石堆探索',
    description: '專為 5 歲骨骼力量打造！穿梭遠古巨石陣、石頭堆古蹟、參天古樹與夜光魔菇林。',
    skyGradient: { from: '#064E3B', mid: '#047857', to: '#059669' },
    islandTerrain: {
      outer: '#78716C', // Ancient Stone Rim
      inner: '#15803D', // Deep Emerald Mossy Forest
      roadSurface: '#D97706',
      roadBorder: '#78350F',
      shoreSand: '#A8A29E',
    },
    // Distinctive forest canopy shape with organic stone knolls
    landmassOuterPath:
      'M 60,550 C 20,440 60,330 110,250 C 160,170 280,70 480,55 C 680,40 850,70 930,150 C 990,210 980,330 940,440 C 900,540 800,600 640,605 C 480,610 320,600 160,580 C 100,570 65,565 60,550 Z',
    landmassInnerPath:
      'M 80,530 C 40,425 80,320 130,240 C 180,160 300,90 480,75 C 660,60 820,90 900,165 C 950,220 940,320 905,425 C 865,515 780,575 630,585 C 470,590 325,580 180,560 C 115,550 85,545 80,530 Z',
    atmosphereBadge: '🌲 5歲 巨石森林探索',
    sceneryType: 'emerald_forest',
    stations: AGE_5_STATIONS,
  },
  6: {
    id: 'theme-age-6-deep-ocean',
    ageBand: 6,
    islandName: '流暢躍進島 · 亞特蘭提斯神秘海底世界',
    themeTitle: '深海沉船峽谷 · 夜光珊瑚水母水下秘境',
    description: '專為 6 歲快速手指設計！潛入亞特蘭提斯海底宮殿、發光珊瑚花園、避開漩渦、穿越夜光水母洞。',
    skyGradient: { from: '#020617', mid: '#0F172A', to: '#1E3A8A' },
    islandTerrain: {
      outer: '#1E40AF', // Deep ocean trench shelf
      inner: '#0E7490', // Submerged cyan atoll plate
      roadSurface: '#06B6D4',
      roadBorder: '#0891B2',
      shoreSand: '#38BDF8',
    },
    // Distinctive ocean basin with coral shelf curves
    landmassOuterPath:
      'M 40,530 C 40,390 80,290 140,220 C 200,150 320,60 520,55 C 720,50 880,75 950,155 C 1000,215 970,350 930,450 C 890,540 770,595 610,600 C 450,605 290,595 150,575 C 80,565 40,550 40,530 Z',
    landmassInnerPath:
      'M 60,510 C 60,375 100,280 160,210 C 220,140 335,80 520,75 C 700,70 850,95 920,170 C 960,225 935,335 895,435 C 855,515 750,575 600,580 C 445,585 295,575 170,555 C 95,545 60,530 60,510 Z',
    atmosphereBadge: '🌊 6歲 亞特蘭提斯深海',
    sceneryType: 'deep_ocean',
    stations: AGE_6_STATIONS,
  },
  7: {
    id: 'theme-age-7-cliff-apex',
    ageBand: 7,
    islandName: '皇家大師島 · 蒼穹雷雲雪峰懸崖峭壁',
    themeTitle: '高山懸崖峭壁 · 雷霆萬丈險峰天梯',
    description: '專為 7 歲大師演奏挑戰！勇攀陡峭懸崖、跨越深淵鐵索橋、破風暴雪、登頂雲巔黃金王座！',
    skyGradient: { from: '#020617', mid: '#1E1B4B', to: '#312E81' },
    islandTerrain: {
      outer: '#334155', // Jagged dark slate cliff face
      inner: '#1E293B', // Steep volcanic peak summit rock
      roadSurface: '#E11D48',
      roadBorder: '#9F1239',
      shoreSand: '#64748B',
    },
    // Distinctive rugged, jagged alpine ridge contour with steep crags
    landmassOuterPath:
      'M 50,545 L 35,420 L 75,300 L 130,220 L 220,140 L 340,75 L 500,50 L 660,65 L 820,70 L 935,145 L 975,230 L 950,360 L 920,465 L 850,550 L 720,595 L 560,605 L 380,600 L 220,585 L 110,570 Z',
    landmassInnerPath:
      'M 70,525 L 55,410 L 90,290 L 150,210 L 235,135 L 350,90 L 500,70 L 650,80 L 800,85 L 905,160 L 940,235 L 915,350 L 890,445 L 825,525 L 705,575 L 550,585 L 385,580 L 230,565 L 125,550 Z',
    atmosphereBadge: '⚡ 7歲 懸崖雪峰大師',
    sceneryType: 'cliff_apex',
    stations: AGE_7_STATIONS,
  },
};
