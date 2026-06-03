"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { Bell, Smartphone } from "lucide-react"

export default function VerifyPhonePage() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [step, setStep] = useState<"choose" | "sms">("choose")
  const [smsCode, setSmsCode] = useState(["", "", "", "", "", ""])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...smsCode]
      newCode[index] = value
      setSmsCode(newCode)
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />

      {/* User Header */}
      <div className="bg-zinc-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-10 h-10 text-[#00d4b4]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </div>
          <span className="text-white font-bold">soules211</span>
        </div>
        <button className="bg-zinc-800 px-4 py-2 text-white rounded">
          GERİ
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-[#00d4b4]/20 p-4 flex items-start gap-3">
        <Smartphone className="w-6 h-6 text-[#00d4b4] flex-shrink-0" />
        <p className="text-[#00d4b4] font-medium">
          {step === "choose" 
            ? "TELEFON NUMARASI DEĞİŞİKLİĞİ İÇİN AŞAĞIDAKİ ADIMLARI İZLEYİN"
            : "SMS GÜVENLİĞİNİ AKTİVE ETMEK İÇİN AŞAĞIDAKİ ADIMLARI İZLEYİN"
          }
        </p>
      </div>

      <main className="flex-1 p-4">
        {step === "choose" ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-center mb-6">Doğrulama için yöntem seçiniz</p>
            
            <button 
              onClick={() => setStep("sms")}
              className="w-full py-4 bg-zinc-800 text-white font-medium rounded hover:bg-zinc-700 transition-colors"
            >
              SMS ile Doğrulayın
            </button>
            
            <button className="w-full py-4 bg-zinc-800 text-white font-medium rounded hover:bg-zinc-700 transition-colors">
              E-posta ile Doğrulayın
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Phone Number */}
            <div className="bg-zinc-800 p-4 flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-gray-400" />
              <span className="text-white">*********288</span>
            </div>

            {/* Send SMS Button */}
            <button className="w-full py-4 bg-zinc-700 text-white font-bold hover:bg-zinc-600 transition-colors">
              SMS KODU GÖNDER
            </button>

            {/* Code Input */}
            <div>
              <p className="text-gray-400 text-sm mb-4">*Lütfen gelen kodu buraya giriniz</p>
              <div className="flex gap-2 justify-center">
                {smsCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-10 h-12 bg-transparent border-b-2 border-gray-600 text-white text-center text-xl focus:border-[#00d4b4] outline-none"
                  />
                ))}
              </div>
            </div>

            {/* Activate Button */}
            <button className="w-full py-4 bg-zinc-700 text-white font-bold hover:bg-zinc-600 transition-colors">
              AKTİVE ET
            </button>
          </div>
        )}
      </main>

      {/* Logout Section */}
      <div className="p-4 bg-zinc-900">
        <button className="w-full max-w-xs mx-auto block py-3 bg-transparent border border-white text-white font-medium rounded hover:bg-white/10 transition-colors text-center">
          ÇIKIŞ YAP
        </button>
      </div>

      <Footer />
      <BottomNavigation />

      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
