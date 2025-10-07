'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UserSettings {
  name: string
  email: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisible: boolean
    dataSharing: boolean
  }
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisible: true,
      dataSharing: false
    }
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (session?.user) {
      setSettings(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || ''
      }))
    }
  }, [session])

  const handleSettingsChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.name,
          email: settings.email
        }),
      })

      if (response.ok) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: settings.name,
            email: settings.email
          }
        })
        toast.success('Profil berhasil diperbarui!')
      } else {
        toast.error('Gagal memperbarui profil')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memperbarui profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      })

      if (response.ok) {
        toast.success('Password berhasil diubah!')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error('Password lama salah')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengubah password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success('Pengaturan berhasil disimpan!')
      } else {
        toast.error('Gagal menyimpan pengaturan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan pengaturan')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'security', name: 'Keamanan', icon: Lock },
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'privacy', name: 'Privasi', icon: Shield }
  ]

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
            Pengaturan Akun
          </h1>
          <p className="text-gray-600">
            Kelola informasi profil dan preferensi akun Anda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Profil</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">
                          {settings.name.charAt(0) || 'U'}
                        </span>
                      </div>
                      <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                        <Camera className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{settings.name}</h3>
                      <p className="text-gray-600">{settings.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={settings.name}
                          onChange={(e) => handleSettingsChange('name', e.target.value)}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleSettingsChange('email', e.target.value)}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                          placeholder="nama@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Keamanan Akun</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ubah Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Lama
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                            placeholder="Masukkan password lama"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Baru
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                            placeholder="Masukkan password baru"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Konfirmasi Password Baru
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                            placeholder="Ulangi password baru"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {isLoading ? 'Mengubah...' : 'Ubah Password'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Hapus Akun</h3>
                    <p className="text-gray-600 mb-4">
                      Menghapus akun akan menghapus semua data Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <button className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Akun
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan Notifikasi</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-gray-600">Terima notifikasi melalui email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingsChange('notifications.email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
                        <p className="text-gray-600">Terima notifikasi push di browser</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.push}
                          onChange={(e) => handleSettingsChange('notifications.push', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                        <p className="text-gray-600">Terima notifikasi melalui SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.sms}
                          onChange={(e) => handleSettingsChange('notifications.sms', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan Privasi</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Profil Publik</h3>
                        <p className="text-gray-600">Izinkan pengguna lain melihat profil Anda</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.profileVisible}
                          onChange={(e) => handleSettingsChange('privacy.profileVisible', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Berbagi Data</h3>
                        <p className="text-gray-600">Izinkan penggunaan data untuk analisis dan pengembangan</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.dataSharing}
                          onChange={(e) => handleSettingsChange('privacy.dataSharing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Informasi Penting</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Pengaturan privasi ini memengaruhi bagaimana data Anda digunakan dan dibagikan. 
                          Pastikan untuk membaca kebijakan privasi kami untuk informasi lebih lanjut.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
