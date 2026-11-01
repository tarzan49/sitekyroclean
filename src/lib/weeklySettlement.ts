// Acerto semanal das equipas (dono, 2026-11-01: "todos os domingos todas as equipas
// têm de pagar", "de domingo a domingo e dá reset quando a equipa paga", "obrigatório
// ser ao domingo").
//
// As contas em si são as de `teamAccounts.ts` (as mesmas das mensagens da noite: parte
// do dono, upsell, IVA das faturas, pagos ao dono, acertos). Aqui só se juntam por
// grupo e por ciclo:
//   - Porto 1 e Lisboa 1 (com o Algarve, para já) têm cada um o seu acerto;
//   - as restantes equipas (Porto 2, Porto 3, Braga, Coimbra...) vão juntas, porque o
//     volume é menor e pagam o serviço quando ele acaba (dono).
//
// O reset é fechar o ciclo: os serviços incluídos ficam `paid` no CRM e os acertos
// combinados ficam `settled_at`, por isso a semana seguinte começa a zero. Só se fecha
// num domingo (dia de Lisboa); a tabela `team_settlements` repete a regra numa
// restrição, para nenhum outro caminho a contornar.
import { eventTeam as teamOfEvent } from './botAvailability';
import { ownerShareOf, teamAccounts, type AccountAdjustment, type AccountEvent, type AccountLine, type AccountRow, type TeamAccount } from './teamAccounts';

export interface SettlementGroupDef { id: string; label: string; teams: readonly string[] }

export const SETTLEMENT_GROUPS: readonly SettlementGroupDef[] = [
  { id: 'porto1', label: 'Porto 1', teams: ['Porto 1'] },
  { id: 'lisboa1', label: 'Lisboa 1 e Algarve', teams: ['Lisboa 1', 'Algarve'] },
];
/** Tudo o que não está nos grupos acima. */
export const OTHER_GROUP: SettlementGroupDef = { id: 'outras', label: 'Outras equipas', teams: [] };

const DAY_MS = 86_400_000;
const dayNumber = (day: string) => Math.floor(Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10))) / DAY_MS);
const fromDayNumber = (n: number) => new Date(n * DAY_MS).toISOString().slice(0, 10);
/** 0 = domingo. */
export const weekdayOf = (day: string) => new Date(dayNumber(day) * DAY_MS).getUTCDay();

export const isSettlementDay = (day: string) => weekdayOf(day) === 0;

/** O domingo em que o ciclo em curso fecha: hoje, se for domingo, senão o próximo. */
export function cycleEndFor(day: string): string {
  return fromDayNumber(dayNumber(day) + ((7 - weekdayOf(day)) % 7));
}

/** Segunda-feira do ciclo que fecha em `cycleEnd`. */
export const cycleStartFor = (cycleEnd: string) => fromDayNumber(dayNumber(cycleEnd) - 6);

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface SettlementGroup {
  id: string;
  label: string;
  teams: TeamAccount[];
  /** O que o grupo deve ao dono neste ciclo, já com os pagos ao dono e os acertos. */
  total: number;
  /** IVA a entregar ao Estado dentro do total. */
  vat: number;
  /** Parte do total de serviços de ciclos anteriores que ficaram por pagar. */
  overdue: number;
  serviceIds: string[];
  adjustmentIds: string[];
  serviceCount: number;
}

export interface WeeklySettlement {
  today: string;
  cycleStart: string;
  cycleEnd: string;
  /** Hoje é domingo: só então se pode fechar. */
  canSettle: boolean;
  groups: SettlementGroup[];
  /** Por pagar sem equipa no calendário: não entra em nenhum grupo. */
  unassigned: AccountLine[];
}

export function groupOfTeam(team: string): SettlementGroupDef {
  return SETTLEMENT_GROUPS.find(g => g.teams.includes(team)) ?? OTHER_GROUP;
}

export function weeklySettlement(rows: AccountRow[], events: AccountEvent[], adjustments: AccountAdjustment[], today: string): WeeklySettlement {
  const cycleEnd = cycleEndFor(today);
  const cycleStart = cycleStartFor(cycleEnd);
  const report = teamAccounts(rows, events, today, adjustments);
  const defs = [...SETTLEMENT_GROUPS, OTHER_GROUP];
  const groups: SettlementGroup[] = [];

  for (const def of defs) {
    const teams = report.teams.filter(t => groupOfTeam(t.team).id === def.id);
    const lines = teams.flatMap(t => [...t.today, ...t.before]);
    const idsOf = (ls: AccountLine[]) => ls.map(l => l.id).filter((id): id is string => !!id);
    groups.push({
      id: def.id,
      label: def.label,
      teams,
      total: round2(teams.reduce((s, t) => s + t.total, 0)),
      vat: round2(lines.reduce((s, l) => s + (l.vat ?? 0), 0)),
      overdue: round2(lines.filter(l => l.date < cycleStart).reduce((s, l) => s + l.amount, 0)),
      // Os pagos ao dono (ownerOwes) também fecham: a parte da equipa já foi descontada no total.
      serviceIds: [...new Set(teams.flatMap(t => idsOf([...t.today, ...t.before, ...t.ownerOwes])))],
      adjustmentIds: [...new Set(teams.flatMap(t => idsOf(t.adjustments)))],
      serviceCount: lines.length,
    });
  }

  return { today, cycleStart, cycleEnd, canSettle: isSettlementDay(today), groups, unassigned: report.unassigned };
}

// Vista por equipa e por semana (dono, 2026-11-01: "não está seccionado por equipas",
// "não existe um CRM de contas para a semana em específico corrente").

export const SETTLEMENT_TEAMS = ['Porto 1', 'Porto 2', 'Porto 3', 'Lisboa 1', 'Algarve', 'Braga', 'Coimbra'] as const;

export type WeekServiceStatus = 'pago' | 'por_pagar' | 'por_fazer' | 'cliente_paga_dono';

export interface WeekService {
  id?: string;
  date: string;
  label: string;
  what: string;
  billed: number;
  /** O que a equipa te deve deste serviço (com o IVA da fatura, se houver). */
  amount: number;
  status: WeekServiceStatus;
}

/** Segunda-feira da semana de `day`. */
export const weekStartOf = (day: string) => fromDayNumber(dayNumber(day) - ((weekdayOf(day) + 6) % 7));
export const addDays = (day: string, n: number) => fromDayNumber(dayNumber(day) + n);

/** Todos os serviços de uma equipa numa semana (segunda a domingo), pagos ou não. */
export function teamWeek(rows: AccountRow[], events: AccountEvent[], team: string, weekStart: string, today: string): WeekService[] {
  const weekEnd = addDays(weekStart, 6);
  const teamOf = new Map(events.map(e => [e.id, e]));
  const owedLines = new Map<string, AccountLine>();
  for (const t of teamAccounts(rows, events, today).teams) {
    if (t.team !== team) continue;
    for (const l of [...t.today, ...t.before]) if (l.id) owedLines.set(l.id, l);
  }
  const out: WeekService[] = [];
  for (const r of rows) {
    const d = r.request_date;
    if (!d || d < weekStart || d > weekEnd || r.calendar_missing_since) continue;
    const billed = Number(r.billed_value) || 0;
    if (billed <= 0 && !(Number(r.upsell_value) > 0)) continue;
    const ev = r.calendar_event_id ? teamOf.get(r.calendar_event_id) : undefined;
    if (!ev || teamOfEvent(ev) !== team) continue;
    const owed = r.id ? owedLines.get(r.id) : undefined;
    const status: WeekServiceStatus = r.paid ? 'pago' : r.paid_to_owner ? 'cliente_paga_dono' : d > today ? 'por_fazer' : 'por_pagar';
    out.push({
      ...(r.id ? { id: r.id } : {}), date: d,
      label: (r.client_name ?? '').trim() ? `${r.client_name!.trim()}${r.city ? `, ${r.city}` : ''}` : (r.city ?? 'Serviço'),
      what: (r.description ?? '').trim(), billed,
      amount: owed?.amount ?? ownerShareOf(r), status,
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
