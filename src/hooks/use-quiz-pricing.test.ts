import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuizPricing } from './use-quiz-pricing';
import { initialFormData } from '@/components/quiz/QuizTypes';
import type { QuizFormData, UpsellItemConfig } from '@/components/quiz/QuizTypes';

function pricing(formData: Partial<QuizFormData>, upsellItems: UpsellItemConfig[] = []) {
  const { result } = renderHook(() =>
    useQuizPricing({ ...initialFormData, ...formData }, [], [], upsellItems, [])
  );
  return result.current;
}

// Bug real reportado nesta sessão, literalmente: "o desconto ativou sem o
// valor ser mais que 100 eur. eu fiz upsell de um item de 49 eur e o
// desconto ativou automaticamente, corrige primeiro essa logica antes de
// tudo". A causa era um comentário/limiar desalinhado (160€/60€ vs 149€/49€)
// — este teste fixa o comportamento correto para nunca mais regredir em
// silêncio.
describe('useQuizPricing — packDiscountActive não pode ativar com um único upsell de 49€', () => {
  it('a single 49€ upsell item alone (no other service value) does NOT activate the discount', () => {
    const p = pricing(
      { service: 'sofa', serviceType: 'cleaning' },
      [{ id: 'mattress', price: 49, qty: 1, label: 'Colchão Casal' }],
    );
    expect(p.packDiscountActive).toBe(false);
  });

  it('does not activate exactly at the 149€ combined boundary', () => {
    const p = pricing(
      { service: 'sofa', serviceType: 'cleaning' },
      [{ id: 'mattress', price: 149, qty: 1, label: 'Colchão Casal' }],
    );
    expect(p.packDiscountActive).toBe(false);
  });

  it('activates once combined article value passes 149€ with a qualifying (>=49€) article', () => {
    const p = pricing(
      { service: 'sofa', serviceType: 'cleaning' },
      [{ id: 'mattress', price: 150, qty: 1, label: 'Colchão Casal' }],
    );
    expect(p.packDiscountActive).toBe(true);
  });

  it('combining the primary sofa item with a qualifying upsell crosses the threshold correctly', () => {
    const p = pricing(
      {
        service: 'sofa', serviceType: 'cleaning',
      },
      [{ id: 'mattress', price: 49, qty: 1, label: 'Colchão Casal' }],
    );
    // Sem sofaItems preenchidos o serviço primário vale 0€ — sozinho com o
    // upsell de 49€ fica em 49€, insuficiente (replica o cenário exato do
    // bug reportado).
    expect(p.packDiscountActive).toBe(false);
  });

  it('sofa-anti-acaros / chairs-anti-acaros upsell ids never count as their own qualifying article', () => {
    const p = pricing(
      { service: 'sofa', serviceType: 'cleaning' },
      [{ id: 'sofa-anti-acaros', price: 200, qty: 1, label: 'Anti Ácaros (sofá)' }],
    );
    expect(p.packDiscountActive).toBe(false);
  });

  it('a "sob orçamento" upsell item (price 0) always activates the discount, since it implies a large order', () => {
    const p = pricing(
      { service: 'sofa', serviceType: 'cleaning' },
      [{ id: 'chairs', price: 0, qty: 12, label: '12 cadeiras' }],
    );
    expect(p.packDiscountActive).toBe(true);
    expect(p.hasUpsellSobItem).toBe(true);
  });
});

describe('useQuizPricing — chairs "sob orçamento" thresholds stay in sync across serviceType', () => {
  it('10 chairs + waterproofing addon never silently falls back to charging cleaning alone (real bug fixed 2026-08-31)', () => {
    const p = pricing({
      service: 'chairs', serviceType: 'waterproofing',
      chairQuantity: '10', chairWaterproofQty: 0,
    });
    expect(p.hasSobOrcamento).toBe(true);
  });

  it('9 chairs (just under the sob-orçamento threshold) still has a real fixed price', () => {
    const p = pricing({
      service: 'chairs', serviceType: 'cleaning',
      chairQuantity: '9', chairWaterproofQty: 0,
    });
    expect(p.hasSobOrcamento).toBe(false);
    expect(p.calculateServicePrice).toBeGreaterThan(0);
  });
});

describe('local quiz pack proposal', () => {
  const sofa = [{ id: 'test-sofa', sizeId: '3-lugares', qty: 1, packEnabled: false, chaiseLongue: false }];
  const extra = [{ id: 'mattress-casal', mattressSize: 'casal', qty: 1, price: 55, label: '1x Colchão Casal' }];
  const form = { ...initialFormData, location: 'Lisboa', service: 'sofa', serviceType: 'cleaning' as const };
  it('keeps the fixed extra price without stacking a pack discount', () => {
    const actual = renderHook(() => useQuizPricing(form, sofa, [], extra, []));
    expect(actual.result.current.packDiscountActive).toBe(false);
    const demo = renderHook(() => useQuizPricing(form, sofa, [], extra, [], true));
    expect(demo.result.current.packDiscountActive).toBe(false);
    expect(demo.result.current.totalPrice).toBe(144);
  });
  it('keeps the original price when the extra is declined', () => {
    const demo = renderHook(() => useQuizPricing(form, sofa, [], [], [], true));
    expect(demo.result.current.packDiscountActive).toBe(false);
    expect(demo.result.current.totalPrice).toBe(89);
  });
});
