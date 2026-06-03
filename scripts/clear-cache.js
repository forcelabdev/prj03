import { rmSync, existsSync } from "fs"
import { join } from "path"

const nextDir = join(process.cwd(), ".next")
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true })
  console.log(".next cache temizlendi")
} else {
  console.log(".next klasörü bulunamadı")
}
