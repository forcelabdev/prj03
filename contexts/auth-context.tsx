"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { apiClient } from "@/lib/api-client"
import { tokenManager } from "@/lib/token-manager"
import type { RegisterRequest } from "@/lib/services/auth-service"

interface User {
  id: string
  identifier?: string // Backend API icin kullanici kimlik bilgisi
  numericId?: string | number // Drakon API icin numeric kullanici id
  email: string
  name?: string
  username?: string
  phone?: string
  mfaEnabled?: boolean
  avatar?: string
  rank?: string
  xp?: number
  coins?: number
  balance: number
  bonusBalance?: number
  totalBalance?: number
  currency?: {
    symbol: string
    code: string
  }
  stats?: {
    bet: number
    won: number
    deposit: number
    withdraw: number
  }
  rakeback?: {
    earned: number
    available: number
  }
}

export interface OtpChallenge {
  challengeId: string
  methodType: string
  maskedDestination: string
  cooldownRemainingSeconds: number
  expiresInSeconds: number
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; otpRequired?: boolean; otpChallenge?: OtpChallenge }>
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  updateBalance: (balance: number, bonusBalance?: number) => void
  showWelcomeModal: boolean
  setShowWelcomeModal: (show: boolean) => void
  completeOtpLogin: (challengeId: string, code: string) => Promise<{ success: boolean; error?: string; errorCode?: string }>
  resendOtp: (challengeId: string) => Promise<{ success: boolean; error?: string; cooldownRemainingSeconds?: number; challenge?: OtpChallenge }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)


  // Kullanıcı verisini parse edip state'e set et (login ve OTP validate için ortak)
  const applyUserSession = useCallback((token: string, u: any, identifierEmail?: string, showWelcome = true) => {
    tokenManager.setToken(token)
    let balance = 0
    let bonusBalance = 0
    if (u.wallets && Array.isArray(u.wallets) && u.wallets.length > 0) {
      const rivoWallet = u.wallets.find((w: any) => ['Rivo','rivo','RIVO'].includes(w.coinType))
      const mainWallet = rivoWallet || u.wallets[0]
      balance = Number(mainWallet?.balance ?? 0)
    } else if (typeof u.balance === 'object' && u.balance !== null && Object.keys(u.balance).length > 0) {
      const b = u.balance as Record<string, number>
      balance = b.rivo || b.Rivo || b.RIVO || b.TRY || b.USD || Object.values(b)[0] || 0
    } else if (typeof u.balance === 'number') {
      balance = u.balance
    }
    bonusBalance = u.bonusBalance || 0
    const userData: User = {
      id: u._id || u.id || "",
      identifier: u.identifier || u._id || u.id || "",
      numericId: u.numericId ?? u.numeric_id ?? undefined,
      email: u.local?.email || u.email || identifierEmail || "",
      name: u.name || u.fullName || u.full_name || undefined,
      username: u.username || "",
      avatar: u.avatar,
      rank: u.rank,
      xp: u.xp || 0,
      coins: u.currency?.coins ?? u.coins ?? 0,
      balance,
      bonusBalance,
      totalBalance: balance + bonusBalance,
      currency: u.currency || { symbol: "TL", code: "TRY" },
      stats: u.stats,
      rakeback: u.rakeback,
    }
    setUser(userData)
    tokenManager.setUser(userData)
    setIsLoggedIn(true)
    if (showWelcome) setShowWelcomeModal(true)
  }, [])

  // Login - POST /auth/credentials
  const login = useCallback(
    async (identifier: string, password: string): Promise<{ success: boolean; error?: string; otpRequired?: boolean; otpChallenge?: OtpChallenge }> => {
      setIsLoading(true)
      try {
        const isEmail = identifier.includes("@")
        const response = await apiClient.post("/auth/credentials", {
          identifier,
          email: isEmail ? identifier : undefined,
          username: !isEmail ? identifier : undefined,
          password,
        })

        // apiClient tüm backend response'unu response.data altına koyuyor
        const d = (response.data as any) ?? {}

        // MFA aktif — OTP challenge açıldı
        // Token varsa temizle — OTP doğrulanmadan session açılmasın
        if (response.success && d.step === "otp" && d.challengeId) {
          tokenManager.removeToken()
          return {
            success: true,
            otpRequired: true,
            otpChallenge: {
              challengeId: d.challengeId,
              methodType: d.methodType,
              maskedDestination: d.maskedDestination,
              cooldownRemainingSeconds: d.cooldownRemainingSeconds ?? 60,
              expiresInSeconds: d.expiresInSeconds ?? 300,
            },
          }
        }

        // Normal login — token geldi
        const token = response.token || d.token
        const user = response.user || d.user
        if (response.success && token && user) {
          applyUserSession(token, user, identifier)
          // Login response'unda wallets boş gelebilir — /auth/me ile doğru balance'ı hemen çek
          refreshUser()
          return { success: true }
        }

        return { success: false, error: response.error || d.message || "Giriş başarısız" }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Giriş hatası" }
      } finally {
        setIsLoading(false)
      }
    },
    [applyUserSession]
  )

  // OTP doğrula ve oturumu tamamla
  const completeOtpLogin = useCallback(
    async (challengeId: string, code: string): Promise<{ success: boolean; error?: string; errorCode?: string }> => {
      setIsLoading(true)
      try {
        const response = await apiClient.post("/auth/mfa/validate-otp", { challengeId, code })
        const d = (response.data as any) ?? {}
        const token = response.token || d.token
        const user = response.user || d.user

        if (!response.success) {
          const errorCode = d.code || d.errorCode
          return { success: false, error: response.error || d.message || "Kod doğrulanamadı", errorCode }
        }

        // Token + user birlikte geldi
        if (token && user) {
          tokenManager.setToken(token)
          applyUserSession(token, user, undefined, false)
          // OTP response'unda wallets boş gelebilir — /auth/me ile doğru balance'ı hemen çek
          refreshUser()
          return { success: true }
        }

        // Sadece token geldi — /auth/me ile kullanıcıyı çek (wallets dahil)
        if (token) {
          tokenManager.setToken(token)
          await refreshUser()
          return { success: true }
        }

        // Token yok — session cookie ile çalışıyor, /auth/me çek
        if (response.success) {
          const meRes = await apiClient.get("/auth/me", true)
          const meData = (meRes.data as any) ?? {}
          const meToken = meRes.token || meData.token || ""
          const meUser = meRes.user || meData.user || meData
          if (meToken) tokenManager.setToken(meToken)
          if (meUser && (meToken || meData.id || meData._id)) {
            applyUserSession(meToken, meUser, undefined, false)
          } else {
            setIsLoggedIn(true)
          }
          return { success: true }
        }

        return { success: false, error: "Doğrulama başarısız" }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Doğrulama hatası" }
      } finally {
        setIsLoading(false)
      }
    },
    [applyUserSession]
  )

  // OTP yeniden gönder
  const resendOtp = useCallback(
    async (challengeId: string): Promise<{ success: boolean; error?: string; cooldownRemainingSeconds?: number; challenge?: OtpChallenge }> => {
      try {
        const response = await apiClient.post("/auth/mfa/resend-otp", { challengeId })
        const d = (response.data as any) ?? {}
        if (response.success) {
          return {
            success: true,
            challenge: {
              challengeId: d.challengeId ?? challengeId,
              methodType: d.methodType,
              maskedDestination: d.maskedDestination,
              cooldownRemainingSeconds: d.cooldownRemainingSeconds ?? 60,
              expiresInSeconds: d.expiresInSeconds ?? 300,
            },
          }
        }
        return {
          success: false,
          error: response.error || d.message || "Tekrar gönderilemedi",
          cooldownRemainingSeconds: d.metadata?.cooldownRemainingSeconds,
        }
      } catch (error) {
        return { success: false, error: "Tekrar gönderme hatası" }
      }
    },
    []
  )

  // Register - POST /auth/credentials/register
  const register = useCallback(
    async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true)
      try {
        // birthday: API YYYY-MM-DD formatı istiyor
        const birthdayRaw = (data.birthDate || "").trim()
        const birthdayFormatted = /^\d{4}-\d{2}-\d{2}$/.test(birthdayRaw) ? birthdayRaw : undefined

        const payload: Record<string, any> = {
          email: data.email || undefined,
          username: data.username || undefined,
          password: data.password,
          phone: data.phone ? `${data.countryCode || "+90"}${data.phone}` : undefined,
          name: [data.firstName, data.lastName].filter(Boolean).join(" ") || undefined,
          birthday: birthdayFormatted,
          fiatCurrency: "TRY",
          affiliate: data.affiliate || undefined,
        }
        // Bos ve undefined alanlari payload'dan cikar
        Object.keys(payload).forEach(k => {
          if (payload[k] === undefined || payload[k] === "") delete payload[k]
        })

        const response = await apiClient.post("/auth/credentials/register", payload)

        if (response.success && response.token && response.user) {
          applyUserSession(response.token, response.user, data.email)
          return { success: true }
        }

        // Backend kayıt tamamlanıyor ama processUserAvatar hatası ile 500 dönüyor.
        // Bu durumda kayıt başarılı sayıp login ile token alalım.
        const rawError: string = response.error || ""
        const isKnownBackendBug = rawError.includes("processUserAvatar") || rawError.includes("is not defined")
        if (isKnownBackendBug) {
          try {
            const identifier = data.username || data.email || ""
            const isEmail = identifier.includes("@")
            const loginResponse = await apiClient.post("/auth/credentials", {
              identifier,
              email: isEmail ? identifier : undefined,
              username: !isEmail ? identifier : undefined,
              password: data.password,
            })
            const ld = (loginResponse.data as any) ?? {}

            // OTP gerektiriyorsa — kayıt başarılı, kullanıcı login sayfasından giriş yapmalı
            if (loginResponse.success && ld.step === "otp") {
              return { success: true }
            }

            const lToken = loginResponse.token || ld.token
            const lUser = loginResponse.user || ld.user

            if (lToken && lUser) {
              applyUserSession(lToken, lUser, data.email)
              return { success: true }
            }

            // Token/user yoksa /auth/me ile dene
            if (lToken) {
              tokenManager.setToken(lToken)
              const meRes = await apiClient.get("/auth/me", true)
              const meData = (meRes.data as any) ?? {}
              const meUser = meRes.user || meData.user || meData
              if (meUser) applyUserSession(lToken, meUser, data.email)
              return { success: true }
            }
          } catch {
            // login başarısız — kayıt tamam, kullanıcı manuel giriş yapabilir
          }
          return { success: true }
        }

        return { success: false, error: rawError || "Kayıt başarısız" }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Kayıt hatası" }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    tokenManager.removeToken()
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  // Refresh User - GET /auth/me
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/me", true)

      if (response.success && response.user) {
        const u = response.user

        // Mevcut user'dan onceki balance'i koru (API wallets bos donebilir)
        const existingUser = tokenManager.getUser()
        const existingBalance = existingUser?.balance ?? 0
        const existingBonusBalance = existingUser?.bonusBalance ?? 0

        // Bakiye bilgisini wallets array'inden veya balance object'inden al
        let balance = 0
        let bonusBalance = 0

        // Wallets array kontrol - RIVO oncelikli
        if (u.wallets && Array.isArray(u.wallets) && u.wallets.length > 0) {
          const rivoWallet = u.wallets.find((w: any) =>
            w.coinType === 'Rivo' || w.coinType === 'rivo' || w.coinType === 'RIVO'
          )
          const mainWallet = rivoWallet || u.wallets[0]
          balance = Number(mainWallet?.balance ?? 0)
        }
        // Balance object kontrol
        else if (typeof u.balance === 'object' && u.balance !== null) {
          const balanceObj = u.balance as Record<string, number>
          const keys = Object.keys(balanceObj)
          balance = balanceObj.rivo ?? balanceObj.Rivo ?? balanceObj.RIVO ?? balanceObj.TRY ?? balanceObj.USD ?? (keys.length > 0 ? balanceObj[keys[0]] : 0) ?? 0
        }
        // Direkt number
        else if (typeof u.balance === 'number') {
          balance = u.balance
        }

        // Backend'den gelen bakiye değerine güven — 0 da geçerli bir değer
        // Sadece wallets tamamen boş VE balance field yok ise mevcut bakiyeyi koru
        const hasWallets = u.wallets && Array.isArray(u.wallets) && u.wallets.length > 0
        const hasBalanceField = typeof u.balance === 'number' || (typeof u.balance === 'object' && u.balance !== null)
        if (!hasWallets && !hasBalanceField && existingBalance > 0) {
          balance = existingBalance
        }

        bonusBalance = Number(u.bonusBalance ?? 0)
        // bonusBalance için de aynı mantık: sadece field yoksa mevcut değeri koru
        if (u.bonusBalance === undefined && existingBonusBalance > 0) {
          bonusBalance = existingBonusBalance
        }

        const userData: User = {
          id: u._id || u.id || "",
          identifier: u.identifier || u._id || u.id || "",
          numericId: u.numericId ?? u.numeric_id ?? undefined,
          email: u.local?.email || u.email || "",
          name: u.name || u.fullName || u.full_name || undefined,
          username: u.username,
          phone: (() => {
            const raw = u.phone || u.local?.phone || u.gsm || u.mobile || u.local?.gsm || u.local?.mobile
            if (!raw) return undefined
            // Backend bazen countryCode ayrı döndürür (login ile aynı mantık)
            if (u.countryCode && !raw.startsWith(u.countryCode)) return `${u.countryCode}${raw}`
            return raw
          })(),
          mfaEnabled: u.mfa?.enabled ?? u.mfaEnabled ?? false,
          avatar: u.avatar,
          rank: u.rank,
          xp: u.xp || 0,
          coins: u.currency?.coins ?? u.coins ?? 0,
          balance: balance,
          bonusBalance: bonusBalance,
          totalBalance: balance + bonusBalance,
          currency: u.currency || { symbol: "TL", code: "TRY" },
          stats: u.stats,
          rakeback: u.rakeback,
        }
        setUser(userData)
        setIsLoggedIn(true)
        tokenManager.setUser(userData)
      } else {
        // Sadece gerçek 401 gelince logout yap — geçici hata veya boş response mevcut session'ı bozmamalı
        const statusCode = (response as any)?.statusCode || (response as any)?.status
        if (statusCode === 401) {
          tokenManager.removeToken()
          setUser(null)
          setIsLoggedIn(false)
        }
        // Diğer durumlarda (500, network hatası, boş response) mevcut session'ı koru
      }
    } catch {
      // Network hatası veya backend erişilemiyor — token'ı silme, session'ı koru
    }
  }, [])

  // initAuth - refreshUser tanimlandiktan sonra cagrilir
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getToken()
      if (token) {
        await refreshUser()
      }
    }
    initAuth()
  }, [])

  const updateBalance = useCallback((balance: number, bonusBalance?: number) => {
    setUser((prev) => {
      if (!prev) return null
      const newBonusBalance = bonusBalance ?? prev.bonusBalance ?? 0
      return {
        ...prev,
        balance,
        bonusBalance: newBonusBalance,
        totalBalance: balance + newBonusBalance,
      }
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateBalance,
        showWelcomeModal,
        setShowWelcomeModal,
        completeOtpLogin,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
