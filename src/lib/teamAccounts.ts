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
// Avaliação: os 5% automáticos por "avaliação pedida" estão desligados desde a
// noite de 14/10 (dono: "acho que faz mais sentido se for por serviço"). O
// modelo novo (fotografias, vídeo e avaliação por serviço) vai ser medido pelo
// bot do procedimento; até lá, nada se soma sozinho. Os 5% já combinados no
// grupo do Porto (lotes até 10/10 e 13/10) entram como acertos
// (`team_account_adjustments`), que aparecem nas contas até serem saldados.
//
// Pago ao dono (`paid_to_owner`): a equipa não deve nada desse serviço e,
// depois de o cliente pagar (`client_paid_owner_at`; dono, 16/10: a Catarina
// Foz ainda não tinha pago e a parte já era descontada), a parte dela sai do total, como o dono fez no grupo do Porto a 14/10 ("Pagos
// diretamente a mim (desconto a vossa parte)", 997,75€ → 858,75€; dono, 15/10:
// "não tiveste isso em conta"). Fica nas contas até o dono marcar a linha como
// paga no CRM.
//
// Fatura (dono, 2026-10-14, Bruval: "vou adicionar ao preço o IVA", "é um
// valor que tem que ser entregue a mim"; 2026-10-16, Aleixo: "temos que dividir
// o IVA... estava incluído no valor"): num serviço com fatura (`invoiced`) o
// valor do CRM já tem o IVA de 23%; o IVA é do dono (entrega-o ao Estado) e o
// valor sem IVA divide-se a meias. A mensagem discrimina-o linha a linha e soma
// o IVA a entregar no fim (dono, 2026-10-26: "sempre que alguém pedir IVA mete
// isso bem explícito nas contas, para eu saber quanto é o valor do serviço e o
// IVA a entregar ao Estado").
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
import { serviceVatOf } from './invoiceVat';

/** Parte do valor do serviço que a equipa perde sem pedir a avaliação. */
export const REVIEW_PENALTY_SHARE = 0.05;
/** Desde quando os 5% contam nas equipas sem data própria (o guião das equipas). */
export const REVIEW_PENALTY_FROM = UPSELL_TIERS_FROM;
/** Desde quando contam numa equipa em particular; '' = desde sempre. */
const REVIEW_PENALTY_FROM_BY_TEAM: Record<string, string> = { 'Porto 1': '', 'Porto 2': '2026-10-15' };
/** O que falta para a equipa ficar com os 5%, como aparece na mensagem. */
const REVIEW_PENALTY_LABEL: Record<string, string> = { 'Porto 2': 'sem fotos antes e depois e avaliação' };
/** IVA de um serviço com fatura: está dentro do valor e é do dono. */
export { INVOICE_VAT } from './invoiceVat';

/** Desligado a 14/10 à noite (dono): o modelo por serviço vai ser medido pelo bot do procedimento. */
export const REVIEW_PENALTY_ENABLED = false;

/** Os 5% contam neste serviço? Só com REVIEW_PENALTY_ENABLED; então Porto 1 sempre, Porto 2 desde 15/10, as outras equipas desde REVIEW_PENALTY_FROM. */
export function reviewPenaltyApplies(team: string, day: string): boolean {
  return REVIEW_PENALTY_ENABLED && day >= (REVIEW_PENALTY_FROM_BY_TEAM[team] ?? REVIEW_PENALTY_FROM);
}

export interface AccountRow {
  /** Só para o painel saber que linhas fechar num pagamento semanal. */
  id?: string;
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
  /** Fatura de só uma parte do serviço: o valor dessa parte, com IVA. Vazio = o serviço todo. */
  invoice_value?: number | string | null;
  /** IVA à parte (por cima do preço combinado); senão, incluído no preço. As contas são as mesmas. */
  vat_on_top?: boolean | null;
  /** O cliente paga ao dono (transferência): a equipa não deve nada deste serviço. */
  paid_to_owner?: boolean | null;
  /** Pago ao dono: quando o cliente pagou. Sem data, a parte da equipa ainda não se desconta. */
  client_paid_owner_at?: string | null;
}

/** Um valor combinado com a equipa que não é um serviço (team_account_adjustments, por saldar). */
export interface AccountAdjustment { id?: string; team: string; day: string; label: string; amount: number }

export interface AccountEvent extends AvailabilityEvent { id: string }

export interface AccountLine {
  /** Linha do CRM (ou acerto) de onde vem. */
  id?: string;
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
  /** Com fatura: a parte da equipa, metade do valor sem IVA. */
  teamPart?: number;
  /** Com fatura: o IVA foi à parte, por cima do preço combinado. */
  vatOnTop?: boolean;
  /** Parte do dono no upsell, já dentro de `share`. */
  upsellShare?: number;
}

export interface TeamAccount {
  team: string;
  date: string;
  today: AccountLine[];
  before: AccountLine[];
  todayTotal: number;
  beforeTotal: number;
  /** Acertos combinados (não são serviços), já dentro de total. */
  adjustments: AccountLine[];
  /** Serviços pagos ao dono: ele deve à equipa a parte dela (amount = parte da equipa). Fora de total. */
  ownerOwes: AccountLine[];
  /** Pagos ao dono que o cliente ainda não pagou: só informação, fora de total. */
  awaitingClient: AccountLine[];
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
 * Um serviço numa linha, com o que a equipa deve (dono, 11 Nov: a mensagem longa com o IVA
 * em blocos não se percebia; abre com o valor a enviar e uma linha por serviço):
 *   14/10 · Ana, Odivelas · Limpeza de sofá de 2 lugares: 40€
 *   03/11 · Diogo, Monte · Impermeabilização…: 116,07€ (79,50€ da minha parte + 36,57€ de IVA, porque teve fatura)
 */
function lineBlock(l: AccountLine, team: string): string[] {
  const head = [dm(l.date), l.label, l.what].filter(Boolean).join(' · ');
  const extra: string[] = [];
  if (l.vat && l.billed !== undefined) {
    const mine = round2(l.amount - l.vat - (l.reviewPenalty ?? 0));
    extra.push(`${euros(mine)} da minha parte + ${euros(l.vat)} de IVA, porque teve fatura`);
  }
  if (l.reviewPenalty) extra.push(`inclui 5% ${REVIEW_PENALTY_LABEL[team] ?? 'sem avaliação'} ${euros(l.reviewPenalty)}`);
  return [`${head}: ${euros(l.amount)}${extra.length ? ` (${extra.join('; ')})` : ''}`];
}

function teamMessage(a: Omit<TeamAccount, 'message'>): string {
  const lines = [...a.today, ...a.before];
  const out = [a.total >= 0
    ? `Contas até ${dm(a.date)} (${a.team}): tens de me enviar *${euros(a.total)}*.`
    : `Contas até ${dm(a.date)} (${a.team}): sou eu que vos devo *${euros(-a.total)}*.`, ''];
  for (const l of lines) out.push(...lineBlock(l, a.team));
  for (const l of a.adjustments) out.push(`${l.label}: ${euros(l.amount)}`);
  for (const l of a.ownerOwes) out.push(`Menos ${euros(l.amount)} de ${l.label}, que me pagou diretamente`);
  out.push('', `Total: ${euros(a.total)}.`);
  for (const l of a.awaitingClient) out.push(`Ainda não conta: ${l.label} paga-me a mim; quando pagar, desconto ${euros(l.amount)}.`);
  if (lines.some(l => l.vat)) out.push('A vossa parte nos serviços com fatura faturam-ma a mim.');
  return out.join('\n');
}

export function teamAccounts(rows: AccountRow[], events: AccountEvent[], date: string, adjustments: AccountAdjustment[] = []): TeamAccountsReport {
  const teamOfEvent = new Map(events.map(e => [e.id, eventTeam(e)]));
  type Bucket = { today: AccountLine[]; before: AccountLine[]; adjustments: AccountLine[]; ownerOwes: AccountLine[]; awaitingClient: AccountLine[] };
  const byTeam = new Map<string, Bucket>();
  const bucketOf = (team: string) => {
    const b = byTeam.get(team) ?? { today: [], before: [], adjustments: [], ownerOwes: [], awaitingClient: [] };
    byTeam.set(team, b);
    return b;
  };
  const unassigned: AccountLine[] = [];

  const owed = rows
    .filter(r => !r.paid && r.request_date && r.request_date <= date && !r.calendar_missing_since)
    .filter(r => (Number(r.billed_value) || 0) > 0 || (Number(r.upsell_value) || 0) > 0)
    .sort((a, b) => a.request_date!.localeCompare(b.request_date!));

  for (const r of owed) {
    const share = ownerShareOf(r);
    if (share <= 0) continue;
    const team = r.calendar_event_id ? teamOfEvent.get(r.calendar_event_id) ?? null : null;
    const billed = Number(r.billed_value) || 0;
    // Com fatura, o IVA (23%) está incluído no preço e divide-se a meias: a equipa fica com metade
    // do valor sem IVA (dono, 2026-10-16, Aleixo: "temos que dividir o IVA... estava incluído no valor").
    // Fatura de só uma parte do serviço (`invoice_value`): só essa parte tem IVA.
    const net = r.invoiced ? round2(billed - serviceVatOf(r)) : billed;
    // Parte da equipa = metade do valor sem IVA, salvo parte do dono combinada acima disso
    // (dono, 2026-11-04, Verónica: "150€ + IVA"): aí a equipa fica com o que sobra.
    const halfTeamPart = Math.floor(round2(net * 50)) / 100;
    const agreedTeamPart = round2(net - (Number(r.my_cut) || 0));
    const invoiceTeamPart = r.invoiced ? ((Number(r.my_cut) || 0) > Math.ceil(billed / 2) + 1 ? Math.max(0, agreedTeamPart) : halfTeamPart) : null;
    const ownerUpsell = round2(share - (Number(r.my_cut) || 0));
    if (r.paid_to_owner) {
      const teamPart = invoiceTeamPart !== null
        ? round2(invoiceTeamPart + (Number(r.upsell_value) || 0) - Math.max(0, ownerUpsell))
        : round2(billed + (Number(r.upsell_value) || 0) - share);
      const invoice = r.invoiced ? { billed, vat: round2(billed - net) } : {};
      if (team && teamPart > 0) (r.client_paid_owner_at ? bucketOf(team).ownerOwes : bucketOf(team).awaitingClient).push({ date: r.request_date!, label: labelOf(r), amount: teamPart, ...invoice, ...(r.id ? { id: r.id } : {}) });
      continue;
    }
    const penalty = team && !r.review_requested && reviewPenaltyApplies(team, r.request_date!)
      ? round2((Number(r.billed_value) || 0) * REVIEW_PENALTY_SHARE) : 0;
    const vat = r.invoiced ? round2(billed - net) : 0;
    const what = (r.description ?? '').trim();
    const amount = invoiceTeamPart !== null ? round2(billed - invoiceTeamPart + Math.max(0, ownerUpsell) + penalty) : round2(share + penalty);
    const line: AccountLine = {
      ...(r.id ? { id: r.id } : {}), date: r.request_date!, label: labelOf(r), amount, billed, share,
      ...(what ? { what } : {}), ...(penalty ? { reviewPenalty: penalty } : {}),
      ...(vat ? { vat, teamPart: invoiceTeamPart!, ...(r.vat_on_top ? { vatOnTop: true } : {}), ...(ownerUpsell > 0 ? { upsellShare: ownerUpsell } : {}) } : {}),
    };
    if (!team) { unassigned.push(line); continue; }
    const bucket = bucketOf(team);
    (line.date === date ? bucket.today : bucket.before).push(line);
  }

  for (const a of adjustments) {
    if (a.day > date || !Number(a.amount)) continue; // negativo = pagamento já feito pela equipa
    bucketOf(a.team).adjustments.push({ ...(a.id ? { id: a.id } : {}), date: a.day, label: a.label, amount: round2(Number(a.amount)) });
  }

  const teams = [...byTeam.entries()].map(([team, b]) => {
    const base = {
      team, date, today: b.today, before: b.before, adjustments: b.adjustments, ownerOwes: b.ownerOwes, awaitingClient: b.awaitingClient,
      todayTotal: sum(b.today), beforeTotal: sum(b.before), total: round2(sum([...b.today, ...b.before, ...b.adjustments]) - sum(b.ownerOwes)),
    };
    return { ...base, message: teamMessage(base) };
  }).filter(t => t.total > 0).sort((a, b) => a.team.localeCompare(b.team));

  return { date, teams, unassigned };
}
