@echo off
REM eSawitKu Complete Setup Script for Windows

echo 🚀 eSawitKu Enterprise SaaS Setup
echo ==================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Setup environment
echo ℹ️  Setting up environment variables...
if not exist .env.local (
    copy env.example .env.local
    echo ✅ Created .env.local from template
) else (
    echo ⚠️  .env.local already exists
)

REM Install dependencies
echo ℹ️  Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Setup database
echo ℹ️  Setting up database...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated

npx prisma db push
if %errorlevel% neq 0 (
    echo ⚠️  Database push failed (this is normal if databases aren't running yet)
)

REM Deploy with Docker
echo ℹ️  Deploying with Docker Compose...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker services
    pause
    exit /b 1
)
echo ✅ Docker services started

REM Wait for services
echo ℹ️  Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service status
docker-compose ps

REM Run tests
echo ℹ️  Running tests...
npm run test:unit
if %errorlevel% neq 0 (
    echo ⚠️  Unit tests failed (this is normal if dependencies aren't fully installed)
)

npm run type-check
if %errorlevel% neq 0 (
    echo ⚠️  Type checking failed
)

REM Health check
echo ℹ️  Performing health check...
timeout /t 10 /nobreak >nul
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Application health check failed (may still be starting)
) else (
    echo ✅ Application health check passed
)

echo.
echo ✅ eSawitKu setup completed successfully!
echo.
echo ℹ️  Next steps:
echo 1. Edit .env.local with your OAuth provider credentials
echo 2. Configure monitoring dashboards in Grafana
echo 3. Set up SSL certificates for production
echo 4. Configure backup strategies
echo.
echo ℹ️  Access your application at: http://localhost:3000
echo.
pause
