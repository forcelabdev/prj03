import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apievrymatrix5d84k321.com'
const AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN || ''

// SERVER-SIDE RATE LIMITING - SADECE sport-bbbet icin, per user 3 saniye cooldown
const userLastRequestMap = new Map<string, number>()
const RATE_LIMIT_MS = 3000 // 3 saniye (retry interval ile esit)

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

    // RATE LIMIT CHECK - YALNIZCA sport-bbbet icin, diger oyunlara uygulanmaz
    if (vendorCode === 'sport-bbbet' && userId) {
      const now = Date.now()
      const rateKey = `sport-${userId}`
      const lastRequest = userLastRequestMap.get(rateKey) || 0
      const timeSinceLastRequest = now - lastRequest

      if (timeSinceLastRequest < RATE_LIMIT_MS) {
        const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastRequest) / 1000)
        return NextResponse.json({
          msg: `Rate limited. Please wait ${waitTime} seconds.`,
          status: 'RATE_LIMITED',
          retryAfter: waitTime
        }, { status: 429 })
      }

      userLastRequestMap.set(rateKey, now)
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

    // Tum olasi URL field adlarini kontrol et (nested dahil)
    const extractUrl = (d: Record<string, unknown>): string | undefined =>
      (d?.launch_url || d?.game_url || d?.iframe_url || d?.url ||
       d?.gameUrl || d?.launchUrl || d?.game_launch_url ||
       (d?.result as Record<string, unknown>)?.url ||
       (d?.result as Record<string, unknown>)?.launch_url ||
       (d?.data as Record<string, unknown>)?.url ||
       (d?.data as Record<string, unknown>)?.launch_url) as string | undefined

    const launchUrl = extractUrl(data)

    // Backend 500 verse bile URL varsa 200 olarak don.
    // "updateMissionProgress is not defined" gibi backend-side crash'ler oyun
    // acilmasini engellememelidir — URL uretilmis demektir.
    if (!response.ok && launchUrl) {
      return NextResponse.json(data, { status: 200 })
    }

    // Raw response text icinde URL var mi kontrol et (bazen JSON field'i farkli olabilir)
    if (!response.ok && responseText.includes('http')) {
      const urlMatch = responseText.match(/https?:\/\/[^\s"']+/)
      if (urlMatch) {
        return NextResponse.json({ launch_url: urlMatch[0], ...data }, { status: 200 })
      }
    }

    // Backend INTERNAL_ERROR — error field string veya object olabilir
    const errorStr = typeof data?.error === 'string' ? data.error : JSON.stringify(data?.error || '')
    const isMissionError = errorStr.includes('is not defined') || errorStr.includes('updateMission')
    if (data?.msg === 'INTERNAL_ERROR' && isMissionError) {
      // Betinovi bazen URL uretip sonra mission crash yapiyor — tekrar dene (isDemo=true ile)
      // Eger demo modda URL alabiliyorsak real mode icin de genellikle calisir
      return NextResponse.json({
        msg: 'GAME_UNAVAILABLE',
        error: 'Bu oyun şu anda bakımda. Lütfen daha sonra tekrar deneyin.',
      }, { status: 503 })
    }

    return NextResponse.json(data, { status: response.ok ? 200 : response.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ msg: 'INTERNAL_ERROR', details: message }, { status: 500 })
  }
}
