import React, { useState, useEffect, useRef } from 'react';
import { AgeBand, InputMode } from '../../types/piano';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { micAdapter } from '../../audio/microphoneAdapter';
import { IPadInstallGuideModal } from '../modals/IPadInstallGuideModal';
import { TabletDockDrawer } from './TabletDockDrawer';
import { DeployDownloadModal } from '../modals/DeployDownloadModal';

interface NavbarProps {
  currentTab: 'map' | 'lesson' | 'concert' | 'gym' | 'rhythm' | 'freeplay' | 'badges' | 'theory';
  onSelectTab: (tab: 'map' | 'concert' | 'gym' | 'rhythm' | 'freeplay' | 'badges' | 'theory') => void;
  userAge: AgeBand;
  onSelectAge: (age: AgeBand) => void;
  inputMode: InputMode;
  onOpenCalibration: () => void;
  onOpenScaleModal?: () => void;
  onOpenCheckInModal?: () => void;
  streakCount?: number;
  isTodayQualified?: boolean;
  todayPracticeSeconds?: number;
  className?: string;
  isImmersiveMode?: boolean;
  onToggleFullscreen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userAge,
  onSelectAge,
  inputMode,
  onOpenCalibration,
  onOpenScaleModal,
  onOpenCheckInModal,
  streakCount = 0,
  isTodayQualified = false,
  todayPracticeSeconds = 0,
  className = '',
  isImmersiveMode = false,
  onToggleFullscreen,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showIPadModal, setShowIPadModal] = useState(false);
  const [showTabletDock, setShowTabletDock] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMicListening, setIsMicListening] = useState(micAdapter.getIsRunning());
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && Boolean(document.fullscreenElement)
  );

  useEffect(() => {
    setIsMicListening(micAdapter.getIsRunning());
    const unsub = micAdapter.subscribeStatus((st) => {
      setIsMicListening(st.isListening);
    });
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFs);
    return () => {
      unsub();
      document.removeEventListener('fullscreenchange', handleFs);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowToolsDropdown(false);
      }
    };
    if (showToolsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showToolsDropdown]);

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
        webkitFullscreenElement?: Element;
      };

      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  return (
    <>
      <header
        className={`flex items-center justify-between px-3 md:px-5 py-2.5 bg-white border-b-3 border-amber-300 shadow-sm select-none shrink-0 sticky top-0 z-40 gap-2 md:gap-4 ${isImmersiveMode ? 'hidden' : ''} ${className || ''}`}
      >
        {/* Zone 1 (Left): Brand Logo + Daily Check-In (移至最前方，快速簽到不卡位) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('map')}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none shrink-0 group transition"
            title="回到首頁課程地圖"
          >
            <span className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
              🎹
            </span>
            <span className="text-lg md:text-xl font-black tracking-tight text-amber-950 whitespace-nowrap hidden sm:inline">
              KaiQuest 鋼琴大冒險
            </span>
          </button>

          {/* Daily Check-in & Practice Streak Button - Front & Center for Easy Child/Parent Access */}
          {onOpenCheckInModal && (
            <button
              onClick={onOpenCheckInModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-2xl border-2 font-black transition active:scale-95 shadow-xs whitespace-nowrap shrink-0 ${
                isTodayQualified
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 border-white shadow-amber-400/30'
              }`}
              title="查看每日簽到與連續練習進度（達標 3 天獲取「音樂探索家」紀念勳章）"
            >
              <span className="text-base">📅</span>
              <span className="text-xs md:text-sm font-black">簽到</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full font-black ${isTodayQualified ? 'bg-white text-emerald-800' : 'bg-white/90 text-amber-950'}`}>
                {streakCount}天
              </span>
              <span className="hidden lg:inline text-[11px] font-bold">
                {isTodayQualified ? '✅達標' : `${Math.floor(todayPracticeSeconds / 60)}/5分`}
              </span>
            </button>
          )}
        </div>

        {/* Zone 2 (Center): Navigation tabs - Vastly more horizontal space, zero overlap! */}
        <nav className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-sm sm:text-base md:text-lg font-black text-slate-700 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'map' || currentTab === 'lesson'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🗺️</span>
            <span>課程地圖</span>
          </button>
          <button
            onClick={() => onSelectTab('theory')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'theory'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🎼</span>
            <span>樂理解說</span>
          </button>
          <button
            onClick={() => onSelectTab('concert')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'concert'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🎹</span>
            <span>全曲/哈農</span>
          </button>
          <button
            onClick={() => onSelectTab('gym')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'gym'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🎪</span>
            <span>技巧遊戲</span>
          </button>
          <button
            onClick={() => onSelectTab('rhythm')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'rhythm'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-md shadow-rose-500/30 font-black'
                : 'hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <span>⚡</span>
            <span>節奏捕捉</span>
          </button>
          <button
            onClick={() => onSelectTab('freeplay')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'freeplay'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🌈</span>
            <span>自由彈奏</span>
          </button>
          <button
            onClick={() => onSelectTab('badges')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'badges'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🏆</span>
            <span>榮譽徽章</span>
          </button>
        </nav>

        {/* Zone 3 (Right): Dropdown Quick Tools Menu (下拉式選單：下載部署、iPad全螢幕、全螢幕) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setShowToolsDropdown(!showToolsDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs md:text-sm border-2 border-amber-300 transition active:scale-95 shadow-xs whitespace-nowrap"
            title="快捷系統工具與顯示設定"
            aria-expanded={showToolsDropdown}
          >
            <span className="text-base">🚀</span>
            <span className="hidden sm:inline">快捷工具</span>
            <span className={`text-[10px] transition-transform duration-200 ${showToolsDropdown ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Floating Dropdown Panel */}
          {showToolsDropdown && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border-3 border-amber-300 p-2.5 z-50 animate-fade-in text-left">
              <div className="px-3 py-1.5 border-b border-amber-100 mb-1.5">
                <span className="text-xs font-black text-amber-950 block">系統工具與顯示模式</span>
                <span className="text-[11px] text-slate-500 font-bold block">點選功能快速開啟</span>
              </div>

              {/* 1. 全螢幕切換 */}
              <button
                onClick={() => {
                  setShowToolsDropdown(false);
                  toggleFullscreen();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-amber-50 transition text-left group"
              >
                <span className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  {isFullscreen || isImmersiveMode ? '🗗' : '🖥️'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black text-slate-900 block leading-tight">
                    {isFullscreen || isImmersiveMode ? '退出全螢幕' : '全螢幕模式'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold block truncate">
                    隱藏瀏覽器工具列，沉浸練琴
                  </span>
                </div>
                <span className="text-xs text-amber-600 font-black">➔</span>
              </button>

              {/* 2. iPad 全螢幕與設定說明 */}
              <button
                onClick={() => {
                  setShowToolsDropdown(false);
                  setShowIPadModal(true);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-blue-50 transition text-left group"
              >
                <span className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  📲
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black text-blue-950 block leading-tight">
                    iPad 全螢幕與獨立網址
                  </span>
                  <span className="text-[11px] text-blue-700 font-bold block truncate">
                    Safari 捷徑與免 401 錯誤
                  </span>
                </div>
                <span className="text-xs text-blue-600 font-black">➔</span>
              </button>

              {/* 3. 下載部署包 */}
              <button
                onClick={() => {
                  setShowToolsDropdown(false);
                  setShowDeployModal(true);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-emerald-50 transition text-left group"
              >
                <span className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  📦
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black text-emerald-950 block leading-tight">
                    下載部署包 (.ZIP)
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold block truncate">
                    完整原始碼與離線靜態包
                  </span>
                </div>
                <span className="text-xs text-emerald-600 font-black">➔</span>
              </button>

              {/* 4. 麥克風音訊校準 (輔助工具) */}
              <button
                onClick={() => {
                  setShowToolsDropdown(false);
                  onOpenCalibration();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-purple-50 transition text-left group border-t border-slate-100 mt-1"
              >
                <span className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  🎙️
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black text-purple-950 block leading-tight">
                    麥克風收音校準
                  </span>
                  <span className="text-[11px] text-purple-700 font-bold block truncate">
                    實體琴頻率辨識與環境靈敏度
                  </span>
                </div>
                <span className="text-xs text-purple-600 font-black">➔</span>
              </button>

              {/* 5. PWA 安裝 (若支援) */}
              {isInstallable && (
                <button
                  onClick={() => {
                    setShowToolsDropdown(false);
                    install();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 transition text-left font-black mt-1 shadow-xs"
                >
                  <span className="text-lg">📥</span>
                  <span className="text-xs font-black">安裝為桌面 App</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Docked Tablet Control Drawer (吸附式跟隨浮動島) */}
      <TabletDockDrawer
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        userAge={userAge}
        onSelectAge={onSelectAge}
        inputMode={inputMode}
        onOpenCalibration={() => {
          setShowTabletDock(false);
          onOpenCalibration();
        }}
        onOpenScaleModal={() => {
          setShowTabletDock(false);
          if (onOpenScaleModal) onOpenScaleModal();
        }}
        onOpenIPadModal={() => {
          setShowTabletDock(false);
          setShowIPadModal(true);
        }}
        onOpenDeployModal={() => {
          setShowTabletDock(false);
          setShowDeployModal(true);
        }}
        onOpenCheckInModal={() => {
          setShowTabletDock(false);
          if (onOpenCheckInModal) onOpenCheckInModal();
        }}
        streakCount={streakCount}
        isTodayQualified={isTodayQualified}
        isMicListening={isMicListening}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={install}
        isOpen={showTabletDock}
        onToggle={() => setShowTabletDock(!showTabletDock)}
        isImmersiveMode={isImmersiveMode}
        onToggleFullscreen={onToggleFullscreen}
      />

      {/* iPad Safari Install & Fullscreen Guide Modal */}
      <IPadInstallGuideModal
        isOpen={showIPadModal}
        onClose={() => setShowIPadModal(false)}
        onToggleFullscreen={onToggleFullscreen}
        isImmersiveMode={isImmersiveMode}
      />

      {/* Deploy Download ZIP Modal */}
      <DeployDownloadModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
      />
    </>
  );
};
