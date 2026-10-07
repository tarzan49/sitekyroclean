// Corre a sincronização do Google Calendar para o CRM (service_requests): lê os
// eventos pela função `calendar-events`, planeia com `planCalendarSync` e
// escreve. Partilhado pelo separador CRM e pelo separador Google Ads, para o
// segundo não mostrar fechos de ontem só porque o CRM ainda não foi aberto hoje.
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent } from "@/lib/calendarServices";
import { CALENDAR_FETCH_SINCE, CALENDAR_SYNC_SINCE, planCalendarSync, type SyncPlan, type SyncableRow } from "@/lib/calendarSync";
import { resolveMissingRegions } from "@/lib/regionLookup";

export type CrmSyncResult =
  | { status: "not-configured" }
  | { status: "done"; changed: boolean; counts: SyncPlan["counts"] };

/** Lança em caso de erro; "not-configured" quando falta a secret do calendário. */
export async function syncCalendarIntoCrm(rows: Array<SyncableRow & { phone: string | null }>): Promise<CrmSyncResult> {
  const { data, error: fnError } = await supabase.functions.invoke("calendar-events", {
    body: { since: CALENDAR_FETCH_SINCE },
  });
  if (fnError || !data?.success) {
    if ((fnError as { context?: Response } | null)?.context?.status === 503) return { status: "not-configured" };
    throw new Error(data?.error ?? fnError?.message ?? "Erro ao ler o calendário");
  }
  const events = (data.events ?? []) as CalendarEvent[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  // Linhas apagadas no CRM: o evento continua no calendário, mas não volta.
  const { data: ignoredRows, error: ignoredError } = await db.from("crm_ignored_calendar_events").select("event_id");
  if (ignoredError) throw ignoredError;
  const ignored = new Set<string>((ignoredRows ?? []).map((r: { event_id: string }) => r.event_id));
  const plan = planCalendarSync(rows, events, { since: CALENDAR_SYNC_SINCE, now: new Date().toISOString(), ignored });
  // Sem cidade nem código postal: telefone de um cliente anterior, depois a rua no mapa.
  await resolveMissingRegions(rows, plan, events);
  if (plan.inserts.length) {
    // ignoreDuplicates: dois separadores abertos não duplicam um serviço.
    const { error } = await db.from("service_requests")
      .upsert(plan.inserts, { onConflict: "calendar_event_id", ignoreDuplicates: true });
    if (error) throw error;
  }
  for (const { id, patch } of plan.updates) {
    const { error } = await db.from("service_requests").update(patch).eq("id", id);
    if (error) throw error;
  }
  return { status: "done", changed: plan.inserts.length + plan.updates.length > 0, counts: plan.counts };
}
