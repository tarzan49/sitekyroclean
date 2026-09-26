// Eventos do Google Calendar do dono, para o separador CRM do admin panel
// criar sozinho as linhas dos serviços fechados (2026-09-26).
//
// Lê o "endereço secreto no formato iCal" do calendário, guardado na secret
// GOOGLE_CALENDAR_ICS_URL. Não há OAuth nem app Google: quem tem o endereço lê
// o calendário inteiro, por isso ele só vive nas secrets do Supabase e esta
// função só responde a uma sessão de `admin_users`.
//
// Devolve apenas os eventos criados a partir de `since`, sem os filtrar por
// título. Decidir o que é um serviço, e como se lê, é trabalho do CRM
// (`src/lib/calendarServices.ts`), que tem os dados das cidades e freguesias
// para identificar a região. Assim a regra vive num sítio só.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { isAuthenticatedAdmin } from "../_shared/admin-request.ts";
import { parseIcs } from "../_shared/ics.ts";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const MAX_LOOKBACK_MS = 400 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15_000;

function isGoogleIcsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "calendar.google.com" && url.pathname.endsWith(".ics");
  } catch {
    return false;
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) {
    return createErrorResponse("Método não permitido", 405);
  }

  const clientIP = getClientIP(req);
  const limit = checkRateLimit(`calendar-events:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
  if (!limit.allowed) {
    return createErrorResponse(
      "Demasiados pedidos seguidos. Tente novamente daqui a alguns minutos.",
      429,
      getRateLimitHeaders(limit.remaining, limit.resetAt),
    );
  }

  if (!(await isAuthenticatedAdmin(req))) {
    return createErrorResponse("Não autorizado", 401);
  }

  const icsUrl = Deno.env.get("GOOGLE_CALENDAR_ICS_URL") ?? "";
  if (!isGoogleIcsUrl(icsUrl)) {
    safeLog("error", "[calendar-events] GOOGLE_CALENDAR_ICS_URL em falta ou inválida", {});
    return createErrorResponse("Calendário por ligar", 503);
  }

  let since = NaN;
  try {
    since = Date.parse(String((await req.json())?.since ?? ""));
  } catch {
    // tratado abaixo
  }
  const now = Date.now();
  if (!Number.isFinite(since) || since > now || now - since > MAX_LOOKBACK_MS) {
    return createErrorResponse("Parâmetro 'since' inválido", 400);
  }

  try {
    const res = await fetch(icsUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) {
      safeLog("error", "[calendar-events] Google recusou o feed", { status: res.status });
      return createErrorResponse("Não foi possível ler o calendário", 502);
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    const { events, totalEvents } = parseIcs(bytes);
    if (totalEvents === 0) {
      // Um feed sem eventos nenhuns é quase de certeza um erro do lado da
      // Google. Responder com lista vazia levava o CRM a dar os serviços
      // sincronizados como apagados do calendário.
      safeLog("error", "[calendar-events] Feed sem eventos", { bytes: bytes.length });
      return createErrorResponse("O calendário veio vazio", 502);
    }

    const recent = events
      .filter((e) => Date.parse(e.created) >= since)
      .sort((a, b) => a.created.localeCompare(b.created));

    return createSuccessResponse({ events: recent, totalEvents, fetchedAt: new Date(now).toISOString() });
  } catch (error) {
    safeLog("error", "[calendar-events] Falhou", {
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
    });
    return createErrorResponse("Não foi possível ler o calendário", 502);
  }
});
