"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, Loader2 } from "lucide-react"
import { gamesService } from "@/lib/services/games-service"

interface Game {
  id: string
  game_code?: string
  name: string
  image?: string
  provider?: string
  provider_code?: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onGameClick?: (game: Game) => void
  onGameSelect?: (game: Game) => void // Alternative prop name for compatibility
}

const RECENT_SEARCHES_KEY = "recent_game_searches"
const MAX_RECENT_SEARCHES = 10

// LocalStorage'dan son aramaları al
function getRecentSearches(): Game[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// LocalStorage'a son aramayı ekle
function addRecentSearch(game: Game): void {
  if (typeof window === 'undefined') return
  try {
    const recent = getRecentSearches()
    // Duplicate'leri kaldır
    const filtered = recent.filter(g => g.id !== game.id)
    // Başa ekle
    const updated = [game, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}

// Görsel URL'sini çözümle
function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return "/placeholder.svg"
  // Tam URL ise direkt kullan
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  // Relative path ise API base URL'e ekle
  if (url.startsWith("/")) return `https://apievrymatrix5d84k321.com${url}`
  // Sadece dosya adı ise uploads klasörüne ekle
  return `https://apievrymatrix5d84k321.com/uploads/${url}`
}

export function SearchModal({ isOpen, onClose, onGameClick, onGameSelect }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [recentSearches, setRecentSearches] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Son aramaları yükle
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches())
    }
  }, [isOpen])

  useEffect(() => {
    const searchGames = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true)
        try {
          // Önce kategorileri çek
          const categoriesRes = await gamesService.getCategories()
          
          let allGames: any[] = []
          
          if (categoriesRes.success && categoriesRes.categories) {
            // Her kategoriden ayrı ayrı TÜM oyunları çek (limit=2000)
            const fetchPromises = categoriesRes.categories.map(async (cat: any) => {
              const slug = cat.slug || cat.name
              if (!slug) return []
              try {
                const res = await gamesService.getGamesByCategory(slug, 2000)
                return res.success && res.games ? res.games : []
              } catch {
                return []
              }
            })
            
            const results = await Promise.all(fetchPromises)
            allGames = results.flat()
          }
          
          const searchLower = searchQuery.toLowerCase()
          
          // Client-side filtreleme - önce filtrele
          const filteredByName = allGames.filter((g: any) => {
            const gameName = (g.game_name || g.name || g.title || '').toLowerCase()
            return gameName.includes(searchLower)
          })
          
          // Duplicate'leri kaldır (_id'ye göre - her oyunun benzersiz _id'si var)
          const uniqueGames = filteredByName.filter((game, index, self) => 
            index === self.findIndex(g => g._id === game._id)
          )
          
          const normalizedGames = uniqueGames.slice(0, 50).map((g: any) => {
            const bannerUrl = g.banner || g.cover || g.image || g.thumbnail || g.background || null
            return {
              id: g._id,
              game_code: g.game_code,
              name: g.game_name || g.name || g.title || 'Unknown Game',
              image: resolveImageUrl(bannerUrl),
              provider: g.provider_code || g.provider?.code || g.provider || g.providerCode || '',
              provider_code: g.provider_code || g.provider?.code || ''
            }
          })
          setFilteredGames(normalizedGames)
        } catch (error) {
          setFilteredGames([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setFilteredGames([])
      }
    }

    const debounce = setTimeout(searchGames, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleGameClick = (game: Game) => {
    // Son aramalara ekle
    addRecentSearch(game)
    setRecentSearches(getRecentSearches())
    
    // Callback'i çağır (her iki prop adını da destekle)
    if (onGameSelect) {
      onGameSelect(game)
    } else if (onGameClick) {
      onGameClick(game)
    }
    onClose()
  }

  if (!isOpen) return null

  const showRecentSearches = (!searchQuery || searchQuery.length < 2) && recentSearches.length > 0

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 bg-zinc-800 border-b border-zinc-700">
        <button onClick={onClose} className="p-1">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Oyun ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-zinc-900 text-white px-4 py-2.5 text-sm border border-zinc-600 focus:outline-none focus:border-[#00d4b4]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-60px)] bg-zinc-900">
        {showRecentSearches ? (
          /* Son Aramalar */
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4">Son aramalar</h3>
            <div className="grid grid-cols-2 gap-3">
              {recentSearches.map((game) => (
                <div
                  key={game.id}
                  className="cursor-pointer"
                  onClick={() => handleGameClick(game)}
                >
                  <div 
                    className="rounded-lg overflow-hidden bg-zinc-800"
                    style={{ width: '100%', height: '124px' }}
                  >
                    <img
                      src={game.image || "/placeholder.svg"}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <h3 className="text-white text-sm font-medium mt-2 truncate text-center">{game.name}</h3>
                </div>
              ))}
            </div>
          </div>
        ) : !searchQuery || searchQuery.length < 2 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="76" viewBox="0 0 45.4 28.8" className="mb-6" fill="white">
              <path d="M35.8 11.6a6.6 6.6 0 00-3.6 1.1.7.7 0 00-.2.9.8.8 0 001 .2 4.6 4.6 0 012.8-.8 5.1 5.1 0 015.1 5.1 5.4 5.4 0 01-.8 2.8.7.7 0 101.1.8 6.6 6.6 0 001.1-3.6 6.5 6.5 0 00-6.5-6.5z"></path>
              <path d="M3.9 10.6l-.5.4v.2l-.4.3-.4.5A10 10 0 000 18.6a10.2 10.2 0 0020.3 1.6 2.9 2.9 0 004.1.8 3 3 0 00.8-.8A10.2 10.2 0 1045.3 17a10.8 10.8 0 00-3.2-5.9l-6.4-6.3h-.2a5.1 5.1 0 00-2.3-1.5.6.6 0 000-.6A4.4 4.4 0 0029.1 0a4.5 4.5 0 00-4.5 4.5v.3l-2 .2a5.8 5.8 0 01-1.9-.2v-.3A4.5 4.5 0 0016.3 0a4.4 4.4 0 00-4 2.6.6.6 0 000 .6 7.4 7.4 0 00-2.7 1.6zm6.3 16.8a8.7 8.7 0 01-8.8-8.8 8.6 8.6 0 011.8-5.4h.1a6.2 6.2 0 011.4-1.4.1.1 0 01.1-.1 8.8 8.8 0 0112.4 1.5 8.9 8.9 0 01-1.5 12.4 9.1 9.1 0 01-5.5 1.8zm12.5-7.2a1.6 1.6 0 010-3.2 1.6 1.6 0 010 3.2zM44 18.6a8.8 8.8 0 11-8.8-8.8 8.7 8.7 0 018.8 8.8zM29.1 1.4a3.1 3.1 0 012.7 1.5h-1a9 9 0 00-3.2.9l-1.6.6a3.2 3.2 0 013.1-3zm-12.8 0a3.2 3.2 0 013.2 3l-1.3-.6a7.8 7.8 0 00-3.6-1h-.9a3.1 3.1 0 012.6-1.4zm-1.7 2.8a5.5 5.5 0 013 .9 11 11 0 005.1 1.3A11.8 11.8 0 0028.2 5a5 5 0 012.6-.8 4.8 4.8 0 013.9 1.6h.2l2.9 2.9A10.1 10.1 0 0025.4 16a3.6 3.6 0 00-.2 1 3 3 0 00-4-.9 2 2 0 00-.9.9A10.1 10.1 0 008.6 8.6l-.9.2 2.9-3a5.1 5.1 0 014-1.6z"></path>
              <path d="M10.2 12.1a6.6 6.6 0 00-6.5 6.5 7 7 0 001.1 3.7.6.6 0 00.9.1.7.7 0 00.2-.9 4.9 4.9 0 01-.8-2.9 5.1 5.1 0 015.1-5.1 4.7 4.7 0 012.8.9.8.8 0 001-.2.8.8 0 00-.2-1 6.6 6.6 0 00-3.6-1.1z"></path>
            </svg>
            <h3 className="text-white mb-1" style={{ fontSize: '16px', fontWeight: 700 }}>{"Henüz bir arama mevcut değil."}</h3>
            <p className="text-white" style={{ fontSize: '16px' }}>{"Lütfen bir oyun arayın!"}</p>
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center h-full px-4">
            <Loader2 className="w-12 h-12 text-[#00d4b4] animate-spin mb-4" />
            <p className="text-sm text-zinc-400">Oyunlar aranıyor...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          /* Search Results */
          <div className="grid grid-cols-2 gap-3 p-3">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="cursor-pointer"
                onClick={() => handleGameClick(game)}
              >
                <div 
                  className="rounded-lg overflow-hidden bg-zinc-800"
                  style={{ width: '100%', height: '124px' }}
                >
                  <img
                    src={game.image || "/placeholder.svg"}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                </div>
                <h3 className="text-white text-sm font-medium mt-2 truncate text-center">{game.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="flex flex-col items-center justify-center h-full px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="76" viewBox="0 0 45.4 28.8" className="mb-6" fill="white">
              <path d="M35.8 11.6a6.6 6.6 0 00-3.6 1.1.7.7 0 00-.2.9.8.8 0 001 .2 4.6 4.6 0 012.8-.8 5.1 5.1 0 015.1 5.1 5.4 5.4 0 01-.8 2.8.7.7 0 101.1.8 6.6 6.6 0 001.1-3.6 6.5 6.5 0 00-6.5-6.5z"></path>
              <path d="M3.9 10.6l-.5.4v.2l-.4.3-.4.5A10 10 0 000 18.6a10.2 10.2 0 0020.3 1.6 2.9 2.9 0 004.1.8 3 3 0 00.8-.8A10.2 10.2 0 1045.3 17a10.8 10.8 0 00-3.2-5.9l-6.4-6.3h-.2a5.1 5.1 0 00-2.3-1.5.6.6 0 000-.6A4.4 4.4 0 0029.1 0a4.5 4.5 0 00-4.5 4.5v.3l-2 .2a5.8 5.8 0 01-1.9-.2v-.3A4.5 4.5 0 0016.3 0a4.4 4.4 0 00-4 2.6.6.6 0 000 .6 7.4 7.4 0 00-2.7 1.6zm6.3 16.8a8.7 8.7 0 01-8.8-8.8 8.6 8.6 0 011.8-5.4h.1a6.2 6.2 0 011.4-1.4.1.1 0 01.1-.1 8.8 8.8 0 0112.4 1.5 8.9 8.9 0 01-1.5 12.4 9.1 9.1 0 01-5.5 1.8zm12.5-7.2a1.6 1.6 0 010-3.2 1.6 1.6 0 010 3.2zM44 18.6a8.8 8.8 0 11-8.8-8.8 8.7 8.7 0 018.8 8.8zM29.1 1.4a3.1 3.1 0 012.7 1.5h-1a9 9 0 00-3.2.9l-1.6.6a3.2 3.2 0 013.1-3zm-12.8 0a3.2 3.2 0 013.2 3l-1.3-.6a7.8 7.8 0 00-3.6-1h-.9a3.1 3.1 0 012.6-1.4zm-1.7 2.8a5.5 5.5 0 013 .9 11 11 0 005.1 1.3A11.8 11.8 0 0028.2 5a5 5 0 012.6-.8 4.8 4.8 0 013.9 1.6h.2l2.9 2.9A10.1 10.1 0 0025.4 16a3.6 3.6 0 00-.2 1 3 3 0 00-4-.9 2 2 0 00-.9.9A10.1 10.1 0 008.6 8.6l-.9.2 2.9-3a5.1 5.1 0 014-1.6z"></path>
              <path d="M10.2 12.1a6.6 6.6 0 00-6.5 6.5 7 7 0 001.1 3.7.6.6 0 00.9.1.7.7 0 00.2-.9 4.9 4.9 0 01-.8-2.9 5.1 5.1 0 015.1-5.1 4.7 4.7 0 012.8.9.8.8 0 001-.2.8.8 0 00-.2-1 6.6 6.6 0 00-3.6-1.1z"></path>
            </svg>
            <h3 className="text-white mb-1" style={{ fontSize: '16px', fontWeight: 700 }}>{"Sonuç bulunamadı"}</h3>
            <p className="text-white" style={{ fontSize: '16px' }}>{"Farklı bir arama deneyin"}</p>
          </div>
        )}
      </div>
    </div>
  )
}
