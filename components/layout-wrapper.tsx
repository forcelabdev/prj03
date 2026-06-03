"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { SWRConfig } from "swr"
import { AuthProvider } from "@/contexts/auth-context"
import { BottomNavigation } from "@/components/bottom-navigation"
import { CategoryPopup } from "@/components/category-popup"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCenterOpen, setIsCenterOpen] = useState(false)
  const [isGameLaunchSubdomain, setIsGameLaunchSubdomain] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    // gamelaunch subdomain kontrolu
    setIsGameLaunchSubdomain(window.location.hostname.startsWith('gamelaunch.'))
  }, [])
  
  // /game/ sayfalarinda veya gamelaunch subdomain'inde bottom navigation ve diger UI elementlerini gizle
  const isGamePage = pathname?.startsWith("/game/") || isGameLaunchSubdomain

  if (isGamePage) {
    return (
      <SWRConfig value={{ revalidateOnMount: true, revalidateOnFocus: true, dedupingInterval: 0 }}>
        <AuthProvider>{children}</AuthProvider>
      </SWRConfig>
    )
  }

  return (
    <SWRConfig value={{ revalidateOnMount: true, revalidateOnFocus: true, dedupingInterval: 0 }}>
    <AuthProvider>
      {children}
      <CategoryPopup
        isOpen={isCenterOpen}
        onClose={() => setIsCenterOpen(false)}
      />
      <BottomNavigation
        onCenterClick={() => setIsCenterOpen((v) => !v)}
        isPopupOpen={isCenterOpen}
      />
    </AuthProvider>
    </SWRConfig>
  )
}
