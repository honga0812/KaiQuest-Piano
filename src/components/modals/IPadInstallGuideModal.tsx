import React, { useState } from 'react';

interface IPadInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IPadInstallGuideModal: React.FC<IPadInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'safari' | 'deploy' | 'native'>('safari');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-400/90 rounded-3xl p-6 shadow-2xl text-left text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-2xl shadow-inner">
              📲
            </span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>iPad 平板安裝與全螢幕部署指南</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white">
                  PWA + 全螢幕
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                免下載 App Store，在 iPad Safari 一鍵「加入主畫面」，立即享受無網址列、沉浸式橫向全螢幕與離線彈奏！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-base font-bold transition"
            title="關閉"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('safari')}
            className={`flex-1 py-2 px-3 rounded-xl transition ${
              activeTab === 'safari' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🍎 1. iPad Safari 一鍵安裝 (最推薦)
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2 px-3 rounded-xl transition ${
              activeTab === 'deploy' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🚀 2. 網站打包與雲端部署
          </button>
          <button
            onClick={() => setActiveTab('native')}
            className={`flex-1 py-2 px-3 rounded-xl transition ${
              activeTab === 'native' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 3. 打包原生 IPA (App Store)
          </button>
        </div>

        {/* Tab 1: Safari Add to Home Screen */}
        {activeTab === 'safari' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="bg-amber-950/40 border border-amber-400/40 rounded-2xl p-4 text-amber-200">
              <strong className="text-white text-sm block mb-1">🌟 為什麼推薦 iPad 「加入主畫面」？</strong>
              本系統已完整配置 <strong>Apple Web App Standalone</strong> 規範。加入主畫面後，點擊桌面圖示啟動時會<strong>完全隱藏 Safari 網址列與分頁標籤</strong>，變成如同 App Store 下載的原生全螢幕應用程式，防誤觸且音頻延遲極低！
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  1
                </div>
                <h3 className="text-sm font-black text-white">用 Safari 開啟</h3>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  在 iPad 上打開 <strong>Safari 瀏覽器</strong>，輸入或點開本應用的網址（如當前 Dev 或 Pre 網址）。
                </p>
                <div className="mt-auto bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-slate-400 text-[10px] font-mono">
                  🌐 Safari 瀏覽器
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  2
                </div>
                <h3 className="text-sm font-black text-white">點擊「分享」按鈕</h3>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  點擊 iPad Safari 頂部工具列右側的 <strong>分享圖示</strong>（方框帶向上箭頭 📤）。
                </p>
                <div className="mt-auto bg-slate-900 border border-slate-800 rounded-xl p-2 text-center text-amber-300 font-bold text-[11px]">
                  📤 點擊「分享」
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  3
                </div>
                <h3 className="text-sm font-black text-white">加入主畫面</h3>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  在分享選單中向下滑動，點選 <strong>「加入主畫面 (Add to Home Screen)」</strong>（圖示 ➕），再點右上角「新增」。
                </p>
                <div className="mt-auto bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2 text-center text-emerald-300 font-bold text-[11px]">
                  ➕ 加入主畫面
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <p className="text-[11px] text-slate-200">
                完成後，iPad 桌面上就會出現可愛的 <strong>KaiQuest 鋼琴圖示</strong>，橫向擺放即可全螢幕練琴，支援麥克風辨音與 USB MIDI 電鋼琴直連！
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Deployment & Packaging */}
        {activeTab === 'deploy' && (
          <div className="flex flex-col gap-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              如果您想要將程式部署到專屬域名、自己的雲端主機（或公司伺服器），流程非常簡單：
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 font-mono text-[11px]">
              <span className="text-amber-400 font-bold">// 1. 在本機或 CI/CD 執行前端打包指令：</span>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-emerald-300">
                npm run build
              </div>
              <span className="text-slate-400 text-[10px] font-sans">
                這會生成極度優化、最小化的靜態檔案目錄：<strong className="text-white font-mono">dist/</strong>（包含所有 HTML、JS、CSS、PWA Service Worker 與圖示資源）。
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5">
                <strong className="text-white text-xs flex items-center gap-1.5">
                  <span>☁️</span> 方案 A：Vercel / Cloudflare / Netlify
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  將代碼推送至 GitHub，在 Vercel 或 Cloudflare Pages 綁定倉庫，Build Command 設為 <code className="text-amber-300">npm run build</code>，輸出目錄設為 <code className="text-amber-300">dist</code>，自動提供全球 CDN 與 HTTPS。
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5">
                <strong className="text-white text-xs flex items-center gap-1.5">
                  <span>🐳</span> 方案 B：Google Cloud Run / Nginx Docker
                </strong>
                <p className="text-slate-300 leading-relaxed">
                  使用輕量 Nginx 容器將 <code className="text-amber-300">dist/</code> 內容映射到 <code className="text-amber-300">/usr/share/nginx/html</code>，開啟 gzip / brotli 快取與 HTTPS，即可提供極致快速的企業級加載速度。
                </p>
              </div>
            </div>

            <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3 text-blue-200 text-[11px]">
              🔒 <strong>HTTPS 重要提示：</strong> iOS 與 iPad 的麥克風音頻採集 (Web Audio API) 與 PWA 特性必須在 <strong>HTTPS</strong> 安全環境下才能啟動，請確保部署網址具備 SSL 憑證。
            </div>
          </div>
        )}

        {/* Tab 3: Native App Packaging (Capacitor) */}
        {activeTab === 'native' && (
          <div className="flex flex-col gap-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              若需要上架到 <strong>Apple App Store</strong> 或透過 Apple Configurator 批量安裝至學校/教室的 iPad：
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 font-mono text-[11px]">
              <span className="text-amber-400 font-bold">// 使用官方推薦的 Capacitor 打包為 Xcode 原生 iOS 專案：</span>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-emerald-300 flex flex-col gap-1">
                <span>npm install @capacitor/core @capacitor/cli @capacitor/ios</span>
                <span>npx cap init "KaiQuest" "com.kaiquest.piano"</span>
                <span>npm run build</span>
                <span>npx cap add ios</span>
                <span>npx cap open ios  # 自動在 Mac 上開啟 Xcode 進行編譯與簽名</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5 text-[11px]">
              <strong className="text-white text-xs">Xcode 專案設定建議：</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong>Device Orientation</strong>：僅勾選 <code className="text-amber-300">Landscape Left</code> 與 <code className="text-amber-300">Landscape Right</code>（強制橫向）。</li>
                <li><strong>Info.plist 權限說明</strong>：加入 <code className="text-amber-300">Privacy - Microphone Usage Description</code>（「KaiQuest 需要麥克風權限以進行琴聲辨識」）。</li>
                <li><strong>Target Device</strong>：選擇 iPad 或 Universal。</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            知道了，開始使用！
          </button>
        </div>
      </div>
    </div>
  );
};
