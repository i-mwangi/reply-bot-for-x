@echo off
echo ========================================
echo Setting up bot profile (ONE TIME SETUP)
echo ========================================
echo.
echo This will copy your Profile 12 to a bot-controlled profile
echo.

echo Closing all Chrome...
taskkill /F /IM chrome.exe 2>nul
timeout /t 3 /nobreak >nul

echo.
echo Copying Profile 12... (this takes 1-2 minutes)
echo.

rmdir /s /q "C:\ReplyX\my-twitter-profile" 2>nul
xcopy "C:\Users\JUSTIN LORD\AppData\Local\Google\Chrome\User Data\Profile 12" "C:\ReplyX\my-twitter-profile\Default" /E /I /H /Y /Q

echo.
echo ✅ Profile copied!
echo.
echo Now run: RUN-BOT-FINAL.bat
echo.
pause
