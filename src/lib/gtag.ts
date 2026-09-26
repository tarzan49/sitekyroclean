/**
 * Camada única sobre a Google tag (`gtag.js`).
 *
 * Regra do ficheiro: **nenhum componente chama `window.gtag` diretamente.** Uma
 * chamada solta num componente React dispara outra vez a cada re-render, não
 * sabe se o consentimento existe, não sabe se está em produção ou num preview,
 * e não deixa rasto quando falha. Tudo passa por aqui, que trata das quatro
 * coisas de uma vez.
 *
 * Uma só cópia da biblioteca é carregada, com o Measurement ID do GA4, e o
 * Google Ads entra como destino adicional por `config` — que é o que a Google
 * documenta para juntar Ads a uma instalação de gtag.js que já existe. O
 * `GT-M6XTKMC7` **não** é carregado à parte: ver a nota em
 * `src/constants/tracking.ts`.
 */
import {
  GA4_MEASUREMENT_ID, GOOGLE_ADS_ID, CONSENT_MODE,
  isDebugMode, shouldSendToGoogle, trackingEnv,
} from '@/constants/tracking';
import { readConsentDecision, type ConsentDecision } from './consentStorage';

export type ConsentSignals = {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
};

/**
 * Os quatro sinais do Consent Mode v2, derivados das **duas** finalidades.
 *
 * `analytics_storage` vem da medição de audiência; os outros três vêm da
 * publicidade. É esta separação que impede que uma aceitação de análise se
 * transforme sozinha em autorização de publicidade — mesmo que hoje o banner
 * pergunte as duas coisas de uma vez e as respostas coincidam sempre.
 */
export function consentSignals(decision: ConsentDecision | boolean): ConsentSignals {
  const value = typeof decision === 'boolean'
    ? { analytics: decision, ads: decision }
    : decision;
  return {
    analytics_storage: value.analytics ? 'granted' : 'denied',
    ad_storage: value.ads ? 'granted' : 'denied',
    ad_user_data: value.ads ? 'granted' : 'denied',
    ad_personalization: value.ads ? 'granted' : 'denied',
  };
}

/**
 * `dataLayer`/`gtag` são criados pelo script inline do `index.html`, que corre
 * antes de qualquer módulo para poder declarar o `consent default` antes de a
 * Google ver o primeiro pedido. Isto é só a rede de segurança para quem carrega
 * este módulo noutro contexto (testes, prerender), e nunca substitui o que já lá
 * estiver.
 */
function ensureGtag(): (...args: unknown[]) => void {
  if (typeof window === 'undefined') return () => {};
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtagShim(...args: unknown[]) { window.dataLayer!.push(args); };
  }
  return window.gtag;
}

let tagsLoaded = false;

/**
 * Carrega a biblioteca e regista os destinos. Idempotente: chamar duas vezes
 * (aceitar duas vezes, restaurar e aceitar) não põe um segundo `<script>` na
 * página nem duplica os `config`.
 */
export function loadGoogleTags(): void {
  if (tagsLoaded || typeof window === 'undefined' || !shouldSendToGoogle()) return;
  tagsLoaded = true;
  const gtag = ensureGtag();
  gtag('js', new Date());

  // `send_page_view: false` e o `page_view` passa a ser enviado por nós, em
  // `trackPageView`. Sem isto, o `config` enviava um `page_view` do URL de
  // entrada e mais nenhum: numa SPA, mudar de rota não recarrega a página, por
  // isso o GA4 via só a primeira. Tirar o automático e enviar todos à mão é o
  // que faz as 16.000 páginas deste site aparecerem no relatório de páginas,
  // em vez de só as de entrada.
  gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false });

  // Google Ads como destino adicional do mesmo contentor. `allow_enhanced_conversions`
  // fica ligado do lado do site; a ação de conversão no Google Ads tem de o ter
  // ligado também, senão é ignorado sem erro.
  gtag('config', GOOGLE_ADS_ID, { allow_enhanced_conversions: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  if (isDebugMode()) console.info('[Tracking] Google tag carregada', { GA4_MEASUREMENT_ID, GOOGLE_ADS_ID, env: trackingEnv() });
}

/** Usado pelo painel de saúde do tracking e pelos testes. */
export function areTagsLoaded(): boolean { return tagsLoaded; }

/** `consent update` — o sinal que a Google lê a seguir a uma decisão da pessoa. */
export function updateConsent(decision: ConsentDecision | boolean): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  const signals = consentSignals(decision);
  window.gtag('consent', 'update', signals);
  if (isDebugMode()) console.info('[Tracking] consent update', signals);
}

/**
 * No modo avançado (o que está em vigor desde 2026-09-26) a biblioteca carrega
 * já, com tudo negado. Nesse estado a Google não escreve cookies nem guarda
 * identificadores — só recebe pings sem cookies. No modo básico isto não faz
 * nada e a biblioteca fica à espera da aceitação.
 */
export function applyConsentMode(anyConsentGiven: boolean): void {
  if (anyConsentGiven || CONSENT_MODE === 'advanced') loadGoogleTags();
}

// ── Eventos ──────────────────────────────────────────────────────────────────

export type EventParams = Record<string, string | number | boolean | undefined>;

/** Tira os `undefined` — o GA4 regista-os como a string "undefined". */
function compact(params?: EventParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== '') out[key] = value;
  }
  return out;
}

/** Para que finalidade é este evento. Decide qual consentimento é preciso. */
export type EventPurpose = 'analytics' | 'ads';

/**
 * Se a decisão atual permite enviar um evento desta finalidade.
 *
 * A tag estar carregada **não** chega. Quem aceita e depois muda de ideias
 * deixa a biblioteca na página — ela não se desinstala — e sem esta verificação
 * os nossos eventos continuavam a sair depois de a pessoa ter recusado. Foi o
 * que aconteceu na primeira verificação em browser: recusar as cookies a meio
 * da visita, e uma `page_view` e uma conversão do Google Ads saírem a seguir.
 *
 * No modo avançado enviar com tudo negado é exatamente o objetivo — são pings
 * sem cookies e sem identificadores, e é assim que a modelação da Google
 * funciona —, por isso aí a porta está aberta de propósito.
 */
function consentAllowsSending(purpose: EventPurpose): boolean {
  if (CONSENT_MODE === 'advanced') return true;
  const decision = readConsentDecision();
  return purpose === 'ads' ? decision.ads : decision.analytics;
}

/**
 * Envia um evento para os destinos configurados.
 *
 * Quatro portas, e nenhuma é opcional: consentimento **para esta finalidade**,
 * ambiente (produção, ou autorização explícita com identificadores de teste), a
 * biblioteca estar carregada, e o `gtag` existir. O modo de depuração escreve o
 * que teria acontecido e não abre porta nenhuma.
 */
export function sendGtagEvent(name: string, params?: EventParams, purpose: EventPurpose = 'analytics'): boolean {
  const payload = compact(params);
  const decision = readConsentDecision();
  const willSend = consentAllowsSending(purpose) && shouldSendToGoogle() && tagsLoaded;
  if (isDebugMode()) {
    console.info('[Tracking] event', name, payload, {
      purpose, env: trackingEnv(), consent: { analytics: decision.analytics, ads: decision.ads }, tagsLoaded, willSend,
    });
  }
  if (!willSend || typeof window === 'undefined' || !window.gtag) return false;
  window.gtag('event', name, payload);
  return true;
}

/**
 * Conversão do Google Ads.
 *
 * Sem etiqueta configurada não envia nada e devolve `false` — e é isso que o
 * painel de marketing mostra. A alternativa seria enviar para
 * `AW-18457115875/` sem etiqueta, que a Google aceita em silêncio e descarta:
 * ficava tudo com ar de funcionar e sem uma única conversão registada.
 *
 * `transaction_id` é o `lead_id`. É o que faz a Google descartar um segundo
 * envio da mesma conversão — um refresh da página de obrigado, um retry de
 * rede — em vez de a contar duas vezes.
 */
export function sendAdsConversion(options: {
  label?: string;
  value?: number;
  currency?: string;
  transactionId?: string;
}): boolean {
  if (!options.label) {
    if (isDebugMode()) console.warn('[Tracking] conversão do Ads ignorada: falta a etiqueta (conversion label)');
    return false;
  }
  // Finalidade `ads`: uma conversão do Google Ads não sai com consentimento de
  // análise apenas.
  return sendGtagEvent('conversion', {
    send_to: `${GOOGLE_ADS_ID}/${options.label}`,
    value: options.value,
    currency: options.currency ?? 'EUR',
    transaction_id: options.transactionId,
  }, 'ads');
}

// ── Deduplicação ─────────────────────────────────────────────────────────────

const FIRED_KEY = 'kyro_fired_events_v1';
const FIRED_TTL = 7 * 86400000;

/**
 * Marca uma chave como já disparada e diz se era nova.
 *
 * Vive em `localStorage` de propósito: o caso que interessa é a pessoa fazer
 * refresh na `/obrigado` ou voltar lá pelo histórico, e `sessionStorage`
 * sobrevive a isso na mesma aba mas não a uma aba nova. Com o `lead_id` como
 * chave, o mesmo pedido nunca conta duas vezes, venha por onde vier.
 *
 * Se o armazenamento estiver bloqueado, devolve `true` (deixa passar): perder
 * uma conversão real por causa de um browser em modo privado é pior do que
 * contar uma a dobrar num caso raro — e o `transaction_id` ainda apanha essa
 * duplicação do lado da Google.
 */
export function markFiredOnce(key: string): boolean {
  try {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}') as Record<string, number>;
    const pruned: Record<string, number> = {};
    for (const [firedKey, at] of Object.entries(stored)) {
      if (now - at < FIRED_TTL) pruned[firedKey] = at;
    }
    if (pruned[key]) {
      if (isDebugMode()) console.info('[Tracking] evento repetido ignorado', key);
      localStorage.setItem(FIRED_KEY, JSON.stringify(pruned));
      return false;
    }
    pruned[key] = now;
    localStorage.setItem(FIRED_KEY, JSON.stringify(pruned));
    return true;
  } catch {
    return true;
  }
}
