import { addDays, lisbonDay, weekdayOf } from './crmClosings';

// Conversas novas do WhatsApp (aba "Conversas" do CRM, dono 2026-10-16). Uma linha
// de whatsapp_conversations por contacto, com o dia da primeira mensagem e a origem
// lida dela. Estas contas não leem mais nada.

export type ConversationOrigin = 'google' | 'meta' | 'questionario' | 'organico';
export const ORIGINS: ConversationOrigin[] = ['google', 'meta', 'questionario', 'organico'];
export const ORIGIN_LABEL: Record<ConversationOrigin, string> = {
  google: 'Anúncio Google', meta: 'Anúncio Meta', questionario: 'Questionário do site', organico: 'Orgânico / direto',
};
/** Primeiro dia com anúncios do Google a correr a sério. */
export const ADS_START = '2026-09-26';

export interface ConversationRow { first_at: string; origin: ConversationOrigin; is_lid?: boolean; contact_key?: string }
export interface SpendRow { stat_date: string; cost: number }

export type OriginCounts = Record<ConversationOrigin, number>;
const zero = (): OriginCounts => ({ google: 0, meta: 0, questionario: 0, organico: 0 });

export interface PeriodSummary {
  total: number;
  byOrigin: OriginCounts;
  days: { day: string; total: number; byOrigin: OriginCounts }[];
  weekdays: { weekday: number; total: number; perWeek: number }[];
  googleCost: number;
  costPerGoogle: number | null;
  costPerConversation: number | null;
}

const mondayOf = (day: string) => addDays(day, -weekdayOf(day));

/** Período [from, to], dias de Lisboa, inclusivos. */
export function summarizeConversations(rows: ConversationRow[], spend: SpendRow[], from: string, to: string): PeriodSummary {
  const days = new Map<string, OriginCounts>();
  for (let d = from; d <= to; d = addDays(d, 1)) days.set(d, zero());
  const byOrigin = zero();
  for (const r of rows) {
    const c = days.get(lisbonDay(r.first_at));
    if (!c) continue;
    c[r.origin]++; byOrigin[r.origin]++;
  }
  const dayList = [...days].map(([day, o]) => ({ day, total: ORIGINS.reduce((s, k) => s + o[k], 0), byOrigin: o }));
  const total = dayList.reduce((s, d) => s + d.total, 0);
  const weeks = Math.max(1, dayList.length / 7);
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map(weekday => {
    const n = dayList.filter(d => weekdayOf(d.day) === weekday).reduce((s, d) => s + d.total, 0);
    return { weekday, total: n, perWeek: n / weeks };
  });
  const googleCost = spend.filter(s => s.stat_date >= from && s.stat_date <= to).reduce((s, x) => s + Number(x.cost || 0), 0);
  return {
    total, byOrigin, days: dayList, weekdays, googleCost,
    costPerGoogle: byOrigin.google ? googleCost / byOrigin.google : null,
    costPerConversation: googleCost && total ? googleCost / total : null,
  };
}

export interface WeekPoint { week: string; total: number; byOrigin: OriginCounts; cost: number; withAds: boolean }

/** `count` semanas (segunda a domingo) a acabar na semana de `lastDay`. */
export function weeklyConversations(rows: ConversationRow[], spend: SpendRow[], lastDay: string, count: number): WeekPoint[] {
  const last = mondayOf(lastDay);
  const out: WeekPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const week = addDays(last, -7 * i);
    const s = summarizeConversations(rows, spend, week, addDays(week, 6));
    out.push({ week, total: s.total, byOrigin: s.byOrigin, cost: s.googleCost, withAds: addDays(week, 6) >= ADS_START });
  }
  return out;
}

// Taxa de fecho por semana de contacto (dono, 2026-10-17: "o número de conversas
// novas por semana e a taxa de fecho por contacto nessa semana, isso é que é a
// estatística"). Cada contacto pertence à semana da primeira mensagem e fechou se
// tem um serviço no CRM fechado (booked_at) a partir dessa mensagem e até 30 dias
// depois, pelos últimos 9 dígitos do telefone. Revisitas a 0€ não contam.

export interface ClosingRow { phone: string | null; booked_at: string | null; billed_value: number | null }
/** Prazo para um contacto contar como fechado. */
export const COHORT_CLOSE_DAYS = 30;

export interface CohortWeek {
  week: string;
  contacts: number;
  google: number;
  /** Contactos sem telefone (@lid): nunca se ligam ao CRM, por isso a taxa sai por baixo. */
  noPhone: number;
  closed: number;
  closedIn7: number;
  rate: number | null;
  rateIn7: number | null;
  revenue: number;
  /** Ainda há contactos desta semana dentro dos 7 dias: a taxa vai subir. */
  open: boolean;
}

const phoneKey = (v: string | null | undefined) => (v ?? '').replace(/\D/g, '').slice(-9);
const DAY_MS = 86_400_000;

/** `count` semanas (segunda a domingo) a acabar na semana de `lastDay`; `now` decide as que estão abertas. */
export function weeklyCloseRate(rows: ConversationRow[], closings: ClosingRow[], lastDay: string, count: number, now: Date = new Date()): CohortWeek[] {
  const byPhone = new Map<string, { t: number; v: number }[]>();
  for (const c of closings) {
    const k = phoneKey(c.phone);
    if (k.length < 9 || !c.booked_at || !(Number(c.billed_value) > 0)) continue;
    const list = byPhone.get(k) ?? [];
    list.push({ t: Date.parse(c.booked_at), v: Number(c.billed_value) });
    byPhone.set(k, list);
  }
  const last = mondayOf(lastDay);
  const out: CohortWeek[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const week = addDays(last, -7 * i);
    const end = addDays(week, 6);
    const w: CohortWeek = { week, contacts: 0, google: 0, noPhone: 0, closed: 0, closedIn7: 0, rate: null, rateIn7: null, revenue: 0, open: false };
    for (const r of rows) {
      const day = lisbonDay(r.first_at);
      if (day < week || day > end) continue;
      w.contacts++;
      if (r.origin === 'google') w.google++;
      const first = Date.parse(r.first_at);
      if (first + 7 * DAY_MS > now.getTime()) w.open = true;
      if (r.is_lid) { w.noPhone++; continue; }
      // Uma hora de folga: o dono às vezes marca antes de a primeira mensagem entrar no servidor.
      const hits = (byPhone.get(phoneKey(r.contact_key)) ?? []).filter(s => s.t >= first - 3_600_000 && s.t < first + COHORT_CLOSE_DAYS * DAY_MS);
      if (!hits.length) continue;
      w.closed++;
      if (Math.min(...hits.map(s => s.t)) < first + 7 * DAY_MS) w.closedIn7++;
      w.revenue += hits.reduce((s, h) => s + h.v, 0);
    }
    w.rate = w.contacts ? w.closed / w.contacts : null;
    w.rateIn7 = w.contacts ? w.closedIn7 / w.contacts : null;
    out.push(w);
  }
  return out;
}

export interface EraComparison { weeks: number; perWeek: number; perWeekByOrigin: OriginCounts; costPerWeek: number }

/**
 * Média por semana completa antes dos anúncios (desde `organicFrom`) e com anúncios
 * (da primeira semana completa depois de ADS_START até; a semana de ADS_START fica de fora, é de transição; até à última semana completa antes de `today`).
 */
export function compareEras(rows: ConversationRow[], spend: SpendRow[], organicFrom: string, today: string): { organic: EraComparison; ads: EraComparison } {
  const era = (from: string, to: string): EraComparison => {
    const s = summarizeConversations(rows, spend, from, to);
    const weeks = Math.max(0, Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000 + 1) / 7);
    const per = (n: number) => (weeks ? n / weeks : 0);
    const o = zero();
    for (const k of ORIGINS) o[k] = per(s.byOrigin[k]);
    return { weeks, perWeek: per(s.total), perWeekByOrigin: o, costPerWeek: per(s.googleCost) };
  };
  const adsMonday = mondayOf(ADS_START);
  const lastFull = addDays(mondayOf(today), -1);
  return { organic: era(mondayOf(organicFrom), addDays(adsMonday, -1)), ads: era(addDays(adsMonday, 7), lastFull) };
}
