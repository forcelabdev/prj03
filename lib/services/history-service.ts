// History Service - API calls for game and transaction history
import apiClient from '../api-client';

export interface GameHistoryItem {
  _id: string;
  txn_id?: string;
  round_id?: string;
  game_code?: string;
  game_name?: string;
  // normalized aliases
  gameName: string;
  betAmount: number;
  winAmount: number;
  result: 'win' | 'loss';
  playedAt: string;
  balanceAfter?: number;
}

export interface GameHistoryResponse {
  history?: RawGameHistoryItem[];
  pagination?: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

interface RawGameHistoryItem {
  txn_id?: string;
  round_id?: string;
  bet_money?: number;
  win_money?: number;
  game_code?: string;
  game_name?: string;
  createdAt?: string;
  date?: string;
}

export interface RecentWinner {
  _id: string;
  odooUserId?: string;
  username: string;
  avatar?: string;
  gameName: string;
  winAmount: number;
  multiplier?: number;
  timestamp: string;
}

export const historyService = {
  // Get game history for user
  async getGameHistory(userId: string, page: number = 1, limit: number = 20): Promise<{ success: boolean; history?: GameHistoryItem[]; total?: number; error?: string }> {
    const response = await apiClient.get<GameHistoryResponse>(`/game-history/${userId}?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      const raw = response.data.history || [];
      const normalized: GameHistoryItem[] = raw.map((item) => {
        const bet = item.bet_money ?? 0;
        const win = item.win_money ?? 0;
        return {
          _id: item.txn_id || item.round_id || Math.random().toString(),
          txn_id: item.txn_id,
          round_id: item.round_id,
          game_code: item.game_code,
          game_name: item.game_name,
          gameName: item.game_name || item.game_code || 'Bilinmiyor',
          betAmount: bet,
          winAmount: win,
          result: win > bet ? 'win' : 'loss',
          playedAt: item.createdAt || item.date || new Date().toISOString(),
          balanceAfter: undefined,
        };
      });
      return { success: true, history: normalized, total: response.data.pagination?.totalRecords };
    }
    
    return { success: false, error: response.error || 'Failed to fetch game history' };
  },

  // Get recent big wins (for homepage)
  async getRecentBigWins(): Promise<{ success: boolean; winners?: RecentWinner[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; winners: RecentWinner[] }>('/gamehistory/recent-big-wins');
    
    if (response.success && response.data) {
      return { success: true, winners: response.data.winners };
    }
    
    return { success: false, error: response.error || 'Failed to fetch recent winners' };
  },

  // Get game stats for user
  async getGameStats(userId: string): Promise<{ success: boolean; stats?: { totalBets: number; totalWins: number; totalPlayed: number }; error?: string }> {
    const response = await apiClient.get<{ success: boolean; stats: { totalBets: number; totalWins: number; totalPlayed: number } }>(`/game-history/${userId}/stats`, true);
    
    if (response.success && response.data) {
      return { success: true, stats: response.data.stats };
    }
    
    return { success: false, error: response.error || 'Failed to fetch game stats' };
  },
};

export default historyService;
