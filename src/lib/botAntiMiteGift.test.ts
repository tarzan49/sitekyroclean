import { describe, it, expect } from 'vitest';
import { botQuote } from './botQuote';

describe('anti-ácaros oferecido num pedido grande (dono, 30/10/2026)', () => {
  it('sofá 3L + 3 colchões com anti-ácaros: a condição especial é o anti-ácaros oferecido', () => {
    const q = botQuote({ city: 'Porto', items: [
      { kind: 'sofa', size: '3-lugares', treatment: 'clean+anti-acaros' },
      { kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' },
      { kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' },
      { kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' },
    ] }) as any;
    const clean = botQuote({ city: 'Porto', items: [
      { kind: 'sofa', size: '3-lugares' }, { kind: 'mattress', size: 'casal' }, { kind: 'mattress', size: 'casal' }, { kind: 'mattress', size: 'casal' },
    ] }) as any;
    expect(q.bigOrder.normal).toBeGreaterThan(300);
    // Com a escada A (24 Nov) o pedido só com limpeza pode subir ao 9 seguinte; a condição especial fica o preço de tabela.
    expect(q.antiMiteGift).toBe(q.total - q.bigOrder.special);
    expect(clean.total - q.bigOrder.special).toBeGreaterThanOrEqual(0);
    expect(clean.total - q.bigOrder.special).toBeLessThan(10);
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
