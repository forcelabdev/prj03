import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { Suspense } from 'react'
import { AffiliateTracker } from '@/components/affiliate-tracker'
import { Preloader } from '@/components/preloader'
import { CustomHtmlInjector } from '@/components/custom-html-injector'
import { DesktopLiveChat } from '@/components/desktop-livechat'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

// Site settings'ten favicon çek
async function getSiteSettings() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5 saniye timeout
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-settings`, {
      cache: 'force-cache',
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log("Site settings fetch error:", error)
  }
  
  return null
}

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()
  // Favicon: API'den geliyorsa o'nu, yoksa fallback static icon
  const favicon = siteSettings?.favicon ? siteSettings.favicon : undefined
  
  return {
    title: 'Velobet - Canli Bahis ve Casino',
    description: 'Velobet ile canli bahis, casino oyunlari ve daha fazlasi. En yuksek oranlar ve bonuslar.',
    generator: 'v0.app',
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'VELOBET',
    },
    icons: favicon ? {
      icon: [
        {
          url: favicon,
          type: 'image/svg+xml',
        },
      ],
      apple: favicon,
    } : undefined,
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a1a',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VELOBET" />
        <script src="/register-sw.js" async></script>
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background`}>
        <Preloader />
        <Suspense fallback={null}>
          <AffiliateTracker />
        </Suspense>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <CustomHtmlInjector />
        <DesktopLiveChat />
        <Analytics />
      </body>
    </html>
  )
}
