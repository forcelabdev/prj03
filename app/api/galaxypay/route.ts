import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apievrymatrix5d84k321.com'
const AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN || ''

// Son kelime soyad, geri kalan ad: "ahmet veli mehmet" → { firstName: "ahmet veli", lastName: "mehmet" }
function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: 'Musteri', lastName: 'User' }
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')
  return { firstName, lastName }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    const { type, method, amount, customerName, iban, accountHolder, bankId, accountNumber, branchCode, tcno } = body

    if (!token) {
      return NextResponse.json({ success: false, error: 'Giris yapmaniz gerekiyor.' }, { status: 401 })
    }

    const parsedAmount = Number(amount)
    if (!type || !method || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: `Eksik parametre: type=${type}, method=${method}, amount=${amount}` }, { status: 400 })
    }

    const commonHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    if (AGENT_TOKEN) commonHeaders['x-agent-token'] = AGENT_TOKEN

    // Ad soyad ayrıştır
    const { firstName, lastName } = splitCustomerName(customerName || '')

    let endpoint: string
    let requestBody: Record<string, unknown>

    const nameFields = customerName ? { customerName } : {}

    if (type === 'deposit') {
      endpoint = `${API_BASE}/payment/galaxypay/deposit`
      requestBody = { amount: parsedAmount, method, ...nameFields }
    } else {
      endpoint = `${API_BASE}/payment/galaxypay/withdraw`
      requestBody = { amount: parsedAmount, method, ...nameFields }
      if (iban)          requestBody.iban          = iban
      if (accountHolder) requestBody.accountHolder = accountHolder
      if (bankId)        requestBody.bankId        = bankId
      if (accountNumber) requestBody.accountNumber = accountNumber
      if (branchCode)    requestBody.branchCode    = branchCode
      if (tcno)          requestBody.tcno          = tcno
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(requestBody),
    })

    const text = await response.text()
    let data: any
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    // paymentUrl çeşitli field adlarında gelebilir — normalize et
    const rawUrl =
      data?.data?.paymentUrl || data?.data?.payment_url || data?.data?.url ||
      data?.paymentUrl       || data?.payment_url       || data?.url

    const normalizeUrl = (url: string | undefined | null): string | null => {
      if (!url) return null
      if (url.startsWith('//')) return `https:${url}`
      if (url.startsWith('/')) return `https://galaxypay.dev${url}`
      return url
    }

    const paymentUrl = normalizeUrl(rawUrl)
    const success = !!(data?.success)
    const error = data?.error?.message || data?.error || data?.message || (success ? null : 'İşlem gerçekleştirilemedi. Lütfen tekrar deneyin veya farklı bir yöntem seçin.')

    return NextResponse.json({
      success,
      paymentUrl,
      transactionId: data?.data?.transactionId || data?.transactionId || null,
      externalTransactionId: data?.data?.externalTransactionId || null,
      data: data?.data || null,
      error: success ? null : error,
      message: success ? (data?.message || data?.data?.message || null) : null,
      ip_address: data?.ip_address || null,
    }, { status: success ? 200 : 400 })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
