import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import HomePage from '@/app/page'

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('HomePage', () => {
  beforeEach(() => {
    // Mock useSession to return unauthenticated user
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })
  })

  it('renders homepage with company information', () => {
    render(<HomePage />)
    
    expect(screen.getByText('eSawitKu')).toBeInTheDocument()
    expect(screen.getByText('Platform SaaS')).toBeInTheDocument()
    expect(screen.getByText('Kelapa Sawit')).toBeInTheDocument()
    expect(screen.getByText('Terdepan di Indonesia')).toBeInTheDocument()
  })

  it('displays authentication buttons for unauthenticated users', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Masuk')).toBeInTheDocument()
    expect(screen.getByText('Daftar')).toBeInTheDocument()
  })

  it('displays dashboard button for authenticated users', () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    })

    render(<HomePage />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('displays pricing plans', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Pilih Paket yang Tepat')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('displays payment methods', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Metode Pembayaran Fleksibel')).toBeInTheDocument()
    expect(screen.getByText('Transfer Bank')).toBeInTheDocument()
    expect(screen.getByText('QR Code')).toBeInTheDocument()
    expect(screen.getByText('E-Wallet')).toBeInTheDocument()
    expect(screen.getByText('Kartu Kredit')).toBeInTheDocument()
  })

  it('displays features section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Fitur Unggulan eSawitKu')).toBeInTheDocument()
    expect(screen.getByText('Analisis Data Real-time')).toBeInTheDocument()
    expect(screen.getByText('Mobile-First Design')).toBeInTheDocument()
    expect(screen.getByText('Manajemen Tim')).toBeInTheDocument()
    expect(screen.getByText('Otomasi Proses')).toBeInTheDocument()
  })
})
