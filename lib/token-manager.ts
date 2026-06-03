// Token Manager for JWT authentication

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface StoredUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  phone?: string;
  balance: number;
  bonusBalance?: number;
  xp?: number;
  level?: number;
  currency?: {
    code: string;
    symbol: string;
  };
}

export const tokenManager = {
  // Token operations
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  // User operations
  getUser(): StoredUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user: StoredUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },

  // Combined operations
  setAuth(token: string, user: StoredUser): void {
    this.setToken(token);
    this.setUser(user);
  },

  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Update balance
  updateBalance(balance: number, bonusBalance?: number): void {
    const user = this.getUser();
    if (user) {
      user.balance = balance;
      if (bonusBalance !== undefined) {
        user.bonusBalance = bonusBalance;
      }
      this.setUser(user);
    }
  },
};

export default tokenManager;
