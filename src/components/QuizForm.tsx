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
import type { QuizFormData, SofaItem, MattressItem, UpsellItemConfig } from './quiz';
import QuizStepLocation from './quiz/steps/QuizStepLocation';
import QuizStepConfig from './quiz/steps/QuizStepConfig';
import QuizUpsellOverlay from './quiz/steps/QuizUpsellOverlay';
import QuizMinimumGate from './quiz/steps/QuizMinimumGate';
import QuizStepContact from './quiz/steps/QuizStepContact';
import { calcChairWaterproof, calcChairWaterproofPremium, calcChairClean, calcCarpetPrice, computePendingUpsellTotal } from './quiz/quizHelpers';
import { useUpsellSelection } from './quiz/steps/useUpsellSelection';
import { WHATSAPP_BASE, BUSINESS_EMAIL } from '@/constants/business';
import { QUIZ_STATE_CHANGE_EVENT } from '@/constants/quiz';
import { useQuizPricing } from '@/hooks/use-quiz-pricing';
import { useQuizUiEffects } from '@/hooks/use-quiz-ui-effects';
import { useQuizSubmission } from '@/hooks/use-quiz-submission';
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
  initialWaterproofingTier?: 'essencial' | 'premium';
  problema?: string;
  skipToUpsell?: boolean;
  initialUpsellItems?: UpsellItemConfig[];
}

function calcInitialStep(loc?: string, svc?: string, hasItem?: boolean, skipUpsell?: boolean, hasSvcType?: boolean): number {
  if (skipUpsell && loc) return 4;
  if (!loc) return 0;
  if (!svc) return 1;
  if (hasItem) return 3;
  // Skip serviceType selector when already known or service doesn't need it
  const skipType = svc === 'carpet' || svc === 'chairs' || svc === 'mattress' || hasSvcType;
  return skipType ? 3 : 2;
}

const QuizForm = ({
  isOpen, onClose, initialLocation, initialService, problema,
  initialServiceType, initialSofaSizeId, initialSofaQty, initialSofaItems,
  initialMattressSizeId, initialMattressQty, initialMattressItems, initialChairQty, initialChairWaterproofing, initialCarpetArea,
  initialWaterproofingTier, skipToUpsell, initialUpsellItems,
}: QuizFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const hasInitialItem = Boolean(
    initialSofaItems?.some(i => i.qty > 0) || initialSofaSizeId ||
    initialMattressItems?.some(i => i.qty > 0) || initialMattressSizeId ||
    initialChairQty || initialCarpetArea
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
    waterproofingTier: initialWaterproofingTier || 'essencial',
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

  const [currentStep, setCurrentStep] = useState(() => calcInitialStep(initialLocation, initialService, hasInitialItem, skipToUpsell, !!initialServiceType));
  const [locationQuery, setLocationQuery] = useState('');
  const [hypoallergenic, setHypoallergenic] = useState<boolean | null>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentFired, setExitIntentFired] = useState(false);
  const startsAtUpsell = Boolean(skipToUpsell && initialLocation);
  const [showUpsell, setShowUpsell] = useState(startsAtUpsell);
  // Ecrã dedicado "Quase Lá" (2026-09-02): mostrado ANTES do Pack Família
  // quando o pedido fica abaixo do mínimo, em vez de espremer a mensagem no
  // rodapé do step 4 junto com o formulário de contacto.
  const [showMinimumGate, setShowMinimumGate] = useState(false);
  const [upsellShown, setUpsellShown] = useState(startsAtUpsell);
  const [upsellItems, setUpsellItems] = useState<UpsellItemConfig[]>(initialUpsellItems ?? []);
  const [upsellSubStep, setUpsellSubStep] = useState<'prompt' | 'select' | 'config'>('prompt');
  const [sofaItems, setSofaItems] = useState<SofaItem[]>(buildInitialSofaItems);
  const [mattressItems, setMattressItems] = useState<MattressItem[]>(buildInitialMattressItems);
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

  // Estado do "artigo pendente" do upsell vive aqui (não em QuizUpsellOverlay) para
  // que o preço no topo do quiz suba assim que se clica "+" a configurar, tal como
  // já acontece em Quantidades — antes só atualizava depois de confirmar o artigo.
  const {
    pendingUpsellId, setPendingUpsellId,
    pendingSofaItems, setPendingSofaItems,
    pendingMattressItems, setPendingMattressItems,
    pendingCarpetArea, setPendingCarpetArea,
    pendingChairQtyNum, setPendingChairQtyNum,
    pendingWaterproof, setPendingWaterproof,
    resetPending,
  } = useUpsellSelection();

  const pendingUpsellPreviewPrice = (showUpsell && upsellSubStep === 'config')
    ? computePendingUpsellTotal(
        pendingUpsellId, pendingSofaItems, pendingMattressItems, pendingCarpetArea,
        pendingChairQtyNum, pendingWaterproof, formData.serviceType === 'waterproofing',
        formData.waterproofingTier === 'premium' ? 'premium' : 'essencial',
      )
    : 0;
  const upsellItemsForPricing = pendingUpsellPreviewPrice > 0
    ? [...upsellItems, { id: 'pending-preview', price: pendingUpsellPreviewPrice, label: '' }]
    : upsellItems;

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
  } = useQuizPricing(formData, sofaItems, mattressItems, upsellItemsForPricing);

  // Encomenda mínima: 60€ (subido de 50€ em 2026-09-02, a pedido do dono). Sob
  // orçamento fica sempre acima disso na prática, por isso só se aplica a
  // pedidos com preço fechado.
  const MIN_ORDER_VALUE = 60;
  const effectiveTotal = packDiscountActive ? packDiscountedPrice : totalPrice;
  const belowMinimum = !hasSobOrcamento && !hasUpsellSobItem && totalPrice > 0 && effectiveTotal < MIN_ORDER_VALUE;
  const amountToMinimum = Math.max(0, Math.round((MIN_ORDER_VALUE - effectiveTotal) * 100) / 100);

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
    showUpsell,
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
      const atUpsell = Boolean(skipToUpsell && initialLocation);
      setShowUpsell(atUpsell);
      setUpsellShown(atUpsell);
      setUpsellItems(initialUpsellItems ?? []);
      setCurrentStep(calcInitialStep(initialLocation, initialService, hasInitialItem, skipToUpsell, !!initialServiceType));
    }
    prevIsOpenRef.current = isOpen;
  });

  // skipToUpsell + no location: after user picks city at step 0, jump straight to upsell
  useEffect(() => {
    if (skipToUpsell && formData.location && currentStep === 0) {
      setCurrentStep(4);
      setShowUpsell(true);
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

  const updateFormData = useCallback((updates: Partial<QuizFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);


  const canProceedStep3 = () => {
    switch (formData.service) {
      case 'sofa': {
        return sofaItems.some(i => i.qty > 0);
      }
      case 'carpet': {
        const a = parseFloat(formData.carpetArea);
        return !isNaN(a) && a > 0;
      }
      case 'mattress':
        return mattressItems.some(i => i.qty > 0);
      case 'chairs': {
        // Ecrã mostra "1" por omissão sem o utilizador tocar no stepper
        // (Math.max(1, parseInt(...) || 1) em QuizStepConfig), mas o estado
        // real fica em '' até ao primeiro clique em +/-. Sem isto, escolher
        // a quantidade de 1 cadeira "de calha" e avançar ficava bloqueado
        // (parseInt('') é NaN), mesmo o ecrã mostrando 1 corretamente.
        if (formData.chairQuantity === '') return true;
        const n = parseInt(formData.chairQuantity);
        return !isNaN(n) && n >= 1;
      }
      default:
        return false;
    }
  };

  const firstStep = calcInitialStep(initialLocation, initialService, hasInitialItem);

  // Step order: [0-Location?], 1-Service, 2-ServiceType, 3-Config, [Upsell], 4-Contact (submit)
  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.location !== '' && formData.location !== 'other';
      case 1: return formData.service !== '';
      case 2: return formData.serviceType !== '';
      case 3: return canProceedStep3();
      case 4: return formData.name.trim() !== '' && formData.phone.trim() !== '';
      default: return false;
    }
  };

  // Sofa & mattress now show their own 2-card step 2 (Higienização / Impermeabilização)
  const shouldSkipServiceType = formData.service === 'carpet'
    || formData.service === 'chairs'
    || formData.service === 'mattress';

  const handleNext = () => {
    if (canProceed()) {
      // Commita o valor implícito de 1 cadeira ao avançar (canProceedStep3
      // já aceita '' como válido para não bloquear "Continuar" com o ecrã a
      // mostrar 1) — sem isto o preço, o resumo do pedido e o payload do
      // Formspree ficavam todos a tratar '' como "sem cadeiras" (0€, linha
      // de cadeiras omitida da mensagem), mesmo o cliente tendo avançado
      // com 1 cadeira visível no ecrã.
      if (formData.service === 'chairs' && formData.chairQuantity === '') {
        updateFormData({ chairQuantity: '1', chairType: 'bulk_full' });
      }
      const loc = formData.location === 'other' ? formData.otherLocation : formData.location;
      trackQuizEvent({
        step: currentStep,
        action: 'complete',
        service: formData.service ?? undefined,
        city: loc ?? undefined,
        value: totalPrice > 0 ? totalPrice : undefined,
        service_type: formData.serviceType ?? undefined,
      });

      let nextStep = currentStep + 1;
      if (nextStep === 2 && shouldSkipServiceType) {
        updateFormData({ serviceType: 'cleaning' });
        nextStep = 3;
      }
      // Upsell intercept: always show Pack Família when going forward from step 3
      // (re-shows if user clicked Voltar from Pack back to quantities).
      // Quando o pedido fica abaixo do mínimo, o ecrã "Quase Lá" intercepta
      // primeiro (bloqueia até resolver), só depois segue para o Pack Família.
      if (currentStep === 3) {
        if (belowMinimum) {
          setShowMinimumGate(true);
          return;
        }
        setUpsellShown(true);
        setUpsellSubStep('prompt');
        setShowUpsell(true);
        return;
      }
      if (nextStep <= totalSteps) {
        (document.activeElement as HTMLElement)?.blur();
        setCurrentStep(nextStep);
      }
    }
  };

  const handlePrev = () => {
    // If on step 4 (contact) and upsell was shown, go back to upsell item selector
    if (currentStep === 4 && upsellShown) {
      setUpsellSubStep('select');
      setShowUpsell(true);
      return;
    }
    let prevStep = currentStep - 1;
    // Details (step 3): skip ServiceType only for services that don't use it
    if (currentStep === 3 && shouldSkipServiceType) prevStep = 1;
    // Sofa/mattress go 3→2 naturally; still skip step 2 on explicit backward from step 2
    else if (prevStep === 2 && shouldSkipServiceType) prevStep = 1;

    if (prevStep >= firstStep) {
      // Going back to location step: clear selection so city cards render again
      if (prevStep === 0) {
        updateFormData({ location: '' });
        setLocationQuery('');
      }
      setCurrentStep(prevStep);
    }
  };

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
      case 'carpet':
        if (formData.carpetArea) {
          const area = parseFloat(formData.carpetArea);
          const price = !isNaN(area) && area > 0 ? calcCarpetPrice(area) : null;
          details.push(`Tapete ${formData.carpetArea}m²: ${fmtEuro(price)}`);
        }
        break;
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
          const isPremium = isWaterproofPrimary && formData.waterproofingTier === 'premium';
          const calcWaterproof = isPremium ? calcChairWaterproofPremium : calcChairWaterproof;
          const primaryTotal = !isNaN(qty) && qty > 0 ? (isWaterproofPrimary ? calcWaterproof(qty) : calcChairClean(qty)) : null;
          const primaryLabel = isWaterproofPrimary ? `Impermeabilização${isPremium ? ' Premium' : ' Essencial'}` : 'Limpeza';
          details.push(`${formData.chairQuantity} cadeira(s): ${primaryLabel}: ${fmtEuro(primaryTotal)}`);
          const wQty = formData.chairWaterproofQty;
          if (wQty > 0) {
            const addonTotal = isWaterproofPrimary ? calcChairClean(wQty) : calcWaterproof(wQty);
            const addonLabel = isWaterproofPrimary ? 'Limpeza' : `Impermeabilização${isPremium ? ' Premium' : ' Essencial'}`;
            details.push(`${addonLabel} de ${wQty} cadeira(s): ${fmtEuro(addonTotal)}`);
          }
        }
        break;
    }

    if (upsellItems.length > 0) {
      const upsellLabels: Record<string, string> = { mattress: 'Colchão', carpet: 'Tapete', chairs: 'Cadeiras' };
      const upsellParts = upsellItems.map(item => {
        const itemLabel = upsellLabels[item.id] ?? item.id;
        const detail = item.mattressSize
          ? ` (${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? item.mattressSize})`
          : item.carpetArea ? ` (${item.carpetArea}m²)`
          : item.chairQty ? ` (${item.chairQty}x)`
          : '';
        return `+${itemLabel}${detail}: ${fmtEuro(item.price > 0 ? item.price : null)}`;
      });
      details.push(`Pack: ${upsellParts.join(', ')}`);
    }

    return details.join(' | ');
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    const finalLocation = formData.location === 'other' ? formData.otherLocation : formData.location;
    const serviceLabel = getServiceLabel();
    const serviceTypeLabel = getServiceTypeLabel();
    const detailsSummary = buildDetailsSummary();

    const upsellItemLabels: Record<string, string> = { mattress: 'Colchão', carpet: 'Tapete', chairs: 'Cadeiras', 'sofa-anti-acaros': 'Anti Ácaros (sofá)', 'chairs-anti-acaros': 'Anti Ácaros (cadeiras)' };
    const crmServiceLabel = upsellItems.length > 0
      ? `${serviceLabel}, ${upsellItems.map(i => upsellItemLabels[i.id] ?? i.id).join(', ')}`
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
        if (item.price > 0) parts.push(`${item.price}€ ${upsellItemLabels[item.id] ?? item.label ?? item.id}`);
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
      carpetArea: formData.carpetArea,
      chairQuantity: formData.chairQuantity,
      chairWaterproofQty: formData.chairWaterproofQty,
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
    setShowUpsell(false);
    setUpsellShown(false);
    setUpsellItems([]);
    setUpsellSubStep('select');
    setSofaItems(buildInitialSofaItems());
    setMattressItems(buildInitialMattressItems());
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
          {(totalPrice > 0 || hasSobOrcamento) && (showUpsell || finalTravelCost > 0 || (currentStep !== 1 && currentStep !== 2)) && (
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
                    setCurrentStep(4);
                    setShowUpsell(true);
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
                    // Colchão já não salta o Passo 2 (2026-08-30): tem Anti Ácaros como
                    // segunda opção real, tal como sofá/cadeiras têm impermeabilização.
                    const skipServiceType = service === 'carpet';
                    updateFormData({ service, serviceType: skipServiceType ? 'cleaning' : '', sofaSize: '', mattressSize: '', chairType: '', carpetArea: '', chairWaterproofing: false, chairWaterproofQty: 0 });
                    setSofaItems([]);
                    setMattressItems([]);
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

            {/* Step 3 - Config (hidden while Pack Família overlay or o "Quase Lá" active) */}
            {currentStep === 3 && !showUpsell && !showMinimumGate && (
              <div className="flex-1 flex flex-col w-full items-center text-center overflow-y-auto">
                <QuizStepConfig
                  formData={formData}
                  updateFormData={updateFormData}
                  sofaItems={sofaItems}
                  setSofaItems={setSofaItems}
                  mattressItems={mattressItems}
                  setMattressItems={setMattressItems}
                />
              </div>
            )}

            {/* "Quase Lá": bloqueia antes do Pack Família quando abaixo do mínimo */}
            {showMinimumGate && (
              <QuizMinimumGate
                formData={formData}
                updateFormData={updateFormData}
                sofaItems={sofaItems}
                setSofaItems={setSofaItems}
                mattressItems={mattressItems}
                setMattressItems={setMattressItems}
                upsellItems={upsellItems}
                setUpsellItems={setUpsellItems}
                minOrderValue={MIN_ORDER_VALUE}
                amountToMinimum={amountToMinimum}
                belowMinimum={belowMinimum}
                onOpenFullUpsell={() => {
                  (document.activeElement as HTMLElement)?.blur();
                  setShowMinimumGate(false);
                  setUpsellShown(true);
                  setUpsellSubStep('select');
                  setShowUpsell(true);
                }}
                onContinue={() => {
                  if (belowMinimum) return;
                  (document.activeElement as HTMLElement)?.blur();
                  setShowMinimumGate(false);
                  setUpsellShown(true);
                  setUpsellSubStep('prompt');
                  setShowUpsell(true);
                }}
                onBack={() => { (document.activeElement as HTMLElement)?.blur(); setShowMinimumGate(false); }}
              />
            )}

            {/* Pack Família upsell (multi-step overlay) */}
            {showUpsell && (
              <QuizUpsellOverlay
                formData={formData}
                updateFormData={updateFormData}
                upsellSubStep={upsellSubStep}
                setUpsellSubStep={setUpsellSubStep}
                upsellItems={upsellItems}
                setUpsellItems={setUpsellItems}
                totalPrice={totalPrice}
                packDiscountActive={packDiscountActive}
                serviceQualifiesForDiscount={totalPrice > 100}
                onGoToContact={() => { (document.activeElement as HTMLElement)?.blur(); setShowUpsell(false); setCurrentStep(4); }}
                onBack={() => { (document.activeElement as HTMLElement)?.blur(); setShowUpsell(false); setCurrentStep(3); }}
                pendingUpsellId={pendingUpsellId} setPendingUpsellId={setPendingUpsellId}
                pendingSofaItems={pendingSofaItems} setPendingSofaItems={setPendingSofaItems}
                pendingMattressItems={pendingMattressItems} setPendingMattressItems={setPendingMattressItems}
                pendingCarpetArea={pendingCarpetArea} setPendingCarpetArea={setPendingCarpetArea}
                pendingChairQtyNum={pendingChairQtyNum} setPendingChairQtyNum={setPendingChairQtyNum}
                pendingWaterproof={pendingWaterproof} setPendingWaterproof={setPendingWaterproof}
                resetPending={resetPending}
              />
            )}


            {/* Step 4 - Contact */}
            {currentStep === 4 && !showUpsell && !showMinimumGate && (
              <QuizStepContact
                formData={formData}
                updateFormData={updateFormData}
                scrollContainerRef={scrollContainerRef}
              />
            )}


      </div>
    </div>

    {/* Footer — hidden on step 0 (auto-advances on city selection) */}
    {currentStep <= totalSteps && !showUpsell && !showMinimumGate && currentStep > 0 && (
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
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
            >
              {isSubmitting ? 'A enviar...' : 'FINALIZAR PEDIDO'}
            </Button>
            <p className="text-center text-[11px] text-white/30 font-medium -mt-0.5">
              Sem compromisso · Grátis · Respondemos em menos de 30 min
            </p>
            <button
              onClick={handlePrev}
              className="w-full h-7 text-xs text-white/20 hover:text-white/45 active:text-white/45 active:bg-transparent touch-manipulation bg-transparent border-none outline-none"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1 inline" />
              Voltar
            </button>
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
