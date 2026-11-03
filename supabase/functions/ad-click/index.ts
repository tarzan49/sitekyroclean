/**
 * Regista o código "ref." de uma visita de anúncio do Google com o identificador
 * do clique (tabela ad_clicks). Chamada pelo site com `navigator.sendBeacon` no
 * primeiro clique para o WhatsApp (src/lib/adsWhatsAppMessage.ts). Pública
 * (deploy com --no-verify-jwt): só aceita um código no formato certo e ids de
 * clique, e nunca reescreve um código que já exista.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/security.ts";

const REF = /^[A-HJ-NP-Z2-9]{5}$/;
const CLICK_ID = /^[\w-]{10,200}$/;

export function parseAdClick(raw: unknown): { ref: string; gclid: string | null; gbraid: string | null; wbraid: string | null; page: string | null } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const ref = String(r.ref ?? "");
  if (!REF.test(ref)) return null;
  const id = (v: unknown) => (typeof v === "string" && CLICK_ID.test(v) ? v : null);
  const gclid = id(r.gclid), gbraid = id(r.gbraid), wbraid = id(r.wbraid);
  if (!gclid && !gbraid && !wbraid) return null;
  const page = typeof r.page === "string" ? r.page.slice(0, 200) : null;
  return { ref, gclid, gbraid, wbraid, page };
}

if (import.meta.main) {
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  Deno.serve(async req => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "POST") return new Response(null, { status: 405, headers: corsHeaders });
    let body: unknown;
    // sendBeacon manda text/plain (sem preflight): lê-se o texto e só depois o JSON.
    try { body = JSON.parse((await req.text()).slice(0, 2000)); } catch { body = null; }
    const row = parseAdClick(body);
    if (!row) return new Response(null, { status: 400, headers: corsHeaders });
    const { error } = await client.from("ad_clicks").upsert(row, { onConflict: "ref", ignoreDuplicates: true });
    if (error) console.error("ad_clicks", error.message);
    return new Response(null, { status: error ? 500 : 204, headers: corsHeaders });
  });
}
