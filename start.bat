@echo off
title Gradebook Startup
cd /d "%~dp0"

echo ============================================================
echo   GRADEBOOK - Electronic Journal Startup
echo ============================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Download from https://nodejs.org
    pause
    exit /b
)

echo [OK] Node.js found
echo.

:: Step 1: Server dependencies
echo ============================================================
echo   STEP 1: Installing server dependencies...
echo ============================================================
cd server
if not exist "node_modules" (
    call npm install
) else (
    echo [OK] Server dependencies already installed
)

:: Step 2: Database setup
echo.
echo ============================================================
echo   STEP 2: Setting up database...
echo ============================================================
if not exist "prisma\dev.db" (
    call npx prisma db push
    echo.
    echo Filling with test data...
    call npx tsx prisma/seed.ts
) else (
    echo [OK] Database already exists
)

:: Step 3: Uploads folder
echo.
echo ============================================================
echo   STEP 3: Creating uploads folder...
echo ============================================================
if not exist "uploads" mkdir uploads
echo [OK] Uploads folder ready

cd ..

:: Step 4: Client dependencies
echo.
echo ============================================================
echo   STEP 4: Installing client dependencies...
echo ============================================================
cd client
if not exist "node_modules" (
    call npm install
) else (
    echo [OK] Client dependencies already installed
)
cd ..

echo.
echo ============================================================
echo   STEP 5: Starting server and client...
echo ============================================================

:: Start server
start "Gradebook Server" cmd /c "cd /d "%~dp0server" && npx tsx src/index.ts"

:: Wait
timeout /t 4 /nobreak >nul

:: Start client
start "Gradebook Client" cmd /c "cd /d "%~dp0client" && npx vite --host"

timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo   PROJECT STARTED!
echo ============================================================
echo.
echo   Open in browser: http://localhost:5173
echo   API Server:      http://localhost:3001
echo.
echo   Test accounts:
echo   Teacher:  teacher@mail.ru / 123456
echo   Student1: student1@mail.ru / 123456
echo   Student2: student2@mail.ru / 123456
echo.
echo   Close server/client windows to stop
echo ============================================================
echo.
pause