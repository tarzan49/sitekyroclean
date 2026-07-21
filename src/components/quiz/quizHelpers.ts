import type { SofaItem, MattressItem, PriceOption } from './QuizTypes';

// ── Sofa helpers ─────────────────────────────────────────────────────────────
export function sofaSetQty(items: SofaItem[], sizeId: string, newQty: number): SofaItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
export function sofaTogglePack(items: SofaItem[], sizeId: string): SofaItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}

// ── Mattress helpers ──────────────────────────────────────────────────────────
export function mattressSetQty(items: MattressItem[], sizeId: string, newQty: number): MattressItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
export function mattressTogglePack(items: MattressItem[], sizeId: string): MattressItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}

// ── Pack pricing (sofa + mattress) ────────────────────────────────────────────
export interface PackPricing {
  isSob: boolean;
  basePrice: number | null;
  packPrice: number | null;
  packDelta: number | null;
  displayPrice: number | null;
}

// fallbackDelta covers options without a fixed bothPrice (e.g. sofa "+40€" upsell);
// mattress options always have a bothPrice, so they pass no fallback (null).
export function calcPackPricing(
  option: PriceOption,
  packOn: boolean,
  isWaterproofBase: boolean,
  fallbackDelta: number | null = null,
): PackPricing {
  const isSob = typeof option.cleaningPrice !== 'number';
  const cleanPrice = typeof option.cleaningPrice === 'number' ? option.cleaningPrice : null;
  const waterPrice = typeof option.waterproofingPrice === 'number' ? option.waterproofingPrice : null;
  const basePrice = isWaterproofBase ? waterPrice : cleanPrice;
  const bothFullP = typeof option.bothPrice === 'number' ? option.bothPrice : null;
  const packPrice = bothFullP ?? (fallbackDelta !== null && basePrice !== null ? basePrice + fallbackDelta : null);
  const packDelta = packPrice !== null && basePrice !== null ? packPrice - basePrice : fallbackDelta;
  const displayPrice = packOn && packPrice !== null ? packPrice : basePrice;
  return { isSob, basePrice, packPrice, packDelta, displayPrice };
}

// ── Carpet ────────────────────────────────────────────────────────────────────
export const CARPET_TIERS = [
  { label: 'Até 5 m²',   sublabel: 'Pequenos', rate: 12,   max: 5 },
  { label: '5 a 10 m²',  sublabel: 'Médios',   rate: 10,   max: 10 },
  { label: '10 a 15 m²', sublabel: 'Grandes',  rate: 9,    max: 15 },
  { label: '+15 m²',     sublabel: 'Extra',    rate: null, max: Infinity },
] as const;

export function carpetActiveTier(area: number): number {
  if (area <= 5) return 0;
  if (area <= 10) return 1;
  if (area <= 15) return 2;
  return 3;
}

export function calcCarpetPrice(area: number): number | null {
  if (area <= 0 || area > 15) return null;
  if (area <= 5)  return area * 12;
  if (area <= 10) return 60 + (area - 5) * 10;
  return 110 + (area - 10) * 9;
}

// ── Chairs ────────────────────────────────────────────────────────────────────
export const CHAIR_TIERS = [
  { label: '1ª a 4ª',  sublabel: 'cadeira', rate: 20 },
  { label: '5ª a 7ª',  sublabel: 'cadeira', rate: 17.5 },
  { label: '8ª a 10ª', sublabel: 'cadeira', rate: 15 },
  { label: '11+',      sublabel: 'cadeiras', rate: null },
] as const;

export const CHAIR_WATERPROOF_TIERS = [
  { label: '1 a 6',  sublabel: 'cadeiras', rate: 25 },
  { label: '7 a 10', sublabel: 'cadeiras', rate: 20 },
  { label: '11+',    sublabel: 'cadeiras', rate: null },
] as const;

export function chairActiveTier(qty: number): number {
  if (qty <= 4) return 0;
  if (qty <= 7) return 1;
  if (qty <= 10) return 2;
  return 3;
}

// Bracket pricing: 1-4 @ 20€ · 5-7 @ 17.5€ · 8-10 @ 15€ · 11+: sob orçamento
export function calcChairClean(qty: number): number | null {
  if (qty <= 0 || qty > 10) return null;
  if (qty <= 4) return qty * 20;
  if (qty <= 7) return 80 + (qty - 4) * 17.5;
  return 132.5 + (qty - 7) * 15;
}

// Progressive: 1-6 @ 25€, 7-10 @ 20€ each, 11+: sob orçamento
export function calcChairWaterproof(qty: number): number | null {
  if (qty <= 0 || qty > 10) return null;
  if (qty <= 6) return qty * 25;
  return 6 * 25 + (qty - 6) * 20;
}

export function fmtN(n: number): string {
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(1).replace('.', ',')}€`;
}
