'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  Smartphone, 
  CheckCircle, 
  Clock,
  Copy,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'

interface PaymentMethod {
  id: string
  name: string
  type: 'bank_transfer' | 'qr_code' | 'ewallet' | 'credit_card'
  icon: any
  banks?: string[]
}

interface PaymentData {
  amount: number
  referenceId: string
  qrCode: string
  bankAccount: {
    bank: string
    accountNumber: string
    accountName: string
  }
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('basic')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank_transfer',
      name: 'Transfer Bank',
      type: 'bank_transfer',
      icon: Building2,
      banks: ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB', 'Danamon']
    },
    {
      id: 'qr_code',
      name: 'QR Code',
      type: 'qr_code',
      icon: QrCode
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      type: 'ewallet',
      icon: Smartphone
    },
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      type: 'credit_card',
      icon: CreditCard
    }
  ]

  const plans = [
    { id: 'free', name: 'Free', price: 0, features: ['Dashboard dasar', '5 hektar', 'Laporan bulanan'] },
    { id: 'basic', name: 'Basic', price: 299000, features: ['Dashboard lengkap', '50 hektar', 'Laporan mingguan', 'Analisis data'] },
    { id: 'premium', name: 'Premium', price: 599000, features: ['Semua fitur Basic', '200 hektar', 'Laporan real-time', 'API access'] },
    { id: 'enterprise', name: 'Enterprise', price: 0, features: ['Custom solution', 'Unlimited', 'Dedicated support', 'SLA'] }
  ]

  const currentPlan = plans.find(plan => plan.id === selectedPlan)
  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod)

  const handlePayment = async () => {
    if (!selectedMethod || !currentPlan) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: currentPlan.price,
          method: selectedMethod
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentData(data)
        toast.success('Data pembayaran berhasil dibuat!')
      } else {
        toast.error('Gagal membuat data pembayaran')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memproses pembayaran')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Berhasil disalin!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali ke Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Langganan
          </h1>
          <p className="text-gray-600">
            Pilih paket yang sesuai dan lakukan pembayaran
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pilih Paket</h2>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-2xl font-bold text-primary-600">
                        {plan.price === 0 ? 'Gratis' : `Rp ${plan.price.toLocaleString()}`}
                        {plan.price > 0 && <span className="text-sm text-gray-500">/bulan</span>}
                      </p>
                    </div>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Method Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">{method.name}</p>
                  </button>
                )
              })}
            </div>

            {selectedMethod && (
              <button
                onClick={handlePayment}
                disabled={isLoading || !currentPlan}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memproses...' : 'Buat Pembayaran'}
              </button>
            )}
          </motion.div>
        </div>

        {/* Payment Instructions */}
        {paymentData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Instruksi Pembayaran
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bank Transfer */}
              {selectedMethod === 'bank_transfer' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Bank</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Bank</span>
                        <button
                          onClick={() => copyToClipboard(paymentData.bankAccount.bank)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900">{paymentData.bankAccount.bank}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Nomor Rekening</span>
                        <button
                          onClick={() => copyToClipboard(paymentData.bankAccount.accountNumber)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900">{paymentData.bankAccount.accountNumber}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Nama Pemilik</span>
                        <button
                          onClick={() => copyToClipboard(paymentData.bankAccount.accountName)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900">{paymentData.bankAccount.accountName}</p>
                    </div>

                    <div className="bg-primary-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-primary-600">Jumlah Transfer</span>
                        <button
                          onClick={() => copyToClipboard(paymentData.amount.toString())}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xl font-bold text-primary-600">
                        Rp {paymentData.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              {selectedMethod === 'qr_code' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <QRCode value={paymentData.qrCode} size={200} />
                    <p className="text-sm text-gray-600 mt-4">
                      Scan QR code di atas untuk melakukan pembayaran
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pembayaran</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-sm text-gray-600">ID Referensi</span>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-mono text-gray-900">{paymentData.referenceId}</p>
                      <button
                        onClick={() => copyToClipboard(paymentData.referenceId)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-sm text-gray-600">Jumlah</span>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      Rp {paymentData.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Penting!</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Pembayaran akan diverifikasi dalam 1x24 jam. Pastikan ID referensi tercantum dalam transfer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
