import { leadAttributionNote } from '@/lib/leadAttribution';
import { trackEvent } from '@/lib/analytics';
/**
 * contactService.ts
 * Submits the simple contact form by email (Resend, via the send-lead-email function).
 * Pure async function — no React, no hooks.
 */

export interface ContactPayload {
  nome: string;
  telefone: string;
  email: string;
  localidade: string;
  mensagem: string;
}

export async function submitContactForm(data: ContactPayload): Promise<void> {
  const { supabase } = await import('@/lib/supabase');
  const attribution = leadAttributionNote();
  const { data: result, error } = await supabase.functions.invoke('send-lead-email', {
    body: {
      lead: {
        name: data.nome,
        phone: data.telefone,
        email: data.email || undefined,
        location: data.localidade,
        message: data.mensagem,
        notes: attribution || undefined,
      },
      subject: 'Novo contacto do site',
    },
  });

  if (error || !result?.success) throw new Error('Erro ao enviar');
  trackEvent('generate_lead', { form: 'contact', delivery: 'email' });
}
