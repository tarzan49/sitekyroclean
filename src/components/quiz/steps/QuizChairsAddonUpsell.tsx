import { ChevronLeft, Check, Star, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizFormData } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium } from '@/components/quiz/quizHelpers';

interface QuizChairsAddonUpsellProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

// Anti Ácaros das cadeiras: serviço independente da impermeabilização (a
// pessoa pode adicionar os dois ao mesmo tempo, pedido explícito), sempre 5€
// por cadeira, sem escalão — preço mostrado ao cliente é sempre por unidade,
// nunca o total.
const CHAIR_ANTI_ACAROS_UNIT_RATE = 5;
const CHAIR_ANTI_ACAROS_STRIKE_UNIT_RATE = 10;

// Upsell "estilo companhia aérea": aparece uma única vez, logo a seguir ao
// "Continuar" da etapa de quantidades das cadeiras (só quando a limpeza é o
// serviço principal), para a pessoa pensar só em quantidade nessa etapa e
// decidir o extra aqui, sem competir visualmente com a quantidade.
const QuizChairsAddonUpsell = ({ formData, updateFormData, onContinue, onBack }: QuizChairsAddonUpsellProps) => {
  const qty = Math.max(1, parseInt(formData.chairQuantity) || 1);
  const primaryPrice = calcChairClean(qty);
  const premiumPrice = calcChairWaterproofPremium(qty);
  const essencialPrice = calcChairWaterproof(qty);

  const waterproofTier: 'premium' | 'essencial' | null = formData.chairWaterproofing
    ? (formData.waterproofingTier === 'premium' ? 'premium' : 'essencial')
    : null;
  const antiAcarosOn = formData.chairAntiAcaros;
  const anySelected = waterproofTier !== null || antiAcarosOn;

  const selectWaterproof = (tier: 'premium' | 'essencial') => {
    const turningOff = waterproofTier === tier;
    updateFormData(
      turningOff
        ? { chairWaterproofing: false, chairWaterproofQty: 0 }
        : { chairWaterproofing: true, chairWaterproofQty: qty, waterproofingTier: tier }
    );
  };

  const selectAntiAcaros = () => {
    updateFormData({ chairAntiAcaros: !antiAcarosOn });
  };

  const waterproofTotal = waterproofTier === 'premium' ? (premiumPrice ?? 0)
    : waterproofTier === 'essencial' ? (essencialPrice ?? 0)
    : 0;
  const antiAcarosTotal = antiAcarosOn ? qty * CHAIR_ANTI_ACAROS_UNIT_RATE : 0;
  const total = (primaryPrice ?? 0) + waterproofTotal + antiAcarosTotal;
  const fmt = (n: number) => (n % 1 === 0 ? n : n.toFixed(1).replace('.', ','));

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Proteja as suas cadeiras</h2>
      <p className="text-xs text-white/40 text-center max-w-xs leading-relaxed">
        Já que estamos lá em casa, aproveite para as manter assim por mais tempo. Totalmente opcional.
      </p>

      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35 w-full max-w-xs text-left mt-1">Impermeabilização</p>
      <div className="w-full max-w-xs grid grid-cols-2 gap-2 items-stretch">
        <button
          onClick={() => selectWaterproof('premium')}
          className={cn(
            'relative rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
            waterproofTier === 'premium'
              ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]'
              : 'border-gold/50 bg-[#1a2a1a] ring-1 ring-gold/20 hover:border-gold/75'
          )}
        >
          <span className="absolute -top-2 -right-2 z-10 flex w-9 h-9 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
            <Star className="w-3 h-3 fill-[#12121e] text-[#12121e]" />
            <span className="text-[6px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
          </span>
          <div className="flex items-center gap-1.5 mb-0.5">
            {waterproofTier === 'premium' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
            <p className={cn('text-xs font-bold', waterproofTier === 'premium' ? 'text-white' : 'text-white/85')}>Premium</p>
          </div>
          <p className={cn('text-[10px] leading-snug font-semibold mb-1', waterproofTier === 'premium' ? 'text-gold/70' : 'text-gold/45')}>Até 10 anos · 5 lavagens</p>
          {premiumPrice !== null ? (
            <p className="text-[11px] leading-none">
              <span className="text-white/30 line-through">{fmt(premiumPrice + 5)}€</span>{' '}
              <span className={cn('font-bold', waterproofTier === 'premium' ? 'text-gold' : 'text-gold/80')}>{fmt(premiumPrice)}€</span>
            </p>
          ) : (
            <p className="text-[11px] text-gold/60">Sob orçamento</p>
          )}
        </button>
        <button
          onClick={() => selectWaterproof('essencial')}
          className={cn(
            'rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
            waterproofTier === 'essencial' ? 'border-gold bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40'
          )}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            {waterproofTier === 'essencial' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
            <p className={cn('text-xs font-bold', waterproofTier === 'essencial' ? 'text-white' : 'text-white/60')}>Essencial</p>
          </div>
          <p className="text-[10px] text-white/35 leading-snug mb-1">1 a 2 anos · 2 lavagens</p>
          <p className={cn('text-[11px] font-bold', waterproofTier === 'essencial' ? 'text-white' : 'text-white/50')}>
            {essencialPrice !== null ? `${fmt(essencialPrice)}€` : 'Sob orçamento'}
          </p>
        </button>
      </div>

      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35 w-full max-w-xs text-left mt-2">Outra opção</p>
      <button
        onClick={selectAntiAcaros}
        className={cn(
          'w-full max-w-xs flex items-center gap-3 px-3 py-2.5 rounded-sm border-2 transition-all duration-200 touch-manipulation text-left',
          antiAcarosOn ? 'border-gold bg-gold/[0.08] shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40'
        )}
      >
        <Bug className={cn('w-4 h-4 flex-shrink-0', antiAcarosOn ? 'text-gold' : 'text-white/30')} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-bold', antiAcarosOn ? 'text-white' : 'text-white/70')}>Anti Ácaros</p>
          <p className="text-[10px] text-white/35 leading-snug">Evita que os ácaros voltem a aparecer e elimina bactérias do estofo.</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-white/30 line-through leading-none">{CHAIR_ANTI_ACAROS_STRIKE_UNIT_RATE}€/un.</p>
          <p className={cn('text-sm font-bold leading-none mt-0.5', antiAcarosOn ? 'text-gold' : 'text-white/60')}>{CHAIR_ANTI_ACAROS_UNIT_RATE}€/un.</p>
        </div>
      </button>

      <div className="w-full max-w-xs flex items-baseline justify-between rounded-sm border border-white/10 bg-[#1a2a1a] px-4 py-3 mt-1">
        <span className="text-[11px] text-white/40">Total do orçamento</span>
        <span className="font-playfair text-xl font-bold text-gold tabular-nums">{fmt(total)}€</span>
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
      >
        {anySelected ? 'Adicionar e Continuar' : 'Continuar'}
      </button>
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-white/20 hover:text-white/45 transition-colors touch-manipulation mt-1">
        <ChevronLeft className="w-3.5 h-3.5" /> Voltar
      </button>
    </div>
  );
};

export default QuizChairsAddonUpsell;
