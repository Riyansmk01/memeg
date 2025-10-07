@echo off
echo ========================================
echo    eSawitKu - Prisma Fix Script
echo ========================================
echo.

echo [1/4] Updating environment file...
echo DATABASE_URL="file:./dev.db" > .env.local
echo DATABASE_PROVIDER="sqlite" >> .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo NEXTAUTH_SECRET=your-secret-key-here >> .env.local
echo GOOGLE_CLIENT_ID=your-google-client-id >> .env.local
echo GOOGLE_CLIENT_SECRET=your-google-client-secret >> .env.local
echo GITHUB_ID=your-github-client-id >> .env.local
echo GITHUB_SECRET=your-github-client-secret >> .env.local
echo FACEBOOK_CLIENT_ID=your-facebook-app-id >> .env.local
echo FACEBOOK_CLIENT_SECRET=your-facebook-app-secret >> .env.local
echo SUCCESS: Environment file updated
echo.

echo [2/4] Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed
    pause
    exit /b 1
)
echo SUCCESS: Prisma client generated
echo.

echo [3/4] Creating database...
npx prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Database push failed
    pause
    exit /b 1
)
echo SUCCESS: Database created
echo.

echo [4/4] Starting development server...
echo.
echo ========================================
echo    eSawitKu is ready!
echo    Open: http://localhost:3000
echo ========================================
echo.

npm run dev

pause
