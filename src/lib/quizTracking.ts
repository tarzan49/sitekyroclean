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

const IS_LOCALHOST =
  typeof window !== "undefined" &&
  (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname === "::1"
  );

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

export async function trackQuizEvent(params: {
  step: number;
  action: "start" | "complete" | "abandon";
  service?: string;
  city?: string;
  value?: number;
  service_type?: string;
}) {
  if (IS_LOCALHOST) return;
  try {
    await (supabase as any).from("quiz_events").insert({
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
  } catch {
    // Never throw from tracking — it's fire-and-forget
  }
}
