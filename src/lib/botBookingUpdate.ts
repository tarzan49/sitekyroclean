// What a client says after the service is booked goes into the calendar by itself (owner, 15 Oct
// 2026: "sempre que alguém enviar uma atualização [...] meter logo no calendário", "eu não ter que
// meter nada no calendário"). The bot server reads the chat and sends the changes; this turns them
// into the event's new title, description and time. Pure, so the rules are tested here.
import { lisbon, lisbonToUtc } from './botAvailability';
import { ownerShare } from './botHold';
import { tagWaterproofBase } from './waterproofBase';

export interface BookingChanges {
  /** Both or neither: a new day and hour the client and we agreed. */
  date?: string; time?: string;
  postcode?: string; floor?: string; address?: string; name?: string;
  /** For the team: gate, parking, who is home, payment. */
  note?: string;
  /** The client asked to cancel or postpone without a new hour. */
  cancel?: string;
  /**
   * The whole service after the client added items, priced by the engine (bot-api runs botQuote on
   * the items the bot sends). Diana, 3 Nov 2026: "também com as cadeiras", the bot said "fica
   * anotado" and the event stayed at the sofa alone, 149€ instead of 269€.
   * `fewer`: the client took items out or chose a lower level ("só a limpeza, sem impermeabilização");
   * then a lower total goes in too, so the team, the accounts and the "Como correu?" name what is done
   * (owner, 20 Nov 2026, Elisabete: the event kept "Limpeza + impermeabilização Essencial" after she
   * chose only the cleaning, and the check-in asked about a waterproofing never done).
   */
  requote?: { total: number; what: string; service?: string; fewer?: boolean };
  /** The total the client was told in a message that went out (owner, 16 Nov 2026: "o valor que passas à equipa é sempre o valor fechado com o cliente"). Up or down; items stay. */
  saidTotal?: number;
  /**
   * With saidTotal above the booked total: what the team did on top, on site (owner, 20 Nov 2026,
   * Elisabete: "tratamento da urina", 89€ + 40€, paid by MB Way and never written in the chat).
   * It joins the service in the title and counts as a closing of its own, like items added.
   */
  extra?: string;
  /** bot-api's second plan after the team was busy at the new hour: the event keeps its hour. */
  keepTime?: boolean;
}
export interface BookingEvent { id: string; summary: string; description: string; start: string | null; end: string | null }
export type BookingUpdatePlan =
  | { ok: true; title: string; description: string; start: string; end: string; moved: boolean; cancel: boolean; summary: string[]; added?: { value: number; cut: number; what: string } }
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
    else if (address && address.length >= 8 && addrAt > 0) {
      const was = parts.slice(addrAt).join(' - ');
      const next = mergedAddress(was, address, POSTCODE.test(postcode));
      if (next) { said.push(`morada ${next} (era ${was})`); parts.splice(addrAt, parts.length - addrAt, next); }
    }
    const at = addrAt > 0 ? addrAt : parts.length - 1;
    if (postcode && POSTCODE.test(postcode) && !parts.join(' - ').includes(postcode.match(POSTCODE)![0])) {
      parts[at] = `${parts[at]}, ${postcode.match(POSTCODE)![0]}`; said.push(`código postal ${postcode.match(POSTCODE)![0]}`);
    }
    // Against the new title, and not against an earlier "Atualizado" line, whose "(era …)" may name
    // a floor the title no longer has.
    const notes = ev.description.split('\n').filter(l => !l.startsWith('Atualizado pela conversa')).join('\n');
    if (floor && !compact(parts.join(' - ') + notes).includes(compact(floor))) { parts[at] = `${parts[at]}, ${floor}`; said.push(floor); }
  }

  // Lisboa 1, 21 Nov 2026 (Amadora, 149€): the event said "Hora por confirmar: 9h ou 13h" at 09:00, the client chose 13h,
  // the reader wrote it only as a note ("Cliente escolheu as 13h") and the team went at 9h to an empty house.
  // An hour alone moves on the event's own day, and a note that says the client chose another hour moves the event too,
  // or the update is refused: never a note that contradicts the event's start.
  const evDay = lisbon(Date.parse(ev.start));
  const chosen = noteChosenTime(note);
  if (c.time && !c.date) c = { ...c, date: evDay.date };
  if (!c.time && chosen && chosen.minutes !== evDay.minutes) {
    if (c.keepTime) return { ok: false, reason: `a nota diz que o cliente escolheu as ${hm(chosen.minutes)}, o evento está às ${hm(evDay.minutes)}: o dono muda a hora` };
    c = { ...c, date: c.date ?? evDay.date, time: hm(chosen.minutes) };
  }
  if (c.keepTime) c = { ...c, date: undefined, time: undefined };
  let start = ev.start, end = ev.end, moved = false;
  if (c.date && c.time && /^\d{4}-\d{2}-\d{2}$/.test(c.date) && /^\d{1,2}:\d{2}$/.test(c.time)) {
    const [h, m] = c.time.split(':').map(Number);
    const s = lisbonToUtc(c.date, h * 60 + m);
    const dur = Date.parse(ev.end) - Date.parse(ev.start);
    if (s !== Date.parse(ev.start) && s > now.getTime()) {
      const was = lisbon(Date.parse(ev.start));
      start = new Date(s).toISOString(); end = new Date(s + dur).toISOString(); moved = true;
      said.push(`mudou de ${was.date.slice(8)}/${was.date.slice(5, 7)} às ${hm(was.minutes)} para ${c.date.slice(8)}/${c.date.slice(5, 7)} às ${c.time}`);
    }
  }
  if (chosen && !moved && c.time && Date.parse(start) !== lisbonToUtc(c.date!, chosen.minutes)) {
    return { ok: false, reason: `a nota diz que o cliente escolheu as ${hm(chosen.minutes)} e o evento não pode ir para essa hora: o dono muda` };
  }
  let title = parts.join(' - ');
  let description = moved ? ev.description.split('\n').filter(l => !/^\s*hora por confirmar\b/i.test(l)).join('\n') : ev.description;
  let added: { value: number; cut: number; what: string } | undefined;
  if (c.requote) {
    const head = /^(\s*(?:a confirmar\s*·\s*)?servi[cç]o\s+)[\d,.?]+€\s*\(([\d,.?]+)€\)((?:\s*\(an[uú]ncio[^)]*\))?)\s*([^-]*?)\s*(?= - |$)/i.exec(title);
    const was = head ? Number(head[2].replace(',', '.')) : NaN;
    // The total said to the client wins over the engine's table (owner, 19 Nov 2026, Altieres: 249€ agreed, 279€ written).
    const total = Math.round((c.saidTotal && c.saidTotal > 0 ? c.saidTotal : c.requote.total) * 100) / 100;
    // Adding items only: a lower total is a price talk, which is the owner's.
    if (!head || !(total > 0)) return { ok: false, reason: 'título sem preço: o dono atualiza' };
    if (Number.isFinite(was) && total < was && !c.requote.fewer) return { ok: false, reason: `total novo ${total}€ abaixo do marcado ${was}€: o dono decide` };
    if (total !== was) {
      const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
      const service = tagWaterproofBase(clean(c.requote.service) || clean(c.requote.what));
      title = `${head[1]}${fmt(ownerShare(total))}€ (${fmt(total)}€)${head[3]} ${service}` + title.slice(head[0].length);
      description = description.split('\n').map(l => /^Artigos:/.test(l) ? `Artigos: ${clean(c.requote!.what)}` : /^Total:/.test(l) ? `Total: ${fmt(total)}€` : l).join('\n');
      // The extra counts as a closing on the day the client took it, not on the day of the booking
      // (Diana, 3 Nov 2026: 4 chairs for 120€ fell on 30/10, when the sofa was booked).
      if (Number.isFinite(was) && total > was) {
        const wasCut = Number(head[0].match(/[\d,.]+(?=€)/)?.[0].replace(',', '.'));
        added = { value: Math.round((total - was) * 100) / 100, cut: Math.round((ownerShare(total) - (Number.isFinite(wasCut) ? wasCut : ownerShare(was))) * 100) / 100, what: clean(c.requote.what) };
      }
      said.push(`artigos agora ${clean(c.requote.what)}, total ${fmt(total)}€ (era ${head[2]}€)`);
    }
  }
  if (!c.requote && c.saidTotal && c.saidTotal > 0) {
    const head = /^(\s*(?:a confirmar\s*·\s*)?servi[cç]o\s+)[\d,.?]+€\s*\(([\d,.?]+)€\)/i.exec(title);
    if (!head) return { ok: false, reason: 'título sem preço: o dono atualiza' };
    const was = Number(head[2].replace(',', '.'));
    const total = Math.round(c.saidTotal * 100) / 100;
    if (total !== was) {
      const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ','));
      const extra = clean(c.extra);
      let rest = title.slice(head[0].length);
      if (extra && total > was) {
        // " Limpeza de sofá - 9100… - Name - Address": the extra goes at the end of the service part.
        const cut = rest.indexOf(' - ');
        rest = cut >= 0 ? `${rest.slice(0, cut)} + ${extra}${rest.slice(cut)}` : `${rest} + ${extra}`;
        const wasCut = Number(head[0].match(/[\d,.]+(?=€)/)?.[0].replace(',', '.'));
        added = { value: Math.round((total - was) * 100) / 100, cut: Math.round((ownerShare(total) - (Number.isFinite(wasCut) ? wasCut : ownerShare(was))) * 100) / 100, what: `${extra} (feito no local)` };
      }
      title = `${head[1]}${fmt(ownerShare(total))}€ (${fmt(total)}€)` + rest;
      description = description.split('\n').map(l => /^Total:/.test(l) ? l.replace(/^Total:\s*[\d,.]+€/, `Total: ${fmt(total)}€`) : l).join('\n');
      said.push(extra && total > was
        ? `extra feito no local: ${extra}, total ${fmt(total)}€ (era ${head[2]}€)`
        : `total acertado ao combinado com o cliente: ${fmt(total)}€ (era ${head[2]}€)`);
    }
  }
  if (note && !fold(ev.description).includes(fold(note))) said.push(`nota: ${note}`);
  // A day and an hour agreed in the chat is a move, never a delete on top of it, even when the event already has them
  // (Mariana, 15 Nov 2026: marcar_servico moved her 409€ service to Thursday, the reader read "cancelar" in "teremos de
  // cancelar a limpeza amanhã. Seria possível na 5a feira às 9h?" and update-booking deleted the event it had just moved).
  const cancelled = c.date && c.time ? '' : cancel;
  if (cancelled) said.push(`PEDIU PARA DESMARCAR: ${cancelled}`);
  if (!said.length) return { ok: false, reason: 'nada de novo' };

  const line = `Atualizado pela conversa (${stamp(now)}): ${said.join('; ')}.`;
  const lines = description.split('\n');
  // Keep "Equipa: X" first and the "bot:" mark last; the new line goes before the mark.
  const markAt = lines.findIndex(l => /^bot:/.test(l));
  if (markAt >= 0) lines.splice(markAt, 0, line, ''); else lines.push('', line);
  return { ok: true, title, description: lines.join('\n').replace(/\n{3,}/g, '\n\n').slice(0, 4000), start, end, moved, cancel: !!cancelled, summary: said, added };
}

/** "Cliente escolheu as 13h", "confirmou às 13:30": the hour a note says the client chose, or null. */
export function noteChosenTime(note: string): { minutes: number } | null {
  const m = /(?:escolh|confirm|combin|prefer|aceit|opt(?:ou|a)|fica(?:mos)? (?:com|para))[\p{L}]*\D{0,20}?(?<!\d)(\d{1,2})(?:\s*h(?:oras?)?\s*(\d{2})?|:(\d{2}))(?!\d)/iu.exec(note);
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2] ?? m[3] ?? 0);
  return h >= 7 && h <= 21 && min < 60 ? { minutes: h * 60 + min } : null;
}
const hm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
function fold(s: string) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' '); }
const compact = (s: string) => fold(s).replace(/[^a-z0-9]/g, '');

// A client who sends the address again rarely writes all of it, and the reader passes on what came
// (Marlene, 29 Oct 2026: the event had "…nº 67, 4º BC, 3700-108 São João da Madeira", the reader sent
// "…nº 67, São João da Madeira" and the floor the team needs was gone from the title). An address
// update never takes away a floor, door, block or postcode the event has and the client did not change:
// nothing new in it → the event keeps its own (null); the same street and door with something new →
// the new one plus what it left out; the same street with fewer numbers → the event's, plus what is
// new; another street or door number → the client gave another address, the new one as it is.
const STREET_WORDS = new Set(['rua', 'r', 'avenida', 'av', 'travessa', 'tv', 'largo', 'lg', 'praca', 'praceta', 'estrada', 'alameda', 'beco', 'caminho', 'urbanizacao', 'urb', 'bairro', 'calcada', 'viela', 'rotunda']);
const STOP_WORDS = new Set(['n', 'no', 'nr', 'num', 'numero', 's', 'sao', 'sta', 'santa', 'sto', 'santo', 'de', 'da', 'do', 'das', 'dos', 'e']);
const STREET_START = /^(?:rua|r\.|avenida|av\.?|travessa|tv\.?|largo|pra[cç]a|pra[cç]eta|estrada|alameda|beco|caminho|urbaniza[cç][aã]o|urb\.|bairro|quinta|lugar|cal[cç]ada|viela|rotunda)(?:\s|$)/i;
// "4º BC", "2.º esq.", "1º andar dto", "4 ºBC".
const FLOOR_MARK = String.raw`\d{1,2}\s*\.?\s*[ºª°](?:\s*andar\b)?(?:\s*(?:esq(?:uerd[oa])?|dt[oa]?|dir(?:eit[oa])?|frente|tr[aá]s|[a-z]{1,3})\b\.?)?`;
const FLOOR_START = new RegExp(`^${FLOOR_MARK}`, 'i');
const FLOOR_ANY = new RegExp(FLOOR_MARK, 'gi');
const FLOOR_WORDS = /\b(?:andar|piso|r\/c|rc|r[eé]s[\s-]*do[\s-]*ch[aã]o|cave|esq(?:uerd[oa])?|dt[oa]|dir(?:eit[oa])?|frente|tr[aá]s(?!-)|traseiras?|moradia|vivenda)\b/i;
const OTHER_DETAIL_WORDS = /\b(?:bloco|bl|lote|lt|porta|fra[cç][aã]o|apartamento|apto?)\b/i;
const POSTCODE_ALL = new RegExp(POSTCODE.source, 'g');

type AddressDetail = { text: string; floor: boolean };
function addressDetails(addr: string): AddressDetail[] {
  const out: AddressDetail[] = [];
  for (const raw of addr.split(',')) {
    const seg = raw.trim();
    if (!seg || POSTCODE.test(seg)) continue;
    const street = STREET_START.test(seg);
    if (!street && (FLOOR_START.test(seg) || FLOOR_WORDS.test(seg) || /^\d{1,2}\s*[a-z]{1,2}\.?$/i.test(seg))) out.push({ text: seg, floor: true });
    else if (!street && OTHER_DETAIL_WORDS.test(seg)) out.push({ text: seg, floor: false });
    else {
      // "Rua X nº 67 4º BC": a floor after the door number, with no comma before it.
      const m = [...seg.matchAll(FLOOR_ANY)].at(-1);
      if (m && /\d/.test(seg.slice(0, m.index))) out.push({ text: m[0].trim(), floor: true });
    }
  }
  return out;
}
function addressTokens(s: string): string[] {
  return fold(s).replace(/[ºª°]/g, ' ').replace(/(\d)o\b/g, '$1').replace(/(\d)([a-z])/g, '$1 $2').replace(/([a-z])(\d)/g, '$1 $2')
    .split(/[^a-z0-9]+/).filter(t => t && !STOP_WORDS.has(t) && !STREET_WORDS.has(t));
}
/** The street, door and place, without floor, door letter, block or postcode. */
function placeTokens(addr: string) {
  let s = addr.replace(POSTCODE_ALL, ' ');
  for (const d of addressDetails(addr)) s = s.replace(d.text, ' ');
  return addressTokens(s);
}
const isNum = (t: string) => /^\d+$/.test(t);
const within = (a: string[], b: string[]) => a.every(t => b.includes(t));
function sameStreet(a: string, b: string) {
  const firstWords = (s: string) => placeTokens(s.split(',')[0]).filter(t => !isNum(t));
  let [wa, wb] = [firstWords(a), firstWords(b)];
  // "Rua 20, nº 853, Espinho": nothing but numbers before the first comma.
  if (!wa.length || !wb.length) [wa, wb] = [placeTokens(a).filter(t => !isNum(t)), placeTokens(b).filter(t => !isNum(t))];
  const [short, long] = wa.length <= wb.length ? [wa, wb] : [wb, wa];
  return short.filter(w => long.includes(w)).length * 2 >= short.length;
}

/** `postcodeApart`: the reader sent a postcode of its own, which goes in after this. */
export function mergedAddress(was: string, given: string, postcodeApart: boolean): string | null {
  if (within(addressTokens(given), addressTokens(was))) return null;
  const [oldNums, newNums] = [placeTokens(was).filter(isNum), placeTokens(given).filter(isNum)];
  const conflict = !within(oldNums, newNums) && !within(newNums, oldNums);
  if (conflict || !sameStreet(was, given)) return given;
  let next: string;
  if (within(oldNums, newNums)) {
    // A floor in the new address is the client's own (moved flat, corrected it); one sent apart is
    // added after this, next to the old one if it differs, as when only the floor comes.
    const newFloor = addressDetails(given).some(d => d.floor);
    const keep = addressDetails(was).filter(d => !(d.floor && newFloor) && !compact(given).includes(compact(d.text))).map(d => d.text);
    const segs = given.split(',').map(s => s.trim()).filter(Boolean);
    let at = -1;
    segs.forEach((s, i) => { if (!POSTCODE.test(s) && /\d/.test(s) && !addressDetails(s).length) at = i; });
    segs.splice(at < 0 ? 1 : at + 1, 0, ...keep);
    const oldCode = was.match(POSTCODE)?.[0];
    if (oldCode && !POSTCODE.test(given) && !postcodeApart) segs.push(oldCode);
    next = segs.join(', ');
  } else {
    // Fewer door numbers than the event: the event's address stays, with what the new one adds.
    const old = addressTokens(was);
    const extra = given.split(',').map(s => s.trim()).filter(s => s && !within(addressTokens(s), old));
    next = [was, ...extra].join(', ');
  }
  return compact(next) === compact(was) ? null : next;
}
