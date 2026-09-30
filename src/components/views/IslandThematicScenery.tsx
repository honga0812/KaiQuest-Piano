import React from 'react';
import { IslandMapThemeConfig } from './islandMapThemes';

interface IslandThematicSceneryProps {
  theme: IslandMapThemeConfig;
}

export const IslandThematicScenery: React.FC<IslandThematicSceneryProps> = ({ theme }) => {
  const { sceneryType } = theme;

  return (
    <g id="thematic-scenery" className="select-none pointer-events-none">
      {/* ============================================================== */}
      {/* 1. AGE 4: SUNNY BEACH (4歲 溫暖金沙海島、彩虹、小火車與海浪)    */}
      {/* ============================================================== */}
      {sceneryType === 'sunny_beach' && (
        <g id="scenery-sunny-beach">
          {/* Gentle sea ripples along bottom sea margin */}
          <path d="M 40,590 Q 95,575 150,590 T 260,590" fill="none" stroke="#BAE6FD" strokeWidth="4" opacity="0.65" strokeLinecap="round" />
          <path d="M 500,595 Q 570,580 640,595 T 780,595" fill="none" stroke="#BAE6FD" strokeWidth="4" opacity="0.65" strokeLinecap="round" />

          {/* Musical Rainbow Arch in the high sky */}
          <g id="rainbow" opacity="0.85">
            <path d="M 60,190 Q 500,-110 940,190" fill="none" stroke="#F43F5E" strokeWidth="7" />
            <path d="M 60,197 Q 500,-103 940,197" fill="none" stroke="#F97316" strokeWidth="7" />
            <path d="M 60,204 Q 500,-96 940,204" fill="none" stroke="#FBBF24" strokeWidth="7" />
            <path d="M 60,211 Q 500,-89 940,211" fill="none" stroke="#10B981" strokeWidth="7" />
            <path d="M 60,218 Q 500,-82 940,218" fill="none" stroke="#3B82F6" strokeWidth="7" />
            <path d="M 60,225 Q 500,-75 940,225" fill="none" stroke="#8B5CF6" strokeWidth="7" />
          </g>

          {/* High Sky Clouds */}
          <g transform="translate(100, 20)" opacity="0.95">
            <ellipse cx="44" cy="22" rx="46" ry="24" fill="#FFFFFF" filter="url(#softShadow)" />
            <circle cx="24" cy="14" r="20" fill="#FFFFFF" />
            <circle cx="62" cy="12" r="22" fill="#FFFFFF" />
          </g>
          <g transform="translate(740, 15)" opacity="0.9">
            <ellipse cx="40" cy="20" rx="42" ry="22" fill="#FFFFFF" filter="url(#softShadow)" />
            <circle cx="24" cy="12" r="18" fill="#FFFFFF" />
            <circle cx="56" cy="10" r="20" fill="#FFFFFF" />
          </g>

          {/* Golden Smiling Sun */}
          <g transform="translate(48, 15)">
            <circle cx="28" cy="28" r="24" fill="#FDE047" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="28" cy="28" r="18" fill="#FBBF24" />
            <circle cx="23" cy="24" r="2" fill="#78350F" />
            <circle cx="33" cy="24" r="2" fill="#78350F" />
            <path d="M 24,31 Q 28,35 32,31" stroke="#78350F" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>

          {/* Central Blue Lagoon in Open Meadow (x=480, y=250) */}
          <ellipse cx="480" cy="250" rx="70" ry="34" fill="#0284C7" stroke="#38BDF8" strokeWidth="4" opacity="0.92" filter="url(#softShadow)" />
          <ellipse cx="472" cy="246" rx="52" ry="22" fill="#0EA5E9" opacity="0.85" />
          <text x="475" y="258" fontSize="22" textAnchor="middle">💦</text>

          {/* Sailboat sailing on Central Lagoon */}
          <g transform="translate(515, 235) scale(0.95)" filter="url(#softShadow)">
            <path d="M 0,12 L 26,12 L 21,21 L 4,21 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
            <polygon points="13,10 13,-9 24,10" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
            <polygon points="11,10 11,-4 3,10" fill="#60A5FA" stroke="#2563EB" strokeWidth="1" />
          </g>

          {/* Tropical Palm Tree in Open Meadow (x=360, y=230) */}
          <g transform="translate(350, 220) scale(0.95)" filter="url(#softShadow)">
            <path d="M 16,48 Q 21,16 34,0" stroke="#78350F" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 34,0 Q 10,-18 -2,-12" stroke="#15803D" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 34,0 Q 54,-22 70,-9" stroke="#15803D" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx="31" cy="3" r="3.5" fill="#78350F" />
          </g>
        </g>
      )}

      {/* ============================================================== */}
      {/* 2. AGE 5: EMERALD FOREST & STONE RUINS (5歲 巨石陣與魔法森林石頭堆) */}
      {/* ============================================================== */}
      {sceneryType === 'emerald_forest' && (
        <g id="scenery-emerald-forest">
          {/* Ancient Canopy Silhouettes in Sky Margins */}
          <ellipse cx="180" cy="35" rx="140" ry="45" fill="#064E3B" opacity="0.75" />
          <ellipse cx="500" cy="25" rx="160" ry="45" fill="#047857" opacity="0.7" />
          <ellipse cx="820" cy="30" rx="150" ry="45" fill="#064E3B" opacity="0.75" />

          {/* 1. Ancient Stonehenge Megalith Portal in Central Clearing (x=480, y=240) */}
          <g transform="translate(455, 225) scale(1.1)" filter="url(#softShadow)">
            <rect x="0" y="0" width="15" height="40" rx="3" fill="#57534E" stroke="#292524" strokeWidth="2" />
            <rect x="30" y="0" width="15" height="40" rx="3" fill="#78716C" stroke="#292524" strokeWidth="2" />
            <rect x="-6" y="-12" width="56" height="14" rx="3.5" fill="#A8A29E" stroke="#44403C" strokeWidth="2" />
            <text x="22" y="-1" fontSize="10" textAnchor="middle" fill="#34D399" fontWeight="900">ᚱ</text>
            <text x="-12" y="34" fontSize="16">🗿</text>
          </g>

          {/* 2. Mystical Stone Piles & Boulder Mound (x=360, y=235) */}
          <g transform="translate(345, 225) scale(0.95)" filter="url(#softShadow)">
            <polygon points="12,0 0,34 24,34" fill="#78716C" stroke="#44403C" strokeWidth="2" />
            <polygon points="32,-5 20,32 42,32" fill="#A8A29E" stroke="#44403C" strokeWidth="2" />
            <text x="22" y="20" fontSize="10" fill="#6EE7B7" fontWeight="bold">✦</text>
            <text x="42" y="28" fontSize="15">🪨</text>
          </g>

          {/* 3. Glowing Magic Mushrooms in Meadow Center (x=590, y=245) */}
          <g transform="translate(575, 235) scale(1.05)" filter="url(#softShadow)">
            <ellipse cx="14" cy="12" rx="16" ry="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="11" y="12" width="6" height="14" rx="2" fill="#FEF08A" />
            <circle cx="8" cy="10" r="2.5" fill="#FFFFFF" />
            <circle cx="16" cy="8" r="3" fill="#FFFFFF" />
            <text x="22" y="24" fontSize="14">🍄</text>
          </g>

          {/* Fireflies floating gently in central meadow */}
          <circle cx="340" cy="265" r="4" fill="#FDE047" className="animate-ping" opacity="0.85" />
          <circle cx="530" cy="265" r="4" fill="#4ADE80" className="animate-ping" opacity="0.85" />
        </g>
      )}

      {/* ============================================================== */}
      {/* 3. AGE 6: DEEP OCEAN ATLANTIS (6歲 亞特蘭提斯神秘海底世界)       */}
      {/* ============================================================== */}
      {sceneryType === 'deep_ocean' && (
        <g id="scenery-deep-ocean">
          {/* Deep Sea God Rays from top surface */}
          <polygon points="120,0 240,0 310,620 180,620" fill="#38BDF8" opacity="0.12" />
          <polygon points="460,0 580,0 680,620 540,620" fill="#67E8F9" opacity="0.1" />

          {/* Rising Bubble Columns in Central Seabed */}
          {[
            { cx: 370, cy: 260, r: 6 },
            { cx: 375, cy: 230, r: 8 },
            { cx: 580, cy: 260, r: 7 },
            { cx: 586, cy: 230, r: 9 },
          ].map((b, idx) => (
            <circle
              key={`bubble-${idx}`}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill="none"
              stroke="#BAE6FD"
              strokeWidth="2"
              opacity="0.8"
              className="animate-pulse"
            />
          ))}

          {/* Sunken Pirate Galleon & Treasure in Central Abyss (x=480, y=240) */}
          <g transform="translate(450, 225) scale(1.05)" filter="url(#softShadow)">
            <path d="M 0,20 C 16,30 45,30 62,16 L 56,4 L 5,4 Z" fill="#451A03" stroke="#1E1B4B" strokeWidth="2" />
            <line x1="30" y1="4" x2="30" y2="-18" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="18" y1="-10" x2="42" y2="-8" stroke="#78350F" strokeWidth="2" />
            <text x="-8" y="26" fontSize="18" fill="#CBD5E1">⚓</text>
            <text x="42" y="22" fontSize="16">💎</text>
          </g>

          {/* Atlantis Columns in Upper Meadow (x=360, y=235) */}
          <g transform="translate(345, 225) scale(0.95)" filter="url(#softShadow)">
            <rect x="0" y="0" width="12" height="40" rx="2" fill="#E2E8F0" stroke="#0891B2" strokeWidth="1.5" transform="rotate(18)" />
            <rect x="30" y="-6" width="13" height="48" rx="2.5" fill="#F8FAFC" stroke="#0891B2" strokeWidth="2" />
            <rect x="25" y="-12" width="24" height="7" rx="1.5" fill="#E2E8F0" stroke="#0891B2" strokeWidth="1.5" />
            <text x="22" y="-15" fontSize="15">🏛️</text>
          </g>

          {/* Bioluminescent Jellyfish in East Meadow (x=590, y=240) */}
          <g transform="translate(575, 230) scale(1.05)" filter="url(#softShadow)">
            <ellipse cx="14" cy="10" rx="15" ry="9" fill="#C084FC" opacity="0.9" stroke="#E9D5FF" strokeWidth="1.5" className="animate-pulse" />
            <path d="M 5,10 Q 3,22 5,30" stroke="#E9D5FF" strokeWidth="1.5" fill="none" />
            <path d="M 11,12 Q 13,24 9,32" stroke="#F472B6" strokeWidth="1.5" fill="none" />
            <path d="M 18,12 Q 16,23 19,32" stroke="#E9D5FF" strokeWidth="1.5" fill="none" />
            <text x="20" y="16" fontSize="15">🪼</text>
          </g>
        </g>
      )}

      {/* ============================================================== */}
      {/* 4. AGE 7: THUNDER PEAK & ROYAL CLIFF APEX (7歲 高山懸崖峭壁與雷霆雪峰) */}
      {/* ============================================================== */}
      {sceneryType === 'cliff_apex' && (
        <g id="scenery-cliff-apex">
          {/* Cosmic Aurora Waves in High Sky */}
          <path d="M 0,60 Q 300,10 600,50 T 1000,25 L 1000,0 L 0,0 Z" fill="url(#auroraGrad)" opacity="0.4" />

          {/* Towering Snowy Peak Apex in Far Background */}
          <polygon points="430,210 500,45 570,210" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <polygon points="485,78 500,45 515,78" fill="#FFFFFF" />

          {/* Waterfall in Central Ravine (x=495, y=210) */}
          <g transform="translate(490, 215) scale(1.05)">
            <path d="M 7,0 L 4,60 L 13,60 L 10,0 Z" fill="#67E8F9" opacity="0.85" />
            <path d="M 8,0 L 8,60" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.95" />
            <ellipse cx="8" cy="62" rx="12" ry="5" fill="#38BDF8" opacity="0.8" />
            <text x="14" y="55" fontSize="12">💨</text>
          </g>

          {/* Thunder Storm Cloud in West Central Meadow (x=360, y=230) */}
          <g transform="translate(345, 220) scale(1.05)" filter="url(#softShadow)">
            <ellipse cx="20" cy="12" rx="24" ry="12" fill="#1E293B" />
            <circle cx="12" cy="7" r="10" fill="#334155" />
            <circle cx="28" cy="5" r="12" fill="#1E293B" />
            <polygon points="20,14 15,24 22,24 17,35 28,21 22,21" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" className="animate-pulse" />
            <text x="30" y="16" fontSize="15">⚡</text>
          </g>

          {/* Iron Chain Bridge in East Central Chasm (x=590, y=235) */}
          <g transform="translate(575, 230) scale(0.95)" filter="url(#softShadow)">
            <path d="M 0,0 Q 32,10 64,0" stroke="#CBD5E1" strokeWidth="3.5" fill="none" strokeDasharray="6 2.5" />
            <path d="M 0,8 Q 32,18 64,8" stroke="#94A3B8" strokeWidth="3.5" fill="none" strokeDasharray="6 2.5" />
            {[8, 20, 32, 44, 56].map((px) => (
              <line key={`plank-${px}`} x1={px} y1={2} x2={px} y2={10} stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
            ))}
            <text x="22" y="24" fontSize="14">🌉</text>
          </g>

          {/* Golden Eagle Soaring High in Sky */}
          <g transform="translate(360, 35) scale(1.1)">
            <text x="0" y="0" fontSize="24" className="animate-pulse">🦅</text>
          </g>
        </g>
      )}
    </g>
  );
};
