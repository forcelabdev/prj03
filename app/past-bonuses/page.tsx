"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { DesktopHeader } from "@/components/desktop-header"
import { SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useBonuses } from "@/hooks/use-bonus"
import { FilterModal } from "@/components/filter-modal"

export default function PastBonusesPage() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const { bonuses, isLoading } = useBonuses()

  const pastBonuses = bonuses.filter((b: any) => b.status === "expired" || b.status === "completed")
  const paginatedBonuses = pastBonuses.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(pastBonuses.length / itemsPerPage)

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

      <main className="flex-1 p-4 lg:px-8 lg:py-6 lg:max-w-5xl lg:mx-auto lg:w-full pb-24 lg:pb-0">
        {/* Header with Filter */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-bold">Geçmiş Bonuslar</h1>
          <button onClick={() => setShowFilter(true)} className="flex items-center gap-2 bg-[#222] border border-[#333] px-4 py-2 text-gray-300 rounded hover:bg-[#2a2a2a]">
            <SlidersHorizontal className="w-4 h-4" />
            Filtre
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Table - Desktop Only */}
            <div className="hidden lg:block bg-[#1e1e1e] rounded-lg overflow-hidden" style={{ minHeight: "330px" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#2a2a2a]">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Bonus Adı</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Miktar</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Tip</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Durum</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Ekleme Tarihi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {paginatedBonuses.length > 0 ? (
                      paginatedBonuses.map((bonus: any) => (
                        <tr key={bonus.id} className="hover:bg-[#252525] transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-medium">{bonus.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{bonus.amount} TL</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{bonus.type || "Bonus"}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                              bonus.status === "completed" 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-gray-500/20 text-gray-400"
                            }`}>
                              {bonus.status === "completed" ? "Tamamlandı" : "Süresi Geçti"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {new Date(bonus.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          Geçmiş bonus bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-[#2a2a2a]">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-gray-500 hover:text-gray-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-500">
                    Sayfa <span className="font-bold text-white">{page}</span> / {totalPages}
                  </span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-gray-500 hover:text-gray-300 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile List */}
            <div className="lg:hidden space-y-2">
              {paginatedBonuses.length > 0 ? (
                <>
                  {paginatedBonuses.map((bonus: any) => (
                    <div
                      key={bonus.id}
                      className="bg-white p-4 flex items-center justify-between"
                      style={{ borderRadius: "4px" }}
                    >
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{bonus.title}</p>
                        <p className="text-gray-500 text-sm">{bonus.type || "Bonus"}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(bonus.createdAt).toLocaleDateString("tr-TR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium text-sm ${
                          bonus.status === "completed" ? "text-green-600" : "text-gray-700"
                        }`}>
                          {bonus.status === "completed" ? "Aktif" : "Aktif"}
                        </span>
                        <p className="text-gray-400 text-sm mt-1">-</p>
                      </div>
                    </div>
                  ))}

                  {/* Mobile Pagination */}
                  <div className="flex items-center justify-center gap-6 mt-4 py-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="text-yellow-500 font-bold text-lg disabled:opacity-30"
                    >
                      {"<"}
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="text-yellow-500 font-bold text-lg disabled:opacity-30"
                    >
                      {">"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white p-8 text-center" style={{ borderRadius: "4px" }}>
                  <p className="text-gray-500 text-sm">Geçmiş bonus bulunmamaktadır.</p>
                </div>
              )}
            </div>
          </>
        )}
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

      {showFilter && (
        <FilterModal
          onClose={() => setShowFilter(false)}
          onFilter={() => setShowFilter(false)}
        />
      )}
      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
