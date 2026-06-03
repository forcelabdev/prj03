'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OzelOranPage() {
  const router = useRouter()

  useEffect(() => {
    // Özel Oran sayfası sports/spor/yuksek-oran sayfasına yönlendir
    router.replace('/sports/spor/yuksek-oran')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Özel Oran</h1>
        <p className="text-foreground/60">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )
}
