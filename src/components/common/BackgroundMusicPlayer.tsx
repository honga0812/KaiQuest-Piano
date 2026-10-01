import React, { useState, useEffect } from 'react';
import { bgmManager } from '../../audio/bgmManager';

interface BackgroundMusicPlayerProps {
  currentTab: string;
  className?: string;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  currentTab,
  className = '',
}) => {
  const [state, setState] = useState(bgmManager.getState());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsub = bgmManager.subscribe(() => {
      setState(bgmManager.getState());
    });
    return unsub;
  }, []);

  // Auto-pause during lesson view so pitch detection and playing are pristine
  useEffect(() => {
    if (currentTab === 'lesson') {
      bgmManager.pauseForLesson();
    } else {
      bgmManager.resumeFromLesson();
    }
  }, [currentTab]);

  const isLesson = currentTab === 'lesson';

  return (
    <div
      className={`fixed bottom-2 left-3 sm:left-4 z-40 select-none transition-all duration-300 ${
        isLesson ? 'opacity-85 pointer-events-auto' : 'opacity-100'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-400/40 shadow-xl text-xs">
        {/* Animated Icon */}
        <button
          onClick={() => {
            if (isLesson) return;
            bgmManager.toggle();
          }}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            state.isPlaying
              ? 'bg-amber-400 text-slate-950 animate-pulse shadow-md shadow-amber-400/50'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={isLesson ? '進入演奏關卡中，背景音樂已自動靜音' : state.isPlaying ? '暫停背景音樂' : '播放背景音樂'}
        >
          {isLesson ? (
            <span className="text-xs">🤫</span>
          ) : state.isPlaying ? (
            <span className="text-xs animate-bounce">🎶</span>
          ) : (
            <span className="text-xs">▶️</span>
          )}
        </button>

        {/* Track Info or Lesson Notice */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer flex flex-col text-left pr-1"
        >
          {isLesson ? (
            <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>關卡練琴中</span>
              <span className="text-slate-400 font-normal hidden sm:inline">(已自動靜音)</span>
            </span>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <span className="font-black text-[11px] text-amber-200 truncate max-w-[110px] sm:max-w-[150px]">
                  {state.currentTrack.name}
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono hidden sm:inline">
                  {state.isPlaying ? '播放中' : '已暫停'}
                </span>
              </div>
              <span className="text-[9px] text-slate-400">
                {state.currentTrack.composer} · 輕柔BGM
              </span>
            </>
          )}
        </div>

        {/* Action Controls */}
        {!isLesson && (
          <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
            <button
              onClick={() => bgmManager.nextTrack()}
              className="p-1 hover:text-amber-300 text-slate-400 transition"
              title="下一首背景音樂"
            >
              ⏭️
            </button>
            <button
              onClick={() => {
                if (state.volume > 0) {
                  bgmManager.setVolume(0);
                } else {
                  bgmManager.setVolume(0.12);
                }
              }}
              className="p-1 hover:text-amber-300 text-slate-400 transition text-[11px]"
              title={state.volume === 0 ? '取消靜音' : '靜音背景音樂'}
            >
              {state.volume === 0 ? '🔇' : '🔉'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
