# 🔧 eSawitKu Setup Troubleshooting Guide

## ❌ **MASALAH YANG TERJADI**

Error yang Anda alami:
```
Module not found: Can't resolve '@next-auth/prisma-adapter'
```

## ✅ **SOLUSI LENGKAP**

### **Langkah 1: Install Dependencies yang Hilang**

Buka Command Prompt atau PowerShell sebagai Administrator dan jalankan:

```bash
# Install dependency yang hilang
npm install @next-auth/prisma-adapter

# Install semua dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### **Langkah 2: Setup Environment**

```bash
# Copy environment file
copy env.example .env.local

# Edit .env.local dengan notepad
notepad .env.local
```

### **Langkah 3: Konfigurasi Database**

Karena kita menggunakan SQLite untuk development, pastikan `.env.local` berisi:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# OAuth Providers (opsional untuk testing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### **Langkah 4: Setup Database**

```bash
# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### **Langkah 5: Start Development Server**

```bash
npm run dev
```

---

## 🚀 **SCRIPT OTOMATIS**

Saya telah membuat script `fix-setup.bat` yang akan mengatasi semua masalah ini. Jalankan:

```bash
.\fix-setup.bat
```

Atau jika tidak bisa dijalankan, jalankan perintah ini satu per satu:

```bash
npm install @next-auth/prisma-adapter
npm install
npx prisma generate
copy env.example .env.local
npm run dev
```

---

## 🔍 **TROUBLESHOOTING TAMBAHAN**

### **Jika npm install gagal:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules dan package-lock.json
rmdir /s node_modules
del package-lock.json

# Install ulang
npm install
```

### **Jika Prisma error:**

```bash
# Reset Prisma
npx prisma generate --force
npx prisma db push --force-reset
```

### **Jika port 3000 sudah digunakan:**

```bash
# Kill process di port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Atau gunakan port lain
npm run dev -- -p 3001
```

---

## 📋 **CHECKLIST VERIFIKASI**

- [ ] Node.js terinstall (versi 18+)
- [ ] npm berfungsi dengan baik
- [ ] Dependencies terinstall lengkap
- [ ] Environment file (.env.local) ada
- [ ] Database schema ter-push
- [ ] Prisma client ter-generate
- [ ] Development server berjalan di http://localhost:3000

---

## 🎯 **HASIL YANG DIHARAPKAN**

Setelah semua langkah selesai, Anda akan melihat:

1. **Terminal menampilkan:**
   ```
   ✓ Ready in 2.3s
   ○ Local:        http://localhost:3000
   ○ Network:      http://192.168.1.100:3000
   ```

2. **Browser menampilkan homepage eSawitKu** dengan:
   - Logo eSawitKu yang beranimasi
   - Tombol "Masuk" dan "Daftar"
   - Informasi tentang platform SaaS kelapa sawit
   - Fitur-fitur unggulan

3. **Tidak ada error compilation** di browser

---

## 🆘 **JIKA MASIH ADA MASALAH**

### **Error "Module not found":**
- Pastikan semua dependencies terinstall
- Jalankan `npm install` lagi
- Restart terminal/command prompt

### **Error "Database connection":**
- Pastikan DATABASE_URL benar di .env.local
- Jalankan `npx prisma db push`

### **Error "Port already in use":**
- Kill process di port 3000
- Atau gunakan port lain dengan `npm run dev -- -p 3001`

### **Error "Permission denied":**
- Jalankan Command Prompt sebagai Administrator
- Atau gunakan PowerShell

---

## 📞 **BANTUAN TAMBAHAN**

Jika masih mengalami masalah, coba:

1. **Restart komputer** untuk memastikan semua service fresh
2. **Update Node.js** ke versi terbaru
3. **Clear semua cache** (npm, browser, dll)
4. **Jalankan sebagai Administrator**

---

**eSawitKu akan berjalan dengan sempurna setelah mengikuti langkah-langkah ini!** 🚀
