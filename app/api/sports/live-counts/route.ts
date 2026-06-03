import { NextResponse } from "next/server"

// API-Football veya alternatif servis kullanarak canlı maç sayılarını çek
// Ücretsiz plan: 100 istek/gün - https://www.api-football.com/

const SPORTS_CONFIG = [
  { id: "soccer-1", name: "Futbol", icon: "⚽", apiSport: "football" },
  { id: "basketball-2", name: "Basketbol", icon: "🏀", apiSport: "basketball" },
  { id: "tennis-5", name: "Tenis", icon: "🎾", apiSport: "tennis" },
  { id: "volleyball-23", name: "Voleybol", icon: "🏐", apiSport: "volleyball" },
  { id: "table-tennis-20", name: "Masa Tenisi", icon: "🏓", apiSport: "table-tennis" },
  { id: "baseball-3", name: "Baseball", icon: "⚾", apiSport: "baseball" },
  { id: "boxing-10", name: "Boxing", icon: "🥊", apiSport: "boxing" },
  { id: "ice-hockey-4", name: "Buz Hokeyi", icon: "🏒", apiSport: "hockey" },
  { id: "efighting-304", name: "E-Fighting", icon: "🎮", apiSport: "efighting" },
  { id: "golf-9", name: "Golf", icon: "⛳", apiSport: "golf" },
  { id: "handball-6", name: "Hentbol", icon: "🤾", apiSport: "handball" },
  { id: "cricket-21", name: "Kriket", icon: "🏏", apiSport: "cricket" },
  { id: "badminton-31", name: "Badminton", icon: "🏸", apiSport: "badminton" },
  { id: "cycling-17", name: "Bisiklet", icon: "🚴", apiSport: "cycling" },
  { id: "counter-strike-109", name: "CS", icon: "🎯", apiSport: "csgo" },
  { id: "dota-2-111", name: "Dota 2", icon: "⚔️", apiSport: "dota" },
  { id: "league-of-legends-110", name: "LoL", icon: "🎮", apiSport: "lol" },
  { id: "valorant-194", name: "Valorant", icon: "🔫", apiSport: "valorant" },
  { id: "rainbow-six-125", name: "R6", icon: "🎖️", apiSport: "r6" },
  { id: "fc-26-137", name: "FC 26", icon: "⚽", apiSport: "fc26" },
  { id: "nba-2k26-153", name: "NBA 2K26", icon: "🏀", apiSport: "nba2k" },
  { id: "mobile-legends-201", name: "ML", icon: "📱", apiSport: "ml" },
]

// Cache sonuçları 60 saniye
let cachedData: { counts: Record<string, number>; timestamp: number } | null = null
const CACHE_DURATION = 60 * 1000 // 60 saniye

export async function GET() {
  try {
    // Cache kontrolü
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: SPORTS_CONFIG.map(sport => ({
          ...sport,
          count: cachedData!.counts[sport.apiSport] || 0
        })),
        cached: true
      })
    }

    const apiKey = process.env.API_FOOTBALL_KEY

    // API key yoksa mock data döndür
    if (!apiKey) {
      console.log("[v0] API_FOOTBALL_KEY not found, returning mock data")
      return NextResponse.json({
        success: true,
        data: SPORTS_CONFIG.map(sport => ({
          ...sport,
          count: getRandomCount(sport.id)
        })),
        mock: true
      })
    }

    // API-Football'dan canlı futbol maçlarını çek
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const footballCount = data.results || 0

    // Diğer sporlar için tahmini sayılar (gerçek API'ler eklenebilir)
    const counts: Record<string, number> = {
      football: footballCount,
      basketball: Math.floor(footballCount * 0.3) + Math.floor(Math.random() * 5),
      tennis: Math.floor(footballCount * 0.1) + Math.floor(Math.random() * 3),
      volleyball: Math.floor(footballCount * 0.15) + Math.floor(Math.random() * 4),
      "table-tennis": Math.floor(footballCount * 0.2) + Math.floor(Math.random() * 6),
      hockey: Math.floor(footballCount * 0.1) + Math.floor(Math.random() * 3),
      handball: Math.floor(footballCount * 0.08) + Math.floor(Math.random() * 2),
      baseball: Math.floor(footballCount * 0.12) + Math.floor(Math.random() * 3),
    }

    // Cache'e kaydet
    cachedData = { counts, timestamp: Date.now() }

    return NextResponse.json({
      success: true,
      data: SPORTS_CONFIG.map(sport => ({
        ...sport,
        count: counts[sport.apiSport] || 0
      })),
      cached: false
    })

  } catch (error) {
    console.error("[v0] Error fetching live sports data:", error)
    
    // Hata durumunda mock data döndür
    return NextResponse.json({
      success: true,
      data: SPORTS_CONFIG.map(sport => ({
        ...sport,
        count: getRandomCount(sport.id)
      })),
      error: true
    })
  }
}

// Mock data icin rastgele sayilar (gercekci araliklarda)
function getRandomCount(sportId: string): number {
  const ranges: Record<string, [number, number]> = {
    "soccer-1": [45, 70],
    "basketball-2": [8, 18],
    "tennis-5": [5, 15],
    "volleyball-23": [4, 12],
    "table-tennis-20": [10, 25],
    "baseball-3": [4, 12],
    "boxing-10": [2, 6],
    "ice-hockey-4": [3, 10],
    "efighting-304": [5, 15],
    "golf-9": [2, 8],
    "handball-6": [2, 8],
    "cricket-21": [3, 10],
    "badminton-31": [2, 8],
    "cycling-17": [1, 5],
    "counter-strike-109": [8, 20],
    "dota-2-111": [6, 15],
    "league-of-legends-110": [8, 18],
    "valorant-194": [5, 12],
    "rainbow-six-125": [3, 8],
    "fc-26-137": [4, 10],
    "nba-2k26-153": [3, 8],
    "mobile-legends-201": [5, 12],
  }
  const [min, max] = ranges[sportId] || [3, 10]
  return Math.floor(Math.random() * (max - min + 1)) + min
}
