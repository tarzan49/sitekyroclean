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
 *   Lisboa 1 and 2, Algarve); a time is free if at least one of them is free.
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
 * Aveiro and the Alentejo Litoral are "sob consulta", and Coimbra and Figueira
 * da Foz have no team calendar: those go to the owner, with no hours.
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

export const TEAMS_BY_REGION: Record<CrmLocality, readonly string[]> = {
  Porto: ['Porto 1', 'Porto 2'],
  Braga: ['Braga'],
  Lisboa: ['Lisboa 1', 'Lisboa 2'],
  Algarve: ['Algarve'],
};
const ALL_TEAMS = Object.values(TEAMS_BY_REGION).flat();
/** Jobs a team can do at the same time (owner, 9 Oct 2026: "a porto 1 tem duas pessoas e a lisboa 1 tem duas pessoas, que na mesma hora podem trabalhar ao mesmo tempo"). */
export const TEAM_CAPACITY: Readonly<Record<string, number>> = { 'Porto 1': 2, 'Lisboa 1': 2 };
const capacity = (team: string) => TEAM_CAPACITY[team] ?? 1;
const TEAM_REGION = new Map(Object.entries(TEAMS_BY_REGION).flatMap(([region, teams]) => teams.map(t => [t, region as CrmLocality] as const)));
const AREA_REGION: Record<string, CrmLocality | 'coimbra'> = {
  porto: 'Porto', braga: 'Braga', lisboa: 'Lisboa', algarve: 'Algarve', coimbra: 'coimbra',
};

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
export function eventRegion(e: AvailabilityEvent): CrmLocality | null {
  const text = `${e.summary}\n${e.description}`;
  const postal = POSTAL.exec(text);
  if (postal) {
    const r = localityFromPostalCode(postal[1]);
    if (r) return r;
  }
  const folded = fold(e.summary);
  for (const c of CITY_NAMES) {
    if (c.region === 'coimbra') continue;
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

interface Busy { from: number; to: number; team: string | null; region: CrmLocality | null }

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

function slotState(busy: Busy[], teams: readonly string[], region: CrmLocality, from: number, to: number) {
  const margin = TRAVEL_MARGIN_MIN * 60_000;
  const overlaps = (b: Busy) => b.from < to + margin && b.to > from - margin;
  const spare = (t: string) => capacity(t) - busy.filter(b => b.team === t && overlaps(b)).length;
  const teamsFree = teams.filter(t => spare(t) > 0);
  const unassigned = busy.filter(b => !b.team && b.region === region && overlaps(b)).length;
  const near = (t: string) => busy.some(b => b.team === t
    && ((from - b.to >= 0 && from - b.to <= 90 * 60_000) || (b.from - to >= 0 && b.from - to <= 90 * 60_000)));
  const room = teamsFree.reduce((n, t) => n + spare(t), 0);
  const sameTime = busy.some(b => (b.team ? TEAM_REGION.get(b.team) === region : b.region === region) && b.from < to && b.to > from);
  return { free: room - unassigned >= 1, teamsFree, nearOtherJob: teamsFree.some(near), nearTeams: teamsFree.filter(near), sameTime };
}

/**
 * The team the bot books a job on (owner, 9 Oct 2026: on weekdays the bot closes
 * by itself "nas vagas que não estão ocupadas"): one with room at that time, the
 * one already working next to it that day first (less driving), then the one
 * with fewer jobs that day, then the region's order. null when none has room.
 */
export function chooseTeam(events: AvailabilityEvent[], city: unknown, startIso: string, endIso: string): string | null {
  const name = resolveBotCity(city);
  const area = name ? CITY_REGION.get(fold(name)) : undefined;
  if (!area || area === 'coimbra') return null;
  const from = Date.parse(startIso), to = Date.parse(endIso);
  if (!Number.isFinite(from) || !(to > from)) return null;
  const busy = busyIntervals(events);
  const st = slotState(busy, TEAMS_BY_REGION[area], area, from, to);
  if (!st.free) return null;
  const day = lisbon(from).date;
  const jobsThatDay = (t: string) => busy.filter(b => b.team === t && lisbon(b.from).date === day).length;
  const order = TEAMS_BY_REGION[area];
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
  /** How many days to look ahead (default 4, max 14). */
  days?: unknown;
}

export type AvailabilityResult =
  | { error: string }
  | {
      city: string | null;
      region: CrmLocality | null;
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
    };

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

export function botAvailability(req: AvailabilityRequest, events: AvailabilityEvent[], now: Date): AvailabilityResult {
  const city = resolveBotCity(req?.city);
  const durationRaw = Number(req?.durationMin);
  const durationMin = Number.isFinite(durationRaw) && durationRaw >= 15 && durationRaw <= 600
    ? Math.ceil(durationRaw / 15) * 15
    : visitMinutes(req?.items);
  const base = { city, durationMin, suggestion: null, requested: null, free: [] as Array<{ date: string; label: string; times: string[] }> };

  if (req?.city !== undefined && typeof req.city !== 'string') return { error: 'city tem de ser texto' };
  if (!city) return { ...base, region: null, teams: [], handToOwner: 'Localidade fora da lista: confirmar com o responsável' };
  const area = CITY_REGION.get(fold(city));
  if (area === 'coimbra') return { ...base, region: null, teams: [], handToOwner: 'Coimbra e Figueira da Foz ainda não têm calendário de equipa: a disponibilidade é do responsável' };
  if (EXTENDED_TRIP_CITIES.has(city)) return { ...base, region: area ?? null, teams: [], handToOwner: 'Disponibilidade sob consulta (deslocação alargada): a data é do responsável' };
  if (!area) return { ...base, region: null, teams: [], handToOwner: 'Região sem equipa: confirmar com o responsável' };
  const teams = [...TEAMS_BY_REGION[area]];

  const today = lisbon(now.getTime()).date;
  let onlyDay: string | null = null;
  if (req.date !== undefined) {
    if (typeof req.date !== 'string' || !DATE.test(req.date)) return { error: 'date tem de ser AAAA-MM-DD' };
    if (req.date < today) return { error: 'date já passou' };
    onlyDay = req.date;
  }
  const daysRaw = Math.floor(Number(req.days));
  const span = Number.isFinite(daysRaw) && daysRaw >= 1 ? Math.min(MAX_DAYS, daysRaw) : DEFAULT_DAYS;
  const dayOrder = onlyDay ? [onlyDay] : Array.from({ length: span }, (_, i) => addDays(today, i));

  const busy = busyIntervals(events);
  const earliestToday = now.getTime() + LEAD_TIME_MIN * 60_000;
  const slots: Slot[] = [];
  for (const date of dayOrder) {
    const label = dayLabel(date, today);
    for (let m = EARLIEST_HOUR * 60; m <= LAST_OFFER_HOUR * 60 && m + durationMin <= DAY_END_HOUR * 60; m += 60) {
      const from = lisbonToUtc(date, m);
      if (from < earliestToday) continue;
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
    requested = { date: onlyDay, time: hourLabel(m), free: inHours && st.free, teamsFree: inHours ? st.teamsFree : [], sameTime: st.sameTime,
      start: new Date(from).toISOString(), end: new Date(from + durationMin * 60_000).toISOString() };
  }

  const two = pickTwo(slots, dayOrder, onlyDay);
  const free = dayOrder
    .map(date => ({ date, label: dayLabel(date, today), times: slots.filter(s => s.date === date).map(s => s.time) }))
    .filter(d => d.times.length);
  return {
    city, region: area, teams, durationMin,
    handToOwner: two.length ? null : 'Sem horas livres nos próximos dias: o responsável confirma a data',
    suggestion: two.length ? { text: suggestionText(two), slots: two } : null,
    requested,
    free,
  };
}
