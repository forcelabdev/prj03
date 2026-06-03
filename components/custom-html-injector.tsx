'use client'

import { useEffect, useRef } from 'react'

export function CustomHtmlInjector() {
  const containerRef = useRef<HTMLDivElement>(null)
  const injectedRef = useRef(false)

  useEffect(() => {
    // Sadece bir kere inject et
    if (injectedRef.current) return

    const fetchAndInjectCustomHtml = async () => {
      try {
        const res = await fetch('/api/proxy/custom.html')
        if (res.ok) {
          const html = await res.text()
          if (html && html.trim() && containerRef.current) {
            injectedRef.current = true
            
            // HTML'i parse et
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')
            
            // Script olmayan elementleri ekle
            const nonScriptElements = doc.body.querySelectorAll(':not(script)')
            nonScriptElements.forEach(el => {
              containerRef.current?.appendChild(el.cloneNode(true))
            })
            
            // LiveChat icin mobilde widget gosterme ayari
            // Bu ayar script yuklenmeden once yapilmali
            if (!(window as any).__lc) {
              (window as any).__lc = {}
            }
            // Mobilde widget'i gizle - sadece butonla acilsin
            (window as any).__lc.chat_between_groups = false
            
            // Script'leri dinamik olarak ekle ve calistir
            const scripts = doc.querySelectorAll('script')
            scripts.forEach(oldScript => {
              const newScript = document.createElement('script')
              
              // Tum attributeleri kopyala
              Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value)
              })
              
              // Inline script icerigi
              if (oldScript.textContent) {
                newScript.textContent = oldScript.textContent
              }
              
              // Script'i document'e ekle (head veya body)
              if (oldScript.src) {
                newScript.async = true
              }
              document.body.appendChild(newScript)
            })
            
            // Mobilde LiveChat widget'ini CSS ile gizle, desktop'ta göster
            const isMobile = window.innerWidth < 1024
            if (isMobile) {
              const style = document.createElement('style')
              style.textContent = `
                #chat-widget-container,
                #livechat-compact-container,
                #livechat-full,
                .livechat-widget-container {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                }
              `
              document.head.appendChild(style)
              
              // Ayrica API ile de gizle
              const checkLiveChat = setInterval(() => {
                if ((window as any).LiveChatWidget) {
                  (window as any).LiveChatWidget.call('hide')
                  clearInterval(checkLiveChat)
                }
              }, 500)
            } else {
              // Desktop'ta widget'in (sağ alt köşe butonu) göründüğünden emin ol
              const checkLiveChat = setInterval(() => {
                if ((window as any).LiveChatWidget) {
                  (window as any).LiveChatWidget.call('show')
                  clearInterval(checkLiveChat)
                }
              }, 500)
            }
            
            // Noscript elementlerini de ekle
            const noscripts = doc.querySelectorAll('noscript')
            noscripts.forEach(ns => {
              containerRef.current?.appendChild(ns.cloneNode(true))
            })
          }
        }
      } catch {
        // Hata durumunda sessizce devam et
      }
    }

    fetchAndInjectCustomHtml()
  }, [])

  return <div ref={containerRef} suppressHydrationWarning />
}
