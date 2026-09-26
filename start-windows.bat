@echo off
chcp 65001 >nul
echo ====================================================
echo   KaiQuest 兒童鋼琴冒險 - Windows 快速啟動程式
echo ====================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [提示] 未檢測到 Node.js 環境。
    echo 請先安裝 Node.js (https://nodejs.org/)，或直接將 dist 資料夾上傳至 Vercel/Netlify。
    echo.
    pause
    exit /b
)

echo 正在啟動伺服器...
start "" http://localhost:3000
node server.js
pause
