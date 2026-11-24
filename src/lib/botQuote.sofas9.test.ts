import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

// Dono, 25 Nov 2026 ("Sim, nos dois"): vários sofás acabam sempre em 9, para cima, no site e no bot.
const s = (size: string, treatment: string, qty = 1) => ({ kind: 'sofa', size, treatment, qty });
const SIZES = ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares'];
const quote = (city: string, items: unknown[]) => botQuote({ city, items }) as unknown as { ok: boolean; quote?: boolean; total: number; waterproofingTiers?: { premium: number; essencial: number } | null; bigOrder?: { normal: number; special: number; savings: number } | null };

describe('several sofas end in 9', () => {
  it('616 -> 619 and 446 -> 449', () => {
    const at = (t: string) => quote('Lisboa', [s('2-lugares', t), s('3-lugares', t, 2)]).total;
    expect([at('clean+premium'), at('clean+essencial')]).toEqual([619, 449]);
  });
  it('every combination, total, options and big order', () => {
    const bad: string[] = [];
    for (const city of ['Lisboa', 'Porto', 'Braga', 'Funchal']) for (const t of ['clean', 'clean+anti-acaros', 'clean+premium', 'clean+essencial', 'premium', 'essencial'])
      for (const a of SIZES) for (const n of [1, 2, 3]) for (const b of [null, ...SIZES]) {
        if (n === 1 && !b) continue;
        const q = quote(city, b ? [s(a, t, n), s(b, t)] : [s(a, t, n)]);
        if (!q.ok || q.quote) continue;
        const vals = [q.total, q.waterproofingTiers?.premium, q.waterproofingTiers?.essencial, q.bigOrder?.normal, q.bigOrder?.special].filter((v): v is number => typeof v === 'number');
        if (vals.some(v => v % 10 !== 9) || (q.bigOrder && q.bigOrder.normal !== q.total)) bad.push(`${city} ${t} ${a}x${n}+${b}: ${vals}`);
      }
    expect(bad).toEqual([]);
  });
});
