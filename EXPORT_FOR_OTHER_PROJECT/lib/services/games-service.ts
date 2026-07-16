// ============================================================
// GAMES SERVICE — lib/services/games-service.ts
//
// Tum oyun API cagrilari burada
// 5 dakika in-memory cache var — sayfa yenilenene kadar gecerli
// launchGame: distribution'a gore /api/game-launch'a POST atar
//             11 farkli launchUrl field adina bakar (fallback)
// ============================================================

import apiClient from '../api-client'

// 5 dakika in-memory cache
const _cache: Record<string, { data: any; ts: number }> = {}
const CACHE_TTL = 5 * 60 * 1000

function getCached<T>(key: string): T | null {
  const entry = _cache[key]
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T
  return null
}
function setCache(key: string, data: any) {
  _cache[key] = { data, ts: Date.now() }
}

export interface Game {
  _id?: string
  id: string
  game_code?: string
  gameCode?: string
  game_name?: string
  name: string
  banner?: string
  cover?: string
  image?: string
  img?: string
  provider_code?: string
  provider?: string
  providerCode?: string
  distribution?: string
  categories?: string[]
  featured?: number
  status?: number
  [key: string]: any
}

export interface GameCategory {
  _id?: string
  id: string
  name: string
  slug?: string
  games: Game[]
  type?: 'live' | 'slots'
}

// -------------------------------------------------------
// Oyun listesi & kategori cekme
// -------------------------------------------------------
export const gamesService = {

  // Tum kategoriler + oyunlar tek istekte (en verimli)
  async getCategoriesWithGames(): Promise<{ success: boolean; categories?: any[]; error?: string }> {
    const cacheKey = 'categories-with-games'
    const cached = getCached<any[]>(cacheKey)
    if (cached) return { success: true, categories: cached }

    const response = await apiClient.get<any>('/public/games/categories/with-games')
    if (response.success && response.data) {
      const categories = (response.data as any).data || response.data
      setCache(cacheKey, categories)
      return { success: true, categories }
    }
    return { success: false, error: response.error || 'Kategoriler alinamadi' }
  },

  // Kategori bazli oyunlar (tab degisince cagrilir)
  async getGamesByCategory(slug: string, limit = 1000): Promise<{ success: boolean; games?: Game[]; error?: string }> {
    const cacheKey = `cat-games-${slug}`
    const cached = getCached<Game[]>(cacheKey)
    if (cached) return { success: true, games: cached }

    // Once slug ile dene, basarisiz olursa id ile fallback
    let response = await apiClient.get<any>(`/public/games/category/${slug}?limit=${limit}`)
    if (!response.success) {
      response = await apiClient.get<any>(`/public/games/category/${slug}?limit=${limit}`, true)
    }
    if (response.success && response.data) {
      const list = Array.isArray(response.data) ? response.data
        : Array.isArray((response.data as any).data) ? (response.data as any).data
        : []
      setCache(cacheKey, list)
      return { success: true, games: list }
    }
    return { success: false, error: response.error || 'Oyunlar alinamadi' }
  },

  // Tek oyun detayi — distribution + provider_code + game_code taze ceker
  // Once public dene, basarisiz olursa auth ile tekrar dene
  async getGameDetails(gameCodeOrId: string): Promise<{ success: boolean; game?: Game; error?: string }> {
    let response = await apiClient.get<any>(`/games/${gameCodeOrId}`)
    if (response.success && response.data) {
      const game = (response.data as any).data || (response.data as any).game || response.data
      return { success: true, game }
    }
    response = await apiClient.get<any>(`/games/${gameCodeOrId}`, true)
    if (response.success && response.data) {
      const game = (response.data as any).data || (response.data as any).game || response.data
      return { success: true, game }
    }
    return { success: false, error: response.error || 'Oyun detayi alinamadi' }
  },

  // Oyun arama
  async searchGames(query: string): Promise<{ success: boolean; games?: Game[]; error?: string }> {
    const response = await apiClient.get<any>(`/public/games/search?q=${encodeURIComponent(query)}`)
    if (response.success && response.data) {
      const raw = response.data as any
      const games: Game[] = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.games) ? raw.games
        : []
      return { success: true, games }
    }
    return { success: false, error: response.error || 'Arama basarisiz' }
  },

  // -------------------------------------------------------
  // OYUN BASLAT
  // distribution parametresi MongoDB'deki game.distribution'dan gelmeli
  // game-launch/route.ts'e POST atar, o distribution'a gore secim yapar
  //
  // Parametre aciklamalari:
  //   userId       — auth context'ten user.id (string)
  //   vendorCode   — game.provider_code (MongoDB'den)
  //   gameCode     — game.game_code (MongoDB'den)
  //   language     — dil kodu, default 'tr'
  //   distribution — game.distribution ('nexus'|'drakon'|'betcolabs'|'pokerapi'|'betinovi')
  //   numericId    — user.numericId veya user.identifier (bazi provider'lar ister)
  //   domain       — sportsbook icin domain string
  //   mirror       — sportsbook icin mirror number
  //   isDemo       — demo mod
  // -------------------------------------------------------
  async launchGame(
    userId: string,
    vendorCode: string,
    gameCode: string,
    language = 'tr',
    distribution = '',
    numericId = '',
    domain = '',
    mirror = 0,
    isDemo = false,
  ): Promise<{ success: boolean; launchUrl?: string; error?: string; errorCode?: string }> {

    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      window.innerWidth < 768
    )

    // Token direkt localStorage'dan alinir
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    const res = await fetch('/api/game-launch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        distribution,
        userId,
        vendorCode,
        gameCode,
        language,
        numericId,
        channel: isMobile ? 'mobile' : 'desktop',
        domain,
        mirror,
        isDemo,
      }),
    })

    const d = await res.json()

    // 11 farkli field adina bak — her backend farklı field donderebilir
    const url =
      d?.launch_url ||
      d?.game_url ||
      d?.iframe_url ||
      d?.url ||
      d?.gameUrl ||
      d?.launchUrl ||
      d?.game_launch_url ||
      d?.result?.url ||
      d?.result?.launch_url ||
      d?.data?.url ||
      d?.data?.launch_url

    if (url) return { success: true, launchUrl: url }

    const msg = d?.msg || d?.message || ''
    const rawDetail = d?.details || d?.error?.error || d?.error || msg || 'Oyun baslatilamadi'
    const rawStr = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail)

    // Teknik hata mesajlarini kullaniciya gosterme
    const isTechnical =
      rawStr.includes('input=') ||
      rawStr.includes('Delay time') ||
      rawStr.includes('timeout=') ||
      rawStr.includes('GetGameUrl')
    const errDetail = isTechnical ? 'Oyun baslatilamadi' : rawStr

    return { success: false, error: errDetail, errorCode: msg }
  },
}

export default gamesService
