// GalaxyPay Odeme Sistemi Service
// Backend: POST /payment/galaxypay/deposit  → { amount, method }  (backend profil'den ek alanlari alir)
// Backend: POST /payment/galaxypay/withdraw → bank-transfer icin { amount, method, iban, accountHolder, bankId, accountNumber, branchCode, tcno }
// Backend: GET  /payment/galaxypay/methods  → banka listesi dahil method bilgileri
// Backend: GET  /payment/galaxypay/status/:id
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

  // POST /payment/deposit/{method}
  // Backend method'u path'e koyuyor: /payment/deposit/lobby, /payment/deposit/bank-transfer, /payment/deposit/papara
  // method: "lobby" | "bank-transfer" | "papara"
  async createDeposit(amount: number, method: string): Promise<GalaxyPayDepositResponse> {
    const response = await apiClient.post<any>(
      `/payment/deposit/${method}`,
      { amount },
      true
    )
    return parseResponse<GalaxyPayDepositResponse>(response)
  },

  // POST /payment/galaxypay/withdraw
  // bank-transfer: iban, accountHolder, bankId (zorunlu), accountNumber (zorunlu), branchCode (zorunlu), tcno (zorunlu)
  // papara: accountNumber (paparaNumber), accountHolder?
  async createWithdraw(data: {
    amount: number
    method: 'bank-transfer' | 'papara'
    // bank-transfer alanlari
    iban?: string
    accountHolder?: string
    bankId?: string
    bankName?: string
    accountNumber?: string
    branchCode?: string
    tcno?: string
    // papara alanlari
    paparaNumber?: string
  }): Promise<GalaxyPayWithdrawResponse> {
    // Backend papara icin accountNumber bekliyor, paparaNumber alias'ini normalize et
    const body: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== null && v !== '') {
        if (k === 'paparaNumber') {
          body['accountNumber'] = v // papara icin backend accountNumber bekliyor
        } else {
          body[k] = v
        }
      }
    }
    // Backend: POST /payment/withdraw/{method}
    const method = (body.method as string) || 'bank-transfer'
    const response = await apiClient.post<any>(`/payment/withdraw/${method}`, body, true)
    return parseResponse<GalaxyPayWithdrawResponse>(response)
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
