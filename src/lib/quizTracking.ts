// Run this in Supabase SQL editor to add the new columns:
// ALTER TABLE quiz_events
//   ADD COLUMN IF NOT EXISTS page_path text,
//   ADD COLUMN IF NOT EXISTS referrer text,
//   ADD COLUMN IF NOT EXISTS utm_source text,
//   ADD COLUMN IF NOT EXISTS utm_medium text,
//   ADD COLUMN IF NOT EXISTS utm_campaign text,
//   ADD COLUMN IF NOT EXISTS device text;
//
// Also required (see supabase/migrations/20260820000000_widen_quiz_events_action_check.sql):
// the original action CHECK constraint only allowed 'start'/'complete'/'abandon', which
// silently rejected every 'whatsapp_click' and 'session_time' insert below.

const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const IS_PRODUCTION =
  typeof window !== "undefined" &&
  window.location.hostname === "cleansolutions.com.pt";

function getUTMParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

function getDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

async function insertEvent(payload: Record<string, unknown>) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("quiz_events").insert(payload);
  } catch {
    // fire-and-forget
  }
}

// Used for events fired right as the page is closing/backgrounding (WhatsApp click that
// hands off to the app, session-time on pagehide). A normal fetch started at that moment
// is frequently aborted mid-flight by the browser before it reaches the server; keepalive
// keeps the request alive past unload the way sendBeacon does, while still allowing the
// custom headers Supabase's REST API requires.
function insertEventKeepalive(payload: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    fetch(`${SUPABASE_URL}/rest/v1/quiz_events`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // fire-and-forget
  }
}

export async function trackQuizEvent(params: {
  step: number;
  action: "start" | "complete" | "abandon";
  service?: string;
  city?: string;
  value?: number;
  service_type?: string;
}) {
  if (!IS_PRODUCTION) return;
  await insertEvent({
    session_id: SESSION_ID,
    step: params.step,
    action: params.action,
    service: params.service ?? null,
    city: params.city ?? null,
    value: params.value ?? null,
    service_type: params.service_type ?? null,
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    utm_source: getUTMParam("utm_source"),
    utm_medium: getUTMParam("utm_medium"),
    utm_campaign: getUTMParam("utm_campaign"),
    device: getDevice(),
  });
}

// source: 'floating' | 'hero' | 'contact' | 'obrigado' | etc.
export function trackWhatsAppClick(source: string) {
  if (!IS_PRODUCTION) return;
  insertEventKeepalive({
    session_id: SESSION_ID,
    step: 0,
    action: "whatsapp_click",
    service: source,
    page_path: window.location.pathname,
    device: getDevice(),
  });
}

// Called once per session on page hide/unload with seconds spent on site
export function trackSessionTime(seconds: number) {
  if (!IS_PRODUCTION) return;
  if (seconds < 2) return; // ignore instant bounces
  insertEventKeepalive({
    session_id: SESSION_ID,
    step: 0,
    action: "session_time",
    value: seconds,
    page_path: window.location.pathname,
    device: getDevice(),
    referrer: document.referrer || null,
  });
}
