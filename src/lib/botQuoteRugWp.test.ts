import { describe, it, expect } from 'vitest';
import { botQuote } from './botQuote';

const sofa = { kind: 'sofa', size: '2-lugares', treatment: 'clean' };

describe('rug waterproofing (owner, 30 Oct 2026)', () => {
  it('200x300 Premium in the same visit as a booked sofa = 90€, no extra travel', () => {
    const alone = botQuote({ city: 'Porto', items: [sofa] }) as any;
    const r = botQuote({ city: 'Porto', items: [sofa, { kind: 'rug', width: 2, length: 3, treatment: 'premium' }] }) as any;
    expect(r.ok).toBe(true);
    expect(r.rugWaterproofing.amount).toBe(90);
    expect(r.total).toBe(alone.total + 90);
    expect(r.travel).toBe(alone.travel);
  });
  it('rounds down: Essencial 1,55 x 2 m = 31€', () => {
    const r = botQuote({ city: 'Porto', items: [sofa, { kind: 'rug', width: 1.55, length: 2, treatment: 'essencial' }] }) as any;
    expect(r.rugWaterproofing.amount).toBe(31);
  });
  it('on its own it is priced with the town travel (owner, 12 Nov 2026): 2x3 Lisboa Premium 90 + 10 = 100€, Essencial 70€', () => {
    const r = botQuote({ city: 'Lisboa', items: [{ kind: 'rug', width: 2, length: 3, treatment: 'premium' }] }) as any;
    expect([r.ok, r.handToOwner, r.travel, r.total]).toEqual([true, false, 10, 100]);
    expect(r.waterproofingTiers).toEqual({ travel: 10, premium: 100, essencial: 70 });
    expect(r.rugWaterproofing).toEqual({ amount: 90, sameVisit: false, travelExtra: 10 });
    expect(r.lines.map((l: any) => l.label)).toEqual(['Impermeabilização Premium tapete 2 x 3 m']);
    const e = botQuote({ city: 'Lisboa', items: [{ kind: 'rug', width: 2, length: 3, treatment: 'essencial' }] }) as any;
    expect(e.total).toBe(70);
    // Waived as in the rest of the engine, read from the Premium: 3x3 = 135€ in a 10€ town, no travel on both.
    const big = botQuote({ city: 'Lisboa', items: [{ kind: 'rug', width: 3, length: 3, treatment: 'essencial' }] }) as any;
    expect([big.travel, big.total, big.waterproofingTiers]).toEqual([0, 90, { travel: 0, premium: 135, essencial: 90 }]);
    // A 20€ town, an unknown town, a far zone.
    expect((botQuote({ city: 'Sines', items: [{ kind: 'rug', width: 2, length: 3, treatment: 'premium' }] }) as any).handToOwner).toBe(true);
    const nowhere = botQuote({ city: 'Madrid', items: [{ kind: 'rug', width: 2, length: 3, treatment: 'premium' }] }) as any;
    expect([nowhere.ok, nowhere.handToOwner, nowhere.total]).toEqual([true, true, null]);
  });
  it('with the same rug cleaned in the same visit: the rug price plus the waterproofing, no extra travel', () => {
    const clean = botQuote({ city: 'Lisboa', items: [{ kind: 'rug', width: 2, length: 3 }] }) as any;
    const r = botQuote({ city: 'Lisboa', items: [{ kind: 'rug', width: 2, length: 3 }, { kind: 'rug', width: 2, length: 3, treatment: 'premium' }] }) as any;
    expect(r.rugEstimate.homePrice).toBe(clean.rugEstimate.homePrice + 90);
    expect(r.rugWaterproofing).toEqual({ amount: 90, sameVisit: true, travelExtra: 0 });
  });
  it('anti-odour goes on the cleaning item, not on the waterproofing', () => {
    expect((botQuote({ city: 'Lisboa', items: [{ kind: 'rug', width: 2, length: 3, treatment: 'premium', odor: true }] }) as any).ok).toBe(false);
  });
});
