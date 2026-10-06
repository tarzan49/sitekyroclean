import { describe, expect, it } from 'vitest';
import { WHATSAPP_BASE } from '@/constants/business';
import { buildGeneralWaMessage, buildServiceWaMessage, buildSubmittedWaMessage, buildVariantWaMessage } from './whatsappMessages';

describe('WhatsApp enquiry context and privacy', () => {
  it('matches the approved Lisbon sofa message: one sentence to finish, last, where the cursor lands', () => {
    expect(buildServiceWaMessage('limpeza-sofas', 'Lisboa')).toBe('Olá! Gostaria de saber o preço e a disponibilidade para limpar o meu sofá em Lisboa.\n\nÉ um sofá de ');
  });
  it('asks the locality only when the page does not name a place', () => {
    expect(buildServiceWaMessage('limpeza-sofas')).toMatch(/Localidade e nº de lugares do sofá: $/);
    expect(buildServiceWaMessage('limpeza-colchoes', 'Porto')).toMatch(/É um colchão de $/);
  });
  it.each(['limpeza-sofas', 'limpeza-colchoes', 'limpeza-tapetes', 'limpeza-cadeiras', 'limpeza-alcatifas', 'impermeabilizacao'])('asks price and availability and promises nothing on %s', service => {
    for (const text of [buildServiceWaMessage(service, 'Lisboa'), buildServiceWaMessage(service)]) {
      expect(text).toContain('o preço e a disponibilidade');
      expect(text).not.toMatch(/Envio a seguir/);
      expect(text.split('\n\n')).toHaveLength(2);
    }
  });
  it('keeps waterproofing distinct from cleaning', () => {
    const text = buildServiceWaMessage('impermeabilizacao', 'Porto');
    expect(text).toContain('impermeabilizar o meu sofá no Porto');
    expect(text).toMatch(/É um sofá de $/);
    expect(text).not.toContain('limpar');
  });
  it('keeps Porto and protection distinct from cleaning', () => {
    const text = buildVariantWaMessage(true, 'Sofá', 'Impermeabilização', 'Porto');
    expect(text).toBe('Olá! Gostaria de saber o preço e a disponibilidade para impermeabilizar o meu sofá no Porto.\n\nÉ um sofá de ');
    expect(buildVariantWaMessage(false, 'Colchão', 'Higienização', 'Braga')).toBe('Olá! Gostaria de saber o preço e a disponibilidade para higienizar o meu colchão em Braga.\n\nÉ um colchão de ');
    expect(buildVariantWaMessage(false, 'Tapetes', 'Lavagem', 'Porto')).toMatch(/lavar os meus tapetes no Porto\.\n\nOs tapetes medem mais ou menos $/);
    expect(buildVariantWaMessage(true, 'Cadeiras', 'Impermeabilização', 'Porto')).toMatch(/impermeabilizar as minhas cadeiras no Porto\.\n\nNº de cadeiras: $/);
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
  it('says photos are on the way when the order has items without a price, keeping the start the bot looks for', () => {
    const text = buildSubmittedWaMessage('ANPNQP3Z', { photoQuote: true });
    expect(text.startsWith('Olá! Acabei de enviar o pedido #ANPNQP3Z.')).toBe(true);
    expect(text).toContain('o preço e a disponibilidade');
  });
});
