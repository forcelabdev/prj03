"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { DesktopHeader } from "@/components/desktop-header"
import { Loader2, AlertCircle, SlidersHorizontal } from "lucide-react"
import { useClaimBonus, useBonuses } from "@/hooks/use-bonus"
import { useAuth } from "@/contexts/auth-context"
import { FilterModal } from "@/components/filter-modal"

export default function ActiveBonusesPage() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [bonusCode, setBonusCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const { user } = useAuth()
  const { activeBonuses } = useBonuses()
  const { claimBonus } = useClaimBonus()

  const handleClaimBonus = async () => {
    if (!bonusCode.trim()) {
      setMessage({ type: "error", text: "Lütfen bonus kodunu girin" })
      return
    }

    setIsLoading(true)
    try {
      const result = await claimBonus(bonusCode)
      if (result.success) {
        setMessage({ type: "success", text: `${result.rewardAmount} TL bonus başarıyla alındı!` })
        setBonusCode("")
      } else {
        setMessage({ type: "error", text: result.error || "Bonus alınamadı" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Hata oluştu" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50">
        <div className="lg:hidden">
          <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />
        </div>
        <div className="hidden lg:block">
          <DesktopHeader onLoginClick={() => setShowLogin(true)} />
        </div>
      </div>

      <main className="flex-1 p-4 pb-24 lg:px-8 lg:py-6 lg:max-w-5xl lg:mx-auto lg:w-full">
        {/* Desktop Layout */}
        <div className="hidden lg:block rounded-lg p-8">
          <h1 className="text-white text-2xl font-bold mb-6">Aktif Bonuslar</h1>

          {/* Bonus Code Input Section */}
          <div className="mb-8">
            <label className="block text-gray-400 text-sm font-medium mb-3">
              <span className="text-red-500">*</span> Bonus kodunuz var mı?
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={bonusCode}
                onChange={(e) => setBonusCode(e.target.value)}
                placeholder="Bonus kodunuzu buraya girin"
                className="flex-1 bg-[#222] border border-[#333] text-white p-3 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder:text-gray-600"
                disabled={isLoading}
              />
              <button 
                onClick={handleClaimBonus}
                disabled={isLoading}
                className="px-8 py-3 bg-[#222] text-white font-bold hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap border border-[#333]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </>
                ) : (
                  "Bonusu Al"
                )}
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success" 
                ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Active Bonuses */}
          <div>
            <h2 className="text-white font-bold text-lg mb-4">
              {activeBonuses.length} aktif bonusunuz
            </h2>

            {activeBonuses.length > 0 ? (
              <div className="space-y-4">
                {activeBonuses.map((bonus: any) => (
                  <div key={bonus.id} className="bg-[#222] border border-[#333] p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-medium text-lg">{bonus.title}</h3>
                      <span className="text-[#00d4b4] font-bold text-lg">{bonus.amount} TL</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Çevrim Durumu</p>
                        <p className="text-white font-medium">{bonus.wageringProgress || 0} / {bonus.wageringRequired || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bitiş Tarihi</p>
                        <p className="text-white font-medium">{new Date(bonus.expiresAt).toLocaleDateString("tr-TR")}</p>
                      </div>
                    </div>
                    <div className="w-full bg-[#333] rounded-full h-2">
                      <div 
                        className="bg-[#00d4b4] h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((bonus.wageringProgress / bonus.wageringRequired) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">0 aktif bonusunuz bulunmaktadır.</p>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-gray-900 text-xl font-bold">Aktif Bonuslar</h1>
            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 text-gray-700 text-sm font-medium"
              style={{ borderRadius: "6px" }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtre
            </button>
          </div>

          {/* Bonus Code Input */}
          <div className="mb-4">
            <label className="text-gray-900 text-sm font-medium">
              <span className="text-red-500">*</span> Bonus kodunuz var mı?
            </label>
            <input
              type="text"
              value={bonusCode}
              onChange={(e) => setBonusCode(e.target.value)}
              placeholder="Bonus kodunuzu buraya girin"
              className="w-full mt-2 bg-white border border-gray-300 text-gray-900 p-3"
              style={{ borderRadius: "6px", outline: "none" }}
              disabled={isLoading}
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded flex items-gap-2 ${
              message.type === "success" 
                ? "bg-green-500/20 border border-green-500 text-green-500" 
                : "bg-red-500/20 border border-red-500 text-red-500"
            }`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="ml-2">{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleClaimBonus}
            disabled={isLoading}
            className="w-full py-3 bg-[#00d4b4] text-black font-bold hover:bg-[#00b89c] transition-colors mb-6 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Yükleniyor...
              </>
            ) : (
              "Bonusu Al"
            )}
          </button>

          {/* Active Bonuses List */}
          <div className="space-y-4">
            <h2 className="text-gray-900 font-bold text-lg">
              {activeBonuses.length} aktif bonusunuz
            </h2>

            {activeBonuses.length > 0 ? (
              activeBonuses.map((bonus: any) => (
                <div key={bonus.id} className="bg-white border border-gray-200 p-4" style={{ borderRadius: "8px" }}>
                  <h3 className="text-gray-900 font-medium">{bonus.title}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-500">Tutar: <span className="text-[#00d4b4] font-semibold">{bonus.amount} TL</span></p>
                    <p className="text-gray-500">
                      Çevrim: {bonus.wageringProgress || 0} / {bonus.wageringRequired || 0}
                    </p>
                    <p className="text-gray-400">
                      Bitiş: {new Date(bonus.expiresAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#00d4b4] h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((bonus.wageringProgress / bonus.wageringRequired) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-700 text-sm">{activeBonuses.length} aktif bonusunuz bulunmaktadır.</p>
            )}
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      
      {/* Mobile Footer */}
      <div className="lg:hidden">
        <Footer />
        <BottomNavigation />
      </div>

      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showFilter && (
        <FilterModal
          onClose={() => setShowFilter(false)}
          onFilter={() => setShowFilter(false)}
        />
      )}
    </div>
  )
}
