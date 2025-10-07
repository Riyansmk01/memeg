import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import DashboardPage from '@/app/dashboard/page'

describe('DashboardPage', () => {
  beforeEach(() => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    })
  })

  it('renders dashboard for authenticated user', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Selamat datang, Test User!')).toBeInTheDocument()
    expect(screen.getByText('Kelola perkebunan kelapa sawit Anda dengan mudah dan efisien')).toBeInTheDocument()
  })

  it('displays user statistics', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Total Hektar')).toBeInTheDocument()
    expect(screen.getByText('Total Pekerja')).toBeInTheDocument()
    expect(screen.getByText('Pendapatan Bulanan')).toBeInTheDocument()
    expect(screen.getByText('Produktivitas')).toBeInTheDocument()
  })

  it('displays quick actions', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Aksi Cepat')).toBeInTheDocument()
    expect(screen.getByText('Lihat Laporan')).toBeInTheDocument()
    expect(screen.getByText('Kelola Tim')).toBeInTheDocument()
    expect(screen.getByText('Pembayaran')).toBeInTheDocument()
    expect(screen.getByText('Pengaturan')).toBeInTheDocument()
  })

  it('displays recent activities', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Aktivitas Terbaru')).toBeInTheDocument()
    expect(screen.getByText('Laporan bulanan dibuat')).toBeInTheDocument()
    expect(screen.getByText('Tim baru ditambahkan')).toBeInTheDocument()
  })

  it('displays subscription status', () => {
    render(<DashboardPage />)
    
    expect(screen.getByText('Paket Free')).toBeInTheDocument()
    expect(screen.getByText('Kelola Langganan')).toBeInTheDocument()
  })

  it('redirects unauthenticated users', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    // Mock router.push
    const mockPush = jest.fn()
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
    }))

    render(<DashboardPage />)
    
    // Should redirect to signin page
    expect(mockPush).toHaveBeenCalledWith('/auth/signin')
  })
})
