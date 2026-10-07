// Decide o que a sincronização com o Google Calendar faz ao CRM, sem tocar
// na base de dados: o separador CRM executa o plano (2026-09-26).
//
// Regras:
// - Evento de serviço novo → linha nova, com a data de fecho = criação do evento.
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
import {
  AD_SOURCES, adSourceFromTitle, isServiceEvent, knownPlacesFrom, parseServiceEvent,
  type CalendarEvent, type CrmLocality, type ParsedService,
} from './calendarServices';

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
}

export type CalendarInsert = ParsedService & {
  booked_at: string;
  calendar_event_id: string;
  calendar_updated_at: string;
  source: string;
  paid: false;
};

export type CalendarPatch = Partial<ParsedService> & {
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
        booked_at: event.created,
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
      Object.assign(patch, parsed, { calendar_updated_at: event.updated });
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
 * O dia de um serviço antigo que ainda não aconteceu, quando o calendário diz
 * outro. `request_date` é uma data (AAAA-MM-DD), por isso compara-se como texto.
 */
function upcomingChanges(row: SyncableRow, parsed: ParsedService, now: string): CalendarPatch | null {
  const today = now.slice(0, 10);
  const current = row.request_date?.slice(0, 10) ?? '';
  if (current < today && parsed.request_date < today) return null;
  return parsed.request_date !== current ? { request_date: parsed.request_date } : null;
}
