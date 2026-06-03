"use client"

import { useState, useEffect } from "react"
import { Menu, ChevronDown, Loader2, X } from "lucide-react"
import { BirthDatePicker } from "@/components/birth-date-picker"

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

const ConfettiIcon = () => (
  <svg width="36" height="36" viewBox="0 0 512.002 512.002" xmlns="http://www.w3.org/2000/svg">
    <path fill="#ff718d" d="M271.992,375.99L27.345,511.622c-3.161,1.752-8.283-2.96-6.798-6.255l114.85-255.065"/>
    <path fill="#EF8990" d="M249.373,355.176L34.548,474.274l-14.001,31.094c-1.484,3.297,3.636,8.008,6.799,6.255L271.993,375.99L249.373,355.176z"/>
    <ellipse transform="matrix(0.6771 -0.7359 0.7359 0.6771 -161.0841 252.6818)" fill="#59D3C4" cx="207.387" cy="309.895" rx="40.387" ry="93.5"/>
    <path fill="#29cdff" d="M234.73,280.166c-37.998-34.964-81.046-50-96.15-33.585c-4.671,5.076-6.115,12.571-4.768,21.529c20.053,2.145,47.666,16.588,73.038,39.934c26.248,24.151,43.211,51.489,46.22,71.5c9.978,1.067,18.093-0.895,23.112-6.35C291.288,356.78,272.728,315.129,234.73,280.166z"/>
    <path fill="#ff718d" d="M276.14,195.076c-2.976,0-5.885-1.492-7.572-4.206c-2.595-4.178-1.312-9.668,2.865-12.262c13.482-8.375,31.86-23.705,42.852-49.18c5.723-13.265,8.638-27.46,8.663-42.19c0.008-4.912,3.992-8.888,8.904-8.888c0.005,0,0.009,0,0.015,0c4.917,0.008,8.896,4.001,8.888,8.919c-0.027,17.159-3.433,33.717-10.118,49.215c-12.82,29.709-34.16,47.532-49.805,57.251C279.368,194.643,277.744,195.076,276.14,195.076z"/>
    <path fill="#fdff6a" d="M283.649,272.084c-0.797,0-1.606-0.108-2.41-0.334c-4.734-1.327-7.494-6.243-6.166-10.977c9.902-35.291,26.337-59.243,48.847-71.194c14.197-7.54,26.912-8.403,39.209-9.24c11.42-0.775,22.208-1.509,35.216-7.307c18.331-8.17,33.787-23.325,45.939-45.047c2.399-4.289,7.822-5.822,12.117-3.424c4.29,2.4,5.823,7.827,3.423,12.118c-14.068,25.147-32.314,42.85-54.231,52.618c-15.896,7.085-29.369,8-41.257,8.809c-11.388,0.774-21.224,1.444-32.067,7.2c-18.042,9.578-31.519,29.858-40.054,60.277C291.113,269.512,287.54,272.084,283.649,272.084z"/>
    <path fill="#fdff6a" d="M190.114,219.972c0.329,0.725,0.761,1.419,1.299,2.057c3.163,3.766,8.779,4.251,12.543,1.087c28.06-23.581,43.098-48.435,44.695-73.872c1.009-16.043-3.451-27.982-7.763-39.528c-4.005-10.723-7.789-20.852-7.875-35.094c-0.122-20.069,7.306-40.402,22.078-60.434c2.917-3.956,2.076-9.527-1.882-12.451c-3.958-2.918-9.532-2.075-12.451,1.883c-17.102,23.19-25.698,47.115-25.552,71.11c0.106,17.402,4.83,30.054,9,41.215c3.994,10.693,7.442,19.929,6.673,32.181c-1.28,20.387-14.192,41.03-38.379,61.357C189.374,212.112,188.509,216.428,190.114,219.972z"/>
    <path fill="#ff718d" d="M417.858,315.683c-3.913,0-7.756-0.412-11.526-1.235c-10.938-2.387-17.783-7.566-23.824-12.134c-3.885-2.939-7.556-5.715-12.33-7.839c-15.078-6.704-35.532-4.001-60.791,8.042c-4.442,2.113-9.754,0.232-11.869-4.206c-2.115-4.439-0.233-9.752,4.206-11.869c30.172-14.382,55.638-17.154,75.691-8.236c6.646,2.955,11.527,6.648,15.835,9.905c5.456,4.128,9.765,7.386,16.88,8.939c11.36,2.479,24.31-0.719,38.483-9.51c4.178-2.592,9.668-1.307,12.258,2.873c2.593,4.179,1.307,9.668-2.873,12.258C444.044,311.329,430.59,315.683,417.858,315.683z"/>
    <path fill="#29cdff" d="M421.163,245.37c-1.962,0-3.937-0.645-5.583-1.973c-3.829-3.088-4.428-8.692-1.341-12.52c8.289-10.279,18.851-18.758,30.542-24.518c8.442-4.16,17.477-6.964,26.854-8.335c4.871-0.709,9.387,2.654,10.099,7.521s-2.656,9.387-7.521,10.099c-7.537,1.103-14.791,3.352-21.561,6.69c-9.386,4.625-17.876,11.445-24.552,19.723C426.34,244.236,423.764,245.37,421.163,245.37z"/>
    <circle fill="#29cdff" cx="367.85" cy="241.259" r="9.397"/>
    <circle fill="#ff718d" cx="388.829" cy="112.604" r="9.397"/>
    <circle fill="#29cdff" cx="313.389" cy="17.443" r="9.397"/>
    <circle fill="#29cdff" cx="478.668" cy="80.675" r="9.397"/>
    <circle fill="#fdff6a" cx="417.315" cy="36.236" r="9.397"/>
    <circle fill="#ff718d" cx="276.132" cy="71.277" r="9.397"/>
    <circle fill="#fdff6a" cx="482.321" cy="259.7" r="9.397"/>
    <circle fill="#fdff6a" cx="189.325" cy="148.886" r="9.397"/>
  </svg>
)

// Custom Checkbox component with CSS-style checkmark
const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex-shrink-0 relative"
    style={{ width: '24px', height: '24px' }}
  >
    <div 
      style={{ 
        width: '24px', 
        height: '24px', 
        border: '1px solid #d1d5db', 
        borderRadius: '4px', 
        backgroundColor: 'white',
        position: 'relative'
      }}
    >
      {checked && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '6px',
            height: '12px',
            border: 'solid #00d4b4',
            borderWidth: '0 3px 3px 0',
            transform: 'translateY(-60%) translateX(-50%) rotate(35deg)',
          }}
        />
      )}
    </div>
  </button>
)
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { LoginModal } from "@/components/login-modal"
import { SidebarMenu } from "@/components/sidebar-menu"
import { DesktopHeader } from "@/components/desktop-header"
import { Header } from "@/components/header"
import { useAuth } from "@/contexts/auth-context"
import { getStoredAffiliate } from "@/components/affiliate-tracker"

const steps = [
  { id: 1, title: "Hesap Detayları" },
  { id: 2, title: "Kullanıcı Detayları" },
  { id: 3, title: "İletişim Bilgileri" },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get("a")
    const stored = getStoredAffiliate()
    if (fromUrl && fromUrl.trim()) {
      const code = fromUrl.trim()
      setAffiliateCode(code)
      try { localStorage.setItem("bm_affiliate", code) } catch {}
    } else {
      setAffiliateCode(stored)
    }
  }, [])

  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState({
    // Step 1
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    // Step 2
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "Turkey",
    // Step 3
    phone: "",
    countryCode: "+90",
    securityQuestion: "",
    securityAnswer: "",
    emailConsent: false,
    smsConsent: false,
  })

  const updateFormData = (field: string, value: string | boolean) => {
    // Kullanıcı adında bo��luğu direkt engelle
    if (field === "username" && typeof value === "string") {
      value = value.replace(/\s/g, "")
    }
    // Telefonda sadece rakam kabul et, başındaki 0'ı otomatik kaldır
    if (field === "phone" && typeof value === "string") {
      value = value.replace(/\D/g, "") // sadece rakam
      if (value.startsWith("0")) {
        value = value.slice(1) // başındaki 0'ı kaldır
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setFieldErrors((prev) => ({ ...prev, [field]: "" }))
  }

  // Check if current step fields are filled (for button state)
  const isStepValid = (): boolean => {
    if (currentStep === 1) {
      return !!(
        formData.email &&
        formData.username &&
        formData.username.length >= 4 &&
        !/\s/.test(formData.username) &&
        !/^\d+$/.test(formData.username) &&
        /^[a-zA-Z0-9]+$/.test(formData.username) &&
        formData.password &&
        formData.password.length >= 8 &&
        /[A-Z]/.test(formData.password) &&
        /[0-9]/.test(formData.password) &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword &&
        formData.birthDate &&
        /^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)
      )
    }
    if (currentStep === 2) {
      return !!(formData.firstName && formData.lastName)
    }
    if (currentStep === 3) {
      return !!formData.phone
    }
    return false
  }

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {}
    if (currentStep === 1) {
      if (!formData.email) errors.email = "Bu alanı doldurmak zorunludur."
      if (!formData.username) {
        errors.username = "Bu alanı doldurmak zorunludur."
      } else if (formData.username.length < 4) {
        errors.username = "Kullanıcı adı en az 4 karakter olmalıdır."
      } else if (/\s/.test(formData.username)) {
        errors.username = "Kullanıcı adında boşluk kullanılamaz."
      } else if (/^\d+$/.test(formData.username)) {
        errors.username = "Kullanıcı adı yalnızca rakamlardan oluşamaz."
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        errors.username = "Kullanıcı adı yalnızca harf ve rakam içerebilir."
      }
      if (!formData.password) errors.password = "Bu alanı doldurmak zorunludur."
      else if (formData.password.length < 8) errors.password = "Şifre en az 8 karakter olmalıdır."
      else if (!/[A-Z]/.test(formData.password)) errors.password = "Şifre en az 1 büyük harf içermelidir."
      else if (!/[0-9]/.test(formData.password)) errors.password = "Şifre en az 1 rakam içermelidir."
      if (!formData.confirmPassword) errors.confirmPassword = "Bu alanı doldurmak zorunludur."
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Şifreler eşleşmedi."
      if (!formData.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) errors.birthDate = "Lütfen doğum tarihinizi seçiniz."
    }
    if (currentStep === 2) {
      if (!formData.firstName) errors.firstName = "Bu alanı doldurmak zorunludur."
      if (!formData.lastName) errors.lastName = "Bu alanı doldurmak zorunludur."
    }
    if (currentStep === 3) {
      if (!formData.phone) errors.phone = "Bu alanı doldurmak zorunludur."
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return false
    }
    setFieldErrors({})
    return true
  }

  const validateAll = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.email) errors.email = "Bu alanı doldurmak zorunludur."
    if (!formData.username) errors.username = "Bu alanı doldurmak zorunludur."
    if (!formData.password) errors.password = "Bu alanı doldurmak zorunludur."
    else if (formData.password.length < 8) errors.password = "Şifre en az 8 karakter olmalıdır."
    else if (!/[A-Z]/.test(formData.password)) errors.password = "Şifre en az 1 büyük harf içermelidir."
    else if (!/[0-9]/.test(formData.password)) errors.password = "Şifre en az 1 rakam içermelidir."
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Şifreler eşleşmedi."
    if (!formData.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) errors.birthDate = "Lütfen doğum tarihinizi seçiniz."
    if (!formData.firstName) errors.firstName = "Bu alanı doldurmak zorunludur."
    if (!formData.lastName) errors.lastName = "Bu alanı doldurmak zorunludur."
    if (!formData.phone) errors.phone = "Bu alanı doldurmak zorunludur."
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      // Hangi step'te hata varsa ona gec
      if (errors.email || errors.username || errors.password || errors.confirmPassword || errors.birthDate) {
        setCurrentStep(1)
      } else if (errors.firstName || errors.lastName) {
        setCurrentStep(2)
      }
      return false
    }
    return true
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit form - tum alanlari validate et
      if (!validateAll()) return
      setIsSubmitting(true)
      setError("")

      try {
        const result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          countryCode: formData.countryCode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          affiliate: affiliateCode || undefined,
        })

        if (result.success) {
          router.push("/")
        } else {
          setError(result.error || "Kayıt başarısız oldu")
        }
      } catch (err) {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background lg:bg-[#1a1a1a] flex flex-col overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header onLoginClick={() => setIsLoginOpen(true)} />
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader onLoginClick={() => setIsLoginOpen(true)} />
      </div>

      {/* Mobile Welcome Banner with Step Indicator overlay */}
      <div className="lg:hidden w-full relative z-0" style={{ height: '70px' }}>
        <img
          src="/register-banner-bonus.webp"
          alt="Velobet'e Hoş Geldin - Bonus Kampanyası"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
        {/* Step Indicator - half inside banner, half below */}
        <div className="absolute bottom-0 right-2 translate-y-1/2 flex gap-2 z-10">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              style={{
                marginRight: "1rem",
                padding: ".1rem .5rem",
                position: "relative",
                fontSize: "15px",
                fontWeight: 400,
                ...(currentStep === step.id
                  ? { background: "#222", color: "#fff", border: ".15rem solid #222" }
                  : { background: "#fff", color: "#b3b3b3", border: ".15rem solid #b3b3b3" }),
              }}
              className="flex items-center justify-center transition-colors cursor-pointer"
            >
              {step.id}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop 2-column layout */}
      <div className="hidden lg:flex flex-1 bg-[#f0f0f0] items-center justify-center py-8 px-8">
        {/* Main Container - Form + Promo side by side */}
        <div className="flex bg-white w-full" style={{ maxWidth: "1380px", height: "714px" }}>
          {/* Left: Form */}
          <div className="flex flex-col justify-start overflow-hidden" style={{ flex: 1, padding: "0.75rem 0 1rem" }}>
            <div className="overflow-y-auto mx-auto" style={{ width: "400px", height: "669px" }}>
            {/* Step Indicator */}
            <div className="flex w-full justify-end items-center mb-8">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    style={{
                      width: "27px",
                      height: "28px",
                      fontSize: "13px",
                      fontWeight: 400,
                      flexShrink: 0,
                      ...(currentStep === step.id
                        ? { background: "#222", color: "#fff", border: "2px solid #222" }
                        : { background: "#fff", color: "#b3b3b3", border: "2px solid #b3b3b3" }),
                    }}
                    className="flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {step.id}
                  </button>
                  {idx < steps.length - 1 && (
                    <div style={{ width: "26px", height: "2px", background: currentStep === step.id ? "#222" : "#d1d5db", flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500 text-red-600 p-3 rounded-lg text-sm">
                {typeof error === 'string' ? error : error.message || 'Bir hata olustu'}
              </div>
            )}

            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl mb-6 text-black" style={{ fontWeight: 600 }}>Hesap Detayları</h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Eposta:
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={`w-full h-[42px] border rounded px-4 focus:outline-none focus:ring-1 text-black ${fieldErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                  />
                  {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateFormData("username", e.target.value)}
                    className={`w-full h-[42px] border rounded px-4 focus:outline-none focus:ring-1 text-black ${fieldErrors.username ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                  />
                  {fieldErrors.username && <p className="mt-1 text-sm text-red-500">{fieldErrors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className={`w-full h-[42px] border rounded px-4 pr-12 focus:outline-none focus:ring-1 text-black ${fieldErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Şifrenizi tekrar girin
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                      className={`w-full h-[42px] border rounded px-4 pr-12 focus:outline-none focus:ring-1 text-black ${fieldErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Dogum Tarihi:
                  </label>
                  <BirthDatePicker
                    value={formData.birthDate}
                    onChange={(val) => updateFormData("birthDate", val)}
                    inputClassName={`w-full h-[42px] border rounded px-4 pl-12 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] text-black ${fieldErrors.birthDate ? "border-red-500" : "border-gray-300"}`}
                  />
                  {fieldErrors.birthDate && <p className="mt-1 text-sm text-red-500">{fieldErrors.birthDate}</p>}
                </div>
              </div>
            )}

            {/* Step 2: User Details - Desktop */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6 text-black">Kullanıcı Detayları</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-black">
                      <span className="text-red-500">*</span>İsim
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      className={`w-full h-[42px] border rounded px-4 focus:outline-none focus:ring-1 text-black ${fieldErrors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                    />
                    {fieldErrors.firstName && <p className="mt-1 text-sm text-red-500">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-black">
                      <span className="text-red-500">*</span>Soyad
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      className={`w-full h-[42px] border rounded px-4 focus:outline-none focus:ring-1 text-black ${fieldErrors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                    />
                    {fieldErrors.lastName && <p className="mt-1 text-sm text-red-500">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Sokak ve apartman numarası
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    className="w-full h-[42px] border rounded border-gray-300 px-4 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Şehir
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    className="w-full h-[42px] border rounded border-gray-300 px-4 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Ülke
                  </label>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => updateFormData("country", e.target.value)}
                      className="w-full h-[42px] border rounded border-gray-300 px-4 pr-10 appearance-none focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] text-black"
                    >
                      <option value="Turkey">Turkey</option>
                      <option value="Germany">Germany</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Netherlands">Netherlands</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info - Desktop */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold mb-6 text-black">İletişim Bilgileri</h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Telefon Numarası
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => updateFormData("countryCode", e.target.value)}
                      className="w-24 h-[42px] border rounded border-gray-300 px-3 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] text-black"
                    >
                      <option value="+90">+90</option>
                      <option value="+49">+49</option>
                      <option value="+44">+44</option>
                      <option value="+31">+31</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className={`flex-1 h-[42px] border rounded px-4 focus:outline-none focus:ring-1 text-black ${fieldErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                    />
                  </div>
                  {fieldErrors.phone && <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>}
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Lütfen doğru numara ve SMS onay yaparak üyeliğinizi tamamlayınız. SMS onay yapmanız hesap güvenliğiniz için önemlidir.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Güvenlik Sorusu
                  </label>
                  <input
                    type="text"
                    value={formData.securityQuestion}
                    onChange={(e) => updateFormData("securityQuestion", e.target.value)}
                    className="w-full h-[42px] border rounded border-gray-300 px-4 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black">
                    <span className="text-red-500">*</span>Güvenlik Cevabı
                  </label>
                  <input
                    type="text"
                    value={formData.securityAnswer}
                    onChange={(e) => updateFormData("securityAnswer", e.target.value)}
                    className="w-full h-[42px] border rounded border-gray-300 px-4 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] text-black"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <CustomCheckbox
                      checked={formData.emailConsent}
                      onChange={(checked) => updateFormData("emailConsent", checked)}
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      Evet, promosyonlarınız ve tekliflerinizle ilgili eposta iletişme geçilmesini isterim. (Bu bilgiler, Hesap Bilgileriniz kısmından istediğiniz zaman güncelleyebilirsiniz.)
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CustomCheckbox
                      checked={formData.smsConsent}
                      onChange={(checked) => updateFormData("smsConsent", checked)}
                    />
                    <span className="text-sm text-gray-600">SMS ile üye olmak istiyorum</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full mt-6 bg-[#00d4b4] py-4 font-semibold text-black hover:bg-[#00b89c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Kayit Yapiliyor...</span>
                </>
              ) : currentStep === 3 ? (
                <>
                  <ConfettiIcon />
                  <span>Şimdi Kayıt Olun!*</span>
                </>
              ) : (
                <span>Sonraki*</span>
              )}
            </button>

            <p className="text-sm text-black mt-8">
              Kayıt ol butonuna basıldığında{" "}
              <Link href="/terms" className="text-black hover:text-gray-700 underline">
                Kurallar &amp; Şartlar
              </Link>{" "}
              tarafınızdan kabul edilmiş sayılacaktır
            </p>
            </div>{/* /max-w wrapper */}
          </div>

          {/* Right: Promo Banner */}
          <div className="relative flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ width: "400px", height: "714px" }}>
            <img 
              src="/register-promo.jpg" 
              alt="Kayıt Promosyonu" 
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>



      {/* Mobile: Form Content */}
      <div className="lg:hidden flex-1 bg-white text-black px-4 py-3 flex flex-col items-center">
        {/* Error Message */}
        {error && (
          <div className="mb-3 bg-red-500/10 border border-red-500 text-red-600 p-2 rounded-lg text-sm">
            {typeof error === 'string' ? error : error.message || 'Bir hata olustu'}
          </div>
        )}

        {/* Step 1: Account Details */}
        {currentStep === 1 && (
          <div className="space-y-2.5 mt-5 w-full" style={{ maxWidth: '382px' }}>
            <h2 className="font-bold mb-4" style={{ fontSize: '18px' }}>Hesap Detayları</h2>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                <span className="text-red-500">*</span>Eposta:
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className={`border px-3 focus:outline-none focus:ring-1 ${fieldErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                style={{ width: '382px', height: '42px', maxWidth: '100%', borderRadius: '4px', color: '#212121' }}
              />
              {fieldErrors.email && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                <span className="text-red-500">*</span>Kullanıcı Adı
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateFormData("username", e.target.value)}
                className={`border px-3 focus:outline-none focus:ring-1 ${fieldErrors.username ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                style={{ width: '382px', height: '42px', maxWidth: '100%', borderRadius: '4px', color: '#212121' }}
              />
              {fieldErrors.username && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.username}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                <span className="text-red-500">*</span>Şifre
              </label>
              <div className="relative" style={{ width: '382px', maxWidth: '100%' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  className={`w-full border px-3 pr-10 focus:outline-none focus:ring-1 ${fieldErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                  style={{ height: '42px', borderRadius: '4px', color: '#212121' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#4e4e4e' }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                <span className="text-red-500">*</span>Şifrenizi tekrar girin
              </label>
              <div className="relative" style={{ width: '382px', maxWidth: '100%' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  className={`w-full border px-3 pr-10 focus:outline-none focus:ring-1 ${fieldErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                  style={{ height: '42px', borderRadius: '4px', color: '#212121' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#4e4e4e' }}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.confirmPassword}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                <span className="text-red-500">*</span>Doğum Tarihi:
              </label>
              <BirthDatePicker
                value={formData.birthDate}
                onChange={(val) => updateFormData("birthDate", val)}
                small
                inputClassName={`border px-3 pl-10 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4] ${fieldErrors.birthDate ? "border-red-500" : "border-gray-300"}`}
                inputStyle={{ width: '382px', height: '42px', maxWidth: '100%', borderRadius: '4px', color: '#212121' }}
              />
              {fieldErrors.birthDate && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.birthDate}</p>}
            </div>
          </div>
        )}

        {/* Step 2: User Details */}
        {currentStep === 2 && (
          <div className="space-y-2.5 mt-5 w-full" style={{ maxWidth: '382px' }}>
            <h2 className="font-bold mb-4" style={{ fontSize: '18px' }}>Kullanıcı Detayları</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                  <span className="text-red-500">*</span>İsim
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className={`w-full border px-3 focus:outline-none focus:ring-1 ${fieldErrors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                  style={{ height: '42px', borderRadius: '4px', color: '#212121' }}
                />
                {fieldErrors.firstName && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                  <span className="text-red-500">*</span>Soyad
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className={`w-full border px-3 focus:outline-none focus:ring-1 ${fieldErrors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                  style={{ height: '42px', borderRadius: '4px', color: '#212121' }}
                />
                {fieldErrors.lastName && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                Sokak ve apartman numarası
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                className="border border-gray-300 px-3 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                style={{ width: '382px', height: '42px', maxWidth: '100%', borderRadius: '4px', color: '#212121' }}
              />
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                Şehir
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                className="border border-gray-300 px-3 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                style={{ width: '382px', height: '42px', maxWidth: '100%', borderRadius: '4px', color: '#212121' }}
              />
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                Ülke
              </label>
              <div className="relative" style={{ width: '382px', maxWidth: '100%' }}>
                <select
                  value={formData.country}
                  onChange={(e) => updateFormData("country", e.target.value)}
                  className="w-full border border-gray-300 px-3 pr-10 appearance-none focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                  style={{ height: '42px', borderRadius: '4px', color: '#212121' }}
                >
                  <option value="Turkey">Turkey</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Netherlands">Netherlands</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {currentStep === 3 && (
          <div className="space-y-2.5 mt-5 w-full" style={{ maxWidth: '382px' }}>
            <h2 className="font-bold mb-4" style={{ fontSize: '18px' }}>İletişim Bilgileri</h2>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                <span className="text-red-500">*</span>Telefon Numarası
              </label>
              <div className="flex gap-2">
                <div className="relative w-24">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => updateFormData("countryCode", e.target.value)}
                    className="w-full border border-gray-300 px-3 pr-8 appearance-none focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                    style={{ height: '42px', borderRadius: '4px', color: '#212121' }}
                  >
                    <option value="+90">+90</option>
                    <option value="+49">+49</option>
                    <option value="+44">+44</option>
                    <option value="+31">+31</option>
                  </select>
                  <div className="absolute right-7 top-1/2 -translate-y-1/2 h-5 w-px bg-gray-300 pointer-events-none" />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className={`flex-1 border px-3 focus:outline-none focus:ring-1 ${fieldErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-[#00d4b4] focus:ring-[#00d4b4]"}`}
                  style={{ height: '42px', borderRadius: '4px', color: '#212121' }}
                />
              </div>
              {fieldErrors.phone && <p className="mt-1" style={{ fontSize: '14px', color: '#c03928' }}>{fieldErrors.phone}</p>}
              <p className="text-xs text-gray-500 mt-2 italic">
                Lütfen doğru numara ve SMS onay yaparak üyeliğinizi tamamlayınız. SMS onay yapmanız hesap güvenliğiniz için önemlidir.
              </p>
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                Güvenlik Sorusu
              </label>
              <input
                type="text"
                value={formData.securityQuestion}
                onChange={(e) => updateFormData("securityQuestion", e.target.value)}
                className="border border-gray-300 px-3 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                style={{ width: '382px', height: '42px', maxWidth: '100%', borderRadius: '4px', color: '#212121' }}
              />
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: '14px' }}>
                Güvenlik Cevabı
              </label>
              <input
                type="text"
                value={formData.securityAnswer}
                onChange={(e) => updateFormData("securityAnswer", e.target.value)}
                className="border border-gray-300 px-3 focus:border-[#00d4b4] focus:outline-none focus:ring-1 focus:ring-[#00d4b4]"
                style={{ width: '382px', height: '42px', maxWidth: '100%', borderRadius: '4px', color: '#212121' }}
              />
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex items-start gap-3 cursor-pointer">
                <CustomCheckbox
                  checked={formData.emailConsent}
                  onChange={(checked) => updateFormData("emailConsent", checked)}
                />
                <span className="text-sm text-gray-600" style={{ lineHeight: '1.5' }}>
                  Evet, promosyonlarınız ve tekliflerinizle ilgili eposta iletişme geçilmesini isterim. (Bu bilgiler, Hesap Bilgileriniz kısmından istediğiniz zaman güncelleyebilirsiniz.)
                </span>
              </div>

              <div className="flex items-start gap-3 cursor-pointer">
                <CustomCheckbox
                  checked={formData.smsConsent}
                  onChange={(checked) => updateFormData("smsConsent", checked)}
                />
                <span className="text-sm text-gray-600">
                  SMS ile üye olmak istiyorum
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hata Mesajı - Mobil */}
        {error && (
          <div
            className="w-full mb-3 border border-red-500 text-red-600 p-3 text-sm"
            style={{ maxWidth: '382px', borderRadius: '4px', backgroundColor: 'rgba(239,68,68,0.08)' }}
          >
            {typeof error === 'string' ? error : 'Bir hata olustu'}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="mt-4 font-semibold transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed w-full bg-[#00d4b4] text-black hover:bg-[#00b89c]"
          style={{ maxWidth: '382px', height: '50px', borderRadius: '4px' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Kayıt Yapılıyor...</span>
            </>
          ) : currentStep === 3 ? (
            <>
              <ConfettiIcon />
              <span>Şimdi Kayıt Olun!*</span>
            </>
          ) : (
            <span>Sonraki*</span>
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-gray-600 mt-2 w-full" style={{ maxWidth: '382px' }}>
          Kayit ol butonuna basildiginda{" "}
          <Link href="/terms" className="text-[#00d4b4] hover:text-[#00b89c]">
            Kurallar & Sartlar
          </Link>{" "}
          tarafinizdan kabul edilmis sayilacaktir
        </p>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      
      {/* Mobile Footer */}
      <div className="lg:hidden">
        <Footer />
        <BottomNavigation onCenterClick={() => {}} />
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  )
}
