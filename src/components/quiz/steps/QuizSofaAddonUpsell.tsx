import { ChevronLeft, Star, Droplets, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, SofaItem } from '@/components/quiz/QuizTypes';
import { sofaTogglePack, calcPackPricing } from '@/components/quiz/quizHelpers';
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
    ? 'Aproveitamos a mesma visita para o deixar como novo antes de proteger. Totalmente opcional.'
    : 'Uma mancha de vinho, a caneta do seu filho, o acidente do animal: sem proteção, ficam para sempre. Com impermeabilização, escorrega e limpa-se em segundos.';

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
      <p className="text-xs text-white/40 text-center max-w-xs leading-relaxed -mt-1.5">
        {subtitle}
      </p>
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
          className={cn(
            'relative w-full max-w-xs min-h-[76px] flex items-center gap-3 pl-5 pr-3.5 py-3.5 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation mt-1',
            anyPackOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
          )}
        >
          <span className="absolute -top-2 -left-2 z-10 flex w-9 h-9 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
            <Star className="w-3 h-3 fill-[#12121e] text-[#12121e]" />
            <span className="text-[6px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
          </span>
          <Droplets className={cn('w-5 h-5 flex-shrink-0', anyPackOn ? 'text-gold' : 'text-gold/70')} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-bold', anyPackOn ? 'text-white' : 'text-white/90')}>Higienização Profunda</p>
            <p className="text-[10px] text-white/35 leading-snug mt-0.5">Elimina manchas, odores e bactérias acumuladas, deixando o estofo como novo.</p>
          </div>
          <span className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
            anyPackOn ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
          )}>
            <Plus className={cn('w-3.5 h-3.5 transition-transform', anyPackOn ? 'text-[#12121e] rotate-45' : 'text-gold')} strokeWidth={3} />
          </span>
        </button>
      )}
      {/* As linhas por sofá só aparecem depois do "sim" (tier ou cartão
          mestre) — antes disso só se vê a escolha principal, para não
          assaltar com detalhe antes de decidir (pedido explícito 2026-09-08). */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {anyPackOn && activeItems.map(item => {
          const option = sofaPrices.find(p => p.id === item.sizeId);
          if (!option) return null;
          const qty = item.qty;
          const packOn = item.packEnabled;
          const pack = calcPackPricing(option, true, isWaterproofBase, 40, tier);
          const baseUnit = isWaterproofBase ? pack.basePrice : (typeof option.cleaningPrice === 'number' ? option.cleaningPrice : null);
          const isSob = pack.isSob;

          const togglePack = () => setSofaItems(sofaTogglePack(sofaItems, item.sizeId));

          return (
            <div key={item.sizeId} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : 'border-white/10 bg-[#1a2a1a]')}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 mr-3">
                  <span className={cn('text-sm font-semibold', packOn ? 'text-white' : 'text-white/80')}>{qty > 1 ? `${qty}x ` : ''}{option.label}</span>
                  {typeof baseUnit === 'number' && (
                    <p className="text-xs text-white/35 mt-0.5">{baseUnit}€/un.</p>
                  )}
                  {!isSob && (
                    <p className={cn('text-[11px] font-semibold mt-1', packOn ? 'text-gold' : 'text-gold/60')}>
                      Por apenas <span className="font-black">+{pack.packDelta}€</span>
                    </p>
                  )}
                  {isSob && <p className="text-[11px] text-white/40 mt-1">Sob orçamento</p>}
                </div>
                {/* Stepper 0/qty — desliga (0) ou liga (qty) a proteção para
                    esta linha; nunca passa da quantidade que a pessoa já
                    escolheu (pedido explícito 2026-09-08). */}
                {!isSob && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={togglePack}
                      disabled={!packOn}
                      className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                    >−</button>
                    <span className={cn('w-6 text-center font-bold tabular-nums text-base', packOn ? 'text-gold' : 'text-white/30')}>{packOn ? qty : 0}</span>
                    <button
                      onClick={togglePack}
                      disabled={packOn}
                      className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                    >+</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 w-full max-w-xs mt-1">
        <button
          onClick={onBack}
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/50 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-sm tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default QuizSofaAddonUpsell;
