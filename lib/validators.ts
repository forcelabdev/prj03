// Input validation utilities for API routes

export function validateEmail(email: unknown): { valid: boolean; error?: string } {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "E-posta adresi gereklidir." }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: "Geçerli bir e-posta adresi giriniz." }
  }
  if (email.length > 254) {
    return { valid: false, error: "E-posta adresi çok uzun." }
  }
  return { valid: true }
}

export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "Şifre gereklidir." }
  }
  if (password.length < 6) {
    return { valid: false, error: "Şifre en az 6 karakter olmalıdır." }
  }
  if (password.length > 128) {
    return { valid: false, error: "Şifre çok uzun." }
  }
  return { valid: true }
}

export function validateUsername(username: unknown): { valid: boolean; error?: string } {
  if (typeof username !== "string" || !username.trim()) {
    return { valid: false, error: "Kullanıcı adı gereklidir." }
  }
  if (username.length < 3) {
    return { valid: false, error: "Kullanıcı adı en az 3 karakter olmalıdır." }
  }
  if (username.length > 32) {
    return { valid: false, error: "Kullanıcı adı en fazla 32 karakter olabilir." }
  }
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/
  if (!usernameRegex.test(username)) {
    return { valid: false, error: "Kullanıcı adı yalnızca harf, rakam, _ . - içerebilir." }
  }
  return { valid: true }
}

export function validateAmount(amount: unknown): { valid: boolean; error?: string } {
  const num = Number(amount)
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: "Geçerli bir tutar giriniz." }
  }
  if (num > 10_000_000) {
    return { valid: false, error: "Tutar çok yüksek." }
  }
  return { valid: true }
}

export function sanitizeString(value: unknown, maxLength = 500): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maxLength)
}
