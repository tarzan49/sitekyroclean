import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { botQuote } from './botQuote';

const at = (iso: string) => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(iso)); };
const q = (body: object) => botQuote({ city: 'Lisboa', ...body }) as any;

describe('Black Friday 2026 (dono, 19 Nov)', () => {
  let env: string | undefined;
  beforeEach(() => { env = process.env.KYRO_CAMPAIGNS; delete process.env.KYRO_CAMPAIGNS; });
  afterEach(() => { process.env.KYRO_CAMPAIGNS = env; vi.useRealTimers(); });

  it('ref. BFGTA antes de 27/11: sofá 3L 69€; sem ref 89€', () => {
    at('2026-11-20T12:00:00Z');
    const sofa = { items: [{ kind: 'sofa', size: '3-lugares' }] };
    expect(q({ ...sofa, campaign: 'BFGTA' }).total).toBe(69);
    expect(q({ ...sofa, campaign: 'BFGTA' }).askedDiscount).toBeNull();
    expect(q(sofa).total).toBe(89);
    expect(q(sofa).blackFriday).toBeNull();
  });
  it('ref. BFGTA: soma arredondada para baixo a acabar em 9', () => {
    at('2026-11-28T12:00:00Z');
    const g = { campaign: 'BFGTA' };
    expect(q({ ...g, items: [{ kind: 'sofa', size: '3-lugares' }, { kind: 'mattress', size: 'casal' }] }).total).toBe(119);
    expect(q({ ...g, items: [{ kind: 'sofa', size: '2-lugares' }] }).total).toBe(59);
    expect(q({ ...g, items: [{ kind: 'sofa', size: '4-lugares' }] }).total).toBe(89);
    expect(q({ ...g, items: [{ kind: 'chairs', qty: 6 }] }).total).toBe(89);
    expect(q({ items: [{ kind: 'sofa', size: '3-lugares' }] }).blackFriday).toBeNull();
  });
  it('impermeabilização não muda; acaba a 1/12', () => {
    at('2026-11-20T12:00:00Z');
    expect(q({ items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+premium' }], campaign: 'BFGTA' }).blackFriday).toBeNull();
    at('2026-12-01T00:30:00Z');
    expect(q({ items: [{ kind: 'sofa', size: '3-lugares' }], campaign: 'BFGTA' }).total).toBe(89);
  });
});
