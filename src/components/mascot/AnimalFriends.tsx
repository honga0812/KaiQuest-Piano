import React from 'react';

export type CharacterFriend = 'kai' | 'eli_lion' | 'kabuto_beetle' | 'pico_dolphin' | 'rex_dino';

interface CharacterSvgProps {
  className?: string;
  size?: number | string;
  mood?: 'idle' | 'happy' | 'listening' | 'celebrating' | 'curious';
}

/**
 * 1. 探險家男孩 Kai (小琴童主角)
 * 依據故事板精準繪製：黑髮蓬鬆微捲、圓圓大眼、綠色探險背心（胸前有黃底深藍 "K" 字探險徽章）、
 * 白T恤、卡其短褲、胸前掛著藍色雙筒望遠鏡、黃色探險背包、金色放大鏡與指南針
 */
export const ExplorerKaiSvg: React.FC<CharacterSvgProps> = ({
  className = '',
  size = 120,
  mood = 'idle',
}) => {
  const isListening = mood === 'listening';
  const isCelebrating = mood === 'celebrating';
  const isHappy = mood === 'happy' || mood === 'celebrating';

  return (
    <svg
      viewBox="0 0 160 180"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        {/* Soft 3D Lighting Gradients */}
        <linearGradient id="kaiSkin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="kaiHair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="60%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="kaiVest" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#65A30D" />
          <stop offset="100%" stopColor="#4D7C0F" />
        </linearGradient>
        <linearGradient id="kaiBackpack" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="goldKBadge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        <linearGradient id="binocularsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Backpack visible behind shoulders */}
      <g id="backpack">
        <rect x="36" y="80" width="88" height="60" rx="20" fill="url(#kaiBackpack)" />
        <path d="M 44,95 C 44,80 116,80 116,95" stroke="#B45309" strokeWidth="4" fill="none" />
      </g>

      {/* Body & Shirt */}
      <rect x="52" y="90" width="56" height="54" rx="14" fill="#F8FAFC" />

      {/* Explorer Green Vest */}
      <g id="vest">
        {/* Left Vest Flap */}
        <path d="M 50,90 L 68,90 L 68,142 L 50,138 Z" fill="url(#kaiVest)" />
        {/* Right Vest Flap */}
        <path d="M 110,90 L 92,90 L 92,142 L 110,138 Z" fill="url(#kaiVest)" />
        {/* Vest Collar */}
        <path d="M 48,90 Q 80,104 112,90" fill="none" stroke="#365314" strokeWidth="3" />
        {/* Left Pocket */}
        <rect x="52" y="112" width="13" height="15" rx="3" fill="#3F6212" />
        {/* Right Pocket */}
        <rect x="95" y="112" width="13" height="15" rx="3" fill="#3F6212" />

        {/* Signature Round Yellow 'K' Badge on Right Chest */}
        <g id="k-badge" filter="url(#softGlow)">
          <circle cx="101" cy="98" r="7.5" fill="url(#goldKBadge)" stroke="#FFFFFF" strokeWidth="1.2" />
          <text
            x="101"
            y="101.5"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="sans-serif"
            fill="#0F172A"
            textAnchor="middle"
          >
            K
          </text>
        </g>
      </g>

      {/* Navy Blue Binoculars hanging on chest */}
      <g id="binoculars" transform="translate(71, 100)">
        {/* Strap */}
        <path d="M -16,-12 Q 9,-4 34,-12" fill="none" stroke="#0F172A" strokeWidth="2.2" />
        {/* Left & Right Barrels */}
        <rect x="0" y="2" width="8" height="20" rx="3.5" fill="url(#binocularsGrad)" stroke="#38BDF8" strokeWidth="0.8" />
        <rect x="10" y="2" width="8" height="20" rx="3.5" fill="url(#binocularsGrad)" stroke="#38BDF8" strokeWidth="0.8" />
        <rect x="6" y="8" width="6" height="5" rx="1" fill="#475569" />
        {/* Lens reflection */}
        <ellipse cx="4" cy="20" rx="2.5" ry="1.2" fill="#38BDF8" />
        <ellipse cx="14" cy="20" rx="2.5" ry="1.2" fill="#38BDF8" />
      </g>

      {/* Head and Neck */}
      <rect x="73" y="78" width="14" height="14" rx="4" fill="url(#kaiSkin)" />

      {/* Cute Head */}
      <g id="kai-head">
        {/* Face */}
        <ellipse cx="80" cy="54" rx="32" ry="28" fill="url(#kaiSkin)" />

        {/* Ears with inner detail */}
        <ellipse cx="48" cy="56" rx="5.5" ry="7" fill="url(#kaiSkin)" />
        <ellipse cx="49" cy="56" rx="2.5" ry="4" fill="#F472B6" opacity="0.4" />
        <ellipse cx="112" cy="56" rx="5.5" ry="7" fill="url(#kaiSkin)" />
        <ellipse cx="111" cy="56" rx="2.5" ry="4" fill="#F472B6" opacity="0.4" />

        {/* Rosy Cheeks */}
        <circle cx="59" cy="62" r="5.5" fill="#FB7185" opacity="0.4" />
        <circle cx="101" cy="62" r="5.5" fill="#FB7185" opacity="0.4" />

        {/* Eyebrows */}
        <path
          d={isListening ? "M 59,38 Q 67,36 73,40" : "M 60,39 Q 67,35 73,39"}
          fill="none"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={isCelebrating ? "M 87,40 Q 93,35 101,38" : "M 87,39 Q 93,35 100,39"}
          fill="none"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Big Sparkling Eyes (Warm Dark Brown with Dual Catchlights) */}
        <g id="eyes">
          {/* Left Eye */}
          <ellipse cx="66" cy="49" rx="7" ry="9" fill="#0F172A" />
          <ellipse cx="66" cy="52" rx="4" ry="4.5" fill="#78350F" />
          <circle cx="64" cy="46" r="2.8" fill="#FFFFFF" />
          <circle cx="68" cy="52" r="1.3" fill="#FFFFFF" />

          {/* Right Eye */}
          {mood === 'curious' ? (
            // Playful wink
            <path d="M 87,51 Q 94,46 101,51" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="94" cy="49" rx="7" ry="9" fill="#0F172A" />
              <ellipse cx="94" cy="52" rx="4" ry="4.5" fill="#78350F" />
              <circle cx="92" cy="46" r="2.8" fill="#FFFFFF" />
              <circle cx="96" cy="52" r="1.3" fill="#FFFFFF" />
            </>
          )}
        </g>

        {/* Cute Small Button Nose */}
        <ellipse cx="80" cy="56" rx="2" ry="1.5" fill="#C2410C" opacity="0.75" />

        {/* Cheerful Mouth */}
        {isHappy ? (
          <path
            d="M 70,62 Q 80,74 90,62 C 86,72 74,72 70,62 Z"
            fill="#E11D48"
            stroke="#9F1239"
            strokeWidth="1.2"
          />
        ) : (
          <path
            d="M 73,63 Q 80,68 87,63"
            fill="none"
            stroke="#9F1239"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Fluffy Black Layered Hair (Signature Style from Storyboard) */}
        <g id="hair">
          {/* Back Volume */}
          <path
            d="M 44,48 C 38,20 60,8 80,8 C 102,8 124,20 116,48 C 122,36 120,24 110,14 C 98,2 62,2 50,14 C 40,24 38,36 44,48 Z"
            fill="url(#kaiHair)"
          />
          {/* Front Bangs & Side Locks */}
          <path
            d="M 44,40 C 44,22 55,16 66,16 C 72,16 76,20 80,24 C 85,18 94,14 104,16 C 114,18 118,32 116,42 C 112,34 104,30 96,33 C 90,35 86,42 80,34 C 74,44 64,32 54,34 C 48,36 45,40 44,40 Z"
            fill="url(#kaiHair)"
          />
          {/* Left Hair Tuft Accent */}
          <path d="M 42,32 C 34,26 36,18 45,18 C 42,24 43,28 42,32 Z" fill="url(#kaiHair)" />
          {/* Right Hair Tuft Accent */}
          <path d="M 118,32 C 126,26 124,18 115,18 C 118,24 117,28 118,32 Z" fill="url(#kaiHair)" />
        </g>
      </g>

      {/* Explorer Magnifying Glass Held in Hand */}
      <g id="magnifying-glass" transform="translate(18, 70)">
        <ellipse cx="14" cy="14" rx="12" ry="12" fill="#E0F2FE" fillOpacity="0.45" stroke="#F59E0B" strokeWidth="3" />
        <line x1="23" y1="23" x2="36" y2="36" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" />
        {/* Glass reflection streak */}
        <path d="M 7,10 Q 14,5 20,8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
        {/* Hand holding glass */}
        <circle cx="30" cy="30" r="5" fill="url(#kaiSkin)" />
      </g>

      {/* Sparkles / Explorer Compass on Right */}
      {isCelebrating && (
        <g id="celebration-sparkles">
          <text x="130" y="40" fontSize="16" className="animate-ping">✨</text>
          <text x="14" y="45" fontSize="14" className="animate-bounce">⭐</text>
        </g>
      )}
    </svg>
  );
};

/**
 * 2. 暖暖獅子 Eli (Eli Lion)
 * 故事板角色：溫暖金黃身軀、圍繞頭部宛如花瓣般圓潤蓬鬆的橘色鬃毛、
 * 繫著水藍色 (Turquoise) 領巾、可愛圓眼與親切笑臉
 */
export const EliLionSvg: React.FC<CharacterSvgProps> = ({
  className = '',
  size = 110,
  mood = 'idle',
}) => {
  return (
    <svg
      viewBox="0 0 150 150"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="eliGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="eliMane" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>

      {/* Tail with tuft */}
      <path d="M 115,108 C 135,110 142,95 138,82" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
      <circle cx="138" cy="80" r="7" fill="url(#eliMane)" />

      {/* Back Body & Paws */}
      <rect x="62" y="85" width="56" height="42" rx="18" fill="url(#eliGold)" />
      <circle cx="70" cy="128" r="9" fill="url(#eliGold)" />
      <circle cx="108" cy="128" r="9" fill="url(#eliGold)" />
      <circle cx="86" cy="128" r="9" fill="url(#eliGold)" />

      {/* Signature Flower-Petal Fluffy Mane (8 Petal Lobes framing head) */}
      <g id="flower-mane">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 75 + Math.cos(rad) * 36;
          const cy = 60 + Math.sin(rad) * 36;
          return (
            <circle
              key={`petal-${idx}`}
              cx={cx}
              cy={cy}
              r="17"
              fill="url(#eliMane)"
              stroke="#EA580C"
              strokeWidth="1.2"
            />
          );
        })}
      </g>

      {/* Ears nestled in mane */}
      <circle cx="50" cy="38" r="9" fill="url(#eliGold)" />
      <circle cx="50" cy="38" r="4.5" fill="#7C2D12" opacity="0.6" />
      <circle cx="100" cy="38" r="9" fill="url(#eliGold)" />
      <circle cx="100" cy="38" r="4.5" fill="#7C2D12" opacity="0.6" />

      {/* Head */}
      <circle cx="75" cy="60" r="30" fill="url(#eliGold)" />

      {/* Rosy Cheeks */}
      <circle cx="57" cy="68" r="5" fill="#FB7185" opacity="0.45" />
      <circle cx="93" cy="68" r="5" fill="#FB7185" opacity="0.45" />

      {/* Eyes with specular shines */}
      <ellipse cx="64" cy="54" rx="4.8" ry="6.2" fill="#1E293B" />
      <circle cx="62.5" cy="52" r="2" fill="#FFFFFF" />
      <ellipse cx="86" cy="54" rx="4.8" ry="6.2" fill="#1E293B" />
      <circle cx="84.5" cy="52" r="2" fill="#FFFFFF" />

      {/* Cute Brown Nose & Mouth */}
      <polygon points="75,64 70,59 80,59" fill="#78350F" />
      <path d="M 75,64 L 75,68" stroke="#78350F" strokeWidth="1.5" />
      <path d="M 68,68 Q 75,74 82,68" fill="none" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" />

      {/* Turquoise/Teal Neckerchief (領巾) */}
      <g id="neckerchief">
        <path d="M 54,82 Q 75,94 96,82 Q 75,98 54,82 Z" fill="#0D9488" stroke="#115E59" strokeWidth="1.5" />
        <polygon points="75,92 71,104 79,104" fill="#14B8A6" />
      </g>
    </svg>
  );
};

/**
 * 3. 甲蟲小勇士 Kabuto (Kabuto Beetle)
 * 故事板角色：圓滾滾深藍色甲殼、點綴黃色斑點、帥氣單角向前翹起、大圓眼、六隻可愛小短腿
 */
export const KabutoBeetleSvg: React.FC<CharacterSvgProps> = ({
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
        <linearGradient id="kabutoShell" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="40%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Legs (6 short curved legs) */}
      <g stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d="M 38,72 L 26,88 L 18,92" />
        <path d="M 52,78 L 48,95 L 42,100" />
        <path d="M 72,78 L 74,95 L 80,100" />
        <path d="M 86,72 L 96,88 L 106,92" />
      </g>

      {/* Big Rounded Shell */}
      <ellipse cx="64" cy="62" rx="34" ry="26" fill="url(#kabutoShell)" />

      {/* Yellow Spot Decorations on Shell */}
      <circle cx="48" cy="54" r="3.5" fill="#FCD34D" opacity="0.95" />
      <circle cx="58" cy="68" r="4.2" fill="#FCD34D" opacity="0.95" />
      <circle cx="74" cy="56" r="3.8" fill="#FCD34D" opacity="0.95" />
      <circle cx="82" cy="68" r="3.2" fill="#FCD34D" opacity="0.95" />

      {/* Head & Horn */}
      <ellipse cx="88" cy="56" rx="14" ry="14" fill="#1E3A8A" />

      {/* Rhino Horn curving upward */}
      <path
        d="M 94,52 C 104,46 112,30 108,18 C 104,18 100,32 94,44 Z"
        fill="#1E40AF"
        stroke="#60A5FA"
        strokeWidth="1.2"
      />

      {/* Big Curious White Eyes */}
      <circle cx="92" cy="52" r="5.5" fill="#FFFFFF" />
      <circle cx="94" cy="52" r="2.8" fill="#0F172A" />
      <circle cx="93" cy="50.5" r="1.2" fill="#FFFFFF" />
    </svg>
  );
};

/**
 * 4. 躍動海豚 Pico (Pico Dolphin)
 * 故事板角色：活潑躍起的天空藍海豚、歡樂張嘴、橘色領圈、腳底有晶瑩剔透的翻騰水花
 */
export const PicoDolphinSvg: React.FC<CharacterSvgProps> = ({
  className = '',
  size = 100,
}) => {
  return (
    <svg
      viewBox="0 0 140 130"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="dolphinBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="waterSplash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Stylized Curved Water Wave Splash underneath */}
      <path
        d="M 10,120 Q 50,110 70,85 Q 90,60 110,68 C 100,85 70,115 10,120 Z"
        fill="url(#waterSplash)"
        opacity="0.85"
      />
      <circle cx="25" cy="108" r="3.5" fill="#E0F2FE" />
      <circle cx="45" cy="98" r="2.5" fill="#E0F2FE" />

      {/* Leaping Dolphin Body */}
      <g transform="translate(15, 10)">
        {/* Tail fin */}
        <path d="M 85,25 Q 96,15 102,8 Q 94,24 95,34 Q 96,44 104,48 Q 96,38 85,25 Z" fill="url(#dolphinBlue)" />

        {/* Main Body */}
        <path
          d="M 20,48 C 28,24 65,15 88,28 C 96,34 94,48 78,54 C 55,62 32,58 20,48 Z"
          fill="url(#dolphinBlue)"
        />

        {/* Flippers */}
        <path d="M 44,52 C 48,64 54,70 60,66 C 56,58 52,52 44,52 Z" fill="#0369A1" />

        {/* Dorsal Fin */}
        <path d="M 52,20 Q 62,6 68,14 Q 62,20 52,20 Z" fill="#0369A1" />

        {/* Cheerful Open Smiling Face */}
        <ellipse cx="26" cy="42" rx="3.5" ry="4.5" fill="#0F172A" />
        <circle cx="25" cy="40.5" r="1.2" fill="#FFFFFF" />
        <path d="M 12,48 Q 20,54 28,49" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />

        {/* Orange Collar/Harness */}
        <path d="M 34,36 Q 38,48 44,54" stroke="#F97316" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/**
 * 5. 森林小恐龍 Rex (Rex Dinosaur)
 * 故事板角色：橄欖綠小恐龍、背上有橘粉色圓形骨板突起、左手戴紫色腕帶、張嘴微笑
 */
export const RexDinoSvg: React.FC<CharacterSvgProps> = ({
  className = '',
  size = 100,
}) => {
  return (
    <svg
      viewBox="0 0 130 130"
      width={size}
      height={size}
      className={`overflow-visible select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="dinoGreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#84CC16" />
          <stop offset="100%" stopColor="#4D7C0F" />
        </linearGradient>
        <linearGradient id="dinoPlates" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Tail */}
      <path d="M 40,85 Q 20,95 10,88 Q 20,80 38,76 Z" fill="url(#dinoGreen)" />

      {/* Head Crest Plates (Orange rounded ridges) */}
      <circle cx="58" cy="22" r="7" fill="url(#dinoPlates)" />
      <circle cx="70" cy="20" r="8" fill="url(#dinoPlates)" />
      <circle cx="82" cy="24" r="6.5" fill="url(#dinoPlates)" />
      <circle cx="44" cy="45" r="5" fill="url(#dinoPlates)" />
      <circle cx="36" cy="62" r="4.5" fill="url(#dinoPlates)" />

      {/* Body & Legs */}
      <ellipse cx="58" cy="78" rx="26" ry="24" fill="url(#dinoGreen)" />
      <rect x="44" y="96" width="10" height="20" rx="5" fill="#365314" />
      <rect x="64" y="96" width="10" height="20" rx="5" fill="#365314" />

      {/* Big Cute Head */}
      <ellipse cx="76" cy="42" rx="22" ry="20" fill="url(#dinoGreen)" />
      <ellipse cx="88" cy="48" rx="14" ry="12" fill="url(#dinoGreen)" />

      {/* Big Curious Eye */}
      <circle cx="74" cy="38" r="6" fill="#1E293B" />
      <circle cx="72.5" cy="36" r="2" fill="#FFFFFF" />

      {/* Smiling Mouth with small teeth */}
      <path d="M 80,54 Q 92,58 98,50" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Purple Wristband on Little Arm */}
      <rect x="74" y="70" width="14" height="7" rx="3.5" fill="url(#dinoGreen)" />
      <rect x="80" y="69" width="4" height="9" rx="1.5" fill="#A855F7" />
    </svg>
  );
};

/**
 * 6. 故事板合影全家福橫幅 (Kai & All Animal Friends Ensemble)
 * 完美呼應上傳故事板的第 7、8 格全體探險家夥伴大集合！
 */
export const KaiAndFriendsEnsemble: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-end justify-center gap-2 sm:gap-4 p-3 select-none ${className}`}>
      {/* 1. 暖暖獅子 Eli */}
      <div className="flex flex-col items-center hover:scale-105 transition-transform">
        <EliLionSvg size={95} />
        <span className="text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mt-1 border border-amber-300">
          🦁 獅子 Eli
        </span>
      </div>

      {/* 2. 甲蟲小勇士 Kabuto */}
      <div className="flex flex-col items-center hover:scale-105 transition-transform mb-2">
        <KabutoBeetleSvg size={75} />
        <span className="text-[11px] font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full mt-1 border border-blue-300">
          🪲 甲蟲 Kabuto
        </span>
      </div>

      {/* 3. 探險家男孩主角 Kai (置中放大) */}
      <div className="flex flex-col items-center hover:scale-105 transition-transform -translate-y-2">
        <ExplorerKaiSvg size={140} mood="celebrating" />
        <span className="text-xs font-black text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-400 px-3 py-1 rounded-full shadow-sm mt-1 border border-white">
          🧭 探險家 Kai
        </span>
      </div>

      {/* 4. 躍動海豚 Pico */}
      <div className="flex flex-col items-center hover:scale-105 transition-transform">
        <PicoDolphinSvg size={90} />
        <span className="text-[11px] font-black text-sky-900 bg-sky-100 px-2 py-0.5 rounded-full mt-1 border border-sky-300">
          🐬 海豚 Pico
        </span>
      </div>

      {/* 5. 森林小恐龍 Rex */}
      <div className="flex flex-col items-center hover:scale-105 transition-transform">
        <RexDinoSvg size={90} />
        <span className="text-[11px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 border border-emerald-300">
          🦖 小恐龍 Rex
        </span>
      </div>
    </div>
  );
};
