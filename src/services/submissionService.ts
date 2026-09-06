import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium, carpetItemArea } from '@/components/quiz/quizHelpers';
import { WHATSAPP_BASE } from '@/constants/business';
import { safeSessionSet } from '@/lib/safeStorage';
import { logError } from '@/lib/errorTracking';

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
}

function generateBookingId(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

async function postToFormspree(payload: QuizLeadPayload): Promise<Response> {
  const { name, phone, email, photos, finalLocation, message, serviceLabel } = payload;
  const formPayload = new FormData();
  formPayload.append('name', name);
  formPayload.append('phone', phone);
  if (email) formPayload.append('email', email);
  formPayload.append('location', finalLocation);
  formPayload.append('message', message);
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

  const upsellNotes = upsellItems.length > 0
    ? upsellItems.map(item => {
        const imp = item.waterproof ? ' + Impermeabilização' : '';
        if (item.id === 'mattress') return `Colchão: ${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? item.mattressSize ?? '?'}${imp}`;
        if (item.id === 'carpet') return `Tapete: ${item.carpetArea ?? '?'}m²${imp}`;
        if (item.id === 'chairs') return `Cadeiras: ${item.chairQty ?? '?'}x${imp}`;
        return item.id;
      }).join(' | ')
    : '';

  const { supabase } = await import('@/lib/supabase');
  await supabase.from('leads').insert({
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
    notes: upsellNotes,
  });
}

function buildWaUrl(payload: QuizLeadPayload, bookingId: string): string {
  const {
    serviceLabel, serviceTypeLabel, detailsSummary, finalLocation,
    totalPrice, hasSobOrcamento, hasUpsellSobItem, packDiscountActive, packDiscountedPrice, hypoallergenic, hypoSurcharge,
  } = payload;

  const waExtras: string[] = [];
  if (serviceTypeLabel) waExtras.push(serviceTypeLabel);
  if (hypoallergenic === true) waExtras.push(`Produtos Hipoalergénicos (+${hypoSurcharge}€)`);
  const waExtrasText = waExtras.length > 0 ? waExtras.join(' + ') : 'Sem extras';

  const waTotalPrice = (hasSobOrcamento || hasUpsellSobItem)
    ? 'Sob orçamento'
    : packDiscountActive && totalPrice > 0
      ? `${packDiscountedPrice}€ (Pack -10%)`
      : totalPrice > 0
        ? `${totalPrice}€`
        : 'Sob orçamento';

  const waText = encodeURIComponent(
    `Olá Kyro Clean Solutions. Acabei de gerar um orçamento detalhado no site e pretendo confirmar o agendamento.\n\n` +
    `DADOS DO PEDIDO:\n` +
    `▸ Serviço: ${serviceLabel}\n` +
    `▸ Item: ${detailsSummary || 'N/D'}\n` +
    `▸ Extras: ${waExtrasText}\n` +
    `▸ Localização: ${finalLocation}\n` +
    `▸ Valor Total: ${waTotalPrice}\n` +
    `▸ Código de Reserva: #${bookingId}\n\n` +
    `Aguardo contacto para validação final.`
  );

  return `${WHATSAPP_BASE}?text=${waText}`;
}

function buildReceiptLines(payload: QuizLeadPayload) {
  const {
    service, serviceType, waterproofingTier, sofaItems, mattressItems, upsellItems, carpetItems, chairQuantity,
    chairWaterproofQty, chairAntiAcaros, calculateServicePrice, finalTravelCost, finalLocation,
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
      const baseP = isWaterproofBase
        ? (isPremiumTierSofa
            ? (typeof opt.waterproofingPremiumPrice === 'number' ? (opt.waterproofingPremiumPrice as number) : null)
            : (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : null))
        : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null);
      // Pack Premium = pack Essencial + a mesma diferença já aprovada entre Essencial
      // e Premium standalone (ver quizHelpers.ts calcPackPricing).
      const tierDelta = isPremiumTierSofa && typeof opt.waterproofingPremiumPrice === 'number' && typeof opt.waterproofingPrice === 'number'
        ? (opt.waterproofingPremiumPrice as number) - (opt.waterproofingPrice as number) : 0;
      const bothEssencial = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : null;
      const bothP = bothEssencial !== null ? bothEssencial + tierDelta : null;
      const unit = item.packEnabled ? bothP : baseP;
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
    carpetItems
      .map(carpetItemArea)
      .filter((area): area is number => area !== null)
      .forEach(area => {
        const label = `Tapete ${area % 1 === 0 ? area : Math.round(area * 100) / 100}m²`;
        receiptLines.push({ label, qty: 1, unitPrice: null, total: null });
      });
  }

  upsellItems.forEach(item => {
    const q = item.qty ?? 1;
    const unitP = q > 0 && item.price > 0 ? Math.round(item.price / q * 100) / 100 : null;
    receiptLines.push({ label: item.label, qty: q, unitPrice: unitP, total: item.price > 0 ? item.price : null });
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
  const finalPriceText = isSobOrcamento
    ? 'Sob orçamento'
    : packDiscountActive && totalPrice > 0
      ? `${packDiscountedPrice}€ (Pack -10%)`
      : totalPrice > 0
        ? `${totalPrice}€`
        : 'Sob orçamento';

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

  // Persist receipt + WA URL FIRST — synchronous, no network, so /obrigado
  // renders the full receipt as soon as the caller navigates.
  try {
    const waUrl = buildWaUrl(payload, bookingId);
    persistObrigadoData(payload, bookingId, waUrl);
  } catch (persistErr) {
    console.warn('[submissionService] persistObrigadoData failed:', persistErr);
  }

  // Await both channels: if EITHER one lands, the lead reached the business
  // and we resolve normally. Only reject (both failed) so the caller can fall
  // back to the WhatsApp/email toast — silently swallowing a total failure
  // means the customer thinks they're booked and the business never hears.
  const [crmResult, formspreeResult] = await Promise.allSettled([
    insertCrmLead(payload, bookingId),
    postToFormspree(payload),
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
}
