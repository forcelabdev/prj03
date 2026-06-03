"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const banners = [
  {
    id: 1,
    title: "BAHİS KAZANDI",
    subtitle: "SEÇİM YAPTIĞIN TAKIM KARŞILAŞMADA",
    description: "2 FARKLA ÖNE GEÇERSE",
    highlight: "OLARAK SONUÇLANDIRILACAKTIR!",
    bgColor: "from-yellow-600 via-yellow-500 to-yellow-400",
  },
  {
    id: 2,
    title: "SLOT ALANINDA",
    subtitle: "YATIRIMINI",
    description: "10 KATI VE ÜZERİNE ÇIKARANA",
    highlight: "YATIRIMI HEDİYE",
    bgColor: "from-yellow-600 via-yellow-500 to-yellow-400",
  },
  {
    id: 3,
    title: "BELL LINK OYUNLARINDA",
    subtitle: "EKRANI ÇANLA DOLDURANA",
    description: "BAHSİNİN 100 KATI",
    highlight: "NAKİT ÖDÜL HEDİYE",
    bgColor: "from-yellow-600 via-yellow-500 to-yellow-400",
  },
]

export function CasinoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="relative mx-3 my-4 rounded-xl overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400">
        {/* League icons */}
        <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-32">
          {["UCL", "UEL", "UEC", "PL", "L1", "BL", "LL", "SA", "SL"].map((league, i) => (
            <div key={i} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">{league}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-4">
          <p className="text-xs text-white/90">{banners[currentSlide].subtitle}</p>
          <p className="text-sm font-bold text-white">{banners[currentSlide].description}</p>
          <h2 className="text-3xl font-black text-white drop-shadow-lg">{banners[currentSlide].title}</h2>
          <div className="mt-2 bg-green-600 text-white text-xs font-bold py-1.5 px-4 rounded inline-block w-fit">
            {banners[currentSlide].highlight}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  )
}
