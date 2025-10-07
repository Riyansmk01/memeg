# eSawitKu - Platform SaaS Kelapa Sawit

Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit dengan teknologi modern dan fitur lengkap.

## 🚀 Fitur Utama

- **Homepage Interaktif** dengan animasi floating dan informasi lengkap
- **Sistem Autentikasi** dengan Google, GitHub, Facebook, dan Email
- **Dashboard User** dengan statistik real-time dan quick actions
- **Sistem Pembayaran** dengan transfer bank dan QR code
- **Manajemen Langganan** dengan berbagai paket (Free, Basic, Premium, Enterprise)
- **Pengaturan User** yang komprehensif
- **Responsive Design** dengan Tailwind CSS
- **Animasi Smooth** dengan Framer Motion

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animasi**: Framer Motion
- **Database**: Prisma dengan SQLite
- **Autentikasi**: NextAuth.js
- **Pembayaran**: QR Code generation
- **Icons**: Lucide React

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd esawitku-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` dan isi dengan konfigurasi yang sesuai:
   - NextAuth secret key
   - OAuth provider credentials (Google, GitHub, Facebook)
   - Database URL

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Jalankan development server**
   ```bash
   npm run dev
   ```

6. **Buka browser**
   ```
   http://localhost:3000
   ```

## 🔧 Konfigurasi OAuth Providers

### Google OAuth
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project existing
3. Enable Google+ API
4. Buat OAuth 2.0 credentials
5. Tambahkan `http://localhost:3000/api/auth/callback/google` ke authorized redirect URIs

### GitHub OAuth
1. Buka [GitHub Developer Settings](https://github.com/settings/developers)
2. Buat OAuth App baru
3. Set Authorization callback URL ke `http://localhost:3000/api/auth/callback/github`

### Facebook OAuth
1. Buka [Facebook Developers](https://developers.facebook.com/)
2. Buat app baru
3. Tambahkan Facebook Login product
4. Set Valid OAuth Redirect URIs ke `http://localhost:3000/api/auth/callback/facebook`

## 📱 Struktur Aplikasi

```
app/
├── api/                    # API routes
│   ├── auth/              # NextAuth configuration
│   ├── payment/           # Payment processing
│   └── user/              # User management
├── auth/                  # Authentication pages
│   ├── signin/           # Login page
│   └── signup/           # Registration page
├── dashboard/            # User dashboard
│   ├── billing/          # Payment & subscription
│   └── settings/         # User settings
├── globals.css           # Global styles
├── layout.tsx            # Root layout
├── page.tsx              # Homepage
└── providers.tsx         # Context providers

lib/
├── auth.ts               # NextAuth configuration
└── prisma.ts            # Database client

prisma/
└── schema.prisma         # Database schema
```

## 🎨 Fitur UI/UX

- **Floating Animations**: Logo dan elemen bergerak dengan animasi smooth
- **Responsive Design**: Optimal di desktop, tablet, dan mobile
- **Modern UI**: Clean design dengan Tailwind CSS
- **Interactive Elements**: Hover effects dan transitions
- **Loading States**: Feedback visual untuk semua aksi
- **Toast Notifications**: Notifikasi real-time dengan react-hot-toast

## 💳 Sistem Pembayaran

- **Transfer Bank**: BCA, Mandiri, BNI, BRI, dan bank lainnya
- **QR Code**: Generate QR code untuk pembayaran mobile
- **E-Wallet**: GoPay, OVO, DANA, LinkAja
- **Kartu Kredit**: Visa, Mastercard, JCB

## 📊 Paket Langganan

| Paket | Harga | Fitur |
|-------|-------|-------|
| **Free** | Rp 0/bulan | Dashboard dasar, 5 hektar, laporan bulanan |
| **Basic** | Rp 299.000/bulan | Dashboard lengkap, 50 hektar, laporan mingguan |
| **Premium** | Rp 599.000/bulan | Semua fitur Basic, 200 hektar, laporan real-time |
| **Enterprise** | Custom | Solusi khusus, unlimited, dedicated support |

## 🔐 Keamanan

- Password hashing dengan bcrypt
- JWT tokens untuk session management
- CSRF protection dengan NextAuth
- Input validation dan sanitization
- Secure API routes dengan authentication

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel dashboard
4. Deploy otomatis

### Manual Deployment
1. Build aplikasi: `npm run build`
2. Start production server: `npm start`
3. Setup database di production
4. Configure environment variables

## 📝 Scripts

```bash
npm run dev          # Development server
npm run build        # Build untuk production
npm run start        # Start production server
npm run lint         # ESLint checking
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

- **Email**: support@esawitku.com
- **Website**: https://esawitku.com
- **LinkedIn**: [eSawitKu](https://linkedin.com/company/esawitku)

---

Dibuat dengan ❤️ untuk industri kelapa sawit Indonesia
