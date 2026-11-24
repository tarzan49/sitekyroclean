// Anti-ácaros no colchão oferecido vale 40€ (preço à parte; dono, 24 Nov 2026).
import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

// Escada A (dono, 24 Nov 2026): juntar peças nunca baixa o total; oferece-se um tratamento, com o preço riscado.
const S = { kind: 'sofa', size: '3-lugares' }, M = { kind: 'mattress', size: 'casal' }, C = { kind: 'chairs', qty: 6 }, R = { kind: 'rug', width: 2, length: 3 };
const g = (items: unknown[]) => (botQuote({ items, city: 'Lisboa' }) as any).visitGifts;

describe('visitGifts (escada A)', () => {
  it('sofá + colchão: anti-ácaros no colchão, nunca abaixo das peças sozinhas, 89 + 79 = 168 -> 169', () => {
    expect(g([S, M])).toMatchObject({ total: 169, usual: 209, withoutGift: 149, gifts: [{ piece: 'mattress', normal: 40 }] });
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
  it('acima de 300€ numa peça só (sem nada para oferecer): fica a condição de sempre', () => {
    const r = botQuote({ items: [{ kind: 'chairs', qty: 30 }], city: 'Porto' }) as any;
    expect(r.visitGifts).toBeNull();
    expect(r.bigOrder).not.toBeNull();
  });
});

describe('visitGifts: casos 3 a 6 (dono, 24 Nov 2026)', () => {
  const pieces = (r: any) => r.visitGifts.gifts.map((x: any) => x.piece);
  it('3.ª peça sem cadeiras: o tratamento mais barato que houver', () => {
    expect(pieces(botQuote({ items: [S, M, R], city: 'Lisboa' }))).toEqual(['mattress', 'rug']);
  });
  it('sem colchão: o tratamento mais barato (sofá + cadeiras = cadeiras; dois sofás = um sofá)', () => {
    expect(pieces(botQuote({ items: [S, C], city: 'Lisboa' }))).toEqual(['chairs']);
    expect(pieces(botQuote({ items: [S, S], city: 'Lisboa' }))).toEqual(['sofa']);
  });
  it('poltronas contam como peça', () => {
    expect(pieces(botQuote({ items: [S], armchairs: 1, city: 'Lisboa' }))).toEqual(['sofa']);
  });
  it('cadeiras já pedidas com anti-ácaros podem ser a oferta', () => {
    const r = botQuote({ items: [S, { ...C, treatment: 'clean+anti-acaros' }], city: 'Lisboa' }) as any;
    expect(pieces(r)).toEqual(['chairs']);
    expect(r.visitGifts.total).toBe(botQuote({ items: [S, C], city: 'Lisboa' }).total);
  });
});

describe('um só riscado por pedido (auditoria, 24 Nov 2026)', () => {
  const Mm = { ...M, treatment: 'clean+anti-acaros' }, Sp = { ...S, treatment: 'clean+premium' };
  it('sofá + colchão (com ou sem anti-ácaros pedido): 209 em todo o lado', () => {
    for (const items of [[S, M], [S, Mm]]) {
      const r = botQuote({ items, city: 'Lisboa' }) as any;
      expect([r.total, r.visitGifts.usual, r.separatePrice.separate]).toEqual([169, 209, 209]);
      if (r.mattressMitePack) expect(r.mattressMitePack.separate).toBe(209);
    }
  });
  it('sofá Premium + colchão: a opção Premium bate com o total, o riscado é um só', () => {
    for (const items of [[Sp, M], [Sp, Mm]]) {
      const r = botQuote({ items, city: 'Lisboa' }) as any;
      expect(r.visitGifts.tiers.premium.total).toBe(r.total);
      expect(r.waterproofingTiers.premium).toBe(r.total);
      expect(r.separatePrice.separate).toBe(r.visitGifts.usual);
      expect(r.separatePrice.tiers.premium.separate).toBe(r.visitGifts.tiers.premium.usual);
    }
  });
});
