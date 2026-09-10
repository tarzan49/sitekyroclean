import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, MattressItem } from '@/components/quiz/QuizTypes';
import { mattressSetQty, mattressTogglePack, calcPackPricing } from '@/components/quiz/quizHelpers';

interface Props {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  mattressItems: MattressItem[];
  setMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;
}

// Extraído de QuizStepConfig.tsx (2026-09-08, thinning do ficheiro monolítico
// de 417 linhas que misturava sofá/colchão/tapete/cadeiras no mesmo
// componente).
const QuizStepConfigMattress = ({ formData, updateFormData, mattressItems, setMattressItems }: Props) => {
  const isWaterproofBase = formData.serviceType === 'waterproofing';

  return (
    <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
      <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">{isWaterproofBase ? 'Que colchões vamos tratar?' : 'Que colchões vamos limpar?'}</h2>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {mattressPrices.map(option => {
          const item = mattressItems.find(i => i.sizeId === option.id);
          const qty = item?.qty ?? 0;
          const packOn = item?.packEnabled ?? false;
          const isActive = qty > 0;
          // Anti Ácaros reaproveita o motor de preços da impermeabilização (só
          // essencial, sem tier premium) — ver comentário em QuizTypes.ts.
          const { isSob, packDelta, displayPrice: dp } = calcPackPricing(option, packOn, isWaterproofBase, 30);
          const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Anti Ácaros';
          const upsellSub = isWaterproofBase ? `+${packDelta}€/un. · Limpeza profunda incluída` : `+${packDelta}€/un. · Tratamento anti-ácaros`;
          return (
            <div key={option.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-dashed border-gold/30 bg-gold/[0.03]')}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-sm font-semibold text-white">{option.label}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">PACK</span>}
                    {isActive && packOn && typeof option.originalBothPrice === 'number' && (
                      <span className="text-sm text-white/30 line-through tabular-nums">{option.originalBothPrice}€</span>
                    )}
                    <span className={cn('text-sm font-bold tabular-nums', isSob ? isActive ? 'text-white/70' : 'text-white/35' : isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40')}>
                      {isSob ? 'Sob Orçamento' : `${dp}€/un.`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty - 1))} disabled={qty === 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-20 disabled:border-transparent disabled:bg-transparent active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                  <span className={cn('w-7 text-center font-bold tabular-nums text-base', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                  <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty + 1))} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                </div>
              </div>
              {/* O upsell de Anti Ácaros (limpeza como serviço primário) passou para a
                  página dedicada a seguir às quantidades (QuizMattressAddonUpsell) —
                  mesma lógica aplicada a sofá e cadeiras (pedido explícito 2026-09-08).
                  Mantém-se aqui só quando anti-ácaros É o serviço primário. */}
              {isActive && !isSob && isWaterproofBase && (
                <div className="px-4 pb-3">
                  <button onClick={() => setMattressItems(mattressTogglePack(mattressItems, option.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-gold/15 bg-[#1a2a1a] hover:border-gold/40')}>
                    <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                    <div className="flex-1 text-left">
                      <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>{upsellLabel}</p>
                      <p className={cn('text-[11px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>{upsellSub}</p>
                    </div>
                    <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                      <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                    </div>
                  </button>
                  <p className="text-[10px] text-white/25 leading-snug mt-1.5 px-1">
                    Tratamento adicional dirigido a ácaros, com aplicação adequada ao tecido. Não está incluído na limpeza normal.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizStepConfigMattress;
