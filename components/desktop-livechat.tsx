'use client'

import { useEffect } from 'react'

export function DesktopLiveChat() {
  useEffect(() => {
    // Sadece desktop'ta yükle
    if (window.innerWidth < 1024) return

    // Script zaten DOM'da varsa tekrar ekleme
    if (document.querySelector('script[src*="cdn.livechatinc.com/tracking.js"]')) return

    ;(window as any).__lc = (window as any).__lc || {}
    ;(window as any).__lc.license = 19641932
    ;(window as any).__lc.integration_name = 'manual_onboarding'
    ;(window as any).__lc.product_name = 'livechat'

    const s = document.createElement('script')
    s.async = true
    s.type = 'text/javascript'
    s.src = 'https://cdn.livechatinc.com/tracking.js'
    document.head.appendChild(s)
  }, [])

  return null
}
