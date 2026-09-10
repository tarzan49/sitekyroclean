import { WaterproofingTierPicker } from './WaterproofingTierPicker';
import QuizCareIntro from '../QuizCareIntro';
import { ChevronLeft, Check, Droplets, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizFormData } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium } from '@/components/quiz/quizHelpers';

interface QuizChairsAddonUpsellProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  hideNavigation?: boolean;
  onContinue: () => void;
  onBack: () => void;
}

// Desbacterização e antiácaros incluídos na impermeabilização, sem opção separada.

// Upsell "estilo companhia aérea": aparece uma única vez, logo a seguir ao
// "Continuar" da etapa de quantidades das cadeiras (só quando a limpeza é o
// serviço principal), para a pessoa pensar só em quantidade nessa etapa e
// decidir o extra aqui, sem competir visualmente com a quantidade.
const QuizChairsAddonUpsell = ({ formData, updateFormData, onContinue, onBack, hideNavigation = false }: QuizChairsAddonUpsellProps) => {
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
      <div className="flex flex-col gap-2 overflow-hidden items-center w-full">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Quer também Higienização Profunda?</h2>
        <p className="text-xs text-white/70 text-center max-w-sm leading-relaxed">
          Limpeza profunda das suas cadeiras antes da aplicação da proteção. Opcional.
        </p>

        {/* Mesmo cartão "estilo companhia aérea" do upsell de colchão — Top
            badge, ícone, e botão circular +/✕ à direita (uniformizado
            2026-09-08, pedido explícito do dono). */}
        <button
          onClick={toggleAddon}
          className={cn(
            'relative w-full max-w-sm min-h-[76px] flex items-center gap-3 pl-5 pr-3.5 py-3.5 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation mt-1',
            addonOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
          )}
        >
          <Droplets className={cn('w-5 h-5 flex-shrink-0', addonOn ? 'text-gold' : 'text-gold/70')} />
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-bold', addonOn ? 'text-white' : 'text-white/90')}>Higienização Profunda</p>
            <p className="text-[10px] text-white/65 leading-snug mt-0.5">Elimina bactérias, odores e alergénios acumulados no estofo, para as sentir como novas.</p>
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

        {!hideNavigation && <ChairAddonActions selected={addonOn} onBack={onBack} onContinue={onContinue} />}
      </div>
    );
  }

  const waterproofTier: 'premium' | 'essencial' | null = formData.chairWaterproofing
    ? (formData.waterproofingTier === 'premium' ? 'premium' : 'essencial')
    : null;
  const anySelected = waterproofTier !== null;

  const selectWaterproof = (tier: 'premium' | 'essencial') => {
    const turningOff = waterproofTier === tier;
    updateFormData(
      turningOff
        ? { chairWaterproofing: false, chairWaterproofQty: 0, chairAntiAcaros: false }
        : { chairWaterproofing: true, chairWaterproofQty: qty, waterproofingTier: tier, chairAntiAcaros: false }
    );
  };


  return (
    <div className="flex flex-col gap-1.5 overflow-hidden items-center w-full">
      <h2 className="font-playfair text-2xl font-bold text-white text-center w-full">Proteja as suas cadeiras</h2>
      <QuizCareIntro service="chairs">
        <ul className="space-y-1.5">{['Repele líquidos', 'Facilita a remoção de manchas', 'Ajuda a conservar o tecido'].map(benefit => <li key={benefit} className="flex items-start gap-1.5"><Check aria-hidden="true" className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" /><span>{benefit}</span></li>)}</ul>
      </QuizCareIntro>

      <div className="w-full max-w-sm py-1 text-center">
        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gold"><Check aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />Desbacterização + Antiácaros</p>
        <p className="text-[10px] text-white/65 mt-1">Incluídos em qualquer proteção</p>
      </div>
      <p className="text-[10px] text-white/65 text-center">Preço para {qty} {qty === 1 ? 'cadeira' : 'cadeiras'} · antes de descontos</p>
      <WaterproofingTierPicker
        compact
        centered
        formData={formData}
        updateFormData={() => {}}
        onSelect={selectWaterproof}
        activeTier={waterproofTier}
        prices={{ premium: premiumPrice, essencial: essencialPrice }}
        priceScope={`para ${qty} ${qty === 1 ? 'cadeira' : 'cadeiras'}`}
        premiumDifference={premiumPrice !== null && essencialPrice !== null ? premiumPrice - essencialPrice : null}
      />



      {!hideNavigation && <ChairAddonActions selected={anySelected} onBack={onBack} onContinue={onContinue} />}
    </div>
  );
};

export default QuizChairsAddonUpsell;

export function ChairAddonActions({ selected, onBack, onContinue }: { selected: boolean; onBack: () => void; onContinue: () => void }) {
  return (<div className="flex items-center gap-3 w-full max-w-sm mt-1">
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
          {selected ? 'Continuar com tratamento' : 'Continuar sem extras'}
        </button>
      </div>);
}
