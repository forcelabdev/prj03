/**
 * =============================================================================
 * OYUNLAR BOLUMU (Games Section) - components/games-section.tsx
 * =============================================================================
 * 
 * Ana sayfada gosterilen casino oyunlari bolumu.
 * 
 * YAPISI:
 * - GameCard: Tek bir oyun karti (thumbnail, provider, fiyat araligi)
 * - CategorySection: Oyun kategorisi (baslik, grid, daha fazla butonu)
 * - GamesSection: Tum kategorileri iceren ana komponent
 * 
 * KATEGORILER:
 * - PlayMatrix: PlayMatrix markali oyunlar (roulette, blackjack vs.)
 * - TOP 30 CASINO: En populer 30 casino oyunu
 * - TURKCE CASINO: Turkce destekli casino oyunlari
 * 
 * MOBIL DAVRANIS:
 * - Baslangicta 4 oyun gosterilir (2x2 grid)
 * - "Daha fazla goster" tiklaninca +4 oyun eklenir
 * - Son adimda "Hepsini gor" butonu cikari
 * 
 * DESKTOP DAVRANIS:
 * - Tum oyunlar 6-8 sutunlu grid'de gosterilir
 * - "Hepsini gor" linki baslikta sagda
 * =============================================================================
 */

"use client"

import { useState } from "react"
import Image from "next/image"

// =============================================================================
// TIP TANIMLARI
// =============================================================================

// Tek bir oyun icin tip tanimi
interface Game {
  id: string           // Benzersiz oyun kimliği
  name: string         // Oyun adi
  image: string        // Oyun resmi URL'i
  provider?: string    // Oyun saglayici (opsiyonel)
  priceRange?: string  // Bahis araligi (opsiyonel)
}

// Oyun kategorisi icin tip tanimi
interface GameCategory {
  id: string           // Kategori kimliği (URL icin)
  title: string        // Kategori basligi
  icon?: string        // Ozel ikon tipi (playmatrix, slot)
  flag?: boolean       // Turk bayragi gosterilsin mi?
  games: Game[]        // Kategorideki oyunlar
}

// =============================================================================
// OYUN VERILERI
// =============================================================================

const gameCategories: GameCategory[] = [
  // ---------------------------------------------------------------------------
  // PLAYMATRIX KATEGORISI
  // PlayMatrix markali ozel oyunlar
  // ---------------------------------------------------------------------------
  {
    id: "playmatrix",
    title: "PlayMatrix",
    icon: "playmatrix",  // Ozel ikon
    games: [
      { id: "1", name: "Cyber Roulette", image: "/games/cyber-roulette.jpg", provider: "PlayMatrix" },
      { id: "2", name: "Ultra Cyber Roulette", image: "/games/ultra-cyber-roulette.jpg", provider: "PlayMatrix" },
      { id: "3", name: "PlayMatrix BlackJack 1", image: "/games/blackjack-1.jpg", provider: "PlayMatrix", priceRange: "₺ 100-4.000.000" },
      { id: "4", name: "PlayMatrix BlackJack 2", image: "/games/blackjack-2.jpg", provider: "PlayMatrix", priceRange: "₺ 100-4.000.000" },
      { id: "5", name: "PlayMatrix Roulette", image: "/games/pm-roulette.jpg", provider: "PlayMatrix" },
      { id: "6", name: "PlayMatrix Baccarat", image: "/games/pm-baccarat.jpg", provider: "PlayMatrix" },
      { id: "7", name: "PlayMatrix Poker", image: "/games/pm-poker.jpg", provider: "PlayMatrix" },
      { id: "8", name: "PlayMatrix Dice", image: "/games/pm-dice.jpg", provider: "PlayMatrix" },
      { id: "9", name: "PlayMatrix Slots", image: "/games/pm-slots.jpg", provider: "PlayMatrix" },
      { id: "10", name: "PlayMatrix Keno", image: "/games/pm-keno.jpg", provider: "PlayMatrix" },
      { id: "11", name: "PlayMatrix Scratch", image: "/games/pm-scratch.jpg", provider: "PlayMatrix" },
      { id: "12", name: "PlayMatrix Wheel", image: "/games/pm-wheel.jpg", provider: "PlayMatrix" },
    ],
  },
  
  // ---------------------------------------------------------------------------
  // TOP 30 CASINO KATEGORISI
  // En populer 30 slot oyunu
  // ---------------------------------------------------------------------------
  {
    id: "top30",
    title: "TOP 30 CASINO",
    icon: "slot",  // Slot ikonu
    games: [
      { id: "13", name: "Move Bonanza", image: "/games/move-bonanza.jpg" },
      { id: "14", name: "Sweet Bonanza 1000", image: "/games/sweet-bonanza-1000.jpg" },
      { id: "15", name: "Sweet Bonanza", image: "/games/sweet-bonanza.jpg" },
      { id: "16", name: "Gates of Olympus", image: "/games/gates-olympus.jpg" },
      { id: "17", name: "Big Bass Bonanza", image: "/games/big-bass.jpg" },
      { id: "18", name: "Starlight Princess", image: "/games/starlight.jpg" },
      { id: "19", name: "Sugar Rush", image: "/games/sugar-rush.jpg" },
      { id: "20", name: "Fruit Party", image: "/games/fruit-party.jpg" },
      { id: "21", name: "Wolf Gold", image: "/games/wolf-gold.jpg" },
      { id: "22", name: "Dog House", image: "/games/dog-house.jpg" },
      { id: "23", name: "Book of Dead", image: "/games/book-dead.jpg" },
      { id: "24", name: "Reactoonz", image: "/games/reactoonz.jpg" },
    ],
  },
  
  // ---------------------------------------------------------------------------
  // TURKCE CASINO KATEGORISI
  // Turkce destekli canli casino oyunlari
  // ---------------------------------------------------------------------------
  {
    id: "turkce",
    title: "TURKCE CASINO",
    flag: true,  // Turk bayragi goster
    games: [
      { id: "25", name: "Turkish Speed Blackjack", image: "/games/turkish-speed-bj.jpg", priceRange: "₺ 50-25.000" },
      { id: "26", name: "Turkish VIP Blackjack", image: "/games/turkish-vip-bj.jpg", priceRange: "₺ 3.000-200.000" },
      { id: "27", name: "Turkish VIP Blackjack 2", image: "/games/turkish-vip-bj-2.jpg", priceRange: "₺ 3.000-200.000" },
      { id: "28", name: "Turkish VIP Blackjack 3", image: "/games/turkish-vip-bj-3.jpg", priceRange: "₺ 3.000-200.000" },
      { id: "29", name: "Turkish Roulette", image: "/games/turkish-roulette.jpg" },
      { id: "30", name: "Turkish Baccarat", image: "/games/turkish-baccarat.jpg" },
      { id: "31", name: "Turkish Poker", image: "/games/turkish-poker.jpg" },
      { id: "32", name: "Turkish Mega Rulet", image: "/games/turkish-mega-rulet.jpg" },
      { id: "33", name: "Turkish Blackjack 1", image: "/games/turkish-bj-1.jpg" },
      { id: "34", name: "Turkish Blackjack 2", image: "/games/turkish-bj-2.jpg" },
      { id: "35", name: "Turkish Blackjack 3", image: "/games/turkish-bj-3.jpg" },
      { id: "36", name: "Turkish Auto Roulette", image: "/games/turkish-auto-roulette.jpg" },
    ],
  },
]

// =============================================================================
// OYUN KARTI KOMPONENTI
// =============================================================================
function GameCard({ game }: { game: Game }) {
  const [pressed, setPressed] = useState(false)

  return (
    <div
      className="flex flex-col cursor-pointer"
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* Wrapper - provider logo burada, blur'dan etkilenmez */}
      <div className="relative" style={{ height: "124px" }}>
        {/* Kart - blur buraya uygulanir */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden transition-all duration-700"
          style={{ filter: pressed ? "blur(4px)" : "blur(0px)" }}
        >
          <img
            src={game.image || "/placeholder.svg"}
            alt={game.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
          />
          {game.priceRange && !pressed && (
            <div className="absolute bottom-2 left-2">
              <span className="text-white text-[11px] font-medium">{game.priceRange}</span>
            </div>
          )}
        </div>
        {/* Provider - blur disinda, wrapper'a gore konumlanir */}
        <div
          className="absolute top-2 right-2 z-10 transition-opacity duration-700"
          style={{ opacity: pressed ? 1 : 0 }}
        >
          {game.provider && (
            <span className="text-white font-bold text-xs uppercase tracking-wider drop-shadow-lg">
              {game.provider}
            </span>
          )}
        </div>
      </div>

      {/* Oyun Adi */}
      <h4 className="game-title">{game.name}</h4>
    </div>
  )
}

// =============================================================================
// KATEGORI BOLUMU KOMPONENTI
// =============================================================================
// Bir oyun kategorisini gosteren komponent
// - Kategori basligi ve ikonu
// - Oyun grid'i (2 sutun mobil, 6-8 sutun desktop)
// - "Daha fazla goster" / "Hepsini gor" butonlari
function CategorySection({ category }: { category: GameCategory }) {
  
  // Mobil icin sayfalama ayarlari
  const INITIAL = 4   // Baslangicta gosterilecek oyun sayisi
  const STEP = 4      // Her tiklamada eklenecek oyun sayisi
  const [mobileVisibleCount, setMobileVisibleCount] = useState(INITIAL)

  // Hesaplamalar
  const total = category.games.length
  const nextCount = mobileVisibleCount + STEP
  const hasMore = mobileVisibleCount < total        // Daha fazla oyun var mi?
  const isLastStep = nextCount >= total             // Son adim mi?

  // Daha fazla goster - STEP kadar oyun ekle
  const handleShowMore = () => {
    setMobileVisibleCount((prev) => Math.min(prev + STEP, total))
  }

  // Hepsini goster - Tum oyunlari goster
  const handleShowAll = () => {
    setMobileVisibleCount(total)
  }

  // Mobilde gosterilecek oyunlar
  const mobileGames = category.games.slice(0, mobileVisibleCount)

  return (
    <div className="py-6 border-t border-white/5 first:border-t-0">
      
      {/* =========== KATEGORI BASLIGI =========== */}
      <div className="flex items-center justify-between mb-4 px-4 lg:px-8">
        <div className="flex items-center gap-2">
          
          {/* PlayMatrix Ozel Basligi */}
          {category.icon === "playmatrix" && (
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
              <span className="text-white font-bold text-lg">PLAY</span>
              <span className="text-yellow-500 font-bold text-lg">MATRIX</span>
            </div>
          )}
          
          {/* Slot Kategorisi Basligi */}
          {category.icon === "slot" && (
            <span className="text-yellow-500 font-bold text-lg">{category.title}</span>
          )}
          
          {/* Turkce Casino Basligi (bayrakli) */}
          {category.flag && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 font-bold text-lg">{category.title}</span>
              <span className="text-xl">🇹🇷</span>
            </div>
          )}
          
          {/* Varsayilan Baslik */}
          {!category.icon && !category.flag && (
            <span className="text-yellow-500 font-bold text-lg">{category.title}</span>
          )}
        </div>

        {/* Hepsini Gor Linki - Sadece Desktop */}
        <button
          onClick={() => window.location.href = `/casino/${category.id}`}
          className="hidden lg:flex text-gray-400 hover:text-yellow-500 text-sm font-medium items-center gap-1 transition-colors"
        >
          Hepsini gor {total}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* =========== MOBIL GRID =========== */}
      {/* 2 sutun, sinirli sayida oyun */}
      <div className="grid grid-cols-2 gap-3 px-4 lg:hidden">
        {mobileGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* =========== DESKTOP GRID =========== */}
      {/* 6-8 sutun, tum oyunlar */}
      <div className="hidden lg:grid lg:grid-cols-6 xl:grid-cols-8 gap-3 px-8">
        {category.games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* =========== MOBIL BUTONLAR =========== */}
      {/* Son adima kadar "Daha fazla goster", son adimda "Hepsini gor" */}
      {hasMore && (
        <div className="flex justify-center mt-4 px-4 lg:hidden">
          {!isLastStep ? (
            // Normal adim: Kenarlıklı buton
            <button
              onClick={handleShowMore}
              className="w-full py-3 border-2 border-[#00d4b4] text-[#00d4b4] rounded-lg font-medium hover:bg-[#00d4b4]/10 transition-colors"
            >
              Daha fazla goster
            </button>
          ) : (
            // Son adim: Dolu sari buton
            <button
              onClick={handleShowAll}
              className="w-full py-3 bg-[#00d4b4] text-black rounded-lg font-bold hover:bg-[#00b89c] transition-colors"
            >
              Hepsini gor ({total})
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ANA GAMES SECTION KOMPONENTI
// =============================================================================
// Tum oyun kategorilerini iceren ana komponent
// Ana sayfada GamesSection olarak kullanilir
export function GamesSection() {
  return (
    <div className="mt-6 pb-20 lg:pb-8">
      {/* Tum kategorileri listele */}
      {gameCategories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  )
}
