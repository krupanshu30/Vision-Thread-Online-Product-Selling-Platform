@echo off
title Vision Thread MySQL Database Setup
cd /d "%~dp0backend"
echo ============================================================
echo   Vision Thread - Automatic MySQL Database Setup
echo ============================================================
echo.
echo Step 1: Creating database and tables...
node scripts/setup-database.js
if %errorlevel% neq 0 (
  echo.
  echo Setup encountered an error. Please ensure your MySQL password is set in backend\.env
  pause
  exit /b %errorlevel%
)
echo.
echo Step 2: Creating secure website owner admin account...
node scripts/seed-admin.js
echo.
echo Step 3: Seeding default product catalog into MySQL...
node scripts/seed-products.js
echo.
echo Step 4: Seeding sample orders, custom requests and messages...
node scripts/seed-sample-data.js
echo.
echo ============================================================
echo   Setup completed successfully!
echo   Admin Panel: http://localhost:5000/admin
echo ============================================================
pause
