// Payment Service - Backend API dokumantasyonuna gore
import apiClient from '../api-client';
import tokenManager from '../token-manager';
import { galaxypayService } from './galaxypay-service';

export interface DepositMethod {
  id: string;
  name: string;
  logo?: string;
  icon?: string;
  desc: string;
  min: string;
  max: string;
  type: 'bank' | 'crypto' | 'ewallet';
  favorite?: boolean;
}

export interface WithdrawMethod {
  id: string;
  name: string;
  logo?: string;
  icon?: string;
  desc: string;
  min: string;
  max: string;
  type: 'bank' | 'crypto' | 'ewallet';
}

export interface BankAccount {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber?: string;
  iban: string;
  logo?: string;
}

export interface Transaction {
  _id: string;
  amount: number;
  title?: string;
  type: 'deposit' | 'withdraw';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  method: string;
  createdAt: string;
}

export interface WithdrawRequest {
  method: 'papara' | 'bank-transfer' | 'payfix';
  amount: number;
  details: {
    iban?: string;
    paparaNo?: string;
    accountName?: string;
    bankName?: string;
  };
}

// Statik ödeme yöntemleri (backend'de endpoint yoksa kullanılır)
const DEPOSIT_METHODS: DepositMethod[] = [
  { id: 'galaxypay',           name: 'GalaxyPay',           logo: 'GLXPAY',  icon: '/images/galaxypay.png',          desc: 'Anında', min: '₺100,00',   max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'meeldev',            name: 'Capora Havale',       logo: 'CAPORA',  icon: '/images/capora-havale.png',      desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'usdt-trc20',         name: 'Tether (USDT)',        logo: 'USDT',    icon: '/images/kriptobpusdttrs20.webp', desc: '10-30 dk', min: '10 USDT',   max: '50.000 USDT', type: 'crypto', favorite: true },
  { id: 'btc',                name: 'Bitcoin',             logo: 'BTC',     icon: '/images/kriptobpbtc.svg',        desc: '30-60 dk', min: '0.001 BTC', max: '10 BTC',   type: 'crypto',  favorite: true },
  { id: 'eth',                name: 'Ethereum',            logo: 'ETH',     icon: '/images/kriptobpeth.svg',        desc: '10-30 dk', min: '0.01 ETH',  max: '500 ETH',  type: 'crypto',  favorite: true },
  { id: 'trx',                name: 'Tron (TRX)',          logo: 'TRX',     icon: '/images/kriptobptrx.svg',        desc: '5-15 dk',  min: '10 TRX',    max: '1M TRX',   type: 'crypto',  favorite: true },
  { id: 'super-havale',       name: 'Super Havale',        logo: 'SUPER',   icon: '/images/superhavale.svg',        desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'maxi-havale',        name: 'Maxi Havale',         logo: 'MAXI',    icon: '/images/maxihavale.svg',         desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'mpay-havale',        name: 'MPay Havale',         logo: 'MPAY',    icon: '/images/mpay-havale-new.svg',    desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'mpay-fast',          name: 'MPay Fast',           logo: 'MPAYF',   icon: '/images/mpaysfast.svg',          desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'fast-havale',        name: 'Fast Havale',         logo: 'FAST',    icon: '/images/fast-havale-new.svg',    desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'yeni-havale',        name: 'Yeni Havale',         logo: 'YENI',    icon: '/images/yenihavale.svg',         desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'oto-havale',         name: 'Oto Havale',          logo: 'OTO',     icon: '/images/autohvl1.svg',           desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'hizli-odeme-havale', name: 'Hızlı Öde Havale',   logo: 'HIZLI',   icon: '/images/hizliodeme.png',         desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'hemen-ode-1',        name: 'Hemen Öde',          logo: 'HEMEN1',  icon: '/images/hemenode1.svg',          desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'hemen-ode-biz',      name: 'Hemen Öde Biz',      logo: 'HEMENBIZ',icon: '/images/hemenodebiz.svg',        desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'jetbak-transfer',    name: 'Jet Bank Transfer',   logo: 'JETBAK',  icon: '/images/luqapays.webp',          desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'paymentnew',         name: 'Payment',             logo: 'PYMNEW',  icon: '/images/paymentnew.svg',         desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'glblpay',            name: 'Global Pay',          logo: 'GLBL',    icon: '/images/glblpygtwy36.svg',       desc: 'Anında', min: '₺1.000,00', max: '₺100.000,00',  type: 'bank',    favorite: true },
  { id: 'usdt-erc20',         name: 'USDT (ERC20)',        logo: 'USDTE',   icon: '/images/kriptobpusdterc20-new.svg',  desc: '10-30 dk', min: '10 USDT',   max: '50.000 USDT', type: 'crypto', favorite: true },
  { id: 'papara',             name: 'Papara',              logo: 'PAPARA',  desc: 'Anında', min: '50 TL',    max: '50.000 TL',   type: 'ewallet', favorite: true },
  { id: 'payfix',             name: 'PayFix',              logo: 'PAYFIX',  desc: 'Anında', min: '50 TL',    max: '25.000 TL',   type: 'ewallet' },
];

// Statik fallback - id degerleri backend providerSlug ile eslesmeli
const WITHDRAW_METHODS: WithdrawMethod[] = [
  { id: 'bank-transfer', name: 'Banka Havalesi', logo: 'BANKA', desc: '5-30 dk', min: '100 TL', max: '50.000 TL', type: 'bank' },
  { id: 'papara', name: 'Papara', logo: 'PAPARA', desc: 'Anında', min: '50 TL', max: '10.000 TL', type: 'ewallet' },
  { id: 'payfix', name: 'PayFix', logo: 'PAYFIX', desc: 'Anında', min: '50 TL', max: '10.000 TL', type: 'ewallet' },
  { id: 'usdt-trc20', name: 'USDT (TRC20)', logo: 'USDT', desc: '10-30 dk', min: '10 USDT', max: '10.000 USDT', type: 'crypto' },
];

export const paymentService = {
  // Para yatırma yöntemlerini getir
  // GET /site-settings → meelDev alanından MeelDev yöntemini dinamik olarak ekle
  async getDepositMethods(): Promise<{ success: boolean; methods?: DepositMethod[]; error?: string }> {
    const methods: DepositMethod[] = [...DEPOSIT_METHODS];

    try {
      const siteRes = await apiClient.get<any>('/site-settings');
      const meelDev = siteRes.data?.meelDev ?? siteRes.data?.data?.meelDev;
      if (meelDev?.isActive === true) {
        // Statik listedeki meeldev kaydını güncelle, yeni kart ekleme
        const existing = methods.find(m => m.id === 'meeldev');
        if (existing) {
          existing.min = `₺${(meelDev.minAmount || 1000).toLocaleString('tr-TR')},00`;
          existing.max = `₺${(meelDev.maxAmount || 100000).toLocaleString('tr-TR')},00`;
        }
      }
      const galaxyPay = siteRes.data?.galaxyPay ?? siteRes.data?.data?.galaxyPay;
      if (galaxyPay?.isActive === false) {
        // Backend'de kapaliysa listeden cikar
        const idx = methods.findIndex(m => m.id === 'galaxypay');
        if (idx !== -1) methods.splice(idx, 1);
      } else if (galaxyPay) {
        const existing = methods.find(m => m.id === 'galaxypay');
        if (existing) {
          existing.min = `₺${(galaxyPay.minAmount || 100).toLocaleString('tr-TR')},00`;
          existing.max = `₺${(galaxyPay.maxAmount || 100000).toLocaleString('tr-TR')},00`;
          if (galaxyPay.name) existing.name = galaxyPay.name;
        }
      }
    } catch { /* ignore, statik listeye fallback */ }

    return { success: true, methods };
  },

  // Para çekme yöntemlerini getir - GET /payment/forcelab-finance/methods (Public)
  async getWithdrawMethods(): Promise<{ success: boolean; methods?: WithdrawMethod[]; error?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: { available: boolean; methods: Array<{ slug: string; name: string; type: string; minAmount: number; maxAmount: number; isActive: boolean }> } }>('/payment/forcelab-finance/methods');
      if (response.success && response.data?.data?.methods) {
  
        const methods: WithdrawMethod[] = response.data.data.methods
          .filter((m) => m.isActive)
          .map((m) => ({
            id: m.slug,
            name: m.name,
            logo: m.slug.toUpperCase().replace(/-/g, ''),
            desc: 'Anında',
            min: `${m.minAmount} TL`,
            max: `${m.maxAmount} TL`,
            type: m.type === 'manual' ? 'bank' : 'ewallet',
          }));
        return { success: true, methods };
      }
    } catch { /* ignore, fallback to static */ }
    // Fallback: statik liste
    return { success: true, methods: WITHDRAW_METHODS };
  },

  // Deposit olustur
  async createDeposit(data: { methodId: string; amount: number; currency: string; userId?: string; username?: string }): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
    // Yönteme göre uygun endpoint'i çağır
    switch (data.methodId) {
      case 'papara':
        return this.createPaparaDeposit();
      case 'bank-transfer':
        return this.createBankTransferDeposit();
      case 'super-havale': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://www.superhavale.net/odeme` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'mpay-havale': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yap��n' };
        }
        const username = data.username || '';
        const amount = data.amount || 0;
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://www.mpay5.com/odeme` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&amount=${encodeURIComponent(amount.toString())}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'maxi-havale': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://maxihavale.co/` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'hizli-odeme-havale': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://hizli-odeme.net/` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'hemen-ode': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://hemenode1.co/` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'yeni-havale': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://yenihavale.co/` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'oto-havale': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://www.autohvl1.com/` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'fast-havale': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://fasthavale.net/` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'jetbak-transfer': {
        const token = tokenManager.getToken();
        if (!token) {
          return { success: false, error: 'Lütfen giriş yapın' };
        }
        const username = data.username || '';
        const amount = data.amount || 0;
        const apiBase = 'https://apievrymatrix5d84k321.com';
        const paymentUrl =
          `https://luqapasy.com/odeme` +
          `?token=${encodeURIComponent(token)}` +
          `&username=${encodeURIComponent(username)}` +
          `&amount=${encodeURIComponent(amount.toString())}` +
          `&apiBase=${encodeURIComponent(apiBase)}`;
        return { success: true, paymentUrl };
      }
      case 'mpay-fast': {
        const token = tokenManager.getToken();
        if (!token) return { success: false, error: 'Lütfen giriş yapın' };
        const paymentUrl = `https://www.mpay5.com/odeme?token=${encodeURIComponent(token)}&username=${encodeURIComponent(data.username || '')}&apiBase=${encodeURIComponent('https://apievrymatrix5d84k321.com')}`;
        return { success: true, paymentUrl };
      }
      case 'hemen-ode':
      case 'hemen-ode-1': {
        const token = tokenManager.getToken();
        if (!token) return { success: false, error: 'Lütfen giriş yapın' };
        const paymentUrl = `https://hemenode1.co/?token=${encodeURIComponent(token)}&username=${encodeURIComponent(data.username || '')}&apiBase=${encodeURIComponent('https://apievrymatrix5d84k321.com')}`;
        return { success: true, paymentUrl };
      }
      case 'hemen-ode-biz': {
        const token = tokenManager.getToken();
        if (!token) return { success: false, error: 'Lütfen giriş yapın' };
        const paymentUrl = `https://hemenode1.co/?token=${encodeURIComponent(token)}&username=${encodeURIComponent(data.username || '')}&apiBase=${encodeURIComponent('https://apievrymatrix5d84k321.com')}`;
        return { success: true, paymentUrl };
      }
      case 'paymentnew': {
        const token = tokenManager.getToken();
        if (!token) return { success: false, error: 'Lütfen giriş yapın' };
        const paymentUrl = `https://paymentnew.co/?token=${encodeURIComponent(token)}&username=${encodeURIComponent(data.username || '')}&apiBase=${encodeURIComponent('https://apievrymatrix5d84k321.com')}`;
        return { success: true, paymentUrl };
      }
      case 'glblpay': {
        const token = tokenManager.getToken();
        if (!token) return { success: false, error: 'Lütfen giriş yapın' };
        const paymentUrl = `https://glblpay.co/?token=${encodeURIComponent(token)}&username=${encodeURIComponent(data.username || '')}&apiBase=${encodeURIComponent('https://apievrymatrix5d84k321.com')}`;
        return { success: true, paymentUrl };
      }
      case 'btc':
      case 'eth':
      case 'trx':
      case 'usdt-trc20':
      case 'usdt-erc20': {
        const token = tokenManager.getToken();
        if (!token) return { success: false, error: 'Lütfen giriş yapın' };
        const paymentUrl = `https://cryptobp.co/odeme?token=${encodeURIComponent(token)}&username=${encodeURIComponent(data.username || '')}&returnUrl=${encodeURIComponent(window.location.origin + '/deposit')}`;
        return { success: true, paymentUrl };
      }
      case 'payfix':
        return this.createPayfixDeposit();
      case 'echopayz': {
        const echoRes = await this.createEchopayzDeposit(data.amount);
        return { success: echoRes.success, paymentUrl: echoRes.data?.redirectUrl, error: echoRes.error };
      }
      case 'galaxypay': {
        // POST /payment/galaxypay/deposit - Zorunlu auth
        // method varsayilan olarak "lobby" (redirectli odeme sayfasi)
        if (!tokenManager.getToken()) return { success: false, error: 'Lütfen giriş yapın' };
        const gpRes = await galaxypayService.createDeposit(data.amount, 'lobby');
        if (gpRes.success && gpRes.paymentUrl) {
          return { success: true, paymentUrl: gpRes.paymentUrl };
        }
        if (gpRes.success && gpRes.transactionId) {
          return { success: true, paymentUrl: undefined };
        }
        return { success: false, error: gpRes.error || 'GalaxyPay yatırım başlatılamadı' };
      }
      case 'meeldev': {
        // POST /payment/meeldev/deposit - Zorunlu auth
        // Body: { amount, directAccount, customerName? }
        if (!tokenManager.getToken()) return { success: false, error: 'Lütfen giriş yapın' };
        const res = await apiClient.post<any>('/payment/meeldev/deposit', {
          amount: data.amount,
          directAccount: 0,
          customerName: data.username || undefined,
        }, true);
        const d = res.data?.data ?? res.data;
        if (res.success && (d?.paymentUrl || d?.transactionId)) {
          return { success: true, paymentUrl: d?.paymentUrl || undefined };
        }
        const errMsg = res.error || d?.message || res.data?.message || 'MeelDev yatırım başlatılamadı';
        return { success: false, error: errMsg };
      }
      default:
        return { success: false, error: 'Geçersiz ödeme yöntemi' };
    }
  },

  // GET /auth/bank-accounts - Banka hesaplari (Opsiyonel auth)
  async getBankAccounts(): Promise<{ success: boolean; banks?: BankAccount[]; error?: string }> {
    const response = await apiClient.get<{ success: boolean; banks: BankAccount[] }>('/auth/bank-accounts');
    
    if (response.success && response.data) {
      return { success: true, banks: response.data.banks || response.data as any };
    }
    
    return { success: false, error: response.error || 'Banka hesaplari alinamadi' };
  },

  // POST /auth/bank-transfer - Banka havalesi ile para yatirma (Zorunlu auth)
  async createBankTransfer(amount: number, bankId: string): Promise<{ success: boolean; transferId?: string; error?: string }> {
    const response = await apiClient.post<{ success: boolean; transferId: string }>('/auth/bank-transfer', {
      amount,
      bankId,
    }, true);
    
    if (response.success && response.data) {
      return { success: true, transferId: response.data.transferId };
    }
    
    return { success: false, error: response.error || 'Havale olusturulamadi' };
  },

  // POST /auth/bank-withdraw - Banka ile para cekme (Zorunlu auth)
  async createBankWithdraw(data: {
    amount: number;
    bankName: string;
    accountName: string;
    accountNumber?: string;
    iban: string;
  }): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<{ success: boolean }>('/auth/bank-withdraw', data, true);
    
    if (response.success) {
      return { success: true };
    }
    
    return { success: false, error: response.error || 'Cekim talebi olusturulamadi' };
  },

  // GET /deposit/papara - Papara ile para yatirma (Zorunlu auth)
  async createPaparaDeposit(): Promise<{ success: boolean; redirectUrl?: string; message?: string; error?: string }> {
    const response = await apiClient.get<{ message: string; redirectUrl: string }>('/deposit/papara', true);
    
    if (response.success && response.data) {
      return { success: true, redirectUrl: response.data.redirectUrl, message: response.data.message };
    }
    
    return { success: false, error: response.error || 'Papara yonlendirme basarisiz' };
  },

  // GET /deposit/banktransfer - Banka transferi ile para yatirma (Zorunlu auth)
  async createBankTransferDeposit(): Promise<{ success: boolean; redirectUrl?: string; message?: string; error?: string }> {
    const response = await apiClient.get<{ message: string; redirectUrl: string }>('/deposit/banktransfer', true);
    
    if (response.success && response.data) {
      return { success: true, redirectUrl: response.data.redirectUrl, message: response.data.message };
    }
    
    return { success: false, error: response.error || 'Banka transferi basarisiz' };
  },

  // GET /deposit/payfix - PayFix ile para yatirma (Zorunlu auth)
  async createPayfixDeposit(): Promise<{ success: boolean; redirectUrl?: string; message?: string; error?: string }> {
    const response = await apiClient.get<{ message: string; redirectUrl: string }>('/deposit/payfix', true);
    
    if (response.success && response.data) {
      return { success: true, redirectUrl: response.data.redirectUrl, message: response.data.message };
    }
    
    return { success: false, error: response.error || 'PayFix yonlendirme basarisiz' };
  },

  // POST /payment/forcelab-finance/withdraw - Para çekme talebi (Zorunlu auth)
  // Body: { amount, providerSlug, metadata: { iban, accountName } }
  // UUID backend'te admin onayından sonra oluşturulur
  async createWithdrawal(data: { method: string; amount: number; details: Record<string, string> }): Promise<{ success: boolean; withdrawal?: any; message?: string; error?: string }> {
    const payload = {
      amount: data.amount,
      providerSlug: data.method,
      metadata: {
        iban: data.details.iban || data.details.bankAccount || '',
        accountName: data.details.accountName || '',
      },
    }
    
    const response = await apiClient.post<any>('/payment/forcelab-finance/withdraw', payload, true);
    
    console.log("[v0] createWithdrawal API response:", response);
    
    // Backend başarılı response döndürdüyse (HTTP 200)
    if (response.success) {
      const message = response.data?.message || response.message || 'Çekim talebiniz alındı ve inceleme sürecindedir!';
      return { success: true, message };
    }
    
    return { success: false, error: response.error || 'Çekim talebi oluşturulamadı' };
  },

  // POST /payment/echopayz/create - EchoPayz ile para yatirma (Zorunlu auth)
  async createEchopayzDeposit(amount: number): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>('/payment/echopayz/create', { amount }, true);
    
    if (response.success && response.data) {
      return { success: true, data: response.data.data };
    }
    
    return { success: false, error: response.error || 'EchoPayz odemesi olusturulamadi' };
  },

  // GET /payment/echopayz/status/:referenceId - EchoPayz odeme durumu
  async getEchopayzStatus(referenceId: string): Promise<{ success: boolean; status?: any; error?: string }> {
    const response = await apiClient.get<any>(`/payment/echopayz/status/${referenceId}`);
    
    if (response.success && response.data) {
      return { success: true, status: response.data };
    }
    
    return { success: false, error: response.error || 'Odeme durumu alinamadi' };
  },

  // GET /payment/echopayz/history - EchoPayz gecmisi (Zorunlu auth)
  async getEchopayzHistory(): Promise<{ success: boolean; history?: any[]; error?: string }> {
    const response = await apiClient.get<any[]>('/payment/echopayz/history', true);
    
    if (response.success && response.data) {
      return { success: true, history: response.data as any };
    }
    
    return { success: false, error: response.error || 'Gecmis alinamadi' };
  },

  // POST /payment/pix/create - PIX ile para yatirma (BRL) (Zorunlu auth)
  async createPixDeposit(amount: number): Promise<{ success: boolean; pixCode?: string; pixQR?: string; transactionId?: string; error?: string }> {
    const response = await apiClient.post<{ success: boolean; message: string; transactionId: string; pixCode: string; pixQR: string }>('/payment/pix/create', { amount }, true);
    
    if (response.success && response.data) {
      return { 
        success: true, 
        pixCode: response.data.pixCode, 
        pixQR: response.data.pixQR, 
        transactionId: response.data.transactionId 
      };
    }
    
    return { success: false, error: response.error || 'PIX odemesi olusturulamadi' };
  },

  // GET /transaction-history/:userId - Islem gecmisi
  async getTransactionHistory(userId: string): Promise<{ success: boolean; transactions?: Transaction[]; error?: string }> {
    const response = await apiClient.get<{ transactions: Transaction[] }>(`/transaction-history/${userId}`);
    
    if (response.success && response.data) {
      return { success: true, transactions: response.data.transactions };
    }
    
    return { success: false, error: response.error || 'Islem gecmisi alinamadi' };
  },

  // GET /bonus-history/:userId - Bonus gecmisi
  async getBonusHistory(userId: string): Promise<{ success: boolean; history?: any[]; error?: string }> {
    const response = await apiClient.get<any[]>(`/bonus-history/${userId}`);
    
    if (response.success && response.data) {
      return { success: true, history: response.data as any };
    }
    
    return { success: false, error: response.error || 'Bonus gecmisi alinamadi' };
  },
};

export default paymentService;
