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
// (12 cadeiras = 180€). Com impermeabilização a limpeza fica a metade (10 / 7,50 / 5€). Impermeabilização
// pela posição: Premium 25 / 22,50 / 20€, Essencial 15 / 12,50 / 10€. Limpeza + imper acaba no 9 mais perto
// (12 cadeiras: Premium 359€, Essencial 239€; dono: "359 acho que é um bom número"). Deslocação à parte.
export const CHAIR_CLEAN_UNIT = 20;
export const CHAIR_CLEAN_MID_FROM = 5;
export const CHAIR_CLEAN_MID = 15;
export const CHAIR_CLEAN_BIG_FROM = 9;
export const CHAIR_CLEAN_BIG = 10;
export const CHAIR_CLEAN_WATERPROOF_FACTOR = 0.5;

export function chairCleanUnit(qty: number): number {
  return qty >= CHAIR_CLEAN_BIG_FROM ? CHAIR_CLEAN_BIG : qty >= CHAIR_CLEAN_MID_FROM ? CHAIR_CLEAN_MID : CHAIR_CLEAN_UNIT;
}

/** Limpeza de `qty` cadeiras: cada cadeira paga o preço da sua posição (1.ª–4.ª 20€, 5.ª–7.ª 17,50€, 8.ª+ 15€;
 * dono, 24 Nov 2026: "não é cumulativo"); `waterproofQty` levam também impermeabilização (−5€ cada).
 * `before` = cadeiras já contadas noutras linhas do mesmo pedido. */
export function chairCleanTotal(qty: number, waterproofQty = 0, before = 0): number | null {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  const wp = Math.min(Math.max(0, Math.floor(waterproofQty)), qty);
  let total = 0;
  // As primeiras `wp` cadeiras desta linha levam impermeabilização: a limpeza fica a metade.
  for (let k = 1; k <= qty; k++) total += chairCleanUnit(before + k) * (k <= wp ? CHAIR_CLEAN_WATERPROOF_FACTOR : 1);
  return Math.round(total * 100) / 100;
}

/** Total que acaba em 9, para baixo (dono, 24 Nov 2026: Premium e Essencial das cadeiras "a acabar em 9"). */
export const endIn9Down = (total: number): number => {
  if (total < 9) return total;
  const lo = Math.floor((total + 1) / 10) * 10 - 1;
  return total - lo <= lo + 10 - total ? lo : lo + 10; // o 9 mais perto
};
/** Preço riscado dos packs de cadeiras: o preço de 1 cadeira × a quantidade (dono, 24 Nov 2026). */
export function chairPackWas(qty: number, tier: ChairWaterproofTier): number {
  return qty * endIn9Down(chairCleanTotal(1, 1)! + chairWaterproofTotal(1, tier)!);
}

/** Para cima, a acabar em 9 (impermeabilização sozinha de cadeiras; dono, 24 Nov 2026). */
export const endIn9Up = (total: number): number => { const n = Math.ceil(total - 1e-9); return n % 10 === 9 ? n : Math.floor(n / 10) * 10 + 9; };
