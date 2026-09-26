import { isProductionHost } from "@/constants/tracking";

// Um erro sistémico (um script de terceiros a falhar, uma extensão de browser)
// disparava um insert em `error_logs` por cada ocorrência em cada visitante,
// sem limite: com tráfego, isso é uma tabela a crescer ao ritmo das páginas
// vistas. Cada página só reporta cada erro distinto uma vez, e no máximo
// MAX_REPORTS_PER_PAGE erros distintos. O painel continua a ver o erro; deixa
// de o ver dez mil vezes.
const MAX_REPORTS_PER_PAGE = 5;
const reportedKeys = new Set<string>();

export async function logError(payload: {
  message: string;
  source?: string | null;
  url?: string | null;
  line_number?: number | null;
  col_number?: number | null;
  stack?: string | null;
  severity: "error" | "warning" | "unhandled_rejection";
}) {
  const key = `${payload.severity}|${payload.message}|${payload.source ?? ""}|${payload.line_number ?? ""}`;
  if (reportedKeys.has(key) || reportedKeys.size >= MAX_REPORTS_PER_PAGE) return;
  reportedKeys.add(key);
  // Fora de produção (localhost, previews) — nunca escrever no error_logs
  // partilhado. Antes disto, qualquer erro de JS durante desenvolvimento
  // (ex.: um HMR a meio de uma edição) ficava gravado ali para sempre,
  // inundando o painel de admin com ruído e escondendo erros reais de
  // clientes por trás de centenas de entradas de "localhost" (achado real
  // 2026-09-09, ao investigar um lead em falta no Error Log). Mesmo padrão
  // já usado em quizTracking.ts (IS_PRODUCTION). Lido de constants/tracking
  // e não por import dinâmico de quizTracking, que criava um ciclo entre os
  // dois módulos só para ler esta flag.
  if (typeof window === "undefined" || !isProductionHost(window.location.hostname)) {
    // eslint-disable-next-line no-console
    console.warn('[errorTracking] Fora de produção — erro NÃO gravado no error_logs (simulado):', payload.message);
    return;
  }
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("error_logs").insert({
      ...payload,
      user_agent: navigator.userAgent,
      url: payload.url ?? window.location.href,
    });
    if (error) console.error("[Error tracking] Could not save diagnostic", error.code);
  } catch {
    // Never throw from error handler
  }
}

export function initErrorTracking() {
  window.addEventListener("error", (event) => {
    logError({
      message: event.message ?? "Unknown error",
      source: event.filename ?? null,
      url: window.location.href,
      line_number: event.lineno ?? null,
      col_number: event.colno ?? null,
      stack: event.error?.stack ?? null,
      severity: "error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    logError({
      message: reason?.message ?? String(reason),
      source: null,
      url: window.location.href,
      line_number: null,
      col_number: null,
      stack: reason?.stack ?? null,
      severity: "unhandled_rejection",
    });
  });
}
