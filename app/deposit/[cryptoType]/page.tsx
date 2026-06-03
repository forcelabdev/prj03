'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { tokenManager } from '@/lib/token-manager'

const CRYPTO_DETAILS: Record<string, { name: string; symbol: string; address?: string }> = {
  ethereum: { name: 'Ethereum', symbol: 'ETH', address: '0x...' },
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', address: 'bc1q...' },
  tron: { name: 'TRON', symbol: 'TRX', address: 'T...' },
  'usdt-trc20': { name: 'USDT (TRC20)', symbol: 'USDT', address: 'T...' },
  'tether-erc20': { name: 'USDT (ERC20)', symbol: 'USDT', address: '0x...' },
}

export default function CryptoDepositPage({ params }: { params: { cryptoType: string } }) {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')

  const token = searchParams.get('token')
  const username = searchParams.get('username')
  const cryptoType = params.cryptoType
  const cryptoInfo = CRYPTO_DETAILS[cryptoType]

  useEffect(() => {
    const validatePayment = async () => {
      try {
        setLoading(true)
        
        // Token ve username validasyonu
        if (!token || !username) {
          setError('Geçersiz ödeme parametreleri')
          setPaymentStatus('failed')
          return
        }

        // Token'ı local'e kaydet (varsa)
        if (token) {
          const tokenManager = new TokenManager()
          tokenManager.setToken(token)
        }

        // Backend'e ödeme tamamlandığını bildir
        const response = await fetch('/api/deposit/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            username,
            cryptoType,
            amount: searchParams.get('amount'),
            txHash: searchParams.get('txHash'),
          }),
        })

        if (response.ok) {
          setPaymentStatus('success')
        } else {
          setError('Ödeme doğrulaması başarısız')
          setPaymentStatus('failed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
        setPaymentStatus('failed')
      } finally {
        setLoading(false)
      }
    }

    validatePayment()
  }, [token, username, cryptoType])

  if (!cryptoInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Geçersiz Kripto Türü</h1>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Ödeme doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı</h1>
          <p className="text-gray-400 mb-6">{cryptoInfo.name} ile ödeme tamamlandı</p>
          <a href="/deposit" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/80">
            Geri Dön
          </a>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarısız</h1>
          <p className="text-gray-400 mb-2">{error || 'Bir hata oluştu'}</p>
          <a href="/deposit" className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/80">
            Tekrar Deneyin
          </a>
        </div>
      </div>
    )
  }

  return null
}
