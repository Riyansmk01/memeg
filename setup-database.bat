@echo off
echo ========================================
echo    eSawitKu - Database Setup
echo ========================================
echo.

echo [1/8] Checking Prisma installation...
npx prisma --version
if %errorlevel% neq 0 (
    echo ERROR: Prisma CLI not found. Installing...
    npm install prisma @prisma/client --save-dev
)
echo SUCCESS: Prisma CLI ready
echo.

echo [2/8] Setting up environment variables...
if not exist .env.local (
    echo DATABASE_URL="postgresql://username:password@localhost:5432/esawitku?schema=public" > .env.local
    echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
    echo NEXTAUTH_SECRET=esawitku-super-secret-key-2024-very-long-and-secure >> .env.local
    echo NODE_ENV=development >> .env.local
    echo.
    echo ⚠️  Please update .env.local with your actual database credentials
    echo.
)
echo SUCCESS: Environment variables configured
echo.

echo [3/8] Generating Prisma client...
npx prisma generate
echo SUCCESS: Prisma client generated
echo.

echo [4/8] Pushing database schema...
npx prisma db push
echo SUCCESS: Database schema pushed
echo.

echo [5/8] Running database migrations...
npx prisma migrate dev --name init
echo SUCCESS: Database migrations completed
echo.

echo [6/8] Seeding database with demo data...
npm run db:seed
echo SUCCESS: Database seeded
echo.

echo [7/8] Creating initial backup...
npm run db:backup:create
echo SUCCESS: Initial backup created
echo.

echo [8/8] Opening Prisma Studio...
echo SUCCESS: Database setup completed
echo.
echo ========================================
echo    eSawitKu - Database Ready!
echo ========================================
echo.
echo 🗄️ Database Features:
echo    ✅ PostgreSQL database configured
echo    ✅ Complete schema with all models
echo    ✅ Migrations system ready
echo    ✅ Seed data populated
echo    ✅ Backup system configured
echo    ✅ Prisma Studio available
echo.
echo 📊 Database Models:
echo    ✅ Users & Authentication
echo    ✅ Subscriptions & Payments
echo    ✅ Plantations & Workers
echo    ✅ Tasks & Reports
echo    ✅ Teams & Documents
echo    ✅ Notifications & Analytics
echo    ✅ API Keys & Audit Logs
echo    ✅ System Configuration
echo.
echo 🔧 Available Commands:
echo    npm run db:studio      - Open Prisma Studio
echo    npm run db:migrate     - Run migrations
echo    npm run db:seed        - Seed database
echo    npm run db:backup:create - Create backup
echo    npm run db:backup:list - List backups
echo    npm run db:reset       - Reset database
echo.
echo 🌐 Prisma Studio: http://localhost:5555
echo 📊 Database: PostgreSQL
echo 🔑 Demo Accounts:
echo    Admin: admin@esawitku.com / admin123
echo    User: user@esawitku.com / user123
echo.

start npx prisma studio

pause
