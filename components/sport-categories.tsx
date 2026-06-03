"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

const categories = [
  { name: "Aviator", icon: "✈️", count: null, type: "game" },
  { name: "Sweet", icon: "🍬", count: null, type: "game" },
  { name: "Gates", icon: "⚡", count: null, type: "game" },
  { name: "Futbol", icon: "⚽", count: 38 },
  { name: "Basketbol", icon: "🏀", count: 19 },
  { name: "Tenis", icon: "🎾", count: 8 },
  { name: "Voleybol", icon: "🏐", count: 5 },
  { name: "Masa Tenisi", icon: "🏓", count: 11 },
  { name: "Buz Hokeyi", icon: "🏒", count: 4 },
  { name: "Hentbol", icon: "🤾", count: 6 },
]

interface SportCategoriesProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function SportCategories({ activeCategory, onCategoryChange }: SportCategoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 150
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative flex items-center bg-background py-2">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-background to-transparent"
      >
        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-8 no-scrollbar"
      >
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategoryChange(category.name)}
            className={`flex flex-col items-center gap-1 min-w-[60px] transition-colors ${
              activeCategory === category.name
                ? "text-[#00d4b4]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <span className="text-2xl">{category.icon}</span>
              {category.count !== null && (
                <span className="absolute -top-1 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#00d4b4] px-1 text-[10px] font-bold text-black">
                  {category.count}
                </span>
              )}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-background to-transparent"
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  )
}
