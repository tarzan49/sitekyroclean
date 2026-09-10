import QuizTopBadge from '../QuizTopBadge';
import { Check, ShieldCheck, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizFormData } from '@/components/quiz/QuizTypes';

// Escolha Essencial (água) vs Premium (diluente), só aparece quando o serviceType
// é 'waterproofing' standalone — o Pack (both) fica sempre Essencial, não há preço
// de combo definido para Premium+limpeza.
//
// Extraído de QuizStepConfig.tsx (2026-09-08, thinning do ficheiro monolítico
// de 417 linhas) — usado por QuizStepConfigSofa, QuizStepConfigChairs, e
// QuizSofaAddonUpsell.
export function WaterproofingTierPicker({ formData, updateFormData, onSelect, activeTier, premiumDifference, prices, priceScope }: { formData: Pick<QuizFormData, 'waterproofingTier'>; updateFormData: (u: Partial<QuizFormData>) => void; onSelect?: (t: 'premium' | 'essencial') => void; activeTier?: 'premium' | 'essencial' | null; premiumDifference?: number | null; prices?: { essencial: number | null; premium: number | null }; priceScope?: string }) {
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
        <QuizTopBadge className="absolute -top-3 right-3 z-10" />
        <ShieldCheck aria-hidden="true" className="w-7 h-7 text-gold mb-2" />
        <div className="flex items-center gap-1.5 mb-0.5">
          {tier === 'premium' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-xs font-bold', tier === 'premium' ? 'text-white' : 'text-white/85')}>Premium</p>
        </div>
        {prices && <p className="text-xl font-bold text-gold mt-2 mb-1">{prices.premium === null ? 'Sob orçamento' : `+${prices.premium.toLocaleString('pt-PT')}€`}</p>}
        {prices && <p className="text-[10px] text-white/65 mb-2">{priceScope} · antes de descontos</p>}
        {premiumDifference != null && premiumDifference > 0 && <p className="text-[11px] font-semibold text-gold mb-2 leading-snug">Só mais {premiumDifference.toLocaleString('pt-PT')}€ que o Essencial</p>}
        <p className={cn('text-[11px] leading-relaxed font-semibold', tier === 'premium' ? 'text-gold/70' : 'text-gold/80')}>Até 10 anos de proteção · até 5 lavagens</p>
      </button>
      <button
        type="button"
        aria-pressed={tier === 'essencial'}
        onClick={() => { updateFormData({ waterproofingTier: 'essencial' }); onSelect?.('essencial'); }}
        className={cn('relative rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation', tier === 'essencial' ? 'border-gold bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40')}
      >
        <Droplets aria-hidden="true" className="w-7 h-7 text-gold/75 mb-2" />
        <div className="flex items-center gap-1.5 mb-0.5">
          {tier === 'essencial' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-xs font-bold', tier === 'essencial' ? 'text-white' : 'text-white/80')}>Essencial</p>
        </div>
        {prices && <p className="text-xl font-bold text-white mt-2 mb-1">{prices.essencial === null ? 'Sob orçamento' : `+${prices.essencial.toLocaleString('pt-PT')}€`}</p>}
        {prices && <p className="text-[10px] text-white/65 mb-2">{priceScope} · antes de descontos</p>}
        <p className="text-[10px] text-white/70 leading-snug">1 a 2 anos de proteção · até 2 lavagens</p>
      </button>
    </div>
  );
}
