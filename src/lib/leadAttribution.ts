import { getConsent } from './consent';

const KEY = 'kyro_lead_attribution_v1';
const FIRST_TOUCH_KEY = 'kyro_first_touch_v1';

/** Quanto tempo uma primeira visita continua a contar como origem de um lead. */
const FIRST_TOUCH_TTL = 90 * 86400000;
/** Uma visita sem nova campanha continua a mesma visita durante meia hora. */
const SESSION_TTL = 30 * 60000;

/**
 * Parâmetros de campanha aceites, por nome exato no URL.
 *
 * Os três primeiros blocos são: UTMs, identificadores de clique (`gclid` do
 * Google Ads com auto-tagging, `gbraid`/`wbraid` para tráfego de app e iOS onde
 * já não há `gclid`, `fbclid` do Meta) e os ValueTrack do Google Ads, que só
 * existem se estiverem escritos no "Final URL suffix" da conta — ver
 * `docs/tracking-google-ads.md` para o valor exato a colar lá.
 *
 * **Só entram parâmetros oficialmente suportados.** Um parâmetro inventado
 * nunca é preenchido pela Google e fica para sempre vazio no painel, a parecer
 * um dado em falta em vez de um dado que nunca existiu.
 */
const campaignKeys = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'gbraid', 'wbraid', 'fbclid',
  'campaignid', 'adgroupid', 'keyword', 'matchtype', 'creative', 'device', 'network',
] as const;

type CampaignKey = typeof campaignKeys[number];

export type LeadAttribution = {
  landing_path: string;
  captured_at: number;
  referrer?: string;
  referrer_source?: string;
} & Partial<Record<CampaignKey, string>>;

/** Primeira visita conhecida desta pessoa, guardada entre sessões. */
type FirstTouch = {
  source: string;
  medium: string;
  campaign?: string;
  landing_path: string;
  captured_at: number;
};

/**
 * Assistentes de IA que enviam referrer proprio, por dominio.
 *
 * Existe porque os clientes dizem que chegaram por IA e isso nunca ficava
 * registado em lado nenhum: a atribuicao guardava UTMs, que so existem em
 * campanhas pagas, e deitava fora o document.referrer, que e onde o nome do
 * assistente vem escrito.
 *
 * Nao apanha tudo, e e melhor saber onde falha do que confiar a mais nisto:
 * quem copia o endereco em vez de clicar chega sem referrer nenhum, alguns
 * assistentes nao o enviam, e um clique vindo das AI Overviews da Google
 * chega como google.com, indistinguivel de uma pesquisa normal. O que este
 * campo mede e um minimo garantido, nunca o total.
 */
const assistantHosts: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity',
  'claude.ai': 'Claude',
  'gemini.google.com': 'Gemini',
  'bard.google.com': 'Gemini',
  'copilot.microsoft.com': 'Copilot',
  'you.com': 'You.com',
};

/** Motores de pesquisa, para separar tráfego orgânico de referência. */
const searchHosts = ['google.', 'bing.com', 'duckduckgo.com', 'search.yahoo', 'ecosia.org', 'sapo.pt', 'qwant.com'];

/** Nome do assistente, o dominio simples, ou undefined se for do proprio site. */
function classifyReferrer(referrer: string): { referrer?: string; referrer_source?: string } {
  if (!referrer) return {};
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (host === window.location.hostname) return {};
    const assistant = Object.entries(assistantHosts).find(([domain]) => host === domain || host.endsWith(`.${domain}`));
    return { referrer: host.slice(0, 250), ...(assistant && { referrer_source: assistant[1] }) };
  } catch {
    return {};
  }
}

/** Remove caracteres de controlo e trava o comprimento — isto vem do URL. */
function clean(value: string): string {
  return [...value].filter(char => char.charCodeAt(0) >= 32).join('').slice(0, 250);
}

/**
 * source/medium derivados, na ordem em que a informação é fiável.
 *
 * O UTM explícito manda sempre: é o que quem montou a campanha escreveu. A
 * seguir vêm os identificadores de clique, que só o Google Ads põe no URL e
 * por isso são prova de tráfego pago mesmo sem UTMs (acontece quando o "Final
 * URL suffix" está vazio mas o auto-tagging está ligado, que é o estado por
 * omissão de qualquer conta). Só depois o referrer, e por fim "direto", que é
 * na prática "não sabemos" — inclui quem escreveu o endereço, quem veio de uma
 * app, e quem clicou num link sem referrer.
 */
function deriveSourceMedium(attribution: LeadAttribution): { source: string; medium: string } {
  if (attribution.utm_source) return { source: attribution.utm_source, medium: attribution.utm_medium ?? 'unknown' };
  if (attribution.gclid || attribution.gbraid || attribution.wbraid) return { source: 'google', medium: 'cpc' };
  if (attribution.fbclid) return { source: 'facebook', medium: 'paid_social' };
  if (attribution.referrer_source) return { source: attribution.referrer_source, medium: 'ai_assistant' };
  if (attribution.referrer) {
    const isSearch = searchHosts.some(host => attribution.referrer!.includes(host));
    return { source: attribution.referrer, medium: isSearch ? 'organic' : 'referral' };
  }
  return { source: '(direct)', medium: '(none)' };
}

/** Consent-gated first entry; new tagged campaigns replace the previous one. */
export function captureLeadAttribution(): LeadAttribution | null {
  try {
    if (getConsent() !== 'accepted') {
      sessionStorage.removeItem(KEY);
      try { localStorage.removeItem(FIRST_TOUCH_KEY); } catch { /* unavailable */ }
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    const previous = JSON.parse(sessionStorage.getItem(KEY) || 'null') as LeadAttribution | null;
    const tagged = campaignKeys.some(key => params.has(key));
    if (previous && Date.now() - previous.captured_at < SESSION_TTL && (!tagged || campaignKeys.every(key => (params.get(key) || undefined) === previous[key]))) {
      rememberFirstTouch(previous);
      return previous;
    }
    const attribution: LeadAttribution = { landing_path: window.location.pathname, captured_at: Date.now(), ...classifyReferrer(document.referrer) };
    for (const key of campaignKeys) {
      const value = params.get(key);
      if (value) attribution[key] = clean(value);
    }
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
    rememberFirstTouch(attribution);
    return attribution;
  } catch { return null; }
}

/**
 * Grava a primeira visita, uma vez só, e nunca a substitui enquanto for válida.
 *
 * É esta assimetria que distingue first-touch de last-touch: o last-touch
 * (acima) é reescrito sempre que aparece uma campanha nova, o first-touch só é
 * escrito se não houver nenhum ou se o que houver já passou dos 90 dias. Sem
 * isto, a segunda visita de alguém apagaria o anúncio que o trouxe.
 */
function rememberFirstTouch(attribution: LeadAttribution): void {
  try {
    const stored = JSON.parse(localStorage.getItem(FIRST_TOUCH_KEY) || 'null') as FirstTouch | null;
    if (stored && Date.now() - stored.captured_at < FIRST_TOUCH_TTL) return;
    const { source, medium } = deriveSourceMedium(attribution);
    const first: FirstTouch = {
      source, medium,
      ...(attribution.utm_campaign || attribution.campaignid ? { campaign: attribution.utm_campaign ?? attribution.campaignid } : {}),
      landing_path: attribution.landing_path,
      captured_at: attribution.captured_at,
    };
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(first));
  } catch { /* storage blocked — o last-touch continua a funcionar sozinho */ }
}

function readFirstTouch(): FirstTouch | null {
  try {
    const stored = JSON.parse(localStorage.getItem(FIRST_TOUCH_KEY) || 'null') as FirstTouch | null;
    return stored && Date.now() - stored.captured_at < FIRST_TOUCH_TTL ? stored : null;
  } catch { return null; }
}

/**
 * O registo plano que acompanha um lead até à base de dados e ao painel.
 *
 * Todos os campos são opcionais porque a maior parte das visitas não traz
 * nenhum: um lead orgânico tem `first_source` e `last_source` e mais nada. O
 * painel mostra "Não disponível" no resto, em vez de inventar um valor.
 */
export interface AttributionSnapshot {
  first_source?: string;
  first_medium?: string;
  first_campaign?: string;
  first_landing_page?: string;
  first_seen_at?: string;
  last_source?: string;
  last_medium?: string;
  last_campaign?: string;
  last_landing_page?: string;
  last_seen_at?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  campaign_id?: string;
  ad_group_id?: string;
  keyword?: string;
  match_type?: string;
  creative_id?: string;
  ads_device?: string;
  network?: string;
  referrer?: string;
  referrer_source?: string;
  landing_page?: string;
  conversion_page?: string;
  is_paid: boolean;
}

/**
 * Fotografia da atribuição no momento em que o lead é criado.
 *
 * `conversion_page` é lido agora, não da sessão: é a página onde a pessoa estava
 * quando submeteu, que raramente é a página de entrada — é precisamente a
 * diferença entre as duas que diz se uma landing converte sozinha ou se manda a
 * pessoa navegar primeiro.
 *
 * `keyword` é a palavra-chave **da conta** que fez o anúncio aparecer, servida
 * pelo ValueTrack `{keyword}`. Não é o que a pessoa escreveu na Google: isso é o
 * termo de pesquisa, vive só no Search Terms Report do Google Ads, e não chega
 * ao site por nenhum parâmetro. Confundir os dois leva a otimizar contra dados
 * que não existem.
 */
export function getAttributionSnapshot(): AttributionSnapshot | null {
  const last = captureLeadAttribution();
  if (!last) return null;
  const first = readFirstTouch();
  const derived = deriveSourceMedium(last);
  const isPaid = Boolean(last.gclid || last.gbraid || last.wbraid || last.fbclid || derived.medium === 'cpc' || derived.medium === 'paid_social');

  const snapshot: AttributionSnapshot = {
    last_source: derived.source,
    last_medium: derived.medium,
    last_campaign: last.utm_campaign ?? last.campaignid,
    last_landing_page: last.landing_path,
    last_seen_at: new Date(last.captured_at).toISOString(),
    first_source: first?.source ?? derived.source,
    first_medium: first?.medium ?? derived.medium,
    first_campaign: first?.campaign ?? last.utm_campaign ?? last.campaignid,
    first_landing_page: first?.landing_path ?? last.landing_path,
    first_seen_at: new Date(first?.captured_at ?? last.captured_at).toISOString(),
    gclid: last.gclid,
    gbraid: last.gbraid,
    wbraid: last.wbraid,
    campaign_id: last.campaignid,
    ad_group_id: last.adgroupid,
    keyword: last.keyword,
    match_type: last.matchtype,
    creative_id: last.creative,
    ads_device: last.device,
    network: last.network,
    referrer: last.referrer,
    referrer_source: last.referrer_source,
    landing_page: last.landing_path,
    conversion_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    is_paid: isPaid,
  };

  // Campos vazios não vão para a base de dados: uma coluna nula lê-se como
  // "não disponível", uma string vazia lê-se como um valor a sério que por
  // acaso é vazio, e as duas coisas contam de forma diferente num `count`.
  for (const key of Object.keys(snapshot) as (keyof AttributionSnapshot)[]) {
    if (snapshot[key] === undefined || snapshot[key] === '') delete snapshot[key];
  }
  return snapshot;
}

export function leadAttributionNote(): string {
  const attribution = captureLeadAttribution();
  if (!attribution) return '';
  // O assistente vai numa linha propria e em texto simples: esta nota e lida
  // por uma pessoa no email de cada pedido, nao so no CRM, e um nome dentro
  // de um JSON passa despercebido.
  const assistant = attribution.referrer_source ? `Chegou por ${attribution.referrer_source}.\n` : '';
  return `${assistant}Origem da campanha: ${JSON.stringify(attribution)}`;
}
