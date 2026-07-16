# Game Launch Sistemi — Diger Projeye Uygulama Sirasi

## Dosya Listesi

```
lib/token-manager.ts                         ← localStorage auth_token + auth_user
lib/api-client.ts                            ← tum fetch istekleri /api/proxy'den gider
app/api/proxy/[...path]/route.ts             ← CORS proxy, backend'e iletir
app/api/game-launch/route.ts                 ← distribution'a gore endpoint secer
lib/services/games-service.ts               ← launchGame + kategori/oyun API'leri
hooks/use-games.ts                           ← useGameLaunch hook
app/game/[gameCode]/page.tsx                 ← sadece iframe, launch YAPMAZ
```

## Uygulama Sirasi (bu siraya uy)

1. lib/token-manager.ts
2. lib/api-client.ts
3. app/api/proxy/[...path]/route.ts
4. app/api/game-launch/route.ts
5. lib/services/games-service.ts
6. hooks/use-games.ts
7. app/game/[gameCode]/page.tsx

## DEGISTIR — sadece bunlara dokun

### api/proxy/[...path]/route.ts
```
API_BASE_URL = 'https://SENIN_BACKEND_URL.com'
ALLOWED_ORIGINS = ['https://siteadin.com', ...]
headers['Origin'] = 'https://www.siteadin.com'
headers['Referer'] = 'https://www.siteadin.com/'
```

### api/game-launch/route.ts
```
API_BASE = process.env.NEXT_PUBLIC_API_URL  ← .env'e kendi backend URL'ini yaz
AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN  ← .env'e kendi agent token'ini yaz
```

### .env.local
```
NEXT_PUBLIC_API_URL=https://senin_backend_url.com
NEXT_PUBLIC_AGENT_TOKEN=senin_agent_token_deger
```

## Oyun Acma — Nasil Cagrilmali (handlePlay ornegi)

```ts
// Casino page veya modal icinde — gameCode tiklayinca cagrilir
const handlePlay = async (game: any, isDemo = false) => {
  const userId = user?.id || ""
  const numericId = user?.identifier || user?.numericId || ""

  // 1. Taze distribution + provider_code + game_code al (MongoDB'den)
  const rawGameCode = game.game_code || game.gameCode || game.id || ""
  const detail = await gamesService.getGameDetails(rawGameCode)

  let distribution = game.distribution || ""
  let vendorCode = game.provider_code || game.providerCode || game.provider || ""
  let finalGameCode = rawGameCode

  if (detail.success && detail.game) {
    distribution = detail.game.distribution || distribution
    vendorCode = detail.game.provider_code || vendorCode
    finalGameCode = detail.game.game_code || finalGameCode
  }

  // 2. launchGame — distribution/payload secimini route.ts yapar
  const result = await launchGame(userId, vendorCode, finalGameCode, "tr", distribution, numericId, isDemo)

  if (result.success && result.launchUrl) {
    // MOBIL: gamelaunch subdomain yoksa direkt /game/{gameCode}?url=... git
    const host = window.location.hostname
    const baseDomain = host.replace(/^www\./, '').replace(/^gamelaunch\./, '')

    // gamelaunch subdomain varsa oraya git, yoksa direkt
    const hasGamelaunchSubdomain = true  // kendi subdomain ayarina gore degistir

    if (hasGamelaunchSubdomain) {
      const returnUrl = window.location.href
      const gamePageUrl = `https://gamelaunch.${baseDomain}/${encodeURIComponent(finalGameCode)}?url=${encodeURIComponent(result.launchUrl)}&returnUrl=${encodeURIComponent(returnUrl)}`
      window.location.replace(gamePageUrl)
    } else {
      router.push(`/game/${encodeURIComponent(finalGameCode)}?url=${encodeURIComponent(result.launchUrl)}`)
    }
  } else {
    // Hata goster
    setError(result.error || "Oyun açılamadı")
  }
}
```

## Kritik Kurallar

### game/[gameCode]/page.tsx icinde KESINLIKLE OLMAMALI:
- useAuth() cagrisi
- user, ready, isLoggedIn state'i
- launchStartedRef
- launchGame() cagrisi
- useEffect dependency'sinde auth/user state

Bunlar olursa: auth guncellendikce (balance refresh) useEffect tekrar tetiklenir,
iframe yeni URL yukler, oyun "donmus" gibi gorunur.

### distribution MUTLAKA MongoDB'den gelmeli:
Vendorcode pattern'den tahmin ETME. game.distribution field'i dogru set edilmezse
yanlis endpoint'e gider, yanlis payload gonder, oyun acilmaz.

### launchUrl parse — 11 field fallback:
Her backend farkli field adi kullanabilir. games-service.ts'teki
11'li fallback chain'i KALDIR/DEGISTIRME.

## Distribution Tablosu

| distribution | endpoint       | user field   | gameCode field | vendorCode field  | method          |
|-------------|----------------|--------------|----------------|-------------------|-----------------|
| nexus       | /gold_api/     | user_code    | game_code      | provider_code     | game_launch     |
| drakon      | /drakon_api/   | user_id      | game_id        | -                 | game_launch     |
| betcolabs   | /betcolabs_api/| user_id      | gameCode       | -                 | get_launch_url  |
| pokerapi    | /poker_api/    | user_id      | game_code      | -                 | game_launch     |
| betinovi    | /betinovi_api/ | user_id      | gameCode       | provider_code     | game_launch     |
| (bos/diger) | /betinovi_api/ | user_id      | gameCode       | provider_code     | game_launch     |
