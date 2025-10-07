@echo off
echo 🚀 eSawitKu Setup - Fixing Dependencies
echo ========================================

echo ℹ️  Installing missing dependencies...
npm install @next-auth/prisma-adapter

echo ℹ️  Installing all dependencies...
npm install

echo ℹ️  Generating Prisma client...
npx prisma generate

echo ℹ️  Setting up environment...
if not exist .env.local (
    copy env.example .env.local
    echo ✅ Created .env.local
)

echo ℹ️  Starting development server...
npm run dev

pause
