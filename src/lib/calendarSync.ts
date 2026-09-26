// Decide o que a sincronização com o Google Calendar faz ao CRM, sem tocar
// na base de dados: o separador CRM executa o plano (2026-09-26).
//
// Regras:
// - Evento de serviço novo → linha nova, com a data de fecho = criação do evento.
// - Evento editado no calendário depois da última sincronização → a linha é
//   atualizada. Uma edição feita no CRM mantém-se até o evento voltar a ser
//   editado: ganha a alteração mais recente. O "pago" e a origem nunca são tocados.
// - Evento que desaparece (apagado, cancelado, ou deixou de começar por
//   "Serviço") → a linha fica marcada, nunca é apagada. Se voltar, desmarca-se.
import {
  isServiceEvent, knownPlacesFrom, parseServiceEvent,
  type CalendarEvent, type CrmLocality, type ParsedService,
} from './calendarServices';

/**
 * Só entram eventos criados a partir daqui. Os anteriores já estavam no CRM,
 * passados à mão pelo dono (os de 26/09 entraram entre as 15:44 e as 15:54).
 */
export const CALENDAR_SYNC_SINCE = '2026-09-26T15:00:00Z';

/** Aparece na coluna Origem das linhas criadas pela sincronização. */
export const CALENDAR_SOURCE = 'Google Calendar';

export interface SyncableRow {
  id: string;
  city: string | null;
  locality: CrmLocality | null;
  needs_review: string | null;
  booked_at: string | null;
  calendar_event_id: string | null;
  calendar_updated_at: string | null;
  calendar_missing_since: string | null;
}

export type CalendarInsert = ParsedService & {
  booked_at: string;
  calendar_event_id: string;
  calendar_updated_at: string;
  source: string;
  paid: false;
};

export type CalendarPatch = Partial<ParsedService> & {
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
  { since, now }: { since: string; now: string },
): SyncPlan {
  const known = knownPlacesFrom(rows);
  const byEvent = new Map(rows.filter(r => r.calendar_event_id).map(r => [r.calendar_event_id!, r]));
  const present = new Set<string>();
  const plan: SyncPlan = { inserts: [], updates: [], counts: { added: 0, updated: 0, missing: 0, restored: 0 } };

  for (const event of events) {
    if (event.status === 'CANCELLED' || !isServiceEvent(event.summary)) continue;
    if (time(event.created) < time(since)) continue;
    const parsed = parseServiceEvent(event, known);
    if (!parsed) continue;
    present.add(event.id);

    const row = byEvent.get(event.id);
    if (!row) {
      plan.inserts.push({
        ...parsed,
        booked_at: event.created,
        calendar_event_id: event.id,
        calendar_updated_at: event.updated,
        source: CALENDAR_SOURCE,
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
