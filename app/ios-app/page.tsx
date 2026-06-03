"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { DesktopHeader } from "@/components/desktop-header"
import { BottomNavigation } from "@/components/bottom-navigation"
import { CategoryPopup } from "@/components/category-popup"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { Footer } from "@/components/footer"


/* ─── iPhone Mockup ─────────────────────────────────── */
function IphoneMockup({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  return (
    <div
      className={`IphoneMockup${large ? " IphoneMockupLarge" : ""}`}
      style={{
        backgroundColor: "#000",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        border: "3px solid #bbb5b3",
        borderRadius: large ? "36px" : "28px",
        width: large ? "220px" : "160px",
        height: large ? "440px" : "320px",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 5px #111, 0 0 0 1px #444, 0 24px 64px rgba(0,0,0,0.9)",
      }}
    >
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: "3.5%",
          right: 0,
          left: 0,
          marginRight: "auto",
          marginLeft: "auto",
          width: "30%",
          height: "4%",
          backgroundColor: "#000",
          borderRadius: "40px",
          zIndex: 10,
        }}
      />
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-20"
        style={{ paddingTop: large ? "10px" : "6px", paddingBottom: "2px" }}
      >
        <span className="text-white font-semibold" style={{ fontSize: large ? "13px" : "8px" }}>00:56</span>
        <div className="flex items-center gap-1">
          <svg width={large ? "16" : "10"} height={large ? "10" : "7"} viewBox="0 0 12 8" fill="none">
            <path d="M0 8 L2 4.5 L4 8 L6 3 L8 7.5 L10 1 L12 8" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
          <svg width={large ? "14" : "9"} height={large ? "10" : "7"} viewBox="0 0 10 8" fill="white">
            <rect x="0" y="4" width="2" height="4" rx="0.5" />
            <rect x="3" y="2.5" width="2" height="5.5" rx="0.5" />
            <rect x="6" y="0.5" width="2" height="7.5" rx="0.5" />
          </svg>
          <div className="flex items-center gap-0.5">
            <div className="border border-white/60 flex items-center px-[2px]"
              style={{ width: large ? "22px" : "14px", height: large ? "11px" : "7px", borderRadius: "2px" }}>
              <div className="bg-white rounded-sm" style={{ height: large ? "7px" : "4px", width: "70%" }} />
            </div>
          </div>
        </div>
      </div>
      {/* Screen content */}
      <div className="absolute inset-0 overflow-hidden" style={{ top: large ? "44px" : "26px", bottom: large ? "24px" : "16px" }}>
        {children}
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center" style={{ height: large ? "24px" : "16px" }}>
        <div className="bg-white/40 rounded-full" style={{ width: large ? "80px" : "50px", height: large ? "4px" : "3px" }} />
      </div>
    </div>
  )
}

/* ─── App screens ────────────────────────────────────── */
function Screen1({ large = false }: { large?: boolean }) {
  const fs = large ? { h: "16px", sm: "10px", xs: "8px", xxs: "7px" } : { h: "9px", sm: "7px", xs: "6px", xxs: "5px" }
  return (
    <div className="bg-[#0d0d0d] h-full flex flex-col">
      <div className="bg-[#1a1a1a] flex items-center justify-between px-2 py-1 border-b border-[#333]">
        <div className="bg-[#f5a623] rounded flex items-center justify-center font-black text-black"
          style={{ width: large ? "28px" : "16px", height: large ? "28px" : "16px", fontSize: large ? "10px" : "6px" }}>V</div>
        <div className="flex gap-1">
          <div className="border border-white/30 rounded text-white" style={{ padding: "2px 5px", fontSize: fs.xs }}>GİRİŞ</div>
          <div className="bg-[#f5a623] rounded font-bold text-black" style={{ padding: "2px 5px", fontSize: fs.xs }}>KAYIT OL</div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#1a0a00] to-[#8B4513] flex items-center justify-center"
        style={{ height: large ? "140px" : "90px" }}>
        <div className="text-center">
          <div className="text-[#f5a623] font-black" style={{ fontSize: large ? "20px" : "13px" }}>25.000.000₺</div>
          <div className="text-white font-bold" style={{ fontSize: large ? "9px" : "5px" }}>5000 KİŞİYE GARANTİ ÖDÜLÜ</div>
          <div className="text-[#f5a623] font-black" style={{ fontSize: large ? "10px" : "6px" }}>HAFTALIK TURNUVA</div>
        </div>
      </div>
      <div className="flex bg-[#1a1a1a] border-b border-[#333]">
        {["Canlı 157", "Yaklaşan Karşılaş..."].map((t, i) => (
          <div key={t} className={`flex-1 text-center font-bold ${i === 0 ? "text-[#f5a623] border-b-2 border-[#f5a623]" : "text-white/50"}`}
            style={{ fontSize: fs.xs, padding: large ? "6px 0" : "3px 0" }}>{t}</div>
        ))}
      </div>
      <div className="flex gap-1 px-1 bg-[#111]" style={{ padding: large ? "4px" : "2px" }}>
        {["Futbol", "Basketbol", "Masa Tenis", "Voleybol"].map((s, i) => (
          <div key={s} className={`rounded font-bold whitespace-nowrap ${i === 0 ? "bg-[#f5a623] text-black" : "text-white/50"}`}
            style={{ fontSize: fs.xxs, padding: large ? "3px 6px" : "1px 4px" }}>{s}</div>
        ))}
      </div>
      {[{ t1: "Aliaga FA", t2: "Samsunspor", o1: "91.00", o2: "51.00" },
        { t1: "Kulüpler Hazırlık Maçları", t2: "(Format Değişikliği Olabilir)", o1: "2.10", o2: "3.40" }
      ].map((m, i) => (
        <div key={i} className="flex items-center border-b border-[#222] gap-1" style={{ padding: large ? "6px 8px" : "4px 6px" }}>
          <div className="flex-1">
            <div className="text-white font-semibold" style={{ fontSize: fs.xs }}>{m.t1}</div>
            <div className="text-white/60" style={{ fontSize: fs.xxs }}>{m.t2}</div>
          </div>
          <div className="bg-[#1f2d3d] rounded text-[#f5a623] font-bold" style={{ fontSize: fs.xxs, padding: "2px 4px" }}>{m.o1}</div>
          <div className="bg-[#1f2d3d] rounded text-[#f5a623] font-bold" style={{ fontSize: fs.xxs, padding: "2px 4px" }}>{m.o2}</div>
        </div>
      ))}
      <div className="flex bg-[#111] border-t border-[#333] mt-auto">
        {["Canlı Destek", "Casino", "1000X", "Canlı Casino", "25.000.000"].map((item, i) => (
          <div key={i} className={`flex-1 text-center ${i === 2 ? "text-[#f5a623]" : "text-white/40"}`}
            style={{ fontSize: large ? "8px" : "5px", padding: large ? "6px 0" : "3px 0" }}>{item}</div>
        ))}
      </div>
    </div>
  )
}

function Screen2({ large = false }: { large?: boolean }) {
  const fs = { xs: large ? "8px" : "5px", sm: large ? "10px" : "6px", md: large ? "13px" : "8px", lg: large ? "18px" : "11px", xl: large ? "24px" : "14px" }
  return (
    <div className="bg-[#0d0d0d] h-full flex flex-col">
      <div className="bg-[#1a1a1a] flex items-center justify-between px-2 py-1 border-b border-[#333]">
        <div className="bg-[#f5a623] rounded flex items-center justify-center font-black text-black"
          style={{ width: large ? "28px" : "16px", height: large ? "28px" : "16px", fontSize: large ? "10px" : "6px" }}>V</div>
        <div className="flex gap-1">
          <div className="border border-white/30 rounded text-white" style={{ padding: "2px 5px", fontSize: fs.xs }}>GİRİŞ</div>
          <div className="bg-[#f5a623] rounded font-bold text-black" style={{ padding: "2px 5px", fontSize: fs.xs }}>KAYIT OL</div>
        </div>
      </div>
      <div className="bg-gradient-to-b from-[#2d0070] to-[#1a0050] flex flex-col items-center justify-center"
        style={{ height: large ? "160px" : "100px" }}>
        <div className="text-[#f5a623] font-bold tracking-widest uppercase" style={{ fontSize: fs.xs }}>JACKPOT</div>
        <div className="text-white font-black drop-shadow-lg" style={{ fontSize: fs.xl }}>GERİ DÖNDÜ!</div>
        <div className="text-white/70 text-center px-3 leading-tight" style={{ fontSize: fs.xs }}>Tüm oyunlarda geçerlidir.</div>
      </div>
      <div className="flex-1 px-2 py-2">
        <div className="text-white font-bold mb-1" style={{ fontSize: fs.md }}>Promosyonlar</div>
        <div className="flex border-b border-[#333] mb-2">
          <div className="text-[#f5a623] font-bold border-b-2 border-[#f5a623]" style={{ fontSize: fs.sm, padding: large ? "4px 8px" : "2px 5px" }}>Tüm</div>
        </div>
        <div className="rounded-lg overflow-hidden bg-gradient-to-br from-[#1a0050] to-[#2d0070] flex items-center justify-center"
          style={{ height: large ? "80px" : "50px" }}>
          <div className="text-center">
            <div className="text-[#f5a623] font-black" style={{ fontSize: fs.lg }}>25.000.000₺</div>
            <div className="text-white" style={{ fontSize: fs.xs }}>5000 KİŞİYE GARANTİ ÖDÜLÜ</div>
          </div>
        </div>
      </div>
      <div className="flex bg-[#111] border-t border-[#333]">
        {["Canlı Destek", "Casino", "1000X", "Canlı Casino", "25.000.000"].map((item, i) => (
          <div key={i} className={`flex-1 text-center ${i === 1 ? "text-[#f5a623]" : "text-white/40"}`}
            style={{ fontSize: large ? "8px" : "5px", padding: large ? "6px 0" : "3px 0" }}>{item}</div>
        ))}
      </div>
    </div>
  )
}

function Screen3({ large = false }: { large?: boolean }) {
  const fs = { xs: large ? "8px" : "5px", sm: large ? "10px" : "6px", md: large ? "12px" : "7px" }
  return (
    <div className="bg-[#0d0d0d] h-full flex flex-col">
      <div className="bg-[#1a1a1a] flex items-center justify-between px-2 py-1 border-b border-[#333]">
        <div className="bg-[#f5a623] rounded flex items-center justify-center font-black text-black"
          style={{ width: large ? "28px" : "16px", height: large ? "28px" : "16px", fontSize: large ? "10px" : "6px" }}>V</div>
        <div className="flex gap-1">
          <div className="border border-white/30 rounded text-white" style={{ padding: "2px 5px", fontSize: fs.xs }}>GİRİŞ</div>
          <div className="bg-[#f5a623] rounded font-bold text-black" style={{ padding: "2px 5px", fontSize: fs.xs }}>KAYIT OL</div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-[#3d0070] to-[#0a0020] flex items-center justify-center px-2"
        style={{ height: large ? "120px" : "75px" }}>
        <div className="text-center">
          <div className="text-[#f5a623] font-bold uppercase" style={{ fontSize: fs.xs }}>BAHİS YAPTIĞIN TAKIM</div>
          <div className="text-[#f5a623] font-black" style={{ fontSize: large ? "14px" : "9px" }}>BAHİS ALDIĞINIZ MAÇ</div>
          <div className="text-white font-black" style={{ fontSize: large ? "16px" : "10px" }}>KAZANDI</div>
        </div>
      </div>
      <div className="flex bg-[#111] px-1 gap-1" style={{ padding: large ? "4px" : "2px" }}>
        {["Lobi", "Top 30 Casino", "Holigan Turnuva"].map((t, i) => (
          <div key={t} className={`rounded font-bold whitespace-nowrap ${i === 0 ? "bg-[#f5a623] text-black" : "text-white/50"}`}
            style={{ fontSize: fs.xs, padding: large ? "3px 6px" : "1px 4px" }}>{t}</div>
        ))}
      </div>
      <div className="px-2 py-1 flex-1">
        <div className="text-white font-bold mb-1" style={{ fontSize: fs.md }}>EN IYI TOP 30</div>
        <div className="grid grid-cols-2 gap-1">
          {[{ name: "Aviator", from: "#7f1d1d", to: "#dc2626" }, { name: "High Flyer", from: "#4c1d95", to: "#7c3aed" }].map((g) => (
            <div key={g.name} className="rounded flex items-end p-1"
              style={{ height: large ? "55px" : "36px", background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}>
              <span className="text-white font-bold" style={{ fontSize: fs.xs }}>{g.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex bg-[#111] border-t border-[#333]">
        {["Canlı Destek", "Casino", "1000X", "Canlı Casino", "25.000.000"].map((item, i) => (
          <div key={i} className={`flex-1 text-center ${i === 1 ? "text-[#f5a623]" : "text-white/40"}`}
            style={{ fontSize: large ? "8px" : "5px", padding: large ? "6px 0" : "3px 0" }}>{item}</div>
        ))}
      </div>
    </div>
  )
}

/* ─── Step screens ──────────────────────────────────── */
function StepScreen1() {
  return (
    <div className="bg-[#0d0d0d] h-full flex flex-col items-center justify-center p-4 gap-3">
      <div className="bg-[#1c1c1e] rounded-xl w-full p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-[#f5a623] rounded-lg flex items-center justify-center font-black text-black text-[10px]">V</div>
          <div className="flex-1 bg-[#2c2c2e] rounded-lg px-2 py-1 text-[8px] text-white/50">betsfire.com</div>
        </div>
        <div className="bg-[#1a1a1a] rounded h-[180px] flex items-center justify-center">
          <div className="text-white/20 text-[9px]">Safari</div>
        </div>
      </div>
    </div>
  )
}

function StepScreen2() {
  return (
    <div className="bg-[#0d0d0d] h-full flex flex-col">
      <div className="flex-1 bg-[#1c1c1e]" />
      <div className="bg-[#2c2c2e] px-2 py-1 flex items-center gap-2">
        <span className="text-white/40 text-[8px]">{"< >"}</span>
        <div className="flex-1 bg-[#3a3a3c] rounded text-[8px] text-white/50 px-2 py-0.5">betsfire.com</div>
        <div className="w-6 h-6 border border-white/40 rounded flex items-center justify-center">
          <svg width="9" height="12" viewBox="0 0 9 12" fill="none" stroke="white" strokeWidth="1.2">
            <path d="M4.5 1v7M1 4.5L4.5 1 8 4.5" /><rect x="1" y="9" width="7" height="2" rx="0.5" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function StepScreen3() {
  return (
    <div className="bg-[#1c1c1e] h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333]">
        <span className="text-[#007aff] text-[9px]">Vazgeç</span>
        <span className="text-white text-[9px] font-semibold">Ana Ekrana Ekle</span>
        <span className="text-[#007aff] text-[9px] font-bold px-2 py-0.5 border border-[#007aff] rounded">Ekle</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#333]">
        <div className="w-9 h-9 bg-[#f5a623] rounded-xl flex items-center justify-center font-black text-black text-[12px]">V</div>
        <div>
          <div className="text-white text-[9px] font-semibold">VELOBET</div>
          <div className="text-white/50 text-[7px]">https://betsfire.com</div>
        </div>
      </div>
      <div className="px-3 py-1 text-white/50 text-[7px] leading-tight border-b border-[#333]">
        Ana ekranınıza, bu web sitesine kolayca erişebilmeniz için bir simge eklenir.
      </div>
      <div className="flex-1 bg-[#1c1c1e] px-1 pt-2">
        {[["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l"],["z","x","c","v","b","n","m"]].map((row, ri) => (
          <div key={ri} className="flex justify-center gap-0.5 mb-0.5">
            {row.map(k => (
              <div key={k} className="w-[22px] h-[22px] bg-[#3a3a3c] rounded text-center text-[7px] text-white flex items-center justify-center">{k}</div>
            ))}
          </div>
        ))}
        <div className="flex gap-0.5 mt-0.5 justify-center">
          <div className="w-8 h-[22px] bg-[#3a3a3c] rounded text-[6px] text-white flex items-center justify-center">123</div>
          <div className="flex-1 max-w-[90px] h-[22px] bg-[#3a3a3c] rounded text-[7px] text-white flex items-center justify-center">Spatiu</div>
          <div className="w-10 h-[22px] bg-[#007aff] rounded text-[7px] text-white flex items-center justify-center">OK</div>
        </div>
      </div>
    </div>
  )
}

function StepScreen4() {
  return (
    <div className="bg-[#1c1c2e] h-full flex flex-col items-center justify-center gap-3">
      <div className="w-16 h-16 bg-[#f5a623] rounded-2xl flex items-center justify-center shadow-xl">
        <span className="text-2xl font-black text-black">V</span>
      </div>
      <div className="text-white text-[10px] font-semibold">VELOBET</div>
      <div className="flex gap-4 mt-4">
        {["#00a651","#007aff","#34c759","#ff3b30"].map((c, i) => (
          <div key={i} className="w-10 h-10 rounded-xl" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="w-24 h-7 bg-[#2c2c2e] rounded-full flex items-center justify-center mt-2">
        <span className="text-white/50 text-[8px]">Ara</span>
      </div>
    </div>
  )
}

/* ─── Steps data ─────────────────────────────────────── */
const STEPS = [
  { title: "Adım 1", desc: 'Safari uygulamasını açın ve adres çubuğuna sitemizin adresini girin.', screen: <StepScreen1 /> },
  { title: "Adım 2", desc: 'Sayfanın alt kısmındaki paylaş ikonuna (kare ve ok yukarı) basın.', screen: <StepScreen2 /> },
  { title: "Adım 3", desc: 'Gelen ekranda bulunan "Ekle" butonuna basın.', screen: <StepScreen3 /> },
  { title: "Adım 4", desc: 'VELOBET artık mobil cihazınızda!', screen: <StepScreen4 /> },
]

/* ─── Page ───────────────────────────────────────────── */
export default function IosAppPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const prev = () => setCurrentStep((s) => (s - 1 + STEPS.length) % STEPS.length)
  const next = () => setCurrentStep((s) => (s + 1) % STEPS.length)
  const step = STEPS[currentStep]

  const handleInstall = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "VELOBET", url: window.location.href })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden">
        <Header onMenuClick={() => setMenuOpen(true)} onLoginClick={() => setLoginOpen(true)} />
      </div>
      {/* Desktop header */}
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setLoginOpen(true)} />
      </div>

      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} onLoginClick={() => { setMenuOpen(false); setLoginOpen(true) }} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Page */}
      <main
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url(/ios-app-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-black/55 z-0" />
        {/* Blue halftone glow bottom-right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] z-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at bottom right, rgba(20,50,200,0.4) 0%, transparent 70%)" }}
        />

        <div className="relative z-10">

          {/* ── Section 1: mockups ──────────────────────── */}
          <section className="pt-8 pb-4 px-4">
            {/* Mobile: title + desc + single center phone */}
            <div className="lg:hidden">
              <h1 className="text-[var(--gold)] font-black text-3xl text-center leading-tight mb-4 uppercase">
                VELOBET MOBİL<br />UYGULAMA
              </h1>
              <p className="text-white text-center text-sm leading-relaxed mb-8 px-2">
                Mobil uygulama ile güncel giriş adresine kesintisiz ulaş. Bahis sektörünün en iyi oranları ve en çok kazandıran casino oyunları için VELOBET&apos;i takip edin.
              </p>
              {/* 3 phones: Large=220x440, Small=160x320 */}
              {/* Orta yarım genişlik=110px. Sol telefon right=calc(50%+110px), Sağ left=calc(50%+110px) */}
              {/* Yan telefonlar 160px genişlik, yarısı (80px) görünür, diğer yarısı overflow ile kırpılır */}
              <div
                className="relative overflow-hidden w-full"
                style={{ height: "440px" }}
              >
                {/* Sol telefon */}
                <div
                  className="absolute"
                  style={{ right: "calc(50% + 130px)", top: "60px", zIndex: 1 }}
                >
                  <IphoneMockup><Screen1 /></IphoneMockup>
                </div>
                {/* Orta telefon */}
                <div
                  className="absolute"
                  style={{ left: "50%", transform: "translateX(-50%)", bottom: 0, zIndex: 10 }}
                >
                  <IphoneMockup large><Screen2 large /></IphoneMockup>
                </div>
                {/* Sağ telefon */}
                <div
                  className="absolute"
                  style={{ left: "calc(50% + 130px)", top: "60px", zIndex: 1 }}
                >
                  <IphoneMockup><Screen3 /></IphoneMockup>
                </div>
              </div>
            </div>

            {/* Desktop: 3 phones side by side */}
            <div className="hidden lg:block">
              <div className="flex items-end justify-center gap-4 py-8">
                <div style={{ transform: "rotate(-5deg) translateX(24px)", transformOrigin: "bottom center", opacity: 0.85 }}>
                  <IphoneMockup><Screen1 /></IphoneMockup>
                </div>
                <div style={{ transform: "translateY(-24px)", zIndex: 10 }}>
                  <IphoneMockup large><Screen2 large /></IphoneMockup>
                </div>
                <div style={{ transform: "rotate(5deg) translateX(-24px)", transformOrigin: "bottom center", opacity: 0.85 }}>
                  <IphoneMockup><Screen3 /></IphoneMockup>
                </div>
              </div>
            </div>

            {/* iPhone için İndir */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleInstall}
                className="inline-flex items-center justify-center gap-3 bg-[#1c1c1e]/90 border border-white/20 text-white font-semibold hover:bg-[#2c2c2e] transition shadow-xl flex-shrink-0"
                style={{ width: "199px", height: "58px", borderRadius: "15px" }}
              >
                <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" height="24" width="20">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
                <span>iPhone için İndir</span>
              </button>
            </div>
          </section>

          {/* ── Section 2: step slider ───────────────────── */}
          <section className="py-8 pb-20 lg:pb-12 relative">

            <div className="max-w-5xl mx-auto px-4 lg:px-12">

              {/* Slider row - kart sol, telefon sağ, kart biraz telefon arkasına giriyor */}
              <div className="flex items-center justify-center">

                {/* Gold card: kartın sağ kenarı telefon altına giriyor */}
                <div
                  className="rounded-3xl flex flex-col justify-between py-8 px-6 text-white relative overflow-hidden flex-shrink-0"
                  style={{
                    background: "linear-gradient(160deg, #f5c842 0%, #f5a623 40%, #c87d0a 100%)",
                    boxShadow: "0 16px 48px rgba(245,166,35,0.3)",
                    width: "200px",
                    height: "340px",
                    marginRight: "-28px",
                    zIndex: 1,
                  }}
                >
                  <div className="text-left space-y-4 px-1">
                    <h2 className="font-bold text-3xl text-white drop-shadow">
                      {step.title}
                    </h2>
                    <p className="font-medium leading-relaxed text-white/90 text-sm text-center">
                      {step.desc}
                    </p>
                  </div>
                  {/* Logo */}
                  <div className="px-1">
                    <img src="/logo.svg" alt="Velobet" style={{ height: "24px", width: "auto", filter: "brightness(0) invert(1)" }} />
                  </div>
                </div>

                {/* iPhone mockup: 220x440 - telefon öne */}
                <div
                  className="flex-shrink-0"
                  style={{
                    width: "220px",
                    height: "440px",
                    zIndex: 2,
                    position: "relative",
                  }}
                >
                    <div
                      style={{
                        backgroundColor: "#000",
                        position: "relative",
                        overflow: "hidden",
                        boxSizing: "border-box" as const,
                        border: "3px solid #bbb5b3",
                        borderRadius: "36px",
                        width: "100%",
                        height: "100%",
        boxShadow: "inset 0 0 0 5px #111, 0 0 0 1px #444, 0 24px 64px rgba(0,0,0,0.9)",
                      }}
                    >
                      {/* Dynamic island */}
                      <div
                        style={{
                          position: "absolute",
                          top: "3.5%",
                          right: 0,
                          left: 0,
                          marginRight: "auto",
                          marginLeft: "auto",
                          width: "30%",
                          height: "4%",
                          backgroundColor: "#000",
                          borderRadius: "40px",
                          zIndex: 10,
                        }}
                      />
                      {/* Status bar */}
                      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-20"
                        style={{ height: "10%", paddingTop: "1%" }}>
                        <span className="text-white font-semibold" style={{ fontSize: "12px" }}>00:56</span>
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 16 12" fill="white" style={{ width: "14px", height: "auto" }}>
                            <rect x="0" y="4" width="3" height="8" rx="0.5"/>
                            <rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5"/>
                            <rect x="9" y="0.5" width="3" height="11.5" rx="0.5"/>
                            <rect x="13.5" y="0" width="2" height="10" rx="0.5" opacity="0.4"/>
                          </svg>
                          <svg viewBox="0 0 20 12" fill="white" style={{ width: "18px", height: "auto" }}>
                            <rect x="0" y="1" width="17" height="10" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
                            <rect x="17.5" y="3.5" width="2" height="5" rx="1" fill="white" opacity="0.6"/>
                            <rect x="1.5" y="2.5" width="13" height="7" rx="1" fill="white"/>
                          </svg>
                        </div>
                      </div>
                      {/* Screen content */}
                      <div className="absolute inset-0 overflow-hidden" style={{ top: "12%", bottom: "5%" }}>
                        {step.screen}
                      </div>
                      {/* Home indicator */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center" style={{ height: "5%" }}>
                        <div className="bg-white/40 rounded-full" style={{ width: "35%", height: "3px" }} />
                      </div>
                    </div>
                  </div>
              </div>

              {/* Dot indicators - her biri 50x4px */}
              <div className="flex justify-center gap-3 mt-6">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className="transition-all duration-300"
                    style={{
                      width: "50px",
                      height: "4px",
                      borderRadius: "2px",
                      backgroundColor: i === currentStep ? "var(--gold)" : "#3a3a4a",
                    }}
                  />
                ))}
              </div>

            </div>
          </section>

        </div>
      </main>

      <Footer />

      <div className="lg:hidden">
        <CategoryPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
        <BottomNavigation onCenterClick={() => setPopupOpen((v) => !v)} isPopupOpen={popupOpen} />
      </div>
    </div>
  )
}
