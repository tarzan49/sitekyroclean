// As quatro regiões do CRM e a região pelo código postal. Vivem fora de
// `calendarServices.ts` porque esse módulo carrega as freguesias todas, e o
// pacote do bot (`botAvailability.ts`) só precisa disto.

export const CRM_LOCALITIES = ['Porto', 'Lisboa', 'Algarve', 'Braga'] as const;
export type CrmLocality = (typeof CRM_LOCALITIES)[number];

/**
 * Pelos quatro primeiros dígitos do código postal, que é o que o dono escreve
 * quase sempre. O Centro (3xxx) é servido pela equipa do Porto e o Alentejo
 * (7xxx) pela de Lisboa, como em `travel.ts`. Braga é 4700–4779 e 4800–4999;
 * 4780–4799 é Santo Tirso e Trofa, do Porto. Leiria (24xx), Beira Interior
 * (6xxx) e ilhas ficam por identificar.
 */
export function localityFromPostalCode(code: string): CrmLocality | null {
  const n = Number(code.slice(0, 4));
  if (!Number.isInteger(n)) return null;
  if (n >= 2400 && n < 2500) return null;
  if (n >= 1000 && n < 3000) return 'Lisboa';
  if (n >= 7000 && n < 8000) return 'Lisboa';
  if (n >= 8000 && n < 9000) return 'Algarve';
  if ((n >= 4700 && n < 4780) || (n >= 4800 && n < 5000)) return 'Braga';
  if (n >= 3000 && n < 6000) return 'Porto';
  return null;
}
