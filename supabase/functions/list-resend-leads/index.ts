// Lista os emails de pedidos enviados pelo Resend, para o separador "Quiz Leads"
// do admin panel. Os pedidos em si (nome, telefone, detalhes) não ficam guardados
// em nenhuma tabela do Supabase — o email enviado pelo `send-lead-email` é o único
// registo que existe deles. Esta função é a forma de os rever depois.
//
// Ao contrário de `submit-lead`/`send-lead-email` (públicas de propósito, para o
// site as poder chamar sem sessão), esta exige uma sessão real do Supabase Auth —
// a mesma usada para entrar no /admin. Sem esse gate, qualquer visitante do site
// conseguiria ler nomes, telefones e emails de todos os clientes.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { createErrorResponse, createSuccessResponse, handleCORS, safeLog, validateMethod } from "../_shared/security.ts";
import { LEAD_FROM_ADDRESS } from "../_shared/constants.ts";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

const RESEND_API_BASE = "https://api.resend.com";

interface ListRequest {
  emailId?: string;
  cursor?: string;
  direction?: "before" | "after";
}

interface ResendEmailSummary {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
  reply_to?: string[] | null;
}

async function isAuthenticatedAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !supabaseUrl || !serviceKey) return false;

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase.auth.getUser(token);
  return !error && !!data.user;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return handleCORS();
  if (!validateMethod(req, ["POST"])) {
    return createErrorResponse("Método não permitido", 405);
  }

  const clientIP = getClientIP(req);
  const limit = checkRateLimit(`list-resend-leads:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
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

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    safeLog("error", "[list-resend-leads] RESEND_API_KEY em falta", {});
    return createErrorResponse("Serviço indisponível", 503);
  }

  let body: ListRequest = {};
  try {
    body = await req.json();
  } catch {
    // corpo vazio é válido: primeira página, sem detalhe pedido
  }

  try {
    if (body.emailId) {
      const res = await fetch(`${RESEND_API_BASE}/emails/${encodeURIComponent(body.emailId)}`, {
        headers: { Authorization: `Bearer ${resendApiKey}` },
      });
      if (!res.ok) {
        safeLog("error", "[list-resend-leads] Resend recusou o detalhe", { status: res.status });
        return createErrorResponse("Não foi possível obter o email", 502);
      }
      const detail = await res.json();
      return createSuccessResponse({ email: detail });
    }

    const params = new URLSearchParams({ limit: "100" });
    if (body.cursor && body.direction) params.set(body.direction, body.cursor);

    const res = await fetch(`${RESEND_API_BASE}/emails?${params.toString()}`, {
      headers: { Authorization: `Bearer ${resendApiKey}` },
    });
    if (!res.ok) {
      safeLog("error", "[list-resend-leads] Resend recusou a lista", { status: res.status });
      return createErrorResponse("Não foi possível obter os emails", 502);
    }
    const list = await res.json();
    const all: ResendEmailSummary[] = list.data ?? [];
    // Filtra ao remetente dos pedidos: a conta também envia emails de newsletter
    // (remetente kyroclean.pt), que não interessam aqui.
    const leads = all.filter((e) => e.from?.includes(LEAD_FROM_ADDRESS));

    return createSuccessResponse({
      emails: leads,
      hasMore: Boolean(list.has_more),
    });
  } catch (error) {
    safeLog("error", "[list-resend-leads] Falhou", {
      errorType: error instanceof Error ? error.constructor.name : "Unknown",
    });
    return createErrorResponse("Não foi possível obter os emails", 502);
  }
});
