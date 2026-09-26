// Fechos do CRM por dia (2026-09-26): em que dias da semana o dono fecha mais
// serviços. A data de fecho é `booked_at` (criação do evento no calendário, ou
// entrada da linha no CRM), nunca `request_date`, que é o dia do serviço.
//
// Os dias contam em hora de Lisboa, onde o negócio está: um evento criado às
// 23:30 em Copenhaga ainda é desse dia em Portugal.

export interface ClosingRow {
  booked_at: string | null;
  billed_value: number;
  my_cut: number;
}

export interface DayTotals { day: string; count: number; billed: number; cut: number }

export interface WeekdayTotals extends DayTotals {
  /** 0 = segunda … 6 = domingo. */
  weekday: number;
  /** Quantas vezes este dia da semana cabe no período. */
  occurrences: number;
  /** Fechos por cada vez que o dia aparece: compara dias que calham 4 e 5 vezes. */
  average: number;
}

export interface ClosingsSummary {
  from: string;
  to: string;
  count: number;
  billed: number;
  cut: number;
  perDay: DayTotals[];
  byWeekday: WeekdayTotals[];
  /** Linhas sem data de fecho: ficam de fora, e a página diz quantas são. */
  withoutDate: number;
}

export const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const WEEKDAY_LONG = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

const lisbon = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' });

/** AAAA-MM-DD em Lisboa. */
export function lisbonDay(iso: string | Date): string {
  return lisbon.format(typeof iso === 'string' ? new Date(iso) : iso);
}

/** Aritmética de calendário em UTC ao meio-dia: sem saltos de hora de verão. */
const toUtcNoon = (day: string) => Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12);
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function addDays(day: string, n: number): string {
  return fromUtc(toUtcNoon(day) + n * 86_400_000);
}

export function weekdayOf(day: string): number {
  return (new Date(toUtcNoon(day)).getUTCDay() + 6) % 7;
}

export function summarizeClosings(rows: ClosingRow[], from: string, to: string): ClosingsSummary {
  const perDayMap = new Map<string, DayTotals>();
  for (let d = from; d <= to; d = addDays(d, 1)) perDayMap.set(d, { day: d, count: 0, billed: 0, cut: 0 });

  let withoutDate = 0;
  for (const r of rows) {
    if (!r.booked_at) { withoutDate++; continue; }
    const bucket = perDayMap.get(lisbonDay(r.booked_at));
    if (!bucket) continue;
    bucket.count++;
    bucket.billed += Number(r.billed_value) || 0;
    bucket.cut += Number(r.my_cut) || 0;
  }

  const perDay = [...perDayMap.values()];
  const byWeekday: WeekdayTotals[] = WEEKDAY_SHORT.map((_, weekday) => ({ weekday, day: '', count: 0, billed: 0, cut: 0, occurrences: 0, average: 0 }));
  for (const d of perDay) {
    const w = byWeekday[weekdayOf(d.day)];
    w.occurrences++;
    w.count += d.count;
    w.billed += d.billed;
    w.cut += d.cut;
  }
  for (const w of byWeekday) w.average = w.occurrences ? w.count / w.occurrences : 0;

  return {
    from, to,
    count: perDay.reduce((s, d) => s + d.count, 0),
    billed: perDay.reduce((s, d) => s + d.billed, 0),
    cut: perDay.reduce((s, d) => s + d.cut, 0),
    perDay,
    byWeekday,
    withoutDate,
  };
}
