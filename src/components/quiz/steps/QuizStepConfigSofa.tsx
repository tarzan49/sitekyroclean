import QuizFurnitureImage from '../QuizFurnitureImage';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { sofaPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, SofaItem } from '@/components/quiz/QuizTypes';
import { sofaSetQty, calcPackPricing } from '@/components/quiz/quizHelpers';
import { WaterproofingTierPicker } from './WaterproofingTierPicker';

interface Props {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  sofaItems: SofaItem[];
  setSofaItems: React.Dispatch<React.SetStateAction<SofaItem[]>>;
}

// Extraído de QuizStepConfig.tsx (2026-09-08, thinning do ficheiro monolítico
// de 417 linhas que misturava sofá/colchão/tapete/cadeiras no mesmo
// componente — editar um arriscava um copy-paste error no bloco quase
// idêntico de outro, já causou pelo menos um bug real nesta sessão).
const QuizStepConfigSofa = ({ formData, updateFormData, sofaItems, setSofaItems }: Props) => {
  // Impermeabilização como serviço primário: a pessoa só vê Premium/Essencial
  // primeiro — as quantidades só aparecem depois de escolher, para não a
  // assaltar com tudo ao mesmo tempo (pedido explícito 2026-09-08). Não
  // precisa de reset manual — trocar de serviço desmonta este componente e
  // volta a montar do zero, o que já reseta este estado sozinho.
  const [tierChosen, setTierChosen] = useState(false);

  const isWaterproofBase = formData.serviceType === 'waterproofing';
  const has4Plus = (sofaItems.find(i => i.sizeId === '4+-lugares')?.qty ?? 0) > 0;

  return (
    <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
      <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">{isWaterproofBase ? 'PROTEÇÃO' : 'QUANTIDADES'}</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">
        {isWaterproofBase ? 'Escolha a sua impermeabilização' : 'Detalhes do(s) Sofá(s)'}
      </h2>
      {isWaterproofBase && (
        <WaterproofingTierPicker
          formData={formData}
          updateFormData={updateFormData}
          onSelect={() => setTierChosen(true)}
          activeTier={tierChosen ? formData.waterproofingTier : null}
        />
      )}
      {(!isWaterproofBase || tierChosen) && (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {sofaPrices.map(option => {
            const item = sofaItems.find(i => i.sizeId === option.id);
            const qty = item?.qty ?? 0;
            const packOn = item?.packEnabled ?? false;
            const isActive = qty > 0;
            const packTier = formData.waterproofingTier;
            const { isSob, displayPrice: dp } = calcPackPricing(option, packOn, isWaterproofBase, 40, packTier);
            // originalBothPrice (108/148/178) é a soma essencial fixa (limpeza + imperm.
            // essencial) — só serve de referência "preço riscado" para o pack Essencial.
            // No pack Premium a soma separada é maior (o waterproofing premium custa mais),
            // por isso recalcula-se aqui; sem isto o preço riscado ficava ABAIXO do preço
            // do pack Premium, mostrando um "desconto" que na verdade custava mais caro.
            const originalPackPrice = packTier === 'premium'
              && typeof option.cleaningPrice === 'number'
              && typeof option.waterproofingPremiumPrice === 'number'
              ? option.cleaningPrice + option.waterproofingPremiumPrice
              : option.originalBothPrice;
            return (
              <div key={option.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-dashed border-gold/30 bg-gold/[0.03]')}>
                <div className="flex items-center gap-2 px-2.5 sm:px-3 py-3">
                  <QuizFurnitureImage service="sofa" />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-sm font-semibold text-white">{option.label}</span>
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                      {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">PACK</span>}
                      {isActive && packOn && typeof originalPackPrice === 'number' && (
                        <span className="text-sm text-white/30 line-through tabular-nums">{originalPackPrice}€</span>
                      )}
                      {!packOn && isWaterproofBase && packTier === 'premium' && !isSob && typeof dp === 'number' && (
                        <span className="text-sm text-white/30 line-through tabular-nums">{dp + 10}€</span>
                      )}
                      <span className={cn('text-sm font-bold tabular-nums', isSob ? isActive ? 'text-white/70' : 'text-white/35' : (isActive && packOn) || (isWaterproofBase && packTier === 'premium') ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40')}>
                        {isSob ? 'Sob Orçamento' : `${dp}€/un.`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty - 1))} disabled={qty === 0} className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-20 disabled:border-transparent disabled:bg-transparent active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                    <span className={cn('w-5 text-center font-bold tabular-nums text-base', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                    <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty + 1))} className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                  </div>
                </div>
                {/* Upsell de impermeabilização/proteção (e, na direção contrária,
                    de higienização) vive só na página dedicada a seguir às
                    quantidades (QuizSofaAddonUpsell) — não faz sentido competir
                    visualmente com a escolha de quantidade aqui, e confundia o
                    cliente (pedido explícito 2026-09-08). */}
              </div>
            );
          })}
        </div>
      )}
      {(!isWaterproofBase || tierChosen) && has4Plus && <input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="Nº de lugares (ex: 5)" className="w-full max-w-sm bg-white/[0.06] border border-white/15 focus:border-gold focus:outline-none text-white placeholder:text-white/25 rounded-sm h-12 px-4 text-base transition-colors" onChange={(e) => updateFormData({ description: `Sofá com ${e.target.value} lugares` })} />}
    </div>
  );
};

export default QuizStepConfigSofa;
