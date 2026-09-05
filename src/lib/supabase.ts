import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// See src/integrations/supabase/client.ts for why this guards against a missing
// env var instead of letting createClient() throw synchronously.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// CRM statuses for quiz leads; legacy CSV records use their original Portuguese Funil values
export type LeadStatus = 'pending' | 'contacted' | 'scheduled' | 'lost' | (string & {});

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  service_type: string;
  details: string;
  location: string;
  value: string;
  slot: string;
  booking_id: string;
  message: string;
  status: LeadStatus;
  notes: string;
  // Extended CRM fields (added for historical import)
  assigned_to: string;
  priority: string;
  source: string;
  next_step: string;
  // Margin/total/region (2026-09-05): margin_value is what the owner actually
  // kept; total_value is what the customer paid (partner/subcontractor jobs
  // keep the difference). Null on older quiz-origin leads that predate this.
  margin_value: number | null;
  total_value: number | null;
  region: string | null;
}
