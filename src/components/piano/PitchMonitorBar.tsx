import React from 'react';

interface PitchMonitorBarProps {
  currentDetectedNoteName: string;
  centsOff: number; // -50 to +50
  frequencyHz: number;
  rmsLevel: number;
  isStable: boolean;
  targetNoteName?: string;
  isListening?: boolean;
  onActivateMic?: () => void;
  noiseThreshold?: number;
  isAboveThreshold?: boolean;
  className?: string;
}

export const PitchMonitorBar: React.FC<PitchMonitorBarProps> = ({
  currentDetectedNoteName,
  centsOff,
  frequencyHz,
  rmsLevel,
  isStable,
  targetNoteName,
  isListening = true,
  onActivateMic,
  noiseThreshold = 0.005,
  isAboveThreshold = false,
  className = '',
}) => {
  // Cents clamped between -50 and 50
  const clampedCents = Math.max(-50, Math.min(50, centsOff));
  // Needle position percentage (0% = -50 cents, 50% = 0 cents center, 100% = +50 cents)
  const needlePercent = ((clampedCents + 50) / 100) * 100;
  // Volume bar: calibrated so normal gentle piano playing easily shows 20%~50%
  const rmsPercent = Math.min(100, Math.round((rmsLevel / 0.035) * 100));
  const thresholdPercent = Math.min(95, Math.max(5, Math.round((noiseThreshold / 0.035) * 100)));

  const isPitchCentered = Math.abs(clampedCents) <= 18;
  const isMatchTarget = targetNoteName && currentDetectedNoteName === targetNoteName;

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs shadow-md ${className}`}>
      {/* Zone 1: Detected Note and Target comparison */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-bold text-xs md:text-sm">聽到的音:</span>
          {currentDetectedNoteName ? (
            <span className={`px-3 py-1 rounded-lg font-mono font-black text-base md:text-xl ${
              isMatchTarget
                ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-500 shadow-md animate-pulse'
                : 'bg-slate-800 text-slate-100 border border-slate-700'
            }`}>
              {currentDetectedNoteName}
              {frequencyHz > 0 && <span className="text-xs text-slate-400 ml-1.5 font-normal">{Math.round(frequencyHz)}Hz</span>}
            </span>
          ) : (
            <span className="text-slate-400 italic font-mono text-xs md:text-sm">
              {isListening ? '🎙️ 正在聆聽鋼琴聲...' : '尚未啟動麥克風'}
            </span>
          )}
        </div>

        {targetNoteName && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>目標:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {targetNoteName}
            </span>
          </div>
        )}
      </div>

      {/* Zone 2: Tuner Cent Needle Gauge */}
      <div className="flex-1 w-full max-w-sm flex flex-col gap-1 px-2">
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>-50¢ 偏低</span>
          <span className={isPitchCentered && currentDetectedNoteName ? 'text-emerald-400 font-bold' : ''}>
            {currentDetectedNoteName ? `${centsOff > 0 ? '+' : ''}${centsOff}¢` : '0¢ 中央'}
          </span>
          <span>+50¢ 偏高</span>
        </div>

        {/* Needle Track */}
        <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          {/* Center Sweet Spot */}
          <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-emerald-500/25 rounded-sm" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-emerald-400 z-10" />

          {/* Dynamic Needle */}
          {currentDetectedNoteName && (
            <div
              className={`absolute top-0 bottom-0 w-2 -ml-1 rounded-full transition-all duration-100 ${
                isPitchCentered ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-amber-400'
              }`}
              style={{ left: `${needlePercent}%` }}
            />
          )}
        </div>
      </div>

      {/* Zone 3: Guidance Hint, Mic Status & Level */}
      <div className="flex items-center gap-3 shrink-0">
        {/* If mic not started yet, offer one-click activate button */}
        {!isListening && onActivateMic ? (
          <button
            onClick={onActivateMic}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md animate-pulse"
          >
            🎙️ 點擊啟用麥克風聽琴
          </button>
        ) : (
          <div className="text-right">
            {currentDetectedNoteName ? (
              isMatchTarget ? (
                isStable ? (
                  <span className="text-emerald-400 font-bold animate-pulse">
                    🌟 音準完美！
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium">
                    再保持一下～
                  </span>
                )
              ) : (
                <span className="text-slate-400">
                  目標是 {targetNoteName || '下個音'}
                </span>
              )
            ) : (
              <span className="text-slate-400 text-xs">
                {isListening
                  ? isAboveThreshold
                    ? '🎹 偵測到音聲，辨識中...'
                    : '🔇 正在過濾背景微弱雜音...'
                  : '請在鋼琴上彈奏琴鍵'}
              </span>
            )}
          </div>
        )}

        {/* Input Volume VU Meter with Threshold Marker */}
        <div className="flex items-center gap-1.5" title={`麥克風音量: ${rmsPercent}% (過濾閥值: ${thresholdPercent}%)`}>
          <svg className={`w-3.5 h-3.5 ${isListening ? (isAboveThreshold ? 'text-emerald-400 animate-pulse' : 'text-blue-400') : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <div className="relative w-14 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            {/* Active Volume Level */}
            <div
              className={`h-full transition-all duration-75 ${
                isAboveThreshold ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]' : 'bg-slate-600'
              }`}
              style={{ width: `${rmsPercent}%` }}
            />
            {/* Threshold Gate Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: `${thresholdPercent}%` }}
              title="噪音過濾閥值"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
