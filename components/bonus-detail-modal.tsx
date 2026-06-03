"use client"

import { X } from "lucide-react"
import DOMPurify from "dompurify"

interface BonusDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bonus: {
    title: string
    image?: string
    banner?: string
    content?: string
    terms?: string
    rules?: string[]
  } | null
  onLogin: () => void
  onRegister: () => void
}

export function BonusDetailModal({ 
  isOpen, 
  onClose, 
  bonus,
  onLogin,
  onRegister 
}: BonusDetailModalProps) {
  if (!isOpen || !bonus) return null

  const rawImageUrl = bonus.image || bonus.banner || ""
  const imageUrl = (() => {
    if (!rawImageUrl) return ""
    if (rawImageUrl.startsWith("/api/proxy")) return rawImageUrl
    // domain dahil proxy'ye al: /api/proxy/domain.com/path
    const match = rawImageUrl.match(/https?:\/\/([^/]+)\/(.+)/)
    if (match) return `/api/proxy/${match[1]}/${match[2]}`
    if (rawImageUrl.startsWith("/uploads/") || rawImageUrl.startsWith("uploads/"))
      return `/api/proxy/${rawImageUrl.replace(/^\//, "")}`
    return rawImageUrl
  })()
  const rules = bonus.rules || []
  const rawHtml = bonus.terms || bonus.content || ""
  const htmlContent = typeof window !== "undefined" ? DOMPurify.sanitize(rawHtml) : rawHtml

  // Parse markdown-style bold text for white text on dark backgrounds
  const parseRule = (rule: string, isDark: boolean = false) => {
    return rule.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={isDark ? "text-white font-bold" : "text-black font-bold"}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <>
      {/* Mobile: Full screen modal */}
      <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col">

        {/* Promo Image — buttons overlaid at bottom, X at top right */}
        <div
          className="relative w-full bg-cover bg-center"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundColor: '#F4D03F',
            minHeight: 318,
            aspectRatio: '430/318'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-24 right-4 z-10 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-black hover:bg-black/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Kayıt Ol / Giriş Yap — overlaid on the image, bottom left */}
          <div className="absolute bottom-5 left-6 flex items-center gap-4">
            <button
              onClick={onRegister}
              className="font-bold text-base hover:opacity-70 transition-opacity flex items-center justify-center"
              style={{ width: 80, height: 42, background: "#00d4b4", color: "#000" }}
            >
              Kayıt Ol
            </button>
            <button
              onClick={onLogin}
              className="font-bold text-base hover:opacity-70 transition-opacity flex items-center justify-center"
              style={{ width: 80, height: 42, background: "#00d4b4", color: "#000" }}
            >
              Giriş Yap
            </button>
          </div>
        </div>

        {/* Tab */}
        <div className="border-b border-gray-200">
          <div className="px-4">
            <button className="py-4 text-[#00a896] border-b-2 border-[#00d4b4] font-medium text-sm">
              Kurallar & Sartlar
            </button>
          </div>
        </div>

        {/* Rules Content */}
        <div className="px-4 py-6">
          <h3 className="text-black font-bold text-base mb-4">{bonus.title}</h3>
          {htmlContent ? (
            <div
              className="prose prose-sm max-w-none text-gray-700 [&_strong]:text-black [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : rules.length > 0 ? (
            <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
              {rules.map((rule, index) => (
                <p key={index}>
                  <span className="text-black font-semibold">{index + 1}-</span> {parseRule(rule, false)}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Detaylar icin musteri hizmetleri ile iletisime geciniz.</p>
          )}
        </div>
      </div>

      {/* Desktop: Centered modal */}
      <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/80">
        <div className="bg-white max-w-2xl w-full mx-4 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

          {/* Promo Image — buttons overlaid at bottom, X at top right */}
          <div
            className="relative w-full h-64 bg-cover bg-center flex-shrink-0"
            style={{
              backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
              backgroundColor: '#F4D03F'
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
            className="absolute top-8 right-4 z-10 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-black hover:bg-black/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Kayit Ol / Giris Yap — overlaid on the image, bottom left */}
            <div className="absolute bottom-5 left-6 flex items-center gap-10">
              <button
                onClick={onRegister}
                className="text-black font-bold text-base hover:opacity-70 transition-opacity"
              >
                Kayit Ol
              </button>
              <button
                onClick={onLogin}
                className="text-black font-bold text-base hover:opacity-70 transition-opacity"
              >
                Giris Yap
              </button>
            </div>
          </div>

          {/* Rules section */}
          <div className="flex-1 overflow-y-auto">
            {/* Tab */}
            <div className="border-b border-gray-200 sticky top-0">
              <div className="px-6">
                <button className="py-3 text-[#00a896] border-b-2 border-[#00d4b4] font-medium text-sm">
                  Kurallar & Sartlar
                </button>
              </div>
            </div>

            {/* Rules Content */}
            <div className="px-6 py-6">
              <h3 className="text-black font-bold text-base mb-4">{bonus.title}</h3>
              {htmlContent ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700 [&_strong]:text-black [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : rules.length > 0 ? (
                <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                  {rules.map((rule, index) => (
                    <p key={index}>
                      <span className="text-black font-semibold">{index + 1}-</span> {parseRule(rule, false)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Detaylar icin musteri hizmetleri ile iletisime geciniz.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
