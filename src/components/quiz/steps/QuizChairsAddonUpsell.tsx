import { ChevronLeft, Check, Star, Bug, Droplets, Plus } from 'lucide-react';
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

// Upsell "estilo companhia aérea": aparece uma única vez, logo a seguir ao
// "Continuar" da etapa de quantidades das cadeiras (só quando a limpeza é o
// serviço principal), para a pessoa pensar só em quantidade nessa etapa e
// decidir o extra aqui, sem competir visualmente com a quantidade.
const QuizChairsAddonUpsell = ({ formData, updateFormData, onContinue, onBack }: QuizChairsAddonUpsellProps) => {
  const isWaterproofBase = formData.serviceType === 'waterproofing';
  const qty = Math.max(1, parseInt(formData.chairQuantity) || 1);
  const premiumPrice = calcChairWaterproofPremium(qty);
  const essencialPrice = calcChairWaterproof(qty);
  const higienizacaoPrice = calcChairClean(qty);
  const fmt = (n: number) => (n % 1 === 0 ? n : n.toFixed(1).replace('.', ','));

  // ── Impermeabilização primária → oferece Higienização (sem tiers) ──
  if (isWaterproofBase) {
    // chairWaterproofQty é o campo genérico de "quantidade do addon" que o
    // motor de preços (use-quiz-pricing.ts) já lê para as duas direções —
    // chairAntiAcaros é um serviço real à parte (+5€/cadeira), nunca deve ser
    // reaproveitado aqui (bug real: dava total errado, ficava a somar o
    // Anti Ácaros de 5€/cadeira em vez da Higienização de verdade).
    // Tudo-ou-nada de propósito (decisão final do dono 2026-09-08): não faz
    // sentido higienizar só algumas cadeiras e impermeabilizar as restantes.
    const addonOn = formData.chairWaterproofQty > 0;
    const toggleAddon = () => updateFormData({ chairWaterproofQty: addonOn ? 0 : qty });
    return (
      <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Quer também Higienização Profunda?</h2>
        <p className="text-xs text-white/40 text-center max-w-xs leading-relaxed">
          Aproveitamos a mesma visita para as deixar como novas antes de proteger. Totalmente opcional.
        </p>

        {/* Mesmo cartão "estilo companhia aérea" do upsell de colchão — Top
            badge, ícone, e botão circular +/✕ à direita (uniformizado
            2026-09-08, pedido explícito do dono). */}
        <button
          onClick={toggleAddon}
          className={cn(
            'relative w-full max-w-xs min-h-[76px] flex items-center gap-3 pl-5 pr-3.5 py-3.5 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation mt-1',
            addonOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
          )}
        >
          <span className="absolute -top-2 -left-2 z-10 flex w-9 h-9 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
            <Star className="w-3 h-3 fill-[#12121e] text-[#12121e]" />
            <span className="text-[6px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
          </span>
          <Droplets className={cn('w-5 h-5 flex-shrink-0', addonOn ? 'text-gold' : 'text-gold/70')} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-bold', addonOn ? 'text-white' : 'text-white/90')}>Higienização Profunda</p>
            <p className="text-[10px] text-white/35 leading-snug mt-0.5">Elimina bactérias, odores e alergénios acumulados no estofo, para as sentir como novas.</p>
            {higienizacaoPrice !== null && (
              <p className={cn('text-[11px] font-semibold mt-1', addonOn ? 'text-gold' : 'text-gold/60')}>
                Por apenas <span className="font-black">+{fmt(higienizacaoPrice)}€</span>
              </p>
            )}
          </div>
          <span className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
            addonOn ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
          )}>
            <Plus className={cn('w-3.5 h-3.5 transition-transform', addonOn ? 'text-[#12121e] rotate-45' : 'text-gold')} strokeWidth={3} />
          </span>
        </button>

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
            {addonOn ? 'Adicionar e Continuar' : 'Continuar'}
          </button>
        </div>
      </div>
    );
  }

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
              : 'border-white/15 bg-[#1a2a1a] hover:border-gold/40'
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
          'relative w-full max-w-xs min-h-[76px] flex items-center gap-3 pl-5 pr-3.5 py-3.5 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation',
          antiAcarosOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
        )}
      >
        <span className="absolute -top-2 -left-2 z-10 flex w-9 h-9 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
          <Star className="w-3 h-3 fill-[#12121e] text-[#12121e]" />
          <span className="text-[6px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
        </span>
        <Bug className={cn('w-5 h-5 flex-shrink-0', antiAcarosOn ? 'text-gold' : 'text-gold/70')} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-bold', antiAcarosOn ? 'text-white' : 'text-white/90')}>Anti Ácaros</p>
          <p className="text-[10px] text-white/35 leading-snug mt-0.5">Evita que os ácaros voltem a aparecer e elimina bactérias do estofo.</p>
          <p className={cn('text-[11px] font-semibold mt-1', antiAcarosOn ? 'text-gold' : 'text-gold/60')}>
            Por apenas <span className="font-black">+{CHAIR_ANTI_ACAROS_UNIT_RATE}€/un.</span>
          </p>
        </div>
        <span className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
          antiAcarosOn ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
        )}>
          <Plus className={cn('w-3.5 h-3.5 transition-transform', antiAcarosOn ? 'text-[#12121e] rotate-45' : 'text-gold')} strokeWidth={3} />
        </span>
      </button>

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
          {anySelected ? 'Adicionar e Continuar' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default QuizChairsAddonUpsell;
