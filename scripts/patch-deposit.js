import fs from "fs"
import path from "path"

console.log("[v0] cwd:", process.cwd())

// Olası path'leri dene
const candidates = [
  path.join(process.cwd(), "app/deposit/page.tsx"),
  "/vercel/share/v0-project/app/deposit/page.tsx",
  path.join(process.cwd(), "../app/deposit/page.tsx"),
]

const filePath = candidates.find(p => fs.existsSync(p))
if (!filePath) {
  console.error("[v0] Dosya bulunamadi! Denenen path'ler:", candidates)
  process.exit(1)
}
console.log("[v0] filePath:", filePath)
let content = fs.readFileSync(filePath, "utf8")

// 1) Import ekle (yoksa)
if (!content.includes("DepositConfirmModal")) {
  content = content.replace(
    `import { paymentService, type DepositMethod } from "@/lib/services/payment-service"`,
    `import { paymentService, type DepositMethod } from "@/lib/services/payment-service"\nimport { DepositConfirmModal } from "@/components/deposit-confirm-modal"`
  )
  console.log("[v0] Import eklendi")
} else {
  console.log("[v0] Import zaten mevcut")
}

// 2) Mobil return'deki eski confirm modal bloklarını kaldır (varsa)
content = content.replace(
  /\{showConfirmModal && \(\s*<div className="fixed inset-0 z-50 flex items-end justify-center"[\s\S]*?<\/div>\s*<\/div>\s*\)\}/g,
  ""
)

// 3) Desktop confirm modal bloğunu da temizle (varsa)
content = content.replace(
  /\{showConfirmModal && \(\s*<div className="fixed inset-0 z-50 flex items-(?:end lg:items-center|center) justify-center[\s\S]*?<\/div>\s*<\/div>\s*\)\}/g,
  ""
)

// 4) Mobil view kapanışından önce modal ekle
content = content.replace(
  `        {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}


      </div>
    )
  }`,
  `        {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        <DepositConfirmModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmDeposit} />
      </div>
    )
  }`
)

// 5) Desktop return kapanışından önce modal ekle
content = content.replace(
  `      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}`,
  `      {showSidebar && <SidebarMenu onClose={() => setShowSidebar(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      <DepositConfirmModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmDeposit} />
    </div>
  )
}`
)

fs.writeFileSync(filePath, content, "utf8")
console.log("[v0] deposit/page.tsx başarıyla güncellendi")
