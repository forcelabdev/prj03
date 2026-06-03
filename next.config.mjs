/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Router cache'i disable et - tiklama sonrasi stale sayfa goruntusunu engeller
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "apievrymatrix5d84k321.com" },
      { protocol: "https", hostname: "*.apievrymatrix5d84k321.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 24 saat
  },
  // HTTP response cache headers + CSP
  async headers() {
    return [
      {
        source: "/api/proxy/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.livechatinc.com https://secure.livechatinc.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
              "script-src-elem 'self' 'unsafe-inline' https://cdn.livechatinc.com https://secure.livechatinc.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' https:",
              "connect-src 'self' https://apievrymatrix5d84k321.com https://*.apievrymatrix5d84k321.com wss://apievrymatrix5d84k321.com https://cdn.livechatinc.com https://secure.livechatinc.com https://api.livechatinc.com",
              "frame-src 'self' https: http:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
