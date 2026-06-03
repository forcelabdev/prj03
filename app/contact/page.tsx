"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"

export default function ContactPage() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        onLoginClick={() => setShowLogin(true)}
      />
      
      <main className="pb-24">
        {/* Contact Info Section */}
        <div className="px-4 py-8">
          <p className="text-gray-300 mb-4">
            Her türlü soru ve görüşleriniz için bizlere aşağıdaki e-posta adreslerinden ulaşabilirsiniz:
          </p>
          
          <p className="mb-2">
            Destek :{" "}
            <a href="mailto:destek@velobet2026.com" className="text-[#00d4b4]">
              destek@velobet2026.com
            </a>
          </p>
          
          <p className="mb-2">
            Reklam:{" "}
            <a href="mailto:marketing@velobet2026.com" className="text-[#00d4b4]">
              marketing@velobet2026.com
            </a>
          </p>
        </div>

        {/* Footer Section with Links */}
        <div className="bg-zinc-900 px-4 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="text-3xl font-bold">
              <span className="text-[#00d4b4]">Velo</span>
              <span className="text-white">bet</span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <a href="#" className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center border border-gray-600">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <Link href="/terms" className="block text-center text-white font-semibold py-3 border-b border-gray-700">
              GENEL KURALLAR VE ŞARTLAR
            </Link>
            <Link href="/faq" className="block text-center text-white font-semibold py-3 border-b border-gray-700">
              SIK SORULAN SORULAR
            </Link>
            <Link href="/contact" className="block text-center text-white font-semibold py-3">
              İLETİŞİM
            </Link>
          </div>
        </div>

        {/* Bottom Description */}
        <div className="px-4 py-6 border-t-4 border-[#00d4b4]">
          <p className="text-gray-300 text-sm mb-4">
            <span className="text-[#00d4b4] font-bold">Velobet</span>, Bahis Sektöründe ilkleri hedefleyen, Kullanıcı Memnuniyetini ve yüksek hizmet kalitesini merkeze alan yenilikçi bir Bahis ve Şans Oyunları Platformudur.
          </p>
          <p className="text-gray-300 text-sm mb-4">
            Tüm Dünyadaki Spor Dallarında, 125'ten fazla branşta ve her ay 40.000'in üzerinde Canlı Bahis seçeneğiyle, Oyuncularına zengin içerikli ve yüksek oranlı bir oyun deneyimi sunar.
          </p>
          <p className="text-gray-300 text-sm mb-4">
            Sadece oran avantajıyla değil, sunduğu benzersiz bahis seçenekleriyle de eğlenceyi ve heyecanı bir araya getirir.
          </p>
          <p className="text-gray-300 text-sm mb-4">
            <span className="text-[#00d4b4] font-bold">Velobet</span>, geniş kapsamlı Canlı Casino bölümünde; Blackjack, Rulet, Baccarat gibi Klasik Masa Oyunlarının yanı sıra piyasanın en yüksek ödüllerini dağıtan Slot Oyunları ile oyuncularına gerçek bir kumarhane atmosferi yaşatır. Şansınızı en sevilen oyunlarda deneyin, büyük kazançlara siz de ortak olun.
          </p>
          <p className="text-gray-300 text-sm mb-4">
            Sürekli güncellenen Promosyonlarımızla, Üyelerimizin keyifli ve kazançlı bir ortamda oyun oynamasını hedeflerken, 7 gün 24 saat kesintisiz çalışan deneyimli{" "}
            <span className="text-[#00d4b4]">Destek Ekibimizle</span> daima yanınızdayız. Tüm para yatırma ve çekme işlemleri hızlı, güvenli ve sorunsuz bir şekilde gerçekleşir.
          </p>
          <p className="text-gray-300 text-sm">
            Lütfen sorumlu bahis oynayınız. ©{" "}
            <span className="text-[#00d4b4] font-bold">Velobet</span> 2026 – Tüm Hakları Saklıdır.
          </p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
