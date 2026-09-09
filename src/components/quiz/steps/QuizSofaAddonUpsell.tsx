import QuizTopBadge from '../QuizTopBadge';
import QuizCareIntro from '../QuizCareIntro';
import { ChevronLeft, Droplets, Plus } from 'lucide-react';
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
  const isWaterproofBase = formData.serviceType === 'waterproofing';
  const activeItems = sofaItems.filter(i => i.qty > 0);
  const tier = formData.waterproofingTier;
  const titleBase = isWaterproofBase ? 'Quer também Higienização Profunda?' : 'Quer também Impermeabilização?';
  const subtitle = isWaterproofBase
    ? 'Limpeza profunda antes da proteção, na mesma visita. Adicione apenas se precisar.'
    : 'Ajuda a reduzir a absorção de líquidos pelo tecido e facilita os cuidados do dia a dia. Escolha a proteção que prefere.';

  // Impermeabilização (limpeza → adicionar proteção): clicar num tier já É o
  // "sim" — liga a proteção em todos os sofás mostrados nesse tier. Clicar no
  // tier já ativo desliga tudo de novo.
  const anyPackOn = activeItems.some(i => i.packEnabled);
  const selectTier = (t: 'premium' | 'essencial') => {
    const turningOff = anyPackOn && tier === t;
    setSofaItems(prev => prev.map(i => i.qty > 0 ? { ...i, packEnabled: !turningOff } : i));
  };
  // Higienização (impermeabilização → adicionar limpeza): sem tiers, por
  // isso é um único cartão mestre "estilo colchão/cadeiras" que liga/desliga
  // a limpeza em todos os sofás de uma vez (uniformizado 2026-09-08).
  const toggleAllHigienizacao = () => {
    setSofaItems(prev => prev.map(i => i.qty > 0 ? { ...i, packEnabled: !anyPackOn } : i));
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full leading-snug">
        {titleBase}
      </h2>
      <QuizCareIntro service="sofa" sizeId={activeItems[0]?.sizeId}>{subtitle}</QuizCareIntro>
      {!isWaterproofBase && (
        <WaterproofingTierPicker
          formData={formData}
          updateFormData={updateFormData}
          onSelect={selectTier}
          activeTier={anyPackOn ? tier : null}
        />
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
          <QuizTopBadge className="absolute -top-3 right-3 z-10" />
          <Droplets className={cn('w-5 h-5 flex-shrink-0', anyPackOn ? 'text-gold' : 'text-gold/70')} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-bold', anyPackOn ? 'text-white' : 'text-white/90')}>Higienização Profunda</p>
            <p className="text-[10px] text-white/65 leading-snug mt-0.5">Limpeza do estofo por extração, antes de aplicar a proteção.</p>
          </div>
          <span className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
            anyPackOn ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
          )}>
            <Plus className={cn('w-3.5 h-3.5 transition-transform', anyPackOn ? 'text-[#12121e] rotate-45' : 'text-gold')} strokeWidth={3} />
          </span>
        </button>
      )}
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
          {anyPackOn ? 'Continuar com tratamento' : 'Continuar sem extras'}
        </button>
      </div>
    </div>
  );
};

export default QuizSofaAddonUpsell;
