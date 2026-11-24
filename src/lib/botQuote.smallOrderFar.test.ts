import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

type Q = { ok: boolean; total: number; smallOrderSurcharge: unknown; waterproofingTiers: { premium: number; essencial: number } | null };
const q = (input: unknown) => botQuote(input) as unknown as Q;

// Dono, 23 Nov 2026: abaixo de 49€, a mais de 20 km de carro de Odivelas = +10€; margem sul fica de fora.
describe('pedido pequeno longe de Odivelas', () => {
  it('cadeirão em Cascais leva +10€', () => {
    const r = q({ items: [], armchairs: 1, city: 'Cascais' });
    expect(r.total).toBe(59);
    expect(r.smallOrderSurcharge).not.toBeNull();
  });
  it('freguesia perto (Queluz, Algés) e Lisboa ficam sem acréscimo', () => {
    for (const city of ['Queluz', 'Queluz, Sintra', 'Lisboa', 'Algés']) {
      expect(q({ items: [], armchairs: 1, city }).total).toBe(49);
    }
  });
  it('margem sul fica sem acréscimo', () => {
    expect(q({ items: [], armchairs: 1, city: 'Setúbal' }).smallOrderSurcharge).toBeNull();
    expect(q({ items: [], armchairs: 1, city: 'Sesimbra' }).smallOrderSurcharge).toBeNull();
  });
  it('cada opção conta à parte: Essencial de 1 lugar sobe, Premium não', () => {
    const r = q({ items: [{ kind: 'sofa', size: '1-lugar', treatment: 'essencial' }], city: 'Cascais' });
    expect(r.waterproofingTiers).toMatchObject({ premium: 89, essencial: 59 });
  });
  it('a partir de 49€ sem deslocação não muda', () => {
    // 3 chairs = 60€ (dono, 24 Nov 2026: 20€ each up to 4; 2 chairs = 40€ is now below 49€).
    expect(q({ items: [{ kind: 'chairs', qty: 3 }], city: 'Mafra' }).smallOrderSurcharge).toBeNull();
    expect(q({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Cascais' }).total).toBe(89);
  });
});
