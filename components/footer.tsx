import Link from "next/link"
import { MobileWinnerBar } from "@/components/mobile-winner-bar"

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#0a0a0a" }} className="border-t border-white/10 pb-20 lg:pb-0">
      {/* Mobile winner bar — footer'ın tepesinde, sadece mobilde */}
      <MobileWinnerBar />

      {/* ── MOBILE ── */}
      <div className="lg:hidden">
        {/* Logo */}
        <div className="flex flex-col items-center pt-10 pb-6 px-4 gap-6">
          <Logo size="lg" />
          <div className="flex items-center gap-4">
            <SocialIcons />
          </div>
        </div>

        {/* Nav Links — full width, centered, separated by lines */}
        <div style={{ padding: "0 30px" }}>
          <Link
            href="/terms"
            className="block py-3 text-center text-white hover:text-[#00d4b4] transition-colors uppercase"
            style={{ fontSize: "16px", fontWeight: 400, letterSpacing: "0.08em" }}
          >
            {"GENEL KURALLAR VE \u015eARTLAR"}
          </Link>
          <Link
            href="/bonus-rules"
            className="block py-3 text-center text-white hover:text-[#00d4b4] transition-colors uppercase"
            style={{ fontSize: "16px", fontWeight: 400, letterSpacing: "0.08em", borderTop: "1px solid rgba(255,255,255,0.9)" }}
          >
            GENEL BONUS KURALLARI
          </Link>
          <Link
            href="/faq"
            className="block py-3 text-center text-white hover:text-[#00d4b4] transition-colors uppercase"
            style={{ fontSize: "16px", fontWeight: 400, letterSpacing: "0.08em", borderTop: "1px solid rgba(255,255,255,0.9)", borderBottom: "1px solid rgba(255,255,255,0.9)" }}
          >
            {"SIK SORULAN SORULAR"}
          </Link>
          <Link
            href="/contact"
            className="block py-3 text-center text-white hover:text-[#00d4b4] transition-colors uppercase"
            style={{ fontSize: "16px", fontWeight: 400, letterSpacing: "0.08em" }}
          >
            {"\u0130LETI\u015e\u0130M"}
          </Link>
        </div>

        {/* Description */}
        <div style={{ backgroundColor: "#111" }}>
          <DescriptionBlock />
        </div>

        {/* Badges */}
        <div style={{ backgroundColor: "#111" }} className="flex items-center justify-center gap-6 py-8 px-4 border-t border-white/10">
          <Badges />
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:block">
        {/* Top: Logo+Social (left) | Vertical links (center-left) */}
        <div className="flex items-start px-20 py-10 gap-24 border-b border-white/10">
          {/* Left col: Logo + Social icons */}
          <div className="flex flex-col gap-5 flex-shrink-0">
            <Logo size="lg" />
            <div className="flex items-center gap-3">
              <SocialIcons />
            </div>
          </div>
          {/* Center col: stacked links */}
          <div className="flex flex-col gap-6 pt-1">
            <Link
              href="/terms"
              className="text-white hover:text-[#00d4b4] transition-colors uppercase tracking-widest"
              style={{ fontSize: "14px", fontWeight: 400 }}
            >
              {"GENEL KURALLAR VE \u015eARTLAR"}
            </Link>
            <Link
              href="/bonus-rules"
              className="text-white hover:text-[#00d4b4] transition-colors uppercase tracking-widest"
              style={{ fontSize: "14px", fontWeight: 400 }}
            >
              GENEL BONUS KURALLARI
            </Link>
            <Link
              href="/faq"
              className="text-white hover:text-[#00d4b4] transition-colors uppercase tracking-widest"
              style={{ fontSize: "14px", fontWeight: 400 }}
            >
              {"SIK SORULAN SORULAR"}
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-[#00d4b4] transition-colors uppercase tracking-widest"
              style={{ fontSize: "14px", fontWeight: 400 }}
            >
              {"\u0130LETI\u015e\u0130M"}
            </Link>
          </div>
        </div>

        {/* Bottom: description (left) + badges (right) side by side */}
        <div style={{ backgroundColor: "#111" }}>
          <div className="flex items-start justify-between px-20 py-8 gap-12">
            {/* Left: description text */}
            <div className="flex-1 min-w-0">
              <DescriptionBlock desktop />
            </div>
            {/* Right: badges stacked vertically centered */}
            <div className="flex flex-col items-end gap-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <Badges />
              </div>
              <p className="text-white/30 text-xs">1.0.341</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Shared sub-components ── */

function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const h = size === "lg" ? "40px" : "32px"
  return (
    <img src="/logo.svg" alt="Velobet" style={{ height: h, width: "auto" }} />
  )
}

function SocialIcons() {
  return (
    <>
      {/* Telegram */}
      <a href="https://t.me/velososyal" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Telegram">
        <img src="/images/telegram.webp" alt="Telegram" className="w-8 h-8 rounded-full" />
      </a>

      {/* X (Twitter) */}
      <a href="#" className="hover:opacity-80 transition-opacity" aria-label="X / Twitter">
        <img src="/images/x-twitter.webp" alt="X (Twitter)" className="w-8 h-8 rounded-full" />
      </a>

      {/* Instagram */}
      <a href="#" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
        <img src="/images/instagram.webp" alt="Instagram" className="w-8 h-8 rounded-full" />
      </a>

      {/* Phone / WhatsApp */}
      <a href="#" className="w-8 h-8 rounded-full bg-[#00d4b4] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Telefon">
        <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      </a>
    </>
  )
}

function DescriptionBlock({ desktop }: { desktop?: boolean }) {
  return (
    <div className={`space-y-4 px-6 lg:px-0 py-8 lg:py-0 leading-relaxed`} style={{ color: "#ffffff", fontSize: "10px" }}>
      <p>
        <span className="text-[#00d4b4] font-semibold">Velobet</span>, Bahis Sektöründe ilkleri hedefleyen, Kullanıcı Memnuniyetini ve yüksek hizmet kalitesini merkeze alan yenilikçi bir Bahis ve Şans Oyunları Platformudur.{" "}
        {"Tüm Dünyadaki Spor Dallarında, 125'ten fazla branşta ve her ay 40.000'in üzerinde Canlı Bahis seçeneğiyle, Oyuncularına zengin içerikli ve yüksek oranlı bir oyun deneyimi sunar. Sadece oran avantajıyla değil, sunduğu benzersiz bahis seçenekleriyle de eğlenceyi ve heyecanı bir araya getirir."}
      </p>
      <p>
        <span className="text-[#00d4b4] font-semibold">Velobet</span>, geniş kapsamlı Canlı Casino bölümünde; Blackjack, Rulet, Baccarat gibi Klasik Masa Oyunlarının yanı sıra piyasanın en yüksek ödüllerini dağıtan Slot Oyunları ile oyuncularına gerçek bir kumarhane atmosferi yaşatır. Şansınızı en sevilen oyunlarda deneyin, büyük kazançlara siz de ortak olun.{" "}
        Sürekli güncellenen Promosyonlarımızla, 7 gün 24 saat kesintisiz çalışan deneyimli <span className="text-[#00d4b4] font-semibold">Destek Ekibimizle</span> daima yanınızdayız. Tüm para yatırma ve çekme işlemleri hızlı, güvenli ve sorunsuz bir şekilde gerçekleşir.
      </p>
      <p>
        Lütfen sorumlu bahis oynayınız. © <span className="text-[#00d4b4] font-semibold">Velobet</span> 2026 – Tüm Hakları Saklıdır.
      </p>
    </div>
  )
}

function Badges() {
  return (
    <>
      {/* 18+ */}
      <img
        src="/images/badge-18.webp"
        alt="18+"
        className="flex-shrink-0"
        style={{ height: "56px", width: "auto" }}
      />

      {/* GCB */}
      <a
        href="https://cert.cga.cw/certificate?id=ZXlKcGRpSTZJbGRvVERSalluWXZUa1JDVW04MloyZzFaamhZZW1jOVBTSXNJblpoYkhWbElqb2lXbGcxY0ZkQ2MyTkRaVTV4UjFkSlEycDFXVlpQWnowOUlpd2liV0ZqSWpvaU9HSmtNamswTnprNFlqQmpNV1l6WXpZeU1EQXhZelExTURjMk1qQTVPVGMwWkRGak1UWXlPV1UxT1RBMFlUQTFPR1EzTURSbVpqZzFaamd4WVdJd09TSXNJblJoWnlJNklpSjk="
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0"
      >
        <img
          src="/images/badge-gcb.webp"
          alt="GCB cert.gcb.cw"
          style={{ height: "56px", width: "auto" }}
        />
      </a>

      {/* DMCA */}
      <img
        src="/images/badge-dmca.webp"
        alt="DMCA Protected"
        className="flex-shrink-0"
        style={{ height: "56px", width: "auto" }}
      />

      {/* LiveChat */}
      <img
        src="/images/badge-livechat.png"
        alt="Customer Support Champion - LiveChat"
        className="flex-shrink-0"
        style={{ height: "56px", width: "auto" }}
      />
    </>
  )
}
