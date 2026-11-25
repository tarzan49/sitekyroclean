// O riscado e a linha de cada peça contra o motor (25 Nov 2026: o riscado das cadeiras multiplicava a deslocação por
// cadeira e chegou a estar no ar, 6 cadeiras de imper 234€ riscado em vez de 159€).
import { describe, expect, it } from 'vitest';
import { botQuote } from '@/lib/botQuote';
import { aloneTotal, basketLines, cityKnown, joinSaving, mergeChairs, newItem, optionPrice, orderLines, quoteBasket, servicePrice, splitOf, struckOf, type BasketItem } from './VisitBasket';

const motor = (items: object[]) => botQuote({ city: 'Lisboa', items }) as unknown as { total: number; chairsWas: number | null; separatePrice: { separate: number } | null };
const chairs = (qty: number, pack: BasketItem['pack'], imperOnly = false) => newItem('chairs', { qty, pack, imperOnly });
const T = { none: 'clean', premium: 'clean+premium', essencial: 'clean+essencial' } as const;

// Desde 25 Nov 2026 (dono): o preço mostrado é o do serviço e o riscado está na mesma base, sem deslocações; o total do motor não muda.
describe('cadeiras: linha do motor com a quantidade inteira; riscado na base do serviço', () => {
  for (const qty of [1, 2, 4, 6, 8, 10, 12]) for (const pack of ['none', 'essencial', 'premium'] as const) {
    it(`${qty} cadeiras ${T[pack]}`, () => {
      const m = motor([{ kind: 'chairs', qty, treatment: T[pack] }]);
      expect(aloneTotal('Lisboa', chairs(qty, pack))).toBe(m.total);
      const svc = servicePrice('Lisboa', [chairs(qty, pack)]), struck = struckOf('Lisboa', chairs(qty, pack))!;
      expect(svc.shown! + svc.travel!).toBe(m.total);
      if (m.chairsWas === null) expect(svc.struck).toBeNull(); else expect(struck).toBeLessThanOrEqual(m.chairsWas);
      expect(struck).toBeGreaterThanOrEqual(svc.shown!);
    });
    if (pack !== 'none') it(`${qty} cadeiras só ${pack}`, () => {
      const m = motor([{ kind: 'chairs', qty, treatment: pack }]);
      expect(aloneTotal('Lisboa', chairs(qty, pack, true))).toBe(m.total);
      expect(struckOf('Lisboa', chairs(qty, pack, true))).toBe(splitOf('Lisboa', [chairs(qty, pack, true)])!.service);
    });
  }
  it('referência do dono, Lisboa (1/4/6/12 cadeiras sozinhas)', () => {
    const row = (t: string) => [1, 4, 6, 12].map(qty => motor([{ kind: 'chairs', qty, treatment: t }]).total);
    expect(row('clean')).toEqual([30, 90, 120, 180]);
    expect(row('premium')).toEqual([39, 119, 159, 279]);
    expect(row('clean+premium')).toEqual([59, 179, 259, 449]);
    // Limpeza 110€ + impermeabilização 149€ = 259€, o preço do pack: sem deslocações não há riscado.
    expect(servicePrice('Lisboa', [chairs(6, 'premium')])).toMatchObject({ shown: 259, struck: null, travel: 0 });
    expect(servicePrice('Lisboa', [chairs(12, 'premium')])).toMatchObject({ shown: 449, struck: 459, travel: 0 });
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
    const each = struckOf('Lisboa', { ...it_, qty: 1 })! * it_.qty, struck = struckOf('Lisboa', it_)!, sp = servicePrice('Lisboa', [it_]);
    expect(sp.shown! + sp.travel!).toBe(m.total);
    expect(struck).toBe(each);
    // O riscado mostrado nunca passa do que o motor diz (que conta deslocações) e nunca fica abaixo do preço.
    if (sp.struck !== null) { const was = Math.max(q.usual ?? 0, m.separatePrice?.separate ?? 0); expect(sp.struck).toBeLessThanOrEqual(was); expect(sp.struck - sp.shown!).toBeGreaterThanOrEqual(5); expect(sp.struck - sp.shown!).toBeLessThanOrEqual(was - m.total); }
  });
  it('uma peça só: o riscado do pack é a limpeza mais a impermeabilização em separado, sem deslocações, ao 9', () => {
    for (const size of ['2-lugares', '3-lugares', '4-lugares', '5-lugares']) for (const pack of ['premium', 'essencial'] as const) {
      const of = (treatment: string) => { const r = motor([{ kind: 'sofa', size, qty: 1, treatment }]) as unknown as { total: number; travel: number }; return r.total - r.travel; };
      const sum = of('clean') + of(pack), up = Math.ceil((sum + 1) / 10) * 10 - 1;
      expect(struckOf('Lisboa', newItem('sofa', { size, qty: 1, pack }))).toBe(Math.max(up, of(T[pack])));
    }
  });
});

describe('localidade: só com preço fechado do motor se dá o total', () => {
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
      const { shown, struck } = optionPrice(city, o, g), rise = o.length ? quoteBasket(city, [...o, ...g]).total! - before : splitOf(city, g)!.service;
      const where = `${city}: ${on} + ${gn}`;
      expect(shown, where).not.toBeNull();
      expect(Math.abs(shown! - Math.max(0, rise)), `${where}: mostra ${shown}, o total sobe ${rise}`).toBeLessThanOrEqual(1);
      const sep = g.reduce((t, x) => t + struckOf(city, x)!, 0);
      if (struck !== null) expect(struck - shown!, `${where}: poupa`).toBeLessThanOrEqual(sep + (o.length ? 0 : quoteBasket(city, g).gifts.reduce((t, y) => t + y.normal, 0) + 9) - rise + 1);
    }
  }, 60_000);
});

describe('"Se juntar X, poupa Y": nunca mais do que o total mostra, para qualquer tamanho', () => {
  const S = (size: string, o: Partial<BasketItem> = {}) => newItem('sofa', { size, pack: 'none', ...o });
  const M = (o: Partial<BasketItem> = {}) => newItem('mattress', { size: 'casal', pack: 'none', ...o });
  const saving = (b: BasketItem[]) => { const q = splitOf('Lisboa', b)!; return q.struck !== null ? q.struck - q.service : 0; };
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
      const svc = (l: BasketItem[]) => splitOf('Lisboa', l)!.service;
      expect(svc(b) + svc([x]) - svc([...b, x]) + g(q1) - g(q0), `${bn} + ${kind}: diz ${said}, real`).toBeGreaterThanOrEqual(said - 1);
      expect(saving([...b, x]) - saving(b), `${bn} + ${kind} ${x.size ?? x.qty}: diz ${said}`).toBeGreaterThanOrEqual(said - 1);
    }
  });
});

describe('linhas do cesto: somam o serviço, e serviço + deslocação é o total do motor', () => {
  const S = (size: string, o: Partial<BasketItem> = {}) => newItem('sofa', { size, pack: 'none', ...o });
  const M = (o: Partial<BasketItem> = {}) => newItem('mattress', { size: 'casal', pack: 'none', ...o });
  const pool: BasketItem[] = [S('1-lugar'), S('1-lugar', { qty: 2 }), S('2-lugares', { qty: 2 }), S('3-lugares'), S('3-lugares', { qty: 2 }), S('3-lugares', { qty: 3 }), S('5-lugares', { qty: 2 }), S('3-lugares', { pack: 'premium', qty: 2 }), S('3-lugares', { pack: 'essencial' }), S('3-lugares', { leather: true, qty: 2 }), S('3-lugares', { pack: 'premium', imperOnly: true }), M(), M({ qty: 3 }), M({ pack: 'premium', qty: 2 }), chairs(1, 'none'), chairs(6, 'none'), chairs(12, 'premium'), newItem('rug', { width: '2', length: '3', rugMaterial: 'juta ou sisal' }), newItem('carpet', { width: '4', length: '5' })];
  for (const city of ['Lisboa', 'Porto', 'Cascais', 'Guimarães', 'Arouca', 'Vila do Bispo']) it(city, () => {
    for (const a of pool) for (const b of [null, ...pool]) {
      const g = b ? [a, { ...b, id: `${b.id}x` }] : [a], q = quoteBasket(city, g), split = splitOf(city, g)!, lines = basketLines(city, g);
      const where = `${g.map(x => `${x.qty}× ${x.kind} ${x.size ?? ''} ${x.pack}`).join(' + ')}: linhas ${lines}, total ${q.total}`;
      expect(split.total, where).toBe(q.total);
      expect(split.service + split.travel, where).toBeCloseTo(q.total!, 2);
      expect(split.travel, where).toBeGreaterThanOrEqual(0);
      expect(lines.reduce<number>((t, v) => t + v!, 0), where).toBeCloseTo(split.service, 2);
      for (const v of lines) expect(v!, where).toBeGreaterThan(0);
      if (split.struck !== null) { expect(split.struck, where).toBeGreaterThan(split.service); expect(split.struck - split.service, where).toBeLessThanOrEqual(q.usual !== null ? q.usual - q.total! : split.service); }
      // "Deslocação grátis" só quando as peças não a trazem dentro do preço.
      if (split.travel === 0 && !split.included) { const alone = g.reduce((t, x) => t + (splitOf(city, [{ ...x, qty: x.kind === 'chairs' ? x.qty : 1 }])!.service * (x.kind === 'chairs' ? 1 : x.qty)), 0); expect(split.service, where).toBeLessThanOrEqual(alone + 9); }
    }
  }, 60_000);
});

describe('linhas do pedido guardado', () => {
  it('são as do cesto, com a deslocação quando se paga, e somam o total (um sofá e um colchão gravavam 79€ + 69€ = 169€)', () => {
    for (const list of [[newItem('sofa', { pack: 'none' }), newItem('mattress')], [newItem('sofa'), newItem('mattress'), newItem('chairs')], [newItem('sofa', { leather: true, pack: 'premium' })]]) {
      const sum = orderLines('Lisboa', list).reduce((t, l) => t + l.total!, 0);
      expect(sum, JSON.stringify(list)).toBeCloseTo(quoteBasket('Lisboa', list).total!, 2);
    }
    expect(orderLines('Lisboa', [newItem('sofa', { pack: 'none' }), newItem('mattress')]).map(l => l.total)).toEqual([89, 80]);
    expect(orderLines('Lisboa', [newItem('sofa', { pack: 'none' })]).map(l => [l.label.startsWith('Deslocação'), l.total])).toEqual([[false, 79], [true, 10]]);
  });
});

describe('cadeiras do mesmo serviço são uma só linha', () => {
  it('1 + 2 de limpeza = 3; Blindado e só impermeabilização ficam à parte', () => {
    const m = mergeChairs([chairs(1, 'none'), newItem('sofa'), chairs(2, 'none'), chairs(6, 'premium'), chairs(6, 'premium', true)]);
    expect(m.map(i => `${i.kind}${i.qty}${i.pack}${i.imperOnly ? '!' : ''}`)).toEqual(['chairs3none', 'sofa1premium', 'chairs6premium', 'chairs6premium!']);
    expect(basketLines('Lisboa', [m[0]])[0]).toBe(splitOf('Lisboa', [m[0]])!.service);
  });
});
