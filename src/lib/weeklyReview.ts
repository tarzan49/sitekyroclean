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
import { CLIENT_SERVICES, phoneKey } from "./clientRecords";
import { itemsOf, typeOf } from "./crmServiceMix";
import { closedDay, googlePhoneSet, isGoogleService, shareOf, type ContactRow, type ServiceRow } from "./googleAdsResults";

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
 * Ranking por serviço (dono, 2026-10-13: "qual é o serviço que eu tenho maior
 * taxa de fecho", "um ranking"). Contactos = fichas com essa etiqueta do
 * WhatsApp, com o primeiro contacto na janela; fechou = cliente ou marcado, ou
 * serviço no CRM com esse telefone (como `effectiveStatus`). Ticket = média das
 * linhas do CRM fechadas na janela que só têm esse serviço, para uma linha com
 * sofá e tapete não inflacionar os dois. Valor por contacto = taxa × ticket:
 * o que cada conversa desse serviço vale, em média.
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

const fold = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const LABEL_BY_FOLD = new Map(CLIENT_SERVICES.map(l => [fold(l), l]));

/** A linha do CRM é só deste serviço? (Impermeabilização conta em qualquer artigo; recolha pela descrição.) */
function lineIsOnly(service: string, description: string): boolean {
  const items = itemsOf(description);
  const type = typeOf(description);
  switch (service) {
    case "Impermeabilização": return type === "Impermeabilização";
    case "Recolha": return /recolh/i.test(description);
    case "Sofá": return type === "Limpeza" && items.length === 1 && items[0] === "Sofá";
    case "Cadeira": return type === "Limpeza" && items.length === 1 && items[0] === "Cadeiras";
    case "Colchão": return items.length === 1 && items[0] === "Colchão";
    case "Tapete": return items.length === 1 && items[0] === "Tapete";
    default: return false;
  }
}

export function computeServiceRanking(
  data: { services: ServiceRow[]; clients: RankingClient[] },
  now: Date,
  days = RANKING_DAYS,
): ServiceRankRow[] {
  const since = addDays(lisbonDay(now), -days);
  const live = data.services.filter(s => !s.calendar_missing_since);
  const crmPhones = new Set(live.map(s => phoneKey(s.phone)).filter(k => k.length === 9));
  const rows = new Map(CLIENT_SERVICES.map(service => [service as string, { contacts: 0, closed: 0, billed: 0, lines: 0 }]));
  for (const c of data.clients) {
    if (!c.first_contact_at || lisbonDay(c.first_contact_at) < since) continue;
    const closed = c.status === "cliente" || c.status === "marcado" || crmPhones.has(phoneKey(c.phone));
    const labels = new Set((c.services ?? []).map(l => LABEL_BY_FOLD.get(fold(l))).filter(Boolean) as string[]);
    for (const l of labels) {
      const r = rows.get(l)!;
      r.contacts++;
      if (closed) r.closed++;
    }
  }
  for (const s of live) {
    if (closedDay(s) < since) continue;
    for (const [service, r] of rows) {
      if (lineIsOnly(service, s.description ?? "")) { r.billed += num(s.billed_value); r.lines++; }
    }
  }
  const out = [...rows].map(([service, r]): ServiceRankRow => {
    const rate = r.contacts ? r.closed / r.contacts : 0;
    const ticket = r.lines ? round1(r.billed / r.lines) : null;
    return { service, contacts: r.contacts, closed: r.closed, rate, ticket, valuePerContact: ticket === null ? null : round1(rate * ticket) };
  }).filter(r => r.contacts > 0);
  const big = (r: ServiceRankRow) => r.contacts >= RANKING_MIN_CONTACTS;
  return out.sort((a, b) => Number(big(b)) - Number(big(a)) || b.rate - a.rate || b.contacts - a.contacts);
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

function rankingSection(ranking: ServiceRankRow[]): { html: string; text: string } {
  if (!ranking.length) return { html: "", text: "" };
  const title = `Taxa de fecho por serviço (contactos dos últimos ${RANKING_DAYS} dias)`;
  const head = ["#", "Serviço", "Contactos", "Fecharam", "Taxa", "Ticket médio", "Valor por contacto"];
  const td = 'style="padding:4px 8px;border-bottom:1px solid #ddd;text-align:right"';
  let pos = 0;
  const cells = ranking.map(r => [
    r.contacts >= RANKING_MIN_CONTACTS ? String(++pos) : "–", r.service, String(r.contacts), String(r.closed), pct(r.rate), euro(r.ticket), euro(r.valuePerContact),
  ]);
  const bestValue = ranking.filter(r => r.contacts >= RANKING_MIN_CONTACTS && r.valuePerContact !== null).sort((a, b) => b.valuePerContact! - a.valuePerContact!)[0];
  const note = `Maior taxa: ${ranking[0].service} (${pct(ranking[0].rate)}).` + (bestValue ? ` Mais dinheiro por conversa: ${bestValue.service} (${euro(bestValue.valuePerContact)}).` : "");
  const foot = `Um contacto conta em cada serviço que pediu. Ticket = linhas do CRM só desse serviço. Com menos de ${RANKING_MIN_CONTACTS} contactos o serviço fica sem posição. Depende das etiquetas do WhatsApp estarem em dia.`;
  return {
    html: `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(note)}</p>` +
      `<table style="border-collapse:collapse;font-size:13px"><tr>${head.map(h => `<th ${td}>${h}</th>`).join("")}</tr>` +
      cells.map(c => `<tr>${c.map(x => `<td ${td}>${escapeHtml(x)}</td>`).join("")}</tr>`).join("") +
      `</table><p style="color:#666;font-size:12px">${escapeHtml(foot)}</p>`,
    text: `${title}\n${note}\n${head.join(" | ")}\n${cells.map(c => c.join(" | ")).join("\n")}\n${foot}\n\n`,
  };
}

export function buildWeeklyReview(weeks: WeekRow[], ranking: ServiceRankRow[] = []): WeeklyReview {
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
    rankingSection(ranking).html +
    `<p><strong>Os 30 minutos:</strong></p><ol>${STEPS.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>` +
    `<p style="color:#666;font-size:12px">Fecho = dia em que o serviço foi fechado. Cliente Google = "(anúncio)" no calendário ou contacto que veio do anúncio; depende de a ficha de clientes estar atualizada.</p><hr>`;
  const text =
    `${title}\n${highlights.map(h => `- ${h}`).join("\n")}\n\n` +
    `${head.join(" | ")}\n${weeks.map(r => cells(r).join(" | ")).join("\n")}\n\n` +
    rankingSection(ranking).text +
    `Os 30 minutos:\n${STEPS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n`;
  return { weeks, html, text };
}
