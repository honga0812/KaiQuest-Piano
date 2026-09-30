import React, { useEffect, useState } from 'react';
import { EliLionSvg, KabutoBeetleSvg, PicoDolphinSvg, RexDinoSvg } from './AnimalFriends';

export type CharacterMood = 'idle' | 'listening' | 'excited' | 'encouraging' | 'celebrating' | 'holding' | 'hit';
export type CompanionAnimal = 'none' | 'eli_lion' | 'kabuto_beetle' | 'pico_dolphin' | 'rex_dino';

interface KaiCharacterProps {
  mood?: CharacterMood;
  comboStreak?: number;
  lastHitTimestamp?: number; // Trigger continuous dynamic bounce on each note hit
  speechText?: string;
  speechEn?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  companion?: CompanionAnimal;
}

export const KaiCharacter: React.FC<KaiCharacterProps> = ({
  mood = 'idle',
  comboStreak = 0,
  lastHitTimestamp = 0,
  speechText,
  speechEn,
  className = '',
  size = 'md',
  companion = 'none',
}) => {
  const [isHitJumping, setIsHitJumping] = useState(false);

  // Trigger continuous physical bounce & reaction when each note is correctly played
  useEffect(() => {
    if (lastHitTimestamp > 0) {
      setIsHitJumping(true);
      const timer = setTimeout(() => setIsHitJumping(false), 380);
      return () => clearTimeout(timer);
    }
  }, [lastHitTimestamp]);

  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-48 h-48',
  };

  // Determine Kai's evolutionary state based on combo streak
  const isMaestroCrownMode = comboStreak >= 10;
  const isFireMode = comboStreak >= 6 && comboStreak < 10;
  const isStarMode = comboStreak >= 3 && comboStreak < 6;

  const isCelebrating = mood === 'celebrating' || isHitJumping || isMaestroCrownMode;
  const isListening = mood === 'listening';

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Mascot Container with Kai Explorer Boy */}
      <div className="relative shrink-0 flex items-end">
        <div
          className={`relative ${sizeMap[size]} transition-all duration-200 transform ${
            isHitJumping
              ? '-translate-y-3 scale-115 rotate-1'
              : isMaestroCrownMode
              ? 'scale-110 animate-bounce'
              : isFireMode
              ? 'scale-105 animate-pulse'
              : isStarMode
              ? 'scale-105'
              : mood === 'celebrating'
              ? 'animate-bounce'
              : ''
          }`}
        >
          {/* Radiating Sparkles on Note Hit */}
          {isHitJumping && (
            <div className="absolute -inset-3 pointer-events-none flex items-center justify-center animate-ping opacity-85">
              <span className="text-3xl">✨</span>
            </div>
          )}

          {/* Combo Fire Aura Background */}
          {isFireMode && (
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-t from-amber-500 via-rose-500 to-orange-400 opacity-60 blur-lg animate-pulse" />
          )}

          {/* Crown Maestro Rainbow Aura */}
          {isMaestroCrownMode && (
            <div className="absolute -inset-3.5 rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 opacity-70 blur-xl animate-spin" />
          )}

          {/* 3D Stylized Boy Explorer Kai Vector SVG */}
          <svg viewBox="0 0 160 170" className="relative w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
              <linearGradient id="charSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="100%" stopColor="#FDBA74" />
              </linearGradient>
              <linearGradient id="charHair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              <linearGradient id="charVest" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#65A30D" />
                <stop offset="100%" stopColor="#3F6212" />
              </linearGradient>
              <linearGradient id="charBackpack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="badgeGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
              <linearGradient id="binocularsNavy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>

            {/* Explorer Backpack behind shoulders */}
            <g id="kai-backpack">
              <rect x="36" y="86" width="88" height="58" rx="20" fill="url(#charBackpack)" />
              <path d="M 44,100 C 44,82 116,82 116,100" stroke="#B45309" strokeWidth="4" fill="none" />
            </g>

            {/* Inner White T-Shirt */}
            <rect x="52" y="94" width="56" height="52" rx="14" fill="#F8FAFC" />

            {/* Green Safari Explorer Vest */}
            <g id="kai-vest">
              <path d="M 48,94 L 68,94 L 68,146 L 48,140 Z" fill="url(#charVest)" />
              <path d="M 112,94 L 92,94 L 92,146 L 112,140 Z" fill="url(#charVest)" />
              <path d="M 48,94 Q 80,108 112,94" fill="none" stroke="#365314" strokeWidth="3" />
              <rect x="52" y="116" width="13" height="16" rx="3" fill="#365314" />
              <rect x="95" y="116" width="13" height="16" rx="3" fill="#365314" />

              {/* Signature Yellow Round 'K' Badge */}
              <circle cx="102" cy="103" r="7.5" fill="url(#badgeGold)" stroke="#FFFFFF" strokeWidth="1.2" />
              <text x="102" y="106.5" fontSize="9" fontWeight="900" fontFamily="sans-serif" fill="#0F172A" textAnchor="middle">
                K
              </text>
            </g>

            {/* Navy Blue Binoculars hanging on chest */}
            <g id="kai-binoculars" transform="translate(71, 106)">
              <path d="M -16,-12 Q 9,-4 34,-12" fill="none" stroke="#0F172A" strokeWidth="2.2" />
              <rect x="0" y="2" width="8" height="19" rx="3.5" fill="url(#binocularsNavy)" stroke="#38BDF8" strokeWidth="0.8" />
              <rect x="10" y="2" width="8" height="19" rx="3.5" fill="url(#binocularsNavy)" stroke="#38BDF8" strokeWidth="0.8" />
              <rect x="6" y="8" width="6" height="5" rx="1" fill="#475569" />
              <ellipse cx="4" cy="19" rx="2.5" ry="1.2" fill="#38BDF8" />
              <ellipse cx="14" cy="19" rx="2.5" ry="1.2" fill="#38BDF8" />
            </g>

            {/* Neck */}
            <rect x="73" y="82" width="14" height="14" rx="4" fill="url(#charSkin)" />

            {/* Head */}
            <g id="kai-head">
              <ellipse cx="80" cy="56" rx="32" ry="28" fill="url(#charSkin)" />

              {/* Ears */}
              <ellipse cx="48" cy="58" rx="5.5" ry="7" fill="url(#charSkin)" />
              <ellipse cx="49" cy="58" rx="2.5" ry="4" fill="#F472B6" opacity="0.4" />
              <ellipse cx="112" cy="58" rx="5.5" ry="7" fill="url(#charSkin)" />
              <ellipse cx="111" cy="58" rx="2.5" ry="4" fill="#F472B6" opacity="0.4" />

              {/* Cheeks */}
              <circle cx="59" cy="64" r="5.5" fill="#FB7185" opacity="0.45" />
              <circle cx="101" cy="64" r="5.5" fill="#FB7185" opacity="0.45" />

              {/* Eyebrows */}
              <path
                d={isListening ? "M 59,40 Q 67,37 73,42" : "M 60,41 Q 67,37 73,41"}
                fill="none"
                stroke="#0F172A"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d={isCelebrating ? "M 87,42 Q 93,37 101,40" : "M 87,41 Q 93,37 100,41"}
                fill="none"
                stroke="#0F172A"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Big Sparkling Eyes (Warm Dark Brown with Dual Catchlights) */}
              <g id="kai-eyes">
                <ellipse cx="66" cy="51" rx="7" ry="9" fill="#0F172A" />
                <ellipse cx="66" cy="54" rx="4" ry="4.5" fill="#78350F" />
                <circle cx="64" cy="48" r="2.8" fill="#FFFFFF" />
                <circle cx="68" cy="54" r="1.3" fill="#FFFFFF" />

                <ellipse cx="94" cy="51" rx="7" ry="9" fill="#0F172A" />
                <ellipse cx="94" cy="54" rx="4" ry="4.5" fill="#78350F" />
                <circle cx="92" cy="48" r="2.8" fill="#FFFFFF" />
                <circle cx="96" cy="54" r="1.3" fill="#FFFFFF" />
              </g>

              {/* Small Nose */}
              <ellipse cx="80" cy="58" rx="2" ry="1.5" fill="#C2410C" opacity="0.8" />

              {/* Cheerful Smile */}
              {isCelebrating || isHitJumping ? (
                <path d="M 69,64 Q 80,78 91,64 C 86,76 74,76 69,64 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="1.5" />
              ) : (
                <path d="M 72,65 Q 80,71 88,65" fill="none" stroke="#9F1239" strokeWidth="2.8" strokeLinecap="round" />
              )}

              {/* Fluffy Layered Black Hair */}
              <g id="kai-hair">
                <path
                  d="M 44,50 C 38,22 60,10 80,10 C 102,10 124,22 116,50 C 122,38 120,26 110,16 C 98,4 62,4 50,16 C 40,26 38,38 44,50 Z"
                  fill="url(#charHair)"
                />
                <path
                  d="M 44,42 C 44,24 55,18 66,18 C 72,18 76,22 80,26 C 85,20 94,16 104,18 C 114,20 118,34 116,44 C 112,36 104,32 96,35 C 90,37 86,44 80,36 C 74,46 64,34 54,36 C 48,38 45,42 44,42 Z"
                  fill="url(#charHair)"
                />
                <path d="M 42,34 C 34,28 36,20 45,20 C 42,26 43,30 42,34 Z" fill="url(#charHair)" />
                <path d="M 118,34 C 126,28 124,20 115,20 C 118,26 117,30 118,34 Z" fill="url(#charHair)" />
              </g>
            </g>

            {/* Golden Magnifying Glass */}
            <g id="kai-magnifying-glass" transform="translate(18, 76)">
              <ellipse cx="14" cy="14" rx="12" ry="12" fill="#E0F2FE" fillOpacity="0.45" stroke="#F59E0B" strokeWidth="3" />
              <line x1="23" y1="23" x2="36" y2="36" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 7,10 Q 14,5 20,8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              <circle cx="30" cy="30" r="5" fill="url(#charSkin)" />
            </g>

            {/* Maestro Crown for High Combo */}
            {isMaestroCrownMode && (
              <g transform="translate(80, 10)" className="animate-bounce">
                <polygon points="-16,0 -8,-14 0,-4 8,-14 16,0" fill="#FDE047" stroke="#D97706" strokeWidth="2" />
                <circle cx="-8" cy="-14" r="2.5" fill="#EF4444" />
                <circle cx="0" cy="-4" r="2.5" fill="#3B82F6" />
                <circle cx="8" cy="-14" r="2.5" fill="#10B981" />
              </g>
            )}

            {/* Music Notes Popping on Note Hit */}
            {(isHitJumping || comboStreak > 0) && (
              <g className="animate-bounce">
                <text x="130" y="44" fontSize="18">🎵</text>
                <text x="12" y="52" fontSize="16">✨</text>
              </g>
            )}
          </svg>

          {/* Combo Badge Floating on Mascot */}
          {comboStreak > 0 && (
            <div className="absolute -top-3 -right-3 flex items-center justify-center px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black text-xs md:text-sm shadow-2xl border-2 border-white ring-4 ring-amber-300 animate-bounce">
              <span>🔥 {comboStreak} 連擊!</span>
            </div>
          )}

          {/* Live Audio Status Listening Indicator */}
          {mood === 'listening' && comboStreak === 0 && (
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 border-2 border-white shadow" />
            </span>
          )}
        </div>

        {/* Optional Animal Companion Cheering Alongside Kai */}
        {companion === 'eli_lion' && (
          <div className="w-16 h-16 -ml-4 mb-0 animate-bounce" title="暖暖獅子 Eli 夥伴正在為你加油！">
            <EliLionSvg size={64} mood="happy" />
          </div>
        )}
        {companion === 'kabuto_beetle' && (
          <div className="w-14 h-14 -ml-3 mb-0 hover:scale-110 transition-transform" title="甲蟲小勇士 Kabuto">
            <KabutoBeetleSvg size={54} />
          </div>
        )}
        {companion === 'pico_dolphin' && (
          <div className="w-16 h-16 -ml-4 mb-2 animate-pulse" title="躍動海豚 Pico">
            <PicoDolphinSvg size={64} />
          </div>
        )}
        {companion === 'rex_dino' && (
          <div className="w-16 h-16 -ml-4 mb-0 animate-bounce" title="森林小恐龍 Rex">
            <RexDinoSvg size={64} />
          </div>
        )}
      </div>

      {/* Comic Speech Bubble */}
      {(speechText || speechEn) && (
        <div className="relative bg-gradient-to-br from-white via-amber-50/95 to-yellow-50 text-slate-900 rounded-3xl px-5 py-3.5 shadow-xl border-2 border-amber-400 max-w-sm md:max-w-lg backdrop-blur-md text-left">
          {/* Bubble tail pointing left */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[12px] border-r-amber-400" />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-y-7 border-y-transparent border-r-[10px] border-r-white" />

          {speechEn && (
            <div className="text-sm md:text-base font-black uppercase tracking-wider text-blue-600 mb-1 font-mono flex items-center gap-1.5">
              <span>{isMaestroCrownMode ? '👑' : isFireMode ? '🔥' : isStarMode ? '⭐' : '🧭'}</span>
              <span>{speechEn}</span>
            </div>
          )}

          <div className="text-lg md:text-2xl font-black text-slate-900 leading-snug">
            {speechText}
          </div>
        </div>
      )}
    </div>
  );
};
