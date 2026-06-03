import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { validateEmail, validatePassword, validateUsername, sanitizeString } from '@/lib/validators'

export async function POST(request: NextRequest) {
  // Rate limit: 3 istek / dakika
  const ip = getClientIp(request)
  const rl = rateLimit(ip, 'register', { limit: 3, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  try {
    const body = await request.json()
    const { username, email, password, phone, firstName, lastName } = body

    // Input validation
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 })
    }
    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 })
    }
    const usernameCheck = validateUsername(username)
    if (!usernameCheck.valid) {
      return NextResponse.json({ error: usernameCheck.error }, { status: 400 })
    }

    // Gerçek kayıt: harici API'ya ilet
    const agentToken = process.env.NEXT_PUBLIC_AGENT_TOKEN || process.env.AGENT_TOKEN
    if (!agentToken) {
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası.' }, { status: 500 })
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://apievrymatrix5d84k321.com'
    const upstream = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AgentToken': agentToken,
      },
      body: JSON.stringify({
        username: sanitizeString(username, 32),
        email: email.trim().toLowerCase(),
        password,
        phone: sanitizeString(phone, 20),
        firstName: sanitizeString(firstName, 50),
        lastName: sanitizeString(lastName, 50),
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || 'Kayıt başarısız.' },
        { status: upstream.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 })
  }
}
