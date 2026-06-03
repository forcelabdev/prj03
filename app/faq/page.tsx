"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ChevronDown } from "lucide-react"

const faqItems = [
  {
    question: "NASIL HESAP AÇABİLİRİM?",
    answer: "Yeni bir hesap açmak için, sağ üstte yer alan KAYIT OL' butonuna tıklayarak karşınıza çıkan formu doldurup üyelik oluşturabilirsiniz. Kayıt formundaki bilgileri doğru ve eksiksiz doldurmanız gerekmektedir."
  },
  {
    question: "NASIL BAHİS YAPABİLİRİM?",
    answer: "Sitemizin Spor Bahisleri ve Canlı Bahisler sayfalarından, bahislere açılmış olan tüm müsabakaları görebilir ve kuponunuzu oluşturabilirsiniz. Sayfanın solunda spor dallarını ve ülkeleri sıralanmış olarak görebilirsiniz. Bahis yapacağınız karşılaşmayı seçiniz. Açılan seçeneklerden istediğinizi işaretleyiniz. Seçiminiz sayfanın sağ tarafında yer alan kupon bölümüne eklenecektir. Ardından, tutar kısmına yatırmak istediğiniz miktarı yazarak 'Bahis yapın' butonuna tıklayınız. Kuponunuz onaylanmış olarak açık bahisler menüsünde yer alacaktır."
  },
  {
    question: "KULLANICI ADIMI VE ŞİFREMİ UNUTTUM NE YAPABİLİRİM?",
    answer: "Şifrenizi unuttuysanız, şifremi unuttum kısmından mail adresinizi girerek mailinize yeni şifre talep edebilirsiniz. Kullanıcı adınızı öğrenmek için Canlı Destek hattımıza bağlanabilir veya hesabınıza mail adresiniz ile giriş yapabilirsiniz."
  },
  {
    question: "KİŞİSEL BİLGİLERİME NEREDEN ULAŞABİLİRİM VE NASIL DEĞİŞTİREBİLİRİM?",
    answer: "Hesabınıza giriş yaptıktan sonra, profil bölümünden kişisel bilgilerinizi görüntüleyebilir ve güncelleyebilirsiniz. Bazı bilgilerin değiştirilmesi için müşteri hizmetleri ile iletişime geçmeniz gerekebilir."
  },
  {
    question: "BAKİYEMİ NEREDEN GÖREBİLİRİM?",
    answer: "Hesabınıza giriş yaptıktan sonra, sağ üst köşede bulunan bakiye bölümünden güncel bakiyenizi görebilirsiniz. Ayrıca hesap özeti sayfasından detaylı bakiye bilgilerinize ulaşabilirsiniz."
  },
  {
    question: "BEKLEYEN (AÇIK) KUPONLARIMI NEREDEN GÖRÜNTÜLEYEBİLİRİM?",
    answer: "Hesabınıza giriş yaptıktan sonra, 'Bahislerim' veya 'Açık Kuponlar' bölümünden bekleyen kuponlarınızı görüntüleyebilirsiniz. Bu bölümde kuponlarınızın durumunu ve olası kazancınızı takip edebilirsiniz."
  },
  {
    question: "GEÇMİŞ OYUNLARIMI NEREDEN GÖREBİLİRİM?",
    answer: "Hesap özeti veya bahis geçmişi bölümünden tüm geçmiş oyunlarınızı ve bahislerinizi görüntüleyebilirsiniz. Tarih aralığı seçerek filtreleme yapabilirsiniz."
  },
  {
    question: "YAPTIĞIM BİR KUPONU İPTAL EDEBİLİR MİYİM?",
    answer: "Onaylanmış bahisler genellikle iptal edilemez. Ancak bazı durumlarda Cash Out özelliğini kullanarak kuponunuzu erken kapatabilirsiniz. Detaylı bilgi için müşteri hizmetleri ile iletişime geçebilirsiniz."
  },
  {
    question: "CASH OUT NEDİR? NASIL YARARLANABİLİRİM?",
    answer: "Cash Out, bahsiniz sonuçlanmadan önce kuponunuzu kapatmanızı sağlayan bir özelliktir. Bu özellik sayesinde, maç devam ederken kar elde edebilir veya olası kayıplarınızı minimize edebilirsiniz. Cash Out seçeneği uygun olan kuponlarda 'Cash Out' butonu görünür olacaktır."
  },
  {
    question: "KUPONUMDA BULUNAN BİR MAÇ YARIDA KALIRSA KUPONUM NASIL İŞLEM GÖRÜR?",
    answer: "Yarıda kalan maçlar için bahis kuralları geçerlidir. Genellikle maç belirli bir süre içinde tamamlanmazsa, o maç için yapılan bahisler iptal edilir ve oran 1.00 olarak hesaplanır. Kombine kuponlarda diğer maçlar etkilenmez."
  },
  {
    question: "PARA YATIRMA İŞLEMİ NASIL YAPILIR?",
    answer: "Hesabınıza giriş yaptıktan sonra 'Para Yatır' bölümüne giderek size uygun ödeme yöntemini seçebilirsiniz. Banka havalesi, kredi kartı ve diğer ödeme yöntemleri mevcuttur."
  },
  {
    question: "PARA ÇEKME İŞLEMİ NASIL YAPILIR?",
    answer: "Hesabınıza giriş yaptıktan sonra 'Para Çek' bölümünden çekim talebinde bulunabilirsiniz. Çekim işlemleri genellikle 24 saat içinde işleme alınır."
  }
]

export default function FAQPage() {
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const toggleExpand = (index: number) => {
    setExpandedIndexes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        onMenuClick={() => setShowSidebar(true)} 
        onLoginClick={() => setShowLogin(true)}
      />
      
      <main className="px-4 py-6 pb-24">
        <h1 className="text-3xl font-bold mb-4">Sıkça Sorulan Sorular</h1>
        
        <p className="text-gray-300 mb-6">
          Sık Sorulan Sorular aşağıda listelenmiştir. Daha fazlası için{" "}
          <a href="mailto:destek@velobet.com" className="text-yellow-500">
            destek@velobet.com
          </a>{" "}
          maili üzerinden bize ulaşabilirsiniz.
        </p>

        <div className="flex flex-col gap-2">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="bg-zinc-900 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-4 py-4 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-sm pr-4">{item.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    expandedIndexes.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {expandedIndexes.includes(index) && (
                <div className="px-4 pb-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  )
}
