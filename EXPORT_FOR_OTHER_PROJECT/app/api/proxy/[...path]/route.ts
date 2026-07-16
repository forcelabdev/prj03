// ============================================================
// PROXY ROUTE — app/api/proxy/[...path]/route.ts
//
// TUM backend isteklerini yakalar, server-to-server iletir
// Boylece browser direkt backend'e gitmiyor — CORS yok
//
// DEGISTIR:
//   API_BASE_URL → kendi backend URL'in
//   ALLOWED_ORIGINS → kendi domain'lerin
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'

// DEGISTIR: kendi backend base URL'in
const API_BASE_URL = 'https://SENIN_BACKEND_URL.com'

// DEGISTIR: kendi domain'lerin
const ALLOWED_ORIGINS = [
  'https://www.siteadin.com',
  'https://siteadin.com',
  'http://localhost:3000',
  'http://localhost:3001',
]

function getAllowOrigin(req: NextRequest): string {
  const origin = req.headers.get('origin') || ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

// Rate limit - basit in-memory (production'da Redis kullan)
const _hits: Map<string, { count: number; resetAt: number }> = new Map()
function rateLimit(ip: string, limit = 120, windowMs = 60_000): { success: boolean; resetAt: number } {
  const now = Date.now()
  const entry = _hits.get(ip)
  if (!entry || now > entry.resetAt) {
    _hits.set(ip, { count: 1, resetAt: now + windowMs })
    return { success: true, resetAt: now + windowMs }
  }
  entry.count++
  if (entry.count > limit) return { success: false, resetAt: entry.resetAt }
  return { success: true, resetAt: entry.resetAt }
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

const STATIC_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.woff', '.woff2']
function isStaticFile(path: string) {
  return STATIC_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext))
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  // Rate limit: 120 istek / dakika per IP
  const ip = getClientIp(req)
  const rl = rateLimit(ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
      { status: 429 }
    )
  }

  const pathParts = params.path
  const search = req.nextUrl.search
  const path = pathParts.join('/')
  const targetUrl = `${API_BASE_URL}/${path}${search}`
  const isStatic = isStaticFile(path)

  const headers: Record<string, string> = {}

  if (!isStatic) {
    headers['Content-Type'] = 'application/json'
    headers['Accept'] = 'application/json'

    const authHeader = req.headers.get('authorization')
    if (authHeader) headers['Authorization'] = authHeader

    const tokenHeader = req.headers.get('x-auth-token')
    if (tokenHeader) headers['x-auth-token'] = tokenHeader

    // DEGISTIR: kendi site Origin/Referer'in
    headers['Origin'] = 'https://www.siteadin.com'
    headers['Referer'] = 'https://www.siteadin.com/'

    // MeelDev'e agentToken gonderme — 403 yapar
    const isMeelDev = path.includes('meeldev')
    if (!isMeelDev) {
      const agentToken =
        req.headers.get('x-agent-token') ||
        req.headers.get('agenttoken') ||
        process.env.NEXT_PUBLIC_AGENT_TOKEN ||
        process.env.AGENT_TOKEN ||
        ''
      if (agentToken) {
        headers['x-agent-token'] = agentToken
        headers['agentToken'] = agentToken
      }
    }
  }

  let body: string | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try { body = await req.text() } catch {}
  }

  try {
    const response = await fetch(targetUrl, { method: req.method, headers, body })
    const contentType = response.headers.get('Content-Type') || (isStatic ? 'image/webp' : 'application/json')

    // Statik dosyalar — 1 gun cache
    if (isStatic) {
      const buffer = await response.arrayBuffer()
      return new NextResponse(buffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': getAllowOrigin(req),
        },
      })
    }

    const data = await response.text()

    // Backend HTML dondurmesi — JSON'a cevir
    const isJson = contentType.includes('application/json')
    if (!isJson && data.trim().startsWith('<')) {
      return NextResponse.json(
        { success: false, error: 'Sunucu gecici olarak kullanilamiyor. Lutfen tekrar deneyin.' },
        { status: response.status, headers: { 'Access-Control-Allow-Origin': getAllowOrigin(req) } }
      )
    }

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': getAllowOrigin(req),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Proxy request failed', detail: error?.message },
      { status: 502 }
    )
  }
}
