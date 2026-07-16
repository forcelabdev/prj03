// ============================================================
// USE-GAMES HOOK — hooks/use-games.ts
//
// useGameLaunch: launchGame fonksiyonunu expose eder
//   - Dogrudan gamesService.launchGame cagrisini wrap eder
//   - Auth, HMR, dependency sorunlari burada yok
//   - Cagridan once getGameDetails() ile distribution taze alinmali
//     (bu isin GameLaunchModal'da/handlePlay'de yapilmasi gerekiyor)
// ============================================================

import { gamesService } from '@/lib/services/games-service'

export function useGameLaunch() {
  const launchGame = async (
    userId: string,
    vendorCode: string,
    gameCode: string,
    language = 'tr',
    distribution = '',
    numericId = '',
    isDemo = false,
  ): Promise<{ success: boolean; launchUrl?: string; error?: string; errorCode?: string }> => {
    return gamesService.launchGame(
      userId,
      vendorCode,
      gameCode,
      language,
      distribution,
      numericId,
      '',   // domain
      0,    // mirror
      isDemo,
    )
  }

  return { launchGame }
}
