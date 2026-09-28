import React, { useState, useEffect } from 'react';
import { AgeBand, InputMode } from '../../types/piano';
import { micAdapter } from '../../audio/microphoneAdapter';
import { getPublicShareUrl } from '../../utils/safariShare';

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
  isImmersiveMode?: boolean;
  onToggleFullscreen?: () => void;
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
  isImmersiveMode = false,
  onToggleFullscreen,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && Boolean(document.fullscreenElement)
  );

  const [sensitivityMode, setSensitivityMode] = useState<'tablet-high' | 'normal' | 'low-noise'>(
    micAdapter.getSensitivityMode()
  );
  const [liveRms, setLiveRms] = useState(0);
  const [noiseGateThreshold, setNoiseGateThreshold] = useState(micAdapter.getNoiseGateThreshold());
  const [liveDetectedNote, setLiveDetectedNote] = useState('');

  useEffect(() => {
    setNoiseGateThreshold(micAdapter.getNoiseGateThreshold());
    const unsub = micAdapter.subscribePitchMonitor?.((data) => {
      setLiveRms(data.rms);
      if (data.threshold !== undefined) {
        setNoiseGateThreshold(data.threshold);
      }
      if (data.noteName) {
        setLiveDetectedNote(data.noteName);
      }
      if (data.sensitivityMode) {
        setSensitivityMode(data.sensitivityMode);
      }
    });
    return unsub;
  }, []);

  const handleSetSensitivity = (mode: 'tablet-high' | 'normal' | 'low-noise') => {
    micAdapter.setSensitivityMode(mode);
    setSensitivityMode(mode);
    setNoiseGateThreshold(micAdapter.getNoiseGateThreshold());
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const isActuallyFullscreen = Boolean(isImmersiveMode || isFullscreen);

  const toggleFullscreen = async () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
      return;
    }

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

          {/* Section B: iPad Audio Sensitivity & Input Mode */}
          <div className="bg-white border-2 border-sky-300 rounded-3xl p-5 flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎙️</span>
                <span>iPad 聽琴靈敏度設定</span>
              </span>
              <span className="flex items-center gap-2 text-sm font-black bg-sky-100 text-sky-950 px-3 py-0.5 rounded-full border border-sky-200">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    inputMode === 'microphone' && isMicListening
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span>{inputModeLabelMap[inputMode].label}</span>
              </span>
            </div>

            {/* 3 Sensitivity Presets - Critical for iPad Microphone Detection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-700">選擇聽琴靈敏度等級：</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'tablet-high', title: '🚀 超高靈敏', sub: 'iPad/平板推薦', note: '2.4x 增益 + 低噪門' },
                  { id: 'normal', title: '💻 標準靈敏', sub: '近距離琴房', note: '1.4x 增益' },
                  { id: 'low-noise', title: '🛡️ 安靜降噪', sub: '嘈雜環境', note: '1.0x 增益' },
                ].map((preset) => {
                  const isActive = sensitivityMode === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSetSensitivity(preset.id as 'tablet-high' | 'normal' | 'low-noise')}
                      className={`p-2.5 rounded-2xl border-2 text-left flex flex-col gap-0.5 transition-all active:scale-95 ${
                        isActive
                          ? 'bg-gradient-to-b from-sky-400 to-blue-600 text-white border-blue-500 shadow-md scale-102 ring-2 ring-sky-300'
                          : 'bg-sky-50/70 hover:bg-sky-100/70 text-slate-800 border-sky-200'
                      }`}
                    >
                      <span className="text-xs font-black leading-tight">{preset.title}</span>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-sky-100' : 'text-sky-800'}`}>
                        {preset.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Audio Level Meter */}
            {inputMode === 'microphone' && (
              <div className="bg-sky-50 rounded-2xl p-3 border border-sky-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <span>麥克風輸入音量：</span>
                  <span className="font-mono text-blue-700">
                    {liveDetectedNote ? `已偵測到: ${liveDetectedNote}` : isMicListening ? '聆聽中...' : '麥克風未開啟'}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, Math.round(liveRms * 1200))}%` }}
                  />
                  {/* Gate marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-rose-500 shadow"
                    style={{ left: `${Math.min(95, Math.round(noiseGateThreshold * 1200))}%` }}
                    title="啟動辨識門檻"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  紅線為觸發門檻，琴音音量超過紅線即會啟動辨識。
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onToggle();
                  onOpenCalibration();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-slate-900 border-2 border-sky-200 font-black transition shadow-sm active:scale-95 text-base"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎙️</span>
                  <span>手動微調環境噪音與音量</span>
                </div>
                <span className="text-sm text-sky-800 font-black">校準 ➔</span>
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
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 font-black transition shadow-sm active:scale-95 text-base ${
                  isActuallyFullscreen
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                    : 'bg-purple-50 hover:bg-purple-100 text-slate-900 border-purple-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{isActuallyFullscreen ? '🗗' : '🖥️'}</span>
                  <span>{isActuallyFullscreen ? '退出全螢幕沉浸模式' : '切換全螢幕沉浸模式'}</span>
                </div>
                <span className="text-sm font-black text-purple-900">
                  {isActuallyFullscreen ? '已開啟 (點此退出) ➔' : '全螢幕 ➔'}
                </span>
              </button>

              {/* iPad Safari Guide & Direct Launch */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onToggle();
                    onOpenIPadModal();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-slate-900 border-2 border-purple-200 font-black transition shadow-sm active:scale-95 text-base"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🍎</span>
                    <div className="flex flex-col text-left">
                      <span>iPad Safari 全螢幕指南</span>
                      <span className="text-xs text-purple-700 font-semibold">解決 401 錯誤 · 掃碼開全螢幕</span>
                    </div>
                  </div>
                  <span className="text-sm text-purple-800 font-black">指南 ➔</span>
                </button>

                <a
                  href={getPublicShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow transition active:scale-95"
                >
                  <span>📲</span>
                  <span>在 iPad Safari 開啟 (免 401 錯誤)</span>
                </a>
              </div>

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

