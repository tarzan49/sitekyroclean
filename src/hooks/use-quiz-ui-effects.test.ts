import { expect, it } from 'vitest';
import { buildSocialProofMessages } from './use-quiz-ui-effects';
it('uses the habitual weekly volume and a ten-minute response without simulated reservations', () => {
  for (const city of ['Lisboa', 'Porto', 'Braga', 'Faro']) {
    const messages = buildSocialProofMessages(city).map(message => message.text).join(' ');
    expect(messages).toContain('50 a 60 pedidos de orçamento por semana');
    expect(messages).toContain('menos de 10 minutos');
    expect(messages).not.toMatch(/30 minutos|acabou de reservar|agenda a fechar|Hoje já/);
    expect(buildSocialProofMessages(city)).toEqual(buildSocialProofMessages(city));
  }
});
