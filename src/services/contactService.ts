import { leadAttributionNote } from '@/lib/leadAttribution';
import { newLeadId, trackLeadEvent } from '@/lib/leadTracking';
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
  const leadId = newLeadId();
  const { data: result, error } = await supabase.functions.invoke('send-lead-email', {
    body: {
      lead: {
        name: data.nome,
        phone: data.telefone,
        email: data.email || undefined,
        location: data.localidade,
        message: data.mensagem,
        lead_id: leadId,
        notes: attribution || undefined,
      },
      subject: 'Novo contacto do site',
    },
  });

  if (error || !result?.success) throw new Error('Erro ao enviar');

  // Depois da confirmação do servidor, nunca no clique. Passa pela camada de
  // leads (e não por um `trackEvent('generate_lead')` solto, que era o que
  // estava aqui) para ganhar o `lead_id`, a proteção contra repetição e a
  // conversão do Google Ads com o mesmo identificador.
  await trackLeadEvent({
    lead_id: leadId,
    channel: 'form',
    city: data.localidade,
    email: data.email || undefined,
    phone: data.telefone,
  });
}
