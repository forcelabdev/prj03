// VIP Service - Backend API dokumantasyonuna gore
import apiClient from '../api-client';

export interface VipLevel {
  _id: string;
  id?: string;
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  image?: string | null;
  headerImage?: string | null;
  dailyCashback?: number;
  weeklyCashback?: number;
  monthlyCashback?: number;
  upgradeReward?: number;
  withdrawLimit?: number;
  vipDay?: string | null;
  vipSupportInfo?: string | null;
  benefits?: string[];
}

export interface VipReward {
  _id: string;
  levelId: string;
  type: string;
  amount: number;
  claimed?: boolean;
}

export const vipService = {
  // GET /vip/levels - Tum VIP seviyeleri (Public)
  async getLevels(): Promise<{ success: boolean; levels?: VipLevel[]; error?: string }> {
    const response = await apiClient.get<any>('/vip/levels');
    
    if (response.success && response.data) {
      const raw = response.data.levels || response.data.data || response.data;
      const rawArr: any[] = Array.isArray(raw) ? raw : [];
      const arr: VipLevel[] = rawArr.map((l: any) => ({
        ...l,
        _id: l._id || l.id || String(l.level),
        id: l._id || l.id || String(l.level),
        name: l.levelName || l.name || `Seviye ${l.level}`,
        minXp: l.requiredXp ?? l.minXp ?? l.xp ?? 0,
        maxXp: 0, // bir sonraki seviyenin minXp'si olarak asagida doldurulacak
        image: l.vipBadgeImage ? `https://apievrymatrix5d84k321.com${l.vipBadgeImage}` : (l.image || null),
        headerImage: l.vipHeaderImage ? `https://apievrymatrix5d84k321.com${l.vipHeaderImage}` : null,
        dailyCashback: l.dailyCashback ?? 0,
        weeklyCashback: l.weeklyCashback ?? 0,
        monthlyCashback: l.monthlyCashback ?? 0,
        upgradeReward: l.upgradeReward ?? 0,
        withdrawLimit: l.withdrawLimit ?? 0,
        vipDay: l.vipDay || null,
        vipSupportInfo: l.vipSupportInfo || null,
      }));
      // maxXp = bir sonraki seviyenin minXp'si
      arr.forEach((l, i) => { l.maxXp = arr[i + 1]?.minXp ?? 0 });
      return { success: true, levels: arr };
    }
    
    return { success: false, error: response.error || 'VIP seviyeleri alinamadi' };
  },

  // GET /vip/current-level - Mevcut kullanici VIP seviyesi (Zorunlu auth)
  async getCurrentLevel(): Promise<{ success: boolean; level?: any; error?: string }> {
    const response = await apiClient.get<any>('/vip/current-level', true);
    
    if (response.success && response.data) {
      const raw = response.data.level || response.data.data || response.data;
      const level = {
        ...raw,
        _id: raw._id || raw.id || String(raw.level),
        id: raw._id || raw.id || String(raw.level),
        name: raw.levelName || raw.name || `Seviye ${raw.level}`,
        minXp: raw.requiredXp ?? raw.minXp ?? 0,
        image: raw.vipBadgeImage ? `https://apievrymatrix5d84k321.com${raw.vipBadgeImage}` : (raw.image || null),
        headerImage: raw.vipHeaderImage ? `https://apievrymatrix5d84k321.com${raw.vipHeaderImage}` : null,
        currentXp: raw.currentXp ?? raw.current_xp ?? raw.totalXp ?? raw.userXp ?? 0,
        nextLevelXp: raw.nextLevelXp ?? raw.next_level_xp ?? raw.requiredXp ?? 0,
        dailyCashback: raw.dailyCashback ?? 0,
        weeklyCashback: raw.weeklyCashback ?? 0,
        monthlyCashback: raw.monthlyCashback ?? 0,
        upgradeReward: raw.upgradeReward ?? 0,
        withdrawLimit: raw.withdrawLimit ?? 0,
        vipDay: raw.vipDay || null,
      };
      return { success: true, level };
    }
    
    return { success: false, error: response.error || 'VIP seviyesi alinamadi' };
  },

  // GET /vip/user-level/:userId - Kullanici VIP seviyesi (Public)
  async getUserLevel(userId: string): Promise<{ success: boolean; level?: any; error?: string }> {
    const response = await apiClient.get<{ success: boolean; level: any }>(`/vip/user-level/${userId}`);
    
    if (response.success && response.data) {
      return { success: true, level: response.data.level || response.data };
    }
    
    return { success: false, error: response.error || 'VIP seviyesi alinamadi' };
  },

  // POST /vip/claim-reward - VIP odulunu al (Zorunlu auth)
  async claimReward(rewardId?: string): Promise<{ success: boolean; amount?: number; newBalance?: number; error?: string }> {
    const body = rewardId ? { rewardId } : {}
    const response = await apiClient.post<{ success: boolean; amount: number; newBalance: number }>('/vip/claim-reward', body, true);
    
    if (response.success && response.data) {
      return { success: true, amount: response.data.amount, newBalance: response.data.newBalance };
    }
    
    return { success: false, error: response.error || 'Odul alinamadi' };
  },

  // GET /vip/rewards/:id - VIP odulleri (Public)
  async getRewards(levelId: string): Promise<{ success: boolean; rewards?: VipReward[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; rewards: VipReward[] }>(`/vip/rewards/${levelId}`);
    
    if (response.success && response.data) {
      return { success: true, rewards: response.data.rewards || response.data as any };
    }
    
    return { success: false, error: response.error || 'VIP odulleri alinamadi' };
  },
};

export default vipService;
