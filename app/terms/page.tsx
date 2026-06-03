"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function TermsPage() {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        onLoginClick={() => setShowLogin(true)}
      />
      
      <main className="px-4 py-6 pb-24">
        <h1 className="text-xl font-bold mb-6">GENEL KURAL VE ŞARTLAR</h1>
        
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold mb-3">Giriş</h2>
            
            <p className="mb-4">
              <strong className="text-white">1.1.</strong> Web sitemiz Velobet.com ("Website") 'u kullanarak, ziyaret ederek veya üye olarak aşağıdaki maddeleri kabul etmiş sayılırsınız:
            </p>
            
            <p className="mb-2">
              <strong className="text-white">1.1.1.</strong> Bu sayfadaki Genel Kurallar ve Şartlar.
            </p>
            
            <p className="mb-2">
              <strong className="text-white">1.1.2.</strong> Gizlilik Politikası.
            </p>
            
            <p className="mb-2">
              <strong className="text-white">1.1.3.</strong> Oyun kuralları.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">1.1.4.</strong> Web sayfamızda bulabileceğiniz zaman zaman güncellenebilecek her türlü promosyon, bonuslar, özel kampanyalara ait kurallar ve şartlar.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">1.2.</strong> Yukarıda listelenen tüm kural ve şartların tümü "Kurallar" olarak adlandırılır.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">1.3.</strong> Lütfen kuralları kabul etmeden dikkatlice okuyup anlayınız. Kurallarımızda kabul etmediğiniz bir madde olursa lütfen web sitemizde bir üye hesabı açarak kullanmaya devam etmeyiniz. Web sitemize kullanmaya devam etmeniz kuralları kabul ettiğiniz anlamına gelecektir.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">1.4.</strong> Kurallar 01/01/2020 tarihinden itibaren geçerlidir.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-3">Taraflar</h2>
            
            <p className="mb-4">
              <strong className="text-white">2.2.</strong> Kural ve şartlarda kullanılan "bize", "bizim," "biz" veya "Şirket" ibareleri yukarıda Şirket bilgileri belirtilen sizin şartlarını kabul ettiğiniz anlaşmanın karşı tarafını ifade eder.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-3">Kural Değişiklikleri</h2>
            
            <p className="mb-4">
              <strong className="text-white">3.1.</strong> Ticari nedenler, yasa ve yönetmeliklerde veya müşteri hizmetlerindeki değişiklikler gibi birtakım nedenlerle kurallar tarafımızdan değiştirilebilir. Güncel Kullanım Kurallarına web sitesi üzerinden erişilebilir ve yürürlüğe girdiği tarih burada belirtilir.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-3">Hesap Açma</h2>
            
            <p className="mb-4">
              <strong className="text-white">4.1.</strong> Web sitesi üzerinden bahis ve oyun oynamak için bir hesap açmalısınız.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">4.2.</strong> Bir hesap açmak için, en az 18 yaşında olmanız gerekmektedir.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">4.3.</strong> Sadece bir hesap açabilirsiniz. Birden fazla hesap açtığınız tespit edilirse, tüm hesaplarınız kapatılabilir ve kazançlarınız iptal edilebilir.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">4.4.</strong> Hesap bilgilerinizi gizli tutmalı ve üçüncü şahıslarla paylaşmamalısınız.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-3">Para Yatırma ve Çekme</h2>
            
            <p className="mb-4">
              <strong className="text-white">5.1.</strong> Para yatırma işlemleri anında hesabınıza yansır. Çekim işlemleri ise belirtilen süreler içinde gerçekleştirilir.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">5.2.</strong> Minimum ve maksimum yatırım/çekim limitleri ödeme yöntemine göre değişiklik gösterebilir.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">5.3.</strong> Şirket, şüpheli işlemler tespit ettiğinde hesabı askıya alma ve inceleme yapma hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-3">Bahis Kuralları</h2>
            
            <p className="mb-4">
              <strong className="text-white">6.1.</strong> Tüm bahisler, bahsin yapıldığı andaki kurallara tabidir.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">6.2.</strong> Şirket, herhangi bir bahsi kabul etmeme veya bahis limitlerini belirleme hakkını saklı tutar.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">6.3.</strong> Teknik hatalar nedeniyle yanlış oranlarla kabul edilen bahisler iptal edilebilir.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold mb-3">Sorumlu Oyun</h2>
            
            <p className="mb-4">
              <strong className="text-white">7.1.</strong> Velobet, sorumlu oyunu destekler. Oyun bağımlılığı belirtileri gösteriyorsanız, lütfen yardım alın.
            </p>
            
            <p className="mb-4">
              <strong className="text-white">7.2.</strong> Hesabınıza yatırım limitleri, kayıp limitleri veya kendini hariç tutma seçenekleri ayarlayabilirsiniz.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  )
}
