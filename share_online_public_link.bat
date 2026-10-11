@echo off
title Vision Thread - Create Public Shareable Link
cd /d "%~dp0"

echo ============================================================
echo   Creating Free Public Worldwide Link for Vision Thread...
echo ============================================================
echo.
echo Make sure your backend server is running first!
echo Generating public HTTPS link via localtunnel...
echo.
npx -y localtunnel --port 5000
pause
