// v4
"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronRight, Loader2, ChevronDown, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RecentWinners } from "@/components/recent-winners"
import { SearchModal } from "@/components/search-modal"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { GameLoginModal } from "@/components/game-login-modal"
import { GameLaunchModal } from "@/components/game-launch-modal"
import { DesktopHeader } from "@/components/desktop-header"
import BannerSlider from "@/components/banner-slider"
import { useAuth } from "@/contexts/auth-context"
import { gamesService, type Game, type GameCategory } from "@/lib/services/games-service"
import { CategorySkeleton } from "@/components/game-skeleton"
import { VipRankBadge } from "@/components/vip-rank-badge"
import { sortGamesByFeatured } from "@/lib/featured-games"

const DEFAULT_TABS = ["Lobi"]

// Sadece Canlı Casino'da gorunecek kategoriler — Casino'da gizle
// Hem slug hem de kategori ismi icin anahtar kelimeler
const LIVE_CASINO_KEYWORDS = [
  "canli", "canlı", "live",
  "turkce-casino", "türkçe casino",
  "top20", "creedroomz",
  "sagaming", "sa gaming",
  "pateplay", "petaplay",
  "vivo",
  "tvbet",
  "betgames",
  "skywind",
  "microgaming", "micro gaming",
  "blackjack", "black jack",
  "rulet", "roulette",
  "tombala",
  "baccarat",
  "poker",
  "sicbo", "sic bo", "sic-bo",
  "zar oyun",
]

// Component dışında tanımla — her render'da yeniden olusturulmasin
const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

// Provider code'ını format et: "SLOT-AMUSNET" -> "Amusnet"
// İhtiyaç halinde provider mapping'i eklenebilir
const providerNameMap: Record<string, string> = {
  "SLOT-3OAKS": "3oaks",
  "SLOT-AMUSNET": "Amusnet",
  "SLOT-BACKSEAT": "Backseat",
  "SLOT-BOOMING": "Booming",
  "SLOT-CROCO": "Croco",
  "SLOT-EGT": "Egt Digital",
  "SLOT-EGT_VIP": "Egt Digital VIP",
  "SLOT-ELK": "Elk",
  "SLOT-GREENTUBE": "Greentube",
  "SLOT-HACKSAW": "Hacksaw",
  "SLOT-NETENT": "Netent",
  "SLOT-NOLIMITCITY": "Nolimitcity",
  "SLOT-PLAYSON": "Playson",
  "SLOT-PRAGMATIC": "PragmaticPlay",
  "SLOT-PUSH": "Push",
  "SLOT-RUBYPLAY": "Rubyplay",
  "NETENTWC": "Netent",
  "NOVO-MATIC": "Novomatic",
  "NOLIMITCITYWV": "Nolimitcity",
  "NOLIMITCITY-A": "Nolimitcity",
  "BETSOFT-A": "Betsoft",
  "YGGDRASIL-A": "Yggdrasil",
  "ONLY-PLAY": "Only Play",
  "BIGTIMEGAMING-A": "Big Time Gaming",
  "PASCALGAMING": "Pascal Gaming",
  "7-MOJOS-SLOTS": "7mojos",
  "7-MOJOS": "7mojos",
  "7MOJOS-SLOTS": "7mojos",
  "MINI-SPRIBE": "Mini Spribe",
  "WAZDAN-A": "Wazdan",
  "PP_LIVE_PRO": "PragmaticPlay",
  "AMUSNET-LIVE": "Amusnet Live",
  "PRAGMATIC": "PragmaticPlay",
  "PRAGMATICLIVE": "PragmaticPlay",
  "PRAGMATIC-BJ": "PragmaticPlay",
  "PRAGMATIC-BJ2": "PragmaticPlay",
  "PRAGMATIC-LIVE": "PragmaticPlay",
  "PRAGMATIC-VIRTUAL": "PragmaticPlay",
  "PRAGMATICS": "PragmaticPlay",
}

const formatProviderCode = (code: string): string => {
  if (!code) return ""
  // Mapping'te varsa, hazır adını kullan
  if (providerNameMap[code.toUpperCase()]) {
    return providerNameMap[code.toUpperCase()]
  }
  // Mapping'te yoksa, otomatik format et
  let formatted = code.replace(/^[A-Z]+-/, "")
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase()
}

function NavTab({ tab, isActive, onClick }: { tab: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 flex items-center h-full whitespace-nowrap px-4 transition-colors duration-150 hover:bg-[#3a3a3a]"
      style={{
        color: isActive ? "#00d4b4" : undefined,
        fontSize: "16px",
        fontWeight: 500,
      }}
    >
      {tab}
    </button>
  )
}

function CasinoGameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <div className="group flex flex-col cursor-pointer" onClick={onClick}>
      <div className="relative rounded-lg lg:rounded-none w-full overflow-hidden h-[124px]">
{/* Resim — hover'da blur */}
<img
src={game.image || "/placeholder-game.png"}
alt={game.name}
loading="lazy"
decoding="async"
className="w-full h-full block transition-[filter] duration-250 group-hover:blur-[4px] object-cover bg-zinc-800"
onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
/>
        {/* Mobile YENI ribbon — sol üst köşe, background image ile */}
        {Array.isArray(game.categories) && game.categories.includes("yeni-oyunlar") && (
          <div style={{
              width: "124px",
              height: "21px",
              backgroundImage: "url(/images/yeni-ribbon.webp)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "top left",
              alignItems: "center",
              paddingLeft: "22px",
              position: "absolute",
              top: "0",
              left: "0",
              zIndex: "10"
            }}
            className="flex lg:hidden"
          >
            <span style={{ color: "white", fontSize: "12px", fontWeight: "900", letterSpacing: "0.2px" }}>YENİ</span>
          </div>
        )}
        
        {/* Provider badge — hover'da goster */}
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="tracking-wide" style={{ fontWeight: 600, backgroundColor: "#00d4b4", color: "#000", fontSize: "10px", height: "21px", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 6px", whiteSpace: "nowrap" }}>
            {game.provider ? formatProviderCode(game.provider) : ""}
          </span>
        </div>
        {/* Oyna butonu — hover'da goster */}
        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button
            className="pointer-events-auto"
            style={{ backgroundColor: "#00d4b4", color: "#000", fontSize: "14px", fontWeight: 600, width: "120px", height: "40px", borderRadius: 0 }}
            onClick={(e) => { e.stopPropagation(); onClick() }}
          >
            HEMEN OYNA!
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <h4 className="game-title flex-1">{game.name}</h4>
        {/* Desktop YENI badge — title'ın sağında inline */}
        {Array.isArray(game.categories) && game.categories.includes("yeni-oyunlar") && (
          <div className="hidden lg:flex" style={{ backgroundColor: "#DC2626", width: "32.47px", height: "21px", alignItems: "center", justifyContent: "center", flexShrink: 0, paddingX: "4px" }}>
            <span className="text-[10px] text-white font-black">YENİ</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CasinoCategorySection({
  category, visibleCount, onShowMore, onGameClick, showAll = false, onSeeAll, activeTab,
}: {
  category: GameCategory; visibleCount: number; onShowMore: () => void
  onGameClick: (game: Game) => void; showAll?: boolean; onSeeAll?: () => void; activeTab: string
}) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!filterOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Filtre butonuna tıklandıysa işlem yapma (toggle butonu kendisi halleder)
      if (target.closest('button')?.textContent === 'Filtre') return
      if (filterRef.current && !filterRef.current.contains(target)) setFilterOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [filterOpen])

  const providers = Array.from(new Set(category.games.map((g) => g.provider || g.provider_code).filter(Boolean) as string[])).sort()
  const toggleProvider = (p: string) => setSelectedProviders((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])

  // Provider filterlemesi yap — sıralama filteredCategories useMemo'da zaten yapıldı
  let filteredGames = selectedProviders.length === 0
    ? category.games
    : category.games.filter((g) => selectedProviders.includes(g.provider || g.provider_code || ""))

  // Filtre uygulandığında da pinleme sırasını koru
  const gamesWithDefaults = selectedProviders.length === 0
    ? filteredGames
    : sortGamesByFeatured(
        filteredGames.map(game => ({
          ...game,
          has_lobby: game.has_lobby ?? 0,
          featured: game.featured ?? 0
        })),
        category.slug || category.name
      )

  const mobileVisibleGames = showAll ? gamesWithDefaults : gamesWithDefaults.slice(0, visibleCount)
  // desktopLimit: showAll ise tamami, degil ise 6 cols * 2 satir = 12 (xl'de 8*2=16)
  const desktopLimit = showAll ? gamesWithDefaults.length : 16
  const desktopVisibleGames = gamesWithDefaults.slice(0, desktopLimit)
  const hasMoreMobile = !showAll && visibleCount < gamesWithDefaults.length

  return (
    <div className="px-4 lg:px-8 mb-2 lg:mb-[50px]">
      {/* Mobil */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-white">
            {showAll ? `${filteredGames.length} ${category.name}` : category.name}
          </h3>
          {showAll && providers.length > 0 && (
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="text-sm font-semibold border transition-colors px-4 py-2"
              style={{ borderColor: "#00d4b4", color: "#00d4b4", backgroundColor: "transparent" }}
            >
              Filtre
            </button>
          )}
        </div>
        
        {/* Mobil Filtre Paneli */}
        {showAll && filterOpen && providers.length > 0 && (
          <div ref={filterRef} className="mb-4 px-2">
            <button 
              onClick={() => setSelectedProviders([])}
              className="text-sm font-semibold text-gray-400 mb-3 hover:text-white transition-colors"
            >
              Yenile
            </button>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative w-5 h-5 border flex items-center justify-center" style={{ backgroundColor: selectedProviders.length === 0 ? "#00d4b4" : "transparent", borderColor: selectedProviders.length === 0 ? "#00d4b4" : "#ffffff" }}>
                  {selectedProviders.length === 0 && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={selectedProviders.length === 0} onChange={() => setSelectedProviders([])} className="sr-only" />
                <span className="text-sm text-white font-medium">Tüm</span>
              </label>
              {providers.map((p) => (
                <label key={p} className="flex items-center gap-3 cursor-pointer">
                  <div className="relative w-5 h-5 border flex items-center justify-center" style={{ backgroundColor: selectedProviders.includes(p) ? "#00d4b4" : "transparent", borderColor: selectedProviders.includes(p) ? "#00d4b4" : "#ffffff" }}>
                    {selectedProviders.includes(p) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" checked={selectedProviders.includes(p)} onChange={() => toggleProvider(p)} className="sr-only" />
                  <span className="text-sm text-white font-medium">{p}</span>
                </label>
              ))}
            </div>
            <div className="text-right mt-4">
              <button
                onClick={() => setFilterOpen(false)}
                className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Sağlayıcılar�� Kapa
              </button>
            </div>
            <div className="mt-3 -mx-2 border-t border-gray-600" />
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {mobileVisibleGames.map((game, index) => (
            <CasinoGameCard key={game.id || index} game={game} onClick={() => onGameClick(game)} />
          ))}
        </div>
        {hasMoreMobile && (
          <div className="flex justify-center mt-6">
            <button
              onClick={visibleCount >= 12 ? onSeeAll : onShowMore}
              style={{ border: "2px solid #00d4b4", backgroundColor: "transparent", color: "#00d4b4", padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, minWidth: "200px", height: "54px", display: "flex", alignItems: "center", justifyContent: "center" }}
              className="hover:bg-[#00d4b4]/10 transition-colors"
            >
              {visibleCount >= 12 ? `Hepsini Gör (${filteredGames.length})` : "Daha Fazla Göster"}
            </button>
          </div>
        )}
      </div>

      {/* Masaüstü */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white uppercase">
            {activeTab === "Lobi" ? category.name : `${showAll ? filteredGames.length : category.games.length} ${category.name}`}
          </h3>
          {!showAll && (
            <button onClick={onSeeAll} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
              Hepsini gor {category.games.length} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {showAll && providers.length > 0 && (
          <div ref={filterRef} className="flex justify-end mb-3 relative">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white border border-gray-600 hover:border-gray-400 transition-colors"
              style={{ backgroundColor: "transparent" }}
            >
              Filtre <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 shadow-xl" style={{ backgroundColor: "#fff", minWidth: "420px", padding: "20px 24px" }}>
                <button 
                  onClick={() => setSelectedProviders([])}
                  className="text-xs font-semibold text-gray-500 uppercase mb-3 hover:text-gray-700 transition-colors"
                >
                  Yenile
                </button>
                <div className="grid grid-cols-3 gap-y-3 gap-x-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative w-4 h-4 border flex items-center justify-center" style={{ backgroundColor: selectedProviders.length === 0 ? "#00d4b4" : "transparent", borderColor: selectedProviders.length === 0 ? "#00d4b4" : "#9ca3af" }}>
                      {selectedProviders.length === 0 && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={selectedProviders.length === 0} onChange={() => setSelectedProviders([])} className="sr-only" />
                    <span className="text-sm text-gray-800 font-medium">Tüm</span>
                  </label>
                  {providers.map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <div className="relative w-4 h-4 border flex items-center justify-center" style={{ backgroundColor: selectedProviders.includes(p) ? "#00d4b4" : "transparent", borderColor: selectedProviders.includes(p) ? "#00d4b4" : "#9ca3af" }}>
                        {selectedProviders.includes(p) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" checked={selectedProviders.includes(p)} onChange={() => toggleProvider(p)} className="sr-only" />
                      <span className="text-sm text-gray-800 font-medium">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-6 xl:grid-cols-8 gap-3">
          {desktopVisibleGames.map((game, index) => (
            <CasinoGameCard key={game.id || index} game={game} onClick={() => onGameClick(game)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CasinoPage({ initialCategory = undefined }: { initialCategory?: string }) {
  const { isLoggedIn } = useAuth()
  const initialCategoryRef = useRef(initialCategory)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [isGameLoginOpen, setIsGameLoginOpen] = useState(false)
  const [isGameLaunchOpen, setIsGameLaunchOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const router = useRouter()

  // --- State tan��mları setActiveTab'dan ÖNCE ---
  const [activeTab, setActiveTabState] = useState("Lobi")
  const [isSticky, setIsSticky] = useState(false)
  const [categoryVisibleCounts, setCategoryVisibleCounts] = useState<Record<string, number>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [categories, setCategories] = useState<GameCategory[]>([])
  const [categoryTabs, setCategoryTabs] = useState<string[]>(DEFAULT_TABS)

  const [isLoading, setIsLoading] = useState(true)
  const fetchedSlugs = useRef<Set<string>>(new Set())

  // Desktop search state
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false)
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("")
  const [desktopSearchResults, setDesktopSearchResults] = useState<Game[]>([])
  const [desktopRecentSearches, setDesktopRecentSearches] = useState<Game[]>([])
  const [isDesktopSearchLoading, setIsDesktopSearchLoading] = useState(false)
  const desktopSearchInputRef = useRef<HTMLInputElement>(null)

  const RECENT_KEY = "recent_game_searches"
  const getRecent = (): Game[] => { try { const s = localStorage.getItem(RECENT_KEY); return s ? JSON.parse(s) : [] } catch { return [] } }
  const addRecent = (game: Game) => { try { const prev = getRecent().filter((g) => g.id !== game.id); localStorage.setItem(RECENT_KEY, JSON.stringify([game, ...prev].slice(0, 10))) } catch {} }

  const openDesktopSearch = () => {
    setDesktopSearchOpen(true)
    setDesktopRecentSearches(getRecent())
    setTimeout(() => desktopSearchInputRef.current?.focus(), 50)
  }

  const closeDesktopSearch = () => {
    setDesktopSearchOpen(false)
    setDesktopSearchQuery("")
    setDesktopSearchResults([])
  }

  useEffect(() => {
    if (!desktopSearchOpen) return
    const run = async () => {
      if (desktopSearchQuery.trim().length < 2) { setDesktopSearchResults([]); return }
      setIsDesktopSearchLoading(true)
      try {
        const catRes = await gamesService.getCategories()
        let all: any[] = []
        if (catRes.success && catRes.categories) {
          const fetched = await Promise.all(catRes.categories.map(async (cat: any) => {
            const slug = cat.slug || cat.name
            if (!slug) return []
            try { const r = await gamesService.getGamesByCategory(slug, 2000); return r.success && r.games ? r.games : [] } catch { return [] }
          }))
          all = fetched.flat()
        }
        const q = desktopSearchQuery.toLowerCase()
        const unique = all.filter((g, i, arr) => arr.findIndex((x) => x._id === g._id) === i)
        const matched = unique.filter((g: any) => (g.game_name || g.name || "").toLowerCase().includes(q))
        setDesktopSearchResults(matched.slice(0, 60).map((g: any, i: number) => transformGame(g, i)))
      } catch { setDesktopSearchResults([]) }
      finally { setIsDesktopSearchLoading(false) }
    }
    const t = setTimeout(run, 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopSearchQuery, desktopSearchOpen])

  const handleDesktopGameClick = (game: Game) => {
    addRecent(game)
    closeDesktopSearch()
    handleGameClick(game)
  }

  const setActiveTab = useCallback((name: string) => {
    setActiveTabState(name)
    // URL'i guncelle ama Next.js router'i tetikleme (full re-render olmasin)
    const url = name === "Lobi"
      ? "/casino"
      : `/casino/${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
    window.history.replaceState(null, "", url)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const resolveImage = (url: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    // Sadece dosya adi geliyorsa (ornek: fatbanker-01.png) /uploads/ ekle
    if (url.startsWith("/")) return `https://apievrymatrix5d84k321.com${url}`
    return `https://apievrymatrix5d84k321.com/uploads/${url}`
  }

  const transformGame = (g: any, gIndex: number): Game => ({
    id: g._id || g.id || g.game_code || `game-${gIndex}`,
    gameCode: g.game_code || g.gameCode,
    name: g.game_name || g.name || "Oyun",
    image: resolveImage(g.banner || g.cover || g.image || ""),
    provider: g.provider?.name || g.provider_code || g.provider || "",
    providerCode: g.provider?.code || g.provider_code || g.provider || "",
    isNew: g.featured === 1,
    betRange: g.betRange,
    categories: g.categories,
    has_lobby: g.has_lobby,
    featured: g.featured,
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const categoriesRes = await gamesService.getCategoriesWithGames()
        if (categoriesRes.success && categoriesRes.categories) {
          const rawCats = Array.isArray(categoriesRes.categories) ? categoriesRes.categories : []

          // getCategoriesWithGames zaten oyunları içeriyor — her kategori için ekstra istek atmıyoruz (429 önlemek için)
          const filledCategories = rawCats.map((cat: any, index: number) => ({
            id: cat._id || cat.id || `cat-${index}`,
            name: cat.name || cat.title || "Kategori",
            slug: cat.slug || cat._id || cat.id,
            games: (Array.isArray(cat.games) ? cat.games : []).map(transformGame),
          }))
          const nonEmpty = filledCategories.filter((c) => {
            if (c.games.length === 0) return false
            const slug = (c.slug || "").toLowerCase()
            const name = (c.name || "").toLowerCase()
            const combined = `${slug} ${name}`
            const isLive = LIVE_CASINO_KEYWORDS.some((kw) => combined.includes(kw))
            return !isLive
          })

          // "SADECE VELOBETTE" kategorisi için tam oyun listesini çek (lobi'de pinli oyunlar için)
          const velobetteIdx = nonEmpty.findIndex((c) => {
            const n = (c.name || "").toLowerCase()
            return n.includes("velobette") || n.includes("erken erişim") || n.includes("early")
          })
          console.log("[v0] velobetteIdx:", velobetteIdx)
          if (velobetteIdx >= 0) {
            const veloCat = nonEmpty[velobetteIdx]
            const slug = veloCat.slug || veloCat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
            console.log("[v0] Velobette slug:", slug, "cat name:", veloCat.name)
            const fullRes = await gamesService.getGamesByCategory(slug)
            console.log("[v0] fullRes success:", fullRes.success, "games count:", fullRes.games?.length)
            if (fullRes.success && fullRes.games && fullRes.games.length > 0) {
              // Heartbreakers var mı kontrol et
              const heartbreakersGame = fullRes.games.find((g: any) => {
                const n = (g.name || g.gameName || "").toLowerCase().replace(/\s+/g, "")
                return n.includes("heartbreaker")
              })
              console.log("[v0] Heartbreakers bulundu mu:", heartbreakersGame ? "EVET - " + (heartbreakersGame.name || heartbreakersGame.gameName) : "HAYIR")
              
              // Tüm oyun isimlerini logla (ilk 5)
              console.log("[v0] İlk 5 oyun:", fullRes.games.slice(0, 5).map((g: any) => g.name || g.gameName))
              
              nonEmpty[velobetteIdx] = {
                ...veloCat,
                games: fullRes.games.map((g: any, i: number) => transformGame(g, i))
              }
            }
          }

          setCategories(nonEmpty)
          setCategoryTabs(["Lobi", ...nonEmpty.map((c) => c.name)])
          const initialCounts: Record<string, number> = {}
          nonEmpty.forEach((cat) => { initialCounts[cat.id] = 4 })
          setCategoryVisibleCounts(initialCounts)

          if (initialCategoryRef.current) {
            const matched = nonEmpty.find(
              (c) => c.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === initialCategoryRef.current
            )
            if (matched) setActiveTabState(matched.name)
          }
        } else {
          setCategories([])
        }


      } catch {
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // activeTab degisince tum oyunlari getir
  useEffect(() => {
    if (activeTab === "Lobi") return
    const cat = categories.find((c) => c.name === activeTab)
    if (!cat) return
    const key = cat.id + cat.name
    if (fetchedSlugs.current.has(key)) return
    fetchedSlugs.current.add(key)

    const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    // once slug ile dene, 0 gelirse id ile dene
    gamesService.getGamesByCategory(slug).then(async (res) => {
      let games = res.success && res.games && res.games.length > 0 ? res.games : null
      if (!games) {
        const res2 = await gamesService.getGamesByCategory(cat.id)
        games = res2.success && res2.games && res2.games.length > 0 ? res2.games : null
      }
      if (games) {
        const allGames = games.map((g: any, i: number) => transformGame(g, i))
        setCategories((prev) =>
          prev.map((c) => c.name === activeTab ? { ...c, games: allGames } : c)
        )
      }
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, categories.length])

  useEffect(() => {
    if (!initialCategory) {
      // initialCategory undefined ise Lobi'ye dön
      setActiveTabState("Lobi")
      return
    }
    if (categoryTabs.length <= 1) return
    const matched = categoryTabs.find((t) => toSlug(t) === initialCategory)
    if (matched) setActiveTabState(matched)
  }, [initialCategory, categoryTabs])

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 250)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleShowMore = (categoryId: string) => {
    setCategoryVisibleCounts((prev) => {
      const current = prev[categoryId] || 4
      if (current >= 12) return prev
      return { ...prev, [categoryId]: Math.min(current + 4, 12) }
    })
  }

  const handleGameClick = async (game: Game) => {
    setSelectedGame(game)
    setIsGameLaunchOpen(true)
  }

  // Kategorileri filtrele ve oyunları sırala
  const filteredCategories = useMemo(() => {
    const filtered = activeTab === "Lobi"
      ? categories
      : categories.filter((cat) => cat.name === activeTab)
    
    // Her kategorinin oyunlarını sırala — pinleme burada tek seferlik yapılır
    return filtered.map((cat) => ({
      ...cat,
      games: sortGamesByFeatured(
        cat.games.map(g => ({
          ...g,
          has_lobby: g.has_lobby ?? 0,
          featured: g.featured ?? 0
        })),
        toSlug(cat.name)
      )
    }))
  }, [activeTab, categories])

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <div className="sticky top-0 z-50 lg:hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} onLoginClick={() => setIsLoginOpen(true)} onSearchClick={() => setShowSearchModal(true)} />
      </div>
      <div className="hidden lg:block sticky top-0 z-50">
        <DesktopHeader onLoginClick={() => setIsLoginOpen(true)} />
      </div>

      {/* Banner Slider */}
      <div className="relative w-full h-[232px] lg:h-[330px]">
        <BannerSlider position="slots" />

        {/* Son Kazananlar Widget */}
        <div className="hidden lg:flex absolute right-0 z-10 overflow-hidden" style={{ bottom: "10px", width: "auto", backgroundColor: "rgba(0,0,0,0.72)", clipPath: "polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%)", paddingLeft: "50px" }}>
          <RecentWinners />
        </div>
      </div>

      {/* Category Navigation - Desktop'ta search açıkken tamamen gizlenir */}
      {!desktopSearchOpen && (
        <div className={`hidden lg:block ${isSticky ? "fixed top-[106px] left-0 right-0 z-30" : ""} px-20`} style={{ backgroundColor: "#151516" }}>
          <div className="flex items-center h-[77px]" style={{ borderBottom: "0.1rem solid hsla(0, 0%, 100%, 0.1)" }}>
            <button className="flex-shrink-0 self-stretch items-center justify-center text-[#00d4b4] hover:opacity-80 transition-colors flex" style={{ fontSize: "32px", width: "44px", backgroundColor: "#322F31", marginRight: "10px" }}>&#8249;</button>
            <div className="flex-1 flex items-center overflow-x-auto scrollbar-none h-full">
              {categoryTabs.map((tab) => (
                <NavTab key={tab} tab={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
              ))}
            </div>
            {/* Tabs ile arama kutusu arasındaki koyu spacer */}
            <div style={{ width: "60px", height: "71px", backgroundColor: "#0e0e0f", flexShrink: 0 }} />
            <div className="flex items-center" style={{ paddingRight: "8px" }}>
              <div className="relative cursor-pointer" onClick={openDesktopSearch}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#fff" }} />
                <input
                  readOnly
                  type="text"
                  placeholder="Oyun ara..."
                  className="placeholder-white cursor-pointer"
                  style={{ width: "185px", height: "50px", backgroundColor: "#252324", borderTop: "1px solid #3a3a3a", borderLeft: "1px solid #3a3a3a", borderRight: "1px solid #3a3a3a", borderBottom: "none", paddingLeft: "50px", paddingRight: "20px", fontSize: "16px", color: "#fff", outline: "none" }}
                />
              </div>
            </div>
            <button className="flex-shrink-0 self-stretch items-center justify-center text-[#00d4b4] hover:opacity-80 transition-colors flex" style={{ fontSize: "32px", width: "44px", marginLeft: "10px", backgroundColor: "#322F31" }}>&#8250;</button>
          </div>
        </div>
      )}

      {/* Mobil Category Navigation */}
      <div className={`lg:hidden ${isSticky ? "fixed top-[50px] left-0 right-0 z-30" : ""}`} style={{ backgroundColor: "#151516" }}>
        <div className="flex items-center h-[54px]" style={{ borderBottom: "0.1rem solid hsla(0, 0%, 100%, 0.1)" }}>
          <button onClick={() => setShowSearchModal(true)} className="px-4">
            <Search className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-none h-full">
            {categoryTabs.map((tab) => (
              <NavTab key={tab} tab={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Search Bar + Results - referans gibi tam genişlikte ayrı katman */}
      {desktopSearchOpen && (
        <div
          className={`hidden lg:block ${isSticky ? "fixed left-0 right-0 z-30" : ""}`}
          style={{ top: isSticky ? "106px" : undefined, backgroundColor: "#151516" }}
        >
          {/* Arama input satırı - tam genişlik, padding yok */}
          <div
            className="flex items-center"
            style={{ height: "54px", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "0 24px", gap: "16px" }}
          >
            <Search className="flex-shrink-0 w-5 h-5 text-gray-400" />
            <input
              ref={desktopSearchInputRef}
              type="text"
              placeholder="Oyun ara..."
              value={desktopSearchQuery}
              onChange={(e) => setDesktopSearchQuery(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-white placeholder-gray-500"
              style={{ fontSize: "16px" }}
            />
            {desktopSearchQuery && (
              <button onClick={() => setDesktopSearchQuery("")} className="flex-shrink-0">
                <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            )}
            <button
              onClick={closeDesktopSearch}
              className="flex-shrink-0 font-semibold transition-colors hover:text-white"
              style={{ color: "#00d4b4", fontSize: "15px" }}
            >
              İptal et
            </button>
          </div>

          {/* Sonuçlar alanı */}
          <div
            className="overflow-y-auto"
            style={{
              backgroundColor: "#0f0f10",
              minHeight: "400px",
              maxHeight: "calc(100vh - 160px)",
            }}
          >
            <div className="px-20 py-8">
              {isDesktopSearchLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="text-[#00d4b4] animate-spin" style={{ width: "48px", height: "48px" }} />
                </div>
              ) : desktopSearchResults.length > 0 ? (
                <div className="grid gap-x-4 gap-y-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                  {desktopSearchResults.map((game) => (
                    <div key={game.id} className="cursor-pointer group" onClick={() => handleDesktopGameClick(game)}>
                      <div className="rounded overflow-hidden bg-zinc-800 relative" style={{ aspectRatio: "3/2" }}>
                        <img src={game.image || "/placeholder.svg"} alt={game.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                      </div>
                      <p className="text-white text-sm font-medium mt-2 truncate">{game.name}</p>
                    </div>
                  ))}
                </div>
              ) : desktopRecentSearches.length > 0 && desktopSearchQuery.length < 2 ? (
                <div>
                  <h3 className="text-white font-semibold mb-6" style={{ fontSize: "16px" }}>Son aramalar</h3>
                  <div className="grid gap-x-4 gap-y-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                    {desktopRecentSearches.map((game) => (
                      <div key={game.id} className="cursor-pointer group" onClick={() => handleDesktopGameClick(game)}>
                        <div className="rounded overflow-hidden bg-zinc-800 relative" style={{ aspectRatio: "3/2" }}>
                          <img src={game.image || "/placeholder.svg"} alt={game.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                        </div>
                        <p className="text-white text-sm font-medium mt-2 truncate">{game.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : desktopSearchQuery.length >= 2 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  {/* Büyüteç ikonu - referanstaki gibi */}
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="mb-5 opacity-50">
                    <circle cx="30" cy="30" r="18" stroke="white" strokeWidth="3.5" fill="none" />
                    <circle cx="23" cy="23" r="7" stroke="white" strokeWidth="2.5" fill="none" />
                    <line x1="44" y1="44" x2="64" y2="64" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-white font-semibold" style={{ fontSize: "18px" }}>Sonuç bulunamadı</p>
                  <p className="mt-1" style={{ fontSize: "14px", color: "#888" }}>Farklı bir oyun adı deneyin</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24">
                  {/* Referanstaki büyüteç + soru işareti ikonu */}
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="mb-5 opacity-40">
                    <circle cx="30" cy="30" r="18" stroke="white" strokeWidth="3.5" fill="none" />
                    <circle cx="23" cy="24" r="5" stroke="white" strokeWidth="2" fill="none" />
                    <line x1="44" y1="44" x2="64" y2="64" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-white font-semibold" style={{ fontSize: "18px" }}>Henüzbir arama mevcut değil.</p>
                  <p className="mt-1" style={{ fontSize: "14px", color: "#888" }}>Lütfen bir oyun arayın!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isSticky && <div className="h-[54px] lg:h-[77px]" />}

      {/* Game Categories */}
      <div className="pt-4 lg:pt-10 lg:px-[60px]">
        {isLoading ? (
          <div className="space-y-8 px-3 lg:px-0">
            <CategorySkeleton gameCount={6} />
            <CategorySkeleton gameCount={6} />
            <CategorySkeleton gameCount={6} />
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CasinoCategorySection
              key={category.id}
              category={category}
              visibleCount={categoryVisibleCounts[category.id] || 4}
              onShowMore={() => handleShowMore(category.id)}
              onGameClick={handleGameClick}
              showAll={activeTab !== "Lobi"}
              onSeeAll={() => setActiveTab(category.name)}
              activeTab={activeTab}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">Oyun bulunamadi</div>
        )}
      </div>

      <Footer />

      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <GameLoginModal isOpen={isGameLoginOpen} onClose={() => setIsGameLoginOpen(false)} onLogin={() => { setIsGameLoginOpen(false); setIsLoginOpen(true) }} />
      {selectedGame && (
        <GameLaunchModal isOpen={isGameLaunchOpen} onClose={() => { setIsGameLaunchOpen(false); setSelectedGame(null) }} game={selectedGame} />
      )}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} onGameSelect={(game) => { setShowSearchModal(false); handleGameClick(game) }} />
      <VipRankBadge />
    </div>
  )
}
