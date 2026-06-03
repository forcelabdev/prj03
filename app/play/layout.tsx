import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Oyun',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100%' }}>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', width: '100vw', height: '100vh', background: '#000' }}>
        {children}
      </body>
    </html>
  )
}
