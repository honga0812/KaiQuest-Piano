import React, { useState, useEffect } from 'react';
import { micAdapter } from '../../audio/microphoneAdapter';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { PianoNoteEvent } from '../../types/piano';
import { KaiCharacter } from '../mascot/KaiCharacter';
import confetti from 'canvas-confetti';
import { getPublicShareUrl } from '../../utils/safariShare';

interface ScaleRecognitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScaleStep {
  midi: number;
  noteName: string;
  solfege: string;
  numbered: string;
  freq: number;
  color: string;
}

const C_MAJOR_SCALE: ScaleStep[] = [
  { midi: 60, noteName: 'C4', solfege: 'Do', numbered: '1', freq: 261.6, color: 'from-rose-500 to-red-600' },
  { midi: 62, noteName: 'D4', solfege: 'Re', numbered: '2', freq: 293.7, color: 'from-orange-500 to-amber-600' },
  { midi: 64, noteName: 'E4', solfege: 'Mi', numbered: '3', freq: 329.6, color: 'from-amber-400 to-yellow-500' },
  { midi: 65, noteName: 'F4', solfege: 'Fa', numbered: '4', freq: 349.2, color: 'from-emerald-500 to-green-600' },
  { midi: 67, noteName: 'G4', solfege: 'Sol', numbered: '5', freq: 392.0, color: 'from-cyan-500 to-blue-600' },
  { midi: 69, noteName: 'A4', solfege: 'La', numbered: '6', freq: 440.0, color: 'from-blue-500 to-indigo-600' },
  { midi: 71, noteName: 'B4', solfege: 'Ti', numbered: '7', freq: 493.9, color: 'from-purple-500 to-violet-600' },
  { midi: 72, noteName: 'C5', solfege: '高音 Do', numbered: '1̇', freq: 523.3, color: 'from-pink-500 to-rose-600' },
];

export const ScaleRecognitionModal: React.FC<ScaleRecognitionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isMicRunning, setIsMicRunning] = useState(micAdapter.getIsRunning());
  const [micError, setMicError] = useState<string | null>(null);
  const [activeMidi, setActiveMidi] = useState<number | null>(null);
  const [detectedNote, setDetectedNote] = useState<string>('');
  const [detectedFreq, setDetectedFreq] = useState<number>(0);
  const [detectedCents, setDetectedCents] = useState<number>(0);
  const [liveRms, setLiveRms] = useState<number>(0);
  const [noiseThreshold, setNoiseThreshold] = useState<number>(micAdapter.getNoiseGateThreshold());
  const [isAboveThreshold, setIsAboveThreshold] = useState<boolean>(false);

  // Scale Quest mode
  const [isQuestMode, setIsQuestMode] = useState(false);
  const [questStepIndex, setQuestStepIndex] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);

  // History of recognized notes
  const [history, setHistory] = useState<{ note: string; midi: number; cents: number; time: string }[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Check mic running state & threshold
    setIsMicRunning(micAdapter.getIsRunning());
    setNoiseThreshold(micAdapter.getNoiseGateThreshold());

    // Subscribe to status
    const unsubStatus = micAdapter.subscribeStatus((st) => {
      setIsMicRunning(st.isListening);
      if (st.error) setMicError(st.error);
    });

    // Subscribe to pitch monitor for live needle & threshold
    const unsubPitch = micAdapter.subscribePitchMonitor?.((data) => {
      setLiveRms(data.rms);
      setIsAboveThreshold(!!data.isAboveThreshold);
      if (data.threshold !== undefined) {
        setNoiseThreshold(data.threshold);
      }
      if (data.frequency > 0) {
        setDetectedFreq(Math.round(data.frequency * 10) / 10);
        setDetectedCents(data.cents);
        setDetectedNote(data.noteName);
      }
    });

    // Subscribe to discrete note triggers
    const unsubNote = micAdapter.subscribe((ev: PianoNoteEvent) => {
      setActiveMidi(ev.midiNote);
      setDetectedNote(ev.noteName);
      setDetectedFreq(ev.frequencyHz || 0);
      setDetectedCents(ev.centsOff || 0);

      const timeStr = new Date().toLocaleTimeString('zh-TW', { hour12: false, minute: '2-digit', second: '2-digit' });
      setHistory((prev) => [{ note: ev.noteName, midi: ev.midiNote, cents: ev.centsOff || 0, time: timeStr }, ...prev.slice(0, 9)]);

      // If quest mode active, check target
      if (isQuestMode && !questCompleted) {
        const target = C_MAJOR_SCALE[questStepIndex];
        const isMatch = ev.midiNote === target.midi || (ev.midiNote % 12 === target.midi % 12);
        if (isMatch) {
          pianoSynth.playCorrectHitSound();
          if (questStepIndex + 1 < C_MAJOR_SCALE.length) {
            setQuestStepIndex((prev) => prev + 1);
          } else {
            setQuestCompleted(true);
            pianoSynth.playFanfare();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
          }
        }
      }

      setTimeout(() => {
        setActiveMidi(null);
      }, 350);
    });

    return () => {
      unsubStatus();
      unsubPitch();
      unsubNote();
    };
  }, [isOpen, isQuestMode, questStepIndex, questCompleted]);

  if (!isOpen) return null;

  const handleStartMic = async () => {
    try {
      setMicError(null);
      await micAdapter.start();
      setIsMicRunning(true);
    } catch (err) {
      setMicError((err as Error).message);
    }
  };

  const handleStopMic = () => {
    micAdapter.stop();
    setIsMicRunning(false);
  };

  const handleDemoPlay = (midi: number) => {
    pianoSynth.playNote(midi, 0.8, 0.8);
    setActiveMidi(midi);
    setTimeout(() => setActiveMidi(null), 300);
  };

  const resetQuest = () => {
    setIsQuestMode(true);
    setQuestStepIndex(0);
    setQuestCompleted(false);
  };

  const rmsPercent = Math.min(100, Math.round((liveRms / 0.035) * 100));
  const needlePercent = ((Math.max(-50, Math.min(50, detectedCents)) + 50) / 100) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 md:p-6 select-none animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-7 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                鋼琴即時音階聽辨與辨識診斷室
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/30">
                Real-time Scale Tuner
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              彈下鋼琴上的任何琴鍵（如 C4 中央 C、D、E、F、G、A、B），App 會透過麥克風即時辨認音名、唱名與音準！
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Mic Control Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isMicRunning ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>麥克風狀態：{isMicRunning ? '正在聆聽鋼琴聲 (Listening)' : '未啟動 (Inactive)'}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isMicRunning ? '請在真實鋼琴上彈奏音符或音階' : '點擊右側按鈕開啟麥克風權限以聽琴辨音'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isMicRunning ? (
              <button
                onClick={handleStartMic}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition animate-pulse"
              >
                <span>🎙️</span>
                <span>立即開啟麥克風聽琴</span>
              </button>
            ) : (
              <button
                onClick={handleStopMic}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
              >
                暫停麥克風
              </button>
            )}

            {/* Volume meter */}
            {isMicRunning && (
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800" title={`即時輸入音量: ${rmsPercent}%`}>
                <span className="text-[10px] text-slate-400 font-mono">音量</span>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      rmsPercent > 50 ? 'bg-emerald-400' : rmsPercent > 10 ? 'bg-blue-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${rmsPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Microphone Troubleshooting Guide Accordion / Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-left text-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>💡</span>
              <span>瀏覽器沒有跳出「允許使用麥克風」的視窗？</span>
            </span>
            <a
              href={getPublicShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-semibold rounded-lg border border-blue-500/40 text-[11px] transition flex items-center gap-1"
            >
              <span>↗</span>
              <span>在新分頁獨立開啟 (免 401 錯誤)</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 text-[11px] leading-relaxed pt-1">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">🖥️ 電腦 Chrome / Edge 瀏覽器：</strong>
              1. 點擊瀏覽器上方網址列最左邊的 <strong>🔒 鎖頭圖示</strong>（或調整網站設定按鈕）。<br />
              2. 找到<strong>「麥克風」</strong>選項，將其從「封鎖」手動改為<strong>「允許」</strong>。<br />
              3. 點擊「重新載入」頁面即可正常辨音！
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">📱 iPad / iPhone Safari 瀏覽器：</strong>
              1. 點擊網址列左側的 <strong>大小 (aA)</strong> 按鈕 → <strong>「網站設定」</strong>。<br />
              2. 將<strong>「麥克風」</strong>設定改為<strong>「允許」</strong>。<br />
              3. 或到 iPad 系統<strong>「設定」→「Safari」→「麥克風」</strong>改為允許。
            </div>
          </div>
        </div>

        {micError && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs text-left flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <strong>麥克風啟動狀態：</strong>{micError}
            </div>
          </div>
        )}

        {/* Noise Gate & Piano Frequency Filter Section */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🎚️</span>
              <div>
                <span className="text-xs font-bold text-white block">
                  雜音過濾門檻（閥值）與鋼琴頻率專用濾波器
                </span>
                <span className="text-[11px] text-slate-400">
                  低於閥值的聲音會被自動過濾，僅針對鋼琴基頻 (65Hz ~ 2100Hz) 進行深度音階分析
                </span>
              </div>
            </div>

            {/* Threshold level indicator */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400">目前狀態:</span>
              <span className={`text-xs font-bold font-mono ${isAboveThreshold ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
                {isAboveThreshold ? '🎹 偵測到鋼琴有效音' : '🔇 低於閥值 (雜音過濾中)'}
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                setNoiseThreshold(0.003);
                micAdapter.setNoiseGateThreshold(0.003);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                Math.abs(noiseThreshold - 0.003) < 0.0015
                  ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">🟢 輕柔觸鍵 / 幼兒模式</span>
                <span className="text-[10px] text-emerald-400 font-mono">最靈敏</span>
              </div>
              <span className="text-[10px] text-slate-400">輕輕彈即可辨識，無須大力彈奏</span>
            </button>

            <button
              onClick={() => {
                setNoiseThreshold(0.005);
                micAdapter.setNoiseGateThreshold(0.005);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                Math.abs(noiseThreshold - 0.005) < 0.0015
                  ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">🔵 標準適中模式 (推薦)</span>
                <span className="text-[10px] text-blue-400 font-mono">預設</span>
              </div>
              <span className="text-[10px] text-slate-400">正常琴鍵力道，自動過濾小雜音</span>
            </button>

            <button
              onClick={() => {
                setNoiseThreshold(0.012);
                micAdapter.setNoiseGateThreshold(0.012);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                Math.abs(noiseThreshold - 0.012) < 0.002
                  ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">🟡 微吵環境模式</span>
                <span className="text-[10px] text-amber-400 font-mono">抗干擾</span>
              </div>
              <span className="text-[10px] text-slate-400">周圍有人說話或環境音稍大</span>
            </button>
          </div>

          {/* Slider and live VU meter comparison */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>手動微調門檻閥值 (往左調更輕鬆彈奏):</span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round(noiseThreshold * 1000) / 10}% ({Math.round(20 * Math.log10(Math.max(0.0005, noiseThreshold)))} dB)
              </span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.025"
              step="0.001"
              value={noiseThreshold}
              onChange={(e) => {
                const val = Number(e.target.value);
                setNoiseThreshold(val);
                micAdapter.setNoiseGateThreshold(val);
              }}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span className="text-emerald-400 font-semibold">超靈敏 (0.1% 輕彈即辨)</span>
              <span className="text-slate-400">💡 只要鋼琴聲音稍高於底噪即可立刻被辨識</span>
              <span>抗干擾 (2.5%)</span>
            </div>
          </div>
        </div>

        {/* Live Detected Note HUD & Pitch Needle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 items-center">
          {/* Note & Solfege Badge */}
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-all shadow-md ${
              detectedNote
                ? 'bg-blue-600 border-blue-400 text-white scale-105'
                : 'bg-slate-800/80 border-slate-700 text-slate-500'
            }`}>
              <span className="text-xl leading-none">{detectedNote || '--'}</span>
              <span className="text-[10px] mt-0.5 text-blue-200">
                {detectedNote ? C_MAJOR_SCALE.find(s => s.noteName === detectedNote)?.solfege || '音符' : '等待彈奏'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-slate-400 block font-medium">當前聽到的琴音</span>
              <span className="text-sm font-bold text-white">
                {detectedFreq > 0 ? `${detectedFreq} Hz` : '請彈琴鍵...'}
              </span>
              {detectedNote && (
                <span className="text-[11px] text-emerald-400 block font-mono">
                  {Math.abs(detectedCents) <= 15 ? '✓ 音準極佳' : `${detectedCents > 0 ? '+' : ''}${detectedCents} cents`}
                </span>
              )}
            </div>
          </div>

          {/* Tuner Cent Needle */}
          <div className="flex flex-col gap-1 px-2 md:col-span-2">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>偏低 -50¢</span>
              <span className={Math.abs(detectedCents) <= 15 && detectedNote ? 'text-emerald-400 font-bold' : ''}>
                {detectedNote ? `${detectedCents > 0 ? '+' : ''}${detectedCents}¢` : '0¢ 中央標準'}
              </span>
              <span>偏高 +50¢</span>
            </div>
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-emerald-500/20" />
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-emerald-400 z-10" />
              {detectedNote && (
                <div
                  className={`absolute top-0 bottom-0 w-2.5 -ml-1.5 rounded-full transition-all duration-100 ${
                    Math.abs(detectedCents) <= 15 ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-amber-400'
                  }`}
                  style={{ left: `${needlePercent}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* C-Major Scale Ladder (Do Re Mi Fa Sol La Ti Do) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎵 C 大調基礎音階階梯 (C Major Scale)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                只要在鋼琴上彈奏以下任何一個音，對應的卡片會立刻亮起並跳動！
              </p>
            </div>

            {/* Mode switch */}
            <div className="flex items-center gap-2">
              <button
                onClick={resetQuest}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  isQuestMode ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>⭐</span>
                <span>音階連續闖關挑戰</span>
              </button>
              {isQuestMode && (
                <button
                  onClick={() => setIsQuestMode(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  切換為自由聽音
                </button>
              )}
            </div>
          </div>

          {/* Scale Step Cards Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-1">
            {C_MAJOR_SCALE.map((step, idx) => {
              const isHeard = activeMidi === step.midi || (activeMidi !== null && activeMidi % 12 === step.midi % 12);
              const isQuestTarget = isQuestMode && questStepIndex === idx && !questCompleted;
              const isQuestPassed = isQuestMode && idx < questStepIndex;

              return (
                <div
                  key={step.noteName}
                  onClick={() => handleDemoPlay(step.midi)}
                  title="點擊試聽鋼琴標準音"
                  className={`relative cursor-pointer rounded-2xl p-3 flex flex-col items-center justify-between transition-all duration-150 border text-center ${
                    isHeard
                      ? `bg-gradient-to-b ${step.color} text-white scale-110 shadow-xl ring-4 ring-emerald-400/80 z-10`
                      : isQuestTarget
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 text-white animate-pulse'
                      : isQuestPassed
                      ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {/* Quest indicator */}
                  {isQuestTarget && (
                    <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow">
                      目標
                    </span>
                  )}
                  {isQuestPassed && (
                    <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow">
                      ✓
                    </span>
                  )}

                  {/* Solfege */}
                  <span className="text-base font-extrabold">{step.solfege}</span>

                  {/* Note Name */}
                  <span className="text-xs font-mono font-bold mt-1 px-1.5 py-0.5 rounded bg-black/30">
                    {step.noteName}
                  </span>

                  {/* Numbered notation */}
                  <span className="text-[11px] font-bold opacity-80 mt-1">
                    簡譜 {step.numbered}
                  </span>

                  {/* Frequency & Play cue */}
                  <span className="text-[9px] opacity-60 font-mono mt-1">
                    {step.freq}Hz
                  </span>

                  <span className="text-[9px] text-blue-300 opacity-0 hover:opacity-100 mt-1">
                    點擊試聽
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quest Celebration Banner */}
        {isQuestMode && questCompleted && (
          <div className="bg-emerald-950/70 border border-emerald-600 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <KaiCharacter mood="celebrating" size="sm" />
              <div>
                <h4 className="text-sm font-bold text-white">太神了！你成功彈奏了完整的 C 大調音階！</h4>
                <p className="text-xs text-emerald-300">
                  所有 8 個音階音符皆已通過即時麥克風聽辨驗證！
                </p>
              </div>
            </div>
            <button
              onClick={resetQuest}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow transition"
            >
              再挑戰一次 ↺
            </button>
          </div>
        )}

        {/* Recent Note Recognition History */}
        <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>📝</span>
              <span>即時辨識琴音紀錄 (Recent Recognitions)</span>
            </span>
            <span className="text-[10px] text-slate-500">最近 10 次琴音辨識</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {history.length > 0 ? (
              history.map((h, i) => (
                <div
                  key={`${h.time}-${i}`}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono shrink-0 transition-all ${
                    i === 0
                      ? 'bg-blue-600/30 border-blue-500 text-white scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-white">{h.note}</span>
                  <span className="text-[10px] text-slate-400">{h.time}</span>
                  <span className={`text-[10px] ${Math.abs(h.cents) <= 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {h.cents > 0 ? `+${h.cents}¢` : `${h.cents}¢`}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic py-1">
                尚無琴音記錄。請開啟麥克風並在鋼琴上彈奏任何琴鍵...
              </span>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400">
            💡 小提示：iPad 可直接平放在鋼琴譜架上，建議適度彈奏以獲得最清晰之基音波形。
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
          >
            完成並返回
          </button>
        </div>
      </div>
    </div>
  );
};
