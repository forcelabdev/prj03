// MeelDev Bank Transfer API Service
import apiClient from '../api-client'

export interface MeelDevMethod {
  active: boolean
  minAmount: number
  maxAmount: number
  banks: MeelDevBank[]
}

export interface MeelDevBank {
  bankName: string
  iban?: string
  accountHolder?: string
}

export interface MeelDevDepositResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  account?: {
    bankName: string
    accountHolder: string
    iban: string
    minAmount: number
    maxAmount: number
  }
  accountInfo?: {
    bankName: string
    accountHolder: string
    iban: string
    minAmount: number
    maxAmount: number
  }
  error?: string
  message?: string
}

export interface MeelDevStatusResponse {
  success: boolean
  status?: 'pending' | 'processing' | 'approved' | 'rejected'
  message?: string
  error?: string
}

export interface MeelDevWithdrawResponse {
  success: boolean
  transactionId?: string
  message?: string
  error?: string
}

export const meeldevService = {
  // GET /payment/meeldev/methods - MeelDev yöntem bilgilerini çek
  async getMethods(): Promise<{ success: boolean; method?: MeelDevMethod; error?: string }> {
    const response = await apiClient.get<{ success: boolean; data?: MeelDevMethod }>('/payment/meeldev/methods', true)
    if (response.success && response.data) {
      return { success: true, method: response.data }
    }
    return { success: false, error: response.error || 'Yöntem bilgisi alınamadı' }
  },

  // POST /payment/meeldev/deposit - Yatırım talebi oluştur
  // directAccount: 0 = link akışı, 1 = IBAN akışı
  async createDeposit(amount: number, directAccount: 0 | 1, customerName?: string): Promise<MeelDevDepositResponse> {
    const payload: Record<string, unknown> = { amount, directAccount }
    if (customerName) payload.customerName = customerName
    const response = await apiClient.post<MeelDevDepositResponse>('/payment/meeldev/deposit', payload, true)
    if (response.success && response.data) {
      return { success: true, ...response.data }
    }
    return { success: false, error: response.error || response.data?.error || 'Yatırım talebi oluşturulamadı' }
  },

  // GET /payment/meeldev/status/:id - İşlem durumunu sorgula
  async getStatus(transactionId: string): Promise<MeelDevStatusResponse> {
    const response = await apiClient.get<MeelDevStatusResponse>(`/payment/meeldev/status/${transactionId}`, true)
    if (response.success && response.data) {
      return { success: true, ...response.data }
    }
    return { success: false, error: response.error || 'Durum alınamadı' }
  },

  // POST /payment/meeldev/withdraw - Çekim talebi oluştur
  async createWithdraw(data: {
    amount: number
    iban: string
    accountHolder: string
    bankName: string
  }): Promise<MeelDevWithdrawResponse> {
    const response = await apiClient.post<MeelDevWithdrawResponse>('/payment/meeldev/withdraw', data, true)
    if (response.success && response.data) {
      return { success: true, ...response.data }
    }
    return { success: false, error: response.error || response.data?.error || 'Çekim talebi oluşturulamadı' }
  },
}
