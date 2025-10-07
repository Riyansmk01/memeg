@echo off
echo ========================================
echo    eSawitKu Setup - Fix Dependencies
echo ========================================
echo.

echo [1/5] Installing missing dependency...
npm install @next-auth/prisma-adapter
if %errorlevel% neq 0 (
    echo ERROR: Failed to install @next-auth/prisma-adapter
    pause
    exit /b 1
)
echo SUCCESS: @next-auth/prisma-adapter installed
echo.

echo [2/5] Installing all dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo SUCCESS: All dependencies installed
echo.

echo [3/5] Setting up environment file...
if not exist .env.local (
    copy env.example .env.local
    echo SUCCESS: Created .env.local
) else (
    echo INFO: .env.local already exists
)
echo.

echo [4/5] Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo WARNING: Prisma generate failed (this might be normal)
)
echo.

echo [5/5] Setting up database...
npx prisma db push
if %errorlevel% neq 0 (
    echo WARNING: Database push failed (this might be normal)
)
echo.

echo ========================================
echo    Setup Complete! Starting Server...
echo ========================================
echo.

echo Starting development server...
echo Open your browser to: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
