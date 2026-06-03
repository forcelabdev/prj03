"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { DesktopHeader } from "@/components/desktop-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { CategoryPopup } from "@/components/category-popup"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { BonusDetailModal } from "@/components/bonus-detail-modal"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { bonusService, type Campaign, type Promotion } from "@/lib/services/bonus-service"
import BannerSlider from "@/components/banner-slider"
import { RecentWinners } from "@/components/recent-winners"
import { Loader2 } from "lucide-react"

export default function BonusesPage() {
  return (
    <Suspense>
      <BonusesPageInner />
    </Suspense>
  )
}

function BonusesPageInner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [selectedBonus, setSelectedBonus] = useState<Campaign | Promotion | null>(null)
  const [isBonusDetailOpen, setIsBonusDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "campaigns" | "promotions">("all")

  const { user, isLoggedIn } = useAuth()
  const searchParams = useSearchParams()

  // API State
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Tüm bonus listesini tek ref'te tut — promo açma her zaman buradan okur
  const allBonusesRef = useRef<(Campaign | Promotion)[]>([])

  // Fetch bonuses from backend
  useEffect(() => {
    const fetchBonuses = async () => {
      setIsLoading(true)
      try {
        const [campaignsRes, promotionsRes] = await Promise.all([
          bonusService.getCampaigns(),
          bonusService.getPromotions(),
        ])
        const fetchedCampaigns  = campaignsRes.success  && campaignsRes.campaigns  ? campaignsRes.campaigns  : []
        const fetchedPromotions = promotionsRes.success && promotionsRes.promotions ? promotionsRes.promotions : []

        setCampaigns(fetchedCampaigns)
        setPromotions(fetchedPromotions)
        allBonusesRef.current = [...fetchedCampaigns, ...fetchedPromotions]
      } catch (error) {
        console.error("Error fetching bonuses:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBonuses()
  }, [])

  // ?promo=N param'ı her değiştiğinde ilgili bonusu aç
  // Veriler henüz gelmemişse isLoading false olunca tekrar dener
  useEffect(() => {
    if (isLoading) return
    const promoParam = searchParams.get("promo")
    if (!promoParam) return
    const index = parseInt(promoParam, 10) - 1 // 1-based → 0-based
    if (isNaN(index)) return
    const bonus = allBonusesRef.current[index]
    if (bonus) {
      setSelectedBonus(bonus)
      setIsBonusDetailOpen(true)
    }
  }, [searchParams, isLoading])

  const displayedBonuses = activeTab === "campaigns" 
    ? campaigns 
    : activeTab === "promotions" 
    ? promotions 
    : [...campaigns, ...promotions]

  const handleBonusClick = (bonus: Campaign | Promotion) => {
    setSelectedBonus(bonus)
    setIsBonusDetailOpen(true)
  }

  const handleClaimBonus = async (bonusId: string) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true)
      return
    }

    try {
      const response = await bonusService.claimCampaign(bonusId)
      if (response.success) {
        // Refresh campaigns
        const campaignsRes = await bonusService.getCampaigns()
        if (campaignsRes.success && campaignsRes.campaigns) {
          setCampaigns(campaignsRes.campaigns)
        }
      }
    } catch (error) {
      console.error("Error claiming bonus:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setIsLoginModalOpen(true)} />
      </div>

      {/* Banner Slider */}
      <div className="relative w-full h-[232px] lg:h-[330px]">
        <BannerSlider position="slots" fallbackTitle="PROMOSYONLAR" />
        <div className="hidden lg:flex absolute right-0 z-10 overflow-hidden" style={{ bottom: "10px", width: "auto", backgroundColor: "rgba(0,0,0,0.72)", clipPath: "polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%)", paddingLeft: "50px" }}>
          <RecentWinners />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8 mx-auto w-full" style={{ maxWidth: 1600 }}>
        {/* Mobile: Ortalı container */}
        <div className="lg:hidden flex flex-col items-center mb-3">
          <h2 className="text-white text-xl font-bold mb-4" style={{ width: 370, maxWidth: "100%" }}>Promosyonlar</h2>
          <button
            className="text-black text-base tracking-wide flex items-center justify-center"
            style={{ width: 370, height: 55, maxWidth: "100%", background: "#00d4b4" }}
          >
            <span style={{ borderBottom: "4px solid rgba(0,0,0,0.4)", paddingBottom: 8 }}>Tüm</span>
          </button>
        </div>

        {/* Desktop: Full-width layout */}
        <div className="hidden lg:block mb-6">
          <h2 className="text-white text-xl font-bold mb-4">Promosyonlar</h2>
          <button
            className="w-full text-black text-base tracking-wide flex items-center justify-center"
            style={{ height: 55, background: "#F4D03F" }}
          >
            <span style={{ borderBottom: "4px solid rgba(0,0,0,0.4)", paddingBottom: 8 }}>Tüm</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#00d4b4] animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile: Kartlar - ortalı */}
            <div className="flex flex-col items-center gap-6 lg:hidden">
              {displayedBonuses.map((bonus) => {
                const rawImg = (bonus as any).image || (bonus as any).banner || ""
                const imgUrl = rawImg.startsWith("/") ? `https://apievrymatrix5d84k321.com${rawImg}` : rawImg
                return (
                  <div
                    key={(bonus as any).id || (bonus as any)._id}
                    className="overflow-hidden relative"
                    style={{ width: 368, height: 400, maxWidth: "100%", border: ".1rem solid hsla(0,0%,100%,.2)", backgroundColor: "#111" }}
                  >
                    {/* Görsel - tüm alanı kaplıyor */}
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={(bonus as any).title || ""}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", display: "block" }}
                      />
                    )}

                    {/* Gradient overlay + başlık + buton */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        bottom: 0,
                        padding: "2rem 1.6rem",
                        backgroundImage: "linear-gradient(0deg, #111522 20%, rgba(17,21,34,0) 70%)",
                        color: "#fff",
                        boxSizing: "border-box",
                      }}
                    >
                      <h3 className="text-white font-bold mb-4 line-clamp-2" style={{ fontSize: 16 }}>
                        {(bonus as any).title || (bonus as any).name}
                      </h3>
                      <button
                        onClick={() => handleBonusClick(bonus)}
                        style={{
                          all: "unset",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 179,
                          height: 39,
                          fontSize: 16,
                          textTransform: "uppercase",
                          textAlign: "center",
                          border: "2px solid #fff",
                          cursor: "pointer",
                          background: "transparent",
                          color: "#fff",
                          boxSizing: "border-box",
                        }}
                      >
                        DAHA FAZLA DETAY
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: 3 sütunlu grid */}
            <div className="hidden lg:grid lg:grid-cols-3" style={{ columnGap: 34, rowGap: 34 }}>
              {displayedBonuses.map((bonus) => {
                const rawImg = (bonus as any).image || (bonus as any).banner || ""
                const imgUrl = rawImg.startsWith("/") ? `https://apievrymatrix5d84k321.com${rawImg}` : rawImg
                return (
                  <div
                    key={(bonus as any).id || (bonus as any)._id}
                    className="overflow-hidden relative"
                    style={{ height: 400, border: ".1rem solid hsla(0,0%,100%,.2)", backgroundColor: "#111" }}
                  >
                    {/* Görsel - tüm alanı kaplıyor */}
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={(bonus as any).title || ""}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", display: "block" }}
                      />
                    )}

                    {/* Gradient overlay + başlık + buton */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        bottom: 0,
                        padding: "2rem 1.6rem",
                        backgroundImage: "linear-gradient(0deg, #111522 20%, rgba(17,21,34,0) 70%)",
                        color: "#fff",
                        boxSizing: "border-box",
                      }}
                    >
                      <h3 className="text-white font-bold mb-4 line-clamp-2" style={{ fontSize: 16 }}>
                        {(bonus as any).title || (bonus as any).name}
                      </h3>
                      <button
                        onClick={() => handleBonusClick(bonus)}
                        style={{
                          all: "unset",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 179,
                          height: 39,
                          fontSize: 16,
                          textTransform: "uppercase",
                          textAlign: "center",
                          border: "2px solid #fff",
                          cursor: "pointer",
                          background: "transparent",
                          color: "#fff",
                          boxSizing: "border-box",
                        }}
                      >
                        DAHA FAZLA DETAY
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {displayedBonuses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Gosterilecek bonus bulunmamaktadir.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <BottomNavigation 
        onCenterClick={() => setIsCategoryPopupOpen(prev => !prev)}
        isPopupOpen={isCategoryPopupOpen}
      />

      <CategoryPopup 
        isOpen={isCategoryPopupOpen}
        onClose={() => setIsCategoryPopupOpen(false)}
      />

      <SidebarMenu 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <BonusDetailModal 
        isOpen={isBonusDetailOpen}
        onClose={() => setIsBonusDetailOpen(false)}
        bonus={selectedBonus ? {
          title: selectedBonus.title,
          image: (selectedBonus as any).image,
          banner: (selectedBonus as any).banner,
          content: (selectedBonus as any).content,
          terms: (selectedBonus as any).terms,
          rules: (selectedBonus as any).rules,
        } : null}
        onLogin={() => {
          setIsBonusDetailOpen(false)
          setIsLoginModalOpen(true)
        }}
        onRegister={() => {
          setIsBonusDetailOpen(false)
          window.location.href = '/register'
        }}
      />
    </div>
  )
}
