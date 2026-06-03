"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export const AFFILIATE_KEY = "bm_affiliate"

export function AffiliateTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const affiliate = searchParams.get("a")
    if (affiliate && affiliate.trim()) {
      try {
        localStorage.setItem(AFFILIATE_KEY, affiliate.trim())
      } catch {}
    }
  }, [searchParams])

  return null
}

export function getStoredAffiliate(): string | null {
  try {
    return localStorage.getItem(AFFILIATE_KEY) || null
  } catch {
    return null
  }
}
