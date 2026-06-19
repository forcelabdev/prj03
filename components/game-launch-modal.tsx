"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Heart, Loader2, Search } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useGameLaunch } from "@/hooks/use-games"
import { gamesService } from "@/lib/services/games-service"
import Link from "next/link"
import { LoginModal } from "@/components/login-modal"
import { DesktopJackpotBar, MobileJackpotBar } from "@/components/jackpot-bar"

// ---------- Types ----------
type LayoutMode = "single" | "split2" | "split4"

interface SlotGame {
  id: string
  name: string
  image: string
  game_code?: string
  gameCode?: string
  provider?: string
  provider_code?: string
  providerCode?: string
  distribution?: string
  [key: string]: any
}

interface GameSlot {
  url: string | null
  game: SlotGame | null
  loading: boolean
  error: string | null
}

// ---------- Desktop Multi-Game Launcher ----------
function DesktopMultiLauncher({
  initialGame,
  initialUrl,
  onClose,
  currentTime,
}: {
  initialGame: SlotGame
  initialUrl: string
  onClose: () => void
  currentTime: string
}) {
  const TOTAL_SLOTS = 4
  const GAP = 16

  const [layout, setLayout] = useState<LayoutMode>("single")
  const [slots, setSlots] = useState<GameSlot[]>(() =>
    Array.from({ length: TOTAL_SLOTS }, (_, i) =>
      i === 0
        ? { url: initialUrl, game: initialGame, loading: false, error: null }
        : { url: null, game: null, loading: false, error: null }
    )
  )

  // Game search panel state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchSlotIndex, setSearchSlotIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SlotGame[]>([])
  const [categories, setCategories] = useState<{ name: string; games: SlotGame[] }[]>([])
  const [activeCategory, setActiveCategory] = useState("Lobi")
  const [allGames, setAllGames] = useState<SlotGame[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Minimize state
  const [minimized, setMinimized] = useState(false)
  // Favorites
  const [favorites, setFavorites] = useState<string[]>([])

  const { launchGame } = useGameLaunch()
  const { user } = useAuth()

  // Load categories once
  useEffect(() => {
    gamesService.getCategoriesWithGames().then((res: any) => {
      if (res.success && res.categories) {
        const cats = res.categories.map((c: any) => ({
          name: c.name,
          games: (c.games || []).map((g: any) => ({
            id: g.id || g.game_code || g.gameCode,
            name: g.name,
            image: g.image || g.img || "",
            game_code: g.game_code,
            gameCode: g.gameCode,
            provider: g.provider,
            provider_code: g.provider_code,
            providerCode: g.providerCode,
            distribution: g.distribution,
            ...g,
          })),
        }))
        setCategories(cats)
        const all: SlotGame[] = []
        cats.forEach((c: any) => c.games.forEach((g: SlotGame) => all.push(g)))
        setAllGames(all)
      }
    })
  }, [])

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    setSearchResults(allGames.filter((g) => g.name?.toLowerCase().includes(q)).slice(0, 40))
  }, [searchQuery, allGames])

  const openSearch = (slotIdx: number) => {
    setSearchSlotIndex(slotIdx)
    setSearchQuery("")
    setSearchResults([])
    setActiveCategory("Lobi")
    setSearchOpen(true)
  }

  const launchIntoSlot = async (slotIdx: number, game: SlotGame) => {
    setSearchOpen(false)
    setSlots((prev) => {
      const next = [...prev]
      next[slotIdx] = { url: null, game, loading: true, error: null }
      return next
    })
    try {
      const userId = user?.id || ""
      const numericId = user?.identifier || user?.id || ""
      const rawCode = game.game_code || game.gameCode || game.id || ""
      const detail = await gamesService.getGameDetails(rawCode)
      let distribution = game.distribution || ""
      let vendorCode = game.provider_code || game.providerCode || game.provider || ""
      let gameCode = rawCode
      if (detail.success && detail.game) {
        const g = detail.game as any
        distribution = g.distribution || distribution
        vendorCode = g.provider_code || vendorCode
        gameCode = g.game_code || gameCode
      }
      const result = await launchGame(userId, vendorCode, gameCode, "tr", distribution, numericId)
      if (result.success && result.launchUrl) {
        setSlots((prev) => {
          const next = [...prev]
          next[slotIdx] = { url: result.launchUrl!, game, loading: false, error: null }
          return next
        })
      } else {
        setSlots((prev) => {
          const next = [...prev]
          next[slotIdx] = { url: null, game, loading: false, error: "Oyun açılamadı." }
          return next
        })
      }
    } catch {
      setSlots((prev) => {
        const next = [...prev]
        next[slotIdx] = { url: null, game, loading: false, error: "Bir hata oluştu." }
        return next
      })
    }
  }

  // Slot dimensions
  const CONTAINER_W = 1624
  const CONTAINER_H = 819
  const SLOT_W_4 = Math.floor((CONTAINER_W - GAP) / 2)   // 788
  const SLOT_H_4 = Math.floor((CONTAINER_H - GAP) / 2)   // ~380 (approximately)
  const SLOT_W_2 = Math.floor((CONTAINER_W - GAP) / 2)   // 788
  const SLOT_H_2 = CONTAINER_H                             // 787 (full height, 2 wide)

  const activeSlots = layout === "single" ? 1 : layout === "split2" ? 2 : 4

  // Visible slots for current layout
  const visibleSlots = slots.slice(0, activeSlots)

  // Games in active category
  const categoryGames =
    activeCategory === "Lobi"
      ? allGames.slice(0, 60)
      : (categories.find((c) => c.name === activeCategory)?.games || [])

  const displayedGames = searchQuery.trim() ? searchResults : categoryGames

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#252525",
        display: "flex",
        flexDirection: "column",
      }}
    >


      {/* Jackpot bar — oyun alanının üstünde */}
      {/* <DesktopJackpotBar /> */}

      {/* Inner container — game grid + bottom bar, aynı yatay hizada */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: layout === "single" ? "0 130px" : `0 ${GAP}px`,
        }}
      >
        {/* Tek çerçeve: game grid + bottom bar birlikte */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            border: "12px solid #252a31",
            boxSizing: "border-box",
            overflow: "visible",
            position: "relative",
          }}
        >
          {/* Çarpı butonu — oyun alanı sağ üst köşesi */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: -12,
              right: -48,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 0,
              zIndex: 10,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="#fff">
              <path d="M13.414 12l4.95-4.95-1.414-1.414-4.95 4.95-4.95-4.95L5.636 7.05l4.95 4.95-4.95 4.95 1.414 1.414 4.95-4.95 4.95 4.95 1.414-1.414-4.95-4.95z"/>
            </svg>
          </button>
          {/* Game grid */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "grid",
              gap: GAP,
              gridTemplateColumns: layout === "single" ? "1fr" : "1fr 1fr",
              gridTemplateRows: layout === "split4" ? "1fr 1fr" : "1fr",
            }}
          >
            {visibleSlots.map((slot, idx) => (
              <SlotContainer
                key={idx}
                slot={slot}
                idx={idx}
                favorites={favorites}
                onToggleFavorite={(id) =>
                  setFavorites((prev) =>
                    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
                  )
                }
                onOpenSearch={() => openSearch(idx)}
              />
            ))}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              height: 56,
              backgroundColor: "#252a31",
              borderTop: "1px solid #333",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
        <Link
          href="/deposit"
          style={{
            backgroundColor: "#00d4b4",
            color: "#fff",
            fontWeight: 400,
            fontSize: 16,
            padding: "9px 22px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            borderRadius: 0,
          }}
        >
          Para Yatır
        </Link>

        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>{currentTime}</span>
          <span style={{ color: "#fff", fontSize: 11, letterSpacing: 0.5, marginTop: 3 }}>1.0.642</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, flexShrink: 0, marginLeft: "auto" }}>
          <button onClick={() => setLayout("single")} title="Tek ekran" style={{ background: layout === "single" ? "rgba(255,255,255,0.15)" : "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 3, lineHeight: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 40 32"><rect rx="1" height="32" width="40" fill={layout === "single" ? "#fff" : "#888"}/></svg>
          </button>
          <button onClick={() => setLayout("split2")} title="2'li bölme" style={{ background: layout === "split2" ? "rgba(255,255,255,0.15)" : "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 3, lineHeight: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 40 32"><rect rx="1" height="32" width="18" x="21.95" fill={layout === "split2" ? "#fff" : "#888"}/><rect rx="1" height="32" width="18" fill={layout === "split2" ? "#fff" : "#888"}/></svg>
          </button>
          <button onClick={() => setLayout("split4")} title="4'lü bölme" style={{ background: layout === "split4" ? "rgba(255,255,255,0.15)" : "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 3, lineHeight: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 40 32"><rect rx="1" x="0" y="0" width="18" height="14" fill={layout === "split4" ? "#fff" : "#888"}/><rect rx="1" x="22" y="0" width="18" height="14" fill={layout === "split4" ? "#fff" : "#888"}/><rect rx="1" x="0" y="18" width="18" height="14" fill={layout === "split4" ? "#fff" : "#888"}/><rect rx="1" x="22" y="18" width="18" height="14" fill={layout === "split4" ? "#fff" : "#888"}/></svg>
          </button>
          <button onClick={() => setMinimized(true)} title="Ekranı küçült" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", lineHeight: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29"><g stroke="#888" fill="none" fillRule="evenodd"><rect strokeWidth="1.669" x=".89" y=".834" width="27.158" height="27.331" rx="2.225"/><path d="M5.5 23.5l8-8m-2 7.75H5.25V17" strokeWidth="1.5"/></g></svg>
          </button>
          <button onClick={() => { const el = document.documentElement; if (el.requestFullscreen) el.requestFullscreen() }} title="Tam ekran" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", lineHeight: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M7.5 31.44l6.54-6.54 1.06 1.06-6.54 6.54H13V34H6v-7h1.5v4.44zm23.94 1.06l-6.54-6.54 1.06-1.06 6.54 6.54V27H34v7h-7v-1.5h4.44zM32.5 8.56l-6.54 6.54-1.06-1.06 6.54-6.54H27V6h7v7h-1.5V8.56zM8.56 7.5l6.54 6.54-1.06 1.06L7.5 8.56V13H6V6h7v1.5H8.56z" fill="#888"/></svg>
          </button>
        </div>
          </div>{/* /bottom bar */}
        </div>{/* /tek-çerçeve wrapper */}
      </div>{/* /inner container */}

      {/* Minimized floating */}
      {minimized && (
        <div style={{ position: "fixed", bottom: 80, left: 16, width: 380, height: 260, zIndex: 100002, boxShadow: "0 8px 32px rgba(0,0,0,0.7)", backgroundColor: "#000" }}>
          {slots[0].url && <iframe src={slots[0].url} style={{ width: "100%", height: "100%", border: "none" }} allow="fullscreen; autoplay" />}
          <button onClick={() => setMinimized(false)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", cursor: "pointer", padding: "2px 6px", fontSize: 12, borderRadius: 3 }}>Büyüt</button>
        </div>
      )}

      {/* Game Search Panel */}
      {searchOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100003, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div style={{ backgroundColor: "#fff", position: "absolute", left: 0, right: 0, bottom: 0, top: "30%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ backgroundColor: "#111", display: "flex", alignItems: "center", height: 56, overflowX: "auto", gap: 0, flexShrink: 0, scrollbarWidth: "none" }}>
              <div style={{ padding: "0 8px", color: "#aaa", fontSize: 18, cursor: "default" }}>{"‹"}</div>
              {["Lobi", ...categories.map((c) => c.name)].map((tab) => (
                <button key={tab} onClick={() => { setActiveCategory(tab); setSearchQuery("") }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0 16px", height: "100%", whiteSpace: "nowrap", color: activeCategory === tab ? "#e53935" : "#ccc", fontWeight: activeCategory === tab ? 700 : 400, fontSize: 14, borderBottom: activeCategory === tab ? "2px solid #e53935" : "2px solid transparent", flexShrink: 0 }}>
                  {tab}
                </button>
              ))}
              <div style={{ marginLeft: "auto", padding: "0 12px", position: "relative", flexShrink: 0 }}>
                <Search size={16} style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
                <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Oyun ara..."
                  style={{ width: 200, height: 36, backgroundColor: "#222", border: "1px solid #e53935", paddingLeft: 36, paddingRight: 12, color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ padding: "0 8px", color: "#aaa", fontSize: 18, cursor: "default" }}>{"›"}</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16, alignContent: "start" }}>
              {displayedGames.map((g) => (
                <button key={g.id || g.game_code} onClick={() => searchSlotIndex !== null && launchIntoSlot(searchSlotIndex, g)}
                  style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                  <img src={g.image} alt={g.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                  <p style={{ fontSize: 12, color: "#222", marginTop: 4, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</p>
                </button>
              ))}
              {displayedGames.length === 0 && <p style={{ gridColumn: "1/-1", color: "#999", textAlign: "center", paddingTop: 40 }}>{searchQuery ? "Oyun bulunamadı" : "Yükleniyor..."}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Slot container with hover side panel ----------
// Panel iframe'in DIŞINDA — sol padding alanında, iframe sol kenarına dayalı
function SlotContainer({
  slot,
  favorites,
  onToggleFavorite,
  onOpenSearch,
}: {
  slot: GameSlot
  idx: number
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onOpenSearch: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const gameId = slot.game?.id || slot.game?.game_code || ""
  const isFav = favorites.includes(gameId)

  return (
    // Outer wrapper: iframe + sol panel yan yana, overflow visible
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Sol hover panel — iframe'in DIŞINDA, sol kenarına dayalı */}
      {slot.url && (
        <div
          style={{
            position: "absolute",
            right: "100%",   // iframe'in sol kenarına dayalı, dışarıda
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            zIndex: 10,
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.15s ease",
          }}
        >
          {/* Kalp — favori, 50x50, bg #252A31 */}
          <button
            onClick={() => onToggleFavorite(gameId)}
            aria-label="Favoriler"
            style={{
              width: 50,
              height: 50,
              background: "#252A31",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 5,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24">
              <path
                fill={isFav ? "#d32f2f" : "none"}
                stroke={isFav ? "#d32f2f" : "#fff"}
                strokeWidth="1.1"
                d="M12.014 20h-.01.01zm.8-2.378a157.847 157.847 0 002.975-2.543c1.228-1.083 2.16-1.962 2.714-2.575a3.581 3.581 0 00-.018-4.98 3.53 3.53 0 00-4.98.004L11.99 9.04l-1.06-1.06-.45-.45C9.1 6.156 6.87 6.156 5.508 7.513c-1.347 1.39-1.347 3.597.038 5.027.52.578 1.453 1.457 2.68 2.54l.447.39c.8.697 1.654 1.422 2.528 2.152l.805.667.805-.668zm-.8 2.378h-.022.012-.012l.018-.593.004.593zm.025-1.5l-.03.907-.006-.907h.035zM11.99 6.92l.473-.474a5.034 5.034 0 017.085.023 5.081 5.081 0 01.033 7.074c-1.734 1.926-6.86 6.095-7.073 6.275a.769.769 0 01-.49.18l-.006-1.5-.046 1.5a.795.795 0 01-.46-.18c-.215-.18-5.34-4.35-7.075-6.276a5.084 5.084 0 010-7.075 5.033 5.033 0 017.085-.024l.474.473z"
              />
            </svg>
          </button>
          {/* Oyun değiştir, 50x50, bg #252A31 */}
          <button
            onClick={onOpenSearch}
            aria-label="Oyun Değiştir"
            style={{
              width: 50,
              height: 50,
              background: "#252A31",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 5,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="30" viewBox="0 0 40 40">
              <path fill="#fff" d="M14.858 27.5v-5l-9 7 9 7v-5h20.001v-4zM34.859 10.5l-9 7v-14l9 7zm-29.001 2v-4h20.001v4H5.858z"/>
            </svg>
          </button>
        </div>
      )}

      {/* iframe veya içerik */}
      <div
        style={{
          flex: 1,
          backgroundColor: slot.url ? "#000" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",

        }}
      >
        {slot.url ? (
          <iframe
            src={slot.url}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="fullscreen; autoplay; camera; microphone; accelerometer; gyroscope"
          />
        ) : slot.loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Loader2 style={{ color: "#00d4b4", width: 40, height: 40 }} className="animate-spin" />
            <span style={{ color: "#666", fontSize: 14 }}>Yükleniyor...</span>
          </div>
        ) : slot.error ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <p style={{ color: "#ef4444", marginBottom: 12, fontSize: 14 }}>{slot.error}</p>
            <button onClick={onOpenSearch} style={{ background: "#00d4b4", color: "#000", fontWeight: 700, padding: "8px 20px", border: "none", cursor: "pointer", borderRadius: 4 }}>
              Oyun Seç
            </button>
          </div>
        ) : (
          <button onClick={onOpenSearch} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
              <path d="M2.625 36.625c0-18.784 15.663-34 35-34s35 15.216 35 34c0 18.785-15.663 34-35 34s-35-15.215-35-34z" strokeWidth="4" stroke="#999" fill="none"/>
              <path d="M21.168 37.5h34.17M37.918 18.99v37.186" strokeWidth="4" stroke="#999"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

interface GameData {
  id: string
  name: string
  provider: string
  providerCode?: string
  providerLogo?: string
  image: string
  backgroundImage?: string
  game_code?: string
  gameCode?: string
}

interface GameLaunchModalProps {
  isOpen: boolean
  onClose: () => void
  game: GameData | null
  onPlay?: () => void
}

export function GameLaunchModal({ isOpen, onClose, game, onPlay }: GameLaunchModalProps) {
  const { user } = useAuth()
  const { launchGame } = useGameLaunch()
  const [currentTime, setCurrentTime] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchError, setLaunchError] = useState<string | null>(null)
  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setIsDesktop(mq.matches)
  }, [isOpen])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setLaunchError(null)
      setIsLaunching(false)
      setGameUrl(null)
      // Desktop'ta LiveChat widget'ını gizle
      if (typeof window !== "undefined" && (window as any).LiveChatWidget) {
        ;(window as any).LiveChatWidget.call("hide")
      }
    } else {
      setGameUrl(null)
      // Modal kapanınca LiveChat widget'ını geri göster
      if (typeof window !== "undefined" && (window as any).LiveChatWidget) {
        ;(window as any).LiveChatWidget.call("show")
      }
    }
  }, [isOpen])

  const handlePlay = async (demo: boolean = false) => {
    if (!game) return
    if (!user && !demo) { setLaunchError("Oyun oynayabilmek için lütfen giriş yapın!"); return }

    setIsLaunching(true)
    setLaunchError(null)

    try {
      const userId = user?.id || ""
      const numericId = user?.identifier || user?.id || ""

      // Once game_code ile GET /games/:game_code → distribution + provider_code al
      const rawGameCode = (game as any).game_code || (game as any).gameCode || game.id || ""
      console.log('[v0] handlePlay — rawGameCode:', rawGameCode, '| game object:', game)

      const detail = await gamesService.getGameDetails(rawGameCode)
      console.log('[v0] getGameDetails response:', detail)

      let distribution = (game as any).distribution || ""
      let vendorCode = (game as any).provider_code || (game as any).providerCode || game.provider || ""
      let gameCode = rawGameCode

      if (detail.success && detail.game) {
        const g = detail.game as any
        distribution = g.distribution || distribution
        vendorCode = g.provider_code || vendorCode
        gameCode = g.game_code || gameCode
      }

      console.log('[v0] launchGame params — userId:', userId, '| vendorCode:', vendorCode, '| gameCode:', gameCode, '| distribution:', distribution, '| numericId:', numericId)

      if (!gameCode) { setLaunchError("Oyun kodu bulunamadi"); setIsLaunching(false); return }

      const result = await launchGame(userId, vendorCode, gameCode, "tr", distribution, numericId, demo)
      console.log('[v0] launchGame result:', result)

      if (result.success && result.launchUrl) {
        setGameUrl(result.launchUrl)
      } else {
        const code = (result as any).errorCode || ""
        if (code === "RATE_LIMITED") {
          setLaunchError("Lütfen birkaç saniye bekleyip tekrar deneyin.")
        } else if (code === "INVALID_REQUEST" || result.error?.includes("user_id is required")) {
          setLaunchError("Oyun oynayabilmek için lütfen giriş yapın!")
        } else if (code === "PROVIDER_DISABLED") {
          setLaunchError(result.error || "Şu anda bu oyuna erişilemiyor.")
        } else if (code === "INVALID_BALANCE") {
          setLaunchError(result.error || "Yetersiz bakiye.")
        } else {
          setLaunchError("Oyun şu anda açılamıyor. Lütfen daha sonra tekrar deneyin.")
        }
      }
    } catch (e: any) {
      console.log('[v0] handlePlay catch error:', e)
      const msg = e?.response?.data?.msg || ""
      if (msg === "INVALID_REQUEST" || e?.message?.includes("user_id is required")) {
        setLaunchError("Oyun oynayabilmek için lütfen giriş yapın!")
      } else if (msg === "PROVIDER_DISABLED") {
        setLaunchError("Şu anda bu oyuna erişilemiyor.")
      } else if (msg === "INVALID_BALANCE") {
        setLaunchError("Yetersiz bakiye.")
      } else {
        setLaunchError("Oyun şu anda açılamıyor. Lütfen daha sonra tekrar deneyin.")
      }
    } finally {
      setIsLaunching(false)
    }
  }

  useEffect(() => {
    if (!isOpen || !game) return
    const timer = setTimeout(() => {
      const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches
      if (desktop) {
        setIsDesktop(true)
        handlePlay(false)
      }
    }, 50)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen || !game) return null

  if (gameUrl) {
    const desktop = typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : isDesktop

    if (desktop) {
      return (
        <DesktopMultiLauncher
          initialGame={game as SlotGame}
          initialUrl={gameUrl}
          onClose={onClose}
          currentTime={currentTime}
        />
      )
    }

    // Mobilde gameUrl alindiktan sonra gamelaunch subdomain'ine ayni sekmede git
    if (gameUrl) {
      const rawGameCode = (game as any).game_code || (game as any).gameCode || game.id || "game"
      const currentHost = window.location.hostname
      const baseDomain = currentHost.replace(/^www\./, '').replace(/^gamelaunch\./, '')
      const returnUrl = window.location.href
      const gamePageUrl = `https://gamelaunch.${baseDomain}/${encodeURIComponent(rawGameCode)}?url=${encodeURIComponent(gameUrl)}&returnUrl=${encodeURIComponent(returnUrl)}`
      // replace ile git - ayni sekme, geri tusu oyunu tekrar acmaz
      window.location.replace(gamePageUrl)
      return null
    }
    
    // gameUrl henuz alinmadiysa loading goster
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
        <p style={{ color: "#fff", marginTop: 16, fontSize: 18 }}>Oyun yukleniyor...</p>
      </div>
    )
  }

  if (isDesktop && isLaunching) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: "90vw", maxWidth: "1280px", height: "85vh", backgroundColor: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, color: "#fff", background: "none", border: "none", cursor: "pointer" }}>
            <X size={24} />
          </button>
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#00d4b4" }} />
          <p style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>Oyun yukleniyor...</p>
        </div>
      </div>
    )
  }

  const formattedBalance = (user?.balance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "#000" }}>
      {/* Blurlu arka plan görseli */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${game.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.45) blur(2px)",
          transform: "scale(1.05)",
        }}
      />

      {/* İçerik */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Jackpot bar — mobil */}
        {/* <MobileJackpotBar /> */}

        {/* Üst: kalp (sol) + X (sağ) */}
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-1"
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart
              className="w-8 h-8"
              style={{ color: isFavorite ? "#ef4444" : "#ffffff", fill: isFavorite ? "#ef4444" : "none" }}
            />
          </button>
          <button onClick={onClose} className="p-1" aria-label="Kapat">
            <X className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Orta: oyun adı + bakiye + butonlar + saat */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">

          {/* Oyun adı */}
          <h2 className="text-white text-3xl font-bold text-center leading-tight" style={{ marginBottom: "76px" }}>
            {game.name}
          </h2>

          {/* Bakiye */}
          <div className="text-center" style={{ marginBottom: "32px" }}>
            <p className="text-gray-300 text-sm mb-1">Bakiyeniz</p>
            <p className="text-white font-bold" style={{ fontSize: "18px" }}>
              {formattedBalance} ₺
            </p>
          </div>

          {/* Hata mesajı */}
          {launchError && (
            <div className="w-full bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 text-sm text-center mb-4 rounded" style={{ maxWidth: "390px" }}>
              {launchError}
            </div>
          )}

          {/* Butonlar */}
          {user ? (
            <div className="flex mb-6" style={{ gap: "8px" }}>
              <Link
                href="/deposit"
                className="flex items-center justify-center text-black"
                style={{ width: "195px", height: "50px", backgroundColor: "#ffffff", fontSize: "16px", fontWeight: 400 }}
              >
                Para Yatır
              </Link>
              <button
                onClick={() => handlePlay(false)}
                disabled={isLaunching}
                className="flex items-center justify-center text-black disabled:opacity-60 gap-2"
                style={{ width: "195px", height: "50px", backgroundColor: "#00d4b4", fontSize: "16px", fontWeight: 600 }}
              >
                {isLaunching
                  ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Yukleniyor...</span></>)
                  : "Hemen Oyna!"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col w-full mb-6" style={{ maxWidth: "398px", gap: "8px" }}>
              <div className="flex" style={{ gap: "8px" }}>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex flex-1 items-center justify-center text-black"
                  style={{ height: "50px", backgroundColor: "#ffffff", fontSize: "16px", fontWeight: 400 }}
                >
                  Giriş Yap
                </button>
                <Link
                  href="/register"
                  className="flex flex-1 items-center justify-center text-black"
                  style={{ height: "50px", backgroundColor: "#00d4b4", fontSize: "16px", fontWeight: 600 }}
                >
                  Kayıt Ol
                </Link>
              </div>
              <button
                onClick={() => handlePlay(true)}
                disabled={isLaunching}
                className="flex w-full items-center justify-center text-black disabled:opacity-60 gap-2"
                style={{ height: "50px", backgroundColor: "#00d4b4", fontSize: "16px", fontWeight: 600 }}
              >
                {isLaunching
                  ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Yükleniyor...</span></>)
                  : "Eğlenmek için oyna"}
              </button>
            </div>
          )}

          {/* Saat */}
          <p className="text-gray-300 tracking-wider" style={{ fontSize: "16px" }}>{currentTime}</p>
        </div>

        {/* Versiyon - en altta ortada */}
        <div className="flex justify-center pb-3">
          <p className="text-gray-500" style={{ fontSize: "10px" }}>1.0.331</p>
        </div>


      </div>
    </div>

    {/* Login Modal */}
    <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
