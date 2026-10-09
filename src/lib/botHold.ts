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
import { botAvailability, chooseTeam, lisbon, lisbonToUtc, parseTime, type AvailabilityEvent } from './botAvailability';
import { botQuote } from './botQuote';

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
  | { error: string };

/**
 * `events` is the owner's calendar. `ownEventId` is this conversation's
 * existing pre-booking, if any: it is left out of the check, so moving a
 * pre-booking to a nearby time is not blocked by itself.
 */
export function planBotHold(req: unknown, events: (AvailabilityEvent & { id?: string })[], now: Date, ownEventId?: string | null): BotHoldResult {
  if (!req || typeof req !== 'object') return { error: 'O pedido tem de ser um objeto' };
  const r = req as Record<string, unknown>;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: 'conversationId em falta' };
  if (typeof r.date !== 'string' || typeof r.time !== 'string') return { error: 'date (AAAA-MM-DD) e time ("15h") são obrigatórios' };

  const others = ownEventId ? events.filter(e => e.id !== ownEventId) : events;
  const availability = botAvailability({ city: r.city, items: r.items, date: r.date, time: r.time }, others, now);
  if ('error' in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: 'time inválido' };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };

  const quote = botQuote({ items: r.items, city: r.city });
  if ('error' in quote) return { error: String(quote.error) };
  const city = availability.city!;
  const what = quote.lines.map(l => l.label).join(' + ');
  const price = quote.quote ? 'sob orçamento' : euro(quote.total);
  const name = text(r.name, MAX.name) || 'cliente';
  const title = `Pré-reserva – ${name} – ${city} – ${what} – ${price}`;
  const pickup = quote.rugPickup?.fee != null && r.rugPickup === true ? `Recolha e entrega: ${euro(quote.rugPickup.fee)}` : '';
  const description = [
    'Pré-reserva feita pelo bot do WhatsApp: confirma (muda o título para "Serviço X€ (Y€) …") ou apaga.',
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
  | { ok: true; event: { title: string; description: string; start: string; end: string } }
  | { ok: false; exists: true; summary: string }
  | { error: string };

const digitsOf = (t: string) => t.replace(/\D/g, '');
const amount = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 && v < 10_000 ? Math.round(v * 100) / 100 : null);

/**
 * Owner share = half the total, a ",5" rounded up (owner, 6 Oct 2026: 119€ → 60€).
 * With rug pickup, minus the pickup price of that order (owner, 9 Oct 2026:
 * "vale para todas as recolhas, mas é o preço que eu decidi da recolha":
 * 159€ with a 20€ pickup → 79,5 − 20 = 59,5 → 60€).
 */
export const ownerShare = (total: number, pickupFee = 0) => Math.ceil(total / 2 - pickupFee);

export function planOwnerBooking(req: unknown, events: (AvailabilityEvent & { id?: string })[]): OwnerBookingResult {
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
    const same = events.find(e => e.start && lisbon(Date.parse(e.start)).date === r.date
      && /^\s*servi[cç]o\b/i.test(e.summary)
      && digitsOf(`${e.summary} ${e.description}`).includes(key9));
    if (same) return { ok: false, exists: true, summary: same.summary };
  }

  const total = amount(r.total);
  const pickupFee = amount(r.pickupFee) ?? 0;
  const money = total === null ? '?€ (?€)' : `${formatAmount(ownerShare(total, pickupFee))}€ (${formatAmount(total)}€)`;
  const parts = [`${OWNER_BOOKING_PREFIX}Serviço ${money}${r.fromAds === true ? ' (anúncio)' : ''} ${service}`, phone, text(r.name, MAX.name), text(r.address, MAX.address)].filter(Boolean);
  const start = lisbonToUtc(r.date, minutes);
  const description = [
    'Preparado a partir da conversa do WhatsApp depois de "fica agendado". Confere e apaga "A confirmar · " do título para confirmar (entra no CRM e vai para a equipa).',
    text(r.notes, 600),
    pickupFee && total !== null ? `Parte do dono: metade do total menos a recolha (${formatAmount(total / 2)}€ − ${formatAmount(pickupFee)}€).` : '',
    `bot:${conversationId}`,
  ].filter(Boolean).join('\n\n');
  return { ok: true, event: { title: parts.join(' - '), description, start: new Date(start).toISOString(), end: new Date(start + durationMin * 60_000).toISOString() } };
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
export const TEAM_COLOR: Readonly<Record<string, string>> = { 'Porto 1': '9', 'Porto 2': '7', Braga: '10', 'Lisboa 1': '6', 'Lisboa 2': '3', Algarve: '5' };
/** The owner's ads mark in the title, read by the CRM (calendarServices adSourceFromTitle). */
const AD_MARK: Readonly<Record<string, string>> = { google: ' (anúncio)', facebook: ' (anúncio facebook)', instagram: ' (anúncio instagram)' };

export type BotBookingResult =
  | { ok: true; team: string; event: { title: string; description: string; start: string; end: string; colorId: string }; slot: { date: string; time: string; durationMin: number } }
  | { ok: false; weekend: true }
  | { ok: false; sameTime: true }
  | { ok: false; missing: string[] }
  | { ok: false; exists: true }
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
  // A Saturday or Sunday time the owner chose himself, answering the bot in his own chat (owner,
  // 9 Oct 2026: "marcar ou para domingo ou para sábado em horários que eu escolha"), closes like
  // a weekday; the bot server sends the flag only for a time he wrote for this conversation.
  const ownerChose = isWeekend(r.date) && r.ownerApprovedWeekend === true;
  if (isWeekend(r.date) && !ownerChose) return { ok: false, weekend: true };
  const name = text(r.name, MAX.name), address = text(r.address, MAX.address), phone = text(r.phone, MAX.phone);
  const missing = [!name && 'nome', address.length < 8 && 'morada completa'].filter((m): m is string => !!m);
  if (missing.length) return { ok: false, missing };

  const others = ownEventId ? events.filter(e => e.id !== ownEventId) : events;
  const key9 = digitsOf(phone).slice(-9);
  if (key9.length === 9 && others.some(e => e.start && lisbon(Date.parse(e.start)).date === r.date
    && /^\s*servi[cç]o\b/i.test(e.summary) && digitsOf(`${e.summary} ${e.description}`).includes(key9))) return { ok: false, exists: true };

  const availability = botAvailability({ city: r.city, items: r.items, date: r.date, time: r.time }, others, now);
  if ('error' in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: 'time inválido' };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };
  // Owner, 9 Oct 2026: "se for a mesma hora tem que me consultar" (two services of the zone at once).
  if (slot.sameTime && !ownerChose) return { ok: false, sameTime: true };
  const quote = botQuote({ items: r.items, city: r.city });
  if ('error' in quote) return { error: String(quote.error) };
  if (quote.quote || !(quote.total > 0)) return { ok: false, handToOwner: 'sob orçamento: o responsável dá o valor e marca' };
  const team = chooseTeam(others, r.city, slot.start, slot.end);
  if (!team) return { ok: false, taken: true, alternatives: availability.suggestion };

  const pickupFee = quote.rugPickup?.fee != null && r.rugPickup === true ? quote.rugPickup.fee : 0;
  const what = quote.lines.map(l => l.label).join(' + ');
  const service = text(r.service, 120) || what;
  const ad = typeof r.adOrigin === 'string' ? AD_MARK[r.adOrigin] ?? '' : '';
  // His titles carry the Portuguese number without the country code; the CRM matches the last 9 digits either way.
  const phoneOut = /^351\d{9}$/.test(digitsOf(phone)) ? digitsOf(phone).slice(3) : phone;
  const title = [`Serviço ${formatAmount(ownerShare(quote.total, pickupFee))}€ (${formatAmount(quote.total)}€)${ad} ${service}`, phoneOut, name, address].filter(Boolean).join(' - ');
  const description = [
    ownerChose
      ? `Marcado pelo bot do WhatsApp numa hora de fim de semana escolhida por ti, equipa ${team} (escolhida pelo bot; muda a cor para trocar).`
      : `Marcado pelo bot do WhatsApp numa vaga livre, equipa ${team} (escolhida pelo bot; muda a cor para trocar).`,
    `Artigos: ${what}`,
    `Total: ${euro(quote.total)} (deslocação incluída)`,
    text(r.note, MAX.note) ? `Nota: ${text(r.note, MAX.note)}` : '',
    `bot:${conversationId}`,
  ].filter(Boolean).join('\n');
  return { ok: true, team, event: { title, description, start: slot.start, end: slot.end, colorId: TEAM_COLOR[team] }, slot: { date: slot.date, time: slot.time, durationMin: availability.durationMin } };
}
