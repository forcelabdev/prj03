import apiClient from '../api-client'

export interface ShopProduct {
  id: string
  _id?: string
  name: string
  title?: string
  description: string
  coinCost: number
  rewardAmount?: number
  valueTL: number
  valueLabel: string
  image: string
  banner?: string
  type: 'nakit'
  active: boolean
  isActive?: boolean
}

export interface CoinsConfig {
  id: string
  levelName: string
  minXp: number
  maxXp: number
  coinsPerXp: number // 1 XP = X Coins
}

export interface PurchaseRecord {
  id: string
  userId: string
  username: string
  productId: string
  productName: string
  valueTL: number
  coinCost: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// Static fallback ürünler (API yokken kullanılır)
export const STATIC_SHOP_PRODUCTS: ShopProduct[] = [
  { id: '1', name: 'Çevrimsiz Nakit', description: '100 TL çevrimsiz nakit ödül', coinCost: 110,  valueTL: 100,  valueLabel: '100 TL',   image: '/shop/nakit-100.jpg',  type: 'nakit', active: true },
  { id: '2', name: 'Çevrimsiz Nakit', description: '250 TL çevrimsiz nakit ödül', coinCost: 275,  valueTL: 250,  valueLabel: '250 TL',   image: '/shop/nakit-250.jpg',  type: 'nakit', active: true },
  { id: '3', name: 'Çevrimsiz Nakit', description: '500 TL çevrimsiz nakit ödül', coinCost: 575,  valueTL: 500,  valueLabel: '500 TL',   image: '/shop/nakit-500.jpg',  type: 'nakit', active: true },
  { id: '4', name: 'Çevrimsiz Nakit', description: '1000 TL çevrimsiz nakit ödül',coinCost: 1100, valueTL: 1000, valueLabel: '1.000 TL', image: '/shop/nakit-1000.jpg', type: 'nakit', active: true },
  { id: '5', name: 'Çevrimsiz Nakit', description: '2500 TL çevrimsiz nakit ödül',coinCost: 2750, valueTL: 2500, valueLabel: '2.500 TL', image: '/shop/nakit-2500.jpg', type: 'nakit', active: true },
  { id: '6', name: 'Çevrimsiz Nakit', description: '5000 TL çevrimsiz nakit ödül',coinCost: 5500, valueTL: 5000, valueLabel: '5.000 TL', image: '/shop/nakit-5000.jpg', type: 'nakit', active: true },
]

// Static fallback coins config
export const STATIC_COINS_CONFIG: CoinsConfig[] = [
  { id: '1', levelName: 'Move 1', minXp: 0,         maxXp: 500000,   coinsPerXp: 0.001 },
  { id: '2', levelName: 'Move 2', minXp: 500000,    maxXp: 1500000,  coinsPerXp: 0.0015 },
  { id: '3', levelName: 'Move 3', minXp: 1500000,   maxXp: 3000000,  coinsPerXp: 0.002 },
  { id: '4', levelName: 'Move 4', minXp: 3000000,   maxXp: 5000000,  coinsPerXp: 0.0025 },
  { id: '5', levelName: 'Move 5', minXp: 5000000,   maxXp: 10000000, coinsPerXp: 0.003 },
]

// Normalize API item → ShopProduct
function normalizeItem(item: any): ShopProduct {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apievrymatrix5d84k321.com'
  const rawBanner = item.banner || item.image || ''
  const image = rawBanner
    ? rawBanner.startsWith('http') ? rawBanner : `${API_BASE}${rawBanner}`
    : '/shop/nakit-100.jpg'
  const coinCost = item.coinCost ?? item.cost ?? item.price ?? 0
  const rewardAmount = item.rewardAmount ?? item.valueTL ?? item.value ?? 0
  return {
    id: item._id || item.id || String(Math.random()),
    _id: item._id,
    name: item.title || item.name || 'Çevrimsiz Nakit',
    title: item.title,
    description: item.description || '',
    coinCost,
    rewardAmount,
    valueTL: rewardAmount,
    valueLabel: rewardAmount > 0 ? `${Number(rewardAmount).toLocaleString('tr-TR')} TL` : '',
    image,
    banner: item.banner,
    type: 'nakit',
    active: item.isActive ?? item.active ?? true,
    isActive: item.isActive ?? item.active ?? true,
  }
}

export const shopService = {
  // GET /public/shop/items - Mağaza ürünleri (API dokümantasyonu §16)
  // requiresAuth=true → proxy agentToken header'ını ekler, backend bu endpoint'te agentToken zorunlu
  async getProducts(): Promise<{ success: boolean; products: ShopProduct[] }> {
    try {
      const response = await apiClient.get<any>('/public/shop/items', true)
      if (response.success && response.data) {
        // api-client zaten data.data'yı çıkarıyor, yani response.data = ürünler dizisi olabilir
        const raw = Array.isArray(response.data)
          ? response.data
          : ((response.data as any).data || (response.data as any).items || response.data)
        if (Array.isArray(raw) && raw.length > 0) {
          return { success: true, products: raw.map(normalizeItem) }
        }
      }
    } catch (e: any) {
      console.log('[v0] shopService.getProducts error:', e?.message)
    }
    return { success: true, products: STATIC_SHOP_PRODUCTS }
  },

  // POST /shop/purchase - Satın alma (API dokümantasyonu §16)
  // Request: { itemId: "mongo-id" }
  // Response: { success, purchase: { coinCost, rewardAmount, coinsAfter, ... }, coinBalance, walletBalance }
  async purchase(productId: string): Promise<{ success: boolean; error?: string; remainingCoins?: number; message?: string }> {
    try {
      const response = await apiClient.post<any>('/shop/purchase', { itemId: productId }, true)
      const data = (response.data as any) || response
      if (response.success || (data as any)?.success) {
        const coinBalance = data?.coinBalance ?? data?.purchase?.coinsAfter ?? undefined
        return { success: true, remainingCoins: coinBalance, message: data?.message }
      }
      return {
        success: false,
        error: data?.message || (response as any).error || 'Satın alma başarısız',
        remainingCoins: data?.coinBalance,
      }
    } catch (_) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  },

  // GET /shop/purchases - Kullanıcının satın alma geçmişi (API dokümantasyonu §16)
  // Query: ?page=1&limit=20
  async getPurchases(page = 1, limit = 20): Promise<{ success: boolean; purchases: PurchaseRecord[]; pagination?: any }> {
    try {
      const response = await apiClient.get<any>(`/shop/purchases?page=${page}&limit=${limit}`, true)
      if (response.success && response.data) {
        const d = response.data as any
        const raw = d.data || d.purchases || []
        if (Array.isArray(raw)) {
          const purchases: PurchaseRecord[] = raw.map((r: any) => ({
            id: r._id || r.id,
            userId: r.userId || '',
            username: r.username || '',
            productId: r.itemId || r.productId || r._id || '',
            productName: r.title || r.productName || r.name || '',
            valueTL: r.rewardAmount ?? r.valueTL ?? 0,
            coinCost: r.coinCost ?? 0,
            status: r.state === 'completed' ? 'approved' : (r.status || r.state || 'pending'),
            createdAt: r.createdAt || '',
          }))
          return { success: true, purchases, pagination: d.pagination }
        }
      }
    } catch (_) {}
    return { success: true, purchases: [] }
  },

  // PUT /shop/purchases/:id - Satın alma güncelle (Admin)
  async updatePurchaseStatus(id: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.put(`/shop/purchases/${id}`, { status }, true)
      return { success: response.success, error: (response as any).error }
    } catch (_) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  },

  // GET /shop/coins-config - XP→Coins oranları (Admin)
  async getCoinsConfig(): Promise<{ success: boolean; config: CoinsConfig[] }> {
    try {
      const response = await apiClient.get<{ config: CoinsConfig[] }>('/shop/coins-config', true)
      if (response.success && response.data) {
        const config = (response.data as any).config || response.data
        if (Array.isArray(config) && config.length > 0) return { success: true, config }
      }
    } catch (_) {}
    return { success: true, config: STATIC_COINS_CONFIG }
  },

  // PUT /shop/coins-config - XP→Coins oranlarını güncelle (Admin)
  async updateCoinsConfig(config: CoinsConfig[]): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.put('/shop/coins-config', { config }, true)
      return { success: response.success, error: (response as any).error }
    } catch (_) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  },

  // POST /shop/products - Yeni ürün ekle (Admin)
  async createProduct(product: Omit<ShopProduct, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post('/shop/products', product as any, true)
      return { success: response.success, error: (response as any).error }
    } catch (_) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  },

  // PUT /shop/products/:id - Ürün güncelle (Admin)
  async updateProduct(id: string, product: Partial<ShopProduct>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.put(`/shop/products/${id}`, product as any, true)
      return { success: response.success, error: (response as any).error }
    } catch (_) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  },

  // DELETE /shop/products/:id - Ürün sil (Admin)
  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.delete(`/shop/products/${id}`, true)
      return { success: response.success, error: (response as any).error }
    } catch (_) {
      return { success: false, error: 'Bağlantı hatası' }
    }
  },
}

export default shopService
