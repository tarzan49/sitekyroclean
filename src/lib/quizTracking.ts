import { supabase } from "@/integrations/supabase/client";

// Run this in Supabase SQL editor to add the new columns:
// ALTER TABLE quiz_events
//   ADD COLUMN IF NOT EXISTS page_path text,
//   ADD COLUMN IF NOT EXISTS referrer text,
//   ADD COLUMN IF NOT EXISTS utm_source text,
//   ADD COLUMN IF NOT EXISTS utm_medium text,
//   ADD COLUMN IF NOT EXISTS utm_campaign text,
//   ADD COLUMN IF NOT EXISTS device text;

const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
    await (supabase as any).from("quiz_events").insert(payload);
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
export async function trackWhatsAppClick(source: string) {
  if (!IS_PRODUCTION) return;
  await insertEvent({
    session_id: SESSION_ID,
    step: 0,
    action: "whatsapp_click",
    service: source,
    page_path: window.location.pathname,
    device: getDevice(),
  });
}

// Called once per session on page hide/unload with seconds spent on site
export async function trackSessionTime(seconds: number) {
  if (!IS_PRODUCTION) return;
  if (seconds < 2) return; // ignore instant bounces
  await insertEvent({
    session_id: SESSION_ID,
    step: 0,
    action: "session_time",
    value: seconds,
    page_path: window.location.pathname,
    device: getDevice(),
    referrer: document.referrer || null,
  });
}
