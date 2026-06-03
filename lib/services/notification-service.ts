// Notification Service - API calls for notifications
import apiClient from '../api-client';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface NotificationsResponse {
  success: boolean;
  notices?: Notification[];
  total?: number;
  unreadCount?: number;
}

export const notificationService = {
  // Get notifications for user
  async getNotifications(userId: string): Promise<{ success: boolean; notifications?: Notification[]; unreadCount?: number; error?: string }> {
    const response = await apiClient.get<NotificationsResponse>(`/notices/${userId}`, true);
    
    if (response.success && response.data) {
      return { 
        success: true, 
        notifications: response.data.notices,
        unreadCount: response.data.unreadCount 
      };
    }
    
    return { success: false, error: response.error || 'Failed to fetch notifications' };
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<{ success: boolean }>(`/notices/${notificationId}/read`, {}, true);
    
    if (response.success) {
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Failed to mark notification as read' };
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<{ success: boolean }>(`/notices/${userId}/read-all`, {}, true);
    
    if (response.success) {
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Failed to mark all notifications as read' };
  },

  // Get site settings (for announcements)
  async getSiteSettings(): Promise<{ success: boolean; settings?: Record<string, unknown>; error?: string }> {
    const response = await apiClient.get<{ success: boolean; settings: Record<string, unknown> }>('/site-settings');
    
    if (response.success && response.data) {
      return { success: true, settings: response.data.settings };
    }
    
    return { success: false, error: response.error || 'Failed to fetch site settings' };
  },
};

export default notificationService;
