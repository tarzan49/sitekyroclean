// What the owner's calendar already has for one client (owner, 15 Oct 2026: the bot answered
// Liliana and Adriana, both booked for Saturday, with "Fica pré-reservado; confirmamos-lhe ainda
// hoje" — it never knew the service was already in the calendar). Only the client's own bookings
// leave the function: day, hour, kind and what is done, never other clients.
import { lisbon, type AvailabilityEvent } from './botAvailability';

export interface BookedService { date: string; time: string; kind: 'serviço' | 'a confirmar' | 'pré-reserva'; service: string }

const digits = (s: string) => s.replace(/\D/g, '');
const KIND = /^\s*(?:(a confirmar)\s*·\s*)?(servi[cç]o|pr[ée]-reserva)\b/i;

/** The client's services from 12 h ago to 60 days ahead, by the last 9 digits of the phone. */
export function bookedServices(phone: string, events: AvailabilityEvent[], now: Date): BookedService[] {
  const key9 = digits(phone).slice(-9);
  if (key9.length !== 9) return [];
  const from = now.getTime() - 12 * 3_600_000, to = now.getTime() + 60 * 86_400_000;
  const out: BookedService[] = [];
  for (const e of events) {
    const m = KIND.exec(e.summary ?? '');
    if (!m || !e.start) continue;
    const t = Date.parse(e.start);
    if (!(t >= from && t <= to)) continue;
    if (!digits(`${e.summary} ${e.description ?? ''}`).includes(key9)) continue;
    const at = lisbon(t);
    const kind = m[1] ? 'a confirmar' : /pr/i.test(m[2]) ? 'pré-reserva' : 'serviço';
    // "Serviço 108€ (215€) Impermeabilização Premium de 8 cadeiras - 965… - Adriana - Rua…" → the part before the first " - ".
    const service = (e.summary ?? '').replace(KIND, '').replace(/^[\s?\d€()]+/, '').replace(/\(an[úu]ncio[^)]*\)\s*/i, '').split(' - ')[0].replace(/^[–\s]+/, '').trim();
    out.push({ date: at.date, time: `${Math.floor(at.minutes / 60)}h${at.minutes % 60 ? String(at.minutes % 60).padStart(2, '0') : ''}`, kind, service });
  }
  return out.sort((a, b) => (a.date + a.time.padStart(5, '0')).localeCompare(b.date + b.time.padStart(5, '0')));
}
