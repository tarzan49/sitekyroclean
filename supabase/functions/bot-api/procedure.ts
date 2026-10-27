// Procedimento de cada serviço (2026-10-14, owner: before photo, after photo,
// video and a 4-5 star Google review; the pay rule lives in procedurePay,
// src/lib/serviceProcedure.ts). The bot server asks `procedure-due` every few
// minutes, sends each team member the message of a service that just ended,
// reports the WhatsApp ids back with `procedure-sent`, and forwards the photos
// and videos the team sends IN REPLY to that message with `procedure-media`.
// Times, teams, first names and the service only: no phone or address leaves.
import {
  addDays, checkProcedure, eventTeam, factsFromTitle, lisbonDayOf, procedureFrom, procedurePromptMessage,
  procedureClientMessage, procedureClosedMessage, procedureReceiptMessage, procedureReminderMessage, procedureStatusChanges, reminderDue, slotForMedia, PROCEDURE_NOT_A_REPLY_MESSAGE,
} from "../_shared/botEngine.generated.js";
import type { CalendarEvent } from "../_shared/ics.ts";
import { createErrorResponse, createSuccessResponse, safeLog } from "../_shared/security.ts";

type Row = Record<string, unknown>;

export interface ProcedureStore {
  /** Procedures with service_day >= sinceDay. */
  records(sinceDay: string): Promise<Row[] | { error: string }>;
  /** The one whose prompt_msg_ids holds this WhatsApp message id. */
  byPrompt(messageId: string): Promise<Row | null | { error: string }>;
  /** CRM rows (id, calendar_event_id, client_name, city, description) for these calendar events. */
  services(eventIds: string[]): Promise<Row[] | { error: string }>;
  /** Reviews linked to these CRM rows (stars, reviewed_at, excluded, service_request_id). */
  reviews(serviceIds: string[]): Promise<Row[] | { error: string }>;
  upsert(row: Row): Promise<string | null>;
  update(eventId: string, patch: Row): Promise<string | null>;
}

/** How long after a service ends the bot still sends its message (a bot that was off does not flood the teams). */
const PROMPT_WINDOW_MS = 36 * 60 * 60_000;
const SERVICE_TITLE = /^servi[cç]o\b/i;
const REVISIT = /\brevisita\b|\b0\s*€\s*\(\s*0\s*€\s*\)/i;
const ID = /^[A-Za-z0-9_.:@-]{1,200}$/;

const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .format(new Date(iso)).replace(":00", "h").replace(":", "h");

function labelFor(service: Row | undefined, event: CalendarEvent): { label: string; what: string | null; firstName: string | null } {
  const title = factsFromTitle(event.summary);
  const name = typeof service?.client_name === "string" ? service.client_name.trim().split(/\s+/)[0] : title.firstName;
  const city = typeof service?.city === "string" ? service.city.trim() : "";
  const what = (typeof service?.description === "string" && service.description.trim()) || title.what;
  const label = [name, city].filter(Boolean).join(", ") || "cliente";
  return { label, what: what || null, firstName: name || null };
}

const asRecord = (r: Row) => ({
  calendar_event_id: String(r.calendar_event_id), service_request_id: (r.service_request_id as string) ?? null, team: String(r.team),
  service_day: String(r.service_day), prompt_msg_ids: (r.prompt_msg_ids as string[]) ?? [], prompted_at: (r.prompted_at as string) ?? null,
  before_msg_id: (r.before_msg_id as string) ?? null, before_at: (r.before_at as string) ?? null,
  after_msg_id: (r.after_msg_id as string) ?? null, after_at: (r.after_at as string) ?? null,
  video_msg_id: (r.video_msg_id as string) ?? null, video_at: (r.video_at as string) ?? null,
  reminders_sent: Number(r.reminders_sent) || 0, last_reminder_at: (r.last_reminder_at as string) ?? null,
  status: (r.status as "em_curso" | "completo" | "fechado") ?? "em_curso", closed_at: (r.closed_at as string) ?? null,
  penalty_paid: !!r.penalty_paid,
});
type Rec = ReturnType<typeof asRecord>;

const reviewsFor = (reviews: Row[], serviceId: string | null) =>
  serviceId ? reviews.filter(r => r.service_request_id === serviceId).map(r => ({ stars: Number(r.stars), reviewed_at: String(r.reviewed_at), excluded: (r.excluded as string) ?? null })) : [];

/** Services that just ended and still have no message, and the reminders due now. */
export async function procedureDue(events: CalendarEvent[], store: ProcedureStore, now: Date): Promise<Response> {
  const nowMs = now.getTime();
  const ended = events.filter(e => e.start && e.end && SERVICE_TITLE.test(e.summary.trim()) && !REVISIT.test(e.summary)
    && e.status !== "CANCELLED" && Date.parse(e.end) <= nowMs && Date.parse(e.end) >= nowMs - PROMPT_WINDOW_MS);
  const today = lisbonDayOf(now);
  const recs = await store.records(addDays(today, -10));
  if ("error" in recs) return createErrorResponse(recs.error, 502);
  const records = recs.map(asRecord);
  const known = new Set(records.map(r => r.calendar_event_id));

  const candidates = ended
    .map(e => ({ e, team: eventTeam(e) as string | null, day: lisbonDayOf(e.start!) }))
    .filter(c => c.team && !known.has(c.e.id) && c.day >= procedureFrom(c.team));
  const eventIds = [...new Set([...candidates.map(c => c.e.id), ...records.map(r => r.calendar_event_id)])];
  const services = eventIds.length ? await store.services(eventIds) : [];
  if ("error" in services) return createErrorResponse(services.error, 502);
  const serviceByEvent = new Map(services.map(s => [String(s.calendar_event_id), s]));

  // A service ends before the CRM has its row (the CRM only creates rows with the panel open): link it once it does.
  for (const r of records) {
    const s = serviceByEvent.get(r.calendar_event_id);
    if (!r.service_request_id && s?.id) {
      const err = await store.update(r.calendar_event_id, { service_request_id: s.id, updated_at: now.toISOString() });
      if (!err) r.service_request_id = String(s.id);
      else safeLog("warn", "[bot-api] procedure link", { message: err });
    }
  }

  const prompts = candidates.map(({ e, team, day }) => {
    const facts = labelFor(serviceByEvent.get(e.id), e);
    return {
      eventId: e.id, team, serviceDay: day, label: facts.label,
      message: procedurePromptMessage({ label: facts.label, what: facts.what, team: team!, serviceDay: day, time: hhmm(e.start!) }),
      clientMessage: procedureClientMessage({ firstName: facts.firstName, what: facts.what, team: team! }),
    };
  });

  const reviews = await store.reviews(records.map(r => r.service_request_id).filter((v): v is string => !!v));
  if ("error" in reviews) return createErrorResponse(reviews.error, 502);
  const eventById = new Map(events.map(e => [e.id, e]));
  // A service deleted from the calendar, cancelled or moved to another team is no
  // longer this team's: no reminder and no closing notice. 27/10: Kseniia's
  // Porto 2 copy, deleted on 26/10 (Porto 1 did it on 27/10), still sent Aleixo
  // "Lembrete do serviço o serviço, 26/10".
  const liveEvent = (r: Rec) => {
    const ev = eventById.get(r.calendar_event_id);
    return ev && ev.status !== "CANCELLED" && eventTeam(ev) === r.team ? ev : null;
  };
  const yesterday = addDays(today, -1);
  const reminders = records.flatMap(r => {
    const ev = liveEvent(r);
    if (!ev) return [];
    const check = checkProcedure(r, reviewsFor(reviews, r.service_request_id), yesterday);
    const index = reminderDue(r, check, now);
    if (index === null) return [];
    const label = labelFor(serviceByEvent.get(r.calendar_event_id), ev).label;
    return [{ eventId: r.calendar_event_id, team: r.team, reminderIndex: index, label, message: procedureReminderMessage(label, check, r.service_day) }];
  });
  // The state kept in the table (for the panel), and a notice when a deadline closes with something missing.
  const linked = reviews.map(r => ({ stars: Number(r.stars), reviewed_at: String(r.reviewed_at), excluded: (r.excluded as string) ?? null, service_request_id: (r.service_request_id as string) ?? null }));
  const closed: { eventId: string; team: string; message: string }[] = [];
  for (const change of procedureStatusChanges(records, linked, yesterday, now.toISOString())) {
    const err = await store.update(change.calendar_event_id, { status: change.status, closed_at: change.closed_at, updated_at: now.toISOString() });
    if (err) { safeLog("warn", "[bot-api] procedure status", { message: err }); continue; }
    const r = records.find(x => x.calendar_event_id === change.calendar_event_id)!;
    if (change.status !== "fechado" || r.status !== "em_curso") continue;
    const ev = liveEvent(r);
    if (!ev) continue;
    const check = checkProcedure(r, reviewsFor(reviews, r.service_request_id), yesterday);
    const label = labelFor(serviceByEvent.get(r.calendar_event_id), ev).label;
    closed.push({ eventId: r.calendar_event_id, team: r.team, message: procedureClosedMessage(label, r.service_day, check.missing, check.pay) });
  }
  return createSuccessResponse({ prompts, reminders, closed, notReplyMessage: PROCEDURE_NOT_A_REPLY_MESSAGE });
}

/** The bot sent the message of a service (or a reminder) to the team: keep the WhatsApp ids. */
export async function procedureSent(body: Row, store: ProcedureStore, now: Date): Promise<Response> {
  const eventId = typeof body.eventId === "string" && ID.test(body.eventId) ? body.eventId : null;
  if (!eventId) return createErrorResponse("eventId em falta", 400);
  const ids = Array.isArray(body.messageIds) ? body.messageIds.filter((v): v is string => typeof v === "string" && ID.test(v)).slice(0, 10) : [];
  if (body.kind === "reminder") {
    const index = Number(body.reminderIndex);
    if (!Number.isInteger(index) || index < 0 || index > 5) return createErrorResponse("reminderIndex inválido", 400);
    const err = await store.update(eventId, { reminders_sent: index + 1, last_reminder_at: now.toISOString(), updated_at: now.toISOString() });
    return err ? createErrorResponse(err, 502) : createSuccessResponse({ saved: true });
  }
  const team = typeof body.team === "string" ? body.team.trim().slice(0, 40) : "";
  const day = typeof body.serviceDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.serviceDay) ? body.serviceDay : null;
  if (!team || !day || !ids.length) return createErrorResponse("team, serviceDay e messageIds são obrigatórios", 400);
  const err = await store.upsert({
    calendar_event_id: eventId, team, service_day: day, prompt_msg_ids: ids, prompted_at: now.toISOString(),
    status: "em_curso", updated_at: now.toISOString(),
  });
  return err ? createErrorResponse(err, 502) : createSuccessResponse({ saved: true });
}

/**
 * Photos and videos a team member sent in reply to the message of a service
 * (the bot server waits ~20 s so a burst gets one answer). Caption "antes" or
 * "depois" decides a photo; without it, the first is before and the next after.
 * A slot already filled keeps its first file.
 */
export async function procedureMedia(body: Row, store: ProcedureStore, now: Date): Promise<Response> {
  const quoted = typeof body.quotedId === "string" && ID.test(body.quotedId) ? body.quotedId : null;
  if (!quoted) return createErrorResponse("quotedId em falta", 400);
  const items = Array.isArray(body.items) ? body.items.slice(0, 20) as Row[] : [];
  if (!items.length) return createErrorResponse("items em falta", 400);
  const found = await store.byPrompt(quoted);
  if (found && "error" in found) return createErrorResponse(String(found.error), 502);
  if (!found) return createSuccessResponse({ found: false });
  const rec: Rec = asRecord(found);
  const patch: Row = {};
  const received: ("before" | "after" | "video")[] = [];
  for (const it of items) {
    const id = typeof it.messageId === "string" && ID.test(it.messageId) ? it.messageId : null;
    const kind = it.kind === "video" ? "video" : it.kind === "image" ? "image" : null;
    if (!id || !kind) continue;
    const at = typeof it.at === "string" && !Number.isNaN(Date.parse(it.at)) ? new Date(it.at).toISOString() : now.toISOString();
    const slot = slotForMedia(rec, kind, typeof it.caption === "string" ? it.caption : null);
    const key = `${slot}_msg_id` as const;
    if (rec[key]) continue;
    rec[key] = id;
    rec[`${slot}_at`] = at;
    patch[key] = id;
    patch[`${slot}_at`] = at;
    received.push(slot);
  }
  if (received.length) {
    const err = await store.update(rec.calendar_event_id, { ...patch, updated_at: now.toISOString() });
    if (err) return createErrorResponse(err, 502);
  }
  const reviews = await store.reviews(rec.service_request_id ? [rec.service_request_id] : []);
  const check = checkProcedure(rec, "error" in reviews ? [] : reviewsFor(reviews, rec.service_request_id), addDays(lisbonDayOf(now), -1));
  const label = typeof body.label === "string" && body.label.trim() ? body.label.trim().slice(0, 80) : "este serviço";
  return createSuccessResponse({
    found: true, received, missing: check.missing, status: check.status,
    message: procedureReceiptMessage(label, received, check),
  });
}
