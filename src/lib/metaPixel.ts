import { META_PIXEL_ID, shouldSendToMeta } from '@/constants/tracking';
import { readConsentDecision } from './consentStorage';

const SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';
let loaded = false;
let lastPagePath: string | null = null;

function ensureFbq(): NonNullable<Window['fbq']> {
  if (window.fbq) return window.fbq;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as NonNullable<Window['fbq']>;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

/** Carrega e inicializa o Pixel apenas depois do consentimento de publicidade. */
export function loadMetaPixel(): void {
  if (loaded || typeof window === 'undefined' || !readConsentDecision().ads || !shouldSendToMeta()) return;
  loaded = true;

  ensureFbq()('init', META_PIXEL_ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = SCRIPT_URL;
  document.head.appendChild(script);
}

/** Regista uma PageView por rota pública da SPA, sem duplicar a mesma rota. */
export function trackMetaPageView(path = window.location.pathname): boolean {
  if (!loaded || !readConsentDecision().ads || !shouldSendToMeta() || !window.fbq || lastPagePath === path) return false;
  lastPagePath = path;
  window.fbq('track', 'PageView');
  return true;
}

/** Permite registar a rota atual quando o consentimento é dado a meio da visita. */
export function resetMetaPageViewGuard(): void {
  lastPagePath = null;
}

export function isMetaPixelLoaded(): boolean {
  return loaded;
}
