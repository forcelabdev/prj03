// Bonus Service - Backend API dokumantasyonuna gore
import apiClient from '../api-client';

export interface Campaign {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  banner?: string;
  image?: string;
  content?: string;
  terms?: string;
  category?: string;
  rewardAmount: number;
  claimable?: boolean;
  claimed?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Bonus {
  id: string;
  _id?: string;
  type: 'first_deposit' | 'reload' | 'cashback' | 'freespin' | string;
  title?: string;
  description?: string;
  percentage: number;
  minAmount: number;
  maxAmount: number;
  enabled: boolean;
}

export interface Promotion {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  image?: string;
  banner?: string;
  content?: string;
  terms?: string;
  category?: string;
}

export const bonusService = {
  // GET /auth/campaigns - Kampanyalar (Opsiyonel auth - token varsa claimable ve claimed hesaplanir)
  async getCampaigns(): Promise<{ success: boolean; campaigns?: Campaign[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; campaigns: Campaign[] }>('/auth/campaigns', true);
    
    if (response.success && response.data) {
      const list = response.data.campaigns || (response.data as any);
      return { success: true, campaigns: list };
    }
    
    return { success: false, error: response.error || 'Kampanyalar alinamadi' };
  },

  // GET /auth/campaign/claim?id=<campaignId> - Kampanya odulunu al (Zorunlu auth)
  async claimCampaign(campaignId: string): Promise<{ success: boolean; campaignId?: string; rewardAmount?: number; newBalance?: number; error?: string }> {
    const response = await apiClient.get<{ success: boolean; campaignId: string; rewardAmount: number; newBalance: number }>(`/auth/campaign/claim?id=${campaignId}`, true);
    
    if (response.success && response.data) {
      return { 
        success: true, 
        campaignId: response.data.campaignId, 
        rewardAmount: response.data.rewardAmount, 
        newBalance: response.data.newBalance 
      };
    }
    
    return { success: false, error: response.error || 'Kampanya odulu alinamadi' };
  },

  // GET /auth/campaign-categories - Kampanya kategorileri (Public)
  async getCampaignCategories(): Promise<{ success: boolean; categories?: any[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; categories: any[] }>('/auth/campaign-categories');
    
    if (response.success && response.data) {
      return { success: true, categories: response.data.categories || response.data as any };
    }
    
    return { success: false, error: response.error || 'Kategoriler alinamadi' };
  },

  // GET /auth/promotions - Promosyonlar (Public)
  async getPromotions(): Promise<{ success: boolean; promotions?: Promotion[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; promotions: Promotion[] }>('/auth/promotions', true);
    
    if (response.success && response.data) {
      const list = response.data.promotions || (response.data as any);
      return { success: true, promotions: list };
    }
    
    return { success: false, error: response.error || 'Promosyonlar alinamadi' };
  },

  // GET /auth/promotion-categories - Promosyon kategorileri (Public)
  async getPromotionCategories(): Promise<{ success: boolean; categories?: any[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; categories: any[] }>('/auth/promotion-categories', true);
    
    if (response.success && response.data) {
      return { success: true, categories: response.data.categories || response.data as any };
    }
    
    return { success: false, error: response.error || 'Kategoriler alinamadi' };
  },

  // GET /bonus-settings - Bonus ayarlari (Public)
  async getBonusSettings(): Promise<{ success: boolean; bonuses?: Bonus[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; bonuses: Bonus[] }>('/bonus-settings');
    
    if (response.success && response.data) {
      return { success: true, bonuses: response.data.bonuses || response.data as any };
    }
    
    return { success: false, error: response.error || 'Bonus ayarlari alinamadi' };
  },

  // POST /bonus/claim - Bonus al (Zorunlu auth)
  async claimBonus(bonusId: string): Promise<{ success: boolean; message?: string; bonusAmount?: number; error?: string }> {
    const response = await apiClient.post<{ message: string; bonusAmount: number }>('/bonus/claim', { bonusId }, true);
    
    if (response.success && response.data) {
      return { success: true, message: response.data.message, bonusAmount: response.data.bonusAmount };
    }
    
    return { success: false, error: response.error || 'Bonus alinamadi' };
  },

  // POST /bonus/claim/freespin - Freespin bonus al (Zorunlu auth)
  async claimFreespin(bonusId: string): Promise<{ success: boolean; message?: string; bonusAmount?: number; error?: string }> {
    const response = await apiClient.post<{ message: string; bonusAmount: number }>('/bonus/claim/freespin', { bonusId }, true);
    
    if (response.success && response.data) {
      return { success: true, message: response.data.message, bonusAmount: response.data.bonusAmount };
    }
    
    return { success: false, error: response.error || 'Freespin alinamadi' };
  },

  // GET /bonus-history/:userId - Bonus gecmisi (Public)
  async getBonusHistory(userId: string): Promise<{ success: boolean; history?: any[]; error?: string }> {
    const response = await apiClient.get<any[]>(`/bonus-history/${userId}`);
    
    if (response.success && response.data) {
      return { success: true, history: response.data as any };
    }
    
    return { success: false, error: response.error || 'Bonus gecmisi alinamadi' };
  },
};

export default bonusService;
