"use client"

import { useState, useEffect, useRef } from "react"
import { useBanners } from "@/lib/hooks/useSWR"
import { type Banner } from "@/lib/services/site-service"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

function getBannerImageUrl(image: string): string {
  if (!image) return ""
  if (image.startsWith("http")) return image
  return `${API_BASE}${image}`
}

const fallbackBanners: Banner[] = [
  { _id: "1", title: "BAHİS KAZANDI", image: "" } as Banner,
  { _id: "2", title: "SLOT ALANINDA YATIRIMINI HEDİYE", image: "" } as Banner,
  { _id: "3", title: "BELL LINK OYUNLARINDA NAKİT ÖDÜL", image: "" } as Banner,
]

export function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imgAspect, setImgAspect] = useState<number | null>(null)
  const { banners: apiBanners } = useBanners("home")
  const banners: Banner[] = apiBanners && apiBanners.length > 0 ? apiBanners : fallbackBanners

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Measure real image aspect ratio from first banner
  useEffect(() => {
    const firstUrl = getBannerImageUrl(banners[0]?.image || "")
    if (!firstUrl) return
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setImgAspect(img.naturalWidth / img.naturalHeight)
      }
    }
    img.src = firstUrl
  }, [banners])

  // Auto-play
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const goTo = (index: number) => {
    setCurrentSlide((index + banners.length) % banners.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1)
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  // Use measured aspect or fallback to 16/7
  const aspect = imgAspect ?? (16 / 7)
  const paddingTop = `${(1 / aspect) * 100}%`

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        width: "100%",
        paddingTop,
        overflow: "hidden",
        touchAction: "pan-y",
      }}
    >
      {banners.map((banner, i) => {
        const imgUrl = getBannerImageUrl(banner.image || "")
        const offset = i - currentSlide
        return (
          <div
            key={banner._id || i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform: `translateX(${offset * 100}%)`,
              transition: "transform 0.4s ease",
              willChange: "transform",
            }}
          >
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={banner.title || "Banner"}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  display: "block",
                }}
                draggable={false}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0, width: "100%", height: "100%",
                  background: "linear-gradient(to right, #ca8a04, #eab308)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, padding: "0 16px", textAlign: "center" }}>
                  {banner.title}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Slider alt border */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 11, background: "hsla(0,0%,100%,.2)", zIndex: 9, pointerEvents: "none" }} />
    </div>
  )
}
