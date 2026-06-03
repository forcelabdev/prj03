'use client'

// Left sidebar with navigation links — VELO+ ve Telegram kaldırıldı
import Link from "next/link"

const sidebarItems = [
  {
    label: "ÖZEL ORAN",
    href: "/ozel-oran",
    icon: "⚡",
    bgColor: "bg-[#00d4b4]",
  },
  {
    label: "TOP 30 SLOT CASINO",
    href: "/casino",
    icon: "⭐",
    bgColor: "bg-[#00b89c]",
  },
  {
    label: "TOP 20 CANLI CASINO",
    href: "/live-casino",
    icon: "▶",
    bgColor: "bg-[#00b89c]",
  },
  {
    label: "RULET LOBİSİ",
    href: "/casino?category=rulet",
    icon: "🎡",
    bgColor: "bg-gray-700",
  },
  {
    label: "BLACKJACK LOBİSİ",
    href: "/casino?category=blackjack",
    icon: "♠",
    bgColor: "bg-gray-700",
  },
  {
    label: "PROMOSYONLAR",
    href: "/promotions",
    icon: "🎁",
    bgColor: "bg-gray-700",
  },
  {
    label: "DISCOUNT TALEP ET",
    href: "https://www.vlodiscount3.com",
    icon: "📊",
    bgColor: "bg-gray-700",
  },
]

export function DesktopLeftSidebar() {
  return (
    <aside className="w-48 bg-[#0f0f0f] border-r border-white/5 py-4 min-h-full flex flex-col">
      <div className="space-y-2 px-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded text-sm font-semibold transition-colors text-gray-300 hover:text-white hover:bg-white/5"
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
