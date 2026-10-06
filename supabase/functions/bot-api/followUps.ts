// Seguimento de clientes para o bot (dono, 2026-10-06: "o bot vai saber
// exatamente quando contactar alguém e a melhor coisa a dizer a essa pessoa").
// As regras são as do painel (src/lib/clientFollowUp.ts, empacotado em
// followUpEngine.generated.js): o bot e o dono veem a mesma lista.
//
//   follow-ups   o que fazer agora: a quem escrever, porquê, a mensagem já
//                escrita e se pode ir sozinha (send "auto") ou só com o OK do
//                dono (send "owner_ok": campanhas, que vão em lote, e mensagens
//                com condições ainda por confirmar)
//   client-plan  quando alguém escreve: em que fase está, o que dizer e o que
//                não fazer (pediu para não receber mensagens, queixa em aberto)
//   log-touch    o bot registou um envio (ou decidiu não enviar); com
//                optOut: true a pessoa passa a "não contactar"
//   log-message  cada mensagem recebida ou enviada: mantém as datas da ficha
//                em dia, para o motor não depender da leitura do WhatsApp Web
import {
  ACTION_KINDS,
  STAGE_INFO,
  botGuidance,
  campaignCalendar,
  factsFromLabels,
  firstName,
  isQuietTime,
  lisbonDay,
  normalizePhone,
  phoneKey,
  planAll,
} from "../_shared/followUpEngine.generated.js";
import { createErrorResponse, createSuccessResponse, safeLog } from "../_shared/security.ts";

type Row = Record<string, unknown>;
type Failure = { error: string; code?: string };

/** O que estas ações leem e escrevem, para os testes poderem passar uma base falsa. */
export interface FollowUpStore {
  load(): Promise<{ clients: Row[]; services: Row[]; touches: Row[] } | Failure>;
  /** Contacto pelos últimos 9 dígitos do telefone. */
  findClient(key9: string): Promise<Row | null | Failure>;
  insertClient(row: Row): Promise<Row | Failure>;
  updateClient(id: string, patch: Row): Promise<string | null>;
  insertTouch(row: Row): Promise<string | null>;
}

const isFailure = (v: unknown): v is Failure => !!v && typeof v === "object" && "error" in v;
const KINDS = new Set<string>([...ACTION_KINDS, "outro"]);

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const t = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  return t && t.length <= max ? t : null;
};

/** Só dígitos, com indicativo; um número português de 9 dígitos ganha o 351. */
export function cleanPhone(v: unknown): string | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const digits = normalizePhone(String(v));
  if (digits.length < 9 || digits.length > 15) return null;
  return digits.length === 9 && /^[29]/.test(digits) ? `351${digits}` : digits;
}

// O pacote é JavaScript simples: o Deno não vê os tipos do motor, por isso
// ficam aqui os campos que estas ações usam.
interface Action {
  kind: string; title: string; why: string; send: string; priority: number; due: string;
  notBefore?: string; campaignId?: string; check?: string;
  messages: { id: string; label: string; text: string }[];
}
interface Planned {
  client: Row & { phone: string; region: string | null; contact_preference?: string | null; on_hold_reason?: string | null };
  services: Row[];
  touches: Row[];
  plan: {
    stage: string; loyal: boolean; promoter: boolean; servicesDone: number;
    lastServiceDate: string | null; nextServiceDate: string | null;
    today: Action[]; soon: Action[]; blocked: { kind: string; reason: string; campaignId?: string }[];
  };
}
const STAGES = STAGE_INFO as Record<string, { label: string; stance: string }>;

const actionOut = (p: Planned, a: Action) => ({
  phone: p.client.phone,
  firstName: firstName(p.client, p.services),
  kind: a.kind,
  title: a.title,
  why: a.why,
  send: a.send,
  priority: a.priority,
  due: a.due,
  notBefore: a.notBefore ?? null,
  campaignId: a.campaignId ?? null,
  check: a.check ?? null,
  messages: a.messages,
});

async function plannedNow(store: FollowUpStore, now: Date): Promise<Planned[] | Failure> {
  const data = await store.load();
  if (isFailure(data)) return data;
  return planAll(data as never, { now }) as unknown as Planned[];
}

export async function listFollowUps(body: Row, store: FollowUpStore, now: Date): Promise<Response> {
  const planned = await plannedNow(store, now);
  if (isFailure(planned)) {
    safeLog("error", "[bot-api] follow-ups: leitura falhou", { message: planned.error });
    return createErrorResponse("Não foi possível ler as fichas", 500);
  }
  const wanted = Array.isArray(body.kinds) ? new Set(body.kinds.filter((k): k is string => typeof k === "string")) : null;
  const items = planned
    .flatMap(p => p.plan.today.filter(a => a.kind !== "campanha" && (!wanted || wanted.has(a.kind))).map(a => actionOut(p, a)))
    .sort((a, b) => a.priority - b.priority || String(a.due).localeCompare(String(b.due)));
  const today = lisbonDay(now);
  const campaigns = campaignCalendar(today).filter(r => r.active).map(r => ({
    id: r.id,
    name: r.campaign.name,
    end: r.end,
    send: "owner_ok",
    eligible: planned.filter(p => p.plan.today.some(a => a.kind === "campanha" && a.campaignId === r.id)).length,
  }));
  return createSuccessResponse({ today, quietNow: isQuietTime(now), items, campaigns });
}

export async function clientPlan(body: Row, store: FollowUpStore, now: Date): Promise<Response> {
  const phone = cleanPhone(body.phone);
  if (!phone) return createErrorResponse("phone inválido", 400);
  const planned = await plannedNow(store, now);
  if (isFailure(planned)) {
    safeLog("error", "[bot-api] client-plan: leitura falhou", { message: planned.error });
    return createErrorResponse("Não foi possível ler as fichas", 500);
  }
  const key = phoneKey(phone);
  const p = planned.find(x => phoneKey(x.client.phone) === key);
  if (!p) return createSuccessResponse({ found: false, guidance: ["Contacto novo: segue o funil normal."] });
  const today = lisbonDay(now);
  const info = STAGES[p.plan.stage];
  return createSuccessResponse({
    found: true,
    client: {
      firstName: firstName(p.client, p.services),
      stage: p.plan.stage,
      stageLabel: info.label,
      stance: info.stance,
      region: p.client.region,
      contactPreference: p.client.contact_preference ?? "normal",
      onHold: p.client.on_hold_reason ?? null,
      loyal: p.plan.loyal,
      promoter: p.plan.promoter,
      servicesDone: p.plan.servicesDone,
      lastServiceDate: p.plan.lastServiceDate,
      nextServiceDate: p.plan.nextServiceDate,
    },
    guidance: botGuidance(p as never, today),
    today: p.plan.today.map(a => actionOut(p, a)),
    soon: p.plan.soon.map(a => actionOut(p, a)),
    doNot: p.plan.blocked.map(b => ({ kind: b.kind, reason: b.reason, campaignId: b.campaignId ?? null })),
  });
}

async function findOrCreate(store: FollowUpStore, phone: string, name: string | null): Promise<Row | Failure> {
  const found = await store.findClient(phoneKey(phone));
  if (found) return found;
  const created = await store.insertClient({ phone, whatsapp_name: name, status: "sem_estado", source: "Bot" });
  // Duas mensagens do mesmo contacto novo ao mesmo tempo: o índice único do telefone trava a segunda.
  if (isFailure(created) && created.code === "23505") return (await store.findClient(phoneKey(phone))) ?? created;
  return created;
}

export async function logTouch(body: Row, store: FollowUpStore, now: Date): Promise<Response> {
  const phone = cleanPhone(body.phone);
  if (!phone) return createErrorResponse("phone inválido", 400);
  const kind = typeof body.kind === "string" && KINDS.has(body.kind) ? body.kind : null;
  if (!kind) return createErrorResponse(`kind tem de ser um de: ${[...KINDS].join(", ")}`, 400);
  const message = body.message === undefined ? null : text(body.message, 4000);
  const campaign = body.campaignId === undefined || body.campaignId === null ? null : text(body.campaignId, 60);
  const template = body.template === undefined || body.template === null ? null : text(body.template, 60);
  const note = body.note === undefined ? null : text(body.note, 500);
  if ((body.message !== undefined && message === null) || (body.campaignId && !campaign) || (body.template && !template)) {
    return createErrorResponse("message, campaignId ou template inválidos", 400);
  }

  const client = await findOrCreate(store, phone, text(body.name, 120));
  if (isFailure(client)) {
    safeLog("error", "[bot-api] log-touch: ficha", { message: client.error });
    return createErrorResponse("Não foi possível encontrar a ficha", 500);
  }
  const error = await store.insertTouch({
    client_id: client.id, kind, campaign, template, message, note,
    skipped: body.skipped === true, channel: "bot",
  });
  if (error) {
    safeLog("error", "[bot-api] log-touch falhou", { message: error });
    return createErrorResponse("Não foi possível registar", 500);
  }
  if (body.optOut === true) {
    const why = text(body.optOutNote, 300) ?? `Pediu ao bot para não receber mensagens (${lisbonDay(now)})`;
    const optError = await store.updateClient(String(client.id), { contact_preference: "nao_contactar", contact_note: why });
    if (optError) return createErrorResponse("Registado, mas não foi possível marcar como não contactar", 500);
  }
  return createSuccessResponse({ ok: true });
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
const later = (a: unknown, b: string) => (typeof a === "string" && a > b ? a : b);

export async function logMessage(body: Row, store: FollowUpStore, now: Date): Promise<Response> {
  const phone = cleanPhone(body.phone);
  if (!phone) return createErrorResponse("phone inválido", 400);
  if (body.direction !== "in" && body.direction !== "out") return createErrorResponse('direction tem de ser "in" ou "out"', 400);
  let at = now.toISOString();
  if (body.at !== undefined) {
    if (typeof body.at !== "string" || !ISO.test(body.at)) return createErrorResponse("at tem de ser uma data ISO", 400);
    const t = Date.parse(body.at);
    if (!Number.isFinite(t) || t > now.getTime() + 5 * 60_000 || t < now.getTime() - 7 * 86_400_000) {
      return createErrorResponse("at tem de ser dos últimos 7 dias", 400);
    }
    at = new Date(t).toISOString();
  }
  const name = text(body.name, 120);
  const labels = Array.isArray(body.labels) ? body.labels.filter((l): l is string => typeof l === "string").slice(0, 30) : null;

  const client = await findOrCreate(store, phone, name);
  if (isFailure(client)) {
    safeLog("error", "[bot-api] log-message: ficha", { message: client.error });
    return createErrorResponse("Não foi possível encontrar a ficha", 500);
  }
  const patch: Row = { last_contact_at: later(client.last_contact_at, at) };
  if (body.direction === "in") patch.last_client_message_at = later(client.last_client_message_at, at);
  if (!client.first_contact_at || String(client.first_contact_at) > at) patch.first_contact_at = at;
  if (name) patch.whatsapp_name = name;
  if (labels) {
    // As etiquetas do WhatsApp Business são a fonte do estado, como na importação.
    const facts = factsFromLabels(labels);
    Object.assign(patch, {
      status: facts.status, services: facts.services, region: facts.region,
      from_google_ads: facts.fromGoogleAds, reviewed_google: facts.reviewedGoogle, labels: facts.labels,
    });
  }
  const error = await store.updateClient(String(client.id), patch);
  if (error) {
    safeLog("error", "[bot-api] log-message falhou", { message: error });
    return createErrorResponse("Não foi possível atualizar a ficha", 500);
  }
  return createSuccessResponse({ ok: true });
}
