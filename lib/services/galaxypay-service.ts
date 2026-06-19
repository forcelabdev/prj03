// GalaxyPay Odeme Sistemi Service
// Dokumana gore: GET /payment/galaxypay/methods, POST /payment/galaxypay/deposit,
// POST /payment/galaxypay/withdraw, GET /payment/galaxypay/status/:id
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

export const galaxypayService = {
  // GET /payment/galaxypay/methods - Public
  // Aktif durum, limitler, deposit/withdraw yontemleri ve banka listesini doner
  async getMethods(): Promise<{ success: boolean; data?: GalaxyPayMethods; error?: string }> {
    const response = await apiClient.get<{ success: boolean; data: GalaxyPayMethods }>('/payment/galaxypay/methods')
    if (response.success && response.data?.data) {
      return { success: true, data: response.data.data }
    }
    return { success: false, error: response.error || 'GalaxyPay yontem bilgisi alinamadi' }
  },

  // POST /payment/galaxypay/deposit - Zorunlu auth
  // method: "lobby" | "bank-transfer" | "papara"
  // bank-transfer ek alanlar: accountHolder, iban, bankName, accountNumber, branchCode, tcno?
  // papara ek alanlar: paparaNumber
  async createDeposit(
    amount: number,
    method: string,
    extra?: {
      accountHolder?: string
      iban?: string
      bankName?: string
      accountNumber?: string
      branchCode?: string
      tcno?: string
      paparaNumber?: string
    }
  ): Promise<GalaxyPayDepositResponse> {
    // undefined alanlari temizle, method'u sabitle
    const body: Record<string, unknown> = { amount, method }
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v !== undefined && v !== null && v !== '') body[k] = v
      }
    }
    const response = await apiClient.post<{ success: boolean; message: string; data: GalaxyPayDepositResponse }>(
      '/payment/galaxypay/deposit',
      body,
      true
    )
    if (response.success && response.data?.data) {
      return { success: true, ...response.data.data, message: response.data.message }
    }
    // Backend bazi durumlarda data altinda degil direkt donebilir
    if (response.success && response.data) {
      const d = response.data as any
      if (d.transactionId || d.paymentUrl) {
        return { success: true, ...d }
      }
    }
    return {
      success: false,
      error: response.error || (response.data as any)?.message || 'GalaxyPay yatirim talebi olusturulamadi',
    }
  },

  // POST /payment/galaxypay/withdraw - Zorunlu auth
  // Bank transfer: { amount, method: "bank-transfer", accountHolder, iban, bankId, accountNumber, branchCode, tcno? }
  // Papara: { amount, method: "papara", accountNumber, accountHolder? }
  async createWithdraw(data: {
    amount: number
    method: 'bank-transfer' | 'papara'
    accountHolder?: string
    iban?: string
    bankId?: string
    bankName?: string
    accountNumber?: string
    branchCode?: string
    tcno?: string
    paparaNumber?: string
  }): Promise<GalaxyPayWithdrawResponse> {
    const response = await apiClient.post<{ success: boolean; message: string; data: GalaxyPayWithdrawResponse }>(
      '/payment/galaxypay/withdraw',
      data,
      true
    )
    if (response.success && response.data?.data) {
      return { success: true, ...response.data.data, message: response.data.message }
    }
    if (response.success) {
      return { success: true, message: (response.data as any)?.message || 'Cekim talebi olusturuldu. Admin onayi bekleniyor.' }
    }
    return {
      success: false,
      error: response.error || (response.data as any)?.message || 'GalaxyPay cekim talebi olusturulamadi',
    }
  },

  // GET /payment/galaxypay/status/:id - Zorunlu auth
  async getStatus(transactionId: string): Promise<GalaxyPayStatusResponse> {
    const response = await apiClient.get<GalaxyPayStatusResponse>(`/payment/galaxypay/status/${transactionId}`, true)
    if (response.success && response.data) {
      return { success: true, ...(response.data as any) }
    }
    return { success: false, error: response.error || 'Durum alinamadi' }
  },
}
