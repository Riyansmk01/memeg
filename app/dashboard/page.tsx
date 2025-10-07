'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  ChevronRight
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
      color: 'bg-blue-500'
    },
    {
      title: 'Kelola Tim',
      description: 'Manajemen pekerja',
      icon: Users,
      href: '/dashboard/team',
      color: 'bg-green-500'
    },
    {
      title: 'Pembayaran',
      description: 'Kelola langganan',
      icon: CreditCard,
      href: '/dashboard/billing',
      color: 'bg-purple-500'
    },
    {
      title: 'Pengaturan',
      description: 'Profil dan preferensi',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-gray-500'
    }
  ]

  const recentActivities = [
    { action: 'Laporan bulanan dibuat', time: '2 jam yang lalu', type: 'report' },
    { action: 'Tim baru ditambahkan', time: '1 hari yang lalu', type: 'team' },
    { action: 'Pembayaran berhasil', time: '3 hari yang lalu', type: 'payment' },
    { action: 'Data kebun diperbarui', time: '1 minggu yang lalu', type: 'data' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">eSawitKu</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-500" />
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {session.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat datang, {session.user?.name}!
          </h1>
          <p className="text-gray-600">
            Kelola perkebunan kelapa sawit Anda dengan mudah dan efisien
          </p>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Paket {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </h2>
                <p className="text-gray-600">
                  {limits.hectares === -1 ? 'Tanpa batas' : `Hingga ${limits.hectares} hektar`} • 
                  {limits.workers === -1 ? ' Tanpa batas pekerja' : ` ${limits.workers} pekerja`} • 
                  Laporan {limits.reports}
                </p>
              </div>
              <Link
                href="/dashboard/billing"
                className="btn-primary"
              >
                Kelola Langganan
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hektar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHectares}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pekerja</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendapatan Bulanan</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produktivitas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.productivity}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    href={action.href}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600">{action.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Aktivitas Terbaru</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/activity"
                className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium mt-4"
              >
                Lihat semua aktivitas
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
