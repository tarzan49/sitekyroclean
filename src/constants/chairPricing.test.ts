import { describe, expect, it } from 'vitest';
import { botQuote } from '../lib/botQuote';
import { aloneTotal, newItem } from '../components/quiz/VisitBasket';
import { chairCleanTotal, chairPackTotal, chairsCombinedTotal } from './chairPricing';

// A tabela do dono (25 Nov 2026), em Lisboa com deslocação. Se algum sítio der outro número, isto falha.
const TABELA: [number, number, number, number][] = [
  // cadeiras, só limpeza, limpeza + Essencial, limpeza + Premium
  [1, 30, 39, 59], [2, 50, 69, 89], [3, 70, 99, 119], [4, 90, 129, 149], [5, 105, 149, 179], [6, 120, 169, 209],
  [7, 125, 189, 239], [8, 140, 209, 269], [9, 150, 229, 289], [10, 160, 249, 309], [11, 170, 269, 339], [12, 180, 289, 359],
];
const q = (items: unknown[]) => botQuote({ city: 'Lisboa', items }) as unknown as { total: number; waterproofingTiers: { premium: number; essencial: number } };
const C = (qty: number, treatment = 'clean') => ({ kind: 'chairs', qty, treatment });

describe('tabela de cadeiras do dono', () => {
  it.each(TABELA)('%i cadeiras: %i / %i / %i no bot e no site', (n, clean, ess, prem) => {
    expect([q([C(n)]).total, q([C(n, 'clean+essencial')]).total, q([C(n, 'clean+premium')]).total]).toEqual([clean, ess, prem]);
    const t = q([C(n, 'clean+essencial')]).waterproofingTiers;
    expect([t.essencial, t.premium]).toEqual([ess, prem]);
    const site = (pack: 'none' | 'essencial' | 'premium') => aloneTotal('Lisboa', newItem('chairs', { qty: n, pack }));
    expect([site('none'), site('essencial'), site('premium')]).toEqual([clean, ess, prem]);
  });
  it('limpeza e impermeabilização em linhas separadas, ou em duas linhas, dão o mesmo', () => {
    for (const [n, , ess, prem] of TABELA.filter(r => r[0] > 3)) {
      expect(q([C(n), C(n, 'essencial')]).total).toBe(ess);
      expect(q([C(n), C(n, 'premium')]).total).toBe(prem);
      expect(q([C(n - 2, 'clean+premium'), C(2, 'clean+premium')]).total).toBe(prem);
    }
  });
  it('nunca desce, a Premium fica sempre acima da Essencial e o pack acima da limpeza; acaba em 9', () => {
    for (let n = 1; n <= 100; n++) {
      const e = chairPackTotal(n, 'essencial')!, p = chairPackTotal(n, 'premium')!;
      expect(p).toBeGreaterThan(e);
      expect(e).toBeGreaterThan(chairCleanTotal(n)!);
      expect([e % 10, p % 10]).toEqual([9, 9]);
      expect(chairsCombinedTotal(n, n, 'premium')).toBe(p);
      if (n > 1) expect([e > chairPackTotal(n - 1, 'essencial')!, p > chairPackTotal(n - 1, 'premium')!]).toEqual([true, true]);
    }
  });
});
