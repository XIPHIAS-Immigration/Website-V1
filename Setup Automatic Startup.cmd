@echo off
title XIPHIAS Immigration Automatic Startup Setup

net session >nul 2>&1
if not "%ERRORLEVEL%"=="0" (
  powershell.exe -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-production-task.ps1" -StartNow
set "SETUP_EXIT=%ERRORLEVEL%"

echo.
if not "%SETUP_EXIT%"=="0" (
  echo Automatic startup setup failed. Review the error shown above.
) else (
  echo Automatic startup is configured successfully.
)
echo.
pause
exit /b %SETUP_EXIT%
