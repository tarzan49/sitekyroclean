/**
 * Identificadores e configuração de medição — fonte única.
 *
 * Porque existe: antes disto, `G-T45T5FBNC3` e um ID de Google Ads estavam
 * escritos à mão dentro de `src/lib/consent.ts`, que é um ficheiro sobre
 * consentimento, não sobre medição. O ID de Ads que lá estava
 * (`AW-17779872363`) era de uma conta antiga e ficou por trocar quando a conta
 * nova foi criada — exatamente o tipo de erro que uma constante escrita num
 * sítio só e importada em todos os outros evita.
 *
 * Nada aqui é segredo: um Measurement ID e um Conversion ID são públicos por
 * construção (vão no HTML de qualquer site que os use). Estão em variáveis de
 * ambiente para poderem ser trocados sem um deploy de código, não para ficarem
 * escondidos. Chaves de API a sério continuam a viver só nas secrets das Edge
 * Functions do Supabase — nunca num `VITE_*`, que é compilado para dentro do
 * bundle público.
 */

/** Lê uma env var do Vite sem rebentar em Node (prerender, scripts, testes). */
function env(name: string): string | undefined {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Os identificadores reais de produção, como literais.
 *
 * Não são só os valores por omissão: são a referência contra a qual
 * `shouldSendToGoogle()` recusa enviar a partir de localhost ou de um preview.
 * Sem isto, bastava alguém pôr uma variável de ambiente mal para o ambiente de
 * desenvolvimento começar a escrever na propriedade a sério.
 */
export const PRODUCTION_GA4_ID = 'G-T45T5FBNC3';
export const PRODUCTION_ADS_ID = 'AW-18457115875';
export const PRODUCTION_META_PIXEL_ID = '1083307767504397';

/**
 * Propriedade GA4. Não mudar sem mudar também a nota no `docs/tracking-google-ads.md`:
 * um Measurement ID novo começa um histórico novo, não continua o antigo.
 */
export const GA4_MEASUREMENT_ID = env('VITE_GA4_MEASUREMENT_ID') ?? PRODUCTION_GA4_ID;

/**
 * Google Ads da conta de 2026 (`AW-18457115875`). Substitui `AW-17779872363`,
 * que era da conta anterior e continuou a ser configurado durante meses depois
 * de a conta deixar de ser usada.
 */
export const GOOGLE_ADS_ID = env('VITE_GOOGLE_ADS_ID') ?? PRODUCTION_ADS_ID;

/** Pixel da Meta usado para medição de campanhas, sempre sujeito a consentimento. */
export const META_PIXEL_ID = env('VITE_META_PIXEL_ID') ?? PRODUCTION_META_PIXEL_ID;

/**
 * Número de cliente do Google Ads: **920-786-3494**.
 *
 * Não é o mesmo que `AW-18457115875` e não se usa em nenhum `send_to`. O `AW-`
 * é o identificador de conversão que vai no site; o número de cliente é o que
 * identifica a conta em integrações (Data Manager API, Google Ads API,
 * importações offline, ligação ao GA4). Está aqui escrito para não haver
 * dúvida sobre qual é qual — o código nunca o usa.
 */
export const GOOGLE_ADS_CUSTOMER_ID = '920-786-3494';

/**
 * O "Google Tag" (GT-) que a Google cria automaticamente para a propriedade GA4.
 *
 * **Não é carregado como um segundo script, de propósito.** Um `GT-` e o `G-`
 * da mesma propriedade são o mesmo contentor com dois nomes: carregar
 * `gtag/js?id=GT-…` por cima de `gtag/js?id=G-…` põe duas cópias da biblioteca
 * na página e duplica `page_view`. Fica registado aqui porque é o identificador
 * que aparece no ecrã "Google tag" da interface da Google, e é lá — não no
 * código — que se ligam destinos a este contentor.
 */
export const GOOGLE_TAG_ID = env('VITE_GOOGLE_TAG_ID') ?? 'GT-M6XTKMC7';

/**
 * Etiqueta da conversão de **website** do lead confirmado.
 *
 * É a parte depois da barra em `AW-18457115875/AbC-D_efGhIj`, e só serve para
 * o `send_to` de um `gtag('event', 'conversion', …)`. O valor por omissão foi
 * copiado a 24/09/2026 do fragmento do evento da ação "Pedido confirmado
 * (website)" (ID de tipo de conversão 7776203701), não escrito de memória: uma
 * etiqueta inventada envia conversões para o vazio e parece que funciona. Se a
 * ação for recriada, a etiqueta muda e tem de ser copiada de novo de lá.
 */
export const PRODUCTION_ADS_LEAD_CONVERSION_LABEL = 'ewA0CLXn_fscEOP5hOFE';

export const ADS_LEAD_CONVERSION_LABEL =
  env('VITE_GOOGLE_ADS_LEAD_CONVERSION_LABEL') ?? PRODUCTION_ADS_LEAD_CONVERSION_LABEL;

/**
 * Nomes das ações de conversão **offline** (lead qualificado e cliente).
 *
 * Correção de uma confusão da primeira versão: estas duas não são etiquetas de
 * `gtag`. Uma importação offline não usa `send_to` nem label nenhuma — usa o
 * **nome da ação de conversão**, escrito exatamente como está no Google Ads, e
 * o identificador de clique (`gclid`/`gbraid`/`wbraid`) ou os dados do
 * utilizador com hash. Uma label posta aqui produziria um ficheiro que o Google
 * Ads rejeita, ou pior, aceita e não atribui a nada.
 *
 * Estes valores entram no cabeçalho do CSV e, mais tarde, no pedido da Data
 * Manager API. Sem eles o painel não deixa exportar.
 */
export const ADS_QUALIFIED_LEAD_ACTION = env('VITE_GOOGLE_ADS_QUALIFIED_LEAD_ACTION');
export const ADS_CUSTOMER_CONVERSION_ACTION = env('VITE_GOOGLE_ADS_CUSTOMER_CONVERSION_ACTION');

/**
 * Enhanced Conversions (dados first-party com hash) — desligado por omissão.
 *
 * Ligar isto sem a ação de conversão estar configurada para enhanced conversions
 * do lado do Google Ads não faz mal nenhum, mas também não faz nada. Ligar isto
 * é uma decisão com implicações de proteção de dados (a política de privacidade
 * tem de o dizer), por isso é explícita e não um valor por omissão.
 */
export const ENHANCED_CONVERSIONS_ENABLED = env('VITE_ENHANCED_CONVERSIONS') === 'true';

/**
 * Modo de consentimento. **Em vigor: `advanced`, decidido pelo dono a
 * 26/09/2026**, para as campanhas do Google Ads recuperarem por modelação as
 * conversões de quem recusa as cookies.
 *
 * - `advanced`: a `gtag.js` carrega sempre, com os quatro sinais a `denied`
 *   (declarados no script inline do `index.html`). Nesse estado a Google não lê
 *   nem grava cookies e não guarda identificadores; recebe pings sem cookies
 *   (data e hora, browser, página de origem, se a visita veio de um anúncio, o
 *   estado do consentimento), que alimentam a modelação de conversões.
 * - `basic`: a `gtag.js` só carrega depois de a pessoa aceitar. Quem recusa, ou
 *   ainda não decidiu, não gera pedido nenhum para a Google.
 *
 * O que **não** muda com o modo: o Pixel da Meta, a medição própria em
 * `quiz_events` e os dados das conversões melhoradas continuam a exigir a
 * aceitação. A política de privacidade descreve o modo avançado; voltar ao
 * básico (`VITE_CONSENT_MODE=basic` no Cloudflare Pages) obriga a corrigir
 * também esse texto, senão a política passa a descrever o que o site não faz.
 */
export const CONSENT_MODE: 'basic' | 'advanced' =
  env('VITE_CONSENT_MODE') === 'basic' ? 'basic' : 'advanced';

/** O domínio real. Fora daqui nada é enviado para o GA4/Ads (ver `trackingEnv`). */
export const PRODUCTION_HOSTNAME = 'cleansolutions.com.pt';

/**
 * O domínio real **e os seus subdomínios** (`www`, `admin`). Um só critério
 * para a medição e para a entrega dos pedidos.
 *
 * Antes, só o domínio exato contava como produção. Como `submissionService`
 * simula o envio fora de produção (a pessoa vê a página de obrigado e nada é
 * gravado nem enviado), bastava o `www` passar a servir o site para todos os
 * pedidos feitos lá desaparecerem em silêncio. `*.pages.dev`, `localhost` e
 * qualquer outro domínio continuam a ser pré-visualização.
 */
export function isProductionHost(hostname: string): boolean {
  return hostname === PRODUCTION_HOSTNAME || hostname.endsWith(`.${PRODUCTION_HOSTNAME}`);
}

export type TrackingEnv = 'production' | 'preview' | 'development' | 'test';

/**
 * Onde é que este código está a correr.
 *
 * `preview` é tudo o que serve o build de produção fora do domínio real:
 * `*.pages.dev`, ramos de pré-visualização do Cloudflare, `vite preview`. Não é
 * `development` (o `import.meta.env.DEV` é falso lá) e não pode ser
 * `production`, senão os deploys de teste poluem a conta com sessões e
 * conversões que nunca existiram.
 */
export function trackingEnv(): TrackingEnv {
  if (typeof window === 'undefined') return 'test';
  if (import.meta.env.MODE === 'test') return 'test';
  if (import.meta.env.DEV) return 'development';
  return isProductionHost(window.location.hostname) ? 'production' : 'preview';
}

const DEBUG_KEY = 'kyro_tracking_debug';

/**
 * Modo de depuração: `?kyro_debug=1` liga, `?kyro_debug=0` desliga, e a escolha
 * fica na sessão para sobreviver à navegação.
 *
 * **Só escreve no `console`.** Não autoriza nada. Na primeira versão deste
 * ficheiro abria também a porta do ambiente, o que queria dizer que qualquer
 * pessoa com o `localhost` aberto e `?kyro_debug=1` no URL escrevia na
 * propriedade GA4 a sério. Agora o diagnóstico e a autorização são duas coisas
 * diferentes: ver `nonProductionSendingAllowed()`.
 */
export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const param = new URLSearchParams(window.location.search).get('kyro_debug');
    if (param === '1') sessionStorage.setItem(DEBUG_KEY, '1');
    if (param === '0') sessionStorage.removeItem(DEBUG_KEY);
    return sessionStorage.getItem(DEBUG_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Autorização explícita, em tempo de build, para enviar fora de produção.
 *
 * Duas condições, as duas obrigatórias:
 *
 * 1. `VITE_TRACKING_ALLOW_NON_PRODUCTION=true` — alguém teve de o escrever.
 * 2. Os identificadores **não** podem ser os de produção. Esta é a que importa:
 *    mesmo que a variável fique ligada por engano num build, o envio continua
 *    impossível enquanto os IDs forem os reais. Para testar a sério, aponta-se
 *    `VITE_GA4_MEASUREMENT_ID`/`VITE_GOOGLE_ADS_ID` para uma propriedade de
 *    teste.
 */
export function nonProductionSendingAllowed(): boolean {
  if (env('VITE_TRACKING_ALLOW_NON_PRODUCTION') !== 'true') return false;
  return GA4_MEASUREMENT_ID !== PRODUCTION_GA4_ID && GOOGLE_ADS_ID !== PRODUCTION_ADS_ID;
}

/**
 * Se os eventos podem sair para a Google.
 *
 * Produção envia. Fora de produção só envia com autorização explícita e para
 * identificadores que não sejam os reais. O modo de depuração **não** conta:
 * serve para ver o que aconteceria, não para o fazer acontecer.
 */
export function shouldSendToGoogle(): boolean {
  if (trackingEnv() === 'production') return true;
  return nonProductionSendingAllowed();
}

/** A mesma proteção de ambiente aplicada ao Pixel da Meta. */
export function shouldSendToMeta(): boolean {
  if (trackingEnv() === 'production') return true;
  return env('VITE_TRACKING_ALLOW_NON_PRODUCTION') === 'true'
    && META_PIXEL_ID !== PRODUCTION_META_PIXEL_ID;
}

/** Uma linha legível para o painel de saúde e para os relatórios de teste. */
export function trackingConfigSummary() {
  return {
    env: trackingEnv(),
    ga4: GA4_MEASUREMENT_ID,
    ads: GOOGLE_ADS_ID,
    usingProductionIds: GA4_MEASUREMENT_ID === PRODUCTION_GA4_ID && GOOGLE_ADS_ID === PRODUCTION_ADS_ID,
    willSend: shouldSendToGoogle(),
    debug: isDebugMode(),
    consentMode: CONSENT_MODE,
  };
}
