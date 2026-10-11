@echo off
title Vision Thread - Run All (Backend + Frontend)
cd /d "%~dp0"

echo ============================================================
echo   Starting Vision Thread Full-Stack Application...
echo ============================================================
echo.

echo 1. Starting Backend Server (Port 5000)...
start "Vision Thread Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

echo 2. Waiting 2 seconds for backend to start...
timeout /t 2 /nobreak >nul

echo 3. Opening Frontend Store Website in your browser...
start "" "http://localhost:5000"

echo 4. Opening Admin Panel in your browser...
start "" "http://localhost:5000/admin"

echo.
echo ============================================================
echo   Application is now running!
echo ============================================================
echo   Website (This PC):     http://localhost:5000
echo   Website (All Devices): http://192.168.1.104:5000
echo   Admin Panel:           http://localhost:5000/admin
echo   Admin (All Devices):   http://192.168.1.104:5000/admin
echo.
echo   Admin Login Credentials:
echo   - Email / Username:    admin@visionthread.in (or visionthread_admin)
echo   - Password:            Admin@123
echo ============================================================
echo.
pause
