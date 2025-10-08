'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react'
import { HarvestChart, RevenueChart, WorkerChart, ProductivityChart } from '@/components/analytics/Charts'

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    totalHarvest: 0,
    totalRevenue: 0,
    productivity: 0,
    workerCount: 0
  })

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchSummary()
    }
  }, [session, selectedPeriod])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/summary?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&period=${selectedPeriod}`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${selectedPeriod}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600">Silakan login untuk mengakses halaman ini.</p>
        </div>
      </div>
    )
  }

  const summaryCards = [
    {
      title: 'Total Panen',
      value: `${summary.totalHarvest.toLocaleString()} kg`,
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      change: '+12%'
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${summary.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: '+8%'
    },
    {
      title: 'Produktivitas',
      value: `${summary.productivity}%`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      change: '+5%'
    },
    {
      title: 'Total Pekerja',
      value: `${summary.workerCount} orang`,
      icon: BarChart3,
      color: 'from-yellow-500 to-yellow-600',
      change: '+3%'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Analisis performa dan tren perkebunan Anda</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Period Selector */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="week">Minggu ini</option>
                  <option value="month">Bulan ini</option>
                  <option value="year">Tahun ini</option>
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchSummary}
                disabled={loading}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    <p className="text-sm text-green-600 mt-1">{card.change}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <HarvestChart userId={(session.user as any)?.id || ''} period={selectedPeriod} />
          <RevenueChart userId={(session.user as any)?.id || ''} period={selectedPeriod} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WorkerChart userId={(session.user as any)?.id || ''} />
          <ProductivityChart userId={(session.user as any)?.id || ''} />
        </div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Rekomendasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">✅ Performa Baik</h4>
              <p className="text-sm text-green-700">
                Produktivitas Anda meningkat 5% dibanding periode sebelumnya. 
                Pertahankan pola kerja yang konsisten.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Perhatian</h4>
              <p className="text-sm text-yellow-700">
                Hasil panen minggu ini menurun 3%. Pertimbangkan untuk 
                menambah intensitas pemeliharaan.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">💡 Saran</h4>
              <p className="text-sm text-blue-700">
                Dengan 15 pekerja pemanen, pertimbangkan untuk menambah 
                2-3 pekerja lagi untuk optimalisasi hasil.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">📈 Peluang</h4>
              <p className="text-sm text-purple-700">
                Pendapatan bulan ini meningkat 8%. Pertimbangkan untuk 
                ekspansi area tanam.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
