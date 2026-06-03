'use client'

// Right sidebar with bet coupon and banners
import Link from "next/link"

export function DesktopRightSidebar() {
  return (
    <aside className="w-72 bg-[#0f0f0f] border-l border-white/5 py-4 px-4 min-h-full">
      {/* Bahis Kuponu */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-sm">Bahis kuponu</h3>
          <button className="text-[#00d4b4] text-xs hover:text-[#00b89c]">Yardım</button>
        </div>
        <p className="text-gray-400 text-xs mb-3">
          Bahis yapabilmek için, kayıt ol veya giriş ye herhangi bir miktar seçin.
        </p>
        <div className="bg-black/50 rounded p-2 text-gray-500 text-xs text-center">
          Kupon boş
        </div>
      </div>

      {/* Özel Turnuvalar */}
      <div className="mb-6">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <span>▶</span> ÖZEL TURNUVALAR <span className="text-gray-500">‹</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-600/30 rounded-lg p-3 text-center">
            <div className="text-[#00d4b4] font-bold text-xs">Sweet Bonanza 1000</div>
          </div>
          <div className="bg-purple-600/30 rounded-lg p-3 text-center">
            <div className="text-[#00d4b4] font-bold text-xs">Move Bonanza</div>
          </div>
          <div className="bg-purple-600/30 rounded-lg p-3 text-center">
            <div className="text-[#00d4b4] font-bold text-xs">Olympus 1000</div>
          </div>
        </div>
      </div>

      {/* Slot Casino Banner */}
      <div className="bg-gradient-to-b from-[#00a896] to-[#007a6e] rounded-lg p-3 mb-4">
        <div className="text-white font-bold text-sm mb-2">SLOT CASINO LOBİSİ</div>
        <button className="bg-[#00d4b4] hover:bg-[#00b89c] text-black font-bold px-3 py-1 rounded text-xs w-full transition-colors">
          TIKLA GİT
        </button>
      </div>

      {/* Canli Casino Banner */}
      <div className="bg-gradient-to-b from-[#00a896] to-[#007a6e] rounded-lg p-3">
        <div className="text-white font-bold text-sm mb-2">CANLI CASINO LOBİSİ</div>
        <button className="bg-[#00d4b4] hover:bg-[#00b89c] text-black font-bold px-3 py-1 rounded text-xs w-full transition-colors">
          TIKLA GİT
        </button>
      </div>
    </aside>
  )
}
