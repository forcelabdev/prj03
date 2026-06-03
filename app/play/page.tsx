"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { gamesService } from "@/lib/services/games-service"

function PlayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [gameUrl, setGameUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const vendorCode = searchParams.get("vendor")
  const gameCode = searchParams.get("game")
  const gameName = searchParams.get("name") || "Oyun"

  useEffect(() => {
    const launchGame = async () => {
      if (!vendorCode || !gameCode) {
        setError("Oyun bilgisi eksik")
        setIsLoading(false)
        return
      }

      if (!user) {
        setError("Lütfen giriş yapın")
        setIsLoading(false)
        return
      }

      // Kullanici ID'si
      const userId = (user as any).identifier || (user as any)._id || (user as any).id || ""

      try {
        const result = await gamesService.launchGame(
          userId,
          vendorCode,
          gameCode,
          "tr"
        )

        if (result.success && result.launchUrl) {
          setGameUrl(result.launchUrl)
          // Onceki sayfayi koru, ustune bir dummy entry ekle
          // Geri basilinca dummy silinir, popstate ile yakalayip casino'ya gonderiyoruz
          window.history.pushState({ gameOpen: true }, "", window.location.href)
        } else {
          setError("Oyun şu anda açılamıyor. Lütfen daha sonra tekrar deneyin.")
        }
      } catch (err) {
        setError("Bir hata olustu")
      } finally {
        setIsLoading(false)
      }
    }

    launchGame()
  }, [vendorCode, gameCode, user])

  // Mobilde geri tusuna basilinca oyunu kapat, casino'ya don
  useEffect(() => {
    if (!gameUrl) return

    const handlePopState = () => {
      setGameUrl(null)
      router.replace("/casino")
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [gameUrl, router])

  if (isLoading) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px'
        }}
      >
        <div
          style={{
            width: 48, height: 48,
            border: '4px solid #eab308',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <p style={{ color: '#fff', fontSize: 16 }}>{gameName} yukleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px'
        }}
      >
        <p style={{ color: '#ef4444', fontSize: 16 }}>{error}</p>
        <button
          onClick={() => window.close()}
          style={{
            padding: '12px 24px', background: '#eab308',
            color: '#000', fontWeight: 'bold', borderRadius: 8, border: 'none', cursor: 'pointer'
          }}
        >
          Kapat
        </button>
      </div>
    )
  }

  if (gameUrl) {
    return (
      <iframe
        src={gameUrl}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100dvh',
          border: 'none',
          margin: 0,
          padding: 0,
          display: 'block',
          zIndex: 9999,
        }}
        allowFullScreen
        allow="fullscreen; autoplay; camera; microphone; accelerometer; gyroscope"
      />
    )
  }

  return null
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    }>
      <PlayContent />
    </Suspense>
  )
}
