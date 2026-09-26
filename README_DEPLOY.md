# KaiQuest 兒童鋼琴冒險 · 獨立部署與使用指南

歡迎使用 **KaiQuest 兒童鋼琴冒險 (KaiQuest Piano Adventure)**！
本壓縮包含有完整的生產環境網站檔案、免安裝 Node.js 伺服器與一鍵啟動腳本。您可以將本壓縮檔解壓縮至任何電腦、校園主機或雲端伺服器進行離線與連網彈奏。

---

## 📁 壓縮包內容說明

```text
kaiquest-piano-deploy/
├── dist/                  # 已建置完成的純靜態網頁（HTML、CSS、JS、圖示、PWA 資源）
├── server.js              # 零相依、跨平台之輕量 Node.js 本機伺服器
├── start-windows.bat      # Windows 專用：雙擊立即啟動並自動開啟瀏覽器
├── start-mac-linux.sh     # macOS / Linux 專用：一鍵啟動腳本
├── package.json           # 專案資訊與啟動指令配置
└── README_DEPLOY.md       # 本使用與部署指南
```

---

## 🚀 方式一：其他電腦本機離線執行（最簡單）

只要電腦有安裝 [Node.js](https://nodejs.org/)（長期支援版本 LTS 即可）：

### Windows 電腦：
1. 將本壓縮檔解壓縮至任意資料夾（例如桌面）。
2. 直接雙擊執行 **`start-windows.bat`**。
3. 程式會自動啟動本機伺服器並在瀏覽器中打開 `http://localhost:3000`！

### macOS / Linux 電腦：
1. 開啟終端機 (Terminal)，進入解壓縮後的資料夾：
   ```bash
   cd path/to/kaiquest-piano-deploy
   ```
2. 執行：
   ```bash
   node server.js
   ```
   或賦予執行權限後執行：
   ```bash
   chmod +x start-mac-linux.sh
   ./start-mac-linux.sh
   ```
3. 在瀏覽器打開 `http://localhost:3000` 即可使用！

---

## 📱 方式二：在 iPad 平板上全螢幕使用（區域網路連線）

若您想要讓家中小朋友或教室裡的 iPad 平板使用：

1. 確保電腦與 iPad 連接到**同一個 WiFi 網路**（或手機熱點）。
2. 在電腦上啟動伺服器（執行 `node server.js`），終端機中會印出電腦的區網 IP，例如：
   ```text
   ▶ iPad 或其他設備開啟網址：
      http://192.168.1.100:3000
   ```
3. 拿起 iPad，打開 **Safari 瀏覽器**，在網址列輸入該網址（例如 `http://192.168.1.100:3000`）。
4. **設為全螢幕 App（推薦）**：
   - 點選 Safari 工具列右上角「分享」圖示 📤。
   - 選擇「加入主畫面 (Add to Home Screen)」➕。
   - 點選「新增」。
   - iPad 桌面上將生成 App 圖示，點開即可全螢幕無網址列沉浸式彈奏！

> **⚠️ 注意**：iOS / iPad Safari 若要啟用麥克風音頻聽音辨識，iOS 系統要求連線環境需為 `localhost` 或具備 `https://`。若透過區網 HTTP 連線，可使用「觸控琴鍵」或「USB-C 連接電鋼琴 (MIDI)」，若需麥克風請參考下方方式三部署至支援 HTTPS 之主機。

---

## ☁️ 方式三：免費部署到雲端主機（支援全球 CDN 與自動 HTTPS）

壓縮包內的 **`dist/`** 資料夾是完整的純靜態前端網站，可以直接發布至任何支援靜態託管的雲端平台：

### 1. Vercel（推薦，1 分鐘上線）：
1. 登入 [Vercel](https://vercel.com/)。
2. 點選「Add New Project」➔ 直接將 `dist` 資料夾拖曳至網頁中，或推送到 GitHub 後連結倉庫。
3. 立即獲得免費全球高速 CDN 與 HTTPS 專屬網址！

### 2. Netlify Drop：
1. 開啟 [Netlify Drop](https://app.netlify.com/drop)。
2. 將 `dist/` 資料夾整包拖曳進瀏覽器，數秒內即可上線！

### 3. Nginx / Apache 伺服器：
將 `dist/` 內的所有檔案複製到伺服器的網站根目錄（例如 `/var/www/html` 或 `/usr/share/nginx/html`），並在 Nginx 設定檔中加入 SPA 轉址規則：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 🎹 功能特色
- **分齡體系**：4歲、5歲、6歲、7歲兒童專屬循序漸進課程。
- **三重音高辨識**：支援麥克風聽琴、USB MIDI 電鋼琴直連、虛擬多點觸控琴鍵。
- **樂理與五線譜教學**：內建動態 SVG 高音譜、低音譜、中音譜、大譜表與時值對照。
- **平板優化**：吸附式側邊控制島、全螢幕切換、動態小狐狸伴奏與即時音階測試。

祝練琴愉快！🎶
