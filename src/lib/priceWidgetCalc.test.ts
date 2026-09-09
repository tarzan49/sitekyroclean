import { describe, it, expect } from 'vitest';
import {
  calcChairBracket, calcWidgetPricing, calcWidgetArticles,
  calcWidgetTotal, buildWidgetQuizConfig, PACK_DISCOUNT_MIN_TOTAL,
} from './priceWidgetCalc';

describe('calcChairBracket', () => {
  it('is 0 for 0/negative qty, never null (0€ is a valid "nothing selected" price)', () => {
    expect(calcChairBracket(0, false)).toBe(0);
    expect(calcChairBracket(-1, false)).toBe(0);
  });
  it('is null at 10+ regardless of waterproof', () => {
    expect(calcChairBracket(10, false)).toBeNull();
    expect(calcChairBracket(10, true)).toBeNull();
  });
  it('waterproof bracket (1-4 @ 25€, 5-9 @ 20€) matches cleaning bracket shape but higher', () => {
    expect(calcChairBracket(4, true)).toBe(100);
    expect(calcChairBracket(9, true)).toBe(4 * 25 + 5 * 20);
    for (let qty = 1; qty <= 9; qty++) {
      expect(calcChairBracket(qty, true)!).toBeGreaterThan(calcChairBracket(qty, false)!);
    }
  });
});

// calcCarpetWidget foi removida (2026-09-09, pedido explícito: "limpeza de
// alcatifa e sempre sob orçamento assim como tapete") — carpet (tapete e
// alcatifa) nunca mais entra em calcWidgetTotal/calcWidgetArticles, ver o
// early-return "sempre sob orçamento" nessas duas funções.
describe('calcWidgetTotal — carpet (tapete e alcatifa) nunca soma ao total', () => {
  it('linhas de carpet são ignoradas mesmo com qty > 0', () => {
    expect(calcWidgetTotal('limpeza-tapetes', { 0: 20 }, 0)).toBe(0);
    expect(calcWidgetTotal('limpeza-alcatifas', { 0: 30 }, 0)).toBe(0);
  });
});

// Este é o bug real reportado nesta sessão: "o desconto ativou sem o valor
// ser mais que 100 eur. eu fiz upsell de um item de 49 eur e o desconto
// ativou automaticamente" — a regra certa exige DOIS critérios ao mesmo
// tempo (soma > 149€ E pelo menos um artigo isolado >= 49€), não um sozinho.
describe('calcWidgetPricing — regra do desconto Pack Família (100€ base + 49€ artigo extra)', () => {
  it('does not activate for a single 49€ article alone, even if that IS the qualifying threshold', () => {
    const pricing = calcWidgetPricing(49, 10, { articleTotal: 49, minQualifyingArticle: 49 });
    expect(pricing.discountActive).toBe(false);
  });
  it('does not activate exactly at the 149€ boundary — must be strictly greater than', () => {
    expect(PACK_DISCOUNT_MIN_TOTAL).toBe(149);
    const pricing = calcWidgetPricing(149, 0, { articleTotal: 149, minQualifyingArticle: 49 });
    expect(pricing.discountActive).toBe(false);
  });
  it('activates just above 149€ when a qualifying (>=49€) article exists', () => {
    const pricing = calcWidgetPricing(150, 0, { articleTotal: 150, minQualifyingArticle: 49 });
    expect(pricing.discountActive).toBe(true);
  });
  it('does NOT activate above 149€ if every individual article is under 49€ (e.g. many small chairs)', () => {
    const pricing = calcWidgetPricing(200, 0, { articleTotal: 200, minQualifyingArticle: null });
    expect(pricing.discountActive).toBe(false);
  });
  it('discountedTotal applies 10% only to the service total, travel fee stays full price', () => {
    const pricing = calcWidgetPricing(200, 10, { articleTotal: 200, minQualifyingArticle: 60 });
    expect(pricing.discountActive).toBe(true);
    expect(pricing.discountedTotal).toBe(Math.round(200 * 0.9) + 10);
  });
});

describe('calcWidgetArticles + calcWidgetTotal (limpeza-sofas, dados reais)', () => {
  it('a single "Sofá 1 lugar" (49€) is one article of 49€, not enough alone to qualify the discount', () => {
    const rowQuantities = { 0: 1 };
    const articles = calcWidgetArticles('limpeza-sofas', rowQuantities);
    expect(articles.articleTotal).toBe(49);
    expect(articles.minQualifyingArticle).toBe(49);
    const total = calcWidgetTotal('limpeza-sofas', rowQuantities, 0);
    const pricing = calcWidgetPricing(total, 10, articles);
    expect(pricing.discountActive).toBe(false);
  });

  it('sofa 1 lugar + 2 lugares + 3 lugares together cross 149€ and qualify', () => {
    const rowQuantities = { 0: 1, 1: 1, 2: 1 }; // 49 + 69 + 79 = 197
    const articles = calcWidgetArticles('limpeza-sofas', rowQuantities);
    expect(articles.articleTotal).toBe(197);
    const total = calcWidgetTotal('limpeza-sofas', rowQuantities, 0);
    const pricing = calcWidgetPricing(total, 0, articles);
    expect(pricing.discountActive).toBe(true);
  });

  it('"Sofá de 4+ lugares" (sob orçamento) never silently contributes 0€ as if it were free', () => {
    const rowQuantities = { 4: 1 }; // index 4 = 4+ lugares
    const total = calcWidgetTotal('limpeza-sofas', rowQuantities, 0);
    expect(total).toBe(0); // sob orçamento: não soma preço nenhum...
    const articles = calcWidgetArticles('limpeza-sofas', rowQuantities);
    expect(articles.articleTotal).toBe(0); // ...e também não finge ser um artigo de 0€ que "conta".
  });

  it('a row without quizConfig (chaise longue) still prices from its flat PRICE_TABLE price if set via rowQuantities directly', () => {
    // Na prática a UI do widget nunca escreve aqui — o stepper da chaise
    // longue foi removido (pedido explícito 2026-09-08) e o parâmetro
    // chaiseLongueAddon dedicado ficou sempre a 0. Este teste documenta o
    // comportamento genérico da própria função de cálculo, não da UI atual.
    const rowQuantities = { 3: 2 }; // index 3 = chaise longue, +10€ cada
    const total = calcWidgetTotal('limpeza-sofas', rowQuantities, 0);
    expect(total).toBe(20);
  });
  it('the dedicated chaiseLongueAddon parameter prices at 10€/un. (cleaning) independently of rowQuantities', () => {
    const total = calcWidgetTotal('limpeza-sofas', {}, 2);
    expect(total).toBe(20);
  });
});

describe('buildWidgetQuizConfig', () => {
  it('returns null when nothing is selected', () => {
    expect(buildWidgetQuizConfig('limpeza-sofas', {}, 0)).toBeNull();
  });

  it('builds a sofa config from a selected row', () => {
    const cfg = buildWidgetQuizConfig('limpeza-sofas', { 0: 2 }, 0);
    expect(cfg?.service).toBe('sofa');
    expect(cfg?.sofaItems).toEqual([{ sizeId: '1-lugar', qty: 2, packEnabled: false, chaiseLongue: false }]);
  });

  it('builds a chairs config from limpeza-cadeiras', () => {
    const cfg = buildWidgetQuizConfig('limpeza-cadeiras', { 0: 3 }, 0);
    expect(cfg?.service).toBe('chairs');
    expect(cfg?.chairQty).toBe('3');
  });
});
