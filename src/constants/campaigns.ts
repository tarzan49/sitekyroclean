// Campanhas com data marcada, lidas pelo motor de preços (quiz, widget,
// configurador de packs e o pacote do bot). Uma campanha vive só aqui: o
// motor pergunta "é Black Friday?" e cada sítio que mostra um preço segue.
//
// Black Friday 2026 (dono, 2026-10-31: "sim"): de sexta 27/11 a segunda 30/11,
// hora de Lisboa (em novembro, Lisboa está em UTC). Nesses dias:
// - a deslocação fica por nossa conta em todos os pedidos com preço de tabela
//   (`calculateTravelFee`, impermeabilização e puffs do bot);
// - o artigo de outro tipo acrescentado na mesma visita tem o preço de pack
//   mesmo abaixo dos 100€ (`priceWithPackPerks`).
// Os tapetes ficam de fora: são sob orçamento.
//
// Ficheiro sem imports com alias `@/`, de propósito: o prerender e o pacote do
// bot leem-no.

export const BLACK_FRIDAY_2026 = {
  from: Date.parse('2026-11-27T00:00:00Z'),
  until: Date.parse('2026-12-01T00:00:00Z'),
} as const;

/** Relógio das campanhas. Os testes correm com KYRO_CAMPAIGNS=off
 * (vitest.config.ts), para um teste de preços não mudar de resultado por ser
 * corrido no fim de semana da Black Friday; quem quer testar a campanha passa
 * a data. */
function campaignNow(now?: Date): number | null {
  if (now) return now.getTime();
  const env = typeof process !== 'undefined' ? process.env?.KYRO_CAMPAIGNS : undefined;
  if (env === 'off') return null;
  return Date.now();
}

export function isBlackFriday(now?: Date): boolean {
  const t = campaignNow(now);
  return t !== null && t >= BLACK_FRIDAY_2026.from && t < BLACK_FRIDAY_2026.until;
}

// Black Friday 2026, tabela do dono (19 Nov 2026), preço final ao cliente com a
// deslocação incluída. Vale de 27 a 30/11 para todos; quem vem do anúncio Meta
// "GTA 13 anos" (código "ref. BFGTA", `campaign: 'BFGTA'` no quote) tem-na desde
// já até 30/11 (conta a data da marcação). Só limpezas: as impermeabilizações e a
// limpeza com impermeabilização não mudam. Várias limpezas = soma da tabela,
// arredondada para baixo a acabar em 9. Sem condição especial por cima.
export const BLACK_FRIDAY_PRICES = {
  sofa: { '1-lugar': 49, '2-lugares': 59, '3-lugares': 69, '4-lugares': 89, '5-lugares': 99, canto: 99 } as Record<string, number>,
  mattress: { solteiro: 49, casal: 59, king: 69 } as Record<string, number>,
  armchairAlone: 39,
  /** Cadeiras no WhatsApp, por cadeira, pelo total de cadeiras do pedido. */
  chairUnit: (n: number) => (n >= 8 ? 13 : n >= 4 ? 15 : 19),
  /** Tapetes: cerca de −20% sobre o preço de hoje, a acabar em 9. */
  rugFactor: 0.8,
} as const;
export const BLACK_FRIDAY_REF = 'BFGTA';

/** Preços da Black Friday ativos: 27–30/11 para todos, ou desde já até 30/11 com ref. BFGTA. */
export function blackFridayPricesActive(campaign: unknown, now?: Date): boolean {
  if (isBlackFriday(now)) return true;
  const t = campaignNow(now);
  return campaign === BLACK_FRIDAY_REF && t !== null && t < BLACK_FRIDAY_2026.until;
}
