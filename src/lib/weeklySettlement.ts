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
import { teamAccounts, type AccountAdjustment, type AccountEvent, type AccountLine, type AccountRow, type TeamAccount } from './teamAccounts';

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
