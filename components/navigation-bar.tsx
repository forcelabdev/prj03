"use client"

import { Search, Play, List, Calendar, Link2, FileText } from "lucide-react"

interface NavigationBarProps {
  onSearchClick?: () => void
}

const navItems = [
  { icon: Search, label: "Arama", href: "#", isSearch: true },
  { icon: Play, label: "Canlı", href: "#", active: true },
  { icon: List, label: "Sporlar", href: "#" },
  { icon: Calendar, label: "Günün Maçı", href: "#" },
  { icon: Link2, label: "Ligler", href: "#" },
  { icon: FileText, label: "", href: "#", badge: "0" },
]

export function NavigationBar({ onSearchClick }: NavigationBarProps) {
  return (
    <nav className="flex items-center justify-between bg-secondary/50 px-2 py-2 overflow-x-auto no-scrollbar">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={item.isSearch ? onSearchClick : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            item.active
              ? "text-[#00d4b4]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label && <span>{item.label}</span>}
          {item.badge && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00d4b4] text-[10px] font-bold text-black">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
