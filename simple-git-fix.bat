@echo off
echo ========================================
echo    eSawitKu - Simple Git Fix
echo ========================================
echo.

echo Current Git status:
git status --short
echo.

echo Adding .gitignore only:
git add .gitignore
echo.

echo Committing .gitignore:
git commit -m "Update .gitignore for Next.js and backend"
echo.

echo Checking remote:
git remote -v
echo.

echo Pushing to GitHub:
git push origin main
echo.

echo ========================================
echo    Done! Check GitHub repository
echo ========================================
echo.
echo Repository: https://github.com/Riyansmk01/sawitku.git
echo.

pause
