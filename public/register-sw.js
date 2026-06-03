// Service Worker - Android ve iOS uyumlu
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Kisa gecikme ile register et - Android'de daha stabil
    setTimeout(() => {
      navigator.serviceWorker.register('/service-worker.js', { 
        updateViaCache: 'none',
        scope: '/'
      })
      .then((registration) => {
        // Yeni SW varsa hemen devreye al
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        // SW hata verirse sessizce devam et - site calismaya devam etsin
        console.log('SW registration skipped');
      });
    }, 1000);
  });

  // SW degisince sayfayi yenile - sadece kullanici interaksiyon yaptiysa
  let refreshing = false;
  let userInteracted = false;
  
  ['click', 'touchstart', 'keydown'].forEach(event => {
    window.addEventListener(event, () => { userInteracted = true; }, { once: true });
  });
  
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing && userInteracted) {
      refreshing = true;
      window.location.reload();
    }
  });
}
