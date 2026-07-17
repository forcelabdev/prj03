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

    let dist = (distribution || '').toLowerCase()

    // distribution bos gelirse vendorCode ve gameCode'dan tahmin et
    if (!dist && vendorCode) {
      if (/^\d+$/.test(gameCode)) {
        // gameCode tamamen rakamsa drakon (ornek: "907", "48")
        dist = 'drakon'
      } else if (vendorCode === vendorCode.toUpperCase() && !vendorCode.includes('-')) {
        // vendorCode tamamen uppercase ve tire yoksa nexus (ornek: "PRAGMATIC", "AMATIC")
        dist = 'nexus'
      } else if (vendorCode.startsWith('slot-') || vendorCode.startsWith('live-') || vendorCode.includes('-')) {
        // vendorCode slug formatindaysa betinovi (ornek: "slot-pragmatic", "slot-hacksaw")
        dist = 'betinovi'
      }
    }

    console.log('[v0] GAME-LAUNCH INPUT:', { distribution, dist, userId, vendorCode, gameCode, language, numericId, channel, domain, mirror, isDemo })

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
        user_code: userId,           // Betinovi: user_code
        provider_code: vendorCode,   // Betinovi: provider_code
        game_code: gameCode,         // Betinovi: game_code
        lang: language,              // Betinovi: lang
        channel,
        isDemo,
        // numericId fallback - bazi Betinovi sub-provider'lar icin
        ...(numericId ? { numericId } : {}),
        // customData SADECE sportsbook (sport-bbbet) için - JSON string olarak
        ...(vendorCode === 'sport-bbbet' && domain && mirror && { 
          customData: JSON.stringify({ domain, mirror })
        }),
      }
    }

    const headers = getHeaders(authHeader)

    console.log('[v0] GAME-LAUNCH → endpoint:', endpoint)
    console.log('[v0] GAME-LAUNCH → payload:', JSON.stringify(payload))
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    console.log('[v0] GAME-LAUNCH ← backend status:', response.status)

    const responseText = await response.text()
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.log('[v0] GAME-LAUNCH ← JSON parse failed, raw:', responseText.substring(0, 300))
      return NextResponse.json({ msg: 'Invalid JSON response', details: responseText.substring(0, 200) }, { status: 500 })
    }

    console.log('[v0] GAME-LAUNCH ← parsed response keys:', Object.keys(data || {}))
    console.log('[v0] GAME-LAUNCH ← full response:', JSON.stringify(data))
    
    return NextResponse.json(data, { status: response.ok ? 200 : response.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ msg: 'INTERNAL_ERROR', details: message }, { status: 500 })
  }
}
