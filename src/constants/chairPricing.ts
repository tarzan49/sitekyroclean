// Impermeabilização de cadeiras pela posição (dono, 24 Nov 2026): 1.ª–4.ª Premium 25€ / Essencial 15€;
// 5.ª–8.ª 22,50€ / 12,50€; 9.ª em diante 20€ / 10€.
// Cada cadeira paga o preço da sua posição. O produto custa ~2–5€ por cadeira (5 L ≈ 3,5 sofás).
export const CHAIR_WATERPROOF_SMALL_MAX = 4;
export const CHAIR_WATERPROOF_SMALL_PREMIUM = 25;
export const CHAIR_WATERPROOF_SMALL_ESSENTIAL = 15;
export const CHAIR_WATERPROOF_PREMIUM = 22.5;
export const CHAIR_WATERPROOF_ESSENTIAL = 12.5;
export const CHAIR_WATERPROOF_BIG_FROM = 9;
export const CHAIR_WATERPROOF_BIG_PREMIUM = 20;
export const CHAIR_WATERPROOF_BIG_ESSENTIAL = 10;

// Cadeira em que o único estofo é o tampo do assento (sem encosto nem braços estofados): impermeabilização
// a 18€ Premium e 12€ Essencial por cadeira, qualquer quantidade (dono, 14 Nov 2026, André, 6 cadeiras:
// "a cadeira quase não tem estofo"; "só se a cadeira só tiver um tampo e mais nada como estofo"). Só bot.
export const CHAIR_SEAT_ONLY_WATERPROOF_PREMIUM = 18;
export const CHAIR_SEAT_ONLY_WATERPROOF_ESSENTIAL = 12;

export type ChairWaterproofTier = 'premium' | 'essencial';

export function chairWaterproofTotal(qty: number, tier: ChairWaterproofTier, seatOnly = false): number | null {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  if (seatOnly) return qty * (tier === 'premium' ? CHAIR_SEAT_ONLY_WATERPROOF_PREMIUM : CHAIR_SEAT_ONLY_WATERPROOF_ESSENTIAL);
  // Cada cadeira paga o preço da sua posição, não cumulativo (dono, 24 Nov 2026).
  let total = 0;
  for (let n = 1; n <= qty; n++) total += tier === 'premium'
    ? (n >= CHAIR_WATERPROOF_BIG_FROM ? CHAIR_WATERPROOF_BIG_PREMIUM : n > CHAIR_WATERPROOF_SMALL_MAX ? CHAIR_WATERPROOF_PREMIUM : CHAIR_WATERPROOF_SMALL_PREMIUM)
    : (n >= CHAIR_WATERPROOF_BIG_FROM ? CHAIR_WATERPROOF_BIG_ESSENTIAL : n > CHAIR_WATERPROOF_SMALL_MAX ? CHAIR_WATERPROOF_ESSENTIAL : CHAIR_WATERPROOF_SMALL_ESSENTIAL);
  return Math.round(total * 100) / 100;
}

// Limpeza de cadeiras, a mesma tabela no site, no bot, nos orçamentos e nas ofertas (dono, 24 Nov 2026).
// Cada cadeira paga o preço da sua posição (não cumulativo): 1.ª–4.ª 20€, 5.ª–8.ª 15€, 9.ª em diante 10€
// (12 cadeiras = 180€). Impermeabilização sozinha pela posição: Premium 25 / 22,50 / 20€, Essencial 15 / 12,50 / 10€.
// Limpeza + impermeabilização: tabela fixa, `CHAIR_PACK_TABLE` (dono, 25 Nov 2026). Deslocação à parte.
export const CHAIR_CLEAN_UNIT = 20;
export const CHAIR_CLEAN_MID_FROM = 5;
export const CHAIR_CLEAN_MID = 15;
export const CHAIR_CLEAN_BIG_FROM = 9;
export const CHAIR_CLEAN_BIG = 10;

export function chairCleanUnit(qty: number): number {
  return qty >= CHAIR_CLEAN_BIG_FROM ? CHAIR_CLEAN_BIG : qty >= CHAIR_CLEAN_MID_FROM ? CHAIR_CLEAN_MID : CHAIR_CLEAN_UNIT;
}

/** Limpeza de `qty` cadeiras: cada cadeira paga o preço da sua posição, não cumulativo (dono, 24 Nov 2026).
 * `before` = cadeiras já contadas noutras linhas do mesmo pedido. */
export function chairCleanTotal(qty: number, before = 0): number | null {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  let total = 0;
  for (let k = 1; k <= qty; k++) total += chairCleanUnit(before + k);
  return Math.round(total * 100) / 100;
}

/** Total que acaba em 9, para baixo (dono, 24 Nov 2026: Premium e Essencial das cadeiras "a acabar em 9"). */
export const endIn9Down = (total: number): number => {
  if (total < 9) return total;
  const lo = Math.floor((total + 1) / 10) * 10 - 1;
  return total - lo <= lo + 10 - total ? lo : lo + 10; // o 9 mais perto
};
// LIMPEZA + IMPERMEABILIZAÇÃO, tabela fixa número a número (dono, 25 Nov 2026), de 1 a 12 cadeiras, sem a deslocação.
// Em Lisboa, com os 10€ de deslocação até 3 cadeiras: Essencial 39/69/99/129/149/169/189/209/229/249/269/289€ e
// Premium 59/89/119/149/179/209/239/269/289/309/339/359€. Depois da 12.ª: +20€ Essencial, +25€ Premium cada (no 9 mais perto).
// Nenhum outro sítio calcula este preço: site, bot, pedidos e packs leem daqui.
export const CHAIR_PACK_TABLE: Record<ChairWaterproofTier, readonly number[]> = {
  essencial: [29, 59, 89, 129, 149, 169, 189, 209, 229, 249, 269, 289],
  premium: [49, 79, 109, 149, 179, 209, 239, 269, 289, 309, 339, 359],
};
export const CHAIR_PACK_STEP: Record<ChairWaterproofTier, number> = { essencial: 20, premium: 25 };

/** Limpeza + impermeabilização de `qty` cadeiras, sem deslocação. */
export function chairPackTotal(qty: number, tier: ChairWaterproofTier): number | null {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  const t = CHAIR_PACK_TABLE[tier], max = t.length;
  return qty <= max ? t[qty - 1] : endIn9Down(t[max - 1] + CHAIR_PACK_STEP[tier] * (qty - max));
}
/** O que a impermeabilização soma a `qty` cadeiras que também são limpas (a tabela acima menos a limpeza). Só o tampo
 * estofado: a tabela dela, nunca acima da normal. */
export function chairWaterproofWithClean(qty: number, tier: ChairWaterproofTier, seatOnly = false): number | null {
  const pack = chairPackTotal(qty, tier), clean = chairCleanTotal(qty);
  if (pack === null || clean === null) return null;
  return seatOnly ? Math.min(pack - clean, chairWaterproofTotal(qty, tier, true)!) : pack - clean;
}
/** `cleanQty` limpas e `wpQty` impermeabilizadas (as mesmas cadeiras até onde der): total, a acabar em 9 quando há as duas coisas. */
export function chairsCombinedTotal(cleanQty: number, wpQty: number, tier: ChairWaterproofTier): number {
  const both = Math.min(cleanQty, wpQty);
  const sum = (chairCleanTotal(cleanQty) ?? 0) + (both ? chairWaterproofWithClean(both, tier)! : 0)
    + (chairWaterproofTotal(wpQty, tier) ?? 0) - (both ? chairWaterproofTotal(both, tier)! : 0);
  return both ? endIn9Down(sum) : sum;
}
/** Preço riscado dos packs de cadeiras: o preço de 1 cadeira × a quantidade (dono, 24 Nov 2026). */
export function chairPackWas(qty: number, tier: ChairWaterproofTier): number {
  return qty * chairPackTotal(1, tier)!;
}

/** Para cima, a acabar em 9 (impermeabilização sozinha de cadeiras; dono, 24 Nov 2026). */
export const endIn9Up = (total: number): number => { const n = Math.ceil(total - 1e-9); return n % 10 === 9 ? n : Math.floor(n / 10) * 10 + 9; };
