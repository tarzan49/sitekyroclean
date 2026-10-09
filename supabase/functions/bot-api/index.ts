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
//   availability two free times for a locality, from the owner's calendar
//               (secret iCal address, GOOGLE_CALENDAR_ICS_URL) with the rules
//               of src/lib/botAvailability.ts (2026-10-07). Only times go back:
//               no client's name, phone or address leaves this function.
//   hold, release the bot's pre-booking (2026-10-08): when a client accepts a
//               time, check it is still free and write "Pré-reserva – …" in the
//               owner's calendar through his Apps Script (BOT_HOLD_URL +
//               BOT_HOLD_KEY, ReservasBot.gs); one per conversationId, moved
//               when the client changes the time. Only times go back.
//   owner-booking the owner wrote "fica agendado" in a chat (2026-10-09): the bot
//               server sends what it read from the chat and this writes
//               "A confirmar · Serviço …" in his calendar (same Apps Script),
//               unless he already has a "Serviço" for that phone that day.
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
import { botAvailability, botQuote, listBotCities, planBotHold, planOwnerBooking } from "../_shared/botEngine.generated.js";
import { parseIcs, type CalendarEvent } from "../_shared/ics.ts";
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
/** The owner's calendar, or why it could not be read. */
export type CalendarSource = () => Promise<{ events: CalendarEvent[] } | { error: string }>;
export interface BotEnv {
  botKey: string | undefined;
  leads: LeadsStore | null;
  calendar?: CalendarSource | null;
  followUps?: FollowUpStore | null;
  holds?: HoldStore | null;
  writeCalendar?: CalendarWriter | null;
  now?: () => Date;
}

/** One pre-booking per conversation (table bot_calendar_holds). */
export interface HoldRow { conversation_id: string; event_id: string; title: string; starts_at: string; ends_at: string; updated_at?: string; released_at?: string | null }
export interface HoldStore {
  get(conversationId: string): Promise<HoldRow | null | { error: string }>;
  /** Live pre-bookings written since `sinceIso`. */
  recent(sinceIso: string): Promise<HoldRow[] | { error: string }>;
  save(row: HoldRow): Promise<string | null>;
  release(conversationId: string): Promise<string | null>;
}
/** The owner's Apps Script (ReservasBot.gs). */
export type CalendarWriter = (payload: Record<string, unknown>) => Promise<{ ok: true; eventId?: string; released?: boolean; reason?: string } | { ok: false; error: string }>;

/**
 * Google's secret iCal address can take a while to show a new event. A
 * pre-booking written in the last hours and not yet in the feed still busies
 * its time; once the feed has it, the feed wins (the owner may have moved,
 * renamed or deleted it).
 */
const HOLD_FEED_LAG_MS = 3 * 60 * 60_000;
async function withRecentHolds(events: CalendarEvent[], holds: HoldStore | null | undefined, now: Date): Promise<CalendarEvent[]> {
  if (!holds) return events;
  const rows = await holds.recent(new Date(now.getTime() - HOLD_FEED_LAG_MS).toISOString());
  if ("error" in rows) return events;
  const inFeed = new Set(events.map(e => e.id));
  const extra = rows.filter(r => !r.released_at && !inFeed.has(r.event_id)).map(r => ({
    id: r.event_id, summary: r.title, description: "", location: "", startDate: r.starts_at.slice(0, 10),
    created: r.updated_at ?? r.starts_at, updated: r.updated_at ?? r.starts_at, status: "CONFIRMED", start: r.starts_at, end: r.ends_at,
  }));
  return events.concat(extra);
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
    case "availability": {
      if (!env.calendar) return createErrorResponse("Calendário por ligar", 503);
      const cal = await env.calendar();
      // Never guess: without the calendar the bot hands the date to the owner (replies 2.6).
      if ("error" in cal) return createErrorResponse(cal.error, 502);
      const now = env.now?.() ?? new Date();
      const result = botAvailability(body, await withRecentHolds(cal.events, env.holds, now), now);
      return "error" in result ? createErrorResponse(String(result.error), 400) : createSuccessResponse({ availability: result });
    }
    case "owner-booking":
      if (!env.calendar || !env.holds || !env.writeCalendar) return createErrorResponse("Pré-reservas por ligar", 503);
      return await ownerBooking(body, env);
    case "hold":
    case "release":
      if (!env.calendar || !env.holds || !env.writeCalendar) return createErrorResponse("Pré-reservas por ligar", 503);
      return await (body.action === "hold" ? holdSlot(body, env) : releaseSlot(body, env));
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
      return createErrorResponse("action tem de ser quote, cities, availability, hold, release, owner-booking, find-order, create-lead, follow-ups, client-plan, log-touch ou log-message", 400);
  }
}

async function holdSlot(body: Row, env: BotEnv): Promise<Response> {
  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  if (!conversationId) return createErrorResponse("conversationId em falta", 400);
  const existing = await env.holds!.get(conversationId);
  if (existing && "error" in existing) return createErrorResponse("Pré-reservas indisponíveis", 503);
  const live = existing && !existing.released_at ? existing : null;
  const cal = await env.calendar!();
  if ("error" in cal) return createErrorResponse(cal.error, 502);
  const now = env.now?.() ?? new Date();
  const plan = planBotHold(body, await withRecentHolds(cal.events, env.holds, now), now, live?.event_id ?? null);
  if ("error" in plan) return createErrorResponse(String(plan.error), 400);
  // The bundle is plain JS, so Deno cannot narrow on `ok`: check the event itself.
  if (!plan.ok || !plan.event) return createSuccessResponse({ hold: plan });
  const event = plan.event;
  const written = await env.writeCalendar!({ action: "hold", conversationId, eventId: live?.event_id ?? null, ...event });
  if (!written.ok || !written.eventId) {
    const detail = written.ok ? "sem eventId" : written.error;
    safeLog("warn", "bot hold not written", { error: detail });
    return createErrorResponse(`Não foi possível escrever no calendário (${detail.slice(0, 200)})`, 502);
  }
  const saveError = await env.holds!.save({
    conversation_id: conversationId, event_id: written.eventId, title: event.title,
    starts_at: event.start, ends_at: event.end, updated_at: now.toISOString(), released_at: null,
  });
  if (saveError) safeLog("warn", "bot hold written but not saved", { error: saveError });
  calendarCache = null;
  return createSuccessResponse({ hold: { ok: true, slot: plan.slot, moved: !!live } });
}

async function ownerBooking(body: Row, env: BotEnv): Promise<Response> {
  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  if (!conversationId) return createErrorResponse("conversationId em falta", 400);
  const cal = await env.calendar!();
  if ("error" in cal) return createErrorResponse(cal.error, 502);
  const plan = planOwnerBooking(body, cal.events);
  if ("error" in plan) return createErrorResponse(String(plan.error), 400);
  if (!plan.ok || !plan.event) return createSuccessResponse({ booking: { ok: false, exists: true } });
  const event = plan.event;
  const existing = await env.holds!.get(conversationId);
  const live = existing && !("error" in existing) && !existing.released_at ? existing : null;
  // Same conversation: the bot's own "Pré-reserva" (or an earlier "A confirmar") becomes this one.
  const written = await env.writeCalendar!({ action: "hold", conversationId, eventId: live?.event_id ?? null, ...event });
  if (!written.ok || !written.eventId) {
    const detail = written.ok ? "sem eventId" : written.error;
    return createErrorResponse(`Não foi possível escrever no calendário (${detail.slice(0, 200)})`, 502);
  }
  const now = env.now?.() ?? new Date();
  const saveError = await env.holds!.save({
    conversation_id: conversationId, event_id: written.eventId, title: event.title,
    starts_at: event.start, ends_at: event.end, updated_at: now.toISOString(), released_at: null,
  });
  if (saveError) safeLog("warn", "owner booking written but not saved", { error: saveError });
  calendarCache = null;
  return createSuccessResponse({ booking: { ok: true, start: event.start, moved: !!live } });
}

async function releaseSlot(body: Row, env: BotEnv): Promise<Response> {
  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  if (!conversationId) return createErrorResponse("conversationId em falta", 400);
  const existing = await env.holds!.get(conversationId);
  if (existing && "error" in existing) return createErrorResponse("Pré-reservas indisponíveis", 503);
  if (!existing || existing.released_at) return createSuccessResponse({ release: { released: false, reason: "sem pré-reserva" } });
  const done = await env.writeCalendar!({ action: "release", eventId: existing.event_id });
  if (!done.ok) return createErrorResponse(`Não foi possível apagar a pré-reserva (${done.error.slice(0, 200)})`, 502);
  await env.holds!.release(conversationId);
  calendarCache = null;
  return createSuccessResponse({ release: { released: !!done.released, reason: done.reason ?? null } });
}

function supabaseHolds(): HoldStore | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  const cols = "conversation_id, event_id, title, starts_at, ends_at, updated_at, released_at";
  return {
    async get(id) {
      const { data, error } = await client.from("bot_calendar_holds").select(cols).eq("conversation_id", id).limit(1);
      if (error) return { error: error.message };
      return (data?.[0] as HoldRow | undefined) ?? null;
    },
    async recent(since) {
      const { data, error } = await client.from("bot_calendar_holds").select(cols).is("released_at", null).gte("updated_at", since);
      if (error) return { error: error.message };
      return (data ?? []) as HoldRow[];
    },
    async save(row) {
      const { error } = await client.from("bot_calendar_holds").upsert(row, { onConflict: "conversation_id" });
      return error?.message ?? null;
    },
    async release(id) {
      const { error } = await client.from("bot_calendar_holds").update({ released_at: new Date().toISOString() }).eq("conversation_id", id);
      return error?.message ?? null;
    },
  };
}

function appsScriptWriter(): CalendarWriter | null {
  const url = Deno.env.get("BOT_HOLD_URL") ?? "";
  const key = Deno.env.get("BOT_HOLD_KEY") ?? "";
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.hostname !== "script.google.com" || !key) return null;
  } catch {
    return null;
  }
  const once = async (payload: Record<string, unknown>): Promise<Awaited<ReturnType<CalendarWriter>>> => {
    try {
      // Apps Script answers a POST with a redirect to the result; fetch follows it with a GET.
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, key }), signal: AbortSignal.timeout(30_000) });
      const raw = await res.text();
      let json: Record<string, unknown> | null = null;
      try { json = JSON.parse(raw); } catch { /* below */ }
      if (!json || typeof json !== "object") return { ok: false, error: `resposta inválida (${res.status}): ${raw.replace(/\s+/g, " ").slice(0, 160)}` };
      return json.ok ? { ok: true, eventId: json.eventId as string | undefined, released: json.released as boolean | undefined, reason: json.reason as string | undefined } : { ok: false, error: String(json.error ?? "erro") };
    } catch (e) {
      return { ok: false, error: `sem resposta do Apps Script: ${e instanceof Error ? e.message : String(e)}` };
    }
  };
  // One retry: the script finds the conversation's pre-booking by its "bot:" mark,
  // so a hold whose answer was lost is updated, never written twice.
  return async payload => {
    const first = await once(payload);
    if (first.ok) return first;
    safeLog("warn", "apps script call failed, retrying", { error: first.error });
    return await once(payload);
  };
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

const CALENDAR_CACHE_MS = 60_000;
let calendarCache: { at: number; events: CalendarEvent[] } | null = null;

/** Reads the owner's calendar feed, kept for a minute so a burst of drafts reads it once. */
function icsCalendar(): CalendarSource | null {
  const url = Deno.env.get("GOOGLE_CALENDAR_ICS_URL") ?? "";
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.hostname !== "calendar.google.com" || !u.pathname.endsWith(".ics")) return null;
  } catch {
    return null;
  }
  return async () => {
    if (calendarCache && Date.now() - calendarCache.at < CALENDAR_CACHE_MS) return { events: calendarCache.events };
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) return { error: "Não foi possível ler o calendário" };
      const { events, totalEvents } = parseIcs(new Uint8Array(await res.arrayBuffer()));
      // An empty feed is almost surely Google's error: "all free" would be a lie.
      if (totalEvents === 0) return { error: "O calendário veio vazio" };
      calendarCache = { at: Date.now(), events };
      return { events };
    } catch {
      return { error: "Não foi possível ler o calendário" };
    }
  };
}

// `import.meta.main` is only true when this file is the entry point, so the
// tests can import `handleBotRequest` without starting a server.
if (import.meta.main) {
  serve(req => handleBotRequest(req, { botKey: Deno.env.get("BOT_API_KEY"), leads: supabaseLeads(), followUps: supabaseFollowUps(), calendar: icsCalendar(), holds: supabaseHolds(), writeCalendar: appsScriptWriter() }));
}
