import React, { useState, useEffect } from 'react';
import { Lesson, CharacterFriend } from '../../types/piano';
import { EliLionSvg, PicoDolphinSvg, KabutoBeetleSvg, RexDinoSvg, ExplorerKaiSvg } from '../mascot/AnimalFriends';
import {
  MorningBearSvg,
  CaptainHoneybeeSvg,
  WaveTurtleSvg,
  FireflyBuddySvg,
  PterosaurSvg,
  MoonBunnySvg,
  ConductorKaiSvg,
  HappyLambSvg,
} from './ThemedDancerCharacters';
import confetti from 'canvas-confetti';

export type CelebrationThemeKey =
  | 'forest_safari'
  | 'honey_meadow'
  | 'ocean_splash'
  | 'beetle_champion'
  | 'dino_volcano'
  | 'starlight_galaxy'
  | 'classical_hall'
  | 'carnival_march'
  | 'farm_pastoral';

export interface ThemeDetails {
  key: CelebrationThemeKey;
  name: string;
  badgeLabel: string;
  title: string;
  celebrationQuote: string;
  bgGradient: string;
  leadName: string;
  guestName: string;
  danceAction: string;
  confettiColors: string[];
  ambientDecor: string[];
}

export const THEME_REGISTRY: Record<CelebrationThemeKey, ThemeDetails> = {
  forest_safari: {
    key: 'forest_safari',
    name: '森林早安跳躍舞會',
    badgeLabel: '🌲 森林舞會',
    title: '🐻 森林早安舞會大成功！',
    celebrationQuote: '大森林的小熊被你的美妙琴聲喚醒，開心跳起踏步早安舞！',
    bgGradient: 'from-amber-600/90 via-emerald-800/90 to-teal-950/95',
    leadName: '獅子 Eli',
    guestName: '早安小熊',
    danceAction: '正伴著歡快木琴律動，開心地手拉手跳躍！',
    confettiColors: ['#10B981', '#F59E0B', '#FBBF24', '#84CC16'],
    ambientDecor: ['🍃', '🍯', '🌼', '🪵', '✨'],
  },
  honey_meadow: {
    key: 'honey_meadow',
    name: '小蜜蜂嗡嗡採蜜慶典',
    badgeLabel: '🐝 花海嗡嗡',
    title: '🐝 蜜蜂採蜜花海派對！',
    celebrationQuote: '金黃花海裡的小蜜蜂們圍著你飛舞，釀造出了最甜的音樂蜂蜜！',
    bgGradient: 'from-yellow-500/90 via-amber-600/90 to-orange-900/95',
    leadName: '艾力獅',
    guestName: '小蜜蜂隊長',
    danceAction: '正在花叢中跳著八字迴旋舞，翅膀嗡嗡拍打！',
    confettiColors: ['#F59E0B', '#FDE047', '#EA580C', '#FFFFFF'],
    ambientDecor: ['🌻', '🐝', '🍯', '🌸', '✨'],
  },
  ocean_splash: {
    key: 'ocean_splash',
    name: '海豚浪花水上芭蕾',
    badgeLabel: '🐬 浪花芭蕾',
    title: '🐬 海豚水上芭蕾三重奏！',
    celebrationQuote: '海豚 Pico 在蔚藍浪花中騰空跳出三個金色光圈，太震撼啦！',
    bgGradient: 'from-cyan-600/90 via-blue-700/90 to-indigo-950/95',
    leadName: '海豚 Pico',
    guestName: '浪花海龜',
    danceAction: '在晶瑩水花中做 360 度空中芭蕾大騰躍！',
    confettiColors: ['#38BDF8', '#0284C7', '#60A5FA', '#E0F2FE'],
    ambientDecor: ['🌊', '🐬', '🫧', '🐚', '⭐'],
  },
  beetle_champion: {
    key: 'beetle_champion',
    name: '甲蟲金牌大力士盛典',
    badgeLabel: '🪲 金牌健美',
    title: '🪲 甲蟲大力士冠軍慶典！',
    celebrationQuote: '甲蟲 Kabuto 舉起了金牌槓鈴，森林昆蟲們為你鳴響號角！',
    bgGradient: 'from-blue-600/90 via-indigo-700/90 to-slate-950/95',
    leadName: '甲蟲 Kabuto',
    guestName: '螢火蟲小隊',
    danceAction: '高舉金色槓鈴連續推舉，螢火蟲揮舞冠軍旗！',
    confettiColors: ['#2563EB', '#F59E0B', '#3B82F6', '#FDE047'],
    ambientDecor: ['👑', '🪲', '💡', '🎺', '🏆'],
  },
  dino_volcano: {
    key: 'dino_volcano',
    name: '火山恐龍大地搖滾',
    badgeLabel: '🦖 恐龍重低音',
    title: '🦖 恐龍大地搖擺搖滾！',
    celebrationQuote: '暴龍 Rex 興奮地搖擺大尾巴，連火山都噴發出了七彩音符！',
    bgGradient: 'from-emerald-700/90 via-teal-800/90 to-slate-950/95',
    leadName: '恐龍 Rex',
    guestName: '翼龍飛飛',
    danceAction: '正伴著重低音踏地大震動，大跳恐龍搖滾舞！',
    confettiColors: ['#10B981', '#F97316', '#EF4444', '#FBBF24'],
    ambientDecor: ['🌿', '🦖', '🌋', '🔥', '🐾'],
  },
  starlight_galaxy: {
    key: 'starlight_galaxy',
    name: '銀河星空月光漫步',
    badgeLabel: '🌌 星空銀河',
    title: '⭐ 星空銀河漫步小舞會！',
    celebrationQuote: '星光在指尖流淌，月亮小兔踩著流星雨為你的精準節奏喝彩！',
    bgGradient: 'from-purple-700/90 via-indigo-900/90 to-slate-950/95',
    leadName: '探險家 Kai',
    guestName: '月亮小兔',
    danceAction: '在微重力銀河中飄浮漫步，手捧發光星辰旋轉！',
    confettiColors: ['#C084FC', '#F472B6', '#FDE047', '#E0E7FF'],
    ambientDecor: ['⭐', '🌙', '🪐', '✨', '🛸'],
  },
  classical_hall: {
    key: 'classical_hall',
    name: '維也納皇家大音樂廳',
    badgeLabel: '🎼 皇家音樂廳',
    title: '💌 貝多芬莫札特古典大盛會！',
    celebrationQuote: '給愛麗絲的琴聲如流水般傾瀉，音樂之神為你的專注大師風範鼓掌！',
    bgGradient: 'from-indigo-700/90 via-purple-900/90 to-slate-950/95',
    leadName: '指揮家 Kai',
    guestName: '艾力獅騎士',
    danceAction: '手持金指揮棒揮舞五線譜金光，深深紳士鞠躬！',
    confettiColors: ['#8B5CF6', '#A78BFA', '#F59E0B', '#EC4899'],
    ambientDecor: ['🎼', '🎹', '💌', '⭐', '🎆'],
  },
  carnival_march: {
    key: 'carnival_march',
    name: '歡樂嘉年華進行曲大巡遊',
    badgeLabel: '🎪 嘉年華巡遊',
    title: '🎉 音符小王國慶功嘉年華！',
    celebrationQuote: '氣勢恢弘的進行曲節奏！隨行導師與全島動物都為你的成就歡呼喝彩！',
    bgGradient: 'from-rose-600/90 via-amber-600/90 to-purple-950/95',
    leadName: '遊行隊長 Kai',
    guestName: '早安小熊',
    danceAction: '正在吹響號角踏步踢腿，踩著大鼓點前進！',
    confettiColors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
    ambientDecor: ['🎉', '🥁', '🎺', '🎈', '✨'],
  },
  farm_pastoral: {
    key: 'farm_pastoral',
    name: '陽光田園歡樂農場舞',
    badgeLabel: '🌾 田園農莊',
    title: '🐑 快樂農場小動物豐收派對！',
    celebrationQuote: '陽光灑滿金黃農莊，小羊和小雞圍著草堆跳起歡快的牧童舞！',
    bgGradient: 'from-amber-500/90 via-yellow-600/90 to-emerald-950/95',
    leadName: '艾力獅',
    guestName: '田園小綿羊',
    danceAction: '正踩著歡快四二拍在草堆上打轉，搖晃蓬鬆羊毛！',
    confettiColors: ['#F59E0B', '#84CC16', '#FDE047', '#FFFFFF'],
    ambientDecor: ['🌾', '🐑', '🌻', '🚜', '✨'],
  },
};

/**
 * Automatically derives the most fitting theme key based on song name, active mentor, or lesson metadata.
 */
export function detectCelebrationTheme(
  lesson?: Lesson,
  activeMentor?: CharacterFriend
): CelebrationThemeKey {
  if (!lesson) {
    if (activeMentor === 'pico_dolphin') return 'ocean_splash';
    if (activeMentor === 'kabuto_beetle') return 'beetle_champion';
    if (activeMentor === 'rex_dino') return 'dino_volcano';
    return 'forest_safari';
  }

  const sName = (lesson.songName || '').toLowerCase();
  const lTitle = (lesson.title || '').toLowerCase();
  const fullText = `${sName} ${lTitle}`;

  // 1. Ocean & Dolphin
  if (
    fullText.includes('海豚') ||
    fullText.includes('天鵝湖') ||
    fullText.includes('水手') ||
    fullText.includes('浪花') ||
    fullText.includes('海') ||
    fullText.includes('dolphin') ||
    fullText.includes('swan')
  ) {
    return 'ocean_splash';
  }

  // 2. Honeybee & Blossom Meadow
  if (
    fullText.includes('蜜蜂') ||
    fullText.includes('採蜜') ||
    fullText.includes('花') ||
    fullText.includes('粉刷匠') ||
    fullText.includes('bee')
  ) {
    return 'honey_meadow';
  }

  // 3. Starlight Galaxy & Moon
  if (
    fullText.includes('星星') ||
    fullText.includes('月光') ||
    fullText.includes('卡農') ||
    fullText.includes('銀河') ||
    fullText.includes('夜曲') ||
    fullText.includes('twinkle') ||
    fullText.includes('canon') ||
    fullText.includes('lune') ||
    fullText.includes('nocturne')
  ) {
    return 'starlight_galaxy';
  }

  // 4. Prehistoric Dinosaur & Volcanic beats
  if (
    fullText.includes('恐龍') ||
    fullText.includes('火山') ||
    fullText.includes('重低音') ||
    fullText.includes('dino')
  ) {
    return 'dino_volcano';
  }

  // 5. Beetle Strongman Arena
  if (
    fullText.includes('甲蟲') ||
    fullText.includes('力量') ||
    fullText.includes('鐵橋') ||
    fullText.includes('老虎') ||
    fullText.includes('beetle')
  ) {
    return 'beetle_champion';
  }

  // 6. Classical Royal Concert Hall
  if (
    fullText.includes('愛麗絲') ||
    fullText.includes('貝多芬') ||
    fullText.includes('巴哈') ||
    fullText.includes('莫札特') ||
    fullText.includes('小步舞曲') ||
    fullText.includes('奏鳴曲') ||
    fullText.includes('野玫瑰') ||
    fullText.includes('歡樂頌') ||
    fullText.includes('bach') ||
    fullText.includes('elise') ||
    fullText.includes('minuet')
  ) {
    return 'classical_hall';
  }

  // 7. Marching Band Carnival
  if (
    fullText.includes('進行曲') ||
    fullText.includes('火車') ||
    fullText.includes('康康') ||
    fullText.includes('拉德茨基') ||
    fullText.includes('土耳其') ||
    fullText.includes('march') ||
    fullText.includes('train')
  ) {
    return 'carnival_march';
  }

  // 8. Farm & Pastoral
  if (
    fullText.includes('麥克唐納') ||
    fullText.includes('農場') ||
    fullText.includes('綿羊') ||
    fullText.includes('小羊') ||
    fullText.includes('farm') ||
    fullText.includes('lamb')
  ) {
    return 'farm_pastoral';
  }

  // 9. Mentor fallback
  if (activeMentor === 'pico_dolphin') return 'ocean_splash';
  if (activeMentor === 'kabuto_beetle') return 'beetle_champion';
  if (activeMentor === 'rex_dino') return 'dino_volcano';

  // Default: Forest Safari
  return 'forest_safari';
}

export interface ThemeTransitionCelebrationProps {
  lesson?: Lesson;
  themeKey?: CelebrationThemeKey;
  activeMentor?: CharacterFriend;
  stageNumber?: 1 | 2 | 3 | 4;
  stageTitle?: string;
  compact?: boolean;
  className?: string;
  onInteractiveTrigger?: () => void;
}

/**
 * Independent, highly modular Theme Celebration Component.
 * Produces bespoke, animated dance stages for all 8 distinct curriculum themes.
 */
export const ThemeTransitionCelebration: React.FC<ThemeTransitionCelebrationProps> = ({
  lesson,
  themeKey,
  activeMentor = 'eli_lion',
  stageNumber,
  compact = false,
  className = '',
  onInteractiveTrigger,
}) => {
  const chosenKey = themeKey || detectCelebrationTheme(lesson, activeMentor);
  const theme = THEME_REGISTRY[chosenKey] || THEME_REGISTRY.forest_safari;

  const [interactiveBounce, setInteractiveBounce] = useState(false);

  // Trigger interactive burst on tap/click
  const handleStageClick = () => {
    setInteractiveBounce(true);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: theme.confettiColors,
    });
    setTimeout(() => setInteractiveBounce(false), 600);
    onInteractiveTrigger?.();
  };

  return (
    <div
      onClick={handleStageClick}
      className={`relative w-full overflow-hidden select-none cursor-pointer transition-all duration-300 ${
        compact
          ? 'h-36 sm:h-40 rounded-2xl border-2 border-white/30 bg-black/25 shadow-inner p-2'
          : 'h-64 sm:h-72 rounded-3xl border-4 border-amber-300/80 bg-gradient-to-b shadow-2xl p-4'
      } ${theme.bgGradient} ${interactiveBounce ? 'scale-[1.02]' : 'scale-100'} ${className}`}
      title="點擊讓動物夥伴歡呼慶祝！"
    >
      {/* ========================================================================= */}
      {/* 1. Theme-Specific Scenery Atmosphere Backdrop                             */}
      {/* ========================================================================= */}
      {/* Soft spotlight beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-lg pointer-events-none" />

      {/* Floating Theme Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme.ambientDecor.map((symbol, idx) => (
          <span
            key={`decor-${idx}`}
            className="absolute text-xl sm:text-2xl opacity-40 select-none animate-pulse"
            style={{
              top: `${12 + ((idx * 23) % 70)}%`,
              left: `${6 + ((idx * 29) % 86)}%`,
              animationDuration: `${2.2 + (idx % 3) * 0.7}s`,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>

      {/* Unique Environment Stage Props per Theme */}
      {chosenKey === 'ocean_splash' && (
        <>
          {/* Animated Water Ripples at bottom */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-sky-400/20 rounded-full blur-md animate-water-ripple" />
          <div className="absolute bottom-2 left-6 text-sky-200/50 text-xs font-black">🌊 蔚藍珊瑚礁</div>
        </>
      )}

      {chosenKey === 'honey_meadow' && (
        <>
          {/* Floating Gold Honey Pollen Dust */}
          <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-amber-300/60 blur-[1px] animate-flower-dust" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-yellow-200/80 blur-[1px] animate-flower-dust" />
          <div className="absolute bottom-2 right-4 text-amber-200/50 text-xs font-black">🌻 金黃向日葵田</div>
        </>
      )}

      {chosenKey === 'starlight_galaxy' && (
        <>
          {/* Nebula stardust orbit */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-2 left-4 text-purple-200/50 text-xs font-black">🌌 仙女座星河</div>
        </>
      )}

      {chosenKey === 'dino_volcano' && (
        <>
          {/* Volcanic ember glow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-10 bg-orange-600/30 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-2 right-4 text-orange-200/50 text-xs font-black">🌋 史前火山林</div>
        </>
      )}

      {chosenKey === 'classical_hall' && (
        <>
          {/* Royal Classical Chandelier silhouette */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-amber-200/60 text-sm">👑 皇家大音樂廳 👑</div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. Interactive Animated Animal Characters Dancing in Harmony               */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full h-full flex items-center justify-around px-2 sm:px-6">
        {/* Left Animal Dancer (Lead Character) */}
        <div className="flex flex-col items-center">
          <div
            className={`transition-transform duration-300 ${
              chosenKey === 'ocean_splash'
                ? 'animate-dolphin-leap'
                : chosenKey === 'dino_volcano'
                ? 'animate-dino-stomp'
                : chosenKey === 'beetle_champion'
                ? 'animate-barbell-press'
                : chosenKey === 'starlight_galaxy'
                ? 'animate-cosmic-float'
                : chosenKey === 'classical_hall'
                ? 'animate-dance-step'
                : chosenKey === 'carnival_march'
                ? 'animate-parade-march'
                : 'animate-dance-step'
            }`}
          >
            {/* Render Lead Animal based on chosen theme or active mentor */}
            {chosenKey === 'classical_hall' ? (
              <ConductorKaiSvg size={compact ? 68 : 96} />
            ) : chosenKey === 'starlight_galaxy' ? (
              <ExplorerKaiSvg size={compact ? 64 : 92} mood="celebrating" />
            ) : chosenKey === 'ocean_splash' ? (
              <PicoDolphinSvg size={compact ? 70 : 100} />
            ) : chosenKey === 'beetle_champion' ? (
              <KabutoBeetleSvg size={compact ? 66 : 94} />
            ) : chosenKey === 'dino_volcano' ? (
              <RexDinoSvg size={compact ? 68 : 98} />
            ) : (
              <EliLionSvg size={compact ? 68 : 96} />
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-black text-amber-200 mt-1 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/20 shadow-xs">
            {theme.leadName}
          </span>
        </div>

        {/* Center Dynamic Thematic Energy Nexus (Heart / Notes / Fireworks) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-xl sm:text-3xl">
              {chosenKey === 'ocean_splash'
                ? '🌊'
                : chosenKey === 'honey_meadow'
                ? '🍯'
                : chosenKey === 'starlight_galaxy'
                ? '⭐'
                : chosenKey === 'dino_volcano'
                ? '🔥'
                : chosenKey === 'beetle_champion'
                ? '🏆'
                : chosenKey === 'classical_hall'
                ? '🎻'
                : chosenKey === 'carnival_march'
                ? '🎺'
                : chosenKey === 'farm_pastoral'
                ? '🌻'
                : '🎶'}
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-amber-200 mt-1 tracking-wider uppercase drop-shadow-sm">
            {stageNumber === 4 ? '全曲大師' : '精彩合奏'}
          </span>
        </div>

        {/* Right Animal Dancer (Bespoke Partner Character) */}
        <div className="flex flex-col items-center">
          <div
            className={`transition-transform duration-300 ${
              chosenKey === 'honey_meadow'
                ? 'animate-bee-flight'
                : chosenKey === 'ocean_splash'
                ? 'animate-dance-step'
                : chosenKey === 'dino_volcano'
                ? 'animate-bee-flight'
                : chosenKey === 'starlight_galaxy'
                ? 'animate-cosmic-float'
                : chosenKey === 'beetle_champion'
                ? 'animate-cosmic-float'
                : chosenKey === 'classical_hall'
                ? 'animate-dance-step'
                : chosenKey === 'carnival_march'
                ? 'animate-parade-march'
                : 'animate-dance-step'
            }`}
          >
            {chosenKey === 'forest_safari' && <MorningBearSvg size={compact ? 66 : 94} />}
            {chosenKey === 'honey_meadow' && <CaptainHoneybeeSvg size={compact ? 64 : 90} />}
            {chosenKey === 'ocean_splash' && <WaveTurtleSvg size={compact ? 68 : 96} />}
            {chosenKey === 'beetle_champion' && <FireflyBuddySvg size={compact ? 64 : 90} />}
            {chosenKey === 'dino_volcano' && <PterosaurSvg size={compact ? 66 : 92} />}
            {chosenKey === 'starlight_galaxy' && <MoonBunnySvg size={compact ? 66 : 94} />}
            {chosenKey === 'classical_hall' && <EliLionSvg size={compact ? 64 : 90} />}
            {chosenKey === 'carnival_march' && <MorningBearSvg size={compact ? 66 : 94} />}
            {chosenKey === 'farm_pastoral' && <HappyLambSvg size={compact ? 66 : 94} />}
          </div>
          <span className="text-[10px] sm:text-xs font-black text-yellow-200 mt-1 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/20 shadow-xs">
            {theme.guestName}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Bottom Choreography Action Kicker Caption                              */}
      {/* ========================================================================= */}
      <div className="absolute bottom-1.5 left-0 right-0 text-center pointer-events-none px-3">
        <p className="text-[10px] sm:text-[11px] font-bold text-amber-100/90 truncate drop-shadow-md">
          {theme.leadName} 與 {theme.guestName} {theme.danceAction}
        </p>
      </div>
    </div>
  );
};
