import QuizFurnitureImage from '../QuizFurnitureImage';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { QuizFormData } from '@/components/quiz/QuizTypes';
import { calcChairClean, calcChairWaterproof, calcChairWaterproofPremium } from '@/components/quiz/quizHelpers';
import { WHATSAPP_BASE } from '@/constants/business';
import { WaterproofingTierPicker } from './WaterproofingTierPicker';

interface Props {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
}

// Extraído de QuizStepConfig.tsx (2026-09-08, thinning do ficheiro monolítico
// de 417 linhas que misturava sofá/colchão/tapete/cadeiras no mesmo
// componente — editar cadeiras arriscava um copy-paste error no bloco quase
// idêntico do sofá, já causou pelo menos um bug real nesta sessão).
const QuizStepConfigChairs = ({ formData, updateFormData }: Props) => {
  // Ver o mesmo padrão em QuizStepConfigSofa.tsx — não precisa de reset
  // manual, trocar de serviço desmonta este componente e volta a montar do
  // zero, o que já reseta este estado sozinho.
  const [tierChosen, setTierChosen] = useState(false);

  const isWaterproofPrimary = formData.serviceType === 'waterproofing';
  const isPremiumTier = formData.waterproofingTier === 'premium';
  const calcWaterproof = isPremiumTier ? calcChairWaterproofPremium : calcChairWaterproof;
  const qty = Math.max(1, parseInt(formData.chairQuantity) || 1);
  const primaryPrice = isWaterproofPrimary ? calcWaterproof(qty) : calcChairClean(qty);
  const addonEnabled = formData.chairWaterproofing;
  const sob = primaryPrice === null;

  const setChairQty = (newQty: number) => {
    const clamped = Math.max(1, newQty);
    updateFormData({
      chairQuantity: String(clamped),
      chairType: 'bulk_full',
      ...(addonEnabled ? { chairWaterproofQty: clamped } : {}),
    });
  };

  const chairWhatsappMsg = encodeURIComponent('Olá, tenho cadeiras de um tipo diferente (sem tampo, costas ou braços) e gostava de um orçamento personalizado.');

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">{isWaterproofPrimary ? 'PROTEÇÃO' : 'O QUE PRECISA?'}</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">
        {isWaterproofPrimary ? 'Escolha a sua impermeabilização' : 'Quantas cadeiras vamos limpar?'}
      </h2>
      <p className="text-xs text-white/65 text-center">{isWaterproofPrimary ? 'Escolha a proteção e indique a quantidade.' : 'Escolha a quantidade. Nós tratamos da limpeza.'}</p>
      {isWaterproofPrimary && (
        <WaterproofingTierPicker
          formData={formData}
          updateFormData={updateFormData}
          onSelect={() => setTierChosen(true)}
          activeTier={tierChosen ? formData.waterproofingTier : null}
        />
      )}
      {(!isWaterproofPrimary || tierChosen) && (
        <div className="w-full max-w-sm rounded-sm border border-gold/35 bg-[#1a2a1a] px-4 py-4 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
          <div className="flex items-center gap-3 text-left mb-4">
            <QuizFurnitureImage service="chairs" className="!w-20 !h-20" />
            <div>
              <p className="font-semibold text-white">Cadeiras estofadas</p>
              <p className="text-xs text-white/65 mt-1">{isWaterproofPrimary ? `Impermeabilização ${isPremiumTier ? 'Premium' : 'Essencial'}` : 'Higienização profunda'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <button type="button" aria-label="Retirar uma cadeira" onClick={() => setChairQty(qty - 1)} disabled={qty <= 1}
              className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
            <div className="text-center" aria-live="polite">
              <span className="text-3xl font-black text-gold tabular-nums">{qty}</span>
              <p className="text-xs text-white/70">{qty === 1 ? 'cadeira' : 'cadeiras'}</p>
            </div>
            <button type="button" aria-label="Adicionar uma cadeira" onClick={() => setChairQty(qty + 1)}
              className="w-14 h-14 rounded-sm border-2 border-gold/50 bg-gold/[0.08] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold">+</button>
          </div>
          <div className="border-t border-gold/20 mt-4 pt-3 flex items-center justify-between gap-3 text-left">
            <span className="text-xs text-white/75">{isWaterproofPrimary ? 'Proteção das cadeiras' : 'Limpeza das cadeiras'}</span>
            <span className={cn('font-bold tabular-nums', sob ? 'text-sm text-white/80' : 'text-xl text-gold')}>
              {sob ? 'Sob orçamento' : `${primaryPrice.toLocaleString('pt-PT')}€`}
            </span>
          </div>
          <p className="text-[10px] text-white/60 mt-1 text-left">{sob ? 'Confirmamos o valor para o seu conjunto.' : 'Sem deslocação nem extras. O total está no topo.'}</p>
        </div>
      )}
      {/* Upsell de Higienização (impermeabilização como serviço primário)
          passou para a página dedicada a seguir às quantidades — mesma
          lógica já aplicada ao sofá (pedido explícito 2026-09-08). */}
      {/* Aviso de tipo de cadeira: discreto de propósito, é uma exceção, não a
          regra — não deve competir visualmente com o preço/opções acima. */}
      <p className="text-[10px] text-white/60 text-center leading-relaxed px-2 max-w-sm">
        Preço para cadeiras com tampo, costas e braços. Cadeira diferente?{' '}
        <a
          href={`${WHATSAPP_BASE}?text=${chairWhatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#72cba3] hover:text-[#25D366] underline underline-offset-2 touch-manipulation whitespace-nowrap"
        >
          Pedir no WhatsApp
        </a>
      </p>
    </div>
  );
};

export default QuizStepConfigChairs;
