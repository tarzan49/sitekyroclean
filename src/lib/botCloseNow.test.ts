import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';
import { CLOSE_NOW_CONDITION, closeNowDiscount, closeNowOffer } from './botCloseNow';

describe('condição para fechar já (dono, 13/10/2026)', () => {
  it('euros off by price band: 10€ up to 150€, +5€ for every 50€ above', () => {
    expect([79, 99, 150, 151, 189, 200, 209, 250, 299, 399].map(closeNowDiscount))
      .toEqual([10, 10, 10, 15, 15, 15, 20, 20, 25, 35]);
  });
  it('a cleaning order takes the euros off, with the condition', () => {
    const q = botQuote({ city: 'Porto', items: [{ kind: 'sofa', size: '3-lugares' }] });
    expect(q.ok).toBe(true);
    if (!q.ok) return;
    expect(q.closeNow).toEqual({ ok: true, total: q.total! - closeNowDiscount(q.total!), homePrice: null, pickupPrice: null, condition: CLOSE_NOW_CONDITION, rule: expect.any(String) });
  });
  it('waterproofing always 5%; above 200€ the owner decides (14 Oct); never under quote', () => {
    const wp = botQuote({ city: 'Porto', items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+essencial' }] });
    expect(wp.ok && wp.closeNow.ok && wp.closeNow.total === Math.round(wp.total! * 0.95)).toBe(true);
    expect(closeNowOffer({ total: 200, handToOwner: false })).toMatchObject({ ok: true, total: 185 });
    expect(closeNowOffer({ total: 250, handToOwner: false })).toMatchObject({ ok: false, reason: expect.stringContaining('responsável') });
    expect(closeNowOffer({ total: null, handToOwner: true, rug: { homePrice: 189, pickupPrice: 209 } }).ok).toBe(false);
    expect(closeNowOffer({ total: null, handToOwner: true }).ok).toBe(false);
  });
  it('rugs: the same euros off the home and the pickup price', () => {
    expect(closeNowOffer({ total: null, handToOwner: true, rug: { homePrice: 69, pickupPrice: 89 } }))
      .toMatchObject({ ok: true, homePrice: 59, pickupPrice: 79 });
  });
});

describe('a booking with the close-now condition', async () => {
  const { bookingTotal } = await import('./botHold');
  const now = new Date('2026-10-13T10:00:00Z');
  const quote = { total: 89, closeNow: { ok: true, total: 80 } };
  it('carries the close-now total for a day within 7 days, the table total without the flag', () => {
    expect(bookingTotal(quote, true, '2026-10-20', now)).toEqual({ total: 80, closeNow: true });
    expect(bookingTotal(quote, undefined, '2026-10-20', now)).toEqual({ total: 89, closeNow: false });
  });
  it('hands to the owner past 7 days or without an engine price', () => {
    expect(typeof bookingTotal(quote, true, '2026-10-21', now)).toBe('string');
    expect(typeof bookingTotal({ total: 250, closeNow: { ok: false } }, true, '2026-10-14', now)).toBe('string');
  });
});
