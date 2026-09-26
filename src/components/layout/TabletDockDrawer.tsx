import React, { useState, useEffect } from 'react';
import { AgeBand, InputMode } from '../../types/piano';

interface TabletDockDrawerProps {
  currentTab: 'map' | 'lesson' | 'concert' | 'gym' | 'freeplay' | 'badges' | 'theory';
  onSelectTab: (tab: 'map' | 'concert' | 'gym' | 'freeplay' | 'badges' | 'theory') => void;
  userAge: AgeBand;
  onSelectAge: (age: AgeBand) => void;
  inputMode: InputMode;
  onOpenCalibration: () => void;
  onOpenScaleModal?: () => void;
  onOpenIPadModal: () => void;
  onOpenDeployModal: () => void;
  isMicListening: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const TabletDockDrawer: React.FC<TabletDockDrawerProps> = ({
  userAge,
  onSelectAge,
  inputMode,
  onOpenCalibration,
  onOpenScaleModal,
  onOpenIPadModal,
  onOpenDeployModal,
  isMicListening,
  isInstallable,
  isInstalled,
  onInstall,
  isOpen,
  onToggle,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && Boolean(document.fullscreenElement)
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
      };

      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  const inputModeLabelMap: Record<InputMode, { label: string; icon: string }> = {
    microphone: { label: '麥克風聽琴', icon: '🎙️' },
    midi: { label: 'USB MIDI 琴', icon: '🎹' },
    touch: { label: '觸控螢幕鍵盤', icon: '👆' },
  };

  return (
    <>
      {/* 1. True Viewport-Floating Follow Pill (吸附式隨屏浮動控制島) */}
      {/* 固定在視窗右下角，隨畫面滾動始終可見，專為平板拇指操作設計 */}
      <div className="fixed bottom-6 right-5 sm:right-7 z-[90] select-none pointer-events-auto shadow-2xl">
        <button
          onClick={onToggle}
          className={`flex items-center gap-3.5 px-5 py-3.5 rounded-full border-3 transition-all duration-300 transform active:scale-95 group shadow-xl ${
            isOpen
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-white text-white scale-105 shadow-blue-500/50'
              : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 border-white text-slate-950 shadow-amber-400/60'
          }`}
          title="開啟平板輔助控制島（年齡、麥克風、校準、全螢幕、離線包下載）"
          aria-expanded={isOpen}
        >
          {/* Age capsule */}
          <span className="w-9 h-9 rounded-full bg-white text-amber-900 font-black text-base flex items-center justify-center shadow-md">
            {userAge}歲
          </span>

          {/* Mode & Live status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                inputMode === 'microphone'
                  ? isMicListening
                    ? 'bg-emerald-400 shadow-[0_0_12px_#34D399] animate-pulse'
                    : 'bg-amber-700'
                  : 'bg-blue-600'
              }`}
            />
            <span className="text-base font-black tracking-tight">
              {isOpen ? '收起控制島' : '🎈 輔助工具'}
            </span>
          </div>

          <span className="text-xl group-hover:rotate-45 transition-transform duration-300">
            ⚙️
          </span>
        </button>
      </div>

      {/* 2. Slide-out Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-[95] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* 3. Floating Follow Dock Panel (亮色系活潑風格抽屜本體) */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-w-[92vw] bg-amber-50 border-l-4 border-amber-400 shadow-2xl z-[98] flex flex-col justify-between p-6 backdrop-blur-xl transition-transform duration-300 ease-out select-none overflow-y-auto text-left text-slate-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header - Cheerful & Bright */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 border-2 border-white flex items-center justify-center text-3xl shadow-md text-white">
              🎛️
            </span>
            <div>
              <h2 className="text-xl font-black text-amber-950">平板隨身控制島</h2>
              <p className="text-sm text-amber-800 font-bold">
                一鍵調校，隨時為小朋友打造專屬琴房！
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="w-11 h-11 rounded-full bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 flex items-center justify-center text-2xl font-black transition active:scale-95 shadow-sm border border-amber-200"
            title="關閉"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body - Large, Child-Friendly Controls */}
        <div className="flex flex-col gap-5 py-4 text-base">
          {/* Section A: Age Selector */}
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>👶</span>
                <span>學習年齡組別</span>
              </span>
              <span className="text-sm font-black bg-amber-200 text-amber-950 px-3 py-0.5 rounded-full">
                目前: {userAge} 歲
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {([4, 5, 6, 7] as AgeBand[]).map((age) => (
                <button
                  key={`dock-age-${age}`}
                  onClick={() => onSelectAge(age)}
                  className={`py-3 rounded-2xl text-base font-black transition-all flex flex-col items-center gap-0.5 shadow-sm active:scale-95 ${
                    userAge === age
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md border-2 border-blue-400 scale-105'
                      : 'bg-amber-50 hover:bg-amber-100 text-slate-800 border-2 border-amber-200'
                  }`}
                >
                  <span className="text-xl">{age}</span>
                  <span className="text-xs opacity-90 font-bold">歲階段</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section B: Audio & Input Mode */}
          <div className="bg-white border-2 border-sky-300 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎵</span>
                <span>音訊監控與辨識模式</span>
              </span>
              <span className="flex items-center gap-2 text-sm font-black bg-sky-100 text-sky-950 px-3 py-0.5 rounded-full border border-sky-200">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    inputMode === 'microphone' && isMicListening
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-sky-500'
                  }`}
                />
                <span>{inputModeLabelMap[inputMode].label}</span>
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onToggle();
                  onOpenCalibration();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-slate-900 border-2 border-sky-200 font-black transition shadow-sm active:scale-95 text-base"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎙️</span>
                  <span>環境噪音與靈敏度校準</span>
                </div>
                <span className="text-sm text-sky-800 font-black">開啟 ➔</span>
              </button>

              {onOpenScaleModal && (
                <button
                  onClick={() => {
                    onToggle();
                    onOpenScaleModal();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-slate-900 border-2 border-sky-200 font-black transition shadow-sm active:scale-95 text-base"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎹</span>
                    <span>即時音階辨識與診斷室</span>
                  </div>
                  <span className="text-sm text-sky-800 font-black">測試 ➔</span>
                </button>
              )}
            </div>
          </div>

          {/* Section C: iPad & Deployment Actions */}
          <div className="bg-white border-2 border-purple-300 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
            <span className="text-sm font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <span>📲</span>
              <span>iPad 平板優化與離線包</span>
            </span>

            <div className="flex flex-col gap-2.5">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-slate-900 border-2 border-purple-200 font-black transition shadow-sm active:scale-95 text-base"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{isFullscreen ? '🗗' : '🖥️'}</span>
                  <span>{isFullscreen ? '退出全螢幕模式' : '切換全螢幕沈浸模式'}</span>
                </div>
                <span className="text-sm text-purple-800 font-black">
                  {isFullscreen ? '已全螢幕' : '全螢幕 ➔'}
                </span>
              </button>

              {/* iPad Safari Guide */}
              <button
                onClick={() => {
                  onToggle();
                  onOpenIPadModal();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-slate-900 border-2 border-purple-200 font-black transition shadow-sm active:scale-95 text-base"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🍎</span>
                  <span>iPad Safari 加入主畫面指南</span>
                </div>
                <span className="text-sm text-purple-800 font-black">教學 ➔</span>
              </button>

              {/* Offline Deploy ZIP Modal */}
              <button
                onClick={() => {
                  onToggle();
                  onOpenDeployModal();
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black transition shadow-lg active:scale-95 text-base border-2 border-amber-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📦</span>
                  <span>下載專案離線部署壓縮包 (.ZIP)</span>
                </div>
                <span className="text-xs bg-white text-amber-900 px-3 py-1 rounded-full font-black shadow-sm">
                  下載 ➔
                </span>
              </button>
            </div>
          </div>

          {/* Section D: Direct PWA Install for desktop / chrome */}
          {!isInstalled && isInstallable && (
            <button
              onClick={() => {
                onToggle();
                onInstall();
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2.5 active:scale-95"
            >
              <span className="text-2xl">📲</span>
              <span>直接安裝 PWA 桌面應用程式</span>
            </button>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t-2 border-amber-200 flex items-center justify-between">
          <span className="text-sm text-slate-600 font-bold">
            KaiQuest 鋼琴大冒險 · 隨屏浮動模式
          </span>
          <button
            onClick={onToggle}
            className="px-5 py-2.5 bg-white hover:bg-amber-100 text-slate-800 font-black rounded-xl text-sm transition shadow-sm border border-amber-200"
          >
            關閉
          </button>
        </div>
      </div>
    </>
  );
};

