# SMS OTP VERİFİKASYON SİSTEMİ - BACKEND ENTEGRASYON SENARYOSU

## 📋 SISTEM AKIŞI

```
┌─────────────────────────────────────────────────────────────┐
│ KULLANICI KAYIT / SMS DOĞRULAMA AKIŞI                        │
└─────────────────────────────────────────────────────────────┘

1. KAYIT SAYFASI (app/register/page.tsx)
   ├─ Adım 3: İletişim Bilgileri
   │  └─ Telefon Numarası Alanı: "+90 5XX XXX XX XX"
   │
   └─ Form Submit
      └─ Backend'e: POST /api/auth/register
         ├─ username, email, password
         ├─ phone_number (yeni eklenen alan)
         └─ ...diğer alanlar

2. BACKEND: POST /api/auth/register (route.ts)
   ├─ Phone numarasını valide et
   ├─ Kullanıcı kaydı oluştur
   ├─ OTP kodu generate et (6 digit: 123456)
   ├─ OTP'yi DATABASE'e kaydet (expires_at: 10 dakika)
   ├─ SMS gönder (Twilio/AWS SNS ile)
   │  └─ Mesaj: "Betsfire OTP Kodunuz: 123456 (10 dakika geçerli)"
   └─ Response: {
        success: true,
        message: "SMS kodunuz gönderildi",
        requiresPhoneVerification: true,
        userToken: "temp_token_..." (geçici token)
      }

3. VERİFİ PHONE SAYFASI (app/verify-phone/page.tsx)
   ├─ Telefon numarası göster: "*********288"
   ├─ "SMS KODU GÖNDER" Butonu (Resend OTP)
   │  └─ POST /api/auth/send-otp
   │     ├─ userId, phone_number
   │     ├─ Rate limit kontrol: max 3 istek/saat
   │     └─ Yeni OTP generate ve gönder
   │
   ├─ 6 Digit OTP Input Alanları
   │  └─ Otomatik format ve focus
   │
   └─ "AKTİVE ET" Butonu
      └─ POST /api/auth/verify-otp
         ├─ userId, otp_code
         ├─ DB'deki OTP ile karşılaştır
         ├─ Eğer match ve expires_at > now():
         │  ├─ phone_verified = true (DB'e kaydet)
         │  ├─ OTP'yi sil
         │  └─ Gerçek token ver (JWT)
         └─ Eğer fail:
            └─ Error: "Geçersiz veya süresi dolmuş kod"

4. BAŞARILI VERİFİKASYON
   └─ Response: {
        success: true,
        accessToken: "real_jwt_token",
        user: { id, username, email, phone_verified: true }
      }
      └─ Kullanıcı Dashboard'a yönlendir
```

---

## 🔧 BACKEND API ENDPOINTS

### 1️⃣ **POST /api/auth/send-otp**
Yeni OTP kodu göndermek için (Resend)

**Request:**
```json
{
  "userId": "user_123",
  "phoneNumber": "+905301234567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "SMS kodunuz gönderildi",
  "expiresIn": 600
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Çok sık istek gönderiyorsunuz. Lütfen 5 dakika sonra tekrar deneyin."
}
```

**Backend Logic:**
- Rate limiting: User başına max 3 istek/saat
- OTP validity: 10 dakika (600 saniye)
- SMS provider'a gönder (Twilio, AWS SNS, vb)
- DB'ye log tut: sent_at, status

---

### 2️⃣ **POST /api/auth/verify-otp**
OTP kodunu doğrulamak için

**Request:**
```json
{
  "userId": "user_123",
  "otpCode": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Telefon numarası doğrulandı!",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "username": "soules211",
    "email": "user@example.com",
    "phoneVerified": true
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Geçersiz kod. Lütfen kontrol edin."
}
```

**Backend Logic:**
- DB'de userId için OTP bul
- Code ile karşılaştır (case-insensitive, trim)
- Expiry time kontrol et
- Eğer doğru:
  - `phone_verified = true` set et
  - OTP'yi sil veya `used = true` işaretle
  - JWT token generate et
- Eğer yanlış:
  - attempt count artır
  - 5 başarısız denemeden sonra lock user

---

## 💾 DATABASE SCHEMA

### `users` Tablosu (Yeni Alanlar)
```sql
ALTER TABLE users ADD COLUMN (
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP,
  phone_updated_at TIMESTAMP
);
```

### `otp_codes` Tablosu (Yeni Tablo)
```sql
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  status ENUM('pending', 'verified', 'expired', 'failed') DEFAULT 'pending'
);

CREATE INDEX idx_otp_user_id ON otp_codes(user_id);
CREATE INDEX idx_otp_expires_at ON otp_codes(expires_at);
```

### `otp_logs` Tablosu (Audit Log - İsteğe Bağlı)
```sql
CREATE TABLE otp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),
  phone_number VARCHAR(20),
  status VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 FRONTEND FLOW (Mevcut Kodda)

### Step 1: Register Page
**Dosya:** `app/register/page.tsx` - Step 3

```typescript
// Phone numarası alanı (Adım 3'te ekli)
<input 
  type="tel"
  placeholder="Telefon Numarası"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(e.target.value)}
/>

// Form submit'te:
const response = await authService.register({
  username,
  email,
  password,
  phoneNumber  // ← Yeni alan
});

if (response.requiresPhoneVerification) {
  router.push('/verify-phone');
}
```

### Step 2: Verify Phone Page
**Dosya:** `app/verify-phone/page.tsx`

```typescript
// SMS Kodu Gönder Butonu
const handleSendOTP = async () => {
  const result = await authService.sendOTP(userId);
  if (result.success) {
    // Countdown: 60 saniye timer başlat
    setCountdown(60);
  }
};

// OTP Doğrulama
const handleVerifyOTP = async () => {
  const code = smsCode.join(''); // "123456"
  const result = await authService.verifyOTP(userId, code);
  
  if (result.success) {
    // Token kaydet ve dashboard'a yönlendir
    router.push('/dashboard');
  }
};
```

---

## 📱 SMS PROVIDER INTEGRATION

### Seçenek 1: Twilio
```javascript
// Backend'te
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: `Betsfire OTP Kodunuz: ${otpCode} (10 dakika geçerli)`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

### Seçenek 2: AWS SNS
```javascript
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new SNSClient({ region: "eu-west-1" });
await client.send(new PublishCommand({
  Message: `Betsfire OTP Kodunuz: ${otpCode}`,
  PhoneNumber: phoneNumber
}));
```

---

## ⚠️ SECURITY BEST PRACTICES

1. **OTP Güvenliği**
   - 6 digit random code
   - 10 dakika expiry time
   - Database'te hashed veya encrypted sakla
   - Rate limiting: 3 attempt/saat

2. **Rate Limiting**
   - Resend OTP: 3 istek/saat
   - Verify OTP: 5 başarısız deneme = 15 dakika lock
   - IP-based throttling

3. **Authentication**
   - Temp token kullan (5 dakika geçerli)
   - Gerçek JWT token verification sonrası
   - Refresh token pattern

4. **Database**
   - Sensitive data encrypt et (phone number)
   - Audit logs tut (kimin, ne zaman, from where)
   - PII data GDPR uyumlu sil

5. **Error Handling**
   - Generic error mesajları kullan
   - "Geçersiz kod" (ne zaman expire olduğunu söyleme)
   - "Çok sık deniyorsunuz" (lock duration söyleme)

---

## 📊 ERROR SCENARIOS

| Durum | Frontend Mesajı | Backend Action |
|-------|-----------------|-----------------|
| Geçersiz Kod | "Geçersiz kod. Lütfen kontrol edin." | attempt+1 |
| Süresi Dolmuş | "Kodun süresi doldu. Yeni kod gönderin." | status='expired' |
| Çok Deneme | "Çok fazla deneme. 15 dakika sonra tekrar deneyin." | user_locked=true |
| Çok Sık İstek | "Lütfen 5 dakika bekleyip tekrar deneyin." | HTTP 429 |
| Network Hatası | "SMS gönderilemedi. Tekrar deneyin." | retry queue'ya ekle |

---

## 🔄 TEKRAR DENEME (RESEND) MANTIĞI

```
1. SMS Kodu Gönder
   ↓
2. 60 saniye countdown (disable buton)
   ↓
3. Countdown = 0
   ↓
4. "Yeni Kod Gönder" Butonu aktif
   ↓
5. Tekrar SMS gönder (rate limit kontrol)
   ├─ Başarı: countdown reset + "Kod gönderildi"
   └─ Fail: "Çok sık istek. X dakika sonra tekrar deneyin"
```

---

## 🎯 IMPLEMENTATION CHECKLIST

- [ ] `users` tablosuna phone alanları ekle
- [ ] `otp_codes` tablosu oluştur
- [ ] POST `/api/auth/send-otp` endpoint'i yaz
- [ ] POST `/api/auth/verify-otp` endpoint'i yaz
- [ ] SMS provider'ı konfigüre et (Twilio/AWS SNS)
- [ ] Rate limiting middleware ekle
- [ ] Auth service'e `sendOTP()` ve `verifyOTP()` metotları ekle
- [ ] Verify phone page'ı bağla
- [ ] Error handling ve retry logic
- [ ] Audit logging ekle
- [ ] Testing (valid/invalid codes, expiry, rate limit)
- [ ] Production SMS credentials set et

---

## 💡 İPUÇLARı

1. **Testing**: Twilio/AWS'de free SMS testing mod kullan
2. **Development**: Console'a OTP kod print et (test için)
3. **Lock Mechanism**: Redis veya in-memory cache kullan rate limiting için
4. **Notification**: Phone verified olduğunda email de gönder
5. **Cleanup**: Expired OTP'leri nightly cron ile temizle
