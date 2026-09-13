import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";
import { initErrorTracking } from "./lib/errorTracking";
import { restoreConsent } from "./lib/consent";

import { initContactTracking } from './lib/quizTracking';
initContactTracking();

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

// Local typography comparison, excluded from production.
if (import.meta.env.DEV) {
  let preview = new URLSearchParams(window.location.search).get('fonte');
  try {
    if (preview === 'nova' || preview === 'atual') {
      sessionStorage.setItem('kyro-font-preview', preview);
    } else {
      preview = sessionStorage.getItem('kyro-font-preview');
    }
  } catch {
    // Explicit comparison URLs still work if browser storage is unavailable.
  }
  if (preview === 'nova' || preview === 'atual') {
    import('./dev/fontPreview').then(({ initFontPreview }) => initFontPreview(preview));
  }
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
