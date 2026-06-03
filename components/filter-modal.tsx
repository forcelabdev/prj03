"use client"

import { useState } from "react"
import { X, Calendar } from "lucide-react"

interface FilterModalProps {
  onClose: () => void
  onFilter: (startDate: string, endDate: string) => void
}

export function FilterModal({ onClose, onFilter }: FilterModalProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    onFilter("", "")
    onClose()
  }

  const handleFilter = () => {
    onFilter(startDate, endDate)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-w-sm" style={{ borderRadius: "12px", padding: "24px" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 text-xl font-bold">Filtre</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Donem */}
        <p className="text-gray-700 text-sm font-semibold mb-4">Dönem</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Baslangic */}
          <div>
            <p className="text-gray-700 text-xs mb-1.5">
              <span className="text-red-500 mr-0.5">*</span>Başlangıç Tarihi
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-2 py-3 text-sm text-gray-500 border border-gray-300 outline-none focus:border-[#00d4b4] bg-white"
                style={{ borderRadius: "6px" }}
                placeholder="Tarih seç"
              />
            </div>
          </div>

          {/* Bitis */}
          <div>
            <p className="text-gray-700 text-xs mb-1.5">
              <span className="text-red-500 mr-0.5">*</span>Bitiş Tarihi
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-2 py-3 text-sm text-gray-500 border border-gray-300 outline-none focus:border-[#00d4b4] bg-white"
                style={{ borderRadius: "6px" }}
                placeholder="Tarih seç"
              />
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleReset}
            className="py-3 text-sm font-semibold text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            style={{ borderRadius: "6px" }}
          >
            Yenile
          </button>
          <button
            onClick={handleFilter}
            className="py-3 text-sm font-semibold text-gray-800 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#00d4b4", borderRadius: "6px" }}
          >
            Filtre
          </button>
        </div>
      </div>
    </div>
  )
}
