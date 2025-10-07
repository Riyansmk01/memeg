@echo off
REM eSawitKu Environment Setup Script for Windows

echo 🚀 Setting up eSawitKu Production Environment...

REM Create .env.local from template
if not exist .env.local (
    echo 📝 Creating .env.local from template...
    copy env.example .env.local
    echo ✅ .env.local created successfully!
) else (
    echo ⚠️  .env.local already exists. Skipping creation.
)

echo.
echo 🔧 Environment Configuration Complete!
echo.
echo 📋 Next Steps:
echo 1. Edit .env.local with your OAuth provider credentials
echo 2. Update database URLs if using external services
echo 3. Configure email SMTP settings
echo 4. Run: docker-compose up -d
echo.
echo 🔑 You need to configure these in .env.local:
echo - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
echo - GITHUB_ID and GITHUB_SECRET
echo - FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET
echo - SMTP_USER and SMTP_PASS for email
echo.
echo ⚠️  IMPORTANT: Keep your secrets secure!
pause
