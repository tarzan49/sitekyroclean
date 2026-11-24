// Taxas por m² da lavagem de tapetes do motor do bot (botRugEstimate). Ficheiro folha, sem imports,
// para o site poder ler a taxa sem puxar o motor inteiro.
export const RUG_RATE_COMMON = 10;
export const RUG_RATE_NATURAL = 12;
/**
 * Alcatifa por escalões da área total (dono, 24 Nov 2026: "os 5€/m² é se fosse 150 m² [...] se for 40,
 * vai ser à volta de 7, 8"). Até 30 m² 8€, 30–60 m² 7€, 60–100 m² 6€, 100 m² ou mais 5€; deslocação à
 * parte no motor (somada e a acabar em 9). Uma área maior nunca custa menos do que o fim do escalão anterior.
 */
export const CARPET_TIERS = [
  { from: 0, rate: 8 },
  { from: 30, rate: 7 },
  { from: 60, rate: 6 },
  { from: 100, rate: 5 },
] as const;
/** A taxa mais baixa ("desde"). */
export const RUG_RATE_CARPET = CARPET_TIERS[CARPET_TIERS.length - 1].rate;

/** Lavagem da alcatifa (sem deslocação) pela área total. */
export function carpetWashing(areaM2: number): number {
  if (!(areaM2 > 0)) return 0;
  let tier = 0;
  for (let i = 0; i < CARPET_TIERS.length; i++) if (areaM2 >= CARPET_TIERS[i].from) tier = i;
  const own = areaM2 * CARPET_TIERS[tier].rate;
  const floor = tier > 0 ? CARPET_TIERS[tier].from * CARPET_TIERS[tier - 1].rate : 0;
  return Math.max(own, floor);
}
