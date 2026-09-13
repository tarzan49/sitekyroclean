const CONSENT_KEY = 'kyro_cookie_consent';

export type ConsentStatus = 'accepted' | 'declined' | null;

export function getConsent(): ConsentStatus {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) ?? null;
  } catch {
    return null;
  }
}

let tagsLoaded = false;
function loadGoogleTags() {
  if (tagsLoaded || typeof window === 'undefined') return;
  tagsLoaded = true;
  window.gtag?.('js', new Date());
  window.gtag?.('config', 'G-T45T5FBNC3');
  window.gtag?.('config', 'AW-17779872363');
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-T45T5FBNC3';
  document.head.appendChild(script);
}

function applyGtagConsent(granted: boolean) {
  if (typeof window === 'undefined' || !window.gtag) return;
  const val = granted ? 'granted' : 'denied';
  window.gtag('consent', 'update', {
    analytics_storage: val,
    ad_storage: val,
    ad_user_data: val,
    ad_personalization: val,
  });
}

export function setConsent(status: 'accepted' | 'declined') {
  try {
    localStorage.setItem(CONSENT_KEY, status);
  } catch { /* storage blocked */ }
  applyGtagConsent(status === 'accepted');
  if (status === 'accepted') loadGoogleTags();
  window.dispatchEvent(new Event('kyro:consent-changed'));
}

/** Call once on app start to restore previously given consent */
export function restoreConsent() {
  const stored = getConsent();
  if (stored !== null) applyGtagConsent(stored === 'accepted');
  if (stored === 'accepted') loadGoogleTags();
}
