import { leadAttributionNote } from '@/lib/leadAttribution';
import { trackEvent } from '@/lib/analytics';
/**
 * contactService.ts
 * Submits the simple contact form to Formspree.
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
  const response = await fetch('https://formspree.io/f/xreozzbp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: data.nome,
      phone: data.telefone,
      email: data.email,
      location: data.localidade,
      message: data.mensagem,
      campaign_attribution: leadAttributionNote() || undefined,
    }),
  });

  if (!response.ok) throw new Error('Erro ao enviar');
  trackEvent('generate_lead', { form: 'contact', delivery: 'formspree' });
}
