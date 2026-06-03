import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { validateEmail, validatePassword } from '@/lib/validators'

export async function POST(request: NextRequest) {
  // Rate limit: 5 istek / dakika
  const ip = getClientIp(request)
  const rl = rateLimit(ip, 'login', { limit: 5, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  try {
    const body = await request.json()
    const { email, password } = body

    // Input validation
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 })
    }
    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 })
    }

    // Gerçek auth: harici API'ya ilet
    const agentToken = process.env.NEXT_PUBLIC_AGENT_TOKEN || process.env.AGENT_TOKEN
    if (!agentToken) {
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası.' }, { status: 500 })
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://apievrymatrix5d84k321.com'
    const upstream = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AgentToken': agentToken,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || 'Giriş başarısız.' },
        { status: upstream.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 })
  }
}
