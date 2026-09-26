import { useState, useEffect } from 'react';
import { UserProgress, Lesson, AgeBand, InputMode, CalibrationResult } from './types/piano';
import { LESSONS_DATABASE } from './data/lessons';
import {
  loadUserProgress,
  recordLessonCompletion,
  updateCalibration,
  setUserAge,
  setInputModePreference,
} from './utils/storage';
import { Navbar } from './components/layout/Navbar';
import { CourseMapView } from './components/views/CourseMapView';
import { LessonInteractiveView } from './components/views/LessonInteractiveView';
import { TechniqueGymView } from './components/views/TechniqueGymView';
import { FreePlayView } from './components/views/FreePlayView';
import { BadgesView } from './components/views/BadgesView';
import { FullSongVirtuosoView } from './components/views/FullSongVirtuosoView';
import { MusicTheoryView } from './components/views/MusicTheoryView';
import { FirstTimeFlowModal } from './components/modals/FirstTimeFlowModal';
import { SettingsCalibrateModal } from './components/modals/SettingsCalibrateModal';
import { ScaleRecognitionModal } from './components/modals/ScaleRecognitionModal';
import { IPadInstallGuideModal } from './components/modals/IPadInstallGuideModal';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [currentTab, setCurrentTab] = useState<'map' | 'lesson' | 'concert' | 'gym' | 'freeplay' | 'badges' | 'theory'>('map');
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS_DATABASE[0]);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showScaleModal, setShowScaleModal] = useState<boolean>(false);
  const [showIPadModal, setShowIPadModal] = useState<boolean>(false);
  const [showIPadFullscreenTip, setShowIPadFullscreenTip] = useState<boolean>(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Check if first-time calibration needed
  useEffect(() => {
    const loaded = loadUserProgress();
    setProgress(loaded);
    if (!loaded.calibration.isCalibrated) {
      setShowFirstTimeModal(true);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isAppleDevice = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      const isStandardFs = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
      if (!isStandardFs && isImmersiveMode) {
        // preserve immersive mode if on iOS/iPadOS
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isImmersiveMode]);

  const handleToggleFullscreen = async () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
    };
    const docEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      webkitExitFullscreen?: () => Promise<void>;
    };

    const isStandardFullscreen = Boolean(document.fullscreenElement || doc.webkitFullscreenElement);
    const isApple = isAppleDevice();

    if (!isStandardFullscreen && !isImmersiveMode) {
      let enteredStandard = false;
      // If Desktop / Android where standard fullscreen API is supported, use standard API
      if (!isApple && (docEl.requestFullscreen || docEl.webkitRequestFullscreen)) {
        try {
          if (docEl.requestFullscreen) {
            await docEl.requestFullscreen();
            enteredStandard = true;
          } else if (docEl.webkitRequestFullscreen) {
            await docEl.webkitRequestFullscreen();
            enteredStandard = true;
          }
        } catch (err) {
          console.warn('Standard fullscreen failed, falling back to immersive mode:', err);
        }
      }

      if (!enteredStandard) {
        // On Apple iPadOS / iOS (where requestFullscreen is blocked by Apple) or when API fails:
        // Activate Immersive Viewport Mode (hides navigation bar, expands main to 100dvh, scrolls to 1)
        setIsImmersiveMode(true);
        window.scrollTo({ top: 1, behavior: 'smooth' });
        if (isApple) {
          setShowIPadFullscreenTip(true);
        }
      }
    } else {
      // Exit fullscreen
      if (isStandardFullscreen) {
        try {
          if (doc.exitFullscreen) {
            await doc.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          }
        } catch {
          // ignore
        }
      }
      setIsImmersiveMode(false);
      setShowIPadFullscreenTip(false);
    }
  };

  const handleFirstTimeComplete = (age: AgeBand, mode: InputMode, calibration: CalibrationResult) => {
    setUserAge(age);
    setInputModePreference(mode);
    updateCalibration(calibration);
    const updated = loadUserProgress();
    setProgress(updated);
    setShowFirstTimeModal(false);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentTab('lesson');
  };

  const handleLessonComplete = (stars: number, score: number, bpm: number, badgeId?: string) => {
    const updated = recordLessonCompletion(activeLesson.id, stars, score, bpm, badgeId);
    setProgress(updated);
  };

  const handleUpdateAge = (age: AgeBand) => {
    setUserAge(age);
    setProgress(loadUserProgress());
  };

  const handleUpdateMode = (mode: InputMode) => {
    setInputModePreference(mode);
    setProgress(loadUserProgress());
  };

  const handleUpdateCalibration = (calibration: CalibrationResult) => {
    updateCalibration(calibration);
    setProgress(loadUserProgress());
  };

  const handleResetData = () => {
    setProgress(loadUserProgress());
    setShowFirstTimeModal(true);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-indigo-50 text-slate-800 flex flex-col font-sans select-none overflow-x-hidden ${isImmersiveMode ? 'h-screen overflow-hidden' : ''}`}>
      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="bg-amber-400 text-amber-950 px-4 py-2 text-sm font-black text-center z-50 shadow-sm animate-pulse">
          離線模式啟動中 — PWA 快取已就緒，您可以隨時離線彈奏鋼琴！
        </div>
      )}

      {/* Floating Exit Button for Immersive Fullscreen Mode */}
      {isImmersiveMode && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 animate-fade-in">
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/95 text-slate-900 border-2 border-amber-400 font-black text-sm md:text-base shadow-2xl transition active:scale-95 hover:bg-amber-50"
            title="點擊退出沉浸全螢幕模式"
          >
            <span>⤓</span>
            <span>退出沉浸全螢幕</span>
          </button>
        </div>
      )}

      {/* iPad Safari Explanation Tip Banner */}
      {showIPadFullscreenTip && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] max-w-lg w-[92vw] bg-white border-3 border-amber-400 rounded-3xl p-5 shadow-2xl animate-fade-in flex flex-col gap-3 text-left text-slate-800">
          <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2.5">
            <span className="font-black text-base md:text-lg text-amber-950 flex items-center gap-2">
              <span>🍎</span>
              <span>已為您開啟 iPad 沉浸式全螢幕！</span>
            </span>
            <button
              onClick={() => setShowIPadFullscreenTip(false)}
              className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-slate-700 flex items-center justify-center font-black text-sm"
            >
              ✕
            </button>
          </div>

          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-bold">
            <strong>為什麼 iPad 上的全螢幕不一樣？</strong><br />
            Apple 在 iOS / iPadOS Safari 中基於系統安全考量，<strong>限制了所有網頁直接呼叫標準全螢幕 API</strong>。<br />
            為此，我們已為您切換至<strong>「無頂欄沉浸全螢幕模式」</strong>，騰出最大視野專注練琴！<br />
            若要像原生 App 一樣完全移除 Safari 網址列，只需點擊 Safari 頂部<strong>「分享按鈕」➔ 選擇「加入主畫面」</strong>，即可享受 100% 真正無邊框全螢幕！
          </p>

          <div className="flex items-center gap-2 justify-end pt-1 flex-wrap">
            <button
              onClick={() => {
                setShowIPadFullscreenTip(false);
                setShowIPadModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs md:text-sm font-black shadow transition active:scale-95"
            >
              📲 查看如何「加入主畫面」教學 ➔
            </button>
            <button
              onClick={() => setShowIPadFullscreenTip(false)}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs md:text-sm font-black border border-amber-300 transition active:scale-95"
            >
              知道了，開始練琴
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar (header hides in immersive mode, but TabletDockDrawer stays available) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        userAge={progress.userAge}
        onSelectAge={handleUpdateAge}
        inputMode={progress.selectedInputMode}
        onOpenCalibration={() => setShowSettingsModal(true)}
        onOpenScaleModal={() => setShowScaleModal(true)}
        isImmersiveMode={isImmersiveMode}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col items-stretch justify-start overflow-y-auto w-full ${isImmersiveMode ? 'pt-2' : ''}`}>
        {currentTab === 'map' && (
          <CourseMapView
            progress={progress}
            onSelectLesson={handleSelectLesson}
            onOpenConcert={() => setCurrentTab('concert')}
            onSelectAge={handleUpdateAge}
          />
        )}

        {currentTab === 'lesson' && (
          <LessonInteractiveView
            lesson={activeLesson}
            inputMode={progress.selectedInputMode}
            onBackToMap={() => setCurrentTab('map')}
            onCompleteLesson={handleLessonComplete}
          />
        )}

        {currentTab === 'theory' && (
          <MusicTheoryView />
        )}

        {currentTab === 'concert' && (
          <FullSongVirtuosoView
            inputMode={progress.selectedInputMode}
            onBackToMap={() => setCurrentTab('map')}
          />
        )}

        {currentTab === 'gym' && (
          <TechniqueGymView
            onBackToMap={() => setCurrentTab('map')}
            inputMode={progress.selectedInputMode}
          />
        )}

        {currentTab === 'freeplay' && (
          <FreePlayView
            inputMode={progress.selectedInputMode}
          />
        )}

        {currentTab === 'badges' && (
          <BadgesView
            progress={progress}
          />
        )}
      </main>

      {/* First Time Onboarding & 4-Step Calibration Wizard */}
      <FirstTimeFlowModal
        isOpen={showFirstTimeModal}
        onComplete={handleFirstTimeComplete}
      />

      {/* Settings & Calibration Modal */}
      <SettingsCalibrateModal
        isOpen={showSettingsModal}
        progress={progress}
        onClose={() => setShowSettingsModal(false)}
        onUpdateInputMode={handleUpdateMode}
        onUpdateCalibration={handleUpdateCalibration}
        onResetData={handleResetData}
      />

      {/* Global Scale Recognition & Tuner Modal */}
      <ScaleRecognitionModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
      />

      {/* iPad Install Guide Modal */}
      <IPadInstallGuideModal
        isOpen={showIPadModal}
        onClose={() => setShowIPadModal(false)}
        onToggleFullscreen={handleToggleFullscreen}
        isImmersiveMode={isImmersiveMode}
      />
    </div>
  );
}
