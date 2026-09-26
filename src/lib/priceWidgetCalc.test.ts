import { describe, it, expect } from 'vitest';
import {
  calcChairBracket, calcWidgetPricing,
  calcWidgetTotal, buildWidgetQuizConfig, SOFA_ANTI_ACAROS_PRICE,
} from './priceWidgetCalc';
import * as widgetCalc from './priceWidgetCalc';
import { PRICE_TABLE, PRICE_TABLE_QUIZ_CONFIG } from '@/data/locationPriceTestimonialsData';
import { SOFA_ANTI_ACAROS_PRICE as SHARED_SOFA_ANTI_ACAROS_PRICE } from '@/constants/antiAcarosPricing';

describe('calcChairBracket', () => {
  it('is 0 for 0/negative qty, never null (0€ is a valid "nothing selected" price)', () => {
    expect(calcChairBracket(0, false)).toBe(0);
    expect(calcChairBracket(-1, false)).toBe(0);
  });
  it('keeps cleaning under quotation at 10+ but prices protection per unit', () => {
    expect(calcChairBracket(10, false)).toBeNull();
    expect(calcChairBracket(10, true)).toBe(180);
  });
  it('uses the same Essential and Premium chair prices as the quiz', () => {
    expect(calcChairBracket(4, true, 'essencial')).toBe(72);
    expect(calcChairBracket(9, true, 'essencial')).toBe(162);
    expect(calcChairBracket(4, true, 'premium')).toBe(100);
    expect(calcChairBracket(9, true, 'premium')).toBe(225);
  });
});

// calcCarpetWidget foi removida (2026-09-09, pedido explícito: "limpeza de
// alcatifa e sempre sob orçamento assim como tapete") — carpet (tapete e
// alcatifa) nunca mais entra em calcWidgetTotal, ver o early-return "sempre
// sob orçamento".
describe('calcWidgetTotal — carpet (tapete e alcatifa) nunca soma ao total', () => {
  it('linhas de carpet são ignoradas mesmo com qty > 0', () => {
    expect(calcWidgetTotal('limpeza-tapetes', { 0: 20 })).toBe(0);
    expect(calcWidgetTotal('limpeza-alcatifas', { 0: 30 })).toBe(0);
  });
});

// 2026-09-10 (pedido explícito do dono): o desconto Pack Família de 10% sobre
// o pedido todo foi removido do site e do código — calcWidgetArticles e o
// limiar de 149€ deixaram de existir. calcWidgetPricing agora só soma
// serviço + deslocação.
describe('calcWidgetPricing — sem conceito de desconto', () => {
  it('grandTotal applies the travel waiver', () => {
    expect(calcWidgetPricing(200, 10)).toEqual({ serviceTotal: 200, travelFee: 0, grandTotal: 200 });
  });
});

describe('calcWidgetTotal (limpeza-sofas, dados reais)', () => {
  it('"Sofá de 4+ lugares" (sob orçamento) never silently contributes 0€ as if it were free', () => {
    const rowQuantities = { 3: 1 }; // index 3 = 4+ lugares
    const total = calcWidgetTotal('limpeza-sofas', rowQuantities);
    expect(total).toBe(0); // sob orçamento: não soma preço nenhum.
  });

  it('prices sofas from the same table the quiz charges', () => {
    expect(calcWidgetTotal('limpeza-sofas', { 0: 1, 1: 1, 2: 1 })).toBe(49 + 69 + 79);
  });
});

// 2026-09-26: a chaise longue era anunciada a +10€ (limpeza) e +25€
// (impermeabilização) mas o quiz nunca a perguntava nem cobrava.
describe('no price table row advertises something the quiz cannot charge', () => {
  it('has no chaise longue row and every row maps to a quiz config', () => {
    for (const [slug, rows] of Object.entries(PRICE_TABLE)) {
      expect(rows.some(row => /chaise/i.test(row.item)), slug).toBe(false);
      expect(rows.some(row => row.price.startsWith('+')), slug).toBe(false);
      expect(PRICE_TABLE_QUIZ_CONFIG[slug]).toHaveLength(rows.length);
      expect(PRICE_TABLE_QUIZ_CONFIG[slug].every(Boolean), slug).toBe(true);
    }
  });
});

// O caminho de extras do widget (toggles de impermeabilização e anti-ácaros)
// nunca corria e guardava uma terceira tabela de anti-ácaros (10€ + 7,50€ por
// cadeira). Foi apagado; o preço do sofá continua reexportado daqui.
describe('dead add-on path stays deleted', () => {
  it('only exposes the shared anti-acaros sofa price', () => {
    expect(SOFA_ANTI_ACAROS_PRICE).toBe(SHARED_SOFA_ANTI_ACAROS_PRICE);
    for (const name of ['calcChairAntiAcarosTotal', 'calcSofaAntiAcarosDelta', 'calcRowAddonDelta', 'CHAIR_ANTI_ACAROS_FIRST_PRICE', 'CHAIR_ANTI_ACAROS_UNIT_PRICE']) {
      expect(name in widgetCalc, name).toBe(false);
    }
  });
});

describe('buildWidgetQuizConfig', () => {
  it('returns null when nothing is selected', () => {
    expect(buildWidgetQuizConfig('limpeza-sofas', {})).toBeNull();
  });

  it('builds a sofa config from a selected row', () => {
    const cfg = buildWidgetQuizConfig('limpeza-sofas', { 0: 2 });
    expect(cfg?.service).toBe('sofa');
    expect(cfg?.sofaItems).toEqual([{ sizeId: '1-lugar', qty: 2, packEnabled: false }]);
  });

  it('builds a chairs config from limpeza-cadeiras', () => {
    const cfg = buildWidgetQuizConfig('limpeza-cadeiras', { 0: 3 });
    expect(cfg?.service).toBe('chairs');
    expect(cfg?.chairQty).toBe('3');
  });
});


describe('waterproof widget handoff', () => {
  it.each(['essencial', 'premium'] as const)('preserves %s prices and quantities for sofa plus chairs', tier => {
    const quantities = { 1: 2, 4: 4 };
    const total = calcWidgetTotal('impermeabilizacao', quantities, tier);
    const config = buildWidgetQuizConfig('impermeabilizacao', quantities, tier)!;
    const sofaUnit = tier === 'premium' ? 109 : 79;
    const chairs = tier === 'premium' ? 100 : 72;
    expect(total).toBe(sofaUnit * 2 + chairs);
    expect(config.waterproofingTier).toBe(tier);
    expect(config.sofaItems?.[0].qty).toBe(2);
    expect(config.initialUpsellItems?.[0].price).toBe(chairs);
  });
  it('prices ten protected chairs in a mixed selection', () => {
    const config = buildWidgetQuizConfig('impermeabilizacao', { 0: 1, 4: 10 })!;
    expect(config.initialUpsellItems?.[0].price).toBe(180);
  });
});

it('does not drop an incomplete piece when launching a carpet quote', () => {
  expect(buildWidgetQuizConfig('limpeza-tapetes', { 0: 1 }, 'premium', { 0: [{ id: 'one', largura: '2', comprimento: '3' }, { id: 'two', largura: '1', comprimento: '' }] })).toBeNull();
});
