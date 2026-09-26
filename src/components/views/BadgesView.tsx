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
      {/* Header Deck - Bright & Cheerful */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-white border-3 border-amber-300 rounded-3xl p-6 md:p-8 shadow-sm text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-wider text-amber-600 font-mono">
              Achievements & Honors
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-sm font-black text-amber-800">
              成就榮譽殿堂
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-950 mt-1">
            探險家成就徽章與結業證書
          </h1>
          <p className="text-base text-slate-700 mt-1 max-w-xl font-bold">
            完成每一堂課程的三大挑戰，即可解鎖對應的專屬榮譽徽章！
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCertificate(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-base rounded-2xl shadow-md transition active:scale-95 border-2 border-white"
          >
            🎓 查看探險家結業證書
          </button>
          <button
            onClick={exportProgressToJson}
            className="px-5 py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-base rounded-2xl border-2 border-amber-300 transition active:scale-95 shadow-sm"
            title="下載學習成果 JSON"
          >
            📥 匯出進度
          </button>
        </div>
      </div>

      {/* Badges Grid - Bright & Sunny */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {LESSONS_DATABASE.map((lesson) => {
          const isUnlocked = progress.unlockedBadges.includes(lesson.badgeId) ||
            (progress.completedLessons[lesson.id] && progress.completedLessons[lesson.id].stars > 0);

          return (
            <div
              key={lesson.badgeId}
              className={`p-5 rounded-3xl border-2 text-center flex flex-col items-center justify-center gap-2.5 transition-all shadow-sm ${
                isUnlocked
                  ? 'bg-amber-50/90 border-amber-300 shadow-md scale-100 hover:scale-105'
                  : 'bg-white border-slate-200 opacity-50'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${
                isUnlocked ? 'bg-amber-200/60 ring-3 ring-amber-400' : 'bg-slate-100'
              }`}>
                {isUnlocked ? lesson.badgeIcon : '🔒'}
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-black text-slate-900 line-clamp-1">
                  {lesson.badgeTitle}
                </span>
                <span className="text-xs text-amber-800 font-bold font-mono">
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
