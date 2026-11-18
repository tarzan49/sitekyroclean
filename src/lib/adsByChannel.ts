import { addDays, countsAsClosing, lisbonDay, serviceTotal, weekdayOf } from './crmClosings';
import { lisbonMidnight } from './lisbonTime';
import { ADS_FROM, type ClosingInput, type ExtraWeek, type WeekStats } from './adsVsOrganic';

// Lucro dos anúncios por canal (dono, 2026-11-18: "ter lá o lucro de anúncios de
// Google e o lucro de anúncios Meta desde, e vais meter as datas. E eu consigo
// trocar entre um e o outro"; "os gastos só começam a partir dos 500 € de hoje.
// Os 250 € para trás, deixa para trás").
//
// Meta, desde META_FROM: o "para ti" dos fechos cujo cliente veio de uma conversa
// Meta (whatsapp_conversations, origin 'meta', ligada ao CRM pelos últimos 9
// dígitos do telefone, fecho no primeiro contacto ou depois) e dos fechos
// marcados "Meta Ads" no CRM, cada fecho uma vez só, menos o gasto Meta
// (meta_ads_daily_stats). Uma conversa Meta de antes de META_FROM é do gasto que
// ficou para trás: nem ela nem os fechos dela contam.
//
// Google: o critério do dono de sempre (CLAUDE.md §0.3: tudo acima da média
// orgânica de 03/08 a 20/09, menos o gasto Google), mas a subida passa a ser
// sem os pedidos e os fechos atribuídos à Meta, para a Meta não inflacionar o
// lucro do Google.
//
// Total: a subida acima do orgânico com tudo, menos o gasto Google e o gasto
// Meta. Google + Meta = Total, ao cêntimo.
//
// Sem uma leitura boa da Marketing API o gasto Meta é null ("por ligar"), nunca 0€.

/** Primeiro dia da Meta: o dia em que o dono carregou os 500€ na conta de anúncios. */
export const META_FROM = '2026-11-18';
/** Origem que o CRM dá a um fecho vindo da Meta (`service_requests.source`). */
export const META_CRM_SOURCE = 'Meta Ads';

export interface MetaConversation { contact_key: string; is_lid?: boolean | null; first_at: string; started_by_us: boolean; origin?: string | null }
export interface MetaSpendRow { stat_date: string; campaign_name?: string | null; spend: number; impressions?: number | null; clicks?: number | null; conversations?: number | null }
export interface MetaSyncStatus { last_ok_at: string | null; last_error?: string | null; last_error_at?: string | null }
export interface ChannelClosing extends ClosingInput { id?: string; phone?: string | null; source?: string | null }

const mondayOf = (day: string) => addDays(day, -weekdayOf(day));

/** Os últimos 9 dígitos do telefone (o número português sem o 351); null se não houver 9 dígitos. */
export function phoneKey(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : null;
}

export interface MetaAttribution<C extends ChannelClosing = ChannelClosing> {
  from: string;
  /** Pedidos Meta: pessoas que escreveram pela primeira vez vindas da Meta desde `from`. */
  requests: MetaConversation[];
  closings: C[];
  /** Fechos marcados "Meta Ads" no CRM sem conversa Meta encontrada. */
  byCrmOnly: number;
}

export function attributeMeta<C extends ChannelClosing>(closings: C[], conversations: MetaConversation[], from = META_FROM): MetaAttribution<C> {
  const start = lisbonMidnight(from);
  const meta = conversations.filter(c => c.origin === 'meta' && !c.started_by_us);
  const firstMeta = new Map<string, number>();
  for (const c of meta) {
    if (c.is_lid) continue;
    const key = phoneKey(c.contact_key);
    const at = Date.parse(c.first_at);
    if (key && Number.isFinite(at) && at < (firstMeta.get(key) ?? Infinity)) firstMeta.set(key, at);
  }
  const out: C[] = [];
  let byCrmOnly = 0;
  for (const c of closings) {
    if (!c.booked_at || !countsAsClosing({ billed_value: Number(c.billed_value) || 0, upsell_value: c.upsell_value })) continue;
    const booked = Date.parse(c.booked_at);
    if (!(booked >= start)) continue;
    const key = phoneKey(c.phone);
    const first = key ? firstMeta.get(key) : undefined;
    const byConversation = first !== undefined && first >= start && booked >= first;
    const oldMeta = first !== undefined && first < start;
    const byCrm = (c.source ?? '').trim() === META_CRM_SOURCE && !oldMeta;
    if (byConversation || byCrm) {
      out.push(c);
      if (!byConversation) byCrmOnly++;
    }
  }
  return { from, requests: meta.filter(c => Date.parse(c.first_at) >= start), closings: out, byCrmOnly };
}

/** As semanas sem o que a Meta trouxe (pedidos, fechos, faturado, para ti): a base do lucro do Google. */
export function withoutMeta<T extends WeekStats>(weeks: T[], meta: MetaAttribution): T[] {
  const per = new Map<string, { requests: number; closings: number; billed: number; share: number }>();
  const slot = (week: string) => { let s = per.get(week); if (!s) per.set(week, (s = { requests: 0, closings: 0, billed: 0, share: 0 })); return s; };
  for (const r of meta.requests) slot(mondayOf(lisbonDay(r.first_at))).requests++;
  for (const c of meta.closings) {
    const s = slot(mondayOf(lisbonDay(c.booked_at!)));
    s.closings++;
    s.billed += serviceTotal(c);
    s.share += Number(c.my_cut) || 0;
  }
  return weeks.map(w => {
    const m = per.get(w.week);
    if (!m) return w;
    return {
      ...w,
      newPeople: w.newPeople === null ? null : w.newPeople - m.requests,
      closings: w.closings - m.closings,
      billed: w.billed - m.billed,
      share: w.share - m.share,
    };
  });
}

export interface MetaView {
  from: string;
  /** Há uma leitura boa da Marketing API; sem ela o gasto é null. */
  connected: boolean;
  /** Erro da última leitura, se for mais recente do que a última boa. */
  syncError: string | null;
  spend: number | null;
  /** O que a Meta conta (conversas iniciadas, cliques), só com a API ligada. */
  metaConversations: number | null;
  clicks: number | null;
  requests: number;
  closings: number;
  billed: number;
  share: number;
  profit: number | null;
  costPerRequest: number | null;
  costPerClosing: number | null;
  byCrmOnly: number;
}

export function metaView(meta: MetaAttribution, spendRows: MetaSpendRow[], status: MetaSyncStatus | null): MetaView {
  const connected = !!status?.last_ok_at;
  const rows = spendRows.filter(r => r.stat_date >= meta.from);
  const total = (f: (r: MetaSpendRow) => number) => Math.round(rows.reduce((s, r) => s + f(r), 0) * 100) / 100;
  const spend = connected ? total(r => Number(r.spend) || 0) : null;
  const share = meta.closings.reduce((s, c) => s + (Number(c.my_cut) || 0), 0);
  const failedLater = status?.last_error && status.last_error_at && (!status.last_ok_at || status.last_error_at > status.last_ok_at);
  return {
    from: meta.from,
    connected,
    syncError: failedLater ? status!.last_error! : null,
    spend,
    metaConversations: connected ? total(r => Number(r.conversations) || 0) : null,
    clicks: connected ? total(r => Number(r.clicks) || 0) : null,
    requests: meta.requests.length,
    closings: meta.closings.length,
    billed: meta.closings.reduce((s, c) => s + serviceTotal(c), 0),
    share,
    profit: spend === null ? null : share - spend,
    costPerRequest: spend !== null && meta.requests.length ? spend / meta.requests.length : null,
    costPerClosing: spend !== null && meta.closings.length ? spend / meta.closings.length : null,
    byCrmOnly: meta.byCrmOnly,
  };
}

/** Gasto Meta de cada semana (segunda a domingo, Lisboa), só a partir de `from`. */
export function metaSpendByWeek(spendRows: MetaSpendRow[], from = META_FROM): Map<string, number> {
  const out = new Map<string, number>();
  for (const r of spendRows) {
    if (r.stat_date < from) continue;
    const w = mondayOf(r.stat_date);
    out.set(w, (out.get(w) ?? 0) + (Number(r.spend) || 0));
  }
  return out;
}

export interface TotalWeek { week: string; partial: boolean; extraShare: number; googleSpend: number; metaSpend: number | null; profit: number | null }
export interface TotalView {
  from: string;
  metaFrom: string;
  rows: TotalWeek[];
  extraShare: number;
  googleSpend: number;
  metaSpend: number | null;
  profit: number | null;
}

/**
 * Os dois juntos: a subida acima do orgânico com tudo (`extra` = adsExtra das semanas
 * inteiras, com a Meta) menos o gasto Google e o gasto Meta. Sem a Meta ligada, as
 * semanas desde META_FROM e o total ficam null.
 */
export function totalView(extra: { rows: ExtraWeek[] }, spendRows: MetaSpendRow[], connected: boolean, metaFrom = META_FROM, from = ADS_FROM): TotalView {
  const metaWeek = metaSpendByWeek(spendRows, metaFrom);
  const firstMetaWeek = mondayOf(metaFrom);
  const rows: TotalWeek[] = extra.rows.map(r => {
    const hasMeta = r.week >= firstMetaWeek;
    const metaSpend = !hasMeta ? 0 : connected ? metaWeek.get(r.week) ?? 0 : null;
    return { week: r.week, partial: r.partial, extraShare: r.extraShare, googleSpend: r.spend, metaSpend, profit: metaSpend === null ? null : r.extraShare - r.spend - metaSpend };
  });
  const sum = (f: (r: TotalWeek) => number) => rows.reduce((s, r) => s + f(r), 0);
  const metaSpend = connected ? Math.round(sum(r => r.metaSpend ?? 0) * 100) / 100 : null;
  const extraShare = sum(r => r.extraShare);
  const googleSpend = sum(r => r.googleSpend);
  return { from, metaFrom, rows, extraShare, googleSpend, metaSpend, profit: metaSpend === null ? null : extraShare - googleSpend - metaSpend };
}
