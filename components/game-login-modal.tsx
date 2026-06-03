"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface Game {
  id?: string
  name: string
  image?: string
  provider?: string
}

interface GameLoginModalProps {
  isOpen: boolean
  onClose: () => void
  game: Game | null
  onLoginClick: () => void
}

export function GameLoginModal({ 
  isOpen, 
  onClose, 
  game,
  onLoginClick
}: GameLoginModalProps) {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isOpen || !game) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Background - oyun gorseli full cover */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${game.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.35)"
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">

        {/* Kapat butonu - sag ust */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="p-2">
            <X className="w-7 h-7 text-white" />
          </button>
        </div>

        {/* Merkez icerik */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">

          {/* Provider adi */}
          <p className="text-white text-sm tracking-widest uppercase">
            {game.provider}
          </p>

          {/* Sarı ok ikonu */}
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M25 5C13.95 5 5 13.95 5 25s8.95 20 20 20 20-8.95 20-20S36.05 5 25 5zm0 36c-8.82 0-16-7.18-16-16S16.18 9 25 9s16 7.18 16 16-7.18 16-16 16z" fill="#00d4b4"/>
            <path d="M25 15v10l8 4" stroke="#00d4b4" strokeWidth="3" strokeLinecap="round"/>
          </svg>

          {/* Oyun adi - buyuk */}
          <h2 className="text-white text-2xl font-bold text-center">{game.name}</h2>

          {/* Giris Yap / Kayit Ol butonlari */}
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={onLoginClick}
              className="flex-1 py-4 bg-white text-black font-bold text-center text-base"
            >
              Giris Yap
            </button>
            <Link
              href="/register"
              className="flex-1 py-4 bg-[#00d4b4] text-black font-bold text-center text-base"
            >
              Kayit Ol
            </Link>
          </div>

          {/* Eglenmek icin oyna */}
          <button
            className="w-full max-w-sm py-4 bg-[#00d4b4] text-black font-bold text-base"
          >
            Eglenmek icin oyna
          </button>

          {/* Saat */}
          <p className="text-gray-300 text-sm tracking-widest">{currentTime}</p>
        </div>

        {/* Alt kisim - oyun gorseli */}
        <div className="flex flex-col items-center pb-6">
          <div style={{ width: "200px", height: "150px" }}>
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <p className="text-gray-400 text-xs mt-4">1.0.331</p>
        </div>

      </div>
    </div>
  )
}
