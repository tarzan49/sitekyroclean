// Sincroniza o Google Calendar do dono com o CRM (service_requests) sozinha,
// de 10 em 10 min pelo pg_cron (dono, 26 Nov 2026: o CRM só se atualizava
// quando alguém abria o separador e ficou 18 h parado). As regras são as do
// separador CRM, no bundle gerado de src/lib/crmSyncCore.ts.
//
// Chamada só com o cabeçalho x-sync-key = secret CRM_SYNC_KEY (cópia no Vault
// como `crm_sync_key`, para o cron). Publicar com --no-verify-jwt.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseIcs } from "../_shared/ics.ts";
// @ts-ignore bundle JS gerado
import { applyCalendarSync, CALENDAR_FETCH_SINCE } from "../_shared/crmSync.generated.js";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

serve(async (req: Request): Promise<Response> => {
  const key = Deno.env.get("CRM_SYNC_KEY") ?? "";
  if (!key || req.headers.get("x-sync-key") !== key) return json({ error: "Não autorizado" }, 401);

  const icsUrl = Deno.env.get("GOOGLE_CALENDAR_ICS_URL") ?? "";
  if (!icsUrl.startsWith("https://calendar.google.com/")) return json({ error: "Calendário por ligar" }, 503);

  try {
    const res = await fetch(icsUrl, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return json({ error: `Google ${res.status}` }, 502);
    const { events, totalEvents } = parseIcs(new Uint8Array(await res.arrayBuffer()));
    // Feed vazio = erro da Google; sem isto todos os serviços contavam como apagados.
    if (totalEvents === 0) return json({ error: "O calendário veio vazio" }, 502);
    const since = Date.parse(CALENDAR_FETCH_SINCE);
    const recent = events.filter((e) => Date.parse(e.created) >= since).sort((a, b) => a.created.localeCompare(b.created));

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: rows, error } = await db.from("service_requests").select("*");
    if (error) return json({ error: error.message }, 500);

    const result = await applyCalendarSync(db, rows ?? [], recent);
    console.log("[crm-calendar-sync]", JSON.stringify(result));
    return json({ success: true, ...result });
  } catch (e) {
    console.error("[crm-calendar-sync]", e instanceof Error ? e.message : String(e));
    return json({ error: e instanceof Error ? e.message : "Falhou" }, 500);
  }
});
