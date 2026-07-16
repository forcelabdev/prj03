"use client"

// ============================================================
// GAME PAGE — app/game/[gameCode]/page.tsx
//
// KRITIK: Bu sayfa launch YAPMAZ.
// Launch oyuna tiklaninca (modal/casino page) onceden yapilir,
// launchUrl ?url= parametresi ile buraya gelir.
// Bu sayfa sadece URL'i okur, iframe'e verir. BITTI.
//
// useAuth YOKTUR.
// user / ready / isLoggedIn YOKTUR.
// launchStartedRef YOKTUR.
// Hic launch logic YOKTUR.
// => HMR crash olmaz, spin sonrasi donma olmaz.
//
// Mobil icin gelen URL: /game/{gameCode}?url={launchUrl}&returnUrl={returnUrl}
// Desktop icin: modal icinde DesktopMultiLauncher iframe'i kullanir, bu sayfa acilmaz
// ============================================================

import { useState, useEffect, use, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function GameContent({ params }: { params: Promise<{ gameCode: string }> }) {
  const resolvedParams = use(params)
  const gameCode = resolvedParams.gameCode
  const searchParams = useSearchParams()
  const router = useRouter()

  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [referrerUrl, setReferrerUrl] = useState<string | null>(null)

  // Tek useEffect — sadece searchParams dependency'i var
  // Auth dependency YOK — HMR'da hook sayisi degismez, donma olmaz
  useEffect(() => {
    const urlParam = searchParams.get("url")
    const returnUrlParam = searchParams.get("returnUrl")

    if (urlParam) setGameUrl(urlParam)

    if (returnUrlParam) {
      setReferrerUrl(returnUrlParam)
    } else {
      // returnUrl yoksa ana sayfaya don
      const baseDomain = window.location.hostname.replace(/^gamelaunch\./, '')
      const returnPath = gameCode === 'sportsbook' ? '/sports' : '/casino'
      setReferrerUrl(`https://${baseDomain}${returnPath}`)
    }

    setIsLoading(false)
  }, [searchParams, gameCode])

  // Geri tusu yonetimi — ayri useEffect, referrerUrl dependency
  useEffect(() => {
    if (!referrerUrl) return

    const handlePopState = (e: PopStateEvent) => {
      if (!e.state?.game) {
        window.location.href = referrerUrl
      }
    }

    if (!window.history.state?.game) {
      window.history.replaceState({ game: true }, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [referrerUrl])

  if (isLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #00d4b4", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#fff", marginTop: 16, fontSize: 18 }}>Oyun yukleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!gameUrl) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ backgroundColor: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", borderRadius: 8, padding: "16px 24px", marginBottom: 20 }}>
          <p style={{ color: "#f87171", fontSize: 16, textAlign: "center" }}>Oyun URL&apos;i bulunamadi</p>
        </div>
        <button
          onClick={() => router.back()}
          style={{ backgroundColor: "#00d4b4", color: "#000", fontWeight: 600, fontSize: 16, padding: "12px 32px", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Geri Don
        </button>
      </div>
    )
  }

  // Tam ekran iframe — header/footer yok, auth yok
  return (
    <iframe
      src={gameUrl}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
      allow="fullscreen; autoplay; camera; microphone; accelerometer; gyroscope"
      allowFullScreen
    />
  )
}

export default function GamePage({ params }: { params: Promise<{ gameCode: string }> }) {
  return (
    <Suspense fallback={
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #00d4b4", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#fff", marginTop: 16, fontSize: 18 }}>Yukleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    }>
      <GameContent params={params} />
    </Suspense>
  )
}
