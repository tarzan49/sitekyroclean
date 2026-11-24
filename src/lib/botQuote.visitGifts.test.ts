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
  it('acima de 300€ numa peça só: preço de tabela, nunca desce (dono, 24 Nov 2026)', () => {
    const r = botQuote({ items: [{ kind: 'chairs', qty: 30 }], city: 'Porto' }) as any;
    expect(r.visitGifts).toBeNull();
    expect([r.bigOrder, r.total, r.chairsWas]).toEqual([null, 360, 600]);
  });
});

describe('visitGifts: casos 3 a 6 (dono, 24 Nov 2026)', () => {
  const pieces = (r: any) => (r.visitGifts?.gifts ?? []).map((x: any) => x.piece);
  it('3.ª peça sem cadeiras: o tratamento mais barato que houver', () => {
    expect(pieces(botQuote({ items: [S, M, R], city: 'Lisboa' }))).toEqual(['mattress', 'rug']);
  });
  it('sem colchão: o tratamento mais barato (sofá + cadeiras = cadeiras; dois sofás = um sofá)', () => {
    expect(pieces(botQuote({ items: [S, C], city: 'Lisboa' }))).toEqual(['chairs']);
    // Dois sofás de 3L (~158€): o anti-ácaros de 50€ passa os 20% do pedido, não há oferta (dono, 25 Nov 2026).
    expect(pieces(botQuote({ items: [S, S], city: 'Lisboa' }))).toEqual([]);
  });
  it('poltronas contam como peça', () => {
    // Sofá + 1 poltrona: os 50€ do sofá passam os 20%; com 4 poltronas já cabe (dono, 25 Nov 2026).
    expect(pieces(botQuote({ items: [S], armchairs: 1, city: 'Lisboa' }))).toEqual([]);
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

describe('o mesmo pedido dá o mesmo preço, com qty ou em itens (Ovar, 24 Nov 2026)', () => {
  it('sofá 2L + 2 sofás 3L + 6 cadeiras', () => {
    const a = botQuote({ city: 'Ovar', items: [{ kind: 'sofa', size: '2-lugares' }, S, S, C] }) as any;
    const b = botQuote({ city: 'Ovar', items: [{ kind: 'sofa', size: '2-lugares' }, { ...S, qty: 2 }, C] }) as any;
    expect([b.total, b.visitGifts.usual, b.visitGifts.withoutGift, b.separatePrice?.separate]).toEqual([a.total, a.visitGifts.usual, a.visitGifts.withoutGift, a.separatePrice?.separate]);
  });
  it('dois colchões em qty contam como duas peças', () => {
    const a = botQuote({ city: 'Lisboa', items: [M, M] }) as any;
    const b = botQuote({ city: 'Lisboa', items: [{ ...M, qty: 2 }] }) as any;
    expect(b.total).toBe(a.total);
    expect(b.visitGifts?.usual).toBe(a.visitGifts?.usual);
  });
});

describe('colchão com anti-ácaros e tapete com anti-odor acabam em 9 (dono, 24 Nov 2026)', () => {
  it('colchões e tapetes', () => {
    const t = (items: unknown[]) => botQuote({ items, city: 'Lisboa' }) as any;
    expect(t([{ ...M, treatment: 'clean+anti-acaros' }]).total).toBe(99);
    expect(t([{ kind: 'mattress', size: 'solteiro', treatment: 'clean+anti-acaros' }]).total % 10).toBe(9);
    expect(t([{ kind: 'rug', width: 2.5, length: 3, odor: true }]).rugEstimate.homePrice % 10).toBe(9);
    expect(t([{ kind: 'rug', width: 1.6, length: 2.3, odor: true }]).rugEstimate.homePrice % 10).toBe(9);
  });
});
