import { sofaPrices, mattressPrices } from './QuizTypes';
import type { SofaItem, MattressItem, CarpetItem, PriceOption } from './QuizTypes';

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

// ── Carpet item helpers ────────────────────────────────────────────────────────
// Simulador de tapetes (2026-09-06): sem preço fixo, o cliente só mede cada
// tapete (largura × comprimento) e adiciona quantos precisar, tudo sob orçamento.
let carpetItemSeq = 1;
export function carpetNewItem(): CarpetItem {
  return { id: `tapete-${carpetItemSeq++}`, largura: '', comprimento: '' };
}
export function carpetAddItem(items: CarpetItem[]): CarpetItem[] {
  return [...items, carpetNewItem()];
}
export function carpetRemoveItem(items: CarpetItem[], id: string): CarpetItem[] {
  return items.filter(i => i.id !== id);
}
export function carpetUpdateItem(items: CarpetItem[], id: string, field: 'largura' | 'comprimento', value: string): CarpetItem[] {
  return items.map(i => i.id === id ? { ...i, [field]: value } : i);
}
export function carpetItemArea(item: CarpetItem): number | null {
  const l = parseFloat(item.largura.replace(',', '.'));
  const c = parseFloat(item.comprimento.replace(',', '.'));
  if (isNaN(l) || isNaN(c) || l <= 0 || c <= 0) return null;
  return l * c;
}
export function carpetHasValidItems(items: CarpetItem[]): boolean {
  return items.some(i => carpetItemArea(i) !== null);
}
export function carpetTotalArea(items: CarpetItem[]): number {
  return items.reduce((sum, i) => sum + (carpetItemArea(i) ?? 0), 0);
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
// tier: 'premium' usa waterproofingPremiumPrice em vez de waterproofingPrice para o
// preço base, e o combo de pack (packPrice) passa a ser pack Essencial + a mesma
// diferença já aprovada entre Essencial e Premium standalone (2026-08-30) — não existe
// um preço de combo Premium definido à parte, deriva-se do que já foi confirmado, não
// se inventa um número novo.
export function calcPackPricing(
  option: PriceOption,
  packOn: boolean,
  isWaterproofBase: boolean,
  fallbackDelta: number | null = null,
  tier: 'essencial' | 'premium' = 'essencial',
): PackPricing {
  const isPremium = tier === 'premium';
  const isSob = typeof option.cleaningPrice !== 'number';
  const cleanPrice = typeof option.cleaningPrice === 'number' ? option.cleaningPrice : null;
  const waterPrice = typeof option.waterproofingPrice === 'number' ? option.waterproofingPrice : null;
  const waterPremiumPrice = typeof option.waterproofingPremiumPrice === 'number' ? option.waterproofingPremiumPrice : null;
  const basePrice = isWaterproofBase ? (isPremium ? waterPremiumPrice : waterPrice) : cleanPrice;
  const tierDelta = isPremium
    ? (typeof option.packPremiumDelta === 'number'
        ? option.packPremiumDelta
        : (waterPremiumPrice !== null && waterPrice !== null ? waterPremiumPrice - waterPrice : 0))
    : 0;
  const bothEssencial = typeof option.bothPrice === 'number'
    ? option.bothPrice
    : (fallbackDelta !== null && cleanPrice !== null ? cleanPrice + fallbackDelta : null);
  const packPrice = bothEssencial !== null ? bothEssencial + tierDelta : null;
  const packDelta = packPrice !== null && basePrice !== null ? packPrice - basePrice : fallbackDelta;
  const displayPrice = packOn && packPrice !== null ? packPrice : basePrice;
  return { isSob, basePrice, packPrice, packDelta, displayPrice };
}

// ── Chairs ────────────────────────────────────────────────────────────────────
// Bracket pricing: 1-4 @ 20€ · 5-6 @ 15€ · 7-9 @ 12.5€ · 10+: sob orçamento
// — limiar alinhado com calcChairWaterproof(Premium) 2026-08-31: 10 cadeiras
// é sempre sob orçamento, com ou sem impermeabilização (pedido explícito,
// era ">10" aqui e ">=10" nas duas de baixo, o desalinhamento causava um
// bug real de preço a cair silenciosamente para a limpeza sozinha a 10).
export function calcChairClean(qty: number): number | null {
  if (qty <= 0 || qty >= 10) return null;
  if (qty <= 4) return qty * 20;
  if (qty <= 6) return 4 * 20 + (qty - 4) * 15;
  return 4 * 20 + 2 * 15 + (qty - 6) * 12.5;
}

// Progressive: 1-4 @ 15€, 5-9 @ 10€ each, 10+: sob orçamento — baixado 2026-08-31
// (era 1-4 @ 20€, 5-10 @ 15€, 11+ sob orçamento).
export function calcChairWaterproof(qty: number): number | null {
  if (qty <= 0 || qty >= 10) return null;
  if (qty <= 4) return qty * 15;
  return 4 * 15 + (qty - 4) * 10;
}

// Premium (à base de diluente): 1-4 @ 20€, 5-9 @ 15€ each, 10+: sob orçamento
// — sempre +5€/cadeira sobre a Essencial (2026-09-01, era +10€/cadeira fixo:
// a 9 cadeiras dava Essencial 110€ vs Premium 200€, +82%, desproporcional
// face ao gap Premium/Essencial dos sofás, ~+25 a +40%. Com +5€/cadeira fica
// Essencial 110€ vs Premium 155€, +41%, alinhado).
export function calcChairWaterproofPremium(qty: number): number | null {
  if (qty <= 0 || qty >= 10) return null;
  if (qty <= 4) return qty * 20;
  return 4 * 20 + (qty - 4) * 15;
}

export function fmtN(n: number): string {
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(1).replace('.', ',')}€`;
}

