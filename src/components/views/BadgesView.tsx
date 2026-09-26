import React, { useState } from 'react';
import { UserProgress } from '../../types/piano';
import { LESSONS_DATABASE } from '../../data/lessons';
import { exportProgressToJson } from '../../utils/storage';

interface BadgesViewProps {
  progress: UserProgress;
  onUpdateStudentName?: (name: string) => void;
  className?: string;
}

export const BadgesView: React.FC<BadgesViewProps> = ({
  progress,
  className = '',
}) => {
  const [studentName, setStudentName] = useState(progress.studentName || '小琴童探險家');
  const [showCertificate, setShowCertificate] = useState(false);

  const totalStars = Object.values(progress.completedLessons).reduce((sum, l) => sum + l.stars, 0);
  const lessonsCompletedCount = Object.keys(progress.completedLessons).length;

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 md:p-6 select-none flex flex-col gap-6 ${className}`}>
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              Achievements & Honors
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">
              成就榮譽殿堂
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            探險家成就徽章與結業證書
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            完成每一堂課程的三大挑戰，即可解鎖對應的專屬榮譽徽章！
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCertificate(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition"
          >
            🎓 查看探險家結業證書
          </button>
          <button
            onClick={exportProgressToJson}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
            title="下載學習成果 JSON"
          >
            📥 匯出進度
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {LESSONS_DATABASE.map((lesson) => {
          const isUnlocked = progress.unlockedBadges.includes(lesson.badgeId) ||
            (progress.completedLessons[lesson.id] && progress.completedLessons[lesson.id].stars > 0);

          return (
            <div
              key={lesson.badgeId}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                isUnlocked
                  ? 'bg-slate-900 border-amber-500/50 shadow-lg scale-100'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-40'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                isUnlocked ? 'bg-amber-400/20 ring-2 ring-amber-400/60' : 'bg-slate-800'
              }`}>
                {isUnlocked ? lesson.badgeIcon : '🔒'}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-white line-clamp-1">
                  {lesson.badgeTitle}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  第 {lesson.lessonNumber} 課
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-amber-100 text-slate-900 rounded-3xl p-8 shadow-2xl border-8 border-amber-400 flex flex-col items-center text-center gap-4">
            {/* Close button */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 font-bold text-lg"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="flex items-center gap-2 text-amber-700 font-bold uppercase tracking-widest text-xs">
              ★ KaiQuest Piano Adventure Official Certificate ★
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              小小鋼琴探險家榮譽證書
            </h2>

            <p className="text-sm text-slate-700 max-w-md">
              茲證明卓越的小音樂家在鋼琴島的奇幻歷險中，展現了無與倫比的熱情、穩定的指法與靈敏的音準！
            </p>

            {/* Child's Name Input Field */}
            <div className="flex items-center gap-2 my-2">
              <span className="text-sm font-bold text-slate-800">頒發給：</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-xl md:text-2xl font-black text-blue-900 border-b-2 border-slate-800 bg-transparent text-center focus:outline-none px-2"
              />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-6 bg-white/70 rounded-2xl p-4 w-full max-w-md border border-amber-300">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">完成課數</span>
                <span className="text-xl font-black text-slate-900">{lessonsCompletedCount} / 12</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">獲得星星</span>
                <span className="text-xl font-black text-amber-600">{totalStars} ★</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">解鎖徽章</span>
                <span className="text-xl font-black text-blue-600">{progress.unlockedBadges.length} 🏅</span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full max-w-md pt-4 text-xs text-slate-600 border-t border-amber-300">
              <div className="text-left font-mono">
                證書發行日期: {new Date().toLocaleDateString('zh-TW')}
              </div>
              <div className="text-right font-bold text-slate-800">
                Kai & 動物導師團 敬頒
              </div>
            </div>

            {/* Print Action */}
            <button
              onClick={() => window.print()}
              className="mt-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              🖨️ 列印證書保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
