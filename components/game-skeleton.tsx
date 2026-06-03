"use client"

// Oyun kartlari icin skeleton loading
export function GameCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="relative rounded-xl lg:rounded-none w-full overflow-hidden h-[124px] bg-zinc-800" />
      <div className="h-4 bg-zinc-800 rounded mt-2 w-3/4" />
    </div>
  )
}

// Kategori section icin skeleton
export function CategorySkeleton({ gameCount = 6 }: { gameCount?: number }) {
  return (
    <div className="mb-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-zinc-800 rounded w-32 animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-20 animate-pulse" />
      </div>
      {/* Games grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {Array.from({ length: gameCount }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Banner slider icin skeleton
export function BannerSkeleton() {
  return (
    <div className="relative w-full h-[232px] lg:h-[330px] bg-zinc-800 animate-pulse rounded-xl" />
  )
}

// Tam sayfa skeleton
export function CasinoPageSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <BannerSkeleton />
      <CategorySkeleton gameCount={6} />
      <CategorySkeleton gameCount={6} />
      <CategorySkeleton gameCount={6} />
    </div>
  )
}
