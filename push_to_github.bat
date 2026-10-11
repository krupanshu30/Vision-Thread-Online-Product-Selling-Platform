@echo off
title Push Vision Thread to GitHub
color 0B
echo.
echo ================================================================
echo      VISION THREAD - PUSH TO GITHUB & DEPLOY TO VERCEL
echo ================================================================
echo.
echo Repo: https://github.com/krupanshu30/Vision-Thread-Online-Product-Selling-Platform.git
echo.
echo Pushing local branch 'main' to GitHub origin...
echo (If a browser window opens, please click 'Sign in' / 'Authorize')
echo.

git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo  [SUCCESS] Pushed to GitHub successfully!
    echo ================================================================
    echo.
    echo  Your GitHub Repository:
    echo  https://github.com/krupanshu30/Vision-Thread-Online-Product-Selling-Platform
    echo.
    echo  Opening Vercel import page now...
    start https://vercel.com/new/import?s=https://github.com/krupanshu30/Vision-Thread-Online-Product-Selling-Platform
    echo.
) else (
    echo.
    echo ================================================================
    echo  [NOTICE] If GitHub asked for a password or token:
    echo ================================================================
    echo  GitHub requires a Personal Access Token instead of your password.
    echo.
    echo  1. Create a token at: https://github.com/settings/tokens/new
    echo     - Expiration: 90 days
    echo     - Scopes: check [x] repo
    echo     - Click 'Generate token'
    echo.
    echo  2. Then run this command:
    echo     git push https://YOUR_TOKEN@github.com/krupanshu30/Vision-Thread-Online-Product-Selling-Platform.git main --force
    echo.
    pause
    exit /b 1
)

echo.
pause
