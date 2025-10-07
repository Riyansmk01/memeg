#!/bin/bash

# Git Hooks for eSawitKu
# This script sets up pre-commit and pre-push hooks

echo "🔧 Setting up Git hooks for eSawitKu..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Running pre-commit checks..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json|css|md)$')

if [ -z "$STAGED_FILES" ]; then
    echo "✅ No relevant files staged"
    exit 0
fi

echo "📁 Staged files: $STAGED_FILES"

# Run ESLint on staged files
echo "🔍 Running ESLint..."
npx eslint $STAGED_FILES
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed. Please fix the issues before committing."
    exit 1
fi

# Run Prettier check on staged files
echo "🎨 Running Prettier check..."
npx prettier --check $STAGED_FILES
if [ $? -ne 0 ]; then
    echo "❌ Prettier check failed. Please format the files before committing."
    echo "💡 Run: npx prettier --write $STAGED_FILES"
    exit 1
fi

# Run TypeScript check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript check failed. Please fix the type errors before committing."
    exit 1
fi

# Check for sensitive data
echo "🔒 Checking for sensitive data..."
SENSITIVE_PATTERNS=(
    "password"
    "secret"
    "api_key"
    "private_key"
    "access_token"
    "refresh_token"
    "database_url"
    "mongodb_url"
    "redis_url"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -r -i "$pattern" $STAGED_FILES | grep -v "\.env\.example" | grep -v "setup-git-hooks.sh"; then
        echo "❌ Sensitive data detected: $pattern"
        echo "💡 Please remove sensitive data or add to .gitignore"
        exit 1
    fi
done

# Check file sizes
echo "📏 Checking file sizes..."
for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$SIZE" -gt 1048576 ]; then
            echo "❌ File $file is too large ($SIZE bytes). Maximum size is 1MB."
            exit 1
        fi
    fi
done

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    echo "❌ Security audit failed. Please fix the vulnerabilities before committing."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0
EOF

# Pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🚀 Running pre-push checks..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get the remote and branch
REMOTE="$1"
BRANCH="$2"

echo "📡 Pushing to $REMOTE/$BRANCH"

# Run tests
echo "🧪 Running tests..."
npm run test:unit
if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed. Please fix the tests before pushing."
    exit 1
fi

# Run build
echo "🏗️ Running build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the build errors before pushing."
    exit 1
fi

# Check for TODO/FIXME comments
echo "📝 Checking for TODO/FIXME comments..."
if git diff --cached --name-only | xargs grep -l "TODO\|FIXME" 2>/dev/null; then
    echo "⚠️ TODO/FIXME comments found. Consider addressing them before pushing."
    echo "💡 Files with TODO/FIXME:"
    git diff --cached --name-only | xargs grep -l "TODO\|FIXME" 2>/dev/null
fi

# Check commit message format
echo "📝 Checking commit messages..."
git log --oneline -10 | while read commit; do
    if ! echo "$commit" | grep -E "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}"; then
        echo "❌ Invalid commit message format: $commit"
        echo "💡 Use format: type(scope): description"
        echo "💡 Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
        exit 1
    fi
done

echo "✅ All pre-push checks passed!"
exit 0
EOF

# Commit-msg hook
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# Commit message validation
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

echo "📝 Validating commit message..."

# Check commit message format
if ! echo "$COMMIT_MSG" | grep -E "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}"; then
    echo "❌ Invalid commit message format!"
    echo "💡 Use format: type(scope): description"
    echo "💡 Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo "💡 Example: feat(auth): add OAuth2 login support"
    exit 1
fi

# Check message length
if [ ${#COMMIT_MSG} -gt 100 ]; then
    echo "❌ Commit message is too long (${#COMMIT_MSG} characters). Maximum is 100."
    exit 1
fi

echo "✅ Commit message is valid!"
exit 0
EOF

# Post-commit hook
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

echo "🎉 Commit successful!"

# Update package version if this is a version commit
if git log -1 --pretty=%B | grep -E "^(feat|fix|perf|revert)"; then
    echo "📦 Updating package version..."
    npm version patch --no-git-tag-version
    echo "✅ Version updated"
fi

# Log commit to audit
echo "$(date): $(git log -1 --pretty=%B)" >> .git/audit.log

echo "✅ Post-commit tasks completed!"
EOF

# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/post-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "📋 Installed hooks:"
echo "  🔍 pre-commit  - Runs linting, formatting, and security checks"
echo "  🚀 pre-push    - Runs tests and build before pushing"
echo "  📝 commit-msg  - Validates commit message format"
echo "  🎉 post-commit - Updates version and logs commits"
echo ""
echo "💡 To bypass hooks (not recommended):"
echo "  git commit --no-verify"
echo "  git push --no-verify"
echo ""
echo "🔧 To uninstall hooks:"
echo "  rm .git/hooks/pre-commit .git/hooks/pre-push .git/hooks/commit-msg .git/hooks/post-commit"
