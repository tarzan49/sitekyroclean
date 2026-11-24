// Regras de preço decididas pelo dono uma a uma (24 Nov 2026), com os casos dele em Lisboa. A regra 1 ficou como estava:
// preços cheios com o tratamento oferecido (escada A, botQuote.visitGifts.test.ts).
import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';

type Q = Record<string, any>;
const q = (items: unknown[], extra: object = {}, city = 'Lisboa'): Q => botQuote({ city, items, ...extra }) as Q;
const S = (size = '3-lugares', treatment = 'clean', x: object = {}) => ({ kind: 'sofa', size, treatment, ...x });
const M = (size = 'casal', treatment = 'clean', x: object = {}) => ({ kind: 'mattress', size, treatment, ...x });
const C = (qty: number, treatment = 'clean') => ({ kind: 'chairs', qty, treatment });

describe('2. acima de 300€ o preço nunca desce ("Nunca desce")', () => {
  it.each([
    ['10 cadeiras Blindado', [C(10, 'clean+premium')], 309, 390],
    ['12 cadeiras Blindado', [C(12, 'clean+premium')], 359, 459],
    ['30 cadeiras, só limpeza', [C(30)], 360, 600],
  ])('%s', (_n, items, total, was) => {
    const r = q(items as unknown[]);
    expect([r.total, r.chairsWas, r.bigOrder]).toEqual([total, was, null]);
  });
  it.each([
    ['2 sofás 3L Blindado', [S('3-lugares', 'clean+premium'), S('3-lugares', 'clean+premium')], 439, 499],
    ['3L + 2L Blindado', [S('3-lugares', 'clean+premium'), S('2-lugares', 'clean+premium')], 399, 459],
  ])('%s', (_n, items, total, separate) => {
    const r = q(items as unknown[]);
    expect([r.total, r.separatePrice.separate, r.bigOrder]).toEqual([total, separate, null]);
  });
});

describe('3. cadeiras do mesmo serviço em duas linhas são uma ("Sim, como 6")', () => {
  it('4 + 2 = 6', () => {
    for (const t of ['clean', 'clean+premium', 'clean+essencial']) {
      const a = q([C(4, t), C(2, t)]), b = q([C(6, t)]);
      expect([a.total, a.visitGifts, a.separatePrice, a.chairsWas]).toEqual([b.total, null, null, b.chairsWas]);
      // One line per row received, adding up to the set.
      expect(a.lines.length).toBe(2);
      expect(a.lines[0].amount + a.lines[1].amount).toBeCloseTo(b.lines[0].amount, 2);
    }
  });
  it('serviços diferentes: 4 limpeza + 2 Blindado = 139, riscado 169', () => {
    const r = q([C(4), C(2, 'clean+premium')]);
    expect([r.total, r.separatePrice.separate]).toEqual([139, 169]);
  });
});

it('o riscado da opção nunca conta a impermeabilização de uma peça só limpa (3L Blindado + 6 cadeiras dava ~~559~~)', () => {
  expect(q([S('3-lugares', 'clean+premium'), C(6)]).separatePrice.tiers.premium).toEqual({ separate: 399, total: 339, saving: 60 });
});

describe('5 e 6. cadeiras', () => {
  it('1 cadeira Protegido na Figueira fica a 39€ ("Fica assim")', () => {
    expect(q([C(1, 'clean+essencial')], {}, 'Figueira da Foz').total).toBe(39);
  });
  it('duas linhas de cadeiras não são outra peça: Cascais 1 limpeza + 1 Protegido = 59 ("Não, leva os +10€")', () => {
    expect(q([C(1), C(1, 'clean+essencial')], {}, 'Cascais').total).toBe(59);
    expect(q([C(1), C(1)], {}, 'Cascais').total).toBe(60);
  });
});

describe('7. anti-odor em sofá e colchão ("casa e 99 e solteiro e 89", king "109€", sofá +40)', () => {
  it.each([[M('solteiro'), 89], [M('casal'), 99], [M('king'), 109], [S(), 129]])('%o', (item, total) => {
    const r = q([{ ...(item as object), odor: true }]);
    expect(r.total).toBe(total);
    expect(r.pieceOdor.amount).toBeGreaterThan(0);
    expect(r.lines.at(-1).label).toMatch(/^Tratamento anti-odor/);
  });
  it('acaba sempre em 9 e só se soma à limpeza', () => {
    for (const city of ['Lisboa', 'Braga', 'Figueira da Foz', 'Ovar']) for (const size of ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares']) expect(q([S(size, 'clean', { odor: true })], {}, city).total % 10).toBe(9);
    expect(q([S('3-lugares', 'clean+premium', { odor: true })]).ok).toBe(false);
    expect(q([S('3-lugares', 'clean', { odor: true, leather: true })]).ok).toBe(false);
    expect(q([M('casal', 'clean+anti-acaros', { odor: true })]).ok).toBe(false);
  });
});

describe('9. riscado dos packs de cadeiras a partir de 4 ("Sim, em todo o lado")', () => {
  it('4 = 139 (156) e 99 (116); até 3 não há', () => {
    expect([q([C(4, 'clean+premium')]).chairsWas, q([C(4, 'clean+essencial')]).chairsWas, q([C(3, 'clean+premium')]).chairsWas]).toEqual([156, 116, null]);
  });
});

describe('preço cheio só nos pedidos de limpeza; cadeiras são uma peça (medição de 24 Nov)', () => {
  it('com impermeabilização o par fica como estava', () => {
    expect(q([S('2-lugares', 'clean+essencial'), S('2-lugares')]).total).toBe(199);
    expect(q([S('3-lugares', 'premium'), S()]).total).toBe(229);
    expect(q([S(), S()]).total).toBe(179);
    // Sofa + a few chairs is not a pair of sofas.
    expect([q([S(), C(2)]).total, q([S(), C(2, 'clean+essencial')]).total]).toEqual([129, 129]);
  });
  it('o anti-ácaros de umas poucas cadeiras nunca é a oferta', () => {
    const r = q([C(1), S('3-lugares', 'clean', { leather: true }), C(6, 'clean+premium')]);
    expect(r.visitGifts.gifts).toEqual([{ piece: 'sofa', treatment: 'tratamento-pele', normal: 40 }]);
    expect(r.total).toBe(309);
  });
  it('juntar um serviço às cadeiras nunca baixa o total', () => {
    expect([q([C(5, 'premium')]).total, q([C(5, 'premium'), C(1)]).total]).toEqual([139, 139]);
    expect([q([C(6)]).total, q([C(6), C(2, 'essencial')]).total]).toEqual([120, 129]);
  });
});
