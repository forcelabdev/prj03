// ============================================================
// TOKEN MANAGER
// localStorage'da auth_token ve auth_user saklar
// SSR safe — typeof window kontrolu var
// ============================================================

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface StoredUser {
  id: string
  identifier?: string
  numericId?: string
  username?: string
  email?: string
  phone?: string
  name?: string
  balance: number
  bonusBalance?: number
  totalBalance?: number
  xp?: number
  rank?: string
  coins?: number
  currency?: { code: string; symbol: string }
  [key: string]: any
}

export const tokenManager = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  },

  getUser(): StoredUser | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  },

  setUser(user: StoredUser): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(USER_KEY)
  },

  setAuth(token: string, user: StoredUser): void {
    this.setToken(token)
    this.setUser(user)
  },

  clearAuth(): void {
    this.removeToken()
    this.removeUser()
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  updateBalance(balance: number, bonusBalance?: number): void {
    const user = this.getUser()
    if (user) {
      user.balance = balance
      if (bonusBalance !== undefined) user.bonusBalance = bonusBalance
      this.setUser(user)
    }
  },
}

export default tokenManager
