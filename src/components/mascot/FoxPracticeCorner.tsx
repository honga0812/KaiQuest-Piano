import React, { useState, useEffect } from 'react';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { ExplorerKaiSvg, EliLionSvg, KabutoBeetleSvg, PicoDolphinSvg, RexDinoSvg, CharacterFriend } from './AnimalFriends';

export type PracticePose = 'dancing' | 'nodding' | 'playful_cheeky' | 'listening' | 'celebrating';

interface FoxPracticeCornerProps {
  // Practice metrics
  currentNoteIndex: number;
  totalNotes: number;
  comboStreak: number;
  consecutiveErrors: number;
  isNoteCorrect: boolean;
  isNoteWobbly: boolean;
  accuracyPercent?: number; // 0 - 100
  // Speech text
  customMessage?: string;
  className?: string;
}

export const FoxPracticeCorner: React.FC<FoxPracticeCornerProps> = ({
  currentNoteIndex,
  totalNotes,
  comboStreak,
  consecutiveErrors,
  isNoteCorrect,
  isNoteWobbly,
  accuracyPercent = 100,
  customMessage,
  className = '',
}) => {
  const [pose, setPose] = useState<PracticePose>('listening');
  const [bubbleText, setBubbleText] = useState('探險家 Kai 正在拿著放大鏡仔細聽你彈琴喔！');
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeFriend, setActiveFriend] = useState<CharacterFriend>('eli_lion');

  // Completion calculation
  const completionPercent = totalNotes > 0 ? Math.min(100, Math.round((currentNoteIndex / totalNotes) * 100)) : 0;

  // React dynamically to practice events
  useEffect(() => {
    if (completionPercent >= 100) {
      setPose('celebrating');
      const finishCheers = [
        '你成功了！全曲完成！你真的是小小鋼琴家！🎉',
        '繼續加油！全曲順利彈完，表現太精彩了！⭐',
        '你是最棒的！全曲演奏完美達成！👑',
      ];
      setBubbleText(finishCheers[Math.floor(Math.random() * finishCheers.length)]);
      return;
    }

    if (isNoteCorrect) {
      setPose('dancing');
      const cheers = [
        '好耶！音準超棒！Kai 與動物夥伴為你歡呼～🎶',
        '漂亮！手指像跳躍的精靈，節奏太順暢了！✨',
        '連續彈對！獅子 Eli 興奮地搖著尾巴！🦁',
        '甲蟲 Kabuto 與小恐龍 Rex 也為你拍手！🌟',
      ];
      setBubbleText(cheers[Math.floor(Math.random() * cheers.length)]);
      const timer = setTimeout(() => {
        setPose('listening');
      }, 1200);
      return () => clearTimeout(timer);
    }

    if (isNoteWobbly || consecutiveErrors > 0) {
      setPose('playful_cheeky');
      if (consecutiveErrors >= 3) {
        setBubbleText('沒關係！調皮的音符躲在隔壁鍵，深呼吸我們再試一次！🧭');
      } else {
        setBubbleText('差一點點喔！探險家 Kai 眨個眼，我們再抓一次！✨');
      }
      const timer = setTimeout(() => {
        setPose('nodding');
      }, 1400);
      return () => clearTimeout(timer);
    }

    if (currentNoteIndex > 0) {
      setPose('nodding');
      if (comboStreak >= 5) {
        setBubbleText(`🔥 ${comboStreak} 連擊！手感發燙中！`);
      } else {
        setBubbleText('專注聆聽琴音～每個手指拱門都站穩囉！♪');
      }
    }
  }, [isNoteCorrect, isNoteWobbly, consecutiveErrors, currentNoteIndex, comboStreak, completionPercent]);

  // Click to trigger cheerful chime
  const handlePet = () => {
    pianoSynth.playCorrectHitSound();
    setPose('dancing');
    const pets = [
      '哈哈好癢喔！探險家 Kai 準備好跟你合奏下一曲了！🎵',
      '謝謝你！動物夥伴們最喜歡聽你練琴了！💖',
      '跟著音樂節奏，我們的鋼琴大冒險繼續前進！🚀',
    ];
    setBubbleText(pets[Math.floor(Math.random() * pets.length)]);
    setTimeout(() => setPose('listening'), 1200);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black p-3 rounded-2xl shadow-xl border-2 border-white flex items-center gap-2 transition hover:scale-105 active:scale-95 text-xs animate-bounce"
        title="展開 Kai 探險家加油角"
      >
        <span className="text-xl">🧭</span>
        <span>展開 Kai 加油小島</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="探險家 Kai 與動物夥伴加油角"
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end select-none pointer-events-auto ${className}`}
    >
      <div className="relative bg-white/95 backdrop-blur-md border-3 border-amber-400 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 max-w-xs md:max-w-sm text-left">
        {/* Top Header with Minimize & Companion Switcher */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-amber-950">
              探險隊加油站 · 進度 {completionPercent}%
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-bold transition"
              title="收合小島"
            >
              ⤓
            </button>
          </div>
        </div>

        {/* Companion Animals Switcher Tabs */}
        <div className="flex items-center justify-between gap-1 bg-amber-50 p-1 rounded-2xl border border-amber-200 text-[10px] font-black">
          <button
            onClick={() => setActiveFriend('eli_lion')}
            className={`flex-1 py-1 px-1.5 rounded-xl transition ${
              activeFriend === 'eli_lion' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🦁 獅子
          </button>
          <button
            onClick={() => setActiveFriend('kabuto_beetle')}
            className={`flex-1 py-1 px-1.5 rounded-xl transition ${
              activeFriend === 'kabuto_beetle' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🪲 甲蟲
          </button>
          <button
            onClick={() => setActiveFriend('pico_dolphin')}
            className={`flex-1 py-1 px-1.5 rounded-xl transition ${
              activeFriend === 'pico_dolphin' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🐬 海豚
          </button>
          <button
            onClick={() => setActiveFriend('rex_dino')}
            className={`flex-1 py-1 px-1.5 rounded-xl transition ${
              activeFriend === 'rex_dino' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🦖 恐龍
          </button>
        </div>

        {/* Comic Speech Bubble */}
        <div className="relative bg-amber-50 text-slate-900 rounded-2xl p-2.5 border border-amber-300 text-xs font-bold leading-relaxed text-left">
          {customMessage || bubbleText}
        </div>

        {/* Interactive Character Pair Stage: Kai + Selected Animal Companion */}
        <div
          onClick={handlePet}
          className="cursor-pointer group flex items-end justify-center gap-2 p-1 rounded-2xl hover:bg-amber-50/70 transition"
          title="點擊跟探險家 Kai 與動物夥伴打招呼！"
        >
          {/* Main Boy Explorer Kai */}
          <div className={`transition-transform duration-200 ${
            pose === 'dancing' ? 'animate-bounce' : 'group-hover:scale-105'
          }`}>
            <ExplorerKaiSvg size={110} mood={pose === 'dancing' ? 'celebrating' : 'listening'} />
          </div>

          {/* Dynamic Active Animal Friend from Storyboard */}
          <div className="transition-transform duration-200 group-hover:scale-110 mb-1">
            {activeFriend === 'eli_lion' && <EliLionSvg size={75} mood="happy" />}
            {activeFriend === 'kabuto_beetle' && <KabutoBeetleSvg size={60} />}
            {activeFriend === 'pico_dolphin' && <PicoDolphinSvg size={68} />}
            {activeFriend === 'rex_dino' && <RexDinoSvg size={68} />}
          </div>
        </div>

        {/* Bottom Tip */}
        <div className="text-[10px] text-slate-500 text-center font-medium">
          👆 點擊角色打招呼 · 探索發光小島
        </div>
      </div>
    </aside>
  );
};

export const ExplorerPracticeCorner = FoxPracticeCorner;
