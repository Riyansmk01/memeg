# 🌴 eSawitKu - Platform SaaS Kelapa Sawit Terdepan

Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit dengan fitur lengkap dan teknologi terbaru.

## 🚀 Fitur Utama

### 📊 **Dashboard & Analytics**
- Dashboard real-time dengan metrik perkebunan
- Analytics mendalam untuk produktivitas
- Laporan otomatis dan export data
- Visualisasi data dengan chart interaktif

### 👥 **Manajemen User & Role**
- Multi-role system (Admin, User, Manager, Worker)
- Authentication dengan NextAuth.js
- OAuth integration (Google, GitHub, Facebook)
- Profile management dan settings

### 💰 **Sistem Billing & Subscription**
- Paket Free, Basic, dan Premium
- Payment gateway Indonesia (BRI, Mandiri, QR Code)
- Integrasi Stripe dan Midtrans
- Invoice otomatis dan tracking

### 🌱 **Manajemen Perkebunan**
- Tracking kebun dan area
- Manajemen pekerja dan tugas
- Monitoring panen dan produktivitas
- Dokumentasi dan laporan

### 🔧 **Fitur Teknis**
- Real-time notifications
- File storage dengan Cloudinary
- Email service dengan SendGrid
- Monitoring dengan Sentry
- Caching dengan Redis

## 🛠️ Teknologi

### **Frontend**
- **Next.js 13.5.6** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization

### **Backend**
- **Next.js API Routes** - Serverless functions
- **Prisma** - Database ORM
- **SQLite** - Development database
- **NextAuth.js** - Authentication
- **Zod** - Schema validation

### **Database**
- **SQLite** - Development
- **PostgreSQL** - Production ready
- **Prisma Migrations** - Schema management

### **Deployment**
- **Vercel** - Hosting platform
- **GitHub Actions** - CI/CD
- **Docker** - Containerization
- **Kubernetes** - Orchestration

## 📦 Instalasi

### Prerequisites
- Node.js 18+
- npm atau bun
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Riyansmk01/memeg.git
cd memeg
```

### 2. Install Dependencies
```bash
npm install
# atau
bun install
```

### 3. Setup Environment
```bash
cp env.example .env.local
```

Edit `.env.local` dengan konfigurasi yang sesuai:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
# atau
bun dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub Repository**
   - Import project dari GitHub ke Vercel
   - Set environment variables di Vercel dashboard

2. **Environment Variables**
   ```env
   DATABASE_URL=your_production_database_url
   NEXTAUTH_SECRET=your_production_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

3. **Auto Deploy**
   - Push ke `main` branch akan auto-deploy
   - GitHub Actions akan handle build process

### Docker

```bash
# Build image
docker build -t esawitku .

# Run container
docker run -p 3000:3000 esawitku
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/
```

## 📁 Struktur Project

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   ├── analytics/        # Analytics components
│   └── accessibility/    # Accessibility components
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── database.ts      # Prisma client
│   ├── payment/         # Payment integrations
│   └── storage/         # File storage
├── prisma/              # Database schema
│   ├── schema.prisma    # Prisma schema
│   └── seed.ts          # Database seeding
├── public/              # Static assets
├── .github/workflows/   # GitHub Actions
└── k8s/                 # Kubernetes manifests
```

## 🔧 Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:seed          # Seed database

# Testing
npm run test             # Run tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests

# Linting
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
npm run format           # Format code with Prettier
```

## 🔐 Environment Variables

### Required
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional
```env
# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Payment
STRIPE_SECRET_KEY="sk_test_..."
MIDTRANS_SERVER_KEY="your-midtrans-key"

# Storage
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"

# Email
SENDGRID_API_KEY="your-sendgrid-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/subscription` - Get subscription info
- `GET /api/user/stats` - Get user statistics

### System
- `GET /api/health` - Health check
- `GET /api/metrics` - Prometheus metrics

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

### Health Checks
- **Application**: `/api/health`
- **Metrics**: `/api/metrics`
- **Database**: Prisma health check
- **External Services**: Redis, MongoDB

### Observability
- **Sentry**: Error tracking
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **Logs**: Structured logging

## 🔒 Security

- **Authentication**: NextAuth.js dengan multiple providers
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API rate limiting
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Data Encryption**: Sensitive data encryption

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/Riyansmk01/memeg/wiki)
- **Issues**: [GitHub Issues](https://github.com/Riyansmk01/memeg/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Riyansmk01/memeg/discussions)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] IoT integration
- [ ] Machine learning predictions
- [ ] Multi-language support
- [ ] Advanced reporting system

---

**Dibuat dengan ❤️ untuk industri kelapa sawit Indonesia**