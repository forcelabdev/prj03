'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MovePlusPage() {
  const router = useRouter()

  useEffect(() => {
    // VELO+ sayfası ana sayfaya yönlendir
    router.replace('/')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">VELO+</h1>
        <p className="text-foreground/60">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )
}
