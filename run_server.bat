@echo off
echo ========================================================
echo        Starting SpeedRubik Solution Timer Server
echo ========================================================
echo.

set PORT=8000

REM Try finding python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set PY_CMD=python
    goto start_server
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set PY_CMD=py
    goto start_server
)

if exist "C:\msys64\ucrt64\bin\python.exe" (
    set PY_CMD="C:\msys64\ucrt64\bin\python.exe"
    goto start_server
)

echo Python not found in PATH. Opening index.html directly in your default browser...
start "" "index.html"
exit /b 0

:start_server
echo Serving at: http://localhost:%PORT%
echo Press Ctrl+C in this console window to stop the server.
echo.
start "" "http://localhost:%PORT%"
%PY_CMD% -m http.server %PORT%
