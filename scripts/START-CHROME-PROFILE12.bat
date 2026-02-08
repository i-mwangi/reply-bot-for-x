@echo off
echo ========================================
echo Starting YOUR Chrome Profile 12
echo ========================================
echo.
echo Closing all Chrome instances first...
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Chrome with remote debugging...
echo.
echo DO NOT CLOSE THIS WINDOW!
echo.

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\JUSTIN LORD\AppData\Local\Google\Chrome\User Data" --profile-directory="Profile 12"
