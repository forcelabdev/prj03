'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DesktopHeader } from '@/components/desktop-header'
import { BottomNavigation } from '@/components/bottom-navigation'
import { LoginModal } from '@/components/login-modal'

interface UnauthorizedPageProps {
  onLoginClick?: () => void
}

export function UnauthorizedPage({ onLoginClick }: UnauthorizedPageProps) {
  const [showLogin, setShowLogin] = useState(false)

  const handleLoginClick = () => {
    setShowLogin(true)
    onLoginClick?.()
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* Mobil header */}
      <div className="md:hidden">
        <Header onLoginClick={handleLoginClick} onMenuClick={() => {}} onSearchClick={() => {}} />
      </div>
      {/* Masaüstü header */}
      <div className="hidden md:block">
        <DesktopHeader onLoginClick={handleLoginClick} />
      </div>

      {/* İçerik */}
      <main
        className="flex-1 bg-white"
        style={{ minHeight: "264px", padding: "32px 24px", boxSizing: "border-box" }}
      >
        <div style={{ maxWidth: "480px" }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111] mb-3">
            Kişisel Hesap Sayfası
          </h1>
          <p className="text-[#555] text-sm md:text-base mb-5">
            Üzgünüz bu sayfayı görüntülemek için giriş yapmanız gerekmektedir. Devam etmek için lütfen Velobet&apos;e giriş yapın.
          </p>

          {/* Giriş butonu */}
          <button
            onClick={handleLoginClick}
            className="block w-full md:w-auto bg-[#00d4b4] hover:bg-[#00bfa3] text-black font-bold text-sm px-6 py-3 rounded transition-colors mb-4"
          >
            Velobet hesabınıza giriş yapın
          </button>

          <p className="text-[#555] text-sm md:text-base mt-3">
            Bu sayfaya yanlışlıkla mı ulaştınız?{" "}
            <Link href="/casino" className="text-[#00d4b4] underline font-semibold">
              Casino Lobisine geri dönün.
            </Link>
          </p>
        </div>
      </main>

      <Footer />

      {/* Mobil alt navigasyon */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}
