@echo off
REM Hostinger Integration - Quick Setup Script
REM Use this from C:\AI\infinity-matrix directory

echo ========================================
echo Hostinger Integration Quick Setup
echo ========================================
echo.

REM Change to the correct directory
cd /d C:\AI.worktrees\worktree-2025-12-31T05-31-01

echo Step 1: Validating integration...
python infinity-matrix\ai_stack\hostinger\validate_integration.py
if %errorlevel% neq 0 (
    echo ERROR: Validation failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Testing Hostinger API connection...
python -m infinity-matrix.ai_stack.hostinger.hostinger_cli health
if %errorlevel% neq 0 (
    echo WARNING: API connection test failed. Check your token in:
    echo C:\AI\credentials\hostinger\api_token.json
    echo.
    echo You can still proceed, but API operations won't work until the token is valid.
    pause
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now use the following commands:
echo.
echo From C:\AI.worktrees\worktree-2025-12-31T05-31-01:
echo   python -m infinity-matrix.ai_stack.hostinger.hostinger_cli domains list
echo   python -m infinity-matrix.ai_stack.hostinger.hostinger_cli health
echo   python infinity-matrix\ai_stack\autonomous_controller.py
echo.
echo Or use the shortcuts below...
echo.
pause

:menu
cls
echo ========================================
echo Hostinger Quick Actions
echo ========================================
echo.
echo 1. Health Check
echo 2. List Domains
echo 3. List VPS
echo 4. Backup All Data
echo 5. Launch Autonomous Controller
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    python -m infinity-matrix.ai_stack.hostinger.hostinger_cli health
    pause
    goto menu
)
if "%choice%"=="2" (
    python -m infinity-matrix.ai_stack.hostinger.hostinger_cli domains list
    pause
    goto menu
)
if "%choice%"=="3" (
    python -m infinity-matrix.ai_stack.hostinger.hostinger_cli vps list
    pause
    goto menu
)
if "%choice%"=="4" (
    python -m infinity-matrix.ai_stack.hostinger.hostinger_cli backup
    pause
    goto menu
)
if "%choice%"=="5" (
    python infinity-matrix\ai_stack\autonomous_controller.py
    goto menu
)
if "%choice%"=="6" (
    exit /b 0
)

echo Invalid choice!
pause
goto menu
