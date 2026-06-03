"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { vipService } from "@/lib/services/vip-service"

interface VipLevelData {
  name: string
  currentXp: number
  nextLevelXp: number
  level: number
  icon?: string
}

export function VipRankBadge() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const [vipData, setVipData] = useState<VipLevelData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchVipLevel = async () => {
      if (!isLoggedIn) {
        // Giriş yapılmamışsa gösterme
        setVipData(null)
        return
      }

      setIsLoading(true)
      try {
        // Hem levels hem currentLevel al - loyalty sayfasindaki gibi
        const [levelsRes, currentRes] = await Promise.all([
          vipService.getLevels(),
          vipService.getCurrentLevel()
        ])
        
        console.log("[v0] VIP levels:", levelsRes)
        console.log("[v0] VIP currentLevel:", currentRes)
        
        if (levelsRes.success && levelsRes.levels && currentRes.success && currentRes.level) {
          const levels = levelsRes.levels
          const current = currentRes.level
          
          // Kullanicinin XP'si
          const currentXP = current.currentXp || user?.xp || 0
          
          // Loyalty sayfasindaki reduce mantigi - XP'ye gore seviye index bul
          const computedLevelIdx = levels.reduce((best: number, lvl: any, i: number) => {
            const minXp = lvl.minXp ?? lvl.xp ?? 0
            return currentXP >= minXp ? i : best
          }, 0)
          
          const userLevel = levels[computedLevelIdx] ?? levels[0]
          const nextLevel = levels[computedLevelIdx + 1]
          
          // Bir sonraki seviyenin minXp'si hedef XP
          const nextLevelXp = nextLevel ? (nextLevel.minXp ?? nextLevel.xp ?? 0) : 0
          
          setVipData({
            name: userLevel.name || current.levelName || current.name || "Move",
            currentXp: currentXP,
            nextLevelXp: nextLevelXp,
            level: userLevel.level || computedLevelIdx + 1,
            icon: userLevel.image || current.image,
          })
        } else {
          // Fallback - user'dan al
          setVipData({
            name: user?.rank || "Move",
            currentXp: user?.xp || 0,
            nextLevelXp: 50000,
            level: 1,
          })
        }
      } catch (err) {
        console.error("[v0] VIP fetch error:", err)
        // Fallback
        setVipData({
          name: user?.rank || "Move",
          currentXp: user?.xp || 0,
          nextLevelXp: 50000,
          level: 1,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVipLevel()
  }, [isLoggedIn, user?.xp, user?.rank])

  if (!vipData) return null

  const API_BASE = "https://apievrymatrix5d84k321.com"

  return (
    <div 
      className="fixed right-4 z-40 lg:hidden"
      style={{ bottom: '5.5rem' }}
    >
      <button 
        onClick={() => router.push('/loyalty')}
        className="flex items-center bg-[#1a1a1a] rounded-lg cursor-pointer gap-3 px-4 py-3"
        style={{ border: '2px solid #00d4b4' }}
      >
        {/* Sol: Rozet ikonu */}
        <div className="flex-shrink-0">
          {vipData.icon ? (
            <img 
              src={vipData.icon}
              alt={vipData.name}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <svg viewBox="0 0 50 55" className="w-12 h-12">
              <polygon
                points="25,2 48,18 40,52 10,52 2,18"
                fill="none"
                stroke="#00d4b4"
                strokeWidth="2.5"
              />
              <polygon
                points="25,6 44,20 37,49 13,49 6,20"
                fill="url(#badgeGradient)"
              />
              <defs>
                <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a3a4a" />
                  <stop offset="100%" stopColor="#0d2030" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {/* Sağ: Bilgiler */}
        <div className="flex flex-col text-left gap-0.5">
          <span className="text-white font-bold" style={{ fontSize: '16px' }}>{vipData.name}</span>
          <span className="text-white" style={{ fontSize: '12px' }}>
            <span className="font-bold">{Math.floor(vipData.currentXp)}</span> <span className="font-normal">XP</span>
          </span>
          <span className="text-white" style={{ fontSize: '12px' }}>
            <span className="font-bold">{Math.floor(vipData.nextLevelXp)}</span> <span className="font-normal">XP</span>
          </span>
        </div>
      </button>
    </div>
  )
}
