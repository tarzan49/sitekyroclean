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
    ['10 cadeiras Blindado', [C(10, 'clean+premium')], 309, 399],
    ['12 cadeiras Blindado', [C(12, 'clean+premium')], 359, 459],
    ['30 cadeiras, só limpeza ("Não, sem riscado")', [C(30)], 360, null],
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
  it('serviços diferentes: 4 limpeza + 2 Blindado = 149, riscado 179', () => {
    const r = q([C(4), C(2, 'clean+premium')]);
    expect([r.total, r.separatePrice.separate]).toEqual([149, 179]);
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
  it.each([[M('solteiro'), 89], [M('casal'), 99], [M('king'), 109]])('%o', (item, total) => {
    const r = q([{ ...(item as object), odor: true }]);
    expect(r.total).toBe(total);
    expect(r.pieceOdor.amount).toBeGreaterThan(0);
    expect(r.lines.at(-1).label).toMatch(/^Tratamento anti-odor/);
  });
  it('nunca sozinho, com anti-ácaros na mesma peça, nem em pele', () => {
    expect(q([S('3-lugares', 'premium', { odor: true })]).ok).toBe(false);
    expect(q([S('3-lugares', 'clean', { odor: true, leather: true })]).ok).toBe(false);
    expect(q([M('casal', 'clean+anti-acaros', { odor: true })]).ok).toBe(false);
    expect(q([S('3-lugares', 'clean+premium', { odor: true, mites: true })]).ok).toBe(false);
    expect(q([S('3-lugares', 'clean', { mites: true })]).ok).toBe(false);
  });
});

describe('sofá com anti-odor ou anti-ácaros (dono, 25 Nov 2026: "LIMPEZA + IMPER COM ANTI ODOR OFERECES O ANTI ODOR, ANTI ACAROS IGUAL [...] OFERECES A DESLOCACAO ATÉ 10 EUR")', () => {
  it.each([['Lisboa', '3-lugares', 119], ['Lisboa', '2-lugares', 109], ['Lisboa', '5-lugares', 149], ['Aveiro', '3-lugares', 129], ['Fátima', '3-lugares', 129]])('só limpeza com anti-odor, %s %s: %i, com a deslocação incluída', (city, size, total) => {
    const r = q([S(size as string, 'clean', { odor: true })], {}, city as string);
    expect([r.total, r.sofaTravelOffer.amount]).toEqual([total, 10]);
  });
  it('3L com anti-ácaros = com anti-odor (119), e acaba sempre em 9', () => {
    expect([q([S('3-lugares', 'clean+anti-acaros')]).total, q([S('2-lugares', 'clean+anti-acaros')]).total, q([S('1-lugar', 'clean+anti-acaros')]).total]).toEqual([119, 109, 69]);
    for (const city of ['Lisboa', 'Braga', 'Figueira da Foz', 'Ovar']) for (const size of ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares']) expect(q([S(size, 'clean', { odor: true })], {}, city).total % 10).toBe(9);
  });
  it('limpeza + impermeabilização: o tratamento vai oferecido, o total é o do pack, o riscado leva o valor normal', () => {
    for (const size of ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares', 'canto']) for (const t of ['clean+premium', 'clean+essencial']) for (const x of [{ odor: true }, { mites: true }]) expect(q([S(size, t, x)]).total).toBe(q([S(size, t)]).total);
    const r = q([S('3-lugares', 'clean+premium', { odor: true })]);
    expect([r.total, r.separatePrice.separate, r.waterproofingTiers.essencial, r.separatePrice.tiers.essencial.separate]).toEqual([219, 289, 159, 229]);
    expect(r.lines.at(-1)).toMatchObject({ label: 'Tratamento anti-odor sofá, oferecido, normalmente 40€', amount: 0 });
    expect(q([S('3-lugares', 'clean+premium', { mites: true })]).sofaOffer.offers).toEqual([{ treatment: 'anti-acaros', normal: 50 }]);
    expect(q([S('5-lugares', 'clean+premium', { mites: true })]).sofaOffer.offers).toEqual([{ treatment: 'anti-acaros', normal: null }]);
  });
  it('várias peças: o total não baixa, o riscado é o verdadeiro', () => {
    const r = q([S('3-lugares', 'clean+anti-acaros'), M()]);
    expect([r.total, r.separatePrice.separate, r.visitGifts.usual]).toEqual([209, 239, 239]);
    const c = q([S('3-lugares', 'clean+anti-acaros'), C(2)]);
    expect([c.total, c.visitGifts.usual]).toEqual([179, 179]);
  });
  it('Black Friday: o anti-odor não entra na tabela (saía a 69€ com o tratamento dentro)', () => {
    const r = q([S('3-lugares', 'clean', { odor: true })], { campaign: 'BFGTA' });
    expect([r.blackFriday, r.total]).toEqual([null, 119]);
    expect(q([M('casal', 'clean', { odor: true })], { campaign: 'BFGTA' }).blackFriday).toBeNull();
  });
});

describe('9. riscado dos packs de cadeiras a partir de 4 ("Sim, em todo o lado")', () => {
  it('4 Premium = 149 (196); a Essencial de 4 já está abaixo; até 3 não há', () => {
    expect([q([C(4, 'clean+premium')]).chairsWas, q([C(4, 'clean+essencial')]).chairsWas, q([C(3, 'clean+premium')]).chairsWas]).toEqual([196, null, null]);
  });
});

describe('preço cheio só nos pedidos de limpeza; cadeiras são uma peça (medição de 24 Nov)', () => {
  it('com impermeabilização o par fica como estava', () => {
    expect(q([S('2-lugares', 'clean+essencial'), S('2-lugares')]).total).toBe(199);
    expect(q([S('3-lugares', 'premium'), S()]).total).toBe(229);
    expect(q([S(), S()]).total).toBe(179);
    // Sofa + a few chairs is not a pair of sofas.
    expect([q([S(), C(2)]).total, q([S(), C(2, 'clean+essencial')]).total]).toEqual([129, 139]);
  });
  it('o anti-ácaros de umas poucas cadeiras nunca é a oferta', () => {
    const r = q([C(1), S('3-lugares', 'clean', { leather: true }), C(6, 'clean+premium')]);
    expect(r.visitGifts.gifts).toEqual([{ piece: 'sofa', treatment: 'tratamento-pele', normal: 40 }]);
    expect(r.total).toBe(319);
  });
  it('juntar um serviço às cadeiras nunca baixa o total', () => {
    expect([q([C(5, 'premium')]).total, q([C(5, 'premium'), C(1)]).total]).toEqual([139, 149]);
    expect([q([C(6)]).total, q([C(6), C(2, 'essencial')]).total]).toEqual([120, 129]);
  });
});

describe('4. tapetes ao preço cheio, com o anti-odor oferecido sempre (dono, 25 Nov 2026: "A" e "Sempre")', () => {
  const R = (x: object = {}) => ({ kind: 'rug', width: 2, length: 3, ...x }), K = { kind: 'carpet', width: 4, length: 5 };
  const paid = (r: Q) => r.rugCombo?.comboPrice ?? (r.quote ? r.rugEstimate?.homePrice : r.total);
  it.each([
    ['um tapete só', [R()], 69, null],
    ['2 tapetes', [R(), R()], 139, 169],
    ['2 tapetes em qty', [R({ qty: 2 })], 139, 169],
    ['3 tapetes', [R(), R(), R()], 209, 239],
    ['tapete + alcatifa 20 m²', [R(), K], 239, 269],
    ['sofá 3L + tapete', [S(), R()], 159, 189],
  ])('%s', (_n, items, total, usual) => {
    const r = q(items as unknown[]);
    expect([paid(r), r.visitGifts?.usual ?? null]).toEqual([total, usual]);
    if (usual) expect(r.visitGifts.gifts).toEqual([{ piece: 'rug', treatment: 'anti-odor', normal: 30 }]);
  });
  it('alcatifas sozinhas ficam pela área total (20 + 20 m² = 40 m²)', () => {
    expect(paid(q([K, K]))).toBe(paid(q([{ kind: 'carpet', width: 4, length: 10 }])));
  });
  it('tapete pequeno: preço cheio com o anti-odor oferecido, nunca um "preço normal" abaixo do total', () => {
    const r = q([S(), { kind: 'rug', width: 1.2, length: 1.8 }]);
    expect([r.rugCombo.comboPrice, r.rugCombo.usualPrice, r.visitGifts.usual]).toEqual([119, 119, 129]);
  });
  it('a ordem não muda o preço e pedir o anti-odor nunca baixa', () => {
    expect(paid(q([R(), S()]))).toBe(159);
    expect(paid(q([S(), R({ odor: true })]))).toBeGreaterThanOrEqual(159);
    expect(paid(q([R({ odor: true }), R()]))).toBeGreaterThanOrEqual(139);
  });
});
