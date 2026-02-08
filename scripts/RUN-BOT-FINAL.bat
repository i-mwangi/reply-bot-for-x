@echo off
echo ========================================
echo Twitter AI Bot - FINAL VERSION
echo ========================================
echo.

echo Closing all Chrome...
taskkill /F /IM chrome.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Starting Chrome with YOUR copied profile...
echo.

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9444 --user-data-dir="C:\ReplyX\my-twitter-profile"

echo Waiting 10 seconds for Chrome...
timeout /t 10 /nobreak >nul

echo.
echo Starting bot...
echo.

node bot-final.js

pause
