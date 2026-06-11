/**
 * submissionService.ts
 * Handles the full quiz lead submission pipeline:
 *   1. Formspree HTTP POST (primary capture, supports file uploads)
 *   2. Supabase CRM insert (silent fallback — never blocks the happy path)
 *
 * Pure async function — no React, no hooks.
 */

import { mattressPrices } from '@/components/quiz/QuizTypes';
import type { UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { WHATSAPP_BASE } from '@/constants/business';

// ── Payload type ─────────────────────────────────────────────────────────────

/** All the data the submission pipeline needs. Assembled by the orchestrator. */
export interface QuizLeadPayload {
  // Contact
  name: string;
  phone: string;
  email: string;

  // Resolved location string (already de-aliased, e.g. "Porto")
  finalLocation: string;

  // Human-readable labels (computed by orchestrator)
  serviceLabel: string;
  serviceTypeLabel: string;
  crmServiceLabel: string;
  timingLabel: string;
  contactLabel: string;
  detailsSummary: string;

  // Pricing
  totalPrice: number;
  packDiscountActive: boolean;
  packDiscountedPrice: number;
  packDiscountPct: number;
  discountedPrice: number;
  isFreeTravel: boolean;
  finalTravelCost: number;

  // WA slot info
  slotDay: string;
  slotTime: string;
  slotLabel: string;

  // Files
  photos: File[];

  // Upsell items (for CRM notes & receipt)
  upsellItems: UpsellItemConfig[];

  // Receipt lines (built by orchestrator)
  receiptLines: Array<{
    label: string;
    qty: number;
    unitPrice: number | null;
    total: number | null;
  }>;

  // Hypoallergenic surcharge (currently always 0, kept for future use)
  hypoSurcharge: number;
  hypoallergenic: boolean | null;

  // Description / observations
  description: string;

  // Full message body (pre-formatted by orchestrator)
  message: string;
}

// ── Private helpers ───────────────────────────────────────────────────────────

function generateBookingId(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

async function postToFormspree(payload: QuizLeadPayload): Promise<void> {
  const { name, phone, email, photos, finalLocation, message, serviceLabel } = payload;
  const formPayload = new FormData();
  formPayload.append('name', name);
  formPayload.append('phone', phone);
  if (email.trim()) formPayload.append('email', email);
  formPayload.append('location', finalLocation);
  formPayload.append('message', message);
  formPayload.append('subject', `Pedido de orçamento - ${serviceLabel}`);
  photos.forEach((photo, i) => {
    formPayload.append(`foto_${i + 1}`, photo, photo.name);
  });

  const response = await fetch('https://formspree.io/f/xreozzbp', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formPayload,
  });

  if (!response.ok) throw new Error('Erro ao enviar');
}

async function insertCrmLead(payload: QuizLeadPayload, bookingId: string): Promise<void> {
  const {
    name, phone, email, crmServiceLabel, serviceTypeLabel, detailsSummary,
    finalLocation, slotLabel, message, totalPrice, packDiscountActive,
    packDiscountedPrice, packDiscountPct, upsellItems,
  } = payload;

  const priceText =
    packDiscountActive && totalPrice > 0
      ? `${packDiscountedPrice}€ (IVA incl., Pack -${Math.round(packDiscountPct * 100)}%)`
      : totalPrice > 0
        ? `${totalPrice}€ (IVA incl.)`
        : 'Sob orçamento';

  const upsellNotes =
    upsellItems.length > 0
      ? upsellItems
          .map(item => {
            const imp = item.waterproof ? ' + Impermeabilização' : '';
            if (item.id === 'mattress')
              return `Colchão: ${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? item.mattressSize ?? '?'}${imp}`;
            if (item.id === 'carpet') return `Tapete: ${item.carpetArea ?? '?'}m²${imp}`;
            if (item.id === 'chairs') return `Cadeiras: ${item.chairQty ?? '?'}x${imp}`;
            return item.id;
          })
          .join(' | ')
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
    slot: slotLabel,
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
    slotDay, slotTime, totalPrice, packDiscountActive, packDiscountedPrice,
    packDiscountPct, hypoallergenic, hypoSurcharge,
  } = payload;

  const waExtras: string[] = [];
  if (serviceTypeLabel) waExtras.push(serviceTypeLabel);
  if (hypoallergenic === true) waExtras.push(`Produtos Hipoalergénicos (+${hypoSurcharge}€)`);
  const waExtrasText = waExtras.length > 0 ? waExtras.join(' + ') : 'Sem extras';

  const waTotalPrice =
    packDiscountActive && totalPrice > 0
      ? `${packDiscountedPrice}€ (Pack -${Math.round(packDiscountPct * 100)}%) (IVA incl.)`
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
    `▸ Vaga Pretendida: ${slotDay} às ${slotTime}\n` +
    `▸ Código de Reserva: #${bookingId}\n\n` +
    `Aguardo contacto para validação final.`,
  );

  return `${WHATSAPP_BASE}?text=${waText}`;
}

function writeSessionStorage(payload: QuizLeadPayload, bookingId: string, waUrl: string): void {
  const {
    totalPrice, packDiscountActive, packDiscountedPrice, packDiscountPct,
    serviceLabel, serviceTypeLabel,
    finalLocation, email, receiptLines, slotLabel, name,
  } = payload;

  const discountAmt = packDiscountActive
    ? Math.round((totalPrice - packDiscountedPrice) * 100) / 100
    : 0;

  const finalPriceText =
    packDiscountActive && totalPrice > 0
      ? `${packDiscountedPrice}€ (Pack -${Math.round(packDiscountPct * 100)}%)`
      : totalPrice > 0
        ? `${totalPrice}€`
        : 'Sob orçamento';

  sessionStorage.setItem('kyro_booking_id', bookingId);
  sessionStorage.setItem('kyro_wa_url', waUrl);
  sessionStorage.setItem(
    'kyro_summary',
    JSON.stringify({
      price: finalPriceText,
      service: `${serviceLabel}${serviceTypeLabel ? `: ${serviceTypeLabel}` : ''}`,
      location: finalLocation,
      email,
    }),
  );
  sessionStorage.setItem(
    'kyro_receipt',
    JSON.stringify({
      lines: receiptLines,
      subtotal: totalPrice,
      discountLabel: packDiscountActive
        ? `Pack Família −${Math.round(packDiscountPct * 100)}%`
        : null,
      discountAmount: discountAmt,
      total: packDiscountActive ? packDiscountedPrice : totalPrice,
      location: finalLocation,
      slot: slotLabel,
      bookingId,
      name,
    }),
  );
}

// ── Main function ─────────────────────────────────────────────────────────────

/**
 * Submits the quiz lead to Formspree and (silently) to Supabase CRM.
 * On success, populates sessionStorage keys expected by the `/obrigado` page.
 * Throws on Formspree failure so the caller can show an error toast.
 */
export async function submitQuizLead(payload: QuizLeadPayload): Promise<void> {
  await postToFormspree(payload);

  const bookingId = generateBookingId();

  try {
    await insertCrmLead(payload, bookingId);
  } catch (supaErr) {
    console.warn('[CRM] Lead backup failed silently:', supaErr);
  }

  const waUrl = buildWaUrl(payload, bookingId);
  writeSessionStorage(payload, bookingId, waUrl);
}
