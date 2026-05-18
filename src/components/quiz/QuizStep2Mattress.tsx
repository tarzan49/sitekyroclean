import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mattressPrices, QuizFormData } from './QuizTypes';

export interface MattressItem {
  sizeId: string;
  qty: number;
  packEnabled: boolean;
}

interface QuizStep2MattressProps {
  formData: QuizFormData;
  onUpdate: (updates: Partial<QuizFormData>) => void;
  mattressItems: MattressItem[];
  onMattressItemsChange: (items: MattressItem[]) => void;
}

function setQtyHelper(items: MattressItem[], sizeId: string, newQty: number): MattressItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}

function togglePackHelper(items: MattressItem[], sizeId: string): MattressItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}

const QuizStep2Mattress = ({ formData, onUpdate, mattressItems, onMattressItemsChange }: QuizStep2MattressProps) => {
  const hasItems = mattressItems.some(i => i.qty > 0);

  const grandTotal = mattressItems.reduce((sum, item) => {
    const opt = mattressPrices.find(p => p.id === item.sizeId);
    if (!opt || typeof opt.cleaningPrice !== 'number') return sum;
    const unit = item.packEnabled && typeof opt.bothPrice === 'number'
      ? (opt.bothPrice as number)
      : (opt.cleaningPrice as number);
    return sum + item.qty * unit;
  }, 0);

  return (
    <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
      <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">
        Detalhes do(s) Colchão(ões)
      </h2>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        {mattressPrices.map(option => {
          const item = mattressItems.find(i => i.sizeId === option.id);
          const qty = item?.qty ?? 0;
          const packOn = item?.packEnabled ?? false;
          const isActive = qty > 0;
          const cleanPrice = typeof option.cleaningPrice === 'number' ? (option.cleaningPrice as number) : null;
          const bothPrice = typeof option.bothPrice === 'number' ? (option.bothPrice as number) : null;
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
              {/* Main row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-sm font-semibold text-white">{option.label}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isActive && packOn && (
                      <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">VIP</span>
                    )}
                    <span className={cn(
                      'text-sm font-bold tabular-nums',
                      isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40'
                    )}>
                      {displayPrice !== null ? `${displayPrice}€/un.` : 'Sob Orçamento'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onMattressItemsChange(setQtyHelper(mattressItems, option.id, qty - 1))}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >−</button>
                  <span className={cn(
                    'w-6 text-center font-bold tabular-nums text-sm',
                    isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30'
                  )}>{qty}</span>
                  <button
                    onClick={() => onMattressItemsChange(setQtyHelper(mattressItems, option.id, qty + 1))}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >+</button>
                </div>
              </div>

              {/* Per-item pack toggle */}
              {isActive && cleanPrice !== null && bothPrice !== null && (
                <div className="px-4 pb-3">
                  <button
                    onClick={() => onMattressItemsChange(togglePackHelper(mattressItems, option.id))}
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
                        {cleanPrice}€ → {bothPrice}€ · +{bothPrice - cleanPrice}€/un. · Proteção até 10 anos
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

      <p className="text-[9px] text-white/20 text-center tracking-wide uppercase">
        Valores com IVA incluído
      </p>
    </div>
  );
};

export default QuizStep2Mattress;
