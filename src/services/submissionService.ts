import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { SofaItem, MattressItem, UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof } from '@/components/quiz/quizHelpers';
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
  serviceLabel: string;
  serviceTypeLabel: string;
  crmServiceLabel: string;
  detailsSummary: string;
  priceText: string;
  message: string;

  sofaItems: SofaItem[];
  mattressItems: MattressItem[];
  upsellItems: UpsellItemConfig[];
  carpetArea: string;
  chairQuantity: string;
  chairWaterproofQty: number;
  calculateServicePrice: number;

  totalPrice: number;
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

  // Submissions on mobile networks can fail transiently (timeouts, brief
  // connection drops). Retry once before treating it as a real failure.
  try {
    return await fetch('https://formspree.io/f/xreozzbp', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formPayload,
    });
  } catch (networkErr) {
    console.warn('[submissionService] Formspree fetch failed, retrying once:', networkErr);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return await fetch('https://formspree.io/f/xreozzbp', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formPayload,
    });
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
    totalPrice, packDiscountActive, packDiscountedPrice, hypoallergenic, hypoSurcharge,
  } = payload;

  const waExtras: string[] = [];
  if (serviceTypeLabel) waExtras.push(serviceTypeLabel);
  if (hypoallergenic === true) waExtras.push(`Produtos Hipoalergénicos (+${hypoSurcharge}€)`);
  const waExtrasText = waExtras.length > 0 ? waExtras.join(' + ') : 'Sem extras';

  const waTotalPrice = packDiscountActive && totalPrice > 0
    ? `${packDiscountedPrice}€ (Pack -10%) (IVA incl.)`
    : totalPrice > 0
      ? `${totalPrice}€ (IVA incl.)`
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
    service, sofaItems, mattressItems, upsellItems, carpetArea, chairQuantity,
    chairWaterproofQty, calculateServicePrice, finalTravelCost, finalLocation,
  } = payload;

  const receiptLines: Array<{ label: string; qty: number; unitPrice: number | null; total: number | null }> = [];

  if (service === 'sofa') {
    sofaItems.filter(i => i.qty > 0).forEach(item => {
      const opt = sofaPrices.find(p => p.id === item.sizeId);
      if (!opt) return;
      const unit = item.packEnabled && typeof opt.bothPrice === 'number'
        ? (opt.bothPrice as number)
        : typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null;
      receiptLines.push({ label: `Sofá ${opt.label}${item.packEnabled ? ' + Impermeab.' : ''}`, qty: item.qty, unitPrice: unit, total: unit !== null ? unit * item.qty : null });
    });
  } else if (service === 'mattress') {
    mattressItems.filter(i => i.qty > 0).forEach(item => {
      const opt = mattressPrices.find(p => p.id === item.sizeId);
      if (!opt) return;
      const unit = item.packEnabled && typeof opt.bothPrice === 'number'
        ? (opt.bothPrice as number)
        : typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null;
      const typeStr = item.packEnabled ? ' (Pack Proteção Total)' : ' (Limpeza)';
      receiptLines.push({ label: `Colchão ${opt.label}${typeStr}`, qty: item.qty, unitPrice: unit, total: unit !== null ? unit * item.qty : null });
    });
  } else if (service === 'chairs') {
    const cQty = parseInt(chairQuantity);
    if (!isNaN(cQty) && cQty > 0) {
      const cleanTotal = calcChairClean(cQty);
      receiptLines.push({ label: 'Limpeza Cadeiras', qty: cQty, unitPrice: cleanTotal !== null ? Math.round(cleanTotal / cQty * 10) / 10 : null, total: cleanTotal });
      const wQty = chairWaterproofQty;
      if (wQty > 0) {
        const wTotal = calcChairWaterproof(wQty);
        const wUnit = wQty <= 6 ? 15 : wQty <= 9 ? 12.5 : null;
        receiptLines.push({ label: 'Impermeabilização Cadeiras', qty: wQty, unitPrice: wUnit, total: wTotal });
      }
    }
  } else if (service === 'carpet') {
    receiptLines.push({ label: `Tapete ${carpetArea}m²`, qty: 1, unitPrice: calculateServicePrice || null, total: calculateServicePrice || null });
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
    totalPrice, packDiscountActive, packDiscountedPrice, packDiscountPct,
    serviceLabel, serviceTypeLabel, finalLocation, slotLabel, name,
  } = payload;

  const finalPriceText = packDiscountActive && totalPrice > 0
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
    location: finalLocation,
    slot: slotLabel,
    bookingId,
    name,
  }));
}

/**
 * Submits the quiz lead via two independent channels - Formspree (email
 * notification) and Supabase (CRM record). Browser extensions/ad-blockers
 * frequently block requests to formspree.io, so the lead must not be lost
 * just because that one channel was blocked: the submission only counts as
 * failed if BOTH channels fail. Whichever channel(s) succeed, we proceed to
 * the "Obrigado" page (failures in the other channel are logged as warnings).
 */
export async function submitQuizLead(payload: QuizLeadPayload): Promise<void> {
  const bookingId = generateBookingId();

  const [formspreeResult, crmResult] = await Promise.allSettled([
    postToFormspree(payload),
    insertCrmLead(payload, bookingId),
  ]);

  const formspreeOk = formspreeResult.status === 'fulfilled' && formspreeResult.value.ok;
  const crmOk = crmResult.status === 'fulfilled';

  if (!formspreeOk && !crmOk) {
    const formspreeErr = formspreeResult.status === 'rejected'
      ? formspreeResult.reason
      : `HTTP ${formspreeResult.value.status}`;
    const crmErr = crmResult.status === 'rejected' ? crmResult.reason : 'unknown error';
    throw new Error(`Formspree failed (${formspreeErr}) and CRM insert failed (${crmErr})`);
  }

  if (!formspreeOk) {
    const reason = formspreeResult.status === 'rejected' ? formspreeResult.reason : `HTTP ${formspreeResult.value.status}`;
    console.warn('[submissionService] Formspree failed, lead captured via CRM:', reason);
    logError({
      message: `Formspree submission failed: ${String(reason)}`,
      source: 'QuizForm-post-submit',
      severity: 'warning',
      stack: null,
    });
  }

  if (!crmOk) {
    console.warn('[CRM] Lead backup failed, lead captured via Formspree:', crmResult.reason);
    logError({
      message: crmResult.reason instanceof Error ? crmResult.reason.message : String(crmResult.reason),
      source: 'QuizForm-post-submit',
      severity: 'warning',
      stack: crmResult.reason instanceof Error ? crmResult.reason.stack ?? null : null,
    });
  }

  try {
    const waUrl = buildWaUrl(payload, bookingId);
    persistObrigadoData(payload, bookingId, waUrl);
  } catch (postSubmitError) {
    console.warn('[submissionService] Post-submit enrichment failed (lead already sent):', postSubmitError);
    logError({
      message: postSubmitError instanceof Error ? postSubmitError.message : String(postSubmitError),
      source: 'QuizForm-post-submit',
      severity: 'warning',
      stack: postSubmitError instanceof Error ? postSubmitError.stack ?? null : null,
    });
  }
}
