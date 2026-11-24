import { describe, it, expect } from 'vitest';
import { botQuote } from './botQuote';

describe('anti-ácaros oferecido num pedido grande (dono, 30/10/2026)', () => {
  it('sofá 3L + 3 colchões com anti-ácaros: desde 24/11 a escada A substitui o desconto (anti-ácaros oferecido, total acabado em 9)', () => {
    const q = botQuote({ city: 'Porto', items: [
      { kind: 'sofa', size: '3-lugares', treatment: 'clean+anti-acaros' },
      { kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' },
      { kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' },
      { kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' },
    ] }) as any;
    expect(q.bigOrder).toBeNull();
    expect(q.antiMiteGift).toBeNull();
    expect(q.visitGifts.gifts[0]).toMatchObject({ piece: 'mattress', treatment: 'anti-acaros' });
  });
  it('sem anti-ácaros fica a condição de sempre', () => {
    const q = botQuote({ city: 'Porto', items: Array(4).fill({ kind: 'sofa', size: '3-lugares' }) }) as any;
    expect(q.antiMiteGift).toBeNull();
  });
});

describe('anti-ácaros no colchão oferecido a partir de 150€ (dono, 19/11/2026)', () => {
  it('sofá + colchão de 150€ ou mais: oferta com o valor normal e o total só com limpeza', () => {
    const items = [{ kind: 'sofa', size: '4-lugares' }, { kind: 'mattress', size: 'casal' }];
    const q = botQuote({ city: 'Porto', items }) as any;
    const mites = botQuote({ city: 'Porto', items: [items[0], { ...items[1], treatment: 'clean+anti-acaros' }] }) as any;
    expect(q.total).toBeGreaterThanOrEqual(150);
    expect(q.mattressMiteOffer).toEqual({ normal: 20, total: q.total });
    expect(q.total % 10).toBe(9);
    expect(mites.mattressMiteOffer).toEqual(q.mattressMiteOffer);
    expect(q.askedDiscount).toBeNull();
  });
  it('abaixo de 150€ ou sem colchão: sem oferta', () => {
    expect((botQuote({ city: 'Porto', items: [{ kind: 'mattress', size: 'casal' }] }) as any).mattressMiteOffer).toBeNull();
    expect((botQuote({ city: 'Porto', items: [{ kind: 'sofa', size: '5-lugares' }, { kind: 'sofa', size: '4-lugares' }] }) as any).mattressMiteOffer).toBeNull();
  });
});
