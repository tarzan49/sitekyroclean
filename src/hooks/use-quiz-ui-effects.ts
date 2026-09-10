import { useState, useEffect, useRef, useCallback, useMemo, type RefObject } from 'react';
import type { useToast } from '@/hooks/use-toast';
import { REVIEW_COUNT, REVIEW_RATING } from '@/constants/business';

export type SocialProofCategory = 'whatsapp' | 'call' | 'job' | 'booking' | 'trust';
export interface SocialProofMessage { text: string; category: SocialProofCategory; }

// Volume habitual confirmado pelo responsável; não representa atividade em tempo real.
export function buildSocialProofMessages(_location: string): SocialProofMessage[] {
  return [
    { category: 'whatsapp', text: 'Recebemos habitualmente 50 a 60 pedidos de orçamento por semana' },
    { category: 'trust', text: 'Equipas em Braga, Porto, Lisboa e Algarve' },
    { category: 'trust', text: `Mais de ${REVIEW_COUNT} avaliações no Google · ${REVIEW_RATING} estrelas` },
    { category: 'call', text: 'Resposta em menos de 10 minutos · Orçamento sem compromisso' },
    { category: 'job', text: 'Junte os seus artigos e aproveite a mesma visita' },
  ];
}

interface UseQuizUiEffectsParams {
  isOpen: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
  currentStep: number;
  showUpsell: boolean;
  totalPrice: number;
  packDiscountActive: boolean;
  hasUpsellSobItem: boolean;
  location: string;
  toast: ReturnType<typeof useToast>['toast'];
}

export function useQuizUiEffects({
  isOpen,
  scrollContainerRef,
  currentStep,
  showUpsell,
  totalPrice,
  packDiscountActive,
  hasUpsellSobItem,
  location,
  toast,
}: UseQuizUiEffectsParams) {
  const [displayPrice, setDisplayPrice] = useState(0);
  const [socialProofIdx, setSocialProofIdx] = useState(0);
  const [exitIntentUnlocked, setExitIntentUnlocked] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const prevTotalRef = useRef(0);


  // Animated price counter
  useEffect(() => {
    if (displayPrice === totalPrice) return;
    const timeout = setTimeout(() => {
      const diff = totalPrice - displayPrice;
      const increment = Math.max(1, Math.ceil(Math.abs(diff) / 6));
      setDisplayPrice(prev =>
        diff > 0 ? Math.min(prev + increment, totalPrice) : Math.max(prev - increment, totalPrice)
      );
    }, 35);
    return () => clearTimeout(timeout);
  }, [totalPrice, displayPrice]);


  // Recalcula só quando a localidade muda ou o quiz reabre, não a cada rotação,
  // para os números não "saltarem" enquanto a mesma frase está visível.
  const socialProofMessages = useMemo(() => buildSocialProofMessages(location), [location, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSocialProofIdx(i => (i + 1) % socialProofMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Confetti when pack discount activates (upsell item added acima de 60€)
  useEffect(() => {
    if (packDiscountActive && !prevTotalRef.current) {
      setConfettiActive(true);
      toast({
        title: 'Desconto de 10% ativado!',
        description: 'Ao juntar mais um serviço ao mesmo pedido, aproveita a deslocação e ganha 10% nos serviços tabelados, sem desconto na deslocação.',
        duration: 4000,
      });
      const id = setTimeout(() => setConfettiActive(false), 4500);
      prevTotalRef.current = 1;
      return () => clearTimeout(id);
    }
    if (!packDiscountActive) prevTotalRef.current = 0;
  }, [packDiscountActive, totalPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unlock exit intent popup after 40s on site
  useEffect(() => {
    const id = setTimeout(() => setExitIntentUnlocked(true), 40000);
    return () => clearTimeout(id);
  }, []);

  // Scroll to top on every step/overlay transition
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [currentStep, showUpsell]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetUiEffects = useCallback(() => {
    setSocialProofIdx(0);
    setExitIntentUnlocked(false);
    setConfettiActive(false);
  }, []);

  return {
    displayPrice,
    socialProofIdx,
    socialProofMessages,
    confettiActive,
    exitIntentUnlocked,
    resetUiEffects,
  };
}
