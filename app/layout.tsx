import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import { PageTransition } from '@/components/PageTransitions'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'eSawitKu - Platform SaaS Kelapa Sawit Terdepan',
  description: 'Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit dengan fitur lengkap dan teknologi terbaru',
  keywords: 'kelapa sawit, SaaS, platform, manajemen, perkebunan, Indonesia',
  authors: [{ name: 'eSawitKu Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://esawitku.vercel.app'),
  openGraph: {
    title: 'eSawitKu - Platform SaaS Kelapa Sawit Terdepan',
    description: 'Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit',
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXTAUTH_URL || 'https://esawitku.vercel.app',
    siteName: 'eSawitKu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eSawitKu - Platform SaaS Kelapa Sawit Terdepan',
    description: 'Platform SaaS terdepan untuk manajemen perkebunan kelapa sawit',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <PageTransition>
              {children}
            </PageTransition>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#16a34a',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#dc2626',
                    secondary: '#fff',
                  },
                },
                loading: {
                  duration: 6000,
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}