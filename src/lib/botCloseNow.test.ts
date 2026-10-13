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

describe('a booking with the close-now condition', async () => {
  const { bookingTotal } = await import('./botHold');
  const now = new Date('2026-10-13T10:00:00Z');
  const quote = { total: 89, closeNow: { ok: true, total: 80 } };
  it('carries the 10% total for a day within 7 days, the table total without the flag', () => {
    expect(bookingTotal(quote, true, '2026-10-20', now)).toEqual({ total: 80, closeNow: true });
    expect(bookingTotal(quote, undefined, '2026-10-20', now)).toEqual({ total: 89, closeNow: false });
  });
  it('hands to the owner past 7 days or without an engine price', () => {
    expect(typeof bookingTotal(quote, true, '2026-10-21', now)).toBe('string');
    expect(typeof bookingTotal({ total: 250, closeNow: { ok: false } }, true, '2026-10-14', now)).toBe('string');
  });
});
