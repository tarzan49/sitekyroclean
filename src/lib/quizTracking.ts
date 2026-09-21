import { getConsent } from './consent';
import { createEventDelivery, sendStoredEvent } from './eventDelivery';
import { sendGtagEvent } from './gtag';
import { trackMetaContactClick } from './metaPixel';
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
  return { session_id: session.id, referrer: session.referrer, utm_source: ads?.last_source ?? session.utm_source, utm_medium: ads?.last_medium ?? session.utm_medium,
    utm_campaign: ads?.last_campaign ?? session.utm_campaign, page_path: window.location.pathname,
    device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    utm_term: ads?.keyword ?? null, utm_content: ads?.creative_id ?? null,
    gclid: ads?.gclid ?? null, gbraid: ads?.gbraid ?? null, wbraid: ads?.wbraid ?? null,
    meta_campaign_id: ads?.meta_campaign_id ?? null, meta_adset_id: ads?.meta_adset_id ?? null,
    meta_ad_id: ads?.meta_ad_id ?? null, meta_placement: ads?.meta_placement ?? null,
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

/**
 * Um clique físico, um evento lógico.
 *
 * A guarda é o **próprio objeto do evento**, não uma bandeira temporal. A versão
 * anterior punha `delegatedClick = true` e repunha-a com `queueMicrotask`, o que
 * funcionava num `dispatchEvent` chamado a partir de código (a pilha de
 * JavaScript fica ocupada durante todo o despacho) e falhava num clique a sério:
 * o browser invoca cada listener a partir de código nativo, a pilha esvazia-se
 * entre eles, o ponto de verificação de microtarefas corre, e a guarda já estava
 * desligada quando o `onClick` do componente corria. Medido em produção a
 * 2026-09-18: cada clique em `tel:` e em `wa.me` saía a dobrar.
 *
 * Um `WeakSet` sobre o evento não tem essa janela: o mesmo clique é o mesmo
 * objeto, dois cliques são dois objetos, e não há tempo nenhum envolvido — dois
 * cliques reais seguidos continuam a contar duas vezes. As entradas
 * desaparecem com o evento, sem crescimento de memória.
 */
const handledClicks = new WeakSet<Event>();

function contact(action: 'whatsapp_click' | 'call_click', source: string, ctx?: ContactContext, sourceEvent?: Event) {
  if (!isPublicTrackingPage()) return;
  if (sourceEvent) {
    if (handledClicks.has(sourceEvent)) return;
    handledClicks.add(sourceEvent);
  }
  // O lado da Google passa pela camada central, que tem as suas próprias portas
  // (ambiente, modo de depuração) e é o único sítio de onde saem eventos para o
  // GA4. O nome `phone_click` é o do GA4; na tabela `quiz_events` o mesmo clique
  // continua a chamar-se `call_click`, que é o que a restrição CHECK aceita
  // desde 2026-08 e onde está o histórico do painel interno.
  trackMetaContactClick(action);
  sendGtagEvent(action === 'whatsapp_click' ? 'whatsapp_click' : 'phone_click', {
    page_path: window.location.pathname, cta_location: source, service: ctx?.service, city: ctx?.city,
  });
  if (getConsent() !== 'accepted' || !IS_PRODUCTION) return;
  // Convenção legada, mantida de propósito: `service` guarda a **origem** do
  // clique (`header_desktop`, `sticky_bar`, `page:/…`) desde 2026-08, e é por aí
  // que o painel interno agrupa "cliques por origem" — ver os rótulos em
  // `QuizMetricsPanel.tsx`. Todo o histórico de `quiz_events` está escrito
  // assim, por isso renomear a coluna partia os números anteriores sem ganho
  // nenhum. O serviço a sério, quando é conhecido, vai em `service_type`.
  emit({ action, step: 0, service: source, city: ctx?.city, service_type: ctx?.service });
}

/**
 * Entradas manuais, para um CTA de contacto que **não** seja um `<a href>`.
 *
 * Hoje não existe nenhum: todos os botões de WhatsApp e de telefone do site são
 * âncoras, e por isso são medidos uma única vez pelo delegado global (ver
 * `initContactTracking`). Continuam exportadas como escape para um caso futuro
 * — e nesse caso **passa-se o evento original** (`e.nativeEvent` no React), que
 * é o que garante que o delegado e o componente não contam duas vezes.
 */
export function trackWhatsAppClick(source: string, ctx?: ContactContext, sourceEvent?: Event) { contact('whatsapp_click', source, ctx, sourceEvent); }
export function trackCallClickEvent(source: string, ctx?: ContactContext, sourceEvent?: Event) { contact('call_click', source, ctx, sourceEvent); }
export function trackSessionTime(seconds: number, page_path = window.location.pathname) { if (seconds > 0) emit({ action: 'session_time', step: 0, value: seconds, page_path }); }

/**
 * O delegado global de cliques: **o único responsável** por medir um clique de
 * contacto.
 *
 * Todos os CTA de WhatsApp e de telefone do site são `<a href>`, por isso este
 * delegado apanha-os todos, incluindo os que aparecem depois (navegação SPA,
 * remontagem de um componente, menu móvel que abre). Os componentes não chamam
 * nada: declaram só de onde vem o clique, em `data-tracking-source`.
 *
 * Regra de `cta_location`, por esta ordem:
 *
 *   1. `data-tracking-source` na âncora (o que o componente declara);
 *   2. `header` ou `footer`, se a âncora estiver dentro desse elemento;
 *   3. `page:<caminho>`.
 *
 * O vocabulário de origens (`header_desktop`, `header_mobile`,
 * `header_mobile_menu`, `en_header`, `sticky_bar`, `hero`, e os dinâmicos das
 * páginas de SEO) é o mesmo de antes de propósito: é o que está escrito no
 * histórico de `quiz_events` e o que `QuizMetricsPanel.tsx` sabe rotular.
 *
 * Nada aqui decide se o evento sai: isso é de `sendGtagEvent` (consentimento
 * para a finalidade, ambiente, tag carregada) e de `emit` (consentimento e
 * produção). Por isso o delegado é ligado sempre, e não só em produção — a
 * porta do ambiente já existe, uma vez, e mais abaixo.
 */
export function initContactTracking() {
  if (getConsent() === 'accepted') context();
  const click = (event: MouseEvent) => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || !isPublicTrackingPage()) return;
    const url = new URL(link.getAttribute('href')!, window.location.href);
    const action = url.protocol === 'tel:' ? 'call_click' : ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname) || url.protocol === 'whatsapp:' ? 'whatsapp_click' : null;
    if (!action) return;
    const source = link.getAttribute('data-tracking-source') || (link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : `page:${window.location.pathname}`);
    // O evento vai junto: é ele a chave de deduplicação. A navegação não é
    // tocada — nem `preventDefault`, nem `stopPropagation` —, por isso o `tel:`
    // e o `wa.me` seguem exatamente como seguiam.
    contact(action, source, undefined, event);
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
