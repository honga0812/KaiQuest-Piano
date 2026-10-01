import React, { useState, useEffect, useRef } from 'react';
import { Lesson, UserProgress, AgeBand } from '../../types/piano';
import { EliLionSvg, PicoDolphinSvg, KabutoBeetleSvg, RexDinoSvg } from '../mascot/AnimalFriends';
import { KaiSprite, KaiSpriteState } from '../mascot/KaiSprite';
import { pianoSynth } from '../../audio/pianoSynthesizer';
import { ISLAND_MAP_THEMES, StationThematicCoord } from './islandMapThemes';
import { IslandThematicScenery } from './IslandThematicScenery';
import { speechGuide } from '../../utils/speechGuide';

interface CartoonIslandMapProps {
  lessons: Lesson[];
  currentAge: AgeBand;
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  className?: string;
}

export const CartoonIslandMap: React.FC<CartoonIslandMapProps> = ({
  lessons,
  currentAge,
  progress,
  onSelectLesson,
  className = '',
}) => {
  const [selectedStationLesson, setSelectedStationLesson] = useState<Lesson | null>(null);
  const [animalSpeech, setAnimalSpeech] = useState<{ animal: string; text: string } | null>(null);
  const [spriteState, setSpriteState] = useState<KaiSpriteState>('idle');
  const [isVoiceGuideEnabled, setIsVoiceGuideEnabled] = useState(true);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Get active theme configuration
  const currentTheme = ISLAND_MAP_THEMES[currentAge] || ISLAND_MAP_THEMES[4];

  // Map lessons into the 12 non-overlapping waypoints
  const stations = currentTheme.stations.map((coord, idx) => {
    const lesson = lessons[idx];
    const isUnlocked =
      idx === 0 ||
      (lesson &&
        (Boolean(progress.completedLessons[lesson.id]) ||
          Boolean(progress.completedLessons[`lesson-${idx}`])));
    const isCompleted = lesson ? Boolean(progress.completedLessons[lesson.id]?.stars) : false;
    const stars = lesson ? progress.completedLessons[lesson.id]?.stars || 0 : 0;

    return {
      ...coord,
      lessonNumber: idx + 1,
      lesson,
      isUnlocked,
      isCompleted,
      stars,
    };
  });

  // Active station where Kai is perching (current next playable lesson)
  const currentActiveIndex = stations.findIndex((st) => !st.isCompleted && st.isUnlocked);
  const activeIndex = currentActiveIndex !== -1 ? currentActiveIndex : stations.length - 1;
  const activeCoord = stations[activeIndex] || stations[0];

  const [kaiPosIndex, setKaiPosIndex] = useState(activeIndex);

  useEffect(() => {
    if (activeIndex !== kaiPosIndex) {
      setSpriteState('walking');
      const timer = setTimeout(() => {
        setKaiPosIndex(activeIndex);
        setSpriteState('celebrating');
        setTimeout(() => setSpriteState('idle'), 1600);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  // Clean anti-occlusion perch for Kai
  const currentStation = stations[kaiPosIndex] || stations[0];
  const perchX = currentStation.x + (currentStation.perchOffset?.x ?? 0);
  const perchY = currentStation.y + (currentStation.perchOffset?.y ?? -72);
  const perchFacing = currentStation.perchOffset?.facing ?? 'right';
  const perchBubbleDir = currentStation.perchOffset?.bubbleDir ?? 'top';

  // AI Speech Synthesis Guide - Speaks lesson practice focus & encouraging words
  const speakLessonGuide = (lesson: Lesson, stationName: string) => {
    if (!isVoiceGuideEnabled) return;
    const prompt = `第 ${lesson.lessonNumber} 課《${lesson.songName}》，歡迎來到${stationName}！這節課的練習重點是：${
      lesson.storyScene || '手型保持放鬆圓潤，跟著節奏穩健前行'
    }。探險家 Kai 為你加油，出發吧！`;
    setSpeakingText(prompt);
    speechGuide.speak(prompt, {
      emotion: 'friendly',
      onEnd: () => setSpeakingText(null),
      onError: () => setSpeakingText(null),
    });
  };

  const handleStationClick = (station: (typeof stations)[0]) => {
    if (!station.lesson) return;
    if (!station.isUnlocked) {
      pianoSynth.playGentlePrompt();
      return;
    }
    pianoSynth.playCorrectHitSound();
    setSelectedStationLesson(station.lesson);

    // Speak AI voice guide for this station
    speakLessonGuide(station.lesson, station.name);
  };

  const handleAnimalClick = (name: string, speech: string) => {
    pianoSynth.playCorrectHitSound();
    setAnimalSpeech({ animal: name, text: speech });

    // Speak mentor speech if enabled
    if (isVoiceGuideEnabled) {
      setSpeakingText(`${name}說：${speech}`);
      speechGuide.speak(`${name}說：${speech}`, {
        emotion: 'excited',
        onEnd: () => setSpeakingText(null),
        onError: () => setSpeakingText(null),
      });
    }

    setTimeout(() => {
      setAnimalSpeech((curr) => (curr?.animal === name ? null : curr));
    }, 4500);
  };

  // Build SVG path data connecting all stations cleanly and smoothly
  const pathD = stations.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = stations[idx - 1];
    // Straight line for same y or x, smooth bezier curve for transitions
    if (prev.y === curr.y) {
      return `${acc} L ${curr.x} ${curr.y}`;
    }
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    return `${acc} Q ${prev.x} ${curr.y} ${curr.x} ${curr.y}`;
  }, '');

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border-3 border-amber-300 shadow-xl bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50 select-none ${className}`}
    >
      {/* Top Map Status Header Bar */}
      <div className="bg-white/95 border-b-2 border-amber-300 px-3.5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-left shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
            {currentAge === 4 ? '🏖️' : currentAge === 5 ? '🌲' : currentAge === 6 ? '🌊' : '⚡'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-black text-slate-900 block leading-tight">
                {currentTheme.islandName}
              </span>
              <span className="text-xs bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded-full font-mono">
                {currentTheme.atmosphereBadge}
              </span>
            </div>
            <span className="text-[11px] md:text-xs text-slate-600 font-bold block">
              {currentTheme.description}
            </span>
          </div>
        </div>

        {/* AI Voice Guide Control & Live Speech Status */}
        <div className="flex items-center gap-2 ml-auto">
          {speakingText && (
            <div className="bg-blue-600 text-white font-black text-xs px-3 py-1.5 rounded-2xl shadow-md flex items-center gap-2 animate-pulse max-w-xs md:max-w-md">
              <span>🗣️ AI 導覽中：</span>
              <span className="truncate">{speakingText}</span>
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setSpeakingText(null);
                }}
                className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center hover:bg-white/40"
                title="停止語音"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={() => {
              const nextState = !isVoiceGuideEnabled;
              setIsVoiceGuideEnabled(nextState);
              if (!nextState && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setSpeakingText(null);
              }
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 border shadow-xs ${
              isVoiceGuideEnabled
                ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
            }`}
            title="開啟或關閉 AI 語音導覽朗讀"
          >
            <span>{isVoiceGuideEnabled ? '🔊' : '🔇'}</span>
            <span>{isVoiceGuideEnabled ? 'AI 語音導覽：開啟' : 'AI 語音導覽：靜音'}</span>
          </button>
        </div>
      </div>

      {/* SVG Cartoon Illustrated Island Map - 100% Zero-Overlap Layout */}
      <div className="relative w-full aspect-[16/9] min-h-[420px] max-h-[620px]">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="themeSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.skyGradient.from} />
              <stop offset="50%" stopColor={currentTheme.skyGradient.mid} />
              <stop offset="100%" stopColor={currentTheme.skyGradient.to} />
            </linearGradient>

            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={currentTheme.islandTerrain.roadSurface} />
              <stop offset="100%" stopColor={currentTheme.islandTerrain.roadBorder} />
            </linearGradient>

            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.25" />
            </filter>
            <filter id="strongShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 1. Backdrop Ocean Water */}
          <rect width="1000" height="620" fill="url(#themeSkyGrad)" />

          {/* 2. Custom Themed Island Landmass (Distinct shape for each age band) */}
          <path
            d={currentTheme.landmassOuterPath}
            fill={currentTheme.islandTerrain.outer}
            stroke="#0F172A"
            strokeWidth="3.5"
            filter="url(#strongShadow)"
          />
          <path
            d={currentTheme.landmassInnerPath}
            fill={currentTheme.islandTerrain.inner}
            opacity="0.95"
          />

          {/* 3. Thematic Scenery System (Strictly positioned in sky & clearing) */}
          <IslandThematicScenery theme={currentTheme} />

          {/* 4. Spacious Perimeter Music Road (Rendered BEFORE stations so it never cuts across text) */}
          <path
            d={pathD}
            fill="none"
            stroke="#0F172A"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
          />
          <path
            d={pathD}
            fill="none"
            stroke="url(#roadGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10 8"
            opacity="0.95"
          />

          {/* ========================================================================= */}
          {/* 5. Animal Friends in Open Central Meadow (Zero Overlap with Stations/Road) */}
          {/* ========================================================================= */}

          {/* 1. 小恐龍 Rex at Central West (x=270, y=340) */}
          <g
            transform="translate(270, 340) scale(0.85)"
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => handleAnimalClick('小恐龍 Rex', '每一步都要踩穩音準，手臂要放鬆喔！')}
          >
            <RexDinoSvg size={82} />
            <g transform="translate(54, 98)">
              <rect x="-38" y="-11" width="76" height="22" rx="11" fill="#064E3B" stroke="#34D399" strokeWidth="1.5" filter="url(#softShadow)" />
              <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="900">
                🦖 恐龍 Rex
              </text>
            </g>
          </g>

          {/* 2. 躍動海豚 Pico at Central Meadow (x=460, y=345) */}
          <g
            transform="translate(460, 345) scale(0.85)"
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 animate-pulse"
            onClick={() => handleAnimalClick('海豚 Pico', '手指像躍起的浪花一樣，跳音要輕盈活潑！')}
          >
            <PicoDolphinSvg size={82} />
            <g transform="translate(54, 98)">
              <rect x="-38" y="-11" width="76" height="22" rx="11" fill="#0C4A6E" stroke="#38BDF8" strokeWidth="1.5" filter="url(#softShadow)" />
              <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="900">
                🐬 海豚 Pico
              </text>
            </g>
          </g>

          {/* 3. 暖暖獅子 Eli at Central East (x=650, y=340) */}
          <g
            transform="translate(650, 340) scale(0.85)"
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => handleAnimalClick('暖暖獅子 Eli', '手型要像握住一顆小蘋果，手腕保持柔軟！')}
          >
            <EliLionSvg size={86} mood="happy" />
            <g transform="translate(66, 105)">
              <rect x="-38" y="-11" width="76" height="22" rx="11" fill="#7C2D12" stroke="#FBBF24" strokeWidth="1.5" filter="url(#softShadow)" />
              <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="900">
                🦁 獅子 Eli
              </text>
            </g>
          </g>

          {/* 4. 甲蟲小勇士 Kabuto at East Wayside (x=770, y=260) */}
          <g
            transform="translate(770, 260) scale(0.85)"
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => handleAnimalClick('甲蟲 Kabuto', '節奏滴答滴答敲，跟著節拍器準確彈奏！')}
          >
            <KabutoBeetleSvg size={82} />
            <g transform="translate(56, 92)">
              <rect x="-38" y="-11" width="76" height="22" rx="11" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.5" filter="url(#softShadow)" />
              <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="900">
                🪲 甲蟲 Kabuto
              </text>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 6. Milestone Station Nodes - High-Clarity Stepping Stones (ZERO OVERLAP!) */}
          {/* ========================================================================= */}
          {stations.map((st) => {
            const isActive = st.lessonNumber === activeCoord.lessonNumber;
            const isClickable = st.isUnlocked;

            // Dynamic offsets for station name pill and stars to prevent collision with road
            const isBottom = st.labelPosition === 'bottom';
            const isTop = st.labelPosition === 'top';
            const isRight = st.labelPosition === 'right';

            const nameTransform = isBottom
              ? 'translate(0, 42)'
              : isTop
              ? 'translate(0, -42)'
              : 'translate(44, 0)';

            const starsTransform = isBottom
              ? 'translate(0, -35)'
              : isTop
              ? 'translate(0, 35)'
              : 'translate(-38, 0)';

            return (
              <g
                key={`station-${st.lessonNumber}`}
                transform={`translate(${st.x}, ${st.y})`}
                className={`${isClickable ? 'cursor-pointer group' : 'cursor-not-allowed opacity-65'}`}
                onClick={() => handleStationClick(st)}
              >
                {/* Active Pulsing Ring */}
                {isActive && (
                  <circle
                    cx="0"
                    cy="0"
                    r="36"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Ground Shadow */}
                <ellipse cx="0" cy="10" rx="30" ry="16" fill="#0F172A" opacity="0.3" />

                {/* Main Stepping Stone Circle (r=28, high-visibility disc) */}
                <circle
                  cx="0"
                  cy="0"
                  r="28"
                  fill={
                    st.isCompleted
                      ? '#10B981'
                      : isActive
                      ? '#F59E0B'
                      : st.isUnlocked
                      ? '#3B82F6'
                      : '#64748B'
                  }
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  filter="url(#softShadow)"
                  className="transition-transform group-hover:scale-115"
                />

                {/* Enlarged Landmark Icon in upper half of stone */}
                <text x="0" y="-3" textAnchor="middle" fontSize="22" filter="url(#softShadow)">
                  {st.lesson ? st.lesson.badgeIcon : st.landmark}
                </text>

                {/* Level Number & Solfege pill embedded inside lower half of node */}
                <rect
                  x="-20"
                  y="8"
                  width="40"
                  height="15"
                  rx="7.5"
                  fill="#0F172A"
                  opacity="0.85"
                />
                <text x="0" y="19" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#FFFFFF">
                  {st.lessonNumber}·{st.solfege}
                </text>

                {/* Stars docked neatly away from label direction */}
                {st.isCompleted && (
                  <g transform={starsTransform}>
                    <rect x="-20" y="-7" width="40" height="14" rx="7" fill="#064E3B" stroke="#34D399" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fontSize="9.5" fill="#FDE047" fontWeight="bold">
                      {'★'.repeat(st.stars || 3)}
                    </text>
                  </g>
                )}

                {/* Lock badge if locked */}
                {!st.isUnlocked && (
                  <circle cx="18" cy="-18" r="10" fill="#334155" stroke="#FFFFFF" strokeWidth="2">
                    <text x="18" y="-14" textAnchor="middle" fontSize="9">🔒</text>
                  </circle>
                )}

                {/* Station Name Pill positioned strategically away from the road loop */}
                <g transform={nameTransform}>
                  <rect
                    x="-35"
                    y="-9"
                    width="70"
                    height="18"
                    rx="9"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    filter="url(#softShadow)"
                  />
                  <text x="0" y="3.5" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#1E293B">
                    {st.name.length > 5 ? st.name.slice(0, 5) : st.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 7. Explorer Kai Sprite along the Trail (Non-occluding) */}
          {activeCoord && (() => {
            const isBottom = currentStation.labelPosition === 'bottom';
            const bubbleX = perchBubbleDir === 'left' ? -120 : perchBubbleDir === 'right' ? 30 : -45;
            const bubbleY = perchBubbleDir === 'top' ? -55 : perchBubbleDir === 'bottom' ? 38 : -15;

            return (
              <g
                className="cursor-pointer"
                onClick={() => {
                  setSpriteState('walking');
                  handleAnimalClick('探險家 Kai', `出發！我們一起練習第 ${activeCoord.lessonNumber} 課吧！`);
                  setTimeout(() => setSpriteState('celebrating'), 600);
                  setTimeout(() => setSpriteState('idle'), 2200);
                }}
              >
                <KaiSprite
                  x={perchX}
                  y={perchY}
                  size={70}
                  facing={perchFacing}
                  state={spriteState}
                  showMusicNotes={true}
                />

                <g transform={`translate(${perchX + bubbleX}, ${perchY + bubbleY})`}>
                  <rect
                    x="0"
                    y="0"
                    width="112"
                    height="32"
                    rx="14"
                    fill="#FFFFFF"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    filter="url(#softShadow)"
                  />
                  <text x="56" y="13" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350F">
                    {spriteState === 'walking' ? '🏃 前往下一關！' : '下一站出發！'}
                  </text>
                  <text x="56" y="24" textAnchor="middle" fontSize="9.5" fontWeight="black" fill="#2563EB">
                    {activeCoord.lesson ? `《${activeCoord.lesson.songName}》` : '開始挑戰'}
                  </text>
                </g>
              </g>
            );
          })()}

          {/* 8. Animal Speech Bubble Popup */}
          {animalSpeech && (
            <g transform="translate(500, 160)" className="animate-bounce">
              <rect
                x="-150"
                y="-25"
                width="300"
                height="50"
                rx="25"
                fill="#FFFFFF"
                stroke="#3B82F6"
                strokeWidth="3"
                filter="url(#strongShadow)"
              />
              <text x="0" y="-3" textAnchor="middle" fontSize="13" fontWeight="900" fill="#1E3A8A">
                📢 {animalSpeech.animal} 說：
              </text>
              <text x="0" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0F172A">
                {animalSpeech.text}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Station Preview Modal with AI Voice Guide */}
      {selectedStationLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in text-left"
          onClick={() => {
            speechGuide.stop();
            setSelectedStationLesson(null);
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-amber-300 transform transition-transform animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selectedStationLesson.badgeIcon}</span>
                <div>
                  <span className="text-xs font-mono font-black text-amber-600 uppercase block">
                    第 {selectedStationLesson.lessonNumber} 課關卡
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedStationLesson.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  speechGuide.stop();
                  setSelectedStationLesson(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black"
              >
                ✕
              </button>
            </div>

            {/* AI Voice Guide Playback in Modal */}
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🤖</span>
                <div className="text-xs">
                  <span className="font-black text-blue-900 block">AI 語音導覽朗讀</span>
                  <span className="text-slate-600 font-medium">聆聽本課重點與鼓舞話語</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const station = stations.find((s) => s.lessonNumber === selectedStationLesson.lessonNumber);
                  speakLessonGuide(selectedStationLesson, station ? station.name : selectedStationLesson.title);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition active:scale-95 shadow-xs flex items-center gap-1"
              >
                <span>🔊</span>
                <span>再次朗讀</span>
              </button>
            </div>

            <p className="text-xs md:text-sm text-slate-600 mb-4 bg-amber-50 p-3 rounded-2xl border border-amber-200">
              {selectedStationLesson.storyScene}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block mb-0.5">調性/難度</span>
                <span className="text-slate-800 font-black">
                  {selectedStationLesson.keySignature || 'C大調'} · Lv.{selectedStationLesson.difficultyLevel || 1}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold block mb-0.5">榮譽徽章</span>
                <span className="text-amber-800 font-black truncate block">
                  {selectedStationLesson.badgeIcon} {selectedStationLesson.badgeTitle}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                speechGuide.stop();
                onSelectLesson(selectedStationLesson);
                setSelectedStationLesson(null);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-base rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 border-2 border-white"
            >
              <span>🚀 立即開始本關練習</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
