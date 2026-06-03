export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Game sayfası için minimal layout - bottom navigation yok
  return <>{children}</>
}
