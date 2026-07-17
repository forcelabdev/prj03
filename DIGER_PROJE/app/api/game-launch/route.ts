import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// BURAYA DOKUNMADAN ONCE: .env.local dosyasina ekle:
//   NEXT_PUBLIC_API_URL=https://senin-backend-url.com
//   NEXT_PUBLIC_AGENT_TOKEN=senin-agent-token
// ============================================================
const API_BASE    = process.env.NEXT_PUBLIC_API_URL   || ''
const AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN || ''

// sport-bbbet icin server-side rate limit (6 saniye per user)
const userLastRequestMap = new Map<string, number>()
const RATE_LIMIT_MS = 6000

const getHeaders = (authHeader: string | null): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept':       'application/json',
  // Bu iki header Betinovi dahil tum distribution'lara gidiyor — olmasa hata verir
  ...(AGENT_TOKEN ? {
    'x-agent-token': AGENT_TOKEN,
    'agentToken':    AGENT_TOKEN,
  } : {}),
  ...(authHeader ? { 'Authorization': authHeader } : {}),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('Authorization')

    const {
      distribution = '',
      userId       = '',
      vendorCode   = '',
      gameCode     = '',
      language     = 'tr',
      numericId    = '',
      channel      = 'desktop',
      domain       = '',
      mirror       = 0,
      isDemo       = false,
    } = body

    // sport-bbbet: per-user 6 saniye rate limit
    if (vendorCode === 'sport-bbbet' && userId) {
      const now  = Date.now()
      const last = userLastRequestMap.get(userId) || 0
      const diff = now - last
      if (diff < RATE_LIMIT_MS) {
        const wait = Math.ceil((RATE_LIMIT_MS - diff) / 1000)
        return NextResponse.json(
          { msg: `Rate limited. Please wait ${wait} seconds.`, status: 'RATE_LIMITED', retryAfter: wait },
          { status: 429 }
        )
      }
      userLastRequestMap.set(userId, now)
    }

    // dist kucuk harfe cevir — karsilastirma guvenli olsun
    const dist = (distribution || '').toLowerCase().trim()

    let endpoint = ''
    let payload: Record<string, unknown> = {}

    // ============================================================
    // DISTRIBUTION'A GORE ENDPOINT + PAYLOAD SECIMI
    // Her distribution'in beklediği field adlari farkli!
    // ============================================================

    if (dist === 'nexus') {
      // Nexus (Gold API)
      endpoint = '/gold_api/'
      payload = {
        method:        'game_launch',
        user_code:     userId,       // nexus: user_code
        provider_code: vendorCode,   // nexus: provider_code
        game_code:     gameCode,     // nexus: game_code
        lang:          language,     // nexus: lang
        isDemo,
      }

    } else if (dist === 'drakon') {
      // Drakon — once authenticate, sonra game_launch
      endpoint = '/drakon_api/'
      try {
        await fetch(`${API_BASE}/drakon_api/`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ method: 'authenticate' }),
        })
      } catch { /* drakon kendi manage ediyor, hata olursa devam et */ }

      payload = {
        method:    'game_launch',
        user_id:   userId,           // drakon: user_id
        game_id:   gameCode,         // drakon: game_id (game_code degil!)
        lang:      language,
        isDemo,
      }

    } else if (dist === 'betcolabs') {
      // Betcolabs
      endpoint = '/betcolabs_api/'
      payload = {
        method:   'get_launch_url',  // betcolabs: method adi farkli
        user_id:  userId,            // betcolabs: user_id
        gameCode,                    // betcolabs: gameCode (camelCase)
        language,                    // betcolabs: language (lang degil)
        channel,
        isDemo,
      }

    } else if (dist === 'pokerapi') {
      // Poker API
      endpoint = '/poker_api/'
      payload = {
        method:    'game_launch',
        user_id:   userId,           // pokerapi: user_id
        game_code: gameCode,         // pokerapi: game_code
        lang:      language,
        isDemo,
      }

    } else {
      // Betinovi — dist bos, undefined veya bilinmeyen her sey buraya duser
      endpoint = '/betinovi_api/'
      payload = {
        method:        'game_launch',
        user_code:     userId,       // betinovi: user_code (user_id DEGIL)
        provider_code: vendorCode,   // betinovi: provider_code (vendorCode DEGIL)
        game_code:     gameCode,     // betinovi: game_code (gameCode DEGIL)
        lang:          language,     // betinovi: lang (language DEGIL)
        channel,
        isDemo,
        // numericId bazi sub-provider'lar icin
        ...(numericId ? { numericId } : {}),
        // sport-bbbet sportsbook icin customData
        ...(vendorCode === 'sport-bbbet' && domain && mirror ? {
          customData: JSON.stringify({ domain, mirror })
        } : {}),
      }
    }

    // ============================================================
    // BACKEND'E ISTEK AT
    // ============================================================
    const headers  = getHeaders(authHeader)
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method:  'POST',
      headers,
      body:    JSON.stringify(payload),
    })

    const responseText = await response.text()

    let data: Record<string, unknown>
    try {
      data = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { msg: 'Invalid JSON response', details: responseText.substring(0, 200) },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.ok ? 200 : response.status })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ msg: 'INTERNAL_ERROR', details: message }, { status: 500 })
  }
}
