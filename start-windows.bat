@echo off
title NYA HR Central - 24/7 Office LAN Server
echo ===================================================
echo     National Youth Authority - Ghana
echo     NYA HR Central - Local LAN Server Engine
echo ===================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not detected on this machine!
    echo Please download and install Node.js (LTS version 20 or 22) from:
    echo https://nodejs.org
    echo.
    pause
    exit /b
)

:: Install packages if node_modules is missing
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
)

:: Build production assets if dist is missing
if not exist "dist\" (
    echo [2/3] Building production assets...
    call npm run build
)

echo [3/3] Starting NYA HR Central Server on LAN Port 3000...
echo.
echo ===================================================
echo Server is LIVE on your local network!
echo Staff on the same office Wi-Fi can open:
echo   http://localhost:3000
echo   (or use this computer's local IP, e.g. http://192.168.1.X:3000)
echo ===================================================
echo.
set NODE_ENV=production
set PORT=3000
node server.ts

pause
