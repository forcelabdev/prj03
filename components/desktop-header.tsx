'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { UserProfileMenu } from '@/components/user-profile-menu'
import { Plus, LogOut, ChevronDown, Smartphone, Bell, Search, X, Loader2 } from 'lucide-react'
import { gamesService } from '@/lib/services/games-service'

interface Game {
  id: string
  game_code?: string
  name: string
  image?: string
  provider?: string
  provider_code?: string
}

const RECENT_SEARCHES_KEY = "recent_game_searches"
const MAX_RECENT_SEARCHES = 10

function getRecentSearches(): Game[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function addRecentSearch(game: Game): void {
  if (typeof window === 'undefined') return
  try {
    const recent = getRecentSearches()
    const filtered = recent.filter(g => g.id !== game.id)
    const updated = [game, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch { }
}

function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/")) return `https://apievrymatrix5d84k321.com${url}`
  return `https://apievrymatrix5d84k321.com/uploads/${url}`
}

interface DesktopHeaderProps {
  onLoginClick: () => void
  onAviatorClick?: () => void
}

const navLinks = [
  { label: 'VELO+', href: '/move-plus', highlight: true },
  { label: 'Aviator', href: '/aviator' },
  { label: 'Özel Oran', href: '/sports/spor/yuksek-oran' },
  { label: 'Spor Bahis', href: '/' },
  { label: 'Canlı Bahis', href: '/live' },
  { label: 'Casino', href: '/casino' },
  { label: 'Canlı Casino', href: '/live-casino' },
  { label: 'Promosyonlar', href: '/promotions' },
  { label: 'Turnuvalar', href: '/tournaments' },
  { label: 'Discount Talep Et', href: 'https://www.vlodiscount3.com' },
  { label: 'Sizi Arayalım', href: '/contact' },
  { label: 'Canlı Destek', href: 'https://direct.lc.chat/19641932/', external: true },
]

const profileTabs = [
  { label: 'Seviyem', href: '/loyalty' },
  { label: 'Mağaza', href: '/loyalty' },
  { label: 'Sadakat Geçmişi', href: '/loyalty' },
]

const menuItemLabels = ['PARA YATIR', 'PARA ÇEK', 'AKTİF BONUSLAR', 'GEÇMİŞ BONUSLARIM', 'SPOR GEÇMİŞİM', 'OYUN GEÇMİŞİM', 'HESAP ÖZETİM', 'BAHİS KURALLARI']
const menuItemHrefs = ['/deposit', '/withdraw', '/active-bonuses', '/past-bonuses', '/game-history', '/game-history', '/payment-history', '/terms']

export function DesktopHeader({ onLoginClick, onAviatorClick }: DesktopHeaderProps) {
  const { user, isLoggedIn, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [xpOpen, setXpOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Search state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [recentSearches, setRecentSearches] = useState<Game[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (xpRef.current && !xpRef.current.contains(e.target as Node)) {
        setXpOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Open search
  const openSearch = () => {
    setSearchOpen(true)
    setRecentSearches(getRecentSearches())
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  // Search logic
  useEffect(() => {
    if (!searchOpen) return
    const searchGames = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearchLoading(true)
        try {
          const categoriesRes = await gamesService.getCategories()
          let allGames: any[] = []
          if (categoriesRes.success && categoriesRes.categories) {
            const fetchPromises = categoriesRes.categories.map(async (cat: any) => {
              const slug = cat.slug || cat.name
              if (!slug) return []
              try {
                const res = await gamesService.getGamesByCategory(slug, 2000)
                return res.success && res.games ? res.games : []
              } catch { return [] }
            })
            const results = await Promise.all(fetchPromises)
            allGames = results.flat()
          }
          const searchLower = searchQuery.toLowerCase()
          const filteredByName = allGames.filter((g: any) => {
            const gameName = (g.game_name || g.name || g.title || '').toLowerCase()
            return gameName.includes(searchLower)
          })
          const uniqueGames = filteredByName.filter((game, index, self) =>
            index === self.findIndex(g => g._id === game._id)
          )
          const normalized = uniqueGames.slice(0, 50).map((g: any) => ({
            id: g._id,
            game_code: g.game_code,
            name: g.game_name || g.name || g.title || 'Unknown Game',
            image: resolveImageUrl(g.banner || g.cover || g.image || g.thumbnail || null),
            provider: g.provider_code || g.provider?.code || '',
            provider_code: g.provider_code || g.provider?.code || ''
          }))
          setSearchResults(normalized)
        } catch {
          setSearchResults([])
        } finally {
          setIsSearchLoading(false)
        }
      } else {
        setSearchResults([])
      }
    }
    const debounce = setTimeout(searchGames, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, searchOpen])

  const handleGameClick = (game: Game) => {
    addRecentSearch(game)
    setRecentSearches(getRecentSearches())
    closeSearch()
    if (game.game_code) {
      window.location.href = `/game/${game.game_code}`
    }
  }

  const showRecentSearches = searchOpen && (!searchQuery || searchQuery.length < 2) && recentSearches.length > 0

  return (
    <header className="desktop-header sticky top-0 z-50 w-full left-0 right-0" style={{ borderBottom: ".4rem solid #00d4b4", backgroundColor: "#1a1a1a" }}>

      <div className="mx-auto flex px-20" style={{ minHeight: "106px", maxWidth: "100%" }}>

        {/* Sol: Logo - iki satırın tüm yüksekliğini kaplıyor */}
        <div className="flex items-center flex-shrink-0" style={{ paddingRight: "32px" }}>
          <Link href="/" className="inline-flex items-center">
            <img src="/logo.svg" alt="Velobet" style={{ height: "40px", width: "auto" }} />
          </Link>
        </div>

        {/* Sağ: Üst (aksiyonlar) + Alt (nav) */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* ÜST SATIR: Aksiyonlar */}
          <div className="flex items-center justify-end" style={{ height: "62px", borderBottom: "1px solid rgba(255,255,255,0.08)", gap: "8px" }}>
          <div className="flex items-center flex-wrap justify-end" style={{ gap: "8px" }}>

            {/* Android + iOS grubu */}
            <div className="flex items-center flex-shrink-0" style={{ gap: "6px" }}>
            {/* Android */}
            <button
              className="flex items-center justify-center"
              style={{ border: "2px solid #00d4b4", width: "38px", height: "38px", borderRadius: "8px" }}
            >
              <svg fill="#00d4b4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 299.679 299.679" style={{ width: "18px", height: "18px" }}>
                <g>
                  <path d="M181.122,299.679c10.02,0,18.758-8.738,18.758-18.758v-43.808h12.525c7.516,0,12.525-5.011,12.525-12.525V99.466H74.749v125.123c0,7.515,5.01,12.525,12.525,12.525H99.8v43.808c0,10.02,8.736,18.758,18.758,18.758c10.019,0,18.756-8.738,18.756-18.758v-43.808h25.051v43.808C162.364,290.941,171.102,299.679,181.122,299.679z"/>
                  <path d="M256.214,224.589c10.02,0,18.756-8.737,18.756-18.758v-87.615c0-9.967-8.736-18.75-18.756-18.75c-10.021,0-18.758,8.783-18.758,18.75v87.615C237.456,215.851,246.192,224.589,256.214,224.589z"/>
                  <path d="M43.466,224.589c10.021,0,18.758-8.737,18.758-18.758v-87.615c0-9.967-8.736-18.75-18.758-18.75c-10.02,0-18.756,8.783-18.756,18.75v87.615C24.71,215.851,33.446,224.589,43.466,224.589z"/>
                  <path d="M209.899,1.89c-2.504-2.52-6.232-2.52-8.736,0l-16.799,16.743l-0.775,0.774c-9.961-4.988-21.129-7.479-33.566-7.503c-0.061,0-0.121-0.002-0.182-0.002h-0.002c-0.063,0-0.121,0.002-0.184,0.002c-12.436,0.024-23.604,2.515-33.564,7.503l-0.777-0.774L98.516,1.89c-2.506-2.52-6.232-2.52-8.736,0c-2.506,2.506-2.506,6.225,0,8.729l16.25,16.253c-5.236,3.496-9.984,7.774-14.113,12.667C82.032,51.256,75.727,66.505,74.86,83.027c-0.008,0.172-0.025,0.342-0.033,0.514c-0.053,1.125-0.078,2.256-0.078,3.391H224.93c0-1.135-0.027-2.266-0.078-3.391c-0.008-0.172-0.025-0.342-0.035-0.514c-0.865-16.522-7.172-31.772-17.057-43.487c-4.127-4.893-8.877-9.171-14.113-12.667l16.252-16.253C212.405,8.115,212.405,4.396,209.899,1.89z M118.534,65.063c-5.182,0-9.383-4.201-9.383-9.383c0-5.182,4.201-9.383,9.383-9.383c5.182,0,9.383,4.201,9.383,9.383C127.917,60.862,123.716,65.063,118.534,65.063z M181.145,65.063c-5.182,0-9.383-4.201-9.383-9.383c0-5.182,4.201-9.383,9.383-9.383c5.182,0,9.383,4.201,9.383,9.383C190.527,60.862,186.326,65.063,181.145,65.063z"/>
                </g>
              </svg>
            </button>

            {/* iOS */}
            <Link
              href="/ios-app"
              className="flex items-center justify-center"
              style={{ border: "2px solid #00d4b4", width: "38px", height: "38px", borderRadius: "8px" }}
            >
              <svg fill="#00d4b4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" style={{ width: "18px", height: "18px" }}>
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
              </svg>
            </Link>
            </div>{/* Android/iOS grup sonu */}

            {isLoggedIn && user ? (
              <>
                {/* XP */}
                <div className="relative" ref={xpRef}>
                  <button
                    className="flex items-center gap-1 hover:bg-white/10 transition-colors rounded px-2 py-1"
                    style={{ color: "#ffffff", fontSize: "16px", fontWeight: 600, whiteSpace: "nowrap" }}
                    onClick={() => setXpOpen(!xpOpen)}
                  >
                    {Math.floor(user.xp ?? 0).toLocaleString("tr-TR")} XP
                    <ChevronDown style={{ width: "14px", height: "14px" }} />
                  </button>

                  {/* XP Dropdown */}
                  {xpOpen && (
                    <div
                      className="absolute left-0 top-full mt-2 z-50"
                      style={{
                        width: "380px",
                        backgroundColor: "#1e1e1e",
                        border: "2px solid #00d4b4",
                        borderRadius: "12px",
                        padding: "28px 28px 24px 28px",
                      }}
                    >
                      {/* Başlık */}
                      <h2 style={{ color: "#00d4b4", fontSize: "48px", fontWeight: 800, lineHeight: 1, marginBottom: "8px", fontFamily: "inherit", letterSpacing: "-1px" }}>
                        VELO
                      </h2>
                      <p style={{ color: "#aaaaaa", fontSize: "13px", marginBottom: "20px" }}>XP Seviyeniz</p>

                      {/* XP Değerleri */}
                      <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#aaaaaa", fontSize: "13px" }}>0</span>
                        <span style={{ color: "#aaaaaa", fontSize: "13px" }}>50.000 XP</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative" style={{ height: "8px", backgroundColor: "#333", borderRadius: "4px", marginBottom: "16px" }}>
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: "100%",
                            width: `${Math.min(((user.xp ?? 0) / 50000) * 100, 100)}%`,
                            backgroundColor: "#00d4b4",
                            borderRadius: "4px",
                          }}
                        />
                        {/* Kilit ikonu */}
                        <div
                          style={{
                            position: "absolute",
                            right: "-12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "28px",
                            height: "28px",
                            backgroundColor: "#00d4b4",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#000000">
                            <path d="M12 1C9.24 1 7 3.24 7 6v2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v2H9V6c0-1.65 1.35-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Açıklama */}
                      <p style={{ color: "#aaaaaa", fontSize: "13px", marginTop: "8px" }}>
                        Bir sonraki seviye: Velo 1. Seviye atlamak için 50.000 XP gerekli.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bakiye */}
                <Link
                  href="/deposit"
                  className="flex items-center gap-1 hover:bg-[#00b89c] transition-colors"
                  style={{
                    backgroundColor: "#00d4b4",
                    color: "#000000",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontWeight: 600,
                    fontSize: "14px",
                    whiteSpace: "nowrap",
                    height: "38px",
                  }}
                >
                  {(user.totalBalance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                  <Plus style={{ width: "14px", height: "14px" }} />
                </Link>

                {/* Profil */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="relative flex items-center justify-center hover:bg-[#00d4b4]/20 transition-colors"
                    style={{ width: "38px", height: "38px", border: "2px solid #00d4b4", borderRadius: "8px" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#00d4b4">
                      <path d="M8.57 14.098A6.83 6.83 0 1118.63 8.08a6.83 6.83 0 01-3.47 5.946c5.084.87 8.03 3.96 8.03 8.25h-1.5c0-4.195-3.43-6.998-9.63-6.998-6.2 0-9.628 2.803-9.628 6.998h-1.5c0-4.18 2.795-7.218 7.64-8.178zm3.23-.69a5.33 5.33 0 100-10.66 5.33 5.33 0 000 10.66z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-1 z-[100]" style={{ width: "360px" }}>
                      <UserProfileMenu onClose={() => setProfileOpen(false)} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/register" className="hover:opacity-90 transition-opacity" style={{ backgroundColor: "#00d4b4", color: "#000", fontSize: "16px", fontWeight: 600, textTransform: "uppercase", padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", whiteSpace: "nowrap", marginRight: "8px" }}>KAYIT OL</Link>
                <button onClick={onLoginClick} className="py-1.5 font-semibold text-white hover:text-[#00d4b4] transition-colors" style={{ fontSize: "16px", paddingLeft: "8px", paddingRight: "24px" }}>GİRİŞ</button>
              </>
            )}

            {/* Bayrak */}
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{ 
                height: "38px", 
                width: "52px", 
                borderRadius: "8px", 
                backgroundColor: "#2d2d2d", 
                marginLeft: "0px",
                border: ".1rem solid hsla(0, 0%, 100%, .1)"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 87.51" style={{ width: "100%", height: "100%", padding: "10px" }}>
                <defs>
                  <clipPath id="clip-path-dt">
                    <path fill="none" d="M0 0h150v87.51H0z" />
                  </clipPath>
                </defs>
                <g>
                  <g clipPath="url(#clip-path-dt)">
                    <path fill="#d00027" d="M0 0h150v87.51H0z" />
                    <g clipPath="url(#clip-path-dt)">
                      <path fill="#fff" d="M43.78 21.86a21.87 21.87 0 11-21.87 21.87 21.86 21.86 0 0121.87-21.87" />
                      <path fill="#d00027" d="M49.22 26a17.71 17.71 0 11-17.44 17.73A17.51 17.51 0 0149.22 26" />
                      <path fill="#fff" d="M62.23 43.73l10.45 3.68 1.81-5.23-12.26 1.55z" />
                      <path fill="#fff" d="M62.23 43.73l10.45-3.1 1.81 5.18-12.26-2.08z" />
                      <path fill="#fff" d="M69.8 33.33v10.93h5.44L69.8 33.33z" />
                      <path fill="#fff" d="M69.8 33.33l6.5 8.85-4.42 3.15-2.08-12z" />
                      <path fill="#fff" d="M69.8 54.18l6.5-8.85-4.42-3.15-2.08 12z" />
                      <path fill="#fff" d="M69.8 54.18V43.25h5.44L69.8 54.18z" />
                      <path fill="#fff" d="M82.01 37.49l-10.4 3.14 1.81 5.18 8.59-8.32z" />
                      <path fill="#fff" d="M82.01 37.49l-6.24 8.85-4.69-3.09 10.93-5.76z" />
                      <path fill="#fff" d="M82.01 49.97l-6.24-8.86-4.69 3.68 10.93 5.18z" />
                      <path fill="#fff" d="M82.01 49.97l-10.4-3.1 1.81-5.22 8.59 8.32z" />
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>
          </div>

          {/* ALT SATIR: Nav linkleri veya Arama inputu */}
          <div className="flex items-center justify-end overflow-x-auto scrollbar-none" style={{ height: "44px", scrollbarWidth: "none" }}>

          {searchOpen ? (
            /* Arama modu */
            <>
              <div className="flex items-center flex-1" style={{ maxWidth: "500px", gap: "8px" }}>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" style={{ width: "16px", height: "16px" }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Oyun ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-800 text-white pl-9 pr-8 focus:outline-none focus:border-[#00d4b4] border border-zinc-600"
                    style={{ height: "34px", fontSize: "14px", borderRadius: "4px" }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="text-zinc-400" style={{ width: "14px", height: "14px" }} />
                    </button>
                  )}
                </div>
                <button
                  onClick={closeSearch}
                  className="text-[#00d4b4] hover:text-white transition-colors whitespace-nowrap"
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  İptal et
                </button>
              </div>
            </>
          ) : (
            <>
              {navLinks.map((link) => {
            const isActive = pathname === link.href
            if ((link as any).adminOnly && user?.rank !== 'admin' && user?.rank !== 'superadmin') return null

            // Aviator — modal tetikle
            if (link.label === 'Aviator' && onAviatorClick) {
              return (
                <button
                  key={link.label}
                  onClick={onAviatorClick}
                  className="relative flex items-center h-full whitespace-nowrap px-2 transition-colors hover:text-[#00d4b4]"
                  style={{
                    color: '#00d4b4',
                    fontSize: "16px",
                    fontWeight: 700,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {link.label}
                </button>
              )
            }

            if ((link as any).external) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex items-center h-full whitespace-nowrap px-2 transition-colors hover:text-[#00d4b4]"
                  style={{ color: '#ffffff', fontSize: "16px", fontWeight: 500 }}
                >
                  {link.label}
                </a>
              )
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                className="relative flex items-center h-full whitespace-nowrap px-2 transition-colors hover:text-[#00d4b4]"
                style={{
                  color: isActive || link.highlight ? '#00d4b4' : '#ffffff',
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {link.label}
              </Link>
            )
          })}
          {/* Arama ikonu */}
          <button
            onClick={openSearch}
            className="flex items-center justify-center ml-3 hover:text-[#00d4b4] transition-colors text-white"
            style={{ width: "32px", height: "32px" }}
          >
            <Search style={{ width: "18px", height: "18px" }} />
          </button>
            </>
          )}
          </div>

        </div>{/* sağ flex-col sonu */}
      </div>{/* max-w container sonu */}

      {/* Desktop Search Overlay */}
      {searchOpen && (
        <div
          className="fixed left-0 right-0 z-40 bg-zinc-900"
          style={{ top: "106px", minHeight: "400px", borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            {showRecentSearches ? (
              <div>
                <h3 className="text-white font-semibold mb-4" style={{ fontSize: "16px" }}>Son aramalar</h3>
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                  {recentSearches.map((game) => (
                    <div key={game.id} className="cursor-pointer" onClick={() => handleGameClick(game)}>
                      <div className="rounded-lg overflow-hidden bg-zinc-800" style={{ width: "100%", height: "100px" }}>
                        <img src={game.image || "/placeholder.svg"} alt={game.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                      </div>
                      <p className="text-white text-sm font-medium mt-2 truncate text-center">{game.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : isSearchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-[#00d4b4] animate-spin" style={{ width: "40px", height: "40px" }} />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                {searchResults.map((game) => (
                  <div key={game.id} className="cursor-pointer" onClick={() => handleGameClick(game)}>
                    <div className="rounded-lg overflow-hidden bg-zinc-800" style={{ width: "100%", height: "100px" }}>
                      <img src={game.image || "/placeholder.svg"} alt={game.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }} />
                    </div>
                    <p className="text-white text-sm font-medium mt-2 truncate text-center">{game.name}</p>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-white font-semibold" style={{ fontSize: "16px" }}>Sonuç bulunamadı</p>
                <p className="text-zinc-400 mt-1" style={{ fontSize: "14px" }}>Farklı bir arama deneyin</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-zinc-400" style={{ fontSize: "14px" }}>Bir oyun adı yazın...</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Backdrop */}
      {searchOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" style={{ top: "106px" }} onClick={closeSearch} />
      )}

    </header>
  )
}
