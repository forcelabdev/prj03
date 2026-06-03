"use client"

import { X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { user } = useAuth()

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-zinc-900 w-[90%] max-w-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-white">Merhaba!</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-white text-lg mb-2">
            Toplam Bakiyeniz: <span className="font-bold">{(user.totalBalance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Kazanmaya başlamak için yatırım sayfasını ziyaret edebilirsiniz.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#00d4b4] text-black font-bold rounded hover:bg-[#00b89c] transition-colors"
            >
              Kapat
            </button>
            <Link
              href="/casino"
              onClick={onClose}
              className="flex-1 py-3 bg-[#00d4b4] text-black font-bold rounded hover:bg-[#00b89c] transition-colors text-center"
            >
              Para Yatır
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
