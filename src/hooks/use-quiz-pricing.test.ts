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

describe('partial treatment quantities', () => {
  it('charges Premium for only one of three sofas, including the pack delta override', () => {
    const { result } = renderHook(() => useQuizPricing(
      { ...initialFormData, service: 'sofa', serviceType: 'cleaning', waterproofingTier: 'premium' },
      [{ sizeId: '3-lugares', qty: 3, packEnabled: true, packQty: 1 }], [], [], []));
    expect(result.current.totalPrice).toBe(199 + 79 * 2);
  });
  it('charges treatment for only one of three mattresses', () => {
    const { result } = renderHook(() => useQuizPricing(
      { ...initialFormData, service: 'mattress', serviceType: 'cleaning' },
      [], [{ sizeId: 'casal', qty: 3, packEnabled: true, packQty: 1 }], [], []));
    expect(result.current.totalPrice).toBe(89 + 69 * 2);
  });
});

// 2026-09-10 (pedido explícito do dono, sessão da tarde): o desconto geral de
// 10% sobre o pedido todo foi removido do site e do código. O upsell final
// (QuizComboUpsellScreen) agora oferece um preço reduzido por artigo em vez
// de um desconto condicional sobre o total — não há mais nenhum limiar de
// "2 artigos, soma >149€" a testar aqui.
describe('quote total with upsell items', () => {
  const sofa = [{ id: 'test-sofa', sizeId: '3-lugares', qty: 1, packEnabled: false, chaiseLongue: false }];
  const extra = [{ id: 'mattress-casal', mattressSize: 'casal', qty: 1, price: 55, label: '1x Colchão Casal' }];
  const form = { ...initialFormData, location: 'Lisboa', service: 'sofa', serviceType: 'cleaning' as const };
  it('adds the upsell item price straight into the total, no discount concept involved', () => {
    const { result } = renderHook(() => useQuizPricing(form, sofa, [], extra, []));
    expect(result.current.totalPrice).toBe(144);
  });
  it('keeps the original price when the extra is declined', () => {
    const { result } = renderHook(() => useQuizPricing(form, sofa, [], [], []));
    expect(result.current.totalPrice).toBe(89);
  });
});
