// O riscado e a linha de cada peça contra o motor (25 Nov 2026: o riscado das cadeiras multiplicava a deslocação por
// cadeira e chegou a estar no ar, 6 cadeiras de imper 234€ riscado em vez de 159€).
import { describe, expect, it } from 'vitest';
import { botQuote } from '@/lib/botQuote';
import { aloneTotal, cityKnown, newItem, optionPrice, quoteBasket, struckOf, type BasketItem } from './VisitBasket';

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
