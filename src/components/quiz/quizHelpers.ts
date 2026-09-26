import { CHAIR_WATERPROOF_ESSENTIAL, CHAIR_WATERPROOF_PREMIUM } from '../../constants/chairPricing';
import { sofaAntiAcarosPrice, chairAntiAcarosTotal } from '../../constants/antiAcarosPricing';
import { priceWithPackPerks, perkChairsFree, type PerkLineInput } from '../../constants/packPerks';
import { sofaPrices, mattressPrices } from './QuizTypes';
import type { SofaItem, MattressItem, CarpetItem, PriceOption, QuizFormData } from './QuizTypes';

// Undefined packQty preserves legacy all-or-nothing selections.
export function treatmentQty(item: SofaItem | MattressItem): number {
  return item.packEnabled ? Math.max(0, Math.min(item.qty, item.packQty ?? item.qty)) : 0;
}

// Keep pricing and receipts on the same unit-based representation.
export function splitTreatmentItems<T extends SofaItem | MattressItem>(items: T[]): T[] {
  return items.flatMap(item => {
    const treated = treatmentQty(item);
    return [
      { ...item, qty: treated, packEnabled: true, packQty: undefined },
      { ...item, qty: item.qty - treated, packEnabled: false, packQty: undefined },
    ].filter(i => i.qty > 0);
  });
}

// ── Sofa helpers ─────────────────────────────────────────────────────────────
export function sofaSetQty(items: SofaItem[], sizeId: string, newQty: number): SofaItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped, packQty: i.packQty === undefined ? undefined : Math.min(i.packQty, clamped) } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
export function sofaTogglePack(items: SofaItem[], sizeId: string): SofaItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled, packQty: undefined } : i);
}

// ── Mattress helpers ──────────────────────────────────────────────────────────
export function mattressSetQty(items: MattressItem[], sizeId: string, newQty: number): MattressItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped, packQty: i.packQty === undefined ? undefined : Math.min(i.packQty, clamped) } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
export function mattressTogglePack(items: MattressItem[], sizeId: string): MattressItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled, packQty: undefined } : i);
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
  const l = Number(item.largura.trim().replace(',', '.'));
  const c = Number(item.comprimento.trim().replace(',', '.'));
  if (!Number.isFinite(l * c) || l <= 0 || c <= 0) return null;
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
  const upsellDiscount = (option.waterproofingUpsellDiscount ?? 0);
  const packPrice = bothEssencial !== null ? bothEssencial + tierDelta - upsellDiscount : null;
  const packDelta = packPrice !== null && basePrice !== null ? packPrice - basePrice : fallbackDelta;
  const displayPrice = packOn && packPrice !== null ? packPrice : basePrice;
  return { isSob, basePrice, packPrice, packDelta, displayPrice };
}

// ── Preço por unidade, com o tratamento escolhido ─────────────────────────────
// Usados pelos totais do quiz (use-quiz-pricing.ts), pelo recibo
// (submissionService.ts), pelos ecrãs do quiz e pelo configurador de packs
// (lib/customPack.ts). Uma só conta para os quatro sítios.

type Tier = 'essencial' | 'premium';

/** Sofá: `treated` = esta unidade leva o tratamento. Com a limpeza como
 * serviço principal, o tratamento é impermeabilização (pack, pelo `tier`) ou
 * anti-ácaros (`antiAcaros`); com a impermeabilização como serviço
 * principal, o "tratamento" é a higienização acrescentada. */
export function calcSofaUnitPrice(option: PriceOption, treated: boolean, serviceType: string, tier: Tier, antiAcaros: boolean): number | null {
  if (treated && antiAcaros && serviceType !== 'waterproofing') {
    const extra = sofaAntiAcarosPrice(option.id);
    return typeof option.cleaningPrice === 'number' && extra !== null ? option.cleaningPrice + extra : null;
  }
  return calcPackPricing(option, treated, serviceType === 'waterproofing', null, tier).displayPrice;
}

/** Colchão: `treated` = limpeza + anti-ácaros (bothPrice). */
export function calcMattressUnitPrice(option: PriceOption, treated: boolean, serviceType: string): number | null {
  const price = treated ? option.bothPrice : serviceType === 'waterproofing' ? option.waterproofingPrice : option.cleaningPrice;
  return typeof price === 'number' ? price : null;
}

/** Quantas cadeiras levam anti-ácaros. Uma só regra para o total e para o
 * recibo: só com a limpeza como serviço principal e nunca junto com a
 * impermeabilização (chairWaterproofQty é o que o preço lê). */
interface ChairTreatmentState { serviceType: string; chairAntiAcaros: boolean; chairWaterproofQty: number; chairQuantity: string }

export function chairAntiAcarosQty(form: ChairTreatmentState): number {
  const qty = parseInt(form.chairQuantity);
  if (!form.chairAntiAcaros || form.serviceType === 'waterproofing' || form.chairWaterproofQty > 0) return 0;
  return Number.isSafeInteger(qty) && qty > 0 ? qty : 0;
}

export function calcChairAntiAcaros(form: ChairTreatmentState): number {
  return chairAntiAcarosTotal(chairAntiAcarosQty(form)) ?? 0;
}

/** "Tipo" do pedido, com o tratamento escolhido: vai na mensagem, no
 * `service_type` do CRM e no WhatsApp de recurso. */
export function quizServiceTypeLabel(
  form: Pick<QuizFormData, 'service' | 'serviceType' | 'waterproofingTier' | 'sofaAntiAcaros' | 'chairAntiAcaros' | 'chairWaterproofQty' | 'chairQuantity'>,
  sofaItems: SofaItem[],
  mattressItems: MattressItem[],
): string {
  const tierLabel = form.waterproofingTier === 'premium' ? 'Impermeabilização Premium' : 'Impermeabilização Essencial';
  const sofaTreated = sofaItems.some(i => treatmentQty(i) > 0);
  const mattressTreated = mattressItems.some(i => treatmentQty(i) > 0);
  if (form.serviceType === 'waterproofing') {
    if (form.service === 'mattress') return 'Desbacterização e Anti Ácaros';
    const withCleaning = (form.service === 'sofa' && sofaTreated) || (form.service === 'chairs' && form.chairWaterproofQty > 0);
    return `${tierLabel}${withCleaning ? ' + Higienização Profunda' : ''}`;
  }
  if (form.serviceType === 'both') return form.service === 'mattress' ? 'Pack: Limpeza + Desbacterização e Anti Ácaros' : 'Pack Proteção Total';
  if (form.serviceType !== 'cleaning') return '';
  const treatment = form.service === 'sofa' && sofaTreated ? (form.sofaAntiAcaros ? 'Anti-ácaros' : tierLabel)
    : form.service === 'chairs' && form.chairWaterproofQty > 0 ? tierLabel
    : form.service === 'chairs' && chairAntiAcarosQty(form) > 0 ? 'Anti-ácaros'
    : form.service === 'mattress' && mattressTreated ? 'Desbacterização e Anti Ácaros'
    : null;
  return `Higienização Profunda${treatment ? ` + ${treatment}` : ''}`;
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

// Proteção: preço fixo por unidade em todas as quantidades.
export function calcChairWaterproof(qty: number): number | null {
  return Number.isSafeInteger(qty) && qty > 0 ? qty * CHAIR_WATERPROOF_ESSENTIAL : null;
}

export function calcChairWaterproofPremium(qty: number): number | null {
  return Number.isSafeInteger(qty) && qty > 0 ? qty * CHAIR_WATERPROOF_PREMIUM : null;
}

export function fmtN(n: number): string {
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(1).replace('.', ',')}€`;
}


export function carpetAllItemsValid(items: CarpetItem[]): boolean {
  return items.length > 0 && items.every(i => carpetItemArea(i) !== null);
}

// ── Extras do ecrã "Aproveite a mesma visita" ─────────────────────────────────
// O ecrã de extras do quiz monta aqui as suas linhas e passa-as à regra do
// pack (priceWithPackPerks, em constants/packPerks.ts), a mesma que o
// configurador de packs usa. O serviço principal fica ao preço de tabela; os
// extras são sempre de outra categoria (o ecrã esconde a do serviço principal).

export interface ComboExtrasInput {
  primaryService: string;
  /** Preço de tabela do serviço principal, já com o tratamento escolhido. */
  primaryTablePrice: number;
  mattressQty: Record<string, number>;
  sofaQty: Record<string, number>;
  chairsQty: number;
  /** Cadeiras que chegaram do widget de preços já com impermeabilização. */
  chairsWaterproofTier?: Tier | null;
  rugCount: number;
}

export interface ComboExtrasPricing {
  eligible: boolean;
  mattress: Record<string, { table: number; amount: number }>;
  sofa: Record<string, { table: number | null; amount: number | null }>;
  chairs: { table: number | null; amount: number | null; free: number };
  rugPerk: boolean;
}

// No quiz, "carpet" é o tapete (ou a alcatifa) como serviço principal.
const QUIZ_MAIN_KIND: Record<string, string> = { carpet: 'rug' };

export function priceComboExtras(input: ComboExtrasInput): ComboExtrasPricing {
  const mainKind = QUIZ_MAIN_KIND[input.primaryService] ?? input.primaryService;
  const lines: PerkLineInput[] = [{ kind: mainKind, qty: 1, tablePrice: input.primaryTablePrice }];
  const at: { mattress: Record<string, number>; sofa: Record<string, number>; chairs: number; rug: number } = { mattress: {}, sofa: {}, chairs: -1, rug: -1 };
  mattressPrices.forEach(opt => {
    const qty = input.mattressQty[opt.id] ?? 0;
    if (qty <= 0 || typeof opt.cleaningPrice !== 'number') return;
    at.mattress[opt.id] = lines.push({ kind: 'mattress', sizeId: opt.id, qty, tablePrice: qty * opt.cleaningPrice }) - 1;
  });
  sofaPrices.forEach(opt => {
    const qty = input.sofaQty[opt.id] ?? 0;
    if (qty <= 0) return;
    at.sofa[opt.id] = lines.push({ kind: 'sofa', sizeId: opt.id, qty, tablePrice: typeof opt.cleaningPrice === 'number' ? qty * opt.cleaningPrice : null }) - 1;
  });
  if (input.chairsQty > 0) {
    const tier = input.chairsWaterproofTier ?? null;
    const table = tier === 'premium' ? calcChairWaterproofPremium(input.chairsQty) : tier === 'essencial' ? calcChairWaterproof(input.chairsQty) : calcChairClean(input.chairsQty);
    at.chairs = lines.push({ kind: 'chairs', qty: input.chairsQty, tablePrice: table, treatment: tier ? 'waterproofing' : 'none' }) - 1;
  }
  if (input.rugCount > 0) at.rug = lines.push({ kind: 'rug', qty: input.rugCount, tablePrice: null }) - 1;

  const priced = priceWithPackPerks(lines, mainKind);
  const chairsLine = at.chairs >= 0 ? priced.lines[at.chairs] : null;
  return {
    eligible: priced.eligible,
    mattress: Object.fromEntries(Object.entries(at.mattress).map(([id, i]) => [id, { table: priced.lines[i].tablePrice!, amount: priced.lines[i].amount! }])),
    sofa: Object.fromEntries(Object.entries(at.sofa).map(([id, i]) => [id, { table: priced.lines[i].tablePrice, amount: priced.lines[i].amount }])),
    chairs: {
      table: chairsLine?.tablePrice ?? null,
      amount: chairsLine?.amount ?? null,
      free: chairsLine?.perkApplied ? perkChairsFree(input.chairsQty) : 0,
    },
    rugPerk: at.rug >= 0 ? priced.lines[at.rug].perkNote !== null : priced.eligible && mainKind !== 'rug',
  };
}
