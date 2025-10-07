'use client'

import { motion } from 'framer-motion'
import { Github, Mail, Facebook, CreditCard, QrCode, Shield, Zap, Users, BarChart3, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function HomePage() {
  const { data: session } = useSession()

  const floatingElements = [
    { icon: Github, delay: 0, duration: 6 },
    { icon: Mail, delay: 1, duration: 8 },
    { icon: Facebook, delay: 2, duration: 7 },
    { icon: CreditCard, delay: 3, duration: 9 },
    { icon: QrCode, delay: 4, duration: 6 },
    { icon: Shield, delay: 5, duration: 8 },
  ]

  const features = [
    {
      icon: BarChart3,
      title: "Analisis Data Real-time",
      description: "Pantau performa kebun sawit dengan dashboard interaktif dan laporan real-time"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Akses platform dari mana saja dengan aplikasi mobile yang responsif"
    },
    {
      icon: Users,
      title: "Manajemen Tim",
      description: "Kelola tim kerja dan delegasi tugas dengan sistem yang terintegrasi"
    },
    {
      icon: Zap,
      title: "Otomasi Proses",
      description: "Otomatiskan proses bisnis untuk efisiensi maksimal"
    }
  ]

  const plans = [
    {
      name: "Free",
      price: "Rp 0",
      period: "/bulan",
      features: [
        "Dashboard dasar",
        "Hingga 5 hektar kebun",
        "Laporan bulanan",
        "Support email"
      ],
      popular: false
    },
    {
      name: "Basic",
      price: "Rp 299.000",
      period: "/bulan",
      features: [
        "Semua fitur Free",
        "Hingga 50 hektar kebun",
        "Laporan mingguan",
        "Analisis data dasar",
        "Support prioritas"
      ],
      popular: true
    },
    {
      name: "Premium",
      price: "Rp 599.000",
      period: "/bulan",
      features: [
        "Semua fitur Basic",
        "Hingga 200 hektar kebun",
        "Laporan real-time",
        "Analisis data lanjutan",
        "Integrasi API",
        "Support 24/7"
      ],
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Semua fitur Premium",
        "Kebun tanpa batas",
        "Custom dashboard",
        "Integrasi khusus",
        "Dedicated support",
        "SLA terjamin"
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen relative">
      {/* Floating Background Elements */}
      <div className="floating-bg">
        {floatingElements.map((element, index) => {
          const Icon = element.icon
          return (
            <motion.div
              key={index}
              className="absolute text-primary-200 opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 360],
              }}
              transition={{
                duration: element.duration,
                repeat: Infinity,
                delay: element.delay,
                ease: "easeInOut"
              }}
            >
              <Icon size={40} />
            </motion.div>
          )
        })}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">eSawitKu</span>
            </motion.div>

            <div className="flex items-center space-x-4">
              {session ? (
                <Link href="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 font-medium">
                    Masuk
                  </Link>
                  <Link href="/auth/signup" className="btn-primary">
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            >
              Platform SaaS
              <span className="text-primary-600 block">Kelapa Sawit</span>
              <span className="text-2xl md:text-3xl font-normal text-gray-600 block mt-4">
                Terdepan di Indonesia
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Kelola perkebunan kelapa sawit Anda dengan teknologi terdepan. 
              Dari analisis data real-time hingga manajemen tim yang efisien.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {session ? (
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Mulai Sekarang
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4">
                    Mulai Gratis
                  </Link>
                  <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                    Pelajari Lebih Lanjut
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan eSawitKu
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Solusi lengkap untuk manajemen perkebunan kelapa sawit modern
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pilih Paket yang Tepat
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mulai dari gratis hingga enterprise, sesuai kebutuhan bisnis Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`card relative ${plan.popular ? 'ring-2 ring-primary-600 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Paling Populer
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={session ? "/dashboard" : "/auth/signup"}
                  className={`w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                    plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {session ? 'Upgrade Sekarang' : 'Mulai Sekarang'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="relative z-10 py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Metode Pembayaran Fleksibel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bayar dengan mudah menggunakan berbagai metode pembayaran yang tersedia
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="card text-center"
            >
              <CreditCard className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Bank</h3>
              <p className="text-gray-600 text-sm">BCA, Mandiri, BNI, BRI, dan bank lainnya</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card text-center"
            >
              <QrCode className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h3>
              <p className="text-gray-600 text-sm">Scan dan bayar dengan mudah</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card text-center"
            >
              <Smartphone className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">E-Wallet</h3>
              <p className="text-gray-600 text-sm">GoPay, OVO, DANA, LinkAja</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card text-center"
            >
              <CreditCard className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kartu Kredit</h3>
              <p className="text-gray-600 text-sm">Visa, Mastercard, JCB</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold">eSawitKu</span>
              </div>
              <p className="text-gray-400">
                Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit di Indonesia.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Produk</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analisis Data</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Manajemen Tim</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Laporan</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Dukungan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dokumentasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status Layanan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Komunitas</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 eSawitKu. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
