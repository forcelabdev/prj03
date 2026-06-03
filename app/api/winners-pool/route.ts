import { NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://apievrymatrix5d84k321.com"
const SLUGS = ["pragmaticplay", "egt-amusnet", "egt-digital", "hacksaw", "canlicasino"]

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const collected: { name: string; image: string; code: string }[] = []

  const results = await Promise.allSettled(
    SLUGS.map((slug) =>
      fetch(`${API_BASE}/public/games/category/${slug}?limit=200`, {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 0 },
      }).then((r) => (r.ok ? r.json() : null))
    )
  )

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue
    const json = result.value
    const raw: Record<string, string>[] = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json)
      ? json
      : []
    for (const g of raw) {
      const banner = g.banner || g.image || g.cover || ""
      const image = banner.startsWith("http") ? banner : banner ? `${API_BASE}${banner}` : ""
      const name = g.game_name || g.name || ""
      const code = g.game_code || g.gameCode || ""
      if (image && name) collected.push({ name, image, code })
    }
  }

  return NextResponse.json({ games: collected })
}
