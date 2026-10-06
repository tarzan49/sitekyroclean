// API for the WhatsApp bot (2026-09-28). The bot runs on a server of its own
// and talks to the site only through here, with a key of its own
// (secret BOT_API_KEY, header `x-bot-key`). It never gets the service role
// key and never reads `leads` directly: that table holds every client's name,
// phone and address, and the service role key skips RLS entirely.
//
// Actions, POST {"action": ...}:
//   quote       price items with the site's own engine (botEngine.generated.js,
//               bundled from src/lib/botQuote.ts), so the bot never does sums
//   cities      the served localities with their travel fee
//   find-order  one order by its number ("Acabei de enviar o pedido #K7X2P9"),
//               summary only: no phone, email or message
//   create-lead save the conversation as a lead, source "WhatsApp", once per
//               conversationId
//   follow-ups, client-plan, log-touch, log-message
//               client follow-up (2026-10-06): who to write to now and what to
//               say, the plan for whoever is writing, and the log of what was
//               sent and received. Same rules as the admin panel; see followUps.ts.
//
// Not `submit-lead`: that one forces source "Website" (the panel would count
// bot leads as site leads) and runs reCAPTCHA, which a server cannot pass.
// Documented for the bot developer in the owner's "4-acessos-para-o-bot".
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { botQuote, listBotCities } from "../_shared/botEngine.generated.js";
import { clientPlan, listFollowUps, logMessage, logTouch, type FollowUpStore } from "./followUps.ts";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";

const RATE_LIMIT_MAX = 300;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const MAX_BODY_BYTES = 20_000;
const AD_ORIGINS: Record<string, string> = { google: "Google", facebook: "Facebook", instagram: "Instagram" };
const LIMITS = { name: 120, phone: 40, service: 120, details: 4000, location: 120 } as const;

type Row = Record<string, unknown>;
interface QueryResult { data: Row[] | null; error: { code?: string; message: string } | null }
/** The two queries this function makes, so tests can pass a fake table. */
export interface LeadsStore {
  findBy(column: "booking_id" | "lead_id", value: string, columns: string): Promise<QueryResult>;
  insert(row: Row): Promise<QueryResult>;
}
export interface BotEnv {
  botKey: string | undefined;
  leads: LeadsStore | null;
  followUps?: FollowUpStore | null;
  now?: () => Date;
}

const encoder = new TextEncoder();
async function sameSecret(given: string, expected: string): Promise<boolean> {
  // Compare digests, not strings: same length, no early exit.
  const [a, b] = await Promise.all([given, expected].map(v => crypto.subtle.digest("SHA-256", encoder.encode(v))));
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const t = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  return t && t.length <= max ? t : null;
};

const ORDER_NUMBER = /^[A-Z0-9]{4,12}$/;
const LEAD_ID = /^[LW]-[a-z0-9-]{6,40}$/;
const SUMMARY_COLUMNS = "booking_id, created_at, name, service, details, location, value, funnel_status";

async function findOrder(body: Row, leads: LeadsStore): Promise<Response> {
  const raw = typeof body.order === "string" ? body.order.trim().replace(/^#/, "") : "";
  const upper = raw.toUpperCase();
  const column = ORDER_NUMBER.test(upper) ? "booking_id" : LEAD_ID.test(raw) ? "lead_id" : null;
  if (!column) return createErrorResponse("order tem de ser o número do pedido (ex.: K7X2P9)", 400);
  const { data, error } = await leads.findBy(column, column === "booking_id" ? upper : raw, SUMMARY_COLUMNS);
  if (error) {
    safeLog("error", "[bot-api] find-order falhou", { message: error.message });
    return createErrorResponse("Não foi possível procurar o pedido", 500);
  }
  const row = data?.[0];
  if (!row) return createSuccessResponse({ found: false });
  const firstName = typeof row.name === "string" ? row.name.trim().split(/\s+/)[0] ?? "" : "";
  return createSuccessResponse({
    found: true,
    order: {
      number: row.booking_id,
      createdAt: row.created_at,
      firstName,
      service: row.service,
      details: row.details,
      location: row.location,
      value: row.value,
      status: row.funnel_status,
    },
  });
}

async function leadIdFor(conversationId: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(`whatsapp-bot:${conversationId}`)));
  return `W-${Array.from(digest.slice(0, 8), b => b.toString(16).padStart(2, "0")).join("")}`;
}

function orderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(8)), b => alphabet[b % alphabet.length]).join("");
}

async function createLead(body: Row, leads: LeadsStore): Promise<Response> {
  const conversationId = text(body.conversationId, 200);
  const name = text(body.name, LIMITS.name);
  const phone = text(body.phone, LIMITS.phone);
  const service = text(body.service, LIMITS.service);
  if (!conversationId || !name || !phone || !service) {
    return createErrorResponse("create-lead precisa de conversationId, name, phone e service", 400);
  }
  if (!/^\+?[0-9 ()-]{6,40}$/.test(phone)) return createErrorResponse("phone inválido", 400);
  const details = body.details === undefined ? "" : text(body.details, LIMITS.details);
  const location = body.location === undefined ? "" : text(body.location, LIMITS.location);
  if (details === null || location === null) return createErrorResponse("details ou location inválidos", 400);
  const value = body.value ?? null;
  if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100_000)) {
    return createErrorResponse("value tem de ser um número em euros, ou null para sob orçamento", 400);
  }
  const adOrigin = body.adOrigin ?? null;
  if (adOrigin !== null && (typeof adOrigin !== "string" || !(adOrigin in AD_ORIGINS))) {
    return createErrorResponse("adOrigin tem de ser google, facebook, instagram ou null", 400);
  }

  const leadId = await leadIdFor(conversationId);
  const existing = await leads.findBy("lead_id", leadId, "booking_id");
  if (existing.data?.[0]) return createSuccessResponse({ orderNumber: existing.data[0].booking_id, duplicate: true });

  const adNote = adOrigin ? `Veio de um anúncio: ${AD_ORIGINS[adOrigin]}` : "";
  const number = orderNumber();
  const inserted = await leads.insert({
    name,
    phone,
    service,
    details,
    location,
    value: value === null ? "Sob orçamento" : `${value}€`,
    quoted_value: value,
    booking_id: number,
    lead_id: leadId,
    source: "WhatsApp",
    status: "pending",
    funnel_status: "NEW",
    notes: ["Registado pelo bot de WhatsApp", adNote].filter(Boolean).join("\n"),
  });
  if (inserted.error) {
    // Two calls for the same conversation at once: the unique index on
    // lead_id stops the second, and the first one's number is the answer.
    if (inserted.error.code === "23505") {
      const again = await leads.findBy("lead_id", leadId, "booking_id");
      if (again.data?.[0]) return createSuccessResponse({ orderNumber: again.data[0].booking_id, duplicate: true });
    }
    safeLog("error", "[bot-api] create-lead falhou", { message: inserted.error.message });
    return createErrorResponse("Não foi possível gravar o pedido", 500);
  }
  return createSuccessResponse({ orderNumber: number, duplicate: false });
}

export async function handleBotRequest(req: Request, env: BotEnv): Promise<Response> {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) return createErrorResponse("Método não permitido", 405);

  const limit = checkRateLimit(`bot-api:${getClientIP(req)}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!limit.allowed) {
    return createErrorResponse("Demasiados pedidos seguidos", 429, getRateLimitHeaders(limit.remaining, limit.resetAt));
  }

  // Fail closed: without the secret nobody gets in, not even with an empty key.
  if (!env.botKey || env.botKey.length < 32) {
    safeLog("error", "[bot-api] BOT_API_KEY em falta ou curta demais", {});
    return createErrorResponse("Serviço por configurar", 503);
  }
  if (!(await sameSecret(req.headers.get("x-bot-key") ?? "", env.botKey))) {
    return createErrorResponse("Não autorizado", 401);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return createErrorResponse("Pedido demasiado grande", 413);
  let body: Row;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed;
  } catch {
    return createErrorResponse("O corpo tem de ser um objeto JSON", 400);
  }

  switch (body.action) {
    case "quote": {
      const result = botQuote(body);
      // The bundle is plain JS, so Deno sees `ok` as boolean: narrow on `error`.
      return "error" in result ? createErrorResponse(String(result.error), 400) : createSuccessResponse({ quote: result });
    }
    case "cities":
      return createSuccessResponse({ cities: listBotCities() });
    case "find-order":
      if (!env.leads) return createErrorResponse("Serviço indisponível", 503);
      return await findOrder(body, env.leads);
    case "create-lead":
      if (!env.leads) return createErrorResponse("Serviço indisponível", 503);
      return await createLead(body, env.leads);
    case "follow-ups":
    case "client-plan":
    case "log-touch":
    case "log-message": {
      if (!env.followUps) return createErrorResponse("Serviço indisponível", 503);
      const now = env.now?.() ?? new Date();
      if (body.action === "follow-ups") return await listFollowUps(body, env.followUps, now);
      if (body.action === "client-plan") return await clientPlan(body, env.followUps, now);
      if (body.action === "log-touch") return await logTouch(body, env.followUps, now);
      return await logMessage(body, env.followUps, now);
    }
    default:
      return createErrorResponse("action tem de ser quote, cities, find-order, create-lead, follow-ups, client-plan, log-touch ou log-message", 400);
  }
}

function supabaseLeads(): LeadsStore | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  return {
    async findBy(column, value, columns) {
      const { data, error } = await client.from("leads").select(columns).eq(column, value).order("created_at", { ascending: false }).limit(1);
      return { data: data as Row[] | null, error };
    },
    async insert(row) {
      const { data, error } = await client.from("leads").insert(row).select("booking_id");
      return { data: data as Row[] | null, error };
    },
  };
}

function supabaseFollowUps(): FollowUpStore | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  return {
    async load() {
      const since = new Date(Date.now() - 400 * 86_400_000).toISOString();
      const [c, s, t] = await Promise.all([
        client.from("clients").select("*"),
        client.from("service_requests").select("id, request_date, description, billed_value, client_name, city, phone, locality, booked_at, calendar_missing_since"),
        client.from("client_touches").select("id, client_id, kind, campaign, template, skipped, note, channel, created_at").gte("created_at", since),
      ]);
      const error = c.error ?? s.error ?? t.error;
      if (error) return { error: error.message };
      return { clients: c.data ?? [], services: s.data ?? [], touches: t.data ?? [] };
    },
    async findClient(key9) {
      const { data, error } = await client.from("clients").select("*").like("phone", `%${key9}`).limit(1);
      if (error) return { error: error.message };
      return (data?.[0] as Row | undefined) ?? null;
    },
    async insertClient(row) {
      const { data, error } = await client.from("clients").insert(row).select("*").single();
      if (error) return { error: error.message, code: error.code };
      return data as Row;
    },
    async updateClient(id, patch) {
      const { error } = await client.from("clients").update(patch).eq("id", id);
      return error?.message ?? null;
    },
    async insertTouch(row) {
      const { error } = await client.from("client_touches").insert(row);
      return error?.message ?? null;
    },
  };
}

// `import.meta.main` is only true when this file is the entry point, so the
// tests can import `handleBotRequest` without starting a server.
if (import.meta.main) {
  serve(req => handleBotRequest(req, { botKey: Deno.env.get("BOT_API_KEY"), leads: supabaseLeads(), followUps: supabaseFollowUps() }));
}
