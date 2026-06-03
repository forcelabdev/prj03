"use client"

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

  useEffect(() => {
    // URL parametrelerinden gameUrl ve returnUrl al
    const urlParam = searchParams.get("url")
    const returnUrlParam = searchParams.get("returnUrl")
    
    if (urlParam) {
      setGameUrl(urlParam)
    }
    
    // returnUrl parametresini kullan, yoksa ana domain'e don
    if (returnUrlParam) {
      setReferrerUrl(returnUrlParam)
    } else {
      const baseDomain = window.location.hostname.replace(/^gamelaunch\./, '')
      // Sportsbook ise /sports, degikse /casino
      const returnPath = gameCode === 'sportsbook' ? '/sports' : '/casino'
      setReferrerUrl(`https://${baseDomain}${returnPath}`)
    }
    
    setIsLoading(false)
  }, [searchParams])
  
  useEffect(() => {
    if (!referrerUrl) return
    
    // Geri tusuna basinca returnUrl'e don
    const handlePopState = (e: PopStateEvent) => {
      // Sadece game state'i olmayan popstate'lerde geri git
      if (!e.state?.game) {
        window.location.href = referrerUrl
      }
    }
    
    // Sadece bir kez pushState yap (eger zaten game state yoksa)
    if (!window.history.state?.game) {
      window.history.replaceState({ game: true }, '', window.location.href)
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [referrerUrl])



  // Yukleniyor
  if (isLoading) {
    return (
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p style={{ color: "#fff", marginTop: 16, fontSize: 18 }}>Oyun yukleniyor...</p>
      </div>
    )
  }

  // Oyun URL yoksa hata goster
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

  // Game iframe - tam ekran, header/footer yok
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
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p style={{ color: "#fff", marginTop: 16, fontSize: 18 }}>Yukleniyor...</p>
      </div>
    }>
      <GameContent params={params} />
    </Suspense>
  )
}
