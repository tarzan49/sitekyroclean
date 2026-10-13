import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';
import { CLOSE_NOW_CONDITION, closeNowOffer } from './botCloseNow';

describe('condição para fechar já (dono, 13/10/2026)', () => {
  it('takes 10% off a priced order up to 200€, with the condition', () => {
    const q = botQuote({ city: 'Porto', items: [{ kind: 'sofa', size: '3-lugares' }] });
    expect(q.ok).toBe(true);
    if (!q.ok) return;
    expect(q.closeNow).toEqual({ ok: true, total: Math.round(q.total! * 0.9), homePrice: null, pickupPrice: null, condition: CLOSE_NOW_CONDITION, rule: expect.any(String) });
  });
  it('never on waterproofing, above 200€ or under quote: those stay the owner\'s', () => {
    const wp = botQuote({ city: 'Porto', items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+premium' }] });
    if (wp.ok) expect(wp.closeNow.ok).toBe(false);
    expect(closeNowOffer({ total: 250, handToOwner: false, hasWaterproofing: false }).ok).toBe(false);
    expect(closeNowOffer({ total: null, handToOwner: true, hasWaterproofing: false }).ok).toBe(false);
  });
  it('rugs: 10% off the home and the pickup price', () => {
    expect(closeNowOffer({ total: null, handToOwner: true, hasWaterproofing: false, rug: { homePrice: 69, pickupPrice: 89 } }))
      .toMatchObject({ ok: true, homePrice: 62, pickupPrice: 80 });
  });
});
