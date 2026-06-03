"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { usePathname } from "next/navigation"

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

interface GameRaw  { name: string; image: string; code: string }
interface CardItem { id: string; gameName: string; gameImage: string; gameCode: string; winAmount: number }

type Phase = "idle" | "exit" | "enter"

export function MobileWinnerBar() {
  const pathname   = usePathname()
  const poolRef    = useRef<GameRaw[]>([])
  const pendingRef = useRef<CardItem | null>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const [card, setCard]   = useState<CardItem | null>(null)
  const [phase, setPhase] = useState<Phase>("idle")

  if (pathname === "/register") return null

  const pickRandom = useCallback((): CardItem | null => {
    const pool = poolRef.current
    if (!pool.length) return null
    const g = pool[Math.floor(Math.random() * pool.length)]
    return {
      id:        `m-${Date.now()}`,
      gameName:  g.name,
      gameImage: g.image,
      gameCode:  g.code,
      winAmount: randomAmount(),
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/winners-pool")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (cancelled || !json) return
        const raw: GameRaw[] = (json.games || []).filter((g: GameRaw) => g.image && g.name)
        if (raw.length) {
          poolRef.current = raw
          const first = pickRandom()
          if (first) { setCard(first); setPhase("idle") }
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [pickRandom])

  useEffect(() => {
    if (!card) return
    timerRef.current = setInterval(() => {
      const next = pickRandom()
      if (!next) return
      pendingRef.current = next
      setPhase("exit")
      setTimeout(() => {
        setCard(pendingRef.current)
        setPhase("enter")
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPhase("idle"))
        })
      }, 320)
    }, 3200)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [card, pickRandom])

  if (!card) return null

  const transform =
    phase === "exit"  ? "translateX(-110%)" :
    phase === "enter" ? "translateX(110%)"  : "translateX(0)"
  const transition =
    phase === "enter" ? "none" : "transform 0.32s ease"

  return (
    <div
      className="lg:hidden"
      style={{
        width:           "100%",
        backgroundColor: "rgba(0,0,0,0.72)",
        borderTop:       "1px solid rgba(255,255,255,0.08)",
        overflow:        "hidden",
        display:         "flex",
        justifyContent:  "center",
        alignItems:      "center",
      }}
    >
      {/* Slide wrapper — overflow hidden dışarıda, transform buraya uygulanır */}
      <div style={{ width: "100%", height: "82px", display: "flex", justifyContent: "center", alignItems: "center", transform, transition }}>
        <a
          href={card.gameCode ? `/game/${card.gameCode}` : "#"}
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "14px",
            height:         "82px",
            textDecoration: "none",
            cursor:         "pointer",
          }}
        >
          <div
            className="flex-shrink-0 rounded overflow-hidden"
            style={{ width: "63px", height: "33px", minWidth: "63px", background: "#1a1a2e" }}
          >
            <img
              key={card.id}
              src={card.gameImage}
              alt={card.gameName}
              draggable={false}
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement
                if (!el.dataset.fallback) {
                  el.dataset.fallback = "1"
                  el.src = "https://placehold.co/63x33/1a1a2e/4ade80?text=Game"
                }
              }}
            />
          </div>
          <div
            style={{
              height:         "46px",
              display:        "flex",
              flexDirection:  "column",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "13px", color: "#9ca3af", letterSpacing: "0.15em" }}>*****</span>
              <span style={{ fontSize: "13px", color: "#6b7280", margin: "0 4px" }}>-</span>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{fmt(card.winAmount)} ₺</span>
            </div>
            <span style={{ fontSize: "13px", color: "#fff" }}>{card.gameName}</span>
          </div>
        </a>
      </div>
    </div>
  )
}
