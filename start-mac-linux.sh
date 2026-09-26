#!/usr/bin/env bash
echo "===================================================="
echo "  KaiQuest 兒童鋼琴冒險 - macOS / Linux 快速啟動程式"
echo "===================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[提示] 未檢測到 Node.js 環境。"
    echo "請至 https://nodejs.org/ 安裝 Node.js，或直接使用任何 HTTP 靜態伺服器指向 dist 目錄。"
    exit 1
fi

echo "正在啟動伺服器並開啟瀏覽器..."
(sleep 1 && (open http://localhost:3000 || xdg-open http://localhost:3000 || sensible-browser http://localhost:3000) 2>/dev/null) &
node server.js
