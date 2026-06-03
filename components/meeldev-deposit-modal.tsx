"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Copy, Check, RefreshCw, Loader2, Link, CreditCard } from "lucide-react"
import { meeldevService, type MeelDevDepositResponse } from "@/lib/services/meeldev-service"

type Step = 'select' | 'loading' | 'account' | 'success'
type PaymentType = 'link' | 'iban'

interface AccountInfo {
  bankName: string
  accountHolder: string
  iban: string
  minAmount: number
  maxAmount: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Bekleniyor',  color: 'text-yellow-400' },
  processing: { label: 'İşleniyor',  color: 'text-blue-400'   },
  approved:   { label: 'Onaylandı',  color: 'text-green-400'  },
  rejected:   { label: 'Reddedildi', color: 'text-red-400'    },
}

export function MeelDevDepositModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [step, setStep] = useState<Step>('select')
  const [paymentType, setPaymentType] = useState<PaymentType>('link')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('select')
        setAmount('')
        setError('')
        setTransactionId(null)
        setAccountInfo(null)
        setStatus(null)
        setCopiedField(null)
      }, 300)
    }
  }, [open])

  // Status polling - 5 saniyede bir
  const pollStatus = useCallback(async (txId: string) => {
    const res = await meeldevService.getStatus(txId)
    if (res.success && res.status) {
      setStatus(res.status)
      if (res.status === 'approved' || res.status === 'rejected') {
        return false // polling dur
      }
    }
    return true // polling devam et
  }, [])

  useEffect(() => {
    if (!transactionId) return
    let active = true
    const interval = setInterval(async () => {
      if (!active) return
      const shouldContinue = await pollStatus(transactionId)
      if (!shouldContinue) clearInterval(interval)
    }, 5000)
    pollStatus(transactionId)
    return () => { active = false; clearInterval(interval) }
  }, [transactionId, pollStatus])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  const MIN_AMOUNT = 1000

  const handleDeposit = async () => {
    const parsed = parseFloat(amount.replace(',', '.'))
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Geçerli bir tutar girin')
      return
    }
    if (parsed < MIN_AMOUNT) {
      setError(`Minimum yatırım tutarı ₺${MIN_AMOUNT.toLocaleString('tr-TR')} olmalıdır.`)
      return
    }
    setError('')
    setIsLoading(true)
    setStep('loading')

    const directAccount: 0 | 1 = paymentType === 'iban' ? 1 : 0
    const res: MeelDevDepositResponse = await meeldevService.createDeposit(parsed, directAccount)
    setIsLoading(false)

    if (!res.success) {
      setError(res.error || 'Bir hata oluştu')
      setStep('select')
      return
    }

    // paymentUrl varsa yönlendir
    if (res.paymentUrl) {
      window.location.href = res.paymentUrl
      return
    }

    // account bilgisi varsa göster
    const acc = res.account || res.accountInfo
    if (acc) {
      setAccountInfo(acc)
      if (res.transactionId) setTransactionId(res.transactionId)
      setStep('account')
      return
    }

    // transactionId varsa success
    if (res.transactionId) {
      setTransactionId(res.transactionId)
      setStep('success')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #1a2530 0%, #0d1520 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/images/meeldev.svg" alt="MeelDev" className="h-7 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Banka Transfer</h2>
              <p className="text-[#00d4b4] text-xs">Havale / EFT ile hızlı yatırım</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {/* Step: Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-[#00d4b4] animate-spin" />
              <p className="text-gray-300 text-sm">İşleminiz hazırlanıyor...</p>
            </div>
          )}

          {/* Step: Select */}
          {step === 'select' && (
            <>
              {/* Tutar */}
              <div className="mb-4">
                <label className="text-gray-300 text-xs font-semibold mb-1.5 block">Yatırım Tutarı (₺)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError('') }}
                  placeholder="Min: 1.000 ₺"
                  min={MIN_AMOUNT}
                  className="w-full rounded-xl px-4 py-3 text-white text-base font-semibold outline-none border border-white/10 focus:border-[#00d4b4] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </div>

              {/* Ödeme tipi */}
              <div className="mb-5">
                <label className="text-gray-300 text-xs font-semibold mb-1.5 block">Ödeme Yöntemi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentType('link')}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all border ${
                      paymentType === 'link'
                        ? 'border-[#00d4b4] text-[#00d4b4] bg-[#00d4b4]/10'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Link className="w-4 h-4 flex-shrink-0" />
                    Link ile Devam Et
                  </button>
                  <button
                    onClick={() => setPaymentType('iban')}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all border ${
                      paymentType === 'iban'
                        ? 'border-[#00d4b4] text-[#00d4b4] bg-[#00d4b4]/10'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    IBAN Bilgisi Göster
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 bg-red-900/30 border border-red-700 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleDeposit}
                disabled={isLoading}
                className="w-full rounded-xl py-3.5 font-bold text-sm text-black transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg, #00d4b4, #00b89c)' }}
              >
                Para Yatır
              </button>
            </>
          )}

          {/* Step: Account - IBAN bilgileri */}
          {step === 'account' && accountInfo && (
            <>
              <div className="mb-4 rounded-xl p-4 border border-[#00d4b4]/30 bg-[#00d4b4]/5">
                <p className="text-[#00d4b4] text-xs font-semibold mb-3">Banka Bilgileri</p>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Banka</p>
                    <p className="text-white font-semibold text-sm">{accountInfo.bankName}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Hesap Sahibi</p>
                      <p className="text-white font-semibold text-sm">{accountInfo.accountHolder}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(accountInfo.accountHolder, 'holder')}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 transition-all"
                    >
                      {copiedField === 'holder' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'holder' ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">IBAN</p>
                      <p className="text-white font-semibold text-sm font-mono">{accountInfo.iban}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(accountInfo.iban, 'iban')}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 transition-all"
                    >
                      {copiedField === 'iban' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'iban' ? 'Kopyalandı' : 'IBAN Kopyala'}
                    </button>
                  </div>
                  <div className="flex gap-4 pt-1">
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Min. Tutar</p>
                      <p className="text-white font-semibold text-sm">₺{accountInfo.minAmount?.toLocaleString('tr-TR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Maks. Tutar</p>
                      <p className="text-white font-semibold text-sm">₺{accountInfo.maxAmount?.toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              {transactionId && status && (
                <div className="mb-4 rounded-xl px-4 py-3 bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">İşlem Durumu</p>
                    <p className={`font-bold text-sm ${STATUS_LABELS[status]?.color ?? 'text-gray-300'}`}>
                      {STATUS_LABELS[status]?.label ?? status}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Takip ediliyor
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setStep('select'); setAccountInfo(null); setStatus(null) }}
                  className="flex-1 rounded-xl py-3 font-semibold text-sm text-gray-300 border border-white/10 hover:border-white/20 transition-all"
                >
                  Geri
                </button>
                {transactionId && (
                  <button
                    onClick={() => pollStatus(transactionId)}
                    className="flex-1 rounded-xl py-3 font-semibold text-sm text-[#00d4b4] border border-[#00d4b4]/40 hover:bg-[#00d4b4]/10 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Durumu Kontrol Et
                  </button>
                )}
              </div>
            </>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <Check className="w-7 h-7 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-base mb-1">Yatırım Talebi Alındı</p>
                <p className="text-gray-400 text-sm">İşleminiz başarıyla oluşturuldu.</p>
                {transactionId && (
                  <p className="text-gray-500 text-xs mt-1">İşlem No: {transactionId}</p>
                )}
              </div>
              {transactionId && status && (
                <div className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-center w-full">
                  <p className="text-gray-400 text-xs mb-1">Durum</p>
                  <p className={`font-bold text-sm ${STATUS_LABELS[status]?.color ?? 'text-gray-300'}`}>
                    {STATUS_LABELS[status]?.label ?? status}
                  </p>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full rounded-xl py-3 font-bold text-sm text-black"
                style={{ background: 'linear-gradient(90deg, #00d4b4, #00b89c)' }}
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
