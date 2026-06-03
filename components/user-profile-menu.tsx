"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Bell, ChevronLeft, ChevronRight, Trash2, MoreHorizontal, Shield, Smartphone } from "lucide-react"
import { useLeaderboard } from "@/hooks/use-leaderboard"
import { useNotifications } from "@/hooks/use-notifications"

type ViewType = "main" | "notifications" | "phone-update" | "phone-update-sms" | "phone-update-email" | "security"

export function UserProfileMenu({ onClose }: { onClose: () => void }) {
  const { user, logout, refreshUser } = useAuth()
  const isMfaEnabled = !!(user?.mfa?.enabled || user?.mfaEnabled || user?.twoFactorEnabled)
  const [securityEnabled, setSecurityEnabled] = useState(isMfaEnabled)
  const [currentView, setCurrentView] = useState<ViewType>("main")

  // SMS OTP state
  const [otpSent, setOtpSent] = useState(false)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""])
  const [smsSending, setSmsSending] = useState(false)
  const [smsError, setSmsError] = useState("")
  const [activating, setActivating] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [showDisableWarning, setShowDisableWarning] = useState(false)
  const otpRefsArray = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  // Phone update state
  const [newPhone, setNewPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [phoneSuccess, setPhoneSuccess] = useState("")
  const [phoneUpdating, setPhoneUpdating] = useState(false)
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneSmsSending, setPhoneSmsSending] = useState(false)
  const [phoneChallengeId, setPhoneChallengeId] = useState<string | null>(null)
  const [phoneOtpCode, setPhoneOtpCode] = useState(["", "", "", "", "", ""])
  const [phoneCooldown, setPhoneCooldown] = useState(0)
  const phoneOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  // Kullanıcı değiştiğinde MFA durumunu senkronize et
  useEffect(() => {
    setSecurityEnabled(!!(user?.mfa?.enabled || user?.mfaEnabled || user?.twoFactorEnabled))
  }, [user])

  // Cooldown timer (MFA)
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const t = setInterval(() => setCooldownSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldownSeconds])

  // Cooldown timer (Phone update)
  useEffect(() => {
    if (phoneCooldown <= 0) return
    const t = setInterval(() => setPhoneCooldown(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [phoneCooldown])



  const maskedPhone = () => {
    const p = user?.phone || ""
    if (!p) return "*********"
    // Son 4 haneyi göster
    const last4 = p.slice(-4)
    const stars = "*".repeat(Math.max(0, p.length - 4))
    return stars + last4
  }

  const handleSendSms = async () => {
    if (cooldownSeconds > 0) return
    setSmsSending(true)
    setSmsError("")
    try {
      const { apiClient } = await import("@/lib/api-client")
      let apiRes: any
      if (!challengeId) {
        // user objesinden gerçek MFA durumunu al — UI state'e güvenme
        const realMfaEnabled = !!(user as any)?.mfaEnabled || !!(user as any)?.mfa?.enabled || !!(user as any)?.twoFactorEnabled
        const purpose = realMfaEnabled ? "disable" : "enable"
        const phone = user?.phone || ""
        apiRes = await apiClient.post("/users/mfa/send-otp", { purpose, phone }, true)
      } else {
        // Tekrar gönder — /users/mfa/resend-otp
        apiRes = await apiClient.post("/users/mfa/resend-otp", { challengeId }, true)
      }
      const res = (apiRes?.data && typeof apiRes.data === "object" && apiRes.data !== null) ? apiRes.data : apiRes
      const newChallengeId = res?.challengeId
      if (newChallengeId) {
        setChallengeId(newChallengeId)
        setOtpSent(true)
        setCooldownSeconds(res?.cooldownRemainingSeconds || 60)
      } else if (res?.code === "OTP_RESEND_COOLDOWN") {
        setCooldownSeconds(res?.metadata?.cooldownRemainingSeconds || 60)
        setSmsError(`Lütfen ${res?.metadata?.cooldownRemainingSeconds || 60} saniye bekleyin.`)
      } else {
        setSmsError(res?.message || apiRes?.error || "SMS gönderilemedi, tekrar deneyin.")
      }
    } catch {
      setSmsError("SMS gönderilemedi, tekrar deneyin.")
    } finally {
      setSmsSending(false)
    }
  }

  const handleOtpInput = (index: number, value: string, refs: (HTMLInputElement | null)[]) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...otpCode]
    newCode[index] = value.slice(-1)
    setOtpCode(newCode)
    if (value && index < 5) refs[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent, refs: (HTMLInputElement | null)[]) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) refs[index - 1]?.focus()
  }

  const isOtpComplete = otpCode.every(d => d !== "")

  const handleActivate = async () => {
    if (!isOtpComplete || !challengeId) return
    setActivating(true)
    setSmsError("")
    try {
      const { apiClient } = await import("@/lib/api-client")
      const apiRes = await apiClient.post("/users/mfa/validate-otp", {
        challengeId,
        code: otpCode.join(""),
      }, true)
      const res = apiRes?.data ?? apiRes
      if (apiRes?.success || res?.success) {
        await refreshUser()
        setSecurityEnabled(true)
        setCurrentView("main")
      } else {
        const errCode = res?.code
        const resetCodes = ["OTP_CHALLENGE_EXPIRED", "OTP_CHALLENGE_INACTIVE", "OTP_CHALLENGE_NOT_FOUND", "OTP_ATTEMPTS_EXCEEDED"]
        if (resetCodes.includes(errCode)) {
          // Challenge geçersiz — sıfırla, kullanıcı yeni kod istesin
          setChallengeId(null)
          setOtpSent(false)
          setOtpCode(["", "", "", "", "", ""])
          setCooldownSeconds(0)
        }
        const msgs: Record<string, string> = {
          OTP_INVALID_CODE: "Girdiğiniz kod hatalı.",
          OTP_CHALLENGE_EXPIRED: "Kodun süresi doldu. Yeni kod isteyin.",
          OTP_CHALLENGE_INACTIVE: "Oturum artık aktif değil. Yeni kod isteyin.",
          OTP_ATTEMPTS_EXCEEDED: "Çok fazla yanlış deneme. Yeni kod isteyin.",
          OTP_CHALLENGE_NOT_FOUND: "Oturum bulunamadı. Yeni kod isteyin.",
        }
        setSmsError(msgs[errCode] || res?.message || apiRes?.error || "Kod hatalı, tekrar deneyin.")
      }
    } catch {
      setSmsError("Aktivasyon başarısız, tekrar deneyin.")
    } finally {
      setActivating(false)
    }
  }
  // ─── Phone Update Handlers (2 adım: SMS gönder ��� doğrula → güncelle) ────
  const handlePhoneSendOtp = async () => {
    const digits = newPhone.trim()
    if (!digits || digits.length < 10) { setPhoneError("Lütfen geçerli bir telefon numarası girin (10 hane)."); return }
    const phone = `+90${digits}`
    setPhoneSmsSending(true)
    setPhoneError("")
    try {
      const { apiClient } = await import("@/lib/api-client")
      let apiRes: any
      if (phoneChallengeId) {
        // Zaten challenge var — tekrar gönder
        apiRes = await apiClient.post("/users/mfa/resend-otp", { challengeId: phoneChallengeId }, true)
      } else {
        // MFA durumuna göre purpose belirle: önce "disable" dene, hata alırsa "enable" dene
        apiRes = await apiClient.post("/users/mfa/send-otp", { purpose: "disable", phone }, true)
        const firstRes = (apiRes?.data && typeof apiRes.data === "object") ? apiRes.data : apiRes
        if (!firstRes?.challengeId && (firstRes?.message?.includes("not enabled") || firstRes?.code?.includes("NOT_ENABLED") || apiRes?.error?.includes("not enabled"))) {
          apiRes = await apiClient.post("/users/mfa/send-otp", { purpose: "enable", phone }, true)
        }
      }
      const res = (apiRes?.data && typeof apiRes.data === "object") ? apiRes.data : apiRes
      const cid = res?.challengeId
      if (cid) {
        setPhoneChallengeId(cid)
        setPhoneOtpSent(true)
        setPhoneCooldown(res?.cooldownRemainingSeconds || 60)
        setPhoneOtpCode(["", "", "", "", "", ""])
      } else if (res?.code === "OTP_RESEND_COOLDOWN") {
        setPhoneCooldown(res?.metadata?.cooldownRemainingSeconds || 60)
        setPhoneError(`Lütfen ${res?.metadata?.cooldownRemainingSeconds || 60} saniye bekleyin.`)
      } else {
        setPhoneError(res?.message || apiRes?.error || "SMS gönderilemedi, tekrar deneyin.")
      }
    } catch {
      setPhoneError("SMS gönderilemedi, tekrar deneyin.")
    } finally {
      setPhoneSmsSending(false)
    }
  }

  const handlePhoneVerifyAndUpdate = async () => {
    const code = phoneOtpCode.join("")
    if (code.length < 6 || !phoneChallengeId || !user?.id) return
    setPhoneUpdating(true)
    setPhoneError("")
    try {
      const { apiClient } = await import("@/lib/api-client")
      // Önce OTP doğrula
      const verifyRes = await apiClient.post("/users/mfa/validate-otp", { challengeId: phoneChallengeId, code }, true)
      const vd = verifyRes?.data ?? verifyRes
      if (!verifyRes?.success && !vd?.success) {
        const errCode = vd?.code
        const resetCodes = ["OTP_CHALLENGE_EXPIRED", "OTP_CHALLENGE_INACTIVE", "OTP_CHALLENGE_NOT_FOUND", "OTP_ATTEMPTS_EXCEEDED"]
        if (resetCodes.includes(errCode)) {
          setPhoneChallengeId(null); setPhoneOtpSent(false); setPhoneOtpCode(["", "", "", "", "", ""]); setPhoneCooldown(0)
        }
        const msgs: Record<string, string> = {
          OTP_INVALID_CODE: "Girdiğiniz kod hatalı.",
          OTP_CHALLENGE_EXPIRED: "Kodun süresi doldu. Yeni kod isteyin.",
          OTP_CHALLENGE_INACTIVE: "Oturum artık aktif değil. Yeni kod isteyin.",
          OTP_ATTEMPTS_EXCEEDED: "Çok fazla yanlış deneme. Yeni kod isteyin.",
          OTP_CHALLENGE_NOT_FOUND: "Oturum bulunamadı. Yeni kod isteyin.",
        }
        setPhoneError(msgs[errCode] || vd?.message || "Kod hatalı, tekrar deneyin.")
        return
      }
      // OTP doğrulandı — telefonu güncelle
      const { default: userService } = await import("@/lib/services/user-service")
      const updateRes = await userService.updateProfile(user.id, { phone: `+90${newPhone.trim()}` })
      if (updateRes.success) {
        await refreshUser()
        setPhoneSuccess("Telefon numaranız başarıyla güncellendi.")
        setNewPhone(""); setPhoneOtpSent(false); setPhoneChallengeId(null); setPhoneOtpCode(["", "", "", "", "", ""]); setPhoneCooldown(0)
        setTimeout(() => { setPhoneSuccess(""); setCurrentView("main") }, 2000)
      } else {
        const errMsg = updateRes.error || ""
        if (errMsg.includes("duplicate key") || errMsg.includes("dup key") || errMsg.includes("E11000") || updateRes.code === "DUPLICATE_PHONE") {
          setPhoneError("Bu telefon numarası başka bir hesapta kayıtlı. Lütfen farklı bir numara girin.")
          // Numara değiştirebilmesi için OTP adımını sıfırla
          setPhoneOtpSent(false); setPhoneChallengeId(null); setPhoneOtpCode(["", "", "", "", "", ""]); setPhoneCooldown(0)
        } else {
          setPhoneError(errMsg || "Güncelleme başarısız, tekrar deneyin.")
        }
      }
    } catch (e: any) {
      const msg = e?.message || ""
      if (msg.includes("duplicate key") || msg.includes("E11000")) {
        setPhoneError("Bu telefon numarası başka bir hesapta kayıtlı. Lütfen farklı bir numara girin.")
        setPhoneOtpSent(false); setPhoneChallengeId(null); setPhoneOtpCode(["", "", "", "", "", ""]); setPhoneCooldown(0)
      } else {
        setPhoneError("İşlem başarısız, tekrar deneyin.")
      }
    } finally {
      setPhoneUpdating(false)
    }
  }

  const handlePhoneOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...phoneOtpCode]; next[index] = value.slice(-1); setPhoneOtpCode(next)
    if (value && index < 5) phoneOtpRefs.current[index + 1]?.focus()
  }

  const handlePhoneOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !phoneOtpCode[index] && index > 0) phoneOtpRefs.current[index - 1]?.focus()
  }

  const { data: lbData } = useLeaderboard()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAll } = useNotifications()

  const myRank = lbData?.winners?.findIndex((w) => w.user?.username === user?.username)
  const myEntry = myRank !== undefined && myRank >= 0 ? lbData?.winners?.[myRank] : null
  const handleSecurityToggle = () => {
    if (securityEnabled) {
      // 2FA açıkken kapatmaya çalışıyor — uyarı göster
      setShowDisableWarning(true)
      setTimeout(() => setShowDisableWarning(false), 4000)
      return
    }
    // 2FA kapalıyken açmak için OTP flow'u başlat
    setCurrentView("security")
  }

  if (!user) return null

  const menuItems = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10">
          <rect fill="#fff" width="100" height="100" />
          <g>
            <path fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M69.42,28.4H54.35c-5.18,0-7.69,2.88-10.05,5S25.58,50.18,25.58,50.18" />
            <path fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M44.3,68.6l5-5c5.59,0,10.5-.44,15.08-5,1.74-1.74,6.17-6.26,6.17-6.26" />
            <rect fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x="21.95" y="46.63" width="15.57" height="38.92" transform="translate(-38.02 40.38) rotate(-45)" />
            <line fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21.48" y1="56.74" x2="25.15" y2="60.41" />
            <polyline fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="81.15 60.23 81.15 65.25 89.53 65.25 89.53 15 81.15 15 81.15 20.02" />
            <path fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M52.67,38.45H71.1c3.52,0,5,1,5,3.35,0,4.19-4.34,6.7-8.37,6.7H63.19a3.38,3.38,0,0,0-3,1.8,12.4,12.4,0,0,1-10.91,6.58H46" />
            <path fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M64.49,38.45a15.07,15.07,0,0,1,25-9.56" />
            <path fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M89.53,51.36A15.08,15.08,0,0,1,66.94,48.5" />
          </g>
        </svg>
      ),
      label: "PARA YATIR",
      href: "/deposit",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10">
          <rect fill="#fff" width="100" height="100" />
          <g>
            <polygon fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="45.67 71.1 11 71.1 36.55 32 71.22 32 45.67 71.1" />
            <polyline fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="74.86 39.45 49.32 78.55 12.82 78.55" />
            <polyline fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="78.51 46.9 52.97 86 18.3 86" />
            <path fill="none" stroke="#234209" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M80.93,39.38a12.71,12.71,0,0,0-4.65-24.55H23.72a12.71,12.71,0,0,0-4.25,24.7" />
            <path fill="#234209" d="M35.75,48.3,50.6,43.2l-1.91,3-14.92,5.1Zm-3.32,5.1,15-5.1-1.91,3.05-15,5.1ZM43.81,39.45H47L31.66,63.38H28.37ZM30.91,60.18h6.8a7.92,7.92,0,0,0,3.75-.83,6.73,6.73,0,0,0,2.63-2.49L45.86,54h3.23l-1.75,2.85a13.75,13.75,0,0,1-4.9,4.9,13.34,13.34,0,0,1-6.65,1.62H28.85Z" />
          </g>
        </svg>
      ),
      label: "PARA ÇEK",
      href: "/withdraw",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10">
          <rect fill="#fff" width="100" height="100" />
          <g>
            <path fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" d="M50,37.5s1-13.89,7.73-19.77A10.16,10.16,0,0,1,72,18.22c3.44,3.75,2.8,9.08-1.83,13.09C63.4,37.19,50,37.5,50,37.5Z" />
            <path fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" d="M50,37.5s-.35-12-6.29-16.8a9.38,9.38,0,0,0-12.52.39c-3,3.06-2.46,7.41,1.6,10.7C38.73,36.59,45.72,37.38,50,37.5Z" />
            <polyline fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" points="55.18 85.86 84.55 85.86 84.55 51.32" />
            <polyline fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" points="15.46 51.32 15.46 85.86 44.82 85.86" />
            <polyline fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" points="55.18 51.32 88 51.32 88 37.5 12 37.5 12 51.32 44.82 51.32" />
            <rect fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" x="44.82" y="37.5" width="10.36" height="48.36" />
          </g>
        </svg>
      ),
      label: "AKTİF BONUSLAR",
      href: "/active-bonuses",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10">
          <rect fill="#fff" width="100" height="100" />
          <g>
            <path fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" d="M33.82,82.91h3.09c2.63,0,2.5,3.09,6.19,3.09H55.46c1.81,0,4.21-1.06,4.64-3.09l1.14-10.77A4.17,4.17,0,0,0,57,67.45H53.92" />
            <path fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" d="M44.08,78c3.89-1.45,6.75-5.14,6.75-9V65.49a23,23,0,0,0,.53-4.38,6.93,6.93,0,0,0-1.77-5.17c-1.16-1.51-3.4-1.23-3.4.22v1.17c0,3.24-3,6.43-4,7.34s-2.87,2.78-5.29,2.78H33.82" />
            <rect fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" x="27.64" y="65.9" width="6.18" height="18.55" />
            <path fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" d="M50.83,30.35s-.3-5.68-3.15-8.22A3.93,3.93,0,1,0,42.46,28C45.3,30.53,50.83,30.35,50.83,30.35Z" />
            <path fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" d="M50.83,30.35s.71-5.68,3.56-8.22A3.93,3.93,0,1,1,59.61,28C56.77,30.53,50.83,30.35,50.83,30.35Z" />
            <polyline fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" points="38.46 38.08 38.46 50.44 63.19 50.44 63.19 38.08" />
            <polyline fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" points="53.92 38.08 64.74 38.08 64.74 30.35 36.91 30.35 36.91 38.08 47.73 38.08" />
            <line fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" x1="53.92" y1="30.35" x2="53.92" y2="50.44" />
            <line fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" x1="47.73" y1="50.44" x2="47.73" y2="30.35" />
            <path fill="none" stroke="#234209" strokeMiterlimit="10" strokeWidth="2" d="M40,59.72H26.09A3.09,3.09,0,0,1,23,56.62V18a3.09,3.09,0,0,1,3.09-3.09H75.56A3.09,3.09,0,0,1,78.65,18V56.62a3.09,3.09,0,0,1-3.09,3.1H70.92V65.9a1.55,1.55,0,0,1-2.78.93l-6.49-7.11H55.46" />
          </g>
        </svg>
      ),
      label: "GEÇMİŞ BONUSLARIM",
      href: "/past-bonuses",
    },
    {
      icon: (
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sporgecmisim-ncc2u20DUBBw4g0gC4LOHTVLK9mzVk.png"
          alt="Spor Geçmişim"
          className="w-10 h-10 object-contain"
        />
      ),
      label: "SPOR GEÇMİŞİM",
      href: "/sport-history",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10">
          <rect fill="#fff" width="100" height="100" />
          <g>
            <path fill="#2a421c" d="M38.37,87V85.75h46a.79.79,0,0,0,.78-.79V48.09H37.58V85a.8.8,0,0,0,.79.79V87a2,2,0,0,1-2-2V47.47a.62.62,0,0,1,.63-.63H85.8a.67.67,0,0,1,.44.18.64.64,0,0,1,.19.45V85a2,2,0,0,1-2,2Z" />
            <path fill="#2a421c" d="M71.18,39.54V34A3.43,3.43,0,1,1,78,34v5.57a3.43,3.43,0,1,1-6.83,0ZM72.44,34v5.57a2.18,2.18,0,1,0,4.31,0V34a2.18,2.18,0,1,0-4.31,0Z" />
            <path fill="#2a421c" d="M44.75,39.54V34a3.42,3.42,0,1,1,6.82,0v5.57a3.42,3.42,0,1,1-6.82,0Zm1.25,0a2.18,2.18,0,1,0,4.32,0V34A2.18,2.18,0,1,0,46,34Z" />
            <path fill="#2a421c" d="M54,60.57a1.46,1.46,0,0,1-1.44-1.44V54.57A1.44,1.44,0,0,1,54,53.14h4.56A1.43,1.43,0,0,1,60,54.57v4.56a1.44,1.44,0,0,1-1.43,1.44Zm-.18-6v4.56a.19.19,0,0,0,.18.18h4.56a.19.19,0,0,0,.18-.18V54.57a.19.19,0,0,0-.18-.18H54A.19.19,0,0,0,53.8,54.57Z" />
            <path fill="#2a421c" d="M64.22,60.57a1.45,1.45,0,0,1-1.44-1.44V54.57a1.43,1.43,0,0,1,1.44-1.43h4.55a1.43,1.43,0,0,1,1.44,1.43v4.56a1.45,1.45,0,0,1-1.44,1.44Zm-.18-6v4.56a.18.18,0,0,0,.18.18h4.55a.19.19,0,0,0,.19-.18V54.57a.2.2,0,0,0-.19-.18H64.22A.19.19,0,0,0,64,54.57Z" />
            <path fill="#2a421c" d="M74.45,60.57A1.46,1.46,0,0,1,73,59.13V54.57a1.44,1.44,0,0,1,1.44-1.43H79a1.44,1.44,0,0,1,1.44,1.43v4.56A1.46,1.46,0,0,1,79,60.57Zm-.18-6v4.56a.18.18,0,0,0,.18.18H79a.18.18,0,0,0,.18-.18V54.57a.19.19,0,0,0-.18-.18H74.45A.19.19,0,0,0,74.27,54.57Z" />
            <path fill="#2a421c" d="M54,70.41A1.45,1.45,0,0,1,52.54,69V64.41A1.44,1.44,0,0,1,54,63h4.56A1.44,1.44,0,0,1,60,64.41V69a1.45,1.45,0,0,1-1.44,1.44Zm-.18-6V69a.18.18,0,0,0,.18.18h4.56a.19.19,0,0,0,.18-.18V64.41a.19.19,0,0,0-.18-.18H54A.19.19,0,0,0,53.8,64.41Z" />
            <path fill="#2a421c" d="M74.45,70.41A1.45,1.45,0,0,1,73,69V64.42A1.45,1.45,0,0,1,74.45,63H79a1.45,1.45,0,0,1,1.44,1.44V69A1.45,1.45,0,0,1,79,70.41Zm-.18-6V69a.18.18,0,0,0,.18.18H79a.18.18,0,0,0,.18-.18V64.42a.19.19,0,0,0-.18-.19H74.45A.19.19,0,0,0,74.27,64.42Z" />
            <path fill="#2a421c" d="M64.22,70.41A1.44,1.44,0,0,1,62.78,69V64.41A1.43,1.43,0,0,1,64.22,63h4.55a1.43,1.43,0,0,1,1.44,1.43V69a1.44,1.44,0,0,1-1.44,1.44Zm-.18-6V69a.18.18,0,0,0,.18.18h4.55A.19.19,0,0,0,69,69V64.41a.2.2,0,0,0-.19-.18H64.22A.19.19,0,0,0,64,64.41Z" />
            <path fill="#2a421c" d="M43.75,70.41A1.43,1.43,0,0,1,42.31,69V64.41A1.43,1.43,0,0,1,43.75,63H48.3a1.43,1.43,0,0,1,1.44,1.43V69a1.43,1.43,0,0,1-1.44,1.44Zm-.19-6V69a.19.19,0,0,0,.19.18H48.3a.19.19,0,0,0,.19-.18V64.41a.2.2,0,0,0-.19-.18H43.75A.2.2,0,0,0,43.56,64.41Z" />
            <path fill="#2a421c" d="M43.75,80.25a1.43,1.43,0,0,1-1.44-1.44V74.26a1.43,1.43,0,0,1,1.44-1.44H48.3a1.43,1.43,0,0,1,1.44,1.44v4.55a1.43,1.43,0,0,1-1.44,1.44Zm-.19-6v4.55a.2.2,0,0,0,.19.19H48.3a.2.2,0,0,0,.19-.19V74.26a.2.2,0,0,0-.19-.19H43.75A.2.2,0,0,0,43.56,74.26Z" />
            <path fill="#2a421c" d="M84.39,36.13h-7a.63.63,0,1,0,0,1.25h7a.78.78,0,0,1,.78.78v8.68H37.58V44H36.33v3.46a.67.67,0,0,0,.18.44.64.64,0,0,0,.45.19H85.8a.61.61,0,0,0,.44-.19.6.6,0,0,0,.18-.44V38.16A2,2,0,0,0,84.39,36.13Z" />
            <rect fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="1.5" x="27.12" y="17.26" width="17.16" height="22.39" rx="0.75" transform="translate(57.14 68.75) rotate(-156.56)" />
            <path fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="1.5" d="M20.92,22.09l-7,1.74a.75.75,0,0,0-.51.93l5.68,20.1a.75.75,0,0,0,.92.52l16.13-4.29" />
            <path fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="1.5" d="M30.73,17.08l-8.95-.2a.75.75,0,0,0-.76.73L20.55,38.5a.74.74,0,0,0,.73.77l11.93.27" />
            <path fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="1.5" d="M35.33,34a8.75,8.75,0,0,0-1.58-1,8.88,8.88,0,0,0-1.84-.44" />
            <path fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="1.5" d="M34.75,30.64a3.14,3.14,0,0,1-2.64-.84,2.31,2.31,0,0,1-.35-2.59c.82-1.87,4.74-1.74,5.72-2.87-.15,1.49,2.63,4.26,1.81,6.14A2.27,2.27,0,0,1,37.17,32,3.11,3.11,0,0,1,34.75,30.64Z" />
          </g>
        </svg>
      ),
      label: "OYUN GEÇMİŞİM",
      href: "/game-history",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10">
          <rect fill="#fff" width="100" height="100" />
          <g>
            <polyline fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" points="41.74 22.72 75.7 22.72 75.7 86 26.3 86 26.3 22.72 38.65 22.72" />
            <path fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" d="M46.37,32H66.43A1.54,1.54,0,0,1,68,33.52V55.13a1.54,1.54,0,0,1-1.55,1.54H35.57A1.54,1.54,0,0,1,34,55.13V39.7" />
            <line fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" x1="35.57" y1="70.57" x2="66.43" y2="70.57" />
            <line fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" x1="35.57" y1="64.39" x2="66.43" y2="64.39" />
            <line fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" x1="35.57" y1="76.74" x2="51" y2="76.74" />
            <path fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" d="M44.83,53.59a6.17,6.17,0,1,1,12.34,0" />
            <circle fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" cx="51" cy="42.78" r="4.63" />
            <path fill="none" stroke="#2a421c" strokeLinejoin="round" strokeWidth="2" d="M34,27.35V32a3.09,3.09,0,0,0,3.09,3.09h1.54A3.09,3.09,0,0,0,41.74,32V18.09A3.09,3.09,0,0,0,38.65,15H35.57a3.09,3.09,0,0,0-3.09,3.09v4.63" />
          </g>
        </svg>
      ),
      label: "HESAP ÖZETİM",
      href: "/account-summary",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10">
          <rect fill="#fff" width="100" height="100" />
          <g>
            <polyline fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" points="85.95 63.14 85.95 84 12 84 12 15.74 85.95 15.74 85.95 40.39" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="12" y1="27.12" x2="85.95" y2="27.12" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="17.69" y1="21.43" x2="21.48" y2="21.43" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="23.38" y1="21.43" x2="27.17" y2="21.43" />
            <rect fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x="19.58" y="34.7" width="20.86" height="22.75" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="17.69" y1="66.93" x2="42.34" y2="66.93" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="17.69" y1="74.52" x2="42.34" y2="74.52" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="48.03" y1="74.52" x2="68.88" y2="74.52" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="48.03" y1="66.93" x2="68.88" y2="66.93" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="48.03" y1="36.6" x2="68.88" y2="36.6" />
            <line fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" x1="48.03" y1="44.18" x2="61.3" y2="44.18" />
            <polyline fill="none" stroke="#2a421c" strokeMiterlimit="10" strokeWidth="3" points="66.99 49.87 78.36 61.25 99.22 34.7" />
          </g>
        </svg>
      ),
      label: "BAHİS KURALLARI",
      href: "/terms",
    },
  ]



  // ─── Phone Update View ───────────────────────────────────────────────────
  if (currentView === "phone-update-email") {
    return (
      <div className="absolute left-0 right-0 z-40 bg-white shadow-xl overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4" style={{ height: "80px" }}>
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-12 h-12 rounded-xl border-2 border-[#00d4b4] flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" stroke="currentColor" strokeWidth="1.2" className="text-[#00d4b4]" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
            </div>
            <span className="text-xs text-gray-900 font-bold leading-none">Mesajlar</span>
          </div>
          <p className="flex-1 px-4 text-gray-900" style={{ fontSize: "22px", fontWeight: 500 }}>{user?.username}</p>
          <button
            onClick={() => setCurrentView("phone-update")}
            className="border-2 border-gray-900 text-gray-900 font-bold text-sm px-4 py-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            GERİ
          </button>
        </div>

        {/* Koyu Banner */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ backgroundColor: "#2a292a" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 112.5" className="w-10 h-10 flex-shrink-0">
            <path fill="#00d4b4" d="M43.4 8H17.6c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6H37V62.6H18.7c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v18.9c.9-.3 1.9-.4 2.9-.4h2V14c0-3.3-2.7-6-6-6zM30.5 65.9c1.5 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6-1.5 0-2.6-1.2-2.6-2.6 0-1.4 1.2-2.6 2.6-2.6z"/>
            <path fill="#00d4b4" d="M73.2 38.3H47.4c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6h25.8c3.3 0 6-2.7 6-6V44.3c0-3.3-2.6-6-6-6zm-12.8 63.1c-1.5 0-2.6-1.2-2.6-2.6 0-1.5 1.2-2.6 2.6-2.6 1.4 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6zm14-10.7c0 1.2-1 2.2-2.2 2.2H48.5c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v45zM74.2 19.6C68.1 8 54 5.9 54 5.9c7.3 5.8 9.3 14.5 9.8 17.5l-4.6 1.7L73 31.4l6.3-13.8-5.1 2zM37.3 106.6c-7.5-5.5-9.9-14.1-10.5-17.1l4.6-1.9-14-5.7-5.7 14 4.9-2.1c6.6 11.3 20.7 12.8 20.7 12.8z"/>
          </svg>
          <p className="text-[#00d4b4] font-bold text-sm leading-snug">
            TELEFON NUMARASI DEĞİŞİKLİĞİ İÇİN AŞAĞIDAKİ ADIMLARI İZLEYİN
          </p>
        </div>

        {/* Form */}
        <div className="bg-white px-6 py-6 space-y-5">
          <p className="text-gray-700 font-bold" style={{ fontSize: "14px" }}>Lütfen e-posta adresinize gönderilen doğrulama kodunu giriniz</p>

          {/* Boş text input */}
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-3 text-gray-700 focus:outline-none focus:border-gray-500"
            style={{ fontSize: "14px" }}
          />

          {/* Kod isteyiniz linki */}
          <p className="text-gray-700 text-center" style={{ fontSize: "14px" }}>
            *Kod gelmediyse lütfen tekrar{" "}
            <a href="#" className="text-blue-600 underline font-medium">kod isteyiniz.</a>
          </p>

          {/* Onayla */}
          <button className="w-full py-3.5 font-bold text-white text-sm tracking-wider hover:opacity-90 transition-opacity" style={{ backgroundColor: "#1a1a1a", borderRadius: "8px" }}>
            Onayla
          </button>

          {/* SMS ile Doğrulayın */}
          <button onClick={() => setCurrentView("phone-update-sms")} className="w-full py-3.5 border-2 border-gray-900 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition-colors" style={{ borderRadius: "8px" }}>
            SMS ile Doğrulayın
          </button>
        </div>

        {/* Koyu alt alan */}
        <div className="h-16" style={{ backgroundColor: "#2a292a" }} />

        {/* Çıkış Yap */}
        <div className="py-5 bg-white flex justify-center">
          <button
            onClick={() => { logout(); onClose() }}
            className="border-2 border-gray-900 text-gray-900 font-bold px-16 py-2.5 rounded text-sm tracking-wider hover:bg-gray-100 transition-colors"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>
    )
  }

  if (currentView === "phone-update-sms") {
    return (
      <div className="absolute left-0 right-0 z-40 bg-white shadow-xl overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4" style={{ height: "80px" }}>
          <div className="flex flex-col items-center gap-1">
            <div className="relative w-12 h-12 rounded-xl border-2 border-[#00d4b4] flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" stroke="currentColor" strokeWidth="1.2" className="text-[#00d4b4]" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
            </div>
            <span className="text-xs text-gray-900 font-bold leading-none">Mesajlar</span>
          </div>
          <p className="flex-1 px-4 text-gray-900" style={{ fontSize: "22px", fontWeight: 500 }}>{user?.username}</p>
          <button
            onClick={() => setCurrentView("phone-update")}
            className="border-2 border-gray-900 text-gray-900 font-bold text-sm px-4 py-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            GERİ
          </button>
        </div>

        {/* Dark Banner */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ backgroundColor: "#2a292a" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104.9 104.9" className="w-10 h-10 flex-shrink-0" style={{ fill: "#00d4b4" }}>
            <path d="M52.5 0c-11.6 0-21 9.4-21 21v4.6c-4.1 1.4-6.9 5.3-6.9 9.7V61c0 5.6 4.6 10.2 10.2 10.2H70c5.6 0 10.2-4.6 10.2-10.2V35.3c0-4.4-2.8-8.3-6.9-9.7V21C73.4 9.4 64 0 52.5 0zm0 5.2c8.7 0 15.8 7.1 15.8 15.8v4.1H36.7V21c0-8.7 7-15.8 15.8-15.8zm22.7 44.7l-3.7 7.9 3.7 1.7v1.4c0 2.8-2.3 5-5 5H34.9c-2.8 0-5-2.3-5-5V46.4l3.7-7.9-3.7-1.7v-1.4c0-2.4 1.7-4.5 3.9-4.9h37.5c2.4.5 4.1 2.5 4.1 4.9v14.5h-.2z"/>
            <path d="M58.515 57.804l9.842-21.119 3.807 1.774-9.842 21.12zM45.638 57.746l9.847-21.117 3.806 1.775-9.847 21.117zM32.723 57.77l9.847-21.116 3.806 1.775-9.846 21.116zM14.7 104.9h75.6V75.7H14.7v29.2zm5.2-24.1h65.2v18.8H19.9V80.8z"/>
            <path d="M34.9 87.7c-1.8 0-3.2 1.5-3.2 3.2 0 1.8 1.5 3.2 3.2 3.2s3.2-1.5 3.2-3.2c-.1-1.8-1.4-3.2-3.2-3.2zM47.7 87.7c-1.8 0-3.2 1.5-3.2 3.2 0 1.8 1.5 3.2 3.2 3.2 1.8 0 3.2-1.5 3.2-3.2 0-1.8-1.4-3.2-3.2-3.2zM60.4 87.7c-1.8 0-3.2 1.5-3.2 3.2 0 1.8 1.5 3.2 3.2 3.2 1.8 0 3.2-1.5 3.2-3.2.1-1.8-1.4-3.2-3.2-3.2zM73.2 87.7c-1.8 0-3.2 1.5-3.2 3.2 0 1.8 1.5 3.2 3.2 3.2s3.2-1.5 3.2-3.2c0-1.8-1.5-3.2-3.2-3.2z"/>
          </svg>
          <p className="text-[#00d4b4] font-bold text-sm leading-snug">
            TELEFON NUMARASI DEĞİŞİKLİĞİ İÇİN AŞAĞIDAKİ ADIMLARI İZLEYİN
          </p>
        </div>

        {/* Form */}
        <div className="bg-white px-6 py-6 space-y-4">
          <p className="text-gray-700 text-sm">
            {phoneOtpSent ? "Telefonunuza gönderilen 6 haneli kodu girin." : "Devam etmek için yeni telefon numaranızı giriniz."}
          </p>

          {/* Mevcut numara */}
          <div className="flex items-center border border-gray-200 rounded px-3 py-2.5 gap-3 bg-gray-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-gray-400 flex-shrink-0">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <span className="text-gray-400 text-sm tracking-widest">{maskedPhone()} (mevcut)</span>
          </div>

          {/* Yeni numara input — SMS gönderilmeden görünür */}
          <div className={`flex items-center border rounded px-3 py-2.5 gap-2 transition-colors ${phoneOtpSent ? "border-gray-200 bg-gray-50" : "border-gray-300 focus-within:border-[#00d4b4]"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-[#00d4b4] flex-shrink-0">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <span className="text-sm font-semibold text-gray-700 select-none">+90</span>
            <div className="w-px h-4 bg-gray-300 flex-shrink-0" />
            <input
              type="tel"
              placeholder="5XXXXXXXXX"
              value={newPhone}
              onChange={e => {
                // Sadece rakam — max 10 hane
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                setNewPhone(digits)
                setPhoneError("")
                setPhoneSuccess("")
              }}
              disabled={phoneOtpSent}
              className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder-gray-400 disabled:opacity-60"
            />
            {phoneOtpSent && (
              <button onClick={() => { setPhoneOtpSent(false); setPhoneChallengeId(null); setPhoneOtpCode(["","","","","",""]); setPhoneCooldown(0); setPhoneError("") }} className="text-xs text-[#00d4b4] font-semibold underline ml-1">
                Değiştir
              </button>
            )}
          </div>

          {/* SMS Gönder butonu — henüz gönderilmediyse */}
          {!phoneOtpSent && (
            <button
              onClick={handlePhoneSendOtp}
              disabled={phoneSmsSending || !newPhone.trim()}
              className="w-full py-3 font-bold text-sm tracking-wider disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: "#1a1a1a", color: "#fff", borderRadius: "8px" }}
            >
              {phoneSmsSending ? "GÖNDERİLİYOR..." : "SMS KODU GÖNDER"}
            </button>
          )}

          {/* OTP girişi + Onayla — SMS gönderildikten sonra */}
          {phoneOtpSent && (
            <>
              <div className="flex justify-center gap-3 pt-2">
                {phoneOtpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { phoneOtpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handlePhoneOtpInput(i, e.target.value)}
                    onKeyDown={e => handlePhoneOtpKeyDown(i, e)}
                    className="w-9 text-center text-gray-900 font-bold text-lg bg-transparent border-b-2 border-gray-400 focus:border-[#00d4b4] outline-none pb-1"
                  />
                ))}
              </div>

              {/* Tekrar Gönder */}
              <button
                onClick={handlePhoneSendOtp}
                disabled={phoneCooldown > 0 || phoneSmsSending}
                className="w-full py-2.5 text-sm font-semibold disabled:opacity-40 transition-opacity"
                style={{ border: `2px solid ${phoneCooldown > 0 ? "#ccc" : "#00d4b4"}`, color: phoneCooldown > 0 ? "#aaa" : "#00d4b4", borderRadius: "8px", backgroundColor: "transparent" }}
              >
                {phoneCooldown > 0 ? `TEKRAR GÖNDER (${phoneCooldown}s)` : "TEKRAR GÖNDER"}
              </button>

              {/* Onayla */}
              <button
                onClick={handlePhoneVerifyAndUpdate}
                disabled={phoneUpdating || phoneOtpCode.join("").length < 6}
                className="w-full py-3.5 font-bold text-white text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: "#1a1a1a", borderRadius: "8px" }}
              >
                {phoneUpdating ? "ONAYLANIYOR..." : "ONAYLA"}
              </button>
            </>
          )}

          {phoneError && <p className="text-red-500 text-xs text-center">{phoneError}</p>}
          {phoneSuccess && <p className="text-[#00d4b4] text-xs text-center font-semibold">{phoneSuccess}</p>}

          {/* E-posta ile Doğrulayın */}
          <button onClick={() => setCurrentView("phone-update-email")} className="w-full py-3.5 border-2 border-gray-900 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition-colors" style={{ borderRadius: "8px" }}>
            E-posta ile Doğrulayın
          </button>
        </div>

        {/* Koyu alt alan */}
        <div className="h-16" style={{ backgroundColor: "#2a292a" }} />

        {/* Çıkış Yap */}
        <div className="py-5 bg-white flex justify-center">
          <button
            onClick={() => { logout(); onClose() }}
            className="border-2 border-gray-900 text-gray-900 font-bold px-16 py-2.5 rounded text-sm tracking-wider hover:bg-gray-100 transition-colors"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>
    )
  }

  if (currentView === "phone-update") {
    return (
      <div className="absolute left-0 right-0 z-40 bg-white shadow-xl overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4" style={{ height: "80px" }}>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl border-2 border-[#00d4b4] flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" stroke="currentColor" strokeWidth="1.2" className="text-[#00d4b4]" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
            </div>
            <p className="font-bold text-gray-900" style={{ fontSize: "22px", fontWeight: 500 }}>{user?.username}</p>
          </div>
          <button
            onClick={() => setCurrentView("main")}
            className="border-2 border-gray-900 text-gray-900 font-bold text-sm px-4 py-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            GERİ
          </button>
        </div>

        {/* Dark Banner */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ backgroundColor: "#2a292a" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 112.5" className="w-10 h-10 flex-shrink-0" style={{ fill: "#00d4b4" }}>
            <path d="M43.4 8H17.6c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6H37V62.6H18.7c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v18.9c.9-.3 1.9-.4 2.9-.4h2V14c0-3.3-2.7-6-6-6zM30.5 65.9c1.5 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6-1.5 0-2.6-1.2-2.6-2.6 0-1.4 1.2-2.6 2.6-2.6z" />
            <path d="M73.2 38.3H47.4c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6h25.8c3.3 0 6-2.7 6-6V44.3c0-3.3-2.6-6-6-6zm-12.8 63.1c-1.5 0-2.6-1.2-2.6-2.6 0-1.5 1.2-2.6 2.6-2.6 1.4 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6zm14-10.7c0 1.2-1 2.2-2.2 2.2H48.5c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v45zM74.2 19.6C68.1 8 54 5.9 54 5.9c7.3 5.8 9.3 14.5 9.8 17.5l-4.6 1.7L73 31.4l6.3-13.8-5.1 2zM37.3 106.6c-7.5-5.5-9.9-14.1-10.5-17.1l4.6-1.9-14-5.7-5.7 14 4.9-2.1c6.6 11.3 20.7 12.8 20.7 12.8z" />
          </svg>
          <p className="text-[#00d4b4] font-bold text-sm leading-snug">
            TELEFON NUMARASI DEĞİŞİKLİĞİ İÇİN AŞAĞIDAKİ ADIMLARI İZLEYİN
          </p>
        </div>

        {/* Content */}
        <div className="bg-white px-6 py-10 flex flex-col items-center gap-4">
          <p className="text-gray-700 text-sm mb-2">Doğrulama için yöntem seçiniz</p>
          <button
            onClick={() => {
              setNewPhone(""); setPhoneError(""); setPhoneSuccess("")
              setPhoneOtpSent(false); setPhoneChallengeId(null)
              setPhoneOtpCode(["","","","","",""]); setPhoneCooldown(0)
              setCurrentView("phone-update-sms")
            }}
            className="w-full border-2 border-gray-900 text-gray-900 font-semibold text-base py-3 hover:bg-gray-50 transition-colors"
            style={{ borderRadius: "8px" }}
          >
            SMS ile Doğrulayın
          </button>
          <button onClick={() => setCurrentView("phone-update-email")} className="w-full border-2 border-gray-900 text-gray-900 font-semibold text-base py-3 hover:bg-gray-50 transition-colors" style={{ borderRadius: "8px" }}>
            E-posta ile Doğrulayın
          </button>
        </div>

        {/* Spacer + Logout */}
        <div className="bg-gray-200 h-12" />
        <div className="py-4 bg-white flex justify-center">
          <button
            onClick={() => { logout(); onClose() }}
            className="rounded hover:opacity-80 transition-colors text-gray-900"
            style={{ border: "2px solid #404040", borderRadius: "8px", width: "107px", height: "43px", fontSize: "16px", fontWeight: 600 }}
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>
    )
  }

  // ─── Notifications View ────������������────────────────��─��────────────���────────�����─────
  if (currentView === "notifications") {
    return (
      <div className="absolute left-0 right-0 z-40 bg-white shadow-xl overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Sub-header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">Bildirimler</span>
            {unreadCount > 0 && (
              <span className="bg-[#00d4b4] text-black text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={markAllAsRead} className="text-gray-500 text-xs hover:text-gray-700">Hepsini Okunmuş İşaretle</button>
            <button onClick={deleteAll}><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
            <button onClick={() => setCurrentView("main")} className="text-xs text-[#00d4b4] font-semibold">
              Geri
            </button>
          </div>
        </div>

        {/* User row */}
        <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" stroke="currentColor" strokeWidth="1.2" className="text-[#00d4b4]" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
            </svg>
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
          </div>
          <div>
            <p className="font-bold text-gray-900">{user.username}</p>
          </div>
        </div>

        {/* Notification list */}
        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Bildirim bulunmuyor</p>
          ) : (
            notifications.map((n: any) => {
              const id = n._id || n.id
              const timeAgo = n.createdAt
                ? new Date(n.createdAt).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                : ""
              return (
                <div
                  key={id}
                  className={`bg-gray-50 border border-gray-200 rounded-lg p-4 border-l-4 ${n.read ? "border-l-gray-300" : "border-l-[#00d4b4]"}`}
                  onClick={() => markAsRead(id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="text-gray-900 font-semibold text-sm">{n.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{n.content || n.message}</p>
                      <p className="text-gray-400 text-xs mt-1">{timeAgo}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(id) }}>
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
          <button className="flex items-center gap-1 text-gray-400 text-sm">
            <ChevronLeft className="w-4 h-4" /> Önceki
          </button>
          <button className="flex items-center gap-1 text-gray-400 text-sm">
            Sonraki <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Logout */}
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => { logout(); onClose() }}
            className="w-full max-w-xs mx-auto block py-2.5 border border-gray-800 text-gray-800 font-semibold rounded text-sm hover:bg-gray-100 transition-colors text-center"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>
    )
  }

  // ─── Security View ────────────────────────────────────────────────────────
  if (currentView === "security") {
    return (
      <div className="absolute left-0 right-0 z-40 bg-white shadow-xl overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4" style={{ height: "80px" }}>
          <button onClick={() => setCurrentView("notifications")} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative w-12 h-12 rounded-xl border-2 border-[#00d4b4] flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" stroke="currentColor" strokeWidth="1.2" className="text-[#00d4b4]" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
              </svg>
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
            </div>
            <span className="text-xs text-gray-900 font-bold leading-none">Mesajlar</span>
          </button>
          <p className="flex-1 px-4 text-gray-900" style={{ fontSize: "22px", fontWeight: 500 }}>{user.username}</p>
          <button
            onClick={() => { setCurrentView("main"); setSecurityEnabled(false) }}
            className="border border-gray-900 text-gray-900 font-bold px-4 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
          >
            GERİ
          </button>
        </div>

        {/* Koyu Banner */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ backgroundColor: "#2a292a" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 112.5" className="w-10 h-10 flex-shrink-0">
            <path fill="#00d4b4" d="M43.4 8H17.6c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6H37V62.6H18.7c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v18.9c.9-.3 1.9-.4 2.9-.4h2V14c0-3.3-2.7-6-6-6zM30.5 65.9c1.5 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6-1.5 0-2.6-1.2-2.6-2.6 0-1.4 1.2-2.6 2.6-2.6z"/>
            <path fill="#00d4b4" d="M73.2 38.3H47.4c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6h25.8c3.3 0 6-2.7 6-6V44.3c0-3.3-2.6-6-6-6zm-12.8 63.1c-1.5 0-2.6-1.2-2.6-2.6 0-1.5 1.2-2.6 2.6-2.6 1.4 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6zm14-10.7c0 1.2-1 2.2-2.2 2.2H48.5c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v45zM74.2 19.6C68.1 8 54 5.9 54 5.9c7.3 5.8 9.3 14.5 9.8 17.5l-4.6 1.7L73 31.4l6.3-13.8-5.1 2zM37.3 106.6c-7.5-5.5-9.9-14.1-10.5-17.1l4.6-1.9-14-5.7-5.7 14 4.9-2.1c6.6 11.3 20.7 12.8 20.7 12.8z"/>
          </svg>
          <p className="text-[#00d4b4] font-bold text-sm leading-snug">
            SMS GÜVENLİĞİNİ AKTİVE ETMEK İÇİN AŞAĞIDAKİ ADIMLARI İZLEYİN
          </p>
        </div>

        {/* Form alanı */}
        <div className="px-4 py-6 space-y-4 bg-white">
          {/* Telefon - son 4 hane görünür */}
          <div className="flex items-center border border-gray-300 rounded px-3 py-3 gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-gray-400 flex-shrink-0">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <span className="text-gray-400 text-sm tracking-widest">{maskedPhone()}</span>
          </div>

          {/* SMS Kodu Gönder */}
          <button
            onClick={handleSendSms}
            disabled={smsSending || cooldownSeconds > 0}
            className="w-full py-3 font-bold text-[#00d4b4] rounded text-sm tracking-wider disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#2a292a" }}
          >
            {smsSending ? "GÖNDERİLİYOR..." : cooldownSeconds > 0 ? `TEKRAR GÖNDER (${cooldownSeconds}s)` : otpSent ? "TEKRAR GÖNDER" : "SMS KODU GÖNDER"}
          </button>

          {smsError && <p className="text-red-500 text-xs text-center">{smsError}</p>}

          {/* Kod girişi */}
          <p className="text-gray-600 text-sm">*Lütfen gelen kodu buraya giriniz</p>
          <div className="flex items-center justify-center gap-3 py-4">
            {otpCode.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={!otpSent}
                ref={el => { otpRefsArray.current[i] = el }}
                onChange={e => handleOtpInput(i, e.target.value, otpRefsArray.current)}
                onKeyDown={e => handleOtpKeyDown(i, e, otpRefsArray.current)}
                className="w-9 text-center text-gray-900 font-bold text-lg bg-transparent border-b-2 border-gray-400 focus:border-[#00d4b4] outline-none disabled:opacity-40 pb-1"
              />
            ))}
          </div>

          {/* Aktive Et */}
          <button
            onClick={handleActivate}
            disabled={!isOtpComplete || !otpSent || activating}
            className="w-full py-3 font-bold text-[#00d4b4] rounded text-sm tracking-wider disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: "#2a292a" }}
          >
            {activating ? "AKTİVE EDİLİYOR..." : "AKTİVE ET"}
          </button>
        </div>

        {/* Koyu Alt Alan */}
        <div className="py-6" style={{ backgroundColor: "#2a292a" }} />

        {/* Çıkış Yap */}
        <div className="py-5 bg-white flex justify-center">
          <button
            onClick={() => { logout(); onClose() }}
            className="border-2 border-gray-900 text-gray-900 font-bold px-16 py-2.5 rounded text-sm tracking-wider hover:bg-gray-100 transition-colors"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>
    )
  }

  // ─── Main Profile View ────────���───────────────────────────────────────────
  return (
      <div className="absolute left-0 right-0 z-40 bg-white shadow-xl overflow-y-auto max-h-[calc(100vh-60px)]">

      {/* ── User Header ── */}
      <div className="flex items-center justify-between px-4" style={{ height: "80px" }}>
        {/* Sol: Zil ikonu + Mesajlar */}
        <button
          onClick={() => setCurrentView("notifications")}
          className="flex flex-col items-center gap-1 flex-shrink-0"
        >
          <div className="relative w-12 h-12 rounded-xl border-2 border-[#00d4b4] flex items-center justify-center bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" stroke="currentColor" strokeWidth="1.2" className="text-[#00d4b4]" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
            </svg>
            {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
          </div>
          <span className="text-xs text-gray-900 font-bold leading-none">Mesajlar</span>
        </button>

        {/* Orta + Sag: Kullanici adi ve Hesap Guvenligi + Toggle */}
        <div className="flex-1 px-4">
          <p className="text-gray-900 leading-tight" style={{ fontSize: "22px", fontWeight: 500 }}>{user.username}</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-gray-900" style={{ fontSize: "14px" }}>Hesap Güvenliği</span>
            <button
              onClick={handleSecurityToggle}
              className={`h-6 rounded-full transition-colors relative flex-shrink-0 flex items-center ${securityEnabled ? "bg-[#00d4b4]" : ""}`}
              style={{ width: "75px", backgroundColor: securityEnabled ? undefined : "#a0a1a4" }}
            >
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow transition-all ${securityEnabled ? "left-[52px]" : "left-[2px]"}`}
                style={{
                  backgroundColor: "#e5e6e6",
                  border: "0.1rem solid #fff",
                  borderRight: "none",
                  borderBottom: "none",
                  borderRadius: "2rem",
                }}
              />
              <span className={`text-[10px] font-semibold select-none text-white ${securityEnabled ? "ml-1.5" : "ml-[26px]"}`}>{securityEnabled ? "AÇIK" : "KAPALI"}</span>
            </button>
          </div>
          {showDisableWarning && (
            <div
              className="mt-1.5 rounded-lg px-3 py-2 text-xs leading-snug"
              style={{ backgroundColor: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.35)", color: "#ff6b6b" }}
            >
              2FA sistemini kapatmak için <span className="font-semibold">canlı destek</span> ile iletişime geçiniz.
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-0 border-b w-full" style={{ backgroundColor: "#2a292a", borderColor: "#404040", height: "75px" }}>
        <div className="text-center flex flex-col justify-center items-center border-r" style={{ borderColor: "#404040" }}>
          <p className="text-white mb-1.5" style={{ fontSize: "14px", fontWeight: 700 }}>Bakiyeniz</p>
          <p className="text-white font-semibold" style={{ fontSize: "18px" }}>{(user.balance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
        </div>
        <div className="text-center flex flex-col justify-center items-center border-r" style={{ borderColor: "#404040" }}>
          <p className="text-white mb-1.5" style={{ fontSize: "14px", fontWeight: 700 }}>Bonus Bakiyeniz</p>
          <p className="text-white font-semibold" style={{ fontSize: "18px" }}>{(user.bonusBalance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
        </div>
        <div className="text-center flex flex-col justify-center items-center">
          <p className="text-white mb-1.5" style={{ fontSize: "11px", fontWeight: 700 }}>Toplam Bakiyeniz</p>
          <p className="text-white font-semibold" style={{ fontSize: "18px" }}>{(user.totalBalance ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex items-center justify-center gap-2 px-3 border-b overflow-x-auto" style={{ borderColor: "#e5e5e5", width: "390px", height: "75px" }}>
        <Link
          href="/loyalty"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 hover:opacity-80 transition-opacity text-white"
          style={{ backgroundColor: "#00d4b4", borderRadius: "8px", fontSize: "14px", fontWeight: 400, width: "92px", height: "38px" }}
        >
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "18px", height: "22px", flexShrink: 0 }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M9 19.1662L4.5145 21.8575C4.18522 22.0551 3.7719 22.0467 3.45096 21.8358C3.13002 21.625 2.95815 21.249 3.00871 20.8684L3.84201 14.5945L3.65067 14.1326C3.5976 14.0042 3.49529 13.902 3.36713 13.8486L2.05905 13.3067C1.44075 13.0506 0.949461 12.5595 0.693155 11.9413C0.43685 11.323 0.436757 10.6277 0.692444 10.0093L1.23401 8.70177C1.28698 8.57332 1.28683 8.42908 1.23358 8.30074L0.692143 6.9898C0.436444 6.37132 0.436444 5.67668 0.692143 5.0582L1.23371 3.74766C1.48993 3.12909 1.98136 2.63784 2.59981 2.38162L3.9081 1.82006L3.65119 2.86597C3.59776 2.99401 3.49556 3.09619 3.36735 3.1492L2.05912 3.69111C1.75279 3.81793 1.47414 4.00398 1.23967 4.23839C1.00512 4.47287 0.819073 4.75127 0.692158 5.05768C0.565242 5.3641 0.499947 5.69251 0.5 6.02417C0.500053 6.35554 0.565342 6.68366 0.692143 6.9898L1.23358 8.30074C1.28683 8.42908 1.28698 8.57332 1.23401 8.70177L0.692444 10.0093C0.436757 10.6277 0.43685 11.323 0.693155 11.9413C0.949461 12.5595 1.44075 13.0506 2.05905 13.3067L3.36713 13.8486C3.49529 13.902 3.5976 14.0042 3.65067 14.1326L3.84201 14.5945L3.00871 20.8684C2.95815 21.249 3.13002 21.625 3.45096 21.8358C3.7719 22.0467 4.18522 22.0551 4.5145 21.8575L9 19.1662ZM9 19.1662L13.4855 21.8575C13.8148 22.0551 14.2281 22.0467 14.549 21.8358C14.87 21.625 15.0419 21.249 14.9913 20.8684L14.158 14.5945L14.3493 14.1325C14.4024 14.0042 14.5047 13.9019 14.6329 13.8486L15.9409 13.3067C16.5592 13.0506 17.0505 12.5594 17.3068 11.9412C17.5632 11.323 17.5632 10.6277 17.3076 10.0092L16.766 8.70174C16.713 8.57329 16.7132 8.42905 16.7664 8.30071L17.3079 6.98977C17.4347 6.68363 17.4999 6.35551 17.5 6.02413C17.5001 5.69248 17.4348 5.36407 17.3078 5.05765C17.1809 4.75124 16.9949 4.47284 16.7603 4.23836C16.5259 4.00395 16.2472 3.8179 15.9409 3.69108L14.6326 3.14917C14.5044 3.09616 14.4022 2.99398 14.3488 2.86594L13.8072 1.55844C13.551 0.939865 13.0596 0.448401 12.441 0.192172C11.8225 -0.0640574 11.1274 -0.0640574 10.5089 0.192172L9.86728 0.457937L9.2015 0.732534L9.19952 0.733354C9.13701 0.759293 9.07073 0.772626 9.00435 0.773362C8.93506 0.773742 8.86572 0.760395 8.80048 0.733324L8.7985 0.732504L8.09848 0.443785L7.49113 0.192203C6.87256 -0.0640268 6.17754 -0.0640268 5.55897 0.192203C4.9404 0.448431 4.44896 0.939895 4.19275 1.55847L3.65119 2.86597L3.9081 1.82006L2.59981 2.38162C1.98136 2.63784 1.48993 3.12909 1.23371 3.74766L0.692143 5.0582C0.436444 5.67668 0.436444 6.37132 0.692143 6.9898L1.23358 8.30074C1.28683 8.42908 1.28698 8.57332 1.23401 8.70177L0.692444 10.0093C0.436757 10.6277 0.43685 11.323 0.693155 11.9413C0.949461 12.5595 1.44075 13.0506 2.05905 13.3067L3.36713 13.8486C3.49529 13.902 3.5976 14.0042 3.65067 14.1326L3.84201 14.5945L3.00871 20.8684C2.95815 21.249 3.13002 21.625 3.45096 21.8358C3.7719 22.0467 4.18522 22.0551 4.5145 21.8575L9 19.1662Z" fill="white"/>
            <path d="M9 14.5C11.7614 14.5 14 12.2614 14 9.5C14 6.73858 11.7614 4.5 9 4.5C6.23858 4.5 4 6.73858 4 9.5C4 12.2614 6.23858 14.5 9 14.5Z" fill="white" fillOpacity="0.4" stroke="white" strokeWidth="1.5"/>
            <path d="M9 12C10.3807 12 11.5 10.8807 11.5 9.5C11.5 8.11929 10.3807 7 9 7C7.61929 7 6.5 8.11929 6.5 9.5C6.5 10.8807 7.61929 12 9 12Z" fill="white"/>
          </svg>
          <span>Seviyem</span>
        </Link>
        <Link
          href="/store"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 hover:opacity-80 transition-opacity text-white"
          style={{ backgroundColor: "#00d4b4", borderRadius: "8px", fontSize: "14px", fontWeight: 400, width: "92px", height: "39px" }}
        >
          <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.46429 2.19354C7.21442 2.19354 6.97106 2.2977 6.78878 2.48928C6.6059 2.6815 6.50001 2.94609 6.50001 3.2258C6.50001 3.50552 6.6059 3.77011 6.78878 3.96232C6.97106 4.15391 7.21442 4.25806 7.46429 4.25806H9.63425C9.56187 4.08118 9.47857 3.89797 9.38356 3.7164C8.89769 2.78793 8.27398 2.19354 7.46429 2.19354ZM10 6.32258V9.41935L2.60001 9.41935C2.30348 9.41935 2.14122 9.41855 2.02464 9.40871C2.02 9.40832 2.0156 9.40793 2.01145 9.40753C2.01107 9.40325 2.01069 9.39871 2.01031 9.39392C2.00078 9.27358 2.00001 9.10609 2.00001 8.8V6.94193C2.00001 6.63584 2.00078 6.46835 2.01031 6.348C2.01069 6.34321 2.01107 6.33868 2.01145 6.33439C2.0156 6.334 2.02 6.3336 2.02464 6.33321C2.14122 6.32338 2.30348 6.32258 2.60001 6.32258H10ZM4.66953 4.25806C4.55822 3.92911 4.50001 3.58027 4.50001 3.2258C4.50001 2.41043 4.80802 1.62479 5.36188 1.04266C5.91635 0.459899 6.67224 0.129028 7.46429 0.129028C9.259 0.129028 10.3725 1.38679 11 2.47456C11.6275 1.38679 12.741 0.129028 14.5357 0.129028C15.3278 0.129028 16.0837 0.459899 16.6381 1.04266C17.192 1.62479 17.5 2.41043 17.5 3.2258C17.5 3.58027 17.4418 3.92911 17.3305 4.25806L19.4319 4.25806C19.6843 4.25803 19.9301 4.258 20.1382 4.27555C20.3668 4.29483 20.6366 4.34032 20.908 4.48308C21.2843 4.68101 21.5903 4.99684 21.782 5.38531C21.9203 5.66549 21.9644 5.94392 21.9831 6.17989C22.0001 6.39476 22 6.64847 22 6.90899V8.83294C22 9.09346 22.0001 9.34717 21.9831 9.56204C21.9644 9.79801 21.9203 10.0764 21.782 10.3566C21.5903 10.7451 21.2843 11.0609 20.908 11.2588C20.6366 11.4016 20.3668 11.4471 20.1382 11.4664C20.0938 11.4701 20.0476 11.4731 20 11.4754V18.543C20 19.0872 20 19.5566 19.9694 19.9433C19.9371 20.3513 19.8658 20.7573 19.673 21.1478C19.3854 21.7305 18.9265 22.2043 18.362 22.5012C17.9836 22.7002 17.5904 22.7738 17.195 22.8071C16.8205 22.8387 16.3657 22.8387 15.8386 22.8387H6.16144C5.6343 22.8387 5.17954 22.8387 4.80499 22.8071C4.40964 22.7738 4.01641 22.7002 3.63803 22.5012C3.07354 22.2043 2.61463 21.7305 2.32698 21.1478C2.13419 20.7573 2.06287 20.3513 2.03057 19.9433C2.00002 19.5566 2.00001 19.0872 2.00001 18.543V11.4754C1.95245 11.4731 1.90621 11.4701 1.86184 11.4664C1.63316 11.4471 1.36342 11.4016 1.09202 11.2588C0.715695 11.0609 0.409708 10.7451 0.218004 10.3566C0.0796767 10.0764 0.0356012 9.79801 0.016934 9.56204C-7.62939e-05 9.34717 7.62939e-06 9.09346 7.62939e-06 8.83294V6.90899C7.62939e-06 6.64847 -7.62939e-05 6.39476 0.016934 6.17989C0.0356012 5.94392 0.0796767 5.66549 0.218004 5.38531C0.409708 4.99684 0.715695 4.68101 1.09202 4.48308C1.36342 4.34032 1.63316 4.29483 1.86184 4.27555C2.06989 4.258 2.31574 4.25803 2.56815 4.25806L4.66953 4.25806ZM12 6.32258V9.41935H19.4C19.6965 9.41935 19.8588 9.41855 19.9754 9.40871C19.98 9.40832 19.9844 9.40793 19.9886 9.40753C19.9889 9.40325 19.9893 9.39871 19.9897 9.39392C19.9992 9.27358 20 9.10609 20 8.8V6.94193C20 6.63584 19.9992 6.46835 19.9897 6.348C19.9893 6.34321 19.9889 6.33868 19.9886 6.33439C19.9844 6.334 19.98 6.3336 19.9754 6.33321C19.8588 6.32338 19.6965 6.32258 19.4 6.32258H12ZM12 11.4839V20.7742H15.8333C16.4009 20.7742 16.7763 20.7735 17.0613 20.7498C17.3374 20.7268 17.4576 20.686 17.5316 20.6471C17.7197 20.5481 17.8726 20.3909 17.9686 20.1974C18.0061 20.1214 18.0457 19.9977 18.0681 19.7163C18.0912 19.4258 18.0917 19.0432 18.0917 18.4597V11.4839H12ZM10 20.7742V11.4839H3.90834V18.4597C3.90834 19.0432 3.90879 19.4258 3.93192 19.7163C3.95432 19.9977 3.99393 20.1214 4.03141 20.1974C4.12742 20.3909 4.28033 20.5481 4.46839 20.6471C4.54244 20.686 4.66262 20.7268 4.93872 20.7498C5.22371 20.7735 5.59909 20.7742 6.16668 20.7742H10ZM14.3658 4.25806H12.3657C12.4381 4.08118 12.5214 3.89797 12.6164 3.7164C13.1023 2.78793 13.726 2.19354 14.5357 2.19354C14.7856 2.19354 15.0289 2.2977 15.2112 2.48928C15.3941 2.6815 15.5 2.94609 15.5 3.2258C15.5 3.50552 15.3941 3.77011 15.2112 3.96232C15.0289 4.15391 14.7856 4.25806H14.3658Z" fill="white"/>
          </svg>
          <span>Mağaza</span>
        </Link>
        <Link
          href="/loyalty-history"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 hover:opacity-80 transition-opacity text-white"
          style={{ backgroundColor: "#00d4b4", borderRadius: "8px", fontSize: "14px", fontWeight: 400, width: "144px", height: "40px" }}
        >
          <svg width="18" height="18" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.2413 4.11648e-07H5.7587C4.95374 -1.19522e-05 4.28937 -2.2158e-05 3.74818 0.0441949C3.18608 0.0901201 2.66937 0.188684 2.18404 0.435975C1.43139 0.819469 0.819469 1.43139 0.435975 2.18404C0.188684 2.66937 0.0901201 3.18608 0.0441949 3.74818C-2.21543e-05 4.28937 -1.19522e-05 4.95372 4.11648e-07 5.75869V16.2413C-1.19522e-05 17.0463 -2.2158e-05 17.7106 0.0441949 18.2518C0.0901201 18.8139 0.188684 19.3306 0.435975 19.816C0.819469 20.5686 1.43139 21.1805 2.18404 21.564C2.66937 21.8113 3.18608 21.9099 3.74818 21.9558C4.28937 22 4.95372 22 5.75868 22H8.5C9.05229 22 9.5 21.5523 9.5 21C9.5 20.4477 9.05229 20 8.5 20H5.8C4.94342 20 4.36113 19.9992 3.91104 19.9624C3.47262 19.9266 3.24842 19.8617 3.09202 19.782C2.7157 19.5903 2.40973 19.2843 2.21799 18.908C2.1383 18.7516 2.07337 18.5274 2.03755 18.089C2.00078 17.6389 2 17.0566 2 16.2V5.8C2 4.94342 2.00078 4.36113 2.03755 3.91104C2.07337 3.47262 2.1383 3.24842 2.21799 3.09202C2.40973 2.7157 2.7157 2.40973 3.09202 2.21799C3.24842 2.1383 3.47262 2.07337 3.91104 2.03755C4.36113 2.00078 4.94342 2 5.8 2H12.2C13.0566 2 13.6389 2.00078 14.089 2.03755C14.5274 2.07337 14.7516 2.1383 14.908 2.21799C15.2843 2.40973 15.5903 2.7157 15.782 3.09202C15.8617 3.24842 15.9266 3.47262 15.9624 3.91104C15.9992 4.36113 16 4.94342 16 5.8V9.5C16 10.0523 16.4477 10.5 17 10.5C17.5523 10.5 18 10.0523 18 9.5V5.75868C18 4.95372 18 4.28937 17.9558 3.74818C17.9099 3.18608 17.8113 2.66937 17.564 2.18404C17.1805 1.43139 16.5686 0.819469 15.816 0.435975C15.3306 0.188684 14.8139 0.0901201 14.2518 0.0441949C13.7106 -2.21543e-05 13.0463 -1.19522e-05 12.2413 4.11648e-07Z" fill="white"/>
            <path d="M5 5C4.44772 5 4 5.44772 4 6C4 6.55229 4.44772 7 5 7H13C13.5523 7 14 6.55229 14 6C14 5.44772 13.5523 5 13 5H5Z" fill="white"/>
            <path d="M5 9C4.44772 9 4 9.44772 4 10C4 10.5523 4.44772 11 5 11H11C11.5523 11 12 10.5523 12 10C12 9.44772 11.5523 9 11 9H5Z" fill="white"/>
            <path d="M5 13C4.44772 13 4 13.4477 4 14C4 14.5523 4.44772 15 5 15H7C7.55229 15 8 14.5523 8 14C8 13.4477 7.55229 13 7 13H5Z" fill="white"/>
            <path d="M16.8333 15.9333C16.8333 15.381 16.3856 14.9333 15.8333 14.9333C15.281 14.9333 14.8333 15.381 14.8333 15.9333V17.8333C14.8333 18.2121 15.0473 18.5584 15.3861 18.7278L17.3194 19.6944C17.8134 19.9414 18.4141 19.7412 18.6611 19.2472C18.9081 18.7532 18.7079 18.1526 18.2139 17.9056L16.8333 17.2153V15.9333Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M15.8333 12C12.6117 12 10 14.6117 10 17.8333C10 21.055 12.6117 23.6667 15.8333 23.6667C19.055 23.6667 21.6667 21.055 21.6667 17.8333C21.6667 14.6117 19.055 12 15.8333 12ZM12 17.8333C12 15.7162 13.7162 14 15.8333 14C17.9504 14 19.6667 15.7162 19.6667 17.8333C19.6667 19.9504 17.9504 21.6667 15.8333 21.6667C13.7162 21.6667 12 19.9504 12 17.8333Z" fill="white"/>
          </svg>
          <span>Sadakat Geçmişi</span>
        </Link>
      </div>

      {/* ── Menu Items Grid ── */}
      <div className="grid grid-cols-4 gap-0 border-b w-full" style={{ borderColor: "#e5e5e5" }}>
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex flex-col items-center gap-2 p-3 hover:opacity-70 transition-opacity"
          >
            {item.icon}
            <span className="text-center line-clamp-2" style={{ color: "#111111", fontSize: "14px", fontWeight: 500 }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Message ── */}
      <button
        onClick={() => setCurrentView("phone-update")}
        className="w-full py-6 text-center border-b bg-white hover:bg-gray-50 transition-colors"
        style={{ borderColor: "#e5e5e5" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 112.5" className="w-12 h-12 mx-auto mb-2">
          <path d="M43.4 8H17.6c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6H37V62.6H18.7c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v18.9c.9-.3 1.9-.4 2.9-.4h2V14c0-3.3-2.7-6-6-6zM30.5 65.9c1.5 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6-1.5 0-2.6-1.2-2.6-2.6 0-1.4 1.2-2.6 2.6-2.6z" />
          <path d="M73.2 38.3H47.4c-3.3 0-6 2.7-6 6v53.9c0 3.3 2.7 6 6 6h25.8c3.3 0 6-2.7 6-6V44.3c0-3.3-2.6-6-6-6zm-12.8 63.1c-1.5 0-2.6-1.2-2.6-2.6 0-1.5 1.2-2.6 2.6-2.6 1.4 0 2.6 1.2 2.6 2.6 0 1.5-1.2 2.6-2.6 2.6zm14-10.7c0 1.2-1 2.2-2.2 2.2H48.5c-1.2 0-2.2-1-2.2-2.2v-45c0-1.2 1-2.2 2.2-2.2h23.6c1.2 0 2.2 1 2.2 2.2v45zM74.2 19.6C68.1 8 54 5.9 54 5.9c7.3 5.8 9.3 14.5 9.8 17.5l-4.6 1.7L73 31.4l6.3-13.8-5.1 2zM37.3 106.6c-7.5-5.5-9.9-14.1-10.5-17.1l4.6-1.9-14-5.7-5.7 14 4.9-2.1c6.6 11.3 20.7 12.8 20.7 12.8z" />
        </svg>
        <p className="text-gray-500 text-sm">Numaranızı güncelleyin.</p>
      </button>

      {/* ── Aktif Turnuva ── */}
      <div className="bg-card border-t border-border px-4 py-4">
        {/* Başlık satırı */}
        <div className="flex gap-3 items-start mb-3">
          <img
            src="https://apievrymatrix5d84k321.com/uploads/1777268779423-641499947.jpeg"
            alt="Turnuva"
            className="w-14 h-14 rounded object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold leading-snug line-clamp-2" style={{ fontSize: "14px" }}>
              Velobet 27 Nisan - 04 Mayıs 2.500.000₺ Ödüllü Slot Turnuvası
            </p>
            <p className="mt-1" style={{ fontSize: "14px", color: "#ffffff" }}>
              Başlangıç 27 Nisan, 00:00, 2026 Bitiş 04 Mayıs, 23:59, 2026
            </p>
          </div>
        </div>

        {/* Sıra ve Ödül kutuları */}
        <div className="flex gap-2">
          <div className="flex items-center overflow-hidden" style={{ flex: 1, height: "26px", backgroundColor: "#c4c4c4", border: "1px solid #a8a8a8", borderRadius: "0px" }}>
            <div className="flex items-center justify-center px-2 h-full" style={{ borderRight: "1px solid #a8a8a8" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#333333" }} className="flex-shrink-0">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <span className="text-xs px-2" style={{ color: "#111111" }}>
              {myEntry ? `#${(myRank ?? 0) + 1}` : "#-"}
            </span>
          </div>
          <div className="flex items-center overflow-hidden" style={{ flex: 1, height: "26px", backgroundColor: "#c4c4c4", border: "1px solid #a8a8a8", borderRadius: "0px" }}>
            <div className="flex items-center justify-center px-2 h-full" style={{ borderRight: "1px solid #a8a8a8" }}>
              <svg width="14" height="14" viewBox="0 0 384 512" fill="#333333" className="flex-shrink-0">
                <path d="M97.12 362.63c-8.69-8.69-4.16-6.24-25.12-11.85-9.51-2.55-17.87-7.45-25.43-13.32L1.2 448.7c-4.39 10.77 3.81 22.47 15.43 22.03l52.69-2.01L105.56 507c8 8.44 22.04 5.81 26.43-4.96l52.05-127.62c-10.84 6.04-22.87 9.58-35.31 9.58-19.5 0-37.82-7.59-51.61-21.37zM382.8 448.7l-45.37-111.24c-7.56 5.88-15.92 10.77-25.43 13.32-21.07 5.64-16.45 3.18-25.12 11.85-13.79 13.78-32.12 21.37-51.62 21.37-12.44 0-24.47-3.55-35.31-9.58L252 502.04c4.39 10.77 18.44 13.4 26.43 4.96l36.25-38.28 52.69 2.01c11.62.44 19.82-11.27 15.43-22.03zM263 340c15.28-15.55 17.03-14.21 38.79-20.14 13.89-3.79 24.75-14.84 28.47-28.98 7.48-28.4 5.54-24.97 25.95-45.75 10.17-10.35 14.14-25.44 10.42-39.58-7.47-28.38-7.48-24.42 0-52.83 3.72-14.14-.25-29.23-10.42-39.58-20.41-20.78-18.47-17.36-25.95-45.75-3.72-14.14-14.58-25.19-28.47-28.98-27.88-7.61-24.52-5.62-44.95-26.41-10.17-10.35-25-14.4-38.89-10.61-27.87 7.6-23.98 7.61-51.9 0-13.89-3.79-28.72.25-38.89 10.61-20.41 20.78-17.05 18.8-44.94 26.41-13.89 3.79-24.75 14.84-28.47 28.98-7.47 28.39-5.54 24.97-25.95 45.75-10.17 10.35-14.15 25.44-10.42 39.58 7.47 28.36 7.48 24.4 0 52.82-3.72 14.14.25 29.23 10.42 39.59 20.41 20.78 18.47 17.35 25.95 45.75 3.72 14.14 14.58 25.19 28.47 28.98C104.6 325.96 106.27 325 121 340c13.23 13.47 33.84 15.88 49.74 5.82a39.676 39.676 0 0 1 42.53 0c15.89 10.06 36.5 7.65 49.73-5.82zM97.66 175.96c0-53.03 42.24-96.02 94.34-96.02s94.34 42.99 94.34 96.02-42.24 96.02-94.34 96.02-94.34-42.99-94.34-96.02z"/>
              </svg>
            </div>
            <span className="text-xs px-2" style={{ color: "#111111" }}>
              {myEntry?.prize
                ? typeof myEntry.prize === "number"
                  ? myEntry.prize.toLocaleString("tr-TR") + " ₺"
                  : myEntry.prize
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Logout Button ── */}
      <div className="py-4 bg-white flex justify-center">
        <button
          onClick={() => { logout(); onClose() }}
          className="rounded hover:opacity-80 transition-colors text-gray-900"
          style={{ border: "2px solid #404040", borderRadius: "8px", width: "clamp(107px, 30%, 107px)", height: "43px", fontSize: "16px", fontWeight: 600 }}
        >
          ÇIKIŞ YAP
        </button>
      </div>
    </div>
  )
}
