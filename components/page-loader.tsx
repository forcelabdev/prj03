"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function PageLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const isFirst = useRef(true)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ilk yukleniste splash - 1.8 saniye
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      isFirst.current = false
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  // Sayfa gecislerinde - useLayoutEffect paint oncesi calisir
  useLayoutEffect(() => {
    if (isFirst.current) return
    setVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), 800)
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      id="PageSpinner"
      className="fixed inset-0 flex items-center justify-center bg-[#1c1c1c] z-[9999999]"
    >
      {/* Logo */}
      <div className="relative z-10">
        <img
          src="/logo.svg"
          alt="Velobet"
          style={{ height: "40px", width: "auto" }}
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

      {/* Inner Thin Ring - Spinning (opposite direction) - Short segment at the edge */}
      <div className="absolute z-[2] w-[228px] h-[228px] rounded-full animate-spin-ring-slow"
        style={{
          background: "conic-gradient(from 0deg, transparent 0%, transparent 75%, rgba(100, 100, 100, 0.8) 85%, rgba(80, 80, 80, 0.6) 92%, transparent 100%)",
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
