@echo off
title SAT Intelligent Learning System Launcher
echo ========================================================
echo   SAT INTELLIGENT LEARNING SYSTEM - CHUAN DIGITAL SAT
echo ========================================================
echo.
echo Dang khoi dong may chu hoc tap cuc bo (Local Server)...
echo.

cd /d "%~dp0"

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python da san sang. Khoi dong local server tai cong 8000...
    start "" http://localhost:8000/index.html
    python -m http.server 8000
) else (
    echo [CANH BAO] Khong tim thay Python. Dang mo truc tiep index.html qua trinh duyet...
    start "" "%~dp0index.html"
)

pause
