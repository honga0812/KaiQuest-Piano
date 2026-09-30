import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { ExplorerKaiSvg } from '../mascot/AnimalFriends';
import { MUSIC_EXPLORER_BADGE } from '../../types/piano';

interface MusicExplorerCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToBadges?: () => void;
}

export const MusicExplorerCelebrationModal: React.FC<MusicExplorerCelebrationModalProps> = ({
  isOpen,
  onClose,
  onGoToBadges,
}) => {
  const triggerFireworks = () => {
    pianoSynth.playFanfare();

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 40, spread: 360, ticks: 70, zIndex: 3000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);

      // Left burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
      // Right burst
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 },
        colors: ['#FBBF24', '#34D399', '#60A5FA', '#F43F5E', '#A855F7'],
      });
    }, 250);
  };

  useEffect(() => {
    if (isOpen) {
      triggerFireworks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in select-none text-left"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-amber-50 rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-400 flex flex-col items-center text-center gap-5 text-slate-800 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center font-black text-base transition active:scale-95"
          title="關閉"
        >
          ✕
        </button>

        {/* Mascot + Glowing Badge Avatar */}
        <div className="relative mt-2 flex flex-col items-center">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 ring-6 ring-amber-300 shadow-2xl shadow-amber-400/50 flex items-center justify-center text-6xl animate-bounce">
            {MUSIC_EXPLORER_BADGE.icon}
          </div>
          <div className="absolute -bottom-3 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-xs font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider border-2 border-white">
            ★ 特別紀念勳章 ★
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 font-mono">
            3-Day Practice Milestone Unlocked
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-950">
            🎉 恭喜榮獲「{MUSIC_EXPLORER_BADGE.title}」！
          </h2>
          <p className="text-sm text-slate-700 font-bold max-w-md leading-relaxed mt-1">
            太了不起了！你連續三天開啟 App 並每天堅持練琴超過 5 分鐘！這枚專屬紀念勳章已永久刻印在你的榮譽殿堂中！
          </p>
        </div>

        {/* 3-Day Milestone Progress Cards */}
        <div className="w-full bg-amber-100/70 border-2 border-amber-300 rounded-2xl p-3.5 flex items-center justify-around gap-2 text-xs">
          <div className="flex flex-col items-center gap-1">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow">
              ✓
            </span>
            <span className="font-black text-slate-800">第 1 天 5分鐘</span>
          </div>
          <span className="text-amber-500 font-black text-base">➔</span>
          <div className="flex flex-col items-center gap-1">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow">
              ✓
            </span>
            <span className="font-black text-slate-800">第 2 天 5分鐘</span>
          </div>
          <span className="text-amber-500 font-black text-base">➔</span>
          <div className="flex flex-col items-center gap-1">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow animate-pulse">
              ✓
            </span>
            <span className="font-black text-emerald-800 font-bold">第 3 天 達標！</span>
          </div>
        </div>

        {/* Cheering Mascot Kai */}
        <div className="flex items-center gap-3 bg-white/90 border border-amber-200 rounded-2xl p-3 w-full text-left">
          <div className="shrink-0">
            <ExplorerKaiSvg size={48} mood="celebrating" />
          </div>
          <div className="text-xs text-slate-700 leading-snug">
            <strong className="text-amber-900 block font-black mb-0.5">探險家 Kai 導師的話：</strong>
            「持之以恆是音樂路上最珍貴的寶藏！戴上這枚音樂探索家指南針，繼續向更高難度的樂曲航行吧！」
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-1">
          {onGoToBadges && (
            <button
              onClick={() => {
                onClose();
                onGoToBadges();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black rounded-2xl text-sm shadow-md transition active:scale-95 border-2 border-white flex items-center justify-center gap-2"
            >
              <span>🏆</span>
              <span>前往榮譽殿堂查看</span>
            </button>
          )}

          <button
            onClick={triggerFireworks}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black rounded-2xl text-sm border-2 border-indigo-200 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>🎆</span>
            <span>再放一次煙火</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-sm shadow transition active:scale-95"
          >
            繼續練琴
          </button>
        </div>
      </div>
    </div>
  );
};
