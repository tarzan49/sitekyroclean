import { describe, expect, it } from 'vitest';
import { buildQuizOrder, describeQuizOrder, type QuizOrderInput } from './quizOrder';
import { buildReceiptLines } from '@/services/submissionService';
import { botQuote } from './botQuote';
import { rugSide } from '@/constants/rugMeasure';

const base: QuizOrderInput = {
  service: 'sofa', serviceType: 'cleaning', waterproofingTier: 'premium',
  sofaItems: [], mattressItems: [], upsellItems: [], carpetItems: [],
  chairQuantity: '', chairWaterproofQty: 0, chairAntiAcaros: false,
  finalLocation: 'Porto', totalPrice: 0, hasSobOrcamento: false, hasUpsellSobItem: false,
  priceText: '', slotLabel: '',
};
const order = (p: Partial<QuizOrderInput>) => {
  const input = { ...base, ...p };
  return buildQuizOrder(input, buildReceiptLines({ ...input, finalTravelCost: 10 }));
};

describe('rugSide', () => {
  it('reads centimetres as centimetres and keeps metres', () => {
    expect(rugSide('230')).toEqual({ meters: 2.3, fromCm: true, doubtful: false });
    expect(rugSide('2,3')).toEqual({ meters: 2.3, fromCm: false, doubtful: false });
    expect(rugSide('12')?.doubtful).toBe(true);
    expect(rugSide('0')).toBeNull();
    expect(rugSide('5000')).toBeNull();
  });
});

describe('buildQuizOrder', () => {
  it('rugs typed in centimetres become metres, in the quote request and in the receipt', () => {
    const o = order({ service: 'carpet', carpetKind: 'tapete', carpetItems: [{ id: 'a', largura: '230', comprimento: '160' }, { id: 'b', largura: '3', comprimento: '4' }], rugPickup: true });
    expect(o.rugs.map(r => [r.width, r.length, r.areaM2, r.fromCm])).toEqual([[2.3, 1.6, 3.68, true], [3, 4, 12, false]]);
    expect(o.quote.items).toEqual([
      { kind: 'rug', qty: 1, treatment: 'clean', width: 2.3, length: 1.6 },
      { kind: 'rug', qty: 1, treatment: 'clean', width: 3, length: 4 },
    ]);
    expect(o.lines[0].label).toBe('Tapete 1: 2,3 × 1,6 m (3,68 m²)');
    expect(o.rugPickup).toBe(true);
  });

  it('the quote request prices like the quiz: sofa + premium, plus the extras of the same visit', () => {
    const o = order({
      sofaItems: [{ sizeId: '3-lugares', qty: 1, packEnabled: true }],
      upsellItems: [{ id: 'mattress-casal', mattressSize: 'casal', qty: 1, price: 0, label: '1x Colchão Casal' }],
    });
    expect(o.quote.items).toEqual([
      { kind: 'sofa', size: '3-lugares', qty: 1, treatment: 'clean+premium' },
      { kind: 'mattress', size: 'casal', qty: 1, treatment: 'clean' },
    ]);
    expect(o.quote.exact).toBe(true);
    const quote = botQuote({ items: o.quote.items, city: 'Porto' });
    expect(quote.ok).toBe(true);
  });

  it('chairs: the main treatment on all, the other on the chosen ones, same sum as the receipt', () => {
    const o = order({ service: 'chairs', chairQuantity: '6', chairWaterproofQty: 6, waterproofingTier: 'essencial' });
    expect(o.quote.items).toEqual([{ kind: 'chairs', qty: 6, treatment: 'clean' }, { kind: 'chairs', qty: 6, treatment: 'essencial' }]);
    const quote = botQuote({ items: o.quote.items, city: 'Porto' });
    const receipt = buildReceiptLines({ ...base, service: 'chairs', chairQuantity: '6', chairWaterproofQty: 6, waterproofingTier: 'essencial', finalTravelCost: 0 });
    expect(quote.ok && quote.subtotal).toBe(receipt.reduce((s, l) => s + (l.total ?? 0), 0));
  });

  it('keeps the observations and the chosen slot', () => {
    const o = order({ sofaItems: [{ sizeId: '2-lugares', qty: 1, packEnabled: false }], description: 'Tem uma mancha de café', slotLabel: 'Sábado de manhã' });
    expect([o.observations, o.slot]).toEqual(['Tem uma mancha de café', 'Sábado de manhã']);
  });
});

describe('describeQuizOrder', () => {
  it('stored order: items, quote request, what not to ask', () => {
    const o = order({ service: 'carpet', carpetItems: [{ id: 'a', largura: '230', comprimento: '160' }] });
    const brief = describeQuizOrder({ quiz_order: JSON.parse(JSON.stringify(o)), location: 'Faro', service: 'Tapete' });
    expect(brief.source).toBe('quiz_order');
    expect(brief.items[0]).toContain('2,3 × 1,6 m (3,68 m²), escrito em centímetros no questionário (230 × 160)');
    expect(brief.quoteRequest?.items[0]).toMatchObject({ kind: 'rug', width: 2.3, length: 1.6 });
    expect(brief.alreadyKnown).toContain('as medidas de cada tapete ou alcatifa');
    expect(brief.confirmFirst).toEqual([]);
  });

  it('old order from the text summary: centimetres read as such, a 12 m side to confirm', () => {
    const brief = describeQuizOrder({ details: '1x Tapete 1: 133 × 190 m (25270 m²): Sob orçamento\n1x Tapete 2: 12 × 3 m (36 m²): Sob orçamento\n1x Recolha, entrega e deslocação (até 4 dias úteis): 20€', location: 'Porto', service: 'Tapete' });
    expect(brief.source).toBe('details');
    expect(brief.items[0]).toBe('1x Tapete 1: 1,33 × 1,9 m (2,53 m²), escrito em centímetros no questionário (133 × 190), já convertido: sob orçamento');
    expect(brief.confirmFirst).toHaveLength(1);
    expect(brief.confirmFirst[0]).toContain('Tapete 2');
    expect(brief.rugPickup).toBe(true);
  });
});
