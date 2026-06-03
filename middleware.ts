import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // gamelaunch subdomain'inden gelen istekleri /game/[gameCode] sayfasina yonlendir
  // Ornek: gamelaunch.velobet280.com/vs20sweetbonanza?url=xxx -> /game/vs20sweetbonanza?url=xxx
  if (hostname.startsWith('gamelaunch.')) {
    // Root path disindaki istekleri /game/ prefix'i ile rewrite et
    if (pathname !== '/' && !pathname.startsWith('/game/') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const gameCode = pathname.slice(1) // baştaki / karakterini kaldir
      const url = request.nextUrl.clone()
      url.pathname = `/game/${gameCode}`
      return NextResponse.rewrite(url)
    }
  }

  // Ana sayfa (/) isteklerini /sports'a yonlendir, query parametrelerini koru
  if (pathname === '/') {
    const url = new URL('/sports', request.url)
    // ?a= gibi tum query parametrelerini yeni URL'e tasI
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()

  // Güvenlik header'ları
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' https: http:",
      "connect-src 'self' https://apievrymatrix5d84k321.com https://apifonbet.com wss: ws:",
      "frame-src 'self' https:",
      "frame-ancestors 'self'",
    ].join("; ")
  )
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  )

  return response
}

export const config = {
  matcher: [
    // Statik dosyalar ve API route'lari haric tum sayfalari eslestir
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
