// What a client says after the service is booked goes into the calendar by itself (owner, 15 Oct
// 2026: "sempre que alguém enviar uma atualização [...] meter logo no calendário", "eu não ter que
// meter nada no calendário"). The bot server reads the chat and sends the changes; this turns them
// into the event's new title, description and time. Pure, so the rules are tested here.
import { lisbon, lisbonToUtc } from './botAvailability';

export interface BookingChanges {
  /** Both or neither: a new day and hour the client and we agreed. */
  date?: string; time?: string;
  postcode?: string; floor?: string; address?: string; name?: string;
  /** For the team: gate, parking, who is home, payment. */
  note?: string;
  /** The client asked to cancel or postpone without a new hour. */
  cancel?: string;
}
export interface BookingEvent { id: string; summary: string; description: string; start: string | null; end: string | null }
export type BookingUpdatePlan =
  | { ok: true; title: string; description: string; start: string; end: string; moved: boolean; cancel: boolean; summary: string[] }
  | { ok: false; reason: string };

const digits = (s: string) => s.replace(/\D/g, '');
const SERVICE_TITLE = /^\s*(?:a confirmar\s*·\s*)?servi[cç]o\b/i;
const POSTCODE = /\b\d{4}-\d{3}\b/;

function stamp(now: Date) {
  return new Intl.DateTimeFormat('pt-PT', { timeZone: 'Europe/Lisbon', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(now);
}

export function planBookingUpdate(ev: BookingEvent, phone: string, c: BookingChanges, now: Date): BookingUpdatePlan {
  const key9 = digits(phone).slice(-9);
  if (key9.length !== 9 || !digits(`${ev.summary} ${ev.description}`).includes(key9)) return { ok: false, reason: 'o evento não é deste cliente' };
  if (!SERVICE_TITLE.test(ev.summary)) return { ok: false, reason: 'só serviços e "A confirmar"' };
  if (!ev.start || !ev.end) return { ok: false, reason: 'evento sem hora' };

  // "Serviço 45€ (89€) Limpeza de sofá - +351 … - Liliana - Rua 20, nº 853, Espinho"
  const parts = ev.summary.split(' - ');
  const said: string[] = [];
  const clean = (v?: string) => (v ?? '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const postcode = clean(c.postcode), floor = clean(c.floor), address = clean(c.address), name = clean(c.name), note = clean(c.note), cancel = clean(c.cancel);

  if (parts.length >= 2) {
    // The name sits right after the phone; only filled when it was missing.
    const phoneAt = parts.findIndex(p => digits(p).endsWith(key9));
    if (name && phoneAt > 0 && (parts.length <= phoneAt + 1 || !parts[phoneAt + 1].trim())) { parts[phoneAt + 1] = name; said.push(`nome ${name}`); }
    const addrAt = phoneAt > 0 && parts.length > phoneAt + 2 ? phoneAt + 2 : -1;
    if (address && address.length >= 8 && addrAt < 0) { parts.push(address); said.push(`morada ${address}`); }
    else if (address && address.length >= 8 && addrAt > 0 && digits(address) !== digits(parts.slice(addrAt).join(' - '))) {
      said.push(`morada ${address} (era ${parts.slice(addrAt).join(' - ')})`);
      parts.splice(addrAt, parts.length - addrAt, address);
    }
    const at = addrAt > 0 ? addrAt : parts.length - 1;
    if (postcode && POSTCODE.test(postcode) && !parts.join(' - ').includes(postcode.match(POSTCODE)![0])) {
      parts[at] = `${parts[at]}, ${postcode.match(POSTCODE)![0]}`; said.push(`código postal ${postcode.match(POSTCODE)![0]}`);
    }
    if (floor && !fold(ev.summary + ev.description).includes(fold(floor))) { parts[at] = `${parts[at]}, ${floor}`; said.push(floor); }
  }

  let start = ev.start, end = ev.end, moved = false;
  if (c.date && c.time && /^\d{4}-\d{2}-\d{2}$/.test(c.date) && /^\d{1,2}:\d{2}$/.test(c.time)) {
    const [h, m] = c.time.split(':').map(Number);
    const s = lisbonToUtc(c.date, h * 60 + m);
    const dur = Date.parse(ev.end) - Date.parse(ev.start);
    // On the day of the service a move is never the bot's: a late team is the owner's to sort (Claudia, 19/10).
    const sameDay = lisbon(Date.parse(ev.start)).date === lisbon(now.getTime()).date;
    if (s !== Date.parse(ev.start) && sameDay) {
      said.push(`PEDIU PARA MUDAR NO PRÓPRIO DIA para ${c.date.slice(8)}/${c.date.slice(5, 7)} às ${c.time} (não mexido, decide o dono)`);
    } else if (s !== Date.parse(ev.start) && s > now.getTime()) {
      const was = lisbon(Date.parse(ev.start));
      start = new Date(s).toISOString(); end = new Date(s + dur).toISOString(); moved = true;
      said.push(`mudou de ${was.date.slice(8)}/${was.date.slice(5, 7)} às ${hm(was.minutes)} para ${c.date.slice(8)}/${c.date.slice(5, 7)} às ${c.time}`);
    }
  }
  if (note && !fold(ev.description).includes(fold(note))) said.push(`nota: ${note}`);
  if (cancel) said.push(`PEDIU PARA DESMARCAR: ${cancel}`);
  if (!said.length) return { ok: false, reason: 'nada de novo' };

  const line = `Atualizado pela conversa (${stamp(now)}): ${said.join('; ')}.`;
  const lines = ev.description.split('\n');
  // Keep "Equipa: X" first and the "bot:" mark last; the new line goes before the mark.
  const markAt = lines.findIndex(l => /^bot:/.test(l));
  if (markAt >= 0) lines.splice(markAt, 0, line, ''); else lines.push('', line);
  return { ok: true, title: parts.join(' - '), description: lines.join('\n').replace(/\n{3,}/g, '\n\n').slice(0, 4000), start, end, moved, cancel: !!cancel, summary: said };
}

const hm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
function fold(s: string) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' '); }
