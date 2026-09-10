import { describe, it, expect } from 'vitest';
import { calculateCustomPack, makePackItem, customPackLine, packItemValid } from './customPack';
import { sofaPrices } from '../components/quiz/QuizTypes';
import { calcPackPricing } from '../components/quiz/quizHelpers';
describe('custom pack commercial rules', () => {
  it('uses current quote prices for both waterproofing tiers and sofa sizes', () => {
    for (const option of sofaPrices) for (const tier of ['premium', 'essencial'] as const) {
      const item = { ...makePackItem('sofa', 's'), size: option.id, extra: tier };
      expect(customPackLine(item).amount).toBe(calcPackPricing(option, true, false, null, tier).packPrice);
    }
  });
  it('never prices a rug by area and requires both valid dimensions', () => {
    const rug = makePackItem('rug', 'r');
    expect(packItemValid(rug)).toBe(false);
    expect(packItemValid({ ...rug, width: '2,5', length: '3' })).toBe(true);
    expect(packItemValid({ ...rug, width: '-2', length: '3' })).toBe(false);
    expect(customPackLine({ ...rug, width: '2', length: '3' }).amount).toBeNull();
    expect(calculateCustomPack([rug], 'Braga').valid).toBe(false);
  });
  it('separates unpriced extras and unknown travel from a complete estimate', () => {
    const item = { ...makePackItem('sofa', 's'), extra: 'desbacterizacao' as const };
    const result = calculateCustomPack([item], 'Outra localidade');
    expect(result.travel).toBeNull(); expect(result.quote).toBe(true);
    expect(result.total).toBe(49);
  });
  // 2026-09-10 (pedido explícito do dono): sem desconto de 10% sobre o
  // pedido todo — cada linha soma ao preço de tabela, sem limiar a cumprir.
  it('sums the full table price for each item, with no discount concept, and never discounts travel', () => {
    const items = [{ ...makePackItem('sofa', 's'), size: '3-lugares' }, { ...makePackItem('mattress', 'm'), size: 'king' }];
    const result = calculateCustomPack(items, 'Barcelos');
    expect(result.subtotal).toBe(158);
    expect(result.travel).toBe(20); expect(result.total).toBe(158 + 20);
  });
  it('keeps ten chairs under quote even when split across rows', () => {
    const result = calculateCustomPack([{ ...makePackItem('chairs','a'), qty: 5 }, { ...makePackItem('chairs','b'), qty: 5 }], 'Braga');
    expect(result.lines.every(line => line.amount === null)).toBe(true);
    expect(result.quote).toBe(true);
  });
});
