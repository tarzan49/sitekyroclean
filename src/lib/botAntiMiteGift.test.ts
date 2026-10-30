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
    expect(q.antiMiteGift).toBe(q.total - clean.total);
    expect(q.bigOrder.special).toBe(clean.total);
  });
  it('sem anti-ácaros fica a condição de sempre', () => {
    const q = botQuote({ city: 'Porto', items: Array(4).fill({ kind: 'sofa', size: '3-lugares' }) }) as any;
    expect(q.antiMiteGift).toBeNull();
  });
});
