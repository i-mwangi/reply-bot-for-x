@echo off
echo ========================================
echo Twitter AI Bot - EASY MODE
echo ========================================
echo.
echo Closing all Chrome instances...
taskkill /F /IM chrome.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Starting YOUR Chrome Profile 12 with debugging...
echo.

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\JUSTIN LORD\AppData\Local\Google\Chrome\User Data" --profile-directory="Profile 12"

echo Waiting 8 seconds for Chrome to fully start...
timeout /t 8 /nobreak >nul

echo.
echo Starting the bot...
echo.

node bot-final.js

pause
