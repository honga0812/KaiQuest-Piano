import React, { useEffect, useState } from 'react';
import { SpeechEmotion } from '../../utils/speechGuide';
import { CharacterFriend } from '../../types/piano';
import { EliLionSvg, PicoDolphinSvg, KabutoBeetleSvg, RexDinoSvg, ExplorerKaiSvg } from './AnimalFriends';

interface TalkingEmotionFaceProps {
  isSpeaking: boolean;
  emotion?: SpeechEmotion;
  activeMentor?: CharacterFriend;
  currentText?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBubble?: boolean;
}

export const TalkingEmotionFace: React.FC<TalkingEmotionFaceProps> = ({
  isSpeaking,
  emotion = 'excited',
  activeMentor = 'eli_lion',
  currentText,
  className = '',
  size = 'md',
  showBubble = true,
}) => {
  const [mouthPhase, setMouthPhase] = useState(0);
  const [floatingEmoji, setFloatingEmoji] = useState('🎶');

  // Mouth animation while speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthPhase(0);
      return;
    }

    const mouthTimer = setInterval(() => {
      setMouthPhase((prev) => (prev + 1) % 4);
    }, 140);

    const emojiTimer = setInterval(() => {
      const emojiList =
        emotion === 'excited'
          ? ['✨', '🔥', '🎉', '🌟', '🎶']
          : emotion === 'encouraging'
          ? ['💖', '⭐', '👏', '🌈', '💪']
          : ['♪', '♫', '🌸', '✨', '🍯'];
      setFloatingEmoji(emojiList[Math.floor(Math.random() * emojiList.length)]);
    }, 700);

    return () => {
      clearInterval(mouthTimer);
      clearInterval(emojiTimer);
    };
  }, [isSpeaking, emotion]);

  const sizeDimensions = {
    sm: { box: 'w-16 h-16', avatar: 60, font: 'text-xs' },
    md: { box: 'w-22 h-22 sm:w-26 sm:h-26', avatar: 85, font: 'text-sm' },
    lg: { box: 'w-28 h-28 sm:w-32 sm:h-32', avatar: 110, font: 'text-base' },
  }[size];

  const mentorName =
    activeMentor === 'eli_lion'
      ? '艾力獅'
      : activeMentor === 'pico_dolphin'
      ? '海豚Pico'
      : activeMentor === 'kabuto_beetle'
      ? '甲蟲Kabuto'
      : activeMentor === 'rex_dino'
      ? '恐龍Rex'
      : '探險家Kai';

  const emotionBadge =
    emotion === 'excited'
      ? { label: '超熱情激勵', color: 'from-amber-500 to-orange-500', icon: '🥳' }
      : emotion === 'encouraging'
      ? { label: '溫暖加油', color: 'from-pink-500 to-rose-500', icon: '🥰' }
      : emotion === 'calm'
      ? { label: '細心叮嚀', color: 'from-emerald-500 to-teal-500', icon: '🌱' }
      : { label: '歡樂夥伴', color: 'from-blue-500 to-indigo-500', icon: '✨' };

  return (
    <div className={`relative flex items-center gap-3 select-none ${className}`}>
      {/* Mentor Head with Dynamic Talking Action & Floating Emojis */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Glow Aura when speaking */}
        {isSpeaking && (
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-yellow-300 blur-md opacity-70 animate-pulse pointer-events-none" />
        )}

        {/* Character Card Box with Talking Bob */}
        <div
          className={`relative ${sizeDimensions.box} rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-amber-300 shadow-lg flex items-center justify-center overflow-visible transition-transform duration-150 ${
            isSpeaking ? (mouthPhase % 2 === 0 ? '-translate-y-1 scale-105 rotate-1' : 'translate-y-0.5 scale-100 -rotate-1') : 'scale-100'
          }`}
        >
          {activeMentor === 'eli_lion' && <EliLionSvg size={sizeDimensions.avatar} />}
          {activeMentor === 'pico_dolphin' && <PicoDolphinSvg size={sizeDimensions.avatar} />}
          {activeMentor === 'kabuto_beetle' && <KabutoBeetleSvg size={sizeDimensions.avatar} />}
          {activeMentor === 'rex_dino' && <RexDinoSvg size={sizeDimensions.avatar} />}
          {activeMentor === 'kai' && <ExplorerKaiSvg size={sizeDimensions.avatar} mood={isSpeaking ? 'celebrating' : 'idle'} />}

          {/* Dynamic Talking Mouth Sync Overlay */}
          {isSpeaking && (
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
              <div
                className={`transition-all duration-100 bg-rose-600 border border-rose-950 rounded-full ${
                  mouthPhase === 0
                    ? 'w-3 h-3 scale-110'
                    : mouthPhase === 1
                    ? 'w-4 h-2 rounded-md'
                    : mouthPhase === 2
                    ? 'w-3.5 h-3.5 scale-125'
                    : 'w-3 h-1.5'
                }`}
              />
            </div>
          )}

          {/* Floating Emotion Sparkle Emitted from Speaking */}
          {isSpeaking && (
            <div className="absolute -top-3 -right-2 text-2xl sm:text-3xl animate-bounce pointer-events-none drop-shadow-md">
              {floatingEmoji}
            </div>
          )}
        </div>

        {/* Live Audio Visualizer Equalizer Waves underneath */}
        {isSpeaking && (
          <div className="absolute -bottom-2.5 flex items-center gap-0.5 bg-black/60 px-2 py-0.5 rounded-full border border-amber-300/40">
            <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-pulse" />
            <span className="w-1 h-4 bg-yellow-300 rounded-full animate-bounce" />
            <span className="w-1 h-3 bg-pink-400 rounded-full animate-pulse" />
            <span className="w-1 h-1.5 bg-sky-400 rounded-full animate-bounce" />
          </div>
        )}
      </div>

      {/* Speech Bubble with Emotive Copy & Voice Indicator */}
      {showBubble && currentText && (
        <div className="relative flex-1 bg-white/95 text-slate-900 rounded-2xl p-2.5 sm:p-3.5 shadow-xl border-2 border-amber-300 flex flex-col gap-1 text-left min-w-[160px]">
          {/* Header row: Mentor Tag & Emotion Badge */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-1">
            <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1">
              <span>{activeMentor === 'eli_lion' ? '🦁' : activeMentor === 'pico_dolphin' ? '🐬' : activeMentor === 'kabuto_beetle' ? '🪲' : activeMentor === 'rex_dino' ? '🦖' : '🧑‍🌾'}</span>
              <span>{mentorName} 導師</span>
            </span>

            {/* Speaking Status Pill */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-xs bg-gradient-to-r ${emotionBadge.color} flex items-center gap-1`}
            >
              <span>{emotionBadge.icon}</span>
              <span>{isSpeaking ? '正在為你說話中…' : emotionBadge.label}</span>
            </span>
          </div>

          {/* Current Spoken Text */}
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-snug tracking-wide">
            {currentText}
          </p>
        </div>
      )}
    </div>
  );
};
