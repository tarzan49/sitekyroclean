import { describe, it, expect } from 'vitest';
import { calculateCustomPack, makePackItem, customPackLine, packItemValid } from './customPack';
import { sofaPrices } from '../components/quiz/QuizTypes';
import { calcPackPricing } from '../components/quiz/quizHelpers';
import { PACK_PERK_MATTRESS_OFF, PACK_PERK_MIN_ORDER, PACK_PERK_RUG_NOTE, PACK_PERK_SOFA_PRICE, perkChairsPrice, perkMattressPrice } from '../constants/packPerks';
import { SOFA_ANTI_ACAROS_PRICE, CHAIR_ANTI_ACAROS_UNIT_PRICE } from '../constants/antiAcarosPricing';
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
  it('separates unknown travel from a complete estimate', () => {
    const item = makePackItem('sofa', 's');
    const result = calculateCustomPack([item], 'Outra localidade');
    expect(result.travel).toBeNull(); expect(result.quote).toBe(true);
    expect(result.total).toBe(49);
  });
  // 2026-09-23 (decisão do responsável): o pack não desconta o pedido todo —
  // dá as mesmas regalias do upsell do quiz ao artigo acrescentado. Os preços
  // vivem em constants/packPerks.ts e são partilhados com o quiz.
  it('charges the table price for the first article and the pack price for the next', () => {
    const items = [{ ...makePackItem('sofa', 's'), size: '3-lugares' }, { ...makePackItem('mattress', 'm'), size: 'king' }];
    const result = calculateCustomPack(items, 'Barcelos');
    expect(result.lines[0].amount).toBe(79);
    expect(result.lines[0].perkApplied).toBe(false);
    expect(result.lines[1].amount).toBe(perkMattressPrice(79));
    expect(result.lines[1].perkApplied).toBe(true);
    expect(result.tableSubtotal).toBe(158);
    expect(result.subtotal).toBe(144);
    expect(result.savings).toBe(PACK_PERK_MATTRESS_OFF);
  });
  it('prices an added sofa at the same fixed amount the quiz upsell shows', () => {
    for (const size of Object.keys(PACK_PERK_SOFA_PRICE)) {
      const items = [{ ...makePackItem('mattress', 'm'), size: 'casal' }, { ...makePackItem('sofa', 's'), size }];
      expect(calculateCustomPack(items, 'Braga').lines[1].amount).toBe(PACK_PERK_SOFA_PRICE[size]);
    }
  });
  it('offers one chair per set of four when chairs are added to the pack', () => {
    const items = [{ ...makePackItem('sofa', 's'), size: '2-lugares' }, { ...makePackItem('chairs', 'c'), qty: 8 }];
    const result = calculateCustomPack(items, 'Braga');
    const table = result.lines[1].tablePrice!;
    expect(result.lines[1].amount).toBe(perkChairsPrice(table, 8));
    expect(result.lines[1].amount).toBeLessThan(table);
    expect(result.lines[1].perkNote).toBe('2 oferecidas');
  });
  it('keeps the table price when an added sofa carries a treatment', () => {
    const items = [{ ...makePackItem('mattress', 'm'), size: 'casal' }, { ...makePackItem('sofa', 's'), size: '3-lugares', extra: 'anti-acaros' as const }];
    const result = calculateCustomPack(items, 'Braga');
    expect(result.lines[1].perkApplied).toBe(false);
    expect(result.lines[1].amount).toBe(result.lines[1].tablePrice);
  });
  it('still discounts an added mattress with anti-acaros (owner exception, 2026-09-24)', () => {
    const items = [{ ...makePackItem('sofa', 's'), size: '3-lugares' }, { ...makePackItem('mattress', 'm'), size: 'king', extra: 'anti-acaros' as const }];
    const result = calculateCustomPack(items, 'Braga');
    expect(result.lines[1].perkApplied).toBe(true);
    expect(result.lines[1].amount).toBe(result.lines[1].tablePrice! - PACK_PERK_MATTRESS_OFF);
    expect(result.savings).toBeGreaterThan(0);
  });
  it('never invents a price for an added sofa that has none', () => {
    const items = [{ ...makePackItem('mattress', 'm'), size: 'casal' }, { ...makePackItem('sofa', 's'), size: '4-lugares' }];
    const result = calculateCustomPack(items, 'Braga');
    expect(result.lines[1].amount).toBeNull();
    expect(result.quote).toBe(true);
  });
  // 2026-09-24 (pedido explícito do dono): um pedido pequeno não pode ficar
  // com vantagem sobre a mesma pessoa a pedir um orçamento normal só por ter
  // acrescentado um segundo artigo — o preço de pack só se pratica a partir
  // de PACK_PERK_MIN_ORDER de subtotal de tabela.
  it('charges table price for every article when the order stays under the pack minimum', () => {
    const items = [{ ...makePackItem('sofa', 's'), size: '1-lugar' }, { ...makePackItem('chairs', 'c'), qty: 1 }];
    const result = calculateCustomPack(items, 'Braga');
    expect(result.tableSubtotal).toBeLessThan(PACK_PERK_MIN_ORDER);
    expect(result.perkEligible).toBe(false);
    expect(result.lines[1].perkApplied).toBe(false);
    expect(result.lines[1].amount).toBe(result.lines[1].tablePrice);
    expect(result.savings).toBe(0);
  });
  it('unlocks the pack price for the second article once the table subtotal reaches the minimum', () => {
    const items = [{ ...makePackItem('sofa', 's'), size: '2-lugares' }, { ...makePackItem('chairs', 'c'), qty: 4 }];
    const result = calculateCustomPack(items, 'Braga');
    expect(result.tableSubtotal).toBeGreaterThanOrEqual(PACK_PERK_MIN_ORDER);
    expect(result.perkEligible).toBe(true);
    expect(result.lines[1].perkApplied).toBe(true);
  });
  // 2026-09-26: a regra do quiz. O tipo do primeiro artigo é o serviço
  // principal e fica todo ao preço de tabela; só os outros tipos têm preço de pack.
  it('keeps every unit and size of the main service at table price', () => {
    const twoSizes = calculateCustomPack([{ ...makePackItem('sofa', 'a'), size: '3-lugares' }, { ...makePackItem('sofa', 'b'), size: '2-lugares' }], 'Braga');
    expect(twoSizes.subtotal).toBe(79 + 69);
    expect(twoSizes.lines.every(line => line.isMain && !line.perkApplied)).toBe(true);
    const sameSize = calculateCustomPack([{ ...makePackItem('sofa', 'a'), size: '2-lugares', qty: 2 }], 'Braga');
    expect(sameSize.subtotal).toBe(69 * 2);
    // Um segundo colchão num pack que começa por colchão também paga tabela.
    const mattresses = calculateCustomPack([{ ...makePackItem('mattress', 'a'), size: 'casal' }, { ...makePackItem('rug', 'r'), width: '2', length: '3' }, { ...makePackItem('mattress', 'b'), size: 'king' }], 'Braga');
    expect(mattresses.lines[2].amount).toBe(79);
    expect(mattresses.lines[2].isMain).toBe(true);
  });
  it('gives an added rug the same per-m² offer as the quiz, only when the pack applies', () => {
    const eligible = calculateCustomPack([{ ...makePackItem('sofa', 's'), size: '3-lugares' }, { ...makePackItem('mattress', 'm'), size: 'casal' }, { ...makePackItem('rug', 'r'), width: '2', length: '3' }], 'Braga');
    expect(eligible.lines[2].amount).toBeNull();
    expect(eligible.lines[2].perkNote).toBe(PACK_PERK_RUG_NOTE);
    const small = calculateCustomPack([{ ...makePackItem('sofa', 's'), size: '1-lugar' }, { ...makePackItem('rug', 'r'), width: '2', length: '3' }], 'Braga');
    expect(small.perkEligible).toBe(false);
    expect(small.lines[1].perkNote).toBeNull();
    // O tapete como serviço principal não tem regalia sobre si próprio.
    const rugFirst = calculateCustomPack([{ ...makePackItem('rug', 'r'), width: '2', length: '3' }, { ...makePackItem('sofa', 's'), size: '3-lugares' }, { ...makePackItem('mattress', 'm'), size: 'casal' }], 'Braga');
    expect(rugFirst.lines[0].perkNote).toBeNull();
  });
  it('prices anti-acaros from the shared table: per sofa size, 5€ per chair, mattress bothPrice', () => {
    for (const [size, extra] of Object.entries(SOFA_ANTI_ACAROS_PRICE)) {
      const option = sofaPrices.find(p => p.id === size)!;
      expect(customPackLine({ ...makePackItem('sofa', 's'), size, extra: 'anti-acaros' }).amount).toBe(Number(option.cleaningPrice) + extra);
    }
    expect(customPackLine({ ...makePackItem('sofa', 's'), size: '4+-lugares', extra: 'anti-acaros' }).amount).toBeNull();
    expect(customPackLine({ ...makePackItem('chairs', 'c'), qty: 4, extra: 'anti-acaros' }).amount).toBe(80 + 4 * CHAIR_ANTI_ACAROS_UNIT_PRICE);
    expect(customPackLine({ ...makePackItem('mattress', 'm'), size: 'casal', extra: 'anti-acaros' }).amount).toBe(89);
  });
  it('has no chaise longue option left', () => {
    expect('chaise' in makePackItem('sofa', 's')).toBe(false);
    expect(customPackLine(makePackItem('sofa', 's')).label).not.toMatch(/chaise/i);
  });
  it('keeps ten chairs under quote even when split across rows', () => {
    const result = calculateCustomPack([{ ...makePackItem('chairs','a'), qty: 5 }, { ...makePackItem('chairs','b'), qty: 5 }], 'Braga');
    expect(result.lines.every(line => line.amount === null)).toBe(true);
    expect(result.quote).toBe(true);
  });
});
