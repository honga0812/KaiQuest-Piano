import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { getPublicShareUrl } from '../../utils/safariShare';

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
  const [activeTab, setActiveTab] = useState<'safari' | 'fix401' | 'deploy' | 'native'>('safari');
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && Boolean(document.fullscreenElement)
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const publicUrl = getPublicShareUrl();
  const isActuallyFullscreen = Boolean(isImmersiveMode || isFullscreen);

  // Generate QR Code when modal opens or tab changes
  useEffect(() => {
    if (isOpen && qrCanvasRef.current && publicUrl) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        publicUrl,
        {
          width: 160,
          margin: 1.5,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [isOpen, publicUrl, activeTab]);

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = publicUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/65 backdrop-blur-md p-4 animate-fade-in select-none text-left"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white border-3 border-amber-300 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-800 flex flex-col gap-5 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-amber-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center text-3xl shadow-md">
              📲
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>iPad 平板安裝與全螢幕操作指南</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-sm">
                  PWA 全螢幕
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm">
                  免 401 錯誤
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
        <div className="flex flex-wrap items-center gap-2 bg-amber-50 p-1.5 rounded-2xl border-2 border-amber-200 text-xs md:text-sm font-black">
          <button
            onClick={() => setActiveTab('safari')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition whitespace-nowrap ${
              activeTab === 'safari' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🍎 1. iPad Safari 一鍵全螢幕
          </button>
          <button
            onClick={() => setActiveTab('fix401')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition whitespace-nowrap ${
              activeTab === 'fix401' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ 2. 解決 401 錯誤說明
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition whitespace-nowrap ${
              activeTab === 'deploy' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🚀 3. 雲端部署指南
          </button>
          <button
            onClick={() => setActiveTab('native')}
            className={`flex-1 py-2.5 px-3 rounded-xl transition whitespace-nowrap ${
              activeTab === 'native' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📦 4. 打包原生 IPA
          </button>
        </div>

        {/* Tab 1: Safari Add to Home Screen & Quick Launch */}
        {activeTab === 'safari' && (
          <div className="flex flex-col gap-4 text-sm">
            {/* Quick Access Launch Banner with QR Code & Copy */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border-2 border-blue-300 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="bg-white p-2 rounded-2xl shadow border border-blue-200 shrink-0 flex flex-col items-center">
                <canvas ref={qrCanvasRef} className="rounded-xl" />
                <span className="text-[11px] font-bold text-slate-600 mt-1">iPad 相機掃描立即開啟</span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5 text-left w-full">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white">
                    ✅ 免 401 認證專用網址
                  </span>
                  <span className="text-xs text-slate-500 font-mono truncate max-w-[260px] md:max-w-[340px]">
                    {publicUrl}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-700 font-bold leading-relaxed">
                  點擊下方按鈕或複製網址，在 iPad Safari 開啟後點擊「分享 ➔ 加入主畫面」，即可永久擁有獨立桌面圖示與純淨全螢幕！
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl text-xs md:text-sm shadow-md transition active:scale-95"
                  >
                    <span>↗</span>
                    <span>在 Safari 開啟全螢幕</span>
                  </a>

                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-black rounded-xl text-xs md:text-sm border-2 border-slate-300 shadow-xs transition active:scale-95"
                  >
                    <span>{copySuccess ? '✅' : '📋'}</span>
                    <span>{copySuccess ? '已複製！請在 iPad Safari 貼上' : '複製 iPad 專用連結'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  1
                </div>
                <h3 className="text-base font-black text-slate-900">用 Safari 開啟</h3>
                <p className="text-slate-600 leading-relaxed text-xs font-medium">
                  在 iPad 上打開 <strong>Safari 瀏覽器</strong>，貼上上方免 401 錯誤的專用網址。
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
                完成後，iPad 桌面上就會出現專屬的 <strong>KaiQuest 鋼琴圖示</strong>，橫向擺放即可享受 100% 無網址列、無干擾全螢幕練琴，支援麥克風即時辨音與 USB 電鋼琴直連！
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: 401 Explanation & Diagnostics */}
        {activeTab === 'fix401' && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-950">
              <strong className="text-base font-black text-amber-900 block mb-1">
                ⚠️ 為什麼之前在平板操作時會出現「401 發生錯誤的頁面」？
              </strong>
              <div className="text-xs md:text-sm text-amber-900/90 leading-relaxed space-y-2 font-medium">
                <p>
                  <strong>原因解析：</strong>
                  Google AI Studio 的內部編輯器預覽環境使用的是 <code className="bg-amber-200 px-1 py-0.5 rounded font-mono font-bold">ais-dev-*.run.app</code> 內部私有網址。該網址受到 Google 帳號開發者身份驗證（IAM 權限）保護。
                </p>
                <p>
                  當您在 iPad 平板的 Safari 獨立開啟連結、或者跨視窗瀏覽時，Safari 基於隱私安全（ITP 跨網站追蹤防護）不會攜帶 AI Studio 的內部登入憑證，因此 Google Cloud Run 伺服器會立即回傳 <strong>401 Unauthorized（未授權）錯誤</strong>。
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-emerald-950">
              <strong className="text-base font-black text-emerald-900 block mb-1">
                💡 解決方案：使用公開共享專用網址 (ais-pre)
              </strong>
              <p className="text-xs md:text-sm text-emerald-900 leading-relaxed mb-3 font-medium">
                本系統已為您配置公開免登入的專用鏡像網址（<code className="bg-emerald-200 px-1 py-0.5 rounded font-mono font-bold">ais-pre-*.run.app</code>），此網址對外公開、免 Google 登入、永不產生 401 錯誤！
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs md:text-sm shadow transition"
                >
                  🚀 立即用公開免 401 網址開啟
                </a>
                <button
                  onClick={handleCopyUrl}
                  className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-400 font-black rounded-xl text-xs md:text-sm transition"
                >
                  {copySuccess ? '✅ 複製成功！' : '📋 複製專用網址'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 text-slate-700 text-xs">
              <strong className="text-slate-900 font-bold block mb-1">📱 平板 Safari 全螢幕小秘訣：</strong>
              若在 Safari 網頁中直接點擊按鈕，Apple iOS / iPadOS 限制網頁不可直接強制進入原生全螢幕。請務必在 Safari 點選<strong>「分享」➔「加入主畫面」</strong>，從桌面圖示啟動即可獲得 100% 完整全螢幕體驗！
            </div>
          </div>
        )}

        {/* Tab 3: Deployment & Packaging */}
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

        {/* Tab 4: Native App Packaging (Capacitor) */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFullscreen}
              className={`flex items-center gap-2 px-4 py-2 font-black rounded-xl text-xs md:text-sm border-2 shadow-sm transition active:scale-95 ${
                isActuallyFullscreen
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-300'
              }`}
            >
              <span>{isActuallyFullscreen ? '🗗' : '🖥️'}</span>
              <span>{isActuallyFullscreen ? '退出全螢幕' : '網頁沉浸全螢幕'}</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border-2 border-blue-300 font-black rounded-xl text-xs md:text-sm transition active:scale-95"
            >
              <span>📲</span>
              <span>在 iPad Safari 開啟</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs md:text-sm shadow-md transition ml-auto"
          >
            知道了，開始使用！
          </button>
        </div>
      </div>
    </div>
  );
};
