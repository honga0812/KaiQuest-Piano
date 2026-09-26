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
  noiseThreshold = 0.0022,
  isAboveThreshold = false,
  className = '',
}) => {
  // Cents clamped between -50 and 50
  const clampedCents = Math.max(-50, Math.min(50, centsOff));
  // Needle position percentage (0% = -50 cents, 50% = 0 cents center, 100% = +50 cents)
  const needlePercent = ((clampedCents + 50) / 100) * 100;
  // Volume bar: calibrated for iPad & gentle piano
  const rmsPercent = Math.min(100, Math.round((rmsLevel / 0.025) * 100));
  const thresholdPercent = Math.min(95, Math.max(5, Math.round((noiseThreshold / 0.025) * 100)));

  const isPitchCentered = Math.abs(clampedCents) <= 18;
  const isMatchTarget = targetNoteName && currentDetectedNoteName === targetNoteName;

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border-2 border-amber-300 text-xs md:text-sm shadow-sm select-none ${className}`}>
      {/* Zone 1: Detected Note and Target comparison */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-black text-xs md:text-sm">聽到的音:</span>
          {currentDetectedNoteName ? (
            <span className={`px-3 py-1 rounded-xl font-mono font-black text-base md:text-lg shadow-sm border-2 ${
              isMatchTarget
                ? 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-2 ring-emerald-300 animate-pulse'
                : 'bg-amber-50 text-slate-900 border-amber-300'
            }`}>
              {currentDetectedNoteName}
              {frequencyHz > 0 && <span className="text-xs text-slate-500 ml-1.5 font-bold">{Math.round(frequencyHz)}Hz</span>}
            </span>
          ) : (
            <span className="text-slate-500 font-bold text-xs md:text-sm">
              {isListening ? '🎙️ 正在聆聽實體鋼琴聲...' : '尚未啟動麥克風'}
            </span>
          )}
        </div>

        {targetNoteName && (
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <span>目標:</span>
            <span className="font-mono font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300 text-sm">
              {targetNoteName}
            </span>
          </div>
        )}
      </div>

      {/* Zone 2: Tuner Cent Needle Gauge */}
      <div className="flex-1 w-full max-w-sm flex flex-col gap-1 px-2">
        <div className="flex justify-between text-xs text-slate-600 font-mono font-bold">
          <span>-50¢ 偏低</span>
          <span className={isPitchCentered && currentDetectedNoteName ? 'text-emerald-700 font-black' : 'text-slate-700'}>
            {currentDetectedNoteName ? `${centsOff > 0 ? '+' : ''}${centsOff}¢` : '0¢ 中央'}
          </span>
          <span>+50¢ 偏高</span>
        </div>

        {/* Needle Track */}
        <div className="relative h-3 bg-amber-50 rounded-full overflow-hidden border-2 border-amber-200 shadow-inner">
          {/* Center Sweet Spot */}
          <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-emerald-200/70" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-emerald-600 z-10" />

          {/* Dynamic Needle */}
          {currentDetectedNoteName && (
            <div
              className={`absolute top-0 bottom-0 w-2.5 -ml-1 rounded-full transition-all duration-100 shadow-md ${
                isPitchCentered ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ left: `${needlePercent}%` }}
            />
          )}
        </div>
      </div>

      {/* Zone 3: Guidance Hint, Mic Status & Level */}
      <div className="flex items-center gap-3 shrink-0">
        {!isListening && onActivateMic ? (
          <button
            onClick={onActivateMic}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-xl text-xs md:text-sm shadow-md animate-pulse active:scale-95"
          >
            🎙️ 點擊啟用麥克風聽琴
          </button>
        ) : (
          <div className="text-right">
            {currentDetectedNoteName ? (
              isMatchTarget ? (
                isStable ? (
                  <span className="text-emerald-700 font-black">
                    🌟 音準精準！
                  </span>
                ) : (
                  <span className="text-amber-800 font-bold">
                    保持一下～
                  </span>
                )
              ) : (
                <span className="text-slate-600 font-bold">
                  彈奏目標是 {targetNoteName || '下個音'}
                </span>
              )
            ) : (
              <span className="text-slate-500 text-xs font-bold">
                {isListening
                  ? isAboveThreshold
                    ? '🎹 偵測到音聲，辨識中...'
                    : '🔇 正在過濾房間雜音...'
                  : '請在鋼琴上彈奏琴鍵'}
              </span>
            )}
          </div>
        )}

        {/* Input Volume VU Meter with Threshold Marker */}
        <div className="flex items-center gap-1.5" title={`麥克風音量: ${rmsPercent}% (門檻: ${thresholdPercent}%)`}>
          <span className="text-base">🎙️</span>
          <div className="relative w-16 h-3 bg-amber-50 rounded-full overflow-hidden border border-amber-300">
            {/* Active Volume Level */}
            <div
              className={`h-full transition-all duration-75 ${
                isAboveThreshold ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm' : 'bg-slate-300'
              }`}
              style={{ width: `${rmsPercent}%` }}
            />
            {/* Threshold Gate Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-rose-500 z-10"
              style={{ left: `${thresholdPercent}%` }}
              title="觸發辨識門檻"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
