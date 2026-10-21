@echo off
title BinmarDrive Launcher
echo ==============================================
echo        Starting BinmarDrive Application
echo ==============================================
echo.

echo [1/2] Starting Backend API on http://127.0.0.1:5005 ...
start "BinmarDrive Backend (Port 5005)" cmd /k "node backend/server.js"

echo [2/2] Starting Frontend on http://127.0.0.1:5173 ...
start "BinmarDrive Frontend (Port 5173)" cmd /k "npm.cmd --prefix frontend run dev"

timeout /t 3 >nul
echo.
echo Opening http://127.0.0.1:5173 in browser...
start http://127.0.0.1:5173

echo Done! Both servers are now running in separate windows.
pause
