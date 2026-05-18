import { supabase } from "@/integrations/supabase/client";

// Stable session ID for this browser tab
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function trackQuizEvent(params: {
  step: number;
  action: "start" | "complete" | "abandon";
  service?: string;
  city?: string;
  value?: number;
  service_type?: string;
}) {
  try {
    await (supabase as any).from("quiz_events").insert({
      session_id: SESSION_ID,
      step: params.step,
      action: params.action,
      service: params.service ?? null,
      city: params.city ?? null,
      value: params.value ?? null,
      service_type: params.service_type ?? null,
    });
  } catch {
    // Never throw from tracking — it's fire-and-forget
  }
}
