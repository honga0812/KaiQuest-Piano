import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lesson, CharacterFriend } from '../../types/piano';
import { speechGuide } from '../../utils/speechGuide';
import {
  ThemeTransitionCelebration,
  detectCelebrationTheme,
  THEME_REGISTRY,
  CelebrationThemeKey,
} from './ThemeTransitionCelebration';

interface ThematicCelebrationModalProps {
  lesson: Lesson;
  activeMentor: CharacterFriend;
  starsAwarded: number;
  accuracyRate: number;
  bpm: number;
  stageNumber?: 1 | 2 | 3 | 4;
  stageTitle?: string;
  onRetry: () => void;
  onProceed: () => void;
  proceedLabel: string;
}

export interface CelebrationPraise {
  tag: string;
  icon: string;
  speech: string;
  badgeColor: string;
}

let lastPraiseIdx = -1;

export function getPraiseForCompletion(
  songName: string,
  starsAwarded: number,
  mentor: CharacterFriend,
  stageNumber?: number
): CelebrationPraise {
  const mentorName =
    mentor === 'eli_lion'
      ? '艾力獅'
      : mentor === 'pico_dolphin'
      ? '海豚Pico'
      : mentor === 'kabuto_beetle'
      ? '甲蟲Kabuto'
      : mentor === 'rex_dino'
      ? '恐龍Rex'
      : '探險家Kai';

  // If Stage 4 (Full Song Grand Challenge)
  if (stageNumber === 4) {
    const fullSongPool: CelebrationPraise[] = [
      {
        tag: '你成功了！全曲大滿貫',
        icon: '👑',
        speech: `你成功了！整首《${songName}》完整連貫彈奏完畢，你是最棒的鋼琴小大師！繼續加油！`,
        badgeColor: 'bg-emerald-500/25 text-emerald-200 border-emerald-400',
      },
      {
        tag: '你是最棒的！全曲精彩演出',
        icon: '⭐',
        speech: `你是最棒的！《${songName}》全曲彈得太好聽了，全場都在為你起立鼓掌！繼續加油！`,
        badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400',
      },
      {
        tag: '繼續加油！征服完整名曲',
        icon: '🔥',
        speech: `繼續加油！你成功征服了《${songName}》全曲大挑戰，節奏與指法太穩健了，你是最棒的！`,
        badgeColor: 'bg-orange-500/25 text-orange-200 border-orange-400',
      },
      {
        tag: '太厲害了！音樂會級別演奏',
        icon: '🏆',
        speech: `太厲害了！《${songName}》從頭到尾零失誤，你成功了，你是最棒的，繼續加油邁向下一關！`,
        badgeColor: 'bg-purple-500/25 text-purple-200 border-purple-400',
      },
      {
        tag: '你做到了！大師榮譽達成',
        icon: '🎉',
        speech: `你做到了！${mentorName}為你感到驕傲，音符像水流一樣流暢！你成功了，繼續加油！`,
        badgeColor: 'bg-sky-500/25 text-sky-200 border-sky-400',
      },
    ];
    let pick = Math.floor(Math.random() * fullSongPool.length);
    if (pick === lastPraiseIdx) pick = (pick + 1) % fullSongPool.length;
    lastPraiseIdx = pick;
    return fullSongPool[pick];
  }

  // Stages 1, 2, 3 or regular completion:
  // Features user's explicitly requested variants:
  // 1. 你成功了
  // 2. 繼續加油
  // 3. 你是最棒的
  // 4. 太厲害了 / 你做到了 / 彈得真好 / 完美過關 / 真了不起
  const generalPool: CelebrationPraise[] = [
    {
      tag: '你成功了！',
      icon: '🎉',
      speech: `你成功了！這段旋律彈得又準又動聽，手指動作非常靈巧，繼續加油喔！`,
      badgeColor: 'bg-emerald-500/25 text-emerald-200 border-emerald-400',
    },
    {
      tag: '繼續加油！',
      icon: '🔥',
      speech: `繼續加油！手型和節奏感保持得非常漂亮，你成功了，我們邁向下一關！`,
      badgeColor: 'bg-orange-500/25 text-orange-200 border-orange-400',
    },
    {
      tag: '你是最棒的！',
      icon: '👑',
      speech: `你是最棒的！節奏掌握得太出色了，聽你的琴聲就像在聽一場歡樂的音樂會！`,
      badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400',
    },
    {
      tag: '你成功了！',
      icon: '🚀',
      speech: `你成功了！${mentorName}為你喝彩！音符一個都沒有漏掉，你是最棒的，繼續加油！`,
      badgeColor: 'bg-emerald-500/25 text-emerald-200 border-emerald-400',
    },
    {
      tag: '繼續加油！',
      icon: '✨',
      speech: `繼續加油！手指越來越靈活、動作越來越順暢了，保持這個好手感，你是最棒的！`,
      badgeColor: 'bg-orange-500/25 text-orange-200 border-orange-400',
    },
    {
      tag: '你是最棒的！',
      icon: '⭐',
      speech: `你是最棒的！手指站得直挺挺，音色乾淨又清脆！你成功了，繼續加油！`,
      badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400',
    },
    {
      tag: '太厲害了！',
      icon: '👏',
      speech: `太厲害了！${mentorName}為你鼓掌！這段指法銜接得流暢自然，你成功了，繼續加油！`,
      badgeColor: 'bg-purple-500/25 text-purple-200 border-purple-400',
    },
    {
      tag: '你是最棒的！',
      icon: '🎵',
      speech: `你是最棒的！每一個音符都充滿了活力，表現極為出色，繼續加油挑戰下一關！`,
      badgeColor: 'bg-pink-500/25 text-pink-200 border-pink-400',
    },
    {
      tag: '你做到了！',
      icon: '💪',
      speech: `你做到了！專注聽琴、穩穩彈奏，表現超級出色！你成功了，繼續加油！`,
      badgeColor: 'bg-sky-500/25 text-sky-200 border-sky-400',
    },
    {
      tag: '你成功了！',
      icon: '🌈',
      speech: `你成功了！節奏感一級棒，指尖像在琴鍵上跳舞！你是最棒的，繼續加油！`,
      badgeColor: 'bg-yellow-500/25 text-yellow-200 border-yellow-400',
    },
  ];

  let pick = Math.floor(Math.random() * generalPool.length);
  if (pick === lastPraiseIdx) pick = (pick + 1) % generalPool.length;
  lastPraiseIdx = pick;
  return generalPool[pick];
}

export const ThematicCelebrationModal: React.FC<ThematicCelebrationModalProps> = ({
  lesson,
  activeMentor,
  starsAwarded,
  accuracyRate,
  bpm,
  stageNumber,
  stageTitle,
  onRetry,
  onProceed,
  proceedLabel,
}) => {
  const [selectedThemeKey, setSelectedThemeKey] = useState<CelebrationThemeKey>(() =>
    detectCelebrationTheme(lesson, activeMentor)
  );
  const speechFiredRef = useRef(false);
  const [praise] = useState(() =>
    getPraiseForCompletion(lesson.songName, starsAwarded, activeMentor, stageNumber)
  );

  const theme = THEME_REGISTRY[selectedThemeKey] || THEME_REGISTRY.forest_safari;

  // Trigger rich confetti burst on mount
  useEffect(() => {
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.55 },
      colors: theme.confettiColors,
    });

    const secondBurst = setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 90,
        origin: { y: 0.45 },
        colors: theme.confettiColors,
      });
    }, 450);

    return () => clearTimeout(secondBurst);
  }, []);

  // Cheerful custom speech guide encouragement with dynamic variations
  useEffect(() => {
    if (speechFiredRef.current) return;
    speechFiredRef.current = true;

    speechGuide.speak(praise.speech, {
      emotion: 'excited',
    });

    return () => {
      speechGuide.stop();
    };
  }, [praise.speech]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 select-none animate-fade-in text-white overflow-hidden">
      {/* Dynamic Floating Ambient Decor Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {theme.ambientDecor.map((symbol, idx) => (
          <span
            key={`decor-${idx}`}
            className="absolute text-2xl sm:text-3xl animate-pulse opacity-40 select-none"
            style={{
              top: `${15 + ((idx * 21) % 70)}%`,
              left: `${8 + ((idx * 27) % 84)}%`,
              animationDuration: `${2.5 + (idx % 3) * 0.8}s`,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>

      {/* Main Thematic Celebration Modal Card */}
      <div
        className={`relative w-full max-w-lg bg-gradient-to-b ${theme.bgGradient} rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-300/80 flex flex-col items-center text-center gap-3 sm:gap-4`}
      >
        {/* Top Thematic Theme Banner Pill */}
        <div className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] sm:text-xs font-black tracking-wider uppercase text-amber-200 shadow-xs flex items-center gap-1.5">
          <span>✨</span>
          <span>{theme.name}</span>
          <span>✨</span>
        </div>

        {/* ========================================================================= */}
        {/* Bespoke Thematic Animal Dance Celebration Component                        */}
        {/* ========================================================================= */}
        <div className="w-full">
          <ThemeTransitionCelebration
            lesson={lesson}
            themeKey={selectedThemeKey}
            activeMentor={activeMentor}
            stageNumber={stageNumber}
            compact={true}
          />
        </div>

        {/* Thematic Theme Exploration Switcher Bar */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-md pt-0.5">
          {(Object.keys(THEME_REGISTRY) as CelebrationThemeKey[]).map((key) => {
            const item = THEME_REGISTRY[key];
            const isSelected = selectedThemeKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedThemeKey(key)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                  isSelected
                    ? 'bg-amber-300 text-amber-950 shadow-xs scale-105 border border-white'
                    : 'bg-black/30 hover:bg-black/50 text-white/80 border border-white/10'
                }`}
                title={`切換到 ${item.name}`}
              >
                {item.badgeLabel}
              </button>
            );
          })}
        </div>

        {/* Title and Congratulations */}
        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white drop-shadow-md">
            {theme.title}
          </h3>
          <p className="text-xs sm:text-sm text-amber-200/95 font-bold px-2 leading-relaxed">
            {theme.celebrationQuote}
          </p>
        </div>

        {/* Dynamic Praise Voice Badge with Interactive Replay Button */}
        <div className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-lg w-full max-w-sm ${praise.badgeColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">{praise.icon}</span>
            <span className="text-base sm:text-lg font-black tracking-wide">{praise.tag}</span>
          </div>
          <button
            onClick={() => {
              speechGuide.stop();
              speechGuide.speak(praise.speech, { emotion: 'excited' });
            }}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black transition active:scale-95 flex items-center gap-1 text-white border border-white/30 shadow-xs"
            title="點擊再次朗讀語音讚賞"
          >
            <span>🔊</span>
            <span>重播</span>
          </button>
        </div>

        {/* Awarded Stars */}
        <div className="flex items-center gap-3 text-3xl sm:text-4xl text-amber-300 my-0.5">
          {[1, 2, 3].map((s) => (
            <span
              key={`star-${s}`}
              className={`transition-all duration-300 transform ${
                s <= starsAwarded
                  ? 'scale-125 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse'
                  : 'opacity-25 grayscale scale-95'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Practice Performance Metrics */}
        <div className="grid grid-cols-2 gap-2.5 w-full bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-slate-300 font-bold">辨音命中率</span>
            <span className="text-base sm:text-lg font-black text-emerald-300">
              {accuracyRate}% 🌟
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-300 font-bold">演奏節奏</span>
            <span className="text-base sm:text-lg font-black text-amber-300">
              {bpm} BPM ⏱️
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3 w-full pt-1">
          <button
            onClick={() => {
              speechGuide.stop();
              onRetry();
            }}
            className="flex-1 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm transition active:scale-95 border border-white/30"
          >
            再玩一次 🔄
          </button>

          <button
            onClick={() => {
              speechGuide.stop();
              onProceed();
            }}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition active:scale-95 border-2 border-white"
          >
            {proceedLabel} ➔
          </button>
        </div>
      </div>
    </div>
  );
};
