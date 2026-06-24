// GalaxyPay Odeme Sistemi Service
// Tum deposit/withdraw istekleri /api/galaxypay route'undan gecip dogrudan https://galaxypay.dev'e gider
// application/x-www-form-urlencoded + SHA-512 hash — apiClient kullanilmaz
import apiClient from '../api-client'

export interface GalaxyPayMethodEntry {
  method: string
  type: string
  name: string
}

export interface GalaxyPayBank {
  id: number
  name: string
  mobileBankStatus: number
  paramStatus: number
  updatedAt?: string
}

export interface GalaxyPayMethods {
  available: boolean
  name: string
  logo: string
  currency: string
  lang: string
  minAmount: number
  maxAmount: number
  deposits: GalaxyPayMethodEntry[]
  withdrawals: GalaxyPayMethodEntry[]
  banks: GalaxyPayBank[]
}

export interface GalaxyPayDepositResponse {
  success: boolean
  transactionId?: string
  externalTransactionId?: string
  paymentId?: string
  method?: string
  status?: string
  amount?: number
  currency?: string
  paymentUrl?: string
  error?: string
  message?: string
}

export interface GalaxyPayWithdrawResponse {
  success: boolean
  transactionId?: string
  externalTransactionId?: string
  method?: string
  status?: string
  amount?: number
  currency?: string
  error?: string
  message?: string
}

export interface GalaxyPayStatusResponse {
  success: boolean
  data?: {
    transactionId: string
    externalTransactionId: string
    paymentId: string
    type: string
    method: string
    status: string
    amount: number
    currency: string
    paymentUrl?: string
    createdAt: string
    updatedAt: string
  }
  error?: string
}

const parseResponse = <T>(response: any): T & { success: boolean; error?: string } => {
  if (!response.success) {
    return {
      success: false,
      error: response.error || (response.data as any)?.message || (response.data as any)?.error || 'Istek basarisiz',
    } as any
  }
  const d = response.data as any
  // apiClient zaten data.data || data olarak normalize ediyor
  const payload = d?.data ?? d ?? {}
  return { success: true, ...payload, message: d?.message || payload.message } as any
}

export const galaxypayService = {
  // GET /payment/galaxypay/methods - Public
  async getMethods(): Promise<{ success: boolean; data?: GalaxyPayMethods; error?: string }> {
    const response = await apiClient.get<{ success: boolean; data: GalaxyPayMethods }>('/payment/galaxypay/methods')
    if (response.success) {
      const d = response.data as any
      const data = d?.data ?? d
      return { success: true, data }
    }
    return { success: false, error: response.error || 'GalaxyPay yontem bilgisi alinamadi' }
  },

  // POST https://galaxypay.dev/payment/deposit/{method}
  // /api/galaxypay route'u uzerinden — SHA-512 hash imzali, form-urlencoded
  async createDeposit(amount: number, method: string = 'bank-transfer'): Promise<GalaxyPayDepositResponse> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
      const res = await fetch('/api/galaxypay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type: 'deposit', method, amount }),
      })
      const d = await res.json()
      if (d.paymentUrl) return { success: true, paymentUrl: d.paymentUrl, externalTransactionId: d.externalTransactionId }
      if (d.success)    return { success: true, externalTransactionId: d.externalTransactionId, message: d.data?.message }
      return { success: false, error: d.error || d.data?.message || 'GalaxyPay yatirim baslatılamadi' }
    } catch (e: any) {
      return { success: false, error: e?.message || 'GalaxyPay baglanti hatasi' }
    }
  },

  // POST https://galaxypay.dev/payment/draw/bank-transfer
  // /api/galaxypay route'u uzerinden — SHA-512 hash imzali, form-urlencoded
  async createWithdraw(data: {
    amount: number
    method?: 'bank-transfer' | 'papara'
    iban?: string
    accountHolder?: string
    bankId?: string | number
    bankName?: string
    accountNumber?: string
    branchCode?: string
    tcno?: string
    paparaNumber?: string
  }): Promise<GalaxyPayWithdrawResponse> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''
      const res = await fetch('/api/galaxypay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: 'withdraw',
          method: data.method || 'bank-transfer',
          amount: data.amount,
          iban: data.iban,
          accountHolder: data.accountHolder,
          bankId: data.bankId,
          accountNumber: data.accountNumber || data.paparaNumber,
          branchCode: data.branchCode,
          tcno: data.tcno,
        }),
      })
      const d = await res.json()
      if (d.success) return { success: true, externalTransactionId: d.externalTransactionId, message: d.data?.message }
      return { success: false, error: d.error || d.data?.message || 'GalaxyPay cekim baslatılamadi' }
    } catch (e: any) {
      return { success: false, error: e?.message || 'GalaxyPay baglanti hatasi' }
    }
  },

  // GET /payment/galaxypay/status/:id
  async getStatus(transactionId: string): Promise<GalaxyPayStatusResponse> {
    const response = await apiClient.get<GalaxyPayStatusResponse>(`/payment/galaxypay/status/${transactionId}`, true)
    if (response.success && response.data) {
      return { success: true, ...(response.data as any) }
    }
    return { success: false, error: response.error || 'Durum alinamadi' }
  },
}
