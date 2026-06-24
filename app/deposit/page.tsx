"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SidebarMenu } from "@/components/sidebar-menu"
import { LoginModal } from "@/components/login-modal"
import { DesktopHeader } from "@/components/desktop-header"
import { ChevronLeft, Lock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { UnauthorizedPage } from "@/components/unauthorized-page"
import { tokenManager } from "@/lib/token-manager"
import { paymentService, type DepositMethod } from "@/lib/services/payment-service"
import { meeldevService } from "@/lib/services/meeldev-service"
import { galaxypayService, type GalaxyPayBankInfo } from "@/lib/services/galaxypay-service"
import { DepositConfirmModal } from "@/components/deposit-confirm-modal"

export default function DepositPage() {
  const { user } = useAuth()
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [depositMethods, setDepositMethods] = useState<DepositMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  // GalaxyPay deposit sub-method: sadece bank-transfer aktif
  const [galaxypayMethod] = useState<'bank-transfer'>('bank-transfer')
  const [galaxypayBankInfo, setGalaxypayBankInfo] = useState<GalaxyPayBankInfo | null>(null)
  const [meeldevIframeUrl, setMeeldevIframeUrl] = useState<string | null>(null)

  const selected = selectedMethod ? depositMethods.find(m => m.id === selectedMethod) : null
  const needsAmountInput = selected?.id === 'mpay-havale' || selected?.id === 'jetbak-transfer' || selected?.id === 'meeldev' || selected?.id === 'galaxypay'
  const isCrypto = selected?.type === 'crypto'
  const [copied, setCopied] = useState(false)

  const cryptoWallets: Record<string, { address: string; network: string; minDeposit: string }> = {
    'btc':        { address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', network: 'Bitcoin (BTC)',     minDeposit: '₺1.000' },
    'eth':        { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',  network: 'Ethereum (ERC20)', minDeposit: '₺1.000' },
    'trx':        { address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',          network: 'Tron (TRC20)',     minDeposit: '₺1.000' },
    'usdt-trc20': { address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',          network: 'USDT (TRC20)',     minDeposit: '₺1.000' },
    'usdt-erc20': { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',  network: 'USDT (ERC20)',     minDeposit: '₺1.000' },
  }
  const cryptoInfo = selected ? cryptoWallets[selected.id] : null

  const copyToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }).catch(() => fallbackCopy(text))
      } else {
        fallbackCopy(text)
      }
    } catch {
      fallbackCopy(text)
    }
  }

  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    try { document.execCommand('copy') } catch { }
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopy = (text: string) => copyToClipboard(text)

  useEffect(() => {
    const fetchMethods = async () => {
      setIsLoading(true)
      try {
        const response = await paymentService.getDepositMethods()
        if (response.success && response.methods) {
          // Kripto ve havale yöntemleri için icon URL'leri ekle
          const iconsMap: Record<string, string> = {
            'btc': '/logos/bitcoin.svg',
            'bitcoin': '/logos/bitcoin.svg',
            'eth': '/logos/ethereum.svg',
            'ethereum': '/logos/ethereum.svg',
            'trx': '/logos/tron.svg',
            'tron': '/logos/tron.svg',
            'usdt': '/logos/usdt-trc20.svg',
            'usdt-trc20': '/logos/usdt-trc20.svg',
            'usdt-erc20': '/images/kriptobpusdterc20-new.svg',
            'super-havale': '/logos/super-havale.svg',
            'superhavale': '/logos/super-havale.svg',
            'maxi-havale': '/logos/maxi-havale.svg',
            'maxihavale': '/logos/maxi-havale.svg',
            'mpay-havale': '/images/mpay-havale-new.svg',
            'mpayhavale': '/images/mpay-havale-new.svg',
            'mpay-fast-havale': '/logos/mpay-fast.svg',
            'mpay-fast': '/logos/mpay-fast.svg',
            'hizli-havale': '/logos/hizli-havale.svg',
            'hizlihavale': '/logos/hizli-havale.svg',
            'yeni-havale': '/logos/yeni-havale.svg',
            'yenihavale': '/logos/yeni-havale.svg',
            'oto-havale': '/logos/oto.svg',
            'otohavale': '/logos/oto.svg',
            'hemen-havale': '/logos/hemen.png',
            'hemenhavale': '/logos/hemen.png',
            'hemen': '/logos/hemen.png',
            'fast-havale': '/images/fast-havale-new.svg',
            'fasthavale': '/images/fast-havale-new.svg',
            'rapid-havale': '/logos/rapid-havale.webp',
            'rapid': '/logos/rapid-havale.webp',
            'vip-fast': '/logos/vip-fast.webp',
            'vipfast': '/logos/vip-fast.webp',
            'trust-para': '/logos/trust-para.webp',
            'trustpara': '/logos/trust-para.webp',
            'jetbak-transfer': '/logos/jetbak.svg',
            'jetbaktransfer': '/logos/jetbak.svg',
            'hizli-odeme-havale': '/logos/hizli-havale.svg',
            'hemen-ode-1': '/logos/hemen.png',
            'hemen-ode-biz': '/logos/hemen.png',
            'paymentnew': '/logos/vip-fast.webp',
            'glblpay': '/logos/rapid-havale.webp',
            'meeldev': '/images/meeldev.svg',
          }
          
          // MeelDev için Capora Havale logosunu kullan
          iconsMap['meeldev'] = '/images/capora-havale.png';
          // GalaxyPay logo
          iconsMap['galaxypay'] = '/images/galaxypay.png';

          // Gizlenecek yöntemler - ID ve name'e göre check et
          const excludeIds = ['papara', 'payfix', 'jetbank-transfer', 'banka-havalesi', 'mpay-fast-havale', 'mpay-fast', 'trust-para', 'trustpara', 'bank-transfer', 'banka']
          const excludeNames = ['papara', 'payfix', 'jetbank', 'trust para', 'trustpara']
          // Whitelist - bu id'ler exclude edilmez
          const whitelistIds = ['meeldev', 'galaxypay']
          
          // Filtre ve icon ekleme
          const filtered = response.methods
            .filter(method => {
              const id = method.id?.toLowerCase() || ''
              if (whitelistIds.includes(id)) return true
              const idMatch = excludeIds.includes(id)
              const nameMatch = excludeNames.some(name => 
                method.name?.toLowerCase().includes(name.toLowerCase())
              )
              return !idMatch && !nameMatch
            })
            .map(method => {
              // Icon URL'sini ekle
              const iconKey = (method.id || method.name || '').toLowerCase().replace(/\s+/g, '-')
              const icon = iconsMap[iconKey]
              
              // Sadece bu yöntemi favori olarak işaretle
              const favoriteIds = ['usdt-trc20', 'btc', 'eth', 'trx', 'usdt-erc20', 'galaxypay', 'meeldev', 'super-havale', 'mpay-havale', 'hizli-odeme-havale', 'maxi-havale']
              const isFavorite = favoriteIds.includes(method.id)
              
              // Kripto ve Capora Havale için min/max değerlerini override et
              const methodIdLower = (method.id || '').toLowerCase()
              const methodNameLower = (method.name || '').toLowerCase()
              const isCryptoMethod = 
                methodIdLower.includes('btc') || 
                methodIdLower.includes('bitcoin') ||
                methodIdLower.includes('eth') || 
                methodIdLower.includes('ethereum') ||
                methodIdLower.includes('trx') || 
                methodIdLower.includes('tron') ||
                methodIdLower.includes('usdt') ||
                methodIdLower.includes('tether') ||
                methodIdLower.includes('erc20') ||
                methodIdLower.includes('trc20') ||
                methodNameLower.includes('bitcoin') ||
                methodNameLower.includes('ethereum') ||
                methodNameLower.includes('tron') ||
                methodNameLower.includes('tether') ||
                methodNameLower.includes('usdt')
              const minOverride = isCryptoMethod ? '₺1.000,00' : method.id === 'meeldev' ? '₺1.000,00' : method.min
              const maxOverride = isCryptoMethod ? '₺100.000,00' : method.max

              return {
                ...method,
                min: minOverride,
                max: maxOverride,
                icon: icon || undefined,
                favorite: isFavorite
              }
            })
            .sort((a, b) => {
              // Sıralama sırası tanımı
              const orderMap: Record<string, number> = {
                // Kripto yöntemleri
                'usdt-trc20': 0,
                'btc': 1,
                'eth': 2,
                'trx': 3,
                'usdt-erc20': 4,
                // GalaxyPay - kripto sonrasi, meeldev oncesi
                'galaxypay': 5,
                // Capora Havale - galaxypay sonrasi
                'meeldev': 6,
                // Transfer yöntemleri
                'super-havale': 6,
                'maxi-havale': 7,
                'mpay-havale': 8,
                'mpay-fast': 9,
                'hizli-odeme-havale': 10,
                'yeni-havale': 11,
                'fast-havale': 12,
                'hemen-ode-1': 13,
                'hemen-ode-biz': 14,
                'jetbak-transfer': 15,
                'paymentnew': 16,
                'glblpay': 17,
                'oto-havale': 18,
              }
              const aOrder = orderMap[a.id] ?? 999
              const bOrder = orderMap[b.id] ?? 999
              return aOrder - bOrder
            })
          
          setDepositMethods(filtered)
        }
      } catch (error) {
        console.error("[v0] Error fetching deposit methods:", error)
        setDepositMethods([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchMethods()
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const handleSelectMethod = (id: string) => {
    setSelectedMethod(id)
    setDepositAmount("")
    if (window.innerWidth < 1024) setIsMobileView(true)
  }

  const handleDeposit = () => {
    if (!selected || !user) return
    if (isCrypto) {
      const token = tokenManager.getToken() || ''
      const username = user?.username || ''
      
      // Doğru cryptoType değerleri ve subdomain mapping'i
      // Backend'den gelen short form ID'ler: btc, eth, trx, usdt-trc20, usdt-erc20
      const cryptoSubdomainMap: Record<string, string> = {
        'btc': 'bitcoin',
        'eth': 'ethereum',
        'trx': 'tron',
        'usdt-trc20': 'www',
        'usdt-erc20': 'usdt-erc20',
      }
      const cryptoSubdomain = cryptoSubdomainMap[selected.id] || selected.id
      
      // returnUrl her kripto türü için aynı - cryptoType parametresinde tip belirtiliyor
      const returnUrl = `${window.location.origin}/deposit`
      
      // cryptoType parametresi için backend short form'u full form'a çevir
      const cryptoTypeMap: Record<string, string> = {
        'btc': 'bitcoin',
        'eth': 'ethereum',
        'trx': 'tron',
        'usdt-trc20': 'usdt-trc20',
        'usdt-erc20': 'usdt-erc20',
      }
      const cryptoType = cryptoTypeMap[selected.id] || selected.id
      
      // cryptobp.co'nun kripto-özel subdomain'ine yönlendir
      const url = new URL(`https://${cryptoSubdomain}.cryptobp.co/odeme`)
      url.searchParams.set('token', token)
      url.searchParams.set('username', username)
      url.searchParams.set('cryptoType', cryptoType)
      url.searchParams.set('returnUrl', returnUrl)
      
      window.location.href = url.toString()
      return
    }
    // GalaxyPay için min tutar kontrolü
    if (selected.id === 'galaxypay' && needsAmountInput) {
      const parsed = parseFloat(depositAmount)
      if (!depositAmount || isNaN(parsed) || parsed < 100) {
        alert('GalaxyPay için minimum yatırım tutarı ₺100 olmalıdır.')
        return
      }
    }
    // Capora Havale için min tutar kontrolü
    if (selected.id === 'meeldev' && needsAmountInput) {
      const parsed = parseFloat(depositAmount)
      if (!depositAmount || isNaN(parsed) || parsed < 1000) {
        alert('Capora Havale için minimum yatırım tutarı ₺1.000 olmalıdır.')
        return
      }
    }
    setShowConfirmModal(true)
  }

  const handleConfirmDeposit = async () => {
    if (!selected) return
    if (!user) {
      alert('Bu işlemi yapabilmek için giriş yapmanız gerekmektedir.')
      setShowConfirmModal(false)
      return
    }
    setShowConfirmModal(false)
    const amount = needsAmountInput ? parseFloat(depositAmount) : 0
    if (needsAmountInput && (!amount || amount <= 0)) {
      alert('Lütfen geçerli bir tutar girin.')
      return
    }
    if (selected.id === 'galaxypay' && needsAmountInput && amount < 100) {
      alert('GalaxyPay için minimum yatırım tutarı ₺100 olmalıdır.')
      return
    }
    if (selected.id === 'meeldev' && needsAmountInput && amount < 1000) {
      alert('Capora Havale için minimum yatırım tutarı ₺1.000 olmalıdır.')
      return
    }

    setIsProcessing(true)
    try {
      const returnUrl = `${window.location.origin}/deposit`

      // GalaxyPay Banka Transferi - backend { amount, method: "bank-transfer" } bekliyor
      if (selected.id === 'galaxypay') {
        try {
          const gpRes = await galaxypayService.createDeposit(amount, 'bank-transfer')
          if (gpRes.success && gpRes.paymentUrl) {
            window.location.href = gpRes.paymentUrl
          } else if (gpRes.success) {
            setGalaxypayBankInfo(gpRes.bankInfo || gpRes.data || null)
          } else {
            alert('HATA: ' + (gpRes.error || gpRes.message || 'GalaxyPay yatırım başlatılamadı'))
          }
        } catch (e: any) {
          alert('GalaxyPay işlemi başlatılırken hata oluştu: ' + (e?.message || e))
        }
        setIsProcessing(false)
        return
      }

      // jetbak-transfer için özel format
      if (selected.id === 'jetbak-transfer') {
        const token = tokenManager.getToken() || ''
        const finalUrl = `https://www.luqapays.com?token=${encodeURIComponent(token)}&amount=${amount}&returnUrl=${encodeURIComponent(returnUrl)}`
        window.location.href = finalUrl
        return
      }

      // MeelDev - link ile yönlendirme (directAccount: 0)
      if (selected.id === 'meeldev') {
        const customerName = (user as any)?.username || user?.name || ''
        const res = await meeldevService.createDeposit(amount, 0, customerName)
        // Backend çeşitli field adlarıyla URL dönebilir
        const redirectUrl = res.paymentUrl
          || (res as any).link
          || (res as any).payment_url
          || (res as any).redirect_url
          || (res as any).url
          || (res as any).checkout_url
        if (res.success && redirectUrl) {
          setMeeldevIframeUrl(redirectUrl)
        } else if (!res.success) {
          alert('HATA: ' + (res.error || res.message || 'Capora Havale başlatılamadı'))
        } else {
          // success true ama URL yok — IBAN akışı dönmüş olabilir
          alert(res.message || 'Ödeme talebi oluşturuldu. İşlem geçmişinizden takip edebilirsiniz.')
        }
        setIsProcessing(false)
        return
      }
      
      // Diğer havaleler için backend çağrısı
      const response = await paymentService.createDeposit({
        methodId: selected.id,
        amount: amount,
        currency: "TRY",
        userId: user?.identifier || (user as any)?._id || user?.id,
        username: (user as any)?.username || user?.name || user?.email || ""
      })
      if (response.success) {
        if (response.paymentUrl) {
          // Backend URL'sini düzelt: luqapasy.com -> www.luqapays.com
          let finalUrl = response.paymentUrl
          finalUrl = finalUrl.replace(/luqapasy\.com/g, 'www.luqapays.com')

          // apiBase parametresi ekle
          const url = new URL(finalUrl)
          if (!url.searchParams.has('apiBase')) {
            url.searchParams.set('apiBase', 'https://apievrymatrix5d84k321.com')
          }

          window.location.href = url.toString()
        } else {
          alert(response.error || 'Ödeme sayfası alınamadı. Lütfen tekrar deneyin.')
        }
      } else {
        alert(response.error || 'Para yatırma işlemi başlatılamadı. Lütfen tekrar deneyin.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Giriş yapılmamışsa yetkisiz sayfa göster
  if (!user) {
    return (
      <>
        <UnauthorizedPage onLoginClick={() => setShowLogin(true)} />
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    )
  }

  // Mobile detail view
  if (isMobileView && selected && isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} />
        <div className="flex border-b border-zinc-800">
          <button className="flex-1 py-4 font-medium text-center text-[#00d4b4] border-b-2 border-[#00d4b4]">{"Para Yat\u0131r"}</button>
          <Link href="/withdraw" className="flex-1 py-4 font-medium text-center text-gray-400">{"Para \u00c7ekme"}</Link>
        </div>
        <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
          <button onClick={() => { setIsMobileView(false); setSelectedMethod(null) }} className="flex items-center text-gray-400 mb-4 hover:text-white">
            <ChevronLeft className="w-5 h-5" /><span>GERİ DÖN</span>
          </button>
          <div
            className="flex flex-row mb-4"
            style={{ height: "95px", borderRadius: "7px", padding: "12px", background: "linear-gradient(165deg, rgba(255,206,0,0.5) 5%, rgba(20,20,20,0.9) 60%)", boxShadow: "inset 0px 0px 0px 1px rgba(255, 255, 255, 0.2)" }}
          >
            <div className="flex items-center gap-3 flex-1">
              {selected.icon ? (
                <img src={selected.icon} alt={selected.name} className="h-14 w-auto object-contain flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-500 font-bold text-xs">{selected.logo}</span>
                </div>
              )}
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">{selected.icon ? "Havale" : selected.name}</h3>
                <p className="text-[#00d4b4] text-sm italic">{selected.desc}</p>
                <p className="text-gray-300 text-xs mt-0.5">Min: {selected.min} / Maks: {selected.max}</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-zinc-800/60 rounded-lg p-4 mb-6">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-white text-sm font-semibold mb-1">Önemli Bildirim</p>
              <p className="text-gray-400 text-sm">{(selected as any).description || "Havale yöntemi ile 7/24 kolay ve hızlı para yatırabilirsiniz."}</p>
            </div>
          </div>
          
          {/* GalaxyPay - Banka Transferi (sabit method) */}
          {selected?.id === 'galaxypay' && (
            <div className="mb-5">
              <div className="flex items-center gap-2 rounded-lg border border-[#00d4b4] bg-[#00d4b4]/10 px-4 py-2.5">
                <svg className="w-4 h-4 text-[#00d4b4] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 10h18M5 14h3m4 0h3m-6 4h6" /></svg>
                <span className="text-[#00d4b4] text-sm font-medium">Banka Havalesi</span>
              </div>
            </div>
          )}

          {/* GalaxyPay - Havale yapılacak hesap bilgileri */}
          {selected?.id === 'galaxypay' && galaxypayBankInfo && (
            <div className="mb-6 rounded-xl border border-[#00d4b4]/40 bg-[#00d4b4]/5 overflow-hidden">
              <div className="bg-[#00d4b4]/20 px-4 py-2.5 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00d4b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[#00d4b4] text-sm font-semibold">Havale Bilgileri</span>
              </div>
              <div className="p-4 space-y-3">
                {galaxypayBankInfo.bankName && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Banka</span>
                    <span className="text-white text-sm font-medium">{galaxypayBankInfo.bankName}</span>
                  </div>
                )}
                {galaxypayBankInfo.accountHolder && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Hesap Sahibi</span>
                    <span className="text-white text-sm font-medium">{galaxypayBankInfo.accountHolder}</span>
                  </div>
                )}
                {galaxypayBankInfo.iban && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-400 text-xs flex-shrink-0 mt-0.5">IBAN</span>
                    <button
                      onClick={() => copyToClipboard(galaxypayBankInfo.iban!)}
                      className="text-[#00d4b4] text-sm font-mono text-right hover:text-white transition-colors flex items-center gap-1"
                    >
                      {galaxypayBankInfo.iban}
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                )}
                {galaxypayBankInfo.reference && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 text-xs flex-shrink-0">Referans / Aç��klama</span>
                    <button
                      onClick={() => copyToClipboard(galaxypayBankInfo.reference!)}
                      className="text-yellow-400 text-sm font-mono hover:text-white transition-colors flex items-center gap-1"
                    >
                      {galaxypayBankInfo.reference}
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                )}
                {copied && <p className="text-[#00d4b4] text-xs text-center">Kopyalandı!</p>}
                <p className="text-gray-400 text-xs mt-2 pt-2 border-t border-zinc-700">Havaleyi yukarıdaki hesaba yaptıktan sonra işlem geçmişinizden takip edebilirsiniz.</p>
              </div>
            </div>
          )}

          {/* Tutar input - mpay-havale, jetbak, meeldev, galaxypay için */}
          {needsAmountInput && (
            <div className="mb-6">
              <label className="text-white text-sm mb-2 block">* Tutar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={selected?.id === 'meeldev' ? 'Min: 1.000 ₺' : selected?.id === 'galaxypay' ? 'Min: 100 ₺' : '0,00'}
                        min={selected?.id === 'meeldev' ? 1000 : selected?.id === 'galaxypay' ? 100 : 1}
                        className={`w-full bg-zinc-800 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          ((selected?.id === 'meeldev' && depositAmount && parseFloat(depositAmount) < 1000) ||
                           (selected?.id === 'galaxypay' && depositAmount && parseFloat(depositAmount) < 100))
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-zinc-700 focus:border-[#00d4b4]'
                        }`}
                      />
              </div>
              {selected?.id === 'meeldev' && depositAmount && parseFloat(depositAmount) < 1000 && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  Minimum yatırım tutarı ₺1.000,00 olmalıdır.
                </p>
              )}
              {selected?.id === 'galaxypay' && depositAmount && parseFloat(depositAmount) < 100 && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  Minimum yatırım tutarı ₺100,00 olmalıdır.
                </p>
              )}
            </div>
          )}

          {/* GalaxyPay banka transferi - ek alan gerekmez, backend profil'den alıyor */}
          
          <button onClick={handleDeposit} disabled={isProcessing} className="w-full py-4 bg-[#00d4b4] text-black font-bold rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed">
            {isProcessing ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            ) : (
              <Lock className="w-5 h-5" />
            )}
            {isProcessing ? 'İŞLENİYOR...' : `PARA YATIR ${needsAmountInput && depositAmount ? `₺${parseFloat(depositAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : ''}`}
          </button>
        </main>
        <Footer />
        <BottomNavigation />
        {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        <DepositConfirmModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmDeposit} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Capora Havale (MeelDev) iframe modal */}
      {meeldevIframeUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-lg mx-4 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ height: '85vh' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">Capora Havale</span>
                <span className="text-xs text-gray-400">— Ödeme sayfası</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={meeldevIframeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
                  title="Yeni sekmede aç"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <button
                  onClick={() => setMeeldevIframeUrl(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <iframe
              src={meeldevIframeUrl}
              className="flex-1 w-full border-0"
              allow="payment"
              title="Capora Havale Ödeme"
            />
          </div>
        </div>
      )}

      <div className="lg:hidden"><Header onMenuClick={() => setShowSidebar(true)} onLoginClick={() => setShowLogin(true)} /></div>
      <div className="hidden lg:block"><DesktopHeader onLoginClick={() => setShowLogin(true)} /></div>

      <div className="flex border-b border-zinc-800">
        <button className="flex-1 py-4 font-medium text-center text-[#00d4b4] border-b-2 border-[#00d4b4]">{"Para Yat\u0131r"}</button>
        <Link href="/withdraw" className="flex-1 py-4 font-medium text-center text-gray-400 hover:text-white">{"Para \u00c7ekme"}</Link>
      </div>

      <main className="flex-1 w-full overflow-y-auto">
        <div className={`px-4 py-6 lg:px-8 ${selected ? "" : "lg:max-w-5xl lg:mx-auto"}`}>
          <div className="flex">
            {/* Sol panel */}
            <div className={`transition-all duration-200 ${selected ? "w-1/2 min-w-0 pr-6" : "w-full"}`}>
              <h2 className="text-white font-bold mb-1 text-xs">TÜM YÖNTEMLER</h2>
              <p className="text-gray-400 mb-4 text-xs">Kaçırmak istemeyeceğiniz benzersiz ürünlerimizden oluşan inanılmaz seçkimizi keşfedin!</p>

              {isLoading ? (
                <div className="grid gap-3 grid-cols-4">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl p-3 flex flex-col gap-2"
                      style={{ minHeight: "160px", background: "linear-gradient(140deg, rgb(55 55 55) 5%, rgb(30 30 30) 40%, rgb(10 10 10) 60%)", boxShadow: "rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset", animationDelay: `${i * 40}ms` }}
                    >
                      <div className="rounded mb-1" style={{ width: "48px", height: "36px", backgroundColor: "#3a3a3a" }} />
                      <div className="rounded" style={{ width: "80%", height: "10px", backgroundColor: "#3a3a3a" }} />
                      <div className="rounded" style={{ width: "60%", height: "9px", backgroundColor: "#333" }} />
                      <div className="rounded" style={{ width: "70%", height: "9px", backgroundColor: "#333" }} />
                      <div className="mt-auto rounded-full" style={{ width: "50%", height: "14px", backgroundColor: "#2e2e2e" }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-2 grid-cols-4">
                  {depositMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method.id)}
                      className={`flex flex-col text-left rounded-lg p-2 transition-all hover:brightness-110 ${selectedMethod === method.id ? "outline outline-1 outline-yellow-500" : ""}`}
                      style={{ background: "linear-gradient(140deg, rgb(85 85 85) 5%, rgb(37 37 37) 40%, rgb(0, 0, 0) 60%)", boxShadow: "rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset" }}
                    >
                      <div className="w-full flex items-center justify-start mb-2" style={{ height: "28px" }}>
                        {method.icon ? (
                          <img src={method.icon} alt={method.name} className="h-full w-auto object-contain" />
                        ) : (
                          <span className="text-[#00d4b4] font-extrabold leading-none text-[10px]">{method.logo}</span>
                        )}
                      </div>
                      {method.favorite && (
                        <span className="inline-block self-start bg-red-600 text-white px-0.5 mb-0.5 text-[8px]" style={{ fontSize: "8px", borderRadius: "15px" }}>Favori</span>
                      )}
                      <div className="text-white font-bold leading-tight mb-2 text-[11px]">{method.type === 'bank' ? 'Havale' : method.name}</div>
                      <div className="italic mt-1 mb-2 text-[9px] whitespace-nowrap" style={{ color: "#00d4b4" }}>Anında para yatırma</div>
                      <div className="text-gray-400 leading-tight text-[8px] mb-1">Min: {method.min}</div>
                      <div className="text-gray-400 leading-tight text-[8px]">Maks: {method.max}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sağ panel — sadece seçim yapılınca görünür, sadece desktop */}
            {selected && (
              <div className="hidden lg:flex flex-col border-l border-zinc-800 pl-6 w-1/2 shrink-0">
                <div
                  className="flex flex-row mb-4 rounded-xl"
                  style={{ minHeight: "95px", padding: "16px", background: "linear-gradient(165deg, rgba(255,206,0,0.5) 5%, rgba(20,20,20,0.9) 60%)", boxShadow: "inset 0px 0px 0px 1px rgba(255, 255, 255, 0.2)" }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {selected.icon ? (
                      <img src={selected.icon} alt={selected.name} className="h-16 w-auto object-contain flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-500 font-bold text-sm">{selected.logo}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-bold text-xl leading-tight">{selected.icon ? "Havale" : selected.name}</h3>
                      <p className="text-[#00d4b4] text-sm italic">{selected.desc}</p>
                      <p className="text-gray-300 text-sm mt-0.5">Min: {selected.min} / Maks: {selected.max}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-zinc-800/60 rounded-xl p-4 mb-6">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p className="text-white text-sm font-semibold mb-1">Önemli Bildirim</p>
                    <p className="text-gray-400 text-sm">{(selected as any).description || "Havale yöntemi ile 7/24 kolay ve hızlı para yatırabilirsiniz."}</p>
                  </div>
                </div>

                {/* GalaxyPay - Banka Transferi (sabit method, desktop) */}
                {selected?.id === 'galaxypay' && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 rounded-lg border border-[#00d4b4] bg-[#00d4b4]/10 px-4 py-2.5">
                      <svg className="w-4 h-4 text-[#00d4b4] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 10h18M5 14h3m4 0h3m-6 4h6" /></svg>
                      <span className="text-[#00d4b4] text-sm font-medium">Banka Havalesi</span>
                    </div>
                  </div>
                )}

                {/* GalaxyPay - Havale yapılacak hesap bilgileri (desktop) */}
                {selected?.id === 'galaxypay' && galaxypayBankInfo && (
                  <div className="mb-6 rounded-xl border border-[#00d4b4]/40 bg-[#00d4b4]/5 overflow-hidden">
                    <div className="bg-[#00d4b4]/20 px-4 py-2.5 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#00d4b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-[#00d4b4] text-sm font-semibold">Havale Bilgileri</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {galaxypayBankInfo.bankName && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Banka</span>
                          <span className="text-white text-sm font-medium">{galaxypayBankInfo.bankName}</span>
                        </div>
                      )}
                      {galaxypayBankInfo.accountHolder && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Hesap Sahibi</span>
                          <span className="text-white text-sm font-medium">{galaxypayBankInfo.accountHolder}</span>
                        </div>
                      )}
                      {galaxypayBankInfo.iban && (
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-400 text-xs flex-shrink-0 mt-0.5">IBAN</span>
                          <button
                            onClick={() => copyToClipboard(galaxypayBankInfo.iban!)}
                            className="text-[#00d4b4] text-sm font-mono text-right hover:text-white transition-colors flex items-center gap-1"
                          >
                            {galaxypayBankInfo.iban}
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      )}
                      {galaxypayBankInfo.reference && (
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-gray-400 text-xs flex-shrink-0">Referans / Açıklama</span>
                          <button
                            onClick={() => copyToClipboard(galaxypayBankInfo.reference!)}
                            className="text-yellow-400 text-sm font-mono hover:text-white transition-colors flex items-center gap-1"
                          >
                            {galaxypayBankInfo.reference}
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      )}
                      {copied && <p className="text-[#00d4b4] text-xs text-center">Kopyalandı!</p>}
                      <p className="text-gray-400 text-xs mt-2 pt-2 border-t border-zinc-700">Havaleyi yukarıdaki hesaba yaptıktan sonra işlem geçmişinizden takip edebilirsiniz.</p>
                    </div>
                  </div>
                )}

                {/* Tutar input - mpay-havale, jetbak, meeldev, galaxypay için (desktop) */}
                {needsAmountInput && (
                  <div className="mb-6">
                    <label className="text-white text-sm mb-2 block">* Tutar</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder={selected?.id === 'meeldev' ? 'Min: 1.000 ₺' : selected?.id === 'galaxypay' ? 'Min: 100 ₺' : '0,00'}
                        min={selected?.id === 'meeldev' ? 1000 : selected?.id === 'galaxypay' ? 100 : 1}
                        className={`w-full bg-zinc-800 border rounded-xl py-4 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                          ((selected?.id === 'meeldev' && depositAmount && parseFloat(depositAmount) < 1000) ||
                           (selected?.id === 'galaxypay' && depositAmount && parseFloat(depositAmount) < 100))
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-zinc-700 focus:border-[#00d4b4]'
                        }`}
                      />
                    </div>
                    {selected?.id === 'meeldev' && depositAmount && parseFloat(depositAmount) < 1000 && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        Minimum yatırım tutarı ₺1.000,00 olmalıdır.
                      </p>
                    )}
                    {selected?.id === 'galaxypay' && depositAmount && parseFloat(depositAmount) < 100 && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        Minimum yatırım tutarı ₺100,00 olmalıdır.
                      </p>
                    )}
                  </div>
                )}

                {/* GalaxyPay bank-transfer ve papara icin ek alan gerekmez — backend profil'den aliyor */}

                <button onClick={handleDeposit} disabled={isProcessing} className="w-full py-4 bg-[#00d4b4] text-black font-bold rounded-xl flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                  {isProcessing ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  {isProcessing ? 'İŞLENİYOR...' : `PARA YATIR ${needsAmountInput && depositAmount ? `₺${parseFloat(depositAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : ''}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="hidden lg:block"><Footer /></div>
      <div className="lg:hidden"><Footer /><BottomNavigation /></div>
      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      <DepositConfirmModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmDeposit} />
    </div>
  )
}
