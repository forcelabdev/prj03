"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import { authService } from "@/lib/services/auth-service"
import Link from "next/link"
import { Header } from "@/components/header"
import { DesktopHeader } from "@/components/desktop-header"
import ReCAPTCHA from "react-google-recaptcha"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const userId = searchParams.get("userId") || ""
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const isValidLink = !!(userId && token)

  useEffect(() => {
    if (!isValidLink) {
      setError("Geçersiz veya eksik sıfırlama bağlantısı. Lütfen tekrar şifre sıfırlama isteği gönderin.")
    }
  }, [isValidLink])

  const validatePassword = (pw: string) => {
    if (pw.length < 8) return "Şifre en az 8 karakter olmalıdır."
    if (!/[A-Z]/.test(pw)) return "Şifre en az 1 büyük harf içermelidir."
    if (!/[0-9]/.test(pw)) return "Şifre en az 1 rakam içermelidir."
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const pwError = validatePassword(password)
    if (pwError) { setError(pwError); return }
    if (password !== passwordConfirm) { setError("Şifreler eşleşmiyor."); return }
    if (!isValidLink) { setError("Geçersiz sıfırlama bağlantısı."); return }
    if (!captchaToken) { setError("Lütfen robot olmadığınızı doğrulayın."); return }

    setIsSubmitting(true)
    try {
      const result = await authService.resetPassword(userId, token, password, captchaToken)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => router.push("/"), 3000)
      } else {
        setError(result.error || "Şifre sıfırlanamadı. Token süresi dolmuş olabilir.")
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      {/* Mobil Header */}
      <div className="md:hidden">
        <Header />
      </div>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>

      <div className="flex-1 flex items-start justify-center px-5 py-10">
        <div className="w-full" style={{ maxWidth: "500px" }}>
          {success ? (
            <div className="flex flex-col items-center gap-4 text-center py-16">
              <CheckCircle className="h-16 w-16 text-[#00d4b4]" />
              <h2 className="font-bold text-gray-800" style={{ fontSize: "20px" }}>Şifreniz Güncellendi!</h2>
              <p className="text-gray-600" style={{ fontSize: "14px" }}>
                Şifreniz başarıyla sıfırlandı. Ana sayfaya yönlendiriliyorsunuz...
              </p>
              <Link
                href="/"
                className="mt-2 flex items-center justify-center text-black transition-colors"
                style={{ background: "#00d4b4", width: "100%", height: "48px", borderRadius: "4px", fontWeight: 500, fontSize: "16px" }}
              >
                Ana Sayfaya Git
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="mb-2">
                <h1 className="font-bold text-gray-900" style={{ fontSize: "26px", letterSpacing: "0.5px" }}>
                  ŞİFRE YENİLEME
                </h1>
                <p className="text-gray-600 mt-1" style={{ fontSize: "14px" }}>
                  Buradan şifrenizi değiştirebilirsiniz.
                </p>
              </div>

              {!isValidLink && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 p-3 rounded text-sm">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Geçersiz veya eksik sıfırlama bağlantısı. Lütfen tekrar şifre sıfırlama isteği gönderin.</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-gray-800 mb-2" style={{ fontSize: "14px" }}>
                  <span className="text-red-500">*</span>Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-4 pr-12 text-gray-900 focus:outline-none focus:border-[#00d4b4]"
                    style={{ height: "56px", fontSize: "15px" }}
                    disabled={!isValidLink}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-800 mb-2" style={{ fontSize: "14px" }}>
                  <span className="text-red-500">*</span>Şifrenizi tekrar girin
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full border border-gray-300 bg-white px-4 pr-12 text-gray-900 focus:outline-none focus:border-[#00d4b4]"
                    style={{ height: "56px", fontSize: "15px" }}
                    disabled={!isValidLink}
                    required
                  />
                  <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" tabIndex={-1}>
                    {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password && passwordConfirm && password !== passwordConfirm && (
                  <p className="mt-1 text-sm text-red-500">Şifreler eşleşmiyor.</p>
                )}
              </div>

              {/* reCAPTCHA */}
              {isValidLink && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={(t) => setCaptchaToken(t)}
                    onExpired={() => setCaptchaToken(null)}
                    hl="tr"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 p-3 rounded text-sm">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isValidLink || !captchaToken}
                className="flex items-center justify-center text-black transition-colors disabled:opacity-50 mt-2"
                style={{ background: "#00d4b4", width: "100%", height: "52px", borderRadius: "4px", fontWeight: 500, fontSize: "16px" }}
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yeni Şifrenizi Kaydedin"}
              </button>

              <p className="text-center text-gray-500 mt-1" style={{ fontSize: "13px" }}>
                <Link href="/" className="text-[#00d4b4] hover:text-[#00b89c] font-medium">
                  Ana Sayfaya Dön
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d4b4]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
