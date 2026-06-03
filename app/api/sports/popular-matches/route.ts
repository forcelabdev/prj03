import { NextResponse } from "next/server"

// Gunun en populer 4 karsilasmasini cek
// API-Football: https://www.api-football.com/

// Top ligler - populerlik sirasina gore
const TOP_LEAGUE_IDS = [
  2,    // UEFA Champions League
  3,    // UEFA Europa League
  848,  // UEFA Conference League
  140,  // La Liga
  39,   // Premier League
  78,   // Bundesliga
  135,  // Serie A
  61,   // Ligue 1
  88,   // Eredivisie
  94,   // Primeira Liga
  203,  // Süper Lig
  128,  // Argentine Primera División
  71,   // Brasileirao
  253,  // MLS
]

// Cache: 5 dakika
let cache: { matches: PopularMatch[]; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000

export interface PopularMatch {
  id: string
  home: string
  away: string
  name: string // "Home - Away" formatı
  leagueId?: number
  leagueName?: string
  date?: string
  status?: string
}

// Fallback - API key yoksa veya hata olursa
const FALLBACK_MATCHES: PopularMatch[] = [
  { id: "1", home: "Atl. Madrid", away: "Barcelona", name: "Atl. Madrid - Barcelona" },
  { id: "2", home: "Liverpool", away: "PSG", name: "Liverpool - PSG" },
  { id: "3", home: "Bayern Münih", away: "Real Madrid", name: "Bayern Münih - Real Madrid" },
  { id: "4", home: "Man City", away: "Arsenal", name: "Man City - Arsenal" },
]

export async function GET() {
  try {
    // Cache kontrolü
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, data: cache.matches, cached: true })
    }

    const apiKey = process.env.API_FOOTBALL_KEY

    if (!apiKey) {
      return NextResponse.json({ success: true, data: FALLBACK_MATCHES, fallback: true })
    }

    // Bugünün tarihini al
    const today = new Date().toISOString().split("T")[0]

    // Bugün oynanacak veya canlı maçları çek
    const [liveRes, todayRes] = await Promise.all([
      fetch("https://v3.football.api-sports.io/fixtures?live=all", {
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": apiKey,
        },
        next: { revalidate: 300 },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&status=NS`, {
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": apiKey,
        },
        next: { revalidate: 300 },
      }),
    ])

    const liveData = liveRes.ok ? await liveRes.json() : { response: [] }
    const todayData = todayRes.ok ? await todayRes.json() : { response: [] }

    // Canlı + bugün başlamamış maçları birleştir
    const allFixtures = [
      ...(liveData.response || []),
      ...(todayData.response || []),
    ]

    if (allFixtures.length === 0) {
      return NextResponse.json({ success: true, data: FALLBACK_MATCHES, fallback: true })
    }

    // Top liglere göre sırala, ilk 4'ü al
    const sorted = allFixtures
      .sort((a: any, b: any) => {
        const aIdx = TOP_LEAGUE_IDS.indexOf(a.league?.id)
        const bIdx = TOP_LEAGUE_IDS.indexOf(b.league?.id)
        const aScore = aIdx === -1 ? 9999 : aIdx
        const bScore = bIdx === -1 ? 9999 : bIdx
        return aScore - bScore
      })
      .slice(0, 4)
      .map((f: any) => ({
        id: String(f.fixture?.id || Math.random()),
        home: f.teams?.home?.name || "",
        away: f.teams?.away?.name || "",
        name: `${f.teams?.home?.name} - ${f.teams?.away?.name}`,
        leagueId: f.league?.id,
        leagueName: f.league?.name,
        date: f.fixture?.date,
        status: f.fixture?.status?.short,
      }))

    // Cache'e kaydet
    cache = { matches: sorted, timestamp: Date.now() }

    return NextResponse.json({ success: true, data: sorted })
  } catch (error) {
    console.error("[v0] popular-matches error:", error)
    return NextResponse.json({ success: true, data: FALLBACK_MATCHES, fallback: true })
  }
}
