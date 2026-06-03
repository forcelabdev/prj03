"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { DesktopHeader } from "@/components/desktop-header"
import { Lock, ChevronLeft, ChevronRight, Trophy, Gift, History, Zap, Loader2, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { vipService, type VipLevel, type VipReward } from "@/lib/services/vip-service"
import { shopService, STATIC_SHOP_PRODUCTS, STATIC_COINS_CONFIG, type ShopProduct } from "@/lib/services/shop-service"
import { apiClient } from "@/lib/api-client"

const PRODUCTS_PER_PAGE = 6

// Geçmiş listesi component
function HistoryList({ subTab, userId, displayCoins }: { subTab: string; userId: string; displayCoins: number }) {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setRecords([])

    const endpoint =
      subTab === "paralar" ? "/coins/history" :
      subTab === "xp" ? "/xp/history" :
      "/shop/purchases?page=1&limit=50"

    apiClient.get<any>(endpoint, true).then(res => {
      if (res.success && res.data) {
        const data = res.data
        // /shop/purchases → { data: [...], pagination: {...} }
        const list = Array.isArray(data)
          ? data
          : (data.data || data.history || data.records || data.purchases || [])
        // Normalize purchase records for display
        const normalized = Array.isArray(list) ? list.map((r: any) => ({
          ...r,
          description: r.title || r.productName || r.name || r.description || '-',
          amount: r.rewardAmount ?? r.valueTL ?? r.amount ?? 0,
          createdAt: r.createdAt,
          _id: r._id || r.id,
        })) : []
        setRecords(normalized)
      }
    }).finally(() => setLoading(false))
  }, [subTab, userId])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#00d4b4" }} />
    </div>
  )

  if (records.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16">
      <History className="w-10 h-10 mb-3" style={{ color: "#3a3a3c" }} />
      <p className="text-gray-500 text-sm">Geçmiş bulunamadı</p>
    </div>
  )

  return (
    <div>
      {records.map((r: any, i: number) => {
        const amount = r.amount ?? r.coins ?? r.xp ?? r.valueTL ?? 0
        const isNegative = amount < 0
        const label = r.description || r.type || r.productName || r.name || "-"
        const date = r.createdAt ? new Date(r.createdAt).toLocaleString("tr-TR", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", second: "2-digit"
        }).replace(",", "") : ""
        const displayAmount = subTab === "purchases"
          ? `${Number(amount).toFixed(2)} TL`
          : isNegative
            ? String(amount)
            : `+${Number(amount).toFixed(2)}`

        return (
          <div
            key={r._id || r.id || i}
            className="flex items-center justify-between py-4 px-1"
            style={{ borderBottom: "1px solid #2e2e30" }}
          >
            <div>
              <p className="text-white text-sm font-medium">{label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{date}</p>
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: isNegative ? "#f87171" : "#4ade80" }}
            >
              {displayAmount}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function LoyaltyPage() {
  const { user, isLoggedIn, refreshUser } = useAuth()
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeTab, setActiveTab] = useState<"level" | "store" | "history">("level")
  const [historySubTab, setHistorySubTab] = useState<"paralar" | "xp" | "purchases">("paralar")
  const [selectedLevel, setSelectedLevel] = useState(0)
  const [shopPage, setShopPage] = useState(1)
  const [purchaseMsg, setPurchaseMsg] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([])
  const [shopLoading, setShopLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [localCoins, setLocalCoins] = useState<number | null>(null)
  const [confirmProduct, setConfirmProduct] = useState<ShopProduct | null>(null)

  // API State
  const [levels, setLevels] = useState<VipLevel[]>([])
  const [currentLevel, setCurrentLevel] = useState<VipLevel | null>(null)
  const [rewards, setRewards] = useState<VipReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClaimingReward, setIsClaimingReward] = useState(false)

  // Fetch VIP data from backend
  useEffect(() => {
    const fetchVipData = async () => {
      setIsLoading(true)
      try {
        // Fetch all VIP levels
        const levelsRes = await vipService.getLevels()
        if (levelsRes.success && levelsRes.levels) {
          setLevels(levelsRes.levels)
        }

        // Fetch current user level if logged in
        if (isLoggedIn) {
          const currentRes = await vipService.getCurrentLevel()
          if (currentRes.success && currentRes.level) {
            setCurrentLevel(currentRes.level)
            // Set selected level to current level
            const idx = levelsRes.levels?.findIndex(l => l._id === currentRes.level?._id || l.id === currentRes.level?.id) ?? 0
            setSelectedLevel(idx >= 0 ? idx : 0)
          }

          // Fetch rewards
          if (user?.id) {
            const rewardsRes = await vipService.getRewards(user.id)
            if (rewardsRes.success && rewardsRes.rewards) {
              setRewards(rewardsRes.rewards)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching VIP data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVipData()
  }, [isLoggedIn, user?.id])

  // Mağaza ürünlerini çek
  useEffect(() => {
    setShopLoading(true)
    shopService.getProducts().then(res => {
      if (res.success && res.products.length > 0) {
        setShopProducts(res.products)
      }
    }).finally(() => setShopLoading(false))
  }, [])

  // XP'ye göre coins hesapla (backend coins dönmediğinde fallback)
  const computeCoinsFromXp = (xp: number): number => {
    const config = STATIC_COINS_CONFIG.find(c => xp >= c.minXp && xp < c.maxXp)
      || STATIC_COINS_CONFIG[STATIC_COINS_CONFIG.length - 1]
    return Math.floor(xp * config.coinsPerXp * 100) / 100
  }

  const backendCoins = user?.coins ?? null
  const xpBasedCoins = computeCoinsFromXp(user?.xp ?? 0)
  // Backend coins null degil ise (0 dahil) onu kullan, user henuz yuklenmemisse XP'den hesapla
  const baseCoins = backendCoins !== null ? backendCoins : xpBasedCoins
  const displayCoins = localCoins !== null ? localCoins : baseCoins

  const handlePurchase = async (product: ShopProduct) => {
    if (!isLoggedIn) { setShowLogin(true); return }
    if (displayCoins < product.coinCost) {
      setPurchaseMsg({ text: "Yetersiz Paralar. Daha fazla XP kazanarak Paralar edinebilirsiniz.", type: "error" })
      setTimeout(() => setPurchaseMsg(null), 4000)
      return
    }
    const productId = product._id || product.id
    setPurchasingId(productId)
    try {
      const res = await shopService.purchase(productId)
      if (res.success) {
        // Coins'i anında güncelle — API coinBalance döner
        const newCoins = res.remainingCoins !== undefined ? res.remainingCoins : displayCoins - product.coinCost
        setLocalCoins(newCoins)
        // Bakiyeyi backend'den yenile (Rivo wallet bakiyesi güncellenmiş olacak)
        await refreshUser()
        const successMsg = "Satın alma işlemi başarıyla gerçekleşti."
        setPurchaseMsg({ text: successMsg, type: "success" })
      } else {
        setPurchaseMsg({ text: res.error || "Satın alma başarısız. Lütfen tekrar deneyin.", type: "error" })
      }
    } catch {
      setPurchaseMsg({ text: "Bağlantı hatası. Lütfen tekrar deneyin.", type: "error" })
    } finally {
      setPurchasingId(null)
      setTimeout(() => setPurchaseMsg(null), 5000)
    }
  }

  const handleClaimReward = async (rewardId: string) => {
    setIsClaimingReward(true)
    try {
      const response = await vipService.claimReward(rewardId)
      if (response.success) {
        // Refresh rewards
        if (user?.id) {
          const rewardsRes = await vipService.getRewards(user.id)
          if (rewardsRes.success && rewardsRes.rewards) {
            setRewards(rewardsRes.rewards)
          }
        }
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
    } finally {
      setIsClaimingReward(false)
    }
  }

  // Fallback levels if API returns empty
  const displayLevels = levels.length > 0 ? levels : [
    { _id: "1", id: "1", level: 0, name: "Move",   minXp: 0,        maxXp: 50000 },
    { _id: "2", id: "2", level: 1, name: "Move 1",  minXp: 50000,    maxXp: 200000 },
    { _id: "3", id: "3", level: 2, name: "Move 2",  minXp: 200000,   maxXp: 1000000 },
    { _id: "4", id: "4", level: 3, name: "Move 3",  minXp: 1000000,  maxXp: 2000000 },
    { _id: "5", id: "5", level: 4, name: "Move 4",  minXp: 2000000,  maxXp: 5000000 },
    { _id: "6", id: "6", level: 5, name: "Move 5",  minXp: 5000000,  maxXp: 10000000 },
    { _id: "7", id: "7", level: 6, name: "Move 6",  minXp: 10000000, maxXp: 999999999 },
  ]

  // user.xp'yi temel al — her zaman tam sayi olarak kullan
  const userXp = Math.floor(user?.xp ?? 0)
  const currentXP = userXp

  // Kullanicinin bulundugu seviyeyi displayLevels uzerinden bul
  const computedLevelIdx = displayLevels.reduce((best, lvl, i) => {
    const minXp = lvl.minXp ?? (lvl as any).xp ?? 0
    return userXp >= minXp ? i : best
  }, 0)

  // Her zaman computedLevelIdx'i set et (API'den gelse de gelmese de)
  useEffect(() => {
    if (displayLevels.length > 0) {
      setSelectedLevel(computedLevelIdx)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userXp, displayLevels.length])

  // Sol kart her zaman kullanicinin gercek seviyesini gosterir
  const userLvl = displayLevels[computedLevelIdx] ?? displayLevels[0]
  const userNextLvl = displayLevels[computedLevelIdx + 1]
  const nextLvlMinXp = userNextLvl ? (userNextLvl.minXp ?? (userNextLvl as any).xp ?? 0) : 0
  const maxXP = nextLvlMinXp > 0 ? nextLvlMinXp : 0
  const levelName = userLvl?.name || currentLevel?.levelName || currentLevel?.name || "Move"

  // Detay paneli icin secilen seviye
  const activeLvl = displayLevels[selectedLevel] ?? displayLevels[0]
  const nextLvl = displayLevels[selectedLevel + 1]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setShowLogin(true)} />
      </div>

      {/* Satın alma toast - sayfanın üstünde çıkar */}
      {purchaseMsg && (
        <div
          className="w-full flex items-center gap-1.5 px-4 py-3 text-sm font-semibold"
          style={{
            backgroundColor: "#fff",
            color: "#111",
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: purchaseMsg.type === "success" ? "#16a34a" : "#dc2626" }}
          >
            {purchaseMsg.type === "success"
              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
            }
          </div>
          <span>{purchaseMsg.text}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="px-4 pt-3">
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          {[
            { key: "level",   label: "Seviyem",        icon: <Trophy className="w-5 h-5" /> },
            { key: "store",   label: "Mağaza",          icon: <Gift className="w-5 h-5" /> },
            { key: "history", label: "Sadakat Geçmişi", icon: <History className="w-5 h-5" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "level" | "store" | "history")}
                className="flex-1 flex items-center justify-center gap-1.5 py-4 text-sm font-medium transition-colors relative whitespace-nowrap"
                style={{ color: isActive ? "#00d4b4" : "#9ca3af" }}
              >
                <span style={{ color: isActive ? "#00d4b4" : "#6b7280" }}>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: "3px",
                      backgroundColor: "#00d4b4",
                      borderRadius: "0px",
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 p-4 lg:px-8 lg:py-6">
        <div className="max-w-7xl mx-auto">
          {isLoading && activeTab !== "store" ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#00d4b4] animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "level" && (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column - Level Card */}
                  <div className="lg:w-[350px] flex-shrink-0">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-4">
                      {/* Mevcut seviye rozeti */}
                      <div className="flex items-center gap-3 mb-4">
                        {(userLvl as any)?.image ? (
                          <img
                            src={(userLvl as any).image}
                            alt={levelName}
                            className="w-14 h-14 rounded-xl object-contain bg-[#00d4b4] p-1 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-[#00d4b4] flex items-center justify-center flex-shrink-0">
                            <Zap className="w-7 h-7 text-black" />
                          </div>
                        )}
                        <div>
                          <p className="text-gray-400 text-xs mb-0.5">Mevcut Seviyeniz</p>
                          <h2 className="text-white text-2xl font-bold leading-tight">{levelName}</h2>
                        </div>
                      </div>

                      {/* Mevcut XP / Hedef XP */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-bold text-sm">{currentXP.toLocaleString("tr-TR")} <span className="text-gray-400 font-normal">XP</span></span>
                        <span className="text-white font-bold text-sm">{maxXP > 0 ? <>{maxXP.toLocaleString("tr-TR")} <span className="text-gray-400 font-normal">XP</span></> : ""}</span>
                      </div>

                      {/* Progress bar — thumb ilerlemenin ucunda, sag mor kilit */}
                      {(() => {
                        const lvlMinXp = userLvl ? (userLvl.minXp ?? (userLvl as any).xp ?? 0) : 0
                        const lvlMaxXp = maxXP > 0 ? maxXP : currentXP
                        const pct = lvlMaxXp > lvlMinXp
                          ? Math.min(((currentXP - lvlMinXp) / (lvlMaxXp - lvlMinXp)) * 100, 100)
                          : 100
                        const hasNext = !!userNextLvl && maxXP > 0
                        // r = thumb yarıcapı, track sol/sag padding = r kadar
                        const r = 3
                        const lockR = 12
                        const trackLeft = r
                        const trackRight = hasNext ? lockR : r
                        return (
                          <div className="relative mb-3" style={{ height: lockR * 2 }}>
                            {/* Track arka plan */}
                            <div
                              style={{
                                position: "absolute",
                                left: trackLeft,
                                right: trackRight,
                                top: lockR - 3,
                                height: 6,
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: 3,
                              }}
                            />
                            {/* Dolu kisim */}
                            <div
                              style={{
                                position: "absolute",
                                left: trackLeft,
                                top: lockR - 3,
                                height: 6,
                                borderRadius: 3,
                                background: "white",
                                width: `calc(${pct / 100} * (100% - ${trackLeft + trackRight}px))`,
                              }}
                            />
                            {/* Thumb — ilerlemenin ucunda, gaussian blur glow */}
                            <div
                              style={{
                                position: "absolute",
                                top: lockR - r,
                                left: `calc(${pct / 100} * (100% - ${trackLeft + trackRight}px) + ${trackLeft - r}px)`,
                                width: r * 2,
                                height: r * 2,
                                zIndex: 2,
                              }}
                            >
                              {/* Blurlu glow katmani - arkada, ince */}
                              <div style={{
                                position: "absolute",
                                top: "50%", left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: r * 3,
                                height: r * 3,
                                borderRadius: "50%",
                                background: "white",
                                filter: "blur(3px)",
                                opacity: 0.55,
                              }} />
                              {/* Keskin beyaz merkez */}
                              <div style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50%",
                                background: "white",
                              }} />
                            </div>
                            {/* Sag mor kilit dairesi */}
                            {hasNext && (
                              <div
                                style={{
                                  position: "absolute",
                                  right: 0,
                                  top: 0,
                                  width: lockR * 2,
                                  height: lockR * 2,
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #7B4FCF 0%, #C97ECA 100%)",
                                  boxShadow: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 2,
                                }}
                              >
                                <Lock style={{ width: 12, height: 12, color: "white" }} />
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {userNextLvl && maxXP > 0 ? (
                        <p className="text-gray-400 text-sm">
                          Sonraki seviyeye ulasmak icin{" "}
                          <span className="text-white font-semibold">{(maxXP - currentXP).toLocaleString("tr-TR")} XP</span> gerekiyor
                        </p>
                      ) : (
                        <p className="text-[#00d4b4] text-sm font-semibold">En yuksek seviyedesiniz!</p>
                      )}
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      <p className="text-gray-400 text-sm mb-2">Toplam Puan</p>
                      <span className="text-[#00d4b4] text-2xl font-bold">
                        {displayCoins.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Right Column - Level Badges */}
                  <div className="flex-1">
                    <div className="relative">
                      <button 
                        onClick={() => setSelectedLevel(Math.max(0, selectedLevel - 1))}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex gap-4 overflow-x-auto px-12 py-4 scrollbar-hide">
                        {displayLevels.map((level, index) => {
                          const isActive = selectedLevel === index
                          const levelMinXp = level.minXp ?? (level as any).xp ?? 0
                          const imgSrc = level.image || level.icon || null
                          return (
                            <button
                              key={level._id || level.id || index}
                              onClick={() => setSelectedLevel(index)}
                              className={`flex-shrink-0 w-[140px] p-4 rounded-lg border-2 transition-all ${
                                isActive
                                  ? "bg-[#00d4b4] border-[#00d4b4]"
                                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                              }`}
                            >
                              <div className={`w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center overflow-hidden ${
                                isActive ? "bg-black/20" : "bg-zinc-800"
                              }`}>
                                {imgSrc ? (
                                  <img src={imgSrc.startsWith("http") ? imgSrc : `https://apievrymatrix5d84k321.com${imgSrc}`} alt={level.name} className="w-full h-full object-contain" />
                                ) : (
                                  <Zap className={`w-8 h-8 ${isActive ? "text-black" : "text-[#00d4b4]"}`} />
                                )}
                              </div>
                              <div className={`text-center font-bold text-sm ${isActive ? "text-black" : "text-white"}`}>
                                {level.name}
                              </div>
                              {levelMinXp > 0 && (
                                <div className={`text-center text-xs mt-1 ${isActive ? "text-black/70" : "text-gray-400"}`}>
                                  {levelMinXp.toLocaleString()} XP
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      <button 
                        onClick={() => setSelectedLevel(Math.min(displayLevels.length - 1, selectedLevel + 1))}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      {(() => {
                        const s = displayLevels[selectedLevel] as any
                        const nx = displayLevels[selectedLevel + 1] as any
                        const isUserLevel = selectedLevel === computedLevelIdx
                        return (
                          <>
                            {/* Baslik */}
                            <div className="flex items-center gap-4 mb-5">
                              <div className="w-16 h-16 bg-[#00d4b4] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                {s?.image
                                  ? <img src={s.image} alt={s?.name} className="w-full h-full object-contain" />
                                  : <Zap className="w-8 h-8 text-black" />
                                }
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white text-xl font-bold">{s?.name}</h3>
                                  {isUserLevel && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#00d4b4", color: "#000" }}>
                                      Mevcut
                                    </span>
                                  )}
                                </div>
                                <span className="text-[#00d4b4] text-sm font-bold">MOVE VIP</span>
                              </div>
                            </div>

                            {/* XP */}
                            <h4 className="text-[#00d4b4] font-bold text-sm mb-2">SEVIYE XP GEREKSINIMLERI</h4>
                            <div className="space-y-1.5 text-sm mb-5" style={{ borderBottom: "1px solid #27272a", paddingBottom: "16px" }}>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Gerekli XP</span>
                                <span className="text-white font-semibold">{(s?.minXp ?? 0).toLocaleString()} XP</span>
                              </div>
                              {nx
                                ? <div className="flex justify-between"><span className="text-gray-400">Bir Sonraki Seviye</span><span className="text-white font-semibold">{nx.name} ({(nx.minXp ?? 0).toLocaleString()} XP)</span></div>
                                : <div className="text-gray-500 text-xs">En yuksek seviyedesiniz.</div>
                              }
                            </div>

                            {/* Cashback */}
                            <h4 className="text-[#00d4b4] font-bold text-sm mb-2">CASHBACK AVANTAJLARI</h4>
                            <div className="space-y-1.5 text-sm mb-5" style={{ borderBottom: "1px solid #27272a", paddingBottom: "16px" }}>
                              {Number(s?.dailyCashback) > 0 && <div className="flex justify-between"><span className="text-gray-400">Gunluk Cashback</span><span className="text-white font-semibold">{Number(s.dailyCashback).toLocaleString()} TL</span></div>}
                              {Number(s?.weeklyCashback) > 0 && <div className="flex justify-between"><span className="text-gray-400">Haftalik Cashback</span><span className="text-white font-semibold">{Number(s.weeklyCashback).toLocaleString()} TL</span></div>}
                              {Number(s?.monthlyCashback) > 0 && <div className="flex justify-between"><span className="text-gray-400">Aylik Cashback</span><span className="text-white font-semibold">{Number(s.monthlyCashback).toLocaleString()} TL</span></div>}
                              {!Number(s?.dailyCashback) && !Number(s?.weeklyCashback) && !Number(s?.monthlyCashback) && <div className="text-gray-500 text-xs">Bu seviyede cashback avantaji bulunmuyor.</div>}
                            </div>

                            {/* Diger */}
                            <h4 className="text-[#00d4b4] font-bold text-sm mb-2">DIGER AVANTAJLAR</h4>
                            <div className="space-y-1.5 text-sm mb-5" style={{ borderBottom: "1px solid #27272a", paddingBottom: "16px" }}>
                              {Number(s?.upgradeReward) > 0 && <div className="flex justify-between"><span className="text-gray-400">Seviye Atlama Odulu</span><span className="text-white font-semibold">{Number(s.upgradeReward).toLocaleString()} TL</span></div>}
                              {s?.vipDay && <div className="flex justify-between"><span className="text-gray-400">VIP Odeme Gunu</span><span className="text-white font-semibold">{s.vipDay}</span></div>}
                              {!Number(s?.upgradeReward) && !s?.vipDay && <div className="text-gray-500 text-xs">Bu seviyede ek avantaj bulunmuyor.</div>}
                            </div>

                            <h4 className="text-[#00d4b4] font-bold text-sm mb-2">NASIL XP KAZANILIR?</h4>
                            <ul className="space-y-1.5 text-gray-400 text-sm">
                              <li>- Slot Oyunlari: Her 5 TL Bahis = 1 XP</li>
                              <li>- Canli Casino: Her 5 TL Bahis = 1 XP</li>
                              <li>- Spor Bahisleri: Her 5 TL Bahis = 1 XP</li>
                            </ul>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "store" && (
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Sol: Seviye ve Paralar kartları */}
                  <div className="lg:w-[280px] lg:flex-shrink-0 space-y-3">
                    <div className="rounded-xl p-5" style={{ backgroundColor: "#1a1a1c", border: "1px solid #00d4b4" }}>
                      <h2 className="text-white font-extrabold mb-4" style={{ fontSize: "28px" }}>{levelName}</h2>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-white font-extrabold" style={{ fontSize: "16px" }}>
                          {currentXP.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-gray-400">XP</span>
                        </span>
                        <span className="text-white font-extrabold" style={{ fontSize: "16px" }}>
                          {maxXP.toLocaleString()} <span className="text-sm font-normal text-gray-400">XP</span>
                        </span>
                      </div>
                      {(() => {
                        const lvlMinXp = userLvl ? (userLvl.minXp ?? (userLvl as any).xp ?? 0) : 0
                        const lvlMaxXp = maxXP > 0 ? maxXP : currentXP
                        const pct = lvlMaxXp > lvlMinXp ? Math.min(((currentXP - lvlMinXp) / (lvlMaxXp - lvlMinXp)) * 100, 100) : 100
                        const hasNext = !!userNextLvl && maxXP > 0
                        const r = 3; const lockR = 12
                        const trackLeft = r; const trackRight = hasNext ? lockR : r
                        return (
                          <div className="relative mb-3" style={{ height: lockR * 2 }}>
                            <div style={{ position: "absolute", left: trackLeft, right: trackRight, top: lockR - 3, height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3 }} />
                            <div style={{ position: "absolute", left: trackLeft, top: lockR - 3, height: 6, borderRadius: 3, background: "white", width: `calc(${pct / 100} * (100% - ${trackLeft + trackRight}px))` }} />
                            <div style={{ position: "absolute", top: lockR - r, left: `calc(${pct / 100} * (100% - ${trackLeft + trackRight}px) + ${trackLeft - r}px)`, width: r * 2, height: r * 2, zIndex: 2 }}>
                              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: r * 3, height: r * 3, borderRadius: "50%", background: "white", filter: "blur(3px)", opacity: 0.55 }} />
                              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "white" }} />
                            </div>
                            {hasNext && (
                              <div style={{ position: "absolute", right: 0, top: 0, width: lockR * 2, height: lockR * 2, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                                <Lock style={{ width: 10, height: 10, color: "white" }} />
                              </div>
                            )}
                          </div>
                        )
                      })()}
                      <p className="text-gray-400 text-xs">
                        {displayLevels[selectedLevel + 1]?.name || "Max"} seviyesine ulaşmak için{" "}
                        {(maxXP - currentXP).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} gerekiyor
                      </p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: "#1a1a1c", border: "1px solid #00d4b4" }}>
                      <span className="text-white font-extrabold" style={{ fontSize: "32px" }}>
                        {displayCoins.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-400 font-semibold ml-2" style={{ fontSize: "18px" }}>Paralar</span>
                    </div>


                  </div>

                  {/* Sağ: Ürün grid */}
                  <div className="flex-1 min-w-0">
                    {shopLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00d4b4]" />
                      </div>
                    ) : shopProducts.length === 0 ? (
                      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
                        Henüz mağaza ürünü bulunmuyor.
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {shopProducts
                        .slice((shopPage - 1) * PRODUCTS_PER_PAGE, shopPage * PRODUCTS_PER_PAGE)
                        .map((product) => {
                          const productId = product._id || product.id
                          const canAfford = displayCoins >= product.coinCost
                          const isPurchasing = purchasingId === productId
                          const productName = product.title || product.name || 'Çevrimsiz Nakit'
                          const productLabel = product.valueLabel || (product.rewardAmount ? `${Number(product.rewardAmount).toLocaleString('tr-TR')} TL` : '')
                          return (
                            <div
                              key={productId}
                              className="rounded-xl overflow-hidden"
                              style={{ backgroundColor: "#1c1c1e" }}
                            >
                              {/* Ürün görseli */}
                              <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
                                <Image
                                  src={product.image}
                                  alt={`${productLabel} ${productName}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>

                              {/* Ürün bilgisi */}
                              <div className="p-3">
                                <p className="text-white font-bold text-sm leading-tight mb-0.5">
                                  {product.coinCost} Coins
                                </p>
                                <p className="text-white text-xs font-medium leading-tight">{productName}</p>
                                <p className="text-gray-400 text-xs mb-3">{productLabel}</p>
                                <button
                                  disabled={!canAfford || isPurchasing}
                                  onClick={() => setConfirmProduct(product)}
                                  className="w-full py-2 text-white text-xs font-bold tracking-wide uppercase rounded-lg transition-opacity flex items-center justify-center gap-1.5"
                                  style={{ backgroundColor: canAfford ? "#3a3a3c" : "#2a2a2c", opacity: canAfford && !isPurchasing ? 1 : 0.5 }}
                                >
                                  {isPurchasing ? <><Loader2 className="w-3 h-3 animate-spin" /> İŞLENİYOR</> : "SATIN AL"}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                    </div>

                    {/* Pagination */}
                    {Math.ceil(shopProducts.length / PRODUCTS_PER_PAGE) > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                          onClick={() => setShopPage(p => Math.max(1, p - 1))}
                          disabled={shopPage === 1}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: Math.ceil(shopProducts.length / PRODUCTS_PER_PAGE) }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setShopPage(p)}
                            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                              shopPage === p ? "bg-[#00d4b4] text-black" : "text-gray-400 hover:text-white"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setShopPage(p => Math.min(Math.ceil(shopProducts.length / PRODUCTS_PER_PAGE), p + 1))}
                          disabled={shopPage === Math.ceil(shopProducts.length / PRODUCTS_PER_PAGE)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Sol: Seviye ve Paralar kartları */}
                  <div className="lg:w-[280px] lg:flex-shrink-0 space-y-3">
                    <div className="rounded-xl p-5" style={{ backgroundColor: "#1a1a1c", border: "1px solid #00d4b4" }}>
                      <h2 className="text-white font-extrabold mb-4" style={{ fontSize: "28px" }}>{levelName}</h2>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-white font-bold text-sm">
                          {currentXP.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-xs text-gray-400">XP</span>
                        </span>
                        <span className="text-white font-bold text-sm">
                          {maxXP.toLocaleString()} <span className="text-xs text-gray-400">XP</span>
                        </span>
                      </div>
                      {(() => {
                        const lvlMinXp = userLvl ? (userLvl.minXp ?? (userLvl as any).xp ?? 0) : 0
                        const lvlMaxXp = maxXP > 0 ? maxXP : currentXP
                        const pct = lvlMaxXp > lvlMinXp ? Math.min(((currentXP - lvlMinXp) / (lvlMaxXp - lvlMinXp)) * 100, 100) : 100
                        const hasNext = !!userNextLvl && maxXP > 0
                        const r = 3; const lockR = 12
                        const trackLeft = r; const trackRight = hasNext ? lockR : r
                        return (
                          <div className="relative mb-3" style={{ height: lockR * 2 }}>
                            <div style={{ position: "absolute", left: trackLeft, right: trackRight, top: lockR - 3, height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3 }} />
                            <div style={{ position: "absolute", left: trackLeft, top: lockR - 3, height: 6, borderRadius: 3, background: "white", width: `calc(${pct / 100} * (100% - ${trackLeft + trackRight}px))` }} />
                            <div style={{ position: "absolute", top: lockR - r, left: `calc(${pct / 100} * (100% - ${trackLeft + trackRight}px) + ${trackLeft - r}px)`, width: r * 2, height: r * 2, zIndex: 2 }}>
                              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: r * 3, height: r * 3, borderRadius: "50%", background: "white", filter: "blur(3px)", opacity: 0.55 }} />
                              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "white" }} />
                            </div>
                            {hasNext && (
                              <div style={{ position: "absolute", right: 0, top: 0, width: lockR * 2, height: lockR * 2, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                                <Lock style={{ width: 10, height: 10, color: "white" }} />
                              </div>
                            )}
                          </div>
                        )
                      })()}
                      <p className="text-gray-400 text-xs">
                        {displayLevels[selectedLevel + 1]?.name || "Max"} seviyesine ulaşmak için{" "}
                        {(maxXP - currentXP).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} gerekiyor
                      </p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: "#1a1a1c", border: "1px solid #00d4b4" }}>
                      <span className="text-white font-extrabold" style={{ fontSize: "32px" }}>
                        {displayCoins.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-400 font-semibold ml-2" style={{ fontSize: "18px" }}>Paralar</span>
                    </div>
                  </div>

                  {/* Sağ: Geçmiş listesi */}
                  <div className="flex-1 min-w-0">
                    {/* Sub-tab bar */}
                    <div className="flex border-b mb-2" style={{ borderColor: "#2e2e30" }}>
                      {[
                        { key: "paralar", label: "Paralar" },
                        { key: "xp", label: "XP" },
                        { key: "purchases", label: "Mağaza Satın Almaları" },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setHistorySubTab(tab.key as any)}
                          className="px-6 py-3 text-sm font-medium transition-colors relative"
                          style={{ color: historySubTab === tab.key ? "#00d4b4" : "#9ca3af" }}
                        >
                          {tab.label}
                          {historySubTab === tab.key && (
                            <span className="absolute bottom-0 left-0 right-0" style={{ height: "2px", backgroundColor: "#00d4b4" }} />
                          )}
                        </button>
                      ))}
                    </div>

                    <HistoryList
                      subTab={historySubTab}
                      userId={user?.identifier || (user as any)?._id || ""}
                      displayCoins={displayCoins}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <div className="hidden lg:block"><Footer /></div>
      <div className="lg:hidden"><Footer /><BottomNavigation /></div>

      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(true)} />}

      {/* Satın Alma Onay Dialogu */}
      {confirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div 
            className="relative w-full max-w-sm rounded-xl p-6"
            style={{ 
              backgroundColor: "#1a1a1c", 
              border: "1.5px solid #00d4b4",
              boxShadow: "0 0 20px rgba(0,212,180,0.3)"
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setConfirmProduct(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: "#3a3a3c" }}
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Title */}
            <h3 className="text-white text-xl font-semibold text-center mt-5 mb-8">
              İşlemi onaylıyor musunuz?
            </h3>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => setConfirmProduct(null)}
                className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#3a3a3c" }}
              >
                Hayır
              </button>
              <button
                onClick={() => {
                  handlePurchase(confirmProduct)
                  setConfirmProduct(null)
                }}
                className="px-6 py-2.5 rounded-lg text-black text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#00d4b4" }}
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
