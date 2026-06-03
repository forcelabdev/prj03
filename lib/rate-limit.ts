// In-memory rate limiter for API routes
// Stores request counts per IP with sliding window

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  limit: number       // max requests
  windowMs: number    // time window in ms
}

export function rateLimit(ip: string, key: string, config: RateLimitConfig): { success: boolean; remaining: number; resetAt: number } {
  const storeKey = `${key}:${ip}`
  const now = Date.now()

  const entry = store.get(storeKey)

  if (!entry || now > entry.resetAt) {
    // Fresh window
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + config.windowMs }
    store.set(storeKey, newEntry)
    return { success: true, remaining: config.limit - 1, resetAt: newEntry.resetAt }
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return new Response(
    JSON.stringify({ error: "Çok fazla istek gönderildi. Lütfen bekleyin.", retryAfter }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  )
}
