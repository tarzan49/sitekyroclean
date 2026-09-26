import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";
import "./styles/typography.css";
import "./styles/surfaces.css";
import { initErrorTracking } from "./lib/errorTracking";
import { restoreConsent } from "./lib/consent";

import { initContactTracking } from './lib/quizTracking';
initContactTracking();

// Lê o endereço de entrada antes de qualquer navegação. Ver o porquê no módulo.
import { initAdsWhatsAppMessage } from './lib/adsWhatsAppMessage';
initAdsWhatsAppMessage();

// Depois de um deploy, os chunks do build anterior deixam de existir (sem o
// catch-all SPA respondem 404). Quem tinha uma página aberta e navegava ou
// abria o quiz ficava com a página em branco. O Vite avisa com
// `vite:preloadError`: recarrega uma vez para ir buscar o build novo. O guarda
// na sessão impede um ciclo de recargas se a falha for outra; sem storage não
// se recarrega, pela mesma razão.
window.addEventListener('vite:preloadError', (event) => {
  const key = 'kyro_chunk_reload_at';
  try {
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

// Start error tracking (all environments)
initErrorTracking();

// Restore prior consent decision so gtag fires correctly on return visits
restoreConsent();

// Initialize analytics (production: Web Vitals + scroll tracking)
if (import.meta.env.PROD) {
  import('./lib/analytics').then(({ initWebVitalsTracking, initScrollTracking }) => {
    // Start Core Web Vitals tracking after page load
    if (document.readyState === 'complete') {
      initWebVitalsTracking();
      initScrollTracking();
    } else {
      window.addEventListener('load', () => {
        initWebVitalsTracking();
        initScrollTracking();
      });
    }
  });
}

// Development: Measure Web Vitals for debugging
if (import.meta.env.DEV) {
  import('./lib/performance').then(({ measureWebVitals }) => {
    measureWebVitals();
  });
}

// Render app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
