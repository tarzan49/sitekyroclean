// Gasto diário da Meta por campanha (dono, 2026-11-18: "os gastos só começam a
// partir dos 500 € de hoje. Os 250 € para trás, deixa para trás"; "Nas métricas
// vais também ter gasto com o Meta"). Ao contrário da ads-daily-sync (o Google
// manda os dados por um script dentro da conta), aqui é a função que vai buscar:
// lê a Marketing API da conta act_618524496228897 por campanha e por dia, de
// META_FROM para a frente, e grava em meta_ads_daily_stats só as linhas que
// mudaram. Cada corrida deixa o resultado em meta_ads_sync_status (a última
// leitura boa ou o erro), que é o que o painel usa para dizer "gasto Meta por
// ligar" em vez de 0€.
//
// Quem chama: o pg_cron (kyro-meta-ads-daily-sync, de hora a hora, migração
// 20261118150000), com a chave META_ADS_SYNC_KEY no cabeçalho `x-meta-sync-key`.
// O token da Marketing API é a secret META_ADS_TOKEN e precisa da permissão
// ads_read sobre a conta de anúncios.
//
// Publica-se com --no-verify-jwt (o pg_cron não tem sessão do Supabase):
//   node_modules/.bin/supabase functions deploy meta-ads-daily-sync --no-verify-jwt
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { changedRows } from "../_shared/changedRows.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";

/** Primeiro dia que conta: o dia em que o dono carregou os 500€ (o gasto de antes fica de fora). */
export const META_FROM = "2026-11-18";
export const AD_ACCOUNT = "act_618524496228897";
const GRAPH = "https://graph.facebook.com/v21.0";
/** Conversas iniciadas, como o Gestor de Anúncios as conta. */
export const CONVERSATION_ACTION = "onsite_conversion.messaging_conversation_started_7d";
/** Depois da primeira leitura, relê só os últimos dias (a Meta ainda acerta o gasto de dias passados). */
const REREAD_DAYS = 7;
const MAX_PAGES = 20;

export interface MetaStatRow {
  stat_date: string;
  campaign_id: string;
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversations: number;
}

export interface SyncStatus { ok: boolean; rows?: number; error?: string }

/** O que a função lê e escreve, para os testes poderem passar uma base falsa. */
export interface MetaStore {
  lastStatDate(): Promise<string | null>;
  upsertStats(rows: MetaStatRow[]): Promise<string | null>;
  setStatus(status: SyncStatus): Promise<void>;
}
export interface MetaEnv {
  key: string | undefined;
  token: string | undefined;
  store: MetaStore | null;
  fetch?: typeof fetch;
  now?: Date;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const encoder = new TextEncoder();
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([given, expected].map(v => crypto.subtle.digest("SHA-256", encoder.encode(v))));
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const LISBON = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit" });
export const lisbonDay = (d: Date) => LISBON.format(d);
export function addDays(day: string, n: number): string {
  const ms = Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12) + n * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Conversas iniciadas numa linha das insights (0 se a Meta não as mandar). */
export function conversationsFrom(actions: unknown): number {
  if (!Array.isArray(actions)) return 0;
  const hit = actions.find(a => a && typeof a === "object" && (a as Record<string, unknown>).action_type === CONVERSATION_ACTION) as Record<string, unknown> | undefined;
  return Math.round(num(hit?.value) ?? 0);
}

/** Uma linha das insights (level=campaign, time_increment=1); null se alguma coisa não bater. */
export function parseInsight(raw: unknown): MetaStatRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const date = typeof r.date_start === "string" && DATE.test(r.date_start) ? r.date_start : null;
  const id = typeof r.campaign_id === "string" || typeof r.campaign_id === "number" ? String(r.campaign_id).trim() : "";
  const name = typeof r.campaign_name === "string" ? r.campaign_name.trim().slice(0, 200) : "";
  const spend = num(r.spend ?? 0), impressions = num(r.impressions ?? 0), clicks = num(r.clicks ?? 0);
  if (!date || !/^\d{1,30}$/.test(id) || !name || spend === null || impressions === null || clicks === null) return null;
  return {
    stat_date: date, campaign_id: id, campaign_name: name,
    spend: Math.round(spend * 100) / 100, impressions: Math.round(impressions), clicks: Math.round(clicks),
    conversations: conversationsFrom(r.actions),
  };
}

/** De onde ler: de META_FROM na primeira vez, depois os últimos dias já gravados. */
export function sinceDay(lastStored: string | null, from = META_FROM): string {
  if (!lastStored) return from;
  const back = addDays(lastStored, -REREAD_DAYS);
  return back > from ? back : from;
}

export function insightsUrl(token: string, since: string, until: string): string {
  const params = new URLSearchParams({
    level: "campaign",
    time_increment: "1",
    fields: "campaign_id,campaign_name,spend,impressions,clicks,actions",
    time_range: JSON.stringify({ since, until }),
    limit: "500",
    access_token: token,
  });
  return `${GRAPH}/${AD_ACCOUNT}/insights?${params}`;
}

/** Todas as páginas das insights. O erro vem com a mensagem da Meta (nunca com o token). */
export async function fetchInsights(token: string, since: string, until: string, fetchFn: typeof fetch = fetch): Promise<{ rows: MetaStatRow[] } | { error: string }> {
  const rows: MetaStatRow[] = [];
  let url: string | null = insightsUrl(token, since, until);
  for (let page = 0; url && page < MAX_PAGES; page++) {
    let body: Record<string, unknown>;
    try {
      const res = await fetchFn(url);
      body = await res.json() as Record<string, unknown>;
    } catch (e) {
      return { error: `Marketing API sem resposta (${e instanceof Error ? e.message : String(e)})` };
    }
    const err = body.error as Record<string, unknown> | undefined;
    if (err) return { error: `Marketing API: ${String(err.message ?? "erro")}`.slice(0, 400) };
    const list = Array.isArray(body.data) ? body.data : [];
    for (const raw of list) {
      const row = parseInsight(raw);
      if (!row) return { error: "Marketing API: linha inesperada nas insights" };
      rows.push(row);
    }
    const next = (body.paging as Record<string, unknown> | undefined)?.next;
    url = typeof next === "string" && next.startsWith(`${GRAPH}/`) ? next : null;
  }
  return { rows };
}

export async function handleMetaSync(req: Request, env: MetaEnv): Promise<Response> {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) return createErrorResponse("Método não permitido", 405);

  if (!env.key || env.key.length < 32) {
    safeLog("error", "[meta-ads-daily-sync] META_ADS_SYNC_KEY em falta ou curta demais", {});
    return createErrorResponse("Serviço por configurar", 503);
  }
  if (!(await sameSecret(req.headers.get("x-meta-sync-key") ?? "", env.key))) {
    return createErrorResponse("Não autorizado", 401);
  }
  if (!env.store) return createErrorResponse("Serviço indisponível", 503);

  if (!env.token) {
    await env.store.setStatus({ ok: false, error: "META_ADS_TOKEN em falta: falta um token com ads_read sobre a conta de anúncios" });
    return createErrorResponse("Gasto Meta por ligar: falta o token", 503);
  }

  const today = lisbonDay(env.now ?? new Date());
  if (today < META_FROM) return createSuccessResponse({ saved: 0, since: META_FROM, until: today });
  const since = sinceDay(await env.store.lastStatDate());
  const result = await fetchInsights(env.token, since, today, env.fetch ?? fetch);
  if ("error" in result) {
    safeLog("error", "[meta-ads-daily-sync] leitura falhou", { message: result.error });
    await env.store.setStatus({ ok: false, error: result.error });
    return createErrorResponse(result.error, 502);
  }
  const rows = result.rows.filter(r => r.stat_date >= META_FROM);
  const writeError = rows.length ? await env.store.upsertStats(rows) : null;
  if (writeError) {
    safeLog("error", "[meta-ads-daily-sync] upsert meta_ads_daily_stats falhou", { message: writeError });
    await env.store.setStatus({ ok: false, error: `Não foi possível gravar: ${writeError}`.slice(0, 400) });
    return createErrorResponse("Não foi possível gravar", 500);
  }
  await env.store.setStatus({ ok: true, rows: rows.length });
  return createSuccessResponse({ saved: rows.length, since, until: today, spend: Math.round(rows.reduce((s, r) => s + r.spend, 0) * 100) / 100 });
}

function supabaseStore(): MetaStore | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  const now = () => new Date().toISOString();
  return {
    async lastStatDate() {
      const { data } = await client.from("meta_ads_daily_stats").select("stat_date").order("stat_date", { ascending: false }).limit(1);
      return (data?.[0]?.stat_date as string | undefined) ?? null;
    },
    async upsertStats(rows) {
      const dates = [...new Set(rows.map(r => r.stat_date))];
      const { data: existing, error: readError } = await client.from("meta_ads_daily_stats").select("*").in("stat_date", dates);
      if (readError) return readError.message;
      const changed = changedRows(rows as unknown as Record<string, unknown>[], existing ?? [], ["stat_date", "campaign_id"]);
      if (!changed.length) return null;
      const { error } = await client.from("meta_ads_daily_stats")
        .upsert(changed.map(r => ({ ...r, updated_at: now() })), { onConflict: "stat_date,campaign_id" });
      return error?.message ?? null;
    },
    async setStatus(status) {
      const at = now();
      const row: Record<string, unknown> = status.ok
        ? { id: 1, last_ok_at: at, last_rows: status.rows ?? 0, last_error: null, last_error_at: null, updated_at: at }
        : { id: 1, last_error: status.error ?? "erro", last_error_at: at, updated_at: at };
      const { error } = await client.from("meta_ads_sync_status").upsert(row, { onConflict: "id" });
      if (error) safeLog("error", "[meta-ads-daily-sync] meta_ads_sync_status falhou", { message: error.message });
    },
  };
}

if (import.meta.main) {
  serve(req => handleMetaSync(req, { key: Deno.env.get("META_ADS_SYNC_KEY"), token: Deno.env.get("META_ADS_TOKEN"), store: supabaseStore() }));
}
