// O riscado e a linha de cada peça contra o motor (25 Nov 2026: o riscado das cadeiras multiplicava a deslocação por
// cadeira e chegou a estar no ar, 6 cadeiras de imper 234€ riscado em vez de 159€).
import { describe, expect, it } from 'vitest';
import { botQuote } from '@/lib/botQuote';
import { aloneTotal, newItem, quoteBasket, struckOf, type BasketItem } from './VisitBasket';

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
    const one = { ...it_, qty: 1 }, oneStruck = struckOf('Lisboa', one)!;
    expect(struckOf('Lisboa', it_)!).toBeLessThanOrEqual(oneStruck * it_.qty + 0.001);
  });
  it('uma peça só: o riscado do pack é o separatePrice do motor', () => {
    for (const size of ['2-lugares', '3-lugares', '4-lugares', '5-lugares']) for (const pack of ['premium', 'essencial'] as const) {
      const m = motor([{ kind: 'sofa', size, qty: 1, treatment: T[pack] }]);
      expect(struckOf('Lisboa', newItem('sofa', { size, qty: 1, pack }))).toBe(m.separatePrice?.separate ?? m.total);
    }
  });
});
