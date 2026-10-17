import { addDays, countsAsClosing, lisbonDay, weekdayOf, WEEKDAY_LONG } from './crmClosings';
import { lisbonMidnight } from './lisbonTime';
import type { ClosingInput, WeekStats, WeeklyConversationRow } from './adsVsOrganic';

// A semana em curso, ao vivo, no separador Crescimento (dono, 2026-10-17: "que vá
// constantemente dando updates"). Compara com a semana anterior à mesma hora:
// segunda 00:00 até agora contra segunda 00:00 da semana passada até à mesma hora
// (a regra de 14/10 para a semana em curso: "em relação à hora específica de quarta
// há uma semana").
//
// Os fechos e o gasto têm hora exata. Os pedidos de orçamento não: a contagem de
// referência é a do WhatsApp Web, feita às segundas para a semana anterior. Durante
// a semana usa-se a cópia do servidor do bot (whatsapp_conversations, de hora a
// hora), que perde cerca de 20% das conversas; por isso é multiplicada pela razão
// WhatsApp Web ÷ servidor das últimas semanas completas e mostrada como estimativa.

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
/** Antes disto o histórico do servidor do bot está incompleto (CLAUDE.md, aba Conversas). */
export const SERVER_CONVERSATIONS_FROM = '2026-09-14';

export interface ServerConversation { first_at: string; started_by_us: boolean; origin?: string | null; updated_at?: string | null }
export interface LiveClosing extends ClosingInput {
  id?: string;
  description?: string | null;
  city?: string | null;
  locality?: string | null;
  source?: string | null;
}

export const mondayOf = (day: string) => addDays(day, -weekdayOf(day));
const closingShare = (c: ClosingInput) => Number(c.my_cut) || 0;
const isClosing = (c: ClosingInput) => !!c.booked_at && countsAsClosing({ billed_value: Number(c.billed_value) || 0, upsell_value: c.upsell_value });
const inbound = (rows: ServerConversation[]) => rows.filter(r => !r.started_by_us);

/** Conversas novas do servidor do bot entre dois instantes (ms). */
export function serverCount(rows: ServerConversation[], fromMs: number, toMs: number): number {
  return inbound(rows).filter(r => { const t = Date.parse(r.first_at); return t >= fromMs && t < toMs; }).length;
}

/**
 * Razão WhatsApp Web ÷ servidor nas últimas `n` semanas completas que têm as duas
 * contagens (a do WhatsApp Web feita depois de a semana acabar). Null sem dados.
 */
export function conversationFactor(weeklyRows: WeeklyConversationRow[], server: ServerConversation[], now: Date, n = 4): number | null {
  const thisWeek = mondayOf(lisbonDay(now));
  const usable = weeklyRows
    .filter(r => r.source === 'whatsapp_web' && r.week >= SERVER_CONVERSATIONS_FROM && r.week < thisWeek && lisbonDay(r.counted_at) > addDays(r.week, 6))
    .sort((a, b) => b.week.localeCompare(a.week))
    .slice(0, n)
    .map(r => ({ web: r.new_people, server: serverCount(server, lisbonMidnight(r.week), lisbonMidnight(addDays(r.week, 7))) }))
    .filter(x => x.server > 0);
  if (!usable.length) return null;
  const web = usable.reduce((s, x) => s + x.web, 0);
  const srv = usable.reduce((s, x) => s + x.server, 0);
  return web / srv;
}

export interface WeekWithEstimate extends WeekStats {
  /** Pedidos de orçamento estimados pelo servidor do bot, não contados no WhatsApp Web. */
  requestsEstimated: boolean;
}

/**
 * Semana em curso e semanas sem contagem do WhatsApp Web: pedidos estimados pelo
 * servidor do bot × razão. A semana em curso usa sempre a estimativa, porque a
 * contagem do WhatsApp Web feita a meio da semana fica parada até segunda.
 */
export function withConversationEstimates(weeks: WeekStats[], server: ServerConversation[], factor: number | null, now: Date): WeekWithEstimate[] {
  const thisWeek = mondayOf(lisbonDay(now));
  return weeks.map(w => {
    const current = w.week === thisWeek;
    const missing = w.newPeople === null || w.conversationsSource === 'servidor';
    if (!(current || missing) || w.week < SERVER_CONVERSATIONS_FROM || factor === null) return { ...w, requestsEstimated: false };
    const end = Math.min(now.getTime(), lisbonMidnight(addDays(w.week, 7)));
    const raw = serverCount(server, lisbonMidnight(w.week), end);
    if (!raw && !current) return { ...w, requestsEstimated: false };
    return { ...w, newPeople: Math.round(raw * factor), requestsEstimated: true };
  });
}

export interface Pace { now: number; then: number; /** now ÷ then − 1; null quando a semana passada ainda não tinha nada. */ change: number | null }
const pace = (now: number, then: number): Pace => ({ now, then, change: then > 0 ? now / then - 1 : null });

/**
 * Fim de semana ao ritmo atual, pelo perfil da semana passada (agora × total ÷ mesma
 * hora). Com pouco na semana passada à mesma hora, proporcional ao tempo.
 */
export function projectWeek(now: number, thenSameMoment: number, thenFull: number, fraction: number): number | null {
  if (fraction >= 1) return now;
  if (thenSameMoment >= 5) return now * (thenFull / thenSameMoment);
  if (fraction >= 0.15) return now / fraction;
  return null;
}

export interface LiveWeek {
  week: string;
  /** 0 = segunda … 6 = domingo. */
  weekday: number;
  /** "sábado às 21:40" */
  moment: string;
  /** Parte da semana já passada (0 a 1). */
  fraction: number;
  requests: Pace & { estimated: boolean; projection: number | null; google: number };
  closings: Pace & { projection: number | null };
  billed: Pace;
  share: Pace & { projection: number | null };
  spend: Pace;
  /** Última vez que o servidor do bot mandou conversas. */
  serverUpdatedAt: string | null;
}

const CLOCK = new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** A semana em curso contra a anterior à mesma hora. */
export function liveWeek(input: {
  closings: ClosingInput[];
  spend: Array<{ stat_date: string; cost: number }>;
  server: ServerConversation[];
  factor: number | null;
  now: Date;
}): LiveWeek {
  const { closings, spend, server, factor, now } = input;
  const nowMs = now.getTime();
  const today = lisbonDay(now);
  const week = mondayOf(today);
  const start = lisbonMidnight(week);
  const prevStart = lisbonMidnight(addDays(week, -7));
  const elapsed = Math.max(0, nowMs - start);
  const prevCut = prevStart + elapsed;
  const fraction = Math.min(1, elapsed / WEEK_MS);
  const weekday = weekdayOf(today);

  const between = (a: number, b: number) => closings.filter(c => { if (!isClosing(c)) return false; const t = Date.parse(c.booked_at!); return t >= a && t < b; });
  const nowC = between(start, nowMs + 1);
  const thenC = between(prevStart, prevCut);
  const fullPrevC = between(prevStart, start);
  const sum = (rows: ClosingInput[], f: (c: ClosingInput) => number) => rows.reduce((s, c) => s + f(c), 0);
  const billedOf = (c: ClosingInput) => Number(c.billed_value) || 0;

  // Gasto: o dia de hoje no Google Ads já é o gasto até agora; o mesmo dia da semana passada conta só a parte do dia já passada.
  const dayFraction = Math.min(1, Math.max(0, (nowMs - lisbonMidnight(today)) / DAY_MS));
  const costOn = (day: string) => spend.filter(s => s.stat_date === day).reduce((s, x) => s + (Number(x.cost) || 0), 0);
  let spendNow = 0;
  let spendThen = 0;
  for (let i = 0; i <= weekday; i++) {
    spendNow += costOn(addDays(week, i));
    const prevDay = addDays(week, i - 7);
    spendThen += i < weekday ? costOn(prevDay) : costOn(prevDay) * dayFraction;
  }

  const f = factor ?? 1;
  const reqNow = serverCount(server, start, nowMs + 1);
  const reqThen = serverCount(server, prevStart, prevCut);
  const reqFullPrev = serverCount(server, prevStart, start);
  const googleNow = inbound(server).filter(r => r.origin === 'google' && Date.parse(r.first_at) >= start).length;
  const updated = server.reduce<string | null>((best, r) => (r.updated_at && (!best || r.updated_at > best) ? r.updated_at : best), null);

  const closingsProjection = projectWeek(nowC.length, thenC.length, fullPrevC.length, fraction);
  const shareNow = sum(nowC, closingShare);
  const shareThen = sum(thenC, closingShare);
  // A parte do dono projeta-se pelos fechos projetados × a parte média por fecho desta semana.
  const shareProjection = closingsProjection === null ? null : nowC.length ? (shareNow / nowC.length) * closingsProjection : 0;
  const reqProjection = projectWeek(reqNow, reqThen, reqFullPrev, fraction);

  return {
    week,
    weekday,
    moment: `${WEEKDAY_LONG[weekday]} às ${CLOCK.format(now)}`,
    fraction,
    requests: { ...pace(reqNow * f, reqThen * f), estimated: factor !== null, projection: reqProjection === null ? null : reqProjection * f, google: googleNow },
    closings: { ...pace(nowC.length, thenC.length), projection: closingsProjection },
    billed: pace(sum(nowC, billedOf), sum(thenC, billedOf)),
    share: { ...pace(shareNow, shareThen), projection: shareProjection },
    spend: pace(spendNow, spendThen),
    serverUpdatedAt: updated,
  };
}

export interface SinceVisit { hours: number; closings: number; billed: number; share: number; conversations: number }

/** O que entrou desde a última visita ao separador. */
export function sinceVisit(closings: ClosingInput[], server: ServerConversation[], sinceMs: number, now: Date): SinceVisit {
  const rows = closings.filter(c => isClosing(c) && Date.parse(c.booked_at!) > sinceMs);
  return {
    hours: Math.max(0, (now.getTime() - sinceMs) / HOUR_MS),
    closings: rows.length,
    billed: rows.reduce((s, c) => s + (Number(c.billed_value) || 0), 0),
    share: rows.reduce((s, c) => s + closingShare(c), 0),
    conversations: inbound(server).filter(r => Date.parse(r.first_at) > sinceMs).length,
  };
}

/** Os fechos mais recentes, do mais novo para o mais antigo. */
export function recentClosings<T extends ClosingInput>(closings: T[], n = 8): T[] {
  return closings.filter(isClosing).sort((a, b) => Date.parse(b.booked_at!) - Date.parse(a.booked_at!)).slice(0, n);
}

/** "há 12 min", "há 3 h", "ontem às 18:20", "terça às 10:05", "12/10". */
export function timeAgo(iso: string, now: Date): string {
  const diff = now.getTime() - Date.parse(iso);
  if (diff < 60_000) return 'agora mesmo';
  if (diff < HOUR_MS) return `há ${Math.floor(diff / 60_000)} min`;
  if (diff < 6 * HOUR_MS) return `há ${Math.floor(diff / HOUR_MS)} h`;
  const day = lisbonDay(iso);
  const today = lisbonDay(now);
  const clock = CLOCK.format(new Date(iso));
  if (day === today) return `hoje às ${clock}`;
  if (day === addDays(today, -1)) return `ontem às ${clock}`;
  if (day > addDays(today, -7)) return `${WEEKDAY_LONG[weekdayOf(day)]} às ${clock}`;
  return `${day.slice(8, 10)}/${day.slice(5, 7)}`;
}

export interface CampaignTrend {
  name: string;
  cost7: number; clicks7: number; conversions7: number;
  costPrev7: number; clicksPrev7: number;
  cost: number; clicks: number; conversions: number;
}

/** Campanhas do Google: últimos 7 dias, os 7 anteriores e desde `from`. */
export function campaignTrends(rows: Array<{ stat_date: string; cost: number; clicks: number; conversions: number; campaign_name: string }>, from: string, now: Date): CampaignTrend[] {
  const today = lisbonDay(now);
  const since7 = addDays(today, -6);
  const sincePrev = addDays(today, -13);
  const map = new Map<string, CampaignTrend>();
  for (const r of rows) {
    if (r.stat_date < from) continue;
    const c = map.get(r.campaign_name) ?? { name: r.campaign_name, cost7: 0, clicks7: 0, conversions7: 0, costPrev7: 0, clicksPrev7: 0, cost: 0, clicks: 0, conversions: 0 };
    const cost = Number(r.cost) || 0;
    const clicks = Number(r.clicks) || 0;
    const conv = Number(r.conversions) || 0;
    c.cost += cost; c.clicks += clicks; c.conversions += conv;
    if (r.stat_date >= since7) { c.cost7 += cost; c.clicks7 += clicks; c.conversions7 += conv; }
    else if (r.stat_date >= sincePrev) { c.costPrev7 += cost; c.clicksPrev7 += clicks; }
    map.set(r.campaign_name, c);
  }
  return [...map.values()].filter(c => c.cost > 0).sort((a, b) => b.cost7 - a.cost7 || b.cost - a.cost);
}

/** Nome curto da campanha: sem "Kyro | " nem o tema repetido. */
export const campaignLabel = (name: string) => name.replace(/^Kyro \| /, '').replace(/ \| Limpeza e Proteção de Sofás/, '');
