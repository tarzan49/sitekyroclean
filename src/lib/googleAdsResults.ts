// Resultados reais do Google Ads (dono, 2026-10-06): quanto se gasta, quantas
// pessoas o anúncio traz e quantas fecham, ao lado do que fecha sem o Google.
//
// Não depende de cookies. Quem veio do anúncio sabe-se pelo WhatsApp (a
// primeira mensagem "Vi o vosso anúncio no Google", posta pelo site, e a
// etiqueta "Google", que ficam em clients.from_google_ads) e pelo calendário
// ("(anúncio)" no título, que dá source "Google Ads" no CRM). Um serviço conta
// como Google se tiver uma das duas marcas.
//
// - Contacto: uma ficha em `clients`, no dia do primeiro contacto.
// - Fecho: uma linha do CRM, no dia em que foi fechada (booked_at), não no dia
//   do serviço. O dinheiro é o faturado e a parte do dono (my_cut mais a parte
//   dele no upsell, como no CRM).
// - Gasto, cliques e as "conversões" do Google: ads_daily_stats, enviado pelo
//   script da conta de hora a hora. As conversões do Google são cliques no
//   WhatsApp e formulários, não clientes, e aparecem só como referência.
import { phoneKey } from "@/lib/clientRecords";
import { addDays, lisbonDay } from "@/lib/crmClosings";
import { ownerUpsellOf } from "@/lib/crmUpsell";

/** Primeiro dia com os anúncios ligados (as campanhas novas arrancaram a 26/09 à tarde). */
export const ADS_START_DAY = "2026-09-26";
export const GOOGLE_ADS_SOURCE = "Google Ads";

export interface ServiceRow {
  id: string;
  booked_at: string | null;
  created_at: string;
  request_date: string;
  billed_value: number;
  my_cut: number;
  upsell_value: number | null;
  upsell_team: string | null;
  locality: string | null;
  phone: string | null;
  source: string | null;
  client_name: string | null;
  description: string;
}

export interface ContactRow {
  phone: string;
  from_google_ads: boolean;
  first_contact_at: string | null;
  status: string;
}

export interface AdsStatRow {
  stat_date: string;
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  updated_at?: string;
}

export interface Side {
  contacts: number;
  /** Contactos do período que já têm serviço fechado (no CRM ou pela etiqueta). */
  contactsClosed: number;
  services: number;
  billed: number;
  share: number;
}

export interface DayRow {
  day: string;
  cost: number;
  clicks: number;
  googleContacts: number;
  googleServices: number;
  googleBilled: number;
  googleShare: number;
  otherServices: number;
}

export interface CampaignRow {
  id: string;
  name: string;
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface GoogleAdsResults {
  from: string;
  to: string;
  cost: number;
  clicks: number;
  impressions: number;
  adsConversions: number;
  google: Side;
  other: Side;
  days: DayRow[];
  campaigns: CampaignRow[];
  googleServicesList: ServiceRow[];
  /** Dias do período sem estatísticas do Ads (script ainda não correu, ou dia sem anúncios). */
  daysWithoutStats: number;
  /** Contactos sem data de primeiro contacto: ficam fora das contas de contactos. */
  contactsWithoutDate: number;
  lastStatsUpdate: string | null;
}

const num = (v: unknown) => Number(v) || 0;
const round2 = (n: number) => Math.round(n * 100) / 100;
export const shareOf = (r: ServiceRow) => num(r.my_cut) + ownerUpsellOf(r);
export const closedDay = (r: Pick<ServiceRow, "booked_at" | "created_at">) => lisbonDay(r.booked_at ?? r.created_at);

/** Telefones (últimos 9 dígitos) de quem veio do anúncio. */
export function googlePhoneSet(contacts: ContactRow[]): Set<string> {
  return new Set(contacts.filter(c => c.from_google_ads).map(c => phoneKey(c.phone)).filter(Boolean));
}

export function isGoogleService(r: ServiceRow, googlePhones: Set<string>): boolean {
  if (r.source === GOOGLE_ADS_SOURCE) return true;
  const key = phoneKey(r.phone);
  return key !== "" && googlePhones.has(key);
}

const emptySide = (): Side => ({ contacts: 0, contactsClosed: 0, services: 0, billed: 0, share: 0 });

export function computeGoogleAdsResults(
  services: ServiceRow[],
  contacts: ContactRow[],
  stats: AdsStatRow[],
  from: string,
  to: string,
): GoogleAdsResults {
  const googlePhones = googlePhoneSet(contacts);
  const inRange = (day: string) => day >= from && day <= to;

  const days = new Map<string, DayRow>();
  for (let d = from; d <= to; d = addDays(d, 1)) {
    days.set(d, { day: d, cost: 0, clicks: 0, googleContacts: 0, googleServices: 0, googleBilled: 0, googleShare: 0, otherServices: 0 });
  }

  // Quem já tem serviço no CRM, por telefone, para a taxa de fecho dos contactos.
  const servedPhones = new Set(services.map(s => phoneKey(s.phone)).filter(Boolean));

  const google = emptySide(), other = emptySide();
  let contactsWithoutDate = 0;
  for (const c of contacts) {
    if (!c.first_contact_at) { contactsWithoutDate++; continue; }
    const day = lisbonDay(c.first_contact_at);
    if (!inRange(day)) continue;
    const side = c.from_google_ads ? google : other;
    side.contacts++;
    const closed = c.status === "cliente" || c.status === "marcado" || servedPhones.has(phoneKey(c.phone));
    if (closed) side.contactsClosed++;
    if (c.from_google_ads) days.get(day)!.googleContacts++;
  }

  const googleServicesList: ServiceRow[] = [];
  for (const s of services) {
    const day = closedDay(s);
    if (!inRange(day)) continue;
    const isGoogle = isGoogleService(s, googlePhones);
    const side = isGoogle ? google : other;
    side.services++;
    side.billed += num(s.billed_value);
    side.share += shareOf(s);
    const row = days.get(day)!;
    if (isGoogle) {
      googleServicesList.push(s);
      row.googleServices++;
      row.googleBilled += num(s.billed_value);
      row.googleShare += shareOf(s);
    } else {
      row.otherServices++;
    }
  }

  const campaigns = new Map<string, CampaignRow>();
  let cost = 0, clicks = 0, impressions = 0, adsConversions = 0;
  let lastStatsUpdate: string | null = null;
  for (const s of stats) {
    if (s.updated_at && (!lastStatsUpdate || s.updated_at > lastStatsUpdate)) lastStatsUpdate = s.updated_at;
    if (!inRange(s.stat_date)) continue;
    cost += num(s.cost); clicks += num(s.clicks); impressions += num(s.impressions); adsConversions += num(s.conversions);
    const day = days.get(s.stat_date)!;
    day.cost += num(s.cost);
    day.clicks += num(s.clicks);
    const c = campaigns.get(s.campaign_id) ?? { id: s.campaign_id, name: s.campaign_name, cost: 0, clicks: 0, impressions: 0, conversions: 0 };
    c.cost += num(s.cost); c.clicks += num(s.clicks); c.impressions += num(s.impressions); c.conversions += num(s.conversions);
    campaigns.set(s.campaign_id, c);
  }

  const daysWithStats = new Set(stats.filter(s => inRange(s.stat_date)).map(s => s.stat_date));
  for (const side of [google, other]) { side.billed = round2(side.billed); side.share = round2(side.share); }

  return {
    from, to,
    cost: round2(cost), clicks, impressions, adsConversions: round2(adsConversions),
    google, other,
    days: [...days.values()].reverse(),
    campaigns: [...campaigns.values()].sort((a, b) => b.cost - a.cost),
    googleServicesList: googleServicesList.sort((a, b) => closedDay(b).localeCompare(closedDay(a))),
    daysWithoutStats: [...days.keys()].filter(d => !daysWithStats.has(d)).length,
    contactsWithoutDate,
    lastStatsUpdate,
  };
}

/** a ÷ b, ou null quando b é zero (o painel mostra "–"). */
export const safeDiv = (a: number, b: number): number | null => (b > 0 ? a / b : null);
