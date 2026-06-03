import useSWR from 'swr'
import { apiClient } from './api-client'

// Generic fetcher for SWR
const fetcher = async (url: string, requiresAuth: boolean = false) => {
  const response = await apiClient.get(url, requiresAuth)
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch')
  }
  return response.data
}

// Ortak cache ayarlari
const STATIC_OPTIONS = {
  revalidateOnFocus: false,
  dedupingInterval: 30000, // 30 saniye (oyunlar, kategoriler)
}

const SEMI_STATIC_OPTIONS = {
  revalidateOnFocus: false,
  dedupingInterval: 15000, // 15 saniye (kampanyalar, promosyonlar, bannerlar)
}

const AUTH_OPTIONS = {
  revalidateOnFocus: true, // kullanici verisi focus'ta guncellensin
  dedupingInterval: 5000, // 5 saniye
}

// Games hooks
export const useGames = (limit: number = 20) => {
  const { data, error, isLoading } = useSWR(['/public/games/featured/list', false], ([url]) =>
    fetcher(url, false),
    STATIC_OPTIONS
  )
  return { games: data, error, isLoading }
}

export const useGamesByCategory = (slug: string) => {
  const { data, error, isLoading } = useSWR(
    slug ? ['/public/games/category/' + slug, false] : null,
    ([url]) => fetcher(url, false),
    STATIC_OPTIONS
  )
  return { games: data, error, isLoading }
}

export const useCategories = () => {
  const { data, error, isLoading } = useSWR(['/public/categories', false], ([url]) =>
    fetcher(url, false),
    STATIC_OPTIONS
  )
  return { categories: data, error, isLoading }
}

// Auth hooks
export const useCurrentUser = () => {
  const { data, error, isLoading, mutate } = useSWR(['/auth/me', true], ([url]) =>
    fetcher(url, true),
    AUTH_OPTIONS
  )
  return { user: data?.user, error, isLoading, mutate }
}

// Campaigns hooks
export const useCampaigns = () => {
  const { data, error, isLoading } = useSWR(['/auth/campaigns', false], ([url]) =>
    fetcher(url, false),
    SEMI_STATIC_OPTIONS
  )
  return { campaigns: data?.campaigns, error, isLoading }
}

// Bonus settings hooks
export const useBonusSettings = () => {
  const { data, error, isLoading } = useSWR(['/bonus-settings', false], ([url]) =>
    fetcher(url, false),
    STATIC_OPTIONS
  )
  return { bonuses: data?.bonuses, error, isLoading }
}

// Promotions hooks
export const usePromotions = () => {
  const { data, error, isLoading } = useSWR(['/auth/promotions', false], ([url]) =>
    fetcher(url, false),
    SEMI_STATIC_OPTIONS
  )
  return { promotions: data, error, isLoading }
}

// VIP hooks
export const useVIPLevel = () => {
  const { data, error, isLoading } = useSWR(['/vip/current-level', true], ([url]) =>
    fetcher(url, true),
    AUTH_OPTIONS
  )
  return { level: data, error, isLoading }
}

export const useVIPLevels = () => {
  const { data, error, isLoading } = useSWR(['/vip/levels', false], ([url]) =>
    fetcher(url, false),
    STATIC_OPTIONS
  )
  return { levels: data, error, isLoading }
}

// Banners hooks
export const useBanners = (position?: string) => {
  const url = position ? `/public/banners/${position}` : '/public/banners'
  const { data, error, isLoading } = useSWR([url, false], ([url]) =>
    fetcher(url, false),
    SEMI_STATIC_OPTIONS
  )
  return { banners: data, error, isLoading }
}

// Recent winners hooks
export const useRecentWinners = () => {
  const { data, error, isLoading } = useSWR(['/gamehistory/recent-big-wins', false], ([url]) =>
    fetcher(url, false),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      refreshInterval: 60000, // 1 dakikada bir guncelle (eskiden 30sn)
    }
  )
  return { winners: data, error, isLoading }
}

// Sports bets hooks
export const useSportsBets = () => {
  const { data, error, isLoading } = useSWR(['/auth/sports-bets', true], ([url]) =>
    fetcher(url, true),
    AUTH_OPTIONS
  )
  return { bets: data?.bets, error, isLoading }
}

export const useSportsBetsStats = () => {
  const { data, error, isLoading } = useSWR(['/auth/sports-bets-stats', true], ([url]) =>
    fetcher(url, true),
    AUTH_OPTIONS
  )
  return { stats: data, error, isLoading }
}

// Wingo hooks - 1000ms yerine 5000ms (saniyede 1 istek cok agresif)
export const useWingoActive = () => {
  const { data, error, isLoading } = useSWR(['/wingo/active', false], ([url]) =>
    fetcher(url, false),
    {
      revalidateOnFocus: false,
      dedupingInterval: 4000,
      refreshInterval: 5000,
    }
  )
  return { active: data?.result, error, isLoading }
}

export const useWingoStats = () => {
  const { data, error, isLoading } = useSWR(['/wingo/stats', true], ([url]) =>
    fetcher(url, true),
    AUTH_OPTIONS
  )
  return { stats: data, error, isLoading }
}

// Settings hooks
export const useSiteSettings = () => {
  const { data, error, isLoading } = useSWR(['/site-settings', false], ([url]) =>
    fetcher(url, false),
    STATIC_OPTIONS
  )
  return { settings: data, error, isLoading }
}

// News hooks
export const useNews = () => {
  const { data, error, isLoading } = useSWR(['/news', false], ([url]) =>
    fetcher(url, false),
    SEMI_STATIC_OPTIONS
  )
  return { news: data, error, isLoading }
}
