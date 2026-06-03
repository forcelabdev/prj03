"use client"
import { X, Loader2, MessageSquare, Mail } from "lucide-react"
import { useState, useRef } from "react"

const EyeIcon = ({ className }: { className?: string }) => (
  <svg width="25" height="25" viewBox="0 0 24 15" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <g transform="translate(1 1)" fill="none" fillRule="evenodd">
      <path d="M0 6.378S5.128 0 11.315 0c6.188 0 10.817 6.438 10.817 6.438s-4.62 6.625-10.745 6.625C5.262 13.063 0 6.378 0 6.378z" stroke="#4E4E4E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle stroke="#4E4E4E" strokeWidth="1.5" cx="11" cy="6.5" r="6"/>
      <circle fill="#4E4E4E" cx="11" cy="6.5" r="3"/>
      <circle fill="#FFF" cx="9.5" cy="5" r="1.5"/>
    </g>
  </svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 22 19" className={className} aria-hidden="true">
    <path fill="#4e4e4e" d="M8.6 9a1.27 1.27 0 0 1-.4-.6 2.92 2.92 0 0 0-.2.9v.3zm2-2l.6-.6c-.1 0-.2-.1-.4-.1s-.5.1-.8.1l.6.6m8.1-1.3l-1 1a17.61 17.61 0 0 1 2.4 2.4c-1 1.3-4.6 5.4-8.9 5.4-.5 0-1-.1-1.4-.1l-1.2 1.1a10.87 10.87 0 0 0 2.6.4c5.9 0 10.2-6.1 10.4-6.3a.6.6 0 0 0 0-.8 15.23 15.23 0 0 0-2.9-3.1"/>
    <path fill="#4e4e4e" d="M4.1 13.2l1-1A23.87 23.87 0 0 1 1.6 9a22.54 22.54 0 0 1 4-3.4 6.91 6.91 0 0 0-1 3.6 7.27 7.27 0 0 0 .7 2.9L6.4 11A3.92 3.92 0 0 1 6 9.2a4.89 4.89 0 0 1 4.8-4.9 5.37 5.37 0 0 1 2.1.5l1.7-1.7a10.39 10.39 0 0 0-3.5-.7C5.1 2.4.3 8.4.2 8.6a1 1 0 0 0 0 .9 19.51 19.51 0 0 0 3.9 3.7m-1.6 4L18.7.9 20 2.3 3.8 18.5"/>
  </svg>
)
import Link from "next/link"
import { useAuth, OtpChallenge } from "@/contexts/auth-context"
import authService from "@/lib/services/auth-service"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<"login" | "forgot" | "otp">("login")
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  // OTP state
  const [otpChallenge, setOtpChallenge] = useState<OtpChallenge | null>(null)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [otpMethod, setOtpMethod] = useState<"sms" | "email" | null>(null)
  const [otpError, setOtpError] = useState("")
  const [otpSubmitting, setOtpSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [codeSent, setCodeSent] = useState(false)
  const [otpStep, setOtpStep] = useState<1 | 2>(1)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const { login, completeOtpLogin, resendOtp, setShowWelcomeModal } = useAuth()

  const [forgotError, setForgotError] = useState("")

  const handleForgotSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!forgotEmail) return
    setForgotError("")
    setForgotSubmitting(true)
    try {
      const result = await authService.requestPasswordReset(forgotEmail)
      if (result.success) {
        setForgotSuccess(true)
      } else {
        setForgotError(result.error || "Bir hata oluştu. Lütfen tekrar deneyin.")
      }
    } catch {
      setForgotError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setForgotSubmitting(false)
    }
  }

  const handleClose = () => {
    setView("login")
    setForgotEmail("")
    setForgotSuccess(false)
    onClose()
  }

  const startResendCountdown = (seconds: number) => {
    setResendCooldown(seconds)
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = otpDigits.join("")
    if (!otpChallenge || code.length < 6) return
    setOtpError("")
    setOtpSubmitting(true)
    try {
      const result = await completeOtpLogin(otpChallenge.challengeId, code)
      if (result.success) {
        onClose()
        setTimeout(() => setShowWelcomeModal(true), 100)
      } else {
        const msgs: Record<string, string> = {
          OTP_INVALID_CODE: "Girdiğiniz kod hatalı.",
          OTP_CHALLENGE_EXPIRED: "Kodun süresi doldu. Lütfen yeni kod isteyin.",
          OTP_ATTEMPTS_EXCEEDED: "Çok fazla yanlış deneme. Yeni kod isteyin.",
          OTP_CHALLENGE_INACTIVE: "Oturum geçersiz. Lütfen tekrar giriş yapın.",
        }
        setOtpError(msgs[result.errorCode ?? ""] || result.error || "Doğrulama başarısız.")
      }
    } finally {
      setOtpSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!otpChallenge) return
    // İlk gönderimde cooldown'u yok say
    if (codeSent && resendCooldown > 0) return
    setOtpError("")
    const result = await resendOtp(otpChallenge.challengeId)
    if (result.success && result.challenge) {
      setOtpChallenge(result.challenge)
      setCodeSent(true)
      startResendCountdown(result.challenge.cooldownRemainingSeconds)
    } else if (!result.success) {
      if (result.cooldownRemainingSeconds) {
        startResendCountdown(result.cooldownRemainingSeconds)
        setOtpError(`Lütfen ${result.cooldownRemainingSeconds} saniye bekleyin.`)
      } else {
        setOtpError(result.error || "Tekrar gönderme başarısız.")
      }
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Doğrulama hatası, lütfen girilen değerleri kontrol edin")
      return
    }
    setIsSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.success && result.otpRequired && result.otpChallenge) {
        setOtpChallenge(result.otpChallenge)
        setOtpMethod(null)
        setCodeSent(false)
        setResendCooldown(0)
        setOtpDigits(["", "", "", "", "", ""])
        setOtpError("")
        setView("otp")
      } else if (result.success) {
        onClose()
        setEmail("")
        setPassword("")
      } else {
        setError("Giriş başarısız, lütfen kullanıcı adı ve şifrenizi kontrol ediniz")
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Forgot Password View
  const forgotView = (
    <>
      {/* Mobile */}
      <div className="lg:hidden fixed inset-0 z-[100] flex flex-col" style={{ background: "#f0f0f0" }}>
        {/* Dark Header */}
        <div style={{ background: "#2a2a2a" }} className="px-5 py-6 pt-16 relative flex flex-col items-center">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-500 text-gray-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-bold text-white mt-2" style={{ fontSize: "22px" }}>Şifreyi Yenile</h2>
          <p className="text-gray-300 text-center mt-2 max-w-xs" style={{ fontSize: "14px" }}>
            Şifre hatırlatma e-mailini almak için lütfen aşağıdaki bilgileri doldurun.
          </p>
        </div>
        {/* Body */}
        <div className="flex-1" style={{ padding: "40px 26px" }}>
          {forgotSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(0,212,180,0.15)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#00d4b4" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: "18px" }}>E-posta Gönderildi!</h3>
              <p className="text-gray-600" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Şifre sıfırlama linki <span className="font-semibold text-gray-800">{forgotEmail}</span> adresine gönderildi. E-posta kutunuzu kontrol edin.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 text-white transition-colors"
                style={{ background: "#00d4b4", width: "100%", height: "44px", borderRadius: "4px", fontWeight: 500, fontSize: "15px" }}
              >
                Tamam
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                <span className="text-red-500">*</span>Eposta
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={{ width: "390px", height: "50px", maxWidth: "100%" }}
                className={`border bg-white px-4 text-gray-900 focus:outline-none focus:ring-1 ${forgotEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail) ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
              />
              {forgotEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail) && (
                <p className="mt-1 text-sm text-red-500">Bu e-mail adresi geçerli değildir</p>
              )}
              {forgotError && (
                <p className="mt-2 text-sm text-red-500">{forgotError}</p>
              )}
              <button
                type="submit"
                disabled={forgotSubmitting}
                className="mt-10 text-black transition-colors disabled:opacity-50 flex items-center justify-center"
                style={{ background: "#00d4b4", width: "378px", height: "40px", maxWidth: "100%", fontWeight: 400 }}
              >
                {forgotSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Şifre Sıfırlama"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:fixed lg:inset-0 lg:z-50 lg:flex lg:items-center lg:justify-center lg:bg-black/50">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
          <div style={{ background: "#2a2a2a" }} className="px-8 py-6 relative flex flex-col items-center">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="font-bold text-white mt-1" style={{ fontSize: "22px" }}>Şifreyi Yenile</h2>
            <p className="text-gray-300 text-center mt-2" style={{ fontSize: "14px" }}>
              Şifre hatırlatma e-mailini almak için lütfen aşağıdaki bilgileri doldurun.
            </p>
          </div>
          <div style={{ background: "#f0f0f0", padding: "40px 26px" }}>
            {forgotSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(0,212,180,0.15)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#00d4b4" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: "18px" }}>E-posta Gönderildi!</h3>
                <p className="text-gray-600" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  Şifre sıfırlama linki <span className="font-semibold text-gray-800">{forgotEmail}</span> adresine gönderildi. E-posta kutunuzu kontrol edin.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 text-white transition-colors"
                  style={{ background: "#00d4b4", width: "100%", height: "44px", borderRadius: "4px", fontWeight: 500, fontSize: "15px" }}
                >
                  Tamam
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  <span className="text-red-500">*</span>Eposta
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ width: "390px", height: "50px", maxWidth: "100%" }}
                  className={`border bg-white px-4 text-gray-900 focus:outline-none focus:ring-1 ${forgotEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail) ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                />
                {forgotEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail) && (
                  <p className="mt-1 text-sm text-red-500">Bu e-mail adresi geçerli değildir</p>
                )}
                {forgotError && (
                  <p className="mt-2 text-sm text-red-500">{forgotError}</p>
                )}
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="mt-10 text-black transition-colors disabled:opacity-50 flex items-center justify-center"
                  style={{ background: "#00d4b4", width: "378px", height: "40px", maxWidth: "100%", fontWeight: 400 }}
                >
                  {forgotSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Şifre Sıfırlama"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )

  if (view === "forgot") return forgotView

  // OTP View — 2 adımlı: 1) Yöntem seç, 2) Kod gönder + doğrula
  if (view === "otp") {
    const otpCode = otpDigits.join("")
    const GOLD = "#00d4b4"
    const RADIO_GOLD = "#00d4b4"
    const BG = "#1a1a1a"
    const CARD_BG = "rgba(255,255,255,0.07)"

    const closeOtp = () => {
      setView("login")
      setOtpDigits(["", "", "", "", "", ""])
      setOtpError("")
      setCodeSent(false)
      setOtpMethod(null)
      setResendCooldown(0)
    }

    const handleMethodSelect = (m: "sms" | "email") => {
      setOtpMethod(m)
      setOtpDigits(["", "", "", "", "", ""])
      setOtpError("")
      setResendCooldown(0)
      setCodeSent(false)
    }

    const handleSendSms = async () => {
      if (!otpChallenge) return
      setOtpError("")
      const r = await resendOtp(otpChallenge.challengeId)
      setCodeSent(true)
      if (r.success && r.challenge) {
        setOtpChallenge(r.challenge)
        startResendCountdown(r.challenge.cooldownRemainingSeconds)
      } else if (r.cooldownRemainingSeconds) {
        // Backend zaten SMS atmış, cooldown'u başlat
        startResendCountdown(r.cooldownRemainingSeconds)
      }
    }

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.75)", padding: "0 35px" }}
      >
        <div
          className="w-full rounded-2xl relative"
          style={{ backgroundColor: BG, padding: "24px 20px" }}
        >
          {/* X butonu */}
          <button
            onClick={closeOtp}
            className="absolute top-4 right-4 flex items-center justify-center rounded-full"
            style={{ width: 32, height: 32, backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Başlık */}
          <p className="font-bold mb-5 pr-8" style={{ color: GOLD, fontSize: 15, lineHeight: 1.4 }}>
            2FA&apos;YI ETKİNLEŞTİRME YÖNTEMİNİZİ SEÇİN
          </p>

          {/* Radio kartlar */}
          <div className="flex gap-3 mb-4">
            {(["sms", "email"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMethodSelect(m)}
                className="flex-1 flex items-center gap-2 rounded-lg px-3 py-3"
                style={{ backgroundColor: CARD_BG }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 22, height: 22,
                    border: `2px solid ${otpMethod === m ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)"}`,
                    backgroundColor: "transparent",
                  }}
                >
                  {otpMethod === m && (
                    <span className="block rounded-full" style={{ width: 11, height: 11, backgroundColor: RADIO_GOLD }} />
                  )}
                </span>
                {m === "sms"
                  ? <MessageSquare className="h-4 w-4 text-gray-300 flex-shrink-0" />
                  : <Mail className="h-4 w-4 text-gray-300 flex-shrink-0" />}
                <span className="text-sm font-medium text-white">
                  {m === "sms" ? "SMS kodu" : "E-posta kodu"}
                </span>
              </button>
            ))}
          </div>

          {/* SMS seçildi — önce sadece gönder butonu */}
          {otpMethod === "sms" && !codeSent && (
            <button
              type="button"
              onClick={handleSendSms}
              className="w-full rounded-lg h-[42px] text-sm font-semibold tracking-wide"
              style={{ border: `2px solid ${GOLD}`, color: GOLD, backgroundColor: "transparent" }}
            >
              SMS KODU GÖNDER
            </button>
          )}

          {/* SMS kodu gönderildikten sonra — yeniden gönder + input + doğrula */}
          {otpMethod === "sms" && codeSent && (
            <form onSubmit={handleOtpSubmit} className="flex flex-col w-full">
              {/* Yeniden gönder butonu */}
              <button
                type="button"
                onClick={handleSendSms}
                disabled={resendCooldown > 0 || otpSubmitting}
                className="w-full rounded-lg h-[42px] text-sm font-semibold tracking-wide mb-4"
                style={{
                  border: `2px solid ${resendCooldown > 0 ? `${GOLD}40` : GOLD}`,
                  color: resendCooldown > 0 ? `${GOLD}40` : GOLD,
                  backgroundColor: "transparent",
                }}
              >
                {resendCooldown > 0 ? `KODU YENİDEN GÖNDER ${resendCooldown}s` : "KODU YENİDEN GÖNDER"}
              </button>

              {/* Bilgi */}
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                Lütfen telefonunuza gönderdiğimiz kodu aşağıdaki kutucuğa girin.
              </p>

              {/* 6 alt çizgili input */}
              <div className="flex justify-center gap-2 mb-2">
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleDigitKeyDown(i, e)}
                    className="text-white text-xl font-bold text-center focus:outline-none bg-transparent"
                    style={{
                      width: 34, height: 42,
                      borderTop: "none", borderLeft: "none", borderRight: "none",
                      borderBottom: `2px solid ${d ? GOLD : "rgba(255,255,255,0.25)"}`,
                      caretColor: GOLD,
                    }}
                  />
                ))}
              </div>

              {otpError && <p className="text-red-400 text-xs text-center mb-2">{otpError}</p>}

              <p className="text-xs mt-3 mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                *Kod gelmediyse lütfen tekrar kod isteyiniz. Güvenlik nedeniyle Captcha gerekebilir.
              </p>

              <button
                type="submit"
                disabled={otpSubmitting || otpCode.length < 6}
                className="w-full rounded-lg h-[42px] font-semibold tracking-wide flex items-center justify-center"
                style={{ backgroundColor: GOLD, color: "#000", opacity: otpCode.length < 6 ? 0.5 : 1 }}
              >
                {otpSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "DOĞRULA"}
              </button>
            </form>
          )}

          {/* E-posta seçildi — bakım mesajı */}
          {otpMethod === "email" && (
            <>
              <button
                type="button"
                disabled
                className="w-full rounded-lg h-[42px] text-sm font-medium tracking-wide mb-4"
                style={{ border: `2px solid ${GOLD}33`, color: `${GOLD}40`, backgroundColor: "transparent" }}
              >
                E-POSTA KODU GÖNDER
              </button>
              <div className="rounded-lg p-4" style={{ backgroundColor: CARD_BG, border: `1px solid ${GOLD}33` }}>
                <p className="text-sm font-semibold mb-1" style={{ color: GOLD }}>Şu anda güncelleme yapılmaktadır.</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  E-posta doğrulaması geçici olarak kullanım dışıdır. Lütfen SMS kodunu seçin.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: Fullscreen Modal — siyahımsı blur arka plan */}
      <div className="lg:hidden fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-[6px]">
        {/* Header - biraz aşağıda */}
        <div className="flex items-center justify-between px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 20px) + 24px)', paddingBottom: '16px' }}>
          <div className="w-9" />
          <h2 className="font-bold text-white" style={{ fontSize: '22px' }}>Hoş Geldiniz</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6 flex flex-col items-center">


          {/* Email/Username */}
          <div className="mb-1 w-full" style={{ maxWidth: '378px' }}>
            <label className="block text-sm text-gray-300 mb-1.5">
              <span className="text-red-500">*</span>Kullanıcı adınız veya Email Adresiniz
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Lütfen Kullanıcı Adınızı veya Email Adresinizi girin"
              className="rounded border border-gray-500 bg-white px-4 text-gray-900 placeholder:text-gray-400 text-sm focus:border-[#00d4b4] focus:outline-none"
              style={{ width: '378px', height: '42px', maxWidth: '100%' }}
              disabled={isSubmitting}
            />
            {error === "Doğrulama hatası, lütfen girilen değerleri kontrol edin" && !email && (
              <p className="mt-1 text-sm" style={{ color: '#c03928' }}>Bu alanı doldurmak zorunludur.</p>
            )}
          </div>

          {/* Password */}
          <div className="mt-4 mb-1 w-full" style={{ maxWidth: '378px' }}>
            <label className="block text-sm text-gray-300 mb-1.5">
              <span className="text-red-500">*</span>Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Lütfen şifrenizi girin."
                className="rounded border border-gray-500 bg-white px-4 pr-12 text-gray-900 placeholder:text-gray-400 text-sm focus:border-[#00d4b4] focus:outline-none"
                style={{ width: '378px', height: '42px', maxWidth: '100%' }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {error === "Doğrulama hatası, lütfen girilen değerleri kontrol edin" && !password && (
              <p className="mt-1 text-sm" style={{ color: '#c03928' }}>Bu alanı doldurmak zorunludur.</p>
            )}
          </div>

          {/* Address Info */}
          <div className="mt-8 w-full" style={{ maxWidth: '378px' }}>
            <p className="text-gray-400 italic leading-relaxed" style={{ fontSize: '14px' }}>
              Güncel adresimiz <span className="font-bold text-white not-italic">www.velobet280.com</span>{"'"}dur. Bir sonraki güncellemede adresimiz <span className="font-bold text-white not-italic">www.velobet281.com</span> olacaktır. Her zaman güncel adres için internet tarayıcınıza{" "}
              <span className="text-[#00d4b4] not-italic">https://t2m.io/velobetguncel</span> yazıp giriş yapabilirsiniz.
            </p>
          </div>

          {/* Social Icons + Forgot Password */}
          <div className="mt-4 w-full" style={{ maxWidth: '378px' }}>
            <div className="flex items-center gap-3">
              {/* X/Twitter */}
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black border border-gray-700">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              {/* Telegram */}
              <a href="https://t.me/velososyal" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center hover:opacity-80 transition-opacity">
                <img src="/images/telegram.webp" alt="Telegram" className="h-11 w-11 rounded-full" />
              </a>
              {/* Instagram */}
              <a href="#" className="flex h-11 w-11 items-center justify-center hover:opacity-80 transition-opacity">
                <img src="/images/instagram.webp" alt="Instagram" className="h-11 w-11 rounded-full" />
              </a>
            </div>
            {/* Error Message - sosyal ikonlar ile şifremi unuttum arasında */}
            {error && (
              <div className="mt-3">
                <div className="flex items-center gap-3 bg-white px-5 py-3 shadow-lg" style={{ borderRadius: '2px', width: '378px', maxWidth: '100%' }}>
                  <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: '22px', height: '22px', backgroundColor: '#c23c21' }}>
                    <span className="text-white font-bold" style={{ fontSize: '12px' }}>!</span>
                  </div>
                  <span className="text-gray-800 text-sm">
                    {typeof error === 'string' ? error : error.message || 'Bir hata oluştu'}
                  </span>
                </div>
              </div>
            )}
            {/* Forgot Password - altında sol hizalı */}
            <button
              type="button"
              onClick={() => setView("forgot")}
              className="mt-3 text-[#00d4b4] hover:text-[#00d4b4] text-sm font-medium"
            >
              Şifremi Unuttum
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3 flex flex-col items-center w-full" style={{ maxWidth: '378px' }}>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="rounded bg-[#00d4b4] text-black hover:bg-[#00b89c] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ width: '378px', height: '42px', maxWidth: '100%', fontWeight: 400, fontSize: '14px' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center h-5 w-16">
                  <div className="login-dot-loader" />
                </div>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>
            <Link
              href="/register"
              onClick={onClose}
              className="rounded text-center hover:bg-white/5 transition-colors flex items-center justify-center"
              style={{ width: '378px', height: '42px', maxWidth: '100%', fontWeight: 400, fontSize: '14px', color: '#cacaca', border: '0.1rem solid #cacaca' }}
            >
              Şimdi Kayıt Olun
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop: Centered Modal */}
      <div className="hidden lg:fixed lg:inset-0 lg:z-50 lg:flex lg:items-center lg:justify-center lg:bg-black/50 lg:animate-in lg:fade-in lg:duration-200">
        {/* Tüm modal: 364x626px */}
        <div className="shadow-2xl overflow-hidden" style={{ width: "364px", height: "626px", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>

          {/* Header — siyah, 364x90 */}
          <div
            className="relative flex items-center justify-center flex-shrink-0 px-6"
            style={{ backgroundColor: "#000000", height: "90px" }}
          >
            <div className="text-center">
              <h2 className="font-bold text-white" style={{ fontSize: "22px" }}>Hoş Geldiniz</h2>
              <p className="text-gray-300 mt-1" style={{ fontSize: "14px" }}>
                Henüz hesabınız yok mu?{" "}
                <Link href="/register" onClick={onClose} className="text-[#00d4b4] hover:text-[#00b89c] font-semibold">
                  Şimdi Kayıt Olun
                </Link>
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Body — kalan 536px */}
          <form onSubmit={handleSubmit} style={{ padding: "36px 26px 22px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              {/* Error Message */}
              {error && (
                <div className="mb-4 flex items-center gap-3 bg-white px-4 py-2.5 shadow" style={{ borderRadius: "2px" }}>
                  <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: "22px", height: "22px", backgroundColor: "#c23c21" }}>
                    <span className="text-white font-bold" style={{ fontSize: "12px" }}>!</span>
                  </div>
                  <span className="text-gray-800 text-sm">
                    {typeof error === "string" ? error : "Bir hata oluştu"}
                  </span>
                </div>
              )}

              {/* Email/Username */}
              <div className="mb-4">
                <label className="block font-medium text-gray-900 mb-2" style={{ fontSize: "16px" }}>
                  <span className="text-red-500">*</span>Kullanıcı adınız veya Email Adresiniz
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Kullanıcı Adı veya Email"
                  className="border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                  style={{ width: "312px", height: "42px", borderRadius: "4px", fontSize: "14px" }}
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block font-medium text-gray-900 mb-2" style={{ fontSize: "16px" }}>
                  <span className="text-red-500">*</span>Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    className="border border-gray-300 bg-white px-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                    style={{ width: "312px", height: "42px", borderRadius: "4px", fontSize: "14px" }}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Address Info */}
              <p className="italic leading-relaxed mb-4 text-gray-600" style={{ fontSize: "14px", width: "312px" }}>
                Güncel adresimiz{" "}
                <span className="font-extrabold not-italic text-gray-800">www.velobet280.com</span>
                {"'"}dur. Bir sonraki güncellemede adresimiz{" "}
                <span className="font-extrabold not-italic text-gray-800">www.velobet281.com</span>{" "}
                olacaktır. Her zaman güncel adres için internet tarayıcınıza{" "}
                <span className="text-[#00d4b4] not-italic font-medium">https://t2m.io/velobetguncel</span>{" "}
                yazıp giriş yapabilirsiniz.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 mb-4">
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 hover:bg-gray-800 transition-colors">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <a href="https://t.me/velososyal" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center hover:opacity-80 transition-opacity">
                  <img src="/images/telegram.webp" alt="Telegram" className="h-10 w-10 rounded-full" />
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center hover:opacity-80 transition-opacity">
                  <img src="/images/instagram.webp" alt="Instagram" className="h-10 w-10 rounded-full" />
                </a>
              </div>
            </div>

            {/* Bottom: button + forgot */}
            <div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#00d4b4] text-black hover:bg-[#00b89c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ width: "312px", height: "42px", borderRadius: "4px", fontWeight: 500, fontSize: "16px" }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center h-5 w-16">
                    <div className="login-dot-loader" />
                  </div>
                ) : (
                  <span>Giriş Yap</span>
                )}
              </button>

              {/* Forgot Password */}
              <div className="mt-3 flex justify-center" style={{ width: "312px" }}>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-[#00d4b4] hover:text-[#00b89c] font-medium"
                  style={{ fontSize: "13px" }}
                >
                  Şifremi Unuttum
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
