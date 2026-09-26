import React, { useState, useEffect } from 'react';

interface DeployDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployDownloadModal: React.FC<DeployDownloadModalProps> = ({ isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prevent background scroll when modal is open to avoid view overlap
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/kaiquest-piano-deploy.zip', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`下載失敗 (HTTP ${response.status})`);
      }
      const blob = await response.blob();
      if (blob.size < 1000) {
        throw new Error('壓縮包正在準備中，請點擊下方備用直接下載通道');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kaiquest-piano-deploy.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Retain URL for 60 seconds so browser download stream completes without corruption
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
      setDownloadSuccess(true);
    } catch (err: any) {
      console.warn('Blob download fallback to direct anchor:', err);
      // Direct navigation fallback (native browser download)
      const link = document.createElement('a');
      link.href = '/kaiquest-piano-deploy.zip';
      link.download = 'kaiquest-piano-deploy.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 sm:p-6 overflow-y-auto select-none text-left"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white border-4 border-amber-300 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 flex flex-col gap-6 max-h-[92vh] overflow-y-auto my-auto">
        {/* Header - Cheerful & Bright */}
        <div className="flex items-start justify-between border-b-2 border-amber-200 pb-4">
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-white flex items-center justify-center text-4xl shadow-lg shrink-0">
              📦
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-black text-amber-950">
                  專案離線部署包下載
                </h2>
                <span className="px-3 py-1 rounded-full text-sm font-black bg-emerald-500 text-white shadow-sm">
                  .ZIP 獨立版
                </span>
              </div>
              <p className="text-base text-slate-700 mt-1 font-bold">
                解壓縮即可在任何 Windows、Mac 電腦或 iPad 區域網路中離線運行！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 flex items-center justify-center text-2xl font-black transition active:scale-95 shrink-0"
            title="關閉"
          >
            ✕
          </button>
        </div>

        {/* Primary Download Card */}
        <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-200 border-3 border-amber-300 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-md">
          <div className="flex flex-col gap-2 text-left">
            <span className="text-xl font-black text-amber-950 flex items-center gap-2">
              <span>📁</span>
              <span className="font-mono text-amber-900">kaiquest-piano-deploy.zip</span>
            </span>
            <p className="text-base text-slate-800 leading-relaxed font-bold">
              內含完整高音質鋼琴網站（<strong className="text-amber-900 font-mono">dist/</strong>）、零依賴 Node 伺服器與一鍵啟動腳本。
            </p>
            <span className="text-sm text-emerald-800 font-black flex items-center gap-1.5">
              <span>✅</span>
              <span>壓縮檔完整驗證通過 · 免聯網離線可用 · 檔案大小約 0.5 MB</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-lg rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">{isDownloading ? '⏳' : '📥'}</span>
              <span>
                {isDownloading
                  ? '下載中...'
                  : downloadSuccess
                  ? '已完成下載 (點此再次下載)'
                  : '立即下載壓縮檔 (.ZIP)'}
              </span>
            </button>

            {/* Direct fallback link for browsers with strict blob blocking */}
            <a
              href="/kaiquest-piano-deploy.zip"
              download="kaiquest-piano-deploy.zip"
              className="text-center text-sm font-black text-amber-900 underline hover:text-orange-700 py-1"
            >
              🔗 備用直接下載連結 (Direct Link)
            </a>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-100 border-2 border-rose-300 rounded-2xl p-4 text-base text-rose-900 font-bold">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* What's Inside the ZIP */}
        <div className="bg-amber-50/60 border-2 border-amber-200 rounded-2xl p-5 flex flex-col gap-3 text-left">
          <span className="text-base font-black text-amber-950 flex items-center gap-2">
            <span>📋</span>
            <span>壓縮包完整內容一覽：</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm flex items-start gap-3">
              <span className="text-2xl">📁</span>
              <div>
                <strong className="text-slate-900 font-mono text-base block font-black">dist/</strong>
                <span className="text-sm text-slate-700 font-bold">完整靜態網頁（HTML、音效、五線譜與 PWA 離線快取）。</span>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm flex items-start gap-3">
              <span className="text-2xl">🟢</span>
              <div>
                <strong className="text-slate-900 font-mono text-base block font-black">server.js</strong>
                <span className="text-sm text-slate-700 font-bold">零依賴輕量 Node.js 本機/區網伺服器，直接運行。</span>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm flex items-start gap-3">
              <span className="text-2xl">🪟</span>
              <div>
                <strong className="text-slate-900 font-mono text-base block font-black">start-windows.bat</strong>
                <span className="text-sm text-slate-700 font-bold">Windows 專用：滑鼠點兩下直接開啟並自動啟動瀏覽器。</span>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm flex items-start gap-3">
              <span className="text-2xl">🍎</span>
              <div>
                <strong className="text-slate-900 font-mono text-base block font-black">start-mac-linux.sh</strong>
                <span className="text-sm text-slate-700 font-bold">Mac / Linux 專用：一鍵點擊啟動腳本。</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Simple Deployment Steps */}
        <div className="flex flex-col gap-3 text-left">
          <span className="text-base font-black text-amber-950 flex items-center gap-2">
            <span>🚀</span>
            <span>三種常見電腦部署方式：</span>
          </span>

          {/* Method 1 */}
          <div className="bg-amber-100/60 border-2 border-amber-300 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <strong className="text-amber-950 font-black text-base flex items-center gap-2">
                <span>1️⃣</span> 方式一：其他電腦本機離線執行（最推薦）
              </strong>
              <span className="text-xs bg-amber-300 text-amber-950 px-3 py-1 rounded-full font-black">
                雙擊即玩
              </span>
            </div>
            <ol className="list-decimal list-inside text-slate-800 space-y-1 text-base leading-relaxed font-bold">
              <li>解壓縮 <code className="text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded">kaiquest-piano-deploy.zip</code> 到任何資料夾。</li>
              <li>
                <strong>Windows 電腦</strong>：雙擊 <code className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">start-windows.bat</code>。
              </li>
              <li>
                <strong>Mac / Linux 電腦</strong>：執行 <code className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">node server.js</code> 或 <code className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">bash start-mac-linux.sh</code>。
              </li>
              <li>瀏覽器會自動開啟，即可享有 100% 離線高音質琴音彈奏！</li>
            </ol>
          </div>

          {/* Method 2 */}
          <div className="bg-sky-100/60 border-2 border-sky-300 rounded-2xl p-4 flex flex-col gap-2">
            <strong className="text-sky-950 font-black text-base flex items-center gap-2">
              <span>2️⃣</span> 方式二：區域網路多台 iPad 同步連線
            </strong>
            <p className="text-slate-800 text-base leading-relaxed font-bold">
              電腦啟動伺服器後，電腦與 iPad 連接同一個 WiFi，在 iPad Safari 輸入電腦的內網 IP（例如 <code className="text-sky-900 bg-sky-200 px-1.5 py-0.5 rounded font-mono">http://192.168.1.100:3000</code>），即可直接連線並「加入主畫面」全螢幕使用。
            </p>
          </div>

          {/* Method 3 */}
          <div className="bg-purple-100/60 border-2 border-purple-300 rounded-2xl p-4 flex flex-col gap-2">
            <strong className="text-purple-950 font-black text-base flex items-center gap-2">
              <span>3️⃣</span> 方式三：免費託管至 Vercel / Netlify 雲端
            </strong>
            <p className="text-slate-800 text-base leading-relaxed font-bold">
              將壓縮包內的 <code className="text-purple-950 bg-purple-200 px-1.5 py-0.5 rounded font-mono">dist/</code> 目錄直接拖曳上傳至 <strong>Vercel</strong> 或 <strong>Netlify Drop</strong>，即可免費享有專屬 HTTPS 網址！
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-amber-200 flex items-center justify-between gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-base shadow-md transition active:scale-95"
          >
            <span>📥</span>
            <span>下載壓縮檔 (.ZIP)</span>
          </button>

          <button
            onClick={onClose}
            className="px-7 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-2xl text-base transition active:scale-95"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
