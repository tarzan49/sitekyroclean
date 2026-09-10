import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useQuizNavigation } from './use-quiz-navigation';
import { initialFormData } from '@/components/quiz/QuizTypes';
import { carpetItemArea } from '@/components/quiz/quizHelpers';
afterEach(cleanup);
it.each(['', '1', 'abcdefghi', '12345678', '1234567890123456', '999999999x'])('rejects invalid phone %s', phone => {
  const { result } = renderHook(() => useQuizNavigation({ formData: { ...initialFormData, name: 'Teste', phone, location: 'Lisboa', service: 'sofa' }, updateFormData: vi.fn(), sofaItems: [{ sizeId: '1-lugar', qty: 1, packEnabled: false }], mattressItems: [], carpetItems: [], totalPrice: 59, initialStep: 4, firstStep: 0, totalSteps: 4, activeUpsellScreen: null, setActiveUpsellScreen: vi.fn(), upsellShown: true, setUpsellShown: vi.fn(), setLocationQuery: vi.fn() }));
  expect(result.current.canProceed()).toBe(false);
});
it.each(['Infinity', '1junk', '0', '-2', '', '1e309'])('rejects invalid carpet dimension %s', largura => {
  expect(carpetItemArea({ id: 'rug', largura, comprimento: '2' })).toBeNull();
});
it('blocks one valid and one incomplete carpet', () => {
  const { result } = renderHook(() => useQuizNavigation({ formData: { ...initialFormData, service: 'carpet' }, updateFormData: vi.fn(), sofaItems: [], mattressItems: [], carpetItems: [{ id: '1', largura: '2', comprimento: '3' }, { id: '2', largura: '1', comprimento: '' }], totalPrice: 10, initialStep: 3, firstStep: 0, totalSteps: 4, activeUpsellScreen: null, setActiveUpsellScreen: vi.fn(), upsellShown: true, setUpsellShown: vi.fn(), setLocationQuery: vi.fn() }));
  expect(result.current.canProceed()).toBe(false);
});
