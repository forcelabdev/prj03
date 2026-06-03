"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onComplete, 500)
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Golden Ring with Logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute h-64 w-64 rounded-full border-4 border-[#00d4b4] animate-pulse-glow" />
        
        {/* Spinning gradient ring */}
        <div className="absolute h-64 w-64 rounded-full animate-spin-slow">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00d4b4] via-[#00f0cc] to-[#00d4b4] opacity-50 blur-sm" />
        </div>

        {/* Inner dark circle with logo */}
        <div className="relative z-10 flex h-56 w-56 items-center justify-center rounded-full bg-neutral-900 border-2 border-[#00d4b4]/50">
          <img src="/logo.svg" alt="Velobet" style={{ width: "140px", height: "auto" }} />
        </div>
      </div>

      {/* Version number */}
      <div className="absolute bottom-12 text-neutral-400 text-sm">
        1.0.331
      </div>
    </div>
  )
}
