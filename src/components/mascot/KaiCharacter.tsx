import React, { useEffect, useState } from 'react';

export type CharacterMood = 'idle' | 'listening' | 'excited' | 'encouraging' | 'celebrating' | 'holding' | 'hit';

interface KaiCharacterProps {
  mood?: CharacterMood;
  comboStreak?: number;
  lastHitTimestamp?: number; // Trigger continuous dynamic bounce on each note hit
  speechText?: string;
  speechEn?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const KaiCharacter: React.FC<KaiCharacterProps> = ({
  mood = 'idle',
  comboStreak = 0,
  lastHitTimestamp = 0,
  speechText,
  speechEn,
  className = '',
  size = 'md',
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
  const isLittleCombo = comboStreak >= 1 && comboStreak < 3;

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* SVG Mascot with Continuous Dynamic Reactions */}
      <div
        className={`relative shrink-0 ${sizeMap[size]} transition-all duration-200 transform ${
          isHitJumping
            ? '-translate-y-3 scale-115 rotate-2'
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
          <div className="absolute -inset-3 pointer-events-none flex items-center justify-center animate-ping opacity-80">
            <span className="text-2xl">✨</span>
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

        <svg viewBox="0 0 130 130" className="relative w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            <linearGradient id="kaiFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="goldStars" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="rainbowCrown" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="fireAura" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
          </defs>

          {/* Golden Crown for Maestro Mode (Combo 10+) */}
          {isMaestroCrownMode && (
            <g transform="translate(38, -6) scale(0.95)" className="animate-bounce">
              <polygon
                points="0,26 12,6 28,18 44,6 56,26"
                fill="url(#rainbowCrown)"
                stroke="#FDE047"
                strokeWidth="2.5"
                filter="drop-shadow(0 2px 8px rgba(234, 179, 8, 0.9))"
              />
              <circle cx="12" cy="6" r="4" fill="#EF4444" />
              <circle cx="28" cy="18" r="5" fill="#3B82F6" />
              <circle cx="44" cy="6" r="4" fill="#10B981" />
            </g>
          )}

          {/* Conductor Wand in Hand for Maestro Mode */}
          {isMaestroCrownMode && (
            <g transform="translate(98, 70) rotate(-25)">
              <line x1="0" y1="0" x2="32" y2="-12" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
              <circle cx="32" cy="-12" r="5" fill="#F43F5E" />
            </g>
          )}

          {/* Ears with Wiggle on Hit */}
          <g className={isHitJumping ? 'animate-wiggle' : ''}>
            <polygon points="30,50 20,12 55,34" fill="url(#kaiFur)" />
            <polygon points="31,47 25,20 50,36" fill="#FECDD3" />
            <polygon points="100,50 110,12 75,34" fill="url(#kaiFur)" />
            <polygon points="99,47 105,20 80,36" fill="#FECDD3" />
          </g>

          {/* Head Base */}
          <ellipse cx="65" cy="68" rx="46" ry="40" fill="url(#kaiFur)" />

          {/* White Fluffy Cheeks */}
          <path d="M 23,71 Q 43,90 56,79 Q 34,96 25,86 Z" fill="#FFFFFF" />
          <path d="M 107,71 Q 87,90 74,79 Q 96,96 105,86 Z" fill="#FFFFFF" />

          {/* Bandana (Color morphs based on combo power!) */}
          <path
            d="M 30,92 Q 65,108 100,92 L 96,105 Q 65,119 34,105 Z"
            fill={isMaestroCrownMode ? 'url(#rainbowCrown)' : isFireMode ? 'url(#fireAura)' : '#EF4444'}
          />
          <polygon
            points="61,103 65,114 69,103"
            fill={isMaestroCrownMode ? '#FBBF24' : '#DC2626'}
          />

          {/* Dynamic Eyes based on Hit, Combo & Mood */}
          {isHitJumping || isMaestroCrownMode || mood === 'celebrating' ? (
            // Curved super happy sparkling eyes ^ ^ with joy
            <g stroke="#0F172A" strokeWidth="5" strokeLinecap="round" fill="none">
              <path d="M 42,60 Q 52,48 62,60" />
              <path d="M 68,60 Q 78,48 88,60" />
            </g>
          ) : isFireMode ? (
            // Blazing confident eyes
            <g fill="#0F172A">
              <polygon points="43,54 59,57 56,64 45,63" fill="#0F172A" />
              <circle cx="51" cy="59" r="3.2" fill="#FBBF24" />
              <polygon points="87,54 71,57 74,64 85,63" fill="#0F172A" />
              <circle cx="79" cy="59" r="3.2" fill="#FBBF24" />
            </g>
          ) : isStarMode || mood === 'excited' ? (
            // Star Eyes 🤩
            <g fill="url(#goldStars)">
              <polygon points="52,50 54,57 61,58 56,63 58,70 52,66 46,70 48,63 43,58 50,57" />
              <polygon points="78,50 80,57 87,58 82,63 84,70 78,66 72,70 74,63 69,58 76,57" />
            </g>
          ) : isLittleCombo ? (
            // Winking left eye, curious right eye
            <g>
              <path d="M 43,60 Q 51,52 59,60" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <ellipse cx="79" cy="59" rx="7.5" ry="9.5" fill="#0F172A" />
              <circle cx="77" cy="56" r="3" fill="#FFFFFF" />
            </g>
          ) : mood === 'listening' ? (
            // Big curious open eyes with shiny sparkle
            <g fill="#0F172A">
              <ellipse cx="48" cy="59" rx="8" ry="10" />
              <circle cx="46" cy="55" r="3.5" fill="#FFFFFF" />
              <circle cx="51" cy="62" r="1.8" fill="#FFFFFF" />
              <ellipse cx="82" cy="59" rx="8" ry="10" />
              <circle cx="80" cy="55" r="3.5" fill="#FFFFFF" />
              <circle cx="85" cy="62" r="1.8" fill="#FFFFFF" />
            </g>
          ) : (
            // Normal friendly smiling eyes
            <g fill="#0F172A">
              <ellipse cx="49" cy="60" rx="7" ry="9" />
              <circle cx="47" cy="56" r="3" fill="#FFFFFF" />
              <ellipse cx="81" cy="60" rx="7" ry="9" />
              <circle cx="79" cy="56" r="3" fill="#FFFFFF" />
            </g>
          )}

          {/* Cute Nose */}
          <polygon points="65,71 58,79 72,79" fill="#0F172A" />

          {/* Smile Mouth (Opens into joyful song mouth on hit) */}
          {isHitJumping || isMaestroCrownMode || isFireMode || mood === 'excited' || mood === 'celebrating' ? (
            <path d="M 53,82 Q 65,98 77,82 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="3" />
          ) : (
            <path d="M 56,82 Q 65,90 74,82" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* Rosy Blush - Pulsing Pink */}
          <circle cx="35" cy="74" r={isHitJumping ? '8' : '6.5'} fill="#FB7185" opacity={isHitJumping ? '0.9' : '0.65'} />
          <circle cx="95" cy="74" r={isHitJumping ? '8' : '6.5'} fill="#FB7185" opacity={isHitJumping ? '0.9' : '0.65'} />

          {/* Animated Music Notes Popping Around Kai on Each Note Hit */}
          {(isHitJumping || comboStreak > 0) && (
            <g className="animate-bounce">
              <g fill="#F59E0B" transform="translate(6, 10) scale(1.1)">
                <polygon points="12,28 15,36 23,37 17,43 19,51 12,46 5,51 7,43 1,37 9,36" />
              </g>
              <g fill="#3B82F6" transform="translate(102, 8) scale(1.1)">
                <path d="M 12,24 L 12,10 L 24,14 L 24,26 A 4 3 0 1 1 18,28 L 18,17 L 21,18 L 21,28 A 4 3 0 1 1 12,24 Z" />
              </g>
              <g fill="#10B981" transform="translate(54, -4) scale(0.9)">
                <circle cx="6" cy="12" r="4" />
                <line x1="10" y1="12" x2="10" y2="0" stroke="#10B981" strokeWidth="2.5" />
              </g>
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

      {/* Comic Speech Bubble - Large Tablet Typography & Candy Border */}
      {(speechText || speechEn) && (
        <div className="relative bg-gradient-to-br from-white via-amber-50/95 to-yellow-50 text-slate-900 rounded-3xl px-5 py-3.5 shadow-xl border-2 border-amber-400 max-w-sm md:max-w-lg backdrop-blur-md text-left">
          {/* Bubble tail pointing left */}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[12px] border-r-amber-400" />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-y-7 border-y-transparent border-r-[10px] border-r-white" />

          {speechEn && (
            <div className="text-xs md:text-sm font-black uppercase tracking-wider text-blue-600 mb-1 font-mono flex items-center gap-1.5">
              <span>{isMaestroCrownMode ? '👑' : isFireMode ? '🔥' : isStarMode ? '⭐' : '✨'}</span>
              <span>{speechEn}</span>
            </div>
          )}

          <div className="text-sm md:text-base font-black text-slate-800 leading-snug">
            {speechText}
          </div>
        </div>
      )}
    </div>
  );
};
