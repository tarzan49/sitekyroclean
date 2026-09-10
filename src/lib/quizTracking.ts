import { createEventDelivery, sendStoredEvent } from './eventDelivery';

export const IS_PRODUCTION = typeof window !== 'undefined' && window.location.hostname === 'cleansolutions.com.pt';
export const isPublicTrackingPage = () => !/^\/admin(?:\/|$)/.test(window.location.pathname);
let storage: Storage | undefined;
try { storage = window.sessionStorage; } catch { /* private browsing */ }
let outboxStorage: Storage | undefined;
try { outboxStorage = window.localStorage; } catch { /* unavailable */ }
let reported = false;
const outbox = createEventDelivery(e => sendStoredEvent(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, e), outboxStorage, message => {
  if (reported) return;
  reported = true;
  void import('./errorTracking').then(({ logError }) => logError({ message, source: 'TrackingDelivery', severity: 'warning' }));
});
export const getTrackingDeliveryStatus = outbox.status;

let session: { id: string; last: number; referrer: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null };
function context() {
  const now = Date.now();
  if (!session) { try { session = JSON.parse(storage?.getItem('kyro_visit_v2') || 'null'); } catch { /* unavailable */ } }
  if (!session || now - session.last > 30 * 60000) {
    const params = new URLSearchParams(window.location.search);
    session = { id: `v2:${crypto.randomUUID()}`, last: now, referrer: document.referrer ? new URL(document.referrer).origin : null,
      utm_source: params.get('utm_source'), utm_medium: params.get('utm_medium'), utm_campaign: params.get('utm_campaign') };
  }
  session.last = now;
  try { storage?.setItem('kyro_visit_v2', JSON.stringify(session)); } catch { /* unavailable */ }
  return { session_id: session.id, referrer: session.referrer, utm_source: session.utm_source, utm_medium: session.utm_medium,
    utm_campaign: session.utm_campaign, page_path: window.location.pathname,
    device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop' };
}
function emit(payload: Record<string, unknown>) {
  if (!IS_PRODUCTION || /^\/admin(?:\/|$)/.test(String(payload.page_path ?? window.location.pathname))) return;
  try { outbox.enqueue({ ...context(), ...payload }); } catch (error) { console.warn('[Tracking] Could not enqueue event', error); }
}
export function trackQuizEvent(params: { step: number; action: 'start' | 'complete' | 'abandon'; service?: string; city?: string; value?: number; service_type?: string; session_id?: string }) { emit(params); }
let delegatedClick = false;
function contact(action: 'whatsapp_click' | 'call_click', source: string) {
  if (!IS_PRODUCTION || !isPublicTrackingPage()) return;
  emit({ action, step: 0, service: source });
  try { window.gtag?.('event', action, { event_category: 'engagement', event_label: source, page_path: window.location.pathname }); } catch { /* contact navigation must remain available */ }
}
export function trackWhatsAppClick(source: string) { if (!delegatedClick) contact('whatsapp_click', source); }
export function trackCallClickEvent(source: string) { if (!delegatedClick) contact('call_click', source); }
export function trackSessionTime(seconds: number, page_path = window.location.pathname) { if (seconds > 0) emit({ action: 'session_time', step: 0, value: seconds, page_path }); }

export function initContactTracking() {
  if (!IS_PRODUCTION) return () => {};
  context();
  const click = (event: MouseEvent) => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || !isPublicTrackingPage()) return;
    const url = new URL(link.getAttribute('href')!, window.location.href);
    const action = url.protocol === 'tel:' ? 'call_click' : ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname) || url.protocol === 'whatsapp:' ? 'whatsapp_click' : null;
    if (!action) return;
    const source = link.getAttribute('data-tracking-source') || (link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : `page:${window.location.pathname}`);
    contact(action, source);
    delegatedClick = true;
    queueMicrotask(() => { delegatedClick = false; });
  };
  document.addEventListener('click', click, true);
  document.addEventListener('auxclick', click, true);
  const flush = () => { void outbox.flush(); };
  window.addEventListener('online', flush);
  const interval = window.setInterval(flush, 30000);
  flush();
  return () => { document.removeEventListener('click', click, true); document.removeEventListener('auxclick', click, true); window.removeEventListener('online', flush); clearInterval(interval); };
}
