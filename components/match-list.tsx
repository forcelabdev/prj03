"use client"

import { Play, ChevronDown, ChevronUp, List } from "lucide-react"
import { useState } from "react"

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  time: string
  minute: string
  period: string
  stats: string
  odds: {
    home: number
    draw: number
    away: number
  }
}

interface League {
  id: string
  name: string
  flag: string
  matches: Match[]
}

const mockLeagues: League[] = [
  {
    id: "1",
    name: "Brezilya Serie A",
    flag: "🇧🇷",
    matches: [
      {
        id: "1",
        homeTeam: "CA Paranaense",
        awayTeam: "Cruzeiro MG",
        homeScore: 2,
        awayScore: 1,
        time: "88'",
        minute: "+73",
        period: "2. Yarı",
        stats: "",
        odds: { home: 1.08, draw: 7.00, away: 71.00 },
      },
      {
        id: "2",
        homeTeam: "Mirassol FC",
        awayTeam: "Coritiba FC PR",
        homeScore: 0,
        awayScore: 1,
        time: "73'",
        minute: "+121",
        period: "2. Yarı",
        stats: "",
        odds: { home: 10.00, draw: 3.20, away: 1.47 },
      },
      {
        id: "3",
        homeTeam: "Atletico Mineiro",
        awayTeam: "Sao Paulo FC",
        homeScore: 1,
        awayScore: 0,
        time: "71'",
        minute: "+120",
        period: "2. Yarı",
        stats: "",
        odds: { home: 1.24, draw: 4.50, away: 21.00 },
      },
      {
        id: "4",
        homeTeam: "Santos FC Sao Paulo",
        awayTeam: "SC Internacional",
        homeScore: 0,
        awayScore: 0,
        time: "4'",
        minute: "+2",
        period: "1. Yarı",
        stats: "",
        odds: { home: 2.10, draw: 3.10, away: 3.50 },
      },
      {
        id: "5",
        homeTeam: "Vasco da Gama",
        awayTeam: "Fluminense RJ",
        homeScore: 0,
        awayScore: 1,
        time: "65'",
        minute: "+89",
        period: "2. Yarı",
        stats: "",
        odds: { home: 7.00, draw: 4.20, away: 1.43 },
      },
    ],
  },
]

const sportFilters = ["Futbol", "Basketbol", "Tenis", "Voleybol", "Masa Tenisi"]

interface MatchListProps {
  activeTab: "live" | "upcoming"
  onTabChange: (tab: "live" | "upcoming") => void
}

export function MatchList({ activeTab, onTabChange }: MatchListProps) {
  const [activeSport, setActiveSport] = useState("Futbol")
  const [expandedLeagues, setExpandedLeagues] = useState<string[]>(["1"])

  const toggleLeague = (leagueId: string) => {
    setExpandedLeagues((prev) =>
      prev.includes(leagueId)
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId]
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="flex">
        <button
          onClick={() => onTabChange("live")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "live"
              ? "text-[#00d4b4]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Canlı <span className="ml-1 text-[#00d4b4]">128</span>
        </button>
        <button
          onClick={() => onTabChange("upcoming")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "upcoming"
              ? "text-[#00d4b4]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Yaklaşan Karşılaşmalar
        </button>
      </div>

      {/* Sport filters */}
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto no-scrollbar border-b border-border">
        {sportFilters.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap transition-colors ${
              activeSport === sport
                ? "text-[#00d4b4]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 text-xs text-muted-foreground">
        <span>Müsabakalar</span>
        <div className="flex items-center gap-2">
          <span className="text-center">Ev Sahibi</span>
          <span className="text-center">Berabere</span>
          <span className="text-center">Deplasman</span>
          <List className="h-4 w-4 ml-2" />
        </div>
      </div>

      {/* League sections */}
      <div className="flex-1 overflow-y-auto">
        {mockLeagues.map((league) => (
          <div key={league.id}>
            {/* League header */}
            <button
              onClick={() => toggleLeague(league.id)}
              className="flex w-full items-center justify-between px-3 py-2 bg-secondary/20 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{league.flag}</span>
                <span className="text-sm font-medium text-foreground">{league.name}</span>
              </div>
              {expandedLeagues.includes(league.id) ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {/* Matches */}
            {expandedLeagues.includes(league.id) && (
              <div className="divide-y divide-border">
                {league.matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center px-3 py-3 hover:bg-secondary/10 transition-colors"
                  >
                    {/* Match info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {match.homeTeam}
                        </span>
                        <span className="text-sm font-bold text-[#00d4b4]">{match.homeScore}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {match.awayTeam}
                        </span>
                        <span className="text-sm font-bold text-[#00d4b4]">{match.awayScore}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Play className="h-3 w-3" />
                        <span>{match.minute} / {match.time}, {match.period}</span>
                      </div>
                    </div>

                    {/* Odds */}
                    <div className="flex gap-1">
                      <button className="w-16 py-2 text-sm font-semibold text-[#00d4b4] bg-secondary rounded hover:bg-secondary/80 transition-colors">
                        {match.odds.home.toFixed(2)}
                      </button>
                      <button className="w-16 py-2 text-sm font-semibold text-[#00d4b4] bg-secondary rounded hover:bg-secondary/80 transition-colors">
                        {match.odds.draw.toFixed(2)}
                      </button>
                      <button className="w-16 py-2 text-sm font-semibold text-[#00d4b4] bg-secondary rounded hover:bg-secondary/80 transition-colors">
                        {match.odds.away.toFixed(2)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
