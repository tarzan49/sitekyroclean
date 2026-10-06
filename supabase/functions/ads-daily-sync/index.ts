// Recebe as estatísticas diárias do Google Ads (dono, 2026-10-06). Quem chama é
// o script "Kyro | Exportar estatísticas" dentro da conta do Google Ads
// (google-ads-script/exportar-estatisticas.js), de hora a hora, com a chave
// ADS_SYNC_KEY no cabeçalho `x-ads-key`. Não há API do Google Ads aqui: a API
// precisa de um developer token aprovado, e o script já corre dentro da conta.
//
// POST {"rows": [{date, campaignId, campaignName, impressions, clicks, cost, conversions}]}
//
// Grava em ads_daily_stats (uma linha por dia e campanha) e reescreve
// ad_spend_daily ('google') com a soma de cada dia recebido, que é o gasto que
// o painel usa. O script manda sempre os últimos dias inteiros, por isso um
// ajuste tardio do Google (cliques inválidos devolvidos) acaba por chegar.
//
// Publica-se com --no-verify-jwt (o script não tem sessão do Supabase):
//   node_modules/.bin/supabase functions deploy ads-daily-sync --no-verify-jwt
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";

const MAX_BODY_BYTES = 200_000;
const MAX_ROWS = 2_000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface StatRow {
  stat_date: string;
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

/** O que a função escreve, para os testes poderem passar uma base falsa. */
export interface StatsStore {
  upsertStats(rows: StatRow[]): Promise<string | null>;
  upsertSpend(rows: { platform: "google"; spend_date: string; amount: number }[]): Promise<string | null>;
}
export interface AdsEnv { key: string | undefined; store: StatsStore | null }

const encoder = new TextEncoder();
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([given, expected].map(v => crypto.subtle.digest("SHA-256", encoder.encode(v))));
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(",", ".")) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Valida uma linha do script; devolve null se alguma coisa não bater. */
export function parseRow(raw: unknown): StatRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const date = typeof r.date === "string" && DATE.test(r.date) ? r.date : null;
  const id = typeof r.campaignId === "string" || typeof r.campaignId === "number" ? String(r.campaignId).trim() : "";
  const name = typeof r.campaignName === "string" ? r.campaignName.trim().slice(0, 200) : "";
  const impressions = num(r.impressions), clicks = num(r.clicks), cost = num(r.cost), conversions = num(r.conversions);
  if (!date || !/^\d{1,20}$/.test(id) || !name || impressions === null || clicks === null || cost === null || conversions === null) return null;
  return {
    stat_date: date, campaign_id: id, campaign_name: name,
    impressions: Math.round(impressions), clicks: Math.round(clicks),
    cost: Math.round(cost * 100) / 100, conversions: Math.round(conversions * 100) / 100,
  };
}

/** Gasto do dia = soma das campanhas desse dia. */
export function spendByDay(rows: StatRow[]) {
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.stat_date, (totals.get(r.stat_date) ?? 0) + r.cost);
  return [...totals].map(([spend_date, amount]) => ({ platform: "google" as const, spend_date, amount: Math.round(amount * 100) / 100 }));
}

export async function handleAdsRequest(req: Request, env: AdsEnv): Promise<Response> {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) return createErrorResponse("Método não permitido", 405);

  if (!env.key || env.key.length < 32) {
    safeLog("error", "[ads-daily-sync] ADS_SYNC_KEY em falta ou curta demais", {});
    return createErrorResponse("Serviço por configurar", 503);
  }
  if (!(await sameSecret(req.headers.get("x-ads-key") ?? "", env.key))) {
    return createErrorResponse("Não autorizado", 401);
  }
  if (!env.store) return createErrorResponse("Serviço indisponível", 503);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return createErrorResponse("Pedido demasiado grande", 413);
  let list: unknown;
  try {
    list = (JSON.parse(raw) as { rows?: unknown })?.rows;
  } catch {
    return createErrorResponse("O corpo tem de ser JSON", 400);
  }
  if (!Array.isArray(list) || list.length > MAX_ROWS) return createErrorResponse(`rows tem de ser uma lista até ${MAX_ROWS} linhas`, 400);

  const rows = list.map(parseRow);
  const bad = rows.findIndex(r => r === null);
  if (bad >= 0) return createErrorResponse(`Linha ${bad + 1} inválida`, 400);
  const valid = rows as StatRow[];
  if (!valid.length) return createSuccessResponse({ saved: 0, days: 0 });

  const statsError = await env.store.upsertStats(valid);
  if (statsError) {
    safeLog("error", "[ads-daily-sync] upsert ads_daily_stats falhou", { message: statsError });
    return createErrorResponse("Não foi possível gravar", 500);
  }
  const spend = spendByDay(valid);
  const spendError = await env.store.upsertSpend(spend);
  if (spendError) {
    safeLog("error", "[ads-daily-sync] upsert ad_spend_daily falhou", { message: spendError });
    return createErrorResponse("Não foi possível gravar o gasto", 500);
  }
  return createSuccessResponse({ saved: valid.length, days: spend.length });
}

function supabaseStore(): StatsStore | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  const now = () => new Date().toISOString();
  return {
    async upsertStats(rows) {
      const { error } = await client.from("ads_daily_stats")
        .upsert(rows.map(r => ({ ...r, updated_at: now() })), { onConflict: "stat_date,campaign_id" });
      return error?.message ?? null;
    },
    async upsertSpend(rows) {
      const { error } = await client.from("ad_spend_daily")
        .upsert(rows.map(r => ({ ...r, updated_at: now() })), { onConflict: "platform,spend_date" });
      return error?.message ?? null;
    },
  };
}

if (import.meta.main) {
  serve(req => handleAdsRequest(req, { key: Deno.env.get("ADS_SYNC_KEY"), store: supabaseStore() }));
}
