"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { DesktopHeader } from "@/components/desktop-header"
import { DesktopLeftSidebar } from "@/components/desktop-left-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { gamesService } from "@/lib/services/games-service"
import BannerSlider from "@/components/banner-slider"
import { RecentWinners } from "@/components/recent-winners"
import { LoginModal } from "@/components/login-modal"
import { SidebarMenu } from "@/components/sidebar-menu"

const DEMO_USER_ID = "699732686445e9caa08caba9"

export default function LiveBettingPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [liveUrl, setLiveUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 2
  const [activePath, setActivePath] = useState<string>("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [iframeActive, setIframeActive] = useState(false)

  const hasInitialized = useRef(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  
  const scrollToIframe = () => {
    if (iframeContainerRef.current && scrollContainerRef.current) {
      const bannerHeight = bannerRef.current?.offsetHeight || 0
      scrollContainerRef.current.scrollTo({
        top: bannerHeight,
        behavior: 'smooth'
      })
    }
  }
  
  const navigateToPath = (path: string) => {
    setActivePath(path)
    setTimeout(() => scrollToIframe(), 100)
  }

  useEffect(() => {
    const userAgentMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const screenWidth = window.innerWidth
    const checkMobile = userAgentMobile || screenWidth < 768
    setIsMobile(checkMobile)
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    const banner = bannerRef.current
    
    if (!container || !banner || !isMobile) return
    
    const handleScroll = () => {
      const bannerHeight = banner.offsetHeight
      const scrollTop = container.scrollTop
      
      if (scrollTop >= bannerHeight) {
        setIframeActive(true)
      } else {
        setIframeActive(false)
      }
    }
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isMobile, liveUrl])

  useEffect(() => {
    if (hasInitialized.current) return
    if (authLoading) return
    
    const userId = user?.id || DEMO_USER_ID
    hasInitialized.current = true
    
    loadLiveGame(userId)
  }, [user?.id, authLoading])

  const loadLiveGame = async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!userId || userId.trim() === '') {
        setError("Kullanıcı kimliği alınamadı")
        setIsLoading(false)
        return
      }

      const result = await gamesService.launchGame(
        userId,
        "sport-bbbet",
        "lobby",
        "tr",
        "betinovi",
        "",
        "velobet.com",
        280
      )

      if (result.success && result.launchUrl) {
        setIsIframeLoading(true)
        setLiveUrl(result.launchUrl)
        retryCountRef.current = 0
      } else if (result.errorCode === 'RATE_LIMITED') {
        if (retryCountRef.current < maxRetries) {
          setError("Bağlantı kuruluyor, lütfen bekleyiniz...")
          retryCountRef.current++
          setTimeout(() => { loadLiveGame(userId) }, 3000)
          return;
        } else {
          setError("Sistem şu anda çok yoğun. Lütfen birkaç dakika sonra tekrar deneyin.")
        }
      } else {
        if (retryCountRef.current < maxRetries) {
          setError("Canlı bahisler yükleniyor...")
          retryCountRef.current++
          setTimeout(() => { loadLiveGame(userId) }, 3000)
          return;
        } else {
          setError(result.error || "Canlı bahisler yüklenemedi. Lütfen daha sonra tekrar deneyin.")
        }
      }
    } catch (err) {
      if (retryCountRef.current < maxRetries) {
        setError("Bağlantı kuruluyor...")
        retryCountRef.current++
        setTimeout(() => { loadLiveGame(userId) }, 3000)
      } else {
        setError("Bağlantı hatası. Lütfen daha sonra tekrar deneyin.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* Mobile Sidebar */}
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
          className="flex-1 flex flex-col lg:min-h-[calc(100vh-72px)] overflow-y-auto lg:overflow-visible"
          style={{ 
            height: isMobile ? 'calc(100vh - 60px - 70px)' : 'auto',
            paddingBottom: isMobile ? '90px' : '0'
          }}
        >
          {/* Loading State */}
          {(isLoading || (!liveUrl && !error)) && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4] mb-4" />
              <p className="text-gray-400">Canlı bahisler yükleniyor...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <p className={`text-lg mb-4 text-center ${error.includes("giriş") ? "text-yellow-400" : "text-red-500"}`}>
                {error}
              </p>
              {error.includes("giriş") ? (
                <a
                  href="/giris"
                  className="px-6 py-3 bg-[#00d4b4] text-black font-bold rounded-lg"
                >
                  Giriş Yap
                </a>
              ) : (
                <button
                  onClick={() => {
                    hasInitialized.current = false
                    const userId = user?.id || DEMO_USER_ID
                    loadLiveGame(userId)
                  }}
                  className="px-6 py-3 bg-[#00d4b4] text-black font-bold rounded-lg"
                >
                  Tekrar Dene
                </button>
              )}
            </div>
          )}

          {/* Live Betting iframe */}
          {liveUrl && !isLoading && !error && (
            <div 
              ref={iframeContainerRef}
              className="flex-1 w-full relative overflow-hidden" 
              style={{ minHeight: "400px" }}
            >
              {isIframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
                  <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4] mb-4" />
                  <p className="text-gray-400">Canlı bahisler yükleniyor...</p>
                </div>
              )}
              <iframe
                src={liveUrl}
                className="w-full h-full"
                style={{ border: "none", WebkitOverflowScrolling: "touch" }}
                allow="fullscreen; autoplay"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-modals"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setIsIframeLoading(false)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Nav */}
      <BottomNavigation />
    </div>
  )
}
