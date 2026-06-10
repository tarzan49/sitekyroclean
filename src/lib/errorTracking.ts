import { supabase } from "@/integrations/supabase/client";

export async function logError(payload: {
  message: string;
  source?: string | null;
  url?: string | null;
  line_number?: number | null;
  col_number?: number | null;
  stack?: string | null;
  severity: "error" | "warning" | "unhandled_rejection";
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("error_logs").insert({
      ...payload,
      user_agent: navigator.userAgent,
      url: payload.url ?? window.location.href,
    });
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
