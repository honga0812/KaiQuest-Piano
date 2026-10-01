import React from 'react';

interface DancerSvgProps {
  className?: string;
  size?: number | string;
}

/**
 * 1. 早安小熊 (Morning Bear)
 * 森林舞會夥伴：圓潤蜜糖棕色身軀、軟萌小熊耳朵、紅格子領結、歡快揮舞的小熊掌
 */
export const MorningBearSvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 90,
}) => {
  return (
    <svg
      viewBox="0 0 130 130"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="bearFur" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="bearBelly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>

      {/* Fluffy Round Ears */}
      <circle cx="34" cy="34" r="15" fill="url(#bearFur)" />
      <circle cx="34" cy="34" r="8" fill="#FDE68A" />
      <circle cx="96" cy="34" r="15" fill="url(#bearFur)" />
      <circle cx="96" cy="34" r="8" fill="#FDE68A" />

      {/* Body */}
      <ellipse cx="65" cy="85" rx="36" ry="34" fill="url(#bearFur)" />
      <ellipse cx="65" cy="88" rx="22" ry="20" fill="url(#bearBelly)" />

      {/* Little Feet */}
      <ellipse cx="44" cy="116" rx="14" ry="10" fill="url(#bearFur)" />
      <circle cx="44" cy="116" r="5" fill="#FDE68A" />
      <ellipse cx="86" cy="116" rx="14" ry="10" fill="url(#bearFur)" />
      <circle cx="86" cy="116" r="5" fill="#FDE68A" />

      {/* Cheerful Raised Hands/Paws */}
      <g>
        <ellipse cx="26" cy="72" rx="10" ry="14" transform="rotate(-30 26 72)" fill="url(#bearFur)" />
        <ellipse cx="104" cy="72" rx="10" ry="14" transform="rotate(30 104 72)" fill="url(#bearFur)" />
      </g>

      {/* Head */}
      <circle cx="65" cy="56" r="32" fill="url(#bearFur)" />

      {/* Cute Muzzle */}
      <ellipse cx="65" cy="65" rx="15" ry="11" fill="url(#bearBelly)" />
      <ellipse cx="65" cy="60" rx="6" ry="4.5" fill="#78350F" />
      <path d="M 65,65 L 65,69" stroke="#78350F" strokeWidth="2" />
      <path d="M 60,69 Q 65,74 70,69" fill="none" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />

      {/* Sparkling Eyes */}
      <ellipse cx="52" cy="50" rx="4.5" ry="5.5" fill="#1E293B" />
      <circle cx="50.5" cy="48" r="1.8" fill="#FFFFFF" />
      <ellipse cx="78" cy="50" rx="4.5" ry="5.5" fill="#1E293B" />
      <circle cx="76.5" cy="48" r="1.8" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <circle cx="43" cy="59" r="5" fill="#FB7185" opacity="0.5" />
      <circle cx="87" cy="59" r="5" fill="#FB7185" opacity="0.5" />

      {/* Red Festive Bowtie */}
      <g transform="translate(65, 80)">
        <polygon points="-8,-4 -8,4 0,0" fill="#EF4444" />
        <polygon points="8,-4 8,4 0,0" fill="#EF4444" />
        <circle cx="0" cy="0" r="3.2" fill="#F87171" />
      </g>
    </svg>
  );
};

/**
 * 2. 小蜜蜂隊長 (Captain Honeybee)
 * 花海舞會夥伴：黑黃相間條紋毛茸肚肚、晶瑩剔透雙翅、觸角頂著金色花粉球
 */
export const CaptainHoneybeeSvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 85,
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="beeBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="beeWing" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Fluttering Translucent Wings */}
      <g className="animate-wing-buzz origin-center">
        <ellipse cx="44" cy="32" rx="16" ry="24" transform="rotate(-35 44 32)" fill="url(#beeWing)" stroke="#38BDF8" strokeWidth="1.2" />
        <ellipse cx="76" cy="32" rx="16" ry="24" transform="rotate(35 76 32)" fill="url(#beeWing)" stroke="#38BDF8" strokeWidth="1.2" />
      </g>

      {/* Antennas with Golden Pollen Globules */}
      <path d="M 50,44 Q 40,24 35,26" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="35" cy="26" r="4.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
      <path d="M 70,44 Q 80,24 85,26" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="85" cy="26" r="4.5" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />

      {/* Striped Oval Honeybee Body */}
      <ellipse cx="60" cy="72" rx="30" ry="26" fill="url(#beeBody)" />

      {/* Dark Stripes across Body */}
      <path d="M 44,58 Q 60,65 76,58 L 78,66 Q 60,73 42,66 Z" fill="#1E293B" />
      <path d="M 38,72 Q 60,80 82,72 L 80,80 Q 60,88 40,80 Z" fill="#1E293B" />

      {/* Cute Stinger */}
      <polygon points="60,98 56,92 64,92" fill="#1E293B" />

      {/* Head */}
      <circle cx="60" cy="48" r="22" fill="url(#beeBody)" />

      {/* Big Cheerful Eyes */}
      <ellipse cx="51" cy="46" rx="5" ry="6" fill="#1E293B" />
      <circle cx="49" cy="44" r="2" fill="#FFFFFF" />
      <ellipse cx="69" cy="46" rx="5" ry="6" fill="#1E293B" />
      <circle cx="67" cy="44" r="2" fill="#FFFFFF" />

      {/* Sweet Honey Smile */}
      <path d="M 55,54 Q 60,60 65,54" fill="none" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="44" cy="53" r="3.5" fill="#FB7185" opacity="0.6" />
      <circle cx="76" cy="53" r="3.5" fill="#FB7185" opacity="0.6" />
    </svg>
  );
};

/**
 * 3. 浪花小海龜 (Wave Turtle)
 * 海洋浪花夥伴：碧海綠圓貝殼、渦卷海浪花紋、揮舞的划水鰭、白色小水手帽
 */
export const WaveTurtleSvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 90,
}) => {
  return (
    <svg
      viewBox="0 0 130 110"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="turtleShell" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="turtleSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* Paddling Flippers */}
      <path d="M 32,46 C 14,36 10,60 26,68 Z" fill="url(#turtleSkin)" />
      <path d="M 88,46 C 106,36 110,60 94,68 Z" fill="url(#turtleSkin)" />
      <ellipse cx="36" cy="85" rx="10" ry="6" transform="rotate(-30 36 85)" fill="url(#turtleSkin)" />
      <ellipse cx="84" cy="85" rx="10" ry="6" transform="rotate(30 84 85)" fill="url(#turtleSkin)" />

      {/* Tiny Tail */}
      <polygon points="60,95 56,88 64,88" fill="url(#turtleSkin)" />

      {/* Rounded Emerald Sea Shell */}
      <ellipse cx="60" cy="62" rx="34" ry="28" fill="url(#turtleShell)" stroke="#065F46" strokeWidth="2" />
      {/* Wave Shell Inlays */}
      <circle cx="60" cy="56" r="10" fill="none" stroke="#A7F3D0" strokeWidth="2.2" strokeDasharray="4 3" />
      <circle cx="44" cy="68" r="6" fill="none" stroke="#A7F3D0" strokeWidth="1.8" />
      <circle cx="76" cy="68" r="6" fill="none" stroke="#A7F3D0" strokeWidth="1.8" />

      {/* Cute Head */}
      <circle cx="60" cy="34" r="16" fill="url(#turtleSkin)" />

      {/* Big Curious Marine Eyes */}
      <circle cx="53" cy="32" r="4.5" fill="#1E293B" />
      <circle cx="51.5" cy="30.5" r="1.5" fill="#FFFFFF" />
      <circle cx="67" cy="32" r="4.5" fill="#1E293B" />
      <circle cx="65.5" cy="30.5" r="1.5" fill="#FFFFFF" />

      {/* Joyful Mouth */}
      <path d="M 55,39 Q 60,44 65,39" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" />

      {/* Sailor Cap */}
      <g transform="translate(60, 20)">
        <ellipse cx="0" cy="0" rx="9" ry="3" fill="#FFFFFF" />
        <path d="M -7,0 Q 0,-8 7,0 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
        <rect x="-8" y="-1" width="16" height="2" fill="#0284C7" />
        {/* Navy Pom Pom */}
        <circle cx="0" cy="-6" r="2.2" fill="#EF4444" />
      </g>
    </svg>
  );
};

/**
 * 4. 螢火蟲夥伴 (Firefly Buddy)
 * 甲蟲競技場夥伴：閃爍金光的燈籠腹部、揮舞金色冠軍彩旗、萌萌大眼睛
 */
export const FireflyBuddySvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 85,
}) => {
  return (
    <svg
      viewBox="0 0 110 110"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <radialGradient id="fireflyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
          <stop offset="60%" stopColor="#FACC15" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Golden Glowing Abdomen Lantern */}
      <circle cx="55" cy="74" r="24" fill="url(#fireflyGlow)" className="animate-pulse" />
      <ellipse cx="55" cy="74" rx="15" ry="18" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />

      {/* Translucent Wings */}
      <ellipse cx="42" cy="46" rx="12" ry="18" transform="rotate(-30 42 46)" fill="#BAE6FD" opacity="0.7" stroke="#38BDF8" strokeWidth="1" />
      <ellipse cx="68" cy="46" rx="12" ry="18" transform="rotate(30 68 46)" fill="#BAE6FD" opacity="0.7" stroke="#38BDF8" strokeWidth="1" />

      {/* Head */}
      <circle cx="55" cy="44" r="14" fill="#334155" />

      {/* Curly Antennas */}
      <path d="M 50,33 Q 44,20 38,24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="24" r="3" fill="#FDE047" />
      <path d="M 60,33 Q 66,20 72,24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
      <circle cx="72" cy="24" r="3" fill="#FDE047" />

      {/* Big Cheerful Eyes */}
      <circle cx="49" cy="42" r="4.5" fill="#FFFFFF" />
      <circle cx="50" cy="42" r="2.2" fill="#0F172A" />
      <circle cx="61" cy="42" r="4.5" fill="#FFFFFF" />
      <circle cx="60" cy="42" r="2.2" fill="#0F172A" />

      {/* Happy Smile */}
      <path d="M 52,48 Q 55,52 58,48" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

      {/* Champion Golden Flag held in hand */}
      <g transform="translate(74, 38)">
        <line x1="0" y1="0" x2="16" y2="-18" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="12,-16 28,-14 18,-6" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        <text x="18" y="-10" fontSize="7" fill="#FFFFFF" fontWeight="900">★</text>
      </g>
    </svg>
  );
};

/**
 * 5. 翼龍飛飛 (Pterosaur Pterry)
 * 恐龍火山舞會夥伴：薰衣草紫色雙翼、俏皮頭冠、大嘴巴笑得好燦爛
 */
export const PterosaurSvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 95,
}) => {
  return (
    <svg
      viewBox="0 0 130 110"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="pteroPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>

      {/* Spread Wings */}
      <path d="M 60,60 C 35,40 10,48 4,68 C 22,64 42,72 60,76 Z" fill="url(#pteroPurple)" opacity="0.9" />
      <path d="M 60,60 C 85,40 110,48 116,68 C 98,64 78,72 60,76 Z" fill="url(#pteroPurple)" opacity="0.9" />

      {/* Body */}
      <ellipse cx="60" cy="70" rx="14" ry="18" fill="url(#pteroPurple)" />
      <ellipse cx="60" cy="72" rx="8" ry="11" fill="#F3E8FF" />

      {/* Head with Pterosaur Crest */}
      <path d="M 60,50 C 65,40 76,24 88,26 C 76,34 70,44 65,52 Z" fill="#A855F7" />
      <ellipse cx="56" cy="46" rx="12" ry="10" fill="url(#pteroPurple)" />

      {/* Long Cute Beak */}
      <polygon points="52,48 24,54 48,54" fill="#FBBF24" />

      {/* Big Eyes */}
      <circle cx="54" cy="42" r="4.2" fill="#FFFFFF" />
      <circle cx="53" cy="42" r="2.2" fill="#0F172A" />
      <circle cx="52" cy="40.8" r="0.9" fill="#FFFFFF" />

      {/* Little Feet */}
      <path d="M 52,86 L 48,94" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 68,86 L 72,94" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

/**
 * 6. 星空月亮小兔 (Moon Bunny)
 * 星空銀河舞會夥伴：潔白絨毛、戴著金色星星皇冠、擁抱著一顆發光的鵝黃色星辰
 */
export const MoonBunnySvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 90,
}) => {
  return (
    <svg
      viewBox="0 0 120 130"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>

      {/* Long Bunny Ears */}
      <ellipse cx="44" cy="28" rx="8" ry="24" transform="rotate(-12 44 28)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <ellipse cx="44" cy="28" rx="4" ry="15" transform="rotate(-12 44 28)" fill="#F472B6" opacity="0.4" />
      <ellipse cx="76" cy="28" rx="8" ry="24" transform="rotate(12 76 28)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <ellipse cx="76" cy="28" rx="4" ry="15" transform="rotate(12 76 28)" fill="#F472B6" opacity="0.4" />

      {/* Fluffy Body */}
      <circle cx="60" cy="85" r="28" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

      {/* Head */}
      <circle cx="60" cy="54" r="24" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

      {/* Rosy Cheeks & Cute Face */}
      <circle cx="48" cy="58" r="4.5" fill="#FB7185" opacity="0.5" />
      <circle cx="72" cy="58" r="4.5" fill="#FB7185" opacity="0.5" />
      <ellipse cx="52" cy="50" rx="3.5" ry="4.5" fill="#1E293B" />
      <circle cx="51" cy="48.5" r="1.3" fill="#FFFFFF" />
      <ellipse cx="68" cy="50" rx="3.5" ry="4.5" fill="#1E293B" />
      <circle cx="67" cy="48.5" r="1.3" fill="#FFFFFF" />

      {/* Tiny Pink Nose */}
      <polygon points="60,54 57,51 63,51" fill="#F472B6" />
      <path d="M 57,58 Q 60,61 63,58" fill="none" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />

      {/* Glowing Star Held in Paws */}
      <g transform="translate(60, 84)">
        <circle cx="0" cy="0" r="16" fill="url(#starGlow)" className="animate-pulse" opacity="0.4" />
        <polygon
          points="0,-14 4,-4 14,-3 6,4 9,14 0,8 -9,14 -6,4 -14,-3 -4,-4"
          fill="url(#starGlow)"
          stroke="#FFFFFF"
          strokeWidth="1"
        />
        {/* Paws grasping the star */}
        <circle cx="-11" cy="0" r="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
        <circle cx="11" cy="0" r="4.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
      </g>
    </svg>
  );
};

/**
 * 7. 古典指揮家 Kai (Conductor Kai)
 * 古典大音樂廳夥伴：身著皇家深藍晚禮服、金色領結、手持指揮棒揮舞出五線譜金光
 */
export const ConductorKaiSvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 110,
}) => {
  return (
    <svg
      viewBox="0 0 140 160"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="tuxedoCoat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Tuxedo Tails in Back */}
      <path d="M 50,110 L 40,145 L 60,132 Z" fill="url(#tuxedoCoat)" />
      <path d="M 90,110 L 100,145 L 80,132 Z" fill="url(#tuxedoCoat)" />

      {/* Body & Shirt */}
      <rect x="46" y="80" width="48" height="46" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      {/* Tuxedo Lapels */}
      <path d="M 44,80 L 60,116 L 44,116 Z" fill="url(#tuxedoCoat)" />
      <path d="M 96,80 L 80,116 L 96,116 Z" fill="url(#tuxedoCoat)" />

      {/* Golden Royal Bowtie */}
      <polygon points="64,88 64,96 70,92" fill="#F59E0B" />
      <polygon points="76,88 76,96 70,92" fill="#F59E0B" />
      <circle cx="70" cy="92" r="2.5" fill="#FDE047" />

      {/* Head */}
      <ellipse cx="70" cy="50" rx="26" ry="24" fill="#FED7AA" />
      {/* Hair */}
      <path
        d="M 44,48 C 40,24 60,14 70,14 C 82,14 100,24 96,48 C 92,34 82,30 70,30 C 58,30 48,36 44,48 Z"
        fill="#0F172A"
      />

      {/* Eyes & Smile */}
      <ellipse cx="60" cy="48" rx="4" ry="5.5" fill="#0F172A" />
      <circle cx="58.5" cy="46" r="1.5" fill="#FFFFFF" />
      <ellipse cx="80" cy="48" rx="4" ry="5.5" fill="#0F172A" />
      <circle cx="78.5" cy="46" r="1.5" fill="#FFFFFF" />
      <circle cx="52" cy="55" r="4" fill="#FB7185" opacity="0.45" />
      <circle cx="88" cy="55" r="4" fill="#FB7185" opacity="0.45" />
      <path d="M 64,57 Q 70,64 76,57" fill="none" stroke="#9F1239" strokeWidth="2.2" strokeLinecap="round" />

      {/* Right Arm Holding Golden Baton with Swirling Ribbon */}
      <g className="animate-baton-wave">
        <path d="M 88,90 Q 110,80 120,70" fill="none" stroke="#FED7AA" strokeWidth="6" strokeLinecap="round" />
        {/* Baton Stick */}
        <line x1="120" y1="70" x2="136" y2="40" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        <circle cx="136" cy="40" r="3" fill="#FFFFFF" />
        {/* Swirling Golden Sparkle Note Arc */}
        <path d="M 136,40 Q 150,20 125,10" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
        <text x="126" y="8" fontSize="12" fill="#F59E0B">𝄞</text>
      </g>
    </svg>
  );
};

/**
 * 8. 田園小綿羊 (Happy Lamb)
 * 農場鄉村夥伴：如白雲般蓬鬆的捲捲羊毛、粉嫩小蹄子、頭戴向日葵花環
 */
export const HappyLambSvg: React.FC<DancerSvgProps> = ({
  className = '',
  size = 85,
}) => {
  return (
    <svg
      viewBox="0 0 120 110"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <radialGradient id="lambWool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </radialGradient>
      </defs>

      {/* Cloud-shaped Fluffy Wool Body */}
      <g fill="url(#lambWool)" stroke="#E2E8F0" strokeWidth="1.2">
        <circle cx="60" cy="65" r="28" />
        <circle cx="42" cy="56" r="16" />
        <circle cx="78" cy="56" r="16" />
        <circle cx="44" cy="76" r="15" />
        <circle cx="76" cy="76" r="15" />
        <circle cx="60" cy="84" r="15" />
      </g>

      {/* Little Hooves */}
      <rect x="42" y="88" width="8" height="14" rx="4" fill="#334155" />
      <rect x="70" y="88" width="8" height="14" rx="4" fill="#334155" />

      {/* Cute Head */}
      <ellipse cx="60" cy="46" rx="16" ry="14" fill="#FCE7F3" />
      {/* Drooping Ears */}
      <ellipse cx="44" cy="44" rx="8" ry="4" transform="rotate(30 44 44)" fill="#FCE7F3" />
      <ellipse cx="76" cy="44" rx="8" ry="4" transform="rotate(-30 76 44)" fill="#FCE7F3" />

      {/* Wool Toupee on Head */}
      <circle cx="56" cy="34" r="7" fill="#FFFFFF" />
      <circle cx="64" cy="34" r="7" fill="#FFFFFF" />
      <circle cx="60" cy="31" r="6" fill="#FFFFFF" />

      {/* Cheerful Eyes & Smile */}
      <ellipse cx="54" cy="45" rx="3" ry="4" fill="#1E293B" />
      <circle cx="53" cy="44" r="1" fill="#FFFFFF" />
      <ellipse cx="66" cy="45" rx="3" ry="4" fill="#1E293B" />
      <circle cx="65" cy="44" r="1" fill="#FFFFFF" />
      <circle cx="48" cy="50" r="3.5" fill="#FB7185" opacity="0.5" />
      <circle cx="72" cy="50" r="3.5" fill="#FB7185" opacity="0.5" />
      <path d="M 57,52 Q 60,56 63,52" fill="none" stroke="#BE185D" strokeWidth="1.8" strokeLinecap="round" />

      {/* Sunflower Pin */}
      <g transform="translate(72, 32)">
        <circle cx="0" cy="0" r="5" fill="#F59E0B" />
        <circle cx="0" cy="0" r="2.5" fill="#78350F" />
      </g>
    </svg>
  );
};
