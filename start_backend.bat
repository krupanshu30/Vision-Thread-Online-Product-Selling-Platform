@echo off
title Vision Thread Backend Server
cd /d "%~dp0backend"
echo ============================================================
echo   Starting Vision Thread Backend Server with MySQL...
echo ============================================================
echo.
node server.js
pause
