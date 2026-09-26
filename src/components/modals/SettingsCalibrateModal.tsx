import React, { useState, useEffect } from 'react';
import { UserProgress, InputMode, CalibrationResult } from '../../types/piano';
import { micAdapter } from '../../audio/microphoneAdapter';
import { midiAdapter } from '../../audio/midiAdapter';
import { exportProgressToJson, clearAllLocalData } from '../../utils/storage';

interface SettingsCalibrateModalProps {
  isOpen: boolean;
  progress: UserProgress;
  onClose: () => void;
  onUpdateInputMode: (mode: InputMode) => void;
  onUpdateCalibration: (calibration: CalibrationResult) => void;
  onResetData: () => void;
}

export const SettingsCalibrateModal: React.FC<SettingsCalibrateModalProps> = ({
  isOpen,
  progress,
  onClose,
  onUpdateInputMode,
  onUpdateCalibration,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'calib' | 'notes' | 'privacy'>('input');
  const [tolerance, setTolerance] = useState(progress.calibration.pitchToleranceCents || 50);
  const [sensitivity, setSensitivity] = useState(progress.calibration.micSensitivity || 1.0);
  const [noteText, setNoteText] = useState('');
  const [teacherNotesList, setTeacherNotesList] = useState<string[]>(progress.teacherNotes || []);

  // Live mic test in modal
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [testNote, setTestNote] = useState('');
  const [testFreq, setTestFreq] = useState(0);
  const [testCents, setTestCents] = useState(0);
  const [testRms, setTestRms] = useState(0);

  useEffect(() => {
    if (!isTestingMic || !isOpen) return;
    const unsub = micAdapter.subscribePitchMonitor?.((data) => {
      setTestRms(data.rms);
      if (data.frequency > 0) {
        setTestNote(data.noteName);
        setTestFreq(Math.round(data.frequency * 10) / 10);
        setTestCents(data.cents);
      }
    });
    return () => {
      unsub?.();
    };
  }, [isTestingMic, isOpen]);

  if (!isOpen) return null;

  const isMidiSupported = midiAdapter.isSupported();

  const handleToggleTestMic = async () => {
    if (isTestingMic) {
      setIsTestingMic(false);
    } else {
      try {
        await micAdapter.start();
        setIsTestingMic(true);
      } catch (err) {
        alert((err as Error).message || '啟動麥克風失敗');
      }
    }
  };

  const handleSaveCalibration = async () => {
    const updated = await micAdapter.calibrate({
      pitchToleranceCents: tolerance,
      micSensitivity: sensitivity,
    });
    onUpdateCalibration(updated);
    alert('校準參數已儲存！');
  };

  const handleAddTeacherNote = () => {
    if (!noteText.trim()) return;
    const nextList = [noteText.trim(), ...teacherNotesList];
    setTeacherNotesList(nextList);
    setNoteText('');
  };

  const handleClearData = () => {
    if (confirm('確定要清除所有本機進度與徽章記錄嗎？此動作無法復原。')) {
      clearAllLocalData();
      onResetData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              設定與環境校準
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'input' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            輸入方式
          </button>
          <button
            onClick={() => setActiveTab('calib')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'calib' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            麥克風校準
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'notes' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            老師評語
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'privacy' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            隱私與備份
          </button>
        </div>

        {/* Tab 1: Input Mode */}
        {activeTab === 'input' && (
          <div className="flex flex-col gap-3 py-2 text-left">
            <span className="text-xs font-semibold text-slate-300">選擇當前琴音來源：</span>

            <div
              onClick={() => onUpdateInputMode('microphone')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                progress.selectedInputMode === 'microphone'
                  ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50'
                  : 'bg-slate-800/80 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">🎙️ 麥克風辨音 (iPad / 筆電)</span>
                {progress.selectedInputMode === 'microphone' && (
                  <span className="text-xs text-blue-400 font-bold">使用中 ✓</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                直接放置於直立鋼琴、平台鋼琴或電鋼琴譜架上，辨識單音旋律。
              </p>
            </div>

            <div
              onClick={() => isMidiSupported && onUpdateInputMode('midi')}
              className={`p-4 rounded-2xl border transition ${
                !isMidiSupported
                  ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800'
                  : progress.selectedInputMode === 'midi'
                  ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 cursor-pointer'
                  : 'bg-slate-800/80 border-slate-700 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">🎹 USB MIDI 鍵盤</span>
                {!isMidiSupported ? (
                  <span className="text-[10px] text-slate-500 font-mono">此設備不支援 Web MIDI</span>
                ) : progress.selectedInputMode === 'midi' ? (
                  <span className="text-xs text-blue-400 font-bold">使用中 ✓</span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                桌面 Chrome / Edge 支援直接讀取電鋼琴 NoteOn 與力度。
              </p>
            </div>

            <div
              onClick={() => onUpdateInputMode('touch')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                progress.selectedInputMode === 'touch'
                  ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50'
                  : 'bg-slate-800/80 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">📱 螢幕觸控鍵盤 (靜音練習)</span>
                {progress.selectedInputMode === 'touch' && (
                  <span className="text-xs text-blue-400 font-bold">使用中 ✓</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                即使身邊暫時沒有鋼琴，也能用手指直接點擊螢幕練習視譜與指法！
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Calibration */}
        {activeTab === 'calib' && (
          <div className="flex flex-col gap-4 py-2 text-left">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>音高容差 (Pitch Tolerance):</span>
                <span className="font-mono text-amber-400">±{tolerance} cents</span>
              </div>
              <input
                type="range"
                min="20"
                max="65"
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                4-5 歲幼兒建議設定 ±50~60 cents 容差較寬；6-7 歲熟練後可調小至 ±35 cents。
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>麥克風增益靈敏度 (Sensitivity):</span>
                <span className="font-mono text-amber-400">{sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">
                若鋼琴聲音較小可調高靈敏度；若環境有回音或雜音可適度降低。
              </span>
            </div>

            {/* Live Mic Diagnostic Box */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2.5 my-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🎙️</span>
                  <span>即時麥克風聽琴測試</span>
                </span>
                <button
                  onClick={handleToggleTestMic}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    isTestingMic
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                  }`}
                >
                  {isTestingMic ? '停止測試' : '開始測試聽琴'}
                </button>
              </div>

              {isTestingMic && (
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-slate-300">
                      {testNote ? `聽到的音符：${testNote} (${testFreq} Hz)` : '請彈奏鋼琴中央 C 或任意音符...'}
                    </span>
                  </div>
                  {testNote && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {testCents > 0 ? `+${testCents}¢` : `${testCents}¢`}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveCalibration}
              className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition mt-1"
            >
              儲存校準設定
            </button>
          </div>
        )}

        {/* Tab 3: Teacher Notes */}
        {activeTab === 'notes' && (
          <div className="flex flex-col gap-3 py-2 text-left">
            <span className="text-xs font-semibold text-slate-300">新增老師 / 家長暖心評語：</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="例如：今天 3 指很放鬆，很有音樂感！"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddTeacherNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow"
              >
                新增
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mt-2">
              {teacherNotesList.map((note, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-200">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Privacy & Backup */}
        {activeTab === 'privacy' && (
          <div className="flex flex-col gap-4 py-2 text-left text-xs">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col gap-2 text-slate-300">
              <div className="font-bold text-white">🔒 隱私與本機資料保障</div>
              <p>• 本 App 運作於純前端，音訊於音訊執行緒即時計算後立刻捨棄，完全不上傳雲端伺服器。</p>
              <p>• 您可隨時將通關紀錄與徽章資料匯出備份，或在需要時一鍵完全抹除。</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportProgressToJson}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl transition"
              >
                📥 匯出進度備份檔 (JSON)
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 py-2.5 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 font-bold rounded-xl transition"
              >
                🗑️ 清除所有本機資料
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
