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
//   find-order  one quiz order by its number ("Acabei de enviar o pedido #K7X2P9") or by the chat's phone,
//               summary only: no phone, email or message
//   new-orders  quiz orders since a date, with phone and the first WhatsApp message, for the bot to write first
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
//   book        the bot closes the job (2026-10-09, owner: "fecha e escolhe a
//               equipa"): with the name and the full address, on a weekday,
//               writes his own "Serviço X€ (Y€) …" in the colour of a team with
//               room (the team-calendar script copies it to the team, the CRM
//               reads it). Saturdays, Sundays, a time another service of the zone
//               already has, no engine price or missing data:
//               a pre-booking for the owner instead, as `hold`. Only times go back.
//   owner-booking the owner wrote "fica agendado" in a chat (2026-10-09): the bot
//               server sends what it read from the chat and this writes
//               "A confirmar · Serviço …" in his calendar (same Apps Script),
//               unless he already has a "Serviço" for that phone that day.
//   agenda-check what is wrong in tomorrow's services (no team, no phone, no
//               street, outside 10h-21h, two jobs at once on a team, a job on
//               a team block) and the pre-bookings still open, with a message
//               ready for the owner (2026-10-09, src/lib/agendaCheck.ts).
//               Times, teams and the service only: no name, phone or address.
//   label-facts for each phone the bot asks about (at most 800, by their last 9
//               digits), the latest past service, the next service and the
//               next "Pré-reserva"/"A confirmar" in the owner's calendar
//               (2026-10-11, src/lib/labelFacts.ts). A service is what the CRM
//               and the team calendars count ("Serviço …", or "Limpeza" with
//               euros); "A confirmar · Serviço" is pending. Phone jids only: a
//               "@lid" or a group is skipped (its digits are not a phone), and so
//               the bot sends the chat's phone jid. The bot server's label
//               watcher (kyro-bot src/bot/labelWatch.ts) fixes "Por marcar
//               serviço", "Serviço Marcado" and "Concluído" from it. Dates and the
//               kind only: no name, address or event title. This is the only
//               action whose body may pass 20 KB (up to 40 KB, so 800 phones fit
//               in any format); the bot server sends batches of 300 anyway.
//   team-accounts what each team owes the owner (2026-10-14, owner: "todos os dias
//               à meia-noite envias a cada parceiro as contas"): the CRM services
//               still unpaid up to `date` (default today in Lisbon), by the team in
//               the calendar's "Equipa: X" line, with a message ready per team
//               (src/lib/teamAccounts.ts). The client's first name and locality
//               only, which the team already has in its calendar: no phone or address.
//   procedure-due, procedure-sent, procedure-media
//               the team procedure of each service (2026-10-14, procedure.ts,
//               src/lib/serviceProcedure.ts): services that just ended (message
//               to the team), reminders, closed deadlines; the ids of what the
//               bot sent; the photos and video the team sent in reply.
//   certificate the waterproofing certificate of the chat's client (2026-10-27, certificate.ts,
//               src/lib/botCertificate.ts): the latest done job in the CRM and its fixed number
//               (table waterproofing_certificates); the bot server prints the PDF. Name, items,
//               town, region and date only.
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
import { agendaCheck, teamAccounts, botAvailability, bookedServices, eventTeam, planBookingUpdate, teamBusyAt, TEAM_COLOR, botQuote, describeQuizOrder, isTestOrder, labelFacts, listBotCities, planBotBooking, planBotHold, planOwnerBooking } from "../_shared/botEngine.generated.js";
import { buildWhatsAppMessage, type QuotedPrice } from "../_shared/whatsappReply.ts";
import { parseIcs, type CalendarEvent } from "../_shared/ics.ts";
import { clientPlan, listFollowUps, logMessage, logTouch, type FollowUpStore } from "./followUps.ts";
import { procedureDue, procedureMedia, procedureSent, type ProcedureStore } from "./procedure.ts";
import { certificateAction, type CertificateStore } from "./certificate.ts";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";

const RATE_LIMIT_MAX = 300;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const MAX_BODY_BYTES = 20_000;
const CONVERSATION_ORIGINS = ["google", "meta", "questionario", "organico"];
/**
 * `label-facts` takes up to 800 phones. 800 digits-only phones fit in 20 KB, but
 * 800 jids ("351912345678@s.whatsapp.net") or phones written with spaces do not:
 * 800 × (40 characters, the phone limit, + quotes and comma) ≈ 34 KB. Only that
 * action may go this far; every other action keeps the 20 KB limit.
 */
const LABEL_FACTS_MAX_BODY_BYTES = 40_000;
const LABEL_FACTS_MAX_PHONES = 800;
const AD_ORIGINS: Record<string, string> = { google: "Google", facebook: "Facebook", instagram: "Instagram" };
const LIMITS = { name: 120, phone: 40, service: 120, details: 4000, location: 120 } as const;

type Row = Record<string, unknown>;
interface QueryResult { data: Row[] | null; error: { code?: string; message: string } | null }
/** The two queries this function makes, so tests can pass a fake table. */
export interface LeadsStore {
  findBy(column: "booking_id" | "lead_id", value: string, columns: string): Promise<QueryResult>;
  /** Quiz orders (not the bot's own WhatsApp leads) created since `sinceIso`, newest first. */
  recentQuiz?(sinceIso: string, columns: string): Promise<QueryResult>;
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
  /** CRM rows for `team-accounts` (service_requests). */
  accounts?: (() => Promise<{ rows: Row[]; adjustments?: Row[] } | { error: string }>) | null;
  /** service_procedure, service_requests and google_reviews for the procedure actions. */
  procedures?: ProcedureStore | null;
  /** service_requests (waterproofing jobs) and waterproofing_certificates for `certificate`. */
  certificates?: CertificateStore | null;
  /** Conversas novas do WhatsApp (tabela whatsapp_conversations), escritas pelo servidor do bot. */
  conversations?: ((rows: Row[]) => Promise<{ error?: string }>) | null;
  /** Email to the owner (Resend); null = sent, else why not. */
  notifyOwner?: ((subject: string, text: string, html?: string) => Promise<string | null>) | null;
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
const SUMMARY_COLUMNS = "booking_id, created_at, name, service, details, location, value, funnel_status, quiz_order, phone, whatsapp_phone";
/** How far back a quiz order is found by the chat's phone alone (no "#…" in the conversation). */
const PHONE_LOOKUP_DAYS = 30;
const lastNine = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "").slice(-9) : "");

/**
 * One quiz order, by its number ("Acabei de enviar o pedido #K7X2P9") or, when
 * the chat never said it, by the chat's phone (owner, 10 Oct 2026: the bot must
 * know from the first message everything the client chose in the quiz). The
 * `brief` is what the bot reads (src/lib/quizOrder.ts): items, the request for
 * its quote tool, what not to ask again and what to confirm. Never the phone,
 * the email or the full message; the client's own observations only when the
 * order was made with this chat's number.
 */
async function findOrder(body: Row, leads: LeadsStore): Promise<Response> {
  const raw = typeof body.order === "string" ? body.order.trim().replace(/^#/, "") : "";
  const phone = lastNine(body.phone);
  const upper = raw.toUpperCase();
  const column = ORDER_NUMBER.test(upper) ? "booking_id" : LEAD_ID.test(raw) ? "lead_id" : null;
  if (raw && !column) return createErrorResponse("order tem de ser o número do pedido (ex.: K7X2P9)", 400);
  if (!column && phone.length < 9) return createErrorResponse("find-order precisa de order ou phone", 400);

  let row: Row | undefined;
  let matchedBy: "number" | "phone" = "number";
  if (column) {
    const { data, error } = await leads.findBy(column, column === "booking_id" ? upper : raw, SUMMARY_COLUMNS);
    if (error) {
      safeLog("error", "[bot-api] find-order falhou", { message: error.message });
      return createErrorResponse("Não foi possível procurar o pedido", 500);
    }
    row = data?.[0];
  }
  if (!row && phone.length === 9 && leads.recentQuiz) {
    const since = new Date(Date.now() - PHONE_LOOKUP_DAYS * 86400_000).toISOString();
    const { data, error } = await leads.recentQuiz(since, SUMMARY_COLUMNS);
    if (error) safeLog("warn", "[bot-api] find-order por telefone falhou", { message: error.message });
    row = (data ?? []).find(r => lastNine(r.phone) === phone || lastNine(r.whatsapp_phone) === phone);
    matchedBy = "phone";
  }
  if (!row) return createSuccessResponse({ found: false });

  const phoneMatches = phone ? lastNine(row.phone) === phone || lastNine(row.whatsapp_phone) === phone : null;
  const brief = describeQuizOrder(row as Parameters<typeof describeQuizOrder>[0]);
  if (phoneMatches !== true) brief.observations = null;
  const firstName = typeof row.name === "string" ? row.name.trim().split(/\s+/)[0] ?? "" : "";
  return createSuccessResponse({
    found: true,
    matchedBy,
    phoneMatches,
    order: {
      number: row.booking_id,
      createdAt: row.created_at,
      firstName,
      service: row.service,
      details: row.details,
      location: row.location,
      value: row.value,
      status: row.funnel_status,
      brief,
    },
  });
}

const NEW_ORDER_COLUMNS = "booking_id, created_at, name, phone, service, service_type, details, location, value, quiz_order";
/** How far back the bot server may ask for new orders (it asks every minute; this only bounds a restart). */
const NEW_ORDERS_MAX_HOURS = 48;

/**
 * Quiz orders created after `since`, oldest first, for the bot's first WhatsApp
 * message (owner, 11 Oct 2026: "o bot enviar logo msg automática à pessoa mal o
 * orçamento me cai no email"). Each comes with the phone (the bot has to write to
 * it) and the same text as the email's "Responder no WhatsApp" button. Test
 * orders are left out. The bot server decides whether and when to send.
 */
/** The engine's price for a quiz order with table prices; null for anything on quote (rugs, U sofas, unknown city). */
export function orderPrice(r: Row): QuotedPrice | null {
  try {
    const brief = describeQuizOrder(r as never);
    if (!brief.quoteRequest || !brief.quoteExact) return null;
    const q = botQuote(brief.quoteRequest) as any;
    // Extended-trip cities (Aveiro, Alentejo Litoral) hand the TIME to the owner, never the price.
    if (!q?.ok || q.quote || (q.handToOwner && !(q.extendedTrip && q.cityKnown)) || typeof q.total !== "number" || q.rugEstimate) return null;
    const lines = (q.lines ?? []) as { label: string; amount: number | null; quote?: boolean }[];
    if (!lines.length || lines.some(l => l.quote || typeof l.amount !== "number")) return null;
    return { lines: lines.map(l => ({ label: l.label, amount: l.amount as number })), travel: Number(q.travel) || 0, total: q.total };
  } catch { return null; }
}

async function newOrders(body: Row, leads: LeadsStore): Promise<Response> {
  if (!leads.recentQuiz) return createErrorResponse("Pedidos indisponíveis", 503);
  const sinceMs = typeof body.since === "string" ? Date.parse(body.since) : NaN;
  if (!Number.isFinite(sinceMs)) return createErrorResponse("new-orders precisa de since (data ISO)", 400);
  const since = new Date(Math.max(sinceMs, Date.now() - NEW_ORDERS_MAX_HOURS * 3600_000)).toISOString();
  const { data, error } = await leads.recentQuiz(since, NEW_ORDER_COLUMNS);
  if (error) {
    safeLog("error", "[bot-api] new-orders falhou", { message: error.message });
    return createErrorResponse("Não foi possível ler os pedidos", 500);
  }
  const orders = (data ?? [])
    .filter(r => typeof r.booking_id === "string" && typeof r.phone === "string" && Date.parse(String(r.created_at)) > sinceMs)
    .filter(r => !isTestOrder(r.name as string, lastNine(r.phone)))
    .sort((a, b) => Date.parse(String(a.created_at)) - Date.parse(String(b.created_at)))
    .map(r => ({
      number: r.booking_id,
      createdAt: r.created_at,
      phone: String(r.phone),
      message: buildWhatsAppMessage(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "string" ? v : ""])), orderPrice(r)),
    }));
  return createSuccessResponse({ orders });
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
  if (raw.length > LABEL_FACTS_MAX_BODY_BYTES) return createErrorResponse("Pedido demasiado grande", 413);
  let body: Row;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed;
  } catch {
    return createErrorResponse("O corpo tem de ser um objeto JSON", 400);
  }
  if (raw.length > MAX_BODY_BYTES && body.action !== "label-facts") return createErrorResponse("Pedido demasiado grande", 413);

  switch (body.action) {
    case "quote": {
      const result = botQuote(body);
      // The bundle is plain JS, so Deno sees `ok` as boolean: narrow on `error`.
      return "error" in result ? createErrorResponse(String(result.error), 400) : createSuccessResponse({ quote: result });
    }
    case "cities":
      return createSuccessResponse({ cities: listBotCities() });
    case "new-orders":
      if (!env.leads) return createErrorResponse("Pedidos indisponíveis", 503);
      return await newOrders(body, env.leads);
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
    case "booked-services": {
      // The client's own bookings, so the bot never answers a booked client with "pré-reservado" (15 Oct 2026).
      if (!env.calendar) return createErrorResponse("Calendário por ligar", 503);
      const phone = typeof body.phone === "string" ? body.phone : "";
      if (phone.replace(/\D/g, "").length < 9) return createErrorResponse("phone em falta", 400);
      const cal = await env.calendar();
      if ("error" in cal) return createErrorResponse(cal.error, 502);
      const now = env.now?.() ?? new Date();
      return createSuccessResponse({ services: bookedServices(phone, await withRecentHolds(cal.events, env.holds, now), now) });
    }
    case "update-booking":
      if (!env.calendar || !env.writeCalendar) return createErrorResponse("Calendário por ligar", 503);
      return await updateBooking(body, env);
    case "label-facts":
      if (!env.calendar) return createErrorResponse("Calendário por ligar", 503);
      return await labelFactsFor(body, env);
    case "agenda-check": {
      if (!env.calendar) return createErrorResponse("Calendário por ligar", 503);
      const cal = await env.calendar();
      if ("error" in cal) return createErrorResponse(cal.error, 502);
      const now = env.now?.() ?? new Date();
      const date = body.date === undefined ? lisbonDate(now.getTime() + 86_400_000) : String(body.date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return createErrorResponse("date tem de ser AAAA-MM-DD", 400);
      return createSuccessResponse({ agenda: agendaCheck(cal.events, date, now) });
    }
    case "team-accounts": {
      if (!env.calendar || !env.accounts) return createErrorResponse("Contas por ligar", 503);
      const now = env.now?.() ?? new Date();
      const date = body.date === undefined ? lisbonDate(now.getTime()) : String(body.date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return createErrorResponse("date tem de ser AAAA-MM-DD", 400);
      const [cal, crm] = await Promise.all([env.calendar(), env.accounts()]);
      if ("error" in cal) return createErrorResponse(cal.error, 502);
      if ("error" in crm) return createErrorResponse(crm.error, 502);
      return createSuccessResponse({ accounts: teamAccounts(crm.rows, cal.events, date, crm.adjustments ?? []) });
    }
    case "conversations-upsert": {
      if (!env.conversations) return createErrorResponse("Conversas por ligar", 503);
      const rows = Array.isArray(body.rows) ? body.rows : null;
      if (!rows || rows.length > 150) return createErrorResponse("rows tem de ser uma lista até 150", 400);
      const clean: Row[] = [];
      for (const r of rows as Row[]) {
        const key = String(r?.contact_key ?? "");
        const at = new Date(String(r?.first_at ?? ""));
        if (!/^\d{6,20}$/.test(key) || Number.isNaN(at.getTime()) || !CONVERSATION_ORIGINS.includes(String(r.origin))) {
          return createErrorResponse("linha inválida", 400);
        }
        clean.push({ contact_key: key, is_lid: r.is_lid === true, first_at: at.toISOString(), origin: String(r.origin),
          started_by_us: r.started_by_us === true, inbound_count: Math.max(0, Math.floor(Number(r.inbound_count) || 0)), updated_at: new Date().toISOString() });
      }
      const res = await env.conversations(clean);
      if (res.error) return createErrorResponse("Não foi possível gravar as conversas", 500);
      return createSuccessResponse({ saved: clean.length });
    }
    case "certificate":
      if (!env.certificates) return createErrorResponse("Serviço indisponível", 503);
      return await certificateAction(body, env.certificates, env.now?.() ?? new Date());
    case "procedure-due":
    case "procedure-sent":
    case "procedure-media": {
      if (!env.procedures) return createErrorResponse("Procedimento por ligar", 503);
      const now = env.now?.() ?? new Date();
      if (body.action === "procedure-sent") return await procedureSent(body, env.procedures, now);
      if (body.action === "procedure-media") return await procedureMedia(body, env.procedures, now);
      if (!env.calendar) return createErrorResponse("Calendário por ligar", 503);
      const cal = await env.calendar();
      if ("error" in cal) return createErrorResponse(cal.error, 502);
      return await procedureDue(cal.events, env.procedures, now);
    }
    case "owner-booking":
      if (!env.calendar || !env.holds || !env.writeCalendar) return createErrorResponse("Pré-reservas por ligar", 503);
      return await ownerBooking(body, env);
    case "sweep-holds": {
      if (!env.calendar || !env.holds || !env.writeCalendar) return createErrorResponse("Pré-reservas por ligar", 503);
      const cal = await env.calendar();
      if ("error" in cal) return createErrorResponse(cal.error, 503);
      return createSuccessResponse({ sweep: await sweepHolds(cal.events, env.holds, env.writeCalendar, env.now?.() ?? new Date()) });
    }
    case "hold":
    case "release":
    case "book":
      if (!env.calendar || !env.holds || !env.writeCalendar) return createErrorResponse("Pré-reservas por ligar", 503);
      return await (body.action === "hold" ? holdSlot(body, env) : body.action === "book" ? bookSlot(body, env) : releaseSlot(body, env));
    // Since 12 Oct 2026 the bot speaks through Meta's official API, which cannot write to WhatsApp groups:
    // the owner alerts and the 19h agenda that went to his groups come by email instead.
    case "notify-owner": {
      if (!env.notifyOwner) return createErrorResponse("Email ao dono por ligar", 503);
      const subject = typeof body.subject === "string" ? body.subject.replace(/[\r\n]+/g, " ").trim().slice(0, 150) : "";
      const text = typeof body.text === "string" ? body.text.slice(0, 8000) : "";
      if (!subject || !text) return createErrorResponse("subject e text são obrigatórios", 400);
      // Optional HTML version: the handoff alerts are laid out for the phone (owner, 16 Oct 2026: "organiza essas informações").
      const html = typeof body.html === "string" && body.html.trim() ? body.html.slice(0, 40000) : undefined;
      const err = await env.notifyOwner(subject, text, html);
      if (err) return createErrorResponse(err, 502);
      return createSuccessResponse({ sent: true });
    }
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
      return createErrorResponse("action tem de ser quote, cities, availability, agenda-check, team-accounts, sweep-holds, label-facts, hold, book, release, owner-booking, procedure-due, procedure-sent, procedure-media, find-order, new-orders, create-lead, follow-ups, client-plan, log-touch ou log-message", 400);
  }
}

const PHONE_JID = /@(s\.whatsapp\.net|c\.us)$/i;
/**
 * The last 9 digits of a phone, or null. A phone jid gives its number (without
 * the ":device" part); a "@lid", a group or anything else with "@" is not a
 * phone, and its digits would match someone else's number.
 */
function factsKey(value: string): string | null {
  if (value.length > LIMITS.phone) return null;
  const at = value.indexOf("@");
  if (at >= 0 && !PHONE_JID.test(value)) return null;
  const key = lastNine(at >= 0 ? value.slice(0, at).split(":")[0] : value);
  return key.length === 9 ? key : null;
}

/**
 * For the bot server's label watcher (owner, 11 Oct 2026: "um bot dentro do bot
 * que constantemente esteja a vigiar as etiquetas"): per phone, the dates of the
 * latest past service, the next service and the next pre-booking. Includes the
 * bot's own bookings of the last hours that Google's feed does not show yet.
 */
async function labelFactsFor(body: Row, env: BotEnv): Promise<Response> {
  const phones = body.phones;
  if (!Array.isArray(phones)) return createErrorResponse("label-facts precisa de phones (lista de telefones)", 400);
  if (phones.length > LABEL_FACTS_MAX_PHONES) return createErrorResponse(`label-facts aceita no máximo ${LABEL_FACTS_MAX_PHONES} telefones por pedido`, 400);
  if (phones.some(p => typeof p !== "string")) return createErrorResponse("cada telefone tem de ser texto", 400);
  const keys = [...new Set((phones as string[]).map(factsKey).filter((k): k is string => k !== null))];
  if (keys.length === 0) return createSuccessResponse({ facts: {} });
  const cal = await env.calendar!();
  if ("error" in cal) return createErrorResponse(cal.error, 502);
  const now = env.now?.() ?? new Date();
  return createSuccessResponse({ facts: labelFacts(keys, await withRecentHolds(cal.events, env.holds, now), now) });
}

/** AAAA-MM-DD in Portugal. */
const lisbonDate = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date(ms));

/** The conversation's live pre-booking (or booking) and the calendar with recent ones, or an error response. */
async function calendarFor(conversationId: string, env: BotEnv) {
  const existing = await env.holds!.get(conversationId);
  if (existing && "error" in existing) return { response: createErrorResponse("Pré-reservas indisponíveis", 503) };
  const live = existing && !existing.released_at ? existing : null;
  const cal = await env.calendar!();
  if ("error" in cal) return { response: createErrorResponse(cal.error, 502) };
  const now = env.now?.() ?? new Date();
  return { live, now, events: await withRecentHolds(cal.events, env.holds, now) };
}

/** Writes through the owner's Apps Script and keeps the row that covers Google's feed delay. */
async function writeAndSave(conversationId: string, live: HoldRow | null, now: Date, env: BotEnv, action: "hold" | "book",
  event: { title: string; start: string; end: string } & Record<string, unknown>): Promise<Response | null> {
  const written = await env.writeCalendar!({ action, conversationId, eventId: live?.event_id ?? null, ...event });
  if (!written.ok || !written.eventId) {
    const detail = written.ok ? "sem eventId" : written.error;
    safeLog("warn", `bot ${action} not written`, { error: detail });
    return createErrorResponse(`Não foi possível escrever no calendário (${detail.slice(0, 200)})`, 502);
  }
  const saveError = await env.holds!.save({
    conversation_id: conversationId, event_id: written.eventId, title: event.title,
    starts_at: event.start, ends_at: event.end, updated_at: now.toISOString(), released_at: null,
  });
  if (saveError) safeLog("warn", `bot ${action} written but not saved`, { error: saveError });
  calendarCache = null;
  return null;
}

async function placeHold(conversationId: string, body: Row, env: BotEnv, ctx: { live: HoldRow | null; now: Date; events: CalendarEvent[] }): Promise<Response | Record<string, unknown>> {
  const plan = planBotHold(body, ctx.events, ctx.now, ctx.live?.event_id ?? null);
  if ("error" in plan) return createErrorResponse(String(plan.error), 400);
  // The bundle is plain JS, so Deno cannot narrow on `ok`: check the event itself.
  if (!plan.ok || !plan.event) return plan as Record<string, unknown>;
  const failed = await writeAndSave(conversationId, ctx.live, ctx.now, env, "hold", plan.event);
  return failed ?? { ok: true, slot: plan.slot, moved: !!ctx.live };
}

async function holdSlot(body: Row, env: BotEnv): Promise<Response> {
  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  if (!conversationId) return createErrorResponse("conversationId em falta", 400);
  const ctx = await calendarFor(conversationId, env);
  if ("response" in ctx) return ctx.response!;
  const hold = await placeHold(conversationId, body, env, ctx);
  return hold instanceof Response ? hold : createSuccessResponse({ hold });
}

async function bookSlot(body: Row, env: BotEnv): Promise<Response> {
  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  if (!conversationId) return createErrorResponse("conversationId em falta", 400);
  const ctx = await calendarFor(conversationId, env);
  if ("response" in ctx) return ctx.response!;
  const plan = planBotBooking(body, ctx.events, ctx.now, ctx.live?.event_id ?? null);
  if ("error" in plan) return createErrorResponse(String(plan.error), 400);
  // The client already has a service on another day: move that one (owner, 19 Oct 2026), never a second event.
  if (plan.reschedule) {
    const moved = await updateBooking({ eventId: plan.reschedule.eventId, phone: body.phone, changes: { date: plan.reschedule.date, time: plan.reschedule.time } }, env);
    const data = await moved.clone().json().catch(() => ({}));
    return createSuccessResponse({ booking: { ok: !!data?.update?.ok, rescheduled: true, update: data?.update ?? null } });
  }
  if (plan.ok && plan.event) {
    const failed = await writeAndSave(conversationId, ctx.live, ctx.now, env, "book", plan.event);
    return failed ?? createSuccessResponse({ booking: { ok: true, slot: plan.slot, team: plan.team } });
  }
  // Not the bot's to close (weekend, no engine price, data still missing): the time
  // stays held for the owner as a pre-booking, exactly as `hold` would.
  if (plan.sameTime || plan.handToOwner || plan.missing) {
    const hold = await placeHold(conversationId, body, env, ctx);
    if (hold instanceof Response) return hold;
    return createSuccessResponse({ booking: { ...plan, hold } });
  }
  return createSuccessResponse({ booking: plan });
}

/**
 * What a booked client says later (postcode, floor, a new hour, a note for the team, a cancel
 * request) goes into the owner's event by itself (owner, 15 Oct 2026: "eu não ter que meter nada
 * no calendário"). Only an event of this client's phone, only "Serviço"/"A confirmar"; a cancel
 * request is written and emailed to the owner, the event is never deleted.
 */
async function updateBooking(body: Row, env: BotEnv): Promise<Response> {
  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const changes = body.changes && typeof body.changes === "object" ? body.changes as Record<string, unknown> : null;
  if (!eventId || !phone || !changes) return createErrorResponse("eventId, phone e changes são obrigatórios", 400);
  const cal = await env.calendar!();
  if ("error" in cal) return createErrorResponse(cal.error, 502);
  const ev = cal.events.find(e => e.id === eventId);
  if (!ev) return createErrorResponse("evento não encontrado", 404);
  const str = (k: string) => typeof changes[k] === "string" ? String(changes[k]) : undefined;
  const now = env.now?.() ?? new Date();
  const asked = { date: str("date"), time: str("time"), postcode: str("postcode"), floor: str("floor"), address: str("address"), name: str("name"), note: str("note"), cancel: str("cancel") };
  let plan = planBookingUpdate(ev, phone, asked, now);
  // Reschedules are the bot's (owner, 16 Oct 2026). A move keeps the event's team, so the new hour has to
  // have room for that team, not only for the zone: otherwise the hour stays and the owner picks the team.
  let busyTeam: string | null = null;
  if (plan.ok && plan.moved) {
    const team = eventTeam(ev);
    if (team && teamBusyAt(cal.events.filter(e => e.id !== ev.id), team, plan.start, plan.end,
      !(/imperm/i.test(ev.summary) && !/limpeza|lavagem|higieniz|anti-?[aá]caros/i.test(ev.summary)), ev.summary)) {
      busyTeam = team;
      plan = planBookingUpdate(ev, phone, { ...asked, date: undefined, time: undefined }, now);
      if (env.notifyOwner) await env.notifyOwner(`Mudar de hora: a equipa ${team} está ocupada`,
        `O cliente combinou ${asked.date} às ${asked.time}, mas a equipa ${team} já tem um serviço a essa hora. O evento ficou na hora antiga: muda a cor para outra equipa e a hora, ou fala com o cliente.\n\n${ev.summary}`).catch(() => null);
    }
  }
  if (!plan.ok) return createSuccessResponse({ update: busyTeam ? { ok: false, reason: `equipa ${busyTeam} ocupada a essa hora`, teamBusy: busyTeam } : plan });
  let written = await env.writeCalendar!({ action: "update", eventId, phone, title: plan.title, description: plan.description, start: plan.start, end: plan.end });
  // Until the web app runs the version with "update": "book" changes an event in place when it
  // carries this conversation's "bot:" mark (otherwise it would create a second one, so never then).
  if (!written.ok && /action tem de ser/.test(written.error)) {
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const team = /^Equipa:\s*(.+)$/m.exec(ev.description)?.[1]?.trim() ?? "";
    const colorId = (TEAM_COLOR as Record<string, string>)[team];
    if (conversationId && colorId && /^\s*servi[cç]o\b/i.test(plan.title) && ev.description.split("\n").includes(`bot:${conversationId}`)) {
      written = await env.writeCalendar!({ action: "book", conversationId, eventId, title: plan.title, description: plan.description, start: plan.start, end: plan.end, colorId });
    }
  }
  if (!written.ok) return createErrorResponse(`Não foi possível atualizar o calendário (${written.error.slice(0, 200)})`, 502);
  calendarCache = null;
  if ((plan.cancel || plan.moved) && env.notifyOwner) {
    await env.notifyOwner(plan.cancel ? `Cliente pediu para desmarcar: ${plan.title.slice(0, 90)}` : `Serviço mudado pelo cliente: ${plan.title.slice(0, 90)}`,
      `${plan.summary.join("\n")}\n\nO evento já foi atualizado no calendário${plan.cancel ? " (não foi apagado: decides tu)" : ""}.\n\n${plan.title}`).catch(() => null);
  }
  return createSuccessResponse({ update: { ok: true, moved: plan.moved, cancel: plan.cancel, summary: plan.summary, ...(busyTeam ? { teamBusy: busyTeam } : {}) } });
}

async function ownerBooking(body: Row, env: BotEnv): Promise<Response> {
  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  if (!conversationId) return createErrorResponse("conversationId em falta", 400);
  const cal = await env.calendar!();
  if ("error" in cal) return createErrorResponse(cal.error, 502);
  const existing = await env.holds!.get(conversationId);
  const live = existing && !("error" in existing) && !existing.released_at ? existing : null;
  // Once the owner confirmed the conversation's event (no "A confirmar · " / "Pré-reserva"
  // any more), it is his: a later read never rewrites it (Marina, 11 Oct 2026: he set
  // 390€ and Lisboa 1, the next read would have put back half the total and another team).
  const liveEvent = live ? cal.events.find(e => e.id === live.event_id) : undefined;
  if (liveEvent && !/^\s*(a confirmar\b|pr[ée]-reserva\b)/i.test(liveEvent.summary)) {
    return createSuccessResponse({ booking: { ok: false, exists: true } });
  }
  // The conversation's own pre-booking does not busy the team it is about to become.
  const plan = planOwnerBooking(body, live ? cal.events.filter(e => e.id !== live.event_id) : cal.events);
  if ("error" in plan) return createErrorResponse(String(plan.error), 400);
  if (!plan.ok || !plan.event) return createSuccessResponse({ booking: { ok: false, exists: true } });
  const event = plan.event;
  // Same conversation: the bot's own "Pré-reserva" (or an earlier "A confirmar") becomes this one;
  // a settled booking goes in as the owner's "Serviço" in the team's colour (action book).
  const written = await env.writeCalendar!({ action: event.colorId ? "book" : "hold", conversationId, eventId: live?.event_id ?? null, ...event });
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
  return createSuccessResponse({ booking: { ok: true, start: event.start, moved: !!live, confirmed: !!event.colorId, team: plan.team ?? null } });
}

/**
 * Pre-bookings that a real service already replaced go away by themselves (owner, 11 Oct 2026: "porque é que
 * tive que ser eu a ir lá retirar?"). A live hold is released when the feed has a "Serviço" (or
 * "A confirmar · Serviço") for the same phone, or for the same name at the same start; a hold the owner
 * deleted by hand (gone from the feed after the feed lag) is just marked released.
 */
export async function sweepHolds(events: CalendarEvent[], holds: HoldStore, write: CalendarWriter, now: Date) {
  const rows = await holds.recent(new Date(now.getTime() - 60 * 86_400_000).toISOString());
  if ("error" in rows) return { released: 0, gone: 0, error: rows.error };
  const digits = (v: string) => v.replace(/\D/g, "");
  const services = events.filter(e => e.status !== "CANCELLED" && /^(A confirmar · )?Servi[çc]o\b/i.test(e.summary.trim()));
  let released = 0, gone = 0;
  for (const h of rows) {
    if (h.released_at) continue;
    const inFeed = events.some(e => e.id === h.event_id);
    const phone = digits(h.conversation_id.split("@")[0]).slice(-9);
    const name = (h.title.split(/\s[–-]\s/)[1] ?? "").trim().toLowerCase();
    const replaced = services.find(e => e.id !== h.event_id && (
      (phone.length === 9 && digits(`${e.summary} ${e.description}`).includes(phone)) ||
      (name.length > 2 && e.start === h.starts_at && e.summary.toLowerCase().includes(name))));
    if (replaced) {
      if (inFeed) { const done = await write({ action: "release", eventId: h.event_id }); if (!done.ok) continue; }
      await holds.release(h.conversation_id); released++;
    } else if (!inFeed && now.getTime() - Date.parse(h.updated_at ?? h.starts_at) > HOLD_FEED_LAG_MS) {
      await holds.release(h.conversation_id); gone++;
    }
  }
  if (released) calendarCache = null;
  return { released, gone };
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
    async recentQuiz(sinceIso, columns) {
      const { data, error } = await client.from("leads").select(columns).neq("source", "WhatsApp").gte("created_at", sinceIso)
        .order("created_at", { ascending: false }).limit(300);
      return { data: data as Row[] | null, error };
    },
    async insert(row) {
      const { data, error } = await client.from("leads").insert(row).select("booking_id");
      return { data: data as Row[] | null, error };
    },
  };
}

const ACCOUNT_COLUMNS = "request_date, client_name, city, locality, billed_value, my_cut, upsell_value, upsell_team, paid, calendar_event_id, calendar_missing_since, review_requested, description, invoiced, invoice_value, vat_on_top, paid_to_owner, client_paid_owner_at";
/** The CRM services still unpaid, for `team-accounts`. */
function supabaseAccounts(): BotEnv["accounts"] {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  return async () => {
    const [{ data, error }, adj] = await Promise.all([
      client.from("service_requests").select(ACCOUNT_COLUMNS).eq("paid", false),
      client.from("team_account_adjustments").select("team, day, label, amount").is("settled_at", null),
    ]);
    if (error) return { error: error.message };
    // Os acertos não travam as contas: se a tabela falhar, saem só os serviços.
    return { rows: (data ?? []) as Row[], adjustments: (adj.error ? [] : adj.data ?? []) as Row[] };
  };
}

const PROCEDURE_COLUMNS = "calendar_event_id, service_request_id, team, service_day, prompt_msg_ids, prompted_at, before_msg_id, before_at, after_msg_id, after_at, video_msg_id, video_at, reminders_sent, last_reminder_at, status, closed_at, penalty_paid, client_review_at, client_review_skip, client_certificate_at, client_certificate_skip";
/** service_procedure and what it reads from the CRM and the reviews. */
function supabaseProcedures(): ProcedureStore | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  const rows = (r: { data: unknown; error: { message: string } | null }) => r.error ? { error: r.error.message } : ((r.data ?? []) as Row[]);
  return {
    async records(sinceDay) { return rows(await client.from("service_procedure").select(PROCEDURE_COLUMNS).gte("service_day", sinceDay)); },
    async byPrompt(messageId) {
      const r = rows(await client.from("service_procedure").select(PROCEDURE_COLUMNS).contains("prompt_msg_ids", [messageId]).limit(1));
      return "error" in r ? r : r[0] ?? null;
    },
    async services(eventIds) { return rows(await client.from("service_requests").select("id, calendar_event_id, client_name, city, description").in("calendar_event_id", eventIds)); },
    async reviews(serviceIds) {
      if (!serviceIds.length) return [];
      return rows(await client.from("google_reviews").select("service_request_id, stars, reviewed_at, excluded").in("service_request_id", serviceIds));
    },
    async clients(keys9) {
      if (!keys9.length) return [];
      return rows(await client.from("clients").select("phone, contact_preference, on_hold_reason, reviewed_google").or(keys9.map(k => `phone.like.%${k}`).join(",")));
    },
    async upsert(row) { return (await client.from("service_procedure").upsert(row, { onConflict: "calendar_event_id" })).error?.message ?? null; },
    async update(eventId, patch) { return (await client.from("service_procedure").update(patch).eq("calendar_event_id", eventId)).error?.message ?? null; },
  };
}

const CERTIFICATE_SERVICE_COLUMNS = "id, request_date, description, client_name, city, locality, phone, billed_value, calendar_missing_since";
function supabaseCertificates(): CertificateStore | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  return {
    async waterproofingServices() {
      const { data, error } = await client.from("service_requests").select(CERTIFICATE_SERVICE_COLUMNS).not("phone", "is", null);
      return error ? { error: error.message } : ((data ?? []) as Row[]);
    },
    async issued(serviceRequestId) {
      const { data, error } = await client.from("waterproofing_certificates").select("*").eq("service_request_id", serviceRequestId).limit(1);
      return error ? { error: error.message } : ((data?.[0] as Row | undefined) ?? null);
    },
    async numbersOn(serviceDate) {
      const { data, error } = await client.from("waterproofing_certificates").select("number").eq("service_date", serviceDate);
      return error ? { error: error.message } : (data ?? []).map(r => String((r as Row).number));
    },
    async insert(row) {
      const { error } = await client.from("waterproofing_certificates").insert(row);
      return error ? { error: error.message, code: error.code } : {};
    },
  };
}

function supabaseConversations(): BotEnv["conversations"] {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  const client = createClient(url, key);
  return async rows => {
    const { error } = await client.from("whatsapp_conversations").upsert(rows, { onConflict: "contact_key" });
    return error ? { error: error.message } : {};
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

/** Plain-text email to the owner through Resend, from the verified domain. */
function resendOwnerMail(): BotEnv["notifyOwner"] {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("LEAD_NOTIFICATION_EMAIL");
  if (!apiKey || !to) return null;
  return async (subject, text, html) => {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "Kyro Bot <pedidos@cleansolutions.com.pt>", to: [to], subject, text, ...(html ? { html } : {}) }),
        signal: AbortSignal.timeout(15_000),
      });
      return res.ok ? null : `O Resend recusou o envio (${res.status})`;
    } catch {
      return "Não foi possível enviar o email";
    }
  };
}

// `import.meta.main` is only true when this file is the entry point, so the
// tests can import `handleBotRequest` without starting a server.
if (import.meta.main) {
  serve(req => handleBotRequest(req, { botKey: Deno.env.get("BOT_API_KEY"), leads: supabaseLeads(), followUps: supabaseFollowUps(), calendar: icsCalendar(), holds: supabaseHolds(), writeCalendar: appsScriptWriter(), notifyOwner: resendOwnerMail(), accounts: supabaseAccounts(), procedures: supabaseProcedures(), certificates: supabaseCertificates(), conversations: supabaseConversations() }));
}
