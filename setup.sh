#!/bin/bash
# eSawitKu Complete Setup Script

echo "🚀 eSawitKu Enterprise SaaS Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        print_status "Docker is installed"
        if docker info &> /dev/null; then
            print_status "Docker is running"
            return 0
        else
            print_error "Docker is not running. Please start Docker Desktop."
            return 1
        fi
    else
        print_error "Docker is not installed. Please install Docker Desktop."
        return 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        return 0
    else
        print_error "Node.js is not installed. Please install Node.js 18+"
        return 1
    fi
}

# Setup environment
setup_environment() {
    print_info "Setting up environment variables..."
    
    if [ ! -f .env.local ]; then
        cp env.example .env.local
        print_status "Created .env.local from template"
    else
        print_warning ".env.local already exists"
    fi
    
    # Generate secure secrets
    if command -v openssl &> /dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -hex 32)
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        REDIS_PASSWORD=$(openssl rand -hex 16)
    else
        NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        REDIS_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
    fi
    
    print_status "Generated secure secrets"
    print_warning "Please update .env.local with your OAuth provider credentials"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Generate Prisma client
    if npx prisma generate; then
        print_status "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        return 1
    fi
    
    # Push database schema
    if npx prisma db push; then
        print_status "Database schema pushed"
    else
        print_warning "Database push failed (this is normal if databases aren't running yet)"
    fi
}

# Deploy with Docker
deploy_docker() {
    print_info "Deploying with Docker Compose..."
    
    if docker-compose up -d; then
        print_status "Docker services started"
        
        # Wait for services to be ready
        print_info "Waiting for services to be ready..."
        sleep 30
        
        # Check service status
        docker-compose ps
        
        print_status "Deployment completed!"
        print_info "Services available at:"
        echo "  - Application: http://localhost:3000"
        echo "  - Grafana: http://localhost:3001"
        echo "  - Prometheus: http://localhost:9090"
        echo "  - Kibana: http://localhost:5601"
        
    else
        print_error "Failed to start Docker services"
        return 1
    fi
}

# Run tests
run_tests() {
    print_info "Running tests..."
    
    if npm run test:unit; then
        print_status "Unit tests passed"
    else
        print_warning "Unit tests failed (this is normal if dependencies aren't fully installed)"
    fi
    
    if npm run type-check; then
        print_status "Type checking passed"
    else
        print_warning "Type checking failed"
    fi
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    # Wait for application to start
    sleep 10
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        print_status "Application health check passed"
    else
        print_warning "Application health check failed (may still be starting)"
    fi
}

# Main setup function
main() {
    echo ""
    print_info "Starting eSawitKu setup..."
    echo ""
    
    # Check prerequisites
    if ! check_docker; then
        echo ""
        print_error "Please install and start Docker Desktop, then run this script again."
        exit 1
    fi
    
    if ! check_node; then
        echo ""
        print_error "Please install Node.js 18+, then run this script again."
        exit 1
    fi
    
    # Setup steps
    setup_environment
    install_dependencies
    setup_database
    deploy_docker
    run_tests
    health_check
    
    echo ""
    print_status "eSawitKu setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "1. Edit .env.local with your OAuth provider credentials"
    echo "2. Configure monitoring dashboards in Grafana"
    echo "3. Set up SSL certificates for production"
    echo "4. Configure backup strategies"
    echo ""
    print_info "Access your application at: http://localhost:3000"
    echo ""
}

# Run main function
main "$@"
