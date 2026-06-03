import useSWR from "swr"
import { bonusService } from "@/lib/services"

export function useBonuses() {
  const { data: bonusesData, isLoading: bonusesLoading, error: bonusesError } = useSWR(
    "/api/bonuses",
    () => bonusService.getBonuses(),
    { revalidateOnFocus: false }
  )

  const { data: activeBonusesData, isLoading: activeBonusesLoading } = useSWR(
    "/api/bonuses/active",
    () => bonusService.getActiveBonuses(),
    { revalidateOnFocus: false }
  )

  // Extract arrays from response objects - bonusService returns { success, bonuses }
  const bonuses = bonusesData?.bonuses || []
  const activeBonuses = activeBonusesData?.bonuses || []

  return {
    bonuses,
    activeBonuses,
    isLoading: bonusesLoading || activeBonusesLoading,
    error: bonusesError,
  }
}

export function useClaimBonus() {
  return {
    claimBonus: async (bonusId: string) => {
      try {
        const result = await bonusService.claimBonus(bonusId)
        return { success: true, ...result }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
  }
}
