import { describe, expect, it } from 'vitest';
import { WHATSAPP_BASE } from '@/constants/business';
import { buildGeneralWaMessage, buildServiceWaMessage, buildSubmittedWaMessage, buildVariantWaMessage } from './whatsappMessages';

describe('WhatsApp enquiry context and privacy', () => {
  it('matches the approved Lisbon sofa message', () => {
    expect(buildServiceWaMessage('limpeza-sofas', 'Lisboa')).toBe('Olá! Gostaria de saber o preço e a próxima disponibilidade para limpar o meu sofá em Lisboa. Posso enviar fotografias e indicar a minha localidade para confirmarem o orçamento.');
  });
  it('keeps Porto and protection distinct from cleaning', () => {
    const text = buildVariantWaMessage(true, 'Sofá', 'Impermeabilização', 'Porto');
    expect(text).toContain('impermeabilizar o meu sofá no Porto');
    expect(text).toContain('avaliarem o tecido');
    expect(text).not.toMatch(/Lisboa|limpar/);
  });
  it.each(['limpeza-colchoes', 'limpeza-tapetes', 'limpeza-cadeiras', 'limpeza-alcatifas'])('preserves the article for %s', service => {
    const text = buildServiceWaMessage(service, 'Lisboa');
    expect(text).not.toContain('sofá');
    expect(text).toContain('em Lisboa');
    expect(new URL(`${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`).searchParams.get('text')).toBe(text);
  });
  it('does not assume a city on generic links', () => {
    expect(buildGeneralWaMessage()).toBe('Olá! Gostaria de saber o preço e a disponibilidade para limpar os meus estofos. Posso enviar fotografias dos artigos e indicar a minha localidade para receber um orçamento.');
  });
  it.each([undefined, null, '', '{referência}', 'Nome 900000000', 'audit@example.invalid'])('omits missing or unsafe reference %s', reference => {
    expect(buildSubmittedWaMessage(reference)).toBe('Olá! Acabei de enviar o pedido. Gostaria de confirmar o orçamento e a próxima disponibilidade. Posso enviar fotografias dos artigos para avaliação.');
  });
  it('uses only the opaque reference after submission', () => {
    expect(buildSubmittedWaMessage('ANPNQP3Z')).toContain('pedido #ANPNQP3Z.');
  });
});
