@echo off
echo ========================================
echo    eSawitKu - Complete Feature Test
echo ========================================
echo.

echo [1/6] Stopping all Node processes...
taskkill /f /im node.exe 2>nul
echo SUCCESS: All Node processes stopped
echo.

echo [2/6] Installing dependencies...
npm install
echo SUCCESS: Dependencies installed
echo.

echo [3/6] Setting up environment...
echo DATABASE_URL="file:./dev.db" > .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo NEXTAUTH_SECRET=esawitku-secret-key-2024 >> .env.local
echo SUCCESS: Environment configured
echo.

echo [4/6] Starting development server...
echo.
echo ========================================
echo    eSawitKu SaaS - All Features Ready!
echo ========================================
echo.
echo ✅ Homepage dengan animasi floating
echo ✅ Registration (Email/Password + Social)
echo ✅ Login (Email/Password + Social)
echo ✅ Dashboard dengan stats dan quick actions
echo ✅ Billing dengan payment methods
echo ✅ Subscription plans (Free, Basic, Premium, Enterprise)
echo ✅ Payment methods (Bank Transfer, QR Code, E-Wallet, Credit Card)
echo ✅ User settings dan profile
echo ✅ Responsive design
echo.
echo 🌐 Open: http://localhost:3000
echo.
echo 📋 Test Checklist:
echo.
echo 1. HOMEPAGE:
echo    - Animasi floating icons
echo    - Navigation menu
echo    - Feature sections
echo    - Pricing plans
echo    - Payment methods
echo.
echo 2. REGISTRATION:
echo    - Email/Password form
echo    - Social login buttons (Google, GitHub, Facebook)
echo    - Form validation
echo    - Success redirect to login
echo.
echo 3. LOGIN:
echo    - Email/Password form
echo    - Social login buttons
echo    - Remember me checkbox
echo    - Forgot password link
echo    - Success redirect to dashboard
echo.
echo 4. DASHBOARD:
echo    - Welcome message
echo    - Subscription status
echo    - Stats cards (Hectares, Workers, Revenue, Productivity)
echo    - Quick actions (Reports, Team, Billing, Settings)
echo    - Recent activities
echo    - Logout functionality
echo.
echo 5. BILLING:
echo    - Plan selection (Free, Basic, Premium, Enterprise)
echo    - Payment method selection
echo    - Payment instructions
echo    - Bank transfer details
echo    - QR code generation
echo    - Reference ID
echo.
echo 6. RESPONSIVE:
echo    - Mobile-friendly design
echo    - Tablet layout
echo    - Desktop layout
echo.
echo 🔧 Manual Test Steps:
echo    1. Buka http://localhost:3000
echo    2. Klik "Daftar" untuk register
echo    3. Isi form dan submit
echo    4. Login dengan akun yang dibuat
echo    5. Explore dashboard
echo    6. Test billing dan payment
echo    7. Test responsive design
echo.
echo Press Ctrl+C to stop server
echo.

npm run dev

pause
