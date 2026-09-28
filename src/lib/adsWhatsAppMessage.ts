/**
 * Marca a mensagem do WhatsApp de quem entrou por um anúncio do Google Ads
 * ou, desde 2026-09-28, da Meta ("Vi o vosso anúncio no Facebook/Instagram").
 *
 * Porquê: 85-90% dos pedidos chegam por WhatsApp e, sem consentimento de
 * cookies, a Google não consegue ligar esse clique ao anúncio (ver
 * `docs/tracking-google-ads.md`, secção 7). No primeiro dia das campanhas
 * (26/09/2026) o dono fechou cinco serviços vindos dos anúncios e o Google Ads
 * mostrava zero conversões. A única forma de saber a origem que não depende de
 * cookies é a própria mensagem: quem vem do anúncio chega com "Vi o vosso
 * anúncio no Google" na primeira frase, e o dono conta à mão os pedidos e os
 * serviços fechados de cada lado.
 *
 * Não guarda nada no dispositivo nem envia nada para lado nenhum: lê o endereço
 * de entrada uma vez, no arranque, e guarda a resposta em memória. Por isso não
 * depende do aviso de cookies e vale para toda a gente. A navegação dentro do
 * site mantém a marca (a página não recarrega); quem sai e volta mais tarde por
 * outro caminho já não a leva, e isso é aceitável.
 *
 * A mensagem é alterada no momento do clique, num só sítio, em vez de em cada
 * construtor de `whatsappMessages.ts` e nas dezenas de páginas que os usam: é
 * a mesma razão pela qual a medição dos cliques é um delegado global.
 */
import { WHATSAPP_BASE } from '@/constants/business';
import { buildGeneralWaMessage } from '@/lib/whatsappMessages';

export const ADS_WHATSAPP_MARK = 'Vi o vosso anúncio no Google';
export const FACEBOOK_ADS_WHATSAPP_MARK = 'Vi o vosso anúncio no Facebook';
export const INSTAGRAM_ADS_WHATSAPP_MARK = 'Vi o vosso anúncio no Instagram';

const BUSINESS_WHATSAPP_PATH = new URL(WHATSAPP_BASE).pathname;
const WHATSAPP_HOSTS = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'];

/**
 * Só o Google Ads. O `isAdsVisit` do `AdsLandingNavigation.tsx` aceita qualquer
 * `utm_medium=cpc`, o que chega para mudar o layout da página, mas aqui a frase
 * diz "Google": um anúncio da Meta com `cpc` punha na boca do cliente uma
 * coisa falsa. O `gclid`/`gbraid`/`wbraid` vem do auto-tagging e o
 * `utm_source=google` do sufixo de URL final da conta.
 */
export function isGoogleAdsVisit(search: string): boolean {
  const params = new URLSearchParams(search);
  if (['gclid', 'gbraid', 'wbraid'].some(key => params.has(key))) return true;
  const source = params.get('utm_source')?.toLowerCase();
  const medium = params.get('utm_medium')?.toLowerCase() ?? '';
  return source === 'google' && (params.get('ads') === '1' || ['cpc', 'ppc', 'paidsearch'].includes(medium));
}

/**
 * Anúncios da Meta (dono, 2026-09-28: a mesma marca que o Google, para separar
 * os clientes da Meta dos orgânicos no WhatsApp). Só com os parâmetros de URL
 * que a campanha leva (`META_URL_PARAMETERS` em `marketingPlatforms.ts`):
 * `utm_medium=paid_social` com uma origem da Meta, ou os `meta_*_id`. O
 * `fbclid` sozinho não chega, porque a Meta também o põe nas ligações
 * partilhadas sem anúncio nenhum. `{{site_source_name}}` dá `ig` no Instagram
 * e `fb`/`msg`/`an` no resto, que é tudo Facebook para quem recebe a mensagem.
 */
export function metaAdsPlatform(search: string): 'facebook' | 'instagram' | null {
  const params = new URLSearchParams(search);
  const source = params.get('utm_source')?.toLowerCase() ?? '';
  const medium = params.get('utm_medium')?.toLowerCase() ?? '';
  const metaSource = ['fb', 'facebook', 'ig', 'instagram', 'msg', 'an', 'meta'].includes(source);
  const hasMetaIds = ['meta_ad_id', 'meta_adset_id', 'meta_campaign_id'].some(key => params.has(key));
  if (!hasMetaIds && !(metaSource && ['paid_social', 'paidsocial', 'paid', 'cpc'].includes(medium))) return null;
  return source === 'ig' || source === 'instagram' ? 'instagram' : 'facebook';
}

/** A frase que abre a mensagem nesta visita, ou `null` se não veio de um anúncio. */
export function adsWhatsAppMark(search: string): string | null {
  if (isGoogleAdsVisit(search)) return ADS_WHATSAPP_MARK;
  const meta = metaAdsPlatform(search);
  if (meta === 'instagram') return INSTAGRAM_ADS_WHATSAPP_MARK;
  if (meta === 'facebook') return FACEBOOK_ADS_WHATSAPP_MARK;
  return null;
}

/**
 * "Olá! Gostaria de saber o preço…" passa a "Olá! Vi o vosso anúncio no Google
 * e gostaria de saber o preço…"; as outras aberturas em português levam a frase
 * à frente. Mensagens noutra língua (as páginas EN, que os anúncios não
 * segmentam) ficam como estão, para não misturar línguas.
 */
export function markAdsWhatsAppText(original: string, mark = ADS_WHATSAPP_MARK): string {
  if (original.includes(mark)) return original;
  const text = original;
  // Só o início: o espaço final da mensagem é onde fica o cursor para escrever.
  const trimmed = text.trimStart();
  if (!trimmed) return `Olá! ${mark}.`;
  const greeting = /^Olá[!,.]?\s*/.exec(trimmed);
  if (!greeting) return text;
  const rest = trimmed.slice(greeting[0].length);
  if (!rest) return `Olá! ${mark}.`;
  if (/^Gostaria\b/.test(rest)) return `Olá! ${mark} e g${rest.slice(1)}`;
  return `Olá! ${mark}. ${rest.charAt(0).toUpperCase()}${rest.slice(1)}`;
}

/** Só as ligações para o número da empresa; devolve o `href` intacto nas outras. */
export function markAdsWhatsAppHref(href: string, mark = ADS_WHATSAPP_MARK): string {
  const text = businessWhatsAppText(href);
  if (text === null) return href;
  const url = new URL(href);
  const marked = markAdsWhatsAppText(text, mark);
  if (marked === text) return href;
  url.searchParams.delete('text');
  const rest = url.searchParams.toString();
  // `encodeURIComponent` e não `searchParams.set`: este serializa os espaços
  // como `+`, e o `+` não é lido como espaço em todas as versões do WhatsApp.
  return `${url.origin}${url.pathname}?${rest ? `${rest}&` : ''}text=${encodeURIComponent(marked)}`;
}

/**
 * A mensagem do botão principal da página, para os botões que não sabem onde
 * estão. A barra fixa do telemóvel e o cabeçalho mandam sempre a mensagem
 * genérica ("limpar os meus estofos"), e mais de 90% dos cliques dos anúncios
 * vêm de telemóvel, onde a barra está sempre à vista: nos dois primeiros dias
 * (26-27/09/2026) o dono recebia "Vi o vosso anúncio no Google" sem saber se
 * era Lisboa ou Porto, limpeza ou impermeabilização, e numa página de
 * impermeabilização o pedido chegava a dizer "limpar". O botão principal é a
 * primeira ligação da página para o número da empresa com uma mensagem própria
 * (o hero vem antes de tudo o resto no `<main>`, e o cabeçalho, antes dele, é
 * genérico). Se a página não tiver nenhuma, fica a genérica.
 */
export function pageWhatsAppText(root: ParentNode = document, mark = ADS_WHATSAPP_MARK): string | null {
  const general = buildGeneralWaMessage();
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const text = businessWhatsAppText(link.href);
    if (text && text !== general && text !== markAdsWhatsAppText(general, mark)) return text;
  }
  return null;
}

function businessWhatsAppText(href: string): string | null {
  let url: URL;
  try { url = new URL(href); } catch { return null; }
  if (!WHATSAPP_HOSTS.includes(url.hostname)) return null;
  const phone = url.hostname === 'wa.me' ? url.pathname : `/${url.searchParams.get('phone') ?? ''}`;
  if (phone !== BUSINESS_WHATSAPP_PATH) return null;
  return url.searchParams.get('text') ?? '';
}

/** O `href` com a mensagem genérica trocada pela da página; os outros ficam iguais. */
export function withPageWhatsAppText(href: string, root: ParentNode = document, mark = ADS_WHATSAPP_MARK): string {
  const general = buildGeneralWaMessage();
  const current = businessWhatsAppText(href);
  // Também a genérica já marcada: um segundo clique na barra fixa.
  if (current !== general && current !== markAdsWhatsAppText(general, mark)) return href;
  const text = pageWhatsAppText(root, mark);
  if (!text) return href;
  const url = new URL(href);
  url.searchParams.delete('text');
  const rest = url.searchParams.toString();
  return `${url.origin}${url.pathname}?${rest ? `${rest}&` : ''}text=${encodeURIComponent(text)}`;
}

/**
 * Chamado uma vez, no arranque, antes de qualquer navegação: o parâmetro do
 * anúncio só está no endereço de entrada. Troca o `href` da âncora durante a
 * fase de captura; o browser segue o `href` que a âncora tiver no fim do
 * evento, por isso o WhatsApp abre já com a mensagem marcada. Não chama
 * `preventDefault` nem mexe na medição do clique, que é do delegado de
 * `initContactTracking`.
 */
export function initAdsWhatsAppMessage(search = window.location.search): () => void {
  const adMark = adsWhatsAppMark(search);
  if (!adMark) return () => {};
  const mark = (event: MouseEvent) => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    if (/^\/admin(?:\/|$)/.test(window.location.pathname)) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const marked = markAdsWhatsAppHref(withPageWhatsAppText(link.href, document, adMark), adMark);
    if (marked !== link.href) link.href = marked;
  };
  document.addEventListener('click', mark, true);
  document.addEventListener('auxclick', mark, true);
  return () => {
    document.removeEventListener('click', mark, true);
    document.removeEventListener('auxclick', mark, true);
  };
}
