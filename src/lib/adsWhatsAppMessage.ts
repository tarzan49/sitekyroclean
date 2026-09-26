/**
 * Marca a mensagem do WhatsApp de quem entrou por um anúncio do Google Ads.
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

export const ADS_WHATSAPP_MARK = 'Vi o vosso anúncio no Google';

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
 * "Olá! Gostaria de saber o preço…" passa a "Olá! Vi o vosso anúncio no Google
 * e gostaria de saber o preço…"; as outras aberturas em português levam a frase
 * à frente. Mensagens noutra língua (as páginas EN, que os anúncios não
 * segmentam) ficam como estão, para não misturar línguas.
 */
export function markAdsWhatsAppText(text: string): string {
  if (text.includes(ADS_WHATSAPP_MARK)) return text;
  const trimmed = text.trim();
  if (!trimmed) return `Olá! ${ADS_WHATSAPP_MARK}.`;
  const greeting = /^Olá[!,.]?\s*/.exec(trimmed);
  if (!greeting) return text;
  const rest = trimmed.slice(greeting[0].length);
  if (!rest) return `Olá! ${ADS_WHATSAPP_MARK}.`;
  if (/^Gostaria\b/.test(rest)) return `Olá! ${ADS_WHATSAPP_MARK} e g${rest.slice(1)}`;
  return `Olá! ${ADS_WHATSAPP_MARK}. ${rest.charAt(0).toUpperCase()}${rest.slice(1)}`;
}

/** Só as ligações para o número da empresa; devolve o `href` intacto nas outras. */
export function markAdsWhatsAppHref(href: string): string {
  let url: URL;
  try { url = new URL(href); } catch { return href; }
  if (!WHATSAPP_HOSTS.includes(url.hostname)) return href;
  const phone = url.hostname === 'wa.me' ? url.pathname : `/${url.searchParams.get('phone') ?? ''}`;
  if (phone !== BUSINESS_WHATSAPP_PATH) return href;
  const text = url.searchParams.get('text') ?? '';
  const marked = markAdsWhatsAppText(text);
  if (marked === text) return href;
  url.searchParams.delete('text');
  const rest = url.searchParams.toString();
  // `encodeURIComponent` e não `searchParams.set`: este serializa os espaços
  // como `+`, e o `+` não é lido como espaço em todas as versões do WhatsApp.
  return `${url.origin}${url.pathname}?${rest ? `${rest}&` : ''}text=${encodeURIComponent(marked)}`;
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
  if (!isGoogleAdsVisit(search)) return () => {};
  const mark = (event: MouseEvent) => {
    if (event.type === 'auxclick' && event.button !== 1) return;
    if (/^\/admin(?:\/|$)/.test(window.location.pathname)) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const marked = markAdsWhatsAppHref(link.href);
    if (marked !== link.href) link.href = marked;
  };
  document.addEventListener('click', mark, true);
  document.addEventListener('auxclick', mark, true);
  return () => {
    document.removeEventListener('click', mark, true);
    document.removeEventListener('auxclick', mark, true);
  };
}
