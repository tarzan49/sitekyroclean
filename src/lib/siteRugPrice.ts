/**
 * Preço de tapetes no site (dono, 24 Nov 2026: "a partir de agr o site deixa de ser sob orçamento
 * para tapetes e volta com os valores"). Sempre o motor do bot (botQuote → rugEstimate.homePrice):
 * lavagem em casa, deslocação incluída, material comum (juta/sisal ajustado; seda/persa = dono).
 */
import { botQuote } from './botQuote';
import { roundToNine, RUG_RATE_COMMON, RUG_RATE_CARPET, RUG_ESTIMATE_MIN_AREA_M2, RUG_SMALL_COMBO_EXTRA } from './botRugEstimate';
export { RUG_PRICE_FROM, RUG_PRICE_NOTE, CARPET_PRICE_FROM, CARPET_PRICE_NOTE } from '../constants/rugSitePrice';

export type RugMeasure = { width: number; length: number };

/** Preço em casa de um ou mais tapetes na cidade; null sem medidas válidas ou sem cidade servida. */
export function siteRugPrice(rugs: RugMeasure[], city: string | null | undefined, odor = false, kind: 'rug' | 'carpet' = 'rug'): number | null {
  const valid = rugs.filter(r => r.width > 0 && r.length > 0);
  if (!valid.length || !city) return null;
  const r = botQuote({ city, items: valid.map(v => ({ kind, width: v.width, length: v.length, treatment: 'clean', ...(odor ? { odor: true } : {}) })) }) as { ok: boolean; rugEstimate?: { ok: boolean; homePrice?: number } };
  return r.ok && r.rugEstimate?.ok && typeof r.rugEstimate.homePrice === 'number' ? r.rugEstimate.homePrice : null;
}


/**
 * Lavagem de tapete comum acrescentada a outra peça na mesma visita (sem a deslocação, que já vai
 * na peça principal): a mesma conta do rugCombo do bot (rugsWashing = homePrice − deslocação, a acabar em 9).
 */
export function siteRugWashing(areaM2: number, travelFee: number, rate: number = RUG_RATE_COMMON): number | null {
  if (!(areaM2 > 0)) return null;
  return roundToNine(roundToNine(areaM2 * rate + travelFee) - travelFee);
}

type PackLine = { amount: number | null; quote?: boolean };
type PackPrices<L extends PackLine> = { lines: L[]; total: number; travel: number | null; quote: boolean };
type PackItemLike = { kind: string; width: string; length: string; qty: number };

/**
 * O pack do configurador com os tapetes e alcatifas pelo motor do bot (dono, 24 Nov 2026):
 * só tapetes = rugEstimate.homePrice (deslocação incluída); com outras peças = rugCombo.comboPrice.
 * Cada linha de tapete mostra a sua lavagem; o total é sempre o do motor.
 */
export function withRugEngine<L extends PackLine, P extends PackPrices<L>>(prices: P, items: PackItemLike[], city: string): P {
  const dim = (v: string) => Number(String(v).trim().replace(',', '.')) || 0;
  const rugIdx = items.flatMap((it, i) => (it.kind === 'rug' || it.kind === 'carpet' ? [i] : []));
  if (!rugIdx.length || !city || rugIdx.some(i => !(dim(items[i].width) > 0 && dim(items[i].length) > 0))) return prices;
  const othersQuote = prices.lines.some((l, i) => l.quote && !rugIdx.includes(i));
  if (othersQuote) return prices;
  const r = botQuote({ city, items: rugIdx.map(i => ({ kind: items[i].kind, width: dim(items[i].width), length: dim(items[i].length), qty: items[i].qty, treatment: 'clean' })) }) as { ok: boolean; rugEstimate?: { ok: boolean; homePrice?: number; travelFee?: number; areaM2?: number } | null };
  if (!r.ok || !r.rugEstimate?.ok || typeof r.rugEstimate.homePrice !== 'number') return prices;
  const travelFee = r.rugEstimate.travelFee ?? 0;
  const rugsOnly = rugIdx.length === items.length;
  const lines = prices.lines.map((l, i) => {
    if (!rugIdx.includes(i)) return l;
    const it = items[i];
    const amount = rugIdx.length === 1 && rugsOnly ? r.rugEstimate!.homePrice! : siteRugWashing(dim(it.width) * dim(it.length) * it.qty, travelFee, it.kind === 'carpet' ? RUG_RATE_CARPET : RUG_RATE_COMMON);
    return { ...l, amount, quote: amount === null };
  });
  const homeTotal = r.rugEstimate.homePrice;
  // Rugs mixed with priced items: same visit, travel waived (rugCombo do bot = lavagem + outras peças).
  const others = prices.lines.reduce((s, l, i) => s + (rugIdx.includes(i) ? 0 : l.amount ?? 0), 0);
  if (rugsOnly) return { ...prices, lines, total: homeTotal, travel: null, quote: false };
  // Tapete pequeno (< 3 m²) com outras peças: peças + deslocação + 10€, a acabar em 9 (o mesmo comboOf do bot).
  if ((r.rugEstimate.areaM2 ?? 0) < RUG_ESTIMATE_MIN_AREA_M2) {
    const total = roundToNine(others + travelFee + RUG_SMALL_COMBO_EXTRA);
    const small = lines.map((l, i) => (rugIdx.includes(i) ? { ...l, amount: i === rugIdx[0] ? total - others : 0 } : l));
    return { ...prices, lines: small, total, travel: 0, quote: false };
  }
  return { ...prices, lines, total: roundToNine(homeTotal - travelFee) + others, travel: 0, quote: false };
}
