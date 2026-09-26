import React, { useState, useEffect, useRef } from 'react';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { FoxPracticeCorner } from '../mascot/FoxPracticeCorner';
import { TheoryStaffInteractive, ClefType, TheoryStaffNoteItem } from '../piano/TheoryStaffInteractive';

type TheorySubTab = 'overview' | 'beats' | 'treble' | 'bass' | 'alto' | 'quiz';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  midiHint: number;
  auxStaff: {
    clef: ClefType;
    highlightLine?: number;
    highlightSpace?: number;
    highlightMidi?: number;
    caption: string;
    sampleNotes?: TheoryStaffNoteItem[];
  };
}

export const MusicTheoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TheorySubTab>('overview');

  // Metronome for Rhythm unit
  const [bpm, setBpm] = useState(80);
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [activeBeat, setActiveBeat] = useState(0);
  const [timeSignatureMode, setTimeSignatureMode] = useState<4 | 3 | 2>(4);
  const beatTimerRef = useRef<number | null>(null);

  // Staff highlight states for Treble & Bass & Alto
  const [trebleHighlightLine, setTrebleHighlightLine] = useState<number | undefined>(undefined);
  const [trebleHighlightSpace, setTrebleHighlightSpace] = useState<number | undefined>(undefined);
  const [selectedTrebleMidi, setSelectedTrebleMidi] = useState<number | undefined>(undefined);

  const [bassHighlightLine, setBassHighlightLine] = useState<number | undefined>(undefined);
  const [bassHighlightSpace, setBassHighlightSpace] = useState<number | undefined>(undefined);
  const [selectedBassMidi, setSelectedBassMidi] = useState<number | undefined>(undefined);

  const [altoHighlightLine, setAltoHighlightLine] = useState<number | undefined>(3);
  const [selectedAltoMidi, setSelectedAltoMidi] = useState<number | undefined>(60);

  // Grand staff selected note
  const [selectedStaffNote, setSelectedStaffNote] = useState<TheoryStaffNoteItem | null>(null);

  // Quiz state
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Metronome effect
  useEffect(() => {
    if (!isPlayingBeat) {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      setActiveBeat(0);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    beatTimerRef.current = window.setInterval(() => {
      setActiveBeat((prev) => {
        const next = (prev + 1) % timeSignatureMode;
        pianoSynth.playMetronomeTick(next === 0);
        return next;
      });
    }, intervalMs);

    return () => {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    };
  }, [isPlayingBeat, bpm, timeSignatureMode]);

  // Quiz Questions with Auxiliary Visual 5-Line Staff
  const quizQuestions: QuizQuestion[] = [
    {
      question: '請看輔助五線譜：高音譜號（G譜號）起筆環繞的是哪一條線？',
      options: ['第一線 (E4)', '第二線 (G4 / Sol)', '第三線 (B4)', '下加一線 (C4)'],
      correctIdx: 1,
      explanation: '高音譜號又稱 G 譜號，它的中心螺旋正好圈住第二線的 G (Sol)！看輔助五線譜上高亮的第二線！',
      midiHint: 67,
      auxStaff: {
        clef: 'treble',
        highlightLine: 2,
        highlightMidi: 67,
        caption: '🎼 高音五線譜輔助：金色高亮處即為高音譜號環繞的「第 2 線 (G4 / Sol)」',
      },
    },
    {
      question: '請看輔助五線譜：四分音符（實心有符幹）在 4/4 拍中佔幾拍？',
      options: ['4 拍', '2 拍', '1 拍 (標準一拍)', '½ 拍'],
      correctIdx: 2,
      explanation: '四分音符是音樂世界的基石，在 4/4 拍中剛好佔 1 拍！',
      midiHint: 60,
      auxStaff: {
        clef: 'treble',
        highlightMidi: 60,
        caption: '𝅘𝅥 四分音符輔助：實心黑符頭 + 符幹，在 4/4 拍中代表 1 拍',
        sampleNotes: [
          { id: 'q-n1', noteName: 'C4', solfege: 'Do', midiNote: 60, positionLabel: '下加1線 (1拍)', lineOrSpace: 'ledger', indexNum: 0 },
        ],
      },
    },
    {
      question: '請看輔助五線譜：八分音符（實心帶 1 個符尾）的時值是多少拍？',
      options: ['2 拍', '1 拍', '½ 拍 (二分之一拍)', '¼ 拍 (四分之一拍)'],
      correctIdx: 2,
      explanation: '八分音符有一條可愛的單符尾，長度正好是半拍（½ 拍），兩個八分音符等於一個四分音符！',
      midiHint: 64,
      auxStaff: {
        clef: 'treble',
        highlightMidi: 64,
        caption: '𝅘𝅥𝅮 八分音符輔助：帶單條符尾，長度是 ½ 拍（二分之一拍）',
        sampleNotes: [
          { id: 'q-n2', noteName: 'E4', solfege: 'Mi', midiNote: 64, positionLabel: '第1線 (½拍)', lineOrSpace: 'line', indexNum: 1 },
        ],
      },
    },
    {
      question: '請看輔助五線譜：十六分音符（帶 2 條平行雙符尾）的長度是多少拍？',
      options: ['¼ 拍 (四分之一拍)', '½ 拍', '1 拍', '2 拍'],
      correctIdx: 0,
      explanation: '十六分音符有雙符尾，長度是 ¼ 拍，四個十六分音符加起來才等於 1 拍！',
      midiHint: 67,
      auxStaff: {
        clef: 'treble',
        highlightMidi: 67,
        caption: '𝅘𝅥𝅯 十六分音符輔助：帶兩條平行符尾，長度是 ¼ 拍（四分之一拍）',
        sampleNotes: [
          { id: 'q-n3', noteName: 'G4', solfege: 'Sol', midiNote: 67, positionLabel: '第2線 (¼拍)', lineOrSpace: 'line', indexNum: 2 },
        ],
      },
    },
    {
      question: '請看輔助五線譜：低音譜號（F 譜號）的兩個小圓點，夾在哪一條線上？',
      options: ['第一線', '第二線', '第三線', '第四線 (F3 / Fa)'],
      correctIdx: 3,
      explanation: '低音譜號兩點穩穩夾在第四線，標誌著低音區的 F (Fa)！看輔助五線譜第四線！',
      midiHint: 53,
      auxStaff: {
        clef: 'bass',
        highlightLine: 4,
        highlightMidi: 53,
        caption: '𝄢 低音五線譜輔助：金色高亮處即為低音譜號兩點所夾的「第 4 線 (F3 / Fa)」',
      },
    },
    {
      question: '請看輔助大譜表：連接高音譜表與低音譜表的「橋梁」是哪個音？',
      options: ['中央 C (C4 / Do)', '低音 C (C3)', '高音 C (C5)', '標準音 A (A4)'],
      correctIdx: 0,
      explanation: '中央 C (Middle C) 既是高音譜表的下加一線，也是低音譜表的上加一線，是雙手相會的樞紐！',
      midiHint: 60,
      auxStaff: {
        clef: 'grand',
        highlightMidi: 60,
        caption: '🌌 大譜表輔助：正中央的彩虹橋音符即為「中央 C4 (Do)」',
      },
    },
    {
      question: '請看輔助中音譜表：C 譜號（中音譜號）的中心凹口正對著哪一條線？',
      options: ['第一線', '第二線', '第三線 (中央 C4)', '第五線'],
      correctIdx: 2,
      explanation: '中音譜號是 C 譜號的一種，它的中心凹口指著哪一條線，那一條線就是中央 C！在中音譜表上它正對「第三線」！',
      midiHint: 60,
      auxStaff: {
        clef: 'alto',
        highlightLine: 3,
        highlightMidi: 60,
        caption: '𝄡 中音五線譜輔助：中心凹口精準對齊「第 3 線 = 中央 C4」',
      },
    },
    {
      question: '請看輔助五線譜：附點二分音符（空心符頭有符幹加一個點）算幾拍？',
      options: ['2 拍', '3 拍 (2 + 1 = 3拍)', '4 拍', '1.5 拍'],
      correctIdx: 1,
      explanation: '附點增加音符時值的一半！二分音符(2拍) + 一半(1拍) = 3 拍！',
      midiHint: 65,
      auxStaff: {
        clef: 'treble',
        highlightMidi: 65,
        caption: '𝅗𝅥. 附點二分音符輔助：2拍 + 附點1拍 = 3 拍',
        sampleNotes: [
          { id: 'q-n4', noteName: 'F4', solfege: 'Fa', midiNote: 65, positionLabel: '第1間 (3拍)', lineOrSpace: 'space', indexNum: 1 },
        ],
      },
    },
  ];

  const currentQuiz = quizQuestions[currentQuizIndex];

  const handleAnswerQuiz = (optionIdx: number) => {
    setSelectedAnswer(optionIdx);
    const correct = optionIdx === currentQuiz.correctIdx;
    setIsAnswerCorrect(correct);
    if (correct) {
      pianoSynth.playCelebrationChime();
      setQuizScore((prev) => prev + 1);
      setQuizStreak((prev) => prev + 1);
    } else {
      pianoSynth.playCorrectHitSound();
      setQuizStreak(0);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setCurrentQuizIndex((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6 select-none">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-800 to-amber-600 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-300/40 text-left">
        <div className="flex flex-col gap-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-300 font-mono bg-yellow-950/70 px-3 py-1 rounded-full border border-yellow-400/40">
              🎼 鋼琴小天才必修 · 互動樂理小學堂
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
            五線譜、譜號與拍子探險
          </h1>
          <p className="text-xs md:text-sm text-indigo-100 font-bold leading-relaxed">
            真實呈現五條線與四個間！高音譜表、低音譜表、中音譜表與大譜表全面配備直觀五線譜輔助，秒懂音符位置與時值長度，點擊音符即時彈奏琴音！
          </p>
        </div>

        {/* Mascot */}
        <div className="z-10 shrink-0 flex items-center gap-3">
          <div className="bg-slate-900/80 border border-amber-400/60 p-3.5 rounded-2xl text-xs font-bold text-amber-200 shadow-xl max-w-[210px]">
            <p className="font-extrabold text-white">🦊 小狐狸 Kai 導師：</p>
            <p className="mt-1">「高音譜像美麗小鳥，低音譜像沈穩大熊，中音譜照亮中央C，中央C是握手的地方喔！」</p>
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-lg">
        {[
          { id: 'overview', label: '🌟 大譜表與中央 C', icon: '🌌' },
          { id: 'beats', label: '⏱️ 拍子與音符時值', icon: '🥁' },
          { id: 'treble', label: '🎼 高音五線譜 (右手)', icon: '🌸' },
          { id: 'bass', label: '🎵 低音五線譜 (左手)', icon: '🐻' },
          { id: 'alto', label: '🎻 中音五線譜 (C譜號)', icon: '🎻' },
          { id: 'quiz', label: '🎮 樂理闖關五線譜測驗', icon: '🏆' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TheorySubTab)}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* Tab 1: Grand Staff & Overview (大譜表與中央 C 宇宙) */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌌</span>
              <div>
                <h2 className="text-lg md:text-xl font-black text-white">
                  大譜表 (The Grand Staff)：雙手合奏的五線譜宇宙
                </h2>
                <p className="text-xs md:text-sm text-slate-300 font-medium">
                  鋼琴音樂同時使用「高音譜表」與「低音譜表」，左側垂直的中括弧（Brace）將兩組五線譜鎖定在一起。中央 C4 就像這座銀河正中央的太空站！
                </p>
              </div>
            </div>

            {/* Visual SVG Five-Line Grand Staff */}
            <TheoryStaffInteractive
              clef="grand"
              onSelectNote={(note) => setSelectedStaffNote(note)}
            />

            {/* Note Details Display */}
            {selectedStaffNote && (
              <div className="bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-900/80 border-2 border-amber-400 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => pianoSynth.playPianoNote(selectedStaffNote.midiNote, 0.9, 0.8)}
                    className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg transition active:scale-95 shrink-0"
                    title="再聽一次音高"
                  >
                    ▶
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">
                        音名：{selectedStaffNote.noteName} ({selectedStaffNote.solfege})
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {selectedStaffNote.positionLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5">
                      點擊的音符已在上方大譜表發聲！右手彈高音區，左手彈低音區。
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-amber-300 font-mono font-bold bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-700">
                  MIDI 音高編號: {selectedStaffNote.midiNote}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Tab 2: Beats & Note Values (拍子與時值、四分之一拍與二分之一拍) */}
      {/* ============================================================== */}
      {activeTab === 'beats' && (
        <div className="flex flex-col gap-6 text-left">
          {/* Note Values Family Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">𝅘𝅥</span>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white">
                    音符時值家族 (Note Values & Durations)
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    音符就像不同大小的容器，決定了聲音持續多久的時間！
                  </p>
                </div>
              </div>
              <div className="text-xs bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold px-3 py-1 rounded-full">
                以 4/4 拍為例
              </div>
            </div>

            {/* Note Types Grid (Including 1/2 beat & 1/4 beat explicitly explained) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Whole Note */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400/60 transition shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl text-amber-300 font-serif">𝅝</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      4 拍
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">全音符 (Whole Note)</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    長相特徵：<strong>空心符頭，沒有符幹</strong>。<br />
                    口訣：「一、二、三、四」，像一顆圓滾滾的大麵包，吃四口才吃完！
                  </p>
                </div>
                <button
                  onClick={() => pianoSynth.playPianoNote(60, 0.9, 2.5)}
                  className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-300 rounded-xl border border-slate-700 transition"
                >
                  聽長度 (4 拍) 🔊
                </button>
              </div>

              {/* Half Note */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400/60 transition shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl text-blue-300 font-serif">𝅗𝅥</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/40">
                      2 拍
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">二分音符 (Half Note)</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    長相特徵：<strong>空心符頭，長出一條符幹</strong>。<br />
                    口訣：「一、二」，正好是全音符切一半的長度！
                  </p>
                </div>
                <button
                  onClick={() => pianoSynth.playPianoNote(64, 0.9, 1.4)}
                  className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-blue-300 rounded-xl border border-slate-700 transition"
                >
                  聽長度 (2 拍) 🔊
                </button>
              </div>

              {/* Quarter Note */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400/60 transition shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl text-emerald-300 font-serif">𝅘𝅥</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      1 拍
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">四分音符 (Quarter Note)</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    長相特徵：<strong>實心黑符頭，有符幹</strong>。<br />
                    口訣：「嗒！」，像心跳或走路的每一步，最標準的一拍！
                  </p>
                </div>
                <button
                  onClick={() => pianoSynth.playPianoNote(67, 0.9, 0.7)}
                  className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-300 rounded-xl border border-slate-700 transition"
                >
                  聽長度 (1 拍) 🔊
                </button>
              </div>

              {/* Eighth Note (1/2 beat) */}
              <div className="bg-slate-950/80 border-2 border-pink-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl text-pink-400 font-serif">𝅘𝅥𝅮</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-400/40">
                      ½ 拍 (二分之一拍)
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    <span>八分音符</span>
                    <span className="text-xs font-bold text-pink-400">(單符尾)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    長相特徵：<strong>實心黑符頭 + 符幹 + 單條小尾巴（單符尾）</strong>！<br />
                    口訣：「提、提」，速度比四分音符快一倍，<strong>兩個八分音符 = 1 個四分音符</strong>！
                  </p>
                </div>
                <button
                  onClick={() => {
                    pianoSynth.playPianoNote(60, 0.9, 0.35);
                    setTimeout(() => pianoSynth.playPianoNote(62, 0.9, 0.35), 350);
                  }}
                  className="mt-3 w-full py-1.5 bg-pink-950/60 hover:bg-pink-900/80 text-xs font-black text-pink-200 rounded-xl border border-pink-500/50 transition"
                >
                  聽兩個八分音符 (各 ½ 拍) 🔊
                </button>
              </div>

              {/* Sixteenth Note (1/4 beat) */}
              <div className="bg-slate-950/80 border-2 border-teal-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl text-teal-400 font-serif">𝅘𝅥𝅯</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-400/40">
                      ¼ 拍 (四分之一拍)
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    <span>十六分音符</span>
                    <span className="text-xs font-bold text-teal-400">(雙符尾)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    長相特徵：<strong>實心黑符頭 + 符幹 + 兩條平行尾巴（雙符尾）</strong>！<br />
                    口訣：「嘀哩哩哩」，像小鳥急速拍翅膀，<strong>四個十六分音符 = 1 個四分音符</strong>！
                  </p>
                </div>
                <button
                  onClick={() => {
                    [0, 180, 360, 540].forEach((delay, idx) => {
                      setTimeout(() => pianoSynth.playPianoNote(60 + idx * 2, 0.9, 0.2), delay);
                    });
                  }}
                  className="mt-3 w-full py-1.5 bg-teal-950/60 hover:bg-teal-900/80 text-xs font-black text-teal-200 rounded-xl border border-teal-500/50 transition"
                >
                  聽四個十六分音符 (各 ¼ 拍) 🔊
                </button>
              </div>

              {/* Dotted Notes */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-400/60 transition shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl text-purple-300 font-serif">𝅗𝅥.</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-400/40">
                      附點 +50%
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">附點家族 (Dotted Notes)</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    附點是什麼？<strong>附點增加前面音符時值的一半！</strong><br />
                    • 附點二分音符 = 2拍 + 1拍 = <strong>3 拍</strong><br />
                    • 附點四分音符 = 1拍 + 半拍 = <strong>1.5 拍</strong>
                  </p>
                </div>
                <button
                  onClick={() => pianoSynth.playPianoNote(67, 0.9, 1.9)}
                  className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-purple-300 rounded-xl border border-slate-700 transition"
                >
                  聽附點二分音符 (3 拍) 🔊
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Rhythm Metronome & Beat Box */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center">
                  ⏱️
                </span>
                <div>
                  <h3 className="text-base md:text-lg font-black text-white">
                    節拍機打拍小試煉 (Rhythm Beat Trainer)
                  </h3>
                  <p className="text-xs text-amber-200">
                    選好拍號，啟動節拍機，跟著小狐狸一起拍手感受拍點！
                  </p>
                </div>
              </div>

              {/* Time signature pills */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {([4, 3, 2] as const).map((ts) => (
                  <button
                    key={ts}
                    onClick={() => {
                      setTimeSignatureMode(ts);
                      setActiveBeat(0);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      timeSignatureMode === ts
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ts}/4 拍
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Beat Balls */}
            <div className="flex items-center justify-center gap-4 py-4">
              {Array.from({ length: timeSignatureMode }).map((_, idx) => {
                const isActive = activeBeat === idx && isPlayingBeat;
                const isStrong = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-150 transform ${
                      isActive
                        ? isStrong
                          ? 'bg-amber-400 border-white text-slate-950 scale-115 shadow-2xl drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                          : 'bg-blue-500 border-white text-white scale-110 shadow-xl'
                        : isStrong
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-xl md:text-2xl font-black">
                      第 {idx + 1} 拍
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {isStrong ? '強拍 (咚!)' : idx === 2 && timeSignatureMode === 4 ? '次強拍' : '弱拍 (嗒)'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Metronome Control Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold">速度 (BPM): {bpm}</span>
                <input
                  type="range"
                  min="50"
                  max="140"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="accent-amber-400 w-32 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingBeat(!isPlayingBeat)}
                  className={`px-5 py-2 rounded-xl text-xs md:text-sm font-black transition-all shadow-lg flex items-center gap-2 ${
                    isPlayingBeat
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <span>{isPlayingBeat ? '⏹ 停止打拍' : '▶ 啟動節拍機'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Tab 3: Treble Clef in Depth (高音譜表深度解說 + 輔助五線譜) */}
      {/* ============================================================== */}
      {activeTab === 'treble' && (
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl text-indigo-400 font-serif">𝄞</span>
              <div>
                <h2 className="text-lg md:text-xl font-black text-white">
                  高音五線譜 (Treble Staff / G 譜號)
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  由五條平行橫線和四個間構成，由下往上數：第1線、第2線...第5線！
                </p>
              </div>
            </div>

            {/* Interactive SVG Five-Line Treble Staff */}
            <TheoryStaffInteractive
              clef="treble"
              highlightLine={trebleHighlightLine}
              highlightSpace={trebleHighlightSpace}
              selectedMidi={selectedTrebleMidi}
              onSelectNote={(note) => {
                setSelectedTrebleMidi(note.midiNote);
                if (note.lineOrSpace === 'line') {
                  setTrebleHighlightLine(note.indexNum);
                  setTrebleHighlightSpace(undefined);
                } else {
                  setTrebleHighlightSpace(note.indexNum);
                  setTrebleHighlightLine(undefined);
                }
              }}
            />

            {/* Treble Formula Mnemonic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lines Mnemonic */}
              <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-indigo-300">
                    🎵 五條線上的音 (Lines: E - G - B - D - F)
                  </span>
                  <span className="text-[10px] bg-indigo-900/70 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    點擊高亮五線譜
                  </span>
                </div>
                <div className="flex items-center justify-between text-center gap-1.5">
                  {[
                    { lineNum: 1, label: '第 1 線', note: 'E4', sol: 'Mi', midi: 64 },
                    { lineNum: 2, label: '第 2 線', note: 'G4', sol: 'Sol', midi: 67 },
                    { lineNum: 3, label: '第 3 線', note: 'B4', sol: 'Ti', midi: 71 },
                    { lineNum: 4, label: '第 4 線', note: 'D5', sol: 'Re', midi: 74 },
                    { lineNum: 5, label: '第 5 線', note: 'F5', sol: 'Fa', midi: 77 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setTrebleHighlightLine(item.lineNum);
                        setTrebleHighlightSpace(undefined);
                        setSelectedTrebleMidi(item.midi);
                        pianoSynth.playPianoNote(item.midi, 0.9, 0.7);
                      }}
                      className={`flex-1 p-2.5 rounded-xl transition flex flex-col items-center border ${
                        trebleHighlightLine === item.lineNum
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                          : 'bg-slate-900 hover:bg-indigo-900/60 border-slate-700 hover:border-indigo-400 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                      <span className="text-base font-black text-white mt-0.5">{item.note}</span>
                      <span className="text-xs text-amber-300 font-bold">{item.sol}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  💡 記憶口訣：<strong>Every Good Boy Does Fine</strong> (每個好男孩都表現好) 或「米-索-西-來-發」！第 2 線是 G 譜號起筆中心！
                </p>
              </div>

              {/* Spaces Mnemonic */}
              <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-indigo-300">
                    🎶 四個間裡的音 (Spaces: F - A - C - E)
                  </span>
                  <span className="text-[10px] bg-indigo-900/70 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    點擊高亮五線譜
                  </span>
                </div>
                <div className="flex items-center justify-between text-center gap-1.5">
                  {[
                    { spaceNum: 1, label: '第 1 間', note: 'F4', sol: 'Fa', midi: 65 },
                    { spaceNum: 2, label: '第 2 間', note: 'A4', sol: 'La', midi: 69 },
                    { spaceNum: 3, label: '第 3 間', note: 'C5', sol: 'Do', midi: 72 },
                    { spaceNum: 4, label: '第 4 間', note: 'E5', sol: 'Mi', midi: 76 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setTrebleHighlightSpace(item.spaceNum);
                        setTrebleHighlightLine(undefined);
                        setSelectedTrebleMidi(item.midi);
                        pianoSynth.playPianoNote(item.midi, 0.9, 0.7);
                      }}
                      className={`flex-1 p-2.5 rounded-xl transition flex flex-col items-center border ${
                        trebleHighlightSpace === item.spaceNum
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-md scale-105'
                          : 'bg-slate-900 hover:bg-indigo-900/60 border-slate-700 hover:border-indigo-400 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                      <span className="text-base font-black text-white mt-0.5">{item.note}</span>
                      <span className="text-xs text-amber-300 font-bold">{item.sol}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  💡 記憶口訣：四個間正好拼成英文字 <strong>F-A-C-E (臉龐 Face)</strong>，由下往上一目了然！
                </p>
              </div>
            </div>

            {/* Origin Story */}
            <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-2xl p-4 text-xs text-indigo-100 flex items-start gap-3">
              <span className="text-2xl shrink-0">📖</span>
              <div>
                <strong className="text-white">高音譜號（G譜號）的小故事：</strong>
                高音譜號長得像華麗的花體字母「G」。數百年前的音樂家寫譜時，隨手畫個花體 G 圍繞在第二線，標示「這裡是 G 音！」，久而久之就演變成了今天大家看到的漂亮高音譜號！
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Tab 4: Bass Clef in Depth (低音譜表深度解說 + 輔助五線譜) */}
      {/* ============================================================== */}
      {activeTab === 'bass' && (
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl text-purple-400 font-serif">𝄢</span>
              <div>
                <h2 className="text-lg md:text-xl font-black text-white">
                  低音五線譜 (Bass Staff / F 譜號)
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  左手最親密的好夥伴！穩重大器，是鋼琴和聲與低音聲部的大地根基。
                </p>
              </div>
            </div>

            {/* Interactive SVG Five-Line Bass Staff */}
            <TheoryStaffInteractive
              clef="bass"
              highlightLine={bassHighlightLine}
              highlightSpace={bassHighlightSpace}
              selectedMidi={selectedBassMidi}
              onSelectNote={(note) => {
                setSelectedBassMidi(note.midiNote);
                if (note.lineOrSpace === 'line') {
                  setBassHighlightLine(note.indexNum);
                  setBassHighlightSpace(undefined);
                } else {
                  setBassHighlightSpace(note.indexNum);
                  setBassHighlightLine(undefined);
                }
              }}
            />

            {/* Bass Formula Mnemonic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lines Mnemonic */}
              <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-purple-300">
                    🎵 五條線上的音 (Lines: G - B - D - F - A)
                  </span>
                  <span className="text-[10px] bg-purple-900/70 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                    點擊高亮五線譜
                  </span>
                </div>
                <div className="flex items-center justify-between text-center gap-1.5">
                  {[
                    { lineNum: 1, label: '第 1 線', note: 'G2', sol: 'Sol', midi: 43 },
                    { lineNum: 2, label: '第 2 線', note: 'B2', sol: 'Ti', midi: 47 },
                    { lineNum: 3, label: '第 3 線', note: 'D3', sol: 'Re', midi: 50 },
                    { lineNum: 4, label: '第 4 線', note: 'F3', sol: 'Fa', midi: 53 },
                    { lineNum: 5, label: '第 5 線', note: 'A3', sol: 'La', midi: 57 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setBassHighlightLine(item.lineNum);
                        setBassHighlightSpace(undefined);
                        setSelectedBassMidi(item.midi);
                        pianoSynth.playPianoNote(item.midi, 0.9, 0.7);
                      }}
                      className={`flex-1 p-2.5 rounded-xl transition flex flex-col items-center border ${
                        bassHighlightLine === item.lineNum
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                          : 'bg-slate-900 hover:bg-purple-900/60 border-slate-700 hover:border-purple-400 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                      <span className="text-base font-black text-white mt-0.5">{item.note}</span>
                      <span className="text-xs text-amber-300 font-bold">{item.sol}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  💡 記憶口訣：<strong>Good Boys Do Fine Always</strong> (好男孩永遠都很棒)！第四線被兩點夾住，就是 Fa (F3)！
                </p>
              </div>

              {/* Spaces Mnemonic */}
              <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-purple-300">
                    🎶 四個間裡的音 (Spaces: A - C - E - G)
                  </span>
                  <span className="text-[10px] bg-purple-900/70 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                    點擊高亮五線譜
                  </span>
                </div>
                <div className="flex items-center justify-between text-center gap-1.5">
                  {[
                    { spaceNum: 1, label: '第 1 間', note: 'A2', sol: 'La', midi: 45 },
                    { spaceNum: 2, label: '第 2 間', note: 'C3', sol: 'Do', midi: 48 },
                    { spaceNum: 3, label: '第 3 間', note: 'E3', sol: 'Mi', midi: 52 },
                    { spaceNum: 4, label: '第 4 間', note: 'G3', sol: 'Sol', midi: 55 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setBassHighlightSpace(item.spaceNum);
                        setBassHighlightLine(undefined);
                        setSelectedBassMidi(item.midi);
                        pianoSynth.playPianoNote(item.midi, 0.9, 0.7);
                      }}
                      className={`flex-1 p-2.5 rounded-xl transition flex flex-col items-center border ${
                        bassHighlightSpace === item.spaceNum
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md scale-105'
                          : 'bg-slate-900 hover:bg-purple-900/60 border-slate-700 hover:border-purple-400 text-white'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold">{item.label}</span>
                      <span className="text-base font-black text-white mt-0.5">{item.note}</span>
                      <span className="text-xs text-amber-300 font-bold">{item.sol}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  💡 記憶口訣：<strong>All Cows Eat Grass</strong> (所有的乳牛都吃草)！
                </p>
              </div>
            </div>

            {/* Origin Story */}
            <div className="bg-purple-950/50 border border-purple-500/30 rounded-2xl p-4 text-xs text-purple-100 flex items-start gap-3">
              <span className="text-2xl shrink-0">📖</span>
              <div>
                <strong className="text-white">低音譜號（F譜號）的小故事：</strong>
                低音譜號由古體字母「F」演變而來。譜號的大弧線起筆在第四線，後方上下各有一顆小圓點，正好把第四線夾在中間，宣示這條線就是 F (Fa) 音！
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Tab 5: Alto Clef in Depth (中音譜表深度解說 + 輔助五線譜) */}
      {/* ============================================================== */}
      {activeTab === 'alto' && (
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl text-amber-400 font-serif">𝄡</span>
              <div>
                <h2 className="text-lg md:text-xl font-black text-white">
                  中音五線譜 (Alto Staff / C 譜號)
                </h2>
                <p className="text-xs text-slate-300 font-medium">
                  音樂世界中非常神奇的「可移動 C 譜號」！凹口對準哪一條線，那一條線就是中央 C (C4)！
                </p>
              </div>
            </div>

            {/* Interactive SVG Five-Line Alto Staff */}
            <TheoryStaffInteractive
              clef="alto"
              highlightLine={altoHighlightLine}
              selectedMidi={selectedAltoMidi}
              onSelectNote={(note) => {
                setSelectedAltoMidi(note.midiNote);
                if (note.lineOrSpace === 'line') {
                  setAltoHighlightLine(note.indexNum);
                }
              }}
            />

            {/* Alto Clef Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 flex flex-col gap-3">
                <span className="text-sm font-black text-amber-300">
                  🎯 為什麼叫 C 譜號？核心解密
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  C 譜號的符號形狀像兩個對稱的「C」字背靠背，中間有一個<strong>凹進去的箭頭缺口</strong>。<br />
                  這個缺口正正好好夾在五線譜的<strong>「第 3 線」</strong>上！因此在中音譜表中：<br />
                  <strong className="text-amber-300 text-sm block mt-1">第 3 線 = 中央 C (C4 / Do)！</strong>
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-amber-200">
                  由中央 C 向上或向下推理：第 3 線是 Do，第 3 間是 Re，第 4 線是 Mi，第 4 間是 Fa，第 5 線是 Sol！
                </div>
              </div>

              <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 flex flex-col gap-3">
                <span className="text-sm font-black text-amber-300">
                  🎻 哪些樂器使用中音譜表？
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  管弦樂團中的<strong>中提琴（Viola）</strong>是最著名的代表！中提琴的音域恰好介於小提琴（高音）與大提琴（低音）之間。<br />
                  如果用高音譜寫，會有很多下加線；如果用低音譜寫，會有許多上加線。因此使用中音譜表，常用音符正好舒適地落在五條線正中央！
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 font-bold text-xs border border-amber-400/40">
                    🎻 中提琴專屬
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 font-bold text-xs border border-amber-400/40">
                    🎺 英國管 / 長號中音區
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Tab 6: Interactive Quiz & Mini Challenge with Visual Staff */}
      {/* ============================================================== */}
      {activeTab === 'quiz' && (
        <div className="flex flex-col gap-6 text-left">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
            {/* Quiz Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-white">
                    樂理五線譜小大師通關挑戰 (Visual Staff Quiz)
                  </h2>
                  <p className="text-xs text-slate-300">
                    每道題目均配有<strong>輔助五線譜視覺圖解</strong>，讓小朋友看得清清楚楚、輕鬆判斷！
                  </p>
                </div>
              </div>

              {/* Score & Streak */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-400/40 px-3 py-1 rounded-xl text-amber-300 font-black text-xs">
                  <span>⭐ 總得分:</span>
                  <span>{quizScore} 題</span>
                </div>
                {quizStreak > 1 && (
                  <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-400/40 px-3 py-1 rounded-xl text-rose-300 font-black text-xs animate-pulse">
                    <span>🔥 連對 {quizStreak} 題!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Card */}
            <div className="bg-slate-950 border-2 border-indigo-500/40 rounded-3xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                <span>題目 {currentQuizIndex + 1} / {quizQuestions.length}</span>
                {currentQuiz.midiHint && (
                  <button
                    onClick={() => pianoSynth.playPianoNote(currentQuiz.midiHint, 0.9, 0.8)}
                    className="flex items-center gap-1 text-amber-300 hover:text-white bg-slate-900 px-3 py-1 rounded-full border border-slate-700 transition"
                  >
                    <span>🔊 聽聽題目提示琴音</span>
                  </button>
                )}
              </div>

              {/* Auxiliary Visual Five-Line Staff for Quiz Question */}
              <div className="flex flex-col gap-2 bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-3">
                <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                  <span>👀</span>
                  <span>{currentQuiz.auxStaff.caption}</span>
                </span>
                <TheoryStaffInteractive
                  clef={currentQuiz.auxStaff.clef}
                  highlightLine={currentQuiz.auxStaff.highlightLine}
                  highlightSpace={currentQuiz.auxStaff.highlightSpace}
                  highlightMidi={currentQuiz.auxStaff.highlightMidi}
                  notes={currentQuiz.auxStaff.sampleNotes}
                  compact={true}
                  interactive={true}
                />
              </div>

              <h3 className="text-lg md:text-xl font-black text-white leading-relaxed">
                {currentQuiz.question}
              </h3>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuiz.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrectAnswer = idx === currentQuiz.correctIdx;

                  let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-blue-400 hover:bg-slate-800/80';
                  if (selectedAnswer !== null) {
                    if (isCorrectAnswer) {
                      btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg scale-[1.02]';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-600 border-rose-400 text-white font-black';
                    } else {
                      btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswerQuiz(idx)}
                      className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {selectedAnswer !== null && isCorrectAnswer && (
                        <span className="text-xl">✅</span>
                      )}
                      {selectedAnswer !== null && isSelected && !isCorrectAnswer && (
                        <span className="text-xl">❌</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {selectedAnswer !== null && (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 animate-fade-in ${
                  isAnswerCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    <span>{isAnswerCorrect ? '🎉 答對了！太厲害了！' : '💡 再接再厲！看五線譜小解說：'}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {currentQuiz.explanation}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuiz}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg transition"
                    >
                      下一題 ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Corner Fox Mentor */}
      <FoxPracticeCorner
        currentNoteIndex={quizScore}
        totalNotes={quizQuestions.length}
        comboStreak={quizStreak}
        consecutiveErrors={isAnswerCorrect === false ? 1 : 0}
        isNoteCorrect={isAnswerCorrect === true}
        isNoteWobbly={false}
        accuracyPercent={quizQuestions.length > 0 ? Math.round((quizScore / Math.max(1, currentQuizIndex + 1)) * 100) : 100}
        customMessage={
          activeTab === 'treble'
            ? '高音譜的第二線就是 G (Sol)！看著五線譜點點看各個音符吧！'
            : activeTab === 'bass'
            ? '低音譜兩點夾著第四線 Fa！低沉溫厚是左手的好夥伴！'
            : activeTab === 'alto'
            ? '中音譜是 C 譜號，中心凹口直直對準第三線中央 C！'
            : activeTab === 'overview'
            ? '中央 C4 就像大譜表的彩虹橋，右手彈高音、左手彈低音！'
            : undefined
        }
      />
    </div>
  );
};
