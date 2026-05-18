import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, sofaChaisePrice, QuizFormData, SofaItem } from './QuizTypes';

export type { SofaItem };

interface QuizStep2SofaProps {
  formData: QuizFormData;
  onUpdate: (updates: Partial<QuizFormData>) => void;
  sofaItems: SofaItem[];
  onSofaItemsChange: (items: SofaItem[]) => void;
}

function setQtyHelper(items: SofaItem[], sizeId: string, newQty: number): SofaItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}

function togglePackHelper(items: SofaItem[], sizeId: string): SofaItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}

const QuizStep2Sofa = ({ formData, onUpdate, sofaItems, onSofaItemsChange }: QuizStep2SofaProps) => {
  const hasSofas = sofaItems.some(i => i.qty > 0);
  const has4Plus = (sofaItems.find(i => i.sizeId === '4+-lugares')?.qty ?? 0) > 0;

  const grandTotal = sofaItems.reduce((sum, item) => {
    const opt = sofaPrices.find(p => p.id === item.sizeId);
    if (!opt) return sum;
    const isSob = typeof opt.cleaningPrice !== 'number';
    if (isSob) return sum;
    const unit = item.packEnabled && typeof opt.bothPrice === 'number'
      ? (opt.bothPrice as number)
      : (opt.cleaningPrice as number);
    return sum + item.qty * unit;
  }, 0) + (formData.sofaHasChaise && hasSofas ? sofaChaisePrice.cleaning : 0);

  return (
    <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
      <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">
        Detalhes do(s) Sofá(s)
      </h2>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        {sofaPrices.map(option => {
          const item = sofaItems.find(i => i.sizeId === option.id);
          const qty = item?.qty ?? 0;
          const packOn = item?.packEnabled ?? false;
          const isActive = qty > 0;
          const isSob = typeof option.cleaningPrice !== 'number';
          const cleanPrice = isSob ? null : (option.cleaningPrice as number);
          const bothPrice = (!isSob && typeof option.bothPrice === 'number') ? (option.bothPrice as number) : null;
          const displayPrice = packOn && bothPrice !== null ? bothPrice : cleanPrice;

          return (
            <div
              key={option.id}
              className={cn(
                'rounded-xl border-2 transition-all duration-200 overflow-hidden',
                isActive && packOn
                  ? 'border-gold bg-gold/10 shadow-[0_0_12px_rgba(212,175,55,0.20)]'
                  : isActive
                  ? 'border-white/30 bg-white/[0.05]'
                  : 'border-white/[0.10] bg-white/[0.03]'
              )}
            >
              {/* Main row: label + price + qty controls */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-sm font-semibold text-white">{option.label}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isActive && packOn && (
                      <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">VIP</span>
                    )}
                    <span className={cn(
                      'text-sm font-bold tabular-nums',
                      isSob
                        ? isActive ? 'text-white/70' : 'text-white/35'
                        : isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40'
                    )}>
                      {isSob ? 'Sob Orçamento' : `${displayPrice}€/un.`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onSofaItemsChange(setQtyHelper(sofaItems, option.id, qty - 1))}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >−</button>
                  <span className={cn(
                    'w-6 text-center font-bold tabular-nums text-sm',
                    isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30'
                  )}>{qty}</span>
                  <button
                    onClick={() => onSofaItemsChange(setQtyHelper(sofaItems, option.id, qty + 1))}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >+</button>
                </div>
              </div>

              {/* Per-item pack toggle — only shown when qty > 0 and not sob orçamento */}
              {isActive && !isSob && bothPrice !== null && cleanPrice !== null && (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => onSofaItemsChange(togglePackHelper(sofaItems, option.id))}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 touch-manipulation',
                      packOn
                        ? 'border-gold/50 bg-gold/[0.08]'
                        : 'border-white/10 bg-white/[0.03] hover:border-gold/30'
                    )}
                  >
                    <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                    <div className="flex-1 text-left">
                      <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>
                        + Impermeabilização
                      </p>
                      <p className={cn('text-[9px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>
                        {cleanPrice}€ → {bothPrice}€ · +30€/un.
                      </p>
                    </div>
                    <div className={cn(
                      'w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0',
                      packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]'
                    )}>
                      <div className={cn(
                        'w-3 h-3 rounded-full transition-all duration-300',
                        packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0'
                      )} />
                    </div>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4+ lugares: description input */}
      {has4Plus && (
        <input
          placeholder="Indica quantos lugares tem o sofá"
          className="w-full max-w-sm bg-white/[0.06] border border-white/15 focus:border-gold focus:outline-none text-white placeholder:text-white/25 rounded-xl h-11 px-4 text-sm transition-colors"
          onChange={(e) => onUpdate({ description: `Sofá com ${e.target.value} lugares` })}
        />
      )}

      {/* Chaise Longue toggle — grayed out until a sofa is selected */}
      <button
        onClick={() => { if (hasSofas) onUpdate({ sofaHasChaise: !formData.sofaHasChaise }); }}
        className={cn(
          'w-full max-w-sm rounded-xl border-2 px-4 py-2.5 flex items-center justify-between transition-all duration-200 touch-manipulation active:scale-[0.99]',
          !hasSofas
            ? 'border-white/[0.06] bg-white/[0.02] opacity-35 cursor-not-allowed'
            : formData.sofaHasChaise
              ? 'border-gold/60 bg-gold/[0.08]'
              : 'border-white/[0.10] bg-white/[0.03] hover:border-white/25'
        )}
      >
        <div className="text-left">
          <p className={cn('text-sm font-semibold', formData.sofaHasChaise && hasSofas ? 'text-white' : 'text-white/50')}>
            Tem Chaise Longue
          </p>
          {!hasSofas && (
            <p className="text-[10px] text-white/25">Selecione pelo menos 1 sofá primeiro</p>
          )}
        </div>
        <span className={cn('text-sm font-bold tabular-nums flex-shrink-0', formData.sofaHasChaise && hasSofas ? 'text-gold' : 'text-white/25')}>
          +{sofaChaisePrice.cleaning}€
        </span>
      </button>

      <p className="text-[9px] text-white/20 text-center tracking-wide uppercase">
        Valores com IVA incluído
      </p>
    </div>
  );
};

export default QuizStep2Sofa;
