// Meia-noite de Lisboa, para comparar a semana em curso com a anterior à mesma hora
// (separador Crescimento). Fica fora de crmClosings.ts de propósito: esse módulo vai
// dentro dos pacotes do bot e dos seguimentos, e mudá-lo obrigava a publicá-los.

const lisbonClock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Meia-noite de Lisboa de um dia AAAA-MM-DD, em ms (UTC+1 no verão, UTC no inverno). */
export function lisbonMidnight(day: string): number {
  const noon = Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12);
  const [h, m] = lisbonClock.format(new Date(noon)).split(':').map(Number);
  return noon - 12 * 3_600_000 - (h * 60 + m - 12 * 60) * 60_000;
}
