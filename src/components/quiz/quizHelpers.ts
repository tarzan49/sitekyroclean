import type { SofaItem, MattressItem } from './QuizTypes';

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

// ── Carpet ────────────────────────────────────────────────────────────────────
export const CARPET_TIERS = [
  { label: 'Até 5 m²',   sublabel: 'Pequenos', rate: 10,   max: 5 },
  { label: '5 a 10 m²',  sublabel: 'Médios',   rate: 8,    max: 10 },
  { label: '10 a 15 m²', sublabel: 'Grandes',  rate: 7,    max: 15 },
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
  if (area <= 5)  return area * 10;
  if (area <= 10) return 50 + (area - 5) * 8;
  return 90 + (area - 10) * 7;
}

// ── Chairs ────────────────────────────────────────────────────────────────────
export const CHAIR_TIERS = [
  { label: '1ª a 3ª', sublabel: 'cadeira', rate: 17.5 },
  { label: '4ª a 6ª', sublabel: 'cadeira', rate: 12.5 },
  { label: '7ª a 9ª', sublabel: 'cadeira', rate: 10 },
  { label: '10+',     sublabel: 'cadeiras', rate: null },
] as const;

export const CHAIR_WATERPROOF_TIERS = [
  { label: '1 a 4',  sublabel: 'cadeiras', rate: 17.5 },
  { label: '5 a 10', sublabel: 'cadeiras', rate: 15 },
  { label: '11+',    sublabel: 'cadeiras', rate: null },
] as const;

export function chairActiveTier(qty: number): number {
  if (qty <= 3) return 0;
  if (qty <= 6) return 1;
  if (qty <= 9) return 2;
  return 3;
}

// Bracket pricing: 1-3 @ 17.5€ · 4-6 @ 12.5€ · 7-9 @ 10€ · 10+: sob orçamento
export function calcChairClean(qty: number): number | null {
  if (qty <= 0 || qty >= 10) return null;
  if (qty <= 3) return qty * 17.5;
  if (qty <= 6) return 52.5 + (qty - 3) * 12.5;
  return 90 + (qty - 6) * 10;
}

// Progressive: first 4 @ 17.5€, then 15€ each, 11+: sob orçamento
export function calcChairWaterproof(qty: number): number | null {
  if (qty <= 0 || qty > 10) return null;
  if (qty <= 4) return qty * 17.5;
  return 4 * 17.5 + (qty - 4) * 15;
}

export function fmtN(n: number): string {
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(1).replace('.', ',')}€`;
}
