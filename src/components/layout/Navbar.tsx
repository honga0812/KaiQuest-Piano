import React, { useState, useEffect } from 'react';
import { AgeBand, InputMode } from '../../types/piano';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { micAdapter } from '../../audio/microphoneAdapter';
import { IPadInstallGuideModal } from '../modals/IPadInstallGuideModal';

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
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showIPadModal, setShowIPadModal] = useState(false);
  const [isMicListening, setIsMicListening] = useState(micAdapter.getIsRunning());

  useEffect(() => {
    setIsMicListening(micAdapter.getIsRunning());
    const unsub = micAdapter.subscribeStatus((st) => {
      setIsMicListening(st.isListening);
    });
    return unsub;
  }, []);

  const inputModeLabelMap: Record<InputMode, string> = {
    microphone: '麥克風辨音',
    midi: 'USB MIDI',
    touch: '觸控鍵盤',
  };

  return (
    <header className={`flex items-center justify-between px-4 md:px-6 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md select-none shrink-0 ${className}`}>
      {/* Zone 1: Brand title (One single element) */}
      <button
        onClick={() => onSelectTab('map')}
        className="flex items-center gap-2.5 text-left focus:outline-none"
      >
        <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
          K
        </span>
        <span className="text-lg md:text-xl font-bold tracking-tight text-white whitespace-nowrap">
          KaiQuest Piano Adventure
        </span>
      </button>

      {/* Zone 2: Navigation links */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectTab('map')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            currentTab === 'map' || currentTab === 'lesson'
              ? 'text-white border-b-2 border-blue-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          課程地圖
        </button>
        <button
          onClick={() => onSelectTab('theory')}
          className={`transition-colors pb-0.5 whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'theory'
              ? 'text-white border-b-2 border-blue-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <span>🎼</span>
          <span>樂理解說</span>
        </button>
        <button
          onClick={() => onSelectTab('concert')}
          className={`transition-colors pb-0.5 whitespace-nowrap flex items-center gap-1.5 ${
            currentTab === 'concert'
              ? 'text-white border-b-2 border-blue-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <span>🎹</span>
          <span>全曲與哈農</span>
        </button>
        <button
          onClick={() => onSelectTab('gym')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            currentTab === 'gym'
              ? 'text-white border-b-2 border-blue-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          技巧遊戲館
        </button>
        <button
          onClick={() => onSelectTab('freeplay')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            currentTab === 'freeplay'
              ? 'text-white border-b-2 border-blue-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          自由彈奏
        </button>
        <button
          onClick={() => onSelectTab('badges')}
          className={`transition-colors pb-0.5 whitespace-nowrap ${
            currentTab === 'badges'
              ? 'text-white border-b-2 border-blue-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          榮譽徽章
        </button>
      </nav>

      {/* Zone 3: Primary Actions & Settings */}
      <div className="flex items-center gap-2.5">
        {/* Scale Recognition Diagnostic Modal Trigger */}
        {onOpenScaleModal && (
          <button
            onClick={onOpenScaleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold border border-indigo-500/40 transition shadow-sm whitespace-nowrap"
            title="音階即時辨識與聽琴診斷"
          >
            <span>🎵</span>
            <span className="hidden sm:inline">辨識音階測試</span>
          </button>
        )}

        {/* Age Selector */}
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
          {([4, 5, 6, 7] as AgeBand[]).map(age => (
            <button
              key={`age-${age}`}
              onClick={() => onSelectAge(age)}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition-all whitespace-nowrap ${
                userAge === age
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {age}歲
            </button>
          ))}
        </div>

        {/* Calibration & Input Mode Button with live mic status */}
        <button
          onClick={onOpenCalibration}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="環境校準與輸入設定"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              inputMode === 'microphone'
                ? isMicListening
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
                : 'bg-blue-400'
            }`}
          />
          <span className="hidden sm:inline">
            {inputMode === 'microphone'
              ? isMicListening
                ? '麥克風聽琴中'
                : '麥克風未啟動'
              : inputModeLabelMap[inputMode]}
          </span>
          <span className="text-slate-400">⚙️</span>
        </button>

        {/* iPad Install & Fullscreen Guide Trigger */}
        <button
          onClick={() => setShowIPadModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-200 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-400/40 shadow-sm transition whitespace-nowrap"
          title="在 iPad 安裝或開啟全螢幕模式"
        >
          <span>📲</span>
          <span className="hidden sm:inline">iPad 安裝/全螢幕</span>
        </button>

        {/* PWA Install Button for Chrome / Android / Desktop */}
        {!isInstalled && isInstallable && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition whitespace-nowrap"
          >
            安裝 App
          </button>
        )}

        {/* iPad Install & Fullscreen Guide Modal */}
        <IPadInstallGuideModal
          isOpen={showIPadModal}
          onClose={() => setShowIPadModal(false)}
        />
      </div>
    </header>
  );
};
