'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomNavigation } from '@/components/bottom-navigation'
import { Header } from '@/components/header'
import { DesktopHeader } from '@/components/desktop-header'
import { DesktopLeftSidebar } from '@/components/desktop-left-sidebar'
import { useAuth } from '@/contexts/auth-context'
import { gamesService } from '@/lib/services/games-service'
import BannerSlider from '@/components/banner-slider'
import { RecentWinners } from '@/components/recent-winners'
import { LoginModal } from '@/components/login-modal'
import { SidebarMenu } from '@/components/sidebar-menu'

const DEMO_USER_ID = "699732686445e9caa08caba9"

export default function AviatorPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 2
  const [activePath, setActivePath] = useState<string>('')
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
        behavior: 'smooth',
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
  }, [isMobile, gameUrl])

  useEffect(() => {
    if (hasInitialized.current) return
    if (authLoading) return

    const userId = user?.id || DEMO_USER_ID

    hasInitialized.current = true

    loadGame(userId)
  }, [user?.id, authLoading])

  const loadGame = async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!userId || userId.trim() === '') {
        setError('Kullanıcı kimliği alınamadı.')
        setIsLoading(false)
        return
      }

      const result = await gamesService.launchGame(
        userId,
        'mini-spribe',  // vendorCode
        'Aviator',      // gameCode
        'tr',           // language
        'betinovi',     // distribution
        '',             // numericId
        'velobet.com',  // domain
        280             // mirror
      )

      if (result.success && result.launchUrl) {
        setIsIframeLoading(true)
        setGameUrl(result.launchUrl)
        setRetryCount(0)
      } else if (result.errorCode === 'RATE_LIMITED') {
        if (retryCount < maxRetries) {
          setError('Bağlantı kuruluyor...')
          setRetryCount(retryCount + 1)
          setTimeout(() => {
            loadGame(userId)
          }, 3000)
          return
        } else {
          setError('Sistem yoğun. Lütfen sonra tekrar deneyin.')
        }
      } else {
        if (retryCount < maxRetries) {
          setError('Aviator yükleniyor...')
          setRetryCount(retryCount + 1)
          setTimeout(() => {
            loadGame(userId)
          }, 3000)
          return
        } else {
          setError('Oyun şu anda açılamıyor. Lütfen daha sonra tekrar deneyin.')
        }
      }
    } catch (err) {
      if (retryCount < maxRetries) {
        setError('Bağlantı kuruluyor...')
        setRetryCount(retryCount + 1)
        setTimeout(() => {
          loadGame(userId)
        }, 3000)
      } else {
        setError('Bağlantı hatası.')
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
        <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLoginModal(true)} />
      </div>

      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setShowLoginModal(true)} />
      </div>

      <div className="flex">
        {/* Aviator sayfasında sidebar gösterilmez */}

        <main
          ref={scrollContainerRef}
          className="w-full flex flex-col lg:min-h-[calc(100vh-72px)] overflow-y-auto lg:overflow-visible"
          style={{
            height: isMobile ? 'calc(100vh - 60px - 70px)' : 'auto',
            paddingBottom: isMobile ? '90px' : '0',
          }}
        >
          {(isLoading || (!gameUrl && !error)) && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4] mb-4" />
              <p className="text-gray-400">Aviator yükleniyor...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <p className="text-lg mb-4 text-center text-red-500">{error}</p>
              <button
                onClick={() => {
                  hasInitialized.current = false
                  const userId = user?.id || DEMO_USER_ID
                  loadGame(userId)
                }}
                className="px-6 py-3 bg-[#00d4b4] text-black font-bold rounded-lg"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {gameUrl && !isLoading && !error && (
            <div
              ref={bannerRef}
              className="w-full flex-shrink-0 lg:hidden bg-[#1a1a1a] overflow-x-visible"
              style={{ minHeight: 100 }}
            >
              <BannerSlider />
            </div>
          )}

          {gameUrl && !isLoading && !error && (
            <div ref={iframeContainerRef} className="flex-1 overflow-hidden">
              <iframe
                src={gameUrl}
                title="Aviator Game"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                onLoad={() => setIsIframeLoading(false)}
                scrolling="no"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              {isIframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4]" />
                </div>
              )}
            </div>
          )}

          {!isMobile && gameUrl && !isLoading && !error && (
            <div className="hidden lg:block mt-8 px-6 pb-6">
              <RecentWinners />
            </div>
          )}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
