"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function Preloader() {
  const [isHidden, setIsHidden] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const pathname = usePathname()

  // İlk yükleme
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHidden(true)
      setTimeout(() => setIsLoaded(true), 300)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Route değişiminde preloader'ı tekrar göster
  useEffect(() => {
    setIsLoaded(false)
    setIsHidden(false)
    const timer = setTimeout(() => {
      setIsHidden(true)
      setTimeout(() => setIsLoaded(true), 300)
    }, 800)
    return () => clearTimeout(timer)
  }, [pathname])

  if (isLoaded) return null

  return (
    <div
      id="PageSpinner"
      className={`fixed inset-0 flex items-center justify-center bg-[#1c1c1c] z-[9999999] transition-all duration-300 ${
        isHidden ? "opacity-0 invisible" : "opacity-100 visible"
      }`}
    >
      {/* Logo */}
      <div className="relative z-10">
        <img
          src="/logo.svg"
          alt="Velobet"
          style={{ height: "28px", width: "auto" }}
          className="relative z-10"
        />
      </div>

      {/* Spinner Wrapper */}
      <div className="absolute z-[1]">
        {/* Loading Screen - Gradient Circle */}
        <div className="relative w-[250px] h-[250px] rounded-full bg-gradient-to-b from-[#00d5c8] to-white animate-spin-slow">
          <span className="absolute w-full h-full rounded-full bg-gradient-to-b from-[#00d5c8] to-white blur-[5px]" />
          <span className="absolute w-full h-full rounded-full bg-gradient-to-b from-[#00d5c8] to-white blur-[10px]" />
          <span className="absolute w-full h-full rounded-full bg-gradient-to-b from-[#00d5c8] to-white blur-[25px]" />
          <span className="absolute w-full h-full rounded-full bg-gradient-to-b from-[#00d5c8] to-white blur-[100px]" />
          {/* Inner Circle */}
          <div className="absolute top-[10px] left-[10px] right-[10px] bottom-[10px] bg-[#1c1c1c] rounded-full opacity-90" />
        </div>
      </div>

      {/* Edge Ring - Spinning clockwise with longer segment */}
      <div className="absolute z-[2] w-[232px] h-[232px] rounded-full animate-spin-ring-slow"
        style={{
          background: "conic-gradient(from 0deg, transparent 0%, transparent 50%, rgba(4, 209, 197, 0.8) 65%, rgba(4, 209, 197, 0.6) 80%, rgba(4, 209, 197, 0.3) 90%, transparent 100%)",
        }}
      />
      
      {/* Innermost Dark Circle */}
      <div className="absolute z-[3] w-[220px] h-[220px] rounded-full bg-[#1c1c1c]" />

      {/* Circle Border - Outer spinning ring */}
      <div className="absolute z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 w-[300px] h-[300px] flex items-center justify-center bg-transparent">
          <div 
            className="w-[220px] h-[220px] p-1 flex items-center justify-center rounded-full animate-spin-ring"
            style={{
              background: "linear-gradient(0deg, rgba(128, 128, 128, 0.1) 33%, rgba(0, 213, 200, 1) 100%)"
            }}
          >
            <div className="w-full h-full bg-[#1c1c1c] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
