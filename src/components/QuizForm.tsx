import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Check, Flame, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackQuizEvent } from '@/lib/quizTracking';
import { logError } from '@/lib/errorTracking';
import { useQuizAnalytics } from '@/hooks/use-quiz-analytics';
import ConfettiGold from './quiz/ConfettiGold';
import {
  QuizStep1Service,
  ServiceTypeSelector,
  initialFormData,
  sofaPrices,
  mattressPrices,
  locationPrices,
} from './quiz';
import type { QuizFormData, SofaItem, MattressItem, UpsellItemConfig } from './quiz';
import QuizStepLocation from './quiz/steps/QuizStepLocation';
import QuizStepConfig from './quiz/steps/QuizStepConfig';
import QuizUpsellOverlay from './quiz/steps/QuizUpsellOverlay';
import QuizStepContact from './quiz/steps/QuizStepContact';
import { calcCarpetPrice, calcChairClean, calcChairWaterproof } from './quiz/quizHelpers';
import { WHATSAPP_BASE, BUSINESS_EMAIL } from '@/constants/business';


interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  initialService?: string;
  problema?: string;
}

function calcInitialStep(loc?: string, svc?: string): number {
  if (!loc) return 0;
  if (!svc) return 1;
  const skipType = svc === 'carpet' || svc === 'mattress';
  return skipType ? 3 : 2;
}

// sessionStorage can throw (e.g. Safari Private Browsing, restricted in-app browsers).
// These values are only used to enrich the "Obrigado" page, so a failure here must
// never block the success flow once the lead has already been sent to Formspree.
function safeSessionSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[QuizForm] sessionStorage.setItem("${key}") failed:`, e);
  }
}

const QuizForm = ({ isOpen, onClose, initialLocation, initialService, problema }: QuizFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => calcInitialStep(initialLocation, initialService));
  const [locationQuery, setLocationQuery] = useState('');
  const [locationFadeIn, setLocationFadeIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(10 * 60);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [hypoallergenic, setHypoallergenic] = useState<boolean | null>(null);
  const [socialProofIdx, setSocialProofIdx] = useState(0);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentFired, setExitIntentFired] = useState(false);
  const [exitIntentUnlocked, setExitIntentUnlocked] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellShown, setUpsellShown] = useState(false);
  const [upsellItems, setUpsellItems] = useState<UpsellItemConfig[]>([]);
  const [upsellSubStep, setUpsellSubStep] = useState<'prompt' | 'select' | 'config'>('prompt');
  const [pendingUpsellId, setPendingUpsellId] = useState<string | null>(null);
  const [pendingSofaItems, setPendingSofaItems] = useState<SofaItem[]>([]);
  const [pendingMattressItems, setPendingMattressItems] = useState<MattressItem[]>([]);
  const [pendingCarpetArea, setPendingCarpetArea] = useState('');
  const [pendingChairQty, setPendingChairQty] = useState('');
  const [pendingChairQtyNum, setPendingChairQtyNum] = useState(1);
  const [pendingWaterproof, setPendingWaterproof] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [timerFlash, setTimerFlash] = useState(false);
  const [sofaItems, setSofaItems] = useState<SofaItem[]>([]);
  const [mattressItems, setMattressItems] = useState<MattressItem[]>([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const prevTotalRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<QuizFormData>(() => ({
    ...initialFormData,
    location: initialLocation || '',
    service: initialService || '',
    serviceType: (initialService && initialService !== 'sofa' && initialService !== 'chairs') ? 'cleaning' : '',
  }));

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

  // ── TIMER KEY ──────────────────────────────────────────────────────────────
  const TIMER_KEY = 'kyro_timer_expiry';
  const TIMER_DURATION = 10 * 60; // 10 minutes in seconds

  // ── DISCOUNT ───────────────────────────────────────────────────────────────
  const isDiscountActive = countdown > 0;

  // packDiscountActive computed below after totalPrice

  // Calculate total price early for analytics (moved up for hook dependency)
  const calculateServicePrice = useMemo(() => {
    let price = 0;
    
    switch (formData.service) {
      case 'sofa': {
        const hasSofas = sofaItems.some(i => i.qty > 0);
        sofaItems.forEach(item => {
          if (item.qty <= 0) return;
          const opt = sofaPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const isWaterproofBase = formData.serviceType === 'waterproofing';
          const baseP = isWaterproofBase
            ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : 0)
            : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0);
          const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : baseP + 40;
          const unitPrice = item.packEnabled ? bothP : baseP;
          if (unitPrice > 0) price += unitPrice * item.qty;
        });
        break;
      }

      case 'mattress': {
        mattressItems.forEach(item => {
          if (item.qty <= 0) return;
          const opt = mattressPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const isWaterproofBase = formData.serviceType === 'waterproofing';
          const baseP = isWaterproofBase
            ? (typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : 0)
            : (typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0);
          const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : baseP + 30;
          const unitPrice = item.packEnabled ? bothP : baseP;
          if (unitPrice > 0) price += unitPrice * item.qty;
        });
        break;
      }
        
      case 'chairs': {
        const chairQty = parseInt(formData.chairQuantity);
        if (!isNaN(chairQty) && chairQty > 0) {
          price = formData.serviceType === 'waterproofing'
            ? (calcChairWaterproof(chairQty) ?? 0)
            : (calcChairClean(chairQty) ?? 0);
        }
        const addonQty = formData.chairWaterproofQty;
        if (addonQty > 0) {
          price += formData.serviceType === 'waterproofing'
            ? (calcChairClean(addonQty) ?? 0)
            : (calcChairWaterproof(addonQty) ?? 0);
        }
        break;
      }

      case 'carpet': {
        const carpetArea = parseFloat(formData.carpetArea);
        if (!isNaN(carpetArea) && carpetArea > 0) {
          price = calcCarpetPrice(carpetArea) ?? 0;
        }
        break;
      }
    }

    return price;
  }, [formData, sofaItems, mattressItems]);

  // Calculate travel cost: uses expanded locationPrices from QuizTypes
  const travelCost = useMemo(() => {
    if (!formData.location || formData.location === 'other') return 0;
    return locationPrices[formData.location] ?? 0;
  }, [formData.location]);

  const isFreeTravel = calculateServicePrice >= 150;
  const finalTravelCost = isFreeTravel ? 0 : travelCost;
  const hypoSurcharge = 0;

  const safePrice = (n: number) => (isNaN(n) || n == null) ? 0 : n;
  const upsellItemsTotal = upsellItems.reduce((sum, item) => sum + safePrice(item.price), 0);
  const totalPrice = safePrice(calculateServicePrice) + safePrice(upsellItemsTotal) + safePrice(finalTravelCost) + safePrice(hypoSurcharge);
  // True when the user has qty>0 of the "4+ lugares" sofa (no fixed price → custom quote)
  const hasSobOrcamento = sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0);
  // Any upsell item with price=0 is a SOB item (chairs ≥10, carpet >15m², sofa 4+ lugares)
  const hasUpsellSobItem = upsellItems.some(i => i.price === 0);
  // Pack 10% activates: cart ≥149€ in known prices, OR cart >100€ + any SOB item
  const packDiscountActive = totalPrice >= 149 || (totalPrice > 100 && (hasUpsellSobItem || hasSobOrcamento));
  const packDiscountPct = packDiscountActive ? 0.10 : 0;
  const serviceOnlyTotal = calculateServicePrice + upsellItemsTotal + hypoSurcharge;
  const discountedPrice = Math.round(totalPrice);
  const packDiscountedPrice = packDiscountActive && totalPrice > 0
    ? Math.round(serviceOnlyTotal * 0.9) + finalTravelCost
    : discountedPrice;

  // Determine if this request requires a custom quote (no fixed price available)
  const isSobOrcamento = useMemo(() => {
    switch (formData.service) {
      case 'sofa': {
        // Only sob orçamento when 4+ lugares is selected (no fixed price)
        if (!sofaItems.some(i => i.qty > 0)) return false;
        return sofaItems.some(i => i.qty > 0 && i.sizeId === '4+-lugares');
      }
      case 'mattress': {
        // All mattress sizes have fixed prices
        return false;
      }
      case 'chairs': {
        const chairQty = parseInt(formData.chairQuantity);
        const cleanSob = isNaN(chairQty) || chairQty <= 0 || chairQty >= 10;
        const waterSob = formData.chairWaterproofQty > 10;
        return cleanSob || waterSob;
      }
      case 'carpet': {
        const area = parseFloat(formData.carpetArea);
        return isNaN(area) || area <= 0 || area > 15;
      }
      default:
        return false;
    }
  }, [formData.service, formData.serviceType, formData.sofaSize, formData.mattressSize, formData.chairType, sofaItems, mattressItems]);

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

  // Notify other components of quiz open/close state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('quizStateChange', { detail: { isOpen } }));
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
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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
    `4 pessoas de ${formData.location || 'Porto'} pediram orçamento nas últimas 2 horas`,
    `Alguém de ${formData.location || 'Porto'} acabou de reservar, agenda a fechar`,
    `Agenda quase cheia esta semana em ${formData.location || 'Porto'}, garanta já`,
    `Mais de 50 clientes satisfeitos · Avaliação 5.0 no Google`,
  ];

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSocialProofIdx(i => (i + 1) % socialProofMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, formData.location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flash urgency bar gold when pack discount activates or item count changes
  useEffect(() => {
    if (!packDiscountActive) return;
    setTimerFlash(true);
    const id = setTimeout(() => setTimerFlash(false), 2500);
    return () => clearTimeout(id);
  }, [packDiscountActive]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [currentStep, showUpsell]);

  const updateFormData = useCallback((updates: Partial<QuizFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);


  const timingOptions = [
    { id: 'asap', label: t('quiz.timing.asap') },
    { id: 'this-week', label: t('quiz.timing.thisWeek') },
    { id: '1-2-weeks', label: t('quiz.timing.oneToTwo') },
    { id: 'this-month', label: t('quiz.timing.thisMonth') },
    { id: 'evaluating', label: t('quiz.timing.evaluating') },
  ];

  const contactOptions = [
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'call', label: t('quiz.contact.call') },
    { id: 'email', label: 'Email' },
  ];

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
        const n = parseInt(formData.chairQuantity);
        return !isNaN(n) && n >= 1;
      }
      default:
        return false;
    }
  };

  // Step 0 = location picker (only shown when no city pre-filled)
  const needsLocationStep = !initialLocation;
  const firstStep = calcInitialStep(initialLocation, initialService);

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
      // (re-shows if user clicked Voltar from Pack back to quantities)
      if (currentStep === 3) {
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
        setLocationFadeIn(false);
      }
      setCurrentStep(prevStep);
    }
  };

  const getServiceLabel = () => {
    const labels: Record<string, string> = {
      sofa: t('quiz.services.sofa'),
      carpet: t('quiz.services.carpet'),
      mattress: t('quiz.services.mattress'),
      chairs: t('quiz.services.chairs'),
    };
    return labels[formData.service] || formData.service;
  };

  const getServiceTypeLabel = () => {
    const labels: Record<string, string> = {
      cleaning: t('quiz.serviceType.cleaning', 'Limpeza'),
      waterproofing: t('quiz.serviceType.waterproofing', 'Impermeabilização'),
      both: t('quiz.serviceType.both', 'Limpeza + Impermeabilização'),
    };
    return labels[formData.serviceType] || '';
  };

  const buildDetailsSummary = () => {
    const details = [];
    
    switch (formData.service) {
      case 'sofa': {
        const sofaLines = sofaItems
          .filter(i => i.qty > 0)
          .map(i => {
            const opt = sofaPrices.find(p => p.id === i.sizeId);
            return opt ? `${i.qty}x Sofá ${opt.label}` : null;
          })
          .filter(Boolean) as string[];
        if (sofaLines.length > 0) details.push(...sofaLines);
        if (sofaItems.some(i => i.packEnabled && i.qty > 0)) details.push('+ Proteção Total VIP');
        break;
      }
      case 'carpet':
        if (formData.carpetArea) {
          details.push(`Detalhes do Tapete: ${formData.carpetArea}`);
        }
        break;
      case 'mattress': {
        const mattressLines = mattressItems
          .filter(i => i.qty > 0)
          .map(i => {
            const opt = mattressPrices.find(p => p.id === i.sizeId);
            if (!opt) return null;
            return `${i.qty}x Colchão ${opt.label}`;
          })
          .filter(Boolean) as string[];
        if (mattressLines.length > 0) details.push(...mattressLines);
        break;
      }
      case 'chairs':
        if (formData.chairQuantity) {
          details.push(`${formData.chairQuantity} cadeira(s): Limpeza`);
          const wQty = formData.chairWaterproofQty;
          if (wQty > 0) {
            const wTotal = calcChairWaterproof(wQty);
            const wStr = wTotal !== null ? `${wTotal % 1 === 0 ? wTotal : wTotal.toFixed(1).replace('.', ',')}€` : 'Sob orçamento';
            details.push(`Impermeabilização de ${wQty} cadeira(s): ${wStr}`);
          }
        }
        break;
    }
    
    if (upsellItems.length > 0) {
      const upsellLabels: Record<string, string> = { mattress: 'Colchão', carpet: 'Tapete', chairs: 'Cadeiras' };
      upsellItems.forEach(item => {
        const itemLabel = upsellLabels[item.id] ?? item.id;
        const detail = item.mattressSize
          ? ` (${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? item.mattressSize})`
          : item.carpetArea ? ` (${item.carpetArea}m²)`
          : item.chairQty ? ` (${item.chairQty}x)`
          : '';
        details.push(`Pack: +${itemLabel}${detail}`);
      });
    }

    return details.join(' | ');
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    
    const finalLocation = formData.location === 'other' ? formData.otherLocation : formData.location;
    const serviceLabel = getServiceLabel();
    const serviceTypeLabel = getServiceTypeLabel();
    const timingLabel = timingOptions.find(t => t.id === formData.timing)?.label || formData.timing;
    const contactLabel = contactOptions.find(c => c.id === formData.contactMethod)?.label || formData.contactMethod;
    const detailsSummary = buildDetailsSummary();
    
    const upsellItemLabels: Record<string, string> = { mattress: 'Colchão', carpet: 'Tapete', chairs: 'Cadeiras' };
    const crmServiceLabel = upsellItems.length > 0
      ? `${serviceLabel}, ${upsellItems.map(i => upsellItemLabels[i.id] ?? i.id).join(', ')}`
      : serviceLabel;
    const packPctLabel = packDiscountPct > 0 ? `Pack -${Math.round(packDiscountPct * 100)}%` : '';
    const priceText = packDiscountActive && totalPrice > 0
      ? `${packDiscountedPrice}€ (IVA incl., ${packPctLabel})`
      : totalPrice > 0 ? `${totalPrice}€ (IVA incl.)` : 'Sob orçamento';
    
    const message = `
[QUIZ RÁPIDO - Kyro Clean Solutions]

Serviço: ${serviceLabel}
Tipo: ${serviceTypeLabel}
Detalhes: ${detailsSummary}
Localização: ${finalLocation}
Deslocação: ${isFreeTravel ? 'Grátis (pedido >150€)' : `${finalTravelCost}€`}
VALOR TOTAL (IVA incl.): ${priceText}
Contacto preferido: WhatsApp${formData.email ? `\nEmail: ${formData.email}` : ''}

Observações:
${formData.description || 'Sem observações adicionais'}
    `.trim();

    try {
      // Submit to Formspree via FormData (supports file uploads)
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('phone', formData.phone);
      if (formData.email) formPayload.append('email', formData.email);
      formPayload.append('location', finalLocation);
      formPayload.append('message', message);
      formPayload.append('subject', `Pedido de orçamento - ${serviceLabel}`);
      (formData.photos || []).forEach((photo, i) => {
        formPayload.append(`foto_${i + 1}`, photo, photo.name);
      });

      // Submissions on mobile networks can fail transiently (timeouts, brief
      // connection drops). Retry once before treating it as a real failure.
      let response: Response;
      try {
        response = await fetch('https://formspree.io/f/xreozzbp', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formPayload,
        });
      } catch (networkErr) {
        console.warn('[QuizForm] Formspree fetch failed, retrying once:', networkErr);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        response = await fetch('https://formspree.io/f/xreozzbp', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formPayload,
        });
      }

      console.log('[QuizForm] Formspree response status:', response.status);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Formspree ${response.status}: ${errBody.slice(0, 500)}`);
      }

      // From here on, the lead has already been captured by Formspree.
      // Anything below is just enrichment (CRM backup, analytics, data for the
      // "Obrigado" page) - if any of it fails, log it but still treat the
      // submission as successful so the user never sees a false error.
      try {
      // Track successful submission
      trackSubmission();

      // Generate unique booking ID
      const bookingId = Math.random().toString(36).substr(2, 8).toUpperCase();

      // Persist lead to Supabase CRM (silent fail, Formspree is the primary capture)
      try {
        const { supabase } = await import('@/lib/supabase');
        const upsellNotes = upsellItems.length > 0
          ? upsellItems.map(item => {
              const imp = item.waterproof ? ' + Impermeabilização' : '';
              if (item.id === 'mattress') return `Colchão: ${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? item.mattressSize ?? '?'}${imp}`;
              if (item.id === 'carpet') return `Tapete: ${item.carpetArea ?? '?'}m²${imp}`;
              if (item.id === 'chairs') return `Cadeiras: ${item.chairQty ?? '?'}x${imp}`;
              return item.id;
            }).join(' | ')
          : '';
        await supabase.from('leads').insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          service: crmServiceLabel,
          service_type: serviceTypeLabel,
          details: detailsSummary,
          location: finalLocation,
          value: priceText,
          booking_id: bookingId,
          message: message,
          status: 'pending',
          source: 'Website',
          priority: 'Quente',
          notes: upsellNotes,
        });
      } catch (supaErr) {
        console.warn('[CRM] Lead backup failed silently:', supaErr);
      }
      safeSessionSet('kyro_booking_id', bookingId);

      // Build WA URL for optional support button on Obrigado page
      const finalPriceText = packDiscountActive && totalPrice > 0
        ? `${packDiscountedPrice}€ (Pack -10%)`
        : totalPrice > 0
          ? `${totalPrice}€`
          : 'Sob orçamento';
      const hypoText = hypoallergenic === true ? `\nProdutos Hipoalergénicos +${hypoSurcharge}€` : '';
      const waExtras: string[] = [];
      if (serviceTypeLabel) waExtras.push(serviceTypeLabel);
      if (hypoallergenic === true) waExtras.push(`Produtos Hipoalergénicos (+${hypoSurcharge}€)`);
      const waExtrasText = waExtras.length > 0 ? waExtras.join(' + ') : 'Sem extras';
      const waTotalPrice = packDiscountActive && totalPrice > 0
        ? `${packDiscountedPrice}€ (Pack -10%) (IVA incl.)`
        : totalPrice > 0
          ? `${totalPrice}€ (IVA incl.)`
          : 'Sob orçamento';

      const waText = encodeURIComponent(
        `Olá Kyro Clean Solutions. Acabei de gerar um orçamento detalhado no site e pretendo confirmar o agendamento.\n\n` +
        `DADOS DO PEDIDO:\n` +
        `▸ Serviço: ${serviceLabel}\n` +
        `▸ Item: ${detailsSummary || 'N/D'}\n` +
        `▸ Extras: ${waExtrasText}\n` +
        `▸ Localização: ${finalLocation}\n` +
        `▸ Valor Total: ${waTotalPrice}\n` +
        `▸ Código de Reserva: #${bookingId}\n\n` +
        `Aguardo contacto para validação final.`
      );

      // Build itemized receipt for Obrigado page
      const receiptLines: Array<{ label: string; qty: number; unitPrice: number | null; total: number | null }> = [];
      if (formData.service === 'sofa') {
        sofaItems.filter(i => i.qty > 0).forEach(item => {
          const opt = sofaPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const unit = item.packEnabled && typeof opt.bothPrice === 'number'
            ? (opt.bothPrice as number)
            : typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null;
          receiptLines.push({ label: `Sofá ${opt.label}${item.packEnabled ? ' + Impermeab.' : ''}`, qty: item.qty, unitPrice: unit, total: unit !== null ? unit * item.qty : null });
        });
      } else if (formData.service === 'mattress') {
        mattressItems.filter(i => i.qty > 0).forEach(item => {
          const opt = mattressPrices.find(p => p.id === item.sizeId);
          if (!opt) return;
          const unit = item.packEnabled && typeof opt.bothPrice === 'number'
            ? (opt.bothPrice as number)
            : typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null;
          const typeStr = item.packEnabled ? ' (Pack Proteção Total)' : ' (Limpeza)';
          receiptLines.push({ label: `Colchão ${opt.label}${typeStr}`, qty: item.qty, unitPrice: unit, total: unit !== null ? unit * item.qty : null });
        });
      } else if (formData.service === 'chairs') {
        const cQty = parseInt(formData.chairQuantity);
        if (!isNaN(cQty) && cQty > 0) {
          const cleanTotal = calcChairClean(cQty);
          receiptLines.push({ label: 'Limpeza Cadeiras', qty: cQty, unitPrice: cleanTotal !== null ? Math.round(cleanTotal / cQty * 10) / 10 : null, total: cleanTotal });
          const wQty = formData.chairWaterproofQty;
          if (wQty > 0) {
            const wTotal = calcChairWaterproof(wQty);
            const wUnit = wQty <= 6 ? 15 : wQty <= 9 ? 12.5 : null;
            receiptLines.push({ label: 'Impermeabilização Cadeiras', qty: wQty, unitPrice: wUnit, total: wTotal });
          }
        }
      } else if (formData.service === 'carpet') {
        receiptLines.push({ label: `Tapete ${formData.carpetArea}m²`, qty: 1, unitPrice: calculateServicePrice || null, total: calculateServicePrice || null });
      }
      upsellItems.forEach(item => {
        const q = item.qty ?? 1;
        const unitP = q > 0 && item.price > 0 ? Math.round(item.price / q * 100) / 100 : null;
        receiptLines.push({ label: item.label, qty: q, unitPrice: unitP, total: item.price > 0 ? item.price : null });
        if (item.waterproof && item.waterproofPrice && item.waterproofPrice > 0) {
          receiptLines.push({ label: `Impermeabilização (${item.label})`, qty: 1, unitPrice: item.waterproofPrice, total: item.waterproofPrice });
        }
      });
      if (finalTravelCost > 0) receiptLines.push({ label: `Deslocação: ${finalLocation}`, qty: 1, unitPrice: finalTravelCost, total: finalTravelCost });
      const discountAmt = packDiscountActive ? Math.round((totalPrice - packDiscountedPrice) * 100) / 100 : 0;
      safeSessionSet('kyro_receipt', JSON.stringify({
        lines: receiptLines,
        subtotal: totalPrice,
        discountLabel: packDiscountActive ? `Pack Família −${Math.round(packDiscountPct * 100)}%` : null,
        discountAmount: discountAmt,
        total: packDiscountActive ? packDiscountedPrice : totalPrice,
        location: finalLocation,
        slot: formatSelectedSlot(formData.selectedSlot),
        bookingId,
        name: formData.name,
      }));

      // Store for Obrigado page
      safeSessionSet('kyro_wa_url', `${WHATSAPP_BASE}?text=${waText}`);
      safeSessionSet('kyro_summary', JSON.stringify({
        price: finalPriceText,
        service: `${serviceLabel}${serviceTypeLabel ? `: ${serviceTypeLabel}` : ''}`,
        location: finalLocation,
      }));
      } catch (postSubmitError) {
        console.warn('[QuizForm] Post-submit enrichment failed (lead already sent):', postSubmitError);
        logError({
          message: postSubmitError instanceof Error ? postSubmitError.message : String(postSubmitError),
          source: 'QuizForm-post-submit',
          severity: 'warning',
          stack: postSubmitError instanceof Error ? postSubmitError.stack ?? null : null,
        });
      }

      resetForm();
      onClose();
      navigate('/obrigado');
    } catch (error) {
      console.error('[QuizForm] Submit error:', error);

      logError({
        message: error instanceof Error ? error.message : String(error),
        source: 'QuizForm-submit',
        severity: 'error',
        stack: error instanceof Error ? error.stack ?? null : null,
      });

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
        title: "Não foi possível enviar",
        description: (
          <div className="space-y-2">
            <p>Houve um problema. Contacte-nos diretamente:</p>
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
        variant: 'destructive',
        duration: 15000,
      });
    } finally {
      setIsSubmitting(false);
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
    setFormData({
      ...initialFormData,
      location: initialLocation || '',
      service: initialService || '',
      serviceType: (initialService && initialService !== 'sofa' && initialService !== 'chairs') ? 'cleaning' : '',
    });
    setCurrentStep(calcInitialStep(initialLocation, initialService));
    setLocationQuery('');
    setLocationFadeIn(false);
    setHypoallergenic(null);
    setSocialProofIdx(0);
    setShowExitIntent(false);
    setExitIntentFired(false);
    setExitIntentUnlocked(false);
    setShowUpsell(false);
    setUpsellShown(false);
    setUpsellItems([]);
    setUpsellSubStep('select');
    setPendingUpsellId(null);
    setPendingSofaItems([]);
    setPendingMattressItems([]);
    setPendingCarpetArea('');
    setPendingChairQty('');
    setPendingChairQtyNum(1);
    setPendingWaterproof(false);
    setShowSummary(false);
    setTimerFlash(false);
    setSofaItems([]);
    setMattressItems([]);
    setConfettiActive(false);
  };

  const handleClose = () => {
    if (exitIntentUnlocked && !exitIntentFired && currentStep > 0) {
      setShowExitIntent(true);
      setExitIntentFired(true);
      return;
    }
    resetForm();
    onClose();
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
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] sm:flex sm:items-center sm:justify-center sm:backdrop-blur-lg sm:p-4" style={{ background: "rgba(5,21,16,0.82)" }} role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <div
        className={cn(
          "relative w-full sm:max-w-lg sm:rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] sm:border border-white/[0.18] overflow-hidden animate-scale-in flex flex-col sm:gpu-accelerated bg-checker-modal",
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
              className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors touch-manipulation"
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
            <div className="sticky top-0 z-20 text-white flex items-center justify-between py-3 border-b border-white/[0.16] -mx-5 sm:-mx-6 px-5 sm:px-6 animate-fade-in" style={{ background: "#071a12" }}>
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
                {hasSobOrcamento && (
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
          )}

          <div className="flex flex-col py-3 sm:py-5 w-full items-center text-center">

            {/* Step 0, Location Autocomplete VIP */}
            {/* Context banner when quiz opened from a problem page */}
            {problema && (
              <div className="w-full max-w-sm mx-auto mb-4 bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 text-center">
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
                  setLocationFadeIn(true);
                  setCurrentStep(calcInitialStep(city, initialService));
                }}
              />
            )}

            {/* Step 1, Service Selector */}
            {currentStep === 1 && (
              <div className="w-full flex flex-col items-center">
                <QuizStep1Service
                  selectedService={formData.service}
                  onSelect={(service) => {
                    const skipServiceType = service === 'carpet' || service === 'mattress';
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
              const cleanPrice = formData.service === 'mattress' ? 39
                : formData.service === 'chairs' ? undefined
                : 49;
              const waterPrice = formData.service === 'sofa' ? 49
                : formData.service === 'mattress' ? 45
                : undefined;
              // No Pack card on step 2, upsell is inline per-item in step 3
              const packPrice = undefined;
              const waterDesc = formData.service === 'mattress'
                ? 'Ideal para colchões novos ou recém-limpos.'
                : undefined;
              return (
                <div className="flex-1 flex flex-col gap-4 w-full max-w-sm self-center items-center text-center">
                  <div>
                    <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1">O QUE PRECISA?</p>
                    <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">
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
                    hideWaterproofing={formData.service === 'mattress'}
                  />
                </div>
              );
            })()}

            {/* Step 3 - Config (hidden while Pack Família overlay is active) */}
            {currentStep === 3 && !showUpsell && (
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

            {/* Pack Família upsell (multi-step overlay) */}
            {showUpsell && (
              <QuizUpsellOverlay
                formData={formData}
                upsellSubStep={upsellSubStep}
                setUpsellSubStep={setUpsellSubStep}
                pendingUpsellId={pendingUpsellId}
                setPendingUpsellId={setPendingUpsellId}
                pendingSofaItems={pendingSofaItems}
                setPendingSofaItems={setPendingSofaItems}
                pendingMattressItems={pendingMattressItems}
                setPendingMattressItems={setPendingMattressItems}
                pendingCarpetArea={pendingCarpetArea}
                setPendingCarpetArea={setPendingCarpetArea}
                pendingChairQtyNum={pendingChairQtyNum}
                setPendingChairQtyNum={setPendingChairQtyNum}
                pendingWaterproof={pendingWaterproof}
                setPendingWaterproof={setPendingWaterproof}
                upsellItems={upsellItems}
                setUpsellItems={setUpsellItems}
                totalPrice={totalPrice}
                packDiscountActive={packDiscountActive}
                onGoToContact={() => { (document.activeElement as HTMLElement)?.blur(); setShowUpsell(false); setCurrentStep(4); }}
                onBack={() => { (document.activeElement as HTMLElement)?.blur(); setShowUpsell(false); setCurrentStep(3); }}
              />
            )}


            {/* Step 4 - Contact */}
            {currentStep === 4 && !showUpsell && (
              <QuizStepContact
                formData={formData}
                updateFormData={updateFormData}
                scrollContainerRef={scrollContainerRef}
              />
            )}


      </div>
    </div>

    {/* Footer — hidden on step 0 (auto-advances on city selection) */}
    {currentStep <= totalSteps && !showUpsell && currentStep > 0 && (
      <div className="px-4 sm:px-5 pt-3 flex flex-col gap-2 flex-shrink-0 border-t border-white/[0.05] items-center" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {currentStep === totalSteps ? (
          <div className="flex flex-col gap-2 w-full">
            {totalPrice > 0 && (
              <p className="text-center text-[10px] text-white/25 font-medium tracking-wide">
                Preço final: <span className="text-gold/60 font-bold">{packDiscountActive ? `${packDiscountedPrice}€` : `${totalPrice}€`}</span>
              </p>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-xl shadow-[0_0_32px_rgba(212,175,55,0.30)]"
            >
              {isSubmitting ? 'A enviar...' : 'FINALIZAR PEDIDO'}
            </Button>
            <p className="text-center text-[11px] text-white/30 font-medium -mt-0.5">
              Sem compromisso · Grátis · Respondemos em menos de 1h
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
                className="h-10 px-5 flex-shrink-0 bg-transparent border border-white/[0.12] text-white/45 hover:text-white/75 hover:border-white/25 active:bg-transparent active:scale-[0.98] touch-manipulation rounded-xl flex items-center justify-center transition-all text-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Voltar
              </button>
            )}
            {currentStep >= 3 && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold touch-manipulation active:scale-[0.98] disabled:opacity-35 rounded-xl shadow-[0_4px_28px_rgba(212,175,55,0.40)] transition-shadow"
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
    <div className="border-t border-gold/[0.10] px-4 py-2 text-center flex-shrink-0 bg-[#061410] flex items-center justify-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-gold/55 animate-pulse flex-shrink-0" />
      <p className="text-[11px] text-white/45 font-medium transition-all duration-700">
        {socialProofMessages[socialProofIdx]}
      </p>
    </div>

    {showExitIntent && (
      <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md rounded-t-3xl sm:rounded-2xl" style={{ background: "rgba(5,21,16,0.92)" }}>
        <div className="px-7 py-8 text-center max-w-xs mx-auto">
          <AlertTriangle className="w-12 h-12 text-gold mb-4 mx-auto" />
          <h3 className="font-playfair text-2xl font-bold text-white mb-3 leading-tight">
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
              className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] touch-manipulation active:scale-[0.98]"
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
