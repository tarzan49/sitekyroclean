// Revisão de segunda-feira (dono, 2026-10-13: "põe no email de segunda-feira").
// Quatro números fixos por semana (segunda a domingo, hora de Lisboa), para a
// revisão de 30 minutos: fechos (com faturado e a parte do dono), ticket médio,
// custo por cliente do Google Ads e avaliações novas.
//
// As contas são as do separador Google Ads (googleAdsResults.ts): fecho = dia
// de booked_at, parte do dono = my_cut mais a parte dele no upsell, cliente
// Google = "(anúncio)" no calendário ou telefone de uma ficha do anúncio. Um
// evento apagado no calendário não é fecho. As avaliações não têm data em
// nenhuma tabela: o email só lembra de as contar na ficha do Google.
import { addDays, lisbonDay, weekdayOf } from "./crmClosings";
import { closedDay, googlePhoneSet, isGoogleService, shareOf, type ContactRow, type ServiceRow } from "./googleAdsResults";
import { summarizeQuizLeads, type QuizLeadRow } from "./crmQuizLeads";
import {
  closeRateRankRows, computeServiceCloseRates, missingFor, QUIZ_CLOSE_RATE_GOAL, SERVICE_CLOSE_RATE_GOAL,
  type CloseRateCount, type ServiceCloseRates,
} from "./crmServiceCloseRate";

export const WEEKLY_REVIEW_WEEKS = 6;

export interface WeekRow {
  /** Segunda-feira da semana, AAAA-MM-DD. */
  week: string;
  closes: number;
  billed: number;
  share: number;
  /** null sem fechos. */
  ticket: number | null;
  spend: number;
  googleCloses: number;
  /** null sem clientes do Google (com gasto, é o sinal mais importante da tabela). */
  costPerGoogleClient: number | null;
}

/**
 * Linha do ranking por serviço (dono, 2026-10-13: "qual é o serviço que eu
 * tenho maior taxa de fecho", "um ranking"). Desde 13/10 é a mesma conta das
 * abas Serviços e Fechos (crmServiceCloseRate.ts): contacts = orçamentos de
 * qualquer canal, closed = os que fecharam. Ticket = média desse serviço nas
 * linhas do CRM; valor por orçamento = taxa × ticket.
 */
export interface ServiceRankRow {
  service: string;
  contacts: number;
  closed: number;
  rate: number;
  ticket: number | null;
  valuePerContact: number | null;
}

export const RANKING_DAYS = 90;
/** Abaixo disto a taxa ainda é ruído: o serviço aparece no fim, sem posição. */
export const RANKING_MIN_CONTACTS = 10;

export interface RankingClient {
  phone: string;
  status: string;
  services: string[] | null;
  first_contact_at: string | null;
}

export interface CloseRateReview {
  /** Primeiro e último dia da janela (o último é o domingo da semana revista). */
  from: string;
  to: string;
  rates: ServiceCloseRates;
  rows: ServiceRankRow[];
}

/**
 * Taxa de fecho dos `days` dias que acabam no domingo antes de `now`: a mesma
 * janela que a leitura da semana da aba Fechos usa para a última semana completa.
 */
export function computeCloseRateReview(
  data: { services: ServiceRow[]; clients: RankingClient[]; leads: QuizLeadRow[] },
  now: Date,
  days = RANKING_DAYS,
): CloseRateReview {
  const to = addDays(mondayOf(lisbonDay(now)), -1);
  const from = addDays(to, -(days - 1));
  const upTo = data.services.filter(s => closedDay(s) <= to);
  const quiz = summarizeQuizLeads(data.leads, data.services);
  const rates = computeServiceCloseRates({ from, to }, quiz, data.clients, upTo);
  const live = upTo.filter(s => !s.calendar_missing_since);
  const big = (r: ServiceRankRow) => r.contacts >= RANKING_MIN_CONTACTS;
  const rows = closeRateRankRows(rates, live.filter(s => closedDay(s) >= from), live)
    .sort((a, b) => Number(big(b)) - Number(big(a)) || b.rate - a.rate || b.contacts - a.contacts);
  return { from, to, rates, rows };
}

export interface WeeklyReview {
  weeks: WeekRow[];
  html: string;
  text: string;
}

const num = (v: unknown) => Number(v) || 0;
const round1 = (n: number) => Math.round(n * 10) / 10;
export const mondayOf = (day: string) => addDays(day, -weekdayOf(day));

/** Só às segundas-feiras, em Lisboa. */
export const isReviewDay = (now: Date) => weekdayOf(lisbonDay(now)) === 0;

/** As últimas semanas completas, da mais antiga para a mais recente (a da segunda-feira de `now` não entra). */
export function computeWeeklyReview(
  data: { services: ServiceRow[]; clients: ContactRow[]; adsStats: { stat_date: string; cost: number }[] },
  now: Date,
  weeks = WEEKLY_REVIEW_WEEKS,
): WeekRow[] {
  const thisMonday = mondayOf(lisbonDay(now));
  const rows = new Map<string, WeekRow>();
  for (let i = weeks; i >= 1; i--) {
    const week = addDays(thisMonday, -7 * i);
    rows.set(week, { week, closes: 0, billed: 0, share: 0, ticket: null, spend: 0, googleCloses: 0, costPerGoogleClient: null });
  }
  const googlePhones = googlePhoneSet(data.clients);
  for (const s of data.services) {
    if (s.calendar_missing_since) continue;
    const row = rows.get(mondayOf(closedDay(s)));
    if (!row) continue;
    row.closes++;
    row.billed += num(s.billed_value);
    row.share += shareOf(s);
    if (isGoogleService(s, googlePhones)) row.googleCloses++;
  }
  for (const a of data.adsStats) {
    const row = rows.get(mondayOf(a.stat_date));
    if (row) row.spend += num(a.cost);
  }
  for (const r of rows.values()) {
    r.billed = round1(r.billed);
    r.share = round1(r.share);
    r.spend = round1(r.spend);
    r.ticket = r.closes ? round1(r.billed / r.closes) : null;
    r.costPerGoogleClient = r.googleCloses ? round1(r.spend / r.googleCloses) : null;
  }
  return [...rows.values()];
}

const euro = (n: number | null) => (n === null ? "–" : `${Math.round(n).toLocaleString("pt-PT")}€`);
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Variação da última semana contra a anterior, em texto curto ("+12", "-3"). */
function delta(cur: number | null, prev: number | null, unit = ""): string {
  if (cur === null || prev === null) return "";
  const d = Math.round(cur - prev);
  return d === 0 ? " (igual)" : ` (${d > 0 ? "+" : ""}${d.toLocaleString("pt-PT")}${unit} que na anterior)`;
}

const STEPS = [
  "Olhar os 4 números e compará-los com a semana anterior (5 min).",
  "Escolher o que piorou mais e perguntar porquê (10 min).",
  "Tirar uma decisão para a semana, só uma, e escrevê-la (10 min).",
  "Confirmar a decisão da semana passada: foi feita? Mudou alguma coisa? (5 min)",
];

const pct = (r: number) => `${Math.round(r * 100)}%`;

const rateText = (c: CloseRateCount) => (c.quotes ? `${pct(c.closed / c.quotes)} (${c.closed} de ${c.quotes})` : "sem orçamentos");
const goalText = (c: CloseRateCount, goal: number) =>
  !c.quotes ? "" : c.closed / c.quotes >= goal ? " · meta atingida" : (n => ` · falta${n === 1 ? "" : "m"} ${n} fecho${n === 1 ? "" : "s"} para ${pct(goal)}`)(missingFor(c, goal));

function rankingSection(review: CloseRateReview | null): { html: string; text: string } {
  if (!review || !review.rates.total.quotes) return { html: "", text: "" };
  const { rates, rows: ranking } = review;
  const title = `Taxa de fecho (orçamentos de qualquer canal, ${dm(review.from)} a ${dm(review.to)})`;
  const channels = [
    `Total: ${rateText(rates.total)}`,
    `Questionário: ${rateText(rates.quiz)} · meta ${pct(QUIZ_CLOSE_RATE_GOAL)}${goalText(rates.quiz, QUIZ_CLOSE_RATE_GOAL)}`,
    `WhatsApp: ${rateText(rates.whatsApp)}`,
  ];
  const head = ["#", "Serviço", "Orçamentos", "Fecharam", "Taxa", `Até ${pct(SERVICE_CLOSE_RATE_GOAL)}`, "Ticket médio", "Valor por orçamento"];
  const td = 'style="padding:4px 8px;border-bottom:1px solid #ddd;text-align:right"';
  let pos = 0;
  const cells = ranking.map(r => {
    const missing = missingFor({ quotes: r.contacts, closed: r.closed }, SERVICE_CLOSE_RATE_GOAL);
    return [
      r.contacts >= RANKING_MIN_CONTACTS ? String(++pos) : "–", r.service, String(r.contacts), String(r.closed), pct(r.rate),
      missing ? `+${missing}` : "atingida", euro(r.ticket), euro(r.valuePerContact),
    ];
  });
  const ranked = ranking.filter(r => r.contacts >= RANKING_MIN_CONTACTS);
  const bestValue = ranked.filter(r => r.valuePerContact !== null).sort((a, b) => b.valuePerContact! - a.valuePerContact!)[0];
  const note = ranked.length
    ? `Maior taxa: ${ranked[0].service} (${pct(ranked[0].rate)}).` + (bestValue ? ` Mais dinheiro por orçamento: ${bestValue.service} (${euro(bestValue.valuePerContact)}).` : "")
    : "";
  const foot = `Orçamento = pessoa que pediu preço no questionário do site ou no WhatsApp, uma vez, no dia do primeiro pedido. Fechou = serviço no CRM a partir desse dia, ou etiqueta cliente ou marcado. Uma pessoa conta em cada serviço que pediu. Meta: ${pct(QUIZ_CLOSE_RATE_GOAL)} no questionário, ${pct(SERVICE_CLOSE_RATE_GOAL)} em cada serviço. Com menos de ${RANKING_MIN_CONTACTS} orçamentos o serviço fica sem posição. Os mesmos números da aba Fechos.`;
  return {
    html: `<h3>${escapeHtml(title)}</h3><ul>${channels.map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` +
      (note ? `<p>${escapeHtml(note)}</p>` : "") +
      (cells.length ? `<table style="border-collapse:collapse;font-size:13px"><tr>${head.map(h => `<th ${td}>${h}</th>`).join("")}</tr>` +
        cells.map(c => `<tr>${c.map(x => `<td ${td}>${escapeHtml(x)}</td>`).join("")}</tr>`).join("") + `</table>` : "") +
      `<p style="color:#666;font-size:12px">${escapeHtml(foot)}</p>`,
    text: `${title}\n${channels.map(c => `- ${c}`).join("\n")}\n${note ? `${note}\n` : ""}` +
      (cells.length ? `${head.join(" | ")}\n${cells.map(c => c.join(" | ")).join("\n")}\n` : "") + `${foot}\n\n`,
  };
}

// Sem valor por omissão no parâmetro: no pacote em JS o Deno inferia o tipo dele como `null`.
export function buildWeeklyReview(weeks: WeekRow[], closeRates?: CloseRateReview | null): WeeklyReview {
  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2] ?? null;
  const title = `Revisão de segunda-feira · semana de ${dm(last.week)} a ${dm(addDays(last.week, 6))}`;
  const highlights = [
    `Fechos: ${last.closes}${delta(last.closes, prev?.closes ?? null)} · faturado ${euro(last.billed)} · a tua parte ${euro(last.share)}`,
    `Ticket médio: ${euro(last.ticket)}${delta(last.ticket, prev?.ticket ?? null, "€")}`,
    last.spend > 0
      ? `Custo por cliente Google: ${last.costPerGoogleClient === null ? `nenhum cliente com ${euro(last.spend)} gastos` : euro(last.costPerGoogleClient)}${delta(last.costPerGoogleClient, prev?.costPerGoogleClient ?? null, "€")} (${last.googleCloses} clientes, ${euro(last.spend)} gastos)`
      : "Custo por cliente Google: sem gasto nesta semana",
    "Avaliações novas: conta-as na ficha do Google e compara com a semana passada.",
  ];
  const head = ["Semana", "Fechos", "Faturado", "Tua parte", "Ticket", "Gasto Google", "Clientes Google", "Custo/cliente"];
  const cells = (r: WeekRow) => [dm(r.week), String(r.closes), euro(r.billed), euro(r.share), euro(r.ticket), r.spend ? euro(r.spend) : "–", r.spend || r.googleCloses ? String(r.googleCloses) : "–", euro(r.costPerGoogleClient)];
  const td = 'style="padding:4px 8px;border-bottom:1px solid #ddd;text-align:right"';
  const html =
    `<h3>${escapeHtml(title)}</h3>` +
    `<ul>${highlights.map(h => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` +
    `<table style="border-collapse:collapse;font-size:13px"><tr>${head.map(h => `<th ${td}>${h}</th>`).join("")}</tr>` +
    weeks.map(r => `<tr${r === last ? ' style="font-weight:bold"' : ""}>${cells(r).map(c => `<td ${td}>${c}</td>`).join("")}</tr>`).join("") +
    `</table>` +
    rankingSection(closeRates ?? null).html +
    `<p><strong>Os 30 minutos:</strong></p><ol>${STEPS.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>` +
    `<p style="color:#666;font-size:12px">Fecho = dia em que o serviço foi fechado. Cliente Google = "(anúncio)" no calendário ou contacto que veio do anúncio; depende de a ficha de clientes estar atualizada.</p><hr>`;
  const text =
    `${title}\n${highlights.map(h => `- ${h}`).join("\n")}\n\n` +
    `${head.join(" | ")}\n${weeks.map(r => cells(r).join(" | ")).join("\n")}\n\n` +
    rankingSection(closeRates ?? null).text +
    `Os 30 minutos:\n${STEPS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n`;
  return { weeks, html, text };
}
