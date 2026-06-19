// Games Service - Backend API dokumantasyonuna gore
import apiClient from '../api-client';

// Rate limiting sadece server-side'da (route.ts) yapiliyor
// Client-side rate limit kaldirildi - cift istek sorunu yaratiyordu

// In-memory cache — sayfa yenilenene kadar gecerli
const _cache: Record<string, { data: any; ts: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 dakika

function getCached<T>(key: string): T | null {
  const entry = _cache[key]
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T
  return null
}

function setCache(key: string, data: any) {
  _cache[key] = { data, ts: Date.now() }
}

export interface Game {
  _id?: string;
  id: string;
  game_code?: string;
  gameCode?: string;
  game_name?: string;
  name: string;
  banner?: string;
  cover?: string;
  image?: string;
  provider_code?: string;
  provider?: string;
  providerCode?: string;
  categories?: string[];
  game_type?: string;
  featured?: number;
  has_lobby?: number;
  views?: number;
  status?: number;
  isNew?: boolean;
  betRange?: string;
  jackpot?: string;
}

export interface GameCategory {
  _id?: string;
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  order?: number;
  games: Game[];
  type?: 'live' | 'slots';
}

export interface GameProvider {
  _id: string;
  code: string;
  name: string;
  logo?: string;
  slug?: string;
  gameCount?: number;
}

export interface GameLaunchResponse {
  status?: number;
  msg?: string;
  launch_url?: string;
  success?: boolean;
}

// Kategori adına göre tipi belirle
const determineCategoryType = (name: string): 'live' | 'slots' => {
  const liveKeywords = ['live', 'canlı', 'roulette', 'blackjack', 'baccarat', 'poker', 'sic bo', 'sicbo', 'dealer', 'table']
  const nameLower = name.toLowerCase()
  
  if (liveKeywords.some(keyword => nameLower.includes(keyword))) {
    return 'live'
  }
  return 'slots'
}

export const gamesService = {
  // GET /public/categories - Tum kategorileri getir
  async getCategories(): Promise<{ success: boolean; categories?: GameCategory[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; categories: GameCategory[] }>('/public/categories');
    
    if (response.success && response.data) {
      const categories = (response.data.categories || response.data as any) as any[]
      // Her kategoriye tipi ekle
      const withTypes = categories.map(cat => ({
        ...cat,
        type: determineCategoryType(cat.name || '')
      }))
      return { success: true, categories: withTypes };
    }
    
    return { success: false, error: response.error || 'Kategoriler alinamadi' };
  },

  // GET /public/games/featured/list - One cikan oyunlar (cached)
  async getFeaturedGames(): Promise<{ success: boolean; games?: Game[]; error?: string }> {
    const cacheKey = 'featured-games'
    const cached = getCached<Game[]>(cacheKey)
    if (cached) return { success: true, games: cached }

    const response = await apiClient.get<any>('/public/games/featured/list');
    
    if (response.success && response.data) {
      const raw = response.data
      const games: Game[] = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.games) ? raw.games
        : []
      setCache(cacheKey, games)
      return { success: true, games };
    }
    
    return { success: false, error: response.error || 'One cikan oyunlar alinamadi' };
  },

  // GET /public/games/categories/with-games - Kategoriler ve oyunlari
  async getCategoriesWithGames(): Promise<{ success: boolean; categories?: any[]; error?: string }> {
    const cacheKey = 'categories-with-games'
    const cached = getCached<any[]>(cacheKey)
    if (cached) return { success: true, categories: cached }

    const response = await apiClient.get<{ success: boolean; data: any[] }>('/public/games/categories/with-games');
    if (response.success && response.data) {
      const categories = response.data.data || response.data as any
      setCache(cacheKey, categories)
      return { success: true, categories };
    }
    return { success: false, error: response.error || 'Kategoriler alinamadi' };
  },

  // GET /public/games/category/:id - Kategoriye gore oyunlar (limit=1000)
  async getGamesByCategory(slug: string, limit: number = 1000): Promise<{ success: boolean; games?: Game[]; total?: number; error?: string }> {
    const cacheKey = `cat-games-${slug}`
    const cached = getCached<Game[]>(cacheKey)
    if (cached) return { success: true, games: cached }

    const url = `/public/games/category/${slug}?limit=${limit}`
    const response = await apiClient.get<any>(url);
    if (response.success && response.data) {
      const games = response.data.data || response.data
      const list = Array.isArray(games) ? games : []
      setCache(cacheKey, list)
      return { success: true, games: list, total: response.data.total };
    }
    return { success: false, error: response.error || 'Oyunlar alinamadi' };
  },

  // GET /public/games/search-category - Oyun arama
  async searchGames(query: string): Promise<{ success: boolean; games?: Game[]; total?: number; error?: string }> {
    const response = await apiClient.get<any>(`/public/games/search-category?q=${encodeURIComponent(query)}`);
    
    if (response.success && response.data) {
      const games: Game[] = Array.isArray(response.data) ? response.data 
        : Array.isArray(response.data?.data) ? response.data.data 
        : [];
      return { success: true, games, total: response.data?.total };
    }
    
    return { success: false, error: response.error || 'Arama basarisiz' };
  },

  // GET /public/games/search - Ana arama endpoint'i
  async searchGamesAlt(query: string): Promise<{ success: boolean; games?: Game[]; total?: number; error?: string }> {
    const response = await apiClient.get<any>(`/public/games/search?q=${encodeURIComponent(query)}`);
    
    if (response.success && response.data) {
      const raw = response.data
      const games: Game[] = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.games) ? raw.games
        : []
      return { success: true, games, total: raw?.total };
    }
    
    return { success: false, error: response.error || 'Arama basarisiz' };
  },

  // GET /public/providers/category/:slug - Provider'a gore oyunlar
  async getGamesByProvider(providerSlug: string): Promise<{ success: boolean; games?: Game[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; data: Game[] }>(`/public/providers/category/${providerSlug}`);
    
    if (response.success && response.data) {
      return { success: true, games: response.data.data || response.data as any };
    }
    
    return { success: false, error: response.error || 'Provider oyunlari alinamadi' };
  },

  // GET /public/games/type/:type - Tipe gore oyunlar (slots, live-casino, etc.)
  async getGamesByType(type: string): Promise<{ success: boolean; categories?: GameCategory[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/public/games/type/${type}`);
    
    if (response.success && response.data) {
      return { success: true, categories: response.data.data || response.data as any };
    }
    
    return { success: false, error: response.error || 'Oyunlar alinamadi' };
  },

  // GET /games/:game_code - Tek oyun detayi (game_code ile, public endpoint)
  async getGameDetails(gameCodeOrId: string): Promise<{ success: boolean; game?: Game; error?: string }> {
    // Önce public endpoint dene (game_code ile)
    let response = await apiClient.get<any>(`/games/${gameCodeOrId}`);
    if (response.success && response.data) {
      const game = (response.data as any).data || (response.data as any).game || response.data;
      return { success: true, game };
    }
    // Public endpoint başarısız olursa auth ile dene
    response = await apiClient.get<any>(`/games/${gameCodeOrId}`, true);
    if (response.success && response.data) {
      const game = (response.data as any).data || (response.data as any).game || response.data;
      return { success: true, game };
    }
    return { success: false, error: response.error || 'Oyun detayi alinamadi' };
  },

  // Oyun baslat - distribution field'ina gore dogru API'yi kullan
  // nexus → /gold_api | drakon → /drakon_api | betcolabs → /betcolabs_api | betinovi → /betinovi_api | pokerapi → /poker_api
  async launchGame(
    userId: string,
    vendorCode: string,
    gameCode: string,
    language: string = 'tr',
    distribution: string = '',
    numericId: string = '', // Drakon icin telefon numarasi
    domain: string = '', // Sportsbook icin domain
    mirror: number = 0, // Sportsbook icin mirror
    isDemo: boolean = false, // Demo mod
  ): Promise<{ success: boolean; launchUrl?: string; error?: string; errorCode?: string }> {
    
    const isMobile = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      window.innerWidth < 768
    );

    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    // Tum game launch istekleri /api/game-launch uzerinden gider
    const res = await fetch('/api/game-launch', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
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
    // Tum olasi URL field adlarini kontrol et
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
    const msg = d?.msg || d?.message || ''
    // Backend bakım hatası — doğrudan anlamlı mesajı döndür
    if (msg === 'GAME_UNAVAILABLE') {
      return { success: false, error: d?.error || 'Bu oyun şu anda bakımda. Lütfen daha sonra tekrar deneyin.', errorCode: 'GAME_UNAVAILABLE' }
    }
    const rawDetail = d?.details || d?.error?.error || d?.error || msg || 'Oyun baslatilamadi'
    const rawStr = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail)
    // Ham API teknik mesajlarını kullanıcıya gösterme
    const isTechnical = rawStr.includes('input=') || rawStr.includes('Delay time') || rawStr.includes('timeout=') || rawStr.includes('GetGameUrl') || rawStr.includes('is not defined')
    const errDetail = isTechnical ? 'Oyun şu anda açılamıyor. Lütfen daha sonra tekrar deneyin.' : rawStr
    return { success: false, error: errDetail, errorCode: msg }
  },

  // POST /betinovi_api/ - Provider listesi (get_vendors) - cached
  async getVendors(): Promise<{ success: boolean; vendors?: any[]; error?: string }> {
    const cacheKey = 'vendors-list'
    const cached = getCached<any[]>(cacheKey)
    if (cached) return { success: true, vendors: cached }

    const response = await apiClient.post<{ status: number; vendors: any[] }>('/betinovi_api/', {
      method: 'get_vendors',
    });
    
    if (response.success && response.data) {
      setCache(cacheKey, response.data.vendors)
      return { success: true, vendors: response.data.vendors };
    }
    
    return { success: false, error: response.error || 'Vendorlar alinamadi' };
  },

  // POST /betinovi_api/ - Vendor oyunlari (get_vendor_games)
  async getVendorGames(vendorCode: string): Promise<{ success: boolean; games?: Game[]; error?: string }> {
    const response = await apiClient.post<{ status: number; games: Game[] }>('/betinovi_api/', {
      method: 'get_vendor_games',
      vendorCode: vendorCode,
    });
    
    if (response.success && response.data) {
      return { success: true, games: response.data.games };
    }
    
    return { success: false, error: response.error || 'Vendor oyunlari alinamadi' };
  },

  // POST /betcolabs_api/ - Sportsbook baslat
  async launchSportsbook(userId: string, gameCode: string = 'prematch', language: string = 'tr'): Promise<{ success: boolean; launchUrl?: string; sessionToken?: string; error?: string }> {
    const response = await apiClient.post<{ success: boolean; launch_url: string; session_token: string }>('/betcolabs_api/', {
      method: 'get_launch_url',
      user_id: userId,
      gameCode: gameCode,
      language: language,
    });
    
    if (response.success && response.data) {
      return { success: true, launchUrl: response.data.launch_url, sessionToken: response.data.session_token };
    }
    
    return { success: false, error: response.error || 'Sportsbook baslatilamadi' };
  },

  // GET /game-history/:identifier - Oyun gecmisi
  async getGameHistory(identifier: string, page: number = 1, pageSize: number = 20): Promise<{ success: boolean; history?: any[]; pagination?: any; error?: string }> {
    const response = await apiClient.get<{ history: any[]; pagination: any }>(`/game-history/${identifier}?page=${page}&pageSize=${pageSize}`);
    
    if (response.success && response.data) {
      return { success: true, history: response.data.history, pagination: response.data.pagination };
    }
    
    return { success: false, error: response.error || 'Oyun gecmisi alinamadi' };
  },

  // GET /gamehistory/recent-big-wins - Son buyuk kazanclar
  async getRecentBigWins(): Promise<{ success: boolean; wins?: any[]; error?: string }> {
    const response = await apiClient.get<any>('/gamehistory/recent-big-wins');
    
    if (response.success && response.data) {
      const raw = response.data
      const wins: any[] = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.wins) ? raw.wins
        : []
      return { success: true, wins };
    }
    
    return { success: false, error: response.error || 'Buyuk kazanclar alinamadi' };
  },
};

export default gamesService;
