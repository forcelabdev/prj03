import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const GALAXYPAY_BASE = 'https://galaxypay.dev'
const API_ID = process.env.GALAXYPAY_API_ID || ''
const API_KEY = process.env.GALAXYPAY_API_KEY || ''

// application/x-www-form-urlencoded builder
function buildFormBody(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

// SHA-512 hash — api_id, api_key, user_id, username, amount, type (+ external_transaction_id varsa)
function generateHash(params: {
  userId: string
  username: string
  amount: string
  type: string
  externalTransactionId?: string
}): string {
  const hashParams: Record<string, string> = {
    api_id: API_ID,
    api_key: API_KEY,
    user_id: params.userId,
    username: params.username,
    amount: params.amount,
    type: params.type,
  }
  if (params.externalTransactionId) {
    hashParams.external_transaction_id = params.externalTransactionId
  }
  return crypto.createHash('sha512').update(buildFormBody(hashParams)).digest('hex')
}

// Transaction ID üret
function generateTxnId(userId: string, type: string): string {
  const prefix = type === 'withdraw' ? 'GP-WD' : 'GP-DP'
  const ts = Date.now()
  const rand = crypto.randomBytes(4).toString('hex')
  return `${prefix}-${userId}-${ts}-${rand}`
}

// Endpoint map
const ENDPOINTS: Record<string, string> = {
  'deposit:bank-transfer': '/payment/deposit/bank-transfer',
  'deposit:lobby':         '/payment/deposit/lobby',
  'deposit:papara':        '/payment/deposit/papara',
  'withdraw:bank-transfer':'/payment/draw/bank-transfer',
  'withdraw:papara':       '/payment/draw/papara',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Auth token'dan kullanıcı bilgilerini backend'den çek
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    const {
      type,        // "deposit" | "withdraw"
      method,      // "bank-transfer" | "lobby" | "papara"
      amount,
      // withdraw için ek alanlar
      iban,
      accountHolder,
      bankId,
      accountNumber,
      branchCode,
      tcno,
    } = body

    if (!API_ID || !API_KEY) {
      return NextResponse.json({ success: false, error: 'GalaxyPay API kimlik bilgileri eksik (GALAXYPAY_API_ID / GALAXYPAY_API_KEY).' }, { status: 500 })
    }
    if (!amount || !type || !method) {
      return NextResponse.json({ success: false, error: 'Eksik parametre: amount, type, method zorunludur.' }, { status: 400 })
    }

    // Kullanıcı bilgilerini backend'den al
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://apievrymatrix5d84k321.com'
    const AGENT_TOKEN = process.env.NEXT_PUBLIC_AGENT_TOKEN || ''
    let userId = body.userId || ''
    let username = body.username || ''

    if (token && (!userId || !username)) {
      try {
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(AGENT_TOKEN ? { 'x-agent-token': AGENT_TOKEN } : {}),
          },
        })
        if (meRes.ok) {
          const meData = await meRes.json()
          const u = meData?.data ?? meData?.user ?? meData
          userId = userId || u?.identifier || u?._id || u?.id || ''
          username = username || u?.username || u?.name || u?.email || ''
        }
      } catch {
        // sessizce devam et
      }
    }

    if (!userId || !username) {
      return NextResponse.json({ success: false, error: 'Kullanici bilgileri alinamadi. Lutfen tekrar giris yapin.' }, { status: 401 })
    }

    const endpointKey = `${type}:${method}`
    const endpoint = ENDPOINTS[endpointKey]
    if (!endpoint) {
      return NextResponse.json({ success: false, error: `Gecersiz islem tipi: ${type}/${method}` }, { status: 400 })
    }

    const externalTransactionId = generateTxnId(userId, type)
    const amountStr = String(amount)

    const hash = generateHash({ userId, username, amount: amountStr, type, externalTransactionId })

    // Form body parametreleri
    const formParams: Record<string, string> = {
      api_id: API_ID,
      user_id: userId,
      username,
      amount: amountStr,
      type,
      external_transaction_id: externalTransactionId,
      hash,
    }

    // Withdraw banka transferi için ek alanlar
    if (type === 'withdraw' && method === 'bank-transfer') {
      if (iban)          formParams.iban           = iban
      if (accountHolder) formParams.account_holder = accountHolder
      if (bankId)        formParams.bank_id        = String(bankId)
      if (accountNumber) formParams.account_number = accountNumber
      if (branchCode)    formParams.branch_code    = branchCode
      if (tcno)          formParams.tc_no          = tcno
    }

    const response = await fetch(`${GALAXYPAY_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: buildFormBody(formParams),
    })

    const text = await response.text()
    let data: any
    try { data = JSON.parse(text) }
    catch { data = { raw: text } }

    // paymentUrl çeşitli field adlarında gelebilir — relative URL'leri normalize et
    const rawUrl =
      data?.payment_url || data?.paymentUrl || data?.url ||
      data?.redirect_url || data?.redirectUrl ||
      data?.data?.url || data?.data?.payment_url ||
      data?.data?.redirect_url

    const normalizeUrl = (url: string | undefined): string | null => {
      if (!url) return null
      if (url.startsWith('//')) return `https:${url}`
      if (url.startsWith('/')) return `${GALAXYPAY_BASE}${url}`
      return url
    }

    const paymentUrl = normalizeUrl(rawUrl)

    console.log("[v0] GalaxyPay raw response:", JSON.stringify(data))
    console.log("[v0] GalaxyPay paymentUrl:", paymentUrl)

    return NextResponse.json({
      success: response.ok,
      data,
      paymentUrl,
      externalTransactionId,
    }, { status: response.ok ? 200 : response.status })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
