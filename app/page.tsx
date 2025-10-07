'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Github, Mail, Facebook, CreditCard, QrCode, Shield, Zap, Users, BarChart3, Smartphone, ArrowRight, Star, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { data: session } = useSession()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const floatingElements = [
    { icon: Github, delay: 0, duration: 6, size: 40 },
    { icon: Mail, delay: 1, duration: 8, size: 35 },
    { icon: Facebook, delay: 2, duration: 7, size: 38 },
    { icon: CreditCard, delay: 3, duration: 9, size: 42 },
    { icon: QrCode, delay: 4, duration: 6, size: 36 },
    { icon: Shield, delay: 5, duration: 8, size: 40 },
  ]

  const features = [
    {
      icon: BarChart3,
      title: "Analisis Data Real-time",
      description: "Pantau performa kebun sawit dengan dashboard interaktif dan laporan real-time",
      color: "from-blue-500 to-blue-600",
      delay: 0.1
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Akses platform dari mana saja dengan aplikasi mobile yang responsif",
      color: "from-purple-500 to-purple-600",
      delay: 0.2
    },
    {
      icon: Users,
      title: "Manajemen Tim",
      description: "Kelola tim kerja dan delegasi tugas dengan sistem yang terintegrasi",
      color: "from-green-500 to-green-600",
      delay: 0.3
    },
    {
      icon: Zap,
      title: "Otomasi Proses",
      description: "Otomatiskan proses bisnis untuk efisiensi maksimal",
      color: "from-yellow-500 to-yellow-600",
      delay: 0.4
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
      popular: false,
      color: "border-gray-200",
      delay: 0.1
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
      popular: true,
      color: "border-green-500",
      delay: 0.2
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
      popular: false,
      color: "border-blue-500",
      delay: 0.3
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
      popular: false,
      color: "border-purple-500",
      delay: 0.4
    }
  ]

  const testimonials = [
    {
      name: "Ahmad Wijaya",
      role: "Petani Sawit",
      content: "eSawitKu membantu saya mengelola kebun dengan lebih efisien. Dashboard yang mudah dipahami dan laporan yang detail.",
      rating: 5,
      avatar: "AW"
    },
    {
      name: "Siti Nurhaliza",
      role: "Manager Perkebunan",
      content: "Platform yang sangat membantu untuk monitoring tim dan produktivitas kebun. Highly recommended!",
      rating: 5,
      avatar: "SN"
    },
    {
      name: "Budi Santoso",
      role: "Owner Perkebunan",
      content: "Dengan eSawitKu, saya bisa mengakses data kebun kapan saja. Mobile app-nya sangat user-friendly.",
      rating: 5,
      avatar: "BS"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg fixed inset-0 -z-10" />
      
      {/* Mouse Follower Effect */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl pointer-events-none z-0"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      />

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
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: element.duration,
                repeat: Infinity,
                delay: element.delay,
                ease: "easeInOut"
              }}
            >
              <Icon size={element.size} />
            </motion.div>
          )
        })}
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white font-bold text-xl">E</span>
              </motion.div>
              <span className="text-2xl font-bold gradient-text">eSawitKu</span>
            </motion.div>

            <div className="flex items-center space-x-4">
              {session ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/dashboard" className="btn-primary flex items-center">
                    Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/auth/signin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-300">
                      Masuk
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/auth/signup" className="btn-primary">
                      Daftar
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block"
              >
                <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold text-gray-900 mb-6"
            >
              Platform SaaS
              <motion.span 
                className="gradient-text block"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Kelapa Sawit
              </motion.span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-3xl md:text-4xl font-normal text-gray-600 block mt-4"
              >
                Terdepan di Indonesia
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Kelola perkebunan kelapa sawit Anda dengan teknologi terdepan. 
              Dari analisis data real-time hingga manajemen tim yang efisien.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {session ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center">
                    Mulai Sekarang
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4 flex items-center">
                      Mulai Gratis
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                      Pelajari Lebih Lanjut
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Fitur Unggulan eSawitKu
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Solusi lengkap untuk manajemen perkebunan kelapa sawit modern
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  className="card-hover text-center group"
                >
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(34, 197, 94, 0.3)',
                        '0 0 40px rgba(34, 197, 94, 0.6)',
                        '0 0 20px rgba(34, 197, 94, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Kata Mereka Tentang eSawitKu
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ribuan pengguna telah merasakan manfaatnya
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="card text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">{testimonial.avatar}</span>
                </div>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Pilih Paket yang Tepat
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mulai dari gratis hingga enterprise, sesuai kebutuhan bisnis Anda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: plan.delay }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: plan.popular ? 1.05 : 1.02,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className={`card relative ${plan.popular ? 'ring-2 ring-primary-600 scale-105 glow' : ''}`}
              >
                {plan.popular && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  >
                    <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Paling Populer
                    </span>
                  </motion.div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: featureIndex * 0.1 }}
                      className="flex items-center"
                    >
                      <motion.div 
                        className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3"
                        whileHover={{ scale: 1.2 }}
                      >
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </motion.div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={session ? "/dashboard" : "/auth/signup"}
                    className={`w-full text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 hover:shadow-md'
                    }`}
                  >
                    {session ? 'Upgrade Sekarang' : 'Mulai Sekarang'}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Metode Pembayaran Fleksibel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bayar dengan mudah menggunakan berbagai metode pembayaran yang tersedia
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: CreditCard, title: "Transfer Bank", desc: "BCA, Mandiri, BNI, BRI" },
              { icon: QrCode, title: "QR Code", desc: "Scan dan bayar dengan mudah" },
              { icon: Smartphone, title: "E-Wallet", desc: "GoPay, OVO, DANA, LinkAja" },
              { icon: CreditCard, title: "Kartu Kredit", desc: "Visa, Mastercard, JCB" }
            ].map((method, index) => {
              const Icon = method.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.1,
                    rotateY: 10,
                    transition: { duration: 0.3 }
                  }}
                  className="card text-center group"
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Icon className="w-12 h-12 text-primary-600 mx-auto mb-4 group-hover:text-primary-700 transition-colors duration-300" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {method.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{method.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 bg-gray-900 text-white py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <motion.div 
                  className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-white font-bold text-xl">E</span>
                </motion.div>
                <span className="text-2xl font-bold">eSawitKu</span>
              </div>
              <p className="text-gray-400">
                Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit di Indonesia.
              </p>
            </motion.div>

            {[
              { title: "Produk", links: ["Dashboard", "Analisis Data", "Manajemen Tim", "Laporan"] },
              { title: "Perusahaan", links: ["Tentang Kami", "Karir", "Blog", "Kontak"] },
              { title: "Dukungan", links: ["Bantuan", "Dokumentasi", "Status Layanan", "Komunitas"] }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <motion.li 
                      key={linkIndex}
                      whileHover={{ x: 5, color: "#22c55e" }}
                      transition={{ duration: 0.2 }}
                    >
                      <a href="#" className="hover:text-white transition-colors duration-300">
                        {link}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
          >
            <p>&copy; 2024 eSawitKu. Semua hak dilindungi.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}