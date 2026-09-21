import type { AttributionRow, JoinedLead, SessionEventRow, AdSpendRow } from './marketingMetrics';

export type MarketingPlatform = 'google' | 'meta';
export const PLATFORM_LABEL = { google: 'Google Ads', meta: 'Meta Ads' };
export const META_URL_PARAMETERS = 'utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&meta_campaign_id={{campaign.id}}&meta_adset_id={{adset.id}}&meta_ad_id={{ad.id}}&meta_placement={{placement}}';
const google = new Set(['google', 'google.com', 'googleads', 'google_ads']);
const meta = new Set(['facebook', 'instagram', 'meta', 'fb', 'ig', 'an', 'msg', 'facebook.com', 'instagram.com', 'l.facebook.com', 'm.facebook.com']);
const paid = new Set(['cpc', 'ppc', 'paidsearch', 'paid_social', 'paidsocial', 'paid']);

/** Explicit source wins; a click identifier from a different touch must not cross-credit. */
export function advertisingPlatform(a: Partial<AttributionRow> | null): MarketingPlatform | null {
  if (!a) return null;
  const source = a.last_source?.trim().toLowerCase();
  const medium = a.last_medium?.trim().toLowerCase();
  if (source && meta.has(source)) return paid.has(medium ?? '') || a.attribution_method === 'manual' ? 'meta' : null;
  if (source && !google.has(source)) return null;
  if (a.gclid || a.gbraid || a.wbraid || (source && google.has(source) && paid.has(medium ?? ''))) return 'google';
  return null;
}
export const platformLeads = (rows: JoinedLead[], platform: MarketingPlatform) => rows.filter(r => advertisingPlatform(r.attribution) === platform);
export const platformEvents = (rows: SessionEventRow[], platform: MarketingPlatform) => rows.filter(r => advertisingPlatform({
  last_source: r.utm_source, last_medium: r.utm_medium, gclid: r.gclid, gbraid: r.gbraid, wbraid: r.wbraid,
}) === platform);

export interface DailySpend {
  platform: MarketingPlatform;
  spend_date: string;
  amount: number;
}
export function calendarDays(start: string, end: string): string[] {
  const out: string[] = [];
  for (let at = Date.parse(`${start}T12:00:00Z`); at <= Date.parse(`${end}T12:00:00Z`); at += 86400000) out.push(new Date(at).toISOString().slice(0, 10));
  return out;
}
export function localDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function periodDates(days: number, now = new Date()) {
  const end = localDate(now);
  const start = new Date(Date.parse(`${end}T12:00:00Z`) - (days - 1) * 86400000).toISOString().slice(0, 10);
  return { start, end };
}
export function lisbonMidnight(date: string): string {
  const midnight = new Date(`${date}T00:00:00Z`);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', hourCycle: 'h23' }).format(midnight));
  return new Date(Date.parse(`${date}T00:00:00Z`) - hour * 3600000).toISOString();
}
/** Missing days never become zero spend and never unlock misleading ROAS. */
export function coveredSpend(rows: DailySpend[], platform: MarketingPlatform, start: string, end: string): { rows: AdSpendRow[] | null; missing: number; total: number } {
  const selected = rows.filter(r => r.platform === platform && r.spend_date >= start && r.spend_date <= end);
  const byDate = new Map(selected.filter(r => Number.isFinite(Number(r.amount)) && Number(r.amount) >= 0).map(r => [r.spend_date, r]));
  const days = calendarDays(start, end);
  const missing = days.filter(d => !byDate.has(d)).length;
  const valid = [...byDate.values()];
  return { missing, total: valid.reduce((sum, r) => sum + Number(r.amount), 0), rows: missing ? null : valid.map(r => ({
    campaign_id: null, cost: Number(r.amount), currency: 'EUR', periodStart: r.spend_date, periodEnd: r.spend_date, dateBasis: 'click',
  })) };
}
