'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DesktopHeader } from '@/components/desktop-header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col">
      {/* Mobil header */}
      <div className="md:hidden">
        <Header />
      </div>
      {/* Masaüstü header */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>

      {/* İçerik */}
      <main
        className="flex-1 bg-white"
        style={{ minHeight: "264px", padding: "32px 24px", boxSizing: "border-box" }}
      >
        <div style={{ maxWidth: "480px" }}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111] mb-3">
            Bir sorun oluştu...
          </h1>
          <p className="text-[#555] text-sm md:text-base mb-2">
            Üzgünüz, aradığınız sayfa bulunamadı.
          </p>
          <p className="text-[#555] text-sm md:text-base mb-7">
            Bu sayfaya yanlışlıkla mı ulaştınız? Lütfen Casino Lobisine geri dönün.
          </p>
          <Link
            href="/casino"
            className="inline-block bg-[#00d4b4] hover:bg-[#00bfa3] text-black font-bold text-sm px-6 py-3 rounded transition-colors"
          >
            Casino&apos;ya geri dön
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
