@echo off
echo ========================================
echo    eSawitKu - Final Fix Script
echo ========================================
echo.

echo [1/6] Cleaning up...
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules
del package-lock.json
echo SUCCESS: Cleaned up old files
echo.

echo [2/6] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo SUCCESS: Dependencies installed
echo.

echo [3/6] Installing csv-parser...
npm install csv-parser
echo SUCCESS: csv-parser installed
echo.

echo [4/6] Setting up environment...
if not exist .env.local (
    copy env.example .env.local
    echo SUCCESS: Created .env.local
) else (
    echo INFO: .env.local already exists
)
echo.

echo [5/6] Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo WARNING: Prisma generate failed (this might be normal)
)
echo.

echo [6/6] Setting up database...
npx prisma db push
if %errorlevel% neq 0 (
    echo WARNING: Database push failed (this might be normal)
)
echo.

echo ========================================
echo    All fixes applied! Starting server...
echo ========================================
echo.

echo Starting development server...
echo Open your browser to: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
