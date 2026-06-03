/**
 * =============================================================================
 * MOBIL HEADER KOMPONENTI - components/header.tsx
 * =============================================================================
 * 
 * Mobil cihazlarda gosterilen ust menu cubugu.
 * Desktop icin DesktopHeader komponenti kullanilir.
 * 
 * YAPISI:
 * - Sol Taraf: Hamburger menu butonu + Logo
 * - Sag Taraf: 
 *   - Uygulama indirme butonlari (Android/iOS)
 *   - Giris/Kayit butonlari (giris yapilmamissa)
 *   - Bakiye + Profil butonu (giris yapilmissa)
 * 
 * PROPS:
 * - onMenuClick: Hamburger menu tiklandiginda
 * - onLoginClick: Giris butonu tiklandiginda
 * - onSearchClick: Arama butonu tiklandiginda (opsiyonel)
 * 
 * GIRIS DURUMU:
 * - Giris yapilmamis: "GIRIS" ve "KAYIT OL" butonlari gosterilir
 * - Giris yapilmis: Bakiye butonu ve profil ikonu gosterilir
 * =============================================================================
 */

"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { useNotifications } from "@/hooks/use-notifications"

// =============================================================================
// TIP TANIMLARI
// =============================================================================
interface HeaderProps {
  onMenuClick: () => void      // Hamburger menu callback
  onLoginClick: () => void     // Giris butonu callback
  onSearchClick?: () => void   // Arama butonu callback (opsiyonel)
}

// =============================================================================
// HEADER KOMPONENTI
// =============================================================================
export function Header({ onMenuClick, onLoginClick, onSearchClick }: HeaderProps) {
  // Auth context'ten kullanici bilgileri
  const { user, isLoggedIn } = useAuth()
  const { unreadCount } = useNotifications()
  
  // Profil menusu gosterim state'i
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="sticky top-0 z-50">
      <header className="flex h-[54px] items-center justify-between bg-[#1a1a1a] px-3" style={{ borderBottom: ".3rem solid #00d4b4" }}>
        
        {/* =========== SOL TARAF =========== */}
        {/* Hamburger Menu + Logo */}
        <div className="flex items-center gap-0" style={{ marginLeft: '-6px' }}>
          
          {/* Hamburger Menu Butonu */}
          <button
            onClick={onMenuClick}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
            aria-label="Menu"
            style={{ marginTop: '2px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 11.5H19" stroke="white" />
              <path d="M5 17.5H19" stroke="white" />
              <path d="M5 5.5H19" stroke="white" />
            </svg>
          </button>
          
          {/* Logo - Sports sayfasina link */}
          <Link href="/sports" className="flex items-center">
            <img src="/logo.svg" alt="Velobet" style={{ height: "20px", width: "auto", marginTop: "-4px" }} />
          </Link>
        </div>

        {/* =========== SAG TARAF =========== */}
        {/* Uygulama Butonlari + Giris/Profil */}
        <div className="flex items-center gap-1.5" style={{ marginRight: '-4px' }}>
          
          {/* Android Uygulama Indirme Butonu */}
          <button
            className="flex items-center justify-center"
            style={{ border: "0.15rem solid #00d4b4", width: "28px", height: "28px", borderRadius: "8px", marginRight: "4px" }}
          >
            <svg fill="#00d4b4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 299.679 299.679" xmlSpace="preserve" style={{ width: "17px", height: "17px" }}>
              <g>
                <path d="M181.122,299.679c10.02,0,18.758-8.738,18.758-18.758v-43.808h12.525c7.516,0,12.525-5.011,12.525-12.525V99.466H74.749v125.123c0,7.515,5.01,12.525,12.525,12.525H99.8v43.808c0,10.02,8.736,18.758,18.758,18.758c10.019,0,18.756-8.738,18.756-18.758v-43.808h25.051v43.808C162.364,290.941,171.102,299.679,181.122,299.679z"/>
                <path d="M256.214,224.589c10.02,0,18.756-8.737,18.756-18.758v-87.615c0-9.967-8.736-18.75-18.756-18.75c-10.021,0-18.758,8.783-18.758,18.75v87.615C237.456,215.851,246.192,224.589,256.214,224.589z"/>
                <path d="M43.466,224.589c10.021,0,18.758-8.737,18.758-18.758v-87.615c0-9.967-8.736-18.75-18.758-18.75c-10.02,0-18.756,8.783-18.756,18.75v87.615C24.71,215.851,33.446,224.589,43.466,224.589z"/>
                <path d="M209.899,1.89c-2.504-2.52-6.232-2.52-8.736,0l-16.799,16.743l-0.775,0.774c-9.961-4.988-21.129-7.479-33.566-7.503c-0.061,0-0.121-0.002-0.182-0.002h-0.002c-0.063,0-0.121,0.002-0.184,0.002c-12.436,0.024-23.604,2.515-33.564,7.503l-0.777-0.774L98.516,1.89c-2.506-2.52-6.232-2.52-8.736,0c-2.506,2.506-2.506,6.225,0,8.729l16.25,16.253c-5.236,3.496-9.984,7.774-14.113,12.667C82.032,51.256,75.727,66.505,74.86,83.027c-0.008,0.172-0.025,0.342-0.033,0.514c-0.053,1.125-0.078,2.256-0.078,3.391H224.93c0-1.135-0.027-2.266-0.078-3.391c-0.008-0.172-0.025-0.342-0.035-0.514c-0.865-16.522-7.172-31.772-17.057-43.487c-4.127-4.893-8.877-9.171-14.113-12.667l16.252-16.253C212.405,8.115,212.405,4.396,209.899,1.89z M118.534,65.063c-5.182,0-9.383-4.201-9.383-9.383c0-5.182,4.201-9.383,9.383-9.383c5.182,0,9.383,4.201,9.383,9.383C127.917,60.862,123.716,65.063,118.534,65.063z M181.145,65.063c-5.182,0-9.383-4.201-9.383-9.383c0-5.182,4.201-9.383,9.383-9.383c5.182,0,9.383,4.201,9.383,9.383C190.527,60.862,186.326,65.063,181.145,65.063z"/>
              </g>
            </svg>
          </button>

          {/* iOS Uygulama Indirme Butonu */}
          <Link
            href="/ios-app"
            className="flex items-center justify-center"
            style={{ border: "0.15rem solid #00d4b4", width: "28px", height: "28px", borderRadius: "8px" }}
          >
            <svg fill="#00d4b4" xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 814 1000" style={{ width: "17px", height: "17px" }}>
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
          </Link>

          {/* =========== GIRIS DURUMUNA GORE BUTONLAR =========== */}
          {isLoggedIn && user ? (
            // GIRIS YAPILMIS: Bakiye + Profil
            <>
              {/* Bakiye Butonu */}
              <Link
                href="/deposit"
                className="flex items-center gap-1 bg-[#00d4b4] text-black font-bold rounded-md hover:bg-[#00b89c] transition-colors"
                style={{ fontSize: "11px", fontWeight: 600, padding: "4px 7px", height: "28px", whiteSpace: "nowrap" }}
              >
                {(user.totalBalance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                <Plus className="w-3.5 h-3.5" />
              </Link>

              {/* Profil Butonu */}
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="relative flex items-center justify-center rounded-md hover:bg-[#00d4b4]/20 transition-colors"
                style={{ width: "28px", height: "28px", border: "2px solid #00d4b4" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#00d4b4">
                  <path d="M8.57 14.098A6.83 6.83 0 1118.63 8.08a6.83 6.83 0 01-3.47 5.946c5.084.87 8.03 3.96 8.03 8.25h-1.5c0-4.195-3.43-6.998-9.63-6.998-6.2 0-9.628 2.803-9.628 6.998h-1.5c0-4.18 2.795-7.218 7.64-8.178zm3.23-.69a5.33 5.33 0 100-10.66 5.33 5.33 0 000 10.66z" />
                </svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
              </button>
            </>
          ) : (
            // GIRIS YAPILMAMIS: Giris + Kayit butonlari
            <>
              {/* Giris Butonu */}
              <button
                onClick={onLoginClick}
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  padding: "0px 4px 0px 4px"
                }}
                className="hover:text-[#00d4b4] transition-colors"
              >
                GİRİŞ
              </button>

              {/* Kayit Ol Butonu */}
              <Link
                href="/register"
                style={{
                  backgroundColor: "#00d4b4",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  padding: "4px 7px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "nowrap"
                }}
                className="hover:opacity-90 transition-opacity"
              >
                KAYIT OL
              </Link>
            </>
          )}
        </div>
      </header>

      {/* =========== DROPDOWN =========== */}
      {/* Profil Menusu - Header altina dropdown olarak acilir */}
      {showProfileMenu && (
        <UserProfileMenu onClose={() => setShowProfileMenu(false)} />
      )}
    </div>
  )
}
