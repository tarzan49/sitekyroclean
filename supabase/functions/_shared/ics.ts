// Leitor mínimo de iCalendar (RFC 5545) para o endereço secreto do Google
// Calendar. Lê só o que o CRM usa de cada VEVENT; não expande recorrências.

export interface CalendarEvent {
  /** Id do evento no Google Calendar (o UID sem "@google.com"). */
  id: string;
  summary: string;
  description: string;
  location: string;
  /** Dia do evento, AAAA-MM-DD, na hora local em que foi marcado. */
  startDate: string;
  /** Criação do evento, ISO 8601 em UTC. */
  created: string;
  /** Última alteração, ISO 8601 em UTC. */
  updated: string;
  /** CONFIRMED, TENTATIVE ou CANCELLED. */
  status: string;
}

export interface ParsedCalendar {
  events: CalendarEvent[];
  /** Todos os VEVENT do feed, incluindo os descartados. Zero = feed suspeito. */
  totalEvents: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

/**
 * Desdobra as linhas ao nível dos bytes, antes de descodificar: o Google corta
 * as linhas aos 75 octetos e pode cortar a meio de um carácter UTF-8 ("ç",
 * "€"); descodificar primeiro deixava "�" nos nomes e moradas.
 */
function unfold(bytes: Uint8Array): string {
  const out = new Uint8Array(bytes.length);
  let n = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === 0x0d && bytes[i + 1] === 0x0a && (bytes[i + 2] === 0x20 || bytes[i + 2] === 0x09)) { i += 2; continue; }
    if (b === 0x0a && (bytes[i + 1] === 0x20 || bytes[i + 1] === 0x09)) { i += 1; continue; }
    out[n++] = b;
  }
  return decoder.decode(out.subarray(0, n));
}

function unescapeText(value: string): string {
  return value.replace(/\\([\\;,nN])/g, (_, c: string) => (c === 'n' || c === 'N' ? '\n' : c));
}

interface Property { name: string; params: Record<string, string>; value: string }

function parseLine(line: string): Property | null {
  let inQuotes = false;
  let colon = -1;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ':' && !inQuotes) { colon = i; break; }
  }
  if (colon < 0) return null;
  const [name, ...rawParams] = line.slice(0, colon).split(';');
  const params: Record<string, string> = {};
  for (const p of rawParams) {
    const eq = p.indexOf('=');
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, '');
  }
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

const lisbonDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit',
});

/** "20260926T091529Z" → "2026-09-26T09:15:29Z". */
function utcIso(value: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null;
}

/**
 * O dia do evento. Com TZID ou data simples é o dia escrito; em UTC ("Z")
 * converte-se para Lisboa, que é onde os serviços acontecem.
 */
function startDateOf(value: string): string | null {
  const utc = utcIso(value);
  if (utc) return lisbonDate.format(new Date(utc));
  const m = /^(\d{4})(\d{2})(\d{2})(?:T\d{6})?$/.exec(value);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

export function parseIcs(input: Uint8Array | string): ParsedCalendar {
  const text = unfold(typeof input === 'string' ? encoder.encode(input) : input);
  const events: CalendarEvent[] = [];
  let totalEvents = 0;
  let current: Map<string, Property> | null = null;
  let skip = false;

  for (const line of text.split(/\r?\n/)) {
    if (line === 'BEGIN:VEVENT') { current = new Map(); skip = false; totalEvents++; continue; }
    if (line === 'END:VEVENT') {
      if (current && !skip) {
        const uid = current.get('UID')?.value ?? '';
        const startDate = startDateOf(current.get('DTSTART')?.value ?? '');
        const created = utcIso(current.get('CREATED')?.value ?? '');
        const updated = utcIso(current.get('LAST-MODIFIED')?.value ?? '') ?? created;
        if (uid && startDate && created && updated) {
          events.push({
            id: uid.replace(/@google\.com$/i, ''),
            summary: unescapeText(current.get('SUMMARY')?.value ?? ''),
            description: unescapeText(current.get('DESCRIPTION')?.value ?? ''),
            location: unescapeText(current.get('LOCATION')?.value ?? ''),
            startDate,
            created,
            updated,
            status: (current.get('STATUS')?.value ?? 'CONFIRMED').toUpperCase(),
          });
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const prop = parseLine(line);
    if (!prop) continue;
    // Um serviço não se repete. Eventos recorrentes e as suas exceções ficam
    // de fora em vez de serem expandidos.
    if (prop.name === 'RRULE' || prop.name === 'RECURRENCE-ID') skip = true;
    if (!current.has(prop.name)) current.set(prop.name, prop);
  }

  return { events, totalEvents };
}
