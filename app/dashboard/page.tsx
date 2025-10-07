'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Settings, 
  CreditCard, 
  LogOut, 
  TrendingUp, 
  Calendar,
  MapPin,
  Leaf,
  DollarSign,
  Bell,
  ChevronRight,
  Plus,
  Activity,
  Zap,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodEnd: string | null
}

interface DashboardStats {
  totalHectares: number
  totalWorkers: number
  monthlyRevenue: number
  productivity: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalHectares: 0,
    totalWorkers: 0,
    monthlyRevenue: 0,
    productivity: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session, status, router])

  const fetchUserData = async () => {
    try {
      const [subscriptionRes, statsRes] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/user/stats')
      ])

      if (subscriptionRes.ok) {
        const subData = await subscriptionRes.json()
        setSubscription(subData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.3
      }
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-semibold text-gray-700"
          >
            Memuat Dashboard...
          </motion.h2>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const planLimits = {
    free: { hectares: 5, workers: 3, reports: 'monthly' },
    basic: { hectares: 50, workers: 15, reports: 'weekly' },
    premium: { hectares: 200, workers: 50, reports: 'daily' },
    enterprise: { hectares: -1, workers: -1, reports: 'real-time' }
  }

  const currentPlan = subscription?.plan || 'free'
  const limits = planLimits[currentPlan as keyof typeof planLimits]

  const quickActions = [
    {
      title: 'Lihat Laporan',
      description: 'Analisis performa kebun',
      icon: BarChart3,
      href: '/dashboard/reports',
      color: 'from-blue-500 to-blue-600',
      delay: 0.1
    },
    {
      title: 'Kelola Tim',
      description: 'Manajemen pekerja',
      icon: Users,
      href: '/dashboard/team',
      color: 'from-green-500 to-green-600',
      delay: 0.2
    },
    {
      title: 'Pembayaran',
      description: 'Kelola langganan',
      icon: CreditCard,
      href: '/dashboard/billing',
      color: 'from-purple-500 to-purple-600',
      delay: 0.3
    },
    {
      title: 'Pengaturan',
      description: 'Profil dan preferensi',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'from-gray-500 to-gray-600',
      delay: 0.4
    }
  ]

  const recentActivities = [
    { id: 1, action: 'Laporan bulanan dibuat', time: '2 jam yang lalu', icon: BarChart3, color: 'text-blue-500' },
    { id: 2, action: 'Tim baru ditambahkan', time: '5 jam yang lalu', icon: Users, color: 'text-green-500' },
    { id: 3, action: 'Pembayaran berhasil', time: '1 hari yang lalu', icon: CreditCard, color: 'text-purple-500' },
    { id: 4, action: 'Data kebun diperbarui', time: '2 hari yang lalu', icon: Leaf, color: 'text-green-600' },
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'team', name: 'Tim', icon: Users },
    { id: 'reports', name: 'Laporan', icon: Calendar }
  ]

  return (
    <div className="min-h-screen animated-bg">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <span className="text-white font-bold text-xl">E</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text">eSawitKu</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {session.user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{session.user.name}</span>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat datang kembali, {session.user.name}! 👋
            </h2>
            <p className="text-gray-600">
              Berikut adalah ringkasan aktivitas perkebunan Anda hari ini
            </p>
          </motion.div>

          {/* Subscription Status */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Paket {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </h3>
                <p className="text-primary-100">
                  {limits.hectares === -1 ? 'Kebun tanpa batas' : `Hingga ${limits.hectares} hektar`} • 
                  {limits.workers === -1 ? ' Tim tanpa batas' : ` Hingga ${limits.workers} pekerja`}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link href="/dashboard/billing" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                  Upgrade
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              title: 'Total Hektar', 
              value: `${stats.totalHectares} ha`, 
              icon: MapPin, 
              color: 'from-green-500 to-green-600',
              change: '+12%',
              changeType: 'positive',
              delay: 0.1
            },
            { 
              title: 'Total Pekerja', 
              value: `${stats.totalWorkers} orang`, 
              icon: Users, 
              color: 'from-blue-500 to-blue-600',
              change: '+5%',
              changeType: 'positive',
              delay: 0.2
            },
            { 
              title: 'Pendapatan Bulanan', 
              value: `Rp ${stats.monthlyRevenue.toLocaleString()}`, 
              icon: DollarSign, 
              color: 'from-purple-500 to-purple-600',
              change: '+8%',
              changeType: 'positive',
              delay: 0.3
            },
            { 
              title: 'Produktivitas', 
              value: `${stats.productivity}%`, 
              icon: TrendingUp, 
              color: 'from-yellow-500 to-yellow-600',
              change: '+3%',
              changeType: 'positive',
              delay: 0.4
            }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="card group"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(34, 197, 94, 0.3)',
                        '0 0 40px rgba(34, 197, 94, 0.6)',
                        '0 0 20px rgba(34, 197, 94, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: stat.delay }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div
                    className={`flex items-center text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: stat.delay + 0.3 }}
                  >
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors duration-300">
                  {stat.value}
                </h3>
                <p className="text-gray-600">{stat.title}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h3 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-6">
            Aksi Cepat
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  className="card group cursor-pointer"
                >
                  <Link href={action.href} className="block">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: action.delay }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                      {action.title}
                    </h4>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                    <motion.div
                      className="mt-4 flex items-center text-primary-600 group-hover:text-primary-700 transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-sm font-medium">Mulai</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h3 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-6">
            Aktivitas Terbaru
          </motion.h3>
          <motion.div variants={itemVariants} className="card">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <motion.div
                      className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center ${activity.color}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Performance Chart Placeholder */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h3 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-6">
            Performa Kebun
          </motion.h3>
          <motion.div
            variants={itemVariants}
            className="card p-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
            />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Chart Performa</h4>
            <p className="text-gray-600 mb-4">Visualisasi data performa kebun akan ditampilkan di sini</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center mx-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Unduh Laporan
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}