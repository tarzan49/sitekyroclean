const CONSENT_KEY = 'kyro_cookie_consent';

export type ConsentStatus = 'accepted' | 'declined' | null;

export function getConsent(): ConsentStatus {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) ?? null;
  } catch {
    return null;
  }
}

export function hasConsent(): boolean {
  return getConsent() === 'accepted';
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
}

/** Call once on app start to restore previously given consent */
export function restoreConsent() {
  const stored = getConsent();
  if (stored !== null) applyGtagConsent(stored === 'accepted');
}
