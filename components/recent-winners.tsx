"use client"

import { useEffect, useRef, useState, useCallback } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://apievrymatrix5d84k321.com"

interface DisplayItem {
  id: string
  gameName: string
  gameImage: string
  gameCode: string
  winAmount: number
}

// Ağırlıklı rastgele tutar:
// %50 → 100k-300k (çok)
// %30 → 300k-600k (orta)
// %15 → 600k-1.600k (az)
//  %5 → 1.600k-2.600k (nadir)
function randomAmount(): number {
  const r = Math.random()
  if (r < 0.50) return Math.floor(Math.random() * (300000  - 100000)  + 100000)
  if (r < 0.80) return Math.floor(Math.random() * (600000  - 300000)  + 300000)
  if (r < 0.95) return Math.floor(Math.random() * (1600000 - 600000)  + 600000)
  return            Math.floor(Math.random() * (2600000 - 1600000) + 1600000)
}

function fmt(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const CARD_W = 285

function WinnerCard({ item, left, transitioning }: { item: DisplayItem; left: number; transitioning: boolean }) {
  return (
    <a
      href={item.gameCode ? `/game/${item.gameCode}` : "#"}
      style={{
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        height: "70px",
        width: `${CARD_W}px`,
        minWidth: `${CARD_W}px`,
        position: "absolute",
        top: "0px",
        left: `${left}px`,
        verticalAlign: "top",
        transform: transitioning ? `translateX(-${CARD_W}px)` : "translateX(0)",
        transition: transitioning ? "transform 0.4s linear" : "none",
        userSelect: "none",
        overflow: "hidden",
        padding: "0 16px 0 16px",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {/* Oyun görseli */}
      <div className="flex-shrink-0 rounded overflow-hidden bg-zinc-800" style={{ width: "55px", height: "33px" }}>
        {item.gameImage ? (
          <img
            src={item.gameImage}
            alt={item.gameName}
            draggable={false}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement
              el.style.display = "none"
              const p = el.parentElement
              if (p) {
                p.style.display = "flex"
                p.style.alignItems = "center"
                p.style.justifyContent = "center"
                p.style.color = "#6b7280"
                p.style.fontSize = "13px"
                p.style.fontWeight = "700"
                p.textContent = item.gameName.charAt(0).toUpperCase()
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
            {item.gameName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Bilgi */}
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 tracking-widest" style={{ fontSize: "16px" }}>*****</span>
          <span className="text-gray-500 mx-1">-</span>
          <span className="font-bold" style={{ fontSize: "18px", color: "#fff" }}>{fmt(item.winAmount)} ₺</span>
        </div>
        <span className="text-sm" style={{ color: "#fff", marginTop: "-2px", display: "block" }}>{item.gameName}</span>
      </div>
    </a>
  )
}

interface GameRaw { name: string; image: string; code: string }

function pickRandom(pool: GameRaw[], count: number): DisplayItem[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((g, i) => ({
    id: `r-${i}-${Date.now()}`,
    gameName: g.name,
    gameImage: g.image,
    gameCode: g.code,
    winAmount: randomAmount(),
  }))
}

export function RecentWinners() {
  const poolRef = useRef<GameRaw[]>([])
  const [items, setItems]                 = useState<DisplayItem[]>([])
  const [offset, setOffset]               = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPool = useCallback(async () => {
    const collected: GameRaw[] = []

    try {
      // Server-side proxy — CORS sorununu aşar
      const res = await fetch("/api/winners-pool")
      if (res.ok) {
        const json = await res.json()
        const raw: { name: string; image: string; code: string }[] = json.games || []
        for (const g of raw) {
          if (g.image && g.name) collected.push({ name: g.name, image: g.image, code: g.code })
        }
      }
    } catch { /* devam */ }

    if (collected.length >= 4) {
      poolRef.current = collected
      return collected
    }

    // Fallback
    const FB: GameRaw[] = [
      { name: "Gates of Olympus 1000",   image: "https://apievrymatrix5d84k321.com/uploads/1776481732968-582977181.svg", code: "vs20gateslive" },
      { name: "Sweet Bonanza 1000",      image: "https://apievrymatrix5d84k321.com/uploads/1776481735083-47722627.png",  code: "vs20sb1000" },
      { name: "Sugar Rush 1000",         image: "https://apievrymatrix5d84k321.com/uploads/1776481734686-8736745.png",   code: "vs20sr1000" },
      { name: "Starlight Princess 1000", image: "https://apievrymatrix5d84k321.com/uploads/1776481734430-447545385.png", code: "vs20slprincess1000" },
      { name: "Aviator",                 image: "https://apievrymatrix5d84k321.com/uploads/1776481724929-586379124.png", code: "aviator" },
      { name: "Sweet Bonanza Dice",      image: "https://apievrymatrix5d84k321.com/uploads/1776481734848-403961074.png", code: "vs20sbdice" },
      { name: "Big Bass 1000",           image: "https://apievrymatrix5d84k321.com/uploads/1776481725109-70319873.png",  code: "vs10bb1000" },
      { name: "Wisdom of Athena 1000",   image: "https://apievrymatrix5d84k321.com/uploads/1776481724682-363326654.png", code: "vs20woa1000" },
      { name: "Gates Xmas 1000",         image: "https://apievrymatrix5d84k321.com/uploads/1776481733307-497759033.png", code: "vs20gatexmas1000" },
      { name: "SW Candyland",            image: "https://apievrymatrix5d84k321.com/uploads/1776481725284-553072934.png", code: "vs20swcandyland" },
      { name: "Money Time",              image: "https://apievrymatrix5d84k321.com/uploads/1776481733799-316758010.png", code: "vs20moneytime" },
      { name: "Casino Hold'em",          image: "https://apievrymatrix5d84k321.com/uploads/1776481733603-906492950.png", code: "casino-holdem" },
    ]
    poolRef.current = FB
    return FB
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchPool().then((pool) => {
      if (!cancelled) {
        // Havuzun tamamını (max 200) items olarak başlat — döngüde çeşitlilik artar
        setItems(pickRandom(pool, Math.min(pool.length, 200)))
        setOffset(0)
      }
    })
    return () => { cancelled = true }
  }, [fetchPool])

  useEffect(() => {
    if (items.length < 4) return
    timerRef.current = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setOffset((prev) => (prev + 1) % items.length)
        setTransitioning(false)
      }, 410)
    }, 3000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [items.length])

  if (items.length < 4) return null

  const VISIBLE    = 3
  const containerW = VISIBLE * CARD_W
  const visible    = Array.from({ length: VISIBLE + 1 }, (_, i) => items[(offset + i) % items.length])

  return (
    <div style={{ overflow: "hidden", height: "71px", width: `${containerW}px`, position: "relative" }}>
      {visible.map((item, i) => (
        <WinnerCard
          key={`${offset}-${i}`}
          item={item}
          left={i * CARD_W}
          transitioning={transitioning}
        />
      ))}
    </div>
  )
}
