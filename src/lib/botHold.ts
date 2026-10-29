/**
 * The bot's pre-booking (dono, 2026-10-08: "pré-reserva no calendário").
 * When a client accepts a time the bot offered, `bot-api` (action `hold`)
 * checks with this file that the time is still free in the owner's calendar
 * and builds the event that the owner's Apps Script writes there
 * (google-apps-script/calendario-equipas/ReservasBot.gs). From then on the same
 * time is no longer offered to another client.
 *
 * The owner's decisions (8 Oct): a "Pré-reserva – …" event, never "Serviço",
 * so it reaches neither the CRM nor the teams until he confirms it (he renames
 * it to "Serviço X€ (Y€) …", as always); and it never expires on its own.
 *
 * The title carries the served town ("… – Porto – …"), which is how
 * botAvailability gives an event without a team its region.
 */
import { botAvailability, chooseTeam, cityZone, hasWaterproofing, waterproofingOnly, rugPickupOwnerReason, teamWorks, TEAMS_BY_REGION, WATERPROOFING_TEAMS, lisbon, lisbonToUtc, parseTime, type AvailabilityEvent } from './botAvailability';
import { botQuote } from './botQuote';
import { CLOSE_NOW_DAYS } from './botCloseNow';

const MAX = { name: 80, phone: 30, address: 200, conversationId: 120, note: 300 } as const;

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, max) : '');
const euro = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')}€`;

export interface BotHoldPlan {
  ok: true;
  /** What the Apps Script writes. */
  event: { title: string; description: string; start: string; end: string };
  /** What goes back to the bot: times only. */
  slot: { date: string; time: string; durationMin: number };
}
export type BotHoldResult =
  | BotHoldPlan
  | { ok: false; taken: true; alternatives: unknown }
  | { ok: false; handToOwner: string }
  | { ok: false; alreadyBooked: true }
  | { error: string };

/**
 * `events` is the owner's calendar. `ownEventId` is this conversation's
 * existing pre-booking, if any: it is left out of the check, so moving a
 * pre-booking to a nearby time is not blocked by itself.
 */
/**
 * The total the booking carries: the table total, or, with `closeNow` (owner, 13 Oct 2026: 10% only to
 * close now, "eu tenho que ganhar com esse fecho rápido"), the closeNow total, only for a day within the
 * next CLOSE_NOW_DAYS days. Anything else is the owner's: a string with the reason.
 */
export function bookingTotal(quote: { total: number | null; closeNow: { ok: boolean; total?: number | null } }, wantsCloseNow: unknown, date: string, now: Date): { total: number | null; closeNow: boolean } | string {
  if (wantsCloseNow !== true) return { total: quote.total, closeNow: false };
  if (!quote.closeNow.ok || quote.closeNow.total == null) return 'condição de 10% sem preço do motor: decide o responsável';
  const days = (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${lisbon(now.getTime()).date}T12:00:00Z`)) / 86_400_000;
  if (days > CLOSE_NOW_DAYS) return `condição de 10% só para os próximos ${CLOSE_NOW_DAYS} dias`;
  return { total: quote.closeNow.total, closeNow: true };
}

/**
 * A total already agreed in the conversation (owner, 18 Oct 2026, Helder: he gave 15€ per chair + 29€
 * for the headboard, the client asked "fica por 134€?", he said "Exatamente", and the bot held the
 * booking because the table said 122,50€ and the headboard is "sob orçamento"). The bot server checks
 * the number was said or confirmed by us in that chat before it sends it; here it only has to be sane.
 */
export const agreedTotalOf = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 5000 ? Math.round(v * 100) / 100 : null;

export function planBotHold(req: unknown, events: (AvailabilityEvent & { id?: string })[], now: Date, ownEventId?: string | null): BotHoldResult {
  if (!req || typeof req !== 'object') return { error: 'O pedido tem de ser um objeto' };
  const r = req as Record<string, unknown>;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: 'conversationId em falta' };
  if (typeof r.date !== 'string' || typeof r.time !== 'string') return { error: 'date (AAAA-MM-DD) e time ("15h") são obrigatórios' };

  const others = ownEventId ? events.filter(e => e.id !== ownEventId) : events;
  // The client already has a service near that day: a new hour moves that service (marcar_servico,
  // and the chat reading of update-booking), never a pre-booking next to it (27 Oct 2026: Viana do
  // Castelo, a "Pré-reserva" at the very hour the service had just been moved to). All events, not
  // `others`: after a booking the conversation's own row points at that service.
  if (clientServiceNear(events, text(r.phone, MAX.phone), r.date)) return { ok: false, alreadyBooked: true };
  const availability = botAvailability({ city: r.city, items: r.items, total: r.agreedTotal ?? r.total, date: r.date, time: r.time, ownerTime: r.ownerApprovedWeekend === true || r.ownerApprovedTime === true }, others, now);
  if ('error' in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: 'time inválido' };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };

  const quote = botQuote({ items: r.items, city: r.city, sharedTrip: !!availability.sharedTrip });
  if ('error' in quote) return { error: String(quote.error) };
  const city = availability.city!;
  const what = quote.lines.map(l => l.label).join(' + ');
  const chatTotal = agreedTotalOf(r.agreedTotal);
  const agreed = chatTotal ? { total: chatTotal, closeNow: false } : bookingTotal(quote, r.closeNow, slot.date, now);
  if (typeof agreed === 'string') return { ok: false, handToOwner: agreed };
  const price = chatTotal ? euro(chatTotal) : quote.quote ? 'sob orçamento' : euro(agreed.total!) + (agreed.closeNow ? ' (com 10% para fechar já)' : '');
  const name = text(r.name, MAX.name) || 'cliente';
  const title = `Pré-reserva – ${name} – ${city} – ${what} – ${price}`;
  const pickup = quote.rugPickup?.fee != null && r.rugPickup === true ? `Recolha e entrega: ${euro(quote.rugPickup.fee)}` : '';
  const pickupOwner = rugPickupOwnerReason(r.city, r.rugPickup === true);
  const description = [
    'Pré-reserva feita pelo bot do WhatsApp: confirma (muda o título para "Serviço X€ (Y€) …") ou apaga.',
    pickupOwner ? `${pickupOwner}: muda a cor para a equipa que faz a recolha.` : '',
    `Telefone: ${text(r.phone, MAX.phone) || 'ver conversa'}`,
    `Artigos: ${what}`,
    `Total: ${price}${quote.quote ? '' : ` (deslocação incluída)`}`,
    pickup,
    text(r.address, MAX.address) ? `Morada: ${text(r.address, MAX.address)}` : 'Morada: por pedir',
    text(r.note, MAX.note) ? `Nota: ${text(r.note, MAX.note)}` : '',
    `bot:${conversationId}`,
  ].filter(Boolean).join('\n');
  return { ok: true, event: { title, description, start: slot.start, end: slot.end }, slot: { date: slot.date, time: slot.time, durationMin: availability.durationMin } };
}

/**
 * The owner's own booking (dono, 2026-10-09: "prepara-me o evento quando
 * escrevo fica agendado"). The bot server reads the chat after he writes "fica
 * agendado" and sends what it found; this checks it and builds the event:
 * his own title format with "A confirmar · " in front, so it reaches neither
 * the CRM nor the teams until he deletes the prefix, but already busies the
 * time for the bot. Nothing is written when he already has a "Serviço" for
 * that phone on that day (he booked it himself, or another session did).
 */
export const OWNER_BOOKING_PREFIX = 'A confirmar · ';

export type OwnerBookingResult =
  | { ok: true; event: { title: string; description: string; start: string; end: string; colorId?: string }; team?: string }
  | { ok: false; exists: true; summary: string }
  | { error: string };

const digitsOf = (t: string) => t.replace(/\D/g, '');
/** Town and address together, for the zone: the town first, the address's postal code when the town is not one we know. */
const placeOf = (city: unknown, address: string) => [city, address].filter((v): v is string => typeof v === 'string' && !!v.trim()).join(', ');
const amount = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 10_000 ? Math.round(v * 100) / 100 : null);

/**
 * With a rug pickup the team gets this much more, for the fuel of whoever goes
 * to fetch it (owner, 27 Oct 2026: "a partir de agora em recolhas eu pago somente
 * 10 eur a mais a quem vai buscar para compensar a gasolina"). From 9 Oct it was
 * the whole pickup price (20€): 139€ gave him 50€, now 60€.
 */
export const RUG_PICKUP_TEAM_FUEL = 10;

/**
 * Owner share = half the total, a ",5" rounded up (owner, 6 Oct 2026: 119€ → 60€).
 * With rug pickup, minus the fuel money for whoever picks it up, never more than
 * the pickup the client paid (139€ with pickup → 69,5 − 10 = 59,5 → 60€).
 */
export const pickupFuelOf = (pickupFee = 0) => (pickupFee > 0 ? Math.min(pickupFee, RUG_PICKUP_TEAM_FUEL) : 0);
export const ownerShare = (total: number, pickupFee = 0) => Math.ceil(total / 2 - pickupFuelOf(pickupFee));

/** A "Serviço" (or "A confirmar · Serviço") of this phone within 60 days of `date`, the nearest one. */
export function clientServiceNear<E extends AvailabilityEvent & { id?: string }>(events: E[], phone: string, date: string): E | undefined {
  const key9 = digitsOf(phone).slice(-9);
  if (key9.length !== 9) return undefined;
  const day = Date.parse(`${date}T12:00:00Z`);
  return events
    .filter(e => e.start && e.status !== 'CANCELLED' && Math.abs(Date.parse(e.start) - day) <= 60 * 86_400_000
      && /^\s*(a confirmar · )?servi[cç]o\b/i.test(e.summary)
      && digitsOf(`${e.summary} ${e.description}`).includes(key9))
    .sort((a, b) => Math.abs(Date.parse(a.start!) - day) - Math.abs(Date.parse(b.start!) - day))[0];
}

export function planOwnerBooking(req: unknown, events: (AvailabilityEvent & { id?: string })[], nowMs = Date.now()): OwnerBookingResult {
  if (!req || typeof req !== 'object') return { error: 'O pedido tem de ser um objeto' };
  const r = req as Record<string, unknown>;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: 'conversationId em falta' };
  if (typeof r.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return { error: 'date tem de ser AAAA-MM-DD' };
  const minutes = parseTime(r.time);
  if (minutes === null) return { error: 'time inválido' };
  const service = text(r.service, 160);
  if (!service) return { error: 'service em falta' };
  const durationRaw = Number(r.durationMin);
  const durationMin = Number.isFinite(durationRaw) && durationRaw >= 30 && durationRaw <= 480 ? Math.ceil(durationRaw / 15) * 15 : 60;
  const phone = text(r.phone, MAX.phone);
  const key9 = digitsOf(phone).slice(-9);

  if (key9.length === 9) {
    // A service of this phone on ANY nearby day counts (owner, 19 Oct 2026: a rescheduled job came in
    // as a second booking). Moving an existing booking is update-booking's job, never a new event.
    const same = clientServiceNear(events, phone, r.date);
    if (same) return { ok: false, exists: true, summary: same.summary };
  }

  const total = amount(r.total);
  const pickupFee = amount(r.pickupFee) ?? 0;
  const money = total === null ? '?€ (?€)' : `${formatAmount(ownerShare(total, pickupFee))}€ (${formatAmount(total)}€)`;
  const start = lisbonToUtc(r.date, minutes);
  // Never a service at an hour already gone (22 Oct 2026: at 19:34 the chat was read as "quinta às 10h",
  // that same morning, and a 94€ "Serviço" went in for a client who had asked to cancel).
  if (start < nowMs) return { error: 'A hora já passou: não se marca um serviço no passado' };
  const startIso = new Date(start).toISOString(), endIso = new Date(start + durationMin * 60_000).toISOString();
  // Owner, 11 Oct 2026: "é suposto tu reconheceres sempre que alguém fecha um serviço [...] e
  // colocares no calendário". A booking the chat settles (time accepted, price, full address)
  // goes in as his real "Serviço", in the colour of a team with room; anything less stays
  // "A confirmar". The team is the one he already named for this chat, else chooseTeam.
  const address = text(r.address, MAX.address);
  // Owner, 19 Oct 2026: "todos os serviços de braga q precisem de imper colocas no porto 1",
  // also when the chat named Braga.
  const waterproofing = /imperm|premium|essencial/i.test(service);
  const namedRaw = typeof r.team === 'string' && TEAM_COLOR[r.team] ? r.team : null;
  const namedTeam = namedRaw && waterproofing && TEAMS_BY_REGION.Braga.includes(namedRaw) ? WATERPROOFING_TEAMS.Braga?.[0] ?? namedRaw : namedRaw;
  // A team the chat named but that is off at that hour (TEAM_OFF, TEAM_WEEKDAY_HOURS) is not used (owner, 28 Oct 2026:
  // "porto 1 amanha a tarde NAO ESTA DISPONIVEL PONTO"): chooseTeam picks another, or it stays "A confirmar".
  const named = namedTeam && teamWorks(namedTeam, start, start + durationMin * 60_000) ? namedTeam : null;
  // Owner, 27 Oct 2026: the Braga team does not pick up rugs. A pickup there takes only a team the chat
  // named outside the zone; otherwise it stays "A confirmar" and he picks the team.
  const pickupOwner = rugPickupOwnerReason(placeOf(r.city, address), pickupFee > 0 || /recolh/i.test(service));
  const pickupZone = pickupOwner ? cityZone(placeOf(r.city, address)) : null;
  const allowedNamed = named && !(pickupZone && TEAMS_BY_REGION[pickupZone].includes(named)) ? named : null;
  // Owner, 19 Oct 2026: "quando é que eu disse que os serviços que marco ficam a confirmar? remove
  // essa regra". A booking with a price is a real "Serviço"; only one without a price (the title
  // would not parse in the CRM) stays "A confirmar".
  const team = total === null ? null
    : pickupOwner ? allowedNamed
    : named ?? chooseTeam(events, r.city ?? address, startIso, endIso, waterproofing,
      !(/imperm/i.test(service) && !/limpeza|lavagem|higieniz|anti-?[aá]caros/i.test(service)));
  if (team) {
    const phoneOut = /^351\d{9}$/.test(digitsOf(phone)) ? digitsOf(phone).slice(3) : phone;
    const title = [`Serviço ${money}${r.fromAds === true ? ' (anúncio)' : ''} ${service}`, phoneOut, text(r.name, MAX.name), address].filter(Boolean).join(' - ');
    const description = [
      `Marcado pelo bot a partir da conversa do WhatsApp, equipa ${team} (muda a cor para trocar).`,
      text(r.notes, 600),
      pickupFee && total !== null ? `Parte do dono: metade do total menos ${formatAmount(pickupFuelOf(pickupFee))}€ de gasolina para quem faz a recolha (${formatAmount(total / 2)}€ − ${formatAmount(pickupFuelOf(pickupFee))}€).` : '',
      `bot:${conversationId}`,
    ].filter(Boolean).join('\n\n');
    return { ok: true, team, event: { title, description, start: startIso, end: endIso, colorId: TEAM_COLOR[team] } };
  }
  const parts = [`${OWNER_BOOKING_PREFIX}Serviço ${money}${r.fromAds === true ? ' (anúncio)' : ''} ${service}`, phone, text(r.name, MAX.name), address].filter(Boolean);
  const description = [
    'Preparado a partir da conversa do WhatsApp. Confere e apaga "A confirmar · " do título para confirmar (entra no CRM e vai para a equipa).',
    pickupOwner && total !== null ? `${pickupOwner}: escolhe a cor da equipa que faz a recolha.` : '',
    text(r.notes, 600),
    pickupFee && total !== null ? `Parte do dono: metade do total menos ${formatAmount(pickupFuelOf(pickupFee))}€ de gasolina para quem faz a recolha (${formatAmount(total / 2)}€ − ${formatAmount(pickupFuelOf(pickupFee))}€).` : '',
    `bot:${conversationId}`,
  ].filter(Boolean).join('\n\n');
  return { ok: true, event: { title: parts.join(' - '), description, start: startIso, end: endIso } };
}

const formatAmount = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',').replace(/,?0+$/, ''));

/**
 * The bot closes the job itself (owner, 9 Oct 2026: "fecha e escolhe a equipa";
 * "se for sábado e domingo confirmar comigo, se for semana fechar as vagas que não
 * estão ocupadas"). Once the client has accepted a time and given the name and the
 * full address, this checks the time is still free, picks a team with room
 * (chooseTeam) and builds the owner's own "Serviço X€ (Y€) …" in that team's
 * colour, so the team-calendar script copies it to the team and the CRM reads it,
 * as if he had written it. What it does not close, the bot leaves as a
 * pre-booking for him: Saturdays and Sundays, a time another service of the zone
 * already has ("se for a mesma hora tem que me consultar"), and anything without
 * an engine price.
 */
export const TEAM_COLOR: Readonly<Record<string, string>> = { 'Porto 1': '9', 'Porto 2': '8', 'Porto 3': '11', Braga: '10', 'Lisboa 1': '6', Algarve: '5', Coimbra: '4' };
/** The owner's ads mark in the title, read by the CRM (calendarServices adSourceFromTitle). */
const AD_MARK: Readonly<Record<string, string>> = { google: ' (anúncio)', facebook: ' (anúncio facebook)', instagram: ' (anúncio instagram)' };

export type BotBookingResult =
  | { ok: true; team: string; event: { title: string; description: string; start: string; end: string; colorId: string }; slot: { date: string; time: string; durationMin: number } }
  | { ok: false; sameTime: true }
  | { ok: false; missing: string[] }
  | { ok: false; exists: true }
  | { ok: false; reschedule: { eventId: string; date: string; time: string } }
  | { ok: false; taken: true; alternatives: unknown }
  | { ok: false; handToOwner: string }
  | { error: string };

export const isWeekend = (date: string) => [0, 6].includes(new Date(`${date}T12:00:00Z`).getUTCDay());

export function planBotBooking(req: unknown, events: (AvailabilityEvent & { id?: string })[], now: Date, ownEventId?: string | null): BotBookingResult {
  if (!req || typeof req !== 'object') return { error: 'O pedido tem de ser um objeto' };
  const r = req as Record<string, unknown>;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: 'conversationId em falta' };
  if (typeof r.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || typeof r.time !== 'string') return { error: 'date (AAAA-MM-DD) e time ("15h") são obrigatórios' };
  // Saturday and Sunday close like a weekday from the calendar (owner, 18 Oct 2026: "tens que só agendar
  // esses dias, senão estamos condicionados"; until then they waited for him). The flag stays for a time
  // he chose himself: that one may share the hour with another service of the zone.
  const ownerChose = (isWeekend(r.date) && r.ownerApprovedWeekend === true) || r.ownerApprovedTime === true;
  const name = text(r.name, MAX.name), address = text(r.address, MAX.address), phone = text(r.phone, MAX.phone);
  const missing = [!name && 'nome', address.length < 8 && 'morada completa'].filter((m): m is string => !!m);
  if (missing.length) return { ok: false, missing };

  const others = ownEventId ? events.filter(e => e.id !== ownEventId) : events;
  const key9 = digitsOf(phone).slice(-9);
  if (key9.length === 9 && others.some(e => e.start && lisbon(Date.parse(e.start)).date === r.date
    && /^\s*servi[cç]o\b/i.test(e.summary) && digitsOf(`${e.summary} ${e.description}`).includes(key9))) return { ok: false, exists: true };
  // The client already has a service on another nearby day: this is a reschedule, never a second
  // booking (owner, 19 Oct 2026, Filipa: moved from 19 to 20 Oct and came in twice).
  const booked = clientServiceNear(others, phone, r.date);
  if (booked?.id) return { ok: false, reschedule: { eventId: booked.id, date: r.date, time: r.time } };
  // Owner, 27 Oct 2026: "marcaste um serviço para recolha em viana do castelo sem me consultar [...] a
  // equipa de braga não faz recolha de tapetes". Never closed by the bot: it stays a pre-booking for him.
  const pickupOwner = rugPickupOwnerReason(placeOf(r.city, address), r.rugPickup === true || /recolh/i.test(text(r.service, 120)));
  if (pickupOwner) return { ok: false, handToOwner: pickupOwner };

  const availability = botAvailability({ city: r.city, items: r.items, total: r.agreedTotal ?? r.total, date: r.date, time: r.time, ownerTime: r.ownerApprovedWeekend === true || r.ownerApprovedTime === true }, others, now);
  if ('error' in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: 'time inválido' };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };
  // Owner, 9 Oct 2026: "se for a mesma hora tem que me consultar" (two services of the zone at once).
  if (slot.sameTime && !ownerChose) return { ok: false, sameTime: true };
  const quote = botQuote({ items: r.items, city: r.city, sharedTrip: !!availability.sharedTrip });
  if ('error' in quote) return { error: String(quote.error) };
  const chatTotal = agreedTotalOf(r.agreedTotal);
  if (!chatTotal && (quote.quote || !(quote.total > 0))) return { ok: false, handToOwner: 'sob orçamento: o responsável dá o valor e marca' };
  const agreed = chatTotal ? { total: chatTotal, closeNow: false } : bookingTotal(quote, r.closeNow, slot.date, now);
  if (typeof agreed === 'string') return { ok: false, handToOwner: agreed };
  const total = agreed.total!;
  // Far zone: the team already there that day (availability.sharedTrip).
  const team = availability.sharedTrip?.team ?? chooseTeam(others, r.city, slot.start, slot.end, hasWaterproofing(r.items), !waterproofingOnly(r.items));
  if (!team) return { ok: false, taken: true, alternatives: availability.suggestion };

  const pickupFee = quote.rugPickup?.fee != null && r.rugPickup === true ? quote.rugPickup.fee : 0;
  const what = quote.lines.map(l => l.label).join(' + ');
  const service = text(r.service, 120) || what;
  const ad = typeof r.adOrigin === 'string' ? AD_MARK[r.adOrigin] ?? '' : '';
  // His titles carry the Portuguese number without the country code; the CRM matches the last 9 digits either way.
  const phoneOut = /^351\d{9}$/.test(digitsOf(phone)) ? digitsOf(phone).slice(3) : phone;
  const title = [`Serviço ${formatAmount(ownerShare(total, pickupFee))}€ (${formatAmount(total)}€)${ad} ${service}`, phoneOut, name, address].filter(Boolean).join(' - ');
  const description = [
    ownerChose
      ? `Marcado pelo bot do WhatsApp numa hora ${isWeekend(r.date) ? 'de fim de semana ' : ''}escolhida por ti, equipa ${team} (escolhida pelo bot; muda a cor para trocar).`
      : `Marcado pelo bot do WhatsApp numa vaga livre, equipa ${team} (escolhida pelo bot; muda a cor para trocar).`,
    `Artigos: ${what}`,
    availability.sharedTrip ? `Total: ${euro(total)} (sem deslocação: a equipa já está na zona nesse dia)` : `Total: ${euro(total)} (deslocação incluída)`,
    chatTotal ? `Preço combinado na conversa${quote.quote || !(quote.total > 0) ? '' : ` (tabela ${euro(quote.total)})`}.` : '',
    agreed.closeNow ? `Condição para fechar já: 10% a menos (tabela ${euro(quote.total)}), marcado na conversa para os próximos ${CLOSE_NOW_DAYS} dias.` : '',
    text(r.note, MAX.note) ? `Nota: ${text(r.note, MAX.note)}` : '',
    `bot:${conversationId}`,
  ].filter(Boolean).join('\n');
  return { ok: true, team, event: { title, description, start: slot.start, end: slot.end, colorId: TEAM_COLOR[team] }, slot: { date: slot.date, time: slot.time, durationMin: availability.durationMin } };
}
