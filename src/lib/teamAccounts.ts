// Contas diárias por equipa (dono, 2026-10-14: "todos os dias à meia-noite
// envias a cada parceiro as contas", "diz o dia e quanto é que deve, e se tiver
// para trás, deves-me isto mais o que me deves para trás", "se não me dever
// nada, não mandas mensagem").
//
// O que uma equipa deve ao dono é a parte dele (`my_cut` + a parte dele no
// upsell, a mesma do "Meu cut" do CRM) de cada serviço do CRM ainda por pagar,
// até ao dia das contas. A equipa sai da linha "Equipa: X" do evento no
// calendário, que é o dono que escolhe; uma linha sem evento ou sem equipa não
// vai para ninguém e aparece no resumo do dono para ele a resolver.
//
// Avaliação (dono, 2026-10-14): a equipa que não pede a avaliação ao cliente
// perde 5% do valor do serviço, que passa para o dono. No Porto conta desde
// sempre; nas outras equipas desde 19/10/2026, o dia do guião das equipas. O
// dono marca no CRM os serviços em que a avaliação foi pedida
// (`review_requested`); sem marca, as contas somam os 5%.
//
// Ficam de fora os serviços apagados ou reagendados no calendário
// (`calendar_missing_since`) e as revisitas a 0€ sem upsell, como na aba Fechos.
//
// Corre na `bot-api` (ação `team-accounts`); o servidor do bot manda as
// mensagens. Vai o primeiro nome e a localidade de cada cliente, que a equipa já
// tem no calendário dela; nunca telefones nem moradas.
import { eventTeam, type AvailabilityEvent } from './botAvailability';
import { ownerUpsellOf, UPSELL_TIERS_FROM } from './crmUpsell';

/** Parte do valor do serviço que a equipa perde sem pedir a avaliação. */
export const REVIEW_PENALTY_SHARE = 0.05;
/** Desde quando os 5% contam fora do Porto (o guião das equipas). */
export const REVIEW_PENALTY_FROM = UPSELL_TIERS_FROM;

/** Os 5% contam neste serviço? No Porto sempre, nas outras equipas a partir de REVIEW_PENALTY_FROM. */
export function reviewPenaltyApplies(team: string, day: string): boolean {
  return team.startsWith('Porto') || day >= REVIEW_PENALTY_FROM;
}

export interface AccountRow {
  request_date: string | null;
  client_name: string | null;
  city: string | null;
  locality: string | null;
  billed_value: number | null;
  my_cut: number | null;
  upsell_value: number | null;
  upsell_team: string | null;
  paid: boolean | null;
  calendar_event_id: string | null;
  calendar_missing_since: string | null;
  review_requested?: boolean | null;
}

export interface AccountEvent extends AvailabilityEvent { id: string }

export interface AccountLine {
  date: string;
  label: string;
  amount: number;
  /** Os 5% de um serviço sem avaliação pedida, já dentro de `amount`. */
  reviewPenalty?: number;
}

export interface TeamAccount {
  team: string;
  date: string;
  today: AccountLine[];
  before: AccountLine[];
  todayTotal: number;
  beforeTotal: number;
  total: number;
  /** A mensagem para a equipa, em português. */
  message: string;
}

export interface TeamAccountsReport {
  date: string;
  teams: TeamAccount[];
  /** Por pagar sem equipa no calendário: só para o dono. */
  unassigned: AccountLine[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;
export const euros = (n: number) => `${round2(n).toFixed(2).replace(/\.00$/, '').replace('.', ',')}€`;
const dm = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const weekday = (date: string) => WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];

/** "Cristina, Odivelas"; sem nome, só a localidade ("Barcarena"). */
function labelOf(r: AccountRow): string {
  const name = (r.client_name ?? '').trim();
  const city = (r.city ?? '').trim();
  if (name && city && !name.toLowerCase().includes(city.toLowerCase())) return `${name}, ${city}`;
  return name || city || 'Serviço';
}

/** A parte do dono numa linha: o que a equipa lhe deve por esse serviço. */
export function ownerShareOf(r: AccountRow): number {
  return round2((Number(r.my_cut) || 0) + ownerUpsellOf(r));
}

const sum = (lines: AccountLine[]) => round2(lines.reduce((s, l) => s + l.amount, 0));

/** "Ana, Odivelas: 44€ (inclui 4€ dos 5% sem avaliação)". */
const lineText = (l: AccountLine) =>
  `${l.label}: ${euros(l.amount)}${l.reviewPenalty ? ` (inclui ${euros(l.reviewPenalty)} dos 5% sem avaliação)` : ''}`;

function teamMessage(a: Omit<TeamAccount, 'message'>): string {
  const out = [`Contas de ${weekday(a.date)}, ${dm(a.date)} (${a.team})`, ''];
  if (a.today.length) {
    out.push('Hoje:', ...a.today.map(lineText), `Total de hoje: ${euros(a.todayTotal)}`);
  } else {
    out.push('Hoje: nenhum serviço por pagar.');
  }
  if (a.before.length) {
    out.push('', 'Para trás:', ...a.before.map(l => `${dm(l.date)} ${lineText(l)}`), `Total para trás: ${euros(a.beforeTotal)}`);
  }
  out.push('', `Total que me devem: ${euros(a.total)}`);
  return out.join('\n');
}

export function teamAccounts(rows: AccountRow[], events: AccountEvent[], date: string): TeamAccountsReport {
  const teamOfEvent = new Map(events.map(e => [e.id, eventTeam(e)]));
  const byTeam = new Map<string, { today: AccountLine[]; before: AccountLine[] }>();
  const unassigned: AccountLine[] = [];

  const owed = rows
    .filter(r => !r.paid && r.request_date && r.request_date <= date && !r.calendar_missing_since)
    .filter(r => (Number(r.billed_value) || 0) > 0 || (Number(r.upsell_value) || 0) > 0)
    .sort((a, b) => a.request_date!.localeCompare(b.request_date!));

  for (const r of owed) {
    const share = ownerShareOf(r);
    if (share <= 0) continue;
    const team = r.calendar_event_id ? teamOfEvent.get(r.calendar_event_id) ?? null : null;
    const penalty = team && !r.review_requested && reviewPenaltyApplies(team, r.request_date!)
      ? round2((Number(r.billed_value) || 0) * REVIEW_PENALTY_SHARE) : 0;
    const line: AccountLine = { date: r.request_date!, label: labelOf(r), amount: round2(share + penalty), ...(penalty ? { reviewPenalty: penalty } : {}) };
    if (!team) { unassigned.push(line); continue; }
    const bucket = byTeam.get(team) ?? { today: [], before: [] };
    (line.date === date ? bucket.today : bucket.before).push(line);
    byTeam.set(team, bucket);
  }

  const teams = [...byTeam.entries()].map(([team, b]) => {
    const base = {
      team, date, today: b.today, before: b.before,
      todayTotal: sum(b.today), beforeTotal: sum(b.before), total: sum([...b.today, ...b.before]),
    };
    return { ...base, message: teamMessage(base) };
  }).filter(t => t.total > 0).sort((a, b) => a.team.localeCompare(b.team));

  return { date, teams, unassigned };
}
