import React from 'react';

// =========================================================================
// Safari / iPadOS Safe Vector Musical Symbols & Illustrations
// 100% vector SVGs: Resolves missing glyphs, tofu boxes and misalignment in Safari
// =========================================================================

export const TREBLE_CLEF_PATH =
  "M24 112 C21 112 19 110 19 107 C19 104 21 102 24 102 C27 102 29 104 29 107 C29 110 27 112 24 112 Z " +
  "M24 102 C24 95 25 80 25 74 C21 72 17 68 15 62 C13 54 15 44 21 38 C23 35 25 33 25 30 " +
  "C25 24 22 17 19 17 C16 17 14 20 15 25 C16 27 18 29 18 31 C18 34 15 36 12 36 C8 36 5 32 5 26 " +
  "C5 15 12 6 22 6 C31 6 36 15 36 26 C36 34 32 44 26 53 L26 73 C30 75 35 79 37 84 C39 91 38 100 32 105 " +
  "C29 108 26 109 24 102 Z M24 62 C20 62 17 67 17 73 C17 80 21 85 26 86 L26 62 C25 62 24.5 62 24 62 Z";

export const BASS_CLEF_PATH =
  "M14 26 C14 23 16 21 19 21 C22 21 24 23 24 26 C24 29 22 31 19 31 C16 31 14 29 14 26 Z " +
  "M19 21 C28 21 36 26 36 36 C36 47 28 58 12 65 C10 66 9 64 10 63 " +
  "C22 55 28 47 28 37 C28 30 23 26 19 26 C15 26 11 29 11 34 " +
  "C11 39 15 42 19 42 C14 42 7 37 7 30 C7 21 14 15 23 15 " +
  "C34 15 43 23 43 35 C43 49 33 60 14 68 C11 69 9 67 11 65 " +
  "C28 56 36 46 36 35 C36 25 29 19 20 19 C18 19 16 20 14 21 Z";

// -------------------------------------------------------------------------
// Inline SVG Glyphs (to be placed directly inside an <svg> element)
// -------------------------------------------------------------------------

export interface InlineGlyphProps {
  x?: number;
  y?: number;
  scale?: number;
  color?: string;
  className?: string;
}

export const TrebleClefGlyph: React.FC<InlineGlyphProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  color = '#1E293B',
}) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path d={TREBLE_CLEF_PATH} fill={color} />
    </g>
  );
};

export const BassClefGlyph: React.FC<InlineGlyphProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  color = '#1E293B',
}) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path d={BASS_CLEF_PATH} fill={color} />
      <circle cx="48" cy="25" r="4.2" fill={color} />
      <circle cx="48" cy="43" r="4.2" fill={color} />
    </g>
  );
};

export const AltoClefGlyph: React.FC<InlineGlyphProps> = ({
  x = 0,
  y = 0,
  scale = 1,
  color = '#1E293B',
}) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x="6" y="8" width="3" height="54" rx="1.5" fill={color} />
      <rect x="13" y="8" width="6" height="54" rx="2" fill={color} />
      <path
        d="M19 10 C29 10 38 15 38 23 C38 29 32 34 25 35 C32 36 38 41 38 47 C38 55 29 60 19 60
           L19 54 C26 54 32 50 32 45 C32 40 26 37 20 37 L20 33 C26 33 32 30 32 25 C32 20 26 16 19 16 Z"
        fill={color}
      />
      <polygon points="20,35 28,30 28,40" fill={color} />
    </g>
  );
};

// -------------------------------------------------------------------------
// Standalone SVG Icons (to be placed in HTML / JSX containers)
// -------------------------------------------------------------------------

interface SvgSymbolProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const TrebleClefSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 40,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 44 116"
    width={typeof size === 'number' ? size * 0.45 : size}
    height={size}
    className={`inline-block select-none overflow-visible ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <path d={TREBLE_CLEF_PATH} fill={color} />
  </svg>
);

export const BassClefSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 40,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 58 72"
    width={typeof size === 'number' ? size * 0.8 : size}
    height={size}
    className={`inline-block select-none overflow-visible ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <path d={BASS_CLEF_PATH} fill={color} />
    <circle cx="48" cy="25" r="4.5" fill={color} />
    <circle cx="48" cy="43" r="4.5" fill={color} />
  </svg>
);

export const AltoClefSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 40,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 50 70"
    width={typeof size === 'number' ? size * 0.72 : size}
    height={size}
    className={`inline-block select-none overflow-visible ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <rect x="6" y="8" width="3.2" height="54" rx="1.5" fill={color} />
    <rect x="13" y="8" width="6.5" height="54" rx="2" fill={color} />
    <path
      d="M19 10 C29 10 38 15 38 23 C38 29 32 34 25 35 C32 36 38 41 38 47 C38 55 29 60 19 60
         L19 54 C26 54 32 50 32 45 C32 40 26 37 20 37 L20 33 C26 33 32 30 32 25 C32 20 26 16 19 16 Z"
      fill={color}
    />
    <polygon points="20,35 28,30 28,40" fill={color} />
  </svg>
);

// -------------------------------------------------------------------------
// Standalone Note Value Icons
// -------------------------------------------------------------------------

export const WholeNoteSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 44,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 48 34"
    width={size}
    height={typeof size === 'number' ? size * 0.7 : size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <g transform="rotate(-25 24 17)">
      <ellipse cx="24" cy="17" rx="18" ry="12" fill={color} />
      <ellipse cx="24" cy="17" rx="10.5" ry="4.8" fill="#FFFFFF" />
    </g>
  </svg>
);

export const HalfNoteSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 50,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 38 56"
    width={typeof size === 'number' ? size * 0.68 : size}
    height={size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <line x1="28" y1="44" x2="28" y2="4" stroke={color} strokeWidth="3.6" strokeLinecap="round" />
    <g transform="rotate(-25 16 44)">
      <ellipse cx="16" cy="44" rx="14" ry="9" fill={color} />
      <ellipse cx="16" cy="44" rx="8.5" ry="4.2" fill="#FFFFFF" />
    </g>
  </svg>
);

export const QuarterNoteSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 50,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 38 56"
    width={typeof size === 'number' ? size * 0.68 : size}
    height={size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <line x1="28" y1="44" x2="28" y2="4" stroke={color} strokeWidth="3.6" strokeLinecap="round" />
    <ellipse cx="16" cy="44" rx="13" ry="8.8" transform="rotate(-25 16 44)" fill={color} />
  </svg>
);

export const EighthNoteSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 50,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 46 56"
    width={typeof size === 'number' ? size * 0.8 : size}
    height={size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <line x1="24" y1="44" x2="24" y2="4" stroke={color} strokeWidth="3.6" strokeLinecap="round" />
    <path
      d="M24 4 C33 11 41 19 39 34 C36 25 30 21 24 18 Z"
      fill={color}
    />
    <ellipse cx="14" cy="44" rx="13" ry="8.8" transform="rotate(-25 14 44)" fill={color} />
  </svg>
);

export const SixteenthNoteSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 50,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 48 56"
    width={typeof size === 'number' ? size * 0.82 : size}
    height={size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <line x1="24" y1="44" x2="24" y2="4" stroke={color} strokeWidth="3.6" strokeLinecap="round" />
    <path
      d="M24 4 C33 10 41 17 39 28 C36 21 30 18 24 15 Z"
      fill={color}
    />
    <path
      d="M24 16 C33 22 41 29 39 40 C36 33 30 30 24 27 Z"
      fill={color}
    />
    <ellipse cx="14" cy="44" rx="13" ry="8.8" transform="rotate(-25 14 44)" fill={color} />
  </svg>
);

export const DottedHalfNoteSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 50,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 50 56"
    width={typeof size === 'number' ? size * 0.88 : size}
    height={size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <line x1="26" y1="44" x2="26" y2="4" stroke={color} strokeWidth="3.6" strokeLinecap="round" />
    <g transform="rotate(-25 15 44)">
      <ellipse cx="15" cy="44" rx="13" ry="8.5" fill={color} />
      <ellipse cx="15" cy="44" rx="8" ry="4" fill="#FFFFFF" />
    </g>
    <circle cx="41" cy="42" r="4.5" fill={color} />
  </svg>
);

export const BeamedEighthNotesSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 68 56"
    width={typeof size === 'number' ? size * 1.25 : size}
    height={size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <polygon points="20,6 56,6 56,13 20,13" fill={color} />
    <line x1="20" y1="44" x2="20" y2="6" stroke={color} strokeWidth="3.4" />
    <ellipse cx="12" cy="44" rx="11" ry="7.5" transform="rotate(-25 12 44)" fill={color} />
    <line x1="56" y1="44" x2="56" y2="6" stroke={color} strokeWidth="3.4" />
    <ellipse cx="48" cy="44" rx="11" ry="7.5" transform="rotate(-25 48 44)" fill={color} />
  </svg>
);

export const BeamedSixteenthNotesSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 108 56"
    width={typeof size === 'number' ? size * 2.0 : size}
    height={size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    <polygon points="18,4 96,4 96,9.5 18,9.5" fill={color} />
    <polygon points="18,13 96,13 96,18.5 18,18.5" fill={color} />
    {[0, 1, 2, 3].map((i) => {
      const xStem = 18 + i * 26;
      const xHead = 11 + i * 26;
      return (
        <g key={i}>
          <line x1={xStem} y1="44" x2={xStem} y2="4" stroke={color} strokeWidth="3" />
          <ellipse cx={xHead} cy="44" rx="9.5" ry="6.5" transform={`rotate(-25 ${xHead} 44)`} fill={color} />
        </g>
      );
    })}
  </svg>
);

// -------------------------------------------------------------------------
// Beat Duration Visualizer Bar (Shows active filled beat portions in 4/4)
// -------------------------------------------------------------------------

interface BeatDurationBarProps {
  beats: number; // 4, 2, 1, 0.5, 0.25, 3
  colorClass: string;
  label: string;
}

export const BeatDurationBar: React.FC<BeatDurationBarProps> = ({
  beats,
  colorClass,
  label,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full mt-3 pt-2.5 border-t border-slate-200/80">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
        <span>⏱️ 拍數長度圖解 (4/4 拍)</span>
        <span className="font-extrabold text-slate-800">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-6 w-full bg-slate-100 p-1 rounded-xl border border-slate-300">
        {[1, 2, 3, 4].map((beatNum) => {
          let fillFraction = 0;
          if (beats >= beatNum) {
            fillFraction = 1;
          } else if (beats > beatNum - 1) {
            fillFraction = beats - (beatNum - 1);
          }

          return (
            <div
              key={beatNum}
              className="relative h-full bg-white rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center"
            >
              {fillFraction > 0 && (
                <div
                  className={`absolute left-0 top-0 bottom-0 ${colorClass}`}
                  style={{ width: `${fillFraction * 100}%` }}
                />
              )}
              <span className="relative z-10 text-[10px] font-black text-slate-700">
                第{beatNum}拍
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
