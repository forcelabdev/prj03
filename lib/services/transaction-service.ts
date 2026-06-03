import { apiClient } from "@/lib/api-client"

export interface Transaction {
  _id: string
  amount: number
  title: string
  type: "deposit" | "withdraw" | "bonus" | "manual"
  status: "approved" | "pending" | "rejected" | "cancelled"
  method?: string
  createdAt: string
}

export interface TransactionHistoryResponse {
  success: boolean
  transactions: Transaction[]
  error?: string
}

export const transactionService = {
  async getHistory(userId: string): Promise<TransactionHistoryResponse> {
    const response = await apiClient.get<{ transactions: Transaction[] }>(
      `/transaction-history/${userId}`,
      true
    )
    if (response.success && response.data) {
      return { success: true, transactions: response.data.transactions || [] }
    }
    return { success: false, transactions: [], error: response.error || "İşlem geçmişi alınamadı" }
  },

  async getBonusHistory(userId: string): Promise<TransactionHistoryResponse> {
    const response = await apiClient.get<{ transactions: Transaction[] }>(
      `/bonus-history/${userId}`,
      true
    )
    if (response.success && response.data) {
      return { success: true, transactions: response.data.transactions || [] }
    }
    return { success: false, transactions: [], error: response.error || "Bonus geçmişi alınamadı" }
  },
}
