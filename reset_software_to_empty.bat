@echo off
title Reset Software To Empty (Factory Reset)
cd /d "%~dp0"
echo =========================================================
echo    SMART POS - RESET TO EMPTY (CLEAN DATABASE)
echo =========================================================
echo.
echo WARNING: This will clear test products, sales, and khata
echo so you can have a fresh clean software.
echo (A safety backup of current data will be saved automatically).
echo.
pause
python reset_database_clean.py
echo.
echo Done! Database has been reset.
echo.
pause
