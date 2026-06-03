"use client"

import { useEffect, useState, useRef } from "react"
import { tokenManager } from "@/lib/token-manager"

export interface LeaderboardWinner {
  rank?: number
  points: number
  prize: number
  user: {
    _id?: string
    username: string
    avatar?: string
    rank?: string
    xp?: number
    anonymous?: boolean
    leaderboard?: {
      points?: number
    }
    stats?: {
      bet?: number
      won?: number
      deposit?: number
    }
  }
}

export interface LeaderboardData {
  duration: number
  type: string
  state: string
  updatedAt: string
  winners: LeaderboardWinner[]
}

// API'den gelen winner objesinden puan değerini al
// Öncelik: user.leaderboard.points (ham kullanıcı puanı, örn: 12500)
// Fallback: entry.points (USD-normalize sıralama puanı, örn: 245.73)
export function getWinnerPoints(entry: LeaderboardWinner): number | null {
  const userLbPoints = entry.user?.leaderboard?.points
  if (userLbPoints && userLbPoints > 0) {
    return userLbPoints
  }
  if (entry.points && entry.points > 0) {
    return entry.points
  }
  return null
}

// Backend: winner.user.username
export function getWinnerUsername(entry: LeaderboardWinner): string {
  return entry.user?.username ?? "-"
}


export function useLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    async function fetchLeaderboard() {
      try {
        const token = tokenManager.getToken()
        const headers: Record<string, string> = {}
        if (token) {
          headers["authorization"] = `Bearer ${token}`
          headers["x-auth-token"] = token
        }

        const res = await fetch("/api/leaderboard", { headers })
        const json = await res.json()

        if (!isMounted.current) return

        if (!res.ok || json.error) {
          setError("Lider tablosu şu an yüklenemiyor")
          setLoading(false)
          return
        }

        const lb: LeaderboardData = json.leaderboard ?? json

        if (!lb || typeof lb !== "object") {
          setError("Aktif turnuva bulunamadı")
          setLoading(false)
          return
        }

        if (!lb.winners) lb.winners = []

        setData(lb)
        setError(null)
        setLoading(false)

        if (lb.updatedAt && lb.duration) {
          const started = new Date(lb.updatedAt).getTime()
          const endsAt = started + lb.duration * 24 * 60 * 60 * 1000
          setTimeLeft(Math.max(0, endsAt - Date.now()))
        }
      } catch {
        if (!isMounted.current) return
        setError("Lider tablosu şu an yüklenemiyor")
        setLoading(false)
      }
    }

    fetchLeaderboard()
    // 5 dakikada bir yenile — çok sık fetch auth state'i bozuyor
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000)

    return () => {
      isMounted.current = false
      clearInterval(interval)
    }
  }, [])

  // Kalan süre sayacı
  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1000)), 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  const formattedTimeLeft = (() => {
    if (timeLeft <= 0) return "Bitti"
    const days = Math.floor(timeLeft / 86400000)
    const hours = Math.floor((timeLeft % 86400000) / 3600000)
    const mins = Math.floor((timeLeft % 3600000) / 60000)
    if (days > 0) return `${days} gün ${hours} saat kaldı`
    if (hours > 0) return `${hours} saat ${mins} dk kaldı`
    return `${mins} dk kaldı`
  })()

  const progressPercent = (() => {
    if (!data?.updatedAt || !data?.duration) return 0
    const started = new Date(data.updatedAt).getTime()
    const endsAt = started + data.duration * 24 * 60 * 60 * 1000
    const total = endsAt - started
    return Math.min(100, Math.max(0, ((Date.now() - started) / total) * 100))
  })()

  return { data, loading, error, timeLeft, formattedTimeLeft, progressPercent }
}
