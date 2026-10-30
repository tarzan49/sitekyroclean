// `certificate` (2026-10-27, owner: "quando uma pessoa pedir certificado em impermeabilização,
// começares a enviar esse certificado com um bom design"). The bot sends the chat's phone (never
// the model's); this picks the client's latest done waterproofing job in the CRM
// (src/lib/botCertificate.ts) and gives it a number that never changes, kept in
// waterproofing_certificates: asked again, the same certificate comes back. The bot server prints
// the PDF. Out go the first name (or the full name the client wrote, when it matches), the items,
// the town, the region and the date: what the certificate shows, no phone or address.
//
// Body: { phone, serviceRequestId?, name?, items?, dryRun? }. serviceRequestId (end of a service,
// 2026-10-30) asks for that service: waterproofing or, without it, the cleaning certificate. `name`/`items` are what the client wrote in the chat
// (a piece added after the quote, the full name); used only on the first issue. dryRun (the
// bot's simulations) computes the number without writing it.
import { certificateItemsFromChat, certificateName, certificateNumber, pickCertificateService } from "../_shared/botEngine.generated.js";
import { createErrorResponse, createSuccessResponse, safeLog } from "../_shared/security.ts";

type Row = Record<string, unknown>;

export interface CertificateStore {
  /** CRM rows whose description mentions waterproofing (id, request_date, description, client_name, city, locality, phone, billed_value, calendar_missing_since). */
  waterproofingServices(): Promise<Row[] | { error: string }>;
  /** The certificate already issued for this CRM row. */
  issued(serviceRequestId: string): Promise<Row | null | { error: string }>;
  /** Numbers already given to jobs of this service day. */
  numbersOn(serviceDate: string): Promise<string[] | { error: string }>;
  insert(row: Row): Promise<{ error?: string; code?: string }>;
}

interface Facts { serviceRequestId: string; serviceDate: string; tier: string; years: number; name: string; items: string; place: string | null; team: string | null }
/** pickCertificateService's result (src/lib/botCertificate.ts); the bundle is plain JS. */
type Pick = { ok: true; certificate: Facts } | { ok: false; reason: "none" | "upcoming" | "tier"; serviceDate?: string };

const lisbonDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(d);

const SAY: Record<string, string> = {
  none: "Não há nenhuma impermeabilização feita com este número. Se a pessoa ainda não fez o serviço e pergunta se emitimos certificado: sim, Premium com 10 anos de garantia; envia o exemplo (certificado com exemplo: true).",
  upcoming: "O serviço ainda não foi feito: o certificado é emitido no dia do serviço, com a data e as peças tratadas. Podes enviar já o exemplo (exemplo: true).",
  tier: "O CRM não diz se foi Premium ou Essencial: passa ao responsável (handoff \"certificado: confirmar Premium ou Essencial\"), sem dizer isto ao cliente.",
};

export async function certificateAction(body: Row, store: CertificateStore, now: Date): Promise<Response> {
  const phone = typeof body.phone === "string" ? body.phone : "";
  if (phone.replace(/\D/g, "").length < 9) return createErrorResponse("phone em falta", 400);
  const rows = await store.waterproofingServices();
  if ("error" in rows) return createErrorResponse("Não foi possível ler o CRM", 502);
  const serviceRequestId = typeof body.serviceRequestId === "string" && /^[0-9a-f-]{36}$/i.test(body.serviceRequestId) ? body.serviceRequestId : null;
  const pick = pickCertificateService(rows as never[], phone, lisbonDate(now), serviceRequestId) as Pick;
  if (!pick.ok) return createSuccessResponse({ ok: false, reason: pick.reason, ...(pick.serviceDate ? { serviceDate: pick.serviceDate } : {}), instrucao: SAY[pick.reason] });

  const c = pick.certificate;
  const before = await store.issued(c.serviceRequestId);
  if (before && "error" in before) return createErrorResponse("Não foi possível ler os certificados", 502);
  if (before) return createSuccessResponse({ ok: true, again: true, certificate: fromRow(before as Row, c) });

  const fresh = {
    ...c,
    name: certificateName(c.name, body.name) || "Cliente",
    items: certificateItemsFromChat(body.items) ?? c.items,
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const taken = await store.numbersOn(c.serviceDate);
    if (!Array.isArray(taken)) return createErrorResponse("Não foi possível ler os certificados", 502);
    const number = certificateNumber(c.serviceDate, taken, c.tier);
    if (body.dryRun === true) return createSuccessResponse({ ok: true, dryRun: true, certificate: { ...fresh, number } });
    const res = await store.insert({ number, service_request_id: c.serviceRequestId, service_date: c.serviceDate, tier: c.tier,
      client_name: fresh.name, items: fresh.items, place: fresh.place, team: fresh.team, issued_by: "bot" });
    if (!res.error) return createSuccessResponse({ ok: true, again: false, certificate: { ...fresh, number } });
    if (res.code !== "23505") { safeLog("error", "[bot-api] certificate insert", { error: res.error }); return createErrorResponse("Não foi possível guardar o certificado", 502); }
    // Same number taken meanwhile, or the same job issued by a parallel call: read it again.
    const raced = await store.issued(c.serviceRequestId);
    if (raced && !("error" in raced)) return createSuccessResponse({ ok: true, again: true, certificate: fromRow(raced as Row, c) });
  }
  return createErrorResponse("Não foi possível numerar o certificado", 502);
}

/** What was issued the first time stays: same number, name and items on every copy. */
function fromRow(r: Row, c: { serviceDate: string; tier: string; place: string | null; team: string | null }) {
  return {
    number: String(r.number), serviceDate: String(r.service_date ?? c.serviceDate), tier: String(r.tier ?? c.tier), years: (r.tier ?? c.tier) === "essencial" ? 2 : (r.tier ?? c.tier) === "limpeza" ? 0 : 10,
    name: String(r.client_name ?? ""), items: String(r.items ?? ""), place: (r.place as string | null) ?? c.place, team: (r.team as string | null) ?? c.team,
  };
}
