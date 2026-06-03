"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { DesktopHeader } from "@/components/desktop-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { CategoryPopup } from "@/components/category-popup"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Trophy, ChevronLeft, X, Loader2, Search } from "lucide-react"
import { useLeaderboard, getWinnerPoints } from "@/hooks/use-leaderboard"
import BannerSlider from "@/components/banner-slider"
import { RecentWinners } from "@/components/recent-winners"

function TNavTab({ tab, isActive, onClick }: { tab: string; isActive: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0 flex items-center h-full whitespace-nowrap px-4 transition-colors duration-150"
      style={{
        color: isActive || hovered ? "#00d4b4" : "#ffffff",
        fontSize: "16px",
        fontWeight: 500,
        backgroundColor: hovered && !isActive ? "#3a3a3a" : "transparent",
      }}
    >
      {tab}

    </button>
  )
}

type FilterTab = "hepsi" | "planlanmis" | "devam-eden" | "tamamlanmis"
type DetailTab = "lider" | "kurallar"
type MyTournamentTab = "yaklasan" | "devam" | "kapali"

// "ahmetmehmet" → "A.M" | "Ahmet Mehmet" → "A.M" | "ahmet" → "A."
function formatUsername(username?: string): string {
  if (!username) return "-"
  const trimmed = username.trim()
  // Her durumda: ilk harf + "." + son karakter
  const first = trimmed[0].toUpperCase()
  const last = trimmed[trimmed.length - 1]
  return first + "." + last
}

const tournaments = [
  {
    id: "1",
    title: "Velobet 27 Nisan - 04 Mayıs 2.500.000₺ Ödüllü Slot Turnuvası",
    status: "devam-eden",
    statusLabel: "devam ediyor",
    startDate: "27 Nisan, 00:00, 2026",
    endDate: "04 Mayıs, 23:59, 2026",
    startLabel: "27 Nisan, Başlangıç: 00:00",
    criteria: "Puan Kriterleri: Çevrim (minimum bahis sayısı 1)",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/velo-turnuvapng.png-7Wain0cHgFPvTekJNddFr5809bBwc2.jpeg",
    prizes: [
      { rank: "1 Sıra:", amount: "600.000 ₺" },
      { rank: "2 Sıra:", amount: "300.000 ₺" },
      { rank: "3 Sıra:", amount: "150.000 ₺" },
      { rank: "4~10 Sıra:", amount: "20.000 ₺" },
      { rank: "11~50 Sıra:", amount: "10.000 ₺" },
      { rank: "51~100 Sıra:", amount: "5.000 ₺" },
      { rank: "101~250 Sıra:", amount: "2.500 ₺" },
    ],
    get progressPercent() {
      const now = new Date().getTime()
      const start = this.startTimestamp
      const end = this.endTimestamp
      const total = end - start
      const elapsed = Math.max(0, Math.min(now - start, total))
      return Math.round((elapsed / total) * 100)
    },
    get timeLeft() {
      const now = new Date().getTime()
      const end = this.endTimestamp
      const diff = end - now
      if (diff <= 0) return "BITTI"
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      return `${days} GÜN KALDI`
    },
    startTimestamp: new Date("2026-04-20T00:00:00").getTime(),
    endTimestamp: new Date("2026-04-26T23:59:00").getTime(),
    rules: [
      "Bu turnuvanın skor kriteri Çevrim (Turnover) üzerinedir. Oluşturulan her X için (X = oyuncu para biriminde yapılan toplam bahis miktarı veya temel para birimi karşılığı) oyuncuya 1 puan verilir. En yüksek çevrimi yapan oyuncu en yüksek puanı ve sıralamayı elde eder.",
      "Minimum bahis sayısı: 1. Ödüllere hak kazanmak için oyuncu en az 1 tur oynamalıdır, aksi durumda ödül verilmeyecektir.",
      "Turnuva 20/04/2026 00:00:00 tarihinde başlar ve 26/04/2026 23:59:59 tarihinde sona erer.",
      "Şartlar ve Koşullar kısmına bakın.",
      "Slot Oyunları İçin: Minimum bahis : 5 TRY, Maksimum bahis ~ Sınırsız",
    ],
    leaderboard: [
      { rank: 1, username: "Z.T", points: 805916.64, prize: "1.500.000 ₺" },
      { rank: 2, username: "A.M", points: 436960.31, prize: "1.000.000 ₺" },
      { rank: 3, username: "S.K", points: 348167.06, prize: "750.000 ₺" },
      { rank: 4, username: "T.D", points: 314433.48, prize: "425.000 ₺" },
      { rank: 5, username: "S.Ö", points: 310945.48, prize: "425.000 ₺" },
      { rank: 6, username: "İ.D", points: 294980.90, prize: "425.000 ₺" },
      { rank: 7, username: "F.Y", points: 240169.31, prize: "320.000 ₺" },
      { rank: 8, username: "M.G", points: 236542.13, prize: "320.000 ₺" },
      { rank: 9, username: "Ö.A", points: 188611.41, prize: "320.000 ₺" },
      { rank: 10, username: "N.E", points: 187388.35, prize: "320.000 ₺" },
      { rank: 11, username: "Y.E", points: 177771.47, prize: "320.000 ₺" },
      { rank: 12, username: "S.L", points: 174470.98, prize: "200.000 ₺" },
      { rank: 13, username: "Z.K", points: 172428.31, prize: "200.000 ₺" },
      { rank: 14, username: "Y.T", points: 162355.88, prize: "200.000 ₺" },
      { rank: 15, username: "F.S", points: 161876.30, prize: "200.000 ₺" },
    ],
  },
]

// Turnuva detay sayfası (giri�� yapılmış)
function TournamentDetail({
  tournament,
  onBack,
}: {
  tournament: (typeof tournaments)[0]
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("lider")
  const { data: lbData, loading: lbLoading, error: lbError } = useLeaderboard()
  const { user } = useAuth()

  // Kullanıcının sırasını ve ödülünü bul
  const myRank = lbData?.winners?.findIndex((w) => {
    const apiUsername = (w.user?.username || "").toLowerCase().trim()
    const currentUsername = (user?.username || "").toLowerCase().trim()
    return apiUsername === currentUsername
  }) ?? -1
  const myEntry = myRank >= 0 ? lbData?.winners?.[myRank] : null

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Geri butonu */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-foreground px-4 py-5 text-base font-semibold mb-4"
      >
        <ChevronLeft className="w-6 h-6" />
        Geri
      </button>

      {/* Turnuva başlık satırı */}
      <div className="flex gap-3 items-start px-4 mb-4">
        <img
          src={tournament.image}
          alt={tournament.title}
          className="w-16 h-14 object-cover rounded flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-foreground font-bold text-sm leading-snug mb-1">{tournament.title}</h2>
          <p className="text-muted-foreground text-xs">
            Başlangıç {tournament.startDate} Bitiş {tournament.endDate}
          </p>
        </div>
      </div>

      {/* Sıra ve ödül kutuları */}
      <div className="flex gap-2 px-4 mb-6">
        {/* Sıra kutusu */}
        <div
          className="flex items-center overflow-hidden"
          style={{ width: "207px", height: "26px", backgroundColor: "#c4c4c4", border: "1px solid #a8a8a8", borderRadius: "0px" }}
        >
          <div className="flex items-center justify-center px-2 h-full" style={{ borderRight: "1px solid #a8a8a8" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#333333" }} className="flex-shrink-0">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <span className="text-xs px-2" style={{ color: "#111111" }}>
            {myEntry ? `#${myRank + 1}/${lbData?.winners?.length ?? 0}` : "#-"}
          </span>
        </div>

        {/* Ödül kutusu */}
        <div
          className="flex items-center overflow-hidden"
          style={{ width: "207px", height: "26px", backgroundColor: "#c4c4c4", border: "1px solid #a8a8a8", borderRadius: "0px" }}
        >
          <div className="flex items-center justify-center px-2 h-full" style={{ borderRight: "1px solid #a8a8a8" }}>
            <svg width="14" height="14" viewBox="0 0 384 512" fill="#333333" className="flex-shrink-0">
              <path d="M97.12 362.63c-8.69-8.69-4.16-6.24-25.12-11.85-9.51-2.55-17.87-7.45-25.43-13.32L1.2 448.7c-4.39 10.77 3.81 22.47 15.43 22.03l52.69-2.01L105.56 507c8 8.44 22.04 5.81 26.43-4.96l52.05-127.62c-10.84 6.04-22.87 9.58-35.31 9.58-19.5 0-37.82-7.59-51.61-21.37zM382.8 448.7l-45.37-111.24c-7.56 5.88-15.92 10.77-25.43 13.32-21.07 5.64-16.45 3.18-25.12 11.85-13.79 13.78-32.12 21.37-51.62 21.37-12.44 0-24.47-3.55-35.31-9.58L252 502.04c4.39 10.77 18.44 13.4 26.43 4.96l36.25-38.28 52.69 2.01c11.62.44 19.82-11.27 15.43-22.03zM263 340c15.28-15.55 17.03-14.21 38.79-20.14 13.89-3.79 24.75-14.84 28.47-28.98 7.48-28.4 5.54-24.97 25.95-45.75 10.17-10.35 14.14-25.44 10.42-39.58-7.47-28.38-7.48-24.42 0-52.83 3.72-14.14-.25-29.23-10.42-39.58-20.41-20.78-18.47-17.36-25.95-45.75-3.72-14.14-14.58-25.19-28.47-28.98-27.88-7.61-24.52-5.62-44.95-26.41-10.17-10.35-25-14.4-38.89-10.61-27.87 7.6-23.98 7.61-51.9 0-13.89-3.79-28.72.25-38.89 10.61-20.41 20.78-17.05 18.8-44.94 26.41-13.89 3.79-24.75 14.84-28.47 28.98-7.47 28.39-5.54 24.97-25.95 45.75-10.17 10.35-14.15 25.44-10.42 39.58 7.47 28.36 7.48 24.4 0 52.82-3.72 14.14.25 29.23 10.42 39.59 20.41 20.78 18.47 17.35 25.95 45.75 3.72 14.14 14.58 25.19 28.47 28.98C104.6 325.96 106.27 325 121 340c13.23 13.47 33.84 15.88 49.74 5.82a39.676 39.676 0 0 1 42.53 0c15.89 10.06 36.5 7.65 49.73-5.82zM97.66 175.96c0-53.03 42.24-96.02 94.34-96.02s94.34 42.99 94.34 96.02-42.24 96.02-94.34 96.02-94.34-42.99-94.34-96.02z"/>
            </svg>
          </div>
          <span className="text-xs px-2" style={{ color: "#111111" }}>
            {myEntry
              ? (typeof myEntry.prize === "number" ? myEntry.prize.toLocaleString("tr-TR") + " ₺" : myEntry.prize ?? "-")
              : "-"}
          </span>
        </div>
      </div>

      {/* Lider / Kurallar tab'ları */}
      <div className="flex border-b border-border mb-2">
        <button
          onClick={() => setActiveTab("lider")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === "lider" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          Lider Tablosu
          {activeTab === "lider" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("kurallar")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === "kurallar" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          Kurallar
          {activeTab === "kurallar" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tablo içeriği */}
      {activeTab === "lider" ? (
        <div>
          {/* Tablo başlığı */}
          <div className="grid grid-cols-4 text-center text-muted-foreground text-sm font-medium py-4 border-b border-border/60 px-4">
            <span>Sıra</span>
            <span>Oyuncu</span>
            <span>Puan</span>
            <span>Ödül</span>
          </div>

          {lbLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : lbError ? (
            <div className="flex flex-col items-center gap-3 py-16 px-4">
              <p className="text-muted-foreground text-sm text-center">Lider tablosu şu an yüklenemiyor.</p>
              <p className="text-muted-foreground/60 text-xs text-center">Lütfen daha sonra tekrar deneyin.</p>
            </div>
          ) : !lbData?.winners?.length ? (
            <div className="text-center text-muted-foreground py-16 text-sm">Henüz sıralama yok.</div>
          ) : (
            lbData.winners.map((entry, i) => (
              <div key={i} className="px-4" style={{ marginBottom: "2px" }}>
              <div
                className="grid grid-cols-4 text-center items-center"
                style={{ paddingTop: "4px", paddingBottom: "4px", borderTop: "1px solid rgba(255,255,255,0.25)", borderBottom: "1px solid rgba(255,255,255,0.25)" }}
              >
                <div className="flex justify-center">
                  <span
                    className="flex items-center justify-center font-semibold text-sm"
                    style={{ width: "36px", height: "36px", backgroundColor: "#322F31", borderRadius: "0px", color: "#ffffff" }}
                  >
                    {i + 1}
                  </span>
                </div>
                <span className="text-foreground text-sm">{formatUsername(entry.user?.username)}</span>
                <span className="text-foreground text-sm">
                  {(() => { const p = getWinnerPoints(entry); return p != null ? p.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : "-" })()}
                </span>
                <div className="flex justify-center">
                  <span
                    className="flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: "#322F31", borderRadius: "0px", color: "#ffffff", padding: "4px 8px", minWidth: "80px" }}
                  >
                    {typeof entry.prize === "number" ? entry.prize.toLocaleString("tr-TR") + " ₺" : entry.prize ?? "-"}
                  </span>
                </div>
              </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="px-4 space-y-4 pt-4 pb-8">
          {tournament.rules.map((rule, i) => (
            <div key={i} className="flex gap-3 items-start border-b border-border/40 pb-4">
              <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-sm leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Turnuvalarım modal
function MyTournamentsModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<MyTournamentTab>("devam")

  const tabs: { key: MyTournamentTab; label: string; count: number }[] = [
    { key: "yaklasan", label: "Yaklaşan", count: 0 },
    { key: "devam", label: "Devam eden", count: 1 },
    { key: "kapali", label: "Kapal�� (son 48h)", count: 0 },
  ]

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl w-full max-w-lg border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-[#00d4b4] rounded-lg p-2">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-white font-bold text-lg">Turnuvalarım</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
                  activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tablo başlığı */}
        <div className="grid grid-cols-4 text-gray-400 text-xs font-bold px-4 py-3 border-b border-white/10">
          <span className="col-span-2">Ad</span>
          <span className="text-center">Sıra</span>
          <span className="text-center">Bitiş Tarihi</span>
        </div>

        {/* İçerik */}
        {activeTab === "devam" ? (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="grid grid-cols-4 items-start gap-2">
              <a href="#" className="col-span-2 text-primary underline text-sm leading-snug">
                Velobet 27 Nisan - 04 Mayıs 2.500.000₺ Ödüllü Slot Turnuvası
              </a>
              <span className="text-gray-300 text-sm text-center">-</span>
              <div className="text-gray-300 text-xs text-center">
                <div>26.04.26</div>
                <div>23:59 PM</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-gray-500 text-sm">
            Bu kategoride turnuva bulunmamaktadır.
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  )
}

// Turnuva kartı — giriş yapılmış kullanıcı
function TournamentCardLoggedIn({
  tournament,
  onDetailClick,
}: {
  tournament: (typeof tournaments)[0]
  onDetailClick: () => void
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-border max-w-sm mx-auto lg:max-w-none">
      {/* Banner */}
      <div className="relative bg-secondary">
        <img
          src={tournament.image}
          alt={tournament.title}
          className="w-full object-cover"
          style={{ maxHeight: "280px" }}
        />
        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded">
          {tournament.statusLabel}
        </span>
      </div>

      {/* Sarı alan */}
      <div className="bg-primary px-4 py-4">
        <h2 className="text-primary-foreground font-bold text-base leading-snug mb-1">{tournament.title}</h2>
        <p className="text-primary-foreground/70 text-xs mb-0.5">{tournament.startLabel}</p>
        <p className="text-primary-foreground/70 text-xs mb-2">{tournament.criteria}</p>
        <p className="text-xs mb-3 text-primary-foreground/80">
          Oyunları görmek için{" "}
          <span className="underline font-semibold cursor-pointer text-primary-foreground">tıklayın</span>
        </p>

        {/* Ödüller */}
        <div className="flex gap-3 items-start mb-4">
          <div className="flex flex-col items-center pt-0.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="27.454" viewBox="0 0 30 27.454" className="w-7 h-7">
              <style>{`.trophy-fill{fill:#000000;}`}</style>
              <path className="trophy-fill" d="M35.84,12.887a1.023,1.023,0,0,0-.853-.481h-5.2l.242-1.456a1.023,1.023,0,0,0-1.023-1.19H12.977a1.023,1.023,0,0,0-1.023,1.19l.242,1.456H7.022a1.023,1.023,0,0,0-.921,1.47l2.967,6.077a6.48,6.48,0,0,0,5.163,3.581,7.227,7.227,0,0,0,3.7,3.963v2.667h-.426a3.525,3.525,0,1,0,0,7.049H24.5a3.525,3.525,0,1,0,0-7.049h-.426V27.5a7.227,7.227,0,0,0,3.7-3.963,6.48,6.48,0,0,0,5.167-3.581L35.9,13.876a1.023,1.023,0,0,0-.058-.989ZM10.914,19.05l-2.241-4.6h3.891l1.153,6.916A4.406,4.406,0,0,1,10.914,19.05ZM25.977,33.687A1.477,1.477,0,0,1,24.5,35.164H17.509a1.478,1.478,0,0,1,0-2.957H24.5A1.48,1.48,0,0,1,25.977,33.687Zm-3.949-3.526H19.982V28.094a6.729,6.729,0,0,0,2.046,0Zm4.123-8.383a5.218,5.218,0,0,1-10.293,0L14.184,11.8H27.826ZM31.1,19.05a4.406,4.406,0,0,1-2.8,2.309l1.153-6.916h3.891Z" transform="translate(-5.999 -9.76)"></path>
            </svg>
            <span className="text-xs font-semibold text-black mt-1">Ödüller</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
              {tournament.prizes.slice(0, 6).map((prize, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold text-primary-foreground">{prize.rank} </span>
                  <br />
                  <span className="text-primary-foreground/80">{prize.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-primary-foreground/60 mb-1">
          <span>{tournament.startDate}</span>
          <span>{tournament.endDate}</span>
        </div>
        <div className="w-full h-1.5 bg-black/20 rounded-full mb-1">
          <div
            className="h-full bg-primary-foreground/60 rounded-full transition-all"
            style={{ width: `${tournament.progressPercent}%` }}
          />
        </div>
        <div className="text-right text-xs font-bold text-primary-foreground/60 mb-4">{tournament.timeLeft}</div>

        {/* Butonlar */}
        <div className="flex gap-3">
          <button
            onClick={onDetailClick}
            className="flex-1 py-3 border border-primary-foreground text-primary-foreground font-medium text-sm rounded hover:bg-black/10 transition-colors"
          >
            Detaylar
          </button>
          <button className="flex-1 py-3 font-medium text-sm rounded transition-colors uppercase" style={{ backgroundColor: "#5a5435", color: "#ffffff" }}>
            Kayıtlı
          </button>
        </div>
      </div>
    </div>
  )
}

// Turnuva kartı — giri���� yapılmamış
function TournamentCardGuest({
  tournament,
  onLoginClick,
}: {
  tournament: (typeof tournaments)[0]
  onLoginClick: () => void
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-border max-w-sm mx-auto lg:max-w-none">
      <div className="relative bg-secondary">
        <img
          src={tournament.image}
          alt={tournament.title}
          className="w-full object-cover"
          style={{ maxHeight: "280px" }}
        />
        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded">
          {tournament.statusLabel}
        </span>
      </div>

      <div className="bg-primary px-4 py-4">
        <h2 className="text-primary-foreground font-bold text-base leading-snug mb-1">{tournament.title}</h2>
        <p className="text-primary-foreground/70 text-xs mb-0.5">{tournament.startLabel}</p>
        <p className="text-primary-foreground/70 text-xs mb-2">{tournament.criteria}</p>
        <p className="text-xs mb-3 text-primary-foreground/80">
          Oyunları görmek için{" "}
          <span className="underline font-semibold cursor-pointer text-primary-foreground">tıklayın</span>
        </p>

        <div className="flex gap-3 items-start mb-4">
          <div className="flex flex-col items-center pt-0.5 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="27.454" viewBox="0 0 30 27.454" className="w-7 h-7">
              <style>{`.trophy-fill{fill:#000000;}`}</style>
              <path className="trophy-fill" d="M35.84,12.887a1.023,1.023,0,0,0-.853-.481h-5.2l.242-1.456a1.023,1.023,0,0,0-1.023-1.19H12.977a1.023,1.023,0,0,0-1.023,1.19l.242,1.456H7.022a1.023,1.023,0,0,0-.921,1.47l2.967,6.077a6.48,6.48,0,0,0,5.163,3.581,7.227,7.227,0,0,0,3.7,3.963v2.667h-.426a3.525,3.525,0,1,0,0,7.049H24.5a3.525,3.525,0,1,0,0-7.049h-.426V27.5a7.227,7.227,0,0,0,3.7-3.963,6.48,6.48,0,0,0,5.167-3.581L35.9,13.876a1.023,1.023,0,0,0-.058-.989ZM10.914,19.05l-2.241-4.6h3.891l1.153,6.916A4.406,4.406,0,0,1,10.914,19.05ZM25.977,33.687A1.477,1.477,0,0,1,24.5,35.164H17.509a1.478,1.478,0,0,1,0-2.957H24.5A1.48,1.48,0,0,1,25.977,33.687Zm-3.949-3.526H19.982V28.094a6.729,6.729,0,0,0,2.046,0Zm4.123-8.383a5.218,5.218,0,0,1-10.293,0L14.184,11.8H27.826ZM31.1,19.05a4.406,4.406,0,0,1-2.8,2.309l1.153-6.916h3.891Z" transform="translate(-5.999 -9.76)"></path>
            </svg>
            <span className="text-xs font-semibold text-primary-foreground/70 mt-1">Ödüller</span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
              {tournament.prizes.slice(0, 6).map((prize, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold text-primary-foreground">{prize.rank} </span>
                  <br />
                  <span className="text-primary-foreground/80">{prize.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-primary-foreground/60 mb-1">
          <span>{tournament.startDate}</span>
          <span>{tournament.endDate}</span>
        </div>
        <div className="w-full h-1.5 bg-black/20 rounded-full mb-1">
          <div
            className="h-full bg-primary-foreground/60 rounded-full transition-all"
            style={{ width: `${tournament.progressPercent}%` }}
          />
        </div>
        <div className="text-right text-xs font-bold text-primary-foreground/60 mb-4">{tournament.timeLeft}</div>

        <div className="flex gap-3">
          <button
            onClick={onLoginClick}
            className="flex-1 py-3 bg-background text-foreground font-bold rounded hover:bg-secondary transition-colors uppercase"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            Giriş Yap
          </button>
          <button
            onClick={onLoginClick}
            className="flex-1 py-3 bg-secondary text-foreground font-bold rounded hover:bg-muted transition-colors uppercase"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  )
}

// Desktop detail (sol panel + sağ tablo)
function TournamentDetailDesktop({
  tournament,
  onBack,
}: {
  tournament: (typeof tournaments)[0]
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("lider")
  const [showMyTournaments, setShowMyTournaments] = useState(false)
  const { data: lbData, loading: lbLoading, error: lbError } = useLeaderboard()

  return (
    <div className="bg-background">
      <div className="flex gap-6">
        {/* Sol panel */}
        <div className="w-80 flex-shrink-0">
          <div className="rounded-xl overflow-hidden border border-border">
            {/* Banner — tam boy */}
            <div className="relative bg-secondary">
              <img
                src={tournament.image}
                alt={tournament.title}
                className="w-full object-cover"
              />
              {/* KAYITLI + AKTİF badge'leri */}
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <span className="bg-black/70 text-primary text-xs font-bold px-2 py-1 rounded">KAYITLI</span>
                <span className="bg-black/70 text-primary text-xs font-bold px-2 py-1 rounded">AKTİF</span>
              </div>
            </div>

            {/* Altın alan */}
            <div className="bg-primary px-4 py-4">
              <h2 className="text-primary-foreground font-bold text-sm leading-snug mb-1">{tournament.title}</h2>
              <p className="text-primary-foreground/70 text-xs mb-0.5">{tournament.startLabel}</p>
              <p className="text-primary-foreground/70 text-xs mb-2">{tournament.criteria}</p>
              <p className="text-xs mb-3 text-primary-foreground/80">
                Oyunları görmek için{" "}
                <span className="underline font-semibold cursor-pointer text-primary-foreground">tıklayın</span>
              </p>

              <div className="flex gap-2 items-start mb-4">
                <div className="flex flex-col items-center pt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="27.454" viewBox="0 0 30 27.454" className="w-6 h-6">
                    <style>{`.trophy-fill{fill:#000000;}`}</style>
                    <path className="trophy-fill" d="M35.84,12.887a1.023,1.023,0,0,0-.853-.481h-5.2l.242-1.456a1.023,1.023,0,0,0-1.023-1.19H12.977a1.023,1.023,0,0,0-1.023,1.19l.242,1.456H7.022a1.023,1.023,0,0,0-.921,1.47l2.967,6.077a6.48,6.48,0,0,0,5.163,3.581,7.227,7.227,0,0,0,3.7,3.963v2.667h-.426a3.525,3.525,0,1,0,0,7.049H24.5a3.525,3.525,0,1,0,0-7.049h-.426V27.5a7.227,7.227,0,0,0,3.7-3.963,6.48,6.48,0,0,0,5.167-3.581L35.9,13.876a1.023,1.023,0,0,0-.058-.989ZM10.914,19.05l-2.241-4.6h3.891l1.153,6.916A4.406,4.406,0,0,1,10.914,19.05ZM25.977,33.687A1.477,1.477,0,0,1,24.5,35.164H17.509a1.478,1.478,0,0,1,0-2.957H24.5A1.48,1.48,0,0,1,25.977,33.687Zm-3.949-3.526H19.982V28.094a6.729,6.729,0,0,0,2.046,0Zm4.123-8.383a5.218,5.218,0,0,1-10.293,0L14.184,11.8H27.826ZM31.1,19.05a4.406,4.406,0,0,1-2.8,2.309l1.153-6.916h3.891Z" transform="translate(-5.999 -9.76)"></path>
                  </svg>
            <span className="text-xs font-semibold text-black mt-1">Ödüller</span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                    {tournament.prizes.slice(0, 6).map((prize, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-semibold text-primary-foreground">{prize.rank}</span>
                        <br />
                        <span className="text-primary-foreground/80">{prize.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-primary-foreground/60 mb-1">
                <span>{tournament.startDate}</span>
                <span>{tournament.endDate}</span>
              </div>
              <div className="w-full h-1.5 bg-black/20 rounded-full mb-1">
                <div className="h-full bg-primary-foreground/60 rounded-full" style={{ width: `${tournament.progressPercent}%` }} />
              </div>
              <div className="text-right text-xs font-bold text-primary-foreground/60 mb-4">{tournament.timeLeft}</div>

              <div className="flex gap-2">
                <button className="flex-1 py-2.5 border border-primary-foreground text-primary-foreground font-medium text-xs rounded">
                  Detaylar
                </button>
                <button className="flex-1 py-2.5 font-medium text-xs rounded uppercase" style={{ backgroundColor: "#5a5435", color: "#ffffff" }}>
                  Kayıtlı
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ alan */}
        <div className="flex-1">
          {/* Tablar */}
          <div className="flex border-b border-border mb-4">
            <button
              onClick={() => setActiveTab("lider")}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === "lider"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Lider Tablosu
            </button>
            <button
              onClick={() => setActiveTab("kurallar")}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === "kurallar"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Kurallar
            </button>
          </div>

          {activeTab === "lider" ? (
            <div>
              {/* Tablo başlığı */}
              <div className="grid grid-cols-4 text-muted-foreground text-sm font-semibold py-3 border-b border-border">
                <span className="pl-6">S�������������ra</span>
                <span className="text-center">Oyuncu</span>
                <span className="text-center">Puan</span>
                <span className="text-right pr-4">Ödül</span>
              </div>

              {lbLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : lbError ? (
                <div className="text-center text-muted-foreground py-16 text-sm">{lbError}</div>
              ) : !lbData?.winners?.length ? (
                <div className="text-center text-muted-foreground py-16 text-sm">Henüz sıralama yok.</div>
              ) : (
                lbData.winners.map((entry, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 items-center py-4 border-b border-border/40 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="pl-6">
                      <span className="text-foreground text-sm font-bold italic">#{i + 1}</span>
                    </div>
                    <span className="text-foreground text-sm text-center">{formatUsername(entry.user?.username)}</span>
                    <span className="text-foreground text-sm text-center">
                      {(() => { const p = getWinnerPoints(entry); return p != null ? p.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : "-" })()}
                    </span>
                    <span className="text-foreground text-sm text-right pr-4">
                      {typeof entry.prize === "number" ? entry.prize.toLocaleString("tr-TR") + " ₺" : entry.prize ?? "-"}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {tournament.rules.map((rule, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-border py-5">
                  <span className="text-primary mt-0.5 flex-shrink-0">
                    {i === 0 && <Trophy className="w-5 h-5" />}
                    {i === 1 && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                    )}
                    {i === 2 && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    )}
                    {i === 3 && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      </svg>
                    )}
                    {i === 4 && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    )}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showMyTournaments && <MyTournamentsModal onClose={() => setShowMyTournaments(false)} />}
    </div>
  )
}


function TournamentsPageInner() {
  const searchParams = useSearchParams()

  const getInitialFilter = (): FilterTab => {
    const f = searchParams.get("filter")
    if (f === "active") return "devam-eden"
    if (f === "upcoming") return "planlanmis"
    if (f === "completed") return "tamamlanmis"
    return "hepsi"
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterTab>(getInitialFilter)
  const [selectedTournament, setSelectedTournament] = useState<(typeof tournaments)[0] | null>(null)
  const [showMyTournaments, setShowMyTournaments] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [categoryTabs, setCategoryTabs] = useState<string[]>(["Lobi"])
  const [activeCategoryTab, setActiveCategoryTab] = useState("Lobi")
  const [tournamentsData, setTournamentsData] = useState<typeof tournaments>([])
  const [tournamentsLoading, setTournamentsLoading] = useState(true)

  const { isLoggedIn } = useAuth()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 200)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Turnuva verilerini API'den çek
    const fetchTournaments = async () => {
      setTournamentsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.tournaments && Array.isArray(data.tournaments)) {
            setTournamentsData(data.tournaments)
          } else {
            // API başarılı ama veri yok - hardcoded veriyi kullan
            setTournamentsData(tournaments)
          }
        } else {
          // API hatasında hardcoded veriyi kullan
          setTournamentsData(tournaments)
        }
      } catch (error) {
        // API hatasında hardcoded veriyi kullan
        setTournamentsData(tournaments)
      } finally {
        setTournamentsLoading(false)
      }
    }
    
    fetchTournaments()
  }, [])

  useEffect(() => {
    // Turnuva verileri yüklenince ilk turnuvayı seç
    if (tournamentsData && tournamentsData.length > 0 && !selectedTournament) {
      setSelectedTournament(tournamentsData[0])
    } else if (!selectedTournament && tournaments.length > 0) {
      // Eğer tournamentsData boşsa, hardcoded tournaments'ten ilk elemanı seç
      setSelectedTournament(tournaments[0])
    }
  }, [tournamentsData])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { gamesService } = await import("@/lib/services/games-service")
        const res = await gamesService.getCategories()
        if (res.success && res.categories) {
          const names = (res.categories as any[]).map((c: any) => c.name || c.title || "")
          setCategoryTabs(["Lobi", ...names.filter(Boolean)])
        }
      } catch {}
    }
    fetchCategories()
  }, [])

  // Turnuva verilerini API'den çek
  useEffect(() => {
    const fetchTournaments = async () => {
      setTournamentsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.tournaments && Array.isArray(data.tournaments)) {
            // API'den gelen turnuvaları filtrele - sadece Velobet'i göster
            const filteredTournaments = data.tournaments.filter((t: any) => 
              t.title && t.title.includes('Velobet')
            )
            // Eğer Velobet turnuvası varsa onu göster, yoksa hardcoded Velobet'i kullan
            setTournamentsData(filteredTournaments.length > 0 ? filteredTournaments : tournaments)
          } else {
            // API başarılı ama veri yok - Velobet turnuvasını kullan
            setTournamentsData(tournaments)
          }
        } else {
          // API hatasında Velobet turnuvasını kullan
          setTournamentsData(tournaments)
        }
      } catch (error) {
        // API hatasında Velobet turnuvasını kullan
        setTournamentsData(tournaments)
      } finally {
        setTournamentsLoading(false)
      }
    }
    
    fetchTournaments()
  }, [])



  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "hepsi", label: "Hepsi" },
    { key: "planlanmis", label: "Planlanmış" },
    { key: "devam-eden", label: "Devam Eden" },
    { key: "tamamlanmis", label: "Tamamlanmış" },
  ]

  const filtered = tournamentsData.filter((t) => {
    if (activeFilter === "hepsi") return true
    return t.status === activeFilter
  })



  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobil header */}
      <div className="lg:hidden sticky top-0 z-50">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
      </div>
      {/* Desktop header */}
      <div className="hidden lg:block sticky top-0 z-50">
        <DesktopHeader onLoginClick={() => setIsLoginModalOpen(true)} />
      </div>

      {/* Banner Slider */}
      <div className="relative w-full h-[232px] lg:h-[330px]">
        <BannerSlider position="slots" />
        <div className="hidden lg:flex absolute right-0 z-10 overflow-hidden" style={{ bottom: "10px", width: "auto", backgroundColor: "rgba(0,0,0,0.72)", clipPath: "polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%)", paddingLeft: "50px" }}>
          <RecentWinners />
        </div>
      </div>

      {/* Category Navigation — casino ile birebir aynı */}
      <div className={`${isSticky ? "fixed top-[50px] lg:top-[106px] left-0 right-0 z-30" : ""} lg:px-20`} style={{ backgroundColor: "#151516" }}>
        <div className="flex items-center h-[54px] lg:h-[77px]">
          <button className="hidden lg:flex flex-shrink-0 self-stretch items-center justify-center text-[#00d4b4] hover:opacity-80 transition-colors" style={{ fontSize: "32px", width: "44px", backgroundColor: "#322F31", marginRight: "10px" }}>
            &#8249;
          </button>
          <button onClick={() => {}} className="lg:hidden px-4">
            <Search className="h-5 w-5 text-white" />
          </button>
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-none h-full" style={{ gap: "0" }}>
            {categoryTabs.map((tab) => (
              <TNavTab
                key={tab}
                tab={tab}
                isActive={activeCategoryTab === tab}
                onClick={() => setActiveCategoryTab(tab)}
              />
            ))}
          </div>
          <button className="hidden lg:flex flex-shrink-0 self-stretch items-center justify-center text-[#00d4b4] hover:opacity-80 transition-colors" style={{ fontSize: "32px", width: "44px", marginLeft: "10px", backgroundColor: "#322F31" }}>
            &#8250;
          </button>
        </div>
      </div>
      {isSticky && <div className="h-[54px] lg:h-[77px]" />}

      {/* Mobil: Detay ya da Liste */}
      {selectedTournament && isLoggedIn ? (
        <div className="lg:hidden">
          <TournamentDetail tournament={selectedTournament} onBack={() => setSelectedTournament(null)} />
        </div>
      ) : null}

      <main className={`pb-20 lg:pb-8 px-4 lg:px-8 lg:max-w-full ${selectedTournament && isLoggedIn ? "hidden lg:block" : ""}`}>
          <h1 className="text-foreground font-bold text-2xl pt-6 pb-4">Turnuvalar</h1>

          {/* Filtre butonları */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex-shrink-0 px-4 py-2 text-xs font-medium rounded border transition-colors ${
                  activeFilter === tab.key
                    ? "border-primary text-foreground bg-transparent"
                    : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {activeFilter === tab.key && <span className="mr-1 text-primary">&#x2713;</span>}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop: Grid + Detay Panel */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sol taraf - Kartlar grid */}
            <div className="lg:col-span-2 max-w-4xl">
              <div className="grid grid-cols-1 gap-6">
                {filtered.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground py-16">
                    Bu kategoride turnuva bulunmamaktadır.
                  </div>
                ) : (
                  filtered.map((tournament) =>
                    isLoggedIn ? (
                      <TournamentCardLoggedIn
                        key={tournament.id}
                        tournament={tournament}
                        onDetailClick={() => setSelectedTournament(tournament)}
                      />
                    ) : (
                      <TournamentCardGuest
                        key={tournament.id}
                        tournament={tournament}
                        onLoginClick={() => setIsLoginModalOpen(true)}
                      />
                    )
                  )
                )}
              </div>
            </div>

            {/* Sağ taraf - Detay Panel */}
            {selectedTournament && isLoggedIn ? (
              <div className="lg:col-span-2 sticky top-24 h-max">
                <TournamentDetailDesktop tournament={selectedTournament} onBack={() => setSelectedTournament(null)} />
              </div>
            ) : (
              <div className="lg:col-span-2 sticky top-24 h-max flex items-center justify-center text-muted-foreground rounded-lg border border-border/50 p-8 text-center">
                <p>Turnuva seçin</p>
              </div>
            )}
          </div>

          {/* Mobil: Kartlar */}
          <div className="lg:hidden grid grid-cols-1 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-16">
                Bu kategoride turnuva bulunmamaktadır.
              </div>
            ) : (
              filtered.map((tournament) =>
                isLoggedIn ? (
                  <TournamentCardLoggedIn
                    key={tournament.id}
                    tournament={tournament}
                    onDetailClick={() => setSelectedTournament(tournament)}
                  />
                ) : (
                  <TournamentCardGuest
                    key={tournament.id}
                    tournament={tournament}
                    onLoginClick={() => setIsLoginModalOpen(true)}
                  />
                )
              )
            )}
          </div>
        </main>

      <Footer />

      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <CategoryPopup isOpen={isCategoryPopupOpen} onClose={() => setIsCategoryPopupOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      {showMyTournaments && <MyTournamentsModal onClose={() => setShowMyTournaments(false)} />}

      <BottomNavigation
        onCenterClick={() => setIsCategoryPopupOpen(!isCategoryPopupOpen)}
        isPopupOpen={isCategoryPopupOpen}
      />
    </div>
  )
}

export default function TournamentsPage() {
  return (
    <Suspense fallback={null}>
      <TournamentsPageInner />
    </Suspense>
  )
}
