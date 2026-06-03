"use client"

import { useEffect, useState, useRef } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { DesktopHeader } from "@/components/desktop-header"
import { DesktopLeftSidebar } from "@/components/desktop-left-sidebar"
import BannerSlider from "@/components/banner-slider"
import { RecentWinners } from "@/components/recent-winners"
import { LoginModal } from "@/components/login-modal"
import { SidebarMenu } from "@/components/sidebar-menu"

interface SportCount {
  id: string
  name: string
  icon: string
  count: number
}

export default function YuksekOranPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [activePath, setActivePath] = useState<string>("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sportCounts, setSportCounts] = useState<SportCount[]>([
    { id: "soccer-1", name: "Futbol", icon: "/sports-icons/futbol.svg", count: 0 },
    { id: "basketball-2", name: "Basketbol", icon: "/sports-icons/basketbol.svg", count: 0 },
    { id: "tennis-5", name: "Tenis", icon: "/sports-icons/tenis.svg", count: 0 },
    { id: "volleyball-23", name: "Voleybol", icon: "/sports-icons/voleybol.svg", count: 0 },
    { id: "table-tennis-20", name: "Masa Tenisi", icon: "/sports-icons/masa-tenisi.svg", count: 0 },
    { id: "ice-hockey-4", name: "Buz Hokeyi", icon: "/sports-icons/buz-hokeyi.svg", count: 0 },
    { id: "efighting-304", name: "E-Fighting", icon: "/sports-icons/e-fighting.svg", count: 0 },
    { id: "golf-9", name: "Golf", icon: "/sports-icons/golf.svg", count: 0 },
    { id: "handball-6", name: "Hentbol", icon: "/sports-icons/hentbol.svg", count: 0 },
    { id: "cricket-21", name: "Kriket", icon: "/sports-icons/kriket.svg", count: 0 },
  ])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)

  const navigateToPath = (path: string) => {
    setActivePath(path)
  }

  // Mobil tespit
  useEffect(() => {
    const userAgentMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const screenWidth = window.innerWidth
    setIsMobile(userAgentMobile || screenWidth < 768)
  }, [])

  // Canlı maç sayılarını çek
  useEffect(() => {
    const fetchSportCounts = async () => {
      try {
        const response = await fetch("/api/sports/live-counts")
        const data = await response.json()
        if (data.success && data.data) {
          setSportCounts((prev) =>
            prev.map((sport) => {
              const apiSport = data.data.find(
                (s: SportCount) => s.id === sport.id || s.name === sport.name
              )
              return apiSport ? { ...sport, count: apiSport.count } : sport
            })
          )
        }
      } catch {
        // sessiz hata
      }
    }
    fetchSportCounts()
    const interval = setInterval(fetchSportCounts, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SidebarMenu isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header
          onMenuClick={() => setShowSidebar(true)}
          onLoginClick={() => setShowLoginModal(true)}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setShowLoginModal(true)} />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopLeftSidebar />
        </div>

        {/* Main Content */}
        <main
          ref={scrollContainerRef}
          className="flex-1 flex flex-col overflow-y-auto lg:overflow-visible"
          style={{
            height: isMobile ? "calc(100vh - 60px - 70px)" : "auto",
            paddingBottom: isMobile ? "90px" : "0",
          }}
        >
          {/* Üst Navigasyon + Spor Kategorileri */}
          <div
            ref={bannerRef}
            className="w-full flex-shrink-0 bg-[#1a1a1a]"
          >
            {/* Tab Bar: Arama / Canlı / Sporlar / Günün Maçı / Ligler */}
            <div className="flex items-center border-b border-gray-800" style={{ height: 40 }}>
              <button
                className="flex items-center justify-center flex-shrink-0 h-full"
                style={{ width: 28, backgroundColor: "rgb(42,42,42)", color: "rgb(188,186,186)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div className="flex items-center gap-2 px-3 overflow-x-auto flex-1 h-full" style={{ scrollbarWidth: "none" }}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap text-white">
                  <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                    <path d="M50.9 34.4L89.1 63 50.9 91.6V34.4zM113 63c0 27.6-22.4 50-50 50S13 90.6 13 63s22.4-50 50-50 50 22.4 50 50zm-10 0c0-22-18-40-40-40S23 41 23 63s18 40 40 40 40-18 40-40z" />
                  </svg>
                  Canlı
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap text-white">
                  <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                    <path d="M43.31 96.75H108V79.88H43.31zm0-25.31H108V54.56H43.31zm0-25.31H108V29.25H43.31zm-25.31 0h16.88V29.25H18zm0 50.62h16.88V79.88H18zm0-25.31h16.88V54.56H18z" />
                  </svg>
                  Sporlar
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap text-white">
                  <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                    <path d="M98 25.5v-10H88v10H78v-10H68v10H58v-10H48v10H38v-10H28v10H13v85h100v-85H98zm5 75H23v-65h5v5h10v-5h10v5h10v-5h10v5h10v-5h10v5h10v-5h5v65zM81.1 53.7L57.5 77.3 45 64.8l-5.6 5.5 18.1 18.2 29.2-29.2-5.6-5.6z" />
                  </svg>
                  Günün Maçı
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap text-white">
                  <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                    <path d="M66.9 88.5V77.2h20.6c7.8 0 14.2-6.4 14.2-14.2s-6.4-14.2-14.2-14.2H66.9V37.5h20.6c14.1 0 25.5 11.4 25.5 25.5s-11.4 25.5-25.5 25.5H66.9zm-7.8 0H38.5C24.4 88.5 13 77.1 13 63s11.4-25.5 25.5-25.5h20.6v11.3H38.5c-7.8 0-14.2 6.4-14.2 14.2s6.4 14.2 14.2 14.2h20.6V88.5zM40 57.4h46.2v11.3H40z" />
                  </svg>
                  Ligler
                </button>
              </div>
              <button className="flex items-center justify-center flex-shrink-0 h-full px-2" style={{ color: "#aaa", position: "relative" }}>
                <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                  <path d="M103 33H85V23H41v10H23c-5.5 0-10 4.5-10 10v60h100V43c0-5.5-4.5-10-10-10zM51 33V33h24v0H51zm52 60H23V53h80v40z" />
                </svg>
                <span className="absolute top-1.5 right-1 bg-[#f0a500] text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">0</span>
              </button>
            </div>

            {/* Breadcrumb */}
            <div
              className="flex items-center gap-2 px-3 border-b border-gray-800"
              style={{ height: 40, backgroundColor: "#1a1a1a" }}
            >
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center"
                style={{ color: "#aaa" }}
              >
                <svg viewBox="0 0 126 126" style={{ width: 16, height: 16, fill: "currentColor" }}>
                  <path d="M81.5 82.9L58.6 60l22.9-23-7.1-7-30 30 30 30 7.1-7.1z" />
                </svg>
              </button>
              <span style={{ color: "#aaa", fontSize: 13 }}>
                Özel Oran{" "}
                <span style={{ color: "#666" }}>»</span>{" "}
                <span style={{ color: "#ccc" }}>Dünya</span>
              </span>
            </div>

            {/* Spor Kategorileri */}
            <div
              className="flex items-center border-b border-gray-800 w-full"
              style={{ height: 58 }}
            >
              {/* Sol Ok */}
              <button
                onClick={() => {
                  const container = document.getElementById("sport-categories-scroll")
                  if (container) container.scrollBy({ left: -200, behavior: "smooth" })
                }}
                className="flex-shrink-0 flex items-center justify-center self-stretch"
                style={{ width: 20, background: "rgba(68,68,68,0.9)" }}
              >
                <svg viewBox="0 0 126 126" style={{ width: 12, height: 12, fill: "#aaa" }}>
                  <path d="M81.5 82.9L58.6 60l22.9-23-7.1-7-30 30 30 30 7.1-7.1z" />
                </svg>
              </button>

              {/* Scroll Container */}
              <div
                id="sport-categories-scroll"
                className="flex items-center flex-1 h-full"
                style={{
                  overflowX: "scroll",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {sportCounts.map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => navigateToPath(`/${sport.id}`)}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-shrink-0 h-full transition-colors ${
                      activePath === `/${sport.id}` ? "bg-gray-700" : "hover:bg-gray-800"
                    }`}
                    style={{ width: 70, minWidth: 70 }}
                  >
                    <div className="relative inline-flex">
                      <img
                        src={sport.icon}
                        alt={sport.name}
                        style={{ width: 20, height: 20 }}
                      />
                      {sport.count > 0 && (
                        <span
                          className="absolute bg-[#00d4b4] text-black font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center"
                          style={{ top: -4, right: -8, padding: "0 3px", fontSize: 8 }}
                        >
                          {sport.count}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] whitespace-nowrap ${
                        activePath === `/${sport.id}` ? "text-[#00d4b4]" : "text-white"
                      }`}
                    >
                      {sport.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sağ Ok */}
              <button
                onClick={() => {
                  const container = document.getElementById("sport-categories-scroll")
                  if (container) container.scrollBy({ left: 200, behavior: "smooth" })
                }}
                className="flex-shrink-0 flex items-center justify-center self-stretch"
                style={{ width: 20, background: "rgba(68,68,68,0.9)" }}
              >
                <svg viewBox="0 0 126 126" style={{ width: 12, height: 12, fill: "#aaa" }}>
                  <path d="M44.5 85.9L67.4 63 44.5 40l7.1-7 30 30-30 30-7.1-7.1z" />
                </svg>
              </button>
            </div>
          </div>

          {/* İçerik Alanı - iframe yok, sadece mesaj */}
          <div
            className="flex items-center justify-center"
            style={{ backgroundColor: "#1a1a1a", minHeight: 120 }}
          >
            <p style={{ color: "#9ca3af", fontSize: 14 }}>
              Şu anda turnuva bulunmamaktadır
            </p>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
