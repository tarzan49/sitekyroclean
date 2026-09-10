import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, carpetItemArea, calcPackPricing } from '@/components/quiz/quizHelpers';
import { WHATSAPP_BASE } from '@/constants/business';
import { safeSessionSet } from '@/lib/safeStorage';
import { logError } from '@/lib/errorTracking';
import { IS_PRODUCTION } from '@/lib/quizTracking';

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
  packDiscountActive: boolean;
  packDiscountedPrice: number;
  packDiscountPct: number;
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

async function postToFormspree(payload: QuizLeadPayload, bookingId: string): Promise<Response> {
  const { name, phone, email, photos, finalLocation, message, serviceLabel } = payload;
  const formPayload = new FormData();
  formPayload.append('name', name);
  formPayload.append('phone', phone);
  if (email) formPayload.append('email', email);
  formPayload.append('location', finalLocation);
  formPayload.append('message', `${message}\nReferência do pedido: #${bookingId}`);
  formPayload.append('booking_id', bookingId);
  formPayload.append('subject', `Pedido de orçamento - ${serviceLabel}`);
  photos.forEach((photo, i) => {
    formPayload.append(`foto_${i + 1}`, photo, photo.name);
  });

  const doFetch = () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    return fetch('https://formspree.io/f/xreozzbp', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formPayload,
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));
  };

  try {
    return await doFetch();
  } catch (networkErr) {
    console.warn('[submissionService] Formspree first attempt failed, retrying once:', networkErr);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return await doFetch();
  }
}

async function insertCrmLead(payload: QuizLeadPayload, bookingId: string): Promise<void> {
  const {
    name, phone, email, crmServiceLabel, serviceTypeLabel, detailsSummary,
    finalLocation, priceText, message, upsellItems,
  } = payload;

  const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
  if (!isSupabaseConfigured) throw new Error('CRM não configurado');
  const { error } = await supabase.from('leads').insert({
    name,
    phone,
    email: email || null,
    service: crmServiceLabel,
    service_type: serviceTypeLabel,
    details: detailsSummary,
    location: finalLocation,
    value: priceText,
    booking_id: bookingId,
    message,
    status: 'pending',
    source: 'Website',
    priority: 'Quente',
    notes: upsellItems.map(item => item.label).join(' | '),
  });
  if (error) throw error;
}

export function buildWaUrl(payload: QuizLeadPayload, bookingId: string): string {
  const text = `Olá Kyro Clean Solutions. Gostaria de confirmar este pedido de orçamento.\n\n` +
    `Nome: ${payload.name}\nTelemóvel: ${payload.phone}\n` +
    `${payload.message}\n\nReferência do pedido: #${bookingId}\n` +
    `Aguardo a confirmação do orçamento e da disponibilidade.`;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`;
}

export function formatQuotePrice(payload: Pick<QuizLeadPayload, 'totalPrice' | 'packDiscountActive' | 'packDiscountedPrice' | 'packDiscountPct' | 'hasSobOrcamento' | 'hasUpsellSobItem'>): string {
  const value = payload.packDiscountActive ? payload.packDiscountedPrice : payload.totalPrice;
  const price = `${Number(value.toFixed(2)).toLocaleString('pt-PT')}€`;
  const discount = payload.packDiscountActive ? ` (Pack -${Math.round(payload.packDiscountPct * 100)}% nos serviços tabelados)` : '';
  return payload.hasSobOrcamento || payload.hasUpsellSobItem
    ? `${price} de subtotal conhecido${discount} + serviços sob orçamento`
    : value > 0 ? `${price}${discount}` : 'Sob orçamento';
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
    sofaItems.filter(i => i.qty > 0).forEach(item => {
      const opt = sofaPrices.find(p => p.id === item.sizeId);
      if (!opt) return;
      const unit = calcPackPricing(opt, item.packEnabled, isWaterproofBase, null, waterproofingTier).displayPrice;
      const tierTag = item.packEnabled
        ? (isPremiumTierSofa ? ' + Proteção 10 anos' : ' + Proteção 2 anos')
        : (isWaterproofBase ? (isPremiumTierSofa ? ' (Impermeab. Premium)' : ' (Impermeab. Essencial)') : '');
      receiptLines.push({ label: `Sofá ${opt.label}${tierTag}`, qty: item.qty, unitPrice: unit, total: unit !== null ? unit * item.qty : null });
    });
  } else if (service === 'mattress') {
    mattressItems.filter(i => i.qty > 0).forEach(item => {
      const opt = mattressPrices.find(p => p.id === item.sizeId);
      if (!opt) return;
      const baseP = isWaterproofBase
        ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : null)
        : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null);
      const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : null;
      const unit = item.packEnabled ? bothP : baseP;
      const typeStr = item.packEnabled ? ' (Pack: Limpeza + Anti Ácaros)' : isWaterproofBase ? ' (Anti Ácaros)' : ' (Limpeza)';
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
        receiptLines.push({ label: addonLabel, qty: wQty, unitPrice: addonUnit, total: addonTotal });
      }
      if (chairAntiAcaros) {
        receiptLines.push({ label: 'Anti Ácaros Cadeiras', qty: cQty, unitPrice: 5, total: cQty * 5 });
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
    totalPrice, hasSobOrcamento, hasUpsellSobItem, packDiscountActive, packDiscountedPrice, packDiscountPct,
    serviceLabel, serviceTypeLabel, finalLocation, slotLabel, name,
  } = payload;

  const isSobOrcamento = hasSobOrcamento || hasUpsellSobItem;
  const finalPriceText = formatQuotePrice(payload);

  const discountAmt = packDiscountActive ? Math.round((totalPrice - packDiscountedPrice) * 100) / 100 : 0;

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
    discountLabel: packDiscountActive ? `Pack Família −${Math.round(packDiscountPct * 100)}%` : null,
    discountAmount: discountAmt,
    total: packDiscountActive ? packDiscountedPrice : totalPrice,
    sobOrcamento: isSobOrcamento,
    location: finalLocation,
    slot: slotLabel,
    bookingId,
    name,
  }));
}

export async function submitQuizLead(payload: QuizLeadPayload): Promise<void> {
  const bookingId = generateBookingId();

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
    console.warn(`[submissionService] Fora de produção — pedido #${bookingId} NÃO enviado ao CRM nem ao Formspree (simulado).`);
    return;
  }

  // Await both channels: if EITHER one lands, the lead reached the business
  // and we resolve normally. Only reject (both failed) so the caller can fall
  // back to the WhatsApp/email toast — silently swallowing a total failure
  // means the customer thinks they're booked and the business never hears.
  const [crmResult, formspreeResult] = await Promise.allSettled([
    insertCrmLead(payload, bookingId),
    postToFormspree(payload, bookingId),
  ]);

  const crmOk = crmResult.status === 'fulfilled';
  const formspreeOk = formspreeResult.status === 'fulfilled' && formspreeResult.value.ok;
  const bothFailed = !crmOk && !formspreeOk;

  if (!crmOk) {
    const err = crmResult.status === 'rejected' ? crmResult.reason : null;
    logError({
      message: err instanceof Error ? err.message : String(err),
      source: 'QuizForm-crm',
      severity: bothFailed ? 'error' : 'warning',
      stack: err instanceof Error ? err.stack ?? null : null,
    });
  }

  if (!formspreeOk) {
    const err = formspreeResult.status === 'rejected'
      ? formspreeResult.reason
      : `Formspree HTTP ${formspreeResult.value.status}`;
    logError({
      message: err instanceof Error ? err.message : String(err),
      source: 'QuizForm-formspree',
      severity: bothFailed ? 'error' : 'warning',
      stack: err instanceof Error ? err.stack ?? null : null,
    });
  }

  if (bothFailed) {
    throw new Error('Both CRM insert and Formspree submission failed');
  }
  persist();
}
