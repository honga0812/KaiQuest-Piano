import React, { useEffect, useState } from 'react';
import { bgmEngine, BgmTrack } from '../../audio/backgroundMusic';

interface BgmBottomBarProps {
  currentTab: string;
}

export const BgmBottomBar: React.FC<BgmBottomBarProps> = ({ currentTab }) => {
  const [bgmState, setBgmState] = useState(() => bgmEngine.getState());

  useEffect(() => {
    const unsub = bgmEngine.subscribe(() => {
      setBgmState(bgmEngine.getState());
    });
    return unsub;
  }, []);

  // Auto pause BGM when entering lesson practice, auto resume when exiting
  useEffect(() => {
    if (currentTab === 'lesson') {
      bgmEngine.autoPauseForLesson();
    } else {
      bgmEngine.autoResumeFromLesson();
    }
  }, [currentTab]);

  // If in lesson, don't show the active playing bar to keep screen clean and focused
  if (currentTab === 'lesson') return null;

  return (
    <div className="fixed bottom-2.5 right-2.5 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-amber-300 shadow-lg text-slate-800 text-xs font-black select-none transition-all hover:shadow-xl">
      {/* Animated Music Note / Disc */}
      <button
        type="button"
        onClick={() => bgmEngine.togglePlay()}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
          bgmState.isPlaying
            ? 'bg-amber-400 text-slate-950 animate-spin-slow shadow-xs'
            : 'bg-slate-100 text-slate-500'
        }`}
        title={bgmState.isPlaying ? '暫停背景音樂' : '播放背景音樂'}
      >
        {bgmState.isPlaying ? '🎵' : '▶'}
      </button>

      {/* Track Name */}
      <div className="flex flex-col text-left max-w-[120px] sm:max-w-[170px] truncate">
        <span className="text-[10px] text-amber-800 font-mono leading-none">
          BGM 背景音樂
        </span>
        <span className="text-xs text-slate-900 truncate font-black leading-tight">
          {bgmState.currentTrack?.name || '輕音樂'}
        </span>
      </div>

      {/* Skip to Next Track */}
      <button
        type="button"
        onClick={() => bgmEngine.nextTrack()}
        className="w-6 h-6 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 flex items-center justify-center text-xs transition active:scale-95"
        title="切換下一首背景音樂"
      >
        ⏭
      </button>

      {/* Mute Toggle */}
      <button
        type="button"
        onClick={() => bgmEngine.toggleMute()}
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition active:scale-95 ${
          bgmState.isMuted
            ? 'bg-red-100 text-red-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        }`}
        title={bgmState.isMuted ? '取消靜音' : '靜音背景音樂'}
      >
        {bgmState.isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};
