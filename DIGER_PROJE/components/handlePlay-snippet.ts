// ============================================================
// DIGER PROJEDEKI game-launch-modal.tsx veya casino/page.tsx icinde
// oyuna tiklaninca cagrilacak handlePlay fonksiyonu
//
// KRITIK NOKTA: userId her zaman user.id olmali (tam MongoDB _id)
//               numericId = user.identifier || user.id
//               Yer degistirme — bu hata "User code required" verir
// ============================================================

import { gamesService } from '@/lib/services/games-service'

// useAuth hook'undan gelen user objesi
// const { user } = useAuth()

const handlePlay = async (game: any, user: any, isDemo = false) => {

  // ============================================================
  // ADIM 1: userId ve numericId dogru kaynaklardan alinmali
  // ============================================================
  const userId    = user?.id || ""             // TAM MongoDB _id — "699732686445e9caa08caba9"
  const numericId = user?.identifier || user?.id || ""  // ayni ya da identifier

  // YANLIS kullanim ornekleri (bunu yapma):
  // const userId = user?.numericId  ← kisa ID, yanlis
  // const userId = user?.username   ← username, yanlis

  // ============================================================
  // ADIM 2: Oyun kodunu al
  // ============================================================
  const rawGameCode = game?.game_code || game?.gameCode || game?.id || ""

  // ============================================================
  // ADIM 3: getGameDetails ile MongoDB'den taze distribution al
  // Bu cagri olmadan distribution bos gelebilir
  // ============================================================
  const detail = await gamesService.getGameDetails(rawGameCode)

  let distribution = game?.distribution || ""
  let vendorCode   = game?.provider_code || game?.providerCode || game?.provider || ""
  let gameCode     = rawGameCode

  if (detail.success && detail.game) {
    const g  = detail.game as any
    distribution = g.distribution    || distribution  // MongoDB'den taze geldi
    vendorCode   = g.provider_code   || vendorCode    // taze provider_code
    gameCode     = g.game_code       || gameCode       // taze game_code
  }

  // ============================================================
  // ADIM 4: launchGame cagir
  // ============================================================
  const result = await gamesService.launchGame(
    userId,        // tam MongoDB _id
    vendorCode,    // provider_code
    gameCode,      // game_code
    'tr',          // language
    distribution,  // "nexus" | "drakon" | "betcolabs" | "pokerapi" | "" (betinovi)
    numericId,     // identifier || id
    '',            // domain (sportsbook icin)
    0,             // mirror (sportsbook icin)
    isDemo,
  )

  if (result.success && result.launchUrl) {
    // ============================================================
    // ADIM 5: URL geldi — game page'e yonlendir
    // game/[gameCode]/page.tsx sadece bu URL'i okur, baska hicbir sey yapmaz
    // ============================================================

    // Mobile — tam sayfa yonlendirme (geri tusu history'e girmez)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator?.userAgent || ''
    )

    if (isMobile) {
      const returnUrl = encodeURIComponent(window.location.origin + '/casino')
      window.location.replace(
        `/game/${gameCode}?url=${encodeURIComponent(result.launchUrl)}&returnUrl=${returnUrl}`
      )
    } else {
      // Desktop — iframe modal icinde ac (router.push veya state set et)
      // setGameUrl(result.launchUrl) gibi
    }
  } else {
    // Hata yonetimi
    const code = result.errorCode || ''
    if (code === 'RATE_LIMITED') {
      // setLaunchError("Lutfen birkaç saniye bekleyip tekrar deneyin.")
    } else {
      // setLaunchError(result.error || "Oyun su anda acilemiyor.")
    }
  }
}

export { handlePlay }
