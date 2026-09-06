import { sofaPrices, mattressPrices } from './QuizTypes';
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

// ── Carpet ────────────────────────────────────────────────────────────────────
// Preços atualizados 2026-08-30 (subida de preços, escalões mais finos: era só
// 5/10/15m² a 12/10/9€/m²). Cumulativo por escalão, cada fatia paga só a sua taxa,
// para não haver saltos bruscos ao cruzar uma fronteira de escalão.
export const CARPET_TIERS = [
  { label: 'Até 3 m²',    sublabel: 'Muito pequenos', rate: 15,   max: 3 },
  { label: '3 a 5 m²',    sublabel: 'Pequenos',       rate: 12.5, max: 5 },
  { label: '5 a 8 m²',    sublabel: 'Médios',         rate: 11.5, max: 8 },
  { label: '8 a 10 m²',   sublabel: 'Médios-grandes', rate: 10.5, max: 10 },
  { label: '10 a 15 m²',  sublabel: 'Grandes',        rate: 10,   max: 15 },
  { label: '+15 m²',      sublabel: 'Extra',          rate: null, max: Infinity },
] as const;

export function carpetActiveTier(area: number): number {
  if (area <= 3) return 0;
  if (area <= 5) return 1;
  if (area <= 8) return 2;
  if (area <= 10) return 3;
  if (area <= 15) return 4;
  return 5;
}

export function calcCarpetPrice(area: number): number | null {
  if (area <= 0 || area > 15) return null;
  if (area <= 3)  return area * 15;
  if (area <= 5)  return 45 + (area - 3) * 12.5;
  if (area <= 8)  return 70 + (area - 5) * 11.5;
  if (area <= 10) return 104.5 + (area - 8) * 10.5;
  return 125.5 + (area - 10) * 10;
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

// ── Live preview do artigo extra a ser configurado no upsell ──────────────────
// Espelha exatamente o cálculo que cada botão "Adicionar X" faz ao confirmar
// (ver QuizUpsellOverlay.tsx), mas em modo leitura, para que o preço no topo do
// quiz suba assim que se clica "+", tal como já acontece em Quantidades — sem
// isto o preço só atualizava depois de o artigo estar confirmado.
export function computePendingUpsellTotal(
  pendingUpsellId: string | null,
  pendingSofaItems: SofaItem[],
  pendingMattressItems: MattressItem[],
  pendingCarpetArea: string,
  pendingChairQtyNum: number,
  pendingWaterproof: boolean,
  isWaterproofBase: boolean,
  waterproofingTier: 'essencial' | 'premium' = 'premium',
): number {
  switch (pendingUpsellId) {
    case 'sofa': {
      return pendingSofaItems.filter(i => i.qty > 0).reduce((sum, item) => {
        const opt = sofaPrices.find(p => p.id === item.sizeId);
        if (!opt) return sum;
        const { basePrice, packDelta } = calcPackPricing(opt, item.packEnabled, isWaterproofBase, 40, waterproofingTier);
        const bothP = basePrice !== null && packDelta !== null ? basePrice + packDelta : null;
        const unitPrice = item.packEnabled && bothP !== null ? bothP : basePrice;
        return sum + (unitPrice !== null ? unitPrice * item.qty : 0);
      }, 0);
    }
    case 'mattress': {
      return pendingMattressItems.filter(i => i.qty > 0).reduce((sum, item) => {
        const opt = mattressPrices.find(p => p.id === item.sizeId);
        if (!opt) return sum;
        const cleanP = typeof opt.cleaningPrice === 'number' ? opt.cleaningPrice : null;
        const waterP = typeof opt.waterproofingPrice === 'number' ? opt.waterproofingPrice : null;
        const baseP = isWaterproofBase ? waterP : cleanP;
        const bothP = typeof opt.bothPrice === 'number' ? opt.bothPrice : (baseP !== null ? baseP + 30 : null);
        const unitPrice = item.packEnabled && bothP !== null ? bothP : baseP;
        return sum + (unitPrice !== null ? unitPrice * item.qty : 0);
      }, 0);
    }
    case 'carpet': {
      const area = parseFloat(pendingCarpetArea);
      if (isNaN(area) || area <= 0 || area > 15) return 0;
      return Math.round((calcCarpetPrice(area) ?? 0) * 100) / 100;
    }
    case 'chairs': {
      const basePriceRaw = calcChairClean(pendingChairQtyNum);
      const calcWaterproofTier = waterproofingTier === 'premium' ? calcChairWaterproofPremium : calcChairWaterproof;
      const waterproofPriceRaw = pendingWaterproof ? calcWaterproofTier(pendingChairQtyNum) : 0;
      // Sob orçamento (preço null) tem de devolver 0 — convenção do resto do
      // quiz (price === 0 = sob orçamento, ver hasUpsellSobItem) — nunca
      // somar um preço parcial que ignore o addon em silêncio.
      if (basePriceRaw === null || waterproofPriceRaw === null) return 0;
      return basePriceRaw + waterproofPriceRaw;
    }
    default:
      return 0;
  }
}
