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
export function WaterproofingTierPicker({ formData, updateFormData, onSelect, activeTier, premiumDifference, prices, priceScope, compact = false, centered = false }: { formData: Pick<QuizFormData, 'waterproofingTier'>; updateFormData: (u: Partial<QuizFormData>) => void; onSelect?: (t: 'premium' | 'essencial') => void; activeTier?: 'premium' | 'essencial' | null; premiumDifference?: number | null; prices?: { essencial: number | null; premium: number | null }; priceScope?: string; compact?: boolean; centered?: boolean }) {
  // activeTier deixa o chamador decidir o que conta como "selecionado" na UI
  // — por omissão é a preferência de tier (formData.waterproofingTier), mas
  // um upsell onde ainda ninguém clicou em nada não pode mostrar um cartão já
  // dourado/marcado (pedido explícito 2026-09-08: "parece que a pessoa já
  // escolheu algo e ainda não escolheu").
  const tier = activeTier === undefined ? formData.waterproofingTier : activeTier;
  return (
    <div className="w-full max-w-sm mx-auto grid grid-cols-2 gap-2 mb-1 pt-3 items-stretch">
      <button
        type="button"
        aria-pressed={tier === 'premium'}
        onClick={() => { updateFormData({ waterproofingTier: 'premium' }); onSelect?.('premium'); }}
        className={cn(
          'relative rounded-sm border-2 px-3 py-2.5 transition-all duration-200 touch-manipulation',
          centered ? 'text-center flex flex-col items-center' : 'text-left',
          tier === 'premium'
            ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]'
            : 'border-white/15 bg-[#1a2a1a] hover:border-gold/40'
        )}
      >
        {/* Selo "escolha superior": canto sólido em vez do pill em gradiente
            anterior, que lia como template genérico e pouco tinha de impacto. */}
        <QuizTopBadge className={cn("absolute -top-3 z-10", centered ? "left-1/2 -translate-x-1/2" : "right-3")} />
        {!compact && <ShieldCheck aria-hidden="true" className="w-7 h-7 text-gold mb-2" />}
        <div className={cn("flex items-center gap-1.5 mb-0.5", centered && "justify-center")}>
          {tier === 'premium' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-sm font-bold', tier === 'premium' ? 'text-white' : 'text-white/85')}>Premium</p>
        </div>
        {prices && <div className="w-full rounded-sm border border-gold/35 bg-gold/[0.09] px-2.5 py-2.5 mt-2 mb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gold/75 mb-1.5">Acréscimo ao serviço</p>
          <p className="text-[2rem] sm:text-4xl leading-none font-black tracking-[-0.04em] tabular-nums text-[#F1CB45] drop-shadow-[0_2px_10px_rgba(212,175,55,0.22)]">{prices.premium === null ? 'Sob orçamento' : `+${prices.premium.toLocaleString('pt-PT')}€`}</p>
          {!compact && <p className="text-[11px] font-medium text-white/75 mt-2">{priceScope} · antes de descontos</p>}
        </div>}
        {premiumDifference != null && premiumDifference > 0 && <p className="text-[11px] font-semibold text-gold mb-2 leading-snug">Só mais {premiumDifference.toLocaleString('pt-PT')}€ que o Essencial</p>}
        <p className={cn('text-[11px] leading-relaxed font-semibold', tier === 'premium' ? 'text-gold/70' : 'text-gold/80')}>{compact ? 'Até 10 anos · até 5 lavagens' : 'Até 10 anos de proteção · até 5 lavagens'}</p>
      </button>
      <button
        type="button"
        aria-pressed={tier === 'essencial'}
        onClick={() => { updateFormData({ waterproofingTier: 'essencial' }); onSelect?.('essencial'); }}
        className={cn('relative rounded-sm border-2 px-3 py-2.5 transition-all duration-200 touch-manipulation',
          centered ? 'text-center flex flex-col items-center' : 'text-left', tier === 'essencial' ? 'border-gold bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40')}
      >
        {!compact && <Droplets aria-hidden="true" className="w-7 h-7 text-gold/75 mb-2" />}
        <div className={cn("flex items-center gap-1.5 mb-0.5", centered && "justify-center")}>
          {tier === 'essencial' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-sm font-bold', tier === 'essencial' ? 'text-white' : 'text-white/80')}>Essencial</p>
        </div>
        {prices && <div className="w-full rounded-sm border border-gold/35 bg-gold/[0.09] px-2.5 py-2.5 mt-2 mb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gold/75 mb-1.5">Acréscimo ao serviço</p>
          <p className="text-[2rem] sm:text-4xl leading-none font-black tracking-[-0.04em] tabular-nums text-[#F1CB45] drop-shadow-[0_2px_10px_rgba(212,175,55,0.22)]">{prices.essencial === null ? 'Sob orçamento' : `+${prices.essencial.toLocaleString('pt-PT')}€`}</p>
          {!compact && <p className="text-[11px] font-medium text-white/75 mt-2">{priceScope} · antes de descontos</p>}
        </div>}
        <p className="text-[10px] text-white/70 leading-snug">{compact ? '1 a 2 anos · até 2 lavagens' : '1 a 2 anos de proteção · até 2 lavagens'}</p>
      </button>
    </div>
  );
}
