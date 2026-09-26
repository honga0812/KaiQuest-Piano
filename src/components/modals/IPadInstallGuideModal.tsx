import React, { useState } from 'react';

interface IPadInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleFullscreen?: () => void;
  isImmersiveMode?: boolean;
}

export const IPadInstallGuideModal: React.FC<IPadInstallGuideModalProps> = ({
  isOpen,
  onClose,
  onToggleFullscreen,
  isImmersiveMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'safari' | 'deploy' | 'native'>('safari');
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && Boolean(document.fullscreenElement)
  );

  const isActuallyFullscreen = Boolean(isImmersiveMode || isFullscreen);

  const handleToggleFullscreen = async () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
      return;
    }

    try {
      const docEl = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
        webkitFullscreenElement?: Element;
      };

      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in select-none text-left"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white border-3 border-amber-300 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-800 flex flex-col gap-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-amber-150 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center text-3xl shadow-md">
              📲
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>iPad 平板安裝與全螢幕操作指南</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-sm">
                  PWA 全螢幕
                </span>
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-bold">
                免去 App Store，在 iPad Safari 一鍵「加入主畫面」，立即享受無網址列、沉浸式全螢幕練琴！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xl font-black transition active:scale-95"
            title="關閉"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-amber-50 p-1.5 rounded-2xl border-2 border-amber-200 text-sm font-black">
          <button
            onClick={() => setActiveTab('safari')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition ${
              activeTab === 'safari' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🍎 1. iPad Safari 一鍵安裝 (最推薦)
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition ${
              activeTab === 'deploy' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚀 2. 網站打包與雲端部署
          </button>
          <button
            onClick={() => setActiveTab('native')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition ${
              activeTab === 'native' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 3. 打包原生 IPA (App Store)
          </button>
        </div>

        {/* Tab 1: Safari Add to Home Screen */}
        {activeTab === 'safari' && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-950">
              <strong className="text-base font-black text-amber-900 block mb-1">🌟 為什麼強烈推薦 iPad 「加入主畫面」？</strong>
              本系統已完整支援 <strong>Apple Web App Standalone</strong> 規範。加入主畫面後，點擊桌面圖示啟動將<strong>完全隱藏 Safari 網址列與分頁欄</strong>，如同原生應用程式般全螢幕橫向擺放，防誤觸且音頻延遲極低！
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  1
                </div>
                <h3 className="text-base font-black text-slate-900">用 Safari 開啟</h3>
                <p className="text-slate-600 leading-relaxed text-xs font-medium">
                  在 iPad 上打開 <strong>Safari 瀏覽器</strong>，輸入或點開本應用的網址。
                </p>
                <div className="mt-auto bg-white border border-slate-200 rounded-xl p-2 text-center text-slate-700 text-xs font-bold">
                  🌐 Safari 瀏覽器
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  2
                </div>
                <h3 className="text-base font-black text-slate-900">點擊「分享」按鈕</h3>
                <p className="text-slate-600 leading-relaxed text-xs font-medium">
                  點擊 iPad Safari 頂部工具列右側的 <strong>分享圖示</strong>（方框帶向上箭頭 📤）。
                </p>
                <div className="mt-auto bg-amber-100 border border-amber-300 rounded-xl p-2 text-center text-amber-900 font-black text-xs">
                  📤 點擊「分享」
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  3
                </div>
                <h3 className="text-base font-black text-slate-900">加入主畫面</h3>
                <p className="text-slate-600 leading-relaxed text-xs font-medium">
                  在分享選單中向下滑動，點選 <strong>「加入主畫面 (Add to Home Screen)」</strong>（➕），再點右上角「新增」。
                </p>
                <div className="mt-auto bg-emerald-100 border border-emerald-300 rounded-xl p-2 text-center text-emerald-900 font-black text-xs">
                  ➕ 加入主畫面
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <p className="text-sm text-emerald-950 font-medium">
                完成後，iPad 桌面上就會出現專屬的 <strong>KaiQuest 鋼琴圖示</strong>，橫向擺放即可全螢幕練琴，支援麥克風即時辨音與 USB 電鋼琴直連！
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Deployment & Packaging */}
        {activeTab === 'deploy' && (
          <div className="flex flex-col gap-4 text-sm">
            <p className="text-slate-700 leading-relaxed font-medium">
              如果您想要將程式部署到專屬域名或自己的雲端主機：
            </p>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-2 font-mono text-xs">
              <span className="text-amber-800 font-bold">// 1. 在專案中執行打包指令：</span>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-emerald-700 font-bold text-sm">
                npm run build
              </div>
              <span className="text-slate-600 font-sans text-xs">
                這會生成極度優化、最小化的靜態檔案目錄：<strong className="text-slate-900 font-mono">dist/</strong>。
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
                <strong className="text-slate-900 text-sm flex items-center gap-1.5 font-black">
                  <span>☁️</span> 方案 A：Vercel / Netlify 免費託管
                </strong>
                <p className="text-slate-600 leading-relaxed font-medium">
                  將代碼推送至 GitHub，或直接把 <code className="text-amber-800 font-bold">dist</code> 資料夾拖曳至 Netlify Drop，自動提供全球 CDN 與 HTTPS。
                </p>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
                <strong className="text-slate-900 text-sm flex items-center gap-1.5 font-black">
                  <span>🐳</span> 方案 B：自建 Nginx / Docker
                </strong>
                <p className="text-slate-600 leading-relaxed font-medium">
                  將 <code className="text-amber-800 font-bold">dist/</code> 內容映射至 Nginx 目錄，開啟 gzip 與 HTTPS，即可享有高效穩定的專屬伺服器。
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3.5 text-blue-950 text-xs font-medium">
              🔒 <strong>HTTPS 重要提示：</strong> iOS 與 iPad 的麥克風音頻採集 (Web Audio API) 必須在 <strong>HTTPS</strong> 安全環境下才能啟動，請確保伺服器具備 SSL 憑證。
            </div>
          </div>
        )}

        {/* Tab 3: Native App Packaging (Capacitor) */}
        {activeTab === 'native' && (
          <div className="flex flex-col gap-4 text-sm">
            <p className="text-slate-700 leading-relaxed font-medium">
              若需要上架到 <strong>Apple App Store</strong> 或透過 Apple Configurator 批量安裝至學校的 iPad：
            </p>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-2 font-mono text-xs">
              <span className="text-amber-800 font-bold">// 使用 Capacitor 打包為 Xcode 原生 iOS 專案：</span>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-emerald-700 flex flex-col gap-1 font-bold">
                <span>npm install @capacitor/core @capacitor/cli @capacitor/ios</span>
                <span>npx cap init "KaiQuest" "com.kaiquest.piano"</span>
                <span>npm run build</span>
                <span>npx cap add ios</span>
                <span>npx cap open ios  # 自動在 Mac 上開啟 Xcode 進行編譯與簽名</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleToggleFullscreen}
            className={`flex items-center gap-2 px-5 py-2.5 font-black rounded-xl text-sm border-2 shadow-sm transition active:scale-95 ${
              isActuallyFullscreen
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-300'
            }`}
          >
            <span>{isActuallyFullscreen ? '🗗' : '🖥️'}</span>
            <span>{isActuallyFullscreen ? '退出全螢幕模式' : '立即切換全螢幕 (Fullscreen)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-sm shadow-md transition ml-auto"
          >
            知道了，開始使用！
          </button>
        </div>
      </div>
    </div>
  );
};
