import { useState, useEffect, useRef, useCallback, useMemo, type RefObject } from 'react';
import type { useToast } from '@/hooks/use-toast';
import { locationPrices } from '@/components/quiz';
import { REVIEW_COUNT } from '@/constants/business';

// Reaproveita a tabela real de zonas (locationPrices) como proxy de "tamanho" da
// localidade — zona 0 (10€, núcleo/perto da equipa) = grande, zona intermédia (15€)
// = média, zona mais distante (20€) = pequena. Evita inventar uma classificação de
// população à parte; cidades fora da tabela ("outra") tratam-se como "média".
type CityTier = 'grande' | 'media' | 'pequena';

function getCityTier(location: string): CityTier {
  const price = locationPrices[location];
  if (price === undefined) return 'media';
  if (price <= 10) return 'grande';
  if (price <= 15) return 'media';
  return 'pequena';
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Segunda=1 ... Domingo=7
export function getDaysIntoWeek(): number {
  const day = new Date().getUTCDay(); // 0=Domingo..6=Sábado
  return day === 0 ? 7 : day;
}

// Escala um intervalo de "semana completa" pela fração da semana já decorrida, com
// mínimo de 1 (à segunda-feira o número ainda é pequeno mas nunca zero/embaraçoso;
// ao domingo mostra a semana cheia, refletindo o volume real de 10-15 pedidos/dia).
export function scaledWeekly(fullMin: number, fullMax: number, daysIntoWeek: number): number {
  const frac = daysIntoWeek / 7;
  const min = Math.max(1, Math.round(fullMin * frac));
  const max = Math.max(min + 1, Math.round(fullMax * frac));
  return randInt(min, max);
}

export type SocialProofCategory = 'whatsapp' | 'call' | 'job' | 'booking' | 'trust';

export interface SocialProofMessage {
  text: string;
  category: SocialProofCategory;
}

// Números gerados uma vez por abertura do quiz (não a cada rotação), dentro de um
// intervalo plausível por "tamanho" de localidade — não é uma métrica ao vivo, é o
// mesmo tipo de frase de confiança que já existia no site, só com mais variedade
// e escalada por zona em vez de um valor fixo igual para toda a gente.
export function buildSocialProofMessages(location: string): SocialProofMessage[] {
  const city = location && location !== 'other' ? location : 'Porto';
  const tier = getCityTier(location);
  const ranges: Record<CityTier, { wa: [number, number]; call: [number, number]; job: [number, number] }> = {
    grande: { wa: [8, 16], call: [4, 9], job: [3, 7] },
    media: { wa: [3, 7], call: [2, 4], job: [1, 3] },
    pequena: { wa: [1, 3], call: [1, 2], job: [1, 2] },
  };
  // Intervalos "semana completa" (domingo, semana toda decorrida) por tier, escalados
  // pela fração da semana já passada — reflete o volume real de 10-15 pedidos/dia,
  // evita "esta semana já fizemos 1" soar a negócio parado quando é só segunda-feira.
  const weeklyFullRanges: Record<CityTier, { tapete: [number, number]; cadeira: [number, number] }> = {
    grande: { tapete: [8, 18], cadeira: [3, 9] },
    media: { tapete: [4, 10], cadeira: [2, 5] },
    pequena: { tapete: [2, 6], cadeira: [1, 3] },
  };
  const r = ranges[tier];
  const wr = weeklyFullRanges[tier];
  const daysIntoWeek = getDaysIntoWeek();
  const waCount = randInt(r.wa[0], r.wa[1]);
  const callCount = randInt(r.call[0], r.call[1]);
  const sofaCount = randInt(r.job[0], r.job[1]);
  const colchaoCount = randInt(1, Math.max(1, Math.floor(r.job[1] / 2)));
  const tapeteCount = scaledWeekly(wr.tapete[0], wr.tapete[1], daysIntoWeek);
  const cadeiraCount = scaledWeekly(wr.cadeira[0], wr.cadeira[1], daysIntoWeek);

  return [
    { category: 'whatsapp', text: `Hoje já ${waCount} pessoa${waCount > 1 ? 's' : ''} de ${city} ${waCount > 1 ? 'pediram' : 'pediu'} orçamento via WhatsApp` },
    { category: 'call', text: `Hoje já ${callCount} pessoa${callCount > 1 ? 's' : ''} ${callCount > 1 ? 'ligaram' : 'ligou'} a pedir informações` },
    { category: 'job', text: `Hoje já limpámos ${sofaCount} sofá${sofaCount > 1 ? 's' : ''} e ${colchaoCount} ${colchaoCount > 1 ? 'colchões' : 'colchão'}` },
    { category: 'booking', text: `Alguém de ${city} acabou de reservar, agenda a fechar` },
    { category: 'job', text: `Esta semana já higienizámos ${tapeteCount} tapete${tapeteCount > 1 ? 's' : ''} em ${city} e arredores` },
    { category: 'booking', text: `Agenda quase cheia esta semana em ${city}, garanta já` },
    { category: 'job', text: `Já tratámos ${cadeiraCount} conjunto${cadeiraCount > 1 ? 's' : ''} de cadeiras esta semana` },
    { category: 'trust', text: `Mais de 1100 clientes satisfeitos · Avaliação 5.0 no Google` },
    { category: 'trust', text: `Mais de ${REVIEW_COUNT} avaliações reais no Google, 5.0 estrelas` },
    { category: 'trust', text: `Resposta em menos de 30 minutos, na maioria das vezes bem mais rápido` },
  ];
}

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
        description: 'Ao juntar mais um serviço ao mesmo pedido, aproveita a deslocação e ganha 10% de desconto no total.',
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
