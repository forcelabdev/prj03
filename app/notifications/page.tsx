"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { Bell, Trash2, X, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { useAuth } from "@/contexts/auth-context"

export default function NotificationsPage() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [page, setPage] = useState(1)

  const { user } = useAuth()
  const { notifications, isLoading, markAsRead, deleteNotification } = useNotifications(page)

  const unreadCount = notifications.filter((n: any) => !n.read).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />

      {/* User Header */}
      <div className="bg-zinc-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-10 h-10 text-yellow-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-white font-bold">{user?.username || "Kullanıcı"}</span>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="bg-zinc-800 px-4 py-2 text-white rounded hover:bg-zinc-700"
        >
          GERI
        </button>
      </div>

      {/* Notifications Header */}
      <div className="bg-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">Bildirimler</span>
          {unreadCount > 0 && (
            <span className="bg-[#00d4b4] text-black text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 text-sm hover:text-white">Hepsini Okunmuş Olarak İşaretle</button>
          <Trash2 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
          <X className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
        </div>
      </div>

      <main className="flex-1 p-4">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Notifications List */}
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification: any) => (
                  <div 
                    key={notification._id} 
                    className={`border-l-4 p-4 cursor-pointer transition-colors ${
                      notification.read
                        ? "bg-zinc-800 border-gray-600"
                        : "bg-zinc-900 border-[#00d4b4]"
                    }`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{notification.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {notification.content || notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification._id)
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-400">Bildirim bulunmamaktadır.</p>
              </div>
            )}

            {/* Pagination */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Önceki
                </button>
                <span className="text-gray-400">Sayfa {page}</span>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  className="text-gray-400 hover:text-white"
                >
                  Sonraki
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <BottomNavigation />

      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
