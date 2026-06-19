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

interface SportCount {
  id: string
  name: string
  icon: string
  count: number
}

const DEMO_USER_ID = "699732686445e9caa08caba9"

export default function SportsTakiPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [sportUrl, setSportUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 2
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
    { id: "biathlon-31", name: "Biathlon", icon: "/sports-icons/biathlon.svg", count: 0 },
    { id: "cycling-17", name: "Bisiklet", icon: "/sports-icons/bisiklet.svg", count: 0 },
    { id: "counter-strike-109", name: "CS", icon: "/sports-icons/cs.svg", count: 0 },
    { id: "darts-22", name: "Darts", icon: "/sports-icons/darts.svg", count: 0 },
    { id: "rugby-12", name: "Rugby", icon: "/sports-icons/rugby.svg", count: 0 },
    { id: "futsal-29", name: "Futsal", icon: "/sports-icons/futsal.svg", count: 0 },
    { id: "mma-117", name: "MMA", icon: "/sports-icons/mma.svg", count: 0 },
    { id: "snooker-19", name: "Snooker", icon: "/sports-icons/snooker.svg", count: 0 },
    { id: "baseball-3", name: "Beyzbol", icon: "/sports-icons/beyzbol.svg", count: 0 },
  ])
  const [activePath, setActivePath] = useState<string>("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [iframeActive, setIframeActive] = useState(false)

  const baseUrl = "https://bbb.goldenbet570.com/sportsbook"
  const activeIframeUrl = sportUrl ? (activePath ? `${baseUrl}${activePath}` : sportUrl) : null
  
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
  
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

  useEffect(() => {
    const userAgentMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const screenWidth = window.innerWidth
    const checkMobile = userAgentMobile || screenWidth < 768
    setIsMobile(checkMobile)
  }, [])

  useEffect(() => {
    const fetchSportCounts = async () => {
      try {
        const response = await fetch('/api/sports/live-counts')
        const data = await response.json()
        if (data.success && data.data) {
          setSportCounts(prev => prev.map(sport => {
            const apiSport = data.data.find((s: SportCount) => s.id === sport.id || s.name === sport.name)
            return apiSport ? { ...sport, count: apiSport.count } : sport
          }))
        }
      } catch (error) {
        console.error('[v0] Error fetching sport counts:', error)
      }
    }
    
    fetchSportCounts()
    const interval = setInterval(fetchSportCounts, 60000)
    return () => clearInterval(interval)
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
  }, [isMobile, sportUrl])

  useEffect(() => {
    if (hasInitialized.current) return
    if (authLoading) return
    
    const userId = user?.id || DEMO_USER_ID
    hasInitialized.current = true
    
    loadSportGame(userId)
  }, [user?.id, authLoading])

  const loadSportGame = async (userId: string) => {
    // Cache kontrolü — aynı user için sessionStorage'da URL varsa direkt kullan
    const cacheKey = `sport_url_${userId}`
    const cachedUrl = sessionStorage.getItem(cacheKey)
    if (cachedUrl && cachedUrl.startsWith("https://")) {
      setSportUrl(cachedUrl)
      setIsIframeLoading(true)
      setIsLoading(false)
      return
    }

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
        setSportUrl(result.launchUrl)
        // Başarılı URL'yi cache'e kaydet (session boyunca geçerli)
        sessionStorage.setItem(cacheKey, result.launchUrl)
        setRetryCount(0)
      } else if (result.errorCode === 'RATE_LIMITED') {
        if (retryCount < maxRetries) {
          setError("Bağlantı kuruluyor, lütfen bekleyiniz...")
          setRetryCount(retryCount + 1)
          setTimeout(() => {
            loadSportGame(userId)
          }, 3000)
          return;
        } else {
          setError("Sistem şu anda çok yoğun. Lütfen birkaç dakika sonra tekrar deneyin.")
        }
      } else {
        if (retryCount < maxRetries) {
          setError("")
          setIsLoading(true)
          setRetryCount(retryCount + 1)
          setTimeout(() => {
            loadSportGame(userId)
          }, 3000)
          return;
        } else {
          setError(result.error || "Spor bahisleri yüklenemedi. Lütfen daha sonra tekrar deneyin.")
        }
      }
    } catch (err) {
      if (retryCount < maxRetries) {
        setError("")
        setIsLoading(true)
        setRetryCount(retryCount + 1)
        setTimeout(() => {
          loadSportGame(userId)
        }, 3000)
      } else {
        setError("Bağlantı hatası. Lütfen daha sonra tekrar deneyin.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SidebarMenu isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      
      <div className="lg:hidden">
        <Header 
          onMenuClick={() => setShowSidebar(true)} 
          onLoginClick={() => setShowLoginModal(true)} 
        />
      </div>
      
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setShowLoginModal(true)} />
      </div>

      <div className="flex">
        <main 
          ref={scrollContainerRef}
          className="flex-1 flex flex-col lg:min-h-[calc(100vh-72px)] overflow-y-auto lg:overflow-visible"
          style={{ 
            height: isMobile ? 'calc(100vh - 60px - 70px)' : 'auto',
            paddingBottom: isMobile ? '90px' : '0'
          }}
        >

          {(isLoading || (!sportUrl && !error)) && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4] mb-4" />
              <p className="text-gray-400">Spor bahisleri yükleniyor...</p>
            </div>
          )}

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
                    loadSportGame(userId)
                  }}
                  className="px-6 py-3 bg-[#00d4b4] text-black font-bold rounded-lg"
                >
                  Tekrar Dene
                </button>
              )}
            </div>
          )}

          {sportUrl && !isLoading && !error && (
            <>
              <div 
                ref={bannerRef}
                className="w-full"
              >
                <BannerSlider />
              </div>

              <div 
                ref={iframeContainerRef}
                className="w-full flex-1"
              >
                {activeIframeUrl ? (
                  <>
                    {isIframeLoading && (
                      <div className="flex items-center justify-center h-96">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00d4b4]" />
                      </div>
                    )}
                    <iframe
                      src={activeIframeUrl}
                      className="w-full h-full border-0"
                      style={{ minHeight: '60vh' }}
                      allow="geolocation; microphone; camera"
                      onLoad={() => setIsIframeLoading(false)}
                    />
                  </>
                ) : (
                  <RecentWinners />
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
