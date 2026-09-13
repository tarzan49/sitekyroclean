import QuizTreatmentQuantities from '../QuizTreatmentQuantities';
import QuizTopBadge from '../QuizTopBadge';
import QuizCareIntro from '../QuizCareIntro';
import { ChevronLeft, Bug, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, MattressItem } from '@/components/quiz/QuizTypes';
import { calcPackPricing } from '@/components/quiz/quizHelpers';

interface QuizMattressAddonUpsellProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  mattressItems: MattressItem[];
  setMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;
  onContinue: () => void;
  onBack: () => void;
}

// O cartão liga/desliga o tratamento para os colchões escolhidos, sem expandir detalhes.
const QuizMattressAddonUpsell = ({ mattressItems, setMattressItems, onContinue, onBack }: QuizMattressAddonUpsellProps) => {
  const activeItems = mattressItems.filter(i => i.qty > 0);
  const anyOn = activeItems.some(i => i.packEnabled);
  const plural = activeItems.length > 1 || (activeItems[0]?.qty ?? 0) > 1;

  // Antes de escolher, mostra a gama possível (todos os colchões do pedido).
  // Depois de ligar o cartão, mostra só os tamanhos que a pessoa escolheu de
  // facto no QuizTreatmentQuantities abaixo — sem isto, escolher só um
  // tamanho continuava a mostrar a gama inteira dos outros colchões do pedido,
  // nunca o preço exato do que ficou selecionado.
  const priceRelevantItems = anyOn ? activeItems.filter(i => i.packEnabled && (i.packQty ?? 0) > 0) : activeItems;
  const addonPrices = priceRelevantItems.flatMap(item => {
    const option = mattressPrices.find(p => p.id === item.sizeId);
    if (!option) return [];
    const pack = calcPackPricing(option, true, false, 30);
    return pack.isSob || pack.packDelta === null ? [] : [pack.packDelta];
  });
  const addonPriceLabel = addonPrices.length === 0 ? 'Sob orçamento'
    : Math.min(...addonPrices) === Math.max(...addonPrices)
      ? `+${addonPrices[0]}€/un.` : `Desde +${Math.min(...addonPrices)}€/un.`;

  const toggleAll = () => {
    setMattressItems(prev => prev.map(i => i.qty > 0 ? { ...i, packEnabled: !anyOn, packQty: anyOn ? 0 : i.qty } : i));
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Proteja {plural ? 'os seus colchões' : 'o seu colchão'}</h2>
      <QuizCareIntro service="mattress" sizeId={activeItems[0]?.sizeId}>
        Complemente a limpeza com desbacterização e tratamento antiácaros, na mesma visita.
      </QuizCareIntro>

      <button
        onClick={toggleAll}
        aria-pressed={anyOn}
        className={cn(
          'relative w-full max-w-sm flex items-center gap-3 pl-5 pr-3.5 py-3 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation mt-1',
          anyOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
        )}
      >
        <QuizTopBadge className="absolute -top-3 right-3 z-10" />
        <Bug className={cn('w-5 h-5 flex-shrink-0', anyOn ? 'text-gold' : 'text-gold/70')} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-bold', anyOn ? 'text-white' : 'text-white/90')}>Desbacterização e Anti Ácaros</p>
          <p className="text-[10px] text-white/65 leading-snug mt-0.5">Dois cuidados num só tratamento complementar para o seu colchão.</p>
          <div className="border-t border-gold/15 mt-2 pt-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 mb-1">Acréscimo</p>
            <p className="text-xl leading-none font-black tracking-tight tabular-nums text-gold">{addonPriceLabel}</p>
          </div>
        </div>
        <span className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
          anyOn ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
        )}>
          {anyOn ? <Check className="w-3.5 h-3.5 text-[#071a12]" strokeWidth={3} /> : <Plus className="w-3.5 h-3.5 text-gold" strokeWidth={3} />}
        </span>
      </button>

      {anyOn && <QuizTreatmentQuantities service="mattress" items={activeItems}
        onChange={(sizeId, qty) => setMattressItems(prev => prev.map(i => i.sizeId === sizeId ? { ...i, packQty: qty, packEnabled: qty > 0 } : i))} />}
      <div className="flex items-center gap-3 w-full max-w-sm mt-1">
        <button
          onClick={onBack}
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/70 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-sm leading-snug px-2 tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          {anyOn ? 'Continuar com tratamento' : 'Continuar sem extras'}
        </button>
      </div>
    </div>
  );
};

export default QuizMattressAddonUpsell;
