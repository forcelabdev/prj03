import { type NextRequest, NextResponse } from "next/server"
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

const API_BASE_URL = "https://apievrymatrix5d84k321.com"

const ALLOWED_ORIGINS = [
  "https://www.velobet280.com",
  "https://velobet280.com",
  "http://localhost:3000",
  "http://localhost:3001",
]

function getAllowOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin") || ""
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
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

const STATIC_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".woff", ".woff2"]

function isStaticFile(path: string) {
  return STATIC_EXTENSIONS.some(ext => path.toLowerCase().endsWith(ext))
}

const KNOWN_DOMAINS: Record<string, string> = {
  "apifonbet.com": "https://apifonbet.com",
  "apievrymatrix5d84k321.com": "https://apievrymatrix5d84k321.com",
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  // Rate limit: 120 istek / dakika per IP
  const ip = getClientIp(req)
  const rl = rateLimit(ip, 'proxy', { limit: 120, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const pathParts = params.path
  const search = req.nextUrl.search

  // Eğer path "domain.com/..." ile başlıyorsa o domain'e yönlendir
  let targetUrl: string
  let path: string
  const possibleDomain = pathParts[0]
  if (KNOWN_DOMAINS[possibleDomain]) {
    path = pathParts.slice(1).join("/")
    targetUrl = `${KNOWN_DOMAINS[possibleDomain]}/${path}${search}`
  } else {
    path = pathParts.join("/")
    targetUrl = `${API_BASE_URL}/${path}${search}`
  }

  const isStatic = isStaticFile(path)

  const headers: Record<string, string> = {}

  if (!isStatic) {
    headers["Content-Type"] = "application/json"
    headers["Accept"] = "application/json"

    const authHeader = req.headers.get("authorization")
    if (authHeader) headers["Authorization"] = authHeader

    const tokenHeader = req.headers.get("x-auth-token")
    if (tokenHeader) headers["x-auth-token"] = tokenHeader

    headers["Origin"] = "https://www.velobet280.com"
    headers["Referer"] = "https://www.velobet280.com/"

    // MeelDev sadece x-auth-token bekler, agentToken gönderilince 403 yapar
    const isMeelDev = path.includes("meeldev")
    if (!isMeelDev) {
      const agentToken = req.headers.get("x-agent-token") || req.headers.get("agenttoken") || process.env.NEXT_PUBLIC_AGENT_TOKEN || process.env.AGENT_TOKEN
      if (agentToken) {
        headers["x-agent-token"] = agentToken
        headers["agentToken"] = agentToken
      }
    }
  }

  let body: string | undefined
  if (req.method !== "GET" && req.method !== "HEAD") {
    try { body = await req.text() } catch {}
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    })

    const contentType = response.headers.get("Content-Type") || (isStatic ? "image/webp" : "application/json")

    if (isStatic) {
      const buffer = await response.arrayBuffer()
      return new NextResponse(buffer, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": getAllowOrigin(req),
        },
      })
    }

    const data = await response.text()

    if (response.status === 403 || response.status === 401) {
      console.log("[v0] CB backend hata:", response.status, "path:", path, "body:", data)
    }

    // Backend HTML döndürdüyse JSON'a çevir
    const isJsonResponse = contentType.includes("application/json")
    if (!isJsonResponse && data.trim().startsWith("<")) {
      console.log("[v0] Backend returned HTML instead of JSON, path:", path, "status:", response.status)
      return NextResponse.json(
        { success: false, error: "Sunucu geçici olarak kullanılamıyor. Lütfen tekrar deneyin." },
        { status: response.status, headers: { "Access-Control-Allow-Origin": getAllowOrigin(req) } }
      )
    }

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": getAllowOrigin(req),
      },
    })
  } catch (error: any) {
    console.error("[v0] Proxy error:", error?.message)
    return NextResponse.json({ error: "Proxy request failed", detail: error?.message }, { status: 502 })
  }
}
