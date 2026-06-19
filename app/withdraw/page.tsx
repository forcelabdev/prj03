"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { DesktopHeader } from "@/components/desktop-header"
import { ChevronLeft, Lock, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { paymentService, type WithdrawMethod } from "@/lib/services/payment-service"
import { tokenManager } from "@/lib/token-manager"
import { meeldevService } from "@/lib/services/meeldev-service"
import { galaxypayService } from "@/lib/services/galaxypay-service"
import { transactionService } from "@/lib/services/transaction-service"

// Geçici maintenance mode - çekim işlevleri devre dışı
const MAINTENANCE_MODE = false
const MAINTENANCE_MESSAGE = "Çekim sistemi geçici olarak bakımda. Lütfen daha sonra tekrar deneyiniz."

// Tum cekim yontemleri - her yontem icin ayni POST /auth/bank-withdraw akisi
const ALL_WITHDRAW_METHODS: WithdrawMethod[] = [
  { id: 'galaxypay-bank',   name: 'GalaxyPay Havale',  logo: 'GLXPAY', icon: '/images/galaxypay.png',          desc: 'Anında', min: '100 TL',  max: '100.000 TL', type: 'bank' },
  { id: 'galaxypay-papara', name: 'GalaxyPay Papara',  logo: 'GLXPAY', icon: '/images/galaxypay.png',          desc: 'Anında', min: '100 TL',  max: '100.000 TL', type: 'ewallet' },
  { id: 'super-havale',  name: 'Super Havale',  logo: 'SUPER',  icon: '/logos/super-havale.svg',  desc: 'Anında', min: '100 TL',  max: '100.000 TL', type: 'bank', paymentUrl: 'https://www.superhavale.net' },
  { id: 'maxi-havale',   name: 'Maxi Havale',   logo: 'MAXI',   icon: '/logos/maxi-havale.svg',   desc: 'Anında', min: '100 TL',  max: '100.000 TL', type: 'bank', paymentUrl: 'https://www.luqapays.com' },
  { id: 'mpay-havale',   name: 'MPay Havale',   logo: 'MPAY',   icon: '/logos/mpay.svg',         desc: 'Anında', min: '100 TL',  max: '1.000.000 TL', type: 'bank', paymentUrl: 'https://www.luqapays.com' },
  { id: 'mpay-fast',     name: 'MPay Fast Havale', logo: 'MPAY', icon: '/logos/mpay-fast.svg',    desc: 'Anında', min: '100 TL',  max: '100.000 TL', type: 'bank', paymentUrl: 'https://www.luqapays.com' },
  { id: 'usdt-trc20',    name: 'USDT (TRC20)',  logo: 'USDT',   icon: '/logos/usdt-trc20.svg',   desc: '10-30 dk', min: '10 USDT', max: '50.000 USDT', type: 'crypto', paymentUrl: 'https://cryptobp.co' },
  { id: 'jetbak-transfer', name: 'Jet Bank Transfer', logo: 'JETBAK', icon: '/logos/jetbak.svg', desc: 'Anında', min: '100 TL', max: '500.000 TL', type: 'bank', paymentUrl: 'https://www.luqapays.com' },
  { id: 'paymentnew',    name: 'Payment',       logo: 'PAYMENT', icon: '/logos/vip-fast.webp', desc: 'Anında', min: '50 TL', max: '100.000 TL', type: 'bank', paymentUrl: 'https://www.luqapays.com' },
  { id: 'glblpay',       name: 'Global Pay',    logo: 'GLOBAL', icon: '/logos/rapid-havale.webp', desc: '5-15 dk', min: '100 TL', max: '200.000 TL', type: 'bank', paymentUrl: 'https://www.luqapays.com' },
  { id: 'oto-havale',    name: 'Oto Havale',    logo: 'OTO',    icon: '/logos/oto.svg', desc: 'Anında', min: '100 TL', max: '100.000 TL', type: 'bank', paymentUrl: 'https://www.luqapays.com' },
]

export default function WithdrawPage() {
  const { user, isLoggedIn } = useAuth()
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [amount, setAmount] = useState("")
  const [bankAccount, setBankAccount] = useState("")   // IBAN veya hesap no
  const [accountHolder, setAccountHolder] = useState("") // Hesap sahibi (MeelDev)
  const [bankName, setBankName] = useState("")           // Banka adı (MeelDev)
  const [address, setAddress] = useState("")           // Kripto cuzdan
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [hasPendingWithdraw, setHasPendingWithdraw] = useState(false)
  const [pendingWithdrawAmount, setPendingWithdrawAmount] = useState(0)
  const [isCheckingPending, setIsCheckingPending] = useState(true)

  const selected = selectedMethod ? ALL_WITHDRAW_METHODS.find(m => m.id === selectedMethod) : null

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Pending çekim talebi kontrolü
  useEffect(() => {
    const checkPendingWithdraw = async () => {
      if (!user?.id) {
        setIsCheckingPending(false)
        return
      }
      
      try {
        const res = await transactionService.getHistory(user.id)
        if (res.success && res.transactions) {
          const pendingWithdraw = res.transactions.find(
            t => t.type === 'withdraw' && t.status === 'pending'
          )
          if (pendingWithdraw) {
            setHasPendingWithdraw(true)
            setPendingWithdrawAmount(pendingWithdraw.amount)
          } else {
            setHasPendingWithdraw(false)
            setPendingWithdrawAmount(0)
          }
        }
      } catch (err) {
        console.log("[v0] Pending withdraw check error:", err)
      } finally {
        setIsCheckingPending(false)
      }
    }
    
    checkPendingWithdraw()
  }, [user?.id])

  const handleSelectMethod = (id: string) => {
    setSelectedMethod(id)
    setError("")
    setSuccess("")
    setAmount("")
    setBankAccount("")
    setAccountHolder("")
    setBankName("")
    setAddress("")
    if (window.innerWidth < 1024) setIsMobileView(true)
  }

  const handleWithdraw = async () => {
    // Maintenance mode kontrolü
    if (MAINTENANCE_MODE) {
      setError(MAINTENANCE_MESSAGE)
      return
    }

    // Pending çekim kontrolü
    if (hasPendingWithdraw) {
      setError(`Bekleyen bir çekim talebiniz bulunmaktadır (${pendingWithdrawAmount.toLocaleString('tr-TR')} ₺). Yeni talep oluşturmadan önce mevcut talebin sonuçlanmasını bekleyiniz.`)
      return
    }

    if (!selected || !amount) {
      setError("Lütfen tutar girin")
      return
    }
    const parsedAmount = parseFloat(amount.replace(",", "."))
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Geçerli bir tutar girin")
      return
    }
    // GalaxyPay Bank Transfer için özel validasyon
    if (selected.id === 'galaxypay-bank') {
      if (!bankAccount) { setError("Lütfen IBAN numaranızı girin"); return }
      if (!accountHolder) { setError("Lütfen hesap sahibi adını girin"); return }
      if (!bankName) { setError("Lütfen banka adını girin"); return }
    } else if (selected.id === 'galaxypay-papara') {
      if (!bankAccount) { setError("Lütfen Papara numaranızı girin"); return }
    // MeelDev için özel validasyon
    } else if (selected.id === 'meeldev') {
      if (!bankAccount) { setError("Lütfen IBAN numaranızı girin"); return }
      if (!accountHolder) { setError("Lütfen hesap sahibi adını girin"); return }
      if (!bankName) { setError("Lütfen banka adını girin"); return }
    } else {
      if (selected.type === "bank" && !bankAccount) {
        setError("Lütfen IBAN numaranızı girin"); return
      }
      if (selected.type === "ewallet" && !bankAccount) {
        setError("Lütfen hesap numaranızı girin"); return
      }
      if (selected.type === "crypto" && !address) {
        setError("Lütfen cüzdan adresinizi girin"); return
      }
    }

    setIsSubmitting(true)
    setError("")

    try {
      // GalaxyPay Bank Transfer çekim akışı
      if (selected.id === 'galaxypay-bank') {
        const gpRes = await galaxypayService.createWithdraw({
          amount: parsedAmount,
          method: 'bank-transfer',
          accountHolder,
          iban: bankAccount,
          bankName,
        })
        if (gpRes.success) {
          setSuccess(gpRes.message || "Çekim talebi oluşturuldu. Admin onayı bekleniyor.")
          setAmount(""); setBankAccount(""); setAccountHolder(""); setBankName("")
        } else {
          setError(gpRes.error || "GalaxyPay çekim talebi oluşturulamadı")
        }
        setIsSubmitting(false)
        return
      }

      // GalaxyPay Papara çekim akışı
      if (selected.id === 'galaxypay-papara') {
        const gpRes = await galaxypayService.createWithdraw({
          amount: parsedAmount,
          method: 'papara',
          accountNumber: bankAccount,
          accountHolder: accountHolder || undefined,
        })
        if (gpRes.success) {
          setSuccess(gpRes.message || "Çekim talebi oluşturuldu. Admin onayı bekleniyor.")
          setAmount(""); setBankAccount(""); setAccountHolder("")
        } else {
          setError(gpRes.error || "GalaxyPay Papara çekim talebi oluşturulamadı")
        }
        setIsSubmitting(false)
        return
      }

      // MeelDev çekim akışı
      if (selected.id === 'meeldev') {
        const res = await meeldevService.createWithdraw({
          amount: parsedAmount,
          iban: bankAccount,
          accountHolder,
          bankName,
        })
        if (res.success) {
          setSuccess("Çekim talebi oluşturuldu. Admin onayı bekleniyor.")
          setAmount(""); setBankAccount(""); setAccountHolder(""); setBankName("")
        } else {
          setError(res.error || "Çekim talebi oluşturulamadı")
        }
        setIsSubmitting(false)
        return
      }

      // User'ın username'ini al - backend authentication'ı buna göre yapıyor
      const username = user?.username || tokenManager.getUser()?.username || ''
      
      if (!username) {
        setError("Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.")
        return
      }

      // Backend'e POST isteği - çekim talebini oluştur
      const response = await paymentService.createWithdrawal({
        method: selected.id,
        amount: parsedAmount,
        details: {
          bankName: selected.name,
          accountName: username,
          iban: bankAccount,
          address: address,
        },
      })

      console.log("[v0] Withdraw API Response:", response)

      if (response.success) {
        setSuccess(response.message || "Çekim talebiniz alındı! İnceleme sürecindedir.")
        setError("")
        setAmount("")
        setBankAccount("")
        setAddress("")
        setSelectedMethod(null)
      } else {
        setError(response.error || "Çekim başarısız")
        setSuccess("")
      }
    } catch (err) {
      console.log("[v0] Catch block error:", err)
      setError("Bir hata oluştu, lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-white text-sm block mb-2">* Tutar</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white pl-8 pr-4 py-3"
          />
        </div>
        {selected && (
          <p className="text-gray-500 text-xs mt-1">Min: {selected.min} / Maks: {selected.max}</p>
        )}
      </div>

      {selected?.type === "bank" && (
        <>
          <div>
            <label className="text-white text-sm block mb-2">* IBAN Numarası</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value.toUpperCase())}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white px-4 py-3 font-mono tracking-wider"
            />
          </div>
          {(selected?.id === 'meeldev' || selected?.id === 'galaxypay-bank') && (
            <>
              <div>
                <label className="text-white text-sm block mb-2">* Hesap Sahibi</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white px-4 py-3"
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">* Banka Adı</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Örn: Türkiye İş Bankası A.Ş."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white px-4 py-3"
                />
              </div>
            </>
          )}
        </>
      )}

      {selected?.id === 'galaxypay-papara' && (
        <>
          <div>
            <label className="text-white text-sm block mb-2">* Papara Numarası</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Papara hesap numaranız"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white px-4 py-3"
            />
          </div>
          <div>
            <label className="text-white text-sm block mb-2">Hesap Sahibi (Opsiyonel)</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white px-4 py-3"
            />
          </div>
        </>
      )}

      {selected?.type === "ewallet" && (
        <div>
          <label className="text-white text-sm block mb-2">* Hesap No / Kullanıc�� Adı</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder={selected.id === "papara" ? "Papara numaranız" : "Hesap numaranız"}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white px-4 py-3"
          />
        </div>
      )}

      {selected?.type === "crypto" && (
        <div>
          <label className="text-white text-sm block mb-2">* Cüzdan Adresi</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Cüzdan adresinizi girin"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white px-4 py-3 font-mono"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        onClick={handleWithdraw}
        disabled={isSubmitting || hasPendingWithdraw}
        className="w-full py-4 bg-[#00d4b4] text-black font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : hasPendingWithdraw ? <><AlertCircle className="w-5 h-5" />BEKLEYEN TALEP VAR</> : <><Lock className="w-5 h-5" />CEKİM YAP</>}
      </button>
    </div>
  )

  // Mobil: yontem secilince detay ekrani
  if (isMobileView && selected && isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />
        <div className="flex border-b border-zinc-800">
          <Link href="/deposit" className="flex-1 py-4 font-medium text-center text-gray-400">Para Yatır</Link>
          <button className="flex-1 py-4 font-medium text-center text-[#00d4b4] border-b-2 border-[#00d4b4]">Para Çekme</button>
        </div>

        <main className="flex-1 p-4">
          {/* Maintenance Mode Banner */}
          {MAINTENANCE_MODE && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-3 py-2 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-xs">{MAINTENANCE_MESSAGE}</p>
            </div>
          )}

          {/* Pending Withdraw Warning - Mobile */}
          {hasPendingWithdraw && !isCheckingPending && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-3 py-2 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-300 text-xs font-medium">Bekleyen Çekim Talebi</p>
              </div>
              <p className="text-yellow-200/80 text-xs pl-6">
                {pendingWithdrawAmount.toLocaleString('tr-TR')} ₺ tutarında bekleyen talebiniz var.
              </p>
            </div>
          )}

          <button
            onClick={() => { setIsMobileView(false); setSelectedMethod(null) }}
            className="flex items-center text-gray-400 mb-4 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" /><span>GERİ DÖN</span>
          </button>

          {/* Secilen yontem karti */}
          <div
            className="flex items-center gap-4 rounded-xl p-4 mb-5"
            style={{ background: "linear-gradient(165deg, rgba(255,206,0,0.4) 5%, rgba(20,20,20,0.95) 60%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)" }}
          >
            {selected.icon ? (
              <img src={selected.icon} alt={selected.name} className="h-12 w-auto object-contain flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-500 font-bold text-sm">{selected.logo}</span>
              </div>
            )}
            <div>
              <h3 className="text-white font-bold text-lg">{selected.name}</h3>
              <p className="text-[#00d4b4] text-sm italic">{selected.desc}</p>
              <p className="text-gray-400 text-xs">Min: {selected.min} / Maks: {selected.max}</p>
            </div>
          </div>

          {renderForm()}
        </main>

        <Footer />
        <BottomNavigation />
        {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="lg:hidden">
        <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />
      </div>
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setShowLogin(true)} />
      </div>

      <div className="flex border-b border-zinc-800">
        <Link href="/deposit" className="flex-1 py-4 font-medium text-center text-gray-400 hover:text-white">Para Yatır</Link>
        <button className="flex-1 py-4 font-medium text-center text-[#00d4b4] border-b-2 border-[#00d4b4]">Para Çekme</button>
      </div>

      <main className="flex-1 w-full overflow-y-auto">
        {/* Maintenance Mode Banner */}
        {MAINTENANCE_MODE && (
          <div className="bg-red-900/30 border-b border-red-700 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{MAINTENANCE_MESSAGE}</p>
          </div>
        )}

        {/* Pending Withdraw Warning */}
        {hasPendingWithdraw && !isCheckingPending && (
          <div className="bg-yellow-900/30 border-b border-yellow-700 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 text-sm font-medium">Bekleyen Çekim Talebi</p>
              <p className="text-yellow-200/80 text-xs">
                {pendingWithdrawAmount.toLocaleString('tr-TR')} ₺ tutarında bekleyen bir çekim talebiniz bulunmaktadır. 
                Yeni talep oluşturmadan önce mevcut talebin sonuçlanmasını bekleyiniz.
              </p>
            </div>
          </div>
        )}

        <div className="px-4 py-6 lg:px-8">
          <div className="flex gap-6">
            {/* Sol panel - yontemler */}
            <div className={`transition-all duration-200 ${selected ? "w-1/2 min-w-0" : "w-full"}`}>
              <h2 className="text-white font-bold mb-1 text-xs">TÜM YÖNTEMLER</h2>
              <p className="text-gray-400 mb-4 text-xs">İstediğiniz yöntemi seçerek çekim talebinizi oluşturun.</p>

              <div className="grid gap-3 grid-cols-4">
                {ALL_WITHDRAW_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id)}
                    className={`flex flex-col text-left rounded-xl p-3 transition-all hover:brightness-110 ${selectedMethod === method.id ? "outline outline-1 outline-yellow-500" : ""}`}
                    style={{
                      background: "linear-gradient(140deg, rgb(85 85 85) 5%, rgb(37 37 37) 40%, rgb(0,0,0) 60%)",
                      boxShadow: "rgba(255,255,255,0.2) 0px 0px 0px 1px inset",
                    }}
                  >
                    <div className="w-full flex items-center justify-start mb-2" style={{ height: "36px" }}>
                      {method.icon ? (
                        <img src={method.icon} alt={method.name} className="h-full w-auto object-contain" />
                      ) : (
                        <span className="text-[#00d4b4] font-extrabold text-xs">{method.logo}</span>
                      )}
                    </div>
                    <div className="text-white font-bold text-xs leading-tight mb-1">{method.name}</div>
                    <div className="text-gray-400 text-xs">Min: {method.min}</div>
                    <div className="text-gray-400 text-xs">Maks: {method.max}</div>
                    <div className="italic mt-1 text-xs" style={{ color: "#00d4b4" }}>Anında çekim</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sag panel - form (sadece desktop + secim yapilinca) */}
            {selected && (
              <div className="hidden lg:flex flex-col border-l border-zinc-800 pl-6 w-1/2 shrink-0">
                {/* Yontem basligi */}
                <div
                  className="flex items-center gap-4 rounded-xl p-4 mb-4"
                  style={{ background: "linear-gradient(165deg, rgba(255,206,0,0.4) 5%, rgba(20,20,20,0.95) 60%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)" }}
                >
                  {selected.icon ? (
                    <img src={selected.icon} alt={selected.name} className="h-14 w-auto object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500 font-bold text-sm">{selected.logo}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-xl">{selected.name}</h3>
                    <p className="text-[#00d4b4] text-sm italic">{selected.desc}</p>
                    <p className="text-gray-300 text-sm">Min: {selected.min} / Maks: {selected.max}</p>
                  </div>
                </div>

                {/* Bilgi notu */}
                <div className="flex items-start gap-3 bg-zinc-800/60 rounded-xl p-4 mb-4">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-gray-400 text-sm">
                    Günlük limitsiz adet ve miktarda çekim talebinde bulunabilirsiniz. Talepler incelendikten sonra onaylanır.
                  </p>
                </div>

                {renderForm()}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="hidden lg:block"><Footer /></div>
      <div className="lg:hidden"><Footer /><BottomNavigation /></div>
      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
