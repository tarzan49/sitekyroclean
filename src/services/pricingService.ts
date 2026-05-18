/**
 * pricingService.ts
 * Pure pricing calculation functions for the Kyro Clean quiz.
 * No React, no hooks, no side-effects — safe to call from anywhere.
 */

import { sofaPrices, mattressPrices, sofaChaisePrice } from '@/components/quiz/QuizTypes';
import type { QuizFormData, SofaItem, MattressItem } from '@/components/quiz/QuizTypes';

// ── Re-exports (consumers may import from here) ──────────────────────────────

export { sofaPrices, mattressPrices, sofaChaisePrice };

// ── Carpet helpers ────────────────────────────────────────────────────────────

/** Tier table for carpet pricing display. */
export const CARPET_TIERS = [
  { label: 'Até 5 m²',   sublabel: 'Pequenos', rate: 10,   max: 5 },
  { label: '5 – 10 m²',  sublabel: 'Médios',   rate: 8,    max: 10 },
  { label: '10 – 15 m²', sublabel: 'Grandes',  rate: 7,    max: 15 },
  { label: '+15 m²',     sublabel: 'Extra',    rate: null, max: Infinity },
] as const;

/** Tier table for chair pricing display. */
export const CHAIR_TIERS = [
  { label: 'Até 3', sublabel: 'cadeiras', rate: 17.5 },
  { label: '4 a 6', sublabel: 'cadeiras', rate: 15 },
  { label: '7 a 10', sublabel: 'cadeiras', rate: 12.5 },
  { label: '+10',   sublabel: 'cadeiras', rate: null },
] as const;

/**
 * Returns the active carpet tier index (0-3) for a given area.
 * @param area - Area in m²
 */
export function carpetActiveTier(area: number): number {
  if (area <= 5) return 0;
  if (area <= 10) return 1;
  if (area <= 15) return 2;
  return 3;
}

/**
 * Calculates the carpet cleaning price for a given area.
 * Returns null when area is >15 m² (custom quote required).
 * @param area - Area in m²
 */
export function calcCarpetPrice(area: number): number | null {
  if (area <= 0) return null;
  if (area <= 5)  return area * 10;
  if (area <= 10) return Math.max(50, area * 8);
  if (area <= 15) return Math.max(80, area * 7);
  return null;
}

/**
 * Returns the active chair tier index (0-3) for a given quantity.
 * @param qty - Number of chairs
 */
export function chairActiveTier(qty: number): number {
  if (qty <= 3) return 0;
  if (qty <= 6) return 1;
  if (qty <= 10) return 2;
  return 3;
}

/**
 * Calculates the chair cleaning price for a given quantity.
 * Returns null when qty ≤ 0 or qty > 10 (custom quote required).
 * @param qty - Number of chairs
 */
export function calcChairClean(qty: number): number | null {
  if (qty <= 0 || qty > 10) return null;
  if (qty <= 3)  return qty * 17.5;
  if (qty <= 6)  return Math.max(52.5, qty * 15);
  return Math.max(90, qty * 12.5);
}

// ── Main service price ────────────────────────────────────────────────────────

/**
 * Calculates the base service price from the current form state.
 * Mirrors the useMemo in the original QuizForm.tsx.
 *
 * @param formData    - Current quiz form data
 * @param sofaItems   - Sofa item list
 * @param mattressItems - Mattress item list
 * @returns Total price in euros (0 when service is not yet configured)
 */
export function calculateServicePrice(
  formData: QuizFormData,
  sofaItems: SofaItem[],
  mattressItems: MattressItem[],
): number {
  let price = 0;

  switch (formData.service) {
    case 'sofa': {
      const hasSofas = sofaItems.some(i => i.qty > 0);
      sofaItems.forEach(item => {
        if (item.qty <= 0) return;
        const opt = sofaPrices.find(p => p.id === item.sizeId);
        if (!opt) return;
        const isWaterproofBase = formData.serviceType === 'waterproofing';
        const baseP = isWaterproofBase
          ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : 0)
          : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0);
        const unitPrice = item.packEnabled ? baseP + 30 : baseP;
        if (unitPrice > 0) price += unitPrice * item.qty;
      });
      if (hasSofas) {
        // chaiseLongueQty is not available here — callers must add it separately
        // (chaise is included via the sofaItems loop in the orchestrator)
      }
      break;
    }

    case 'mattress': {
      mattressItems.forEach(item => {
        if (item.qty <= 0) return;
        const opt = mattressPrices.find(p => p.id === item.sizeId);
        if (!opt) return;
        const isWaterproofBase = formData.serviceType === 'waterproofing';
        const baseP = isWaterproofBase
          ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : 0)
          : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0);
        const unitPrice = item.packEnabled ? baseP + 30 : baseP;
        if (unitPrice > 0) price += unitPrice * item.qty;
      });
      break;
    }

    case 'chairs': {
      const chairQty = parseInt(formData.chairQuantity);
      if (!isNaN(chairQty) && chairQty > 0) {
        if (chairQty <= 3) price = chairQty * 17.5;
        else if (chairQty <= 6) price = Math.max(3 * 17.5, chairQty * 15);
        else if (chairQty <= 10) price = Math.max(6 * 15, chairQty * 12.5);
        else price = 0; // >10 → custom quote
        if (formData.chairWaterproofing && price > 0) {
          price += chairQty * 7.5;
        }
      }
      break;
    }

    case 'carpet': {
      const carpetArea = parseFloat(formData.carpetArea);
      if (!isNaN(carpetArea) && carpetArea > 0) {
        if (carpetArea <= 5) price = carpetArea * 10;
        else if (carpetArea <= 10) price = Math.max(5 * 10, carpetArea * 8);
        else if (carpetArea <= 15) price = Math.max(10 * 8, carpetArea * 7);
        else price = 0; // >15m² → custom quote
      }
      break;
    }
  }

  return price;
}

/**
 * Calculates the live preview price for the Pack Família "mirror" configuration screen.
 *
 * @param pendingUpsellId         - The service type being configured ('sofa'|'mattress'|'carpet'|'chairs')
 * @param mirrorSofaItems         - Sofa items being configured in the mirror
 * @param mirrorMattressItems     - Mattress items being configured in the mirror
 * @param mirrorChaiseLongueQty   - Chaise longue qty in the mirror
 * @param mirrorCarpetArea        - Carpet area string in the mirror
 * @param mirrorChairQty          - Chair qty string in the mirror
 * @param mirrorChairWaterproofing - Whether waterproofing is selected for mirror chairs
 * @returns Price rounded to 2 decimal places
 */
export function calcMirrorTotal(
  pendingUpsellId: string | null,
  mirrorSofaItems: SofaItem[],
  mirrorMattressItems: MattressItem[],
  mirrorChaiseLongueQty: number,
  mirrorCarpetArea: string,
  mirrorChairQty: string,
  mirrorChairWaterproofing: boolean,
): number {
  if (!pendingUpsellId) return 0;
  let p = 0;

  if (pendingUpsellId === 'sofa') {
    const hasMirrorSofas = mirrorSofaItems.some(i => i.qty > 0);
    mirrorSofaItems.forEach(item => {
      if (item.qty <= 0) return;
      const opt = sofaPrices.find(o => o.id === item.sizeId);
      if (!opt || typeof opt.cleaningPrice !== 'number') return;
      const cleanP = opt.cleaningPrice as number;
      const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : cleanP;
      p += (item.packEnabled ? bothP : cleanP) * item.qty;
    });
    if (mirrorChaiseLongueQty > 0 && hasMirrorSofas) {
      p += mirrorChaiseLongueQty * sofaChaisePrice.cleaning;
    }
  } else if (pendingUpsellId === 'mattress') {
    mirrorMattressItems.forEach(item => {
      if (item.qty <= 0) return;
      const opt = mattressPrices.find(o => o.id === item.sizeId);
      if (!opt || typeof opt.cleaningPrice !== 'number') return;
      const cleanP = opt.cleaningPrice as number;
      const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : cleanP;
      p += (item.packEnabled ? bothP : cleanP) * item.qty;
    });
  } else if (pendingUpsellId === 'carpet') {
    const a = parseFloat(mirrorCarpetArea);
    if (!isNaN(a) && a > 0 && a <= 15) {
      p = a <= 5 ? a * 10 : a <= 10 ? a * 8 : a * 7;
    }
  } else if (pendingUpsellId === 'chairs') {
    const qty = parseInt(mirrorChairQty);
    if (!isNaN(qty) && qty > 0 && qty <= 10) {
      p = qty <= 3 ? qty * 17.5 : qty <= 6 ? qty * 15 : qty * 12.5;
      if (mirrorChairWaterproofing) p += qty * 7.5;
    }
  }

  return Math.round(p * 100) / 100;
}

/**
 * Determines whether the current configuration requires a custom quote (no fixed price).
 *
 * @param formData      - Current quiz form data
 * @param sofaItems     - Sofa item list
 * @param mattressItems - Mattress item list
 */
export function isSobOrcamento(
  formData: QuizFormData,
  sofaItems: SofaItem[],
  mattressItems: MattressItem[],
): boolean {
  switch (formData.service) {
    case 'sofa': {
      if (!sofaItems.some(i => i.qty > 0)) return false;
      return sofaItems.some(i => i.qty > 0 && i.sizeId === '4+-lugares');
    }
    case 'mattress':
      // All mattress sizes have fixed prices
      return false;
    case 'chairs': {
      const chairQty = parseInt(formData.chairQuantity);
      return isNaN(chairQty) || chairQty <= 0 || chairQty > 10;
    }
    case 'carpet': {
      const area = parseFloat(formData.carpetArea);
      return isNaN(area) || area <= 0 || area > 15;
    }
    default:
      return false;
  }
}

/**
 * Applies the 5% urgency (timer) discount when the timer is active.
 *
 * @param totalPrice      - Raw total price
 * @param isDiscountActive - Whether the countdown timer is still running
 * @returns Rounded discounted price
 */
export function calcDiscountedPrice(totalPrice: number, isDiscountActive: boolean): number {
  return isDiscountActive && totalPrice > 0
    ? Math.round(totalPrice * 0.95)
    : Math.round(totalPrice);
}

/**
 * Applies the Pack Família discount (10%) which supersedes the timer discount (5%).
 * Falls back to the discounted price when the pack is not active.
 *
 * @param totalPrice       - Raw total price
 * @param packDiscountActive - Whether the pack discount is active
 * @param packDiscountPct  - Pack discount fraction (e.g. 0.10)
 * @param isDiscountActive - Whether the urgency timer is still running
 * @returns Rounded final price
 */
export function calcPackDiscountedPrice(
  totalPrice: number,
  packDiscountActive: boolean,
  packDiscountPct: number,
  isDiscountActive: boolean,
): number {
  if (packDiscountActive && totalPrice > 0) {
    return Math.round(totalPrice * (1 - packDiscountPct));
  }
  return calcDiscountedPrice(totalPrice, isDiscountActive);
}
