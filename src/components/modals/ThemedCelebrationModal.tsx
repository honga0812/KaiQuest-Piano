import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lesson, AgeBand, CharacterFriend } from '../../types/piano';
import { EliLionSvg, PicoDolphinSvg, KabutoBeetleSvg, RexDinoSvg } from '../mascot/AnimalFriends';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { speechGuide } from '../../utils/speechGuide';

interface ThemedCelebrationModalProps {
  isOpen: boolean;
  stars: number;
  accuracyRate: number;
  bpm: number;
  lesson: Lesson;
  challengeTitle: string;
  ageBand: AgeBand;
  activeMentor: CharacterFriend;
  onNextChallenge?: () => void;
  onReplay: () => void;
  onBackToMap: () => void;
}

export const ThemedCelebrationModal: React.FC<ThemedCelebrationModalProps> = ({
  isOpen,
  stars,
  accuracyRate,
  bpm,
  lesson,
  challengeTitle,
  ageBand,
  activeMentor,
  onNextChallenge,
  onReplay,
  onBackToMap,
}) => {
  const [revealedStars, setRevealedStars] = useState(0);
  const [danceBeat, setDanceBeat] = useState<'left' | 'right'>('left');

  useEffect(() => {
    if (!isOpen) {
      setRevealedStars(0);
      return;
    }

    // Sequence star lighting with sound
    const t1 = setTimeout(() => {
      setRevealedStars(1);
      pianoSynth.playCorrectHitSound();
    }, 400);

    const t2 = setTimeout(() => {
      if (stars >= 2) {
        setRevealedStars(2);
        pianoSynth.playCorrectHitSound();
      }
    }, 900);

    const t3 = setTimeout(() => {
      if (stars >= 3) {
        setRevealedStars(3);
        pianoSynth.playFanfare();
      }
    }, 1400);

    // Multi-burst colorful confetti
    const confettiColors =
      ageBand === 4
        ? ['#FBBF24', '#38BDF8', '#34D399', '#F43F5E']
        : ageBand === 5
        ? ['#10B981', '#34D399', '#F59E0B', '#A855F7']
        : ageBand === 6
        ? ['#06B6D4', '#3B82F6', '#C084FC', '#FDE047']
        : ['#E11D48', '#F59E0B', '#818CF8', '#FFFFFF'];

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.5 },
      colors: confettiColors,
    });

    // Dynamic dance rhythm toggle
    const danceInterval = setInterval(() => {
      setDanceBeat((prev) => (prev === 'left' ? 'right' : 'left'));
    }, 380);

    // Dynamic voice celebration guide with varied praises requested by user
    const praiseOpeners = [
      `你成功了！第 ${lesson.lessonNumber} 課《${lesson.songName}》挑戰成功！獲得了 ${stars} 顆星星，手指彈得真靈巧，繼續加油！`,
      `繼續加油！第 ${lesson.lessonNumber} 課《${lesson.songName}》順利通關！獲得了 ${stars} 顆星星，手感節奏越來越棒了！`,
      `你是最棒的！第 ${lesson.lessonNumber} 課《${lesson.songName}》演奏得太動聽了！獲得了 ${stars} 顆星星，夥伴們都在為你喝彩！`,
      `你成功了！第 ${lesson.lessonNumber} 課《${lesson.songName}》大獲全勝！獲得了 ${stars} 顆星星，你是最棒的鋼琴小能手，繼續加油！`,
      `太厲害了！你做到了！第 ${lesson.lessonNumber} 課《${lesson.songName}》獲得了 ${stars} 顆星星，繼續加油邁向下一關！`,
    ];
    const prompt = praiseOpeners[Math.floor(Math.random() * praiseOpeners.length)];
    speechGuide.speak(prompt, { emotion: 'celebrating' });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(danceInterval);
    };
  }, [isOpen, stars, lesson, ageBand]);

  if (!isOpen) return null;

  // Age Theme Customizations
  const themeDetails = {
    4: {
      title: '🏖️ 陽光海灘沙灘派對慶典',
      tagline: '海豚海浪後空翻 · 恐龍草裙夏威夷舞',
      bgGrad: 'from-amber-400 via-orange-400 to-sky-400',
      cardBg: 'bg-gradient-to-b from-amber-50 to-sky-50',
      borderColor: 'border-amber-400',
      danceAction: 'Rex 恐龍踩著衝浪板跳著歡樂呼拉舞 🏄‍♂️🦖',
      badgeTitle: '陽光金沙小琴童',
    },
    5: {
      title: '🌲 翡翠巨石魔法森林狂歡',
      tagline: '遠古巨石陣共鳴 · 螢火蟲群星飛舞',
      bgGrad: 'from-emerald-500 via-teal-500 to-amber-400',
      cardBg: 'bg-gradient-to-b from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-500',
      danceAction: '獅子 Eli 戴著精靈王冠打著節奏手鼓 🦁🥁',
      badgeTitle: '巨石秘境探索家',
    },
    6: {
      title: '🌊 亞特蘭提斯水下迪斯可',
      tagline: '夜光水母炫彩霓虹 · 海盜寶箱音符噴泉',
      bgGrad: 'from-cyan-500 via-blue-600 to-indigo-600',
      cardBg: 'bg-gradient-to-b from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-400',
      danceAction: '海豚 Pico 帶領水母樂隊在發光珊瑚中跳水下迪斯可 🪼🪩🐬',
      badgeTitle: '深海流暢演奏家',
    },
    7: {
      title: '⚡ 蒼穹雷霆雪峰大師加冕',
      tagline: '萬丈峭壁極光之巔 · 金雕勝利搖滾之舞',
      bgGrad: 'from-rose-600 via-purple-600 to-amber-400',
      cardBg: 'bg-gradient-to-b from-slate-50 to-purple-50',
      borderColor: 'border-rose-400',
      danceAction: '小獅子與金雕在雪峰之巔戴著大師金牌跳勝利搖滾舞 🦅🦁🎸',
      badgeTitle: '皇家雲巔大師',
    },
  }[ageBand] || {
    title: '🎉 探險家勝利大慶典',
    tagline: '琴聲閃閃發光 · 榮譽徽章點亮',
    bgGrad: 'from-amber-400 to-orange-400',
    cardBg: 'bg-white',
    borderColor: 'border-amber-400',
    danceAction: '動物夥伴歡呼慶祝！',
    badgeTitle: '音樂探險小勇士',
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in text-slate-900 select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-lg ${themeDetails.cardBg} rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl border-4 ${themeDetails.borderColor} flex flex-col items-center text-center gap-4 animate-scale-up my-auto`}
      >
        {/* Top Floating Badge Tag */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 px-4 py-1 rounded-full text-xs font-black shadow-md border border-white">
          <span>✨</span>
          <span>{themeDetails.title}</span>
          <span>✨</span>
        </div>

        {/* Dedicated Animal Dancing Stage with Theme Animations */}
        <div className="relative w-full h-36 sm:h-40 rounded-2xl bg-white/80 border-2 border-amber-200/90 shadow-inner flex items-center justify-center overflow-hidden">
          {/* Background Stage Fireworks & Sparkles */}
          <div className="absolute inset-0 bg-radial from-amber-300/30 via-transparent to-transparent animate-pulse pointer-events-none" />

          {/* Dancing Animals Array */}
          <div className="relative z-10 flex items-end justify-center gap-4 sm:gap-6 pb-2">
            {/* Dancer 1: Rex Dino with swaying dancing movements */}
            <div
              className={`transition-transform duration-300 transform ${
                danceBeat === 'left' ? '-rotate-12 -translate-y-2' : 'rotate-12 translate-y-0'
              }`}
            >
              <RexDinoSvg size={66} mood="celebrating" />
            </div>

            {/* Dancer 2: Pico Dolphin jumping or Eli Lion drumming */}
            <div
              className={`transition-transform duration-300 transform scale-110 ${
                danceBeat === 'left' ? 'rotate-8 translate-y-0' : '-rotate-8 -translate-y-3'
              }`}
            >
              {activeMentor === 'pico_dolphin' ? (
                <PicoDolphinSvg size={74} />
              ) : activeMentor === 'kabuto_beetle' ? (
                <KabutoBeetleSvg size={70} />
              ) : (
                <EliLionSvg size={78} mood="celebrating" />
              )}
            </div>

            {/* Dancer 3: Mascot Friend */}
            <div
              className={`transition-transform duration-300 transform ${
                danceBeat === 'left' ? 'rotate-12 translate-y-0' : '-rotate-12 -translate-y-2'
              }`}
            >
              {activeMentor === 'pico_dolphin' ? (
                <EliLionSvg size={66} mood="happy" />
              ) : (
                <PicoDolphinSvg size={66} />
              )}
            </div>
          </div>

          {/* Floating musical notes */}
          <span className="absolute top-2 left-6 text-2xl animate-bounce">🎶</span>
          <span className="absolute top-3 right-8 text-xl animate-pulse">⭐</span>
          <span className="absolute bottom-2 right-4 text-2xl animate-bounce">🎵</span>
        </div>

        {/* Thematic Dance Action Label */}
        <div className="bg-amber-100/80 border border-amber-300/80 rounded-xl px-3 py-1.5 text-xs text-amber-950 font-black">
          {themeDetails.danceAction}
        </div>

        {/* Title & Song Name */}
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            🎉 恭喜通關！《{lesson.songName}》
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-bold">
            {challengeTitle} · 完美演奏！
          </p>
        </div>

        {/* Stars Display with sequenced pop-in animation */}
        <div className="flex items-center justify-center gap-3 my-1">
          {[1, 2, 3].map((s) => (
            <div
              key={`star-${s}`}
              className={`transition-all duration-500 transform ${
                s <= revealedStars
                  ? 'scale-125 text-amber-400 drop-shadow-[0_4px_12px_rgba(251,191,36,0.9)] animate-bounce'
                  : 'scale-90 text-slate-300 opacity-40'
              } text-4xl sm:text-5xl font-black`}
            >
              ★
            </div>
          ))}
        </div>

        {/* Performance Metrics Stats Card */}
        <div className="grid grid-cols-2 gap-2.5 w-full bg-white/90 p-3 rounded-2xl border-2 border-amber-200 text-xs">
          <div className="flex flex-col items-center bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            <span className="text-slate-500 font-bold text-[10px]">🎯 辨音準確度</span>
            <span className="text-base sm:text-lg font-black text-emerald-600">
              {accuracyRate}%
            </span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 p-2 rounded-xl border border-blue-200">
            <span className="text-slate-500 font-bold text-[10px]">⏱️ 演奏速度</span>
            <span className="text-base sm:text-lg font-black text-blue-600">
              {bpm} BPM
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-1">
          <button
            onClick={onReplay}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm transition active:scale-95 border border-slate-300 shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>↺</span>
            <span>再挑戰一次</span>
          </button>

          {onNextChallenge ? (
            <button
              onClick={onNextChallenge}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-95 border-2 border-white flex items-center justify-center gap-1.5"
            >
              <span>🚀 前往下一關</span>
              <span>➔</span>
            </button>
          ) : (
            <button
              onClick={onBackToMap}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 border-2 border-white flex items-center justify-center gap-1.5"
            >
              <span>🗺️ 返回地圖領取徽章</span>
              <span>➔</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
