import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

// Escada A (dono, 24 Nov 2026): juntar peças nunca baixa o total; oferece-se um tratamento, com o preço riscado.
const S = { kind: 'sofa', size: '3-lugares' }, M = { kind: 'mattress', size: 'casal' }, C = { kind: 'chairs', qty: 6 }, R = { kind: 'rug', width: 2, length: 3 };
const g = (items: unknown[]) => (botQuote({ items, city: 'Lisboa' }) as any).visitGifts;

describe('visitGifts (escada A)', () => {
  it('sofá + colchão: anti-ácaros no colchão, total sobe ao 9 seguinte (148 -> 149)', () => {
    expect(g([S, M])).toMatchObject({ total: 149, usual: 168, gifts: [{ piece: 'mattress', normal: 20 }] });
  });
  it('3 peças: + anti-ácaros nas cadeiras', () => {
    expect(g([S, M, C]).total % 10).toBe(9);
    expect(g([S, M, C])).toMatchObject({ gifts: [{ piece: 'mattress', normal: 20 }, { piece: 'chairs', normal: 30 }] });
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
