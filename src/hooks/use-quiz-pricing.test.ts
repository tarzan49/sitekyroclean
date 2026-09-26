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
  it('10 chairs have fixed protection pricing', () => {
    const p = pricing({
      service: 'chairs', serviceType: 'waterproofing',
      chairQuantity: '10', chairWaterproofQty: 0,
    });
    expect(p.hasSobOrcamento).toBe(false);
    expect(p.calculateServicePrice).toBe(250);
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
    expect(result.current.totalPrice).toBe(189 + 79 * 2);
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
  const sofa = [{ sizeId: '3-lugares', qty: 1, packEnabled: false }];
  const extra = [{ id: 'mattress-casal', mattressSize: 'casal', qty: 1, price: 55, label: '1x Colchão Casal' }];
  const form = { ...initialFormData, location: 'Lisboa', service: 'sofa', serviceType: 'cleaning' as const };
  it('adds the upsell item price straight into the total, no discount concept involved', () => {
    const { result } = renderHook(() => useQuizPricing(form, sofa, [], extra, []));
    expect(result.current.totalPrice).toBe(134);
  });
  it('keeps the original price when the extra is declined', () => {
    const { result } = renderHook(() => useQuizPricing(form, sofa, [], [], []));
    expect(result.current.totalPrice).toBe(89);
  });
});

describe('travel recalculation', () => {
  it('reinstates travel when extras are removed and recalculates on a city change', () => {
    const sofa = [{ sizeId: '3-lugares', qty: 1, packEnabled: false }];
    const extra = [{ id: 'mattress-casal', qty: 1, price: 55, label: 'Colchão Casal' }];
    const { result, rerender } = renderHook(({ city, extras }) => useQuizPricing(
      { ...initialFormData, service: 'sofa', serviceType: 'cleaning', location: city },
      sofa, [], extras, []), { initialProps: { city: 'Lisboa', extras: extra } });
    expect(result.current.finalTravelCost).toBe(0);
    expect(result.current.totalPrice).toBe(134);
    rerender({ city: 'Penafiel', extras: extra });
    expect(result.current.finalTravelCost).toBe(15);
    expect(result.current.totalPrice).toBe(149);
    rerender({ city: 'Lisboa', extras: [] });
    expect(result.current.finalTravelCost).toBe(10);
    expect(result.current.totalPrice).toBe(89);
  });
});

// 2026-09-26: anti-ácaros no sofá e nas cadeiras, com os mesmos preços do
// configurador de packs (constants/antiAcarosPricing.ts).
describe('anti-acaros on sofas and chairs', () => {
  it.each([['1-lugar', 49 + 20], ['2-lugares', 69 + 40], ['3-lugares', 79 + 50]])('charges cleaning plus the per-size treatment for a %s sofa', (sizeId, expected) => {
    const { result } = renderHook(() => useQuizPricing(
      { ...initialFormData, service: 'sofa', serviceType: 'cleaning', sofaAntiAcaros: true },
      [{ sizeId, qty: 1, packEnabled: true }], [], [], []));
    expect(result.current.calculateServicePrice).toBe(expected);
  });
  it('charges the treatment only on the treated units', () => {
    const { result } = renderHook(() => useQuizPricing(
      { ...initialFormData, service: 'sofa', serviceType: 'cleaning', sofaAntiAcaros: true },
      [{ sizeId: '2-lugares', qty: 3, packEnabled: true, packQty: 1 }], [], [], []));
    expect(result.current.calculateServicePrice).toBe(69 * 3 + 40);
  });
  it('ignores the sofa anti-acaros flag when waterproofing is the main service', () => {
    const { result } = renderHook(() => useQuizPricing(
      { ...initialFormData, service: 'sofa', serviceType: 'waterproofing', waterproofingTier: 'essencial', sofaAntiAcaros: true },
      [{ sizeId: '2-lugares', qty: 1, packEnabled: false }], [], [], []));
    expect(result.current.calculateServicePrice).toBe(79);
  });
  it('charges 5€ per chair, only without waterproofing', () => {
    expect(pricing({ service: 'chairs', serviceType: 'cleaning', chairQuantity: '4', chairAntiAcaros: true }).calculateServicePrice).toBe(80 + 20);
    // Nunca as duas coisas: com impermeabilização, o anti-ácaros não conta
    // (mesma regra que o recibo, chairAntiAcarosQty).
    expect(pricing({ service: 'chairs', serviceType: 'cleaning', chairQuantity: '4', chairAntiAcaros: true, chairWaterproofing: true, chairWaterproofQty: 4, waterproofingTier: 'essencial' }).calculateServicePrice).toBe(80 + 72);
    expect(pricing({ service: 'chairs', serviceType: 'waterproofing', waterproofingTier: 'essencial', chairQuantity: '4', chairAntiAcaros: true }).calculateServicePrice).toBe(72);
  });
});
