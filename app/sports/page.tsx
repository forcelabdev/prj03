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

const DEMO_USER_ID = "69f5475d5ba9b30488b5ea35"

export default function SportsPage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
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

  
  // Base URL (sportsbook kısmı) - goldenbet570 kullanılıyor çünkü velobet280 SSL sorunu var
  const baseUrl = "https://bbb.goldenbet570.com/sportsbook"
  
  // Aktif iframe URL'si
  const activeIframeUrl = sportUrl ? (activePath ? `${baseUrl}${activePath}` : sportUrl) : null
  
  const hasInitialized = useRef(false)
  const loadedUserId = useRef<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  
  // iframe alanina scroll et
  const scrollToIframe = () => {
    if (iframeContainerRef.current && scrollContainerRef.current) {
      const bannerHeight = bannerRef.current?.offsetHeight || 0
      scrollContainerRef.current.scrollTo({
        top: bannerHeight,
        behavior: 'smooth'
      })
    }
  }
  
  // Path degistir ve iframe'e scroll et
  const navigateToPath = (path: string) => {
    setActivePath(path)
    setTimeout(() => scrollToIframe(), 100)
  }
  
  // iOS tespit
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)



  // Mobil tespit - client side
  useEffect(() => {
    const userAgentMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const screenWidth = window.innerWidth
    const checkMobile = userAgentMobile || screenWidth < 768
    setIsMobile(checkMobile)
  }, [])



  // Iframe'den gelen mesajları dinle - bahis yapıldığında bakiye güncelle
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Güvenlik: sadece bilinen origin'lerden gelen mesajları kabul et
      const allowedOrigins = [
        'https://bbb.goldenbet570.com',
        'https://www.bbb.goldenbet570.com',
        'https://goldenbet570.com',
        'https://velobet280.com',
        'https://www.velobet280.com'
      ]
      
      // Origin kontrolü
      if (!allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '').replace('www.', '')))) {
        return
      }

      const data = event.data
      
      // Bahis yapıldı, bakiye değişti vb. mesajları dinle
      if (
        data?.type === 'BALANCE_UPDATE' ||
        data?.type === 'BET_PLACED' ||
        data?.type === 'BET_SETTLED' ||
        data?.type === 'balanceUpdate' ||
        data?.type === 'bet_placed' ||
        data?.action === 'refreshBalance' ||
        data?.event === 'balance_changed' ||
        data?.balanceChanged ||
        data?.betPlaced
      ) {
        console.log('[v0] Sportsbook mesajı alındı, bakiye güncelleniyor:', data?.type || data?.action || data?.event)
        refreshUser()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [refreshUser])

  // Periyodik bakiye kontrolü - sportsbook açıkken her 30 saniyede bakiyeyi güncelle
  useEffect(() => {
    if (!sportUrl || !user) return
    
    const interval = setInterval(() => {
      refreshUser()
    }, 30000) // 30 saniyede bir bakiye güncelle
    
    return () => clearInterval(interval)
  }, [sportUrl, user, refreshUser])

  // Canlı maç sayılarını çek
  useEffect(() => {
    const fetchSportCounts = async () => {
      try {
        const response = await fetch('/api/sports/live-counts')
        const data = await response.json()
        if (data.success && data.data) {
          // API'den gelen verileri mevcut sporlarla birleştir
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
    // Her 60 saniyede güncelle
    const interval = setInterval(fetchSportCounts, 60000)
    return () => clearInterval(interval)
  }, [])

  // Scroll pozisyonunu takip et - banner gecilince iframe aktif olsun
  useEffect(() => {
    const container = scrollContainerRef.current
    const banner = bannerRef.current
    
    if (!container || !banner || !isMobile) return
    
    const handleScroll = () => {
      const bannerHeight = banner.offsetHeight
      const scrollTop = container.scrollTop
      
      // Banner tamamen scroll edildiyse iframe aktif olsun
      if (scrollTop >= bannerHeight) {
        setIframeActive(true)
      } else {
        setIframeActive(false)
      }
    }
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isMobile, sportUrl])

  // Auth yüklenince oyunu başlat
  useEffect(() => {
    // Auth hâlâ yükleniyorsa bekle
    if (authLoading) return

    // Token var ama user henüz yüklenmediyse bekle (async /auth/me çağrısı devam ediyor)
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
    if (hasToken && !user) {
      // Token var ama user yok - /auth/me henüz dönmedi, bekle
      return
    }

    // Giriş yapmış kullanıcıda DEMO ID asla kullanılmaz
    const userId = user?.id ? user.id : DEMO_USER_ID

    // Aynı kullanıcı için zaten yüklendiyse tekrar yükleme
    if (loadedUserId.current === userId) return

    // Kullanıcı değişti (örn. giriş/çıkış) — state ve cache sıfırla
    if (loadedUserId.current !== null && loadedUserId.current !== userId) {
      setSportUrl(null)
      setIsLoading(true)
      setError(null)
      setRetryCount(0)
      hasInitialized.current = false
      sessionStorage.removeItem(`sport_url_${loadedUserId.current}`)
    }

    hasInitialized.current = true
    loadedUserId.current = userId
    loadSportGame(userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id])

  const loadSportGame = async (userId: string) => {
    // Diğer kullanıcılara ait tüm sport cache'lerini temizle
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('sport_url_') && k !== `sport_url_${userId}`)
      .forEach(k => sessionStorage.removeItem(k))

    // Cache kontrolü — sadece aynı user ID için geçerli
    const cacheKey = `sport_url_${userId}`
    const cachedUrl = sessionStorage.getItem(cacheKey)
    if (cachedUrl && cachedUrl.startsWith("https://")) {
      setSportUrl(cachedUrl)
      setIsIframeLoading(true)
      setIsLoading(false)
      loadedUserId.current = userId
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (!userId || userId.trim() === '') {
        setError("Kullanıcı kimliği alınamadı. Lütfen tekrar giriş yapın.")
        setIsLoading(false)
        return
      }

      // gamesService.launchGame kullan - MERKEZI RATE LIMITING BURADA
      // iOS/macOS icin domain ve mirror parametreleri gerekli
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

      if (result.success && result.launchUrl && result.launchUrl.startsWith("https://")) {
        setIsIframeLoading(true)
        setSportUrl(result.launchUrl)
        // Başarılı URL'yi cache'e kaydet (session boyunca geçerli)
        sessionStorage.setItem(cacheKey, result.launchUrl)
        loadedUserId.current = userId
        setRetryCount(0) // Başarılı olunca retry sayısını sıfırla
      } else if (result.errorCode === 'RATE_LIMITED') {
        // Rate limited - max 2 retry sonra error göster
        if (retryCount < maxRetries) {
          setError("")
          setIsLoading(true)
          setRetryCount(retryCount + 1)
          setTimeout(() => {
            loadSportGame(userId)
          }, 3000)
          return;
        } else {
          setError("Sistem şu anda çok yoğun. Lütfen birkaç dakika sonra tekrar deneyin.")
        }
      } else {
        // Diğer hatalarda da max 2 retry sonra error göster
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

  // isMobile henuz belirlenmedi ise false varsay (SSR uyumu icin)

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
        {/* Main Content - Mobilde scroll container */}
        <main 
          ref={scrollContainerRef}
          className="flex-1 flex flex-col lg:min-h-[calc(100vh-72px)] overflow-y-auto lg:overflow-visible"
          style={{ 
            height: isMobile ? 'calc(100vh - 60px - 70px)' : 'auto',
            paddingBottom: isMobile ? '90px' : '0'
          }}
        >

          {/* Loading State */}
          {(isLoading || (!sportUrl && !error)) && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4] mb-4" />
              <p className="text-gray-400">Spor bahisleri yükleniyor...</p>
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
                    const userId = user?.id || "69d699bc26e1c9806e1fa299"
                    loadSportGame(userId)
                  }}
                  className="px-6 py-3 bg-[#00d4b4] text-black font-bold rounded-lg"
                >
                  Tekrar Dene
                </button>
              )}
            </div>
          )}

          {/* Mobil Ust Alan - Sadece mobilde goster */}
          {sportUrl && !isLoading && !error && (
            <div 
              ref={bannerRef}
              className="w-full flex-shrink-0 lg:hidden bg-[#1a1a1a] overflow-x-visible"
            >
              {/* Ust Navigasyon */}
              <div className="flex items-center border-b border-gray-800" style={{ height: 40 }}>
                {/* Sol Arama Ikonu */}
                <button 
                  onClick={() => navigateToPath("/search")}
                  className="flex items-center justify-center flex-shrink-0 h-full"
                  style={{ width: 28, backgroundColor: "#2a2a2a", color: "#bcbaba" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                
                {/* Orta Menu */}
                <div className="flex items-center gap-2 px-3 overflow-x-auto scrollbar-none flex-1 h-full">
                  <button 
                    onClick={() => navigateToPath("/live")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap ${activePath === "/live" ? "text-[#00d4b4] font-medium" : "text-white"}`}
                  >
                    <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                      <path d="M50.9 34.4L89.1 63 50.9 91.6V34.4zM113 63c0 27.6-22.4 50-50 50S13 90.6 13 63s22.4-50 50-50 50 22.4 50 50zm-10 0c0-22-18-40-40-40S23 41 23 63s18 40 40 40 40-18 40-40z" />
                    </svg>
                    Canlı
                  </button>
                  <button 
                    onClick={() => scrollToIframe()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap text-white"
                  >
                    <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                      <path d="M43.31 96.75H108V79.88H43.31zm0-25.31H108V54.56H43.31zm0-25.31H108V29.25H43.31zm-25.31 0h16.88V29.25H18zm0 50.62h16.88V79.88H18zm0-25.31h16.88V54.56H18z" />
                    </svg>
                    Sporlar
                  </button>
                  <button 
                    onClick={() => navigateToPath("/highlights")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap ${activePath === "/highlights" ? "text-[#00d4b4] font-medium" : "text-white"}`}
                  >
                    <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                      <path d="M98 25.5v-10H88v10H78v-10H68v10H58v-10H48v10H38v-10H28v10H13v85h100v-85H98zm5 75H23v-65h5v5h10v-5h10v5h10v-5h10v5h10v-5h10v5h10v-5h5v65zM81.1 53.7L57.5 77.3 45 64.8l-5.6 5.5 18.1 18.2 29.2-29.2-5.6-5.6z" />
                    </svg>
                    {"Günün Maçı"}
                  </button>
                  <button 
                    onClick={() => navigateToPath("/leagues")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap ${activePath === "/leagues" ? "text-[#00d4b4] font-medium" : "text-white"}`}
                  >
                    <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "currentColor" }}>
                      <path d="M66.9 88.5V77.2h20.6c7.8 0 14.2-6.4 14.2-14.2s-6.4-14.2-14.2-14.2H66.9V37.5h20.6c14.1 0 25.5 11.4 25.5 25.5s-11.4 25.5-25.5 25.5H66.9zm-28.4 0C24.4 88.5 13 77.1 13 63s11.4-25.5 25.5-25.5h20.6v11.3H38.5c-7.8 0-14.2 6.4-14.2 14.2s6.4 14.2 14.2 14.2h20.6v11.3H38.5zm3.9-19.6V57.1h41.2v11.8H42.4z" />
                    </svg>
                    Ligler
                  </button>
                </div>
                
                {/* Sag Kupon Ikonu */}
                <button 
                  className="flex items-center justify-center flex-shrink-0 relative h-full"
                  style={{ width: 36, backgroundColor: "#2a2a2a", color: "#bcbaba" }}
                >
                  <svg viewBox="0 0 126 126" style={{ width: 20, height: 20, fill: "#bcbaba" }}>
                    <path d="M106.2 74.8l-.1-.5.1.5zM17.8 31.6l2.4 13.6 5-.9c.9-.2 1.9.5 2 1.4l.1.7c.2.9-.5 1.9-1.4 2l-5 .9 1.2 6.7 6.8 38.5.1.8V28l-10 1.8c-.7.1-1.3.9-1.2 1.8zM19.8 54.2l.1.5-.1-.5zM89 18H71.8c0 4.8-3.9 8.8-8.8 8.8s-8.8-3.9-8.8-8.8H37c-1.1 0-2 .9-2 2v17.2h6.3c1.2 0 2.2 1 2.2 2.2v.8c0 1.2-1 2.2-2.2 2.2H35V106c0 1.1.9 2 2 2h17.2c0-4.8 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8H89c1.1 0 2-.9 2-2V42.4h-6.3c-1.2 0-2.2-1-2.2-2.2v-.8c0-1.2 1-2.2 2.2-2.2H91V20c-.1-1.1-.9-2-2-2zM65.4 39.4c0-1.2 1-2.2 2.2-2.2h8c1.2 0 2.2 1 2.2 2.2v.8c0 1.2-1 2.2-2.2 2.2h-8c-1.2 0-2.2-1-2.2-2.2v-.8zm-17.1 0c0-1.2 1-2.2 2.2-2.2h8c1.2 0 2.2 1 2.2 2.2v.8c0 1.2-1 2.2-2.2 2.2h-8c-1.2 0-2.2-1-2.2-2.2v-.8zM46.1 54H80v7.2H46.1V54zm0 14.1H80v7.2H46.1v-7.2zm0 14.2H80v7.2H46.1v-7.2zM108.2 94.7l-2.4-13.6-5 .9c-.9.2-1.9-.5-2-1.4l-.1-.7c-.2-.9.5-1.9 1.4-2l5-.9-1.2-6.7-6.8-38.5-.2-.8v67.3l10-1.8c.8-.1 1.4-.9 1.3-1.8z" />
                  </svg>
                  {/* Badge */}
                  <span 
                    className="absolute flex items-center justify-center text-black font-bold"
                    style={{ 
                      top: -4, 
                      right: 4, 
                      width: 16, 
                      height: 16, 
                      borderRadius: "50%", 
                      backgroundColor: "#f5c518", 
                      fontSize: 10 
                    }}
                  >
                    0
                  </span>
                </button>
              </div>

              {/* Spor Kategorileri - Dinamik API verisi */}
              <div className="flex items-center border-b border-gray-800 w-full" style={{ height: 58 }}>
                {/* Sol Ok */}
                <button
                  onClick={() => {
                    const container = document.getElementById('sport-categories-scroll')
                    if (container) container.scrollBy({ left: -200, behavior: 'smooth' })
                  }}
                  className="flex-shrink-0 flex items-center justify-center self-stretch"
                  style={{ width: 20, background: "rgba(68, 68, 68, 0.9)" }}
                >
                  <svg viewBox="0 0 126 126" style={{ width: 12, height: 12, fill: "#aaa" }}>
                    <path d="M81.5 82.9L58.6 60l22.9-23-7.1-7-30 30 30 30 7.1-7.1z" />
                  </svg>
                </button>
                
                {/* Scroll Container */}
                <div 
                  id="sport-categories-scroll"
                  className="flex items-center gap-0 flex-1 h-full"
                  style={{ 
                    overflowX: 'scroll', 
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {sportCounts.map((sport) => (
                    <button 
                      key={sport.id}
                      onClick={() => navigateToPath(`/${sport.id}`)}
                      className={`flex flex-col items-center justify-center gap-0.5 flex-shrink-0 transition-colors h-full ${activePath === `/${sport.id}` ? "bg-gray-700" : "hover:bg-gray-800"}`}
                      style={{ width: 70, minWidth: 70 }}
                    >
                      <div className="relative inline-flex">
                        <img src={sport.icon} alt={sport.name} style={{ width: 20, height: 20 }} />
                        {sport.count > 0 && (
                          <span 
                            className="absolute bg-[#00d4b4] text-black text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center"
                            style={{ top: -4, right: -8, padding: '0 3px' }}
                          >
                            {sport.count}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] whitespace-nowrap ${activePath === `/${sport.id}` ? "text-[#00d4b4]" : "text-white"}`}>{sport.name}</span>
                    </button>
                  ))}
                </div>
                
                {/* Sağ Ok */}
                <button
                  onClick={() => {
                    const container = document.getElementById('sport-categories-scroll')
                    if (container) container.scrollBy({ left: 200, behavior: 'smooth' })
                  }}
                  className="flex-shrink-0 flex items-center justify-center self-stretch"
                  style={{ width: 20, background: "rgba(68, 68, 68, 0.9)" }}
                >
                  <svg viewBox="0 0 126 126" style={{ width: 12, height: 12, fill: "#aaa" }}>
                    <path d="M44.5 85.9L67.4 63 44.5 40l7.1-7 30 30-30 30-7.1-7.1z" />
                  </svg>
                </button>
              </div>

              {/* Banner Slider */}
              <div className="relative w-full h-[232px] lg:h-[330px]">
                <BannerSlider position="slots" />
                <div className="hidden lg:flex absolute right-0 z-10 overflow-hidden" style={{ bottom: "10px", width: "auto", backgroundColor: "rgba(0,0,0,0.72)", clipPath: "polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%)", paddingLeft: "50px" }}>
                  <RecentWinners />
                </div>
              </div>

              {/* Canli / Yaklasan Tabs */}
              <div className="flex">
                <button 
                  onClick={() => navigateToPath("/live")}
                  className={`flex-1 py-3 text-center font-medium relative ${activePath === "/live" || activePath === "" ? "text-white bg-[#00d4b4]" : "text-gray-300 bg-[#333]"}`}
                >
                  <span className="relative">
                    Canlı
                    <sup 
                      className={activePath === "/live" || activePath === "" ? "text-white" : "text-[#00d4b4]"}
                      style={{ fontSize: 10, marginLeft: 2, verticalAlign: "super" }}
                    >
                      {sportCounts.reduce((sum, s) => sum + s.count, 0)}
                    </sup>
                  </span>
                  {activePath !== "/live" && activePath !== "" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00d4b4]" />
                  )}
                </button>
                <button 
                  onClick={() => navigateToPath("/upcoming")}
                  className={`flex-1 py-3 text-center font-medium relative ${activePath === "/upcoming" ? "text-white bg-[#00d4b4]" : "text-gray-300 bg-[#333]"}`}
                >
                  {"Yaklasan Karsilasmalar"}
                  {activePath !== "/upcoming" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00d4b4]" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Sport iframe */}
          {sportUrl && !isLoading && !error && (
            <div 
              ref={iframeContainerRef}
              className="w-full relative"
              style={{ 
                height: isMobile ? 'calc(100vh - 60px - 150px)' : 'auto',
                flexShrink: 0
              }}
              onClick={() => {
                if (isMobile && !iframeActive) {
                  scrollToIframe()
                }
              }}
            >
              {isIframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
                  <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4] mb-4" />
                  <p className="text-gray-400">Spor bahisleri yükleniyor...</p>
                </div>
              )}
              {/* Mobilde iframe aktif degilken tiklanabilir overlay */}
              {isMobile && !iframeActive && (
                <div 
                  className="absolute inset-0 z-[5] cursor-pointer"
                  onClick={() => scrollToIframe()}
                  onTouchStart={() => scrollToIframe()}
                />
              )}
              <iframe
                src={activeIframeUrl || sportUrl}
                className="w-full h-full lg:min-h-[calc(100vh-80px)]"
                style={{ 
                  border: "none", 
                  WebkitOverflowScrolling: "touch",
                  height: isMobile ? '100%' : 'auto',
                  minHeight: isMobile ? 'calc(100vh - 60px - 150px)' : undefined
                }}
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
