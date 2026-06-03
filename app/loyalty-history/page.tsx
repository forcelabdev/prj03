"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { DesktopHeader } from "@/components/desktop-header"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function LoyaltyHistoryPage() {
  const [isIframeLoading, setIsIframeLoading] = useState(true)

  const loyaltyHistoryUrl = "https://bbb.goldenbet570.com/loyalty-history"

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden">
        <Header />
      </div>
      <div className="hidden lg:block">
        <DesktopHeader />
      </div>

      <main className="flex-1 relative overflow-hidden" style={{ height: "calc(100vh - 60px - 70px)", minHeight: "400px" }}>
        {isIframeLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
            <Loader2 className="w-10 h-10 animate-spin text-[#00d4b4] mb-4" />
            <p className="text-gray-400">Sadakat geçmişi yükleniyor...</p>
          </div>
        )}

        <iframe
          src={loyaltyHistoryUrl}
          className="w-full h-full"
          style={{ border: "none", WebkitOverflowScrolling: "touch" }}
          allow="fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsIframeLoading(false)}
        />
      </main>

      <BottomNavigation />
    </div>
  )
}
