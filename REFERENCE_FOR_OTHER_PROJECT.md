# prj03 - Referans Dokümantasyon

Bu dokümant, diğer projeye adapt edilmek için prj03'ün mevcut implementasyonunun detaylı referansıdır.

---

## 1️⃣ GAME PAGE UI AKIŞI (app/game/[gameCode]/page.tsx)

### Flow Sırası:
```
Sayfa Yüklenişi:
├─ Suspense fallback (spinner göster)
│  ├─ spinner: w-12 h-12, border-4 border-emerald-400 border-t-transparent, animate-spin
│  └─ text: "Yukleniyor..." (white, fontSize 18)
│
├─ GameContent component mount
│  └─ useEffect #1: URL parametrelerini oku
│     ├─ searchParams.get("url") → gameUrl
│     ├─ searchParams.get("returnUrl") → referrerUrl
│     └─ setIsLoading(false)
│
├─ useEffect #2: Back button logic
│  └─ history.replaceState({ game: true }) - backstack yönetimi
│
├─ Conditional Rendering
│  ├─ isLoading === true
│  │  └─ Spinner + "Oyun yukleniyor..." göster
│  │
│  ├─ !gameUrl === true
│  │  └─ Error UI: "Oyun URL'i bulunamadi" + "Geri Don" button
│  │
│  └─ gameUrl exists
│     └─ iframe render (fullscreen)
│
└─ iframe özellikleri:
   ├─ position: fixed, top: 0, left: 0, width: 100%, height: 100%
   ├─ border: none
   ├─ allow: "fullscreen; autoplay; camera; microphone; accelerometer; gyroscope"
   ├─ allowFullScreen
   └─ src: {gameUrl}
```

### Timing:
- **Spinner duration**: URL parametreleri okunana kadar (saniye altında)
- **iframe render**: Hemen gameUrl varsa (no additional delay)
- **No retry logic**: URL yoksa error göster, retry yok

### Key Details:
- `"use client"` directive var
- `use(params)` ile async params handle ediliyor
- `searchParams` ile URL params okunuyor
- Return URL logic: `gameCode === 'sportsbook' ? '/sports' : '/casino'`
- History state management: Only game-related popstate'lerde returnUrl'e dön

---

## 2️⃣ AUTH DATA LOADING

### Kaynak: `/app/api/auth/me/route.ts`

```typescript
// GET /api/auth/me
// Headers bekleniyor:
// - Authorization: "Bearer {token}" VEYA
// - x-auth-token: "{token}"

// Timing:
- Senkron (non-async) API call
- Token gerekli (401 if missing)
- Response time: negligible (mock data dönüyor)

// Response:
{
  success: true,
  user: {
    _id: '1',
    username: 'demo',
    email: 'demo@velobet.com',
    balance: 1000,
    bonusBalance: 500,
    xp: 0,
    level: 1,
    avatar: 'https://via.placeholder.com/40'
  }
}

// localStorage kullanımı:
- YES - games-service.ts içinde
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
- Her game launch request'inde Authorization header'ına ekleniyor
```

### Kaynak: `/lib/services/games-service.ts`

```typescript
// launchGame() fonksiyonunda:
const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

// /api/game-launch POST isteğine ekleniyor:
headers: { 
  'Content-Type': 'application/json',
  ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
}
```

---

## 3️⃣ BETINOVI OYUN TAKILMASI / SPINNE LIMIT

### Kaynak: `/app/api/game-launch/route.ts`

```typescript
// Rate Limiting - SADECE Betinovi için (sport-bbbet)
const RATE_LIMIT_MS = 6000 // 6 saniye

if (vendorCode === 'sport-bbbet' && userId) {
  const now = Date.now()
  const lastRequest = userLastRequestMap.get(userId) || 0
  const timeSinceLastRequest = now - lastRequest
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastRequest) / 1000)
    return NextResponse.json({ 
      msg: `Rate limited. Please wait ${waitTime} seconds.`,
      status: 'RATE_LIMITED',
      retryAfter: waitTime 
    }, { status: 429 })
  }
  
  // Update last request time
  userLastRequestMap.set(userId, now)
}
```

### Sonuç:
- **Sport-bbbet (Betinovi) için**: **6 saniye** cooldown per user
- **Diğer providers için**: Rate limiting YOK
- **Hiç mi takılıyor**: HAYIR, sadece 429 response dönüyor (client-side handle etmesi lazım)
- **Server-side only**: Client-side rate limiting kaldırılmış

---

## 4️⃣ BACKEND BETINOVI SESSION TIMEOUT

### Kaynak: `/app/api/game-launch/route.ts`

```typescript
// Betinovi (default) case:
else if (dist === 'drakon') {
  endpoint = '/drakon_api/'
  // Drakon backend: once authenticate et (token yoksa veya expire olduysa yeniler)
  // Sonra game_launch cagir
  try {
    await fetch(`${API_BASE}/drakon_api/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'authenticate' }),
    })
  } catch { /* ignore, backend zaten kendi manage ediyor */ }
}
else {
  // betinovi (default)
  endpoint = '/betinovi_api/'
  payload = { 
    method: 'game_launch', 
    user_id: userId, 
    vendorCode, 
    gameCode, 
    language, 
    channel,
    isDemo,
    // customData SADECE sportsbook (sport-bbbet) için - JSON string olarak
    ...(vendorCode === 'sport-bbbet' && domain && mirror && { 
      customData: JSON.stringify({ domain, mirror })
    }),
  }
}
```

### Session Timeout Ayarları:
- **Betinovi**: Backend tarafından manage ediliyor (proje tarafında hardcode edilen timeout YOK)
- **Drakon**: Authenticate call öncesinde yapılıyor, but error ignored
- **Tüm providers**: Backend'in kendi session management'ını kullanıyor

**Özet**: Backend session timeout ayarları proje kodunda GÖRÜNMÜYOR - backend API'nin kendi policy'si kullanılıyor.

---

## 5️⃣ export const dynamic DURUMU

### Araştırma Sonucu:

```
✅ Bulunan dynamic exports:
├─ app/api/winners-pool/route.ts:6 → export const dynamic = "force-dynamic"
└─ app/api/leaderboard/route.ts:5 → export const dynamic = "force-dynamic"

❌ game-launch/route.ts: dynamic export YOK
❌ auth/me/route.ts: dynamic export YOK
```

### Sonuç:
- **game-launch/route.ts**: `export const dynamic` YOK (default caching behavior)
- **auth/me/route.ts**: `export const dynamic` YOK (default caching behavior)
- **Diğer API routes**: `force-dynamic` ile açıkça dynamic olarak marked edilmiş

---

## 📋 KÖŞELİ DOSYALAR - KOPYALA/PASTE

### 1. app/game/[gameCode]/page.tsx

```typescript
"use client"

import { useState, useEffect, use, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function GameContent({ params }: { params: Promise<{ gameCode: string }> }) {
  const resolvedParams = use(params)
  const gameCode = resolvedParams.gameCode
  const searchParams = useSearchParams()

  const router = useRouter()
  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [referrerUrl, setReferrerUrl] = useState<string | null>(null)

  useEffect(() => {
    // URL parametrelerinden gameUrl ve returnUrl al
    const urlParam = searchParams.get("url")
    const returnUrlParam = searchParams.get("returnUrl")
    
    if (urlParam) {
      setGameUrl(urlParam)
    }
    
    // returnUrl parametresini kullan, yoksa ana domain'e don
    if (returnUrlParam) {
      setReferrerUrl(returnUrlParam)
    } else {
      const baseDomain = window.location.hostname.replace(/^gamelaunch\./, '')
      // Sportsbook ise /sports, degikse /casino
      const returnPath = gameCode === 'sportsbook' ? '/sports' : '/casino'
      setReferrerUrl(`https://${baseDomain}${returnPath}`)
    }
    
    setIsLoading(false)
  }, [searchParams])
  
  useEffect(() => {
    if (!referrerUrl) return
    
    // Geri tusuna basinca returnUrl'e don
    const handlePopState = (e: PopStateEvent) => {
      // Sadece game state'i olmayan popstate'lerde geri git
      if (!e.state?.game) {
        window.location.href = referrerUrl
      }
    }
    
    // Sadece bir kez pushState yap (eger zaten game state yoksa)
    if (!window.history.state?.game) {
      window.history.replaceState({ game: true }, '', window.location.href)
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [referrerUrl])



  // Yukleniyor
  if (isLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p style={{ color: "#fff", marginTop: 16, fontSize: 18 }}>Oyun yukleniyor...</p>
      </div>
    )
  }

  // Oyun URL yoksa hata goster
  if (!gameUrl) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ backgroundColor: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: 8, padding: "16px 24px", marginBottom: 20 }}>
          <p style={{ color: "#f87171", fontSize: 16, textAlign: "center" }}>Oyun URL&apos;i bulunamadi</p>
        </div>
        <button
          onClick={() => router.back()}
          style={{ backgroundColor: "#00d4b4", color: "#000", fontWeight: 600, fontSize: 16, padding: "12px 32px", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Geri Don
        </button>
      </div>
    )
  }

  // Game iframe - tam ekran, header/footer yok
  return (
    <iframe
      src={gameUrl}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
      allow="fullscreen; autoplay; camera; microphone; accelerometer; gyroscope"
      allowFullScreen
    />
  )
}

export default function GamePage({ params }: { params: Promise<{ gameCode: string }> }) {
  return (
    <Suspense fallback={
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p style={{ color: "#fff", marginTop: 16, fontSize: 18 }}>Yukleniyor...</p>
      </div>
    }>
      <GameContent params={params} />
    </Suspense>
  )
}
```

### 2. app/api/game-launch/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apievrymatrix5d84k321.com'
const AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN || ''

// SERVER-SIDE RATE LIMITING - per user, 6 saniye cooldown
const userLastRequestMap = new Map<string, number>()
const RATE_LIMIT_MS = 6000 // 6 saniye

const getHeaders = (authHeader: string | null): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...(AGENT_TOKEN ? { 'x-agent-token': AGENT_TOKEN, 'agentToken': AGENT_TOKEN } : {}),
  ...(authHeader ? { 'Authorization': authHeader } : {}),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('Authorization')
    const { distribution, userId, vendorCode, gameCode, language = 'tr', numericId = '', channel = 'desktop', domain, mirror, isDemo = false } = body

    // RATE LIMIT CHECK - sport-bbbet icin per-user 6 saniye
    if (vendorCode === 'sport-bbbet' && userId) {
      const now = Date.now()
      const lastRequest = userLastRequestMap.get(userId) || 0
      const timeSinceLastRequest = now - lastRequest
      
      if (timeSinceLastRequest < RATE_LIMIT_MS) {
        const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastRequest) / 1000)
        return NextResponse.json({ 
          msg: `Rate limited. Please wait ${waitTime} seconds.`,
          status: 'RATE_LIMITED',
          retryAfter: waitTime 
        }, { status: 429 })
      }
      
      // Update last request time
      userLastRequestMap.set(userId, now)
    }

    const dist = (distribution || '').toLowerCase()

    let endpoint = ''
    let payload: Record<string, unknown> = {}

    if (dist === 'nexus') {
      endpoint = '/gold_api/'
      payload = { method: 'game_launch', user_code: userId, provider_code: vendorCode, game_code: gameCode, lang: language, isDemo }
    } else if (dist === 'drakon') {
      endpoint = '/drakon_api/'
      // Drakon backend: once authenticate et (token yoksa veya expire olduysa yeniler)
      // Sonra game_launch cagir
      try {
        await fetch(`${API_BASE}/drakon_api/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'authenticate' }),
        })
      } catch { /* ignore, backend zaten kendi manage ediyor */ }

      payload = { 
        method: 'game_launch',
        user_id: userId,
        game_id: gameCode,
        lang: language,
        isDemo,
      }
    } else if (dist === 'betcolabs') {
      endpoint = '/betcolabs_api/'
      payload = { method: 'get_launch_url', user_id: userId, gameCode, language, channel, isDemo }
    } else if (dist === 'pokerapi') {
      endpoint = '/poker_api/'
      payload = { method: 'game_launch', user_id: userId, game_code: gameCode, lang: language, isDemo }
    } else {
      // betinovi (default)
      endpoint = '/betinovi_api/'
      payload = { 
        method: 'game_launch', 
        user_id: userId, 
        vendorCode, 
        gameCode, 
        language, 
        channel,
        isDemo,
        // customData SADECE sportsbook (sport-bbbet) için - JSON string olarak
        ...(vendorCode === 'sport-bbbet' && domain && mirror && { 
          customData: JSON.stringify({ domain, mirror })
        }),
      }
    }

    const headers = getHeaders(authHeader)
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ msg: 'Invalid JSON response', details: responseText.substring(0, 200) }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: response.ok ? 200 : response.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ msg: 'INTERNAL_ERROR', details: message }, { status: 500 })
  }
}
```

---

## 📌 ÖZET

| Soru | Cevap |
|------|-------|
| **1. Game page UI flow** | Spinner (Suspense) → URL param check → gameUrl varsa iframe, yoksa error |
| **2. Auth data loading** | localStorage'dan auth_token alınıyor, header'da gönderiliyor, timing negligible |
| **3. Betinovi spinne limit** | 6 saniye per-user rate limiting (sport-bbbet only), 429 response dönüyor |
| **4. Backend session timeout** | Backend tarafında manage ediliyor, proje kodunda hardcode timeout YOK |
| **5. export const dynamic** | game-launch ve auth/me routes'ta YOK (default caching) |

---

**Tarafından hazırlanmış: v0**
**Tarih: 2025-01-15**
