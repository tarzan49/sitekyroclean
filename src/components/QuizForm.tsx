import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, AlertTriangle, MessageCircle, Phone, CheckCircle2, CalendarClock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackQuizEvent } from '@/lib/quizTracking';
import { useQuizAnalytics } from '@/hooks/use-quiz-analytics';
import ConfettiGold from './quiz/ConfettiGold';
import {
  QuizStep1Service,
  ServiceTypeSelector,
  initialFormData,
  sofaPrices,
  mattressPrices,
} from './quiz';
import type { QuizFormData, SofaItem, MattressItem, CarpetItem, UpsellItemConfig } from './quiz';
import QuizStepLocation from './quiz/steps/QuizStepLocation';
import QuizStepConfig from './quiz/steps/QuizStepConfig';
import QuizComboUpsellScreen from './quiz/steps/QuizComboUpsellScreen';
import QuizChairsAddonUpsell from './quiz/steps/QuizChairsAddonUpsell';
import QuizSofaAddonUpsell from './quiz/steps/QuizSofaAddonUpsell';
import QuizMattressAddonUpsell from './quiz/steps/QuizMattressAddonUpsell';
import QuizStepContact from './quiz/steps/QuizStepContact';
import { calcChairWaterproof, calcChairWaterproofPremium, calcChairClean, carpetItemArea } from './quiz/quizHelpers';
import { WHATSAPP_BASE, BUSINESS_EMAIL } from '@/constants/business';
import { QUIZ_STATE_CHANGE_EVENT } from '@/constants/quiz';
import { useQuizPricing } from '@/hooks/use-quiz-pricing';
import { useQuizUiEffects } from '@/hooks/use-quiz-ui-effects';
import { useQuizSubmission } from '@/hooks/use-quiz-submission';
import { useQuizNavigation } from '@/hooks/use-quiz-navigation';
import type { UpsellScreen } from '@/hooks/use-quiz-navigation';
import type { SocialProofCategory } from '@/hooks/use-quiz-ui-effects';

const SOCIAL_PROOF_ICON: Record<SocialProofCategory, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  call: Phone,
  job: CheckCircle2,
  booking: CalendarClock,
  trust: Star,
};


interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  initialService?: string;
  initialServiceType?: 'cleaning' | 'waterproofing' | 'both';
  initialSofaSizeId?: string;
  initialSofaQty?: number;
  initialSofaItems?: { sizeId: string; qty: number; chaiseLongue?: boolean; packEnabled?: boolean }[];
  initialMattressSizeId?: string;
  initialMattressQty?: number;
  initialMattressItems?: { sizeId: string; qty: number; packEnabled?: boolean }[];
  initialChairQty?: string;
  initialChairWaterproofing?: boolean;
  initialCarpetArea?: string;
  initialCarpetItems?: CarpetItem[];
  initialWaterproofingTier?: 'essencial' | 'premium';
  problema?: string;
  skipToUpsell?: boolean;
  initialUpsellItems?: UpsellItemConfig[];
}

function calcInitialStep(loc?: string, svc?: string, hasItem?: boolean, skipUpsell?: boolean, hasSvcType?: boolean): number {
  // Step 3, nunca 4: os ecrãs de upsell dedicados por serviço (chairs/sofa/
  // mattress) só renderizam quando currentStep === 3 (ver JSX mais abaixo) —
  // o combo não tem essa restrição, mas também funciona bem em 3 (a barra de
  // progresso fica a 75% em vez de 100%, condizente com "ainda falta o
  // contacto"). Antes ficava preso sempre no combo, saltando o upsell
  // dedicado por serviço (pedido explícito 2026-09-08).
  if (skipUpsell && loc) return 3;
  if (!loc) return 0;
  if (!svc) return 1;
  if (hasItem) return 3;
  // Skip serviceType selector when already known or service doesn't need it
  // (só o tapete não tem essa escolha — sofá, colchão e cadeiras têm todos
  // Higienização vs Impermeabilização/Anti Ácaros, ver shouldSkipServiceType).
  const skipType = svc === 'carpet' || svc === 'mattress' || hasSvcType;
  return skipType ? 3 : 2;
}

// Ecrã de upsell inicial ao entrar já "a saltar" para a fase de upsell
// (skipToUpsell, usado pelo widget de preços): mostra primeiro o ecrã
// dedicado do serviço escolhido (mesma regra usada em handleNext para o
// fluxo passo-a-passo normal), e só cai no combo quando esse serviço não tem
// upsell dedicado (tapete) ou o tipo não qualifica (ex. colchão em
// impermeabilização, que não tem "Higienização" como addon).
function calcInitialUpsellScreen(svc?: string, svcType?: string): UpsellScreen {
  if (svc === 'chairs' && (svcType === 'cleaning' || svcType === 'waterproofing')) return 'chairs';
  if (svc === 'sofa' && (svcType === 'cleaning' || svcType === 'waterproofing')) return 'sofa';
  if (svc === 'mattress' && svcType === 'cleaning') return 'mattress';
  return 'combo';
}

const QuizForm = ({
  isOpen, onClose, initialLocation, initialService, problema,
  initialServiceType, initialSofaSizeId, initialSofaQty, initialSofaItems,
  initialMattressSizeId, initialMattressQty, initialMattressItems, initialChairQty, initialChairWaterproofing, initialCarpetArea, initialCarpetItems,
  initialWaterproofingTier, skipToUpsell, initialUpsellItems,
}: QuizFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasInitialItem = Boolean(
    initialSofaItems?.some(i => i.qty > 0) || initialSofaSizeId ||
    initialMattressItems?.some(i => i.qty > 0) || initialMattressSizeId ||
    initialChairQty || initialCarpetArea || initialCarpetItems?.length
  );

  // Builders for the pre-filled state when the quiz is opened directly from
  // a price-table row (jump straight to step 3 with the item already configured).
  const buildInitialFormData = (): QuizFormData => ({
    ...initialFormData,
    location: initialLocation || '',
    service: initialService || '',
    serviceType: initialServiceType
      || ((initialService && initialService !== 'sofa' && initialService !== 'chairs') ? 'cleaning' : ''),
    carpetArea: initialCarpetArea || '',
    chairQuantity: initialChairQty || '',
    chairType: initialChairQty ? 'bulk_full' : '',
    waterproofingTier: initialWaterproofingTier || 'premium',
    chairWaterproofing: initialChairWaterproofing ?? false,
    chairWaterproofQty: initialChairWaterproofing && initialChairQty ? parseInt(initialChairQty) || 0 : 0,
  });
  const buildInitialSofaItems = (): SofaItem[] => {
    if (initialSofaItems?.length) {
      return initialSofaItems
        .filter(i => i.qty > 0)
        .map(i => ({ sizeId: i.sizeId, qty: i.qty, packEnabled: i.packEnabled ?? false, chaiseLongue: i.chaiseLongue }));
    }
    return initialSofaSizeId ? [{ sizeId: initialSofaSizeId, qty: initialSofaQty ?? 1, packEnabled: false }] : [];
  };
  const buildInitialMattressItems = (): MattressItem[] => {
    if (initialMattressItems?.length) {
      return initialMattressItems
        .filter(i => i.qty > 0)
        .map(i => ({ sizeId: i.sizeId, qty: i.qty, packEnabled: i.packEnabled ?? false }));
    }
    return initialMattressSizeId ? [{ sizeId: initialMattressSizeId, qty: initialMattressQty ?? 1, packEnabled: false }] : [];
  };
  // Simulador de tapetes (2026-09-06) guarda largura/comprimento por peça —
  // se vier de um widget de preços que já mediu tapetes (initialCarpetItems),
  // arranca com essas peças; senão (ou se vier só initialCarpetArea, um widget
  // mais antigo que só pedia a área somada, impossível de converter num par
  // largura×comprimento) arranca com uma linha em branco.
  const buildInitialCarpetItems = (): CarpetItem[] =>
    initialCarpetItems && initialCarpetItems.length > 0
      ? initialCarpetItems.map((it, i) => ({ ...it, id: it.id || `tapete-${i + 1}` }))
      : [{ id: 'tapete-1', largura: '', comprimento: '' }];

  const currentStepInitial = calcInitialStep(initialLocation, initialService, hasInitialItem, skipToUpsell, !!initialServiceType);
  const [locationQuery, setLocationQuery] = useState('');
  const [hypoallergenic, setHypoallergenic] = useState<boolean | null>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentFired, setExitIntentFired] = useState(false);
  const startsAtUpsell = Boolean(skipToUpsell && initialLocation);
  // Upsell "estilo companhia aérea" (2026-09-06, uniformizado 2026-09-08): para
  // cadeiras/sofá/colchão + limpeza, a decisão de proteção/Anti Ácaros sai da
  // etapa de quantidades e passa para um ecrã dedicado logo a seguir ao
  // "Continuar" — nunca compete visualmente com a escolha de quantidade.
  // Mostra-se sempre que se avança de step3 (sem flag "só uma vez por sessão":
  // voltar às quantidades e avançar de novo tem de mostrar este ecrã outra
  // vez, nunca saltar direto para o Pack Família — bug real reportado).
  //
  // Estas 4 telas de upsell são sempre mutuamente exclusivas (nunca duas ao
  // mesmo tempo) — antes eram 4 booleans independentes (showUpsell,
  // showChairsAddonUpsell, showSofaAddonUpsell, showMattressAddonUpsell) que
  // tinham de ser mantidos sincronizados à mão em cada sítio que os lia ou
  // escrevia; já causou bugs reais nesta sessão (flags a ficarem presas a
  // true, ecrãs a aparecerem ao mesmo tempo). Union type em vez disso — por
  // construção, só pode haver um ativo, não há "dois flags em desacordo"
  // possível (audit de código 2026-09-08, thinning do QuizForm.tsx). Tipo
  // partilhado com useQuizNavigation, que também lê/escreve este estado.
  const [activeUpsellScreen, setActiveUpsellScreen] = useState<UpsellScreen>(startsAtUpsell ? calcInitialUpsellScreen(initialService, initialServiceType) : null);
  const [upsellShown, setUpsellShown] = useState(startsAtUpsell);
  const [upsellItems, setUpsellItems] = useState<UpsellItemConfig[]>(initialUpsellItems ?? []);
  const [sofaItems, setSofaItems] = useState<SofaItem[]>(buildInitialSofaItems);
  const [mattressItems, setMattressItems] = useState<MattressItem[]>(buildInitialMattressItems);
  const [carpetItems, setCarpetItems] = useState<CarpetItem[]>(buildInitialCarpetItems);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<QuizFormData>(buildInitialFormData);
  const prevIsOpenRef = useRef(false);

  const totalSteps = 4;

  // ── LOCK BODY SCROLL WHILE QUIZ IS OPEN ───────────────────────────────────
  // Prevents iOS Safari from scrolling the page when an input inside the modal
  // is focused, which would cause position:fixed elements to shift off-screen.
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // ── KEYBOARD-AWARE SCROLL PADDING ─────────────────────────────────────────
  // When iOS keyboard opens, adds padding-bottom to the scroll container so
  // inputs can be scrolled above the keyboard. The card stays full-height
  // (no height shrinking) to avoid transparent gaps showing the hero behind.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const sc = scrollContainerRef.current;
      if (!sc) return;
      const isMobile = window.innerWidth < 640;
      if (!isMobile) { sc.style.paddingBottom = ''; return; }
      const kbHeight = window.innerHeight - vv.height - vv.offsetTop;
      sc.style.paddingBottom = kbHeight > 50 ? `${kbHeight}px` : '';
    };
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
      if (scrollContainerRef.current) scrollContainerRef.current.style.paddingBottom = '';
    };
  }, []);

  const hypoSurcharge = 0;

  const {
    calculateServicePrice,
    travelCost,
    finalTravelCost,
    totalPrice,
    hasSobOrcamento,
    hasUpsellSobItem,
    packDiscountActive,
    packDiscountPct,
    serviceOnlyTotal,
    discountedPrice,
    packDiscountedPrice,
  } = useQuizPricing(formData, sofaItems, mattressItems, upsellItems, carpetItems);

  const updateFormData = useCallback((updates: Partial<QuizFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // useQuizNavigation precisa de vir ANTES de useQuizUiEffects/useQuizAnalytics
  // e dos efeitos abaixo que leem currentStep — caso contrário currentStep
  // seria lido antes de ser declarado (TDZ: "Cannot access before
  // initialization" ao renderizar), já que era este próprio hook que o
  // definia mais abaixo no ficheiro antes desta correção.
  const firstStep = calcInitialStep(initialLocation, initialService, hasInitialItem);

  const {
    currentStep,
    setCurrentStep,
    canProceed,
    proceedPastConfig,
    handleNext,
    handlePrev,
  } = useQuizNavigation({
    formData,
    updateFormData,
    sofaItems,
    mattressItems,
    carpetItems,
    totalPrice,
    initialStep: currentStepInitial,
    firstStep,
    totalSteps,
    activeUpsellScreen,
    setActiveUpsellScreen,
    upsellShown,
    setUpsellShown,
    setLocationQuery,
  });

  const {
    countdown,
    displayPrice,
    socialProofIdx,
    socialProofMessages,
    confettiActive,
    exitIntentUnlocked,
    formatCountdown,
    isDiscountActive,
    resetUiEffects,
  } = useQuizUiEffects({
    isOpen,
    scrollContainerRef,
    currentStep,
    showUpsell: activeUpsellScreen === 'combo',
    totalPrice,
    packDiscountActive,
    hasUpsellSobItem,
    location: formData.location,
    toast,
  });

  // Quiz analytics tracking
  const { trackSubmission } = useQuizAnalytics({
    isOpen,
    currentStep,
    totalSteps,
    service: formData.service,
    serviceType: formData.serviceType,
    location: formData.location === 'other' ? formData.otherLocation : formData.location,
    timing: formData.timing,
    contactMethod: formData.contactMethod,
    totalValue: totalPrice,
  });

  // Track quiz start
  useEffect(() => {
    if (isOpen) {
      trackQuizEvent({ step: 0, action: 'start' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Re-apply the initial* props whenever the quiz transitions closed → open.
  // Needed because the component stays mounted between opens, so a single
  // QuizForm instance can be re-launched with a different price-table item.
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setFormData(buildInitialFormData());
      setSofaItems(buildInitialSofaItems());
      setMattressItems(buildInitialMattressItems());
      setCarpetItems(buildInitialCarpetItems());
      const atUpsell = Boolean(skipToUpsell && initialLocation);
      // Sem isto, reabrir o quiz depois de ter chegado a um destes upsells
      // dedicados numa sessão anterior deixava a tela presa aberta — o passo
      // inicial recalculado (ex: Localização) e o upsell antigo renderizavam
      // ambos ao mesmo tempo (bug real reportado).
      setActiveUpsellScreen(atUpsell ? calcInitialUpsellScreen(initialService, initialServiceType) : null);
      setUpsellShown(atUpsell);
      setUpsellItems(initialUpsellItems ?? []);
      setCurrentStep(calcInitialStep(initialLocation, initialService, hasInitialItem, skipToUpsell, !!initialServiceType));
    }
    prevIsOpenRef.current = isOpen;
  });

  // skipToUpsell + no location: after user picks city at step 0, jump straight to upsell
  useEffect(() => {
    if (skipToUpsell && formData.location && currentStep === 0) {
      setCurrentStep(3);
      setActiveUpsellScreen(calcInitialUpsellScreen(initialService, initialServiceType));
      setUpsellShown(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.location]);

  // Notify other components of quiz open/close state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(QUIZ_STATE_CHANGE_EVENT, { detail: { isOpen } }));
  }, [isOpen]);

  // Exit intent: warn before page unload
  useEffect(() => {
    if (!isOpen) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen]);

  const getServiceLabel = () => {
    const labels: Record<string, string> = {
      sofa: 'Sofá',
      carpet: 'Tapete',
      mattress: 'Colchão',
      chairs: 'Cadeiras',
    };
    return labels[formData.service] || formData.service;
  };

  const getServiceTypeLabel = () => {
    if (formData.serviceType === 'waterproofing') {
      if (formData.service === 'mattress') return 'Anti Ácaros';
      return formData.waterproofingTier === 'premium' ? 'Impermeabilização Premium' : 'Impermeabilização Essencial';
    }
    const labels: Record<string, string> = {
      cleaning: 'Higienização Profunda',
      both: formData.service === 'mattress' ? 'Pack: Limpeza + Anti Ácaros' : 'Pack Proteção Total',
    };
    return labels[formData.serviceType] || '';
  };

  // "Sob orçamento" for null (invalid/out-of-table), otherwise "X€" or "X,YZ€".
  const fmtEuro = (n: number | null) => (n === null ? 'Sob orçamento' : n % 1 === 0 ? `${n}€` : `${n.toFixed(2).replace('.', ',')}€`);

  const buildDetailsSummary = () => {
    const details = [];

    switch (formData.service) {
      case 'sofa': {
        const isWaterproofBase = formData.serviceType === 'waterproofing';
        const isPremiumTier = formData.waterproofingTier === 'premium';
        const sofaLines = sofaItems
          .filter(i => i.qty > 0)
          .map(i => {
            const opt = sofaPrices.find(p => p.id === i.sizeId);
            if (!opt) return null;
            const baseP = isWaterproofBase
              ? (isPremiumTier
                  ? (typeof opt.waterproofingPremiumPrice === 'number' ? opt.waterproofingPremiumPrice : null)
                  : (typeof opt.waterproofingPrice === 'number' ? opt.waterproofingPrice : null))
              : (typeof opt.cleaningPrice === 'number' ? opt.cleaningPrice : null);
            // Pack Premium = pack Essencial + a mesma diferença já aprovada entre
            // Essencial e Premium standalone (ver quizHelpers.ts calcPackPricing).
            const tierDelta = isPremiumTier && typeof opt.waterproofingPremiumPrice === 'number' && typeof opt.waterproofingPrice === 'number'
              ? opt.waterproofingPremiumPrice - opt.waterproofingPrice : 0;
            const bothEssencial = typeof opt.bothPrice === 'number' ? opt.bothPrice : (baseP !== null ? baseP + 40 : null);
            const bothP = bothEssencial !== null ? bothEssencial + tierDelta : null;
            const unitPrice = i.packEnabled ? bothP : baseP;
            const lineTotal = unitPrice !== null ? unitPrice * i.qty : null;
            const tierTag = i.packEnabled
              ? (isPremiumTier ? ' + Proteção 10 anos' : ' + Proteção 2 anos')
              : (isWaterproofBase ? (isPremiumTier ? ' (Premium)' : ' (Essencial)') : '');
            return `${i.qty}x Sofá ${opt.label}${tierTag}: ${fmtEuro(lineTotal)}`;
          })
          .filter(Boolean) as string[];
        if (sofaLines.length > 0) details.push(...sofaLines);
        break;
      }
      case 'carpet': {
        const validCarpets = carpetItems.map(carpetItemArea).filter((a): a is number => a !== null);
        if (validCarpets.length > 0) {
          const areasLabel = validCarpets.map(a => `${a % 1 === 0 ? a : a.toFixed(2).replace('.', ',')}m²`).join(', ');
          details.push(`Tapete(s) ${areasLabel}: Sob Orçamento`);
        }
        break;
      }
      case 'mattress': {
        const isWaterproofBase = formData.serviceType === 'waterproofing';
        const mattressLines = mattressItems
          .filter(i => i.qty > 0)
          .map(i => {
            const opt = mattressPrices.find(p => p.id === i.sizeId);
            if (!opt) return null;
            const baseP = isWaterproofBase
              ? (typeof opt.waterproofingPrice === 'number' ? opt.waterproofingPrice : null)
              : (typeof opt.cleaningPrice === 'number' ? opt.cleaningPrice : null);
            const bothP = typeof opt.bothPrice === 'number' ? opt.bothPrice : (baseP !== null ? baseP + 30 : null);
            const unitPrice = i.packEnabled ? bothP : baseP;
            const lineTotal = unitPrice !== null ? unitPrice * i.qty : null;
            const tierTag = i.packEnabled ? ' + Anti Ácaros' : (isWaterproofBase ? ' (Anti Ácaros)' : '');
            return `${i.qty}x Colchão ${opt.label}${tierTag}: ${fmtEuro(lineTotal)}`;
          })
          .filter(Boolean) as string[];
        if (mattressLines.length > 0) details.push(...mattressLines);
        break;
      }
      case 'chairs':
        if (formData.chairQuantity) {
          const qty = parseInt(formData.chairQuantity);
          const isWaterproofPrimary = formData.serviceType === 'waterproofing';
          // Tier real do formulário, não limitada ao caso "impermeabilização
          // primária" — sem isto, o addon Premium (limpeza como serviço
          // principal) aparecia sempre rotulado "Essencial" na mensagem.
          const isPremiumTier = formData.waterproofingTier === 'premium';
          const calcWaterproof = isPremiumTier ? calcChairWaterproofPremium : calcChairWaterproof;
          const primaryTotal = !isNaN(qty) && qty > 0 ? (isWaterproofPrimary ? calcWaterproof(qty) : calcChairClean(qty)) : null;
          const primaryLabel = isWaterproofPrimary ? `Impermeabilização${isPremiumTier ? ' Premium' : ' Essencial'}` : 'Limpeza';
          details.push(`${formData.chairQuantity} cadeira(s): ${primaryLabel}: ${fmtEuro(primaryTotal)}`);
          const wQty = formData.chairWaterproofQty;
          if (wQty > 0) {
            const addonTotal = isWaterproofPrimary ? calcChairClean(wQty) : calcWaterproof(wQty);
            const addonLabel = isWaterproofPrimary ? 'Limpeza' : `Impermeabilização${isPremiumTier ? ' Premium' : ' Essencial'}`;
            details.push(`${addonLabel} de ${wQty} cadeira(s): ${fmtEuro(addonTotal)}`);
          }
          if (formData.chairAntiAcaros && !isNaN(qty) && qty > 0) {
            details.push(`Anti Ácaros de ${qty} cadeira(s): ${fmtEuro(qty * 5)}`);
          }
        }
        break;
    }

    if (upsellItems.length > 0) {
      // item.label já vem pronto do QuizComboUpsellScreen (ex. "1x Colchão Casal
      // + Impermeabilização") — usar diretamente em vez de reconstruir a partir
      // de item.id, que para itens com tamanho (mattress-casal, sofa-2-lugares)
      // não batia com nenhuma chave do mapa antigo e mostrava o id em bruto.
      const upsellParts = upsellItems.map(item => `+${item.label}: ${fmtEuro(item.price > 0 ? item.price : null)}`);
      details.push(`Upsell: ${upsellParts.join(', ')}`);
    }

    return details.join(' | ');
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    const finalLocation = formData.location === 'other' ? formData.otherLocation : formData.location;
    const serviceLabel = getServiceLabel();
    const serviceTypeLabel = getServiceTypeLabel();
    const detailsSummary = buildDetailsSummary();

    const crmServiceLabel = upsellItems.length > 0
      ? `${serviceLabel}, ${upsellItems.map(i => i.label ?? i.id).join(', ')}`
      : serviceLabel;
    const packPctLabel = packDiscountPct > 0 ? `Pack -${Math.round(packDiscountPct * 100)}%` : '';
    // Quando o serviço principal ou algum upsell não tem preço fechado
    // (sofá 4+ lugares, tapete >15m², etc.), o valor deixava de mostrar a
    // deslocação e os itens com preço real que também fazem parte do
    // mesmo pedido — decompor em vez de colapsar tudo para "Sob orçamento"
    // (pedido do dono: ex. colchão com preço fechado + sofá sob orçamento
    // deve aparecer como "10€ deslocação + 69€ Colchão + Sob orçamento").
    const buildMixedPriceBreakdown = () => {
      const parts: string[] = [];
      if (finalTravelCost > 0) parts.push(`${finalTravelCost}€ deslocação`);
      if (!hasSobOrcamento && calculateServicePrice > 0) parts.push(`${calculateServicePrice}€ ${serviceLabel}`);
      upsellItems.forEach(item => {
        if (item.price > 0) parts.push(`${item.price}€ ${item.label ?? item.id}`);
      });
      parts.push('Sob orçamento');
      return parts.join(' + ');
    };
    const priceText = (hasSobOrcamento || hasUpsellSobItem)
      ? buildMixedPriceBreakdown()
      : packDiscountActive && totalPrice > 0
        ? `${packDiscountedPrice}€ (${packPctLabel})`
        : totalPrice > 0 ? `${totalPrice}€` : 'Sob orçamento';

    const message = `
[QUIZ RÁPIDO - Kyro Clean Solutions]

Serviço: ${serviceLabel}
Tipo: ${serviceTypeLabel}
Detalhes: ${detailsSummary}
Localização: ${finalLocation}
Deslocação: ${finalTravelCost}€
VALOR TOTAL: ${priceText}
Contacto preferido: WhatsApp${formData.email ? `\nEmail: ${formData.email}` : ''}

Observações:
${formData.description || 'Sem observações adicionais'}
    `.trim();

    trackQuizEvent({
      step: 4,
      action: 'complete',
      service: formData.service ?? undefined,
      city: finalLocation ?? undefined,
      value: totalPrice > 0 ? totalPrice : undefined,
      service_type: formData.serviceType ?? undefined,
    });

    const { success } = await submit({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      photos: formData.photos,
      finalLocation,
      service: formData.service,
      serviceType: formData.serviceType,
      waterproofingTier: formData.waterproofingTier,
      serviceLabel,
      serviceTypeLabel,
      crmServiceLabel,
      detailsSummary,
      priceText,
      message,
      sofaItems,
      mattressItems,
      upsellItems,
      carpetItems,
      chairQuantity: formData.chairQuantity,
      chairWaterproofQty: formData.chairWaterproofQty,
      chairAntiAcaros: formData.chairAntiAcaros,
      calculateServicePrice,
      totalPrice,
      hasSobOrcamento,
      hasUpsellSobItem,
      packDiscountActive,
      packDiscountedPrice,
      packDiscountPct,
      finalTravelCost,
      hypoallergenic,
      hypoSurcharge,
      slotLabel: formatSelectedSlot(formData.selectedSlot),
    });

    if (!success) {
      const whatsappMessage = encodeURIComponent(
        `Olá! Tentei pedir orçamento pelo site mas houve um erro.\n\n` +
        `Nome: ${formData.name}\n` +
        `Tel: ${formData.phone}\n` +
        `Serviço: ${serviceLabel} - ${serviceTypeLabel}\n` +
        `Detalhes: ${detailsSummary}\n` +
        `Local: ${finalLocation}\n` +
        `Valor: ${priceText}\n\n` +
        `${formData.description || ''}`
      );

      toast({
        title: "Pedido registado",
        description: (
          <div className="space-y-2">
            <p>Para garantir resposta rápida, envie também por:</p>
            <div className="flex gap-2 mt-2">
              <a
                href={`${WHATSAPP_BASE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${BUSINESS_EMAIL}?subject=Pedido%20Orçamento&body=${whatsappMessage}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Email
              </a>
            </div>
          </div>
        ),
        variant: 'default',
        duration: 15000,
      });
    }
  };


  const formatSelectedSlot = (slot: string) => {
    if (!slot) return 'Não especificado';
    const [dayIdx, timeIdx] = slot.split('-').map(Number);
    const today = new Date();
    const d = new Date(today);
    d.setDate(today.getDate() + dayIdx);
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const times = ['09:00', '14:00', '17:00'];
    return `${dayNames[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1} às ${times[timeIdx] ?? ''}`;
  };

  const resetForm = () => {
    setFormData(buildInitialFormData());
    setCurrentStep(calcInitialStep(initialLocation, initialService, hasInitialItem));
    setLocationQuery('');
    setHypoallergenic(null);
    setShowExitIntent(false);
    setExitIntentFired(false);
    setActiveUpsellScreen(null);
    setUpsellShown(false);
    setUpsellItems([]);
    setSofaItems(buildInitialSofaItems());
    setMattressItems(buildInitialMattressItems());
    setCarpetItems(buildInitialCarpetItems());
    resetUiEffects();
  };

  const { isSubmitting, submit } = useQuizSubmission({ trackSubmission, resetForm, onClose, navigate });

  const handleClose = () => {
    if (exitIntentUnlocked && !exitIntentFired && currentStep > 0) {
      setShowExitIntent(true);
      setExitIntentFired(true);
      return;
    }
    onClose();
    try {
      resetForm();
    } catch (err) {
      console.warn('resetForm failed on close', err);
    }
  };

  const confirmClose = () => {
    if (currentStep > 0) {
      trackQuizEvent({
        step: currentStep,
        action: 'abandon',
        service: formData.service ?? undefined,
        city: formData.location === 'other' ? formData.otherLocation ?? undefined : formData.location ?? undefined,
        value: totalPrice > 0 ? totalPrice : undefined,
      });
    }
    onClose();
    try {
      resetForm();
    } catch (err) {
      console.warn('resetForm failed on close', err);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] sm:flex sm:items-center sm:justify-center sm:backdrop-blur-lg sm:p-4" style={{ background: "rgba(5,21,16,0.82)" }} role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <div
        className={cn(
          "relative w-full sm:max-w-lg sm:rounded-sm shadow-[0_8px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] sm:border border-white/[0.18] overflow-hidden animate-scale-in flex flex-col sm:gpu-accelerated bg-checker-modal",
          "h-full sm:h-auto sm:max-h-[92dvh]"
        )}>

        <ConfettiGold active={confettiActive} />

        {/* Header */}
        <div className="px-5 sm:px-6 pt-3 sm:pt-4 pb-2.5 sm:pb-3 landscape:pt-2 landscape:pb-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 flex-shrink-0">
          <div id="quiz-title" className="flex items-center gap-2">
            <span className="font-playfair text-[14px] font-bold text-white/90 leading-none">Kyro</span>
            <span className="h-3 w-px bg-white/20 flex-shrink-0" />
            <span className="text-[9px] font-bold tracking-[0.22em] uppercase text-gold/65">Orçamento</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {currentStep >= 1 && Array.from({ length: totalSteps }, (_, i) => {
              const stepNum = i + 1;
              return (
                <div
                  key={i}
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    currentStep > stepNum
                      ? "w-4 h-[3px] bg-gold/50"
                      : currentStep === stepNum
                      ? "w-5 h-[3px] bg-gold"
                      : "w-[5px] h-[5px] bg-white/15"
                  )}
                />
              );
            })}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="w-11 h-11 flex items-center justify-center hover:bg-white/10 active:bg-white/20 rounded-full transition-colors touch-manipulation"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>

        {/* Gold progress bar */}
        <div className="h-[4px] bg-white/[0.04] flex-shrink-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold/60 via-gold to-[#d4c57b] transition-all duration-500 ease-out"
            style={{ width: `${((currentStep === 0 ? 0.5 : currentStep) / totalSteps) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
          />
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex flex-col overflow-x-hidden flex-1 quiz-scrollbar px-4 sm:px-6",
            "min-h-[200px] sm:min-h-[380px] landscape:min-h-[120px] overflow-y-auto pb-2"
          )}
        >

          {/* Animated price ticker
             , hidden: step 2 (treatment selector, sem qtds)
             , visível: step 3 (quantidades) e step 4 (contacto) quando totalPrice > 0
             , também visível em step 1 quando há custo de deslocação */}
          {(totalPrice > 0 || hasSobOrcamento) && (activeUpsellScreen === 'combo' || finalTravelCost > 0 || (currentStep !== 1 && currentStep !== 2)) && (
            <div className="sticky top-0 z-20 text-white flex flex-col border-b border-white/[0.16] -mx-5 sm:-mx-6 animate-fade-in" style={{ background: "#071a12" }}>
            <div className="flex items-center justify-between py-3 px-5 sm:px-6">
              <span className="text-xs text-white/40 font-medium">
                {calculateServicePrice === 0 && finalTravelCost > 0
                  ? <span>Deslocação <span className="text-white/20 text-[10px]">({formData.location})</span></span>
                  : 'Estimativa'
                }
              </span>
              <div className="flex items-center gap-3 pr-8">
                {packDiscountActive && totalPrice > 0 && (
                  <span className="text-sm text-white/25 line-through tabular-nums">{Math.round(displayPrice)}€</span>
                )}
                {totalPrice > 0 && (
                  <span className="text-xl font-bold tabular-nums" style={{ color: '#D4AF37' }}>
                    {packDiscountActive
                      ? `${Math.round((displayPrice - finalTravelCost) * 0.9 + finalTravelCost)}€`
                      : `${Math.round(displayPrice)}€`}
                  </span>
                )}
                {(hasSobOrcamento || hasUpsellSobItem) && (
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#D4AF37' }}>
                    {totalPrice > 0 ? '+ Sob Orçamento' : 'Sob Orçamento'}
                  </span>
                )}
                {packDiscountActive && totalPrice > 0 && (
                  <span className="text-[10px] font-bold bg-gold/15 text-gold px-2 py-0.5 rounded-full">
                    −10% Pack
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 px-5 py-2" style={{ borderTop: "1px solid rgba(212,175,55,0.14)", background: "rgba(212,175,55,0.04)" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#D4AF37" }} />
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.62)", fontFamily: "Inter, system-ui, sans-serif" }}>
                <span className="font-semibold">Alta procura</span>
                {' · Confirme agora para garantir disponibilidade'}
              </p>
            </div>
            </div>
          )}

          <div className="flex flex-col py-3 sm:py-5 w-full items-center text-center">

            {/* Step 0, Location Autocomplete VIP */}
            {/* Context banner when quiz opened from a problem page */}
            {problema && (
              <div className="w-full max-w-sm mx-auto mb-4 bg-gold/10 border border-gold/30 rounded-sm px-4 py-3 text-center">
                <p className="text-gold text-xs font-bold mb-0.5">Detectámos o seu problema</p>
                <p className="text-white/70 text-xs leading-relaxed">
                  Vamos encontrar a melhor solução para <span className="text-white font-semibold">{problema.replace(/-/g, ' ')}</span>.
                </p>
              </div>
            )}

            {currentStep === 0 && (
              <QuizStepLocation
                location={formData.location}
                locationQuery={locationQuery}
                setLocationQuery={setLocationQuery}
                scrollContainerRef={scrollContainerRef}
                onCitySelect={(city) => {
                  updateFormData({ location: city });
                  if (skipToUpsell) {
                    setCurrentStep(3);
                    setActiveUpsellScreen(calcInitialUpsellScreen(initialService, initialServiceType));
                    setUpsellShown(true);
                  } else {
                    setCurrentStep(calcInitialStep(city, initialService, hasInitialItem, false, !!initialServiceType));
                  }
                }}
              />
            )}

            {/* Step 1, Service Selector */}
            {currentStep === 1 && (
              <div className="w-full flex flex-col items-center">
                <QuizStep1Service
                  selectedService={formData.service}
                  onSelect={(service) => {
                    // Colchão volta a saltar o Passo 2 (2026-09-08): Anti Ácaros não
                    // existe como serviço primário, só como upsell dependente de uma
                    // limpeza — ver shouldSkipServiceType acima para mais contexto.
                    const skipServiceType = service === 'carpet' || service === 'mattress';
                    updateFormData({ service, serviceType: skipServiceType ? 'cleaning' : '', sofaSize: '', mattressSize: '', chairType: '', carpetArea: '', chairWaterproofing: false, chairWaterproofQty: 0, chairAntiAcaros: false });
                    setSofaItems([]);
                    setMattressItems([]);
                    setCarpetItems(buildInitialCarpetItems());
                    setUpsellItems([]);
                    setUpsellShown(false);
                    setTimeout(() => setCurrentStep(skipServiceType ? 3 : 2), 180);
                  }}
                />
              </div>
            )}

            {/* Step 2 - Service Type */}
            {currentStep === 2 && (() => {
              const cleanPrice = formData.service === 'mattress' ? (mattressPrices[0].cleaningPrice as number)
                : formData.service === 'chairs' ? undefined
                : (sofaPrices[0].cleaningPrice as number);
              const waterPrice = formData.service === 'sofa' ? (sofaPrices[0].waterproofingPrice as number)
                : formData.service === 'mattress' ? (mattressPrices[0].waterproofingPrice as number)
                : undefined;
              // No Pack card on step 2, upsell is inline per-item in step 3
              const packPrice = undefined;
              const waterDesc = formData.service === 'mattress'
                ? 'Elimina ácaros e alergénios em profundidade.'
                : undefined;
              const waterTitle = formData.service === 'mattress' ? 'Anti Ácaros' : undefined;
              const waterSubtitle = formData.service === 'mattress' ? 'Tratamento Anti-Ácaros' : undefined;
              const bothDescText = formData.service === 'mattress' ? 'Limpeza Profunda + Anti Ácaros' : undefined;
              return (
                <div className="flex-1 flex flex-col gap-4 w-full max-w-sm self-center items-center text-center">
                  <div>
                    <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1">O QUE PRECISA?</p>
                    <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">
                      Escolha o seu tratamento
                    </h2>
                  </div>
                  <ServiceTypeSelector
                    selectedType={formData.serviceType}
                    onSelect={(type) => {
                      updateFormData({ serviceType: type });
                      if (formData.service === 'mattress') setMattressItems([]);
                      if (formData.service === 'sofa') setSofaItems([]);
                      setTimeout(() => setCurrentStep(3), 180);
                    }}
                    cleaningPrice={cleanPrice}
                    waterproofingPrice={waterPrice}
                    packPrice={packPrice}
                    waterproofingDesc={waterDesc}
                    {...(waterTitle ? { waterproofingTitle: waterTitle } : {})}
                    {...(waterSubtitle ? { waterproofingSubtitle: waterSubtitle } : {})}
                    {...(bothDescText ? { bothDesc: bothDescText } : {})}
                  />
                </div>
              );
            })()}

            {/* Step 3 - Config (hidden enquanto o Pack Família ou um upsell dedicado por serviço está ativo) */}
            {currentStep === 3 && activeUpsellScreen === null && (
              <div className="flex-1 flex flex-col w-full items-center text-center overflow-y-auto">
                <QuizStepConfig
                  formData={formData}
                  updateFormData={updateFormData}
                  sofaItems={sofaItems}
                  setSofaItems={setSofaItems}
                  mattressItems={mattressItems}
                  setMattressItems={setMattressItems}
                  carpetItems={carpetItems}
                  setCarpetItems={setCarpetItems}
                />
              </div>
            )}

            {/* Upsells "estilo companhia aérea", um por serviço: logo a seguir
                ao "Continuar" da etapa de quantidades. */}
            {currentStep === 3 && activeUpsellScreen === 'chairs' && (
              <div className="flex-1 flex flex-col w-full items-center text-center overflow-y-auto">
                <QuizChairsAddonUpsell
                  formData={formData}
                  updateFormData={updateFormData}
                  onContinue={() => {
                    (document.activeElement as HTMLElement)?.blur();
                    proceedPastConfig();
                  }}
                  onBack={() => { (document.activeElement as HTMLElement)?.blur(); setActiveUpsellScreen(null); }}
                />
              </div>
            )}

            {currentStep === 3 && activeUpsellScreen === 'sofa' && (
              <div className="flex-1 flex flex-col w-full items-center text-center overflow-y-auto">
                <QuizSofaAddonUpsell
                  formData={formData}
                  updateFormData={updateFormData}
                  sofaItems={sofaItems}
                  setSofaItems={setSofaItems}
                  onContinue={() => {
                    (document.activeElement as HTMLElement)?.blur();
                    proceedPastConfig();
                  }}
                  onBack={() => { (document.activeElement as HTMLElement)?.blur(); setActiveUpsellScreen(null); }}
                />
              </div>
            )}

            {currentStep === 3 && activeUpsellScreen === 'mattress' && (
              <div className="flex-1 flex flex-col w-full items-center text-center overflow-y-auto">
                <QuizMattressAddonUpsell
                  formData={formData}
                  updateFormData={updateFormData}
                  mattressItems={mattressItems}
                  setMattressItems={setMattressItems}
                  onContinue={() => {
                    (document.activeElement as HTMLElement)?.blur();
                    proceedPastConfig();
                  }}
                  onBack={() => { (document.activeElement as HTMLElement)?.blur(); setActiveUpsellScreen(null); }}
                />
              </div>
            )}

            {/* Upsell final "estilo companhia aérea": uma única tela com as 3
                categorias (Colchão, Sofá, Cadeiras), substitui o antigo fluxo
                QuizUpsellOverlay de escolher um item de cada vez (pedido
                explícito, aprovado em mockup 2026-09-06). */}
            {activeUpsellScreen === 'combo' && (
              <QuizComboUpsellScreen
                upsellItems={upsellItems}
                setUpsellItems={setUpsellItems}
                totalPrice={totalPrice}
                packDiscountActive={packDiscountActive}
                packDiscountedPrice={packDiscountedPrice}
                onContinue={() => { (document.activeElement as HTMLElement)?.blur(); setActiveUpsellScreen(null); setCurrentStep(4); }}
                onBack={() => {
                  (document.activeElement as HTMLElement)?.blur();
                  setUpsellItems([]);
                  setCurrentStep(3);
                  // Volta ao ecrã de upsell dedicado do serviço (não direto às
                  // quantidades) quando esse serviço tem um — mesma condição
                  // usada para mostrá-lo a avançar (bug real: "Voltar" saltava
                  // sempre para as quantidades, ignorando esse passo). Tem de
                  // ser explícito no "senão nenhum" (null) — ao contrário dos
                  // 4 booleans de antes, este estado não fica automaticamente
                  // "desligado" só por não ser mexido aqui.
                  if (formData.service === 'chairs' && (formData.serviceType === 'cleaning' || formData.serviceType === 'waterproofing')) {
                    setActiveUpsellScreen('chairs');
                  } else if (formData.service === 'sofa' && (formData.serviceType === 'cleaning' || formData.serviceType === 'waterproofing')) {
                    setActiveUpsellScreen('sofa');
                  } else if (formData.service === 'mattress' && formData.serviceType === 'cleaning') {
                    setActiveUpsellScreen('mattress');
                  } else {
                    setActiveUpsellScreen(null);
                  }
                }}
              />
            )}


            {/* Step 4 - Contact */}
            {currentStep === 4 && activeUpsellScreen !== 'combo' && (
              <QuizStepContact
                formData={formData}
                updateFormData={updateFormData}
                scrollContainerRef={scrollContainerRef}
              />
            )}


      </div>
    </div>

    {/* Footer — hidden on step 0 (auto-advances on city selection) */}
    {currentStep <= totalSteps && activeUpsellScreen === null && currentStep > 0 && (
      <div className="px-4 sm:px-5 pt-3 flex flex-col gap-2 flex-shrink-0 border-t border-white/[0.05] items-center" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {currentStep === totalSteps ? (
          <div className="flex flex-col gap-2 w-full">
            {totalPrice > 0 && !hasSobOrcamento && !hasUpsellSobItem && (
              <p className="text-center text-[10px] text-white/25 font-medium tracking-wide">
                Preço final: <span className="text-gold/60 font-bold">{packDiscountActive ? `${packDiscountedPrice}€` : `${totalPrice}€`}</span>
              </p>
            )}
            {(hasSobOrcamento || hasUpsellSobItem) && (
              <p className="text-center text-[10px] text-white/25 font-medium tracking-wide">
                Valor: <span className="text-gold/60 font-bold">Sob orçamento</span>
              </p>
            )}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handlePrev}
                className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/50 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
              >
                {isSubmitting ? 'A enviar...' : 'FINALIZAR PEDIDO'}
              </Button>
            </div>
            <p className="text-center text-[11px] text-white/30 font-medium -mt-0.5">
              Sem compromisso · Grátis · Respondemos em menos de 30 min
            </p>
          </div>
        ) : (
          /* Steps 1–2 auto-advance on card tap — only show Voltar (subtle).
             Step 3+ needs Continuar (steppers / area input require explicit confirm). */
          <div className="flex items-center justify-center gap-4 w-full">
            {currentStep > firstStep && (
              <button
                onClick={handlePrev}
                className="h-10 px-5 flex-shrink-0 bg-transparent border border-white/[0.12] text-white/45 hover:text-white/75 hover:border-white/25 active:bg-transparent active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Voltar
              </button>
            )}
            {currentStep >= 3 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold touch-manipulation active:scale-[0.98] disabled:opacity-35 rounded-sm shadow-[0_4px_28px_rgba(212,175,55,0.40)] transition-shadow"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    )}

    {/* Rotating social proof bar */}
    <div className="border-t border-gold/20 px-4 py-2.5 text-center flex-shrink-0 bg-gradient-to-r from-[#0a1f18] via-[#0d2820] to-[#0a1f18] flex items-center justify-center gap-2 overflow-hidden">
      {(() => {
        const current = socialProofMessages[socialProofIdx];
        const Icon = SOCIAL_PROOF_ICON[current.category];
        return (
          <div key={socialProofIdx} className="flex items-center gap-2 kyro-social-proof-in">
            <Icon className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <p className="text-xs text-white/75 font-semibold leading-snug">
              {current.text}
            </p>
          </div>
        );
      })()}
    </div>

    {showExitIntent && (
      <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md rounded-t-3xl sm:rounded-2xl" style={{ background: "rgba(5,21,16,0.92)" }}>
        <div className="px-7 py-8 text-center max-w-xs mx-auto">
          <AlertTriangle className="w-12 h-12 text-gold mb-4 mx-auto" />
          <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
            ESPERE!
          </h3>
          <p className="text-sm text-white/65 mb-2 leading-relaxed">
            {packDiscountActive
              ? 'Se sair agora, perde a sua vaga e o desconto de 10% já ativado.'
              : 'Se sair agora, perde a sua vaga reservada.'}
          </p>
          {isDiscountActive && (
            <p className="text-xs text-gold/70 mb-5 font-mono bg-gold/10 px-3 py-1.5 rounded-lg inline-block">
              Vaga reservada por {formatCountdown(countdown)}
            </p>
          )}
          <div className="flex flex-col gap-3 mt-5">
            <Button
              onClick={() => setShowExitIntent(false)}
              className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] touch-manipulation active:scale-[0.98]"
            >
              {packDiscountActive ? 'Continuar e Guardar Desconto' : 'Continuar e Guardar Vaga'}
            </Button>
            <button
              onClick={confirmClose}
              className="text-xs text-white/20 hover:text-white/45 py-2 transition-colors"
            >
              Sair mesmo assim
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default QuizForm;
