"use client"

import { X, Search, Plus } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { gamesService } from "@/lib/services/games-service"

const mainCategories = [
  { 
    id: "canli-casino", 
    name: "Canlı Casino",
    icon: (
      <img src="/icons/canli-casino.png" alt="Canlı Casino" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "casino", 
    name: "Casino",
    icon: (
      <img src="/icons/casino.png" alt="Casino" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "bahis", 
    name: "Spor",
    icon: (
      <img src="/icons/spor.png" alt="Spor" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "ozel-oran", 
    name: "Özel Oran",
    icon: (
      <img src="/icons/ozel-oran.png" alt="Özel Oran" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "hizli-kazan", 
    name: "Hızlı Kazan",
    icon: (
      <img src="/icons/hizli-kazan.png" alt="Hızlı Kazan" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "canli-oyunlar", 
    name: "Canlı Oyunlar",
    icon: (
      <img src="/icons/canli-oyunlar.png" alt="Canlı Oyunlar" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "promosyonlar", 
    name: "Promosyonlar",
    icon: (
      <img src="/icons/promosyonlar.png" alt="Promosyonlar" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "turnuvalar", 
    name: "Turnuvalar",
    icon: (
      <img src="/icons/turnuvalar.png" alt="Turnuvalar" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "move-plus", 
    name: "VELO+",
    icon: (
      <img src="/icons/velo-plus.png" alt="VELO+" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
  { 
    id: "discount-talep", 
    name: "Discount Talep",
    icon: (
      <img src="/icons/discount-talep.png" alt="Discount Talep" width={40} height={40} style={{ objectFit: "contain" }} />
    )
  },
]

const subMenuItems: Record<string, { name: string; hasIcon?: boolean; href?: string }[]> = {
  "kesfet": [
    { name: "999 Freebet Ödüllü Spor Turnuvası", hasIcon: true },
    { name: "1999 Freespin Ödüllü Fortune Of Olympus Turnuvası", hasIcon: true },
    { name: "VIP Club", hasIcon: true },
    { name: "Discount Talep Et", hasIcon: true },
    { name: "Evolution Lobisi", hasIcon: true },
    { name: "Casino Lobisi", hasIcon: true },
    { name: "Canlı Casino Lobisi", hasIcon: true },
    { name: "En Sevilen Oyunlar", hasIcon: true },
    { name: "BONUSLAR", hasIcon: true },
    { name: "Velo IPTV", hasIcon: true },
  ],
  "canli-casino": [
    { name: "Canlı Casino Ana Sayfa", hasIcon: true, href: "/live-casino" },
    { name: "Top 20 Canlı Casino", hasIcon: true, href: "/live-casino?category=top-20" },
    { name: "Türkçe Casino", hasIcon: true, href: "/live-casino?category=turkce-casino" },
    { name: "Pragmatic Live", hasIcon: true, href: "/live-casino?category=pragmatic-live" },
    { name: "PlayMatrix", hasIcon: true, href: "/live-casino?category=playmatrix" },
    { name: "CreedRoomz", hasIcon: true, href: "/live-casino?category=creed-roomz" },
    { name: "Blackjack", hasIcon: true, href: "/live-casino?category=blackjack" },
    { name: "Rulet", hasIcon: true, href: "/live-casino?category=rulet" },
    { name: "Poker", hasIcon: true, href: "/live-casino?category=poker" },
    { name: "Baccarat", hasIcon: true, href: "/live-casino?category=baccarat" },
    { name: "Tombala", hasIcon: true, href: "/live-casino?category=tombala" },
    { name: "Sic Bo", hasIcon: true, href: "/live-casino?category=sic-bo" },
    { name: "Türkçe Mega Rulet - 500X", hasIcon: true, href: "/live-casino?category=turkce-mega-rulet" },
    { name: "Mega Rulet - 3000x", hasIcon: true, href: "/live-casino?category=mega-rulet-3000x" },
    { name: "Cyber Roulette 500x", hasIcon: true, href: "/live-casino?category=cyber-roulette-500x" },
    { name: "Cyber Roulette 1000x", hasIcon: true, href: "/live-casino?category=cyber-roulette-1000x" },
    { name: "Sweet Bonanza CandyLand", hasIcon: true, href: "/live-casino?category=sweet-bonanza" },
    { name: "Türkçe Blackjack 1", hasIcon: true, href: "/live-casino?category=turkce-blackjack-1" },
    { name: "Türkçe Blackjack 2", hasIcon: true, href: "/live-casino?category=turkce-blackjack-2" },
    { name: "Türkçe Blackjack 3", hasIcon: true, href: "/live-casino?category=turkce-blackjack-3" },
    { name: "Türkçe Rulet", hasIcon: true, href: "/live-casino?category=turkce-rulet" },
    { name: "Auto Roulette", hasIcon: true, href: "/live-casino?category=auto-roulette" },
  ],
  "casino": [
    { name: "Casino Ana Sayfa", hasIcon: true, href: "/casino" },
    { name: "Slot Oyunları", hasIcon: true, href: "/casino/slot-oyunlari" },
    { name: "Jackpot Oyunları", hasIcon: true, href: "/casino/jackpot-oyunlari" },
    { name: "Masa Oyunları", hasIcon: true, href: "/casino/masa-oyunlari" },
    { name: "Video Poker", hasIcon: true, href: "/casino/video-poker" },
    { name: "Yeni Oyunlar", hasIcon: true, href: "/casino/yeni-oyunlar" },
    { name: "Popüler Oyunlar", hasIcon: true, href: "/casino/populer-oyunlar" },
  ],
  "bahis": [
    { name: "Tümü", hasIcon: true, href: "/sports" },
    { name: "Canlı Bahis", hasIcon: true, href: "/sports" },
    { name: "Egextra Özel Oran", hasIcon: true, href: "/sports" },
    { name: "Atl. Madrid - Barcelona", hasIcon: true, href: "/sports" },
    { name: "Liverpool - PSG", hasIcon: true, href: "/sports" },
    { name: "Catanzaro - Modena", hasIcon: true, href: "/sports" },
    { name: "Podbrezova - MSK Zilina", hasIcon: true, href: "/sports" },
    { name: "UEFA Avrupa Ligi", hasIcon: true, href: "/sports" },
    { name: "UEFA Şampiyonlar Ligi", hasIcon: true, href: "/sports" },
    { name: "İngiltere Premier Lig", hasIcon: true, href: "/sports" },
    { name: "Almanya Bundesliga", hasIcon: true, href: "/sports" },
    { name: "İspanya La Liga", hasIcon: true, href: "/sports" },
    { name: "İtalya Serie A", hasIcon: true, href: "/sports" },
    { name: "Fransa Lig 1", hasIcon: true, href: "/sports" },
    { name: "Belçika Jupiler Pro Lig", hasIcon: true, href: "/sports" },
    { name: "Brezilya Serie A", hasIcon: true, href: "/sports" },
    { name: "NBA", hasIcon: true, href: "/sports" },
    { name: "DOTA 2 - Espor", hasIcon: true, href: "/sports" },
  ],
  "ozel-oran": [
    { name: "Özel Oranlar", hasIcon: true },
    { name: "Günün Fırsatları", hasIcon: true },
    { name: "Kombine Bonusları", hasIcon: true },
  ],
  "hizli-kazan": [
    { name: "Hızlı Oyunlar", hasIcon: true },
    { name: "Crash Oyunları", hasIcon: true },
    { name: "Aviator", hasIcon: true },
    { name: "Spaceman", hasIcon: true },
  ],
  "canli-oyunlar": [
    { name: "Tüm Canlı Oyunlar", hasIcon: true },
    { name: "Game Shows", hasIcon: true },
    { name: "Monopoly Live", hasIcon: true },
    { name: "Crazy Time", hasIcon: true },
  ],
  "promosyonlar": [
    { name: "Tüm Promosyonlar", hasIcon: true },
    { name: "Hoş Geldin Bonusu", hasIcon: true },
    { name: "Yatırım Bonusları", hasIcon: true },
    { name: "Kayıp Bonusları", hasIcon: true },
  ],
  "turnuvalar": [
    { name: "Aktif Turnuvalar", hasIcon: true, href: "/tournaments" },
    { name: "Yaklaşan Turnuvalar", hasIcon: true, href: "/tournaments" },
    { name: "Turnuva Geçmişi", hasIcon: true, href: "/tournaments" },
  ],
  "move-plus": [
    { name: "VELO+ Avantajları", hasIcon: true },
    { name: "VIP Programı", hasIcon: true },
    { name: "Özel Teklifler", hasIcon: true },
  ],
  "discount-talep": [
    { name: "Discount Talep Et", hasIcon: true, href: "https://www.vlodiscount3.com" },
    { name: "Aktif Discountlar", hasIcon: true, href: "https://www.vlodiscount3.com" },
    { name: "Discount Geçmişi", hasIcon: true, href: "https://www.vlodiscount3.com" },
  ],
}

const iconMap: Record<string, string> = {
  "canlı casino ana sayfa": "/icons/canli-casino-ana-sayfa.png",
  "pragmatic live": "/icons/pragmatic-live.png",
  "creedroomz": "/icons/creedroomz.png",
  "blackjack": "/icons/blackjack.png",
  "rulet": "/icons/rulet.png",
  "poker": "/icons/poker.png",
  "baccarat": "/icons/baccarat.png",
  "tombala": "/icons/tombala.png",
  "sic bo": "/icons/sic-bo.png",
  "türkçe mega rulet - 500x": "/icons/turkce-mega-rulet-500x.png",
  "mega rulet - 3000x": "/icons/mega-rulet-3000x.png",
  "cyber roulette 500x": "/icons/cyber-roulette-500x.png",
  "cyber roulette 1000x": "/icons/cyber-roulette-1000x.png",
  "sweet bonanza candyland": "/icons/sweet-bonanza-candyland.png",
  "türkçe blackjack 1": "/icons/turkce-blackjack-1.png",
  "türkçe blackjack 2": "/icons/turkce-blackjack-2.png",
  "türkçe blackjack 3": "/icons/turkce-blackjack-3.png",
  "türkçe rulet": "/icons/turkce-rulet.png",
  "auto roulette": "/icons/auto-roulette.png",
}

function GameIcon({ name }: { name: string }) {
  const n = name.toLowerCase()

  // PNG ikon map'inde varsa direkt kullan
  if (iconMap[n]) return (
    <img src={iconMap[n]} alt={name} width={24} height={24} style={{ objectFit: "contain" }} />
  )

  // Rulet / Roulette (fallback SVG)
  if (n.includes("rulet") || n.includes("roulette")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="#ef4444" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="9" fill="transparent" stroke="#ef4444" strokeWidth="1"/>
      <circle cx="16" cy="16" r="3" fill="#ef4444"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <rect key={i} x="15.2" y="4" width="1.6" height="5" fill={i%2===0?"#ef4444":"#fff"} transform={`rotate(${deg} 16 16)`}/>
      ))}
    </svg>
  )

  // Blackjack (fallback)
  if (n.includes("blackjack")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <rect x="4" y="4" width="24" height="24" rx="5" fill="#1a1a2e" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="10" y="20" fill="#3b82f6" fontSize="11" fontWeight="bold">B</text>
      <text x="17" y="20" fill="#3b82f6" fontSize="11" fontWeight="bold">J</text>
    </svg>
  )

  // Poker (fallback)
  if (n.includes("poker")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fill="#ef4444" fontSize="14">♠</text>
    </svg>
  )

  // Baccarat (fallback)
  if (n.includes("baccarat")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <rect x="4" y="4" width="24" height="24" rx="5" fill="#1a1a1a" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fill="#8b5cf6" fontSize="14">♣</text>
    </svg>
  )

  // Tombala (fallback)
  if (n.includes("tombala")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#134e4a" stroke="#14b8a6" strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fill="#14b8a6" fontSize="11" fontWeight="bold">T</text>
    </svg>
  )

  // Sic Bo (fallback)
  if (n.includes("sic bo")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <rect x="4" y="4" width="24" height="24" rx="5" fill="#1a1a1a" stroke="#f43f5e" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="2" fill="#f43f5e"/>
      <circle cx="21" cy="11" r="2" fill="#f43f5e"/>
      <circle cx="11" cy="21" r="2" fill="#f43f5e"/>
      <circle cx="21" cy="21" r="2" fill="#f43f5e"/>
      <circle cx="16" cy="16" r="2" fill="#f43f5e"/>
    </svg>
  )

  // Pragmatic (fallback)
  if (n.includes("pragmatic")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#1a0a00" stroke="#f97316" strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">PL</text>
    </svg>
  )

  // PlayMatrix
  if (n.includes("playmatrix")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#1a0015" stroke="#ec4899" strokeWidth="1.5"/>
      <path d="M12 10 L22 16 L12 22 Z" fill="#ec4899"/>
    </svg>
  )

  // Creed / CreedRoomz
  if (n.includes("creed")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <rect x="4" y="4" width="24" height="24" rx="5" fill="#0f0f2e" stroke="#6366f1" strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="bold">CR</text>
    </svg>
  )

  // Bonanza / Sweet
  if (n.includes("bonanza") || n.includes("sweet") || n.includes("candy")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#1a0a2e" stroke="#a855f7" strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fill="#a855f7" fontSize="10" fontWeight="bold">SB</text>
    </svg>
  )

  // Casino / Ana Sayfa
  if (n.includes("casino") || n.includes("top 20") || n.includes("türkçe casino")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#1a1100" stroke="#d4af37" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="9" fill="transparent" stroke="#d4af37" strokeWidth="0.8"/>
      <circle cx="16" cy="16" r="2.5" fill="#d4af37"/>
      {[0,60,120,180,240,300].map((deg, i) => (
        <circle key={i} cx={16 + 7*Math.sin(deg*Math.PI/180)} cy={16 - 7*Math.cos(deg*Math.PI/180)} r="1.5" fill="#d4af37"/>
      ))}
    </svg>
  )

  // Aviator / Spaceman / Crash
  if (n.includes("aviator") || n.includes("spaceman") || n.includes("crash")) return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#ef4444" strokeWidth="1.5"/>
      <path d="M8 22 L16 6 L24 22 L16 18 Z" fill="#ef4444"/>
    </svg>
  )

  // Default — ilk harf + renk
  const colors = ["#f59e0b","#3b82f6","#ef4444","#8b5cf6","#14b8a6","#f97316","#ec4899"]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#1a1a1a" stroke={color} strokeWidth="1.5"/>
      <text x="16" y="21" textAnchor="middle" fill={color} fontSize="13" fontWeight="bold">
        {name.charAt(0).toUpperCase()}
      </text>
    </svg>
  )
}

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("canli-casino")
  const [searchQuery, setSearchQuery] = useState("")
  const [casinoCategories, setCasinoCategories] = useState<{ name: string; hasIcon: boolean; href?: string }[]>([])
  const [popularMatches, setPopularMatches] = useState<{ name: string; hasIcon: boolean; href: string }[]>([])

  const handleNav = useCallback((href: string) => {
    router.push(href)
    onClose()
  }, [onClose, router])

  useEffect(() => {
    if (activeCategory === "casino") {
      gamesService.getCategories().then((res) => {
        if (res.success && res.categories) {
          // Canlı casino / live / sportsbook / spor kategorilerini dışla
          const excluded = [
            "pragmatic", "sportsbook", "spor",
            "canli", "canlı", "live", "canlicasino",
            "top 20", "türkçe casino", "baccarat", "rulet", "blackjack",
            "poker", "tombala", "sic bo", "zar", "tvbet", "sa gaming",
            "vivo", "skywind", "pateplay", "micro gaming", "egt (amusnet) live",
            "live games", "creedroomz", "yüksek limitli", "canlı oyunlar"
          ]
          const items = res.categories
            .filter((cat: any) => {
              const name = (cat.name || cat.title || "").toLowerCase()
              return !excluded.some((ex) => name.includes(ex))
            })
            .map((cat: any) => {
              const name = cat.name || cat.title || ""
              const slug = cat.slug || cat.category_slug || cat.id ||
                name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
              return {
                name,
                hasIcon: true,
                href: `/casino/${slug}`,
              }
            })
          setCasinoCategories(items)
        }
      })
    }

    if (activeCategory === "bahis") {
      fetch("/api/sports/popular-matches")
        .then((r) => r.json())
        .then((res) => {
          const topItems = [
              { name: "Tümü", hasIcon: true, href: "/sports" },
              { name: "Canlı Bahis", hasIcon: true, href: "/sports" },
              { name: "Egextra Özel Oran", hasIcon: true, href: "/sports" },
            ]
            const matchItems = res.success && res.data?.length > 0
              ? res.data.map((m: any) => ({ name: m.name, hasIcon: true, href: "/sports" }))
              : []
            const leagueItems = [
              { name: "UEFA Avrupa Ligi", hasIcon: true, href: "/sports" },
              { name: "UEFA Şampiyonlar Ligi", hasIcon: true, href: "/sports" },
              { name: "İngiltere Premier Lig", hasIcon: true, href: "/sports" },
              { name: "Almanya Bundesliga", hasIcon: true, href: "/sports" },
              { name: "İspanya La Liga", hasIcon: true, href: "/sports" },
              { name: "İtalya Serie A", hasIcon: true, href: "/sports" },
              { name: "Fransa Lig 1", hasIcon: true, href: "/sports" },
              { name: "Belçika Jupiler Pro Lig", hasIcon: true, href: "/sports" },
              { name: "Brezilya Serie A", hasIcon: true, href: "/sports" },
              { name: "NBA", hasIcon: true, href: "/sports" },
              { name: "DOTA 2 - Espor", hasIcon: true, href: "/sports" },
            ]
            setPopularMatches([...topItems, ...matchItems, ...leagueItems])
        })
        .catch(() => {})
    }
  }, [activeCategory])

  if (!isOpen) return null

  const baseSubMenu =
    activeCategory === "casino" && casinoCategories.length > 0
      ? casinoCategories
      : activeCategory === "bahis" && popularMatches.length > 0
      ? popularMatches
      : subMenuItems[activeCategory] || []

  const filteredSubMenu = baseSubMenu.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-0 z-50 flex animate-in slide-in-from-left duration-300">
        {/* Two-panel layout */}
        <div className="flex w-full h-full bg-[#0d0d0d]">
          {/* Header bar */}
          <div className="sidebar-header-bar absolute top-0 left-0 right-0 flex items-center bg-[#0d0d0d] z-10" style={{ height: "56px", paddingLeft: "16px", paddingRight: "12px" }}>
              <Image src="/logo.svg" alt="velobet" width={120} height={28} />
            <button
              onClick={onClose}
              className="p-2 transition-colors ml-auto"
              style={{ color: "#00d4b4" }}
            >
              <X style={{ width: "22px", height: "22px" }} />
            </button>
          </div>

          {/* Left panel - Main categories */}
          <div className="w-[100px] flex flex-col pt-14 bg-[#0d0d0d]">
            <div className="flex-1 overflow-y-auto flex flex-col" style={{ paddingTop: "8px", paddingLeft: "4px", paddingRight: "4px", paddingBottom: "4px", gap: "8px" }}>
              {/* Kesfet karti */}
              <button
                onClick={() => setActiveCategory("kesfet")}
                className="flex-shrink-0 flex items-center justify-center transition-all"
                style={{ width: "92px", height: "70px" }}
              >
                <div
                  className="flex flex-col items-center justify-center w-full h-full transition-all"
                  style={{
                    backgroundColor: activeCategory === "kesfet" ? "rgb(26, 45, 46)" : "#1a1a1a",
                    borderRadius: "8px",
                    paddingTop: "8px",
                    paddingBottom: "6px",
                    gap: "2px",
                  }}
                >
                  <Image src="/logo.svg" alt="velobet" width={60} height={18} style={{ objectFit: "contain" }} />
                  <span style={{ fontSize: "10px", fontWeight: 600, color: activeCategory === "kesfet" ? "#ffffff" : "#999" }}>
                    Keşfet
                  </span>
                </div>
              </button>

              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (category.id === "ozel-oran") {
                      handleNav("/sports/spor/yuksek-oran")
                    } else if (category.id === "promosyonlar") {
                      handleNav("/promotions")
                    } else if (category.id === "discount-talep") {
                      window.open("https://www.vlodiscount3.com", "_blank")
                      onClose()
                    } else {
                      setActiveCategory(category.id)
                    }
                  }}
                  className="flex-shrink-0 flex items-center justify-center transition-all"
                  style={{ width: "92px", height: "70px" }}
                >
                  <div
                    className="flex flex-col items-center justify-center w-full h-full transition-all"
                    style={{
                      backgroundColor: activeCategory === category.id ? "rgb(26, 45, 46)" : "#1a1a1a",
                      borderRadius: "8px",
                      paddingTop: "8px",
                      paddingBottom: "6px",
                      gap: "2px",
                    }}
                  >
                    <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
                      {category.icon}
                    </div>
                    <span
                      className="leading-tight block"
                      style={{
                        fontSize: "10px",
                        fontWeight: 500,
                        color: activeCategory === category.id ? "#ffffff" : "#999",
                        wordBreak: "break-word",
                        maxWidth: "80px",
                      }}
                    >
                      {category.name}
                    </span>
                  </div>
                </button>
              ))}

              {/* Daha Fazla button */}
              <button
                className="w-full flex flex-col items-center justify-center text-center transition-all"
                style={{ padding: "8px 6px" }}
              >
                <div
                  className="flex flex-col items-center justify-center w-full"
                  style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "10px 4px 8px", borderLeft: "3px solid transparent" }}
                >
                  <div className="w-9 h-9 rounded-full bg-[#00d4b4] flex items-center justify-center mb-1.5">
                    <Plus className="h-5 w-5 text-black" />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 500, color: "#999" }}>Daha Fazla</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right panel - Sub menu */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingTop: "64px", paddingLeft: "6px", paddingRight: "6px", paddingBottom: "8px" }}>

            {/* Arama input - tam genislik, radius 10px */}
            <div
              className="flex items-center flex-shrink-0 w-full"
              style={{
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#1c1c1c",
                padding: "0 12px",
                gap: "8px",
              }}
            >
              <Search style={{ width: "16px", height: "16px", color: "#fff9", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Oyun İsmi Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder:text-[#666] focus:outline-none w-full"
                style={{ flex: 1, fontSize: "14px" }}
              />
              <button onClick={() => setSearchQuery("")} style={{ flexShrink: 0 }}>
                <X style={{ width: "16px", height: "16px", color: "#fff9" }} />
              </button>
            </div>

            {/* 8px bosluk */}
            <div style={{ height: "8px" }} />

            {/* Alt liste alani - tam genislik, radius 10px */}
            <div
              className="flex-1 overflow-y-auto w-full"
              style={{
                borderRadius: "8px",
                backgroundColor: "#1c1c1c",
                paddingTop: "8px",
              }}
            >
              {activeCategory === "ozel-oran" && (
                <button
                  onClick={() => handleNav("/sports/spor/yuksek-oran")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80px", color: "#9ca3af", fontSize: "14px", width: "100%", background: "none", border: "none", cursor: "pointer" }}
                  className="hover:bg-[#2f2f2f]"
                >
                  Şu anda turnuva bulunmamaktadır
                </button>
              )}
              {activeCategory !== "ozel-oran" && filteredSubMenu.map((item, index) => {
                const inner = (
                  <>
                    {item.hasIcon && (
                      <span style={{ width: "20px", height: "20px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <GameIcon name={item.name} />
                      </span>
                    )}
                    <span
                      className="flex-1 text-left"
                      style={{ fontSize: "14px", color: "#e0e0e0", fontWeight: 400 }}
                    >
                      {item.name}
                    </span>
                  </>
                )
                const rowStyle: React.CSSProperties = {
                  width: "298px",
                  height: "20px",
                  padding: "6px 10px 6px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxSizing: "content-box",
                  transition: "background 0.15s",
                }
                return item.href ? (
                  <button
                    key={index}
                    style={{ ...rowStyle, background: "none", border: "none", textAlign: "left", width: "100%" }}
                    className="hover:bg-[#2f2f2f]"
                    onClick={() => handleNav(item.href!)}
                  >
                    {inner}
                  </button>
                ) : (
                  <button key={index} style={rowStyle} className="hover:bg-[#2f2f2f]">
                    {inner}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
