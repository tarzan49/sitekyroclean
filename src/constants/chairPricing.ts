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

export type ChairWaterproofTier = 'premium' | 'essencial';

export function chairWaterproofTotal(qty: number, tier: ChairWaterproofTier): number | null {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  const small = tier === 'premium' ? CHAIR_WATERPROOF_SMALL_PREMIUM : CHAIR_WATERPROOF_SMALL_ESSENTIAL;
  if (qty <= CHAIR_WATERPROOF_SMALL_MAX) return qty * small;
  const unit = tier === 'premium' ? CHAIR_WATERPROOF_PREMIUM : CHAIR_WATERPROOF_ESSENTIAL;
  return Math.max(qty * unit, CHAIR_WATERPROOF_SMALL_MAX * small);
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
