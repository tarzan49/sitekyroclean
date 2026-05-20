/**
 * QuizSummary.tsx
 * Order summary / review screen shown before final submission.
 * Currently rendered inside a {false && ...} guard in the orchestrator
 * (kept for future activation without functional regression).
 */

import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices, sofaChaisePrice } from '@/components/quiz/QuizTypes';
import type { QuizFormData } from '@/components/quiz/QuizTypes';
import type { SofaItem, MattressItem, UpsellItemConfig } from '@/components/quiz/QuizTypes';

interface QuizSummaryProps {
  formData: QuizFormData;
  sofaItems: SofaItem[];
  mattressItems: MattressItem[];
  chaiseLongueQty: number;
  upsellItems: UpsellItemConfig[];

  totalPrice: number;
  calculateServicePrice: number;

  isFreeTravel: boolean;
  finalTravelCost: number;
  hypoSurcharge: number;

  packDiscountActive: boolean;
  packDiscountPct: number;
  packDiscountedPrice: number;
  isDiscountActive: boolean;
  discountedPrice: number;

  /** Label for the selected service. */
  serviceLabel: string;
  /** Label for the selected service type (e.g. "Higienização"). */
  serviceTypeLabel: string;
  /** Formatted selected time slot string. */
  formattedSlot: string;

  /** Navigate to the next step (confirm) */
  onConfirm: () => void;
  /** Navigate back to the upsell step */
  onBack: () => void;
}

/**
 * Read-only order summary component.
 * Lists all selected items, travel cost, discount lines, and the final total.
 */
const QuizSummary = ({
  formData,
  sofaItems,
  mattressItems,
  chaiseLongueQty,
  upsellItems,
  totalPrice,
  calculateServicePrice,
  isFreeTravel,
  finalTravelCost,
  hypoSurcharge,
  packDiscountActive,
  packDiscountPct,
  packDiscountedPrice,
  isDiscountActive,
  discountedPrice,
  serviceLabel,
  serviceTypeLabel,
  formattedSlot,
  onConfirm,
  onBack,
}: QuizSummaryProps) => {
  const buildFirstDetailLine = (): string => {
    if (formData.service === 'sofa') {
      const lines = sofaItems
        .filter(i => i.qty > 0)
        .map(i => {
          const opt = sofaPrices.find(p => p.id === i.sizeId);
          return opt ? `${i.qty}x Sofá ${opt.label}` : null;
        })
        .filter(Boolean) as string[];
      return lines[0] ?? '—';
    }
    if (formData.service === 'mattress') {
      const lines = mattressItems
        .filter(i => i.qty > 0)
        .map(i => {
          const opt = mattressPrices.find(p => p.id === i.sizeId);
          return opt ? `${i.qty}x Colchão ${opt.label}` : null;
        })
        .filter(Boolean) as string[];
      return lines[0] ?? '—';
    }
    if (formData.service === 'carpet') return formData.carpetArea ? `Tapete ${formData.carpetArea}m²` : '—';
    if (formData.service === 'chairs') return formData.chairQuantity ? `${formData.chairQuantity} cadeira(s)` : '—';
    return '—';
  };

  const imgs: Record<string, string> = {
    mattress: '/images/services/colchao.webp',
    carpet: '/images/services/tapete.webp',
    chairs: '/images/services/cadeira.webp',
  };
  const names: Record<string, string> = {
    mattress: 'Colchão',
    carpet: 'Tapete',
    chairs: 'Cadeiras',
  };

  return (
    <div className="flex-1 flex flex-col w-full items-center">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-4">
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden mb-3">
          {/* Main service */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06]">
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm font-bold text-white truncate">
                {serviceLabel}{serviceTypeLabel ? `, ${serviceTypeLabel}` : ''}
              </p>
              <p className="text-[10px] text-white/35 truncate">{buildFirstDetailLine()}</p>
            </div>
            <span className="text-sm font-bold text-white flex-shrink-0">
              {calculateServicePrice > 0 ? `${calculateServicePrice}€` : 'Sob orç.'}
            </span>
          </div>

          {/* Upsell items */}
          {upsellItems.map((item, i) => {
            const detail = item.mattressSize
              ? ` ${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? ''}`
              : item.carpetArea ? ` ${item.carpetArea}m²`
              : item.chairQty ? ` ${item.chairQty}x`
              : '';
            const waterproofStr =
              item.waterproof && item.waterproofPrice
                ? ` + Impermeab. (+${item.waterproofPrice}€)`
                : '';
            return (
              <div key={i} className="flex justify-between items-start px-4 py-3 border-b border-white/[0.06]">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2">
                    {imgs[item.id] && (
                      <picture>
                        <source srcSet={imgs[item.id]} type="image/webp" />
                        <img src={imgs[item.id].replace('.webp', '.png')} alt="" className="w-8 h-7 object-cover rounded flex-shrink-0" loading="lazy" />
                      </picture>
                    )}
                    <p className="text-sm text-white/80">{names[item.id] ?? item.id}{detail}</p>
                  </div>
                  {waterproofStr && (
                    <p className="text-[10px] text-gold/60 mt-0.5 flex items-center gap-1">
                      <Shield className="w-3 h-3 inline-block" />{waterproofStr.replace(' + Impermeab.', ' Impermeabilização')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-white flex-shrink-0">
                  {item.price > 0 ? `${item.price}€` : 'Sob orç.'}
                </span>
              </div>
            );
          })}

          {/* Travel */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm text-white/50">Deslocação</span>
            <span className={cn('text-sm font-bold ml-3 flex-shrink-0', isFreeTravel ? 'text-green-400' : 'text-white/70')}>
              {isFreeTravel ? 'Grátis' : `${finalTravelCost}€`}
            </span>
          </div>

          {/* Hypoallergenic */}
          {hypoSurcharge > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm text-white/50">Hipoalergénico</span>
              <span className="text-sm font-bold text-white/70 ml-3 flex-shrink-0">+{hypoSurcharge}€</span>
            </div>
          )}

          {/* Pack discount */}
          {packDiscountActive && totalPrice > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06] bg-gold/[0.05]">
              <span className="text-sm text-gold font-bold">Desconto Pack ({Math.round(packDiscountPct * 100)}%)</span>
              <span className="text-sm font-bold text-gold ml-3 flex-shrink-0">
                −{(totalPrice - packDiscountedPrice).toFixed(2).replace('.', ',')}€
              </span>
            </div>
          )}
          {!packDiscountActive && isDiscountActive && totalPrice > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06] bg-gold/[0.05]">
              <span className="text-sm text-gold font-bold">Desconto Urgência (5%)</span>
              <span className="text-sm font-bold text-gold ml-3 flex-shrink-0">
                −{(totalPrice - discountedPrice).toFixed(2).replace('.', ',')}€
              </span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center px-4 py-4 bg-gold/[0.08]">
            <span className="text-base font-black text-white uppercase tracking-wide">Total</span>
            <span className="text-xl font-black text-gold tabular-nums">
              {packDiscountActive
                ? `${packDiscountedPrice}€`
                : isDiscountActive && totalPrice > 0
                  ? `${discountedPrice}€`
                  : totalPrice > 0
                    ? `${totalPrice}€`
                    : 'Sob orçamento'}
            </span>
          </div>
        </div>

        <p className="text-[9px] text-white/20 text-center mb-4">
          Valor inclui IVA à taxa legal. Sujeito a confirmação presencial.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full h-13 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-base tracking-wider uppercase rounded-xl shadow-[0_0_32px_rgba(212,175,55,0.30)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Confirmar e Preencher Dados
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-white/55 transition-colors py-2 touch-manipulation"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Alterar itens
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;
