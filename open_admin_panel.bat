@echo off
title Vision Thread - Admin Panel
cd /d "%~dp0backend"

echo ============================================================
echo   Starting Vision Thread Backend ^& Admin Panel...
echo ============================================================
echo.

:: Start backend in a separate window
start "Vision Thread Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

echo Waiting 2 seconds for server to initialize...
timeout /t 2 /nobreak >nul

echo Opening Admin Panel in your browser...
start "" "http://localhost:5000/admin"

echo.
echo ============================================================
echo   Admin Panel is ready!
echo   URL:      http://localhost:5000/admin
echo   Email:    admin@visionthread.in (or username: admin)
echo   Password: Admin@123
echo ============================================================
echo.
timeout /t 5 >nul
