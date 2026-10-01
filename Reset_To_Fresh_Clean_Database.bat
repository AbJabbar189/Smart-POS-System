@echo off
title Smart POS - Reset to Clean Database
cd /d "%~dp0"

echo ========================================================
echo          SMART POS SYSTEM - DATA CLEANER
echo ========================================================
echo.
echo Is tool se aap ka tamam test data saf ho jayega aur software
echo bilkul fresh shuru hoga.
echo.
echo Pehle safety backup banta hai ta ke koi record zaya na ho.
echo.
set /p confirm="Kia aap waqai test data saf karna chahte hain? (y/n): "

if /i not "%confirm%"=="y" (
    echo.
    echo Operation cancelled.
    pause
    exit
)

echo.
echo Closing POS application...
taskkill /f /im Smart_POS.exe >nul 2>&1

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set YYYY=%dt:~0,4%
set MM=%dt:~4,2%
set DD=%dt:~6,2%
set HH=%dt:~8,2%
set Min=%dt:~10,2%

mkdir "daily_backups\pre_reset_safety" >nul 2>&1
if exist "pos.db" (
    copy /y "pos.db" "daily_backups\pre_reset_safety\Safety_Backup_Before_Clean_%YYYY%-%MM%-%DD%_%HH%-%Min%.db" >nul
    del /f /q "pos.db" >nul
)

echo.
echo ========================================================
echo [SUCCESS] Database saf ho gaya hai!
echo Ab jab aap Smart POS chalayenge to software bilkul fresh
echo aur clean shuru hoga!
echo.
echo Login Details:
echo Username: admin
echo Password: admin123
echo ========================================================
echo.
pause
exit
