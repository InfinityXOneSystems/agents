@echo off
REM Monitor Model Pull Progress
echo ================================================================
echo   ANALYTICS MODELS - PULL MONITOR
echo ================================================================
echo.

:loop
cls
echo ================================================================
echo   MONITORING MODEL PULL PROGRESS
echo ================================================================
echo.

REM Check log file
if exist C:\AI\logs\model_pull.log (
    echo Latest Activity:
    echo ----------------------------------------------------------------
    powershell -Command "Get-Content C:\AI\logs\model_pull.log -Tail 5"
    echo.
)

REM Check status
if exist C:\AI\logs\model_pull_status.json (
    echo Status:
    echo ----------------------------------------------------------------
    type C:\AI\logs\model_pull_status.json
    echo.
)

REM List installed models
echo Currently Installed:
echo ----------------------------------------------------------------
ollama list
echo.

echo ================================================================
echo Press Ctrl+C to stop monitoring
echo Refreshing in 10 seconds...
echo ================================================================
timeout /t 10 >nul
goto loop
