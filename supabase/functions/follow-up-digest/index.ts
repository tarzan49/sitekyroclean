// Email diário de seguimentos (dono, 2026-10-06: "notificações passado x
// tempo"). O pg_cron chama esta função às 8h30 e às 9h30 UTC
// (migração 20261006210100_follow_up_digest_cron.sql) com a chave
// FOLLOW_UP_DIGEST_KEY no cabeçalho `x-digest-key`; ela só envia quando são 9h
// em Lisboa, ou seja numa das duas corridas conforme a hora de verão, e uma
// vez por dia (tabela follow_up_digests).
//
// O que vai no email sai do mesmo motor da vista Hoje do painel
// (followUpEngine.generated.js, empacotado de src/lib/followUpBundle.ts). Uma
// sessão de administrador também pode chamar a função a partir do painel, para
// ver o email (send: false) ou mandá-lo já (send: true).
//
// Publica-se com --no-verify-jwt (o cron não tem sessão do Supabase; a chave e
// a verificação de administrador são feitas aqui):
//   node_modules/.bin/supabase functions deploy follow-up-digest --no-verify-jwt
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildDigest, lisbonDay, planAll, snapshotAt } from "../_shared/followUpEngine.generated.js";
import { isAuthenticatedAdmin } from "../_shared/admin-request.ts";
import { LEAD_FROM_ADDRESS } from "../_shared/constants.ts";
import { parseIcs } from "../_shared/ics.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";

const PANEL_URL = "https://cleansolutions.com.pt/admin/panel";
const SEND_HOUR_LISBON = 9;

type Row = Record<string, unknown>;

/** O que a função lê e escreve, para os testes poderem passar uma base falsa. */
export interface DigestStore {
  load(): Promise<{ clients: Row[]; services: Row[]; touches: Row[] } | { error: string }>;
  sentOn(day: string): Promise<boolean>;
  record(day: string, items: number, error: string | null): Promise<void>;
  /** Pré-reservas do bot ainda por confirmar (2026-10-09): futuras e ainda com o título "Pré-reserva". */
  pendingHolds?(now: Date): Promise<PendingHold[]>;
}
export interface PendingHold { title: string; starts_at: string }
export interface Mailer {
  send(subject: string, html: string, text: string): Promise<string | null>;
}
export interface DigestEnv {
  key: string | undefined;
  store: DigestStore | null;
  mailer: Mailer | null;
  isAdmin: (req: Request) => Promise<boolean>;
  now: () => Date;
}

const encoder = new TextEncoder();
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([given, expected].map(v => crypto.subtle.digest("SHA-256", encoder.encode(v))));
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

const LISBON_HOUR = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", hour: "2-digit", hourCycle: "h23" });

export async function handleDigestRequest(req: Request, env: DigestEnv): Promise<Response> {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) return createErrorResponse("Método não permitido", 405);

  const givenKey = req.headers.get("x-digest-key");
  let fromCron = false;
  if (givenKey) {
    if (!env.key || env.key.length < 32) {
      safeLog("error", "[follow-up-digest] FOLLOW_UP_DIGEST_KEY em falta ou curta demais", {});
      return createErrorResponse("Serviço por configurar", 503);
    }
    if (!(await sameSecret(givenKey, env.key))) return createErrorResponse("Não autorizado", 401);
    fromCron = true;
  } else if (!(await env.isAdmin(req))) {
    return createErrorResponse("Não autorizado", 401);
  }
  if (!env.store) return createErrorResponse("Serviço indisponível", 503);

  let body: Row = {};
  try {
    const raw = await req.text();
    if (raw.length > 2_000) return createErrorResponse("Pedido demasiado grande", 413);
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return createErrorResponse("O corpo tem de ser JSON", 400);
  }
  const send = body.send === true;
  const now = env.now();
  const today = lisbonDay(now);

  // Com a chave, só se envia às 9h de Lisboa e uma vez por dia; ver sem enviar
  // (send: false) pode ser a qualquer hora, para testar a função publicada.
  if (fromCron && send) {
    if (Number(LISBON_HOUR.format(now)) % 24 !== SEND_HOUR_LISBON) return createSuccessResponse({ skipped: "fora da hora" });
    if (await env.store.sentOn(today)) return createSuccessResponse({ skipped: "já enviado hoje" });
  }

  const data = await env.store.load();
  if ("error" in data) {
    safeLog("error", "[follow-up-digest] leitura falhou", { message: data.error });
    return createErrorResponse("Não foi possível ler as fichas", 500);
  }
  // deno-lint-ignore no-explicit-any
  const planned = planAll(data as any, { now });
  const digest = withHolds(
    buildDigest(planned, { now, panelUrl: PANEL_URL, snapshot: snapshotAt(data.clients as never) }),
    (await env.store.pendingHolds?.(now)) ?? [],
  );

  if (!send) {
    return createSuccessResponse({ subject: digest.subject, html: digest.html, text: digest.text, count: digest.count, campaigns: digest.campaigns });
  }
  if (digest.count === 0 && digest.campaigns.length === 0) {
    await env.store.record(today, 0, null);
    return createSuccessResponse({ sent: false, count: 0 });
  }
  if (!env.mailer) return createErrorResponse("Email por configurar", 503);
  const error = await env.mailer.send(digest.subject, digest.html, digest.text);
  await env.store.record(today, digest.count, error);
  if (error) {
    safeLog("error", "[follow-up-digest] o Resend recusou o envio", { message: error });
    return createErrorResponse("O email não foi enviado", 502);
  }
  return createSuccessResponse({ sent: true, count: digest.count });
}

const WHEN = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", weekday: "short", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * As pré-reservas do bot vão no topo do email (dono, 2026-10-09: não expiram
 * sozinhas, ele decide): confirma (muda para "Serviço X€ (Y€) …") ou apaga.
 */
export function withHolds<T extends { subject: string; html: string; text: string; count: number }>(digest: T, holds: PendingHold[]): T {
  if (!holds.length) return digest;
  const lines = holds.map(h => `${WHEN.format(new Date(h.starts_at))} · ${h.title}`);
  const title = `Pré-reservas e marcações por confirmar (${holds.length})`;
  const html = `<h3>${title}</h3><p>Confirma no calendário (muda o título para "Serviço X€ (Y€) …") ou apaga.</p><ul>${lines.map(l => `<li>${escapeHtml(l)}</li>`).join("")}</ul>${digest.html}`;
  const text = `${title}\nConfirma no calendário (muda o título para "Serviço X€ (Y€) …") ou apaga.\n${lines.map(l => `- ${l}`).join("\n")}\n\n${digest.text}`;
  const subject = digest.count === 0 ? `Kyro · ${holds.length} marcaç${holds.length > 1 ? "ões" : "ão"} por confirmar` : digest.subject;
  return { ...digest, subject, html, text, count: digest.count + holds.length };
}

function supabaseStore(): DigestStore | null {
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
    async sentOn(day) {
      const { data } = await client.from("follow_up_digests").select("day").eq("day", day).is("error", null).maybeSingle();
      return !!data;
    },
    async record(day, items, error) {
      await client.from("follow_up_digests").upsert({ day, items, error, sent_at: new Date().toISOString() }, { onConflict: "day" });
    },
    async pendingHolds(now) {
      const { data, error } = await client.from("bot_calendar_holds").select("event_id, title, starts_at, updated_at").is("released_at", null).gte("starts_at", now.toISOString()).order("starts_at");
      if (error || !data?.length) return [];
      // Só as que continuam a ser pré-reserva no calendário: uma confirmada ou apagada pelo dono sai da lista.
      // Se o calendário não se ler, vão todas: é melhor sobrar uma do que faltar.
      const ics = Deno.env.get("GOOGLE_CALENDAR_ICS_URL");
      if (!ics) return data as PendingHold[];
      try {
        const res = await fetch(ics, { signal: AbortSignal.timeout(15_000) });
        if (!res.ok) return data as PendingHold[];
        const { events, totalEvents } = parseIcs(new Uint8Array(await res.arrayBuffer()));
        if (!totalEvents) return data as PendingHold[];
        const byId = new Map(events.map(e => [e.id, e]));
        return (data as (PendingHold & { event_id: string; updated_at: string })[]).filter(h => {
          const e = byId.get(h.event_id);
          // Fora do endereço iCal: escrita há menos de um dia é atraso da Google (fica); mais antiga, foi apagada.
          return !e ? Date.now() - new Date(h.updated_at).getTime() < 86_400_000 : /^(pr[ée]-?\s?reserva|a confirmar)\b/i.test(e.summary) && e.status !== "CANCELLED";
        });
      } catch {
        return data as PendingHold[];
      }
    },
  };
}

function resendMailer(): Mailer | null {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("LEAD_NOTIFICATION_EMAIL");
  if (!apiKey || !to) return null;
  const resend = new Resend(apiKey);
  return {
    async send(subject, html, text) {
      // O SDK do Resend não lança exceção quando a API recusa: devolve `error`.
      const { error } = await resend.emails.send({ from: `Kyro Seguimentos <${LEAD_FROM_ADDRESS}>`, to: [to], subject, html, text });
      return error ? error.message : null;
    },
  };
}

if (import.meta.main) {
  serve(req => handleDigestRequest(req, {
    key: Deno.env.get("FOLLOW_UP_DIGEST_KEY"),
    store: supabaseStore(),
    mailer: resendMailer(),
    isAdmin: isAuthenticatedAdmin,
    now: () => new Date(),
  }));
}
