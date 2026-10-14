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
// perde 5% do valor do serviço, que passa para o dono. Na Porto 1 conta desde
// sempre; na Porto 2 a partir de 15/10 (dono: "no Porto 2 ainda não conta
// isso", e as regras explicadas ao Aleixo a 14/10: fotografias antes e depois
// e avaliação de 5 estrelas = 50%, sem isso 45%); nas outras equipas desde
// 19/10/2026, o dia do guião das equipas. O dono marca no CRM os serviços em
// que o procedimento foi feito (`review_requested`); sem marca, os 5% somam-se.
//
// Fatura (dono, 2026-10-14, Bruval: "vou adicionar ao preço o IVA", "é um
// valor que tem que ser entregue a mim"): num serviço com fatura (`invoiced`)
// o IVA de 23% vai por cima do valor e é todo do dono.
//
// A mensagem diz a data (nunca o dia da semana, dono) e discrimina cada
// serviço: o que foi feito, o valor, a parte do dono e o que fica a dever.
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
/** Desde quando os 5% contam nas equipas sem data própria (o guião das equipas). */
export const REVIEW_PENALTY_FROM = UPSELL_TIERS_FROM;
/** Desde quando contam numa equipa em particular; '' = desde sempre. */
const REVIEW_PENALTY_FROM_BY_TEAM: Record<string, string> = { 'Porto 1': '', 'Porto 2': '2026-10-15' };
/** O que falta para a equipa ficar com os 5%, como aparece na mensagem. */
const REVIEW_PENALTY_LABEL: Record<string, string> = { 'Porto 2': 'sem fotos antes e depois e avaliação' };
/** IVA de um serviço com fatura: vai por cima do valor e é do dono. */
export const INVOICE_VAT = 0.23;

/** Os 5% contam neste serviço? Porto 1 sempre, Porto 2 desde 15/10, as outras equipas desde REVIEW_PENALTY_FROM. */
export function reviewPenaltyApplies(team: string, day: string): boolean {
  return day >= (REVIEW_PENALTY_FROM_BY_TEAM[team] ?? REVIEW_PENALTY_FROM);
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
  description?: string | null;
  invoiced?: boolean | null;
}

export interface AccountEvent extends AvailabilityEvent { id: string }

export interface AccountLine {
  date: string;
  label: string;
  amount: number;
  /** Os 5% de um serviço sem avaliação pedida, já dentro de `amount`. */
  reviewPenalty?: number;
  /** O que foi feito ("Limpeza de sofá de 2 lugares"). */
  what?: string;
  /** Valor do serviço, sem IVA. */
  billed?: number;
  /** Parte do dono no serviço e no upsell. */
  share?: number;
  /** IVA da fatura, já dentro de `amount`. */
  vat?: number;
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

/**
 * Um serviço, ponto por ponto:
 *   14/10 · Ana, Odivelas · Limpeza de sofá de 2 lugares
 *   Serviço 79€ · a minha parte 40€ + IVA 23% 18,17€ = deves-me 58,17€
 */
function lineBlock(l: AccountLine, team: string): string[] {
  const head = [dm(l.date), l.label, l.what].filter(Boolean).join(' · ');
  if (l.billed === undefined || l.share === undefined) return [`${head}: ${euros(l.amount)}`];
  const parts = [`a minha parte ${euros(l.share)}`];
  if (l.reviewPenalty) parts.push(`5% ${REVIEW_PENALTY_LABEL[team] ?? 'sem avaliação'} ${euros(l.reviewPenalty)}`);
  if (l.vat) parts.push(`IVA 23% ${euros(l.vat)}`);
  return [head, `Serviço ${euros(l.billed)} · ${parts.join(' + ')} = deves-me ${euros(l.amount)}`];
}

function teamMessage(a: Omit<TeamAccount, 'message'>): string {
  const out = [`Contas até ${dm(a.date)} (${a.team})`, ''];
  if (a.today.length) {
    out.push(`Serviços de ${dm(a.date)}:`, '');
    for (const l of a.today) out.push(...lineBlock(l, a.team), '');
    out.push(`Total de ${dm(a.date)}: ${euros(a.todayTotal)}`);
  } else {
    out.push(`${dm(a.date)}: nenhum serviço por pagar.`);
  }
  if (a.before.length) {
    out.push('', 'Por pagar de dias anteriores:', '');
    for (const l of a.before) out.push(...lineBlock(l, a.team), '');
    out.push(`Total de dias anteriores: ${euros(a.beforeTotal)}`);
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
    const billed = Number(r.billed_value) || 0;
    const vat = r.invoiced ? round2(billed * INVOICE_VAT) : 0;
    const what = (r.description ?? '').trim();
    const line: AccountLine = {
      date: r.request_date!, label: labelOf(r), amount: round2(share + penalty + vat), billed, share,
      ...(what ? { what } : {}), ...(penalty ? { reviewPenalty: penalty } : {}), ...(vat ? { vat } : {}),
    };
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
