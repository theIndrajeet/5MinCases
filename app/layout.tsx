import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { PWAProvider } from './providers/pwa-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '5 Min Case - Legal Doomscroll',
  description: 'Tight legal summaries: 60-word TL;DR, 5-minute reads, swipe through latest judgments',
  keywords: ['legal', 'case law', 'judgments', 'court decisions', 'legal research'],
  authors: [{ name: '5 Min Case' }],
  creator: '5 Min Case',
  publisher: '5 Min Case',
  metadataBase: new URL('https://theindrajeet.github.io/5MinCases'),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: '5 Min Case - Legal Doomscroll',
    description: 'Case closed, in 60 words. Your daily legal scroll.',
    url: 'https://5mincase.com',
    siteName: '5 Min Case',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '5 Min Case - Legal Doomscroll',
    description: 'Case closed, in 60 words. Your daily legal scroll.',
    creator: '@5mincase',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '5 Min Case',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': '5 Min Case',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0B2B26' },
    { media: '(prefers-color-scheme: dark)', color: '#0B2B26' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-pale-mint dark:bg-neutral-950`}>
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  )
}
