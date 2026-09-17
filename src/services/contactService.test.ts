import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { submitContactForm } from './contactService';

const mocks = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { functions: { invoke: mocks.invoke } } }));

beforeEach(() => { mocks.invoke.mockReset().mockResolvedValue({ data: { success: true }, error: null }); });
afterEach(() => vi.unstubAllGlobals());

it('keeps every field and special characters in the simple contact lead payload', async () => {
  const data = { nome: 'Teste Ç &', telefone: '+351 900000000', email: 'audit@example.invalid', localidade: 'Póvoa de Lanhoso', mensagem: 'Sofá e alcatifa\n2,5 × 3 m' };
  await submitContactForm(data);
  expect(mocks.invoke).toHaveBeenCalledWith('send-lead-email', {
    body: {
      // `lead_id` é gerado a cada submissão; o resto tem de chegar intacto.
      lead: { name: data.nome, phone: data.telefone, email: data.email, location: data.localidade, message: data.mensagem, notes: undefined, lead_id: expect.stringMatching(/^L-\d{8}-[a-z0-9]+$/) },
      subject: 'Novo contacto do site',
    },
  });
});

it('gives every contact lead its own id, so a retry is never counted twice', async () => {
  const data = { nome: 'Teste', telefone: '900000000', email: '', localidade: 'Lisboa', mensagem: 'Olá' };
  await submitContactForm(data);
  await submitContactForm(data);
  const ids = mocks.invoke.mock.calls.map(([, options]) => options.body.lead.lead_id);
  expect(new Set(ids).size).toBe(2);
});

it('reports a failure instead of confirming a failed contact', async () => {
  mocks.invoke.mockResolvedValue({ data: null, error: { message: 'down' } });
  await expect(submitContactForm({ nome: 'Teste', telefone: '900000000', email: '', localidade: 'Lisboa', mensagem: 'Teste' })).rejects.toThrow();
});

it('reports a failure when the function responds without success', async () => {
  mocks.invoke.mockResolvedValue({ data: { success: false }, error: null });
  await expect(submitContactForm({ nome: 'Teste', telefone: '900000000', email: 'a@a.pt', localidade: 'Lisboa', mensagem: 'Teste' })).rejects.toThrow();
});
