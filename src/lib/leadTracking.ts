/**
 * Leads: o que conta como lead, o que não conta, e o que é enviado por cada um.
 *
 * A separação que manda em tudo o resto:
 *
 * - **Microconversão** é um sinal de intenção: clicar no WhatsApp, clicar para
 *   ligar, começar o formulário. Diz que a pessoa quis falar connosco. Não diz
 *   que falou. Um clique no WhatsApp abre a aplicação e acaba ali em muitos
 *   casos; um clique em `tel:` não significa chamada atendida.
 * - **Lead** é um pedido que chegou ao negócio: o formulário foi submetido e o
 *   servidor confirmou. É só aqui que sai `generate_lead` e a conversão do
 *   Google Ads.
 *
 * Tratar as duas coisas como a mesma é a forma mais rápida de o Smart Bidding
 * aprender a comprar cliques em vez de clientes.
 */
import { trackMetaLead } from './metaPixel';
import { ADS_LEAD_CONVERSION_LABEL } from '@/constants/tracking';
import { markFiredOnce, sendAdsConversion, sendGtagEvent } from './gtag';
import { setEnhancedConversionUserData } from './enhancedConversions';
import { getAttributionSnapshot, type AttributionSnapshot } from './leadAttribution';

/** De onde veio o lead. Um clique no WhatsApp nunca cria um destes sozinho. */
export type LeadChannel = 'form' | 'whatsapp' | 'phone';

/**
 * Estados internos do funil.
 *
 * `NEW` é o que existe assim que um pedido entra. Tudo o resto é uma decisão
 * humana tomada no painel: ninguém automatiza "este lead é válido".
 */
export const LEAD_STATUSES = [
  'NEW', 'VALID', 'QUALIFIED', 'QUOTED', 'BOOKED', 'COMPLETED',
  'INVALID', 'LOST', 'CANCELLED',
] as const;
export type LeadStatusValue = typeof LEAD_STATUSES[number];

/**
 * Estado interno → evento recomendado do GA4.
 *
 * **Estes eventos não são enviados a partir do painel de administração, de
 * propósito.** Quem muda o estado de um lead é o dono, no browser dele, dias
 * depois: enviar dali um `qualify_lead` atribuía a qualificação à sessão do
 * dono, na página `/admin/panel`, e não à pessoa que clicou no anúncio. O
 * histórico fica em `lead_status_history` com o `gclid` do lead original, que é
 * o que serve tanto para a importação de conversões offline no Google Ads como
 * para, mais tarde, um envio pelo Measurement Protocol com o `client_id` certo.
 */
export const GA4_FUNNEL_EVENT: Record<LeadStatusValue, string | null> = {
  NEW: 'generate_lead',
  VALID: 'working_lead',
  QUALIFIED: 'qualify_lead',
  QUOTED: 'working_lead',
  BOOKED: 'close_convert_lead',
  COMPLETED: 'close_convert_lead',
  INVALID: 'disqualify_lead',
  LOST: 'close_unconvert_lead',
  CANCELLED: 'close_unconvert_lead',
};

/**
 * Identificador do lead: único, sem nada de pessoal lá dentro, e legível o
 * suficiente para ser procurado à mão num email ou numa conversa de WhatsApp.
 */
export function newLeadId(): string {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `L-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${random}`;
}

/**
 * O `client_id` do GA4, lido do cookie `_ga`.
 *
 * Guardado com o lead porque é o que permitiria, mais tarde, enviar
 * `qualify_lead`/`close_convert_lead` pelo Measurement Protocol atribuídos à
 * sessão original em vez da do painel. Não é usado por nada hoje; existe porque
 * só pode ser lido no browser da pessoa, no momento do pedido — depois disso
 * desaparece para sempre.
 *
 * Formato do cookie: `GA1.1.<client_id>`, em que `client_id` é `1234567890.1234567890`.
 */
export function readGaClientId(): string | undefined {
  try {
    const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.([\d.]+)/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export interface LeadEventInput {
  lead_id: string;
  channel: LeadChannel;
  service?: string;
  city?: string;
  /** Valor conhecido do orçamento, em euros. Ausente quando é "sob orçamento". */
  value?: number;
  /** Só para enhanced conversions. Nunca entra em parâmetros normais de evento. */
  email?: string;
  phone?: string;
}

export interface LeadEventResult {
  sent: boolean;
  duplicate: boolean;
  adsConversionSent: boolean;
  attribution: AttributionSnapshot | null;
  ga_client_id?: string;
}

/**
 * Dispara o lead: `generate_lead` no GA4 e a conversão no Google Ads.
 *
 * Chamado **depois** da confirmação do servidor, nunca no clique do botão de
 * submissão. Um clique que acaba em erro de rede não é um lead, e contá-lo
 * ensina o Google Ads a comprar tráfego que nunca chega a pedir nada.
 *
 * Protegido contra repetição pelo `lead_id`: um refresh da página de obrigado,
 * um retry, ou voltar pelo histórico não voltam a contar. Do lado da Google, o
 * mesmo `lead_id` vai como `transaction_id`, que é a segunda rede de segurança.
 */
export async function trackLeadEvent(input: LeadEventInput): Promise<LeadEventResult> {
  // Independent consent and deduplication per destination. No quote value is a sale.
  trackMetaLead(input.lead_id);
  const attribution = getAttributionSnapshot();
  const ga_client_id = readGaClientId();

  if (!markFiredOnce(`lead:${input.lead_id}`)) {
    return { sent: false, duplicate: true, adsConversionSent: false, attribution, ga_client_id };
  }

  // Os dados do cliente, com hash, têm de estar definidos antes da conversão —
  // a Google lê o `user_data` que estiver em vigor no momento do evento.
  await setEnhancedConversionUserData({ email: input.email, phone: input.phone });

  const sent = sendGtagEvent('generate_lead', {
    lead_id: input.lead_id,
    lead_channel: input.channel,
    service: input.service,
    city: input.city,
    value: input.value,
    currency: 'EUR',
    campaign_id: attribution?.campaign_id,
    ad_group_id: attribution?.ad_group_id,
    keyword: attribution?.keyword,
    match_type: attribution?.match_type,
    landing_page: attribution?.landing_page,
    conversion_page: attribution?.conversion_page,
    is_paid: attribution?.is_paid ?? false,
  });

  const adsConversionSent = sendAdsConversion({
    label: ADS_LEAD_CONVERSION_LABEL,
    value: input.value,
    currency: 'EUR',
    transactionId: input.lead_id,
  });

  return { sent, duplicate: false, adsConversionSent, attribution, ga_client_id };
}
