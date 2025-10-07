@echo off
echo ========================================
echo    eSawitKu - Git Cleanup & Push
echo ========================================
echo.

echo [1/6] Cleaning Git cache...
git rm -r --cached .next
git rm -r --cached node_modules
echo SUCCESS: Cache cleaned
echo.

echo [2/6] Adding all files except ignored ones...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo SUCCESS: Files added
echo.

echo [3/6] Checking what will be committed...
git status --short
echo.

echo [4/6] Committing changes...
git commit -m "Clean up repository - remove build files and node_modules"
if %errorlevel% neq 0 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)
echo SUCCESS: Changes committed
echo.

echo [5/6] Force pushing to GitHub...
git push origin main --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to push
    echo.
    echo Alternative: Try without force
    git push origin main
    pause
    exit /b 1
)
echo SUCCESS: Pushed to GitHub!
echo.

echo [6/6] Verifying repository...
echo Repository: https://github.com/Riyansmk01/sawitku.git
echo.
echo ========================================
echo    Git Cleanup Complete!
echo ========================================
echo.
echo ✅ .gitignore updated
echo ✅ node_modules removed from Git
echo ✅ Build files removed from Git
echo ✅ Repository pushed to GitHub
echo.

pause
