// SWR hooks for games data
import useSWR from 'swr'
import { gamesService, type Game, type GameProvider } from '@/lib/services/games-service'

// Fetcher functions
const fetchFeaturedGames = async () => {
  const result = await gamesService.getFeaturedGames()
  if (result.success && result.games) {
    return result.games
  }
  throw new Error(result.error || 'Failed to fetch featured games')
}

const fetchProviders = async () => {
  const result = await gamesService.getProviders()
  if (result.success && result.providers) {
    return result.providers
  }
  throw new Error(result.error || 'Failed to fetch providers')
}

const fetchGamesByProvider = async (providerCode: string) => {
  const result = await gamesService.getGamesByProvider(providerCode)
  if (result.success && result.games) {
    return result.games
  }
  throw new Error(result.error || 'Failed to fetch games')
}

const fetchGamesByCategory = async (category: string) => {
  const result = await gamesService.getGamesByCategory(category)
  if (result.success && result.games) {
    return result.games
  }
  throw new Error(result.error || 'Failed to fetch games')
}

// Hooks
export function useFeaturedGames() {
  const { data, error, isLoading, mutate } = useSWR<Game[]>(
    'featured-games',
    fetchFeaturedGames,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  return {
    games: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useProviders() {
  const { data, error, isLoading, mutate } = useSWR<GameProvider[]>(
    'providers',
    fetchProviders,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    providers: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useGamesByProvider(providerCode: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Game[]>(
    providerCode ? `games-provider-${providerCode}` : null,
    () => providerCode ? fetchGamesByProvider(providerCode) : Promise.resolve([]),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    games: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useGamesByCategory(category: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Game[]>(
    category ? `games-category-${category}` : null,
    () => category ? fetchGamesByCategory(category) : Promise.resolve([]),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    games: data,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

// Game launch hook
export function useGameLaunch() {
  const launchGame = async (
    userId: string,
    vendorCode: string,
    gameCode: string,
    language: string = 'tr',
    distribution: string = '',
    numericId: string = '',
    isDemo: boolean = false,
  ): Promise<{ success: boolean; launchUrl?: string; error?: string; errorCode?: string }> => {
    return gamesService.launchGame(userId, vendorCode, gameCode, language, distribution, numericId, '', 0, isDemo)
  }

  return { launchGame }
}
