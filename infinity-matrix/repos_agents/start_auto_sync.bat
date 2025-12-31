@echo off
REM Auto-Sync Service Launcher
REM Automatically starts the auto-sync service and keeps it running

echo Starting Auto-Sync Service...
cd /d "%~dp0..\..\agents"

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Start the auto-sync service
node src/services/auto-sync.ts

pause