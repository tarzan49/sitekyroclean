/**
 * The WhatsApp bot's availability (dono, 2026-10-07: "podes integrar o
 * calendário no bot?"). The bot never invents an hour: it asks `bot-api`
 * (action `availability`), which reads the owner's calendar through the secret
 * iCal address and runs this file. Only times go back to the bot, never a
 * client's name, phone or address.
 *
 * The rules are the owner's, from the bot briefing (section 3, "Marcar de forma
 * inteligente") and the replies file (2.6, 2.12):
 * - the client's locality says which teams work there (Porto 1 and 2, Braga,
 *   Lisboa 1 and 2, Algarve, Coimbra); a time is free if at least one of them is free.
 *   Porto 1 and Lisboa 1 are two people who can each take a job at the same time
 *   (owner, 9 Oct 2026), so they count as free until they have two;
 * - a service with "Equipa: X" in the description (written by the team-calendar
 *   script) busies that team; a service, "Pré-reserva" or "A confirmar" still
 *   without a team busies one of the teams of its region;
 * - each article takes its real time (sofa 1h, mattress 45 min, chair 10 min,
 *   rug 4 min per m², waterproofing +20 min), plus a margin for the drive;
 * - teams work every day until 21h, and the bot never offers before 10h or after 18h;
 * - two times, near the team's other jobs that day when possible, and at an hour
 *   with no other service in the zone (owner, 9 Oct 2026: "tenta que os pedidos
 *   sejam sempre a horas diferentes, se for a mesma hora tem que me consultar").
 * Aveiro and the Alentejo Litoral are "sob consulta": those go to the owner, with
 * no hours. Coimbra and Figueira da Foz have their own team since 10 Oct 2026
 * (owner: "cria o calendário da equipa de coimbra"); in the CRM they still count
 * as region Porto, so the bot's zone (`TeamZone`) is not the CRM's locality.
 *
 * Bundled into the `bot-api` function by `npm run build:bot-engine` (through
 * botQuote.ts), so this file must not import anything that pulls the site's
 * page data in.
 */
import { cities } from '../data/serviceCatalog';
import { EXTENDED_TRIP_CITIES } from '../constants/travel';
import { localityFromPostalCode, type CrmLocality } from './postalRegion';
import { resolveBotCity } from './botQuote';

export interface AvailabilityEvent {
  summary: string;
  description: string;
  status: string;
  /** UTC ISO; null for all-day events, which never busy a team. */
  start: string | null;
  end: string | null;
}

/** The zones the bot books by: the CRM's four regions plus Coimbra, which the CRM counts as Porto. */
export type TeamZone = CrmLocality | 'Coimbra';
export const TEAMS_BY_REGION: Record<TeamZone, readonly string[]> = {
  Porto: ['Porto 1', 'Porto 2'],
  Braga: ['Braga'],
  Lisboa: ['Lisboa 1'],
  Algarve: ['Algarve'],
  Coimbra: ['Coimbra'],
};
const ALL_TEAMS = Object.values(TEAMS_BY_REGION).flat();
/**
 * Waterproofing goes to another team in some zones (owner, 15 Oct 2026: "para já a equipa de
 * braga só fica com limpeza de estofos ao domicílio, a do porto fica com impermeabilizações
 * nessa zona"; "o porto por defeito é sempre porto 1"). A Guimarães waterproofing job had gone
 * to Braga and nobody turned up.
 */
export const WATERPROOFING_TEAMS: Partial<Record<TeamZone, readonly string[]>> = { Braga: ['Porto 1'] };
/** The teams that can take this job in the zone. */
export const teamsFor = (zone: TeamZone, waterproofing: boolean): readonly string[] =>
  (waterproofing && WATERPROOFING_TEAMS[zone]) || TEAMS_BY_REGION[zone];
/** The job includes waterproofing: an item with Essencial/Premium (the bot's `quote` items). */
export function hasWaterproofing(items: unknown): boolean {
  return Array.isArray(items) && items.some(i => /essencial|premium/.test(String((i as { treatment?: unknown })?.treatment ?? '')));
}
/**
 * Jobs a team can do at the same time (owner, 9 Oct 2026: "a porto 1 tem duas pessoas e a lisboa 1 tem duas pessoas, que na mesma hora podem trabalhar ao mesmo tempo").
 * Porto 1 is back to one job at a time (owner, 27 Oct 2026: "não podes estar a marcar serviços de limpeza a cada uma hora, porque é
 * impossível eles fazerem"): with two, the bot chained cleanings at 10h, 11h, 12h… and the team ran late all day.
 */
export const TEAM_CAPACITY: Readonly<Record<string, number>> = { 'Lisboa 1': 2 };
const capacity = (team: string) => TEAM_CAPACITY[team] ?? 1;
/**
 * The drive between two jobs of a team, when it is not TRAVEL_MARGIN_MIN. Porto 1 gets an hour on each side
 * (owner, 27 Oct 2026: "ou passas para o Porto 2, ou passas para uma hora em que seja possível"): a one-hour
 * cleaning at 10h leaves the next start at 12h at the earliest.
 */
export const TEAM_TRAVEL_MARGIN_MIN: Readonly<Record<string, number>> = { 'Porto 1': 60 };
const marginMs = (team: string | null) => (team && TEAM_TRAVEL_MARGIN_MIN[team] || TRAVEL_MARGIN_MIN) * 60_000;
/**
 * Weekday hours of a team that does not work the whole day; weekends are open as for any team. Porto 2 (Aleixo) works
 * Monday to Friday only in the morning (owner, 27 Oct 2026: "marca para Porto 2 a partir das 8 da manhã de segunda a
 * sexta até às 13 horas", "depois disso não consegue, só sábado e ao domingo"; Aleixo himself, 18 Oct: "melhor marcar
 * sempre pra cedo"). The job has to start and finish inside the window.
 */
export const TEAM_WEEKDAY_HOURS: Readonly<Record<string, { from: number; to: number }>> = { 'Porto 2': { from: 8, to: 13 } };
const isWeekday = (date: string) => { const d = new Date(`${date}T12:00:00Z`).getUTCDay(); return d >= 1 && d <= 5; };
/** Whether the team works over this whole visit (TEAM_WEEKDAY_HOURS). */
export function teamWorks(team: string, from: number, to: number): boolean {
  const hours = TEAM_WEEKDAY_HOURS[team];
  if (!hours) return true;
  const start = lisbon(from), end = lisbon(to);
  if (!isWeekday(start.date)) return true;
  return start.date === end.date && start.minutes >= hours.from * 60 && end.minutes <= hours.to * 60;
}
/** The earliest start a team takes on this day: its weekday hours when it has them, otherwise EARLIEST_HOUR. */
const teamEarliestMinutes = (team: string, date: string) =>
  (TEAM_WEEKDAY_HOURS[team] && isWeekday(date) ? Math.min(TEAM_WEEKDAY_HOURS[team].from, EARLIEST_HOUR) : EARLIEST_HOUR) * 60;
const TEAM_REGION = new Map(Object.entries(TEAMS_BY_REGION).flatMap(([region, teams]) => teams.map(t => [t, region as TeamZone] as const)));
const AREA_REGION: Record<string, TeamZone> = {
  porto: 'Porto', braga: 'Braga', lisboa: 'Lisboa', algarve: 'Algarve', coimbra: 'Coimbra',
};
/** Coimbra (30xx) and Figueira da Foz (308x-309x) by postal code; the rest as in the CRM. */
function zoneFromPostalCode(code: string): TeamZone | null {
  const n = Number(code.slice(0, 4));
  if (n >= 3000 && n < 3100) return 'Coimbra';
  return localityFromPostalCode(code);
}

/** Minutes per article (owner's averages; the upper end where he gave a range). */
const MINUTES = { sofa: 60, mattress: 45, chair: 10, rugPerM2: 4, waterproofing: 20, minimum: 45 };
/** Drive between two jobs of the same team. There is no maps API: a flat margin on each side. */
export const TRAVEL_MARGIN_MIN = 30;
export const EARLIEST_HOUR = 10;
export const DAY_END_HOUR = 21;
/** Latest start the bot offers on its own (owner, 8 Oct 2026: nobody books 20h). A time the client asks for is still checked up to DAY_END_HOUR. */
export const LAST_OFFER_HOUR = 18;
/** A time today has to be at least this far from now. */
const LEAD_TIME_MIN = 90;
const DEFAULT_DAYS = 4;
const MAX_DAYS = 14;

/**
 * The owner's day-by-day instructions on which days the bot fills. Each rule is on while Lisbon's
 * today is between `from` and `until`, so it switches itself off; a time he gave himself (`ownerTime`)
 * ignores them, and so do his own bookings (planOwnerBooking does not come through here).
 * - closed: the bot books nothing new that day (or only from `fromHour` on);
 * - prefer: the days the two offered times come from first;
 * - onlyPreferred: without a day asked by the client, only the preferred days are offered
 *   (the other days come back only when the preferred ones are full).
 */
export interface DayRule {
  zone: TeamZone;
  from: string;
  until: string;
  closed?: Array<{ date: string; fromHour?: number }>;
  prefer?: string[];
  onlyPreferred?: boolean;
  /** For the bot: what to tell a client who asks for a closed day. */
  note: string;
}
export const DAY_RULES: readonly DayRule[] = [
  // Owner, 26 Oct 2026 at night: "amanhã no Porto só te quero marcar serviços para quarta-feira".
  { zone: 'Porto', from: '2026-10-26', until: '2026-10-27', closed: [{ date: '2026-10-27' }], prefer: ['2026-10-28'], onlyPreferred: true,
    note: 'Terça (dia 27) já não temos vaga no Porto: oferece quarta (dia 28).' },
  // "E para Lisboa podes marcar para a parte da tarde, mas … principalmente serviços para quarta-feira".
  { zone: 'Lisboa', from: '2026-10-26', until: '2026-10-27', closed: [{ date: '2026-10-27', fromHour: 14 }], prefer: ['2026-10-28'],
    note: 'Terça (dia 27) em Lisboa só há vaga à tarde, a partir das 14h: oferece primeiro quarta (dia 28).' },
];

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const CITY_REGION = new Map(cities.map(c => [fold(c.name), AREA_REGION[c.area]] as const));
const CITY_NAMES = cities
  .map(c => ({ key: fold(c.name), region: AREA_REGION[c.area] }))
  .filter(c => c.key.length >= 4)
  .sort((a, b) => b.key.length - a.key.length);

const SERVICE_LIKE = /^(servico|limpeza|pre-? ?reserva|a confirmar)\b/;
const TEAM_LINE = /^\s*Equipa:\s*([^\n<]*)/im;
const POSTAL = /\b(\d{4})-\d{3}\b/;

/** The team written by the team-calendar script, or null. */
export function eventTeam(e: AvailabilityEvent): string | null {
  const t = TEAM_LINE.exec(e.description ?? '')?.[1];
  if (!t) return null;
  const k = fold(t);
  return ALL_TEAMS.find(team => fold(team) === k) ?? null;
}

/** Region of a service still without a team: postal code first, then a served town in the title. */
export function eventRegion(e: AvailabilityEvent): TeamZone | null {
  const text = `${e.summary}\n${e.description}`;
  const postal = POSTAL.exec(text);
  if (postal) {
    const r = zoneFromPostalCode(postal[1]);
    if (r) return r;
  }
  const folded = fold(e.summary);
  for (const c of CITY_NAMES) {
    if (new RegExp(`(^|[^a-z])${c.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(folded)) return c.region;
  }
  return null;
}

type BotItem = { kind?: unknown; qty?: unknown; treatment?: unknown; width?: unknown; length?: unknown };

/** Minutes the visit takes, from the same items the bot sends to `quote`. */
export function visitMinutes(items: unknown): number {
  if (!Array.isArray(items) || !items.length) return 60;
  let total = 0;
  for (const raw of items as BotItem[]) {
    const qty = Math.max(1, Math.min(50, Math.floor(Number(raw?.qty) || 1)));
    const t = String(raw?.treatment ?? 'clean');
    const waterproof = /essencial|premium/.test(t);
    switch (raw?.kind) {
      case 'sofa': total += qty * (MINUTES.sofa + (waterproof ? MINUTES.waterproofing : 0)); break;
      case 'mattress': total += qty * (MINUTES.mattress + (waterproof ? MINUTES.waterproofing : 0)); break;
      case 'chairs': total += qty * MINUTES.chair + (waterproof ? MINUTES.waterproofing : 0); break;
      case 'rug':
      case 'carpet': {
        const m2 = Number(raw?.width) * Number(raw?.length);
        total += qty * (Number.isFinite(m2) && m2 > 0 ? m2 * MINUTES.rugPerM2 : 30);
        break;
      }
      default: total += 60;
    }
  }
  return Math.ceil(Math.max(MINUTES.minimum, total) / 15) * 15;
}

// ---------- Lisbon wall clock ----------

const lisbonParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Lisbon', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
});
export function lisbon(ms: number) {
  const p = Object.fromEntries(lisbonParts.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}
/** UTC ms of a Lisbon wall-clock time. */
export function lisbonToUtc(date: string, minutes: number): number {
  const [y, m, d] = date.split('-').map(Number);
  const wall = Date.UTC(y, m - 1, d, 0, minutes);
  let t = wall;
  for (let i = 0; i < 2; i++) {
    const l = lisbon(t);
    const [ly, lm, ld] = l.date.split('-').map(Number);
    t += wall - Date.UTC(ly, lm - 1, ld, 0, l.minutes);
  }
  return t;
}
const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const weekday = (date: string) => WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
/** "hoje (quarta)", "amanhã (quinta)", "sexta (dia 9)" — the owner's wording (replies 2.6, 6.11a). */
export function dayLabel(date: string, today: string): string {
  if (date === today) return `hoje (${weekday(date)})`;
  if (date === addDays(today, 1)) return `amanhã (${weekday(date)})`;
  return `${weekday(date)} (dia ${Number(date.slice(8))})`;
}
export const hourLabel = (minutes: number) => `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, '0') : ''}`;

// ---------- availability ----------

interface Busy { from: number; to: number; team: string | null; region: TeamZone | null }

function busyIntervals(events: AvailabilityEvent[]): Busy[] {
  const out: Busy[] = [];
  for (const e of events) {
    if (!e.start || String(e.status).toUpperCase() === 'CANCELLED') continue;
    const from = Date.parse(e.start);
    if (!Number.isFinite(from)) continue;
    const parsedEnd = e.end ? Date.parse(e.end) : NaN;
    const to = Number.isFinite(parsedEnd) && parsedEnd > from ? parsedEnd : from + 60 * 60_000;
    const team = eventTeam(e);
    if (team) { out.push({ from, to, team, region: null }); continue; }
    if (!SERVICE_LIKE.test(fold(e.summary))) continue; // the owner's own appointments do not busy a team
    const region = eventRegion(e);
    if (region) out.push({ from, to, team: null, region });
  }
  return out;
}

/** sameTime: another service of the same zone overlaps this visit (any team): the bot books it only with the owner. */
export interface Slot { date: string; minutes: number; label: string; time: string; teamsFree: string[]; nearOtherJob: boolean; sameTime: boolean }

function slotState(busy: Busy[], teams: readonly string[], region: TeamZone, from: number, to: number) {
  const margin = TRAVEL_MARGIN_MIN * 60_000;
  const overlaps = (b: Busy) => b.from < to + margin && b.to > from - margin;
  const overlapsFor = (t: string) => (b: Busy) => b.from < to + marginMs(t) && b.to > from - marginMs(t);
  const spare = (t: string) => capacity(t) - busy.filter(b => b.team === t && overlapsFor(t)(b)).length;
  // Before EARLIEST_HOUR only a team whose own hours start earlier (Porto 2 on weekdays) can take the job.
  const early = (t: string) => lisbon(from).minutes < teamEarliestMinutes(t, lisbon(from).date);
  const teamsFree = teams.filter(t => teamWorks(t, from, to) && !early(t) && spare(t) > 0);
  const unassigned = busy.filter(b => !b.team && b.region === region && overlaps(b)).length;
  const near = (t: string) => busy.some(b => b.team === t
    && ((from - b.to >= 0 && from - b.to <= 90 * 60_000) || (b.from - to >= 0 && b.from - to <= 90 * 60_000)));
  const room = teamsFree.reduce((n, t) => n + spare(t), 0);
  const sameTime = busy.some(b => (b.team ? TEAM_REGION.get(b.team) === region : b.region === region) && b.from < to && b.to > from);
  return { free: room - unassigned >= 1, teamsFree, nearOtherJob: teamsFree.some(near), nearTeams: teamsFree.filter(near), sameTime };
}

/**
 * Whether a team has no room left at this time (its own jobs, with the travel margin, against its
 * capacity). For a service the bot moves to another hour (owner, 16 Oct 2026: reschedules are the
 * bot's): the move keeps the event's team, so the zone having a free team is not enough.
 */
export function teamBusyAt(events: AvailabilityEvent[], team: string, startIso: string, endIso: string): boolean {
  const from = Date.parse(startIso), to = Date.parse(endIso);
  if (!Number.isFinite(from) || !(to > from)) return true;
  if (!teamWorks(team, from, to)) return true;
  const margin = marginMs(team);
  return busyIntervals(events).filter(b => b.team === team && b.from < to + margin && b.to > from - margin).length >= capacity(team);
}

/**
 * The team the bot books a job on (owner, 9 Oct 2026: on weekdays the bot closes
 * by itself "nas vagas que não estão ocupadas"): one with room at that time, the
 * one already working next to it that day first (less driving), then the one
 * with fewer jobs that day, then the region's order. null when none has room.
 */
export function chooseTeam(events: AvailabilityEvent[], city: unknown, startIso: string, endIso: string, waterproofing = false): string | null {
  const name = resolveBotCity(city);
  const area = name ? CITY_REGION.get(fold(name)) : undefined;
  if (!area) return null;
  const from = Date.parse(startIso), to = Date.parse(endIso);
  if (!Number.isFinite(from) || !(to > from)) return null;
  const busy = busyIntervals(events);
  const order = teamsFor(area, waterproofing);
  const st = slotState(busy, order, area, from, to);
  if (!st.free) return null;
  const day = lisbon(from).date;
  const jobsThatDay = (t: string) => busy.filter(b => b.team === t && lisbon(b.from).date === day).length;
  return [...st.teamsFree].sort((a, b) =>
    Number(st.nearTeams.includes(b)) - Number(st.nearTeams.includes(a))
    || jobsThatDay(a) - jobsThatDay(b)
    || order.indexOf(a) - order.indexOf(b))[0] ?? null;
}

export interface AvailabilityRequest {
  city?: unknown;
  items?: unknown;
  /** Overrides the minutes computed from the items. */
  durationMin?: unknown;
  /** YYYY-MM-DD: the client asked for this day (6.11a); both times on it. */
  date?: unknown;
  /** "15h", "15:00", "15h30": with `date`, is this exact time free? */
  time?: unknown;
  /** The owner gave this time himself (Algarve and his weekend picks). */
  ownerTime?: unknown;
  /** How many days to look ahead (default 4, max 14). */
  days?: unknown;
}

export type AvailabilityResult =
  | { error: string }
  | {
      city: string | null;
      region: TeamZone | null;
      teams: string[];
      durationMin: number;
      /** When set, no hours: the bot hands availability to the owner with this reason. */
      handToOwner: string | null;
      /** The two times to offer, in the owner's wording, or null. */
      suggestion: { text: string; slots: Slot[] } | null;
      /** start/end: the visit in UTC ISO, for the pre-booking (botHold.ts). */
      requested: { date: string; time: string; free: boolean; teamsFree: string[]; sameTime: boolean; start: string; end: string } | null;
      /** Every free start time per day, for a client who asks for another one. */
      free: Array<{ date: string; label: string; times: string[] }>;
      /** Far zone only: a booked service of ours is already there that day; same team, travel waived. */
      sharedTrip?: SharedTrip | null;
      /** The owner's rule for these days (DAY_RULES), when one is on for this zone. */
      dayRule?: string | null;
    };

/**
 * Far zones (EXTENDED_TRIP_CITIES): no free hours of their own, but when one of our booked
 * services is already in the same far zone in the next 14 days, the bot offers that day right
 * after it, same team, with the travel fee waived (owner, 19 Oct 2026: a 5-seat sofa in Santo
 * André went from 139€ to 119€ because Lisboa 1 was in Sines that Monday; "o bot tem de saber
 * ver estas situações"; confirmed: waive travel, far zones only, else hand to him as before).
 */
export interface SharedTrip { date: string; team: string; anchorEnd: string; anchorTime: string }
const FAR_ZONES: Array<{ cities: string[]; places: string[]; postal: [number, number] }> = [
  { cities: ['Alcácer do Sal', 'Grândola', 'Santiago do Cacém', 'Sines'],
    places: ['alcacer', 'grandola', 'santiago do cacem', 'sines', 'santo andre', 'comporta', 'troia', 'melides', 'porto covo', 'carvalhal'],
    postal: [7500, 7599] },
  { cities: ['Aveiro'], places: ['aveiro', 'ilhavo', 'gafanha', 'costa nova', 'barra'], postal: [3800, 3839] },
];
const farZoneOf = (city: string) => FAR_ZONES.find(z => z.cities.includes(city)) ?? null;
function inFarZone(e: AvailabilityEvent, zone: typeof FAR_ZONES[number]): boolean {
  const text = `${e.summary}\n${e.description}`;
  const postal = POSTAL.exec(text);
  if (postal) { const n = Number(postal[1]); return n >= zone.postal[0] && n <= zone.postal[1]; }
  const f = fold(e.summary);
  return zone.places.some(p => new RegExp(`(^|[^a-z])${p}([^a-z]|$)`).test(f));
}

function sharedTripAvailability(req: AvailabilityRequest, city: string, area: TeamZone | null, durationMin: number, events: AvailabilityEvent[], now: Date): AvailabilityResult {
  const empty = { city, region: area, teams: [] as string[], durationMin, suggestion: null, requested: null, free: [] as Array<{ date: string; label: string; times: string[] }>, sharedTrip: null };
  const zone = farZoneOf(city);
  const today = lisbon(now.getTime()).date;
  const last = addDays(today, MAX_DAYS - 1);
  const earliest = now.getTime() + LEAD_TIME_MIN * 60_000;
  const anchors = zone ? events
    .filter(e => e.start && e.end && String(e.status).toUpperCase() !== 'CANCELLED' && /^servico\b/.test(fold(e.summary)) && eventTeam(e) && inFarZone(e, zone))
    .map(e => ({ team: eventTeam(e)!, from: Date.parse(e.start!), to: Date.parse(e.end!) }))
    .filter(a => Number.isFinite(a.to) && a.to > now.getTime() && lisbon(a.from).date <= last)
    .sort((a, b) => a.from - b.from) : [];
  const onlyDay = typeof req.date === 'string' && DATE.test(req.date) ? req.date : null;
  const usable = anchors.filter(a => !onlyDay || lisbon(a.from).date === onlyDay);
  if (!usable.length) return { ...empty, handToOwner: 'Disponibilidade sob consulta (deslocação alargada): a data é do responsável' };

  const margin = TRAVEL_MARGIN_MIN * 60_000;
  const busyTeam = (team: string, from: number, to: number) =>
    teamBusyAt(events, team, new Date(from).toISOString(), new Date(to).toISOString());
  const trips = usable.map(a => {
    const date = lisbon(a.from).date;
    const startMin = Math.ceil((lisbon(a.to + margin).minutes) / 30) * 30;
    const slots: Slot[] = [];
    for (let m = Math.max(startMin, EARLIEST_HOUR * 60); m <= LAST_OFFER_HOUR * 60 && m + durationMin <= DAY_END_HOUR * 60; m += 30) {
      const from = lisbonToUtc(date, m);
      if (from < earliest || busyTeam(a.team, from, from + durationMin * 60_000)) continue;
      slots.push({ date, minutes: m, label: dayLabel(date, today), time: hourLabel(m), teamsFree: [a.team], nearOtherJob: true, sameTime: false });
    }
    return { a, date, slots };
  });
  const trip = trips.find(t => t.slots.length);
  const first = trip?.slots[0];
  const second = trip && first ? (trip.slots.find(s => s.minutes - first.minutes >= 180) ?? trip.slots.find(s => s.minutes - first.minutes >= 120) ?? trip.slots[1]) : undefined;
  const two = [first, second].filter((s): s is Slot => !!s);

  let requested: Extract<AvailabilityResult, { city: string | null }>['requested'] = null;
  let reqTrip = trip;
  if (req.time !== undefined) {
    const m = parseTime(req.time);
    if (m === null || !onlyDay) return { error: 'time precisa de date e de uma hora como "15h" ou "15:30"' };
    const from = lisbonToUtc(onlyDay, m), to = from + durationMin * 60_000;
    const inHours = m >= 7 * 60 && m + durationMin <= DAY_END_HOUR * 60 && from >= now.getTime();
    const fit = trips.find(t => !busyTeam(t.a.team, from, to)) ?? trips[0];
    reqTrip = fit;
    const free = inHours && !busyTeam(fit.a.team, from, to);
    requested = { date: onlyDay, time: hourLabel(m), free, teamsFree: free ? [fit.a.team] : [], sameTime: false,
      start: new Date(from).toISOString(), end: new Date(to).toISOString() };
  }
  const chosen = reqTrip ?? trips[0];
  const sharedTrip: SharedTrip = { date: chosen.date, team: chosen.a.team, anchorEnd: new Date(chosen.a.to).toISOString(), anchorTime: hourLabel(lisbon(chosen.a.from).minutes) };
  if (!two.length && !requested) return { ...empty, handToOwner: 'Disponibilidade sob consulta (deslocação alargada): a data é do responsável' };
  return {
    ...empty, teams: [sharedTrip.team],
    handToOwner: two.length ? null : 'Equipa na zona mas sem hora livre a seguir: o responsável confirma',
    suggestion: two.length ? { text: suggestionText(two), slots: two } : null,
    requested,
    free: trip ? [{ date: trip.date, label: dayLabel(trip.date, today), times: trip.slots.map(s => s.time) }] : [],
    sharedTrip,
  };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
export function parseTime(v: unknown): number | null {
  const m = /^(\d{1,2})(?:[:h](\d{2})?)?h?$/i.exec(String(v ?? '').trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2] ?? 0);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

function pickTwo(slots: Slot[], dayOrder: string[], onlyDay: string | null): Slot[] {
  // Hours with no other service in the zone first (owner, 9 Oct 2026: "sempre a horas diferentes").
  const clean = slots.filter(s => !s.sameTime);
  if (clean.length && clean.length < slots.length) {
    const two = pickTwo(clean, dayOrder, onlyDay);
    if (two.length >= 2) return two;
    const rest = pickTwo(slots.filter(s => s !== two[0]), dayOrder, onlyDay);
    return [two[0], rest[0]].filter((s): s is Slot => !!s).sort((x, y) => x.date.localeCompare(y.date) || x.minutes - y.minutes);
  }
  const days = onlyDay ? [onlyDay] : dayOrder;
  const byDay = days.map(d => slots.filter(s => s.date === d)).filter(list => list.length);
  if (!byDay.length) return [];
  const best = (list: Slot[]) => list.find(s => s.nearOtherJob) ?? list[0];
  const first = byDay[0];
  const a = best(first);
  const sameDay = first.filter(s => Math.abs(s.minutes - a.minutes) >= 180)
    .concat(first.filter(s => Math.abs(s.minutes - a.minutes) >= 120 && Math.abs(s.minutes - a.minutes) < 180));
  const b = sameDay.find(s => s.nearOtherJob) ?? sameDay[0] ?? (onlyDay ? undefined : byDay[1] && best(byDay[1]));
  return [a, b].filter((s): s is Slot => !!s).sort((x, y) => x.date.localeCompare(y.date) || x.minutes - y.minutes);
}

/** "amanhã (quinta) às 12h ou às 15h" / "amanhã (quinta) às 13h ou sexta (dia 9) às 9h". */
function suggestionText(slots: Slot[]): string {
  if (slots.length === 1) return `${slots[0].label} às ${slots[0].time}`;
  const [a, b] = slots;
  return a.date === b.date ? `${a.label} às ${a.time} ou às ${b.time}` : `${a.label} às ${a.time} ou ${b.label} às ${b.time}`;
}

export function botAvailability(req: AvailabilityRequest, events: AvailabilityEvent[], now: Date, rules: readonly DayRule[] = DAY_RULES): AvailabilityResult {
  const city = resolveBotCity(req?.city);
  const durationRaw = Number(req?.durationMin);
  const durationMin = Number.isFinite(durationRaw) && durationRaw >= 15 && durationRaw <= 600
    ? Math.ceil(durationRaw / 15) * 15
    : visitMinutes(req?.items);
  const base = { city, durationMin, suggestion: null, requested: null, free: [] as Array<{ date: string; label: string; times: string[] }> };

  if (req?.city !== undefined && typeof req.city !== 'string') return { error: 'city tem de ser texto' };
  if (!city) return { ...base, region: null, teams: [], handToOwner: 'Localidade fora da lista: confirmar com o responsável' };
  const area = CITY_REGION.get(fold(city));
  if (EXTENDED_TRIP_CITIES.has(city)) {
    if (req.date !== undefined && (typeof req.date !== 'string' || !DATE.test(req.date))) return { error: 'date tem de ser AAAA-MM-DD' };
    return sharedTripAvailability(req, city, area ?? null, durationMin, events, now);
  }
  if (!area) return { ...base, region: null, teams: [], handToOwner: 'Região sem equipa: confirmar com o responsável' };
  // Owner, 22 Oct 2026: "sempre que for algarve passa para mim para escolher horário". The bot
  // offers no hours there; it books only a time he gave.
  if (area === 'Algarve' && req.ownerTime !== true) return { ...base, region: area, teams: [...TEAMS_BY_REGION.Algarve], handToOwner: 'Algarve: o responsável escolhe o horário' };
  const teams = [...teamsFor(area, hasWaterproofing(req?.items))];

  const today = lisbon(now.getTime()).date;
  let onlyDay: string | null = null;
  if (req.date !== undefined) {
    if (typeof req.date !== 'string' || !DATE.test(req.date)) return { error: 'date tem de ser AAAA-MM-DD' };
    if (req.date < today) return { error: 'date já passou' };
    onlyDay = req.date;
  }
  const daysRaw = Math.floor(Number(req.days));
  const span = Number.isFinite(daysRaw) && daysRaw >= 1 ? Math.min(MAX_DAYS, daysRaw) : DEFAULT_DAYS;

  // The owner's rules for these days (DAY_RULES): a rule for the zone, or for the teams the job goes to.
  const active = req.ownerTime === true ? [] : rules.filter(r => r.from <= today && today <= r.until
    && (r.zone === area || teams.every(t => TEAMS_BY_REGION[r.zone].includes(t))));
  const closedAt = (date: string, m: number) => active.some(r => r.closed?.some(c => c.date === date && (c.fromHour === undefined || m < c.fromHour * 60)));
  const preferred = [...new Set(active.flatMap(r => r.prefer ?? []))].filter(d => d >= today && d <= addDays(today, MAX_DAYS - 1)).sort();
  const onlyPreferred = active.some(r => r.onlyPreferred);
  const ahead = Array.from({ length: span }, (_, i) => addDays(today, i));
  const dayOrder = onlyDay ? [onlyDay] : [...preferred, ...ahead.filter(d => !preferred.includes(d))];
  // A client who asks for a day the owner closed gets the preferred days instead.
  const scan = onlyDay ? [onlyDay, ...preferred.filter(d => d !== onlyDay)] : dayOrder;

  const busy = busyIntervals(events);
  const earliestToday = now.getTime() + LEAD_TIME_MIN * 60_000;
  const slots: Slot[] = [];
  for (const date of scan) {
    const label = dayLabel(date, today);
    const firstMinutes = Math.min(...teams.map(t => teamEarliestMinutes(t, date)));
    for (let m = firstMinutes; m <= LAST_OFFER_HOUR * 60 && m + durationMin <= DAY_END_HOUR * 60; m += 60) {
      const from = lisbonToUtc(date, m);
      if (from < earliestToday || closedAt(date, m)) continue;
      const st = slotState(busy, teams, area, from, from + durationMin * 60_000);
      if (st.free) slots.push({ date, minutes: m, label, time: hourLabel(m), teamsFree: st.teamsFree, nearOtherJob: st.nearOtherJob, sameTime: st.sameTime });
    }
  }

  let requested: { date: string; time: string; free: boolean; teamsFree: string[]; sameTime: boolean; start: string; end: string } | null = null;
  if (req.time !== undefined) {
    const m = parseTime(req.time);
    if (m === null || !onlyDay) return { error: 'time precisa de date e de uma hora como "15h" ou "15:30"' };
    const from = lisbonToUtc(onlyDay, m);
    const inHours = m >= 7 * 60 && m + durationMin <= DAY_END_HOUR * 60 && from >= now.getTime();
    const st = slotState(busy, teams, area, from, from + durationMin * 60_000);
    const open = inHours && !closedAt(onlyDay, m);
    requested = { date: onlyDay, time: hourLabel(m), free: open && st.free, teamsFree: open ? st.teamsFree : [], sameTime: st.sameTime,
      start: new Date(from).toISOString(), end: new Date(from + durationMin * 60_000).toISOString() };
  }

  // Which days are offered: the asked day (or, when the owner closed it, his preferred days);
  // without one, the preferred days first, or only them while they still have a time.
  let offerDays = dayOrder;
  if (onlyDay && !slots.some(s => s.date === onlyDay) && active.some(r => r.closed?.some(c => c.date === onlyDay))) offerDays = preferred;
  else if (!onlyDay && onlyPreferred && slots.some(s => preferred.includes(s.date))) offerDays = preferred;
  const offered = slots.filter(s => offerDays.includes(s.date));
  const two = pickTwo(offered, offerDays, offerDays.length === 1 ? offerDays[0] : null);
  const free = offerDays
    .map(date => ({ date, label: dayLabel(date, today), times: offered.filter(s => s.date === date).map(s => s.time) }))
    .filter(d => d.times.length);
  return {
    city, region: area, teams, durationMin,
    handToOwner: two.length ? null : 'Sem horas livres nos próximos dias: o responsável confirma a data',
    suggestion: two.length ? { text: suggestionText(two), slots: two } : null,
    requested,
    free,
    ...(active.length ? { dayRule: active.map(r => r.note).join(' ') } : {}),
  };
}
