// Decide o que a sincronização com o Google Calendar faz ao CRM, sem tocar
// na base de dados: o separador CRM executa o plano (2026-09-26).
//
// Regras:
// - Evento de serviço novo → linha nova, com a data de fecho = criação do evento.
//   Se o evento nasceu como outra coisa ("A confirmar · ", "Pré-reserva") e só
//   mais de uma hora depois passou a "Serviço", o fecho é a última alteração
//   (dono, 2026-10-11: um "A confirmar" de sábado à noite fechado no domingo
//   contava no sábado). O CRM só vê o título de agora, por isso a mudança para
//   "Serviço" é a última alteração que se conhece. Exceção: um serviço marcado
//   pelo bot ("Marcado pelo bot" na descrição) já nasceu "Serviço" e fecha
//   sempre na criação (2026-10-23).
// - Evento editado no calendário depois da última sincronização → a linha é
//   atualizada. Uma edição feita no CRM mantém-se até o evento voltar a ser
//   editado: ganha a alteração mais recente. O "pago" nunca é tocado, e a
//   origem só muda entre "Google Calendar" e os anúncios, conforme o título
//   tenha "(anúncio)" (2026-09-28): uma origem escrita à mão no CRM fica.
//   Exceção: um cliente vazio no CRM é preenchido se o evento tiver nome.
// - Serviço criado antes de `since`, já ligado a uma linha (passada à mão e
//   ligada na importação de 11/09): se ainda não aconteceu, o dia segue o
//   calendário (dono, 29/09/2026: mudou um serviço de 1 para 16/10 e o CRM
//   ficou no dia 1). O resto fica como o dono o escreveu no CRM, também os
//   valores, que nessas linhas às vezes diferem do título de propósito (um
//   extra acertado depois). Nunca cria linhas: essas já foram passadas à mão.
// - Evento que desaparece (apagado, cancelado, ou deixou de começar por
//   "Serviço") → a linha fica marcada, nunca é apagada. Se voltar, desmarca-se.
// - Linha apagada no CRM com o evento ainda no calendário → o evento fica em
//   `ignored` e nunca volta a criar linha (dono, 2026-10-08).
// - Fatura (dono, 2026-10-27: "nos serviços em que acresce IVA, estás a colocar
//   no CRM esse valor direitinho?"). Numa linha com fatura, o valor com IVA vive
//   no CRM: um evento que mude depois e diga o preço antes do IVA (Regina:
//   "(209€)" no título, 257,07€ no CRM) não o apaga. Se o preço do calendário
//   mudar mesmo, ganha o calendário (com o IVA, ver `invoiceFromEvent`). Numa
//   linha sem fatura, um evento que fale em IVA, fatura ou NIF marca-a com
//   fatura, pela leitura do evento (dono, 2026-10-30: "para com essa merda de
//   para rever, ou é ou não é"). Nada fica "para rever" por causa da fatura.
import {
  AD_SOURCES, adSourceFromTitle, isServiceEvent, knownPlacesFrom, parseServiceEvent,
  type CalendarEvent, type CrmLocality, type ParsedService,
} from './calendarServices';
import { serviceVatOf } from './invoiceVat';

/**
 * Só entram eventos criados a partir daqui. Os anteriores já estavam no CRM,
 * passados à mão pelo dono (os de 26/09 entraram entre as 15:44 e as 15:54).
 */
export const CALENDAR_SYNC_SINCE = '2026-09-26T15:00:00Z';

/**
 * Os eventos pedidos ao calendário começam aqui, antes de `CALENDAR_SYNC_SINCE`,
 * para os serviços antigos já ligados a uma linha acompanharem as mudanças de
 * dia (os primeiros dados do CRM são de 5/06/2026).
 */
export const CALENDAR_FETCH_SINCE = '2026-06-01T00:00:00Z';

/** Aparece na coluna Origem das linhas criadas pela sincronização. */
export const CALENDAR_SOURCE = 'Google Calendar';

/** Origens que a sincronização escreve, e por isso pode voltar a mudar. */
const SYNC_SOURCES: ReadonlySet<string> = new Set([CALENDAR_SOURCE, ...Object.values(AD_SOURCES)]);

export interface SyncableRow {
  id: string;
  source?: string | null;
  client_name?: string | null;
  city: string | null;
  locality: CrmLocality | null;
  needs_review: string | null;
  booked_at: string | null;
  calendar_event_id: string | null;
  calendar_updated_at: string | null;
  calendar_missing_since: string | null;
  request_date?: string | null;
  billed_value?: number | string | null;
  my_cut?: number | string | null;
  invoiced?: boolean | null;
  invoice_value?: number | string | null;
}

export type CalendarInsert = ParsedService & {
  booked_at: string;
  calendar_event_id: string;
  calendar_updated_at: string;
  source: string;
  paid: false;
} & Partial<InvoiceFields>;

/** O que a sincronização escreve quando o evento diz que é com fatura. */
export interface InvoiceFields {
  invoiced: true;
  vat_on_top: boolean;
  invoice_by: 'Empresa';
  billed_value: number;
}

export type CalendarPatch = Partial<ParsedService> & Partial<InvoiceFields> & {
  source?: string;
  calendar_updated_at?: string;
  calendar_missing_since?: string | null;
};

export interface SyncPlan {
  inserts: CalendarInsert[];
  updates: Array<{ id: string; patch: CalendarPatch }>;
  counts: { added: number; updated: number; missing: number; restored: number };
}

const time = (iso: string | null) => (iso ? Date.parse(iso) : NaN);

/** Margem para as alterações do script das equipas logo a seguir à criação (cor, linha "Equipa:"). */
const LATE_SERVICE_MS = 60 * 60 * 1000;

const BOT_BOOKED = /Marcado pelo bot/;

const VAT_WORDS = /\b(iva|fatura|factura|nif|contribuinte)\b/i;

const NO_INVOICE = /\bsem\s+(fatura|factura|iva)\b|n[ãa]o\s+(quer|precisa|pediu|pede)\s+(de\s+)?(fatura|factura)/i;
const VAT_INCLUDED = /iva\s+inclu[ií]do|iva\s+incl\b/i;
const VAT_ON_TOP = /\bà\s+parte\b|\ba\s+parte\b|\bacresce|\+\s*iva\b|\bmais\s+iva\b|\biva\s+(de\s+)?23|\+\s*23\s*%/i;
const VAT_RATE = 1.23;

const amountsIn = (text: string) =>
  [...text.matchAll(/(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:€|eur)/gi)].map(m => Number(m[1].replace(',', '.')));
const round2 = (n: number) => Math.round(n * 100) / 100;
const near = (a: number, b: number) => Math.abs(a - b) <= 0.05;

/**
 * A leitura da fatura num evento, decidida sem perguntar ao dono. O título traz
 * o preço; o valor faturado do CRM é sempre o que o cliente paga, com o IVA.
 * - "sem fatura" / "não quer fatura": não é com fatura (null).
 * - "IVA incluído": com fatura, o valor do título já tem o IVA.
 * - "IVA à parte", "acresce IVA", "+ IVA": o cliente paga o título + 23%, a
 *   não ser que o texto mostre que o título já é o total (Diogo, 30/10:
 *   "195,57€ = 159€ + 36,57€ de IVA" com 195,57€ no título).
 * - Só "fatura" ou "NIF": se o texto tiver o total com IVA, IVA à parte; senão
 *   fica o valor do título, IVA incluído (nunca se inventa dinheiro).
 */
export function invoiceFromEvent(event: CalendarEvent, titleValue: number): InvoiceFields | null {
  const text = `${event.summary}\n${event.description ?? ''}`;
  if (!VAT_WORDS.test(text) || NO_INVOICE.test(text)) return null;
  const base = Number(titleValue) || 0;
  const withVat = round2(base * VAT_RATE);
  const amounts = amountsIn(text);
  const totalWritten = amounts.find(a => near(a, withVat));
  const titleIsTotal = amounts.some(a => a < base && near(round2(a * VAT_RATE), base));
  const result = (vat_on_top: boolean, billed_value: number): InvoiceFields =>
    ({ invoiced: true, vat_on_top, invoice_by: 'Empresa', billed_value });
  if (VAT_INCLUDED.test(text) && !VAT_ON_TOP.test(text)) return result(false, base);
  if (titleIsTotal) return result(true, base);
  if (totalWritten !== undefined) return result(true, totalWritten);
  if (VAT_ON_TOP.test(text)) return result(true, withVat);
  return result(false, base);
}

/** O evento fala em IVA, fatura ou NIF (título ou descrição). */
export function mentionsInvoice(event: CalendarEvent): boolean {
  return VAT_WORDS.test(`${event.summary}\n${event.description ?? ''}`);
}

const cents = (n: unknown) => Math.round((Number(n) || 0) * 100);

/** Data de fecho de um serviço que entra agora no CRM. */
export function closingDateOf(event: CalendarEvent): string {
  // O bot escreve logo "Serviço" (`book`): nasceu fechado, e uma edição depois
  // (trocar a equipa, a morada) não é o fecho (dono, 2026-10-23: um serviço de
  // Coimbra fechado a 22/10 entrou a 23/10 porque o CRM só o viu depois de ele
  // mudar a cor).
  if (BOT_BOOKED.test(event.description ?? '')) return event.created;
  return time(event.updated) - time(event.created) > LATE_SERVICE_MS ? event.updated : event.created;
}

export function planCalendarSync(
  rows: SyncableRow[],
  events: CalendarEvent[],
  { since, now, ignored }: { since: string; now: string; ignored?: ReadonlySet<string> },
): SyncPlan {
  const known = knownPlacesFrom(rows);
  const byEvent = new Map(rows.filter(r => r.calendar_event_id).map(r => [r.calendar_event_id!, r]));
  const present = new Set<string>();
  const plan: SyncPlan = { inserts: [], updates: [], counts: { added: 0, updated: 0, missing: 0, restored: 0 } };

  for (const event of events) {
    if (event.status === 'CANCELLED' || !isServiceEvent(event.summary)) continue;
    if (ignored?.has(event.id)) continue;
    const parsed = parseServiceEvent(event, known);
    if (!parsed) continue;
    if (time(event.created) < time(since)) {
      const old = byEvent.get(event.id);
      if (old) {
        const patch = upcomingChanges(old, parsed, now);
        if (patch) {
          plan.updates.push({ id: old.id, patch });
          plan.counts.updated++;
        }
      }
      continue;
    }
    present.add(event.id);

    const source = adSourceFromTitle(event.summary) ?? CALENDAR_SOURCE;
    const row = byEvent.get(event.id);
    if (!row) {
      plan.inserts.push({
        ...parsed,
        ...(invoiceFromEvent(event, parsed.billed_value) ?? {}),
        booked_at: closingDateOf(event),
        calendar_event_id: event.id,
        calendar_updated_at: event.updated,
        source,
        paid: false,
      });
      plan.counts.added++;
      continue;
    }

    const patch: CalendarPatch = {};
    if (row.calendar_missing_since) {
      patch.calendar_missing_since = null;
      plan.counts.restored++;
    }
    if (!(time(row.calendar_updated_at) >= time(event.updated))) {
      Object.assign(patch, parsed, { calendar_updated_at: event.updated }, invoiceChanges(row, parsed, event));
      const current = row.source ?? CALENDAR_SOURCE;
      if (current !== source && SYNC_SOURCES.has(current)) patch.source = source;
      plan.counts.updated++;
    } else if (!row.client_name && parsed.client_name) {
      // Nome que a leitura antiga do evento não apanhou: preenche-se só o que
      // está vazio, sem mexer no que o dono tenha editado no CRM.
      patch.client_name = parsed.client_name;
      plan.counts.updated++;
    }
    if (Object.keys(patch).length) plan.updates.push({ id: row.id, patch });
  }

  for (const row of byEvent.values()) {
    if (present.has(row.calendar_event_id!) || row.calendar_missing_since) continue;
    // As linhas ligadas ao calendário antes de `since` (a data de fecho das
    // antigas veio de lá) não são vigiadas: o feed só traz eventos novos.
    if (!(time(row.booked_at) >= time(since))) continue;
    plan.updates.push({ id: row.id, patch: { calendar_missing_since: now } });
    plan.counts.missing++;
  }

  return plan;
}

/**
 * O que muda na releitura de um evento por causa da fatura (ver o cabeçalho):
 * com fatura, o valor com IVA do CRM fica quando o título diz o mesmo preço
 * antes do IVA; sem fatura, um evento que fale nela fica para rever.
 */
function invoiceChanges(row: SyncableRow, parsed: ParsedService, event: CalendarEvent): Partial<CalendarPatch> {
  const invoice = invoiceFromEvent(event, parsed.billed_value);
  if (!row.invoiced) return invoice ?? {};
  if (row.billed_value === undefined || row.billed_value === null) return {};
  const crm = cents(row.billed_value);
  const calendar = cents(parsed.billed_value);
  if (calendar === crm) return {};
  // Título com o preço antes do IVA: fica o do CRM (e a parte do dono que lá está).
  if (Math.abs(calendar - (crm - cents(serviceVatOf(row)))) <= 2) {
    return { billed_value: Number(row.billed_value), my_cut: Number(row.my_cut) || 0 };
  }
  // O preço mudou mesmo: ganha o calendário, com o IVA se o evento o diz à parte.
  return invoice ? { billed_value: invoice.billed_value } : {};
}

/**
 * O dia de um serviço antigo que ainda não aconteceu, quando o calendário diz
 * outro. `request_date` é uma data (AAAA-MM-DD), por isso compara-se como texto.
 */
function upcomingChanges(row: SyncableRow, parsed: ParsedService, now: string): CalendarPatch | null {
  const today = now.slice(0, 10);
  const current = row.request_date?.slice(0, 10) ?? '';
  if (current < today && parsed.request_date < today) return null;
  return parsed.request_date !== current ? { request_date: parsed.request_date } : null;
}
