// Factos do calendário para as etiquetas do WhatsApp (dono, 2026-10-11: "um bot
// dentro do bot que constantemente esteja a vigiar as etiquetas"). O servidor do
// bot lê as etiquetas de cada conversa e pergunta aqui, pelo telefone, se essa
// pessoa tem um serviço já feito, um serviço marcado ou uma pré-reserva por
// confirmar no calendário do dono; com isso acerta "Por marcar serviço",
// "Serviço Marcado" e "Concluído" (kyro-bot `src/bot/labelWatch.ts`).
//
// Corre na `bot-api` (ação `label-facts`). Como o resto da `bot-api`, só devolve
// datas e o tipo: nunca o nome, a morada nem o título do evento.
import { lisbon, lisbonToUtc } from './botAvailability';

/** O que se lê de cada evento do calendário (o `CalendarEvent` de `_shared/ics.ts` serve). */
export interface LabelFactsEvent {
  summary: string;
  description: string;
  location?: string;
  status: string;
  /** Início em UTC (ISO 8601); null num evento de dia inteiro. */
  start: string | null;
  /** Dia do evento, AAAA-MM-DD; usado só nos eventos de dia inteiro. */
  startDate?: string;
}

/** Datas em Lisboa, AAAA-MM-DD. */
export interface LabelFact {
  /** O serviço mais recente que já começou há mais de 3 horas. */
  past: string | null;
  /** O próximo serviço (ou o que está a decorrer). */
  next: string | null;
  /** A próxima "Pré-reserva" ou "A confirmar" ainda no futuro. */
  pending: string | null;
}

/** Um serviço que começou há menos disto ainda conta como marcado, não como feito. */
export const LABEL_FACTS_PAST_AFTER_MS = 3 * 60 * 60_000;

/**
 * O título como o CRM e o script das equipas o leem (`clean`/`normalizeCity` em
 * calendarServices.ts, `limpar`/`normalizar` em Codigo.gs): sem caracteres
 * invisíveis, hífenes Unicode como "-", sem acentos, em minúsculas.
 */
const INVISIBLE = new RegExp('[\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]', 'g');
const UNICODE_HYPHEN = new RegExp('[\\u2010-\\u2015\\u2212]', 'g');
const COMBINING_MARK = new RegExp('[\\u0300-\\u036f]', 'g');
const fold = (s: string) => s
  .replace(INVISIBLE, '')
  .replace(UNICODE_HYPHEN, '-')
  .normalize('NFD').replace(COMBINING_MARK, '').toLowerCase().trim();
/**
 * Um serviço é o mesmo que o CRM e o script das equipas contam (`isServiceEvent`,
 * `ehServico`): começa por "Serviço", ou por "Limpeza" com um valor em euros.
 * Sem isto, um "Limpeza 45€ (89€) …" estava no CRM e na equipa e aqui não.
 */
const SERVICE = /^servico\b/;
const CLEANING = /^limpeza\b/;
const EURO_AMOUNT = /\d\s*€/;
const PENDING = /^(a confirmar|pre[- ]?reserva)/;

/**
 * Números com pelo menos 9 algarismos, com espaços (também o "&nbsp;" de uma
 * descrição em HTML), pontos, hífenes (também os Unicode), "+" e os caracteres
 * invisíveis que o WhatsApp põe à volta de um número copiado (‪ … ‬, marcas de
 * direção, espaços de largura zero) entre eles.
 */
const SEPARATOR = '[\\s.\\-+\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\u2010-\\u2015\\u2212]';
const DIGIT_RUN = new RegExp(`\\d+(?:${SEPARATOR}+\\d+)*`, 'g');
const HTML_SPACE = /&(?:nbsp|#160|#xa0);/gi;
/**
 * Códigos postais ("4755-186") e datas com o ano por extenso ("12.10.2026",
 * "2026-10-12") saem antes de procurar telefones: colados a um número da porta
 * ou a uma hora ("Rua X 12 4755-186", "12.10.2026 15h30") faziam 9 algarismos
 * que não são telefone nenhum. O "|" corta a sequência (não é separador). Um
 * telefone escrito "912-345-678" ou "06.12.34.56.78" não tem esta forma.
 */
const NOT_A_PHONE = new RegExp('(?<!\\d)(?:\\d{4}[-\\u2010-\\u2015\\u2212]\\d{3}|\\d{1,2}[./-]\\d{1,2}[./-](?:19|20)\\d{2}|(?:19|20)\\d{2}-\\d{1,2}-\\d{1,2})(?!\\d)', 'g');

/** Os últimos 9 algarismos de um telefone (vale também para números estrangeiros). */
export const phoneKey = (v: string): string => v.replace(/\D/g, '').slice(-9);

/**
 * As chaves (últimos 9 algarismos) de cada número que um texto pode ter. Numa
 * sequência de grupos ("2 - 912 345 678 - 4000-123") o telefone acaba sempre
 * num fim de grupo, por isso conta-se o fim de cada grupo: "912 345 678 - 4000"
 * não deixa o número colado ao que vem a seguir. Os falsos positivos que
 * restem (os algarismos de uma morada) só contam se forem os de um telefone
 * pedido.
 */
export function phoneKeysIn(text: string): Set<string> {
  const keys = new Set<string>();
  for (const run of text.replace(HTML_SPACE, ' ').replace(NOT_A_PHONE, '|').match(DIGIT_RUN) ?? []) {
    let digits = '';
    for (const group of run.match(/\d+/g) ?? []) {
      digits += group;
      if (digits.length >= 9) keys.add(digits.slice(-9));
    }
  }
  return keys;
}

type Kind = 'service' | 'pending';
function kindOf(summary: string): Kind | null {
  const s = fold(summary);
  if (SERVICE.test(s) || (CLEANING.test(s) && EURO_AMOUNT.test(s))) return 'service';
  if (PENDING.test(s)) return 'pending'; // também "A confirmar · Serviço …": não é serviço até o dono o confirmar
  return null; // voos, bloqueios, compromissos do dono
}

/**
 * O instante do evento. Um evento de dia inteiro conta como 21h em Lisboa (a
 * última hora a que um serviço começa), por isso fica marcado o dia todo e só
 * passa a feito à meia-noite.
 */
function instantOf(e: LabelFactsEvent): number | null {
  if (e.start) {
    const t = Date.parse(e.start);
    return Number.isFinite(t) ? t : null;
  }
  return e.startDate && /^\d{4}-\d{2}-\d{2}$/.test(e.startDate) ? lisbonToUtc(e.startDate, 21 * 60) : null;
}

/**
 * Para cada telefone pedido que aparece no calendário (no título, na descrição
 * ou no local de um evento), o serviço passado mais recente, o próximo serviço
 * e a próxima pré-reserva. A chave é o fim do telefone (9 algarismos); só
 * entram os telefones com algum evento.
 */
export function labelFacts(phones: string[], events: LabelFactsEvent[], now: Date): Record<string, LabelFact> {
  const wanted = new Set(phones.map(phoneKey).filter(k => k.length === 9));
  const nowMs = now.getTime();
  const pastBefore = nowMs - LABEL_FACTS_PAST_AFTER_MS;
  if (wanted.size === 0) return {};
  const best = new Map<string, { past: number | null; next: number | null; pending: number | null }>();

  for (const e of events) {
    if (String(e.status).toUpperCase() === 'CANCELLED') continue;
    const kind = kindOf(e.summary ?? '');
    if (!kind) continue;
    const at = instantOf(e);
    if (at === null) continue;
    if (kind === 'pending' && at < nowMs) continue; // pré-reserva que já passou: ninguém a confirmou
    const keys = phoneKeysIn(`${e.summary ?? ''}\n${e.description ?? ''}\n${e.location ?? ''}`);
    for (const key of keys) {
      if (!wanted.has(key)) continue;
      const b = best.get(key) ?? { past: null, next: null, pending: null };
      if (kind === 'pending') {
        if (b.pending === null || at < b.pending) b.pending = at;
      } else if (at < pastBefore) {
        if (b.past === null || at > b.past) b.past = at;
      } else if (b.next === null || at < b.next) {
        b.next = at;
      }
      best.set(key, b);
    }
  }

  const day = (ms: number | null) => (ms === null ? null : lisbon(ms).date);
  const out: Record<string, LabelFact> = {};
  for (const [key, b] of best) out[key] = { past: day(b.past), next: day(b.next), pending: day(b.pending) };
  return out;
}
