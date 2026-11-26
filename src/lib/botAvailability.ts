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
 * - teams work every day until 21h, and the bot never offers before 9h (a client's own time from 8h) or after 18h;
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
import { CITY_COORDS, driveMinutes } from '../constants/cityCoords';
import { cities } from '../data/serviceCatalog';
import { EXTENDED_TRIP_CITIES } from '../constants/travel';
import { localityFromPostalCode, type TeamLocality } from './postalRegion';
import { botQuote, resolveBotCity } from './botQuote';

export interface AvailabilityEvent {
  summary: string;
  description: string;
  status: string;
  /** UTC ISO; null for all-day events, which never busy a team. */
  start: string | null;
  end: string | null;
}

/** The zones the bot books by: the CRM's four regions plus Coimbra, which the CRM counts as Porto. */
export type TeamZone = TeamLocality;
export const TEAMS_BY_REGION: Record<TeamZone, readonly string[]> = {
  Porto: ['Porto 1', 'Porto 2', 'Porto 3'],
  // Viana (owner, 18 Nov 2026, partner LigLav): cleanings in Viana do Castelo only (TOWN_TEAMS).
  Braga: ['Braga', 'Viana'],
  Lisboa: ['Lisboa 1'],
  Algarve: ['Algarve'],
  Coimbra: ['Coimbra'],
};
// Funchal 1 (WashElite, dono 18 Nov 2026): the Madeira is askWeek, the owner gives the hour; known by name only.
const ALL_TEAMS = [...Object.values(TEAMS_BY_REGION).flat(), 'Funchal 1'];
/**
 * Teams of one town (owner, 18 Nov 2026: "Eles são a equipa de Viana"): they take only the cleanings of that town,
 * and that town's cleanings go only to them (teamsForCity). teamsFor (the zone alone) never offers them.
 */
export const TOWN_TEAMS: Readonly<Record<string, string>> = { Viana: 'Viana do Castelo' };
/**
 * Backup teams (owner, 4 Nov 2026: "a denise fica como prioridade e o aleixo perde prioridade [...] apenas
 * passas lhe serviços se a denise estiver ocupada"): Porto 2 (Aleixo) takes a job only when Denise (Porto 3)
 * and the other teams of the zone cannot. Its free hours still count when the bot offers slots; `chooseTeam`
 * gives it the job last.
 */
export const BACKUP_TEAMS: ReadonlySet<string> = new Set(['Porto 2']);
/** A Porto cleaning goes to Porto 1 only after Porto 3 and Porto 2 (owner, 19 Nov 2026: "não como prioridade"). */
const backupRank = (t: string, waterproofing: boolean | 'premium' = false, day = '') =>
  t === 'Porto 1' && !waterproofing && day >= PORTO1_CLEANING_FROM ? 2 : BACKUP_TEAMS.has(t) ? 1 : 0;
/**
 * Waterproofing goes to another team in some zones (owner, 15 Oct 2026: "para já a equipa de
 * braga só fica com limpeza de estofos ao domicílio, a do porto fica com impermeabilizações
 * nessa zona"; "o porto por defeito é sempre porto 1"). A Guimarães waterproofing job had gone
 * to Braga and nobody turned up.
 */
export const WATERPROOFING_TEAMS: Partial<Record<TeamZone, readonly string[]>> = {
  // Owner, 28 Oct 2026: "se for limpeza passa para porto 3, se for imper ou imper e limpeza tem q ser porto 1".
  // Denise (Porto 3) covers cleanings only, so no waterproofing job goes to her.
  // Owner, 6 Nov 2026: Porto 1 closed, waterproofing goes to Porto 2 (from WATERPROOFING_FROM).
  Porto: ['Porto 1', 'Porto 2'],
  Braga: ['Porto 1', 'Porto 2'],
};
/** First day Porto 2 waterproofs in Porto and Braga (owner, 6 Nov 2026: "tudo que seja impermeabilização no Porto ou Braga, quarta-feira para a frente"). */
export const WATERPROOFING_FROM: Partial<Record<TeamZone, string>> = { Porto: '2026-11-11', Braga: '2026-11-11' };
/**
 * Porto cleanings below 200€ go to Porto 3 (Denise), then Porto 2 (Aleixo); Porto 1 only takes jobs
 * of 200€ or more (owner, 4 Nov 2026: "limpeza abaixo de 200 euros ficam para porto 3"; was 100€ on 31 Oct 2026). Waterproofing stays with Porto 1.
 */
export const PORTO1_MIN_TOTAL = 200;
/** Porto cleanings from this total go to Porto 1 too, last (owner, 19 Nov 2026: "limpezas acima de 135 euros [...] não como prioridade"). */
export const PORTO1_CLEANING_MIN_TOTAL = 135;
export const PORTO1_CLEANING_FROM = '2026-11-19';
/**
 * Porto 1 only takes Premium waterproofing or cleaning + waterproofing (owner, 4 Nov 2026; 3 Nov 2026: "NAO E PARA MARCARES MAIS SERVIÇOS PARA
 * PORTO 1 ABAIXO DE 130 EUROS, SO MARCAS PARA ELES IMPER PREMIUM"; "Limpezas nao marcas mais"). No
 * cleaning and no Essencial waterproofing goes to Porto 1; an Essencial waterproofing in Porto or Braga
 * has no team, so the owner decides.
 */
export const PORTO1_PREMIUM_ONLY_FROM = '2026-11-04';
/** From this day every Premium waterproofing in Porto and Braga goes to Porto 1, and only there (owner, 14 Nov 2026). */
export const PORTO1_ALL_PREMIUM_FROM = '2026-11-14';
/**
 * The only teams of a zone that pick up rugs (owner, 8 Nov 2026: "porto 3 pode recolher tapetes";
 * "e a unica equipa no porto q pode recolher"). A Porto pickup goes to Porto 3 or, when it cannot, to the owner.
 */
export const RUG_PICKUP_TEAMS: Partial<Record<TeamZone, readonly string[]>> = { Porto: ['Porto 3'] };
/** `waterproofing`: false, true (some tier) or 'premium' (a Premium item). `rugPickup`: the job has a rug pickup. */
/**
 * A zone whose jobs go to another team for now (owner, 13 Nov 2026: "o proximo serviço perto da marinha
 * grande/leiria coimbra marca para lisboa 1, tenho um serviço na marinha grande q fui obrigado a reagendar").
 * Lisboa 1 goes up for the rescheduled Marinha Grande job, so the next job of the Coimbra zone rides along.
 * Remove the entry when the owner says the zone goes back to its own team.
 */
export const ZONE_TEAM_OVERRIDE: Partial<Record<TeamZone, readonly string[]>> = {}; // Coimbra→Lisboa 1 retirada 16 Nov (era só para o serviço da Marinha Grande)
export const teamsFor = (zone: TeamZone, waterproofing: boolean | 'premium', total?: number | null, day?: string, rugPickup = false): readonly string[] => {
  if (ZONE_TEAM_OVERRIDE[zone]) return ZONE_TEAM_OVERRIDE[zone]!;
  const pickupTeams = rugPickup ? RUG_PICKUP_TEAMS[zone] : undefined;
  const teams = ((waterproofing && WATERPROOFING_TEAMS[zone]) || TEAMS_BY_REGION[zone])
    .filter(t => !TOWN_TEAMS[t])
    .filter(t => !pickupTeams || pickupTeams.includes(t))
    .filter(t => !TEAM_CLOSED_FROM[t] || (day && (day <= TEAM_CLOSED_FROM[t].date || (TEAM_CLOSED_FROM[t].reopen !== undefined && day >= TEAM_CLOSED_FROM[t].reopen!))))
    .filter(t => !(waterproofing && t === 'Porto 2' && day && WATERPROOFING_FROM[zone] && day < WATERPROOFING_FROM[zone]!));
  if (waterproofing === 'premium' && (zone === 'Porto' || zone === 'Braga') && day && day >= PORTO1_ALL_PREMIUM_FROM) return ['Porto 1'];
  // Owner, 19 Nov 2026 (Nelito agreed): Porto cleanings of 135€ or more may go to Porto 1, after Porto 3 and Porto 2.
  if (zone === 'Porto' && !waterproofing && day && day >= PORTO1_CLEANING_FROM && typeof total === 'number' && total >= PORTO1_CLEANING_MIN_TOTAL) return teams;
  if ((!day || day >= PORTO1_PREMIUM_ONLY_FROM) && waterproofing !== 'premium') return teams.filter(t => t !== 'Porto 1');
  if (zone === 'Porto' && !waterproofing && typeof total === 'number' && total < PORTO1_MIN_TOTAL) return teams.filter(t => t !== 'Porto 1');
  return teams;
};
/**
 * The waterproofing of the job for `teamsFor`: 'premium' (Porto 1 may take it) when an item is Premium or is cleaning
 * plus waterproofing (owner, 4 Nov 2026: "porto 1 fica apenas com imper + limpeza ou imper premium").
 */
export const PORTO1_CHAIRS_MIN_TOTAL = 130;
export function waterproofingKind(items: unknown, total?: number | null): boolean | 'premium' {
  // Owner, 14 Nov 2026: Porto 1 takes Premium waterproofing only (cleaning + Essencial is not Premium).
  // Owner, 15 Nov 2026: "imper para porto 1 so de 2 L para cima, cadeira q n sejam abaixo de 130 eur eles nao querem":
  // a Premium sofa of 2 seats or more, or Premium chairs in a job of 130€ or more; the rest goes to the other team.
  const porto1 = (i: { kind?: unknown; size?: unknown }) => i.kind === 'sofa' ? i.size !== '1-lugar'
    : i.kind === 'chairs' ? typeof total === 'number' && total >= PORTO1_CHAIRS_MIN_TOTAL : false;
  if (Array.isArray(items) && items.some(i => /premium/.test(String((i as { treatment?: unknown })?.treatment ?? '')) && porto1(i as { kind?: unknown; size?: unknown }))) return 'premium';
  return hasWaterproofing(items);
}
/**
 * Zones whose own team does not pick up rugs (owner, 27 Oct 2026: "a equipa de braga não faz recolha
 * de tapetes, apenas limpezas ao domicílio"). The bot had booked a rug pickup in Viana do Castelo on
 * Braga "sem me consultar". There the owner picks the team and the time: the bot offers no hours and
 * never closes the job, it stays a pre-booking (or "A confirmar") for him.
 */
export const NO_RUG_PICKUP_ZONES: ReadonlySet<TeamZone> = new Set<TeamZone>(['Braga']);
/** The zone of a served town, or of the postal code in an address; null when neither is known. */
export function cityZone(cityOrAddress: unknown): TeamZone | null {
  const name = resolveBotCity(cityOrAddress);
  const area = name ? CITY_REGION.get(fold(name)) : undefined;
  if (area) return area;
  const postal = typeof cityOrAddress === 'string' ? POSTAL.exec(cityOrAddress) : null;
  return postal ? zoneFromPostalCode(postal[1]) : null;
}
/** A rug pickup in a zone whose team does not do pickups: the reason it is the owner's, else null. */
export function rugPickupOwnerReason(cityOrAddress: unknown, rugPickup: boolean): string | null {
  if (!rugPickup) return null;
  const zone = cityZone(cityOrAddress);
  if (!zone || !NO_RUG_PICKUP_ZONES.has(zone)) return null;
  return `Recolha de tapetes na zona de ${zone}: a equipa ${TEAMS_BY_REGION[zone].filter(t => !TOWN_TEAMS[t]).join('/')} não faz recolhas, o responsável escolhe a equipa e a hora`;
}
/** The job includes waterproofing: an item with Essencial/Premium (the bot's `quote` items). */
export function hasWaterproofing(items: unknown): boolean {
  return Array.isArray(items) && items.some(i => /essencial|premium/.test(String((i as { treatment?: unknown })?.treatment ?? '')));
}
/** The job is waterproofing only (no item is cleaned): it may share an hour with another job (STAGGER_TEAMS). */
export function waterproofingOnly(items: unknown): boolean {
  return Array.isArray(items) && items.length > 0
    && items.every(i => /^(essencial|premium)$/.test(String((i as { treatment?: unknown })?.treatment ?? '')));
}
/**
 * Porto 1, Porto 2 and Lisboa 1 (owner, 27 Oct 2026): two cleaning jobs (cleaning, or cleaning with
 * waterproofing) start at least 1h30 apart; a cleaning and a waterproofing-only job, or two waterproofing-only
 * jobs, can be at the same hour. Replaces, for these teams, the capacity and the travel margin.
 */
export const STAGGER_TEAMS: ReadonlySet<string> = new Set(['Porto 1', 'Porto 2', 'Lisboa 1']);
export const CLEANING_GAP_MIN = 90;
/**
 * Days a staggered team works with one person only: one job at a time, with the travel margin. With `untilHour`,
 * only the jobs that start before that hour (Lisbon time); from it on the second person is back.
 */
export const SOLO_DAYS: ReadonlyArray<{ team: string; date: string; untilHour?: number }> = [
  // Owner, 31 Oct 2026: "lisboa 1 so vai ter 1 membro da equipa la na segunda pq o outro vai pro algarve".
  { team: 'Lisboa 1', date: '2026-11-02' },
  // Owner, 17 Nov 2026: "o joab diz q quinta so pode a partir do 12:00".
  { team: 'Lisboa 1', date: '2026-11-19', untilHour: 12 },
  // Owner, 25 Nov 2026: "amanhã só vai estar uma pessoa em Lisboa".
  { team: 'Lisboa 1', date: '2026-11-26' },
];
const staggers = (team: string, from: number) => {
  if (!STAGGER_TEAMS.has(team)) return false;
  const at = lisbon(from);
  return !SOLO_DAYS.some(d => d.team === team && d.date === at.date && (d.untilHour === undefined || at.minutes < d.untilHour * 60));
};
/**
 * Two-person teams with no gap between their jobs (owner, 13 Nov 2026, Joana 10h30 + Mariana 11h, both on
 * Lisboa 1: "tem capacidade para fazer um e outro serviço [...] praticamente à mesma hora"): each person
 * takes one, so two jobs of any kind can run at once, never three. Porto 1 and Porto 2 keep the 1h30.
 */
export const SAME_HOUR_TEAMS: ReadonlySet<string> = new Set(['Lisboa 1']);
export const SAME_HOUR_JOBS = 2;
const sameHour = (team: string, from: number) => SAME_HOUR_TEAMS.has(team) && staggers(team, from);
const ownOverlaps = (busy: { team: string | null; from: number; to: number }[], team: string, from: number, to: number) =>
  busy.filter(b => b.team === team && b.from < to && b.to > from).length;
const staggerClash = (b: { from: number; cleaning: boolean }, from: number, cleaning: boolean) =>
  cleaning && b.cleaning && Math.abs(b.from - from) < CLEANING_GAP_MIN * 60_000;
/** A calendar event that is waterproofing only (title says impermeabilização and no cleaning). */
export const eventWaterproofingOnly = (summary: string) => /impermeabiliz/.test(summary) && !/limpeza|lavagem|higieniz|anti-?acaros|desbacter/.test(summary);
/**
 * Jobs a team can do at the same time (owner, 9 Oct 2026: "a porto 1 tem duas pessoas e a lisboa 1 tem duas pessoas, que na mesma hora podem trabalhar ao mesmo tempo").
 * Porto 1 is back to one job at a time (owner, 27 Oct 2026: "não podes estar a marcar serviços de limpeza a cada uma hora, porque é
 * impossível eles fazerem"): with two, the bot chained cleanings at 10h, 11h, 12h… and the team ran late all day.
 */
export const TEAM_CAPACITY: Readonly<Record<string, number>> = {};
const capacity = (team: string) => TEAM_CAPACITY[team] ?? 1;
/**
 * The drive between two jobs of a team, when it is not TRAVEL_MARGIN_MIN. Porto 1 gets an hour on each side
 * (owner, 27 Oct 2026: "ou passas para o Porto 2, ou passas para uma hora em que seja possível"): a one-hour
 * cleaning at 10h leaves the next start at 12h at the earliest.
 */
export const TEAM_TRAVEL_MARGIN_MIN: Readonly<Record<string, number>> = {
  // Owner, 30 Oct 2026: in the Algarve the bot books "com pensamento sempre na logística de transporte":
  // Portimão to Tavira is ~1 h, so a job there leaves 45 min of road on each side, not 30.
  Algarve: 45,
};
const marginMs = (team: string | null) => (team && TEAM_TRAVEL_MARGIN_MIN[team] || TRAVEL_MARGIN_MIN) * 60_000;
/**
 * Teams whose gap between two jobs is the real drive between the two addresses (at least ROAD_MARGIN_MIN_MIN),
 * not the fixed margin (owner, 2 Nov 2026, Liliya in Tavira: with 45 min fixed, a free 10h-14h on the Algarve's
 * Tuesday gave "sem horas", although the 14h job was 10 minutes away).
 */
const ROAD_MARGIN_TEAMS: ReadonlySet<string> = new Set(['Algarve']);
const ROAD_MARGIN_MIN_MIN = 15;
/**
 * One-person teams whose next job must leave the drive between the two addresses PLUS the fixed margin (owner,
 * 16 Nov 2026, Joana: the bot offered Porto 3 Ovar at 11h with Vila Nova da Telha at 13h, 75 min for a ~65 min
 * drive, and the owner had to move her: "não vimos no horário a logística do serviço a seguir").
 */
const DRIVE_PLUS_MARGIN_TEAMS: ReadonlySet<string> = new Set(['Porto 3']);
const pairMarginMs = (team: string, b: { place: Place }, place: Place) =>
  ROAD_MARGIN_TEAMS.has(team) && b.place && place ? Math.max(ROAD_MARGIN_MIN_MIN, driveMinutes(b.place, place)) * 60_000 : marginMs(team);
/**
 * Weekday hours of a team that does not work the whole day; weekends are open as for any team. Porto 2 (Aleixo) works
 * Monday to Friday only in the morning (owner, 27 Oct 2026: "marca para Porto 2 a partir das 8 da manhã de segunda a
 * sexta até às 13 horas", "depois disso não consegue, só sábado e ao domingo"; Aleixo himself, 18 Oct: "melhor marcar
 * sempre pra cedo"). The job has to start and finish inside the window.
 */
export const TEAM_WEEKDAY_HOURS: Readonly<Record<string, { from: number; to: number }>> = { 'Porto 2': { from: 9, to: 13 } };
/**
 * Most jobs a team takes on one weekday. Porto 2 (Aleixo, audios of 4 Nov 2026): jobs "a partir das 9 e até meio-dia o
 * último" (he is done by 13h for his remote job), "no máximo um atendimento por dia, ou dois nesses horários".
 * Everything outside this goes to Porto 3.
 */
export const TEAM_MAX_JOBS_PER_WEEKDAY: Readonly<Record<string, number>> = { 'Porto 2': 2 };
const weekdayFull = (busy: { team?: string | null; from: number }[], team: string, from: number) => {
  const max = TEAM_MAX_JOBS_PER_WEEKDAY[team], day = lisbon(from).date;
  return max !== undefined && isWeekday(day) && busy.filter(b => b.team === team && lisbon(b.from).date === day).length >= max;
};
const isWeekday = (date: string) => { const d = new Date(`${date}T12:00:00Z`).getUTCDay(); return d >= 1 && d <= 5; };
/**
 * A team off for part of one day (the owner's instruction for the next days; past dates simply never match).
 * The job may not overlap the window [fromHour, untilHour) in Lisbon time.
 */
export interface TeamOff { team: string; date: string; fromHour?: number; untilHour?: number }
export const TEAM_OFF: readonly TeamOff[] = [
  // Owner, 18 Nov 2026: Joab says Lisboa 1 works Saturday (21/11) until 18h.
  { team: 'Lisboa 1', date: '2026-11-21', fromHour: 18 },
  // Owner, 28 Oct 2026: "amanha a tarde porto 1 n ta disponivel", "NAO ESTA DISPONIVEL PONTO": nothing from noon on (Juliana, 10h30-12h, stays).
  // Cleanings go to Porto 3, waterproofing is not booked.
  { team: 'Porto 1', date: '2026-10-29', fromHour: 12 },
  // Owner, 31 Oct 2026 at 01:30: "qualquer serviço q exista no porto para segunda tem q ser porto 2 ou 3 a fazer,
  // se for imper passa para o dia a seguir". Porto 1 is the only Porto team that waterproofs, so none on Monday.
  { team: 'Porto 1', date: '2026-11-02' },
  // Owner, 2 Nov 2026: "Porto 2 não pode hoje, ponto"; "a Porto 3 esta semana não vai trabalhar, pelo menos até eu dizer".
  { team: 'Porto 2', date: '2026-11-02' },
  // Owner, 3 Nov 2026: Laurinda's 4/11 cleaning "este é porto 3": Porto 3 works again from 4 Nov.
  ...['2026-11-02', '2026-11-03'].map(date => ({ team: 'Porto 3', date })),
  // Porto 2, 8 Nov 2026: no new jobs this week nor the next (does Tiago Resende on 10/11). Owner, 9 Nov: "bloqueia".
  ...Array.from({ length: 12 }, (_, i) => ({ team: 'Porto 2', date: `2026-11-${String(11 + i).padStart(2, '0')}` })),
  // Owner, 16 Nov 2026: "porto 3 n pode amanha de manha trabalhar, porto 2 tb n e porto 1 tb n so se for alguma imper".
  // Porto 1 only takes Premium waterproofing anyway; Porto 2 is already off.
  { team: 'Porto 3', date: '2026-11-17', untilHour: 13 },
  // Porto 3, 17 Nov 2026: "sexta eu já tenho um compromisso para o dia todo". Owner: "bloqueia".
  { team: 'Porto 3', date: '2026-11-20' },
  // Porto 3, 24 Nov 2026: "Sexta na parte da manhã não marque nada pra mim". Owner: "Ok, tranquilo".
  { team: 'Porto 3', date: '2026-11-27', untilHour: 13 },
];
/**
 * A team that no longer exists takes no job ending after this moment (Lisbon time). Owner, 6 Nov 2026: Porto 1 ends
 * at 20:00; its past services stay. It was the only team waterproofing in Porto and Braga, so those go to the owner.
 */
// Owner, 12 Nov 2026: Porto 1 is NOT reopened (the 11/11 reopening is undone): "Porto 1 só faz serviços que eu indicar,
// mais nada". The bot never offers or books it; the owner puts its services in the calendar himself.
// Owner, 14 Nov 2026: "Porto 1, a partir de agora fica com todas as impermeabilizações premium" (PORTO1_ALL_PREMIUM_FROM).
// It reopens for that only: teamsFor keeps it off every other job.
export const TEAM_CLOSED_FROM: Readonly<Record<string, { date: string; hour: number; reopen?: string }>> = { 'Porto 1': { date: '2026-11-06', hour: 20, reopen: '2026-11-14' } };
const closedAt = (team: string, from: number, to: number) => {
  const closed = TEAM_CLOSED_FROM[team];
  if (!closed || to <= lisbonToUtc(closed.date, closed.hour * 60)) return false;
  return !closed.reopen || from < lisbonToUtc(closed.reopen, 0);
};
const offAt = (team: string, from: number, to: number) => closedAt(team, from, to) || TEAM_OFF.some(o => {
  if (o.team !== team) return false;
  const a = lisbonToUtc(o.date, (o.fromHour ?? 0) * 60), b = lisbonToUtc(o.date, (o.untilHour ?? 24) * 60);
  return from < b && to > a;
});
/** Whether the team works over this whole visit (TEAM_WEEKDAY_HOURS, TEAM_OFF). */
export function teamWorks(team: string, from: number, to: number): boolean {
  if (offAt(team, from, to)) return false;
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
const MINUTES = { sofa: 60, armchair: 20, mattress: 45, chair: 10, rugPerM2: 4, waterproofing: 20, minimum: 45 };
/** Drive between two jobs of the same team. There is no maps API: a flat margin on each side. */
export const TRAVEL_MARGIN_MIN = 30;
/** Owner, 27 Oct 2026: "qualquer equipa trabalha depois das 8h, preferencialmente 9h". The bot offers from 9h; a time the client asks for is taken from 8h. */
export const EARLIEST_HOUR = 9;
export const WORK_FROM_HOUR = 8;
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
/**
 * Zones where the bot closes the service but books no hour (dono, 12 Nov 2026: "não podes fazer a marcação
 * neste momento para sítios como Funchal e Coimbra. Podes fechar o serviço e perguntar à pessoa que semana,
 * que dia lhe daria mais jeito, e dizes que vamos conferir no calendário"). Coimbra = the Coimbra team's zone
 * (Coimbra, Figueira da Foz; the Leiria towns are FRIDAY_ONLY_CITIES). Madeira is not a served town in the engine
 * (no travel fee, no team calendar yet): it is read from the client's text (Funchal, Madeira, 9000-9399).
 * Algarve since 18 Nov 2026 (dono: "No Algarve podes fechar, mas [...] nunca dizer horários no Algarve"): the
 * bot closes with the price and the full address, asks the week and the day, and he gives the hour.
 * A time the owner gave (`ownerTime`) is still booked.
 */
export const ASK_WEEK_ZONES: ReadonlySet<TeamZone | 'Madeira'> = new Set<TeamZone | 'Madeira'>(['Coimbra', 'Madeira', 'Algarve']);
/** Viana cleanings below this total ask the Viana team first (owner, 23 Nov 2026). */
export const VIANA_ASK_TEAM_BELOW = 100;
export const VIANA_ASK_TEAM_RULE = 'Viana do Castelo (limpezas abaixo de 100€): nunca dar horas sem perguntar primeiro à equipa de Viana (LigLav), a todas as pessoas, com a fotografia ou o vídeo do artigo, a dizer que é em Viana e a pedir a disponibilidade; a hora dada ao cliente é a que a equipa disser.';
/**
 * Owner, 19 Nov 2026 ("Nestas equipas (viana, funchal, leiria, coimbra) que nao podemos marcar sem avisar [...] tu tens
 * q perguntar a equipa (foto + detalhe do serviço + disponibilidade)"): these zones never get hours from the calendar;
 * the bot asks the team (perguntar_equipa) and the hour is the team's. Aveiro (owner, 19 Nov 2026: "Equipa Porto 3 OU Porto 2"): Denise first, then Aleixo.
 */
export type AskTeam = 'Viana' | 'Funchal' | 'Leiria' | 'Coimbra' | 'Aveiro' | 'Porto 1';
export const askTeamRule = (team: AskTeam) => team === 'Viana' ? VIANA_ASK_TEAM_RULE
  : `${team}: nunca dar horas sem perguntar primeiro à equipa de ${team}, com a fotografia ou o vídeo do artigo, o detalhe do serviço e a pedir a disponibilidade; a hora dada ao cliente é a que a equipa disser.`;
/**
 * Algarve only on Fridays (dono, 20 Nov 2026: "O Algarve é só sexta-feira, sempre que a pessoa sugerir outra data [...]
 * nesse dia já não temos disponibilidade, temos na próxima sexta-feira"): still no hours (the owner gives the hour),
 * but the bot never asks the week or the day; it offers the next Friday (`fridayOnly`).
 */
export const ALGARVE_FRIDAY_RULE = 'Algarve só às sextas-feiras. Não dês horas e nunca perguntes a semana nem o dia: fecha o serviço (preço e morada) e propõe a próxima sexta-feira (fridayOnly). Se a pessoa sugerir outro dia: "Nesse dia já não temos disponibilidade, temos na próxima sexta-feira, dia X." A hora confirmamos a seguir.';
export const ASK_WEEK_RULE = 'Não dês horas. Fecha o serviço (preço e morada) e pergunta que semana e que dia lhe dá mais jeito; diz que vamos conferir no calendário e confirmamos a seguir.';
const MADEIRA_PLACES = /(^|[^a-z])(funchal|madeira|camara de lobos|machico|canico|porto santo)([^a-z]|$)/;
/** The client's text names Madeira (never São João da Madeira, a Porto-area town). */
export function isMadeira(cityOrAddress: unknown): boolean {
  if (typeof cityOrAddress !== 'string') return false;
  const postal = POSTAL.exec(cityOrAddress);
  if (postal) { const n = Number(postal[1]); if (n >= 9000 && n <= 9399) return true; }
  return MADEIRA_PLACES.test(fold(cityOrAddress).replace(/s(ao|\.) joao da madeira/g, ''));
}

export const DAY_RULES: readonly DayRule[] = [
  // Owner, 23 Nov 2026 (Antónia): "não marques mais serviços para o Porto hoje, marca tudo amanhã ou para depois".
  { zone: 'Porto', from: '2026-11-23', until: '2026-11-23', closed: [{ date: '2026-11-23' }],
    note: 'Hoje (segunda, dia 23) já não temos vaga no Porto: oferece amanhã (terça, dia 24) ou depois.' },
  // Owner, 21 Nov 2026: "não marques mais serviços para domingo, para o Porto. Tenta marcar todos para a próxima semana".
  { zone: 'Porto', from: '2026-11-21', until: '2026-11-22', closed: [{ date: '2026-11-22' }], onlyPreferred: true,
    prefer: ['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28'],
    note: 'Domingo (dia 22) já não temos vaga no Porto: oferece a próxima semana, a partir de segunda (dia 23).' },
  // Owner, 18 Nov 2026: "nao enchas tanto quinta e sexta [...] amanha lisboa 1 ta mt cheio, mete para sexta e sabado mais para a tarde".
  { zone: 'Lisboa', from: '2026-11-18', until: '2026-11-21', prefer: ['2026-11-20', '2026-11-21'],
    note: 'Quinta (dia 19) a Lisboa 1 já está muito cheia: oferece primeiro sexta (dia 20) e sábado (dia 21), de preferência à tarde (sábado até às 18h). Quinta só se o cliente pedir.' },
  // Owner, 14 Nov 2026 at 23:55 (André, cadeiras): "n marques amanhã se n for lisboa, se for porto só segunda em porto 1".
  ...(['Porto', 'Braga', 'Coimbra', 'Algarve'] as const).map((zone): DayRule => ({
    zone, from: '2026-11-14', until: '2026-11-15', closed: [{ date: '2026-11-15' }],
    ...(zone === 'Porto' ? { prefer: ['2026-11-16'], onlyPreferred: true } : {}),
    note: zone === 'Porto' ? 'Domingo (dia 15) já não temos vaga no Porto: oferece segunda (dia 16).' : 'Domingo (dia 15) já não temos vaga: oferece outro dia.' })),
  // Owner, 26 Oct 2026 at night: "amanhã no Porto só te quero marcar serviços para quarta-feira".
  { zone: 'Porto', from: '2026-10-26', until: '2026-10-27', closed: [{ date: '2026-10-27' }], prefer: ['2026-10-28'], onlyPreferred: true,
    note: 'Terça (dia 27) já não temos vaga no Porto: oferece quarta (dia 28).' },
  // "E para Lisboa podes marcar para a parte da tarde, mas … principalmente serviços para quarta-feira".
  { zone: 'Lisboa', from: '2026-10-26', until: '2026-10-27', closed: [{ date: '2026-10-27', fromHour: 14 }], prefer: ['2026-10-28'],
    note: 'Terça (dia 27) em Lisboa só há vaga à tarde, a partir das 14h: oferece primeiro quarta (dia 28).' },
  // Owner, 31 Oct 2026 at 01:20: "em lisboa tenta fechar serviços para domingo e para segunda, amanha ja ta mt preenchido".
  { zone: 'Lisboa', from: '2026-10-31', until: '2026-11-02', prefer: ['2026-11-01', '2026-11-02'],
    note: 'Sábado (dia 31) em Lisboa já está muito preenchido: oferece primeiro domingo (dia 1) e segunda (dia 2).' },
  // Owner, 31 Oct 2026 at 01:30: "no porto fecha para domingo ou amanha de manha".
  { zone: 'Porto', from: '2026-10-31', until: '2026-11-01', closed: [{ date: '2026-10-31', fromHour: 13 }], prefer: ['2026-10-31', '2026-11-01'],
    note: 'Sábado (dia 31) no Porto só há vaga de manhã: oferece sábado de manhã ou domingo (dia 1). Na segunda a impermeabilização não se faz no Porto, só a partir de terça.' },
  // Owner, 2 Nov 2026: "AMANHA quero te a marcar serviços apenas para os restantes dias da semana, estao mt vazios".
  ...(['Porto', 'Lisboa', 'Braga', 'Coimbra'] as const).map((zone): DayRule => ({
    zone, from: '2026-11-03', until: '2026-11-03', onlyPreferred: true,
    prefer: ['2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'],
    note: 'Esta semana há mais vaga de quarta (dia 4) a domingo (dia 8): oferece primeiro esses dias.' })),
];

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const CITY_REGION = new Map(cities.map(c => [fold(c.name), AREA_REGION[c.area]] as const));
const CITY_PLACE = new Map(cities.filter(c => CITY_COORDS[c.name]).map(c => [fold(c.name), CITY_COORDS[c.name]] as const));
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

type BotItem = { kind?: unknown; qty?: unknown; size?: unknown; treatment?: unknown; width?: unknown; length?: unknown };

/** Minutes the visit takes, from the same items the bot sends to `quote`. */
export function visitMinutes(items: unknown): number {
  if (!Array.isArray(items) || !items.length) return 60;
  let total = 0;
  for (const raw of items as BotItem[]) {
    const qty = Math.max(1, Math.min(50, Math.floor(Number(raw?.qty) || 1)));
    const t = String(raw?.treatment ?? 'clean');
    const waterproof = /essencial|premium/.test(t);
    switch (raw?.kind) {
      case 'sofa': total += qty * ((/^1(-|$)/.test(String(raw?.size ?? '')) ? MINUTES.armchair : MINUTES.sofa) + (waterproof ? MINUTES.waterproofing : 0)); break;
      case 'mattress': total += qty * (MINUTES.mattress + (waterproof ? MINUTES.waterproofing : 0)); break;
      case 'chairs': total += qty * MINUTES.chair + (waterproof ? MINUTES.waterproofing : 0); break;
      case 'rug':
      case 'carpet': {
        const m2 = Number(raw?.width) * Number(raw?.length);
        total += qty * (Number.isFinite(m2) && m2 > 0 ? m2 * MINUTES.rugPerM2 : 30);
        break;
      }
      case 'armchair': total += qty * (MINUTES.armchair + (waterproof ? MINUTES.waterproofing : 0)); break;
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

interface Busy { from: number; to: number; team: string | null; region: TeamZone | null; cleaning: boolean; place: Place }
type Place = readonly [number, number] | null;
/** The served municipality named in an event (title first, then description), for travel time. */
/**
 * The town of a job: the city name that comes LAST in the title (titles end with the address's town), not the
 * first one found (owner, 2 Nov 2026: "Aldeamento Porto Dona Maria, Praia da Luz, 8600-123 Lagos" was read as
 * Porto, six hours of road on paper, and the Algarve's whole Tuesday showed "sem horas").
 */
function eventPlace(e: AvailabilityEvent): Place {
  for (const text of [fold(e.summary), fold(e.description ?? '')]) {
    let best: { at: number; key: string } | null = null;
    for (const c of CITY_NAMES) {
      const re = new RegExp(`(^|[^a-z])${c.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^a-z]|$)`, 'g');
      // By where the name ENDS, longer first on a tie: "Vila Real de Santo António" beats the "Santo António" inside it.
      for (const m of text.matchAll(re)) { const end = m.index + m[0].length; if (!best || end > best.at) best = { at: end, key: c.key }; }
    }
    if (best) return CITY_PLACE.get(best.key) ?? null;
  }
  return null;
}
const placeOf = (city: string | null | undefined): Place => (city ? CITY_PLACE.get(fold(city)) ?? null : null);
/**
 * Travel logistics (owner, 31 Oct 2026: "ter mais em conta as logísticas de viagem", "em serviços que são
 * mais longe ter tudo isso em conta"): a team's job right before or after this one, on the same day, must
 * leave the driving time between the two towns, not only the fixed margin. Unknown towns keep the margin.
 */
function travelClash(busy: Busy[], team: string, from: number, to: number, place: Place): boolean {
  // Two-person teams (STAGGER_TEAMS): the job next to this one can be the other person's.
  if (!place || staggers(team, from)) return false;
  return busy.some(b => {
    if (b.team !== team || !b.place || lisbon(b.from).date !== lisbon(from).date) return false;
    const drive = driveMinutes(b.place, place);
    if (DRIVE_PLUS_MARGIN_TEAMS.has(team)) {
      const need = (drive + TRAVEL_MARGIN_MIN) * 60_000;
      if (b.to <= from) return from - b.to < need;
      if (b.from >= to) return b.from - to < need;
      return false;
    }
    if (!ROAD_MARGIN_TEAMS.has(team) && drive * 60_000 <= marginMs(team)) return false; // the fixed margin already covers it
    const need = drive * 60_000;
    if (b.to <= from) return from - b.to < need;
    if (b.from >= to) return b.from - to < need;
    return false; // overlapping jobs are the team-capacity rules' business
  });
}

/**
 * A team's day stays in one area (owner, 26 Nov 2026: "Só havia uma pessoa em Lisboa e [...] todos os serviços
 * estavam a 50 km uns dos outros"; limit "30 min / 25 km"): a new job must be within DAY_MAX_ROAD_KM of road
 * from EVERY job that team already has that day, for every team (stagger teams included), except the Algarve,
 * whose weekly day covers the whole region. Unknown towns keep the other rules.
 */
const DAY_MAX_ROAD_KM = 25;
function tooFarFromDay(busy: Busy[], team: string, from: number, place: Place): boolean {
  if (!place || ROAD_MARGIN_TEAMS.has(team)) return false;
  const day = lisbon(from).date;
  return busy.some(b => b.team === team && !!b.place && lisbon(b.from).date === day && driveMinutes(b.place, place) - 10 > DAY_MAX_ROAD_KM);
}

function busyIntervals(events: AvailabilityEvent[]): Busy[] {
  const out: Busy[] = [];
  for (const e of events) {
    if (!e.start || String(e.status).toUpperCase() === 'CANCELLED') continue;
    const from = Date.parse(e.start);
    if (!Number.isFinite(from)) continue;
    const parsedEnd = e.end ? Date.parse(e.end) : NaN;
    const to = Number.isFinite(parsedEnd) && parsedEnd > from ? parsedEnd : from + 60 * 60_000;
    const team = eventTeam(e);
    const cleaning = !eventWaterproofingOnly(fold(e.summary));
    const place = eventPlace(e);
    if (team) { out.push({ from, to, team, region: null, cleaning, place }); continue; }
    if (!SERVICE_LIKE.test(fold(e.summary))) continue; // the owner's own appointments do not busy a team
    const region = eventRegion(e);
    if (region) out.push({ from, to, team: null, region, cleaning, place });
  }
  return out;
}

/** sameTime: another service of the same zone starts within the same hour (any team): the bot books it only with the owner. */
export interface Slot { date: string; minutes: number; label: string; time: string; teamsFree: string[]; nearOtherJob: boolean; sameTime: boolean }

function slotState(busy: Busy[], teams: readonly string[], region: TeamZone, from: number, to: number, cleaning = true, place: Place = null) {
  const margin = TRAVEL_MARGIN_MIN * 60_000;
  const overlaps = (b: Busy) => b.from < to + margin && b.to > from - margin;
  const overlapsFor = (t: string) => (b: Busy) => b.from < to + pairMarginMs(t, b, place) && b.to > from - pairMarginMs(t, b, place);
  const spare = (t: string) => sameHour(t, from)
    ? Math.max(0, SAME_HOUR_JOBS - ownOverlaps(busy, t, from, to))
    : staggers(t, from)
    ? (busy.some(b => b.team === t && staggerClash(b, from, cleaning)) ? 0 : 1)
    : capacity(t) - busy.filter(b => b.team === t && overlapsFor(t)(b)).length;
  // Before EARLIEST_HOUR only a team whose own hours start earlier (Porto 2 on weekdays) can take the job.
  const early = (t: string) => lisbon(from).minutes < Math.min(teamEarliestMinutes(t, lisbon(from).date), WORK_FROM_HOUR * 60);
  const teamsFree = teams.filter(t => teamWorks(t, from, to) && !early(t) && !weekdayFull(busy, t, from) && spare(t) > 0 && !travelClash(busy, t, from, to, place) && !tooFarFromDay(busy, t, from, place));
  const staggered = teams.every(t => STAGGER_TEAMS.has(t));
  const unassigned = busy.filter(b => !b.team && b.region === region
    && (teams.every(t => sameHour(t, from)) ? b.from < to && b.to > from : staggered ? staggerClash(b, from, cleaning) : overlaps(b))).length;
  const near = (t: string) => busy.some(b => b.team === t
    && ((from - b.to >= 0 && from - b.to <= 90 * 60_000) || (b.from - to >= 0 && b.from - to <= 90 * 60_000)));
  const room = teamsFree.reduce((n, t) => n + spare(t), 0);
  // "A mesma hora" is the same start hour, not any overlap (owner, 29 Oct 2026, Marlene: a 90-minute
  // waterproofing at 16h touched a Porto 1 cleaning at 17h, the bot read it as the same hour, left a
  // pre-booking and told the client "confirmamos-lhe ainda hoje"). Whether a team can take both is
  // the team rules' job above.
  // A job of a SAME_HOUR_TEAMS team with room is not "a mesma hora": the other person takes it (owner, 13 Nov 2026).
  const sameTime = busy.some(b => (b.team ? TEAM_REGION.get(b.team) === region : b.region === region) && Math.abs(b.from - from) < 60 * 60_000
    && !(b.team && sameHour(b.team, from) && teamsFree.includes(b.team)));
  return { free: room - unassigned >= 1, teamsFree, nearOtherJob: teamsFree.some(near), nearTeams: teamsFree.filter(near), sameTime };
}

/**
 * Whether a team has no room left at this time (its own jobs, with the travel margin, against its
 * capacity). For a service the bot moves to another hour (owner, 16 Oct 2026: reschedules are the
 * bot's): the move keeps the event's team, so the zone having a free team is not enough.
 */
export function teamBusyAt(events: AvailabilityEvent[], team: string, startIso: string, endIso: string, cleaning = true, city?: string): boolean {
  const from = Date.parse(startIso), to = Date.parse(endIso);
  if (!Number.isFinite(from) || !(to > from)) return true;
  if (!teamWorks(team, from, to)) return true;
  if (weekdayFull(busyIntervals(events).filter(b => !(b.from < to && b.to > from)), team, from)) return true;
  const place = placeOf(resolveBotCity(city)) ?? (city ? eventPlace({ summary: city, description: '' } as AvailabilityEvent) : null);
  const others = busyIntervals(events).filter(b => !(b.from === from && b.to === to));
  if (travelClash(busyIntervals(events), team, from, to, place) || tooFarFromDay(others, team, from, place)) return true;
  if (sameHour(team, from)) return ownOverlaps(busyIntervals(events), team, from, to) >= SAME_HOUR_JOBS;
  if (staggers(team, from)) return busyIntervals(events).some(b => b.team === team && staggerClash(b, from, cleaning));
  const margin = marginMs(team);
  return busyIntervals(events).filter(b => b.team === team && b.from < to + margin && b.to > from - margin).length >= capacity(team);
}

/**
 * A booked service moved to a day its team no longer takes that job (owner, 3 Nov 2026, Laurinda: a mattress
 * cleaning on Porto 1, moved to Thursday 5/11, when Porto 1 only does Premium waterproofing). The job is read from
 * the event: waterproofing with no tier written counts as Premium, so only a clear case changes the team.
 */
function eventJob(e: Pick<AvailabilityEvent, 'summary' | 'description'>): { waterproofing: boolean | 'premium'; total: number | null; rugPickup: boolean } {
  // "(sem impermeabilização)" is a cleaning only (owner, 19 Nov 2026, Rute: read as Premium, the cleaning went to Porto 1).
  const text = `${e.summary}\n${e.description ?? ''}`.replace(/\(?\s*sem\s+impermeabiliza[cç][aã]o\s*\)?/gi, '');
  const waterproofing = /imperm/i.test(text) ? (/essencial/i.test(text) && !/premium/i.test(text) ? true : 'premium') : false;
  const total = /\((\d+(?:[.,]\d+)?)\s*€\)/.exec(e.summary)?.[1];
  return { waterproofing, total: total ? Number(total.replace(',', '.')) : null, rugPickup: /recolh/i.test(text) };
}
const zoneOfTeam = (team: string) => (Object.keys(TEAMS_BY_REGION) as TeamZone[]).find(z => TEAMS_BY_REGION[z].includes(team)) ?? null;

/** The team still takes this event's job on the day of `startIso`. */
export function teamTakesJob(team: string, e: Pick<AvailabilityEvent, 'summary' | 'description'>, startIso: string): boolean {
  const zone = zoneOfTeam(team);
  if (!zone) return true;
  const { waterproofing, total, rugPickup } = eventJob(e);
  if (TOWN_TEAMS[team]) return !waterproofing && !rugPickup;
  return teamsFor(zone, waterproofing, total, lisbon(Date.parse(startIso)).date, rugPickup).includes(team);
}

/** Another team of the same zone that takes the job that day and is free then; the backup team last. null: none. */
export function replacementTeam(events: AvailabilityEvent[], team: string, e: Pick<AvailabilityEvent, 'summary' | 'description'>, startIso: string, endIso: string, cleaning = true): string | null {
  const zone = zoneOfTeam(team);
  if (!zone || TOWN_TEAMS[team]) return null;
  const { waterproofing, total, rugPickup } = eventJob(e);
  return [...teamsFor(zone, waterproofing, total, lisbon(Date.parse(startIso)).date, rugPickup)]
    .filter(t => t !== team && !teamBusyAt(events, t, startIso, endIso, cleaning, e.summary))
    .sort((a, b) => backupRank(a, waterproofing, lisbon(Date.parse(startIso)).date) - backupRank(b, waterproofing, lisbon(Date.parse(startIso)).date))[0] ?? null;
}

/**
 * The team the bot books a job on (owner, 9 Oct 2026: on weekdays the bot closes
 * by itself "nas vagas que não estão ocupadas"): one with room at that time, the
 * one already working next to it that day first (less driving), then the one
 * with fewer jobs that day, then the region's order. null when none has room.
 */
export function chooseTeam(events: AvailabilityEvent[], city: unknown, startIso: string, endIso: string, waterproofing: boolean | 'premium' = false, cleaning = true, total?: number | null, rugPickup = false): string | null {
  const name = resolveBotCity(city);
  const area = name ? CITY_REGION.get(fold(name)) : undefined;
  if (!area) return null;
  const from = Date.parse(startIso), to = Date.parse(endIso);
  if (!Number.isFinite(from) || !(to > from)) return null;
  const busy = busyIntervals(events);
  const order = teamsForCity(name, area, waterproofing, total, lisbon(from).date, rugPickup);
  const place = placeOf(name);
  const st = slotState(busy, order, area, from, to, cleaning, place);
  if (!st.free) return null;
  const day = lisbon(from).date;
  const jobsThatDay = (t: string) => busy.filter(b => b.team === t && lisbon(b.from).date === day).length;
  // The team already working closest to this town that day drives least.
  const closest = (t: string) => Math.min(Infinity, ...busy.filter(b => b.team === t && b.place && place && lisbon(b.from).date === day).map(b => driveMinutes(b.place!, place!)));
  return [...st.teamsFree].sort((a, b) =>
    backupRank(a, waterproofing, day) - backupRank(b, waterproofing, day)
    || Number(st.nearTeams.includes(b)) - Number(st.nearTeams.includes(a))
    || (Number.isFinite(closest(a)) && Number.isFinite(closest(b)) ? closest(a) - closest(b) : 0)
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
  /** The owner gave this time himself (askWeek zones, the Algarve included, and his weekend picks). */
  ownerTime?: unknown;
  /** true: the client wants the rugs picked up (in NO_RUG_PICKUP_ZONES the owner decides; in Porto only RUG_PICKUP_TEAMS). */
  rugPickup?: unknown;
  /** How many days to look ahead (default 4, max 14). */
  days?: unknown;
  /** The order total in euros (from the quote); computed from items and city when missing. */
  total?: unknown;
}

/**
 * Cities with no one fixed there yet (owner, 29 Oct 2026: "quando é viana do castelo só dizes horas
 * certas se o pedido for acima de 120 eur [...] margem de erro de 10 eur [...] leiria, alentejo"):
 * below 110€ (120€ less his 10€ margin) the bot offers no hours and says we check availability.
 * The Alentejo Litoral is already in EXTENDED_TRIP_CITIES.
 */
export const SMALL_ORDER_CITIES: ReadonlySet<string> = new Set(['Aveiro']); // Viana do Castelo: sem horas desde 18 Nov (equipa Viana)
/**
 * Leiria tier (owner, 16 Nov 2026: "a regra neste funil e marcar para sexta feira e fechar a cliente de qualquer
 * forma"): any amount, the bot gives hours only on the next Friday (Coimbra team) and closes; no askWeek, no minimum.
 */
export const FRIDAY_ONLY_CITIES: ReadonlySet<string> = new Set(['Leiria', 'Batalha', 'Marinha Grande', 'Porto de Mós', 'Ourém', 'Fátima', 'Pombal', 'Alcobaça', 'Nazaré']);
/**
 * Waterproofing the bot closes without an hour (owner, 18 Nov 2026: "no Funchal, impermeabilizações, também vamos
 * ter que ter cuidado. E em Viana e Leiria também"): askWeek, he picks the day and the team. The Funchal is
 * askWeek for every job already (isMadeira). Cleanings in these towns keep their rule (Viana: Braga team from
 * NORTH_MIN_TOTAL; Leiria zone: next Friday, Coimbra team).
 */
export const WATERPROOFING_ASK_WEEK_CITIES: ReadonlySet<string> = new Set([...FRIDAY_ONLY_CITIES]);
/** Waterproofing in the north: no hours from the engine, the owner approves them with the team (owner, 18 Nov 2026). */
export const NORTH_WATERPROOFING_ASK_WEEK_REGIONS: ReadonlySet<string> = new Set(['Porto', 'Braga']);
export const NORTH_WATERPROOFING_ASK_WEEK_FROM = '2026-11-18';
/** Leiria-zone waterproofing goes to Lisboa 1 (owner, 18 Nov 2026: "Impermeabilizações de Leiria, tentar juntar a sempre Lisboa 1"). */
export const LEIRIA_WATERPROOFING_TEAMS: readonly string[] = ['Lisboa 1'];
/** teamsFor, with the town's own team where the owner set one (LEIRIA_WATERPROOFING_TEAMS). */
export function teamsForCity(city: string | null, zone: TeamZone, waterproofing: boolean | 'premium', total?: number | null, day?: string, rugPickup = false): readonly string[] {
  if (waterproofing && city && FRIDAY_ONLY_CITIES.has(city)) return LEIRIA_WATERPROOFING_TEAMS;
  const townTeam = city ? Object.keys(TOWN_TEAMS).find(t => TOWN_TEAMS[t] === city) : undefined;
  // Owner, 23 Nov 2026: Viana cleanings from 100€ go to the Braga team (its calendar, real hours); below, the Viana team.
  const bigViana = townTeam === 'Viana' && typeof total === 'number' && total >= VIANA_ASK_TEAM_BELOW;
  if (townTeam && !waterproofing && !rugPickup && !bigViana) return [townTeam];
  if (bigViana && !waterproofing && !rugPickup) return teamsFor(zone, waterproofing, total, day, rugPickup).filter(t => t !== 'Viana');
  return teamsFor(zone, waterproofing, total, day, rugPickup);
}
function nextFriday(now: Date): string {
  const today = lisbon(now.getTime()).date;
  const d = new Date(`${today}T12:00:00Z`);
  do d.setUTCDate(d.getUTCDate() + 1); while (d.getUTCDay() !== 5);
  return d.toISOString().slice(0, 10);
}
/** Algarve week swapped to another day (dono, 21 Nov 2026: a equipa vai ao Algarve na quinta 26/11, só essa semana). */
export const ALGARVE_DAY_OVERRIDE: Readonly<Record<string, string>> = { '2026-11-27': '2026-11-26' };
function nextAlgarveDay(now: Date): string {
  const today = lisbon(now.getTime()).date;
  const friday = nextFriday(now);
  const swapped = ALGARVE_DAY_OVERRIDE[friday];
  return swapped && swapped > today ? swapped : friday;
}
export const SMALL_ORDER_MIN_TOTAL = 110;
/** Per-city minimum where it differs (owner, 3 Nov 2026: "o mínimo de Viana são 100 eur"). */
// Owner, 15 Nov 2026: "tudo a norte que forem orçamento de valor igual ou superior a 79 eur tens que dar sempre disponibilidade".
export const NORTH_MIN_TOTAL = 79;
const SMALL_ORDER_MIN_BY_CITY: Readonly<Record<string, number>> = { 'Aveiro': NORTH_MIN_TOTAL };
function orderTotal(req: AvailabilityRequest, city: string): number | null {
  const given = Number(req.total);
  if (req.total !== undefined && Number.isFinite(given)) return given;
  if (!Array.isArray(req.items) || !req.items.length) return null;
  const q = botQuote({ items: req.items, city }) as { ok: boolean; total?: number | null; rugEstimate?: { total?: number | null } | null };
  if (!q.ok) return null;
  if (typeof q.total === 'number') return q.total;
  return typeof q.rugEstimate?.total === 'number' ? q.rugEstimate.total : null;
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
      /** ASK_WEEK_ZONES: no hours; close the service and ask the client's week and day (askWeekRule). */
      askWeek?: true;
      askWeekRule?: string;
      /** Algarve (dono, 20 Nov 2026): the only day on offer, the next Friday (AAAA-MM-DD). */
      fridayOnly?: string;
      /** Owner, 18 Nov: ask this team its availability (photo/video of the item + town) before any hour. */
      askTeam?: AskTeam;
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

/**
 * Concelhos of the Coimbra district (owner, 23 Nov 2026: Tábua, Vitor, fell into "Localidade fora da lista" with no
 * askTeam). Same treatment as Coimbra (askTeam 'Coimbra'). Since 24 Nov they are in locationPrices and `cities`
 * (15€/20€ by distance to Coimbra); this list only catches the short names (Condeixa, Poiares) and spellings that
 * resolveBotCity misses. Mortágua is Viseu, Mealhada Aveiro: not here.
 */
export const COIMBRA_DISTRICT_NO_FEE = ['Tábua', 'Oliveira do Hospital', 'Arganil', 'Lousã', 'Miranda do Corvo', 'Penacova',
  'Condeixa-a-Nova', 'Condeixa', 'Cantanhede', 'Mira', 'Montemor-o-Velho', 'Soure', 'Penela', 'Góis', 'Pampilhosa da Serra',
  'Vila Nova de Poiares', 'Poiares'] as const;
export function coimbraDistrictTown(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const t = ` ${input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]+/g, ' ')} `;
  return COIMBRA_DISTRICT_NO_FEE.find(n => t.includes(` ${n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]+/g, ' ')} `)) ?? null;
}

export function botAvailability(req: AvailabilityRequest, events: AvailabilityEvent[], now: Date, rules: readonly DayRule[] = DAY_RULES): AvailabilityResult {
  const city = resolveBotCity(req?.city);
  const durationRaw = Number(req?.durationMin);
  const durationMin = Number.isFinite(durationRaw) && durationRaw >= 15 && durationRaw <= 600
    ? Math.ceil(durationRaw / 15) * 15
    : visitMinutes(req?.items);
  const base = { city, durationMin, suggestion: null, requested: null, free: [] as Array<{ date: string; label: string; times: string[] }> };

  if (req?.city !== undefined && typeof req.city !== 'string') return { error: 'city tem de ser texto' };
  // Owner, 12 Nov 2026: Coimbra and Madeira (Funchal) close the service without an hour; the Algarve too since 18 Nov.
  if (req.ownerTime !== true && isMadeira(req.city) && ASK_WEEK_ZONES.has('Madeira')) {
    return { ...base, city: null, region: null, teams: [], handToOwner: askTeamRule('Funchal'), askWeek: true, askWeekRule: ASK_WEEK_RULE, askTeam: 'Funchal' };
  }
  if (!city) {
    const town = coimbraDistrictTown(req?.city);
    if (town && req.ownerTime !== true) return { ...base, city: town, region: 'Coimbra', teams: [], handToOwner: askTeamRule('Coimbra'), askWeek: true, askWeekRule: ASK_WEEK_RULE, askTeam: 'Coimbra' };
    return { ...base, region: null, teams: [], handToOwner: 'Localidade fora da lista: confirmar com o responsável' };
  }
  const area = CITY_REGION.get(fold(city));
  // Owner, 15 Nov 2026: only the Alentejo Litoral is his (the Algarve is askWeek since 18 Nov); Aveiro (Porto team) gets hours like the north.
  if (EXTENDED_TRIP_CITIES.has(city) && city !== 'Aveiro') {
    if (req.date !== undefined && (typeof req.date !== 'string' || !DATE.test(req.date))) return { error: 'date tem de ser AAAA-MM-DD' };
    return sharedTripAvailability(req, city, area ?? null, durationMin, events, now);
  }
  if (!area) return { ...base, region: null, teams: [], handToOwner: 'Região sem equipa: confirmar com o responsável' };
  const fridayDone = (req as { _friday?: unknown })._friday === true;
  // Owner, 18 Nov 2026: waterproofing in Viana do Castelo and the Leiria zone closes without an hour; he picks
  // the day and the team (Leiria's goes to Lisboa 1).
  // Owner, 18 Nov 2026 ("Em Viana, não podes dar disponibilidades sem perguntar primeiro à equipa"): every
  // job in Viana do Castelo closes without an hour; the Viana team (LigLav) is asked first, with the photo or
  // video of the item, that it is in Viana, and its availability. The hour comes from the team.
  // Owner, 22 Nov 2026 (Rosângela): "não é a LigLav que faz impermeabilizações", "porto 1, não tens que perguntar":
  // waterproofing in Viana goes to Porto 1 with hours like Braga; only the cleanings ask the Viana team.
  // Owner, 23 Nov 2026: only Viana cleanings below 100€ ask the team first; from 100€ they get real hours (same day allowed).
  const vianaTotal = city === 'Viana do Castelo' ? orderTotal(req, city) : null;
  if (req.ownerTime !== true && city === 'Viana do Castelo' && !hasWaterproofing(req.items) && (vianaTotal === null || vianaTotal < VIANA_ASK_TEAM_BELOW)) {
    const total = vianaTotal;
    // The Viana team takes the cleanings (owner, 18 Nov 2026: "Sem horas, confirmo eu"); waterproofing keeps the Porto teams.
    return { ...base, region: area, teams: [...teamsForCity(city, area, waterproofingKind(req.items, total), total, addDays(lisbon(now.getTime()).date, 1))],
      handToOwner: VIANA_ASK_TEAM_RULE,
      askWeek: true, askWeekRule: ASK_WEEK_RULE, askTeam: 'Viana' };
  }
  // Owner, 23 Nov 2026: Porto 1 waterproofing in the Braga zone and Viana asks Manel first (photo + detail +
  // availability, askTeam 'Porto 1'); the hour is his, tomorrow at the earliest. Other teams there: hours from tomorrow.
  if (req.ownerTime !== true && (area === 'Braga' || city === 'Viana do Castelo') && hasWaterproofing(req.items)) {
    const total = orderTotal(req, city);
    const day = typeof req.date === 'string' && DATE.test(req.date) ? req.date : addDays(lisbon(now.getTime()).date, 1);
    const teams = [...teamsForCity(city, area, waterproofingKind(req.items, total), total, day)];
    if (teams[0] === 'Porto 1') return { ...base, region: area, teams, handToOwner: askTeamRule('Porto 1'), askWeek: true, askWeekRule: ASK_WEEK_RULE, askTeam: 'Porto 1' };
  }
  // Owner, 22 Nov 2026 (Roberto): "tu podes marcar na mesma uma hora e eu aprovo a hora final": Porto and Braga
  // waterproofing get hours like any other job (the 18 Nov askWeek rule is retired); he approves on the calendar.
  // Aveiro (owner, 19 Nov 2026: "Serviços em aveiro tb precisamos de saber a disponibilidade" + "Equipa Porto 3"): the
  // cleanings close without an hour; Porto 3 (Denise) is asked, and Porto 2 (Aleixo) if she can't (kyro-bot
  // TEAM_ASK_FALLBACK). Waterproofing stays with the north rule above.
  if (req.ownerTime !== true && city === 'Aveiro') {
    return { ...base, region: area, teams: ['Porto 3', 'Porto 2'], handToOwner: askTeamRule('Aveiro'), askWeek: true, askWeekRule: ASK_WEEK_RULE, askTeam: 'Aveiro' };
  }
  // Owner, 23 Nov 2026 (correction): the Leiria zone never gets hours. Waterproofing (Lisboa 1) never asks the team:
  // the owner gives the hour (askWeek); cleanings ask the Leiria team.
  if (req.ownerTime !== true && WATERPROOFING_ASK_WEEK_CITIES.has(city) && hasWaterproofing(req.items)) {
    const total = orderTotal(req, city);
    const teams = [...teamsForCity(city, area, waterproofingKind(req.items, total), total, addDays(lisbon(now.getTime()).date, 1))];
    return { ...base, region: area, teams,
      handToOwner: `Impermeabilização em ${city}: o dono escolhe o dia e a equipa no calendário${FRIDAY_ONLY_CITIES.has(city) ? `; equipa ${LEIRIA_WATERPROOFING_TEAMS.join('/')}` : ''}`,
      askWeek: true, askWeekRule: ASK_WEEK_RULE };
  }
  if (req.ownerTime !== true && FRIDAY_ONLY_CITIES.has(city)) {
    return { ...base, region: area, teams: [...(ZONE_TEAM_OVERRIDE[area] ?? TEAMS_BY_REGION[area])],
      handToOwner: askTeamRule('Leiria'), askWeek: true, askWeekRule: ASK_WEEK_RULE, askTeam: 'Leiria' };
  }
  if (req.ownerTime !== true && !fridayDone && FRIDAY_ONLY_CITIES.has(city)) {
    const friday = typeof req.date === 'string' && DATE.test(req.date) && new Date(`${req.date}T12:00:00Z`).getUTCDay() === 5 && req.date > lisbon(now.getTime()).date ? req.date : nextFriday(now);
    return botAvailability({ ...req, date: friday, _friday: true } as AvailabilityRequest, events, now, rules);
  }
  if (req.ownerTime !== true && area === 'Algarve') {
    const friday = nextAlgarveDay(now);
    const dayName = new Date(`${friday}T12:00:00Z`).getUTCDay() === 4 ? 'quinta-feira' : 'sexta-feira';
    return { ...base, region: area, teams: [...(ZONE_TEAM_OVERRIDE[area] ?? TEAMS_BY_REGION[area])],
      handToOwner: `Algarve: só ${dayName} (${friday.slice(8, 10)}/${friday.slice(5, 7)}); o dono confirma a hora no calendário`,
      askWeek: true, askWeekRule: dayName === 'sexta-feira' ? ALGARVE_FRIDAY_RULE : ALGARVE_FRIDAY_RULE.split('sextas-feiras').join('quintas-feiras (só esta semana)').split('sexta-feira').join('quinta-feira'), fridayOnly: friday };
  }
  if (req.ownerTime !== true && !fridayDone && ASK_WEEK_ZONES.has(area)) {
    const override = ZONE_TEAM_OVERRIDE[area];
    return { ...base, region: area, teams: [...(override ?? TEAMS_BY_REGION[area])],
      handToOwner: area === 'Coimbra' ? askTeamRule('Coimbra') : `${area}: o dono confirma o dia no calendário${override ? `; equipa ${override.join('/')} (junta com o serviço da Marinha Grande)` : ''}`,
      askWeek: true, askWeekRule: ASK_WEEK_RULE, ...(area === 'Coimbra' ? { askTeam: 'Coimbra' as const } : {}) };
  }
  // Owner, 27 Oct 2026: the Braga team does not pick up rugs. No hours from its calendar, even with a time he gave.
  const pickupOwner = rugPickupOwnerReason(city, req.rugPickup === true);
  if (pickupOwner) return { ...base, region: area, teams: [], handToOwner: pickupOwner };
  if (SMALL_ORDER_CITIES.has(city) && req.ownerTime !== true) {
    const total = orderTotal(req, city);
    const min = SMALL_ORDER_MIN_BY_CITY[city] ?? SMALL_ORDER_MIN_TOTAL;
    if (total === null || total < min) return { ...base, region: area, teams: [], handToOwner: `${city}: pedido abaixo de ${min}€, sem horas certas. Dizer ao cliente que vamos verificar a disponibilidade` };
  }
  // Waterproofing in a zone that only starts on a later day: the hours start on that day.
  const tomorrow = addDays(lisbon(now.getTime()).date, 1);
  const waterproofingFrom = hasWaterproofing(req?.items) ? WATERPROOFING_FROM[area] ?? '' : '';
  const rugPickup = req.rugPickup === true;
  const teams = [...teamsForCity(city, area, waterproofingKind(req?.items, orderTotal(req, city)), area === 'Porto' || city === 'Viana do Castelo' ? orderTotal(req, city) : null, waterproofingFrom > tomorrow ? waterproofingFrom : tomorrow, rugPickup)];
  if (!teams.length && rugPickup && RUG_PICKUP_TEAMS[area]) return { ...base, region: area, teams: [], handToOwner: `Recolha de tapetes na zona de ${area}: só a equipa ${RUG_PICKUP_TEAMS[area]!.join('/')} recolhe e não pode este serviço, o responsável escolhe a equipa e a hora` };
  if (!teams.length) return { ...base, region: area, teams: [], handToOwner: 'Impermeabilização nesta zona: o responsável escolhe a equipa e a hora' };
  const cleaning = !waterproofingOnly(req?.items);

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
  // Owner, 23 Nov 2026: waterproofing (any level) in the Braga team zone and in Viana never on the same day, the
  // earliest is tomorrow; Porto (cleanings and waterproofing) and Braga cleanings may get same-day hours.
  const noSameDay = (area === 'Braga' || city === 'Viana do Castelo') && hasWaterproofing(req?.items);
  const firstDay = [waterproofingFrom, noSameDay ? tomorrow : '', today].sort().pop()!;
  const ahead = Array.from({ length: span }, (_, i) => addDays(firstDay, i));
  const tooEarly = (date: string) => date < firstDay;
  const dayOrder = onlyDay && !tooEarly(onlyDay) ? [onlyDay] : [...preferred, ...ahead.filter(d => !preferred.includes(d))];
  // A client who asks for a day the owner closed gets the preferred days instead.
  const scan = onlyDay && !tooEarly(onlyDay) ? [onlyDay, ...preferred.filter(d => d !== onlyDay)] : dayOrder;

  const busy = busyIntervals(events);
  const place = placeOf(city);
  const earliestToday = now.getTime() + LEAD_TIME_MIN * 60_000;
  const slots: Slot[] = [];
  for (const date of scan) {
    const label = dayLabel(date, today);
    const firstMinutes = Math.min(...teams.map(t => teamEarliestMinutes(t, date)));
    for (let m = firstMinutes; m <= LAST_OFFER_HOUR * 60 && m + durationMin <= DAY_END_HOUR * 60; m += 60) {
      const from = lisbonToUtc(date, m);
      if (from < earliestToday || closedAt(date, m) || tooEarly(date)) continue;
      const st = slotState(busy, teams, area, from, from + durationMin * 60_000, cleaning, place);
      if (st.free) slots.push({ date, minutes: m, label, time: hourLabel(m), teamsFree: st.teamsFree, nearOtherJob: st.nearOtherJob, sameTime: st.sameTime });
    }
  }

  let requested: { date: string; time: string; free: boolean; teamsFree: string[]; sameTime: boolean; start: string; end: string } | null = null;
  if (req.time !== undefined) {
    const m = parseTime(req.time);
    if (m === null || !onlyDay) return { error: 'time precisa de date e de uma hora como "15h" ou "15:30"' };
    const from = lisbonToUtc(onlyDay, m);
    const inHours = m >= 7 * 60 && m + durationMin <= DAY_END_HOUR * 60 && from >= now.getTime();
    const st = slotState(busy, teams, area, from, from + durationMin * 60_000, cleaning, place);
    const open = inHours && !closedAt(onlyDay, m) && !tooEarly(onlyDay);
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
