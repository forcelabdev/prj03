"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { DesktopHeader } from "@/components/desktop-header"
import { SlidersHorizontal, Info, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useTransactionHistory } from "@/hooks/use-history"
import { FilterModal } from "@/components/filter-modal"

export default function AccountSummaryPage() {
  const { user } = useAuth()
  const { deposits, withdrawals, isLoading, refresh } = useTransactionHistory(user?.id || null)

  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<"deposit" | "withdraw">("deposit")
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    if (user?.id) {
      refresh()
    }
  }, [user?.id, refresh])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " ₺"
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Başarılı"
      case "approved": return "approved"
      case "pending": return "Beklemede"
      case "cancelled": return "İptal Edildi"
      case "rejected": return "rejected"
      case "failed": return "Başarısız"
      default: return status
    }
  }

  const currentTransactions = activeSubTab === "deposit" ? deposits : withdrawals

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f0f0" }}>
      {/* Sticky Header + Tabs */}
      <div className="sticky top-0 z-50">
      <div className="lg:hidden">
        <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />
      </div>
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setShowLogin(true)} />
      </div>

      {/* Main Tabs */}
      <div className="flex border-b bg-white" style={{ borderColor: "#e5e5e5" }}>
        <Link
          href="/game-history"
          className="px-6 py-3 font-semibold text-sm"
          style={{ color: "#6b7280", borderBottom: "2px solid transparent" }}
        >
          Oyun Geçmişi
        </Link>
        <Link
          href="/account-summary"
          className="px-6 py-3 font-semibold text-sm"
          style={{ color: "#fbbf24", borderBottom: "2px solid #fbbf24" }}
        >
          Ödeme Geçmişi
        </Link>
      </div>
      </div>

      <main className="flex-1 p-4">
        {/* Baslik + Filtre */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-gray-900 text-2xl font-bold">Ödeme Geçmişi</h1>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 text-sm font-medium"
            style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: "6px" }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtre
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setActiveSubTab("deposit")}
            className="flex-1 text-sm font-semibold transition-colors"
            style={{
              height: "34px",
backgroundColor: activeSubTab === "deposit" ? "#00d4b4" : "transparent",
            color: activeSubTab === "deposit" ? "#000" : "#6b7280",
              border: activeSubTab === "deposit" ? "none" : "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          >
            Ödeme Geçmişi
          </button>
          <button
            onClick={() => setActiveSubTab("withdraw")}
            className="flex-1 text-sm font-semibold transition-colors"
            style={{
              height: "34px",
backgroundColor: activeSubTab === "withdraw" ? "#00d4b4" : "transparent",
            color: activeSubTab === "withdraw" ? "#000" : "#6b7280",
              border: activeSubTab === "withdraw" ? "none" : "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          >
            Çekim Geçmişi
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentTransactions.length === 0 && (
          <div className="p-4 flex items-center gap-3 bg-white" style={{ borderRadius: "6px" }}>
            <div className="w-8 h-8 bg-[#00d4b4] rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-black" />
            </div>
            <p className="text-gray-500 text-sm">Hesabınızın işlem geçmişi bulunmamaktadır.</p>
          </div>
        )}

        {/* Transaction List */}
        {!isLoading && currentTransactions.length > 0 && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "6px", overflow: "hidden" }}>
            {currentTransactions.map((item, index) => {
              const truncatedId = item._id.length > 22
                ? item._id.slice(0, 22) + "..."
                : item._id

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between px-4 py-4"
                  style={{
                    borderBottom: index < currentTransactions.length - 1 ? "1px solid #e5e5e5" : "none",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-sm">{truncatedId}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{formatDate(item.createdAt)}</p>
                  </div>

                  <div className="px-3 flex-shrink-0">
                    <span
                      className="text-xs font-medium px-3 py-1.5"
                      style={{ backgroundColor: "#f3f4f6", color: "#6b7280", borderRadius: "6px" }}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-900 text-sm font-semibold">{formatCurrency(item.amount)}</p>
                    <div className="flex justify-end mt-1">
                      <Upload className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <div className="lg:hidden">
        <Footer />
        <BottomNavigation />
      </div>
      <div className="hidden lg:block">
        <Footer />
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
