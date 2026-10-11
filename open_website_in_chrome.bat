@echo off
echo Opening Vision Thread in Google Chrome...
start chrome "http://localhost:5000"
if %errorlevel% neq 0 (
    start "" "http://localhost:5000"
)
exit
