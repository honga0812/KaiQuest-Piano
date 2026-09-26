import React, { useState, useEffect } from 'react';
import { pianoSynth } from '../../audio/pianoSynthesizer';

export type FoxPose = 'dancing' | 'nodding' | 'playful_cheeky' | 'listening' | 'celebrating';

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
  const [pose, setPose] = useState<FoxPose>('listening');
  const [bubbleText, setBubbleText] = useState('小狐狸 Kai 正在仔細聽你彈琴喔！');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTickled, setIsTickled] = useState(false);

  // Completion calculation
  const completionPercent = totalNotes > 0 ? Math.min(100, Math.round((currentNoteIndex / totalNotes) * 100)) : 0;

  // React dynamically to practice events
  useEffect(() => {
    if (completionPercent >= 100) {
      setPose('celebrating');
      setBubbleText('太棒了！全曲完成！你真的是小小鋼琴家！🎉');
      return;
    }

    if (isNoteCorrect) {
      setPose('dancing');
      const cheers = [
        '好耶！音準超棒！跳個歡慶舞～🎶',
        '漂亮！手指像跳躍的精靈！✨',
        '連續彈對！節奏太順了！💃',
        '哇！完美的音符！Kai 為你歡呼！🌟',
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
        setBubbleText('嘿嘿～調皮的音符躲在隔壁鍵，深呼吸我們再試一次！😜');
      } else {
        setBubbleText('差一點點喔！小狐狸 Kai 眨個眼，我們再抓一次！😜');
      }
      const timer = setTimeout(() => {
        setPose('nodding');
      }, 1400);
      return () => clearTimeout(timer);
    }

    // Default active practice: encouraging nodding
    if (currentNoteIndex > 0) {
      setPose('nodding');
      if (comboStreak >= 5) {
        setBubbleText(`🔥 ${comboStreak} 連擊！手感發燙中！`);
      } else {
        setBubbleText('點點頭～穩穩彈，保持這個好節奏！');
      }
    } else {
      setPose('listening');
      setBubbleText('準備好了嗎？按下第一個發光琴鍵出發！');
    }
  }, [isNoteCorrect, isNoteWobbly, consecutiveErrors, currentNoteIndex, comboStreak, completionPercent]);

  // Click on Fox to trigger playful giggle & spin
  const handleFoxClick = () => {
    setIsTickled(true);
    pianoSynth.playCelebrationChime();
    setBubbleText('哈哈！好癢呀～小琴童加油，彈得真好聽！💕');
    setTimeout(() => setIsTickled(false), 800);
  };

  // Accuracy status label
  const getAccuracyBadge = () => {
    if (accuracyPercent >= 90) return { label: '🌟 完美手感', color: 'text-amber-400 bg-amber-950/80 border-amber-400/40' };
    if (accuracyPercent >= 75) return { label: '✨ 節奏優秀', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-400/40' };
    return { label: '🌱 努力練習中', color: 'text-blue-400 bg-blue-950/80 border-blue-400/40' };
  };

  const accBadge = getAccuracyBadge();

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 px-3.5 py-2 rounded-full shadow-2xl border-2 border-white/80 transition-all transform hover:scale-105 active:scale-95 animate-bounce ${className}`}
        title="展開狐狸助手"
      >
        <span className="text-xl">🦊</span>
        <span className="text-xs font-black">狐狸 Kai ({completionPercent}%)</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="狐狸伴學助手"
      className={`fixed bottom-3 right-3 z-40 flex flex-col items-end pointer-events-auto select-none max-w-[280px] sm:max-w-[320px] transition-all duration-300 ${className}`}
    >
      {/* Dynamic Speech Bubble */}
      <div className="relative mb-2 mr-2 bg-slate-900/95 border-2 border-amber-400/90 text-white px-3.5 py-2 rounded-2xl rounded-br-none shadow-2xl backdrop-blur-md text-xs font-bold leading-snug flex flex-col gap-1 animate-fade-in">
        {/* Top Mini Header: Real-time Accuracy & Minimize toggle */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 text-[10px]">
          <span className={`px-2 py-0.5 rounded-full border font-black ${accBadge.color}`}>
            {accBadge.label} {accuracyPercent}%
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>進度 {completionPercent}%</span>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition"
              title="縮小"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dynamic Bubble Content */}
        <p className="text-amber-100 text-xs font-extrabold mt-0.5">
          {customMessage || bubbleText}
        </p>

        {/* Tiny Speech Bubble Pointer Triangle */}
        <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400" />
      </div>

      {/* Interactive Fox Character Model */}
      <div
        onClick={handleFoxClick}
        className="relative group cursor-pointer flex items-center justify-center p-1"
        title="點擊跟小狐狸 Kai 互動！"
      >
        {/* Glow Aura when Dancing or High Combo */}
        {(pose === 'dancing' || comboStreak >= 5) && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-orange-400/40 to-yellow-300/40 blur-xl animate-pulse" />
        )}

        {/* SVG Fox Character Container with Dynamic Pose Animations */}
        <div
          className={`w-28 h-28 sm:w-32 sm:h-32 transition-all duration-200 transform ${
            isTickled
              ? 'scale-125 rotate-12'
              : pose === 'dancing'
              ? 'animate-bounce scale-110 rotate-3'
              : pose === 'nodding'
              ? 'hover:scale-105'
              : pose === 'playful_cheeky'
              ? '-rotate-6 scale-105'
              : 'hover:scale-105'
          }`}
        >
          {/* Floating musical notes during dance */}
          {pose === 'dancing' && (
            <div className="absolute -top-3 -left-2 text-xl animate-ping pointer-events-none">
              🎵
            </div>
          )}
          {pose === 'dancing' && (
            <div className="absolute -top-4 -right-1 text-lg animate-bounce pointer-events-none">
              ✨
            </div>
          )}

          {/* SVG Vector Fox Character */}
          <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="foxOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="60%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
              <linearGradient id="foxEarPink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FECDD3" />
                <stop offset="100%" stopColor="#FDA4AF" />
              </linearGradient>
              <linearGradient id="goldCrownFox" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>

            {/* Dynamic Animated Fluffy Fox Tail (Wags when dancing or cheeky) */}
            <g
              transform="translate(105, 85)"
              className={pose === 'dancing' ? 'animate-wiggle' : ''}
            >
              <path
                d="M 0,0 C 25,-10 35,20 15,35 C -5,45 -10,25 0,0 Z"
                fill="url(#foxOrange)"
                stroke="#C2410C"
                strokeWidth="1.5"
              />
              {/* White tail tip */}
              <path
                d="M 12,24 C 20,18 28,26 15,35 C 5,42 6,32 12,24 Z"
                fill="#FFFFFF"
              />
            </g>

            {/* Body */}
            <ellipse cx="70" cy="98" rx="34" ry="28" fill="url(#foxOrange)" />
            {/* White chest bib */}
            <ellipse cx="70" cy="102" rx="19" ry="17" fill="#FFFFFF" />

            {/* Red Bandana Scarf */}
            <path
              d="M 45,82 Q 70,96 95,82 L 91,92 Q 70,105 49,92 Z"
              fill={comboStreak >= 5 ? '#F59E0B' : '#EF4444'}
            />
            <polygon
              points="67,92 70,102 73,92"
              fill={comboStreak >= 5 ? '#D97706' : '#DC2626'}
            />

            {/* Dynamic Arms / Paws based on Pose */}
            {pose === 'dancing' ? (
              // Paws raised joyfully high in celebration dance!
              <g className="animate-wiggle">
                <ellipse cx="40" cy="74" rx="8" ry="12" transform="rotate(-35 40 74)" fill="url(#foxOrange)" />
                <circle cx="34" cy="66" r="6" fill="#FFFFFF" />
                <ellipse cx="100" cy="74" rx="8" ry="12" transform="rotate(35 100 74)" fill="url(#foxOrange)" />
                <circle cx="106" cy="66" r="6" fill="#FFFFFF" />
              </g>
            ) : pose === 'playful_cheeky' ? (
              // Left paw scratching head playfully!
              <g>
                <ellipse cx="42" cy="52" rx="7" ry="13" transform="rotate(-65 42 52)" fill="url(#foxOrange)" />
                <circle cx="38" cy="44" r="6" fill="#FFFFFF" />
                {/* Right paw on hip */}
                <ellipse cx="98" cy="92" rx="8" ry="10" transform="rotate(15 98 92)" fill="url(#foxOrange)" />
                <circle cx="102" cy="92" r="5" fill="#FFFFFF" />
              </g>
            ) : (
              // Restful paws in front
              <g>
                <ellipse cx="50" cy="95" rx="7" ry="9" fill="url(#foxOrange)" />
                <circle cx="50" cy="99" r="5.5" fill="#FFFFFF" />
                <ellipse cx="90" cy="95" rx="7" ry="9" fill="url(#foxOrange)" />
                <circle cx="90" cy="99" r="5.5" fill="#FFFFFF" />
              </g>
            )}

            {/* Head Group with Nodding Animation */}
            <g className={pose === 'nodding' ? 'animate-bounce' : ''}>
              {/* Ears */}
              <polygon points="42,48 30,14 62,32" fill="url(#foxOrange)" />
              <polygon points="43,45 35,21 58,34" fill="url(#foxEarPink)" />
              <polygon points="98,48 110,14 78,32" fill="url(#foxOrange)" />
              <polygon points="97,45 105,21 82,34" fill="url(#foxEarPink)" />

              {/* Head Base */}
              <ellipse cx="70" cy="58" rx="38" ry="32" fill="url(#foxOrange)" />

              {/* White Fluffy Cheeks */}
              <path d="M 34,60 Q 52,78 64,68 Q 44,82 36,73 Z" fill="#FFFFFF" />
              <path d="M 106,60 Q 88,78 76,68 Q 96,82 104,73 Z" fill="#FFFFFF" />

              {/* Little Maestro Crown when completion >= 100% or Combo >= 10 */}
              {(completionPercent >= 100 || comboStreak >= 10) && (
                <g transform="translate(48, -4)">
                  <polygon
                    points="0,22 10,6 22,15 34,6 44,22"
                    fill="url(#goldCrownFox)"
                    stroke="#F59E0B"
                    strokeWidth="2"
                  />
                  <circle cx="10" cy="6" r="3" fill="#EF4444" />
                  <circle cx="22" cy="15" r="3.5" fill="#3B82F6" />
                  <circle cx="34" cy="6" r="3" fill="#10B981" />
                </g>
              )}

              {/* Dynamic Eyes based on Current Pose */}
              {pose === 'dancing' || completionPercent >= 100 ? (
                // Super joyful curved eyes ^ ^
                <g stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none">
                  <path d="M 50,52 Q 58,42 66,52" />
                  <path d="M 74,52 Q 82,42 90,52" />
                </g>
              ) : pose === 'playful_cheeky' ? (
                // Playful wink on left eye (😉) & wide sparkling open right eye!
                <g>
                  {/* Left Eye: Cute Winking Arc */}
                  <path d="M 48,53 Q 56,47 64,53" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  {/* Right Eye: Big curious open eye with shine */}
                  <ellipse cx="82" cy="51" rx="7" ry="8.5" fill="#0F172A" />
                  <circle cx="80" cy="48" r="3" fill="#FFFFFF" />
                  <circle cx="84" cy="54" r="1.5" fill="#FFFFFF" />
                </g>
              ) : (
                // Encouraging friendly round eyes with warm sparkles
                <g fill="#0F172A">
                  <ellipse cx="56" cy="52" rx="6.5" ry="8" />
                  <circle cx="54" cy="49" r="2.8" fill="#FFFFFF" />
                  <circle cx="58" cy="54" r="1.4" fill="#FFFFFF" />
                  <ellipse cx="84" cy="52" rx="6.5" ry="8" />
                  <circle cx="82" cy="49" r="2.8" fill="#FFFFFF" />
                  <circle cx="86" cy="54" r="1.4" fill="#FFFFFF" />
                </g>
              )}

              {/* Blushing Cheeks */}
              <ellipse cx="45" cy="59" rx="5.5" ry="3.5" fill="#FDA4AF" opacity="0.85" />
              <ellipse cx="95" cy="59" rx="5.5" ry="3.5" fill="#FDA4AF" opacity="0.85" />

              {/* Cute Black Snout Nose */}
              <ellipse cx="70" cy="62" rx="4.5" ry="3.5" fill="#0F172A" />

              {/* Dynamic Mouth based on Pose */}
              {pose === 'playful_cheeky' ? (
                // Playful mouth sticking tiny pink tongue out! 😜
                <g>
                  <path d="M 64,68 Q 70,73 76,68" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path
                    d="M 68,70 Q 72,80 76,70 Z"
                    fill="#F43F5E"
                    stroke="#BE123C"
                    strokeWidth="1.2"
                  />
                </g>
              ) : pose === 'dancing' || completionPercent >= 100 ? (
                // Wide cheerful smiling open mouth with pink tongue!
                <g>
                  <path
                    d="M 63,67 Q 70,77 77,67 Z"
                    fill="#BE123C"
                    stroke="#0F172A"
                    strokeWidth="2"
                  />
                  <ellipse cx="70" cy="71" rx="3.5" ry="2" fill="#FDA4AF" />
                </g>
              ) : (
                // Sweet encouraging gentle smile
                <path
                  d="M 64,68 Q 70,73 76,68"
                  stroke="#0F172A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </g>
          </svg>
        </div>
      </div>
    </aside>
  );
};
