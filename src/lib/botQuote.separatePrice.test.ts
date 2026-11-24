import { describe, it, expect } from 'vitest';
import { botQuote } from './botQuote';

// "Poupa X€" (owner, 24 Nov 2026): struck price = the same order done separately, both ending in 9.
describe('separatePrice', () => {
  it('sofá 3L limpeza + Premium em Lisboa: 219€ em vez de 249€, poupa 30€', () => {
    const r = botQuote({ city: 'Lisboa', items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+premium' }] }) as any;
    expect(r.total).toBe(219);
    expect(r.separatePrice).toMatchObject({ separate: 249, total: 219, saving: 30 });
    expect(r.separatePrice.tiers.essencial).toMatchObject({ separate: 189, total: 159, saving: 30 });
  });
  it('uma peça só com limpeza: sem preço cortado', () => {
    const r = botQuote({ city: 'Lisboa', items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean' }] }) as any;
    expect(r.separatePrice).toBeNull();
  });
  it('total e separado acabam em 9', () => {
    const r = botQuote({ city: 'Lisboa', items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean' }, { kind: 'mattress', size: 'casal', treatment: 'clean' }] }) as any;
    expect(r.separatePrice.total % 10).toBe(9);
    expect(r.separatePrice.separate % 10).toBe(9);
    expect(r.total).toBe(r.separatePrice.total);
  });
});

describe('separatePrice com oferta da visita', () => {
  it('sofá 3L + colchão de casal: 169€ com o anti-ácaros oferecido, sem a opção sem ele (dono, 25 Nov 2026)', () => {
    const r = botQuote({ city: 'Lisboa', items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean' }, { kind: 'mattress', size: 'casal', treatment: 'clean' }] }) as any;
    expect(r.total).toBe(169);
    expect(r.separatePrice).toMatchObject({ separate: 209, total: 169, saving: 40, withoutGift: null });
  });
});
