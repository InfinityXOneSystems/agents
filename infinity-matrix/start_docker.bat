@echo off
REM Docker startup script for Infinity-Matrix with Hostinger Integration
REM Usage: start_docker.bat [production|development|clean]

setlocal enabledelayedexpansion

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

REM Colors (Windows 10+)
set "RESET="
set "GREEN="
set "YELLOW="
set "RED="
set "BLUE="

REM Main logic
if "%1"=="" goto :show_help
if /i "%1"=="production" goto :start_production
if /i "%1"=="development" goto :start_development
if /i "%1"=="restart" goto :restart_services
if /i "%1"=="stop" goto :stop_all
if /i "%1"=="clean" goto :clean_all
if /i "%1"=="logs" goto :view_logs
if /i "%1"=="verify" goto :verify_installation
if /i "%1"=="help" goto :show_help
if /i "%1"=="--help" goto :show_help
if /i "%1"=="-h" goto :show_help

echo Unknown command: %1
goto :show_help

:check_prerequisites
echo.
echo ========================================
echo Checking Prerequisites
echo ========================================
echo.

docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    exit /b 1
)
echo [OK] Docker found
for /f "tokens=*" %%i in ('docker --version') do echo %%i

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    exit /b 1
)
echo [OK] Docker Compose found
for /f "tokens=*" %%i in ('docker-compose --version') do echo %%i

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop.
    exit /b 1
)
echo [OK] Docker daemon is running
goto :eof

:check_environment
echo.
echo ========================================
echo Checking Environment Configuration
echo ========================================
echo.

if not exist ".env" (
    echo [WARNING] .env file not found
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env >nul
        echo [OK] .env created. Please edit it with your Hostinger API key.
    ) else (
        echo [ERROR] .env.example not found
        exit /b 1
    )
) else (
    echo [OK] .env file exists
)

if not exist "credentials" (
    mkdir credentials
    echo [WARNING] credentials directory created. Add hostinger_creds.json if needed.
)
goto :eof

:check_ports
echo.
echo ========================================
echo Checking Port Availability
echo ========================================
echo.

setlocal enabledelayedexpansion
for %%p in (3000 3001 8000 11434) do (
    netstat -ano | findstr ":%%p" >nul 2>&1
    if errorlevel 1 (
        echo [OK] Port %%p is available
    ) else (
        echo [WARNING] Port %%p may be in use
    )
)
endlocal
goto :eof

:start_production
call :check_prerequisites
if errorlevel 1 exit /b 1

call :check_environment
if errorlevel 1 exit /b 1

call :check_ports

echo.
echo ========================================
echo Starting Production Environment
echo ========================================
echo.

echo Building images (this may take 2-3 minutes on first run)...
call docker-compose build
if errorlevel 1 (
    echo [ERROR] Docker build failed
    exit /b 1
)

echo.
echo ========================================
echo Starting Services
echo ========================================
echo.

call docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Docker compose up failed
    exit /b 1
)

echo Waiting for services to start...
timeout /t 10 /nobreak

echo.
echo ========================================
echo System Status
echo ========================================
echo.

call docker-compose ps

echo.
echo ========================================
echo Access Your System
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Hostinger Dashboard: http://localhost:3000/hostinger
echo API Health: http://localhost:3001/health
echo API Gateway: http://localhost:8000
echo Ollama: http://localhost:11434
echo.
echo [OK] Production environment started successfully!
echo.
echo View logs with: docker-compose logs -f
echo Stop with: docker-compose stop
goto :eof

:start_development
call :check_prerequisites
if errorlevel 1 exit /b 1

call :check_environment
if errorlevel 1 exit /b 1

call :check_ports

echo.
echo ========================================
echo Starting Development Environment
echo ========================================
echo.

echo Building images (this may take 2-3 minutes on first run)...
call docker-compose build
if errorlevel 1 (
    echo [ERROR] Docker build failed
    exit /b 1
)

echo.
echo ========================================
echo Starting Services with Hot-Reload
echo ========================================
echo.

call docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
goto :eof

:stop_all
echo.
echo ========================================
echo Stopping All Services
echo ========================================
echo.

call docker-compose stop

echo [OK] All services stopped
echo.
echo Start again with: start_docker.bat production
goto :eof

:clean_all
echo.
echo ========================================
echo WARNING: Complete Cleanup
echo ========================================
echo.
echo This will remove:
echo   - All containers
echo   - All stopped containers
echo   - Docker networks (but NOT images or data volumes)
echo.

set /p confirm="Continue? (y/n) "
if /i "!confirm!"=="y" (
    call docker-compose down
    echo [OK] Cleanup complete
    echo.
    echo To restore: start_docker.bat production
) else (
    echo [WARNING] Cleanup cancelled
)
goto :eof

:restart_services
echo.
echo ========================================
echo Restarting Services
echo ========================================
echo.

call docker-compose restart

timeout /t 5 /nobreak

echo.
echo ========================================
echo System Status
echo ========================================
echo.

call docker-compose ps

echo.
echo [OK] Services restarted
goto :eof

:view_logs
echo.
echo ========================================
echo Viewing Logs (Ctrl+C to stop)
echo ========================================
echo.

call docker-compose logs -f
goto :eof

:verify_installation
echo.
echo ========================================
echo Verifying Installation
echo ========================================
echo.

echo Testing connectivity...

REM Simple connectivity test (Windows)
timeout /t 2 /nobreak

echo [INFO] Status Check
call docker-compose ps
goto :eof

:show_help
echo.
echo Infinity-Matrix Docker Startup Script
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   production    Start production environment (background)
echo   development   Start development environment with hot-reload
echo   restart       Restart running services
echo   stop          Stop all services
echo   clean         Stop and remove all containers
echo   logs          View live logs
echo   verify        Verify services are running
echo   help          Show this help message
echo.
echo Examples:
echo   %0 production   # Start in production mode
echo   %0 development  # Start with hot-reload
echo   %0 logs         # View logs
echo.
endlocal
