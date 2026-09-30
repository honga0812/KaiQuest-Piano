import React, { useState, useEffect } from 'react';

export type KaiSpriteState = 'idle' | 'walking' | 'celebrating';

interface KaiSpriteProps {
  x: number;
  y: number;
  size?: number;
  facing?: 'left' | 'right';
  state?: KaiSpriteState;
  showMusicNotes?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * KaiSprite: Vector-based multi-frame Sprite Animation System for Explorer Kai.
 * Features:
 * - Real multi-frame walk cycle with swinging arms, alternating boots, bouncing backpack, and bobbing cap.
 * - Dynamic direction flipping (facing left or right).
 * - Animated musical particles trail when walking.
 * - Zero external bitmap dependencies, perfectly scalable SVG sprite.
 */
export const KaiSprite: React.FC<KaiSpriteProps> = ({
  x,
  y,
  size = 72,
  facing = 'right',
  state = 'idle',
  showMusicNotes = true,
  onClick,
  className = '',
}) => {
  // Sprite frame counter: 0, 1, 2, 3 for 4-phase walk cycle
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const intervalTime = state === 'walking' ? 180 : state === 'celebrating' ? 220 : 600;
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [state]);

  // Frame-dependent transforms for walking/celebrating
  // Walk cycle physics:
  // Frame 0: Right foot forward, left arm forward
  // Frame 1: Mid-stride lift, slight vertical bounce
  // Frame 2: Left foot forward, right arm forward
  // Frame 3: Mid-stride lift opposite, slight vertical bounce
  const legAngleL =
    state === 'walking'
      ? frame === 0 ? -22 : frame === 1 ? -6 : frame === 2 ? 24 : 8
      : state === 'celebrating'
      ? frame % 2 === 0 ? -12 : 8
      : 0;

  const legAngleR =
    state === 'walking'
      ? frame === 0 ? 24 : frame === 1 ? 8 : frame === 2 ? -22 : -6
      : state === 'celebrating'
      ? frame % 2 === 0 ? 12 : -8
      : 0;

  const armAngleL =
    state === 'walking'
      ? frame === 0 ? 25 : frame === 1 ? 5 : frame === 2 ? -25 : -5
      : state === 'celebrating'
      ? frame % 2 === 0 ? -45 : -30
      : -10;

  const armAngleR =
    state === 'walking'
      ? frame === 0 ? -25 : frame === 1 ? -5 : frame === 2 ? 25 : 5
      : state === 'celebrating'
      ? frame % 2 === 0 ? 45 : 30
      : 10;

  const bodyBounceY =
    state === 'walking'
      ? frame % 2 === 1 ? -3 : 0
      : state === 'celebrating'
      ? frame % 2 === 1 ? -7 : 0
      : frame % 2 === 1 ? -1 : 0;

  const capTilt =
    state === 'walking'
      ? frame === 0 ? -2 : frame === 2 ? 2 : 0
      : state === 'celebrating'
      ? frame % 2 === 0 ? -5 : 5
      : 0;

  const isFlipped = facing === 'left';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={`select-none cursor-pointer transition-transform duration-700 ease-out ${className}`}
      onClick={onClick}
    >
      {/* Musical footsteps & dust puff trail when walking */}
      {state === 'walking' && showMusicNotes && (
        <g opacity="0.85" className="pointer-events-none">
          <text
            x={isFlipped ? 28 : -28}
            y={frame % 2 === 0 ? -15 : -25}
            fontSize="12"
            fill="#F59E0B"
            fontWeight="bold"
            className="animate-pulse"
          >
            {frame % 2 === 0 ? '♪' : '♫'}
          </text>
          <ellipse
            cx={isFlipped ? 18 : -18}
            cy="28"
            rx={frame % 2 === 0 ? 7 : 4}
            ry={2}
            fill="#FDE68A"
            opacity="0.6"
          />
        </g>
      )}

      {/* Celebrating Star Burst */}
      {state === 'celebrating' && (
        <g opacity="0.9" className="pointer-events-none">
          <text x="-24" y="-36" fontSize="14" fill="#FBBF24" className="animate-spin">
            ✨
          </text>
          <text x="22" y="-32" fontSize="13" fill="#38BDF8">
            ⭐
          </text>
        </g>
      )}

      {/* Ground Contact Shadow */}
      <ellipse
        cx="0"
        cy="32"
        rx={size * 0.28}
        ry={size * 0.08}
        fill="#0F172A"
        opacity="0.22"
      />

      {/* Main Character Body (Flippable) */}
      <g
        transform={`scale(${isFlipped ? -1 : 1}, 1) translate(0, ${bodyBounceY})`}
        style={{ transformOrigin: '0 10px' }}
      >
        {/* Backpack (Explorer Gear) */}
        <rect
          x="-20"
          y="-6"
          width="12"
          height="20"
          rx="5"
          fill="#B45309"
          stroke="#78350F"
          strokeWidth="1.5"
        />
        <circle cx="-14" cy="4" r="3" fill="#F59E0B" />

        {/* Left Leg (Back) */}
        <g
          transform={`translate(-6, 12) rotate(${legAngleL})`}
          style={{ transformOrigin: '-6px 12px' }}
        >
          {/* Leg Pants */}
          <rect x="-4" y="0" width="8" height="15" rx="3" fill="#1E3A8A" />
          {/* Boot */}
          <ellipse cx="0" cy="16" rx="6" ry="4" fill="#78350F" />
          <path d="M -4,15 L 4,15 L 5,18 L -4,18 Z" fill="#451A03" />
        </g>

        {/* Right Leg (Front) */}
        <g
          transform={`translate(6, 12) rotate(${legAngleR})`}
          style={{ transformOrigin: '6px 12px' }}
        >
          {/* Leg Pants */}
          <rect x="-4" y="0" width="8" height="15" rx="3" fill="#2563EB" />
          {/* Boot */}
          <ellipse cx="1" cy="16" rx="6.5" ry="4" fill="#92400E" />
          <path d="M -3,15 L 5,15 L 6,18 L -3,18 Z" fill="#451A03" />
        </g>

        {/* Torso & Explorer Shirt */}
        <g>
          {/* Vest / Shirt */}
          <rect
            x="-14"
            y="-10"
            width="28"
            height="24"
            rx="7"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          {/* Inner Shirt Collar */}
          <path d="M -7,-10 L 0,-2 L 7,-10 Z" fill="#FFFFFF" />
          {/* Red Neckerchief / Scarf */}
          <circle cx="0" cy="-2" r="3.5" fill="#EF4444" />
          <path d="M -2,-2 L -4,4 L 0,2 Z" fill="#DC2626" />
          <path d="M 2,-2 L 4,4 L 0,2 Z" fill="#DC2626" />
        </g>

        {/* Left Arm */}
        <g
          transform={`translate(-13, -6) rotate(${armAngleL})`}
          style={{ transformOrigin: '-13px -6px' }}
        >
          <rect x="-3.5" y="0" width="7" height="16" rx="3.5" fill="#D97706" />
          {/* Hand */}
          <circle cx="0" cy="16" r="4.5" fill="#FED7AA" />
        </g>

        {/* Right Arm */}
        <g
          transform={`translate(13, -6) rotate(${armAngleR})`}
          style={{ transformOrigin: '13px -6px' }}
        >
          <rect x="-3.5" y="0" width="7" height="16" rx="3.5" fill="#F59E0B" />
          {/* Hand */}
          <circle cx="0" cy="16" r="4.5" fill="#FED7AA" />
        </g>

        {/* Head & Face */}
        <g transform={`translate(0, -22) rotate(${capTilt})`}>
          {/* Ears */}
          <circle cx="-13" cy="4" r="3.5" fill="#FED7AA" />
          <circle cx="13" cy="4" r="3.5" fill="#FED7AA" />

          {/* Face Circle */}
          <circle
            cx="0"
            cy="2"
            r="14"
            fill="#FED7AA"
            stroke="#FDBA74"
            strokeWidth="1.2"
          />

          {/* Rosy Cheeks */}
          <ellipse cx="-7" cy="6" rx="3" ry="2" fill="#FCA5A5" opacity="0.6" />
          <ellipse cx="7" cy="6" rx="3" ry="2" fill="#FCA5A5" opacity="0.6" />

          {/* Big Sparkly Eyes */}
          {state === 'celebrating' ? (
            // Smiling joyful curved eyes
            <g stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M -7,2 Q -4,-2 -1,2" />
              <path d="M 1,2 Q 4,-2 7,2" />
            </g>
          ) : (
            // Big enthusiastic anime eyes
            <g>
              <ellipse cx="-4" cy="2" rx="2.5" ry="3.5" fill="#0F172A" />
              <circle cx="-3" cy="0.8" r="1.1" fill="#FFFFFF" />
              <ellipse cx="4" cy="2" rx="2.5" ry="3.5" fill="#0F172A" />
              <circle cx="5" cy="0.8" r="1.1" fill="#FFFFFF" />
            </g>
          )}

          {/* Cheerful Smile */}
          <path
            d="M -4,8 Q 0,13 4,8"
            fill={state === 'celebrating' ? '#DC2626' : 'none'}
            stroke="#B91C1C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Brown Hair Fringe */}
          <path
            d="M -13,-4 Q -8,-10 0,-9 Q 8,-10 13,-4 Q 10,-3 6,-6 Q 0,-3 -6,-6 Z"
            fill="#78350F"
          />

          {/* Explorer Cap (Yellow / Orange Cap with Visor) */}
          <g>
            {/* Cap Dome */}
            <path
              d="M -13,-7 C -13,-18 13,-18 13,-7 Z"
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            {/* Cap Ribbon with Musical Note */}
            <path d="M -13,-7 L 13,-7 L 13,-4 L -13,-4 Z" fill="#EF4444" />
            <circle cx="0" cy="-6" r="3" fill="#FFFFFF" />
            <text x="0" y="-4" fontSize="5" textAnchor="middle" fill="#EF4444" fontWeight="bold">
              ♪
            </text>
            {/* Cap Visor pointing forward */}
            <path
              d="M -4,-4 Q 10,-5 16,-1 Q 12,2 4,-1 Z"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="1.2"
            />
          </g>
        </g>
      </g>
    </g>
  );
};
