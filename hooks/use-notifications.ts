import useSWR from "swr"
import { siteService } from "@/lib/services"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

// localStorage'da okundu ve silinmiş ID'leri sakla
const STORAGE_KEY = "bm_notices_state"

function getLocalState(): { read: string[]; deleted: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { read: [], deleted: [] }
  } catch { return { read: [], deleted: [] } }
}

function saveLocalState(state: { read: string[]; deleted: string[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    // Aynı sayfadaki tüm hook instance'larını bilgilendir
    window.dispatchEvent(new Event("bm_notices_updated"))
  } catch {}
}

export function useNotifications(page: number = 1) {
  const { user } = useAuth()
  const userId = user?.id || null

  const { data, isLoading, error } = useSWR(
    userId ? `/api/notices/${userId}` : null,
    () => siteService.getNotices(userId!),
    { revalidateOnFocus: false }
  )

  const [localState, setLocalState] = useState<{ read: string[]; deleted: string[] }>({ read: [], deleted: [] })

  useEffect(() => {
    setLocalState(getLocalState())
    // Aynı sekmedeki diğer hook instance'larını senkronize et
    const onStorage = () => setLocalState(getLocalState())
    window.addEventListener("bm_notices_updated", onStorage)
    return () => window.removeEventListener("bm_notices_updated", onStorage)
  }, [])

  const rawNotices: any[] = data?.notices || data?.notifications || (Array.isArray(data) ? data : [])

  // Silinmişleri filtrele, okunmuşları işaretle
  const notices = rawNotices
    .filter((n: any) => !localState.deleted.includes(n._id || n.id))
    .map((n: any) => ({
      ...n,
      read: n.read || localState.read.includes(n._id || n.id),
    }))

  const unreadCount = notices.filter((n: any) => !n.read).length

  return {
    notifications: notices,
    unreadCount,
    isLoading,
    error,
    markAsRead: (notificationId: string) => {
      const next = { ...localState, read: [...new Set([...localState.read, notificationId])] }
      setLocalState(next)
      saveLocalState(next)
    },
    markAllAsRead: () => {
      const allIds = notices.map((n: any) => n._id || n.id)
      const next = { ...localState, read: [...new Set([...localState.read, ...allIds])] }
      setLocalState(next)
      saveLocalState(next)
    },
    deleteNotification: (notificationId: string) => {
      const next = { ...localState, deleted: [...new Set([...localState.deleted, notificationId])] }
      setLocalState(next)
      saveLocalState(next)
    },
    deleteAll: () => {
      const allIds = notices.map((n: any) => n._id || n.id)
      const next = { ...localState, deleted: [...new Set([...localState.deleted, ...allIds])] }
      setLocalState(next)
      saveLocalState(next)
    },
  }
}
