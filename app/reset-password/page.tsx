"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

function ResetPasswordRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const params = searchParams.toString()
    router.replace(`/reset${params ? `?${params}` : ""}`)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f0f0" }}>
      <Loader2 className="h-8 w-8 animate-spin text-[#00d4b4]" />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d4b4]" />
      </div>
    }>
      <ResetPasswordRedirect />
    </Suspense>
  )
}
