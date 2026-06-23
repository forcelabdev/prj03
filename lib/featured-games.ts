// Admin'den sabit olarak en üste pinlenen oyun kodları (sıralı)
// Sıralama: ilk sırada olanlar en üstte görünür
const PINNED_GAME_CODES = [
  "heartbreakers",         // Heartbreakers - 1. sıra
  "mrnullswickedwares",   // Mr Null's Wicked Wares - 2. sıra
  "launchtoriches",        // Launch to Riches - 3. sıra
  "betterBarnHouseBonanza", // Better Barn House Bonanza - 4. sıra
  "betterbarnhousebonanza",
  "vs20sb2500",            // Sweet Bonanza 2500 - 5. sıra
  "vswaysSb2500", 
  "sweetbonanza2500"
]

// Oyunları database'deki featured ve has_lobby field'lerine göre sırala
export const sortGamesByFeatured = (games: any[], categorySlug: string) => {
  const pinned: any[] = []
  const featured: any[] = []
  const lobbyed: any[] = []
  const nonFeatured: any[] = []

  games.forEach(game => {
    const code = (game.gameCode || game.code || game.game_code || "").toLowerCase()
    const name = (game.name || game.gameName || "").toLowerCase()
    
    // Öncelikli oyunlar - isim veya kod bazlı kontrol
    // Heartbreakers - tüm varyasyonları yakala (HeartBreakers, Heart Breakers, vb.)
    const nameNormalized = name.replace(/\s+/g, "").replace(/[-_]/g, "").toLowerCase()
    const codeNormalized = code.replace(/\s+/g, "").replace(/[-_]/g, "").toLowerCase()
    const isHeartbreakers = 
      code.includes("heartbreakers") ||
      code.includes("heartbreaker") ||
      code.includes("heart-breakers") ||
      code.includes("heart_breakers") ||
      codeNormalized.includes("heartbreaker") ||
      name.includes("heartbreakers") ||
      name.includes("heartbreaker") ||
      name.includes("heart breakers") ||
      name.includes("heart-breakers") ||
      nameNormalized.includes("heartbreaker")
    
    const isMrNullsWickedWares = 
      code.includes("mrnullswickedwares") ||
      code.includes("mrnulls") ||
      name.includes("mr null") ||
      name.includes("wicked wares")
    
    // "Launch to Riches" - tüm varyasyonları yakala
    const nameNoSpace = name.replace(/\s+/g, "").replace(/[-_]/g, "")
    const codeNoSpace = code.replace(/\s+/g, "").replace(/[-_]/g, "")
    const isLaunchToRiches = 
      code.includes("launchtoriches") ||
      code.includes("launchriches") ||
      code.includes("launch-to-riches") ||
      code.includes("launch_to_riches") ||
      codeNoSpace.includes("launchtoriches") ||
      name.includes("launch to riches") ||
      name.includes("launch_to_riches") ||
      name.includes("launchtoriches") ||
      nameNoSpace.includes("launchtoriches") ||
      (name.includes("launch") && name.includes("riches"))
    
    const isBetterBarnHouseBonanza =
      code.includes("betterbarnhousebonanza") ||
      code.includes("better-barn") ||
      code.includes("better_barn") ||
      name.includes("better barn house bonanza") ||
      name.includes("better barn bonanza") ||
      (name.includes("better barn") && name.includes("bonanza"))

    const isSweetBonanza2500 =
      code.includes("sb2500") ||
      code.includes("sweetbonanza2500") ||
      code === "vs20sb2500" ||
      name.includes("sweet bonanza 2500") ||
      name.includes("sweet bonanza xmas 2500")

    // Admin'den sabit pinli oyunlar en üste (sırası önemli)
    // 1. Heartbreakers en başta
    if (isHeartbreakers) {
      pinned.unshift(game)  // En başa ekle
    } 
    // 2. Mr Null's Wicked Wares - Heartbreakers'dan sonra
    else if (isMrNullsWickedWares) {
      const heartbreakersIndex = pinned.findIndex(g => {
        const n = (g.name || g.gameName || "").toLowerCase()
        return n.includes("heartbreaker")
      })
      if (heartbreakersIndex >= 0) {
        pinned.splice(heartbreakersIndex + 1, 0, game)
      } else {
        pinned.unshift(game)
      }
    } 
    // 3. Launch to Riches - Mr Null'dan sonra
    else if (isLaunchToRiches) {
      const mrNullIndex = pinned.findIndex(g => {
        const n = (g.name || g.gameName || "").toLowerCase()
        return n.includes("mr null") || n.includes("wicked wares")
      })
      if (mrNullIndex >= 0) {
        pinned.splice(mrNullIndex + 1, 0, game)
      } else {
        pinned.unshift(game)
      }
    }
    // 4. Better Barn House Bonanza - Launch to Riches'tan sonra
    else if (isBetterBarnHouseBonanza) {
      const launchIndex = pinned.findIndex(g => {
        const n = (g.name || g.gameName || "").toLowerCase()
        const c = (g.gameCode || g.code || g.game_code || "").toLowerCase()
        return n.includes("launch") && n.includes("riches") || c.includes("launchtoriches")
      })
      if (launchIndex >= 0) {
        pinned.splice(launchIndex + 1, 0, game)
      } else {
        pinned.push(game)
      }
    } else if (isSweetBonanza2500 || PINNED_GAME_CODES.some(p => code.includes(p))) {
      pinned.push(game)
    }
    // featured = 1 (sayı, bool veya string) olan oyunlar
    else if (game.featured == 1 || game.featured === true || game.featured === "1") {
      featured.push(game)
    }
    // has_lobby = 1 olan oyunlar ikinci sıraya
    else if (game.has_lobby == 1 || game.has_lobby === true) {
      lobbyed.push(game)
    }
    else {
      nonFeatured.push(game)
    }
  })

  // Sıralama: pinned > featured > has_lobby > normal
  return [...pinned, ...featured, ...lobbyed, ...nonFeatured]
}
