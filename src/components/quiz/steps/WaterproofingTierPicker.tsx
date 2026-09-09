import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizFormData } from '@/components/quiz/QuizTypes';

// Escolha Essencial (água) vs Premium (diluente), só aparece quando o serviceType
// é 'waterproofing' standalone — o Pack (both) fica sempre Essencial, não há preço
// de combo definido para Premium+limpeza.
//
// Extraído de QuizStepConfig.tsx (2026-09-08, thinning do ficheiro monolítico
// de 417 linhas) — usado por QuizStepConfigSofa, QuizStepConfigChairs, e
// QuizSofaAddonUpsell.
export function WaterproofingTierPicker({ formData, updateFormData, onSelect, activeTier }: { formData: Pick<QuizFormData, 'waterproofingTier'>; updateFormData: (u: Partial<QuizFormData>) => void; onSelect?: (t: 'premium' | 'essencial') => void; activeTier?: 'premium' | 'essencial' | null }) {
  // activeTier deixa o chamador decidir o que conta como "selecionado" na UI
  // — por omissão é a preferência de tier (formData.waterproofingTier), mas
  // um upsell onde ainda ninguém clicou em nada não pode mostrar um cartão já
  // dourado/marcado (pedido explícito 2026-09-08: "parece que a pessoa já
  // escolheu algo e ainda não escolheu").
  const tier = activeTier === undefined ? formData.waterproofingTier : activeTier;
  return (
    <div className="w-full max-w-sm grid grid-cols-2 gap-2 mb-1 pt-3 items-stretch">
      <button
        type="button"
        aria-pressed={tier === 'premium'}
        onClick={() => { updateFormData({ waterproofingTier: 'premium' }); onSelect?.('premium'); }}
        className={cn(
          'relative rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
          tier === 'premium'
            ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]'
            : 'border-white/15 bg-[#1a2a1a] hover:border-gold/40'
        )}
      >
        {/* Selo "escolha superior": canto sólido em vez do pill em gradiente
            anterior, que lia como template genérico e pouco tinha de impacto. */}
        <span className="absolute -top-2 -right-2 z-10 flex w-9 h-9 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
          <Star className="w-3 h-3 fill-[#12121e] text-[#12121e]" />
          <span className="text-[6px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
        </span>
        <div className="flex items-center gap-1.5 mb-0.5">
          {tier === 'premium' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-xs font-bold', tier === 'premium' ? 'text-white' : 'text-white/85')}>Premium</p>
        </div>
        <p className={cn('text-[10px] leading-snug font-semibold', tier === 'premium' ? 'text-gold/70' : 'text-gold/45')}>Até 10 anos de proteção · até 5 lavagens</p>
      </button>
      <button
        type="button"
        aria-pressed={tier === 'essencial'}
        onClick={() => { updateFormData({ waterproofingTier: 'essencial' }); onSelect?.('essencial'); }}
        className={cn('rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation', tier === 'essencial' ? 'border-gold bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40')}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          {tier === 'essencial' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-xs font-bold', tier === 'essencial' ? 'text-white' : 'text-white/60')}>Essencial</p>
        </div>
        <p className="text-[10px] text-white/35 leading-snug">1 a 2 anos de proteção · até 2 lavagens</p>
      </button>
    </div>
  );
}
