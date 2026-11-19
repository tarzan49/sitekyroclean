// Impermeabilização de cadeiras, preço por cadeira, como serviço principal ou
// extra (dono, 2026-10-09): de 1 a 4 cadeiras, 30€ Premium e 23€ Essencial; a
// partir de 5, 25€ e 18€. O total nunca desce abaixo do de 4 cadeiras, para 5
// nunca custarem menos do que 4: 5 cadeiras em Essencial ficam a 92€ (4 × 23€),
// não a 90€. Os dois valores "a partir de 5" são os "desde" que o site anuncia.
export const CHAIR_WATERPROOF_ESSENTIAL = 18;
export const CHAIR_WATERPROOF_PREMIUM = 25;
export const CHAIR_WATERPROOF_SMALL_MAX = 4;
export const CHAIR_WATERPROOF_SMALL_ESSENTIAL = 23;
export const CHAIR_WATERPROOF_SMALL_PREMIUM = 30;
// A partir de 9 cadeiras (dono, 19 Nov 2026, 12 cadeiras a 516€/432€ com limpeza: "até 8 cadeiras é ok
// fazeres 25, mas depois disto tens de descer o preço"; "12,5€ a limpeza, 22,5€ a premium ... e a outra
// fazes a 15"): impermeabilização Premium 22,50€ e Essencial 15€ por cadeira, em todas; e, no bot, a
// limpeza que vai com a impermeabilização fica a 12,50€ por cadeira (limpeza sozinha mantém o preço).
export const CHAIR_WATERPROOF_BIG_FROM = 9;
export const CHAIR_WATERPROOF_BIG_PREMIUM = 22.5;
export const CHAIR_WATERPROOF_BIG_ESSENTIAL = 15;
export const WHATSAPP_CHAIR_CLEAN_WITH_WATERPROOF_BIG = 12.5;

// Cadeira em que o único estofo é o tampo do assento (sem encosto nem braços estofados): impermeabilização
// a 18€ Premium e 12€ Essencial por cadeira, qualquer quantidade (dono, 14 Nov 2026, André, 6 cadeiras:
// "a cadeira quase não tem estofo"; "só se a cadeira só tiver um tampo e mais nada como estofo"). Só bot.
export const CHAIR_SEAT_ONLY_WATERPROOF_PREMIUM = 18;
export const CHAIR_SEAT_ONLY_WATERPROOF_ESSENTIAL = 12;

export type ChairWaterproofTier = 'premium' | 'essencial';

export function chairWaterproofTotal(qty: number, tier: ChairWaterproofTier, seatOnly = false): number | null {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  if (seatOnly) return qty * (tier === 'premium' ? CHAIR_SEAT_ONLY_WATERPROOF_PREMIUM : CHAIR_SEAT_ONLY_WATERPROOF_ESSENTIAL);
  const small = tier === 'premium' ? CHAIR_WATERPROOF_SMALL_PREMIUM : CHAIR_WATERPROOF_SMALL_ESSENTIAL;
  if (qty <= CHAIR_WATERPROOF_SMALL_MAX) return qty * small;
  const mid = tier === 'premium' ? CHAIR_WATERPROOF_PREMIUM : CHAIR_WATERPROOF_ESSENTIAL;
  if (qty < CHAIR_WATERPROOF_BIG_FROM) return Math.max(qty * mid, CHAIR_WATERPROOF_SMALL_MAX * small);
  // From 9 the price per chair drops; the total never falls below that of 8 (same rule as 4 → 5).
  const big = tier === 'premium' ? CHAIR_WATERPROOF_BIG_PREMIUM : CHAIR_WATERPROOF_BIG_ESSENTIAL;
  return Math.max(qty * big, (CHAIR_WATERPROOF_BIG_FROM - 1) * mid);
}

// Limpeza de cadeiras no WhatsApp, preço por cadeira (dono, 12 Nov 2026: "isso só
// se aplica ao site. Se for orçamento por WhatsApp, é 20 euros a cadeira … ou 25
// se forem menos de 4"; a partir de 8, 18€). Conta o total de cadeiras a limpar
// no pedido; a deslocação soma-se como em tudo (travel.ts). O site mantém os
// escalões de calcChairClean (20€ até 4, 15€ a 5.ª e 6.ª, 12,50€ da 7.ª à 9.ª).
export const WHATSAPP_CHAIR_CLEAN_SMALL = 25;
export const WHATSAPP_CHAIR_CLEAN_SMALL_MAX = 3;
export const WHATSAPP_CHAIR_CLEAN = 20;
export const WHATSAPP_CHAIR_CLEAN_BIG_FROM = 8;
export const WHATSAPP_CHAIR_CLEAN_BIG = 18;

export function whatsappChairCleanUnit(totalChairs: number): number | null {
  if (!Number.isSafeInteger(totalChairs) || totalChairs <= 0) return null;
  if (totalChairs <= WHATSAPP_CHAIR_CLEAN_SMALL_MAX) return WHATSAPP_CHAIR_CLEAN_SMALL;
  return totalChairs >= WHATSAPP_CHAIR_CLEAN_BIG_FROM ? WHATSAPP_CHAIR_CLEAN_BIG : WHATSAPP_CHAIR_CLEAN;
}
