#!/bin/bash
# eSawitKu Environment Setup Script

echo "🚀 Setting up eSawitKu Production Environment..."

# Create .env.local from template
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ .env.local created successfully!"
else
    echo "⚠️  .env.local already exists. Skipping creation."
fi

# Generate secure secrets
echo "🔐 Generating secure secrets..."

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "NEXTAUTH_SECRET generated: ${NEXTAUTH_SECRET:0:20}..."

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "ENCRYPTION_KEY generated: ${ENCRYPTION_KEY:0:20}..."

# Generate Redis password
REDIS_PASSWORD=$(openssl rand -hex 16 2>/dev/null || node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
echo "REDIS_PASSWORD generated: ${REDIS_PASSWORD:0:20}..."

echo ""
echo "🔧 Environment Configuration Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env.local with your OAuth provider credentials"
echo "2. Update database URLs if using external services"
echo "3. Configure email SMTP settings"
echo "4. Run: docker-compose up -d"
echo ""
echo "🔑 Generated Secrets:"
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}"
echo "ENCRYPTION_KEY: ${ENCRYPTION_KEY}"
echo "REDIS_PASSWORD: ${REDIS_PASSWORD}"
echo ""
echo "⚠️  IMPORTANT: Save these secrets securely!"
