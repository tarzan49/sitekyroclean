// O riscado e a linha de cada peça contra o motor (25 Nov 2026: o riscado das cadeiras multiplicava a deslocação por
// cadeira e chegou a estar no ar, 6 cadeiras de imper 234€ riscado em vez de 159€).
import { describe, expect, it } from 'vitest';
import { botQuote } from '@/lib/botQuote';
import { aloneTotal, cityKnown, joinSaving, linePrice, newItem, optionPrice, orderLines, quoteBasket, struckOf, type BasketItem } from './VisitBasket';

const motor = (items: object[]) => botQuote({ city: 'Lisboa', items }) as unknown as { total: number; chairsWas: number | null; separatePrice: { separate: number } | null };
const chairs = (qty: number, pack: BasketItem['pack'], imperOnly = false) => newItem('chairs', { qty, pack, imperOnly });
const T = { none: 'clean', premium: 'clean+premium', essencial: 'clean+essencial' } as const;

describe('cadeiras: linha e riscado são os do motor com a quantidade inteira', () => {
  for (const qty of [1, 2, 4, 6, 8, 10, 12]) for (const pack of ['none', 'essencial', 'premium'] as const) {
    it(`${qty} cadeiras ${T[pack]}`, () => {
      const m = motor([{ kind: 'chairs', qty, treatment: T[pack] }]);
      expect(aloneTotal('Lisboa', chairs(qty, pack))).toBe(m.total);
      expect(struckOf('Lisboa', chairs(qty, pack))).toBe(m.chairsWas ?? m.total);
    });
    if (pack !== 'none') it(`${qty} cadeiras só ${pack}`, () => {
      const m = motor([{ kind: 'chairs', qty, treatment: pack }]);
      expect(aloneTotal('Lisboa', chairs(qty, pack, true))).toBe(m.total);
      expect(struckOf('Lisboa', chairs(qty, pack, true))).toBe(m.total);
    });
  }
  it('referência do dono, Lisboa (1/4/6/12 cadeiras sozinhas)', () => {
    const row = (t: string) => [1, 4, 6, 12].map(qty => motor([{ kind: 'chairs', qty, treatment: t }]).total);
    expect(row('clean')).toEqual([30, 90, 120, 180]);
    expect(row('premium')).toEqual([39, 119, 159, 279]);
    expect(row('clean+premium')).toEqual([49, 139, 199, 359]);
    expect(struckOf('Lisboa', chairs(6, 'premium'))).toBe(234);
  });
});

describe('sofás e colchões com quantidade: linha = motor com a quantidade real; riscado nunca acima de cada uma sozinha', () => {
  const pieces: BasketItem[] = [
    ...['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares'].flatMap(size => (['none', 'essencial', 'premium'] as const).flatMap(pack => [1, 2, 3].map(qty => newItem('sofa', { size, qty, pack })))),
    ...['solteiro', 'casal', 'king'].flatMap(size => (['none', 'premium'] as const).flatMap(pack => [1, 2, 3].map(qty => newItem('mattress', { size, qty, pack })))),
  ];
  for (const it_ of pieces) it(`${it_.qty} × ${it_.kind} ${it_.size} ${it_.pack}`, () => {
    const q = quoteBasket('Lisboa', [it_]);
    expect(aloneTotal('Lisboa', it_)).toBe(q.total);
    const treatment = it_.kind === 'mattress' ? (it_.pack === 'premium' ? 'clean+anti-acaros' : 'clean') : T[it_.pack];
    const m = motor([{ kind: it_.kind, size: it_.size, qty: it_.qty, treatment }]);
    const each = struckOf('Lisboa', { ...it_, qty: 1 })! * it_.qty, struck = struckOf('Lisboa', it_)!;
    // Sem oferta e com separatePrice: é exatamente o do motor.
    if (!q.gifts.length && m.separatePrice) expect(struck).toBe(m.separatePrice.separate);
    // Com oferta: nunca acima de cada uma sozinha, nem acima do que o motor diz.
    if (q.gifts.length) { expect(struck).toBeLessThanOrEqual(each + 0.001); if (m.separatePrice) expect(struck).toBeLessThanOrEqual(m.separatePrice.separate); }
    // Sem oferta, nunca abaixo do preço (um riscado abaixo do preço esconde a poupança). Tolerância de 1€ dos totais em 9.
    if (!q.gifts.length) expect(struck).toBeGreaterThanOrEqual(q.total! - 1);
  });
  it('uma peça só: o riscado do pack é o separatePrice do motor', () => {
    for (const size of ['2-lugares', '3-lugares', '4-lugares', '5-lugares']) for (const pack of ['premium', 'essencial'] as const) {
      const m = motor([{ kind: 'sofa', size, qty: 1, treatment: T[pack] }]);
      expect(struckOf('Lisboa', newItem('sofa', { size, qty: 1, pack }))).toBe(m.separatePrice?.separate ?? m.total);
    }
  });
});

describe('localidade: só com preço fechado do motor se diz "deslocação incluída"', () => {
  for (const c of ['Lisboa', ' lisboa ', 'Carnaxide', 'Vila Nova de Gaia', 'Faro', 'Funchal']) it(`${c} tem preço`, () => expect(cityKnown(c)).toBe(true));
  for (const c of ['', 'L', 'Li', 'Xpto', 'Évora', 'Ponta Delgada']) it(`"${c}" não tem`, () => expect(cityKnown(c)).toBe(false));
});

describe('tapetes: o material escolhido chega ao motor', () => {
  for (const [material, rate] of [['juta ou sisal', 'sisal'], ['sintético ou lã', 'lã']] as const) for (const [w, l] of [[1.2, 1.7], [2, 3], [2.5, 3.5]]) it(`${material} ${w} × ${l}`, () => {
    const m = botQuote({ city: 'Lisboa', items: [{ kind: 'rug', qty: 1, treatment: 'clean', width: w, length: l, material: rate }] }) as unknown as { rugEstimate: { homePrice: number } };
    expect(aloneTotal('Lisboa', newItem('rug', { width: String(w).replace('.', ','), length: String(l).replace('.', ','), rugMaterial: material }))).toBe(m.rugEstimate.homePrice);
  });
  it('juta ou sisal nunca sai ao preço do tapete comum num tapete grande', () => {
    const of = (rugMaterial: string) => aloneTotal('Lisboa', newItem('rug', { width: '2', length: '3', rugMaterial }))!;
    expect(of('juta ou sisal')).toBeGreaterThan(of('sintético ou lã'));
  });
});

describe('total do cesto: o riscado é o do motor, nunca um valor do site', () => {
  const S = (size: string, o: Partial<BasketItem> = {}) => newItem('sofa', { size, pack: 'none', ...o });
  const q = (x: BasketItem) => ({ kind: x.kind, size: x.size, qty: x.qty, treatment: x.leather ? 'clean' : T[x.pack], ...(x.leather ? { leather: true } : {}) });
  for (const [name, g] of Object.entries({ '3L + 2L': [S('3-lugares'), S('2-lugares')], '3L pele + 2L': [S('3-lugares', { leather: true }), S('2-lugares')], '3L Blindado sozinho': [S('3-lugares', { pack: 'premium' })], '3L + 1L': [S('3-lugares'), S('1-lugar')] })) it(name, () => {
    const m = botQuote({ city: 'Lisboa', items: g.map(q) } as never) as unknown as { total: number; separatePrice: { separate: number } | null; visitGifts: { usual: number } | null };
    const want = m.visitGifts?.usual ?? m.separatePrice?.separate ?? null;
    expect(quoteBasket('Lisboa', g).usual).toBe(want !== null && want - m.total >= 5 ? want : null);
  });
  it('sofá limpo sozinho não tem riscado', () => expect(quoteBasket('Lisboa', [S('3-lugares')]).usual).toBeNull());
});

describe('janela da peça: o preço e o "Poupa" são os que o total mostra', () => {
  const S = (size: string, o: Partial<BasketItem> = {}) => newItem('sofa', { size, pack: 'none', ...o });
  const M = (o: Partial<BasketItem> = {}) => newItem('mattress', { size: 'casal', pack: 'none', ...o });
  const R = (rugMaterial: string) => newItem('rug', { width: '2', length: '3', rugMaterial });
  const A = () => newItem('carpet', { width: '4', length: '5' });
  const others: Record<string, BasketItem[]> = { 'vazio': [], 'colchão': [M()], 'sofá 1L': [S('1-lugar')], 'sofá 3L': [S('3-lugares')], '6 cadeiras': [chairs(6, 'none')], '3L Blindado': [S('3-lugares', { pack: 'premium' })], 'tapete': [R('sintético ou lã')], 'alcatifa': [A()], 'colchão + 6 cadeiras': [M(), chairs(6, 'none')], 'sofá 3L + 2L': [S('3-lugares'), S('2-lugares')], 'sofá 3L + tapete': [S('3-lugares'), R('juta ou sisal')] };
  const groups: Record<string, BasketItem[]> = { 'tapete juta': [R('juta ou sisal')], 'alcatifa': [A()], '2L + 3L': [S('2-lugares'), S('3-lugares')], '2×2L + 3L Blindado': [S('2-lugares', { qty: 2, pack: 'premium' }), S('3-lugares', { pack: 'premium' })], 'casal + solteiro': [M(), M({ size: 'solteiro' })] };
  for (const qty of [1, 2, 3]) for (const size of ['1-lugar', '2-lugares', '3-lugares', '5-lugares']) for (const pack of ['none', 'essencial', 'premium'] as const) groups[`${qty}× ${size} ${pack}`] = [S(size, { qty, pack })];
  for (const qty of [1, 2]) { groups[`${qty}× 3L pele`] = [S('3-lugares', { qty, leather: true })]; groups[`${qty}× 3L só imper`] = [S('3-lugares', { qty, pack: 'premium', imperOnly: true })]; for (const size of ['solteiro', 'casal', 'king']) for (const pack of ['none', 'premium'] as const) groups[`${qty}× ${size} ${pack}`] = [M({ size, qty, pack })]; }
  for (const q of [1, 2, 6, 7, 12, 25]) for (const pack of ['none', 'essencial', 'premium'] as const) groups[`${q} cadeiras ${pack}`] = [chairs(q, pack)];
  for (const city of ['Lisboa', 'Porto']) for (const [on, o] of Object.entries(others)) it(`${city}: ${on} + ${Object.keys(groups).length} grupos`, () => {
    const before = o.length ? quoteBasket(city, o).total! : 0;
    for (const [gn, g] of Object.entries(groups)) {
      const { shown, struck } = optionPrice(city, o, g), rise = quoteBasket(city, [...o, ...g]).total! - before;
      const where = `${city}: ${on} + ${gn}`;
      expect(shown, where).not.toBeNull();
      expect(Math.abs(shown! - Math.max(0, rise)), `${where}: mostra ${shown}, o total sobe ${rise}`).toBeLessThanOrEqual(1);
      const sep = g.reduce((t, x) => t + struckOf(city, x)!, 0);
      if (struck !== null) expect(struck - shown!, `${where}: poupa`).toBeLessThanOrEqual(sep - rise + 1);
    }
  }, 60_000);
});

describe('"Se juntar X, poupa Y": nunca mais do que o total mostra, para qualquer tamanho', () => {
  const S = (size: string, o: Partial<BasketItem> = {}) => newItem('sofa', { size, pack: 'none', ...o });
  const M = (o: Partial<BasketItem> = {}) => newItem('mattress', { size: 'casal', pack: 'none', ...o });
  const saving = (b: BasketItem[]) => { const q = quoteBasket('Lisboa', b); return q.usual !== null && q.total !== null ? q.usual - q.total : 0; };
  const baskets: Record<string, BasketItem[]> = { '6 cadeiras Blindado': [chairs(6, 'premium')], '1L Blindado': [S('1-lugar', { pack: 'premium' })], '4L + colchão': [S('4-lugares'), M()], 'colchão': [M()], 'colchão AA': [M({ pack: 'premium' })], '3L': [S('3-lugares')], '3L Blindado': [S('3-lugares', { pack: 'premium' })], '3L pele': [S('3-lugares', { leather: true })], '6 cadeiras': [chairs(6, 'none')], '3L + 2L': [S('3-lugares'), S('2-lugares')], '3L + colchão': [S('3-lugares'), M()], 'tapete': [newItem('rug', { width: '2', length: '3', rugMaterial: 'sintético ou lã' })] };
  const joins: [Parameters<typeof joinSaving>[2], BasketItem][] = [
    ...['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares'].map(z => ['sofa', S(z)] as [Parameters<typeof joinSaving>[2], BasketItem]),
    ...['solteiro', 'casal', 'king'].map(size => ['mattress', M({ size })] as [Parameters<typeof joinSaving>[2], BasketItem]),
    ...[1, 2, 3, 4, 6, 8, 12].map(n => ['chairs', chairs(n, 'none')] as [Parameters<typeof joinSaving>[2], BasketItem]),
    ...['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares'].flatMap(size => [newItem('sofa', { size, pack: 'premium' }), newItem('sofa', { size, pack: 'essencial' }), newItem('sofa', { size, pack: 'none', leather: true })]).map(x => ['sofa', x] as [Parameters<typeof joinSaving>[2], BasketItem]),
    ...[newItem('sofa', { size: '5-lugares', seats: 6, pack: 'none' }), newItem('sofa', { size: '5-lugares', seats: 6, pack: 'premium' }), newItem('mattress', { size: 'casal', pack: 'premium' }), chairs(1, 'premium'), chairs(6, 'premium'), chairs(9, 'essencial'), newItem('carpet', { width: '5', length: '6' }), newItem('carpet', { width: '9', length: '9' })].map(x => [x.kind, x] as [Parameters<typeof joinSaving>[2], BasketItem]),
    ...[['1,2', '1,7'], ['1,6', '2,3'], ['2,5', '3,5'], ['3', '4'], ['3', '5']].map(([width, length]) => ['rug', newItem('rug', { width, length, rugMaterial: 'juta ou sisal' })] as [Parameters<typeof joinSaving>[2], BasketItem]),
  ];
  for (const [bn, b] of Object.entries(baskets)) it(bn, () => {
    for (const [kind, x] of joins) {
      const said = joinSaving('Lisboa', b, kind);
      if (said <= 0) continue;
      const q0 = quoteBasket('Lisboa', b), q1 = quoteBasket('Lisboa', [...b, x]), g = (q: typeof q0) => q.gifts.reduce((t, y) => t + y.normal, 0);
      expect(q0.total! + aloneTotal('Lisboa', x)! - q1.total! + g(q1) - g(q0), `${bn} + ${kind}: diz ${said}, real`).toBeGreaterThanOrEqual(said - 1);
      expect(saving([...b, x]) - saving(b), `${bn} + ${kind} ${x.size ?? x.qty}: diz ${said}`).toBeGreaterThanOrEqual(said - 1);
    }
  });
});

describe('linhas do cesto: nunca somam menos do que o total (9€ dos totais em 9)', () => {
  const S = (size: string, o: Partial<BasketItem> = {}) => newItem('sofa', { size, pack: 'none', ...o });
  const M = (o: Partial<BasketItem> = {}) => newItem('mattress', { size: 'casal', pack: 'none', ...o });
  const pool: BasketItem[] = [S('1-lugar'), S('1-lugar', { qty: 2 }), S('2-lugares', { qty: 2 }), S('3-lugares'), S('3-lugares', { qty: 2 }), S('3-lugares', { qty: 3 }), S('5-lugares', { qty: 2 }), S('3-lugares', { pack: 'premium', qty: 2 }), S('3-lugares', { pack: 'essencial' }), S('3-lugares', { leather: true, qty: 2 }), S('3-lugares', { pack: 'premium', imperOnly: true }), M(), M({ qty: 3 }), M({ pack: 'premium', qty: 2 }), chairs(1, 'none'), chairs(6, 'none'), chairs(12, 'premium'), newItem('rug', { width: '2', length: '3', rugMaterial: 'juta ou sisal' }), newItem('carpet', { width: '4', length: '5' })];
  for (const city of ['Lisboa', 'Porto']) it(city, () => {
    for (const a of pool) for (const b of [null, ...pool]) {
      const g = b ? [a, { ...b, id: `${b.id}x` }] : [a], q = quoteBasket(city, g);
      const sum = g.reduce((t, x) => t + linePrice(city, x)!, 0);
      expect(sum, `${g.map(x => `${x.qty}× ${x.kind} ${x.size ?? ''} ${x.pack}`).join(' + ')}: linhas ${sum}, total ${q.total}`).toBeGreaterThanOrEqual(q.total! - 9);
    }
  }, 60_000);
});

describe('linhas do pedido guardado', () => {
  it('são as do cesto e nunca somam menos do que o total (um sofá e um colchão gravavam 79€ + 69€ = 169€)', () => {
    for (const list of [[newItem('sofa', { pack: 'none' }), newItem('mattress')], [newItem('sofa'), newItem('mattress'), newItem('chairs')], [newItem('sofa', { leather: true, pack: 'premium' })]]) {
      const sum = orderLines('Lisboa', list).reduce((t, l) => t + l.total!, 0);
      expect(sum, JSON.stringify(list)).toBeGreaterThanOrEqual(quoteBasket('Lisboa', list).total! - 9);
      expect(orderLines('Lisboa', list).map(l => l.total)).toEqual(list.map(i => linePrice('Lisboa', i)));
    }
    expect(orderLines('Lisboa', [newItem('sofa', { pack: 'none' }), newItem('mattress')]).map(l => l.total)).toEqual([89, 79]);
  });
});
