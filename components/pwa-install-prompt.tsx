'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMacOs, setIsMacOs] = useState(false);
  const [showMacOsGuide, setShowMacOsGuide] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // macOS/Safari kontrolü
    const userAgent = navigator.userAgent.toLowerCase();
    const isMac = /macintosh|mac os x/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|firefox/.test(userAgent);
    
    if (isMac && isSafari) {
      setIsMacOs(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Kullanıcı cevabı: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleMacOsGuide = () => {
    setShowMacOsGuide(true);
    setShowPrompt(true); // prompt'u açık tut
  };

  if (showMacOsGuide && isMacOs) {
    return <MacOsInstallGuide onClose={() => setShowMacOsGuide(false)} />;
  }

  // macOS Safari için manuel prompt
  if (isMacOs) {
    return (
      <div className="fixed bottom-24 right-4 z-50 max-w-xs">
        <div className="bg-[#00d4b4] text-black rounded-lg shadow-lg p-4 flex items-start gap-3">
          <Download className="w-5 h-5 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-bold text-sm mb-2">VELOBET'i Ana Ekrana Ekle</p>
            <p className="text-xs mb-3 opacity-90">Mobil uygulama gibi kullan - Safari'de Paylaş menüsünü aç</p>
            <div className="flex gap-2">
              <button
                onClick={handleMacOsGuide}
                className="flex-1 bg-black text-[#00d4b4] font-bold text-xs py-2 rounded hover:opacity-90"
              >
                Nasıl Yapılır?
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-3 py-2 hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 max-w-xs">
      <div className="bg-[#00d4b4] text-black rounded-lg shadow-lg p-4 flex items-start gap-3">
        <Download className="w-5 h-5 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <p className="font-bold text-sm mb-2">VELOBET'i Yükle</p>
          <p className="text-xs mb-3 opacity-90">Mobil uygulama gibi kullan - hızlı erişim için ana ekrana ekle</p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-black text-[#00d4b4] font-bold text-xs py-2 rounded hover:opacity-90"
            >
              Yükle
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-3 py-2 hover:opacity-80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MacOsInstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background border border-primary/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-primary/20 to-primary/10 border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Mac'a VELOBET Ekle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-border rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Adım 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="font-bold text-lg text-foreground">Safari Paylaş Menüsünü Aç</h3>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm text-muted-foreground border border-border/50">
              <p>👆 Safari'nin üst kısmındaki <span className="font-mono bg-border px-2 py-1 rounded text-foreground font-bold">⇧</span> (paylaş) ikonuna tıkla</p>
            </div>
          </div>

          {/* Adım 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="font-bold text-lg text-foreground">Menüde "Dock'a Ekle" Bul</h3>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm text-muted-foreground border border-border/50">
              <p>↔️ Paylaş menüsü açılacak - seçenekleri sağa kaydır</p>
              <p className="font-semibold text-primary">"Dock'a Ekle" seçeneğini bul ve tıkla</p>
            </div>
          </div>

          {/* Adım 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="font-bold text-lg text-foreground">Uygulamayı Ekle</h3>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm text-muted-foreground border border-border/50">
              <p>✏️ Uygulama adını (VELOBET) onayla</p>
              <p className="font-semibold text-primary">"Ekle" butonuna tıkla</p>
            </div>
          </div>

          {/* Başlat */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/60 text-background flex items-center justify-center font-bold text-sm">✓</div>
              <h3 className="font-bold text-lg text-foreground">Başlat</h3>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg space-y-2 text-sm text-foreground border border-primary/30">
              <p>🚀 Dock'tan VELOBET ikonuna tıkla</p>
              <p>📱 Tam ekran mobil uygulaması gibi açılacak</p>
              <p>⚡ Hızlı erişim: Cmd+Space → VELOBET yaz</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-xs text-muted-foreground text-center">
            Sorular? Safari'de cmd+, (virgül) tuşuna bas → Gelişmiş ayarlar → PWA'yı etkinleştir
          </div>
        </div>
      </div>
    </div>
  );
}
