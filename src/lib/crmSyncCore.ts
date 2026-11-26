// O passo da sincronização Google Calendar → CRM que escreve na base, sem o
// cliente Supabase do browser. Usado pelo separador CRM (crmCalendarSync.ts) e
// pela Edge Function `crm-calendar-sync`, que corre sozinha de 10 em 10 min
// (dono, 26 Nov: o CRM só se atualizava quando alguém abria o separador, e
// ficou 18 h parado). O bundle para a função sai de `npm run build:crm-sync`.
import type { CalendarEvent } from "./calendarServices";
import { CALENDAR_SYNC_SINCE, planCalendarSync, type SyncPlan, type SyncableRow } from "./calendarSync";
import { resolveMissingRegions, type MapSearch } from "./regionLookup";

export { CALENDAR_FETCH_SINCE } from "./calendarSync";

export interface CrmSyncCounts { inserts: number; updates: number; counts: SyncPlan["counts"] }

/** Erros do Supabase são objetos simples: sem isto aparece "[object Object]". */
export function dbError(e: { message?: string; details?: string | null; hint?: string | null }, what: string): Error {
  return new Error(`${what}: ${[e.message, e.details, e.hint].filter(Boolean).join(" · ") || JSON.stringify(e)}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function applyCalendarSync(db: any, rows: Array<SyncableRow & { phone: string | null }>, events: CalendarEvent[], opts: { search?: MapSearch } = {}): Promise<CrmSyncCounts> {
  // Linhas apagadas no CRM: o evento continua no calendário, mas não volta.
  const { data: ignoredRows, error: ignoredError } = await db.from("crm_ignored_calendar_events").select("event_id");
  if (ignoredError) throw dbError(ignoredError, "eventos ignorados");
  const ignored = new Set<string>((ignoredRows ?? []).map((r: { event_id: string }) => r.event_id));
  const plan = planCalendarSync(rows, events, { since: CALENDAR_SYNC_SINCE, now: new Date().toISOString(), ignored });
  // Sem cidade nem código postal: telefone de um cliente anterior, depois a rua no mapa.
  await resolveMissingRegions(rows, plan, events, opts.search ? { search: opts.search } : {});
  if (plan.inserts.length) {
    // ignoreDuplicates: duas corridas ao mesmo tempo não duplicam um serviço.
    const { error } = await db.from("service_requests")
      .upsert(plan.inserts, { onConflict: "calendar_event_id", ignoreDuplicates: true });
    if (error) throw dbError(error, "criar linhas");
  }
  for (const { id, patch } of plan.updates) {
    const { error } = await db.from("service_requests").update(patch).eq("id", id);
    if (error) throw dbError(error, `atualizar ${id} (${Object.keys(patch).join(", ")})`);
  }
  return { inserts: plan.inserts.length, updates: plan.updates.length, counts: plan.counts };
}
