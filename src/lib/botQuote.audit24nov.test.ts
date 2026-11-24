// Auditoria de 24 Nov 2026 a 12 136 pedidos: um teste por erro corrigido no motor.
import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

type Q = Record<string, any>;
const q = (city: string, items: unknown[]): Q => botQuote({ city, items }) as Q;
/** What the client pays: the rug combo price, or the total. */
const paid = (r: Q) => (typeof r.rugCombo?.comboPrice === 'number' ? r.rugCombo.comboPrice : r.total);
const sofa = (size: string, treatment: string, extra: object = {}) => ({ kind: 'sofa', size, treatment, ...extra });
const mattress = (size: string, treatment = 'clean') => ({ kind: 'mattress', size, treatment });
const chairs = (qty: number, treatment: string) => ({ kind: 'chairs', qty, treatment });
const rug = (width: number, length: number, extra: object = {}) => ({ kind: 'rug', width, length, ...extra });

describe('auditoria 24 Nov 2026', () => {
  it('1. a ordem das peças não muda o total (colchões com anti-ácaros, U/5L de níveis diferentes)', () => {
    for (const [a, b] of [[mattress('casal'), mattress('king', 'clean+anti-acaros')], [mattress('casal'), mattress('solteiro', 'clean+anti-acaros')], [mattress('casal'), mattress('casal', 'clean+anti-acaros')]]) {
      expect(paid(q('Lisboa', [a, b]))).toBe(paid(q('Lisboa', [b, a])));
    }
    const p5 = sofa('5-lugares', 'premium'), ce = sofa('canto', 'essencial');
    expect(q('Lisboa', [p5, ce]).total).toBe(q('Lisboa', [ce, p5]).total);
  });

  it('2. qty 2 = duas linhas (5L limpeza, imper de 1L, alcatifas na escada)', () => {
    const two = (it: object) => [paid(q('Lisboa', [{ ...it, qty: 2 }])), paid(q('Lisboa', [it, it]))];
    const [a, b] = two(sofa('5-lugares', 'clean'));
    expect(a).toBe(b);
    const [c, d] = two(sofa('1-lugar', 'premium'));
    expect(c).toBe(d);
    const carpet = { kind: 'carpet', width: 10, length: 10, treatment: 'clean' };
    expect(paid(q('Figueira da Foz', [chairs(13, 'clean'), { ...carpet, qty: 2 }]))).toBe(paid(q('Figueira da Foz', [chairs(13, 'clean'), carpet, carpet])));
  });

  it('3. riscados das opções com imper sozinha: o outro nível pelo seu preço, a acabar em 9, nunca separate 9 / Poupa negativa', () => {
    const r = q('Lisboa', [sofa('3-lugares', 'premium'), sofa('3-lugares', 'premium')]);
    const ess = r.separatePrice?.tiers?.essencial;
    if (ess) expect(ess.separate).toBeLessThan(300);
    for (const v of [r.waterproofingTiers.premium, r.waterproofingTiers.essencial]) expect(v % 10).toBe(9);
    const b = q('Braga', [mattress('casal', 'clean+anti-acaros'), sofa('canto', 'premium')]);
    if (b.separatePrice) {
      expect(b.separatePrice.saving).toBeGreaterThanOrEqual(0);
      expect(b.separatePrice.separate === 0 || b.separatePrice.separate > b.separatePrice.total).toBe(true);
    }
  });

  it('4. canto em imper sozinha com outra peça = 199/139 (nunca 179/129)', () => {
    const r = q('Lisboa', [sofa('canto', 'premium'), chairs(4, 'premium')]);
    expect(r.lines.find((l: Q) => /Canto/.test(l.label)).amount).toBe(199);
    expect(r.total).toBeGreaterThanOrEqual(299);
  });

  it('5. 5L/6L em imper sozinha + outra imper, ou + tapete, têm preço; Blindado + tapete tem opções', () => {
    expect(q('Lisboa', [sofa('5-lugares', 'premium'), chairs(4, 'premium')]).handToOwner).toBe(false);
    expect(q('Lisboa', [sofa('5-lugares', 'premium'), sofa('3-lugares', 'premium')]).quote).toBe(false);
    expect(paid(q('Lisboa', [sofa('5-lugares', 'essencial', { seats: 6 }), rug(2, 3)]))).toEqual(expect.any(Number));
    expect(q('Lisboa', [sofa('3-lugares', 'clean+premium'), rug(2, 3)]).waterproofingTiers?.premium).toEqual(expect.any(Number));
  });

  it('6. escada A com 5L em imper sozinha (oferta, fim 9) e mínimo das peças sozinhas já arredondadas', () => {
    const r = q('Lisboa', [mattress('casal'), sofa('5-lugares', 'premium')]);
    expect(r.visitGifts?.gifts?.[0]?.piece).toBe('mattress');
    expect(r.total % 10).toBe(9);
    const items = [sofa('1-lugar', 'clean'), chairs(5, 'clean'), rug(2.5, 3.5, { odor: true })];
    const alone = items.reduce((s, i) => s + paid(q('Porto', [i])), 0);
    expect(paid(q('Porto', items))).toBeGreaterThanOrEqual(alone - (q('Porto', [items[0]]).smallOrderSurcharge ? 10 : 0));
  });

  it('7. pedir o anti-odor nunca baixa o total', () => {
    expect(paid(q('Faro', [chairs(14, 'clean+anti-acaros'), rug(2, 3, { odor: true })]))).toBeGreaterThanOrEqual(paid(q('Faro', [chairs(14, 'clean+anti-acaros'), rug(2, 3)])));
    expect(paid(q('Lisboa', [rug(1.2, 1.8, { odor: true }), sofa('2-lugares', 'clean+anti-acaros')]))).toBeGreaterThanOrEqual(paid(q('Lisboa', [rug(1.2, 1.8), sofa('2-lugares', 'clean+anti-acaros')])));
  });

  it('8. cadeiras com imper em duas linhas seguem os escalões: 4 + 2 Premium = 6 numa linha', () => {
    expect(q('Lisboa', [chairs(4, 'clean+premium'), chairs(2, 'clean+premium')]).waterproofingTiers.premium).toBe(q('Lisboa', [chairs(6, 'clean+premium')]).waterproofingTiers.premium);
  });

  it('9. alcatifa com um lado de 25 m é 25 m, não 25 cm', () => {
    expect(q('Lisboa', [{ kind: 'carpet', width: 5, length: 25, treatment: 'clean' }]).rugEstimate?.homePrice).toBeGreaterThan(400);
  });
});

describe('escada A, dono 25 Nov 2026', () => {
  it('sofá de pele a mais: a oferta é o tratamento da pele (40€), o cliente paga a limpeza', () => {
    const r = q('Lisboa', [sofa('3-lugares', 'clean+premium'), sofa('3-lugares', 'clean', { leather: true })]);
    expect(r.visitGifts?.gifts).toEqual([{ piece: 'sofa', treatment: 'tratamento-pele', normal: 40 }]);
    expect(r.visitGifts.usual).toBeGreaterThan(r.visitGifts.total);
  });
  it('as ofertas nunca passam 20% do pedido (o colchão fica fora do teto)', () => {
    const r = q('Lisboa', [sofa('3-lugares', 'clean'), sofa('1-lugar', 'clean'), chairs(6, 'clean')]);
    const sum = (r.visitGifts?.gifts ?? []).filter((g: Q) => g.piece !== 'mattress').reduce((a: number, g: Q) => a + g.normal, 0);
    expect(sum).toBeLessThanOrEqual(0.2 * paid(r));
    expect(q('Lisboa', [sofa('3-lugares', 'clean'), mattress('casal')]).visitGifts).toMatchObject({ total: 169, gifts: [{ piece: 'mattress', normal: 40 }] });
  });
});
