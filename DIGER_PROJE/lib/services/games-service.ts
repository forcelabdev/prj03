// games-service.ts
// Tum oyun API cagrilari burada — launchGame dahil
// apiClient olarak projenin mevcut api-client.ts dosyasini kullan
import apiClient from '../api-client'

// ============================================================
// In-memory cache — sayfa yenilenene kadar gecerli, 5 dk TTL
// ============================================================
const _cache: Record<string, { data: unknown; ts: number }> = {}
const CACHE_TTL = 5 * 60 * 1000

function getCached<T>(key: string): T | null {
  const entry = _cache[key]
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T
  return null
}
function setCache(key: string, data: unknown) {
  _cache[key] = { data, ts: Date.now() }
}

// ============================================================
// TYPES
// ============================================================
export interface Game {
  _id?:          string
  id:            string
  game_code?:    string
  gameCode?:     string
  name:          string
  image?:        string
  banner?:       string
  cover?:        string
  provider?:     string
  provider_code?: string
  providerCode?: string
  distribution?: string
  categories?:   string[]
  featured?:     number
  status?:       number
  isNew?:        boolean
  [key: string]: unknown
}

export interface GameCategory {
  _id?:   string
  id:     string
  name:   string
  slug?:  string
  icon?:  string
  order?: number
  games:  Game[]
}

// ============================================================
// GAMES SERVICE
// ============================================================
export const gamesService = {

  // GET /public/games/categories/with-games — kategoriler + oyunlar tek istekte
  async getCategoriesWithGames(): Promise<{ success: boolean; categories?: unknown[]; error?: string }> {
    const cacheKey = 'categories-with-games'
    const cached   = getCached<unknown[]>(cacheKey)
    if (cached) return { success: true, categories: cached }

    const response = await apiClient.get<{ success: boolean; data: unknown[] }>('/public/games/categories/with-games')
    if (response.success && response.data) {
      const cats = (response.data as any).data || response.data
      setCache(cacheKey, cats)
      return { success: true, categories: cats }
    }
    return { success: false, error: response.error || 'Kategoriler alinamadi' }
  },

  // GET /public/games/category/:slug — kategoriye gore oyunlar (tab degisince)
  async getGamesByCategory(slug: string, limit = 1000): Promise<{ success: boolean; games?: Game[]; error?: string }> {
    const cacheKey = `cat-games-${slug}`
    const cached   = getCached<Game[]>(cacheKey)
    if (cached) return { success: true, games: cached }

    const response = await apiClient.get<unknown>(`/public/games/category/${slug}?limit=${limit}`)
    if (response.success && response.data) {
      const raw  = (response.data as any).data || response.data
      const list = Array.isArray(raw) ? raw : []
      setCache(cacheKey, list)
      return { success: true, games: list }
    }
    return { success: false, error: response.error || 'Oyunlar alinamadi' }
  },

  // GET /games/:game_code — oyun detayi (distribution + provider_code buradan geliyor)
  // Her oyun acilisinda cagrilir — taze distribution alabilmek icin
  async getGameDetails(gameCodeOrId: string): Promise<{ success: boolean; game?: Game; error?: string }> {
    // Once public endpoint
    let response = await apiClient.get<unknown>(`/games/${gameCodeOrId}`)
    if (response.success && response.data) {
      const game = (response.data as any).data || (response.data as any).game || response.data
      return { success: true, game }
    }
    // Basarisiz olursa auth ile dene
    response = await apiClient.get<unknown>(`/games/${gameCodeOrId}`, true)
    if (response.success && response.data) {
      const game = (response.data as any).data || (response.data as any).game || response.data
      return { success: true, game }
    }
    return { success: false, error: response.error || 'Oyun detayi alinamadi' }
  },

  // GET /public/games/search?q= — oyun arama
  async searchGames(query: string): Promise<{ success: boolean; games?: Game[]; error?: string }> {
    const response = await apiClient.get<unknown>(`/public/games/search?q=${encodeURIComponent(query)}`)
    if (response.success && response.data) {
      const raw   = response.data as any
      const games = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data)     ? raw.data
        : Array.isArray(raw?.games)    ? raw.games
        : []
      return { success: true, games }
    }
    return { success: false, error: response.error || 'Arama basarisiz' }
  },

  // ============================================================
  // OYUN BASLATMA — ana fonksiyon
  // distribution'a gore dogru endpoint ve field adlari route.ts'te belirleniyor
  // ============================================================
  async launchGame(
    userId:       string,          // user.id — tam MongoDB _id
    vendorCode:   string,          // game.provider_code
    gameCode:     string,          // game.game_code
    language     = 'tr',
    distribution = '',             // game.distribution — "nexus" | "drakon" | "betcolabs" | "pokerapi" | "betinovi" | ""
    numericId    = '',             // user.identifier || user.id — Drakon icin
    domain       = '',             // sportsbook icin
    mirror       = 0,             // sportsbook icin
    isDemo       = false,
  ): Promise<{ success: boolean; launchUrl?: string; error?: string; errorCode?: string }> {

    // Mobil/desktop channel otomatik belirlenir
    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || 'ontouchstart' in window
      || window.innerWidth < 768
    )

    // localStorage'dan token al — Authorization header icin
    const authToken = typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null

    const requestBody = {
      distribution,
      userId,       // user.id — tam MongoDB _id burada olmali
      vendorCode,
      gameCode,
      language,
      numericId,
      channel: isMobile ? 'mobile' : 'desktop',
      domain,
      mirror,
      isDemo,
    }

    const res = await fetch('/api/game-launch', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(requestBody),
    })

    const d = await res.json()

    // ============================================================
    // URL PARSE — her backend farkli field adi donuyor olabilir
    // 11 farkli field adina bakiyoruz
    // ============================================================
    const url = d?.launch_url
      || d?.game_url
      || d?.iframe_url
      || d?.url
      || d?.gameUrl
      || d?.launchUrl
      || d?.game_launch_url
      || d?.result?.url
      || d?.result?.launch_url
      || d?.data?.url
      || d?.data?.launch_url

    if (url) return { success: true, launchUrl: url }

    // Hata mesaji
    const msg       = d?.msg || d?.message || ''
    const rawDetail = d?.details || d?.error?.error || d?.error || msg || 'Oyun baslatilamadi'
    const rawStr    = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail)

    // Teknik hata mesajlarini kullaniciya gosterme
    const isTechnical = rawStr.includes('input=')
      || rawStr.includes('Delay time')
      || rawStr.includes('timeout=')
      || rawStr.includes('GetGameUrl')

    return {
      success:   false,
      error:     isTechnical ? 'Oyun baslatilamadi' : rawStr,
      errorCode: msg,
    }
  },
}

export default gamesService
