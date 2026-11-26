// Corre a sincronização do Google Calendar para o CRM (service_requests): lê os
// eventos pela função `calendar-events`, planeia com `planCalendarSync` e
// escreve. Partilhado pelo separador CRM e pelo separador Google Ads, para o
// segundo não mostrar fechos de ontem só porque o CRM ainda não foi aberto hoje.
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent } from "@/lib/calendarServices";
import { CALENDAR_FETCH_SINCE, type SyncPlan, type SyncableRow } from "@/lib/calendarSync";
import { applyCalendarSync } from "@/lib/crmSyncCore";

export type CrmSyncResult =
  | { status: "not-configured" }
  | { status: "done"; changed: boolean; counts: SyncPlan["counts"] };

/** O motivo que a função devolveu e o estado HTTP, em vez do "non-2xx" genérico do supabase-js. */
export async function calendarErrorMessage(data: { error?: string } | null | undefined, fnError: unknown): Promise<string> {
  if (data?.error) return data.error;
  const { context, message } = (fnError ?? {}) as { context?: Response; message?: string };
  if (typeof context?.status !== "number") return message ?? "Erro ao ler o calendário";
  const body = await context.clone().json().catch(() => null) as { error?: string; message?: string } | null;
  return `${body?.error ?? body?.message ?? "Erro ao ler o calendário"} (HTTP ${context.status})`;
}

/** Lança em caso de erro; "not-configured" quando falta a secret do calendário. */
export async function syncCalendarIntoCrm(rows: Array<SyncableRow & { phone: string | null }>): Promise<CrmSyncResult> {
  const { data, error: fnError } = await supabase.functions.invoke("calendar-events", {
    body: { since: CALENDAR_FETCH_SINCE },
  });
  if (fnError || !data?.success) {
    if ((fnError as { context?: Response } | null)?.context?.status === 503) return { status: "not-configured" };
    throw new Error(await calendarErrorMessage(data, fnError));
  }
  const events = (data.events ?? []) as CalendarEvent[];
  const r = await applyCalendarSync(supabase, rows, events);
  return { status: "done", changed: r.inserts + r.updates > 0, counts: r.counts };
}
