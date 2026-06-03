// Payment hooks
import { useState } from 'react'
import { paymentService, type WithdrawRequest, type Transaction } from '@/lib/services/payment-service'

export function useDeposit() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBankDeposit = async (amount: number, bankId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await paymentService.createBankDeposit(amount, bankId)
      if (result.success) {
        return { success: true, transferId: result.transferId }
      }
      setError(result.error || 'Para yatırma işlemi başarısız')
      return { success: false, error: result.error }
    } catch (err) {
      setError('Bir hata oluştu')
      return { success: false, error: 'Bir hata oluştu' }
    } finally {
      setIsLoading(false)
    }
  }

  const createPaparaDeposit = async (amount: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await paymentService.createPaparaDeposit(amount)
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl
        return { success: true }
      }
      setError(result.error || 'Papara işlemi başarısız')
      return { success: false, error: result.error }
    } catch (err) {
      setError('Bir hata oluştu')
      return { success: false, error: 'Bir hata oluştu' }
    } finally {
      setIsLoading(false)
    }
  }

  const createPayfixDeposit = async (amount: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await paymentService.createPayfixDeposit(amount)
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl
        return { success: true }
      }
      setError(result.error || 'Payfix işlemi başarısız')
      return { success: false, error: result.error }
    } catch (err) {
      setError('Bir hata oluştu')
      return { success: false, error: 'Bir hata oluştu' }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    createBankDeposit,
    createPaparaDeposit,
    createPayfixDeposit,
  }
}

export function useWithdraw() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createWithdrawal = async (data: WithdrawRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await paymentService.createWithdrawal(data)
      if (result.success) {
        return { success: true, transferId: result.transferId }
      }
      setError(result.error || 'Para çekme işlemi başarısız')
      return { success: false, error: result.error }
    } catch (err) {
      setError('Bir hata oluştu')
      return { success: false, error: 'Bir hata oluştu' }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    createWithdrawal,
  }
}

export function useTransactionHistory(userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!userId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await paymentService.getTransactionHistory(userId)
      if (result.success && result.transactions) {
        setTransactions(result.transactions)
      } else {
        setError(result.error || 'İşlem geçmişi alınamadı')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
  }
}
