import { describe, it, expect } from 'vitest';
import {
  calcChairClean, calcChairWaterproof, calcChairWaterproofPremium,
  calcPackPricing, carpetItemArea, carpetHasValidItems,
} from './quizHelpers';
import { sofaPrices, mattressPrices } from './QuizTypes';

// Estas funções já causaram bugs reais nesta sessão (limiares desalinhados
// entre calcChairClean/Waterproof/WaterproofPremium, "Sob orçamento" a cair
// em silêncio para 0€) — os testes fixam os limiares exatos dos comentários
// no código-fonte, para uma alteração futura a um dos três não desalinhar
// silenciosamente os outros dois.
describe('calcChairClean (1-4 @ 20€ · 5-6 @ 15€ · 7-9 @ 12.5€ · 10+ sob orçamento)', () => {
  it('is null for 0 or negative', () => {
    expect(calcChairClean(0)).toBeNull();
    expect(calcChairClean(-1)).toBeNull();
  });
  it('is null at the 10+ boundary (not only >10)', () => {
    expect(calcChairClean(10)).toBeNull();
    expect(calcChairClean(11)).toBeNull();
  });
  it('charges the last chair at 9', () => {
    expect(calcChairClean(9)).toBeCloseTo(4 * 20 + 2 * 15 + 3 * 12.5); // 152.5
  });
  it.each([
    [1, 20], [4, 80], [5, 95], [6, 110], [7, 122.5],
  ])('qty=%i -> %i€', (qty, expected) => {
    expect(calcChairClean(qty)).toBeCloseTo(expected);
  });
});

describe('calcChairWaterproof (1-4 @ 15€ · 5-9 @ 10€ · 10+ sob orçamento)', () => {
  it('is null at the 10+ boundary', () => {
    expect(calcChairWaterproof(10)).toBeNull();
  });
  it.each([
    [1, 15], [4, 70], [5, 70], [9, 110],
  ])('qty=%i -> %i€', (qty, expected) => {
    expect(calcChairWaterproof(qty)).toBeCloseTo(expected);
  });
});

describe('calcChairWaterproofPremium (1-4 @ 20€ · 5-9 @ 15€ · 10+ sob orçamento, sempre acima da Essencial)', () => {
  it('is null at the 10+ boundary', () => {
    expect(calcChairWaterproofPremium(10)).toBeNull();
  });
  it.each([
    [1, 20], [4, 90], [5, 95], [9, 155],
  ])('qty=%i -> %i€', (qty, expected) => {
    expect(calcChairWaterproofPremium(qty)).toBeCloseTo(expected);
  });
  it('is always more expensive than Essencial for the same qty (1..9)', () => {
    for (let qty = 1; qty <= 9; qty++) {
      expect(calcChairWaterproofPremium(qty)!).toBeGreaterThan(calcChairWaterproof(qty)!);
    }
  });
});

describe('calcPackPricing', () => {
  const sofa1L = sofaPrices.find(p => p.id === '1-lugar')!;
  const sofa4Plus = sofaPrices.find(p => p.id === '4+-lugares')!;

  it('reports isSob for the "Sob orçamento" size (4+ lugares) instead of silently pricing at 0', () => {
    const r = calcPackPricing(sofa4Plus, false, false, 40, 'essencial');
    expect(r.isSob).toBe(true);
    expect(r.basePrice).toBeNull();
  });

  it('essencial cleaning-only price matches the fixed table', () => {
    const r = calcPackPricing(sofa1L, false, false, 40, 'essencial');
    expect(r.basePrice).toBe(49);
    expect(r.displayPrice).toBe(49);
  });

  it('pack (packOn) price uses bothPrice, not basePrice + fallbackDelta, when bothPrice exists', () => {
    const r = calcPackPricing(sofa1L, true, false, 40, 'essencial');
    expect(r.packPrice).toBe(99); // bothPrice fixo da tabela, não 49+40
    expect(r.displayPrice).toBe(99);
  });

  it('premium tier price is strictly higher than essencial for the same option', () => {
    const essencial = calcPackPricing(sofa1L, false, true, 40, 'essencial');
    const premium = calcPackPricing(sofa1L, false, true, 40, 'premium');
    expect(premium.basePrice).not.toBeNull();
    expect(premium.basePrice!).toBeGreaterThan(essencial.basePrice!);
  });
});

describe('carpetItemArea / carpetHasValidItems', () => {
  it('accepts comma as decimal separator (PT locale)', () => {
    expect(carpetItemArea({ id: 't1', largura: '2,5', comprimento: '1,5' })).toBeCloseTo(3.75);
  });
  it('rejects zero, negative or non-numeric dimensions', () => {
    expect(carpetItemArea({ id: 't1', largura: '0', comprimento: '2' })).toBeNull();
    expect(carpetItemArea({ id: 't1', largura: '-1', comprimento: '2' })).toBeNull();
    expect(carpetItemArea({ id: 't1', largura: '', comprimento: '2' })).toBeNull();
  });
  it('carpetHasValidItems is true if at least one item measures, even with blanks around it', () => {
    expect(carpetHasValidItems([
      { id: 't1', largura: '', comprimento: '' },
      { id: 't2', largura: '2', comprimento: '3' },
    ])).toBe(true);
    expect(carpetHasValidItems([{ id: 't1', largura: '', comprimento: '' }])).toBe(false);
  });
});
