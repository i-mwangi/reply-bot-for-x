@echo off
echo Starting Chrome with remote debugging...
echo.
echo This will open YOUR Chrome profile with all your logins.
echo The bot will connect to this Chrome instance.
echo.
echo DO NOT CLOSE THIS WINDOW!
echo.
pause

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\JUSTIN LORD\AppData\Local\Google\Chrome\User Data"
