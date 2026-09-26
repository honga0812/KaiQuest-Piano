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
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-6 select-none flex flex-col justify-between gap-5 h-full ${className}`}>
      {/* Header Deck - Bright & Cheerful */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border-3 border-amber-300 rounded-3xl p-6 shadow-sm">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-wider text-emerald-600 font-mono">
              Free Play & Scale Tuner
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-sm font-black text-amber-800">
              即時音階辨識與自由探索
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-amber-950 mt-1">
            自由彈奏與音階辨識遊樂場
          </h2>
          <p className="text-base text-slate-700 mt-1 font-bold">
            在鋼琴上彈下任何琴鍵或音階，App 會即時辨認音高、唱名並點亮音階階梯！
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <button
            onClick={() => setShowScaleModal(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-black rounded-2xl shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <span>🎵</span>
            <span>開啟音階闖關診斷室</span>
          </button>

          {/* Metronome Control */}
          <div className="flex items-center gap-3 bg-amber-100/80 px-4 py-2 rounded-2xl border-2 border-amber-300">
            <button
              onClick={() => setIsMetronome(!isMetronome)}
              className={`px-3 py-1.5 rounded-xl text-sm font-black transition ${
                isMetronome ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-700 border border-amber-200'
              }`}
            >
              ⏱️ {isMetronome ? '節拍器開' : '節拍器關'}
            </button>
            <div className="flex items-center gap-2 text-sm font-mono font-black text-amber-950">
              <span>{bpm} BPM</span>
              <input
                type="range"
                min="50"
                max="140"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-20 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Microphone prompt banner if mic not running */}
      {inputMode === 'microphone' && !isMicRunning && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-3 border-emerald-400 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl">🎙️</span>
            <div>
              <span className="text-base font-black text-emerald-950 block">麥克風聽琴辨識尚未啟動</span>
              <span className="text-sm text-emerald-800 font-bold block">
                {micError
                  ? micError
                  : '點擊右方按鈕開啟麥克風。若瀏覽器沒有跳出允許提示，請點擊網址列左側 🔒 鎖頭圖示手動改為「允許」！'}
              </span>
            </div>
          </div>
          <button
            onClick={handleActivateMic}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-base font-black rounded-2xl shadow-lg transition flex items-center gap-2 animate-pulse whitespace-nowrap active:scale-95"
          >
            <span>🎙️</span>
            <span>點擊啟動麥克風聽琴</span>
          </button>
        </div>
      )}

      {/* Live C Major Scale Step Ladder - Bright & Big */}
      <div className="bg-white border-3 border-amber-300 rounded-3xl p-5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between text-sm md:text-base">
          <span className="font-black text-amber-950 flex items-center gap-2">
            <span className="text-xl">🎹</span>
            <span>C 大調音階即時辨識階梯 (Do Re Mi Fa Sol La Ti Do)</span>
          </span>
          <span className="text-amber-800 text-xs md:text-sm font-bold">彈奏鋼琴即時發光驗證</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
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
                className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm ${
                  isTargetActive
                    ? 'bg-gradient-to-t from-emerald-500 to-teal-400 border-white text-white scale-105 shadow-lg ring-3 ring-emerald-300'
                    : 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-slate-800'
                }`}
              >
                <span className="text-base font-black">{s.solfege}</span>
                <span className="text-xs font-mono font-bold opacity-80">{s.name}</span>
                <span className="text-xs font-black text-blue-700">簡譜 {s.num}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mascot Cheer & Note Roll */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
        <div className="flex items-center gap-3 bg-white border-2 border-amber-300 rounded-3xl px-5 py-3 max-w-md overflow-x-auto shadow-sm">
          <span className="text-sm font-black text-amber-950 shrink-0">最近彈奏:</span>
          {noteHistory.length > 0 ? (
            noteHistory.map((n, idx) => (
              <span
                key={`${n}-${idx}`}
                className={`px-3 py-1 rounded-xl font-mono font-black text-sm shadow-xs ${
                  idx === 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white scale-105'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {n}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400 italic">尚無彈奏紀錄</span>
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

