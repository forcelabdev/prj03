"use client"

import { use } from "react"
import CasinoPage from "../page"

export default function CasinoCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params)
  return <CasinoPage initialCategory={category} />
}
