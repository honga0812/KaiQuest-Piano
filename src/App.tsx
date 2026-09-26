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

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [currentTab, setCurrentTab] = useState<'map' | 'lesson' | 'concert' | 'gym' | 'freeplay' | 'badges' | 'theory'>('map');
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS_DATABASE[0]);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showScaleModal, setShowScaleModal] = useState<boolean>(false);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1 text-xs font-bold text-center z-50 animate-pulse">
          離線模式啟動中 — PWA 快取已就緒，您可以隨時離線彈奏鋼琴！
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        userAge={progress.userAge}
        onSelectAge={handleUpdateAge}
        inputMode={progress.selectedInputMode}
        onOpenCalibration={() => setShowSettingsModal(true)}
        onOpenScaleModal={() => setShowScaleModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center overflow-y-auto">
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
    </div>
  );
}
