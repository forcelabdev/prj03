// Site Service - Backend API dokumantasyonuna gore
import apiClient from '../api-client';

export interface SiteSettings {
  logo?: string;
  favicon?: string;
  maintenanceMode?: boolean;
  socialLinks?: {
    telegram?: string;
    instagram?: string;
    twitter?: string;
    discord?: string;
  };
  sportsbookProvider?: string;
  footer?: any;
  seo?: any;
}

export interface Banner {
  _id: string;
  title?: string;
  image: string;
  link?: string;
  position?: string;
  order?: number;
}

export interface News {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  createdAt: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

export const siteService = {
  // GET / - Health check (Public)
  async healthCheck(): Promise<{ success: boolean }> {
    const response = await apiClient.get<{ success: boolean }>('/');
    return { success: response.success };
  },

  // GET /site-settings - Site bootstrap verisi (Public)
  async getSettings(): Promise<{ success: boolean; settings?: SiteSettings; error?: string }> {
    const response = await apiClient.get<SiteSettings>('/site-settings');
    
    if (response.success && response.data) {
      return { success: true, settings: response.data };
    }
    
    return { success: false, error: response.error || 'Site ayarlari alinamadi' };
  },

  // GET /settings/social - Sosyal medya linkleri (Public)
  async getSocialLinks(): Promise<{ success: boolean; social?: any; error?: string }> {
    const response = await apiClient.get<{ success: boolean; social: any }>('/settings/social');
    
    if (response.success && response.data) {
      return { success: true, social: response.data.social || response.data };
    }
    
    return { success: false, error: response.error || 'Sosyal linkler alinamadi' };
  },

  // GET /settings - Auth ayarlari (googleClientId vs) (Public)
  async getAuthSettings(): Promise<{ success: boolean; googleClientId?: string; error?: string }> {
    const response = await apiClient.get<{ success: boolean; googleClientId: string }>('/settings');
    
    if (response.success && response.data) {
      return { success: true, googleClientId: response.data.googleClientId };
    }
    
    return { success: false, error: response.error || 'Auth ayarlari alinamadi' };
  },

  // GET /public/banners - Tum bannerlar (Public)
  async getBanners(): Promise<{ success: boolean; banners?: Banner[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; banners: Banner[] }>('/public/banners');
    
    if (response.success && response.data) {
      return { success: true, banners: response.data.banners || response.data as any };
    }
    
    return { success: false, error: response.error || 'Bannerlar alinamadi' };
  },

  // GET /public/banners/:position - Pozisyona gore bannerlar (Public)
  async getBannersByPosition(position: string): Promise<{ success: boolean; banners?: Banner[]; error?: string }> {
    const response = await apiClient.get<any>(`/public/banners/${position}`);
    
    if (response.success && response.data) {
      // API farkli formatlarda donebilir: { banners: [] } veya { data: [] } veya direkt []
      const data = response.data;
      const banners = data.banners || data.data || data.items || (Array.isArray(data) ? data : null);
      if (banners && banners.length > 0) {
        return { success: true, banners };
      }
    }
    
    return { success: false, error: response.error || 'Bannerlar alinamadi' };
  },

  // GET /news - Haberler (Public)
  async getNews(): Promise<{ success: boolean; news?: News[]; error?: string }> {
    const response = await apiClient.get<News[]>('/news');
    
    if (response.success && response.data) {
      return { success: true, news: response.data as any };
    }
    
    return { success: false, error: response.error || 'Haberler alinamadi' };
  },

  // GET /notices/:userId - Bildirimler (Public)
  async getNotices(userId: string): Promise<{ success: boolean; notices?: Notice[]; error?: string }> {
    const response = await apiClient.get<any>(`/notices/${userId}`);
    
    if (response.success) {
      const raw = response.data
      const notices = raw?.notices || raw?.data || (Array.isArray(raw) ? raw : [])
      return { success: true, notices };
    }
    
    return { success: false, error: response.error || 'Bildirimler alinamadi' };
  },

  // PUT /notices/:id/read - Bildirimi okundu isaretle
  async markNoticeAsRead(noticeId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.put(`/notices/${noticeId}/read`, {}, true);
    return { success: response.success, error: response.error };
  },

  // DELETE /notices/:id - Bildirimi sil
  async deleteNotice(noticeId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.delete(`/notices/${noticeId}`, true);
    return { success: response.success, error: response.error };
  },

  // PUT /notices/read-all/:userId - Tüm bildirimleri okundu işaretle
  async markAllNoticesAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.put(`/notices/read-all/${userId}`, {}, true);
    return { success: response.success, error: response.error };
  },

  // DELETE /notices/all/:userId - Tüm bildirimleri sil
  async deleteAllNotices(userId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.delete(`/notices/all/${userId}`, true);
    return { success: response.success, error: response.error };
  },

  // GET /customerservices - Musteri hizmetleri (Public)
  async getCustomerServices(): Promise<{ success: boolean; services?: any[]; error?: string }> {
    const response = await apiClient.get<any[]>('/customerservices');
    
    if (response.success && response.data) {
      return { success: true, services: response.data as any };
    }
    
    return { success: false, error: response.error || 'Musteri hizmetleri alinamadi' };
  },

  // GET /avatar - Avatar listesi (Public)
  async getAvatars(): Promise<{ success: boolean; avatars?: string[]; error?: string }> {
    const response = await apiClient.get<string[]>('/avatar');
    
    if (response.success && response.data) {
      return { success: true, avatars: response.data as any };
    }
    
    return { success: false, error: response.error || 'Avatarlar alinamadi' };
  },

  // GET /avatar/random - Rastgele avatar (Public)
  async getRandomAvatar(): Promise<{ success: boolean; avatar?: string; error?: string }> {
    const response = await apiClient.get<{ avatar: string }>('/avatar/random');
    
    if (response.success && response.data) {
      return { success: true, avatar: response.data.avatar || response.data as any };
    }
    
    return { success: false, error: response.error || 'Avatar alinamadi' };
  },

  // GET /notifications - Bildirimleri getir
  async getNotifications(page: number = 1): Promise<{ success: boolean; notifications?: any[]; error?: string }> {
    const response = await apiClient.get<{ notifications: any[] }>(`/auth/notifications?page=${page}`, true);
    
    if (response.success && response.data) {
      return { success: true, notifications: response.data.notifications || response.data as any };
    }
    
    return { success: false, error: response.error || 'Bildirimler alinamadi' };
  },

  // PUT /notifications/:id/read - Bildirimi okundu olarak isaretle
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.put(`/auth/notifications/${notificationId}/read`, {}, true);
    return { success: response.success, error: response.error };
  },

  // GET /custom.html - Custom HTML (canli destek vs.) (Public)
  async getCustomHtml(): Promise<{ success: boolean; html?: string; error?: string }> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/proxy/custom.html`);
      if (res.ok) {
        const html = await res.text();
        return { success: true, html };
      }
      return { success: false, error: 'Custom HTML alinamadi' };
    } catch {
      return { success: false, error: 'Custom HTML alinamadi' };
    }
  },

  // DELETE /notifications/:id - Bildirimi sil
  async deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.delete(`/auth/notifications/${notificationId}`, true);
    return { success: response.success, error: response.error };
  },
};

export default siteService;
