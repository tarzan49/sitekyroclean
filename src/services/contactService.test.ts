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
      lead: { name: data.nome, phone: data.telefone, email: data.email, location: data.localidade, message: data.mensagem, notes: undefined },
      subject: 'Novo contacto do site',
    },
  });
});

it('reports a failure instead of confirming a failed contact', async () => {
  mocks.invoke.mockResolvedValue({ data: null, error: { message: 'down' } });
  await expect(submitContactForm({ nome: 'Teste', telefone: '900000000', email: '', localidade: 'Lisboa', mensagem: 'Teste' })).rejects.toThrow();
});

it('reports a failure when the function responds without success', async () => {
  mocks.invoke.mockResolvedValue({ data: { success: false }, error: null });
  await expect(submitContactForm({ nome: 'Teste', telefone: '900000000', email: 'a@a.pt', localidade: 'Lisboa', mensagem: 'Teste' })).rejects.toThrow();
});
