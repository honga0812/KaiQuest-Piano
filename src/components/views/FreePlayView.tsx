import React, { useState, useEffect } from 'react';
import { DynamicKeyboard } from '../piano/DynamicKeyboard';
import { PitchMonitorBar } from '../piano/PitchMonitorBar';
import { micAdapter } from '../../audio/microphoneAdapter';
import { midiAdapter } from '../../audio/midiAdapter';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { InputMode, PianoNoteEvent } from '../../types/piano';
import { KaiCharacter } from '../mascot/KaiCharacter';
import { ScaleRecognitionModal } from '../modals/ScaleRecognitionModal';

interface FreePlayViewProps {
  inputMode: InputMode;
  className?: string;
}

const SCALE_NOTES = [
  { midi: 60, name: 'C4', solfege: 'Do', num: '1' },
  { midi: 62, name: 'D4', solfege: 'Re', num: '2' },
  { midi: 64, name: 'E4', solfege: 'Mi', num: '3' },
  { midi: 65, name: 'F4', solfege: 'Fa', num: '4' },
  { midi: 67, name: 'G4', solfege: 'Sol', num: '5' },
  { midi: 69, name: 'A4', solfege: 'La', num: '6' },
  { midi: 71, name: 'B4', solfege: 'Ti', num: '7' },
  { midi: 72, name: 'C5', solfege: '高音Do', num: '1̇' },
];

export const FreePlayView: React.FC<FreePlayViewProps> = ({
  inputMode,
  className = '',
}) => {
  const [detectedNote, setDetectedNote] = useState('');
  const [liveFreq, setLiveFreq] = useState(0);
  const [liveCents, setLiveCents] = useState(0);
  const [liveRms, setLiveRms] = useState(0);
  const [liveMidi, setLiveMidi] = useState<number | undefined>(undefined);
  const [noteHistory, setNoteHistory] = useState<string[]>([]);
  const [isMetronome, setIsMetronome] = useState(false);
  const [bpm, setBpm] = useState(80);

  const [isMicRunning, setIsMicRunning] = useState(micAdapter.getIsRunning());
  const [micError, setMicError] = useState<string | null>(null);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [isAboveThreshold, setIsAboveThreshold] = useState(false);
  const [noiseThreshold, setNoiseThreshold] = useState(micAdapter.getNoiseGateThreshold());

  useEffect(() => {
    setIsMicRunning(micAdapter.getIsRunning());
    setNoiseThreshold(micAdapter.getNoiseGateThreshold());
    const unsubStatus = micAdapter.subscribeStatus((st) => {
      setIsMicRunning(st.isListening);
      if (st.error) setMicError(st.error);
    });
    return unsubStatus;
  }, []);

  const handleActivateMic = async () => {
    try {
      setMicError(null);
      await micAdapter.start();
      setIsMicRunning(true);
    } catch (err) {
      setMicError((err as Error).message || '啟動麥克風失敗');
    }
  };

  useEffect(() => {
    let unsubNote: (() => void) | undefined;
    let unsubPitch: (() => void) | undefined;

    const handleEvent = (ev: PianoNoteEvent) => {
      setLiveMidi(ev.midiNote);
      setDetectedNote(ev.noteName);
      setLiveFreq(ev.frequencyHz || 0);
      setLiveCents(ev.centsOff || 0);
      setNoteHistory((prev) => [ev.noteName, ...prev.slice(0, 11)]);

      setTimeout(() => setLiveMidi(undefined), 200);
    };

    if (inputMode === 'microphone') {
      unsubNote = micAdapter.subscribe(handleEvent);
      unsubPitch = micAdapter.subscribePitchMonitor?.((data) => {
        setLiveRms(data.rms);
        setIsAboveThreshold(!!data.isAboveThreshold);
        if (data.threshold !== undefined) {
          setNoiseThreshold(data.threshold);
        }
        if (data.frequency > 0) {
          setDetectedNote(data.noteName);
          setLiveFreq(data.frequency);
          setLiveCents(data.cents);
        }
      });
    } else if (inputMode === 'midi') {
      unsubNote = midiAdapter.subscribe(handleEvent);
    }

    return () => {
      unsubNote?.();
      unsubPitch?.();
    };
  }, [inputMode]);

  // Metronome
  useEffect(() => {
    if (!isMetronome) return;
    const interval = (60 / bpm) * 1000;
    let beat = 0;
    const timer = setInterval(() => {
      beat = (beat + 1) % 4;
      pianoSynth.playMetronomeTick(beat === 0);
    }, interval);

    return () => clearInterval(timer);
  }, [isMetronome, bpm]);

  return (
    <div className={`w-full max-w-6xl mx-auto p-3 md:p-5 select-none flex flex-col justify-between gap-3 h-full ${className}`}>
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Free Play & Scale Tuner
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">
              即時音階辨識與自由探索
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-0.5">
            自由彈奏與音階辨識遊樂場
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            在鋼琴上彈下任何琴鍵或音階，App 會即時辨認音高、唱名並點亮音階階梯！
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowScaleModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <span>🎵</span>
            <span>開啟音階闖關診斷室</span>
          </button>

          {/* Metronome Control */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setIsMetronome(!isMetronome)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isMetronome ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              ⏱️ {isMetronome ? '節拍器開' : '節拍器關'}
            </button>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
              <span>{bpm}</span>
              <input
                type="range"
                min="50"
                max="140"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-16 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Microphone prompt banner if mic not running */}
      {inputMode === 'microphone' && !isMicRunning && (
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-emerald-500/70 rounded-2xl p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-xl">🎙️</span>
            <div className="max-w-xl">
              <span className="text-xs font-bold text-white block">麥克風聽琴辨識尚未啟動</span>
              <span className="text-[11px] text-emerald-300 leading-snug block">
                {micError
                  ? micError
                  : '點擊右方按鈕開啟麥克風。若瀏覽器沒有跳出允許提示，請點擊網址列左側 🔒 鎖頭圖示手動改為「允許」，或點擊「在新分頁獨立開啟」！'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={typeof window !== 'undefined' ? window.location.href : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 text-xs font-semibold rounded-xl border border-blue-400/40 transition whitespace-nowrap"
            >
              在新分頁開啟 ↗
            </a>
            <button
              onClick={handleActivateMic}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg transition flex items-center gap-1.5 animate-pulse whitespace-nowrap"
            >
              <span>🎙️</span>
              <span>點擊開啟麥克風聽琴</span>
            </button>
          </div>
        </div>
      )}

      {/* Live C Major Scale Step Ladder */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span>🎹</span>
            <span>C 大調音階即時辨識階梯 (Do Re Mi Fa Sol La Ti Do)</span>
          </span>
          <span className="text-slate-400 text-[11px]">彈奏鋼琴即時發光驗證</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {SCALE_NOTES.map((s) => {
            const isTargetActive = liveMidi === s.midi || (liveMidi !== undefined && liveMidi % 12 === s.midi % 12);
            return (
              <div
                key={s.name}
                onClick={() => {
                  pianoSynth.playNote(s.midi, 0.8, 0.6);
                  setLiveMidi(s.midi);
                  setTimeout(() => setLiveMidi(undefined), 250);
                }}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isTargetActive
                    ? 'bg-gradient-to-t from-emerald-600 to-green-500 border-emerald-300 text-white scale-110 shadow-lg ring-2 ring-emerald-400'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-extrabold">{s.solfege}</span>
                <span className="text-[10px] font-mono font-bold opacity-80">{s.name}</span>
                <span className="text-[9px] opacity-60">簡譜 {s.num}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mascot Cheer & Note Roll */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <KaiCharacter
          mood="listening"
          speechText={
            detectedNote
              ? `你彈了 ${detectedNote}！音色真清脆悅耳！`
              : '彈彈看中央 C 或是你喜歡的旋律吧！'
          }
          speechEn="Explore Any Melody!"
          size="md"
        />

        {/* Note History Roll */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 max-w-md overflow-x-auto">
          <span className="text-xs text-slate-400 shrink-0 font-medium">最近彈奏:</span>
          {noteHistory.length > 0 ? (
            noteHistory.map((n, idx) => (
              <span
                key={`${n}-${idx}`}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                  idx === 0
                    ? 'bg-blue-600 text-white scale-110 shadow'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {n}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">尚無彈奏紀錄</span>
          )}
        </div>
      </div>

      {/* Real-time Pitch Monitor */}
      <PitchMonitorBar
        currentDetectedNoteName={detectedNote}
        centsOff={liveCents}
        frequencyHz={liveFreq}
        rmsLevel={liveRms}
        isStable={true}
        isListening={inputMode === 'microphone' ? isMicRunning : true}
        onActivateMic={inputMode === 'microphone' ? handleActivateMic : undefined}
        noiseThreshold={noiseThreshold}
        isAboveThreshold={isAboveThreshold}
      />

      {/* Interactive Full Piano Keyboard */}
      <div className="w-full">
        <DynamicKeyboard
          liveActiveMidiNote={liveMidi}
          showFingerNumbers={false}
          onKeyPress={(m) => {
            setLiveMidi(m);
            setTimeout(() => setLiveMidi(undefined), 200);
          }}
        />
      </div>

      {/* Scale Recognition Modal */}
      <ScaleRecognitionModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
      />
    </div>
  );
};

