import { afterEach, expect, it, vi } from 'vitest';
import { submitContactForm } from './contactService';
afterEach(() => vi.unstubAllGlobals());
it('keeps every field and special characters in the simple contact Formspree payload', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetch);
  const data = { nome: 'Teste Ç &', telefone: '+351 900000000', email: 'audit@example.invalid', localidade: 'Póvoa de Lanhoso', mensagem: 'Sofá e alcatifa\n2,5 × 3 m' };
  await submitContactForm(data);
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ name: data.nome, phone: data.telefone, email: data.email, location: data.localidade, message: data.mensagem });
});
it('reports an HTTP failure instead of confirming a failed contact', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 422 }));
  await expect(submitContactForm({ nome: 'Teste', telefone: '900000000', email: '', localidade: 'Lisboa', mensagem: 'Teste' })).rejects.toThrow();
});
