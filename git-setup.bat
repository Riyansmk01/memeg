@echo off
echo ========================================
echo    eSawitKu - Git Setup Automation
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Adding .gitignore to Git...
git add .gitignore
if %errorlevel% neq 0 (
    echo ERROR: Failed to add .gitignore
    pause
    exit /b 1
)
echo SUCCESS: .gitignore added to Git
echo.

echo [3/5] Committing changes...
git commit -m "Update .gitignore for Next.js and backend"
if %errorlevel% neq 0 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)
echo SUCCESS: Changes committed
echo.

echo [4/5] Adding remote repository...
git remote add origin https://github.com/Riyansmk01/sawitku.git
if %errorlevel% neq 0 (
    echo INFO: Remote might already exist, checking...
    git remote -v
) else (
    echo SUCCESS: Remote added
)
echo.

echo [5/5] Pushing to GitHub...
git push origin main --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to GitHub
    echo.
    echo Manual steps:
    echo 1. Check if you have GitHub access
    echo 2. Verify repository exists: https://github.com/Riyansmk01/sawitku.git
    echo 3. Try: git push origin main
    pause
    exit /b 1
)
echo SUCCESS: Pushed to GitHub!
echo.

echo ========================================
echo    Git Setup Complete!
echo ========================================
echo.
echo Repository: https://github.com/Riyansmk01/sawitku.git
echo.
echo Next steps:
echo 1. Verify files on GitHub
echo 2. Continue development
echo 3. Regular commits and pushes
echo.

pause
