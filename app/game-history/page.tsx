"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { DesktopHeader } from "@/components/desktop-header"
import { SlidersHorizontal, Info, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useGameHistory } from "@/hooks/use-history"
import { FilterModal } from "@/components/filter-modal"

export default function GameHistoryPage() {
  const { user, isLoggedIn } = useAuth()
  const { history, isLoading, refresh } = useGameHistory(user?.id || null)

  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filterStart, setFilterStart] = useState("")
  const [filterEnd, setFilterEnd] = useState("")

  useEffect(() => {
    if (user?.id) {
      refresh()
    }
  }, [user?.id, refresh])

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0,00 ₺"
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " ₺"
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f0f0f0" }}>
      {/* Sticky Header + Tabs */}
      <div className="sticky top-0 z-50">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setShowLogin(true)} />
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white" style={{ borderColor: "#e5e5e5" }}>
        <Link
          href="/game-history"
          className="px-6 py-3 font-semibold text-sm"
          style={{
            color: "#00d4b4",
            borderBottom: "2px solid #00d4b4",
          }}
        >
          Oyun Geçmişi
        </Link>
        <Link
          href="/payment-history"
          className="px-6 py-3 font-semibold text-sm"
          style={{ color: "#6b7280", borderBottom: "2px solid transparent" }}
        >
          Ödeme Geçmişi
        </Link>
      </div>
      </div>

      <main className="flex-1 p-4">
        {/* Header with Filter */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <h1 className="text-gray-900 text-2xl font-bold">Bahis Geçmişi</h1>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              Bu tablodaki bilgiler geçici olarak 15 dakikaya kadar gecikmeli yansıyor olabilir, bilgilerinize.
            </p>
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 text-sm font-medium flex-shrink-0"
            style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: "6px" }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtre
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#00d4b4] animate-spin" />
          </div>
        )}

        {/* Aktif filtre etiketi */}
        {(filterStart || filterEnd) && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            <span>Filtre:</span>
            {filterStart && <span className="bg-[#00d4b4]/20 text-[#00a896] px-2 py-0.5 rounded">{filterStart}</span>}
            {filterEnd && <span className="bg-[#00d4b4]/20 text-[#00a896] px-2 py-0.5 rounded">{filterEnd}</span>}
            <button onClick={() => { setFilterStart(""); setFilterEnd("") }} className="text-red-400 hover:text-red-600 ml-1">Temizle</button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && history.filter((item: any) => {
          const dateStr = item.playedAt || item.played_at || item.createdAt || item.date || ""
          if (!filterStart && !filterEnd) return true
          const itemDate = new Date(dateStr)
          if (filterStart && itemDate < new Date(filterStart)) return false
          if (filterEnd && itemDate > new Date(filterEnd + "T23:59:59")) return false
          return true
        }).length === 0 && (
          <div className="p-4 flex items-center gap-3 bg-white" style={{ borderRadius: "6px" }}>
            <div className="w-8 h-8 bg-[#00d4b4] rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-black" />
            </div>
            <p className="text-gray-500 text-sm">Hesabınızın işlem geçmişi bulunmamaktadır.</p>
          </div>
        )}

        {/* History List */}
        {!isLoading && history.length > 0 && (() => {
          const filtered = history.filter((item: any) => {
            const dateStr = item.playedAt || item.played_at || item.createdAt || item.date || ""
            if (!filterStart && !filterEnd) return true
            const itemDate = new Date(dateStr)
            if (filterStart && itemDate < new Date(filterStart)) return false
            if (filterEnd && itemDate > new Date(filterEnd + "T23:59:59")) return false
            return true
          })
          if (filtered.length === 0) return null
          return (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "6px", overflow: "hidden" }}>
            {filtered.map((item: any, index: number) => {
              const gameName = item.gameName || item.game_name || item.name || "-"
              const id = item.txn_id || item.round_id || item._id || item.id || "-"
              const dateStr = item.playedAt || item.played_at || item.createdAt || item.created_at || item.date || ""
              const bet = Number(item.betAmount ?? item.bet_money ?? item.bet_amount ?? item.amount ?? 0)
              const win = Number(item.winAmount ?? item.win_money ?? item.win_amount ?? 0)
              const balAfter = Number(item.balanceAfter ?? item.balance_after ?? item.balance ?? 0)
              const isWin = item.result === "win" || win > bet

              return (
                <div
                  key={id + index}
                  className="flex items-start justify-between px-4 py-4"
                  style={{ borderBottom: index < history.length - 1 ? "1px solid #e5e5e5" : "none" }}
                >
                  <div>
                    <p className="text-gray-900 font-bold text-sm">{gameName}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{id}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{formatDate(dateStr)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium" style={{ color: isWin ? "#16a34a" : "#1a1a1a" }}>
                      {isWin ? "+" : "-"}{formatCurrency(isWin ? win : bet)}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{formatCurrency(balAfter)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          )
        })()}
      </main>

      {/* Mobile Footer */}
      <div className="lg:hidden">
        <Footer />
        <BottomNavigation />
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showFilter && (
        <FilterModal
          onClose={() => setShowFilter(false)}
          onFilter={(start, end) => { setFilterStart(start); setFilterEnd(end) }}
        />
      )}
    </div>
  )
}
