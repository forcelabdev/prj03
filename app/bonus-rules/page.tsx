"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function BonusRulesPage() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        onMenuClick={() => setShowSidebar(true)}
        onLoginClick={() => setShowLogin(true)}
      />

      <main className="px-4 py-6 pb-24">
        <h1 className="text-xl font-bold mb-6">GENEL BONUS KURALLARI</h1>

        <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
          <p>
            <strong className="text-white">1.</strong> Her üye yatırımına bir adet bonustan faydalanabilir, aynı anda birden fazla bonus talep edilemez.
          </p>
          <p>
            <strong className="text-white">2.</strong> Yatırım yaptıktan sonra anaparasını Casino ve Poker oyunlarına aktaran üyeler Spor Bahislerine Özel Promosyonlardan faydalanamaz.
          </p>
          <p>
            <strong className="text-white">3.</strong> Spor bahisleri bonuslarından faydalanıldığında Çevrim şartları yerine getirilmeden Para çekimi, Casino, Canlı Casino ve Poker&apos;e para aktarımı yapılamaz.
          </p>
          <p>
            <strong className="text-white">4.</strong> Bonus ve yatırım (anapara) çevrim şartlarına; aynı maça yapılan karşılıklı bahisler (alt-üst, tek-çift, 2 ihtimalli ev sahibi-deplasman handikapları) ve sistem bahisleri (çift-üçlü-yankee-trixie-süper heinz ve benzeri) ve beraberlikte iade bahisleri dahil değildir.
          </p>
          <p>
            <strong className="text-white">5.</strong> 1 (bir) ay içerisinde çevrimi tamamlanmayan bonus ve bonus kazancı iptal edilir.
          </p>
          <p>
            <strong className="text-white">6.</strong> Promosyon şartlarını ve kazançlarını kötüye kullanmaya yönelik hesap veya bahis hareketlerinin tespit edilmesi durumunda, bonus ve bonus kazançları iptal edilecek ve yetkili karar merci Velobet yönetimi olacaktır.
          </p>
          <p>
            <strong className="text-white">8.</strong> Promosyonlardan yararlanmak isteyen üyelerimiz ilgili kural ve şartları okuduklarını ve kabul ettiklerini teyit etmiş sayılacaklardır.
          </p>
          <p>
            <strong className="text-white">9.</strong> Velobet yönetimi, promosyon ile ilgili kuralları sebep göstermeksizin değiştirme ve güncelleme hakkına sahiptir.
          </p>
          <p>
            <strong className="text-white">13.</strong> Herhangi bir anlaşmazlık durumunda, karar verme yetkisi Velobet yönetimine aittir.
          </p>
          <p>
            <strong className="text-white">14.</strong> Aviator-Jetx-Balloon vb. tarzındaki oyunlarda ana para çevrimi yapılırken, oynanan bahis miktarının min. 1,3 katı kazanç veya kayıp sağlanmaz ise çevrime dahil edilmeyecektir. Örnek olarak, bahis miktarı 1000 TL ise, 1300 TL kazanç sağlamadan durdurularak sağlanan kazançlar ana para çevrimine dahil edilmez.
          </p>
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  )
}
