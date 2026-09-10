import { useEffect, useRef, useState } from 'react';
import { sofaPrices } from '../QuizTypes';
import { calcPackPricing, treatmentQty } from '../quizHelpers';
import QuizTreatmentQuantities from '../QuizTreatmentQuantities';
import QuizCareIntro from '../QuizCareIntro';
import { ChevronLeft, Droplets, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizFormData, SofaItem } from '@/components/quiz/QuizTypes';
import { WaterproofingTierPicker } from '@/components/quiz/steps/QuizStepConfig';

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
  const titleBase = isWaterproofBase ? 'Quer também Higienização Profunda?' : 'Proteja o sofá do próximo derrame';


  // Impermeabilização (limpeza → adicionar proteção): clicar num tier já É o
  // "sim" — liga a proteção em todos os sofás mostrados nesse tier. Clicar no
  // tier já ativo desliga tudo de novo.
  const anyPackOn = activeItems.some(i => treatmentQty(i) > 0);
  const selectTier = (t: 'premium' | 'essencial') => {
    const turningOff = anyPackOn && tier === t;
    if (!turningOff && activeItems.reduce((sum, item) => sum + item.qty, 0) > 1) {
      setSelectionScroll(value => value + 1);
    }
    setSofaItems(prev => prev.map(i => i.qty > 0 ? { ...i, packEnabled: !turningOff && (!anyPackOn || treatmentQty(i) > 0), packQty: turningOff ? 0 : (anyPackOn ? treatmentQty(i) : i.qty) } : i));
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
  const essencialTotal = protectionTotal('essencial');
  const premiumTotal = protectionTotal('premium');
  const premiumDifference = premiumTotal !== null && essencialTotal !== null ? premiumTotal - essencialTotal : null;
  const protectionCount = comparisonItems.reduce((sum, i) => sum + i.qty, 0);
  const cleaningTotal = comparisonItems.reduce<number | null>((sum, item) => {
    if (!item.qty) return sum;
    const option = sofaPrices.find(p => p.id === item.sizeId);
    if (!option || sum === null) return null;
    const pack = calcPackPricing(option, true, true, 40, tier);
    return pack.isSob || pack.packDelta === null ? null : sum + pack.packDelta * item.qty;
  }, 0);

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full leading-snug">
        {titleBase}
      </h2>
      <QuizCareIntro service="sofa" sizeId={activeItems[0]?.sizeId}>
        <ul className="space-y-1.5">
          {(isWaterproofBase ? ['Remove sujidade acumulada', 'Ajuda a reduzir odores', 'Limpeza profunda do tecido'] : ['Repele líquidos', 'Facilita a remoção de manchas', 'Ajuda a conservar o aspeto do sofá']).map(benefit => <li key={benefit} className="flex items-start gap-1.5"><Check aria-hidden="true" className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" /><span>{benefit}</span></li>)}
        </ul>
      </QuizCareIntro>
      {!isWaterproofBase && (
        <div ref={tierSectionRef} className="w-full max-w-sm scroll-mt-2">
        <WaterproofingTierPicker
          premiumDifference={premiumDifference}
          prices={{ essencial: essencialTotal, premium: premiumTotal }}
          priceScope={protectionCount === 1 ? 'para 1 sofá' : `para ${protectionCount} sofás`}
          formData={formData}
          updateFormData={updateFormData}
          onSelect={selectTier}
          activeTier={anyPackOn ? tier : null}
        />
        </div>
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
            <p className={cn('text-sm font-bold', anyPackOn ? 'text-white' : 'text-white/90')}>Higienização Profunda</p>
            <p className="text-[10px] text-white/65 leading-snug mt-0.5">Por extração, antes de aplicar a proteção. Na mesma visita.</p>
            <p className="text-lg font-bold text-gold mt-2">{cleaningTotal === null ? 'Sob orçamento' : `+${cleaningTotal.toLocaleString('pt-PT')}€`}</p>
            <p className="text-[10px] text-white/65">para {protectionCount} {protectionCount === 1 ? 'sofá' : 'sofás'} · antes de descontos</p>
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
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/70 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-xs leading-snug px-2 tracking-wide uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          {anyPackOn ? (isWaterproofBase ? 'Continuar com higienização' : 'Continuar com tratamento') : 'Continuar sem extras'}
        </button>
      </div>
    </div>
  );
};

export default QuizSofaAddonUpsell;
