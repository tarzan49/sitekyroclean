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
