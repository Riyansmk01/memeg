# eSawitKu - Platform SaaS Kelapa Sawit

Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit dengan fitur lengkap dan teknologi terbaru.

## 🚀 Features

### ✨ UI/UX Features
- **Beautiful Animations**: Smooth transitions dan micro-interactions
- **Responsive Design**: Mobile-first approach dengan breakpoints yang optimal
- **Modern UI Components**: Reusable components dengan variants lengkap
- **Loading States**: Comprehensive loading indicators dan skeleton screens
- **Error Boundaries**: Graceful error handling dengan user-friendly messages
- **Accessibility**: WCAG compliant dengan keyboard navigation

### 🔒 Security Features
- **Input Validation**: Client dan server-side validation
- **Password Security**: bcrypt hashing dengan salt rounds
- **XSS Protection**: Input sanitization dan CSP headers
- **CSRF Protection**: SameSite cookies dan CSRF tokens
- **Security Headers**: Comprehensive security headers
- **Rate Limiting**: Ready untuk implementasi rate limiting

### 🎨 Animation System
- **20+ Animation Classes**: Fade, slide, scale, rotate, bounce, float, pulse, glow
- **Page Transitions**: Smooth transitions antar halaman
- **Hover Effects**: Interactive hover states
- **Loading Animations**: Spinner, skeleton, pulse, shimmer effects
- **Micro-interactions**: Button clicks, form interactions

### 🧩 Component Library
- **Button Component**: 7 variants (primary, secondary, ghost, danger, success, warning, info)
- **Input Component**: 4 variants dengan validation states
- **Card Component**: 5 variants (default, elevated, flat, glass, gradient)
- **Badge Component**: 6 variants dengan animations
- **Alert Component**: 4 variants dengan closable option
- **Progress Component**: 5 variants dengan animated progress
- **Divider Component**: Horizontal/vertical dengan text support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM (SQLite for development)
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. Clone repository:
```bash
git clone <repository-url>
cd esawitku-saas
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```

4. Run development server:
```bash
npm run dev
```

## 🎯 Quick Start

### Option 1: Automated Setup
```bash
.\final-test.bat
```

### Option 2: Manual Setup
```bash
npm install
npm run dev
```

## 📁 Project Structure

```
esawitku-saas/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── ErrorBoundary.tsx # Error boundary
│   ├── LoadingComponents.tsx
│   ├── PageTransitions.tsx
│   └── AnimationUtils.tsx
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🎨 CSS System

### Color Palette
- **Primary**: Green shades (#f0fdf4 to #14532d)
- **Secondary**: Gray shades (#f8fafc to #020617)
- **Accent**: Purple shades (#fef7ff to #520a6b)
- **Success**: Green shades
- **Warning**: Yellow shades
- **Error**: Red shades
- **Info**: Blue shades

### Animation Classes
- `fade-in`, `fade-in-up`, `fade-in-down`
- `slide-in-left`, `slide-in-right`, `slide-in-up`, `slide-in-down`
- `scale-in`, `scale-in-bounce`
- `rotate-in`, `bounce-gentle`, `float`
- `pulse-glow`, `shimmer`, `gradient-shift`

### Component Classes
- `btn-primary`, `btn-secondary`, `btn-ghost`
- `card`, `card-hover`, `glass-card`
- `input-field`, `input-error`, `input-success`
- `badge-green`, `badge-blue`, `badge-purple`

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

## 🚀 Deployment

### Docker Deployment
```bash
docker build -t esawitku-saas .
docker run -p 3000:3000 esawitku-saas
```

### Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

## 📱 Responsive Design

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1600px

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels dan semantic HTML
- **Color Contrast**: WCAG AA compliant
- **Reduced Motion**: Respects user preferences
- **Focus Indicators**: Clear focus states

## 🔒 Security

- **Input Validation**: Client dan server-side
- **Password Hashing**: bcrypt dengan salt rounds
- **XSS Protection**: Input sanitization
- **CSRF Protection**: SameSite cookies
- **Security Headers**: Comprehensive headers
- **Rate Limiting**: Ready untuk implementasi

## 📊 Performance

- **Bundle Size**: Optimized dengan tree shaking
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching**: Static generation dan ISR
- **Animations**: Hardware accelerated

## 🧪 Testing

```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:performance # Run performance tests
```

## 📈 Monitoring

- **Error Tracking**: Error boundaries
- **Performance**: Web Vitals monitoring
- **Analytics**: Ready untuk Google Analytics
- **Logging**: Structured logging

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]
- **Discord**: [Discord Server]
- **Email**: support@esawitku.com

## 🎉 Acknowledgments

- Next.js team untuk framework yang luar biasa
- Tailwind CSS untuk utility-first CSS
- Framer Motion untuk animasi yang smooth
- Lucide untuk icon set yang comprehensive
- Prisma untuk ORM yang powerful

---

**eSawitKu** - Platform SaaS Kelapa Sawit Terdepan di Indonesia 🇮🇩