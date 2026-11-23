import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuizPricing } from './use-quiz-pricing';
import { initialFormData } from '@/components/quiz/QuizTypes';

// Dono, 23 Nov 2026: abaixo de 49€, a mais de 20 km de carro de Odivelas = +10€, também no site.
const chairs = (location: string, locationPlace = '', chairQuantity = '1') => renderHook(() => useQuizPricing(
  { ...initialFormData, service: 'chairs', serviceType: 'cleaning', chairQuantity, location, locationPlace }, [], [], [], [],
)).result.current;

describe('questionário: serviço pequeno longe de Odivelas', () => {
  it('soma 10€ em Cascais e Sintra vila', () => {
    const base = chairs('Lisboa');
    expect(chairs('Cascais').totalPrice).toBe(base.totalPrice + 10);
    expect(chairs('Cascais').smallOrderSurchargeCost).toBe(10);
    expect(chairs('Sintra').smallOrderSurchargeCost).toBe(10);
  });
  it('freguesia perto e margem sul ficam sem acréscimo', () => {
    expect(chairs('Sintra', 'Queluz e Belas').smallOrderSurchargeCost).toBe(0);
    expect(chairs('Setúbal').smallOrderSurchargeCost).toBe(0);
  });
  it('a partir de 49€ de serviços não muda', () => {
    expect(chairs('Cascais', '', '4').smallOrderSurchargeCost).toBe(0);
  });
});
