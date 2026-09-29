import React from 'react';

// =========================================================================
// Safari / iPadOS Safe Vector Musical Symbols & Standard Engraved Glyphs
// 100% vector SVGs: Resolves missing glyphs, tofu boxes and misalignment in Safari
// Standard Music Engraving Geometry (SMuFL / Classical Reference)
// =========================================================================

// High-fidelity standard G-Clef (Treble Clef) vector path
// Designed so that at scale 1 and baseline on Line 2 (Y=54 when lineSpacing=18, staffTopY=0):
// The central spiral encircles Line 2, the top loops over Line 5, the bottom hooks below Line 1.
export const TREBLE_CLEF_PATH =
  "m12.049 3.5296c0.305 3.1263-2.019 5.6563-4.0772 7.7014-0.9349 0.897-0.155 0.148-0.6437 0.594-0.1022-0.479-0.2986-1.731-0.2802-2.11 0.1304-2.6939 2.3198-6.5875 4.2381-8.0236 0.309 0.5767 0.563 0.6231 0.763 1.8382zm0.651 16.142c-1.232-0.906-2.85-1.144-4.3336-0.885-0.1913-1.255-0.3827-2.51-0.574-3.764 2.3506-2.329 4.9066-5.0322 5.0406-8.5394 0.059-2.232-0.276-4.6714-1.678-6.4836-1.7004 0.12823-2.8995 2.156-3.8019 3.4165-1.4889 2.6705-1.1414 5.9169-0.57 8.7965-0.8094 0.952-1.9296 1.743-2.7274 2.734-2.3561 2.308-4.4085 5.43-4.0046 8.878 0.18332 3.334 2.5894 6.434 5.8702 7.227 1.2457 0.315 2.5639 0.346 3.8241 0.099 0.2199 2.25 1.0266 4.629 0.0925 6.813-0.7007 1.598-2.7875 3.004-4.3325 2.192-0.5994-0.316-0.1137-0.051-0.478-0.252 1.0698-0.257 1.9996-1.036 2.26-1.565 0.8378-1.464-0.3998-3.639-2.1554-3.358-2.262 0.046-3.1904 3.14-1.7356 4.685 1.3468 1.52 3.833 1.312 5.4301 0.318 1.8125-1.18 2.0395-3.544 1.8325-5.562-0.07-0.678-0.403-2.67-0.444-3.387 0.697-0.249 0.209-0.059 1.193-0.449 2.66-1.053 4.357-4.259 3.594-7.122-0.318-1.469-1.044-2.914-2.302-3.792zm0.561 5.757c0.214 1.991-1.053 4.321-3.079 4.96-0.136-0.795-0.172-1.011-0.2626-1.475-0.4822-2.46-0.744-4.987-1.116-7.481 1.6246-0.168 3.4576 0.543 4.0226 2.184 0.244 0.577 0.343 1.197 0.435 1.812zm-5.1486 5.196c-2.5441 0.141-4.9995-1.595-5.6343-4.081-0.749-2.153-0.5283-4.63 0.8207-6.504 1.1151-1.702 2.6065-3.105 4.0286-4.543 0.183 1.127 0.366 2.254 0.549 3.382-2.9906 0.782-5.0046 4.725-3.215 7.451 0.5324 0.764 1.9765 2.223 2.7655 1.634-1.102-0.683-2.0033-1.859-1.8095-3.227-0.0821-1.282 1.3699-2.911 2.6513-3.198 0.4384 2.869 0.9413 6.073 1.3797 8.943-0.5054 0.1-1.0211 0.143-1.536 0.143z";

// High-fidelity standard F-Clef (Bass Clef) body path
// Normalized so Line 5 is at Y=0, Line 4 is at Y=18, Line 3 at Y=36, Line 2 at Y=54, Line 1 at Y=72
export const BASS_CLEF_BODY_PATH =
  "M 1.2 57.0 C 6.0 53.7 9.6 51.2 11.9 49.5 C 14.2 47.8 16.7 45.7 19.2 43.2 C 21.7 40.7 23.8 37.9 25.5 34.7 " +
  "C 26.8 32.4 28.0 29.7 29.0 26.7 C 29.9 23.7 30.4 20.7 30.5 18.0 C 30.5 15.4 30.1 12.9 29.4 10.6 C 28.8 8.2 27.6 6.3 26.0 4.8 " +
  "C 24.3 3.2 22.2 2.5 19.5 2.5 C 17.0 2.5 14.6 3.0 12.3 4.0 C 10.1 5.0 8.5 6.7 7.6 9.0 C 7.6 9.2 7.5 9.5 7.3 9.9 " +
  "C 7.4 10.4 7.6 10.7 8.1 11.0 C 8.5 11.3 8.9 11.4 9.3 11.4 C 9.5 11.4 10.0 11.3 10.8 11.1 C 11.6 11.0 12.3 10.8 12.8 10.8 " +
  "C 14.4 10.8 15.9 11.4 17.2 12.5 C 18.5 13.7 19.1 15.0 19.1 16.7 C 19.1 17.8 18.8 18.9 18.1 19.9 C 17.5 20.9 16.6 21.8 15.5 22.3 " +
  "C 14.3 22.9 13.1 23.2 11.7 23.2 C 9.3 23.2 7.2 22.5 5.5 21.0 C 3.8 19.5 3.0 17.5 3.0 15.1 C 3.0 12.1 3.9 9.4 5.8 7.1 " +
  "C 7.7 4.9 10.1 3.2 13.0 2.1 C 15.9 0.9 18.8 0.4 21.8 0.4 C 25.1 0.4 28.2 1.2 31.1 2.9 C 34.0 4.5 36.3 6.8 38.0 9.6 " +
  "C 39.7 12.5 40.6 15.6 40.6 18.9 C 40.6 24.7 38.7 30.1 34.7 35.2 C 30.8 40.2 26.0 44.6 20.3 48.3 C 16.4 50.8 10.2 54.2 1.6 58.5 L 1.2 57.0 Z";

// -------------------------------------------------------------------------
// Inline SVG Glyphs (to be placed directly inside a Staff <svg> element)
// Standardized so (x, y) specifies the (left position, Line 5 Y-coordinate).
// lineSpacing is default 18px.
// -------------------------------------------------------------------------

export interface InlineStaffGlyphProps {
  x?: number;
  y?: number; // Y coordinate of Staff Line 5 (top line)
  lineSpacing?: number; // Default 18px
  scale?: number;
  color?: string;
  className?: string;
}

/**
 * TrebleClefGlyph
 * Standard Classical G-Clef.
 * Positions: when y = Line 5, Line 2 is exactly encircled by the inner spiral loop.
 */
export const TrebleClefGlyph: React.FC<InlineStaffGlyphProps> = ({
  x = 0,
  y = 0,
  lineSpacing = 18,
  scale = 1,
  color = '#1E293B',
}) => {
  // At lineSpacing=18: scale factor is 3.6, and topY offset is -42.48.
  const baseScale = 3.6 * (lineSpacing / 18) * scale;
  const offsetY = -42.48 * (lineSpacing / 18) * scale;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform={`translate(0, ${offsetY}) scale(${baseScale})`}>
        <path d={TREBLE_CLEF_PATH} fill={color} />
      </g>
    </g>
  );
};

/**
 * BassClefGlyph
 * Standard Classical F-Clef.
 * Positions: when y = Line 5, Line 4 passes directly through the head bulb and the midpoint of the two dots!
 */
export const BassClefGlyph: React.FC<InlineStaffGlyphProps> = ({
  x = 0,
  y = 0,
  lineSpacing = 18,
  scale = 1,
  color = '#1E293B',
}) => {
  const s = (lineSpacing / 18) * scale;

  // Space 4 center: y + 0.5 * lineSpacing
  // Space 3 center: y + 1.5 * lineSpacing
  // Line 4 is at:   y + 1.0 * lineSpacing
  const dotX = 47.5 * s;
  const upperDotY = 0.5 * lineSpacing;
  const lowerDotY = 1.5 * lineSpacing;
  const dotRadius = 3.8 * s;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform={`scale(${s})`}>
        <path d={BASS_CLEF_BODY_PATH} fill={color} />
      </g>
      {/* Upper Dot in Space 4 */}
      <circle cx={dotX} cy={upperDotY} r={dotRadius} fill={color} />
      {/* Lower Dot in Space 3 */}
      <circle cx={dotX} cy={lowerDotY} r={dotRadius} fill={color} />
    </g>
  );
};

/**
 * AltoClefGlyph
 * Standard Classical C-Clef.
 * Positions: when y = Line 5, Line 3 (Middle C) aligns precisely with the center indentation notch!
 */
export const AltoClefGlyph: React.FC<InlineStaffGlyphProps> = ({
  x = 0,
  y = 0,
  lineSpacing = 18,
  scale = 1,
  color = '#1E293B',
}) => {
  const s = (lineSpacing / 18) * scale;
  const staffHeight = 4 * lineSpacing;
  const middleY = 2 * lineSpacing; // Line 3 (Middle C)

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Left thick & thin vertical stem bars */}
      <rect x={4 * s} y={0} width={3.2 * s} height={staffHeight} rx={1.5 * s} fill={color} />
      <rect x={11 * s} y={0} width={6.5 * s} height={staffHeight} rx={1.8 * s} fill={color} />
      {/* Classical twin lobes meeting at Line 3 (Middle C) */}
      <path
        d={`M ${18 * s} 0
            C ${30 * s} 0, ${38 * s} ${lineSpacing * 0.6}, ${38 * s} ${lineSpacing * 1.0}
            C ${38 * s} ${lineSpacing * 1.5}, ${30 * s} ${lineSpacing * 1.9}, ${24 * s} ${middleY}
            C ${30 * s} ${middleY + lineSpacing * 0.1}, ${38 * s} ${lineSpacing * 2.5}, ${38 * s} ${lineSpacing * 3.0}
            C ${38 * s} ${lineSpacing * 3.4}, ${30 * s} ${staffHeight}, ${18 * s} ${staffHeight}
            L ${18 * s} ${staffHeight - 6 * s}
            C ${26 * s} ${staffHeight - 6 * s}, ${31 * s} ${lineSpacing * 3.3}, ${31 * s} ${lineSpacing * 3.0}
            C ${31 * s} ${lineSpacing * 2.7}, ${25 * s} ${middleY + 4 * s}, ${18 * s} ${middleY + 4 * s}
            L ${18 * s} ${middleY - 4 * s}
            C ${25 * s} ${middleY - 4 * s}, ${31 * s} ${lineSpacing * 1.3}, ${31 * s} ${lineSpacing * 1.0}
            C ${31 * s} ${lineSpacing * 0.7}, ${26 * s} ${6 * s}, ${18 * s} ${6 * s}
            Z`}
        fill={color}
      />
      {/* Center arrow notch pointing to Line 3 (Middle C) */}
      <polygon
        points={`${18 * s},${middleY} ${26 * s},${middleY - 6 * s} ${26 * s},${middleY + 6 * s}`}
        fill={color}
      />
    </g>
  );
};

// -------------------------------------------------------------------------
// Standalone SVG Icons (for cards, buttons, badges, educational explanations)
// -------------------------------------------------------------------------

export interface SvgSymbolProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const TrebleClefSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 48;
  return (
    <svg
      viewBox="0 0 54 130"
      width={numSize * 0.42}
      height={numSize}
      className={`inline-block select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <g transform="translate(0, 0) scale(3.2)">
        <path d={TREBLE_CLEF_PATH} fill={color} />
      </g>
    </svg>
  );
};

export const BassClefSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 48;
  return (
    <svg
      viewBox="0 0 55 64"
      width={numSize * 0.85}
      height={numSize}
      className={`inline-block select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <path d={BASS_CLEF_BODY_PATH} fill={color} />
      <circle cx="47.5" cy="9.8" r="3.8" fill={color} />
      <circle cx="47.5" cy="27.0" r="3.8" fill={color} />
    </svg>
  );
};

export const AltoClefSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 48;
  return (
    <svg
      viewBox="0 0 44 72"
      width={numSize * 0.62}
      height={numSize}
      className={`inline-block select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <rect x="3" y="0" width="3.2" height="72" rx="1.5" fill={color} />
      <rect x="10" y="0" width="6.5" height="72" rx="1.8" fill={color} />
      <path
        d="M 17 0
           C 29 0, 37 11, 37 18
           C 37 27, 29 34, 23 36
           C 29 38, 37 45, 37 54
           C 37 61, 29 72, 17 72
           L 17 66
           C 25 66, 30 59, 30 54
           C 30 48, 24 40, 17 40
           L 17 32
           C 24 32, 30 24, 30 18
           C 30 13, 25 6, 17 6
           Z"
        fill={color}
      />
      <polygon points="17,36 25,30 25,42" fill={color} />
    </svg>
  );
};

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
// Musical Rests (休止符)
// -------------------------------------------------------------------------

/**
 * WholeRestSvg (全休止符 𝄻)
 * Hangs below Line 4
 */
export const WholeRestSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 44,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 54 36"
    width={size}
    height={typeof size === 'number' ? size * 0.67 : size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    {/* Staff line reference */}
    <line x1="4" y1="12" x2="50" y2="12" stroke={color} strokeWidth="2.5" opacity="0.4" />
    {/* Block hanging below line */}
    <rect x="18" y="12" width="18" height="11" fill={color} rx="1" />
  </svg>
);

/**
 * HalfRestSvg (二分休止符 𝄼)
 * Sits on top of Line 3
 */
export const HalfRestSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 44,
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 54 36"
    width={size}
    height={typeof size === 'number' ? size * 0.67 : size}
    className={`inline-block select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle', display: 'inline-block' }}
  >
    {/* Staff line reference */}
    <line x1="4" y1="24" x2="50" y2="24" stroke={color} strokeWidth="2.5" opacity="0.4" />
    {/* Block sitting on line */}
    <rect x="18" y="13" width="18" height="11" fill={color} rx="1" />
  </svg>
);

/**
 * QuarterRestSvg (四分休止符 𝄽)
 * Classical lightning bolt glyph with curved hook
 */
export const QuarterRestSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 48;
  return (
    <svg
      viewBox="0 0 32 64"
      width={numSize * 0.5}
      height={numSize}
      className={`inline-block select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <path
        d="M 19 6 C 18 8 16 11 12 16 L 21 27 C 18 31 13 36 9 39 C 14 40 18 43 19 46 C 21 50 19 55 15 57 C 12 59 9 58 7 56 C 8 54 10 52 10 49 C 10 46 8 44 5 44 C 3 44 2 46 2 48 C 2 54 8 60 16 60 C 24 60 28 53 27 46 C 26 40 22 35 17 33 L 24 24 C 27 20 28 15 27 11 C 26 8 22 6 19 6 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * EighthRestSvg (八分休止符 𝄾)
 */
export const EighthRestSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 48,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 48;
  return (
    <svg
      viewBox="0 0 32 56"
      width={numSize * 0.57}
      height={numSize}
      className={`inline-block select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <circle cx="10" cy="14" r="5" fill={color} />
      <path
        d="M 12 17 C 16 20 20 21 23 18 L 11 50 C 10 52 8 52 7 50 L 19 18 C 16 18 13 16 12 14 Z"
        fill={color}
      />
    </svg>
  );
};

// -------------------------------------------------------------------------
// Accidentals (變音記號: ♯ ♭ ♮)
// -------------------------------------------------------------------------

/**
 * SharpSvg (升記號 ♯)
 */
export const SharpSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 36,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 36;
  return (
    <svg
      viewBox="0 0 36 54"
      width={numSize * 0.67}
      height={numSize}
      className={`inline-block select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      {/* Two vertical stems */}
      <line x1="12" y1="3" x2="12" y2="51" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="3" x2="24" y2="51" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Two upward-slanted thick horizontal crossbars */}
      <polygon points="5,24 31,19 31,25 5,30" fill={color} />
      <polygon points="5,35 31,30 31,36 5,41" fill={color} />
    </svg>
  );
};

/**
 * FlatSvg (降記號 ♭)
 */
export const FlatSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 36,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 36;
  return (
    <svg
      viewBox="0 0 32 54"
      width={numSize * 0.6}
      height={numSize}
      className={`inline-block select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <line x1="9" y1="4" x2="9" y2="48" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
      <path
        d="M 9 26 C 14 23 23 27 23 37 C 23 46 15 48 9 44 Z"
        fill={color}
      />
    </svg>
  );
};

/**
 * NaturalSvg (本位記號 ♮)
 */
export const NaturalSvg: React.FC<SvgSymbolProps> = ({
  className = '',
  size = 36,
  color = 'currentColor',
}) => {
  const numSize = typeof size === 'number' ? size : 36;
  return (
    <svg
      viewBox="0 0 32 54"
      width={numSize * 0.6}
      height={numSize}
      className={`inline-block select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle', display: 'inline-block' }}
    >
      <line x1="10" y1="4" x2="10" y2="40" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <line x1="22" y1="14" x2="22" y2="50" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <polygon points="10,18 22,14 22,20 10,24" fill={color} />
      <polygon points="10,34 22,30 22,36 10,40" fill={color} />
    </svg>
  );
};

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
