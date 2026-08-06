import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import type { useToast } from '@/hooks/use-toast';

const TIMER_KEY = 'kyro_timer_expiry';
const TIMER_DURATION = 10 * 60; // 10 minutes in seconds

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
  const [countdown, setCountdown] = useState(10 * 60);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [socialProofIdx, setSocialProofIdx] = useState(0);
  const [exitIntentUnlocked, setExitIntentUnlocked] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const prevTotalRef = useRef(0);

  const isDiscountActive = countdown > 0;

  // Countdown timer: persists across closes/refreshes via localStorage
  useEffect(() => {
    if (!isOpen) { setDisplayPrice(0); return; }

    // Read or create expiry timestamp
    const stored = localStorage.getItem(TIMER_KEY);
    const now = Date.now();
    let expiryMs: number;

    if (stored) {
      expiryMs = parseInt(stored, 10);
      if (isNaN(expiryMs) || expiryMs <= now) {
        // Expired, start fresh
        expiryMs = now + TIMER_DURATION * 1000;
        localStorage.setItem(TIMER_KEY, String(expiryMs));
      }
    } else {
      expiryMs = now + TIMER_DURATION * 1000;
      localStorage.setItem(TIMER_KEY, String(expiryMs));
    }

    // Sync state immediately
    setCountdown(Math.max(0, Math.round((expiryMs - Date.now()) / 1000)));

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiryMs - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

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

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const socialProofMessages = [
    `4 pessoas de ${location || 'Porto'} pediram orçamento nas últimas 2 horas`,
    `Alguém de ${location || 'Porto'} acabou de reservar, agenda a fechar`,
    `Agenda quase cheia esta semana em ${location || 'Porto'}, garanta já`,
    `Mais de 1000 clientes satisfeitos · Avaliação 5.0 no Google`,
  ];

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSocialProofIdx(i => (i + 1) % socialProofMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Confetti when pack discount activates (total ≥ 149€ or SOB trigger)
  useEffect(() => {
    if (packDiscountActive && !prevTotalRef.current) {
      setConfettiActive(true);
      const viaSob = totalPrice < 149 && hasUpsellSobItem;
      toast({
        title: 'Desconto de 10% ativado!',
        description: viaSob
          ? 'Ao adicionar um artigo de valor elevado, ativou o desconto de Pack automaticamente.'
          : 'Parabéns! Atingiu 149€ e tem 10% de desconto em todo o pedido.',
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
    countdown,
    displayPrice,
    socialProofIdx,
    socialProofMessages,
    confettiActive,
    exitIntentUnlocked,
    formatCountdown,
    isDiscountActive,
    resetUiEffects,
  };
}
