// ============================================================
// GAME LAUNCH ROUTE — app/api/game-launch/route.ts
//
// Distribution'a gore dogru backend endpoint'ini secer,
// dogru payload yapar, launchUrl'i frontend'e dondurur.
//
// DAGITIM TABLOSU:
//   nexus     → /gold_api/       user_code, provider_code, game_code
//   drakon    → /drakon_api/     user_id, game_id  (once authenticate)
//   betcolabs → /betcolabs_api/  user_id, gameCode, method=get_launch_url
//   pokerapi  → /poker_api/      user_id, game_code
//   betinovi  → /betinovi_api/   user_id, provider_code, gameCode  (DEFAULT)
//
// DEGISTIR:
//   API_BASE → kendi backend URL'in
//   AGENT_TOKEN env var adi
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

// DEGISTIR: kendi backend base URL'in
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://SENIN_BACKEND_URL.com'

// DEGISTIR: kendi agent token env var adin
const AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN || ''

// Server-side rate limit — sadece sport-bbbet icin 6 saniye per user
const userLastRequestMap = new Map<string, number>()
const RATE_LIMIT_MS = 6000

function getHeaders(authHeader: string | null): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(AGENT_TOKEN ? { 'x-agent-token': AGENT_TOKEN, 'agentToken': AGENT_TOKEN } : {}),
    ...(authHeader ? { 'Authorization': authHeader } : {}),
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('Authorization')

    const {
      distribution = '',
      userId = '',
      vendorCode = '',
      gameCode = '',
      language = 'tr',
      numericId = '',
      channel = 'desktop',
      domain = '',
      mirror = 0,
      isDemo = false,
    } = body

    // sport-bbbet icin per-user 6 saniye rate limit
    if (vendorCode === 'sport-bbbet' && userId) {
      const now = Date.now()
      const last = userLastRequestMap.get(userId) || 0
      const elapsed = now - last
      if (elapsed < RATE_LIMIT_MS) {
        const wait = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000)
        return NextResponse.json(
          { msg: `Rate limited. Please wait ${wait} seconds.`, status: 'RATE_LIMITED', retryAfter: wait },
          { status: 429 }
        )
      }
      userLastRequestMap.set(userId, now)
    }

    const dist = (distribution || '').toLowerCase().trim()

    let endpoint = ''
    let payload: Record<string, unknown> = {}

    if (dist === 'nexus') {
      // =============================================
      // NEXUS — /gold_api/
      // user_code = userId (string identifier)
      // provider_code = vendorCode
      // game_code = gameCode
      // =============================================
      endpoint = '/gold_api/'
      payload = {
        method: 'game_launch',
        user_code: userId,
        provider_code: vendorCode,
        game_code: gameCode,
        lang: language,
        isDemo,
      }

    } else if (dist === 'drakon') {
      // =============================================
      // DRAKON — /drakon_api/
      // Once authenticate cagrilir (token refresh icin)
      // Sonra game_launch: user_id, game_id (game_code degil!)
      // =============================================
      endpoint = '/drakon_api/'
      try {
        await fetch(`${API_BASE}/drakon_api/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...( AGENT_TOKEN ? { 'x-agent-token': AGENT_TOKEN } : {}) },
          body: JSON.stringify({ method: 'authenticate' }),
        })
      } catch { /* backend kendi manage ediyor, hata ignore */ }

      payload = {
        method: 'game_launch',
        user_id: userId,
        game_id: gameCode,   // Drakon game_id bekliyor, game_code degil
        lang: language,
        isDemo,
      }

    } else if (dist === 'betcolabs') {
      // =============================================
      // BETCOLABS — /betcolabs_api/
      // method = get_launch_url (game_launch degil!)
      // user_id, gameCode (camelCase), language (lang degil), channel
      // =============================================
      endpoint = '/betcolabs_api/'
      payload = {
        method: 'get_launch_url',
        user_id: userId,
        gameCode,
        language,
        channel,
        isDemo,
      }

    } else if (dist === 'pokerapi') {
      // =============================================
      // POKERAPI — /poker_api/
      // user_id, game_code, lang
      // =============================================
      endpoint = '/poker_api/'
      payload = {
        method: 'game_launch',
        user_id: userId,
        game_code: gameCode,
        lang: language,
        isDemo,
      }

    } else {
      // =============================================
      // BETINOVI (DEFAULT) — /betinovi_api/
      // Boş, bilinmeyen veya "betinovi" distribution buraya dusuyor
      // provider_code field'i kullaniliyor (vendorCode degil!)
      // sport-bbbet icin customData = JSON.stringify({ domain, mirror })
      // =============================================
      endpoint = '/betinovi_api/'
      payload = {
        method: 'game_launch',
        user_id: userId,
        provider_code: vendorCode,   // KRITIK: provider_code, vendorCode degil
        gameCode,
        language,
        channel,
        isDemo,
        ...(numericId ? { numericId } : {}),
        // Sportsbook (sport-bbbet) icin ek alan
        ...(vendorCode === 'sport-bbbet' && domain && mirror
          ? { customData: JSON.stringify({ domain, mirror }) }
          : {}),
      }
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(authHeader),
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()

    let data: any
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
