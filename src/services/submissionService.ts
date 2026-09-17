import { getAttributionSnapshot, leadAttributionNote } from '@/lib/leadAttribution';
import { readGaClientId, trackLeadEvent } from '@/lib/leadTracking';
import { clearSubmissionId, currentSubmissionId } from '@/lib/submissionId';
import { splitTreatmentItems } from '@/components/quiz/quizHelpers';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, carpetItemArea, calcPackPricing } from '@/components/quiz/quizHelpers';
import { WHATSAPP_BASE } from '@/constants/business';
import { safeSessionSet } from '@/lib/safeStorage';
import { logError } from '@/lib/errorTracking';
import { IS_PRODUCTION } from '@/lib/quizTracking';
import { getRecaptchaTokenSafe } from '@/lib/recaptcha';

/** All the data the submission pipeline needs. Assembled by useQuizSubmission. */
export interface QuizLeadPayload {
  name: string;
  phone: string;
  email: string;
  photos: File[];
  finalLocation: string;

  service: string;
  serviceType: string;
  waterproofingTier: 'essencial' | 'premium';
  serviceLabel: string;
  serviceTypeLabel: string;
  crmServiceLabel: string;
  detailsSummary: string;
  priceText: string;
  message: string;

  sofaItems: SofaItem[];
  mattressItems: MattressItem[];
  upsellItems: UpsellItemConfig[];
  carpetItems: CarpetItem[];
  chairQuantity: string;
  chairWaterproofQty: number;
  chairAntiAcaros: boolean;
  calculateServicePrice: number;

  totalPrice: number;
  hasSobOrcamento: boolean;
  hasUpsellSobItem: boolean;
  finalTravelCost: number;

  hypoallergenic: boolean | null;
  hypoSurcharge: number;

  slotLabel: string;
  description?: string;
  carpetKind?: 'tapete' | 'alcatifa';
}

function generateBookingId(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

/**
 * Valor numérico do orçamento, ou `undefined` quando não há preço fechado.
 *
 * Um pedido "sob orçamento" não vale zero euros: vale um valor que ainda não
 * sabemos. Enviar `value: 0` para o Google Ads ensina o Smart Bidding que
 * aquele tipo de pedido não vale nada, e tapetes — que nunca mostram preço —
 * seriam os primeiros a desaparecer das campanhas.
 */
function conversionValue(payload: QuizLeadPayload): number | undefined {
  if (payload.hasSobOrcamento || payload.hasUpsellSobItem) return undefined;
  return payload.totalPrice > 0 ? Number(payload.totalPrice.toFixed(2)) : undefined;
}

/** Os campos do lead, iguais para a função de servidor e para o insert direto. */
function buildLeadRow(payload: QuizLeadPayload, bookingId: string, leadId: string) {
  const {
    name, phone, email, crmServiceLabel, serviceTypeLabel, detailsSummary,
    finalLocation, priceText, message, upsellItems,
  } = payload;
  return {
    name,
    phone,
    email: email || null,
    service: crmServiceLabel,
    service_type: serviceTypeLabel,
    details: detailsSummary,
    location: finalLocation,
    value: priceText,
    booking_id: bookingId,
    lead_id: leadId,
    message,
    notes: [upsellItems.map(item => item.label).join(' | '), leadAttributionNote()].filter(Boolean).join('\n'),
  };
}

type SupabaseClient = (typeof import('@/lib/supabase'))['supabase'];

async function insertCrmLead(supabase: SupabaseClient, isSupabaseConfigured: boolean, payload: QuizLeadPayload, bookingId: string, leadId: string): Promise<{ duplicate: boolean }> {
  if (!isSupabaseConfigured) throw new Error('CRM não configurado');

  const row = buildLeadRow(payload, bookingId, leadId);

  // O token é obtido sem nunca bloquear: se o reCAPTCHA não carregar, demorar
  // ou estar bloqueado, segue sem ele e o servidor deixa passar. Não vai, e
  // nunca deve ir, para o canal de email: foi exatamente isso que partiu o
  // formulário da primeira vez que se tentou pôr reCAPTCHA neste site.
  const recaptchaToken = await getRecaptchaTokenSafe('submit_quote');

  // A atribuição viaja num objeto próprio, separado do lead: são dados de
  // marketing, com o seu próprio destino (`lead_attribution`) e a sua própria
  // lista de campos aceites do lado do servidor. Misturá-los com o lead fazia
  // com que qualquer campo novo de campanha tivesse de passar pela validação
  // dos dados do cliente, que é mais apertada e por boas razões.
  const { data, error } = await supabase.functions.invoke('submit-lead', {
    body: {
      lead: { ...row, email: row.email ?? undefined },
      recaptchaToken,
      attribution: { ...(getAttributionSnapshot() ?? { is_paid: false }), channel: 'form', ga_client_id: readGaClientId() },
    },
  });

  // `duplicate: true` é a função a dizer "este `lead_id` já existe, não criei
  // outro". É sucesso, não falha: é exatamente o que tem de acontecer num
  // duplo clique ou num retry depois de um timeout em que a primeira tentativa
  // afinal tinha chegado.
  if (!error && data?.success) return { duplicate: Boolean(data.duplicate) };

  // A partir daqui o insert direto deixou de existir: a politica de insert
  // anonimo foi fechada (migracao 20260914000000), por isso a funcao e o unico
  // caminho para criar um lead. Uma falha aqui e uma falha do canal do CRM, e o
  // canal de email trata do resto — ver submitQuizLead.
  throw new Error(`submit-lead falhou: ${error?.message ?? 'resposta inesperada'}`);
}

/** Segundo canal, independente do CRM: envia o mesmo lead por email (Resend). */
async function postToLeadEmail(supabase: SupabaseClient, payload: QuizLeadPayload, bookingId: string, leadId: string): Promise<void> {
  const row = buildLeadRow(payload, bookingId, leadId);
  const body = { lead: { ...row, email: row.email ?? undefined }, subject: `Pedido de orçamento - ${payload.serviceLabel}` };

  // Deliberadamente sem recaptchaToken aqui — ver o comentário em insertCrmLead
  // sobre porque o token nunca deve ir para o canal de email.
  const doInvoke = () => supabase.functions.invoke('send-lead-email', { body });

  // O antigo envio direto ao Formspree repetia uma vez em caso de falha de
  // rede (comum em dados móveis) — mantém-se esse comportamento aqui.
  let result;
  try {
    result = await doInvoke();
  } catch (networkErr) {
    console.warn('[submissionService] send-lead-email first attempt failed, retrying once:', networkErr);
    await new Promise((resolve) => setTimeout(resolve, 300));
    result = await doInvoke();
  }

  const { data, error } = result;
  if (!error && data?.success) return;
  throw new Error(`send-lead-email falhou: ${error?.message ?? 'resposta inesperada'}`);
}

export function buildWaUrl(payload: QuizLeadPayload, bookingId: string): string {
  const text = `Olá Kyro Clean Solutions. Gostaria de confirmar este pedido de orçamento.\n\n` +
    `Nome: ${payload.name}\nTelemóvel: ${payload.phone}\n` +
    `${payload.message}\n\nReferência do pedido: #${bookingId}\n` +
    `Aguardo a confirmação do orçamento e da disponibilidade.`;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`;
}

export function formatQuotePrice(payload: Pick<QuizLeadPayload, 'totalPrice' | 'hasSobOrcamento' | 'hasUpsellSobItem'>): string {
  const value = payload.totalPrice;
  const price = `${Number(value.toFixed(2)).toLocaleString('pt-PT')}€`;
  return payload.hasSobOrcamento || payload.hasUpsellSobItem
    ? `${price} de subtotal conhecido + serviços sob orçamento`
    : value > 0 ? price : 'Sob orçamento';
}

export function buildReceiptLines(payload: Pick<QuizLeadPayload, 'service' | 'serviceType' | 'waterproofingTier' | 'sofaItems' | 'mattressItems' | 'upsellItems' | 'carpetItems' | 'chairQuantity' | 'chairWaterproofQty' | 'chairAntiAcaros' | 'finalTravelCost' | 'finalLocation' | 'carpetKind'>) {
  const {
    service, serviceType, waterproofingTier, sofaItems, mattressItems, upsellItems, carpetItems, chairQuantity,
    chairWaterproofQty, chairAntiAcaros, finalTravelCost, finalLocation,
  } = payload;

  const receiptLines: Array<{ label: string; qty: number; unitPrice: number | null; total: number | null }> = [];
  const isWaterproofBase = serviceType === 'waterproofing';
  // Tier real do formulário — não limitada ao caso "impermeabilização primária",
  // senão o addon Premium (limpeza como serviço principal) saía sempre "Essencial"
  // no recibo, mesmo o cliente tendo escolhido Premium no upsell pós-quantidade.
  const isPremium = waterproofingTier === 'premium';
  const calcChairWaterproofTier = isPremium ? calcChairWaterproofPremium : calcChairWaterproof;

  if (service === 'sofa') {
    // Aqui o tier aplica-se mesmo quando o pack (limpeza + proteção) está ligado com
    // serviceType='cleaning' (toggles "Proteção 2/10 anos"), não só quando a proteção é
    // o serviço principal — por isso não se restringe a isWaterproofBase como o `isPremium`
    // usado mais abaixo para cadeiras.
    const isPremiumTierSofa = waterproofingTier === 'premium';
    splitTreatmentItems(sofaItems).forEach(item => {
      const opt = sofaPrices.find(p => p.id === item.sizeId);
      if (!opt) return;
      const unit = calcPackPricing(opt, item.packEnabled, isWaterproofBase, null, waterproofingTier).displayPrice;
      const tierTag = item.packEnabled
        ? (isPremiumTierSofa ? ' + Proteção 10 anos' : ' + Proteção 2 anos')
        : (isWaterproofBase ? (isPremiumTierSofa ? ' (Impermeab. Premium)' : ' (Impermeab. Essencial)') : '');
      receiptLines.push({ label: `Sofá ${opt.label}${tierTag}`, qty: item.qty, unitPrice: unit, total: unit !== null ? unit * item.qty : null });
    });
  } else if (service === 'mattress') {
    splitTreatmentItems(mattressItems).forEach(item => {
      const opt = mattressPrices.find(p => p.id === item.sizeId);
      if (!opt) return;
      const baseP = isWaterproofBase
        ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : null)
        : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null);
      const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : null;
      const unit = item.packEnabled ? bothP : baseP;
      const typeStr = item.packEnabled ? ' (Pack: Limpeza + Desbacterização e Anti Ácaros)' : isWaterproofBase ? ' (Desbacterização e Anti Ácaros)' : ' (Limpeza)';
      receiptLines.push({ label: `Colchão ${opt.label}${typeStr}`, qty: item.qty, unitPrice: unit, total: unit !== null ? unit * item.qty : null });
    });
  } else if (service === 'chairs') {
    const cQty = parseInt(chairQuantity);
    if (!isNaN(cQty) && cQty > 0) {
      const primaryTotal = isWaterproofBase ? calcChairWaterproofTier(cQty) : calcChairClean(cQty);
      const primaryLabel = isWaterproofBase ? `Impermeabilização Cadeiras${isPremium ? ' Premium' : ' Essencial'}` : 'Limpeza Cadeiras';
      receiptLines.push({ label: primaryLabel, qty: cQty, unitPrice: primaryTotal !== null ? Math.round(primaryTotal / cQty * 10) / 10 : null, total: primaryTotal });
      const wQty = chairWaterproofQty;
      if (wQty > 0) {
        const addonTotal = isWaterproofBase ? calcChairClean(wQty) : calcChairWaterproofTier(wQty);
        const addonLabel = isWaterproofBase ? 'Limpeza Cadeiras' : `Impermeabilização Cadeiras${isPremium ? ' Premium' : ' Essencial'}`;
        const addonUnit = addonTotal !== null ? Math.round(addonTotal / wQty * 10) / 10 : null;
        receiptLines.push({ label: `${addonLabel}${!isWaterproofBase ? ' (desbacterização e antiácaros incluídos)' : ''}`, qty: wQty, unitPrice: addonUnit, total: addonTotal });
      }
      if (chairAntiAcaros && !isWaterproofBase && wQty <= 0) {
        receiptLines.push({ label: 'Desbacterização e Anti Ácaros Cadeiras', qty: cQty, unitPrice: 5, total: cQty * 5 });
      }
    }
  } else if (service === 'carpet') {
    // Sem preço fixo (2026-09-06): cada tapete medido vira a sua própria linha,
    // sempre sob orçamento, nunca um total calculado por m².
    carpetItems.forEach((item, i) => {
      const area = carpetItemArea(item);
      if (area === null) return;
      receiptLines.push({ label: `${payload.carpetKind === 'alcatifa' ? 'Alcatifa' : 'Tapete'} ${i + 1}: ${item.largura} × ${item.comprimento} m (${Number(area.toFixed(2))} m²)`, qty: 1, unitPrice: null, total: null });
    });
  }

  upsellItems.forEach(item => {
    const q = item.qty ?? 1;
    const unitP = q > 0 && item.price > 0 ? Math.round(item.price / q * 100) / 100 : null;
    const measures = item.carpetItems?.map((rug, i) => `peça ${i + 1}: ${rug.largura} × ${rug.comprimento} m`).join('; ');
    receiptLines.push({ label: `${item.label.replace(/^\d+\s*[x×]\s*/i, '')}${measures ? ` (${measures})` : ''}`, qty: q, unitPrice: unitP, total: item.price > 0 ? item.price : null });
    if (item.waterproof && item.waterproofPrice && item.waterproofPrice > 0) {
      receiptLines.push({ label: `Impermeabilização (${item.label})`, qty: 1, unitPrice: item.waterproofPrice, total: item.waterproofPrice });
    }
  });

  if (finalTravelCost > 0) receiptLines.push({ label: `Deslocação: ${finalLocation}`, qty: 1, unitPrice: finalTravelCost, total: finalTravelCost });

  return receiptLines;
}

function persistObrigadoData(payload: QuizLeadPayload, bookingId: string, waUrl: string): void {
  const {
    totalPrice, hasSobOrcamento, hasUpsellSobItem,
    serviceLabel, serviceTypeLabel, finalLocation, slotLabel, name,
  } = payload;

  const isSobOrcamento = hasSobOrcamento || hasUpsellSobItem;
  const finalPriceText = formatQuotePrice(payload);

  safeSessionSet('kyro_booking_id', bookingId);
  safeSessionSet('kyro_wa_url', waUrl);
  safeSessionSet('kyro_summary', JSON.stringify({
    price: finalPriceText,
    service: `${serviceLabel}${serviceTypeLabel ? `: ${serviceTypeLabel}` : ''}`,
    location: finalLocation,
  }));
  safeSessionSet('kyro_receipt', JSON.stringify({
    lines: buildReceiptLines(payload),
    subtotal: totalPrice,
    discountLabel: null,
    discountAmount: 0,
    total: totalPrice,
    sobOrcamento: isSobOrcamento,
    location: finalLocation,
    slot: slotLabel,
    bookingId,
    name,
  }));
}

/**
 * O que aconteceu a cada canal. O chamador precisa de saber, porque "chegou ao
 * negócio" e "ficou gravado no CRM" não são a mesma coisa: se só o email
 * passar, o pedido chegou a uma caixa de correio mas não existe em `leads`, e
 * isso tem de aparecer como aviso operacional no painel em vez de se perder.
 */
export interface LeadDeliveryResult {
  leadId: string;
  bookingId: string;
  /** Gravado na tabela `leads` pela função de servidor. */
  crmOk: boolean;
  /** Entregue por email ao negócio. */
  emailOk: boolean;
  /** O servidor reconheceu este `lead_id` como já existente. */
  duplicate: boolean;
}

export async function submitQuizLead(payload: QuizLeadPayload): Promise<LeadDeliveryResult> {
  const bookingId = generateBookingId();
  // Estável entre tentativas da mesma submissão — ver src/lib/submissionId.ts.
  const leadId = currentSubmissionId();

  const persist = () => {
    const waUrl = buildWaUrl(payload, bookingId);
    persistObrigadoData(payload, bookingId, waUrl);
  };

  // Fora de cleansolutions.com.pt (localhost, previews, etc.) — nunca cria um
  // lead a sério nem manda um email a sério para o dono. A página /obrigado
  // continua a funcionar com dados simulados; os efeitos externos ficam de fora.
  if (!IS_PRODUCTION) {
    persist();
    // eslint-disable-next-line no-console
    console.warn(`[submissionService] Fora de produção — pedido #${bookingId} NÃO enviado ao CRM nem por email (simulado).`);
    // A medição é chamada na mesma: as suas próprias portas (consentimento,
    // ambiente) decidem se sai alguma coisa.
    await reportLead(payload, leadId);
    clearSubmissionId();
    return { leadId, bookingId, crmOk: false, emailOk: false, duplicate: false };
  }

  // Um único import, partilhado pelos dois canais: chamar `import('@/lib/supabase')`
  // em paralelo a partir de duas funções diferentes (uma por canal) confundia o
  // mock nos testes — cada chamada podia resolver para uma instância diferente
  // do módulo. Resolvendo uma vez aqui, ambos os canais usam sempre o mesmo cliente.
  const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');

  // Await both channels: if EITHER one lands, the lead reached the business
  // and we resolve normally. Only reject (both failed) so the caller can fall
  // back to the WhatsApp/email toast — silently swallowing a total failure
  // means the customer thinks they're booked and the business never hears.
  const [crmResult, emailResult] = await Promise.allSettled([
    insertCrmLead(supabase, isSupabaseConfigured, payload, bookingId, leadId),
    postToLeadEmail(supabase, payload, bookingId, leadId),
  ]);

  const crmOk = crmResult.status === 'fulfilled';
  const duplicate = crmResult.status === 'fulfilled' && crmResult.value.duplicate;
  const emailOk = emailResult.status === 'fulfilled';
  const bothFailed = !crmOk && !emailOk;

  if (!crmOk) {
    const err = crmResult.status === 'rejected' ? crmResult.reason : null;
    logError({
      message: err instanceof Error ? err.message : String(err),
      source: 'QuizForm-crm',
      severity: bothFailed ? 'error' : 'warning',
      stack: err instanceof Error ? err.stack ?? null : null,
    });
  }

  if (!emailOk) {
    const err = emailResult.status === 'rejected' ? emailResult.reason : null;
    logError({
      message: err instanceof Error ? err.message : String(err),
      source: 'QuizForm-email',
      severity: bothFailed ? 'error' : 'warning',
      stack: err instanceof Error ? err.stack ?? null : null,
    });
  }

  if (bothFailed) {
    // O identificador **não** é limpo: a pessoa pode tentar outra vez e a
    // segunda tentativa tem de ser reconhecida como a mesma submissão.
    throw new Error('Both CRM insert and lead email submission failed');
  }
  persist();
  await reportLead(payload, leadId);
  // A partir daqui o pedido está entregue. Um pedido novo da mesma pessoa —
  // outro serviço, outra semana — recebe um identificador novo.
  clearSubmissionId();
  return { leadId, bookingId, crmOk, emailOk, duplicate };
}

/**
 * `generate_lead` e a conversão do Google Ads — só aqui.
 *
 * Aqui é depois de pelo menos um dos canais ter confirmado a entrega. Disparar
 * no clique do botão de submissão contaria como lead cada tentativa que acabou
 * em erro de rede, e é exatamente isso que ensina o Smart Bidding a comprar
 * tráfego que nunca chega a pedir nada.
 *
 * Nunca deixa rebentar a submissão: neste ponto o pedido já chegou ao negócio,
 * e uma falha a medir não pode transformar-se numa falha a vender.
 */
async function reportLead(payload: QuizLeadPayload, leadId: string): Promise<void> {
  try {
    await trackLeadEvent({
      lead_id: leadId,
      channel: 'form',
      service: payload.service,
      city: payload.finalLocation,
      value: conversionValue(payload),
      email: payload.email || undefined,
      phone: payload.phone,
    });
  } catch (error) {
    console.warn('[submissionService] Medição do lead falhou (o pedido já foi entregue):', error);
  }
}
