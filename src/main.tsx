import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initErrorTracking } from "./lib/errorTracking";
import { restoreConsent } from "./lib/consent";

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
