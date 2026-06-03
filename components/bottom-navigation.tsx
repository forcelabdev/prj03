"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const API_BASE = "https://apievrymatrix5d84k321.com"

interface BottomNavigationProps {
  onCenterClick: () => void
  isPopupOpen?: boolean
}

export function BottomNavigation({ onCenterClick, isPopupOpen = false }: BottomNavigationProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-[#1a1a1a] border-t border-border lg:hidden pt-3 pb-3"
      >

      {/* Canlı Destek - LiveChat direct sayfasına yönlendir */}
      <a
        href="https://direct.lc.chat/19641932/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1"
      >
        <img
          src={`${API_BASE}/uploads/1774959183112-441970816.svg`}
          alt="Canlı Destek"
          className="h-7 w-7 object-contain"
        />
        <span className="text-[12px] font-medium text-white">Canlı Destek</span>
      </a>

      {/* Casino */}
      <Link
        href="/casino"
        className="flex flex-col items-center gap-1"

      >
        <img
          src={`${API_BASE}/uploads/1774959183370-945516210.svg`}
          alt="Casino"
          className="h-7 w-7 object-contain"
        />
        <span className={`text-[12px] font-medium ${isActive("/casino") ? "text-[#00d4b4]" : "text-white"}`}>Casino</span>
      </Link>

      {/* Center Button - 1000X */}
      <button
        onClick={onCenterClick}
        className="flex items-center justify-center"
        aria-label="Kategoriler"
      >
        <img
          src={`${API_BASE}/uploads/1775410661507-899059205.png`}
          alt="1000X"
          className="h-[52px] w-[52px] object-contain"
        />
      </button>

      {/* Canlı Casino */}
      <Link
        href="/live-casino"
        className="flex flex-col items-center gap-1"

      >
        <img
          src={`${API_BASE}/uploads/1774959182985-665474844.svg`}
          alt="Canlı Casino"
          className="h-7 w-7 object-contain"
        />
        <span className={`text-[12px] font-medium ${isActive("/live-casino") ? "text-[#00d4b4]" : "text-white"}`}>Canlı Casino</span>
      </Link>

      {/* Turnuvalar */}
      <Link
        href="/tournaments"
        className="flex flex-col items-center gap-1"

      >
        <img
          src={`${API_BASE}/uploads/1774959183248-328635044.svg`}
          alt="2.500.000"
          className="h-7 w-7 object-contain"
        />
        <span className={`text-[12px] font-medium ${isActive("/tournaments") ? "text-[#00d4b4]" : "text-white"}`}>2.500.000</span>
      </Link>

      </nav>
  )
}
