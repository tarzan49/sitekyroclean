import { getConsent } from './consent';
import { createEventDelivery, sendStoredEvent } from './eventDelivery';
import { sendGtagEvent } from './gtag';
import { getAttributionSnapshot } from './leadAttribution';

export const IS_PRODUCTION = typeof window !== 'undefined' && window.location.hostname === 'cleansolutions.com.pt';
export const isPublicTrackingPage = () => !/^\/admin(?:\/|$)/.test(window.location.pathname);
let storage: Storage | undefined;
try { storage = window.sessionStorage; } catch { /* private browsing */ }
let outboxStorage: Storage | undefined;
try { outboxStorage = window.localStorage; } catch { /* unavailable */ }
let reported = false;
const outbox = createEventDelivery(async e => { if (getConsent() === 'accepted') await sendStoredEvent(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, e); }, outboxStorage, message => {
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
  // A atribuição vem da fotografia partilhada com os leads, em vez de uma
  // segunda leitura do URL aqui: assim uma sessão que entrou por um anúncio e
  // depois navegou para uma página sem parâmetros continua a carregar o
  // `gclid` e a campanha em cada evento, que é o que liga uma sessão do Google
  // Ads às páginas por onde passou.
  const ads = getAttributionSnapshot();
  return { session_id: session.id, referrer: session.referrer, utm_source: session.utm_source, utm_medium: session.utm_medium,
    utm_campaign: session.utm_campaign, page_path: window.location.pathname,
    device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    utm_term: ads?.keyword ?? null, utm_content: ads?.creative_id ?? null,
    gclid: ads?.gclid ?? null, gbraid: ads?.gbraid ?? null, wbraid: ads?.wbraid ?? null,
    campaign_id: ads?.campaign_id ?? null, ad_group_id: ads?.ad_group_id ?? null,
    keyword: ads?.keyword ?? null, match_type: ads?.match_type ?? null, creative_id: ads?.creative_id ?? null,
    ads_device: ads?.ads_device ?? null, network: ads?.network ?? null,
    landing_page: ads?.landing_page ?? null, is_paid: ads?.is_paid ?? false };
}
function emit(payload: Record<string, unknown>) {
  if (getConsent() !== 'accepted' || !IS_PRODUCTION || /^\/admin(?:\/|$)/.test(String(payload.page_path ?? window.location.pathname))) return;
  try { outbox.enqueue({ ...context(), ...payload }); } catch (error) { console.warn('[Tracking] Could not enqueue event', error); }
}
export function trackQuizEvent(params: { step: number; action: 'start' | 'complete' | 'abandon'; service?: string; city?: string; value?: number; service_type?: string; session_id?: string }) { emit(params); }

/**
 * Uma página vista, para o painel interno.
 *
 * Existe em paralelo com o `page_view` do GA4 porque respondem a perguntas
 * diferentes: o do GA4 alimenta os relatórios da Google, este fica numa tabela
 * que podemos cruzar com a tabela `leads` para calcular a taxa de conversão de
 * uma landing page — coisa que o GA4 não faz, porque não sabe o que é um lead
 * válido nem quanto faturou.
 *
 * Uma linha por caminho e por sessão: recarregar a mesma página dez vezes não
 * inventa dez visitas, e a taxa de conversão continua a ser leads por sessão.
 */
const seenPaths = new Set<string>();
export function trackPageViewEvent(path = window.location.pathname) {
  if (seenPaths.has(path)) return;
  seenPaths.add(path);
  emit({ action: 'page_view', step: 0, page_path: path });
}

/** Contexto extra que o delegado global de cliques não consegue adivinhar. */
export interface ContactContext { service?: string; city?: string }

let delegatedClick = false;
function contact(action: 'whatsapp_click' | 'call_click', source: string, ctx?: ContactContext) {
  if (!isPublicTrackingPage()) return;
  // O lado da Google passa pela camada central, que tem as suas próprias portas
  // (ambiente, modo de depuração) e é o único sítio de onde saem eventos para o
  // GA4. O nome `phone_click` é o do GA4; na tabela `quiz_events` o mesmo clique
  // continua a chamar-se `call_click`, que é o que a restrição CHECK aceita
  // desde 2026-08 e onde está o histórico do painel interno.
  sendGtagEvent(action === 'whatsapp_click' ? 'whatsapp_click' : 'phone_click', {
    page_path: window.location.pathname, cta_location: source, service: ctx?.service, city: ctx?.city,
  });
  if (getConsent() !== 'accepted' || !IS_PRODUCTION) return;
  // `service` guarda a origem do clique (header, footer, page:/…) desde 2026-08
  // e é por aí que o painel agrupa "cliques por origem". O serviço a sério,
  // quando é conhecido, vai em `service_type`, que estava livre para cliques.
  emit({ action, step: 0, service: source, city: ctx?.city, service_type: ctx?.service });
}
export function trackWhatsAppClick(source: string, ctx?: ContactContext) { if (!delegatedClick) contact('whatsapp_click', source, ctx); }
export function trackCallClickEvent(source: string, ctx?: ContactContext) { if (!delegatedClick) contact('call_click', source, ctx); }
export function trackSessionTime(seconds: number, page_path = window.location.pathname) { if (seconds > 0) emit({ action: 'session_time', step: 0, value: seconds, page_path }); }

export function initContactTracking() {
  if (!IS_PRODUCTION) return () => {};
  if (getConsent() === 'accepted') context();
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
  const consentChanged = () => {
    if (getConsent() !== 'accepted') { session = undefined!; try { storage?.removeItem('kyro_visit_v2'); } catch { /* unavailable */ } }
    flush();
  };
  window.addEventListener('kyro:consent-changed', consentChanged);
  window.addEventListener('online', flush);
  // Última oportunidade de entregar o que está na outbox: a seguir a isto o
  // separador pode ser morto sem nunca voltar a correr JavaScript. O `fetch`
  // de `sendStoredEvent` usa `keepalive`, por isso sobrevive ao descarregamento
  // da página; o que não for entregue fica em localStorage e é retentado na
  // visita seguinte.
  const flushOnHidden = () => { if (document.visibilityState === 'hidden') flush(); };
  document.addEventListener('visibilitychange', flushOnHidden);
  const interval = window.setInterval(flush, 30000);
  flush();
  return () => { document.removeEventListener('click', click, true); document.removeEventListener('auxclick', click, true); window.removeEventListener('online', flush); window.removeEventListener('kyro:consent-changed', consentChanged); document.removeEventListener('visibilitychange', flushOnHidden); clearInterval(interval); };
}
