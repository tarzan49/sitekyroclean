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
import { botAvailability, type AvailabilityEvent } from './botAvailability';
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
