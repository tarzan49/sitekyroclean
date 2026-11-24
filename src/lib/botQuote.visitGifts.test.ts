// Anti-ácaros no colchão oferecido vale 40€ (preço à parte; dono, 24 Nov 2026).
import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

// Escada A (dono, 24 Nov 2026): juntar peças nunca baixa o total; oferece-se um tratamento, com o preço riscado.
const S = { kind: 'sofa', size: '3-lugares' }, M = { kind: 'mattress', size: 'casal' }, C = { kind: 'chairs', qty: 6 }, R = { kind: 'rug', width: 2, length: 3 };
const g = (items: unknown[]) => (botQuote({ items, city: 'Lisboa' }) as any).visitGifts;

describe('visitGifts (escada A)', () => {
  it('sofá + colchão: anti-ácaros no colchão, total sobe ao 9 seguinte (148 -> 149)', () => {
    expect(g([S, M])).toMatchObject({ total: 149, usual: 188, gifts: [{ piece: 'mattress', normal: 40 }] });
  });
  it('3 peças: + anti-ácaros nas cadeiras', () => {
    expect(g([S, M, C]).total % 10).toBe(9);
    expect(g([S, M, C])).toMatchObject({ gifts: [{ piece: 'mattress', normal: 40 }, { piece: 'chairs', normal: 30 }] });
  });
  it('4 peças com tapete: + anti-odor no tapete', () => {
    const v = g([S, M, C, R]);
    expect(v.total % 10).toBe(9);
    expect(v.gifts.map((x: any) => x.piece)).toEqual(['mattress', 'chairs', 'rug']);
    expect(v.usual).toBeGreaterThan(v.total);
  });
  it('uma peça só abaixo de 150€: nada', () => {
    expect(g([S])).toBeNull();
    expect(g([M])).toBeNull();
  });
});

describe('visitGifts: opções e pedidos acima de 300€ (dono, 24 Nov 2026)', () => {
  it('sofá com impermeabilização + colchão: a oferta e o 9 também no Premium e no Essencial', () => {
    const r = botQuote({ items: [{ ...S, treatment: 'clean+premium' }, M], city: 'Lisboa' }) as any;
    const t = r.visitGifts.tiers;
    for (const k of ['premium', 'essencial'] as const) {
      if (!t[k]) continue;
      expect(t[k].total % 10).toBe(9);
      expect(t[k].usual).toBeGreaterThan(t[k].total);
      expect(r.waterproofingTiers[k]).toBe(t[k].total);
    }
  });
  it('acima de 300€ com colchões: a escada substitui o desconto, o total nunca desce', () => {
    const items = [{ kind: "sofa", size: "5-lugares" }, M, M, M];
    const r = botQuote({ items, city: 'Porto' }) as any;
    expect(r.bigOrder).toBeNull();
    expect(r.visitGifts.total % 10).toBe(9);
    expect(r.visitGifts.total).toBeGreaterThan(300);
  });
  it('acima de 300€ sem nada para oferecer: fica a condição de sempre', () => {
    const r = botQuote({ items: Array(4).fill(S), city: 'Porto' }) as any;
    expect(r.visitGifts).toBeNull();
    expect(r.bigOrder).not.toBeNull();
  });
});
