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
  it('on its own it is not priced (owner)', () => {
    const r = botQuote({ city: 'Porto', items: [{ kind: 'rug', width: 2, length: 3, treatment: 'premium' }] }) as any;
    expect(r.ok).toBe(false);
  });
});
