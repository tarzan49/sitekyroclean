import { useEffect, useRef, useState } from 'react';
import { sofaPrices } from '../QuizTypes';
import { calcPackPricing, treatmentQty } from '../quizHelpers';
import QuizTreatmentQuantities from '../QuizTreatmentQuantities';
import QuizCareIntro from '../QuizCareIntro';
import QuizTopBadge from '../QuizTopBadge';
import { ChevronLeft, Droplets, Plus, Check, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizFormData, SofaItem } from '@/components/quiz/QuizTypes';
import { WaterproofingTierPicker } from '@/components/quiz/steps/QuizStepConfig';
import { sofaAntiAcarosPrice } from '@/constants/antiAcarosPricing';

interface QuizSofaAddonUpsellProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  sofaItems: SofaItem[];
  setSofaItems: React.Dispatch<React.SetStateAction<SofaItem[]>>;
  onContinue: () => void;
  onBack: () => void;
}

// Só mostra os sofás que a pessoa já escolheu nas quantidades — nunca os
// tamanhos que ela não pediu (pedido explícito 2026-09-08).
//
// Com a limpeza como serviço principal, o tratamento é uma escolha só, como
// no configurador de packs (2026-09-26): impermeabilização Premium ou
// Essencial, ou anti-ácaros. Escolher um desliga o outro. Os preços do
// anti-ácaros vêm de constants/antiAcarosPricing.ts.
const QuizSofaAddonUpsell = ({ formData, updateFormData, sofaItems, setSofaItems, onContinue, onBack }: QuizSofaAddonUpsellProps) => {
  const tierSectionRef = useRef<HTMLDivElement>(null);
  const [selectionScroll, setSelectionScroll] = useState(0);
  useEffect(() => {
    if (!selectionScroll) return;
    const frame = requestAnimationFrame(() => {
      tierSectionRef.current?.scrollIntoView?.({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectionScroll]);

  const isWaterproofBase = formData.serviceType === 'waterproofing';
  const activeItems = sofaItems.filter(i => i.qty > 0);
  const tier = formData.waterproofingTier;
  const plural = activeItems.reduce((sum, item) => sum + item.qty, 0) > 1;
  const titleBase = isWaterproofBase ? 'Quer também Higienização Profunda?' : plural ? 'Proteja os seus sofás' : 'Proteja o seu sofá';

  // Clicar num tratamento já É o "sim": liga-o em todos os sofás mostrados
  // (ou mantém as quantidades já escolhidas, ao trocar de um para o outro).
  // Clicar no tratamento já ativo desliga tudo de novo.
  const anyPackOn = activeItems.some(i => treatmentQty(i) > 0);
  const antiActive = anyPackOn && formData.sofaAntiAcaros && !isWaterproofBase;
  const waterproofActive = anyPackOn && !antiActive;
  const applyTreatment = (turningOff: boolean) => {
    if (!turningOff && plural) setSelectionScroll(value => value + 1);
    setSofaItems(prev => prev.map(i => i.qty > 0 ? { ...i, packEnabled: !turningOff && (!anyPackOn || treatmentQty(i) > 0), packQty: turningOff ? 0 : (anyPackOn ? treatmentQty(i) : i.qty) } : i));
  };
  const selectTier = (t: 'premium' | 'essencial') => {
    updateFormData({ sofaAntiAcaros: false });
    applyTreatment(waterproofActive && tier === t);
  };
  const selectAntiAcaros = () => {
    updateFormData({ sofaAntiAcaros: !antiActive });
    applyTreatment(antiActive);
  };
  // Higienização (impermeabilização → adicionar limpeza): sem tiers, por
  // isso é um único cartão mestre "estilo colchão/cadeiras" que liga/desliga
  // a limpeza em todos os sofás de uma vez (uniformizado 2026-09-08).
  const toggleAllHigienizacao = () => {
    setSofaItems(prev => prev.map(i => i.qty > 0 ? { ...i, packEnabled: !anyPackOn, packQty: anyPackOn ? 0 : i.qty } : i));
  };

  const comparisonItems = activeItems.map(i => ({ ...i, qty: anyPackOn ? treatmentQty(i) : i.qty }));
  const protectionTotal = (selectedTier: 'premium' | 'essencial') => comparisonItems.reduce<number | null>((sum, item) => {
    if (!item.qty) return sum;
    const option = sofaPrices.find(p => p.id === item.sizeId);
    if (!option || sum === null) return null;
    const pack = calcPackPricing(option, true, false, 40, selectedTier);
    return pack.isSob || pack.packDelta === null ? null : sum + pack.packDelta * item.qty;
  }, 0);
  const originalProtectionTotal = (selectedTier: 'premium' | 'essencial') => comparisonItems.reduce<number | null>((sum, item) => {
    if (!item.qty) return sum;
    const option = sofaPrices.find(p => p.id === item.sizeId);
    const price = selectedTier === 'premium' ? option?.waterproofingPremiumPrice : option?.waterproofingPrice;
    return sum === null || typeof price !== 'number' ? null : sum + price * item.qty;
  }, 0);
  const selectedCleaningTotal = comparisonItems.reduce<number | null>((sum, item) => {
    if (!item.qty) return sum;
    const price = sofaPrices.find(p => p.id === item.sizeId)?.cleaningPrice;
    return sum === null || typeof price !== 'number' ? null : sum + price * item.qty;
  }, 0);
  const essencialTotal = protectionTotal('essencial');
  const premiumTotal = protectionTotal('premium');
  const premiumDifference = premiumTotal !== null && essencialTotal !== null ? premiumTotal - essencialTotal : null;
  const protectionCount = comparisonItems.reduce((sum, i) => sum + i.qty, 0);
  const selectedProtectionTotal = originalProtectionTotal(tier);
  // Anti-ácaros: acréscimo por sofá, por tamanho ("4+ Lugares" sob orçamento).
  const antiLines = comparisonItems.filter(item => item.qty > 0).map(item => ({
    sizeId: item.sizeId,
    label: sofaPrices.find(p => p.id === item.sizeId)?.label ?? item.sizeId,
    qty: item.qty,
    unit: sofaAntiAcarosPrice(item.sizeId),
  }));
  const antiTotal = antiLines.some(line => line.unit === null) ? null : antiLines.reduce((sum, line) => sum + (line.unit ?? 0) * line.qty, 0);
  const cleaningTotal = comparisonItems.reduce<number | null>((sum, item) => {
    if (!item.qty) return sum;
    const option = sofaPrices.find(p => p.id === item.sizeId);
    if (!option || sum === null) return null;
    const pack = calcPackPricing(option, true, true, 40, tier);
    return pack.isSob || pack.packDelta === null ? null : sum + pack.packDelta * item.qty;
  }, 0);

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-sm font-bold tracking-[0.08em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
      <h2 className="type-quote-title font-playfair    text-white text-center w-full ">
        {titleBase}
      </h2>
      <QuizCareIntro service="sofa" sizeId={activeItems[0]?.sizeId}>
        <ul className="space-y-1.5">
          {(isWaterproofBase ? ['Remove sujidade acumulada', 'Ajuda a reduzir odores', 'Limpeza profunda do tecido'] : ['Impermeabilização repele líquidos', 'Anti-ácaros trata o tecido', 'Um tratamento por sofá, na mesma visita']).map(benefit => <li key={benefit} className="flex items-start gap-1.5"><Check aria-hidden="true" className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" /><span>{benefit}</span></li>)}
        </ul>
      </QuizCareIntro>
      {!isWaterproofBase && (
        <div ref={tierSectionRef} className="w-full max-w-sm scroll-mt-2">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-white/80 text-left">Impermeabilização</p>
        <WaterproofingTierPicker
          premiumDifference={premiumDifference}
          prices={{ essencial: essencialTotal, premium: premiumTotal }}
          originalPrices={{ essencial: originalProtectionTotal('essencial'), premium: originalProtectionTotal('premium') }}
          packBaseTotal={selectedCleaningTotal}
          priceScope={protectionCount === 1 ? 'para 1 sofá' : `para ${protectionCount} sofás`}
          formData={formData}
          updateFormData={updateFormData}
          onSelect={selectTier}
          activeTier={waterproofActive ? tier : null}
        />
        </div>
      )}
      {!isWaterproofBase && (
        <>
          <p className="w-full max-w-sm text-sm font-bold uppercase tracking-[0.12em] text-white/80 text-left mt-1">Ou, em vez disso</p>
          <button
            type="button"
            onClick={selectAntiAcaros}
            aria-pressed={antiActive}
            className={cn(
              'relative w-full max-w-sm flex items-center gap-3 pl-5 pr-3.5 py-3 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation',
              antiActive ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
            )}
          >
            <QuizTopBadge className="absolute -top-3 right-3 z-10" />
            <Bug aria-hidden="true" className={cn('w-5 h-5 flex-shrink-0', antiActive ? 'text-gold' : 'text-gold/80')} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-base font-bold', antiActive ? 'text-white' : 'text-white/90')}>Anti-ácaros</p>
              <p className="text-sm text-white/80 leading-snug mt-0.5">Limpeza com tratamento anti-ácaros do tecido, na mesma visita.</p>
              <div className="border-t border-gold/15 mt-2 pt-2">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/80 mb-1">Acréscimo por sofá</p>
                <ul className="space-y-0.5">
                  {antiLines.map(line => (
                    <li key={line.sizeId} className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-white/80">{line.label}</span>
                      <span className={cn('font-black tracking-tight tabular-nums text-gold', line.unit === null ? 'text-base' : 'text-xl leading-none')}>{line.unit === null ? 'Sob orçamento' : `+${line.unit}€`}</span>
                    </li>
                  ))}
                </ul>
                {protectionCount > 1 && antiTotal !== null && <p className="text-sm text-white/80 mt-1.5">+{antiTotal.toLocaleString('pt-PT')}€ para {protectionCount} sofás</p>}
              </div>
            </div>
            <span className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
              antiActive ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
            )}>
              {antiActive ? <Check aria-hidden="true" className="w-3.5 h-3.5 text-[#071a12]" strokeWidth={3} /> : <Plus aria-hidden="true" className="w-3.5 h-3.5 text-gold" strokeWidth={3} />}
            </span>
          </button>
        </>
      )}
      {isWaterproofBase && (
        <button
          onClick={toggleAllHigienizacao}
          aria-pressed={anyPackOn}
          className={cn(
            'relative w-full max-w-sm min-h-[76px] flex items-center gap-3 pl-5 pr-3.5 py-3.5 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation mt-1',
            anyPackOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
          )}
        >
          <Droplets className={cn('w-5 h-5 flex-shrink-0', anyPackOn ? 'text-gold' : 'text-gold/70')} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-base font-bold', anyPackOn ? 'text-white' : 'text-white/90')}>Higienização Profunda</p>
            <p className="text-sm text-white/80 leading-snug mt-0.5">Por extração, antes de aplicar a proteção. Na mesma visita.</p>
            <div className="border-t border-gold/15 mt-2 pt-2">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/80 mb-1">Acréscimo</p>
              <p className="text-2xl leading-none font-black tracking-tight tabular-nums text-gold">{cleaningTotal === null ? 'Sob orçamento' : `+${cleaningTotal.toLocaleString('pt-PT')}€`}{cleaningTotal !== null && selectedCleaningTotal !== null && selectedCleaningTotal > cleaningTotal && <del aria-label={`Preço original da limpeza: ${selectedCleaningTotal.toLocaleString('pt-PT')} euros`} className="ml-2 text-base font-medium text-white/80 decoration-white/70 whitespace-nowrap">{selectedCleaningTotal.toLocaleString('pt-PT')}€</del>}</p>
              <p className="text-sm text-white/80 mt-1.5">para {protectionCount} {protectionCount === 1 ? 'sofá' : 'sofás'} · preço em pack</p>
              {cleaningTotal !== null && selectedProtectionTotal !== null && selectedCleaningTotal !== null && selectedCleaningTotal > cleaningTotal && <p className="text-xs leading-relaxed text-white/75 mt-1.5">Pack: {(selectedProtectionTotal + cleaningTotal).toLocaleString('pt-PT')}€ em vez de {(selectedProtectionTotal + selectedCleaningTotal).toLocaleString('pt-PT')}€</p>}
            </div>
          </div>
          <span className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
            anyPackOn ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
          )}>
            {anyPackOn ? <Check aria-hidden="true" className="w-3.5 h-3.5 text-[#12121e]" strokeWidth={3} /> : <Plus aria-hidden="true" className="w-3.5 h-3.5 text-gold" strokeWidth={3} />}
          </span>
        </button>
      )}
      {anyPackOn && <QuizTreatmentQuantities service="sofa" items={activeItems}
        onChange={(sizeId, qty) => setSofaItems(prev => prev.map(i => i.sizeId === sizeId ? { ...i, packQty: qty, packEnabled: qty > 0 } : i))} />}
      <div className="flex items-center gap-3 w-full max-w-sm mt-1">
        <button
          onClick={onBack}
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/70 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-base font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base leading-snug px-2   touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          {anyPackOn ? (isWaterproofBase ? 'Continuar com higienização' : 'Continuar com tratamento') : 'Continuar sem extras'}
        </button>
      </div>
    </div>
  );
};

export default QuizSofaAddonUpsell;
