# eSawitKu Deployment Guide

## 🚀 **DEPLOYMENT OPTIONS**

### **Option 1: Docker Deployment (Recommended)**

#### **Prerequisites:**
- Docker Desktop installed and running
- Docker Compose v2.0+

#### **Steps:**
```bash
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# 2. Start Docker Desktop
# Make sure Docker is running (green icon in system tray)

# 3. Deploy all services
docker-compose up -d

# 4. Check services status
docker-compose ps

# 5. View logs
docker-compose logs -f app
```

#### **Services Included:**
- **App**: Next.js application (port 3000)
- **PostgreSQL**: Database (port 5432)
- **Redis**: Cache (port 6379)
- **MongoDB**: Analytics (port 27017)
- **Nginx**: Reverse proxy (port 80, 443)
- **Prometheus**: Metrics (port 9090)
- **Grafana**: Dashboards (port 3001)
- **Elasticsearch**: Log storage (port 9200)
- **Kibana**: Log visualization (port 5601)

---

### **Option 2: Local Development Setup**

#### **Prerequisites:**
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- MongoDB 6+

#### **Steps:**
```bash
# 1. Install dependencies
npm install

# 2. Setup databases manually
# Install PostgreSQL, Redis, MongoDB locally

# 3. Configure environment
cp env.example .env.local
# Edit .env.local with your database URLs

# 4. Run database migrations
npm run db:generate
npm run db:push

# 5. Start development server
npm run dev
```

---

### **Option 3: Cloud Deployment**

#### **AWS Deployment:**
```bash
# Using AWS ECS/EKS
# 1. Push Docker image to ECR
# 2. Create ECS cluster
# 3. Deploy with ECS service
# 4. Configure RDS, ElastiCache, etc.
```

#### **Google Cloud:**
```bash
# Using Cloud Run
# 1. Build and push to GCR
# 2. Deploy with Cloud Run
# 3. Configure Cloud SQL, Memorystore
```

#### **Azure:**
```bash
# Using Container Instances
# 1. Build and push to ACR
# 2. Deploy with Container Instances
# 3. Configure Azure Database, Cache
```

---

## 🔧 **CONFIGURATION STEPS**

### **1. Environment Variables**

Edit `.env.local` with your production values:

```env
# OAuth Providers (Required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Database URLs (Update if using external services)
DATABASE_URL="postgresql://postgres:password@localhost:5432/esawitku"
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/esawitku_logs

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **2. OAuth Provider Setup**

#### **Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

#### **GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

#### **Facebook OAuth:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`

### **3. Database Setup**

#### **PostgreSQL:**
```sql
-- Create database
CREATE DATABASE esawitku;

-- Create user
CREATE USER esawitku_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE esawitku TO esawitku_user;
```

#### **Redis:**
```bash
# Start Redis server
redis-server

# Set password (optional)
redis-cli CONFIG SET requirepass "your_password"
```

#### **MongoDB:**
```javascript
// Connect to MongoDB
use esawitku_logs

// Create collections
db.createCollection("error_logs")
db.createCollection("warning_logs")
db.createCollection("analytics")
```

---

## 📊 **MONITORING SETUP**

### **Prometheus Configuration**

Create `prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'esawitku-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

### **Grafana Dashboards**

1. Access Grafana: `http://localhost:3001`
2. Login: admin/admin
3. Add Prometheus data source: `http://prometheus:9090`
4. Import dashboard templates

---

## 🧪 **TESTING**

### **Run All Tests:**
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### **Health Checks:**
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/database

# Cache health
curl http://localhost:3000/api/health/cache
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

#### **Docker not starting:**
```bash
# Check Docker status
docker info

# Restart Docker Desktop
# Check system resources (RAM, CPU)
```

#### **Database connection errors:**
```bash
# Check database status
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### **OAuth errors:**
```bash
# Check OAuth configuration
# Verify redirect URIs match exactly
# Check client ID/secret are correct
# Ensure OAuth app is published (if required)
```

#### **Port conflicts:**
```bash
# Check port usage
netstat -an | findstr :3000

# Change ports in docker-compose.yml if needed
```

---

## 📈 **PRODUCTION CHECKLIST**

- [ ] Environment variables configured
- [ ] OAuth providers setup
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security scanning completed
- [ ] Performance testing done
- [ ] Load testing completed
- [ ] Disaster recovery plan tested

---

## 🆘 **SUPPORT**

If you encounter issues:

1. **Check logs**: `docker-compose logs -f [service-name]`
2. **Verify configuration**: Check `.env.local` values
3. **Test connectivity**: Use health check endpoints
4. **Review documentation**: Check README.md and ENTERPRISE-GUIDE.md
5. **Contact support**: support@esawitku.com

---

**eSawitKu** is ready for production deployment! 🚀
