import React, { useState, useEffect } from 'react';
import { AgeBand, InputMode } from '../../types/piano';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { micAdapter } from '../../audio/microphoneAdapter';
import { IPadInstallGuideModal } from '../modals/IPadInstallGuideModal';
import { TabletDockDrawer } from './TabletDockDrawer';
import { DeployDownloadModal } from '../modals/DeployDownloadModal';

interface NavbarProps {
  currentTab: 'map' | 'lesson' | 'concert' | 'gym' | 'freeplay' | 'badges' | 'theory';
  onSelectTab: (tab: 'map' | 'concert' | 'gym' | 'freeplay' | 'badges' | 'theory') => void;
  userAge: AgeBand;
  onSelectAge: (age: AgeBand) => void;
  inputMode: InputMode;
  onOpenCalibration: () => void;
  onOpenScaleModal?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userAge,
  onSelectAge,
  inputMode,
  onOpenCalibration,
  onOpenScaleModal,
  className = '',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showIPadModal, setShowIPadModal] = useState(false);
  const [showTabletDock, setShowTabletDock] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
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

  const toggleFullscreen = async () => {
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
        className={`flex items-center justify-between px-3 md:px-6 py-3 bg-white border-b-3 border-amber-300 shadow-sm select-none shrink-0 sticky top-0 z-40 ${className}`}
      >
        {/* Zone 1: Brand title */}
        <button
          onClick={() => onSelectTab('map')}
          className="flex items-center gap-3 text-left focus:outline-none shrink-0 group transition"
        >
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
            🎹
          </span>
          <span className="text-xl md:text-2xl font-black tracking-tight text-amber-950 whitespace-nowrap hidden sm:inline">
            KaiQuest 鋼琴大冒險
          </span>
        </button>

        {/* Zone 2: Navigation tabs with friendly larger text */}
        <nav className="flex items-center gap-2 md:gap-3 text-base md:text-lg font-black text-slate-700 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3.5 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3.5 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3.5 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3.5 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'gym'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🎪</span>
            <span>技巧遊戲</span>
          </button>
          <button
            onClick={() => onSelectTab('freeplay')}
            className={`px-3.5 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3.5 py-2 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'badges'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                : 'hover:text-blue-700 hover:bg-sky-50'
            }`}
          >
            <span>🏆</span>
            <span>榮譽徽章</span>
          </button>
        </nav>

        {/* Zone 3: Tablet-Optimized Actions & Dock Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Offline Deploy Zip Download Button */}
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 text-base font-black shadow-md border-2 border-white transition whitespace-nowrap active:scale-95"
            title="下載專案部署離線壓縮檔 (.ZIP)"
          >
            <span className="text-lg">📦</span>
            <span className="hidden lg:inline">下載部署包</span>
          </button>

          {/* Quick Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 md:px-3.5 md:py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-base font-black border-2 border-amber-300 transition active:scale-95 shadow-sm"
            title={isFullscreen ? '退出全螢幕' : '切換全螢幕模式'}
          >
            <span className="text-lg">{isFullscreen ? '🗗' : '🖥️'}</span>
            <span className="hidden xl:inline ml-1.5">{isFullscreen ? '退出全螢幕' : '全螢幕'}</span>
          </button>
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
        isMicListening={isMicListening}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={install}
        isOpen={showTabletDock}
        onToggle={() => setShowTabletDock(!showTabletDock)}
      />

      {/* iPad Safari Install & Fullscreen Guide Modal */}
      <IPadInstallGuideModal
        isOpen={showIPadModal}
        onClose={() => setShowIPadModal(false)}
      />

      {/* Deploy Download ZIP Modal */}
      <DeployDownloadModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
      />
    </>
  );
};
