"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { GameLaunchModal } from "@/components/game-launch-modal"

const API_BASE = "https://apievrymatrix5d84k321.com"

interface CategoryGame {
  name: string
  image: string
  id: string
  game_code: string
  provider: string
  providerCode: string
}

const categories: CategoryGame[] = [
  {
    name: "Gates 1000",
    image: `${API_BASE}/uploads/1776481732968-582977181.svg`,
    id: "vs20olympx",
    game_code: "vs20olympx",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Sweet 1000",
    image: `${API_BASE}/uploads/1776481735083-47722627.png`,
    id: "vs20sw",
    game_code: "vs20sw",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Sugar 1000",
    image: `${API_BASE}/uploads/1776481734686-8736745.png`,
    id: "vs20sugarrush",
    game_code: "vs20sugarrush",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Starlight 1000",
    image: `${API_BASE}/uploads/1776481734430-447545385.png`,
    id: "vs20starlightx",
    game_code: "vs20starlightx",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Dice 1000",
    image: `${API_BASE}/uploads/1776481734848-403961074.png`,
    id: "vswaysdiceswbw",
    game_code: "vswaysdiceswbw",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Big Bass 1000",
    image: `${API_BASE}/uploads/1776481725109-70319873.png`,
    id: "vs10bblitz",
    game_code: "vs10bblitz",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Gates Xmas 1000",
    image: `${API_BASE}/uploads/1776481733307-497759033.png`,
    id: "vs20olympxmas",
    game_code: "vs20olympxmas",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Athena 1000",
    image: `${API_BASE}/uploads/1776481724682-363326654.png`,
    id: "vs20wisofathena",
    game_code: "vs20wisofathena",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Aviator",
    image: `${API_BASE}/uploads/1776481724929-586379124.png`,
    id: "aviator",
    game_code: "aviator",
    provider: "Spribe",
    providerCode: "SPRIBE",
  },
  {
    name: "SW Candyland",
    image: `${API_BASE}/uploads/1776481725284-553072934.png`,
    id: "vswaysswbcl",
    game_code: "vswaysswbcl",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Money Time",
    image: `${API_BASE}/uploads/1776481733799-316758010.png`,
    id: "vs20moneytime",
    game_code: "vs20moneytime",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
  {
    name: "Hold'em",
    image: `${API_BASE}/uploads/1776481733603-906492950.png`,
    id: "casinohold",
    game_code: "casinohold",
    provider: "Pragmatic Play",
    providerCode: "PP",
  },
]

interface CategoryPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function CategoryPopup({ isOpen, onClose }: CategoryPopupProps) {
  const [selectedGame, setSelectedGame] = useState<CategoryGame | null>(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)

  const handleGameClick = (game: CategoryGame) => {
    setSelectedGame(game)
    setIsGameModalOpen(true)
    onClose()
  }

  return (
    <>
      {/* Backdrop - mobile only */}
      <div
        className={`lg:hidden fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Popup - positioned behind bottom nav, mobile only */}
      <div 
        className={`lg:hidden fixed left-0 right-0 z-30 rounded-t-3xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ bottom: "64px", backgroundColor: "#212121", borderColor: "#212121", borderWidth: "1px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-foreground" style={{ fontSize: "18px", fontWeight: "600" }}>Kategoriler</h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3 px-4 pb-3 pt-1 max-h-[320px] overflow-y-auto">
          {categories.map((category, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-2 active:opacity-70 transition-opacity"
              onClick={() => handleGameClick(category)}
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-10 w-10 object-contain"
              />
              <span className="text-center line-clamp-2" style={{ fontSize: "10px", color: "#ffffff" }}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Game Launch Modal */}
      <GameLaunchModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        game={selectedGame ? {
          id: selectedGame.id,
          name: selectedGame.name,
          provider: selectedGame.provider,
          providerCode: selectedGame.providerCode,
          image: selectedGame.image,
          game_code: selectedGame.game_code,
          gameCode: selectedGame.game_code,
        } : null}
      />
    </>
  )
}
