/**
 * Preço de tapetes no site (dono, 24 Nov 2026: "a partir de agr o site deixa de ser sob orçamento
 * para tapetes e volta com os valores"). Sempre o motor do bot (botQuote → rugEstimate.homePrice):
 * lavagem em casa, deslocação incluída, material comum (juta/sisal ajustado; seda/persa = dono).
 */
import { botQuote } from './botQuote';
export { RUG_PRICE_FROM, RUG_PRICE_NOTE } from '../constants/rugSitePrice';

export type RugMeasure = { width: number; length: number };

/** Preço em casa de um ou mais tapetes na cidade; null sem medidas válidas ou sem cidade servida. */
export function siteRugPrice(rugs: RugMeasure[], city: string | null | undefined, odor = false): number | null {
  const valid = rugs.filter(r => r.width > 0 && r.length > 0);
  if (!valid.length || !city) return null;
  const r = botQuote({ city, items: valid.map(v => ({ kind: 'rug', width: v.width, length: v.length, treatment: 'clean', ...(odor ? { odor: true } : {}) })) }) as { ok: boolean; rugEstimate?: { ok: boolean; homePrice?: number } };
  return r.ok && r.rugEstimate?.ok && typeof r.rugEstimate.homePrice === 'number' ? r.rugEstimate.homePrice : null;
}

