// Auditoria de 24 Nov 2026 a 12 136 pedidos: um teste por erro corrigido no motor.
import { describe, expect, it } from 'vitest';
import { botQuote, chairPackStruck } from './botQuote';
import { chairPackWas } from '../constants/chairPricing';

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

  it('4. canto em imper sozinha = 199/139 com a deslocação; na visita perde a 2.ª deslocação como os outros tamanhos (189)', () => {
    expect(q('Lisboa', [sofa('canto', 'premium')]).total).toBe(199);
    expect(q('Lisboa', [sofa('canto', 'essencial')]).total).toBe(139);
    const r = q('Lisboa', [sofa('canto', 'premium'), chairs(4, 'premium')]);
    expect(r.lines.find((l: Q) => /Canto/.test(l.label)).amount).toBe(189);
  });
  it('5L e 6L na visita: a linha perde a deslocação como o 3L e o 4L (dono, 25 Nov 2026)', () => {
    const M = mattress('casal');
    expect(q('Lisboa', [sofa('5-lugares', 'clean')]).total).toBe(119);
    expect(q('Lisboa', [sofa('5-lugares', 'clean'), M]).lines[0].amount).toBe(109);
    expect(q('Lisboa', [sofa('5-lugares', 'clean', { seats: 6, look: 'compacto' }), M]).lines[0].amount).toBe(119);
    expect(q('Lisboa', [sofa('5-lugares', 'premium'), M]).lines[0].amount).toBe(209);
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

describe('auditoria, 2.ª passagem (24 Nov 2026)', () => {
  it('imper nas cadeiras com outra peça nunca baixa o total', () => {
    expect(paid(q('Funchal', [chairs(4, 'clean+essencial'), chairs(6, 'clean+essencial')]))).toBeGreaterThanOrEqual(paid(q('Funchal', [chairs(4, 'clean'), chairs(6, 'clean+essencial')])));
    expect(paid(q('Faro', [chairs(4, 'clean+essencial'), rug(3, 4)]))).toBeGreaterThanOrEqual(paid(q('Faro', [chairs(4, 'clean'), rug(3, 4)])));
  });
  it('quando a oferta se perde no arredondamento ao 9 não há riscado (nunca um +10 inventado)', () => {
    const r = q('Coimbra', [chairs(1, 'clean+anti-acaros'), chairs(12, 'clean+anti-acaros')]);
    expect([r.visitGifts.usual, r.visitGifts.total, r.separatePrice]).toEqual([279, 279, null]);
  });
});

describe('Blindado 5L/6L acima de 300€ (dono, 25 Nov 2026: "Sim, também")', () => {
  it('leva o riscado do separado, sem a condição dos 300€', () => {
    for (const it of [sofa('5-lugares', 'clean+premium'), sofa('5-lugares', 'clean+premium', { seats: 6, look: 'compacto' })]) {
      const r = q('Lisboa', [it]);
      expect(r.separatePrice?.separate).toBeGreaterThan(r.total);
      expect(r.bigOrder).toBeNull();
    }
  });
});

describe('sofás de pele: o riscado não conta o tratamento duas vezes (25 Nov 2026, 2×3L dava ~~299~~ 219)', () => {
  const L = (size: string, qty = 1) => sofa(size, 'clean', { leather: true, qty });
  it.each([['2-lugares', 2, 239], ['3-lugares', 2, 259], ['3-lugares', 3, 389], ['4-lugares', 3, 449], ['5-lugares', 2, 359], ['1-lugar', 3, 299]])('%s × %i: riscado = cada um sozinho, somado, a acabar em 9 (%i)', (size, n, usual) => {
    for (const items of [[L(size, n)], Array.from({ length: n }, () => L(size))]) {
      const r = q('Lisboa', items);
      expect([r.visitGifts.usual, r.separatePrice.separate, r.separatePrice.saving]).toEqual([usual, usual, usual - r.total]);
    }
  });
});

describe('riscado das cadeiras (dono, 25 Nov 2026: "Sim, limita")', () => {
  it('1 a 100 cadeiras: nunca acima da limpeza + impermeabilização em separado, e o preço não muda', () => {
    for (const city of ['Lisboa', 'Figueira da Foz', 'Cascais']) for (let n = 1; n <= 100; n++) {
      const clean = q(city, [chairs(n, 'clean')]).total;
      for (const t of ['premium', 'essencial'] as const) {
        const max = clean + q(city, [chairs(n, t)]).total;
        const was = chairPackStruck(n, t, city)!;
        expect(was).toBe(Math.min(chairPackWas(n, t), max));
        const r = q(city, [chairs(n, `clean+${t}`)]);
        if (r.chairsWas !== null) expect([r.chairsWas, r.chairsWas > r.total]).toEqual([was, true]);
      }
    }
    expect([q('Lisboa', [chairs(12, 'clean+premium')]).total, q('Lisboa', [chairs(12, 'clean+premium')]).chairsWas]).toEqual([359, 459]);
    expect(q('Lisboa', [chairs(100, 'clean+premium')]).chairsWas).toBe(3099);
  });
  it('duas linhas de cadeiras: o riscado é as duas sozinhas + a oferta, ao 9, e nunca um valor inventado', () => {
    const r = q('Lisboa', [chairs(1, 'clean'), chairs(1, 'clean')]);
    expect([r.total, r.visitGifts.usual, r.separatePrice]).toEqual([69, 69, null]);
    for (const city of ['Lisboa', 'Coimbra']) for (let a = 1; a <= 14; a++) for (let b = 1; b <= 14; b++) for (const [s, t] of [['clean', 'clean'], ['clean', 'clean+anti-acaros'], ['clean+anti-acaros', 'clean+anti-acaros']]) {
      const x = q(city, [chairs(a, s), chairs(b, t)]);
      if (!x.visitGifts || x.visitGifts.usual <= x.visitGifts.total) continue;
      const sum = q(city, [chairs(a, s)]).total + q(city, [chairs(b, t)]).total + x.visitGifts.gifts.reduce((n: number, g: Q) => n + g.normal, 0);
      expect(x.visitGifts.usual).toBeLessThan(sum + 10);
    }
  });
});
