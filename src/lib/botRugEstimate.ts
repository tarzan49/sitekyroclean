/**
 * Rug washing price for the WhatsApp bot only (owner, 10 Oct 2026: "põe o bot a
 * dar preço sozinho"). The site never shows a rug price; this is the rule the
 * owner applied by hand in the chats, now written once so the bot can quote it:
 *
 * - common rugs (microfibra, sintético, poliéster, algodão): 10€/m²;
 * - natural fibres (juta, sisal, ráfia, coco): 12€/m²;
 * - plus the locality's travel fee, once per order;
 * - rounded to the nearest amount ending in 9.
 *
 * Checked against his own quotes: microfibra 2,00 × 2,90 m in Póvoa de Varzim
 * 69€ (Sandra, 10 Oct), juta 3 × 2,5 m in Gaia 99€ (Liliana, 10 Oct), juta
 * 2,50 × 3,50 m in Gaia 119€ (Sónia). With pickup the price is the home price
 * plus the pickup fee (rugPickupFee), which already includes the travel.
 *
 * Delicate rugs (lã, seda, viscose, persa, Arraiolos, feito à mão, kilim),
 * orders under 3 m² and orders with anything other than rugs stay with the
 * owner: he never priced those by a rule.
 */
import { locationPrices } from '../constants/travel';
import { rugPickupFee } from '../constants/commercialPolicy';
import { sofaCleaningPrice } from '../data/enginePrices';

export const RUG_RATE_COMMON = 10;
export const RUG_RATE_NATURAL = 12;
export const RUG_ESTIMATE_MIN_AREA_M2 = 3;
/**
 * The extra the bot offers after the rug price: a sofa cleaned in the same
 * visit for 70€, "em vez de" a 3-seat sofa's cleaning plus the travel (89€ in
 * a 10€ locality). Owner, 10 Oct 2026, Sandra.
 */
export const RUG_VISIT_SOFA_PRICE = 70;

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const NATURAL = /\b(juta|sisal|rafia|coco|fibra natural|fibras naturais|seagrass)\b/;
const DELICATE = /\b(la|lan|wool|seda|silk|viscose|persa|persia|oriental|arraiolos|feito a mao|tecido a mao|hand ?made|kilim|tibetano|nepal)\b/;

export type RugMaterial = 'common' | 'natural' | 'delicate';

/** The material class from what the client or the bot wrote; unknown counts as common. */
export function rugMaterialClass(material: unknown): RugMaterial {
  if (typeof material !== 'string' || !material.trim()) return 'common';
  const m = fold(material);
  if (DELICATE.test(m)) return 'delicate';
  if (NATURAL.test(m)) return 'natural';
  return 'common';
}

/** Nearest amount ending in 9 (68 → 69, 100 → 99, 115 → 119). */
export const roundToNine = (value: number) => Math.max(9, Math.round((value - 9) / 10) * 10 + 9);

export type RugEstimateItem = { width: number; length: number; qty: number; material?: unknown };

export type RugEstimate =
  | { ok: true; areaM2: number; ratePerM2: number[]; travelFee: number; homePrice: number; pickupPrice: number | null; pickupFee: number | null; sofaUpsellPrice: number; sofaUsualPrice: number; rule: string }
  | { ok: false; reason: string };

export function rugEstimate(rugs: RugEstimateItem[], city: string | null): RugEstimate {
  if (!rugs.length) return { ok: false, reason: 'sem tapetes' };
  if (!city || !(city in locationPrices)) return { ok: false, reason: 'localidade não servida' };
  const classes = rugs.map(r => rugMaterialClass(r.material));
  if (classes.includes('delicate')) return { ok: false, reason: 'tapete delicado (lã, seda, viscose, persa, Arraiolos ou feito à mão): o responsável dá o preço' };
  const areaM2 = Math.round(rugs.reduce((s, r) => s + r.qty * r.width * r.length, 0) * 100) / 100;
  if (areaM2 < RUG_ESTIMATE_MIN_AREA_M2) return { ok: false, reason: `menos de ${RUG_ESTIMATE_MIN_AREA_M2} m² no total: o responsável dá o preço` };
  const washing = rugs.reduce((s, r, i) => s + r.qty * r.width * r.length * (classes[i] === 'natural' ? RUG_RATE_NATURAL : RUG_RATE_COMMON), 0);
  const travelFee = locationPrices[city as keyof typeof locationPrices];
  const homePrice = roundToNine(washing + travelFee);
  const pickupFee = rugPickupFee(areaM2);
  return {
    ok: true,
    areaM2,
    ratePerM2: [...new Set(classes.map(c => (c === 'natural' ? RUG_RATE_NATURAL : RUG_RATE_COMMON)))],
    travelFee,
    homePrice,
    pickupFee,
    pickupPrice: pickupFee === null ? null : homePrice + pickupFee,
    sofaUpsellPrice: RUG_VISIT_SOFA_PRICE,
    sofaUsualPrice: sofaCleaningPrice('3-lugares') + travelFee,
    rule: 'Em casa: homePrice, com a deslocação incluída. Com recolha e entrega: pickupPrice (null = sem recolha). Depois, numa mensagem à parte e uma vez só: o sofá na mesma visita por sofaUpsellPrice, em vez de sofaUsualPrice.',
  };
}
