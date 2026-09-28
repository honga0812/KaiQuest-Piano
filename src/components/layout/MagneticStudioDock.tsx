import React, { useState } from 'react';
import { HintToggles, CharacterFriend } from '../../types/piano';
import { EliLionSvg, KabutoBeetleSvg, PicoDolphinSvg, RexDinoSvg } from '../mascot/AnimalFriends';

interface MagneticStudioDockProps {
  // Companion Mentor
  activeMentor: CharacterFriend;
  onSelectMentor: (mentor: CharacterFriend) => void;
  accuracyRate: number;
  comboStreak: number;
  totalNotes: number;
  currentNoteIndex: number;

  // Hint Toggles
  hints: HintToggles;
  onToggleHint: (key: keyof HintToggles) => void;

  // Practice & Audio Controls
  bpm: number;
  onChangeBpm: (bpm: number) => void;
  isMetronomeActive: boolean;
  onToggleMetronome: () => void;
  onPlayDemo: () => void;
  isPlayingDemo: boolean;
  onOpenScaleModal: () => void;

  // Pitch & Input monitor summary
  detectedNoteName: string;
  centsOff: number;
  rmsLevel: number;
  isMicRunning: boolean;
  onActivateMic?: () => void;
  inputMode: string;
}

export const MagneticStudioDock: React.FC<MagneticStudioDockProps> = ({
  activeMentor,
  onSelectMentor,
  accuracyRate,
  comboStreak,
  totalNotes,
  currentNoteIndex,
  hints,
  onToggleHint,
  bpm,
  onChangeBpm,
  isMetronomeActive,
  onToggleMetronome,
  onPlayDemo,
  isPlayingDemo,
  onOpenScaleModal,
  detectedNoteName,
  centsOff,
  rmsLevel,
  isMicRunning,
  onActivateMic,
  inputMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'mentor' | 'hints' | 'audio'>('mentor');

  // Mentor metadata
  const mentorConfigs: Record<
    CharacterFriend,
    { name: string; title: string; skill: string; color: string; badgeBg: string }
  > = {
    kai: {
      name: 'Kai',
      title: '首席探險家',
      skill: '全面音樂探索',
      color: 'from-amber-400 to-orange-400',
      badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
    },
    eli_lion: {
      name: '獅子 Eli',
      title: '節奏鼓王導師',
      skill: '穩健律動與落鍵',
      color: 'from-amber-400 to-orange-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    kabuto_beetle: {
      name: '甲蟲 Kabuto',
      title: '指力勇士導師',
      skill: '獨立指法與力量',
      color: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    pico_dolphin: {
      name: '海豚 Pico',
      title: '音浪流暢導師',
      skill: '連音圓滑與呼吸',
      color: 'from-sky-400 to-blue-500',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    rex_dino: {
      name: '恐龍 Rex',
      title: '勇氣探索導師',
      skill: '寬廣音域與跨度',
      color: 'from-emerald-400 to-teal-500',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  };

  const currentMentorInfo = mentorConfigs[activeMentor] || mentorConfigs.eli_lion;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. Magnetic Floating Dock Island Trigger (磁吸浮動膠囊按鈕)                   */}
      {/* Always follows scroll on right edge, minimalistic & touch-friendly         */}
      {/* ========================================================================= */}
      <div className="fixed top-20 right-3 z-40 flex items-center gap-2 select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full border-2 shadow-xl backdrop-blur-md transition-all active:scale-95 group ${
            isOpen
              ? 'bg-amber-400 border-white text-slate-950 ring-4 ring-amber-400/40'
              : 'bg-white/90 hover:bg-white border-amber-300 text-slate-800'
          }`}
          title="開啟/收起磁吸式隨行輔助工具島"
        >
          {/* Mini Avatar of Current Mentor */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            {activeMentor === 'eli_lion' && <EliLionSvg size={32} />}
            {activeMentor === 'kabuto_beetle' && <KabutoBeetleSvg size={30} />}
            {activeMentor === 'pico_dolphin' && <PicoDolphinSvg size={30} />}
            {activeMentor === 'rex_dino' && <RexDinoSvg size={30} />}
            {activeMentor === 'kai' && <EliLionSvg size={32} />}
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-xs font-black leading-tight flex items-center gap-1 text-slate-900">
              <span>{currentMentorInfo.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                {accuracyRate}%
              </span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold">
              {isOpen ? '點擊收起選單' : '🎛️ 隨行導師 & 工具'}
            </span>
          </div>

          <span className="text-xs text-amber-700 transition-transform group-hover:scale-110">
            {isOpen ? '✕' : '⚙️'}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. Slide-out Magnetic Drawer Studio Panel (展開式資訊抽屜)                    */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end select-none animate-fade-in">
          {/* Click outside backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Body - Positioned on right */}
          <div className="relative w-full max-w-sm sm:max-w-md h-full bg-white/95 backdrop-blur-xl border-l-3 border-amber-300 shadow-2xl p-5 flex flex-col gap-4 overflow-y-auto scrollbar-thin animate-slide-left z-10 text-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b-2 border-amber-150 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center text-xl shadow-md">
                  🎛️
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">隨行輔助與導師島</h3>
                  <span className="text-xs text-amber-800 font-bold">
                    保持主畫面乾淨專注，隨時切換輔助！
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-lg font-black transition active:scale-95"
                title="收起選單"
              >
                ✕
              </button>
            </div>

            {/* Sub-tab Pill Switch */}
            <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-2xl border border-amber-200 text-xs font-black">
              <button
                onClick={() => setActiveTab('mentor')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition ${
                  activeTab === 'mentor'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🐾 隨行導師
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition ${
                  activeTab === 'hints'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👀 譜面標示
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition ${
                  activeTab === 'audio'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⏱️ 節拍與調音
              </button>
            </div>

            {/* Tab 1: Accompanying Mentor Selection & Accuracy Feedback */}
            {activeTab === 'mentor' && (
              <div className="flex flex-col gap-3 text-xs">
                {/* Current Active Mentor Live Status Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                    {activeMentor === 'eli_lion' && <EliLionSvg size={60} />}
                    {activeMentor === 'kabuto_beetle' && <KabutoBeetleSvg size={54} />}
                    {activeMentor === 'pico_dolphin' && <PicoDolphinSvg size={54} />}
                    {activeMentor === 'rex_dino' && <RexDinoSvg size={54} />}
                    {activeMentor === 'kai' && <EliLionSvg size={60} />}
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900">{currentMentorInfo.name}</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        {currentMentorInfo.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">
                      專長：{currentMentorInfo.skill}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        即時正確率: {accuracyRate}%
                      </span>
                      {comboStreak > 1 && (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md animate-pulse">
                          🔥{comboStreak} 連擊中
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-slate-500 font-bold px-1">點擊切換陪練的動物夥伴：</span>

                {/* 4 Animal Friends Selection Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 1. Eli Lion */}
                  <button
                    onClick={() => onSelectMentor('eli_lion')}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition active:scale-95 ${
                      activeMentor === 'eli_lion'
                        ? 'bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <EliLionSvg size={38} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-xs">🦁 獅子 Eli</span>
                      <span className="text-[10px] text-amber-800 font-bold">節奏鼓王</span>
                    </div>
                  </button>

                  {/* 2. Kabuto Beetle */}
                  <button
                    onClick={() => onSelectMentor('kabuto_beetle')}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition active:scale-95 ${
                      activeMentor === 'kabuto_beetle'
                        ? 'bg-blue-100 border-blue-400 shadow-md ring-2 ring-blue-400/40'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <KabutoBeetleSvg size={34} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-xs">🪲 甲蟲 Kabuto</span>
                      <span className="text-[10px] text-blue-800 font-bold">指力小勇士</span>
                    </div>
                  </button>

                  {/* 3. Pico Dolphin */}
                  <button
                    onClick={() => onSelectMentor('pico_dolphin')}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition active:scale-95 ${
                      activeMentor === 'pico_dolphin'
                        ? 'bg-sky-100 border-sky-400 shadow-md ring-2 ring-sky-400/40'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                      <PicoDolphinSvg size={34} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-xs">🐬 海豚 Pico</span>
                      <span className="text-[10px] text-sky-800 font-bold">音浪流暢</span>
                    </div>
                  </button>

                  {/* 4. Rex Dino */}
                  <button
                    onClick={() => onSelectMentor('rex_dino')}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition active:scale-95 ${
                      activeMentor === 'rex_dino'
                        ? 'bg-emerald-100 border-emerald-400 shadow-md ring-2 ring-emerald-400/40'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <RexDinoSvg size={34} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-xs">🦖 恐龍 Rex</span>
                      <span className="text-[10px] text-emerald-800 font-bold">勇敢探索</span>
                    </div>
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  💡 <strong>隨行導師小秘密：</strong>
                  當你在五線譜上彈對音符時，隨行導師會透過節拍發光指標即時噴發音波共鳴，連擊越多，導師的歡呼光環越耀眼！
                </div>
              </div>
            )}

            {/* Tab 2: Notation Hints & Views Toggle */}
            {activeTab === 'hints' && (
              <div className="flex flex-col gap-3 text-xs">
                <span className="text-slate-500 font-bold px-1">點擊開關輔助標示，為琴童漸進脫離提示：</span>

                <div className="flex flex-col gap-2">
                  {/* Staff Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-sm">🎼 五線譜 (Staff)</span>
                      <span className="text-[11px] text-slate-500">標準音符高低與動態節拍發光指標</span>
                    </div>
                    <button
                      onClick={() => onToggleHint('staff')}
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        hints.staff ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                          hints.staff ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Numbered Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-sm">🔢 簡譜數字 (123)</span>
                      <span className="text-[11px] text-slate-500">Do Re Mi 數字標示</span>
                    </div>
                    <button
                      onClick={() => onToggleHint('numbered')}
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        hints.numbered ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                          hints.numbered ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Letter Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-sm">🔤 字母音名 (C D E)</span>
                      <span className="text-[11px] text-slate-500">英文字母音名標記</span>
                    </div>
                    <button
                      onClick={() => onToggleHint('letter')}
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        hints.letter ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                          hints.letter ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Keyboard Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-sm">🎹 動態琴鍵 (Keyboard)</span>
                      <span className="text-[11px] text-slate-500">螢幕觸控鍵盤與指法標示</span>
                    </div>
                    <button
                      onClick={() => onToggleHint('keyboard')}
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        hints.keyboard ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                          hints.keyboard ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Audio, Tempo & Pitch Tuner */}
            {activeTab === 'audio' && (
              <div className="flex flex-col gap-3 text-xs">
                {/* Tempo BPM Adjuster */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm">⏱️ 演奏速度 (Tempo)</span>
                    <span className="font-mono text-base font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                      {bpm} BPM
                    </span>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="140"
                    step="2"
                    value={bpm}
                    onChange={(e) => onChangeBpm(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => onChangeBpm(Math.max(50, bpm - 4))}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-100"
                    >
                      -4 慢速
                    </button>
                    <button
                      onClick={onToggleMetronome}
                      className={`px-3 py-1 rounded-lg font-black border transition ${
                        isMetronomeActive
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      {isMetronomeActive ? '節拍器已啟動' : '開啟節拍器'}
                    </button>
                    <button
                      onClick={() => onChangeBpm(Math.min(140, bpm + 4))}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-100"
                    >
                      +4 加速
                    </button>
                  </div>
                </div>

                {/* Demonstration Play Button */}
                <button
                  onClick={onPlayDemo}
                  disabled={isPlayingDemo}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black rounded-2xl shadow-sm transition active:scale-95 disabled:opacity-50 text-sm"
                >
                  <span>▶</span>
                  <span>{isPlayingDemo ? '正在示範彈奏中...' : '播放整曲示範音'}</span>
                </button>

                {/* Real-time Pitch & Tuner Mini Strip */}
                <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-400">即時聽琴音準感測</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {detectedNoteName ? `偵測到: ${detectedNoteName}` : '等待琴聲...'}
                    </span>
                  </div>

                  {/* Volume Level bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">音量</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-75"
                        style={{ width: `${Math.min(100, rmsLevel * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Scale test modal button */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenScaleModal();
                    }}
                    className="w-full mt-1 py-2 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/50 rounded-xl text-center text-purple-200 font-bold transition text-xs"
                  >
                    🎵 開啟進階音階辨識測試視窗 ➔
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Quick Dismiss */}
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                KaiQuest 磁吸式極簡設計
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition"
              >
                完成設定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
