// Auth Service - API calls for authentication
import apiClient from '../api-client';
import tokenManager, { StoredUser } from '../token-manager';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  phone?: string;
  countryCode?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  birthday?: string;
  birthDate?: string;
  fiatCurrency?: string;
  affiliate?: string;
  idNumber?: string;
  documentType?: string;
  address?: string;
  city?: string;
  country?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  emailConsent?: boolean;
  smsConsent?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  token?: string;
  userData?: {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
    role?: string;
  };
  user?: StoredUser;
}

export interface OtpChallengeResponse {
  success: true;
  step: 'otp';
  challengeId: string;
  methodType: string;
  maskedDestination: string;
  cooldownRemainingSeconds: number;
  expiresInSeconds: number;
  scope: string;
}

export interface UserResponse {
  success: boolean;
  user: {
    _id: string;
    username: string;
    email?: string;
    avatar?: string;
    balance: number;
    bonusBalance?: number;
    xp?: number;
    phone?: string;
    wallets?: Array<{
      currency: string;
      balance: number;
    }>;
    currency?: {
      code?: string;
      symbol?: string;
      fiatCurrency?: string;
      coinType?: string;
      type?: string;
      chain?: string;
      coins?: number;
    };
  };
}

export const authService = {
  // Login - POST /auth/credentials
  async login(credentials: LoginRequest): Promise<{ success: boolean; user?: StoredUser; error?: string }> {
    // email mi username mi olduğunu belirle — backend email, username veya phone kabul ediyor
    const trimmed = credentials.email?.trim() || ''
    const isEmail = trimmed.includes('@')
    const payload = isEmail
      ? { email: trimmed.toLowerCase(), password: credentials.password }
      : { username: trimmed, password: credentials.password }

    const response = await apiClient.post<LoginResponse>('/auth/credentials', payload);
    
    if (response.success && response.data) {
      const token = response.data.token;
      const userData = response.data.user;
      
      if (token && userData) {
        const user: StoredUser = {
          id: userData._id || userData.id,
          username: userData.username || '',
          email: userData.email,
          balance: userData.balance || 0,
        };
        
        tokenManager.setAuth(token, user);
        return { success: true, user };
      }
    }
    
    return { success: false, error: response.error || 'Login failed' };
  },

  // Register - POST /api/auth/register
  async register(data: RegisterRequest): Promise<{ success: boolean; user?: StoredUser; error?: string }> {
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data);
    
    if (response.success && response.data) {
      const token = response.data.accessToken;
      const userData = response.data.user;
      
      if (token && userData) {
        const user: StoredUser = {
          id: userData.id,
          username: userData.username || data.username,
          email: userData.email || data.email,
          balance: userData.balance || 0,
          bonusBalance: userData.bonusBalance,
        };
        
        tokenManager.setAuth(token, user);
        return { success: true, user };
      }
    }
    
    return { success: false, error: response.error || 'Registration failed' };
  },

  // Get current user - GET /auth/me
  async getMe(): Promise<{ success: boolean; user?: StoredUser; error?: string }> {
    const response = await apiClient.get<UserResponse>('/auth/me', true);
    
    if (response.success && response.data?.user) {
      const userData = response.data.user;
      const user: StoredUser = {
        id: userData._id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar,
        balance: userData.balance || 0,
        bonusBalance: userData.bonusBalance,
        xp: userData.xp,
        coins: userData.currency?.coins ?? 0,
        phone: userData.phone,
        currency: userData.currency,
      };
      
      tokenManager.setUser(user);
      return { success: true, user };
    }
    
    return { success: false, error: response.error || 'Failed to get user' };
  },

  // Logout
  logout(): void {
    tokenManager.removeToken();
  },

  // Get campaigns - GET /auth/campaigns
  async getCampaigns(): Promise<{ success: boolean; campaigns?: any[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; campaigns: any[] }>('/auth/campaigns');
    
    if (response.success && response.data) {
      return { success: true, campaigns: response.data.campaigns };
    }
    
    return { success: false, error: response.error || 'Failed to fetch campaigns' };
  },

  // Claim campaign - GET /auth/campaign/claim?id=<campaignId>
  async claimCampaign(campaignId: string): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    const response = await apiClient.get<{ success: boolean; newBalance: number }>(`/auth/campaign/claim?id=${campaignId}`, true);
    
    if (response.success && response.data) {
      return { success: true, newBalance: response.data.newBalance };
    }
    
    return { success: false, error: response.error || 'Failed to claim campaign' };
  },

  // Send OTP - POST /auth/mfa/send-otp
  async sendOtp(challengeId: string): Promise<{ success: boolean; data?: OtpChallengeResponse; error?: string }> {
    const response = await apiClient.post<OtpChallengeResponse>('/auth/mfa/send-otp', { challengeId });
    if (response.success && response.data) return { success: true, data: response.data };
    return { success: false, error: response.error || 'OTP gönderilemedi' };
  },

  // Resend OTP - POST /auth/mfa/resend-otp
  async resendOtp(challengeId: string): Promise<{ success: boolean; data?: OtpChallengeResponse; error?: string; cooldownRemainingSeconds?: number }> {
    const response = await apiClient.post<OtpChallengeResponse>('/auth/mfa/resend-otp', { challengeId });
    if (response.success && response.data) return { success: true, data: response.data };
    // 429 cooldown hatası
    const cooldown = response.metadata?.cooldownRemainingSeconds;
    return { success: false, error: response.error || 'OTP tekrar gönderilemedi', cooldownRemainingSeconds: cooldown };
  },

  // Validate OTP - POST /auth/mfa/validate-otp
  async validateOtp(challengeId: string, code: string): Promise<{ success: boolean; token?: string; user?: any; error?: string; errorCode?: string }> {
    const response = await apiClient.post<any>('/auth/mfa/validate-otp', { challengeId, code });
    if (response.success && response.data?.token) return { success: true, token: response.data.token, user: response.data.user };
    return { success: false, error: response.error || 'OTP doğrulanamadı', errorCode: response.code };
  },

  // Request password reset - POST /auth/credentials/request
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<any>('/auth/credentials/request', { email, type: 'reset' });
    if (response.success) return { success: true };
    return { success: false, error: response.error || 'Şifre sıfırlama maili gönderilemedi' };
  },

  // Reset password with token - POST /auth/credentials/reset
  async resetPassword(userId: string, token: string, password: string, captcha: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<any>('/auth/credentials/reset', { userId, token, password, captcha });
    if (response.success) return { success: true };
    return { success: false, error: response.error || 'Şifre sıfırlanamadı' };
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  },

  // Get stored user
  getStoredUser(): StoredUser | null {
    return tokenManager.getUser();
  },
};

export default authService;
