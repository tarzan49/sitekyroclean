import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ChevronRight, ChevronLeft, Check, MessageSquare, Euro, Flame, MapPin, Users, Camera, Shield, AlertTriangle, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackQuizEvent } from '@/lib/quizTracking';
import { useQuizAnalytics } from '@/hooks/use-quiz-analytics';
import ConfettiGold from './quiz/ConfettiGold';
import {
  QuizStep1Service,
  ServiceTypeSelector,
  QuizStepCalendar,
  QuizFormData,
  initialFormData,
  sofaPrices,
  mattressPrices,
  sofaChaisePrice,
  locationPrices,
} from './quiz';

interface UpsellItemConfig {
  id: string;
  sofaSize?: string;
  mattressSize?: string;
  carpetArea?: string;
  chairQty?: string;
  qty?: number;
  price: number;
  label: string;
  waterproof?: boolean;
  waterproofPrice?: number;
  chaiseLongue?: boolean;
}

// ── Step-2 item types (previously in sub-component files) ─────────────────
export interface SofaItem    { sizeId: string; qty: number; packEnabled: boolean; }
export interface MattressItem { sizeId: string; qty: number; packEnabled: boolean; }

// ── Sofa helpers ──────────────────────────────────────────────────────────
function sofaSetQty(items: SofaItem[], sizeId: string, newQty: number): SofaItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
function sofaTogglePack(items: SofaItem[], sizeId: string): SofaItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}

// ── Mattress helpers ──────────────────────────────────────────────────────
function mattressSetQty(items: MattressItem[], sizeId: string, newQty: number): MattressItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
function mattressTogglePack(items: MattressItem[], sizeId: string): MattressItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}

// ── Carpet constants ──────────────────────────────────────────────────────
const CARPET_TIERS = [
  { label: 'Até 5 m²',   sublabel: 'Pequenos', rate: 10,   max: 5 },
  { label: '5 a 10 m²',  sublabel: 'Médios',   rate: 8,    max: 10 },
  { label: '10 a 15 m²', sublabel: 'Grandes',  rate: 7,    max: 15 },
  { label: '+15 m²',     sublabel: 'Extra',    rate: null, max: Infinity },
];
function carpetActiveTier(area: number): number {
  if (area <= 5) return 0; if (area <= 10) return 1; if (area <= 15) return 2; return 3;
}
function calcCarpetPrice(area: number): number | null {
  if (area <= 0) return null;
  if (area <= 5)  return area * 10;
  if (area <= 10) return Math.max(50, area * 8);
  if (area <= 15) return Math.max(80, area * 7);
  return null;
}

// ── Chair constants ───────────────────────────────────────────────────────
const CHAIR_TIERS = [
  { label: 'Até 3', sublabel: 'cadeiras', rate: 17.5 },
  { label: '4 a 6', sublabel: 'cadeiras', rate: 15 },
  { label: '7 a 10', sublabel: 'cadeiras', rate: 12.5 },
  { label: '+10',   sublabel: 'cadeiras', rate: null },
];
function chairActiveTier(qty: number): number {
  if (qty <= 3) return 0; if (qty <= 6) return 1; if (qty <= 10) return 2; return 3;
}
function calcChairClean(qty: number): number | null {
  if (qty <= 0 || qty > 10) return null;
  if (qty <= 3)  return qty * 17.5;
  if (qty <= 6)  return Math.max(52.5, qty * 15);
  return Math.max(90, qty * 12.5);
}
function fmtN(n: number): string { return n % 1 === 0 ? `${n}€` : `${n.toFixed(1).replace('.', ',')}€`; }

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  problema?: string;
}

const QuizForm = ({ isOpen, onClose, initialLocation, problema }: QuizFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => initialLocation ? 1 : 0);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationFadeIn, setLocationFadeIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(10 * 60);
  const [displayPrice, setDisplayPrice] = useState(0);
  const [hypoallergenic, setHypoallergenic] = useState<boolean | null>(null);
  const [socialProofIdx, setSocialProofIdx] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentFired, setExitIntentFired] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellShown, setUpsellShown] = useState(false);
  const [upsellItems, setUpsellItems] = useState<UpsellItemConfig[]>([]);
  const [upsellSubStep, setUpsellSubStep] = useState<'select' | 'config'>('select');
  const [pendingUpsellId, setPendingUpsellId] = useState<string | null>(null);
  const [pendingSofaItems, setPendingSofaItems] = useState<SofaItem[]>([]);
  const [pendingMattressItems, setPendingMattressItems] = useState<MattressItem[]>([]);
  const [pendingUpsellChaiseLongueQty, setPendingUpsellChaiseLongueQty] = useState(0);
  const [pendingCarpetArea, setPendingCarpetArea] = useState('');
  const [pendingChairQty, setPendingChairQty] = useState('');
  const [pendingChairQtyNum, setPendingChairQtyNum] = useState(1);
  const [pendingWaterproof, setPendingWaterproof] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [timerFlash, setTimerFlash] = useState(false);
  const [sofaItems, setSofaItems] = useState<SofaItem[]>([]);
  const [mattressItems, setMattressItems] = useState<MattressItem[]>([]);
  const [chaiseLongueQty, setChaiseLongueQty] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);
  const prevTotalRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const quizCardRef = useRef<HTMLDivElement>(null);
  const quizOverlayRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<QuizFormData>(() => ({
    ...initialFormData,
    location: initialLocation || '',
  }));

  const totalSteps = 5;

  // ── KEYBOARD-AWARE CARD HEIGHT ─────────────────────────────────────────────
  // Only adjusts the card max-height so it fits above the keyboard.
  // Scroll behaviour is handled directly in onFocus on the input.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const card = quizCardRef.current;
      if (!card) return;
      const kbHeight = window.innerHeight - vv.height - vv.offsetTop;
      card.style.maxHeight = kbHeight > 80 ? `${vv.height * 0.96}px` : '';
    };
    vv.addEventListener('resize', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      if (quizCardRef.current) quizCardRef.current.style.maxHeight = '';
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
        if (chaiseLongueQty > 0 && hasSofas) {
          price += chaiseLongueQty * sofaChaisePrice.cleaning;
        }
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
          if (chairQty <= 3) price = chairQty * 17.5;
          else if (chairQty <= 6) price = Math.max(3 * 17.5, chairQty * 15);
          else if (chairQty <= 10) price = Math.max(6 * 15, chairQty * 12.5);
          else price = 0; // >10 → sob orçamento
          if (formData.chairWaterproofing && price > 0) {
            price += chairQty * 10;
          }
        }
        break;
      }

      case 'carpet': {
        const carpetArea = parseFloat(formData.carpetArea);
        if (!isNaN(carpetArea) && carpetArea > 0) {
          if (carpetArea <= 5) price = carpetArea * 10;
          else if (carpetArea <= 10) price = Math.max(5 * 10, carpetArea * 8);
          else if (carpetArea <= 15) price = Math.max(10 * 8, carpetArea * 7);
          else price = 0; // >15m² → sob orçamento
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

  const upsellItemsTotal = upsellItems.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = calculateServicePrice + upsellItemsTotal + finalTravelCost + hypoSurcharge;
  // True when the user has qty>0 of the "4+ lugares" sofa (no fixed price → custom quote)
  const hasSobOrcamento = sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0);
  // Pack 10% activates automatically when total ≥ 200€
  const packDiscountActive = totalPrice >= 200;
  const packDiscountPct = packDiscountActive ? 0.10 : 0;
  const serviceOnlyTotal = calculateServicePrice + upsellItemsTotal + hypoSurcharge;
  const discountedPrice = isDiscountActive && totalPrice > 0
    ? Math.round(serviceOnlyTotal * 0.95) + finalTravelCost
    : Math.round(totalPrice);
  // Pack discount (10%) supersedes timer discount (5%) — never accumulate
  const packDiscountedPrice = packDiscountActive && totalPrice > 0
    ? Math.round(serviceOnlyTotal * (1 - packDiscountPct)) + finalTravelCost
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
        return isNaN(chairQty) || chairQty <= 0 || chairQty > 10;
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

  // Lock body scroll when quiz is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('quizStateChange', { detail: { isOpen: true } }));
    } else {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('quizStateChange', { detail: { isOpen: false } }));
    }

    return () => {
      document.body.style.overflow = '';
    };
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
        // Expired — start fresh
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
    `12 pessoas pediram orçamento em ${formData.location || 'Porto'} hoje`,
    `Alguém acabou de reservar em ${formData.location || 'Porto'}`,
    `Técnicos disponíveis na sua zona hoje`,
    `Satisfação 5.0, mais de 50 avaliações verificadas`,
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

  // Confetti when pack discount activates (total ≥ 200€)
  useEffect(() => {
    if (packDiscountActive && !prevTotalRef.current) {
      setConfettiActive(true);
      toast({
        title: 'Desconto de 10% ativado!',
        description: 'O seu pedido atingiu 200€ — desconto aplicado automaticamente.',
        duration: 4000,
      });
      const id = setTimeout(() => setConfettiActive(false), 4500);
      prevTotalRef.current = 1;
      return () => clearTimeout(id);
    }
    if (!packDiscountActive) prevTotalRef.current = 0;
  }, [packDiscountActive]); // eslint-disable-line react-hooks/exhaustive-deps

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
        const hasQty = sofaItems.some(i => i.qty > 0);
        if (!hasQty) return false;
        if (sofaItems.some(i => i.sizeId === '4+-lugares' && i.qty > 0)) {
          return formData.description.trim().length >= 3;
        }
        return true;
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
  const firstStep = needsLocationStep ? 0 : 1;

  // Step order: [0-Location?], 1-Service, 2-ServiceType, 3-Config, [Upsell], 4-Contact, 5-Calendar
  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.location !== '' && formData.location !== 'other';
      case 1: return formData.service !== '';
      case 2: return formData.serviceType !== '';
      case 3: return canProceedStep3();
      case 4: return formData.name.trim() !== '' && formData.phone.trim() !== '';
      case 5: return formData.selectedSlot !== '';
      default: return false;
    }
  };

  // Sofa & mattress now show their own 2-card step 2 (Higienização / Impermeabilização)
  const shouldSkipServiceType = formData.service === 'carpet'
    || formData.service === 'chairs';

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
        setUpsellShown(true); // marks that upsell has been shown (used by handlePrev from step 4)
        setShowUpsell(true);
        return;
      }
      if (nextStep <= totalSteps) setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    // If on step 4 (contact) and upsell was shown, go back to upsell
    if (currentStep === 4 && upsellShown) {
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
    let details = [];
    
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
        if (chaiseLongueQty > 0) details.push(`+${chaiseLongueQty}x Chaise Longue (+${chaiseLongueQty * sofaChaisePrice.cleaning}€)`);
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
          const cQty = parseInt(formData.chairQuantity);
          details.push(`${formData.chairQuantity} cadeira(s): Limpeza`);
          if (formData.chairWaterproofing && !isNaN(cQty) && cQty > 0 && cQty <= 10) {
            const wTotal = cQty * 10;
            details.push(`Impermeabilização de ${formData.chairQuantity} cadeira(s): ${wTotal % 1 === 0 ? wTotal : wTotal.toFixed(2).replace('.', ',')}€`);
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
    
    const slotLabel = formatSelectedSlot(formData.selectedSlot);

    const message = `
[QUIZ RÁPIDO - Kyro Clean Solutions]

Serviço: ${serviceLabel}
Tipo: ${serviceTypeLabel}
Detalhes: ${detailsSummary}
Localização: ${finalLocation}
Deslocação: ${isFreeTravel ? 'Grátis (pedido >150€)' : `${finalTravelCost}€`}
VALOR TOTAL (IVA incl.): ${priceText}
Vaga escolhida: ${slotLabel}
Contacto preferido: WhatsApp

Observações:
${formData.description || 'Sem observações adicionais'}
    `.trim();

    try {
      // Submit to Formspree via FormData (supports file uploads)
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('phone', formData.phone);
      if (formData.email.trim()) formPayload.append('email', formData.email);
      formPayload.append('location', finalLocation);
      formPayload.append('message', message);
      formPayload.append('subject', `Pedido de orçamento - ${serviceLabel}`);
      (formData.photos || []).forEach((photo, i) => {
        formPayload.append(`foto_${i + 1}`, photo, photo.name);
      });

      const response = await fetch('https://formspree.io/f/xreozzbp', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formPayload,
      });

      console.log('[QuizForm] Formspree response status:', response.status);

      if (!response.ok) {
        throw new Error('Erro ao enviar');
      }

      // Track successful submission
      trackSubmission();

      // Generate unique booking ID
      const bookingId = Math.random().toString(36).substr(2, 8).toUpperCase();

      // Persist lead to Supabase CRM (silent fail — Formspree is the primary capture)
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
          slot: formatSelectedSlot(formData.selectedSlot),
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
      sessionStorage.setItem('kyro_booking_id', bookingId);

      // Build WA URL for optional support button on Obrigado page
      const [slotDay, slotTime] = (() => {
        if (!formData.selectedSlot) return ['', ''];
        const [dIdx, tIdx] = formData.selectedSlot.split('-').map(Number);
        const d = new Date(); d.setDate(d.getDate() + dIdx);
        const times = ['09:00', '14:00', '17:00'];
        return [`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, times[tIdx] ?? ''];
      })();
      const finalPriceText = packDiscountActive && totalPrice > 0
        ? `${packDiscountedPrice}€ (Pack -${Math.round(packDiscountPct * 100)}%)`
        : discountedPrice > 0
          ? `${discountedPrice}€${isDiscountActive ? ` (5% desconto)` : ''}`
          : 'Sob orçamento';
      const hypoText = hypoallergenic === true ? `\nProdutos Hipoalergénicos +${hypoSurcharge}€` : '';
      const waExtras: string[] = [];
      if (serviceTypeLabel) waExtras.push(serviceTypeLabel);
      if (hypoallergenic === true) waExtras.push(`Produtos Hipoalergénicos (+${hypoSurcharge}€)`);
      const waExtrasText = waExtras.length > 0 ? waExtras.join(' + ') : 'Sem extras';
      const waTotalPrice = packDiscountActive && totalPrice > 0
        ? `${packDiscountedPrice}€ (Pack -${Math.round(packDiscountPct * 100)}%) (IVA incl.)`
        : discountedPrice > 0
          ? `${discountedPrice}€${isDiscountActive ? ' (desc. 5%)' : ''} (IVA incl.)`
          : 'Sob orçamento';

      const waText = encodeURIComponent(
        `Olá Kyro Clean Solutions. Acabei de gerar um orçamento detalhado no site e pretendo confirmar o agendamento.\n\n` +
        `DADOS DO PEDIDO:\n` +
        `▸ Serviço: ${serviceLabel}\n` +
        `▸ Item: ${detailsSummary || '—'}\n` +
        `▸ Extras: ${waExtrasText}\n` +
        `▸ Localização: ${finalLocation}\n` +
        `▸ Valor Total: ${waTotalPrice}\n` +
        `▸ Vaga Pretendida: ${slotDay} às ${slotTime}\n` +
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
        if (chaiseLongueQty > 0 && sofaItems.some(i => i.qty > 0)) {
          receiptLines.push({ label: 'Chaise Longue', qty: chaiseLongueQty, unitPrice: sofaChaisePrice.cleaning, total: chaiseLongueQty * sofaChaisePrice.cleaning });
        }
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
          const unitChair = cQty <= 3 ? 17.5 : cQty <= 6 ? 15 : 12.5;
          const totalChairClean = cQty <= 3 ? cQty * 17.5 : cQty <= 6 ? Math.max(3 * 17.5, cQty * 15) : Math.max(6 * 15, cQty * 12.5);
          receiptLines.push({ label: 'Cadeiras', qty: cQty, unitPrice: unitChair, total: totalChairClean });
          if (formData.chairWaterproofing) receiptLines.push({ label: 'Impermeabilização Cadeiras', qty: cQty, unitPrice: 10, total: cQty * 10 });
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
      const discountAmt = packDiscountActive ? Math.round((totalPrice - packDiscountedPrice) * 100) / 100 : isDiscountActive ? Math.round((totalPrice - discountedPrice) * 100) / 100 : 0;
      sessionStorage.setItem('kyro_receipt', JSON.stringify({
        lines: receiptLines,
        subtotal: totalPrice,
        discountLabel: packDiscountActive ? `Pack Família −${Math.round(packDiscountPct * 100)}%` : isDiscountActive && totalPrice > 0 ? 'Desconto Agenda −5%' : null,
        discountAmount: discountAmt,
        total: packDiscountActive ? packDiscountedPrice : isDiscountActive && totalPrice > 0 ? discountedPrice : totalPrice,
        location: finalLocation,
        slot: formatSelectedSlot(formData.selectedSlot),
        bookingId,
        name: formData.name,
      }));

      // Store for Obrigado page
      sessionStorage.setItem('kyro_wa_url', `https://wa.me/351925530647?text=${waText}`);
      sessionStorage.setItem('kyro_summary', JSON.stringify({
        price: finalPriceText,
        service: `${serviceLabel}${serviceTypeLabel ? `: ${serviceTypeLabel}` : ''}`,
        location: finalLocation,
        email: formData.email,
      }));

      resetForm();
      onClose();
      navigate('/obrigado');
    } catch (error) {
      console.error('[QuizForm] Submit error:', error);
      
      const whatsappMessage = encodeURIComponent(
        `Olá! Tentei pedir orçamento pelo site mas houve um erro.\n\n` +
        `Nome: ${formData.name}\n` +
        `Tel: ${formData.phone}\n` +
        (formData.email ? `Email: ${formData.email}\n` : '') +
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
                href={`https://wa.me/351925530647?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                WhatsApp
              </a>
              <a 
                href={`mailto:cleansolutions.pt25@gmail.com?subject=Pedido%20Orçamento&body=${whatsappMessage}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Email
              </a>
            </div>
          </div>
        ) as any,
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
    setFormData({ ...initialFormData, location: initialLocation || '' });
    setCurrentStep(initialLocation ? 1 : 0);
    setLocationQuery('');
    setLocationFadeIn(false);
    setHypoallergenic(null);
    setSocialProofIdx(0);
    setShowExitIntent(false);
    setExitIntentFired(false);
    setShowUpsell(false);
    setUpsellShown(false);
    setUpsellItems([]);
    setUpsellSubStep('select');
    setPendingUpsellId(null);
    setPendingSofaItems([]);
    setPendingMattressItems([]);
    setPendingUpsellChaiseLongueQty(0);
    setPendingCarpetArea('');
    setPendingChairQty('');
    setPendingChairQtyNum(1);
    setPendingWaterproof(false);
    setShowSummary(false);
    setTimerFlash(false);
    setSofaItems([]);
    setMattressItems([]);
    setChaiseLongueQty(0);
    setConfettiActive(false);
  };

  const handleClose = () => {
    if (!exitIntentFired && currentStep > 0) {
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

  const renderStep2 = () => {
    // ── SOFÁS ──────────────────────────────────────────────────────────────
    if (formData.service === 'sofa') {
      const hasSofas = sofaItems.some(i => i.qty > 0);
      const has4Plus = (sofaItems.find(i => i.sizeId === '4+-lugares')?.qty ?? 0) > 0;
      return (
        <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
          <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
          <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do(s) Sofá(s)</h2>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {sofaPrices.map(option => {
              const item = sofaItems.find(i => i.sizeId === option.id);
              const qty = item?.qty ?? 0; const packOn = item?.packEnabled ?? false; const isActive = qty > 0;
              const isSob = typeof option.cleaningPrice !== 'number';
              const isWaterproofBase = formData.serviceType === 'waterproofing';
              const cleanPrice = isSob ? null : (option.cleaningPrice as number);
              const waterPrice = (!isSob && typeof option.waterproofingPrice === 'number') ? (option.waterproofingPrice as number) : null;
              const basePrice = isWaterproofBase ? waterPrice : cleanPrice;
              const bothFullP = !isSob && typeof option.bothPrice === 'number' ? (option.bothPrice as number) : null;
              const packPrice = bothFullP ?? (basePrice !== null ? basePrice + 40 : null);
              const packDelta = packPrice !== null && basePrice !== null ? packPrice - basePrice : 40;
              const dp = packOn && packPrice !== null ? packPrice : basePrice;
              const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Proteção Total VIP';
              const upsellSub = isWaterproofBase ? `+${packDelta}€/un. · Limpeza profunda incluída` : `+${packDelta}€/un. · Impermeabilização completa`;
              return (
                <div key={option.id} className={cn('rounded-xl border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#252931] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#252931] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-white/[0.18] bg-[#252931]')}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <span className="text-sm font-semibold text-white">{option.label}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">PACK</span>}
                        {isActive && packOn && typeof option.originalBothPrice === 'number' && (
                          <span className="text-sm text-white/30 line-through tabular-nums">{option.originalBothPrice}€</span>
                        )}
                        <span className={cn('text-sm font-bold tabular-nums', isSob ? isActive ? 'text-white/70' : 'text-white/35' : isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40')}>
                          {isSob ? 'Sob Orçamento' : `${dp}€/un.`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty - 1))} disabled={qty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                      <span className={cn('w-6 text-center font-bold tabular-nums text-sm', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                      <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty + 1))} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                    </div>
                  </div>
                  {isActive && !isSob && basePrice !== null && (
                    <div className="px-4 pb-3">
                      <button onClick={() => setSofaItems(sofaTogglePack(sofaItems, option.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-white/10 bg-[#252931] hover:border-gold/30')}>
                        <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                        <div className="flex-1 text-left">
                          <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>{upsellLabel}</p>
                          <p className={cn('text-[9px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>{upsellSub}</p>
                        </div>
                        <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                          <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {has4Plus && <input placeholder="Indica quantos lugares tem o sofá" className="w-full max-w-sm bg-white/[0.06] border border-white/15 focus:border-gold focus:outline-none text-white placeholder:text-white/25 rounded-xl h-11 px-4 text-sm transition-colors" onChange={(e) => updateFormData({ description: `Sofá com ${e.target.value} lugares` })} />}
          <div className={cn('w-full max-w-sm rounded-xl border-2 transition-all duration-200', chaiseLongueQty > 0 ? 'border-gold/60 bg-[#252931] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-white/[0.18] bg-[#252931]')}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 min-w-0 mr-3">
                <span className={cn('text-sm font-semibold', chaiseLongueQty > 0 ? 'text-white' : 'text-white/50')}>Chaise Longue</span>
                <div className="mt-0.5">
                  <span className={cn('text-sm font-bold tabular-nums', chaiseLongueQty > 0 ? 'text-gold' : 'text-white/30')}>+{sofaChaisePrice.cleaning}€/un.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setChaiseLongueQty(q => Math.max(0, q - 1))} disabled={chaiseLongueQty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                <span className={cn('w-6 text-center font-bold tabular-nums text-sm', chaiseLongueQty > 0 ? 'text-gold' : 'text-white/30')}>{chaiseLongueQty}</span>
                <button onClick={() => setChaiseLongueQty(q => q + 1)} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-white/20 text-center tracking-wide uppercase">Valores com IVA incluído</p>
        </div>
      );
    }

    // ── COLCHÕES ───────────────────────────────────────────────────────────
    if (formData.service === 'mattress') {
      const hasItems = mattressItems.some(i => i.qty > 0);
      return (
        <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
          <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
          <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do(s) Colchão(ões)</h2>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {mattressPrices.map(option => {
              const item = mattressItems.find(i => i.sizeId === option.id);
              const qty = item?.qty ?? 0; const packOn = item?.packEnabled ?? false; const isActive = qty > 0;
              const isWaterproofBase = formData.serviceType === 'waterproofing';
              const cleanPrice = typeof option.cleaningPrice === 'number' ? (option.cleaningPrice as number) : null;
              const waterPrice = typeof option.waterproofingPrice === 'number' ? (option.waterproofingPrice as number) : null;
              const basePrice = isWaterproofBase ? waterPrice : cleanPrice;
              const packPrice = typeof option.bothPrice === 'number' ? (option.bothPrice as number) : null;
              const dp = packOn && packPrice !== null ? packPrice : basePrice;
              const packDelta = packPrice !== null && basePrice !== null ? packPrice - basePrice : null;
              const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Proteção Total VIP';
              const upsellSub = isWaterproofBase
                ? `${packDelta !== null ? `+${packDelta}€/un.` : '+?€/un.'} · Limpeza profunda incluída`
                : `${packDelta !== null ? `+${packDelta}€/un.` : '+?€/un.'} · Proteção até 10 anos`;
              return (
                <div key={option.id} className={cn('rounded-xl border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#252931] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#252931] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-white/[0.18] bg-[#252931]')}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <span className="text-sm font-semibold text-white">{option.label}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">VIP</span>}
                        {isActive && packOn && basePrice !== null && (
                          <span className="text-sm text-white/30 line-through tabular-nums">{basePrice}€</span>
                        )}
                        <span className={cn('text-sm font-bold tabular-nums', isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40')}>{dp !== null ? `${dp}€/un.` : 'Sob Orçamento'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty - 1))} disabled={qty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                      <span className={cn('w-6 text-center font-bold tabular-nums text-sm', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                      <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty + 1))} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                    </div>
                  </div>
                  {isActive && basePrice !== null && (
                    <div className="px-4 pb-3">
                      <button onClick={() => setMattressItems(mattressTogglePack(mattressItems, option.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-white/10 bg-[#252931] hover:border-gold/30')}>
                        <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                        <div className="flex-1 text-left">
                          <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>{upsellLabel}</p>
                          <p className={cn('text-[9px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>{upsellSub}</p>
                        </div>
                        <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                          <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-white/20 text-center tracking-wide uppercase">Valores com IVA incluído</p>
        </div>
      );
    }

    // ── TAPETES ────────────────────────────────────────────────────────────
    if (formData.service === 'carpet') {
      const areaNum = parseFloat(formData.carpetArea);
      const validArea = !isNaN(areaNum) && areaNum > 0;
      const activeTierIdx = validArea ? carpetActiveTier(areaNum) : -1;
      const calculatedPrice = validArea ? calcCarpetPrice(areaNum) : null;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }} className="gap-3 py-1">
          <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
          <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do Tapete</h2>
          <div className="w-full max-w-[320px]">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest text-center mb-2">Tabela de preços por m² · IVA incl.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CARPET_TIERS.map((tier, idx) => {
                const isActive = activeTierIdx === idx;
                return (
                  <div key={idx} className={cn('flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 text-center transition-all duration-200', isActive ? 'border-gold bg-[#252931] shadow-[0_0_16px_rgba(212,175,55,0.26)] scale-[1.02]' : 'border-white/[0.18] bg-[#252931]')}>
                    <span className={cn('text-[10px] font-black uppercase tracking-wide leading-none mb-0.5', isActive ? 'text-gold' : 'text-white')}>{tier.label}</span>
                    <span className={cn('text-[9px] leading-none mb-1.5', isActive ? 'text-white/80' : 'text-white/50')}>{tier.sublabel}</span>
                    {tier.rate !== null ? (
                      <div className="flex items-end gap-0.5 leading-none">
                        <span className={cn('font-playfair text-2xl font-bold tabular-nums leading-none', isActive ? 'text-gold' : 'text-white/70')}>{tier.rate}€</span>
                        <span className={cn('text-[9px] font-semibold pb-0.5', isActive ? 'text-gold/70' : 'text-white/40')}>/m²</span>
                      </div>
                    ) : <span className={cn('font-playfair text-sm font-bold', isActive ? 'text-gold' : 'text-white/60')}>Orçamento</span>}
                    {isActive && <span className="mt-1 text-[7px] font-black uppercase tracking-widest text-gold/80 bg-gold/10 px-1.5 py-0.5 rounded-full leading-none">ativo</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full max-w-[320px]">
            <label className="block text-[10px] font-bold text-white uppercase tracking-wider text-center mb-1.5">Área total de todos os tapetes (m²)</label>
            <div className="relative">
              <Input type="number" inputMode="decimal" min="0" step="0.5" placeholder="Soma total (ex: 12)..." value={formData.carpetArea} onChange={(e) => updateFormData({ carpetArea: e.target.value })} className={cn('text-lg font-bold bg-white/[0.07] text-white placeholder:text-white/25 h-11 pr-12 rounded-xl border-2 transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0', validArea ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.18)]' : 'border-white/20')} />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gold/60 pointer-events-none">m²</span>
            </div>
            <p className="text-[10px] text-white/40 text-center mt-1 leading-snug">Se tiver vários tapetes, insira a soma total das áreas.</p>
          </div>
          {validArea && (
            <div className={cn('w-full max-w-[320px] rounded-xl border-2 px-4 py-2.5 transition-all duration-300', calculatedPrice !== null ? 'bg-[#071a12] border-gold shadow-[0_0_14px_rgba(212,175,55,0.18)]' : 'bg-[#0a2218] border-white/15')}>
              {calculatedPrice !== null ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60 leading-none mb-0.5">Estimativa</span>
                    <span className="text-xs font-semibold text-white">{areaNum} m² × {CARPET_TIERS[activeTierIdx].rate}€/m²</span>
                  </div>
                  <div className="text-right">
                    <span className="font-playfair text-2xl font-bold text-gold tabular-nums block leading-none">{Math.round(calculatedPrice)}€</span>
                    <span className="text-[8px] text-white/30 uppercase tracking-wide leading-none">IVA incl.</span>
                  </div>
                </div>
              ) : <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider text-center py-0.5">+15 m²: orçamento personalizado</p>}
            </div>
          )}
        </div>
      );
    }

    // ── CADEIRAS ───────────────────────────────────────────────────────────
    if (formData.service === 'chairs') {
      const qty = parseInt(formData.chairQuantity);
      const validQty = !isNaN(qty) && qty > 0;
      const activeTierIdx = validQty ? chairActiveTier(qty) : -1;
      const cleanPrice = validQty ? calcChairClean(qty) : null;
      const waterRate = validQty && qty <= 10 ? 10 : null;
      const sob = validQty && qty > 10;
      return (
        <div className="flex flex-col gap-2.5 overflow-hidden items-center w-full">
          <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
          <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes das Cadeiras</h2>
          <div className="w-full max-w-sm mx-auto">
            <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest text-center mb-1.5">Limpeza + Higienização por cadeira</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CHAIR_TIERS.map((tier, idx) => {
                const isActive = activeTierIdx === idx;
                return (
                  <div key={idx} className={cn('flex flex-col items-center justify-center py-2 px-2 rounded-xl border-2 text-center transition-all duration-250', isActive ? 'border-gold bg-[#252931] shadow-[0_0_14px_rgba(212,175,55,0.25)] scale-[1.02]' : 'border-white/[0.16] bg-[#252931]')}>
                    <span className={cn('text-[9px] font-black uppercase tracking-wide leading-none mb-0.5', isActive ? 'text-gold/90' : 'text-white/30')}>{tier.label}</span>
                    <span className={cn('text-[8px] leading-none mb-1', isActive ? 'text-white/45' : 'text-white/15')}>{tier.sublabel}</span>
                    {tier.rate !== null ? (
                      <div className="flex items-end gap-0.5 leading-none">
                        <span className={cn('font-playfair text-xl font-bold tabular-nums leading-none', isActive ? 'text-gold' : 'text-white/35')}>{fmtN(tier.rate)}</span>
                        <span className={cn('text-[9px] font-semibold pb-0.5', isActive ? 'text-gold/55' : 'text-white/20')}>/un.</span>
                      </div>
                    ) : <span className={cn('font-playfair text-sm font-bold', isActive ? 'text-gold' : 'text-white/30')}>Orçamento</span>}
                    {isActive && <span className="mt-0.5 text-[7px] font-black uppercase tracking-widest text-gold/65 bg-gold/10 px-1.5 py-0.5 rounded-full leading-none">ativo</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full max-w-sm mx-auto">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider text-center mb-1">Quantas cadeiras deseja higienizar?</label>
            <div className="relative">
              <Input type="number" inputMode="numeric" min="1" step="1" placeholder="Ex: 5..." value={formData.chairQuantity} onChange={(e) => updateFormData({ chairQuantity: e.target.value, chairType: 'bulk_full' })} className={cn('text-lg font-bold bg-white/[0.07] text-white placeholder:text-white/20 h-11 pr-16 rounded-xl border-2 transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0', validQty ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.16)]' : 'border-gold/40')} />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gold/45 pointer-events-none">cadeiras</span>
            </div>
          </div>
          {validQty && !sob && (
            <button onClick={() => updateFormData({ chairWaterproofing: !formData.chairWaterproofing })} className={cn('relative w-full max-w-sm mx-auto rounded-xl border-2 px-3.5 py-2.5 text-left transition-all duration-300 touch-manipulation active:scale-[0.99]', formData.chairWaterproofing ? 'border-gold bg-[#252931] shadow-[0_0_16px_rgba(212,175,55,0.22)]' : 'border-white/[0.12] bg-[#252931] hover:border-gold/40')}>
              <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-md">RECOMENDADO</span>
              <div className="flex items-center gap-3">
                <Shield className={cn('w-5 h-5 flex-shrink-0', formData.chairWaterproofing ? 'text-gold' : 'text-white/30')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-bold leading-snug', formData.chairWaterproofing ? 'text-white' : 'text-white/75')}>Proteger contra manchas e líquidos?</p>
                  <p className={cn('text-[10px] mt-0.5', formData.chairWaterproofing ? 'text-white/50' : 'text-white/30')}>Impermeabilização · {waterRate !== null ? `+${fmtN(waterRate)}/un.` : 'Sob orçamento'}</p>
                </div>
                <div className={cn('w-10 h-5 rounded-full border-2 flex items-center transition-all duration-300 flex-shrink-0 px-0.5', formData.chairWaterproofing ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                  <div className={cn('w-4 h-4 rounded-full transition-all duration-300', formData.chairWaterproofing ? 'bg-gold translate-x-[18px]' : 'bg-white/30 translate-x-0')} />
                </div>
              </div>
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  const modalContent = (
    <div ref={quizOverlayRef} className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-lg p-4 landscape:p-1 landscape:sm:p-4" style={{ background: "rgba(5,21,16,0.82)" }} role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <div
        ref={quizCardRef}
        className={cn(
          "relative w-full sm:max-w-lg rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] border border-white/[0.18] overflow-hidden animate-scale-in flex flex-col gpu-accelerated bg-checker-modal",
          currentStep === totalSteps ? "h-auto" : "max-h-[92dvh] landscape:max-h-[98dvh]"
        )}>

        <ConfettiGold active={confettiActive} />

        {/* Header */}
        <div className="px-5 sm:px-6 pt-3 sm:pt-5 pb-2 sm:pb-3 landscape:pt-2 landscape:pb-1.5 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
          <span id="quiz-title" className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase">
            ORÇAMENTO RÁPIDO · KYRO
          </span>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors touch-manipulation"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Urgency bar — no pack info on calendar step, hidden in landscape */}
        <div className={cn(
          "text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-between flex-shrink-0 transition-all duration-500 landscape:hidden landscape:sm:flex",
          packDiscountActive && currentStep !== 5
            ? timerFlash ? "bg-gold/25" : "bg-gold/12"
            : countdown === 0 ? "bg-white/[0.09]" : countdown < 120 ? "bg-red-900/50" : "bg-amber-900/35"
        )}>
          {packDiscountActive && currentStep !== 5 ? (
            <>
              <span className="flex items-center gap-1.5">
                <Check className={cn("w-4 h-4 flex-shrink-0 text-gold", timerFlash && "animate-bounce")} />
                <span className={cn("font-bold", timerFlash ? "text-gold animate-pulse" : "text-gold/90")}>
                  Desconto de 10% ativado!
                </span>
              </span>
              <span className="font-mono bg-gold/20 px-2 py-0.5 rounded text-sm tabular-nums font-black text-gold">
                −{Math.round(packDiscountPct * 100)}%
              </span>
            </>
          ) : countdown > 0 ? (
            <>
              <span className="flex items-center gap-1.5">
                <Flame className={cn("w-3.5 h-3.5 flex-shrink-0 text-gold", countdown < 120 && "animate-pulse")} />
                <span className="text-white/60">
                  {countdown < 120 ? "Urgente! Desconto expira em:" : "Alta procura. Valor com desconto garantido por:"}
                </span>
              </span>
              <span className={cn(
                "font-mono bg-white/10 px-2 py-0.5 rounded text-sm tabular-nums font-bold",
                countdown < 120 ? "text-red-300" : "text-gold"
              )}>
                {formatCountdown(countdown)}
              </span>
            </>
          ) : (
            <span className="text-white/25 text-[11px] w-full text-center">Preço padrão em vigor</span>
          )}
        </div>

        {/* Gold progress bar */}
        <div className="h-[3px] bg-white/[0.05] flex-shrink-0 overflow-hidden">
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
            "flex flex-col overflow-x-hidden flex-1 quiz-scrollbar px-5 sm:px-6",
            "min-h-[200px] sm:min-h-[380px] landscape:min-h-[120px] overflow-y-auto"
          )}
        >

          {/* Animated price ticker
              — hidden: step 2 (treatment selector, sem qtds), step 5 (calendar)
              — visível: step 3 (quantidades) e step 4 (contacto) quando totalPrice > 0
              — também visível em step 1 quando há custo de deslocação */}
          {(totalPrice > 0 || hasSobOrcamento) && (showUpsell || finalTravelCost > 0 || (currentStep !== 1 && currentStep !== 2 && currentStep !== 5)) && (
            <div className="sticky top-0 z-20 text-white flex items-center justify-between py-3 border-b border-white/[0.16] -mx-5 sm:-mx-6 px-5 sm:px-6 animate-fade-in" style={{ background: "#071a12" }}>
              <span className="text-xs text-white/40 font-medium">
                {calculateServicePrice === 0 && finalTravelCost > 0
                  ? <span>Deslocação <span className="text-white/20 text-[10px]">({formData.location})</span></span>
                  : <>Estimativa <span className="text-[10px] text-white/20">(IVA incl.)</span></>
                }
              </span>
              <div className="flex items-center gap-3 pr-8">
                {(packDiscountActive || isDiscountActive) && totalPrice > 0 && (
                  <span className="text-sm text-white/25 line-through tabular-nums">{Math.round(displayPrice)}€</span>
                )}
                {totalPrice > 0 && (
                  <span className="text-xl font-bold tabular-nums" style={{ color: '#D4AF37' }}>
                    {packDiscountActive
                      ? `${Math.round(displayPrice * (1 - packDiscountPct))}€`
                      : isDiscountActive
                        ? `${Math.round(displayPrice * 0.95)}€`
                        : `${Math.round(displayPrice)}€`}
                  </span>
                )}
                {hasSobOrcamento && (
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#D4AF37' }}>
                    {totalPrice > 0 ? '+ Sob Orçamento' : 'Sob Orçamento'}
                  </span>
                )}
                {(packDiscountActive || isDiscountActive) && totalPrice > 0 && (
                  <span className="text-[10px] font-bold bg-gold/15 text-gold px-2 py-0.5 rounded-full">
                    {packDiscountActive ? `−${Math.round(packDiscountPct * 100)}% Pack` : '−5%'}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col py-3 sm:py-5 w-full items-center text-center">

            {/* Step 0 — Location Autocomplete VIP */}
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
              <div
                ref={locationSectionRef}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' }}
                className="flex-1"
              >
                <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-2">LOCALIZAÇÃO</p>
                <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-1 leading-[1.3]">
                  Onde está localizado?
                </h2>
                <p className="text-xs text-white/35 mb-3">
                  Para calcular deslocação e disponibilidade da equipa.
                </p>

                {!formData.location && (
                  <div className="w-full max-w-sm">
                    {/* Full-background city image cards — hidden while typing */}
                    {!locationQuery && <div className="flex flex-col gap-2 mb-3">
                      {[
                        { city: 'Porto',  img: '/cities/porto.webp'  },
                        { city: 'Lisboa', img: '/cities/lisboa.webp' },
                        { city: 'Braga',  img: '/cities/braga.webp'  },
                      ].map(({ city, img }) => {
                        const isSelected = formData.location === city;
                        return (
                          <button
                            key={city}
                            onClick={() => {
                              updateFormData({ location: city });
                              setLocationQuery(city);
                              setLocationFadeIn(true);
                              // Auto-advance to service selection — no extra tap needed
                              setCurrentStep(1);
                            }}
                            className={cn(
                              "relative w-full h-[72px] rounded-2xl overflow-hidden transition-all duration-200 touch-manipulation active:scale-[0.98]",
                              isSelected
                                ? "ring-4 ring-gold shadow-[0_0_24px_rgba(212,175,55,0.45)]"
                                : "hover:ring-2 hover:ring-gold/40 shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                            )}
                          >
                            {/* Background image */}
                            <img
                              src={img}
                              alt={city}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Dark overlay for legibility */}
                            <div className="absolute inset-0 bg-black/55" />
                            {/* Text content */}
                            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-0.5">
                              <span className="font-playfair text-xl font-bold text-white drop-shadow-md">
                                {city}
                              </span>
                              <span className="text-xs text-white/80 drop-shadow-sm">
                                {locationPrices[city] === 0
                                  ? 'Deslocação incluída'
                                  : `+${locationPrices[city]}€ deslocação`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>}

                    <div className="w-full rounded-2xl border-2 border-white/20 bg-[#252931] px-4 py-3 mb-1">
                      {!locationQuery && <p className="text-[11px] text-white/50 text-center mb-2 font-medium">
                        Não encontra a sua cidade?
                      </p>}
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                        <input
                          ref={locationInputRef}
                          type="text"
                          placeholder="Escreva o nome da cidade..."
                          value={locationQuery}
                          onChange={(e) => {
                            setLocationQuery(e.target.value);
                            setLocationFadeIn(false);
                          }}
                          onFocus={() => {
                            // iOS Safari auto-scrolls the focused input into view, pushing
                            // the title above the visible area. We reset scrollTop multiple
                            // times to win against the browser's auto-scroll.
                            const resetScroll = () => {
                              const el = scrollContainerRef.current;
                              if (!el) return;
                              // Scroll container to show title at top with small offset
                              // so it feels balanced, not crammed to the edge
                              el.scrollTop = 0;
                            };
                            resetScroll();
                            setTimeout(resetScroll, 100);
                            setTimeout(resetScroll, 300);
                            setTimeout(resetScroll, 500);
                          }}
                          autoComplete="off"
                          inputMode="search"
                          className="w-full h-11 pl-9 pr-4 text-base bg-[#252931] border border-white/15 focus:border-gold focus:outline-none rounded-xl transition-colors text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {locationQuery.length >= 1 && !formData.location && (() => {
                  const q = locationQuery.toLowerCase();
                  const matches = Object.keys(locationPrices).filter(c => c.toLowerCase().includes(q)).slice(0, 6);
                  return (
                    <div className="w-full max-w-sm mx-auto mb-2">
                      {matches.length > 0 ? (
                        <div className="border border-white/[0.16] rounded-xl overflow-hidden mb-4 bg-[#252931]">
                          {matches.map((city) => (
                            <button
                              key={city}
                              onClick={() => {
                                updateFormData({ location: city });
                                setLocationQuery(city);
                                setLocationFadeIn(true);
                                setCurrentStep(1);
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gold/10 active:bg-gold/15 border-b border-white/[0.05] last:border-0 transition-colors touch-manipulation"
                            >
                              <span className="font-medium text-white text-sm">{city}</span>
                              <span className="text-[11px] text-gold/60">
                                {locationPrices[city] === 0 ? 'Deslocação grátis' : `+${locationPrices[city]}€`}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-white/25 text-center py-4">
                          Cidade não encontrada. Tente "Porto", "Braga", "Maia"...
                        </p>
                      )}
                    </div>
                  );
                })()}



              </div>
            )}

            {/* Step 1 — Service Selector */}
            {currentStep === 1 && (
              <div className="w-full flex flex-col items-center">
                <QuizStep1Service
                  selectedService={formData.service}
                  onSelect={(service) => {
                    updateFormData({ service, serviceType: service === 'carpet' ? 'cleaning' : '', sofaSize: '', mattressSize: '', chairType: '', carpetArea: '', chairWaterproofing: false });
                    setSofaItems([]);
                    setMattressItems([]);
                    setUpsellItems([]);
                    setUpsellShown(false);
                    setTimeout(() => setCurrentStep(service === 'carpet' ? 3 : 2), 180);
                  }}
                />
              </div>
            )}

            {/* Step 2 - Service Type */}
            {currentStep === 2 && (() => {
              const cleanPrice = formData.service === 'mattress' ? 39 : 49;
              const waterPrice = formData.service === 'sofa' ? 49
                : formData.service === 'mattress' ? 45
                : undefined;
              // No Pack card on step 2 — upsell is inline per-item in step 3
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
                  />
                  <p className="text-[9px] text-white/20 uppercase tracking-widest text-center mt-1">
                    Todos os valores incluem IVA à taxa legal em vigor
                  </p>
                </div>
              );
            })()}

            {/* Step 3 - Config (hidden while Pack Família overlay is active) */}
            {currentStep === 3 && !showUpsell && (
              <div className="flex-1 flex flex-col w-full items-center text-center overflow-y-auto">
                {renderStep2()}
              </div>
            )}

            {/* Step 5 - Calendar */}
            {currentStep === 5 && !showUpsell && (
              <div className="w-full flex flex-col items-center">
                <QuizStepCalendar
                  selectedSlot={formData.selectedSlot}
                  onSelect={(slot) => updateFormData({ selectedSlot: slot })}
                  cityName={formData.location || 'Porto'}
                />
              </div>
            )}


            {/* Upsell Step — multi-item pack with sub-step config */}
            {showUpsell && (
              <div className="flex-1 flex flex-col w-full items-center">

                {/* SUB-STEP: Select items */}
                {upsellSubStep === 'select' && (
                  <div className="flex flex-col w-full items-center text-center">
                    <Users className="w-8 h-8 mb-2 text-gold/60" />
                    <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1">PACK FAMÍLIA</p>
                    <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-1 leading-[1.3]">
                      {packDiscountActive ? 'Desconto de 10% ativado!' : 'Quer adicionar mais artigos?'}
                    </h2>
                    <p className="text-xs text-white/45 max-w-[280px] mx-auto mb-4 leading-relaxed">
                      {packDiscountActive
                        ? <span className="text-gold font-bold">Desconto de 10% aplicado automaticamente ao seu pedido.</span>
                        : <>Pedidos acima de{' '}<span className="text-gold font-bold">200€</span>{' '}têm 10% de desconto automático.</>
                      }
                    </p>

                    {/* Discount tracker — 200€ threshold */}
                    {(() => {
                      const PACK_THRESHOLD = 200;
                      const thresholdMet = totalPrice >= PACK_THRESHOLD;
                      const unlockedPack = packDiscountActive;
                      const progressPct = Math.min(totalPrice / PACK_THRESHOLD * 100, 100);
                      const faltam = Math.max(0, Math.ceil(PACK_THRESHOLD - totalPrice));
                      const msg = unlockedPack
                        ? 'Desconto de 10% ativado automaticamente!'
                        : faltam > 0
                          ? `Faltam apenas ${faltam}€ para o desconto de 10%`
                          : 'Desconto de 10% ativado!';
                      return (
                        <div className={cn(
                          "w-full max-w-xs mx-auto mb-4 rounded-2xl border px-4 py-3 transition-all duration-500",
                          unlockedPack ? "bg-[#252931] border-gold/35" : thresholdMet ? "bg-[#252931] border-white/[0.15]" : "bg-[#252931] border-white/[0.16]"
                        )}>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                            <span className={cn("transition-colors tabular-nums", totalPrice > 0 ? "text-gold/70" : "text-white/25")}>
                              {totalPrice > 0 ? `${Math.round(totalPrice)}€ no carrinho` : 'Carrinho vazio'}
                            </span>
                            <span className={cn("transition-colors", unlockedPack ? "text-gold" : "text-white/25")}>≥200€ → 10%</span>
                          </div>
                          <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all duration-700", unlockedPack ? "bg-gradient-to-r from-[#C9A84C] via-[#f5e27a] to-[#C9A84C]" : "bg-gradient-to-r from-gold/60 to-gold")}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <p className={cn("text-[10px] text-center mt-2 font-medium transition-colors", unlockedPack ? "text-gold font-bold" : thresholdMet ? "text-white/60" : "text-white/35")}>
                            {msg}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Already added upsell items */}
                    {upsellItems.length > 0 && (
                      <div className="w-full max-w-xs mx-auto mb-3 flex flex-col gap-1.5">
                        {upsellItems.map((item, i) => {
                          const labels: Record<string, string> = { sofa: 'Sofá', mattress: 'Colchão', carpet: 'Tapete', chairs: 'Cadeiras' };
                          const detail = item.sofaSize
                            ? `: ${sofaPrices.find(p => p.id === item.sofaSize)?.label ?? item.sofaSize}`
                            : item.mattressSize
                            ? `: ${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? item.mattressSize}`
                            : item.carpetArea ? `: ${item.carpetArea}m²`
                            : item.chairQty ? `: ${item.chairQty}x`
                            : '';
                          const waterproofStr = item.waterproof ? ' + Impermeab.' : '';
                          return (
                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-gold/[0.08] border border-gold/25 rounded-xl text-xs">
                              <span className="text-white/80 font-medium">{labels[item.id] ?? item.id}{detail}{waterproofStr}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gold font-bold">{item.price > 0 ? `${item.price}€` : 'Sob orç.'}</span>
                                <button
                                  onClick={() => setUpsellItems(prev => prev.filter((_, idx) => idx !== i))}
                                  className="text-white/20 hover:text-red-400 transition-colors text-[11px] touch-manipulation"
                                ><X className="w-3 h-3" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Cards for available services to add */}
                    {(() => {
                      const available = ([
                        { id: 'sofa',     img: '/images/services/sofa.webp',    label: 'Sofá',     sublabel: 'a partir de 49€' },
                        { id: 'mattress', img: '/images/services/colchao.webp', label: 'Colchão',  sublabel: 'a partir de 39€' },
                        { id: 'carpet',   img: '/images/services/tapete.webp',  label: 'Tapete',   sublabel: 'a partir de 5€/m²' },
                        { id: 'chairs',   img: '/images/services/cadeira.webp', label: 'Cadeiras', sublabel: '15€/cadeira' },
                      ] as const).filter(o => {
                        if (o.id === formData.service) return false;
                        if (o.id === 'mattress') {
                          const usedSizes = upsellItems.filter(u => u.id === 'mattress').map(u => u.mattressSize);
                          return mattressPrices.some(p => !usedSizes.includes(p.id));
                        }
                        return true;
                      });
                      if (available.length === 0) return null;
                      return (
                        <div className={cn("grid gap-2 w-full max-w-xs mx-auto mb-4", available.length >= 3 ? "grid-cols-3" : available.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
                          {available.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setPendingUpsellId(opt.id);
                                setPendingSofaItems([]);
                                setPendingMattressItems([]);
                                setPendingUpsellChaiseLongueQty(0);
                                setPendingCarpetArea('');
                                setPendingChairQty('');
                                setPendingChairQtyNum(1);
                                setPendingWaterproof(false);
                                setUpsellSubStep('config');
                              }}
                              className="relative overflow-hidden rounded-2xl border border-white/[0.12] aspect-square shadow-lg hover:border-gold/50 hover:shadow-[0_0_14px_rgba(212,175,55,0.25)] active:scale-[0.97] transition-all duration-200 touch-manipulation"
                            >
                              <picture>
                                <source srcSet={opt.img} type="image/webp" />
                                <img src={opt.img.replace('.webp', '.png')} alt={opt.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                              </picture>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 p-2 z-10 text-center">
                                <p className="text-[11px] font-bold text-white leading-tight">{opt.label}</p>
                                <p className="text-[9px] text-gold/80 leading-none mt-0.5">{opt.sublabel}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    <p className="text-[9px] text-white/20 text-center mb-3">Desconto não acumulável com outras promoções</p>

                    <div className="w-full max-w-xs mx-auto flex items-center gap-3">
                      <button
                        onClick={() => { setShowUpsell(false); setCurrentStep(3); }}
                        className="h-12 px-5 flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-white/[0.15] bg-transparent text-white/55 hover:text-white/85 hover:border-white/30 touch-manipulation active:scale-[0.98] transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Voltar
                      </button>
                      <button
                        onClick={() => { setShowUpsell(false); setCurrentStep(4); }}
                        className="flex-1 h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-xl shadow-[0_4px_28px_rgba(212,175,55,0.40)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {upsellItems.length > 0 ? 'Continuar com Pack' : 'Continuar'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SUB-STEP: Config for chosen item */}
                {upsellSubStep === 'config' && pendingUpsellId && (
                  <div className="flex flex-col w-full items-center text-center">
                    <button
                      onClick={() => setUpsellSubStep('select')}
                      className="self-start flex items-center gap-1 text-xs text-white/35 hover:text-white/65 transition-colors mb-4 touch-manipulation"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Voltar
                    </button>

                    {/* Sofa config */}
                    {pendingUpsellId === 'sofa' && (
                      <div className="w-full max-w-xs mx-auto">
                        <picture>
                          <source srcSet="/images/services/sofa.webp" type="image/webp" />
                          <img src="/images/services/sofa.png" alt="Sofá" className="w-16 h-14 object-cover rounded-xl mx-auto mb-2" loading="lazy" />
                        </picture>
                        <h3 className="font-playfair text-lg font-bold text-white mb-1">Sofá</h3>
                        <p className="text-xs text-white/35 mb-3">Selecione tamanho e quantidade</p>
                        <div className="flex flex-col gap-2 mb-3">
                          {sofaPrices.filter(o => typeof o.cleaningPrice === 'number').map(opt => {
                            const item = pendingSofaItems.find(i => i.sizeId === opt.id);
                            const qty = item?.qty ?? 0;
                            const packOn = item?.packEnabled ?? false;
                            const isActive = qty > 0;
                            const cleanP = opt.cleaningPrice as number;
                            const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : cleanP + 40;
                            const origP = typeof opt.originalBothPrice === 'number' ? (opt.originalBothPrice as number) : null;
                            const delta = bothP - cleanP;
                            const dp = packOn ? bothP : cleanP;
                            return (
                              <div key={opt.id} className={cn('rounded-xl border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#252931] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : isActive ? 'border-gold/50 bg-[#252931]' : 'border-white/[0.18] bg-[#252931]')}>
                                <div className="flex items-center justify-between px-4 py-3">
                                  <div className="flex-1 min-w-0 mr-3">
                                    <span className="text-sm font-semibold text-white">{opt.label}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      {isActive && packOn && origP !== null && (
                                        <span className="text-sm text-white/30 line-through tabular-nums">{origP}€</span>
                                      )}
                                      <span className={cn('text-sm font-bold tabular-nums', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/40')}>
                                        {dp}€/un.{qty > 1 ? ` × ${qty} = ${dp * qty}€` : ''}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => setPendingSofaItems(sofaSetQty(pendingSofaItems, opt.id, qty - 1))} disabled={qty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                                    <span className={cn('w-6 text-center font-bold tabular-nums text-sm', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                                    <button onClick={() => setPendingSofaItems(sofaSetQty(pendingSofaItems, opt.id, qty + 1))} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                                  </div>
                                </div>
                                {isActive && (
                                  <div className="px-4 pb-3">
                                    <button onClick={() => setPendingSofaItems(sofaTogglePack(pendingSofaItems, opt.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-white/10 bg-[#252931] hover:border-gold/30')}>
                                      <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                                      <div className="flex-1 text-left">
                                        <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>Impermeabilização completa</p>
                                        <p className={cn('text-[9px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>+{delta}€/un. · Proteção contra manchas e líquidos</p>
                                      </div>
                                      <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                                        <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {/* Chaise Longue add-on */}
                        {(() => {
                          const hasSofas = pendingSofaItems.some(i => i.qty > 0);
                          const anyPack = pendingSofaItems.some(i => i.packEnabled && i.qty > 0);
                          const chaiseUnitPrice = anyPack ? sofaChaisePrice.cleaning + sofaChaisePrice.waterproofing : sofaChaisePrice.cleaning;
                          return (
                            <div className={cn('w-full rounded-xl border-2 transition-all duration-200 mb-3', pendingUpsellChaiseLongueQty > 0 ? 'border-gold/60 bg-[#252931] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-white/[0.18] bg-[#252931]')}>
                              <div className="flex items-center justify-between px-4 py-3">
                                <div className="flex-1 min-w-0 mr-3">
                                  <span className={cn('text-sm font-semibold', hasSofas && pendingUpsellChaiseLongueQty > 0 ? 'text-white' : 'text-white/50')}>Chaise Longue</span>
                                  <div className="mt-0.5">
                                    <span className={cn('text-sm font-bold tabular-nums', hasSofas && pendingUpsellChaiseLongueQty > 0 ? 'text-gold' : 'text-white/30')}>+{chaiseUnitPrice}€/un.</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button onClick={() => { if (hasSofas) setPendingUpsellChaiseLongueQty(q => Math.max(0, q - 1)); }} disabled={pendingUpsellChaiseLongueQty === 0 || !hasSofas} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                                  <span className={cn('w-6 text-center font-bold tabular-nums text-sm', hasSofas && pendingUpsellChaiseLongueQty > 0 ? 'text-gold' : 'text-white/30')}>{pendingUpsellChaiseLongueQty}</span>
                                  <button onClick={() => { if (hasSofas) setPendingUpsellChaiseLongueQty(q => q + 1); }} disabled={!hasSofas} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50 disabled:opacity-20">+</button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                        <button
                          disabled={!pendingSofaItems.some(i => i.qty > 0)}
                          onClick={() => {
                            const anyPack = pendingSofaItems.some(i => i.packEnabled && i.qty > 0);
                            const chaiseUnitP = anyPack ? sofaChaisePrice.cleaning + sofaChaisePrice.waterproofing : sofaChaisePrice.cleaning;
                            pendingSofaItems.filter(i => i.qty > 0).forEach(item => {
                              const opt = sofaPrices.find(p => p.id === item.sizeId)!;
                              const cleanP = opt.cleaningPrice as number;
                              const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : cleanP + 40;
                              const unitPrice = item.packEnabled ? bothP : cleanP;
                              const total = unitPrice * item.qty;
                              const waterproofExtra = item.packEnabled ? (bothP - cleanP) * item.qty : 0;
                              setUpsellItems(prev => [...prev, {
                                id: 'sofa',
                                sofaSize: item.sizeId,
                                qty: item.qty,
                                price: total,
                                label: `${item.qty}× Sofá ${opt.label}${item.packEnabled ? ' + Impermeab.' : ''}`,
                                waterproof: item.packEnabled,
                                waterproofPrice: waterproofExtra,
                              }]);
                            });
                            if (pendingUpsellChaiseLongueQty > 0) {
                              setUpsellItems(prev => [...prev, {
                                id: 'sofa-chaise',
                                qty: pendingUpsellChaiseLongueQty,
                                price: pendingUpsellChaiseLongueQty * chaiseUnitP,
                                label: `${pendingUpsellChaiseLongueQty}× Chaise Longue${anyPack ? ' + Impermeab.' : ''}`,
                                chaiseLongue: true,
                              }]);
                            }
                            setPendingUpsellChaiseLongueQty(0);
                            setUpsellSubStep('select');
                          }}
                          className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-xl disabled:opacity-35 touch-manipulation active:scale-[0.98] transition-all"
                        >
                          {(() => {
                            const total = pendingSofaItems.reduce((s, i) => s + i.qty, 0);
                            return total > 0 ? `Adicionar Sofá${total > 1 ? ` (${total})` : ''}` : 'Selecione um tamanho';
                          })()}
                        </button>
                      </div>
                    )}

                    {/* Mattress config */}
                    {pendingUpsellId === 'mattress' && (
                      <div className="w-full max-w-xs mx-auto">
                        <picture>
                          <source srcSet="/images/services/colchao.webp" type="image/webp" />
                          <img src="/images/services/colchao.png" alt="Colchão" className="w-16 h-14 object-cover rounded-xl mx-auto mb-2" loading="lazy" />
                        </picture>
                        <h3 className="font-playfair text-lg font-bold text-white mb-1">Colchão</h3>
                        <p className="text-xs text-white/35 mb-3">Selecione tamanho e quantidade</p>
                        <div className="flex flex-col gap-2 mb-4">
                          {mattressPrices.map(opt => {
                            const item = pendingMattressItems.find(i => i.sizeId === opt.id);
                            const qty = item?.qty ?? 0;
                            const packOn = item?.packEnabled ?? false;
                            const isActive = qty > 0;
                            const cleanP = typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null;
                            const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : null;
                            const dp = cleanP !== null ? (packOn && bothP !== null ? bothP : cleanP) : null;
                            return (
                              <div key={opt.id} className={cn('rounded-xl border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#252931] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : isActive ? 'border-gold/50 bg-[#252931]' : 'border-white/[0.18] bg-[#252931]')}>
                                <div className="flex items-center justify-between px-4 py-3">
                                  <div className="flex-1 min-w-0 mr-3">
                                    <span className="text-sm font-semibold text-white">{opt.label}</span>
                                    <div className="mt-0.5">
                                      <span className={cn('text-sm font-bold tabular-nums', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/40')}>
                                        {dp !== null ? `${dp}€/un.${qty > 1 ? ` × ${qty} = ${dp * qty}€` : ''}` : 'Sob orç.'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => setPendingMattressItems(mattressSetQty(pendingMattressItems, opt.id, qty - 1))} disabled={qty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                                    <span className={cn('w-6 text-center font-bold tabular-nums text-sm', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                                    <button onClick={() => setPendingMattressItems(mattressSetQty(pendingMattressItems, opt.id, qty + 1))} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                                  </div>
                                </div>
                                {isActive && cleanP !== null && (
                                  <div className="px-4 pb-3">
                                    <button onClick={() => setPendingMattressItems(mattressTogglePack(pendingMattressItems, opt.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-white/10 bg-[#252931] hover:border-gold/30')}>
                                      <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                                      <div className="flex-1 text-left">
                                        <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>Adicionar Impermeabilização</p>
                                        <p className={cn('text-[9px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>
                                          {bothP !== null ? `+${(bothP - cleanP) * qty}€` : '+30€/un.'} · Proteção até 10 anos
                                        </p>
                                      </div>
                                      <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                                        <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <button
                          disabled={!pendingMattressItems.some(i => i.qty > 0)}
                          onClick={() => {
                            pendingMattressItems.filter(i => i.qty > 0).forEach(item => {
                              const opt = mattressPrices.find(p => p.id === item.sizeId)!;
                              const cleanP = typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0;
                              const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : cleanP;
                              const unitPrice = item.packEnabled ? bothP : cleanP;
                              const total = unitPrice * item.qty;
                              const waterproofExtra = item.packEnabled ? (bothP - cleanP) * item.qty : 0;
                              setUpsellItems(prev => [...prev, {
                                id: 'mattress',
                                mattressSize: item.sizeId,
                                qty: item.qty,
                                price: total,
                                label: `${item.qty}× Colchão ${opt.label}${item.packEnabled ? ' + Impermeab.' : ''}`,
                                waterproof: item.packEnabled,
                                waterproofPrice: waterproofExtra,
                              }]);
                            });
                            setUpsellSubStep('select');
                          }}
                          className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-xl disabled:opacity-35 touch-manipulation active:scale-[0.98] transition-all"
                        >
                          {(() => {
                            const total = pendingMattressItems.reduce((s, i) => s + i.qty, 0);
                            return total > 0 ? `Adicionar Colchão${total > 1 ? ` (${total})` : ''}` : 'Selecione um tamanho';
                          })()}
                        </button>
                      </div>
                    )}

                    {/* Carpet config */}
                    {pendingUpsellId === 'carpet' && (
                      <div className="w-full max-w-xs mx-auto">
                        <picture>
                          <source srcSet="/images/services/tapete.webp" type="image/webp" />
                          <img src="/images/services/tapete.png" alt="Tapete" className="w-16 h-14 object-cover rounded-xl mx-auto mb-2" loading="lazy" />
                        </picture>
                        <h3 className="font-playfair text-lg font-bold text-white mb-1">Área do Tapete</h3>
                        <p className="text-xs text-white/35 mb-4">Indique a área aproximada em m²</p>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          placeholder="Ex: 4"
                          value={pendingCarpetArea}
                          onChange={e => setPendingCarpetArea(e.target.value)}
                          className="w-full h-12 px-4 text-lg font-bold text-center bg-white/[0.06] border border-white/15 focus:border-gold focus:outline-none rounded-xl transition-colors text-white placeholder:text-white/25 mb-1"
                        />
                        <p className="text-[10px] text-white/25 mb-3">
                          {(() => {
                            const a = parseFloat(pendingCarpetArea);
                            if (!pendingCarpetArea || isNaN(a) || a <= 0) return 'Insira a área em m²';
                            if (a > 15) return 'Área > 15m² → Sob orçamento';
                            const price = a <= 5 ? a * 10 : a <= 10 ? a * 8 : a * 7;
                            return `Estimativa: ${Math.round(price * 100) / 100}€`;
                          })()}
                        </p>
                        <button
                          disabled={!pendingCarpetArea || isNaN(parseFloat(pendingCarpetArea)) || parseFloat(pendingCarpetArea) <= 0}
                          onClick={() => {
                            const area = parseFloat(pendingCarpetArea);
                            const base = area > 15 ? 0 : area <= 5 ? area * 10 : area <= 10 ? area * 8 : area * 7;
                            setUpsellItems(prev => [...prev, { id: 'carpet', carpetArea: pendingCarpetArea, price: Math.round(base * 100) / 100, label: `Tapete ${pendingCarpetArea}m²` }]);
                            setUpsellSubStep('select');
                          }}
                          className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-xl disabled:opacity-35 touch-manipulation active:scale-[0.98] transition-all"
                        >
                          Adicionar Tapete
                        </button>
                      </div>
                    )}

                    {/* Chairs config */}
                    {pendingUpsellId === 'chairs' && (
                      <div className="w-full max-w-xs mx-auto">
                        <picture>
                          <source srcSet="/images/services/cadeira.webp" type="image/webp" />
                          <img src="/images/services/cadeira.png" alt="Cadeiras" className="w-16 h-14 object-cover rounded-xl mx-auto mb-2" loading="lazy" />
                        </picture>
                        <h3 className="font-playfair text-lg font-bold text-white mb-1">Cadeiras</h3>
                        <p className="text-xs text-white/35 mb-3">Quantas cadeiras quer limpar?</p>

                        {/* Qty stepper */}
                        <div className="flex items-center justify-center gap-4 mb-2">
                          <button onClick={() => setPendingChairQtyNum(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center active:scale-95 touch-manipulation hover:border-gold/50">−</button>
                          <span className="text-2xl font-black text-gold w-8 text-center tabular-nums">{pendingChairQtyNum}</span>
                          <button onClick={() => setPendingChairQtyNum(q => Math.min(10, q + 1))} className="w-9 h-9 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center active:scale-95 touch-manipulation hover:border-gold/50">+</button>
                        </div>
                        <p className="text-[10px] text-gold/70 text-center mb-4">
                          {(() => {
                            const qty = pendingChairQtyNum;
                            const price = qty <= 3 ? qty * 17.5 : qty <= 6 ? qty * 15 : qty * 12.5;
                            return `${qty} cadeira${qty > 1 ? 's' : ''} → ${price}€`;
                          })()}
                        </p>
                        {/* Waterproofing */}
                        <button
                          onClick={() => setPendingWaterproof(w => !w)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all touch-manipulation mb-4",
                            pendingWaterproof ? "border-gold bg-[#252931] shadow-[0_0_10px_rgba(212,175,55,0.15)]" : "border-white/[0.16] bg-[#252931] hover:border-gold/35"
                          )}
                        >
                          <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all", pendingWaterproof ? "border-gold bg-gold" : "border-white/30")}>
                            {pendingWaterproof && <Check className="w-3 h-3 text-[#12121e]" />}
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-bold text-white">Adicionar Impermeabilização</p>
                            <p className="text-[10px] text-white/40">+10€/cadeira: proteção duradoura</p>
                          </div>
                          <span className="text-gold font-bold text-sm flex-shrink-0">+{pendingChairQtyNum * 10}€</span>
                        </button>
                        <button
                          onClick={() => {
                            const qty = pendingChairQtyNum;
                            const base = qty <= 3 ? qty * 17.5 : qty <= 6 ? qty * 15 : qty * 12.5;
                            const waterproofPrice = pendingWaterproof ? qty * 10 : 0;
                            setUpsellItems(prev => [...prev, { id: 'chairs', chairQty: String(qty), qty, price: base + waterproofPrice, label: `${qty} Cadeira${qty > 1 ? 's' : ''}`, waterproof: pendingWaterproof, waterproofPrice }]);
                            setUpsellSubStep('select');
                          }}
                          className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-xl disabled:opacity-35 touch-manipulation active:scale-[0.98] transition-all"
                        >
                          Adicionar {pendingChairQtyNum} Cadeira{pendingChairQtyNum > 1 ? 's' : ''}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Order Summary — removed, flow goes directly to contact */}
            {false && (
              <div className="flex-1 flex flex-col w-full items-center">
                <div className="w-full max-w-sm mx-auto">
                  <div className="text-center mb-4">
                  </div>

                  <div className="bg-[#252931] border border-white/[0.16] rounded-2xl overflow-hidden mb-3">
                    {/* Main service */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-bold text-white truncate">{getServiceLabel()}{getServiceTypeLabel() ? `: ${getServiceTypeLabel()}` : ''}</p>
                        <p className="text-[10px] text-white/35 truncate">{buildDetailsSummary().split(' | ')[0] || '-'}</p>
                      </div>
                      <span className="text-sm font-bold text-white flex-shrink-0">
                        {calculateServicePrice > 0 ? `${calculateServicePrice}€` : 'Sob orç.'}
                      </span>
                    </div>

                    {/* Upsell items */}
                    {upsellItems.map((item, i) => {
                      const imgs: Record<string, string> = { mattress: '/images/services/colchao.webp', carpet: '/images/services/tapete.webp', chairs: '/images/services/cadeira.webp' };
                      const names: Record<string, string> = { mattress: 'Colchão', carpet: 'Tapete', chairs: 'Cadeiras' };
                      const detail = item.mattressSize
                        ? ` ${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? ''}`
                        : item.carpetArea ? ` ${item.carpetArea}m²`
                        : item.chairQty ? ` ${item.chairQty}x`
                        : '';
                      const waterproofStr = item.waterproof && item.waterproofPrice ? ` + Impermeab. (+${item.waterproofPrice}€)` : '';
                      return (
                        <div key={i} className="flex justify-between items-start px-4 py-3 border-b border-white/[0.06]">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2">
                              {imgs[item.id] && <picture><source srcSet={imgs[item.id]} type="image/webp" /><img src={imgs[item.id].replace('.webp', '.png')} alt="" className="w-8 h-7 object-cover rounded flex-shrink-0" loading="lazy" /></picture>}
                              <p className="text-sm text-white/80">{names[item.id] ?? item.id}{detail}</p>
                            </div>
                            {waterproofStr && <p className="text-[10px] text-gold/60 mt-0.5">{waterproofStr.replace(' + Impermeab.', ' Impermeabilização')}</p>}
                          </div>
                          <span className="text-sm font-bold text-white flex-shrink-0">{item.price > 0 ? `${item.price}€` : 'Sob orç.'}</span>
                        </div>
                      );
                    })}

                    {/* Travel */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06]">
                      <span className="text-sm text-white/50">Deslocação</span>
                      <span className={cn("text-sm font-bold ml-3 flex-shrink-0", isFreeTravel ? "text-green-400" : "text-white/70")}>
                        {isFreeTravel ? 'Grátis' : `${finalTravelCost}€`}
                      </span>
                    </div>

                    {/* Hypoallergenic */}
                    {hypoSurcharge > 0 && (
                      <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06]">
                        <span className="text-sm text-white/50">Hipoalergénico</span>
                        <span className="text-sm font-bold text-white/70 ml-3 flex-shrink-0">+{hypoSurcharge}€</span>
                      </div>
                    )}

                    {/* Pack discount line */}
                    {packDiscountActive && totalPrice > 0 && (
                      <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06] bg-gold/[0.05]">
                        <span className="text-sm text-gold font-bold">Desconto Pack ({Math.round(packDiscountPct * 100)}%)</span>
                        <span className="text-sm font-bold text-gold ml-3 flex-shrink-0">−{(totalPrice - packDiscountedPrice).toFixed(2).replace('.', ',')}€</span>
                      </div>
                    )}
                    {!packDiscountActive && isDiscountActive && totalPrice > 0 && (
                      <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06] bg-gold/[0.05]">
                        <span className="text-sm text-gold font-bold">Desconto Urgência (5%)</span>
                        <span className="text-sm font-bold text-gold ml-3 flex-shrink-0">−{(totalPrice - discountedPrice).toFixed(2).replace('.', ',')}€</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between items-center px-4 py-4 bg-gold/[0.08]">
                      <span className="text-base font-black text-white uppercase tracking-wide">Total</span>
                      <span className="text-xl font-black text-gold tabular-nums">
                        {packDiscountActive ? `${packDiscountedPrice}€` : isDiscountActive && totalPrice > 0 ? `${discountedPrice}€` : totalPrice > 0 ? `${totalPrice}€` : 'Sob orçamento'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[9px] text-white/20 text-center mb-4">Valor inclui IVA à taxa legal. Sujeito a confirmação presencial.</p>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setShowSummary(false); setCurrentStep(6); }}
                      className="w-full h-13 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase rounded-xl shadow-[0_0_32px_rgba(212,175,55,0.30)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      Confirmar e Preencher Dados
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setShowSummary(false); setShowUpsell(true); }}
                      className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-white/55 transition-colors py-2 touch-manipulation"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Alterar itens
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 - Contact */}
            {currentStep === 4 && !showUpsell && (
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                className="flex-1"
              >
                <div className="w-full max-w-sm">
                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white text-center mb-1 leading-[1.3]">
                    Os seus dados
                  </h2>
                  <p className="text-center text-[11px] text-white/30 mb-5">
                    Preenche em segundos. O pedido é enviado automaticamente.
                  </p>

                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}
                    </div>
                    <span className="text-[11px] text-white/40">51 avaliações Google · 5.0</span>
                  </div>
                  <p className="text-center text-xs text-green-300 bg-[#0a2218] border border-green-500/50 rounded-xl px-3 py-2 mb-5 font-bold shadow-[0_0_10px_rgba(34,197,94,0.10)]">
                    🔴 4 pessoas pediram orçamento no Porto nas últimas 2 horas
                  </p>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Nome *</label>
                      <Input
                        placeholder="O seu nome"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        autoComplete="name"
                        autoCapitalize="words"
                        autoFocus
                        className="text-base h-13 bg-[#252931] border-white/15 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Telemóvel / WhatsApp *</label>
                      <Input
                        type="tel"
                        placeholder="9xx xxx xxx"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        autoComplete="tel"
                        inputMode="tel"
                        className="text-base h-13 bg-[#252931] border-white/15 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-xl"
                      />
                    </div>
  </div>
</div>
</div>
)}


      </div>
    </div>

    {/* Footer */}
    {currentStep <= totalSteps && !showUpsell && (
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 flex flex-col gap-2 flex-shrink-0 border-t border-white/[0.05] items-center">
        {currentStep === totalSteps ? (
          <div className="flex flex-col gap-2 w-full">
            {totalPrice > 0 && (
              <p className="text-center text-[10px] text-white/25 font-medium tracking-wide">
                Preço final com IVA incluído: <span className="text-gold/60 font-bold">{packDiscountActive ? `${packDiscountedPrice}€` : isDiscountActive ? `${discountedPrice}€` : `${totalPrice}€`}</span>
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
            <Button
              variant="ghost"
              onClick={handlePrev}
              className="w-full h-7 text-xs text-white/20 hover:text-white/45 touch-manipulation"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Voltar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 w-full">
            {currentStep > firstStep && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="h-12 px-6 min-w-[120px] flex-shrink-0 bg-transparent border-white/[0.15] text-white/60 hover:text-white/90 hover:border-white/30 touch-manipulation active:scale-[0.98] rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold touch-manipulation active:scale-[0.98] disabled:opacity-35 rounded-xl shadow-[0_4px_28px_rgba(212,175,55,0.40)] hover:shadow-[0_4px_36px_rgba(212,175,55,0.55)] transition-shadow flex-shrink-0",
                currentStep > firstStep ? "px-8 min-w-[150px]" : "w-full max-w-[280px]"
              )}
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    )}

    {/* Rotating social proof bar */}
    <div className="border-t border-orange-500/30 px-4 py-2.5 text-center flex-shrink-0 bg-[#1a0f05]">
      <p className="text-[11px] text-orange-300/90 font-semibold transition-all duration-700">
        🔥 {socialProofMessages[socialProofIdx]}
      </p>
    </div>

    {/* Exit Intent Overlay */}
    {showExitIntent && (
      <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md rounded-t-3xl sm:rounded-2xl" style={{ background: "rgba(5,21,16,0.92)" }}>
        <div className="px-7 py-8 text-center max-w-xs mx-auto">
          <AlertTriangle className="w-12 h-12 text-gold mb-4 mx-auto" />
          <h3 className="font-playfair text-2xl font-bold text-white mb-3 leading-tight">
            ESPERE!
          </h3>
          <p className="text-sm text-white/65 mb-2 leading-relaxed">
            Se sair agora, perde a sua vaga e o desconto de{' '}
            <span className="text-gold font-bold">5%</span>.
          </p>
          {isDiscountActive && (
            <p className="text-xs text-gold/70 mb-5 font-mono bg-gold/10 px-3 py-1.5 rounded-lg inline-block">
              Desconto expira em {formatCountdown(countdown)}
            </p>
          )}
          <div className="flex flex-col gap-3 mt-5">
            <Button
              onClick={() => setShowExitIntent(false)}
              className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] touch-manipulation active:scale-[0.98]"
            >
              Continuar e Guardar Desconto
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
