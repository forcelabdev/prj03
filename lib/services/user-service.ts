// User Service - Backend API dokumantasyonuna gore
import apiClient from '../api-client';

export interface UserProfile {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
  birthday?: string;
  rank?: string;
  xp?: number;
  balance?: any;
  stats?: {
    bet: number;
    won: number;
    deposit: number;
    withdraw: number;
  };
  rakeback?: {
    earned: number;
    available: number;
  };
  wallets?: any[];
  currency?: {
    fiatCurrency: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  birthday?: string;
  password?: string;
}

export const userService = {
  // GET /users/:id - Kullanici profili (Zorunlu auth - sadece kendi profili)
  async getProfile(userId: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const response = await apiClient.get<{ user: UserProfile }>(`/users/${userId}`, true);
    
    if (response.success && response.data) {
      return { success: true, user: response.data.user || response.data as any };
    }
    
    return { success: false, error: response.error || 'Profil alinamadi' };
  },

  // PUT /users/:id - Profil guncelle (Zorunlu auth - sadece kendi profili)
  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
    const response = await apiClient.put<{ message: string; user: UserProfile }>(`/users/${userId}`, data, true);
    
    if (response.success && response.data) {
      return { success: true, user: response.data.user, message: response.data.message };
    }
    
    return { success: false, error: response.error || 'Profil guncellenemedi' };
  },

  // POST /users/switch-wallet - Wallet degistir (Zorunlu auth)
  async switchWallet(coinType: string, type: string, chain: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<{ success: boolean }>('/users/switch-wallet', {
      coinType,
      type,
      chain,
    }, true);
    
    if (response.success) {
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Wallet degistirilemedi' };
  },

  // POST /wallet/convert-to-fiat - Tum bakiyeleri fiat'a donustur (Zorunlu auth)
  async convertToFiat(fiatCurrency: string): Promise<{ success: boolean; message?: string; balances?: any[]; error?: string }> {
    const response = await apiClient.post<{ message: string; balances: any[] }>('/wallet/convert-to-fiat', {
      fiatCurrency,
    }, true);
    
    if (response.success && response.data) {
      return { success: true, message: response.data.message, balances: response.data.balances };
    }
    
    return { success: false, error: response.error || 'Donusum basarisiz' };
  },

  // POST /exchange/switch-fiat-currency - Fiat para birimi degistir (Zorunlu auth)
  async switchFiatCurrency(newFiat: string): Promise<{ success: boolean; message?: string; rate?: number; newFiat?: string; error?: string }> {
    const response = await apiClient.post<{ success: boolean; message: string; rate: number; newFiat: string }>('/exchange/switch-fiat-currency', {
      newFiat,
    }, true);
    
    if (response.success && response.data) {
      return { success: true, message: response.data.message, rate: response.data.rate, newFiat: response.data.newFiat };
    }
    
    return { success: false, error: response.error || 'Para birimi degistirilemedi' };
  },

  // GET /auth/sports-bets - Spor bahisleri (Zorunlu auth)
  async getSportsBets(): Promise<{ success: boolean; bets?: any[]; pagination?: any; error?: string }> {
    const response = await apiClient.get<{ success: boolean; bets: any[]; pagination: any }>('/auth/sports-bets', true);
    
    if (response.success && response.data) {
      return { success: true, bets: response.data.bets, pagination: response.data.pagination };
    }
    
    return { success: false, error: response.error || 'Bahisler alinamadi' };
  },

  // GET /auth/sports-bets/:betId - Tek bahis detayi (Zorunlu auth)
  async getSportsBetDetail(betId: string): Promise<{ success: boolean; bet?: any; error?: string }> {
    const response = await apiClient.get<{ success: boolean; bet: any }>(`/auth/sports-bets/${betId}`, true);
    
    if (response.success && response.data) {
      return { success: true, bet: response.data.bet };
    }
    
    return { success: false, error: response.error || 'Bahis detayi alinamadi' };
  },

  // GET /auth/sports-bets-stats - Spor bahis istatistikleri (Zorunlu auth)
  async getSportsBetsStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    const response = await apiClient.get<{ success: boolean; stats: any }>('/auth/sports-bets-stats', true);
    
    if (response.success && response.data) {
      return { success: true, stats: response.data.stats || response.data };
    }
    
    return { success: false, error: response.error || 'Istatistikler alinamadi' };
  },
};

export default userService;
