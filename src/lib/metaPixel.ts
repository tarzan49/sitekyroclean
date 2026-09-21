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
  if (!canSend() || lastPagePath === path) return false;
  lastPagePath = path;
  window.fbq!('track', 'PageView');
  return true;
}

/** Permite registar a rota atual quando o consentimento é dado a meio da visita. */
export function resetMetaPageViewGuard(): void {
  lastPagePath = null;
}

export function isMetaPixelLoaded(): boolean {
  return loaded;
}


function canSend(): boolean {
  return typeof window !== 'undefined' && loaded && Boolean(window.fbq)
    && readConsentDecision().ads && shouldSendToMeta()
    && !/^\/admin(?:\/|$)/.test(window.location.pathname);
}

/** A click expresses intent, never a conversation or a Lead. */
export function trackMetaContactClick(action: 'whatsapp_click' | 'call_click'): boolean {
  if (!canSend()) return false;
  window.fbq!('trackCustom', action === 'whatsapp_click' ? 'WhatsAppClick' : 'PhoneClick');
  return true;
}

const sentLeads = new Set<string>();
/** Only invoked after CRM persistence. eventID is opaque and stable across retries. */
export function trackMetaLead(leadId: string): boolean {
  if (!canSend() || !/^L-[a-zA-Z0-9-]{1,100}$/.test(leadId)) return false;
  const key = `kyro_meta_lead:${leadId}`;
  if (sentLeads.has(leadId)) return false;
  try { if (localStorage.getItem(key)) return false; } catch { /* in-memory guard remains */ }
  window.fbq!('track', 'Lead', {}, { eventID: `lead:${leadId}` });
  sentLeads.add(leadId);
  try { localStorage.setItem(key, String(Date.now())); } catch { /* in-memory guard remains */ }
  return true;
}
