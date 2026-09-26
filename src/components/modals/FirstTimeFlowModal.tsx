import React, { useState, useEffect } from 'react';
import { AgeBand, InputMode, CalibrationResult } from '../../types/piano';
import { micAdapter } from '../../audio/microphoneAdapter';
import { midiAdapter } from '../../audio/midiAdapter';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { KaiCharacter } from '../mascot/KaiCharacter';

interface FirstTimeFlowModalProps {
  isOpen: boolean;
  onComplete: (age: AgeBand, mode: InputMode, calibration: CalibrationResult) => void;
  onClose?: () => void;
}

export const FirstTimeFlowModal: React.FC<FirstTimeFlowModalProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<'age' | 'mode' | 'privacy' | 'calib_quiet' | 'calib_middleC' | 'calib_done'>('age');
  const [selectedAge, setSelectedAge] = useState<AgeBand>(5);
  const [selectedMode, setSelectedMode] = useState<InputMode>('microphone');
  const [isMidiAvailable, setIsMidiAvailable] = useState(false);

  // Calibration state
  const [noiseLevel, setNoiseLevel] = useState<number>(-45);
  const [isSamplingNoise, setIsSamplingNoise] = useState(false);
  const [middleCHits, setMiddleCHits] = useState(0);
  const [calibratedFreq, setCalibratedFreq] = useState(261.63);

  useEffect(() => {
    setIsMidiAvailable(midiAdapter.isSupported());
  }, []);

  if (!isOpen) return null;

  const handleStartCalibration = async () => {
    try {
      if (selectedMode === 'microphone') {
        await micAdapter.start();
        setStep('calib_quiet');
        // Sample ambient noise for 2.5 seconds
        setIsSamplingNoise(true);
        let minRms = 0.05;
        let samplesCount = 0;

        const unsub = micAdapter.subscribePitchMonitor((data) => {
          if (data.rms > 0) {
            minRms = (minRms * samplesCount + data.rms) / (samplesCount + 1);
            samplesCount++;
            setNoiseLevel(Math.round(20 * Math.log10(Math.max(0.001, minRms))));
          }
        });

        setTimeout(() => {
          unsub();
          setIsSamplingNoise(false);
          setStep('calib_middleC');
          // Listen for Middle C (60)
          const noteUnsub = micAdapter.subscribe((ev) => {
            if (ev.midiNote === 60 || ev.midiNote === 72) {
              pianoSynth.playNote(60, 0.7, 0.8);
              setCalibratedFreq(ev.frequencyHz || 261.63);
              setMiddleCHits((prev) => {
                const next = prev + 1;
                if (next >= 2) {
                  noteUnsub();
                  setTimeout(() => setStep('calib_done'), 500);
                }
                return next;
              });
            }
          });
        }, 2500);
      } else {
        // MIDI mode
        await midiAdapter.start();
        setStep('calib_done');
      }
    } catch (err) {
      alert(`啟動失敗: ${(err as Error).message}。您也可以選擇螢幕觸控模式。`);
    }
  };

  const handleFinish = () => {
    const calibResult: CalibrationResult = {
      ambientNoiseFloorDb: noiseLevel,
      micSensitivity: 1.0,
      pitchToleranceCents: selectedAge <= 5 ? 55 : 40,
      middleCFrequency: calibratedFreq,
      isCalibrated: true,
      calibratedAt: Date.now(),
    };
    onComplete(selectedAge, selectedMode, calibResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 flex flex-col justify-between min-h-[440px]">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span className="font-bold text-sm tracking-tight text-white">
              歡迎來到 KaiQuest Piano Adventure
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {step === 'age' && '步驟 1/4'}
            {step === 'mode' && '步驟 2/4'}
            {step === 'privacy' && '步驟 3/4'}
            {step.startsWith('calib') && '步驟 4/4'}
          </span>
        </div>

        {/* Content based on Step */}
        <div className="flex-1 flex flex-col justify-center py-2">
          {step === 'age' && (
            <div className="flex flex-col gap-4 text-center">
              <KaiCharacter
                mood="excited"
                speechText="哈囉！我是 Kai！請問你今年幾歲了呢？"
                speechEn="Welcome Adventurer!"
                className="justify-center mb-2"
                size="md"
              />
              <p className="text-xs text-slate-400">
                年齡會自動為你安排最合適的手指活動度與節奏節拍：
              </p>
              <div className="grid grid-cols-4 gap-3 my-2">
                {([4, 5, 6, 7] as AgeBand[]).map((age) => (
                  <button
                    key={age}
                    onClick={() => setSelectedAge(age)}
                    className={`py-4 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      selectedAge === age
                        ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-500/40 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-2xl font-black">{age}</span>
                    <span className="text-xs font-medium mt-1">歲啟蒙</span>
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 italic">
                {selectedAge === 4 && '4 歲：著重大肌肉放鬆、3 音入門與趣味故事引導。'}
                {selectedAge === 5 && '5 歲：啟動 5 指位置、反覆音控制與兒歌旋律。'}
                {selectedAge === 6 && '6 歲：五線譜全方位結合、手位伸展與貝多芬名曲。'}
                {selectedAge === 7 && '7 歲：雙手輪奏、G 大調新手位移調與快速哈農。'}
              </div>
            </div>
          )}

          {step === 'mode' && (
            <div className="flex flex-col gap-4">
              <KaiCharacter
                mood="listening"
                speechText="你想如何與 Kai 一起彈奏鋼琴？"
                speechEn="Select Your Piano Input"
                className="justify-center mb-2"
                size="md"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedMode('microphone')}
                  className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    selectedMode === 'microphone'
                      ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500 text-white'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">🎙️ 實體鋼琴 / 麥克風</span>
                    <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">iPad 推薦</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    將 iPad 放上鋼琴譜架，App 會自動透過麥克風即時辨識琴音！
                  </p>
                </button>

                <button
                  onClick={() => setSelectedMode(isMidiAvailable ? 'midi' : 'touch')}
                  className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    selectedMode === 'midi' || selectedMode === 'touch'
                      ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500 text-white'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      {isMidiAvailable ? '🎹 USB MIDI 電鋼琴' : '📱 螢幕觸控琴鍵'}
                    </span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                      {isMidiAvailable ? '極致零延遲' : '靜音練習'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isMidiAvailable
                      ? '支援 Chrome / Edge 直接讀取電鋼琴 NoteOn 與力道。'
                      : '若身邊暫無鋼琴，可以直接用手指點擊螢幕琴鍵完成挑戰！'}
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 'privacy' && (
            <div className="flex flex-col gap-4 text-center">
              <KaiCharacter
                mood="idle"
                speechText="家長與老師請放心，我們 100% 重視兒童隱私！"
                speechEn="Safe & Local First"
                className="justify-center mb-1"
                size="md"
              />
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-left flex flex-col gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <span>🛡️ 隱私安全守則承諾</span>
                </div>
                <p>• <strong>不上傳錄音</strong>：麥克風僅在設備本機進行頻率運算，音訊絕不上傳伺服器。</p>
                <p>• <strong>不建立帳號</strong>：完全免註冊、免密碼，不收集兒童任何個人真實個資。</p>
                <p>• <strong>本機離線保存</strong>：學習進度完全保存在此設備的瀏覽器中，支援 PWA 離線開啟。</p>
              </div>
            </div>
          )}

          {step === 'calib_quiet' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <KaiCharacter
                mood="listening"
                speechText="噓～現在請讓房間保持安靜 2 秒鐘，讓 Kai 聽聽環境聲音..."
                speechEn="Shh... Listening to Room"
                className="justify-center"
                size="lg"
              />
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                <div className="h-full bg-blue-500 animate-pulse w-full" />
              </div>
              <span className="text-xs font-mono text-slate-400">
                環境底噪監測中... ({noiseLevel} dB)
              </span>
            </div>
          )}

          {step === 'calib_middleC' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <KaiCharacter
                mood="listening"
                speechText="請在你的鋼琴上，彈下中央 C (Middle C) 兩次！"
                speechEn="Play Middle C (C4) Twice!"
                className="justify-center"
                size="lg"
              />
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border-2 ${
                  middleCHits >= 1 ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {middleCHits >= 1 ? '✓' : '1'}
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border-2 ${
                  middleCHits >= 2 ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {middleCHits >= 2 ? '✓' : '2'}
                </div>
              </div>
              <p className="text-xs text-slate-400">
                如果身邊沒有鋼琴，也可以點擊下方按鈕直接預設完成校準。
              </p>
              <button
                onClick={() => setStep('calib_done')}
                className="text-xs text-blue-400 underline"
              >
                跳過中央 C 測試，直接完成
              </button>
            </div>
          )}

          {step === 'calib_done' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <KaiCharacter
                mood="celebrating"
                speechText="太棒了！校準全部完成，我們的音樂地圖已經為你開啟！"
                speechEn="Great Job! All Ready!"
                className="justify-center"
                size="lg"
              />
              <div className="bg-emerald-950/60 border border-emerald-700/60 rounded-2xl p-4 text-xs text-emerald-200">
                ✓ 麥克風音量門檻已適配<br />
                ✓ 中央 C 音高校正完畢 ({calibratedFreq.toFixed(1)} Hz)<br />
                ✓ 音準容差已調整為 {selectedAge} 歲友善模式
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          {step !== 'age' && step !== 'calib_quiet' && step !== 'calib_middleC' ? (
            <button
              onClick={() => {
                if (step === 'mode') setStep('age');
                if (step === 'privacy') setStep('mode');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              上一步
            </button>
          ) : (
            <div />
          )}

          {step === 'age' && (
            <button
              onClick={() => setStep('mode')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg ml-auto"
            >
              下一步：選擇琴音輸入
            </button>
          )}

          {step === 'mode' && (
            <button
              onClick={() => setStep('privacy')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg ml-auto"
            >
              下一步：隱私承諾
            </button>
          )}

          {step === 'privacy' && (
            <button
              onClick={handleStartCalibration}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg ml-auto"
            >
              啟用並開始環境校準
            </button>
          )}

          {step === 'calib_done' && (
            <button
              onClick={handleFinish}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-bold text-white shadow-xl ml-auto animate-pulse"
            >
              出發！進入課程地圖 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
