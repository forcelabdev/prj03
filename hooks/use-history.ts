// History hooks for game and transaction history
import useSWR from 'swr'
import { historyService, type GameHistoryItem, type RecentWinner } from '@/lib/services/history-service'
import { paymentService, type Transaction } from '@/lib/services/payment-service'

// Fetcher functions
const fetchGameHistory = async (userId: string) => {
  const result = await historyService.getGameHistory(userId)
  if (result.success && result.history) {
    return result.history
  }
  throw new Error(result.error || 'Failed to fetch game history')
}

const fetchRecentWinners = async () => {
  const result = await historyService.getRecentBigWins()
  if (result.success && result.winners) {
    return result.winners
  }
  throw new Error(result.error || 'Failed to fetch recent winners')
}

const fetchTransactionHistory = async (userId: string) => {
  const result = await paymentService.getTransactionHistory(userId)
  if (result.success && result.transactions) {
    return result.transactions
  }
  throw new Error(result.error || 'Failed to fetch transaction history')
}

// Hooks
export function useGameHistory(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<GameHistoryItem[]>(
    userId ? `game-history-${userId}` : null,
    () => userId ? fetchGameHistory(userId) : Promise.resolve([]),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    history: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useRecentWinners() {
  const { data, error, isLoading, mutate } = useSWR<RecentWinner[]>(
    'recent-winners',
    fetchRecentWinners,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  return {
    winners: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useTransactionHistory(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Transaction[]>(
    userId ? `transaction-history-${userId}` : null,
    () => userId ? fetchTransactionHistory(userId) : Promise.resolve([]),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const deposits = data?.filter(t => t.type === 'deposit') || []
  const withdrawals = data?.filter(t => t.type === 'withdraw') || []

  return {
    transactions: data || [],
    deposits,
    withdrawals,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
