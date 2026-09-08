import { ChevronLeft, Star, Bug, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, MattressItem } from '@/components/quiz/QuizTypes';
import { mattressTogglePack, calcPackPricing } from '@/components/quiz/quizHelpers';

interface QuizMattressAddonUpsellProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  mattressItems: MattressItem[];
  setMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;
  onContinue: () => void;
  onBack: () => void;
}

// Upsell "estilo companhia aérea" do colchão — mesma lógica do sofá: um
// cartão único faz de "sim/não" (o colchão não tem tiers Premium/Essencial),
// e só depois de clicar nele aparecem os colchões um a um, cada um com o seu
// próprio stepper 0/qty — nunca assume que a pessoa quer em todos de
// antemão (pedido explícito 2026-09-08).
const QuizMattressAddonUpsell = ({ mattressItems, setMattressItems, onContinue, onBack }: QuizMattressAddonUpsellProps) => {
  const activeItems = mattressItems.filter(i => i.qty > 0);
  const anyOn = activeItems.some(i => i.packEnabled);
  const plural = activeItems.length > 1 || (activeItems[0]?.qty ?? 0) > 1;

  const toggleAll = () => {
    setMattressItems(prev => prev.map(i => i.qty > 0 ? { ...i, packEnabled: !anyOn } : i));
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ANTES DE SEGUIR</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Proteja {plural ? 'os seus colchões' : 'o seu colchão'}</h2>
      <p className="text-xs text-white/40 text-center max-w-xs leading-relaxed">
        O colchão acumula suor, bactérias e milhões de ácaros a cada noite, invisíveis mas presentes na sua respiração enquanto dorme.
      </p>

      <button
        onClick={toggleAll}
        className={cn(
          'relative w-full max-w-xs flex items-center gap-3 pl-5 pr-3.5 py-3 rounded-sm border-2 text-left transition-all duration-200 touch-manipulation mt-1',
          anyOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]' : 'border-dashed border-gold/40 bg-gold/[0.04] hover:border-gold/70 hover:bg-gold/[0.07]'
        )}
      >
        <span className="absolute -top-2 -left-2 z-10 flex w-9 h-9 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
          <Star className="w-3 h-3 fill-[#12121e] text-[#12121e]" />
          <span className="text-[6px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
        </span>
        <Bug className={cn('w-5 h-5 flex-shrink-0', anyOn ? 'text-gold' : 'text-gold/70')} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-bold', anyOn ? 'text-white' : 'text-white/90')}>Desbacterização e Anti Ácaros</p>
          <p className="text-[10px] text-white/35 leading-snug mt-0.5">Elimina bactérias, ácaros e alergénios em profundidade, para dormir tranquilo.</p>
        </div>
        <span className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
          anyOn ? 'border-gold bg-gold' : 'border-gold/50 bg-transparent'
        )}>
          <Plus className={cn('w-3.5 h-3.5 transition-transform', anyOn ? 'text-[#12121e] rotate-45' : 'text-gold')} strokeWidth={3} />
        </span>
      </button>

      {/* Só aparecem depois do "sim" acima — cada colchão com o seu próprio
          stepper 0/qty, nunca passa da quantidade já escolhida. */}
      {anyOn && (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {activeItems.map(item => {
            const option = mattressPrices.find(p => p.id === item.sizeId);
            if (!option) return null;
            const qty = item.qty;
            const packOn = item.packEnabled;
            const pack = calcPackPricing(option, true, false, 30);
            const isSob = pack.isSob;
            const toggleItem = () => setMattressItems(mattressTogglePack(mattressItems, item.sizeId));
            return (
              <div key={item.sizeId} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : 'border-white/10 bg-[#1a2a1a]')}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className={cn('text-sm font-semibold', packOn ? 'text-white' : 'text-white/80')}>{qty > 1 ? `${qty}x ` : ''}{option.label}</span>
                    {typeof option.cleaningPrice === 'number' && (
                      <p className="text-xs text-white/35 mt-0.5">{option.cleaningPrice}€/un.</p>
                    )}
                    {!isSob && (
                      <p className={cn('text-[11px] font-semibold mt-1', packOn ? 'text-gold' : 'text-gold/60')}>
                        Por apenas <span className="font-black">+{pack.packDelta}€</span>
                      </p>
                    )}
                    {isSob && <p className="text-[11px] text-white/40 mt-1">Sob orçamento</p>}
                  </div>
                  {!isSob && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={toggleItem}
                        disabled={!packOn}
                        className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center disabled:opacity-20 disabled:border-transparent disabled:bg-transparent active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                      >−</button>
                      <span className={cn('w-6 text-center font-bold tabular-nums text-base', packOn ? 'text-gold' : 'text-white/30')}>{packOn ? qty : 0}</span>
                      <button
                        onClick={toggleItem}
                        disabled={packOn}
                        className="w-9 h-9 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-lg flex items-center justify-center disabled:opacity-20 disabled:border-transparent disabled:bg-transparent active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                      >+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 w-full max-w-xs mt-1">
        <button
          onClick={onBack}
          className="h-14 px-5 flex-shrink-0 bg-transparent border border-white/[0.14] text-white/50 hover:text-white/80 hover:border-white/30 active:scale-[0.98] touch-manipulation rounded-sm flex items-center justify-center transition-all text-sm font-semibold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </button>
        <button
          onClick={onContinue}
          className="flex-1 h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-sm tracking-wider uppercase touch-manipulation active:scale-[0.98] rounded-sm shadow-[0_0_32px_rgba(212,175,55,0.30)]"
        >
          {anyOn ? 'Adicionar e Continuar' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default QuizMattressAddonUpsell;
