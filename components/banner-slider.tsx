"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { siteService } from "@/lib/services/site-service"

/** /promotionX linkini /promotions?promo=X'e çevirir. Diğer linklere dokunmaz. */
function resolveLink(link: string): string {
  if (!link) return ""
  const match = link.match(/^\/promotion(\d+)$/i)
  if (match) return `/promotions?promo=${match[1]}`
  return link
}

// Casino ile birebir aynı banner tipi
interface RawBanner {
  title: string
  image: string
  link: string
  gradient: string
}

interface BannerSliderProps {
  position?: string
  fallbackTitle?: string
}

export default function BannerSlider({ position = "slots", fallbackTitle = "" }: BannerSliderProps) {
  const router = useRouter()
  const [banners, setBanners]             = useState<RawBanner[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isMobile, setIsMobile]           = useState(false)
  const [isMobileReady, setIsMobileReady] = useState(false)

  const startX         = useRef<number>(0)
  const isPointerDown  = useRef(false)
  const didSwipe       = useRef(false)
  const filteredLenRef = useRef(0)

  // isMobile'i ilk mount'ta senkron belirle — banner göstermeden önce
  useEffect(() => {
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    setIsMobileReady(true)

    const check = () => {
      setIsMobile(window.innerWidth < 1024)
      setCurrentBanner(0)
    }
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        let res = await siteService.getBannersByPosition(position)
        if (!res.success || !res.banners || res.banners.length === 0) {
          res = await siteService.getBanners()
        }
        if (res.success && res.banners && res.banners.length > 0) {
          setBanners(
            res.banners.map((b: any) => {
              let imageUrl = b.image || b.imageUrl || b.img || b.desktop_image || b.desktopImage || b.photo || b.src || ""
              if (imageUrl && imageUrl.startsWith("/")) imageUrl = `https://apievrymatrix5d84k321.com${imageUrl}`
              return {
                title:    b.title || b.name || "",
                image:    imageUrl,
                link:     b.link || b.href || b.url || "",
                gradient: "from-[#007a6e] via-[#00a896] to-[#00d4b4]",
              }
            })
          )
          setCurrentBanner(0)
        }
      } catch {}
    }
    fetchBanners()
  }, [position])

  // title prefix'e göre filtrele — isMobile değiştikçe yeniden hesap
  const filteredBanners = banners.filter((b) => {
    const title = (b.title || "").toLowerCase()
    if (title.startsWith("mobile"))  return isMobile
    if (title.startsWith("desktop")) return !isMobile
    return true
  })

  // ref'i her render'da güncelle — swipe handler'lar stale closure olmayacak
  filteredLenRef.current = filteredBanners.length

  const safeBannerIndex = filteredBanners.length > 0 ? currentBanner % filteredBanners.length : 0

  // Auto-play
  useEffect(() => {
    if (filteredBanners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentBanner(p => (p + 1) % filteredLenRef.current)
    }, 10000)
    return () => clearInterval(timer)
  }, [filteredBanners.length])

  const goNext = () => setCurrentBanner(p => (p + 1) % filteredLenRef.current)
  const goPrev = () => setCurrentBanner(p => (p - 1 + filteredLenRef.current) % filteredLenRef.current)

  // Pointer events — hem touch hem mouse'u kapsar, setPointerCapture ile container dışı da çalışır
  const SWIPE_THRESHOLD = isMobile ? 30 : 50

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current        = e.clientX
    isPointerDown.current = true
    didSwipe.current      = false
    // Pointer'ı yakala — container dışına çıksa bile pointerup tetiklenir
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return
    const diff = Math.abs(startX.current - e.clientX)
    if (diff > SWIPE_THRESHOLD) didSwipe.current = true
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current) return
    isPointerDown.current = false
    const diff = startX.current - e.clientX
    if (didSwipe.current && filteredLenRef.current > 1) {
      diff > 0 ? goNext() : goPrev()
    }
    // didSwipe'ı burada sıfırlama — handleClick içinde kontrol edilecek
  }

  const handleClick = (link: string) => {
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    const resolved = resolveLink(link)
    if (!resolved) return
    if (resolved.startsWith("/")) {
      router.push(resolved)
    } else {
      window.open(resolved, "_blank", "noopener,noreferrer")
    }
  }

  // isMobile henüz belirlenmedi — hiçbir şey render etme
  if (!isMobileReady) return null

  if (filteredBanners.length === 0) {
    return (
      <div className="relative w-full h-[232px] lg:h-[330px] flex items-center justify-center bg-gradient-to-r from-[#007a6e] via-[#00a896] to-[#00d4b4]">
        {fallbackTitle && <h1 className="text-black text-3xl lg:text-4xl font-black uppercase tracking-tight">{fallbackTitle}</h1>}
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-[232px] lg:h-[330px] overflow-hidden select-none"
      style={{ touchAction: "none", cursor: "pointer" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {filteredBanners.map((banner, i) => {
        const offset = (i - safeBannerIndex) * 100
        return (
          <div
            key={i}
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              transform: `translateX(${offset}%)`,
              transition: "transform 0.3s ease-out",
              willChange: "transform",
            }}
          >
            {!banner.image ? (
              <div className={`w-full h-full bg-gradient-to-r ${banner.gradient} flex items-center justify-center`}>
                <h1 className="text-black text-3xl lg:text-4xl font-black tracking-tight uppercase">{banner.title || fallbackTitle}</h1>
              </div>
            ) : banner.link ? (
              <div
                className="block w-full h-full cursor-pointer"
                draggable={false}
                onClick={() => handleClick(banner.link)}
              >
                <img src={banner.image} alt={banner.title} draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", pointerEvents: "none", userSelect: "none" }} />
              </div>
            ) : (
              <img src={banner.image} alt={banner.title} draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", pointerEvents: "none", userSelect: "none" }} />
            )}
          </div>
        )
      })}

      <div className="absolute bottom-0 left-0 w-full z-[9] pointer-events-none"
        style={{ height: 11, background: "hsla(0,0%,100%,.2)" }} />
    </div>
  )
}
