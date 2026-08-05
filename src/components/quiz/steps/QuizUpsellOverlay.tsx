import { ChevronLeft, ChevronRight, Check, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, UpsellItemConfig } from '@/components/quiz/QuizTypes';
import {
  sofaSetQty, sofaTogglePack,
  mattressSetQty,
  calcCarpetPrice, calcChairClean, calcChairWaterproof,
} from '@/components/quiz/quizHelpers';
import { useUpsellSelection } from './useUpsellSelection';

interface QuizUpsellOverlayProps {
  formData: Pick<QuizFormData, 'serviceType'>;
  upsellSubStep: 'prompt' | 'select' | 'config';
  setUpsellSubStep: (v: 'prompt' | 'select' | 'config') => void;
  upsellItems: UpsellItemConfig[];
  setUpsellItems: React.Dispatch<React.SetStateAction<UpsellItemConfig[]>>;
  totalPrice: number;
  packDiscountActive: boolean;
  /** Called when user confirms pack and wants to proceed to contact step. */
  onGoToContact: () => void;
  /** Called when user taps "Voltar" on the prompt sub-step. */
  onBack: () => void;
}

/** Reusable pack progress bar */
const PackProgressBar = ({ totalPrice }: { totalPrice: number }) => {
  const THRESHOLD = 149;
  const pct = Math.min(totalPrice / THRESHOLD * 100, 100);
  const faltam = Math.max(0, Math.ceil(THRESHOLD - totalPrice));
  const reached = totalPrice >= THRESHOLD;
  const glowOpacity = (pct / 100 * 0.75).toFixed(2);
  const glowRadius = Math.round(pct / 10);
  return (
    <div className="w-full max-w-xs mx-auto mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-gold/60 tabular-nums font-semibold">{Math.round(totalPrice)}€ no carrinho</span>
        <span className={cn('text-[10px] font-bold uppercase tracking-wider transition-colors', reached ? 'text-gold' : 'text-white/25')}>149€ → −10%</span>
      </div>
      <div className="h-1 bg-gold/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', reached ? 'bg-gradient-to-r from-gold/50 via-[#f5e27a] to-gold' : 'bg-gradient-to-r from-gold/15 to-gold')}
          style={{
            width: `${Math.max(pct, 2)}%`,
            boxShadow: reached ? '0 0 8px rgba(212,175,55,0.95)' : `0 0 ${glowRadius}px rgba(212,175,55,${glowOpacity})`,
          }}
        />
      </div>
      <p className={cn('text-[10px] text-center mt-2 font-semibold transition-colors', reached ? 'text-gold' : 'text-white/35')}>
        {reached ? 'Desconto de 10% ativado!' : `Faltam ${faltam}€ para 10% de desconto`}
      </p>
    </div>
  );
};

const QuizUpsellOverlay = ({
  formData,
  upsellSubStep,
  setUpsellSubStep,
  upsellItems,
  setUpsellItems,
  totalPrice,
  packDiscountActive,
  onGoToContact,
  onBack,
}: QuizUpsellOverlayProps) => {

  const {
    pendingUpsellId, setPendingUpsellId,
    pendingSofaItems, setPendingSofaItems,
    pendingMattressItems, setPendingMattressItems,
    pendingCarpetArea, setPendingCarpetArea,
    pendingChairQtyNum, setPendingChairQtyNum,
    pendingWaterproof, setPendingWaterproof,
    resetPending,
  } = useUpsellSelection();

  return (
    <div className="flex-1 flex flex-col w-full items-center">

      {/* ── PROMPT: Yes/No ─────────────────────────────────────────────────── */}
      {upsellSubStep === 'prompt' && (
        <div className="flex flex-col w-full items-center text-center py-2">
          <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-2">PACK FAMÍLIA</p>

          {packDiscountActive ? (
            /* ── Desconto já ativo: foco na conveniência da visita ── */
            <>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 leading-[1.2]">
                O técnico já<br />vai até si.
              </h2>
              <p className="text-[13px] text-white/50 max-w-[265px] mx-auto mb-5 leading-relaxed">
                Aproveite a deslocação para limpar mais artigos na mesma visita. O desconto de <span className="text-gold font-bold">10% aplica-se a tudo</span>.
              </p>
              <PackProgressBar totalPrice={totalPrice} />
              <button
                onClick={() => setUpsellSubStep('select')}
                className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-[15px] tracking-wide rounded-sm shadow-[0_4px_36px_rgba(212,175,55,0.45)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mb-3"
              >
                Aproveitar a visita
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            /* ── Desconto ainda não ativo: vender o Pack ── */
            <>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 leading-[1.2]">
                Uma visita. Tudo limpo.
              </h2>
              <p className="text-[13px] text-white/50 max-w-[265px] mx-auto mb-5 leading-relaxed">
                O técnico já vai até si, aproveite para limpar tudo de uma vez. A partir de <span className="text-gold font-bold">149€</span> poupa <span className="text-gold font-bold">10% em todo o pedido</span> automaticamente.
              </p>
              <PackProgressBar totalPrice={totalPrice} />
              <button
                onClick={() => setUpsellSubStep('select')}
                className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-[15px] tracking-wide rounded-sm shadow-[0_4px_36px_rgba(212,175,55,0.45)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mb-3"
              >
                <Check className="w-5 h-5" />
                Sim, quero poupar 10%
              </button>
            </>
          )}

          <div className="w-full max-w-xs flex flex-col items-center gap-2.5">
            <button
              onClick={onGoToContact}
              className="w-full h-12 flex items-center justify-center gap-1.5 text-white font-bold transition-all touch-manipulation border border-white/30 bg-white/[0.08] hover:bg-white/[0.14] rounded-sm active:scale-[0.98] text-sm"
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-white/35 hover:text-white/60 active:text-white/60 transition-colors touch-manipulation py-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Voltar e alterar quantidades
            </button>
          </div>
          <p className="text-xs text-white/20 mt-3">Sem compromisso · Pode remover artigos a qualquer momento</p>
        </div>
      )}

      {/* ── SELECT: Choose item ─────────────────────────────────────────────── */}
      {upsellSubStep === 'select' && (
        <div className="flex flex-col w-full items-center text-center">
          <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1">PACK FAMÍLIA</p>
          <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-1 leading-[1.3]">
            {packDiscountActive ? 'Desconto de 10% ativado!' : 'Que artigo quer adicionar?'}
          </h2>
          <PackProgressBar totalPrice={totalPrice} />

          {upsellItems.length > 0 && (
            <div className="w-full max-w-xs mx-auto mb-3 flex flex-col gap-1.5">
              {upsellItems.map((item, i) => {
                const labels: Record<string, string> = { sofa: 'Sofá', mattress: 'Colchão', carpet: 'Tapete', chairs: 'Cadeiras' };
                const detail = item.sofaSize
                  ? `: ${sofaPrices.find(p => p.id === item.sofaSize)?.label ?? item.sofaSize}`
                  : item.mattressSize
                  ? `: ${mattressPrices.find(p => p.id === item.mattressSize)?.label ?? item.mattressSize}`
                  : item.carpetArea ? `: ${item.carpetArea}m²`
                  : item.chairQty ? `: ${item.chairQty}x`
                  : '';
                const waterproofStr = item.waterproof ? ' + Impermeab.' : '';
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-gold/[0.08] border border-gold/25 rounded-sm text-xs">
                    <span className="text-white/80 font-medium">{labels[item.id] ?? item.id}{detail}{waterproofStr}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gold font-bold">{item.price > 0 ? `${item.price}€` : 'Sob orç.'}</span>
                      <button
                        onClick={() => setUpsellItems(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-white/20 hover:text-red-400 transition-colors text-[11px] touch-manipulation"
                      ><X className="w-3 h-3" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 w-full max-w-xs mx-auto mb-4">
            {([
              { id: 'sofa',     img: '/images/services/sofa.webp',    label: 'Sofá',     sublabel: 'a partir de 49€' },
              { id: 'mattress', img: '/images/services/colchao.webp', label: 'Colchão',  sublabel: 'a partir de 59€' },
              { id: 'carpet',   img: '/images/services/tapete.webp',  label: 'Tapete',   sublabel: 'a partir de 12€/m²' },
              { id: 'chairs',   img: '/images/services/cadeira.webp', label: 'Cadeiras', sublabel: 'a partir de 20€' },
            ] as const).map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setPendingUpsellId(opt.id);
                  resetPending();
                  setPendingUpsellId(opt.id);
                  setUpsellSubStep('config');
                }}
                className="relative overflow-hidden rounded-sm border border-white/[0.12] aspect-square shadow-lg hover:border-gold/50 hover:shadow-[0_0_14px_rgba(212,175,55,0.25)] active:scale-[0.97] transition-all duration-200 touch-manipulation"
              >
                <picture>
                  <source srcSet={opt.img} type="image/webp" />
                  <img src={opt.img.replace('.webp', '.png')} alt={opt.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2 z-10 text-center">
                  <p className="text-[11px] font-bold text-white leading-tight">{opt.label}</p>
                  <p className="text-[11px] text-gold/80 leading-none mt-0.5">{opt.sublabel}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-white/25 text-center mb-3">Desconto não acumulável com outras promoções</p>
          <div className="w-full max-w-xs mx-auto flex items-center gap-3">
            <button
              onClick={() => setUpsellSubStep('prompt')}
              className="h-12 px-5 flex-shrink-0 flex items-center gap-1.5 rounded-sm border border-white/[0.15] bg-transparent text-white/55 hover:text-white/85 hover:border-white/30 touch-manipulation active:scale-[0.98] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <button
              onClick={onGoToContact}
              className="flex-1 h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-sm shadow-[0_4px_28px_rgba(212,175,55,0.40)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {upsellItems.length > 0 ? 'Continuar com Pack' : 'Continuar'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── CONFIG: Detail chosen item ──────────────────────────────────────── */}
      {upsellSubStep === 'config' && pendingUpsellId && (
        <div className="flex flex-col w-full items-center text-center">
          <button
            onClick={() => setUpsellSubStep('select')}
            className="self-start flex items-center gap-1 text-xs text-white/35 hover:text-white/65 transition-colors mb-4 touch-manipulation"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Voltar
          </button>

          {/* Sofa config */}
          {pendingUpsellId === 'sofa' && (
            <div className="w-full max-w-xs mx-auto">
              <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">ARTIGO EXTRA</p>
              <h3 className="font-playfair text-xl font-bold text-white mb-3 text-center">Detalhes do(s) Sofá(s)</h3>
              <div className="flex flex-col gap-2 mb-3">
                {sofaPrices.map(opt => {
                  const item = pendingSofaItems.find(i => i.sizeId === opt.id);
                  const qty = item?.qty ?? 0;
                  const packOn = item?.packEnabled ?? false;
                  const isActive = qty > 0;
                  const isSob = typeof opt.cleaningPrice !== 'number';
                  const isWaterproofBase = formData.serviceType === 'waterproofing';
                  const cleanP = isSob ? null : (opt.cleaningPrice as number);
                  const waterP = typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : null;
                  const baseP = isWaterproofBase ? waterP : cleanP;
                  const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : (baseP !== null ? baseP + 40 : null);
                  const origP = typeof opt.originalBothPrice === 'number' ? (opt.originalBothPrice as number) : null;
                  const packDelta = baseP !== null && bothP !== null ? bothP - baseP : 40;
                  const dp = packOn && bothP !== null ? bothP : baseP;
                  const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Proteção Total VIP';
                  const upsellSub = isWaterproofBase ? `+${packDelta}€/un. · Limpeza profunda incluída` : `+${packDelta}€/un. · Impermeabilização completa`;
                  return (
                    <div key={opt.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-gold/20 bg-[#1a2a1a]')}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <span className="text-sm font-semibold text-white">{opt.label}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">PACK</span>}
                            {isActive && packOn && origP !== null && (
                              <span className="text-sm text-white/30 line-through tabular-nums">{origP}€</span>
                            )}
                            <span className={cn('text-sm font-bold tabular-nums', isSob ? isActive ? 'text-white/70' : 'text-white/35' : isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/40')}>
                              {isSob ? 'Sob Orçamento' : dp !== null ? `${dp}€/un.${qty > 1 ? ` × ${qty} = ${dp * qty}€` : ''}` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setPendingSofaItems(sofaSetQty(pendingSofaItems, opt.id, qty - 1))} disabled={qty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                          <span className={cn('w-6 text-center font-bold tabular-nums text-sm', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                          <button onClick={() => setPendingSofaItems(sofaSetQty(pendingSofaItems, opt.id, qty + 1))} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                        </div>
                      </div>
                      {isActive && (
                        <div className="px-4 pb-3">
                          <button onClick={() => setPendingSofaItems(sofaTogglePack(pendingSofaItems, opt.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-gold/15 bg-[#1a2a1a] hover:border-gold/40')}>
                            <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                            <div className="flex-1 text-left">
                              <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>{upsellLabel}</p>
                              <p className={cn('text-[11px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>{isSob ? 'Preço sob orçamento · Incluído na proposta' : upsellSub}</p>
                            </div>
                            <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                              <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                disabled={!pendingSofaItems.some(i => i.qty > 0)}
                onClick={() => {
                  const isWaterproofBase = formData.serviceType === 'waterproofing';
                  pendingSofaItems.filter(i => i.qty > 0).forEach(item => {
                    const opt = sofaPrices.find(p => p.id === item.sizeId)!;
                    const isSobItem = typeof opt.cleaningPrice !== 'number';
                    const cleanP = isSobItem ? null : (opt.cleaningPrice as number);
                    const waterP = typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : null;
                    const baseP = isWaterproofBase ? waterP : cleanP;
                    const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : (baseP !== null ? baseP + 40 : null);
                    const unitPrice = item.packEnabled && bothP !== null ? bothP : baseP;
                    const total = unitPrice !== null ? unitPrice * item.qty : 0;
                    const packExtra = item.packEnabled && bothP !== null && baseP !== null ? (bothP - baseP) * item.qty : 0;
                    setUpsellItems(prev => [...prev, {
                      id: 'sofa',
                      sofaSize: item.sizeId,
                      qty: item.qty,
                      price: total,
                      label: `${item.qty}× Sofá ${opt.label}${item.packEnabled ? ' + Pack' : ''}`,
                      waterproof: item.packEnabled,
                      waterproofPrice: packExtra,
                    }]);
                  });
                  setUpsellSubStep('select');
                }}
                className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-sm disabled:opacity-35 touch-manipulation active:scale-[0.98] transition-all"
              >
                {(() => {
                  const total = pendingSofaItems.reduce((s, i) => s + i.qty, 0);
                  return total > 0 ? `Adicionar Sofá${total > 1 ? ` (${total})` : ''}` : 'Selecione um tamanho';
                })()}
              </button>
            </div>
          )}

          {/* Mattress config */}
          {pendingUpsellId === 'mattress' && (
            <div className="w-full max-w-xs mx-auto">
              <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1 text-center w-full">ARTIGO EXTRA</p>
              <h3 className="font-playfair text-xl font-bold text-white mb-1 text-center">Colchão</h3>
              <p className="text-xs text-white/35 mb-3 text-center">Selecione tamanho e quantidade</p>
              <div className="flex flex-col gap-2 mb-4">
                {mattressPrices.map(opt => {
                  const item = pendingMattressItems.find(i => i.sizeId === opt.id);
                  const qty = item?.qty ?? 0;
                  const isActive = qty > 0;
                  const cleanP = typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null;
                  const dp = cleanP;
                  return (
                    <div key={opt.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive ? 'border-gold/50 bg-[#1a2a1a]' : 'border-gold/20 bg-[#1a2a1a]')}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <span className="text-sm font-semibold text-white">{opt.label}</span>
                          <div className="mt-0.5">
                            <span className={cn('text-sm font-bold tabular-nums', isActive ? 'text-white/80' : 'text-white/40')}>
                              {dp !== null ? `${dp}€/un.${qty > 1 ? ` × ${qty} = ${dp * qty}€` : ''}` : 'Sob orç.'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setPendingMattressItems(mattressSetQty(pendingMattressItems, opt.id, qty - 1))} disabled={qty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                          <span className={cn('w-6 text-center font-bold tabular-nums text-sm', isActive ? 'text-white/80' : 'text-white/30')}>{qty}</span>
                          <button onClick={() => setPendingMattressItems(mattressSetQty(pendingMattressItems, opt.id, qty + 1))} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                disabled={!pendingMattressItems.some(i => i.qty > 0)}
                onClick={() => {
                  pendingMattressItems.filter(i => i.qty > 0).forEach(item => {
                    const opt = mattressPrices.find(p => p.id === item.sizeId)!;
                    const cleanP = typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : 0;
                    const total = cleanP * item.qty;
                    setUpsellItems(prev => [...prev, {
                      id: 'mattress',
                      mattressSize: item.sizeId,
                      qty: item.qty,
                      price: total,
                      label: `${item.qty}× Colchão ${opt.label}`,
                    }]);
                  });
                  setUpsellSubStep('select');
                }}
                className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-sm disabled:opacity-35 touch-manipulation active:scale-[0.98] transition-all"
              >
                {(() => {
                  const total = pendingMattressItems.reduce((s, i) => s + i.qty, 0);
                  return total > 0 ? `Adicionar Colchão${total > 1 ? ` (${total})` : ''}` : 'Selecione um tamanho';
                })()}
              </button>
            </div>
          )}

          {/* Carpet config */}
          {pendingUpsellId === 'carpet' && (() => {
            const uArea = parseFloat(pendingCarpetArea);
            const uValid = !isNaN(uArea) && uArea > 0;
            const uSob = uValid && uArea > 15;
            const uPrice = uValid && !uSob ? calcCarpetPrice(uArea) : null;
            return (
              <div className="w-full max-w-xs mx-auto">
                <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1 text-center w-full">ARTIGO EXTRA</p>
                <h3 className="font-playfair text-xl font-bold text-white mb-3 text-center">Tapete</h3>
                <div className={cn(
                  'w-full rounded-sm border px-5 py-4 text-center transition-all duration-300 mb-4',
                  uSob ? 'bg-[#1a2a1a] border-white/20'
                    : uValid ? 'bg-[#1a2a1a] border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.10)]'
                    : 'bg-[#1a2a1a] border-gold/15'
                )}>
                  <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Estimativa total</p>
                  {uValid ? (
                    <>
                      <p className={cn('font-playfair font-black leading-none mb-1', uSob ? 'text-white/50 text-2xl' : 'text-gold text-4xl')}>
                        {uSob ? 'Sob Orçamento' : `${uPrice !== null ? Math.round(uPrice) : '0'}€`}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {uSob ? 'O nosso especialista entra em contacto' : `${uArea} m²`}
                      </p>
                    </>
                  ) : (
                    <p className="text-white/25 text-sm font-medium py-1">Insira a área para ver o preço</p>
                  )}
                </div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider text-center mb-1.5">Área do tapete</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  step="0.5"
                  placeholder="Ex: 4"
                  value={pendingCarpetArea}
                  onChange={e => setPendingCarpetArea(e.target.value)}
                  className="w-full h-12 px-4 text-lg font-bold text-center bg-[#1a2a1a] border border-gold/25 focus:border-gold focus:outline-none rounded-sm transition-colors text-white placeholder:text-white/25 mb-1"
                />
                <p className="text-xs text-white/30 text-center mb-4">≤5m²: 12€/m² · ≤10m²: 10€/m² · ≤15m²: 9€/m² · +15m²: sob orçamento</p>
                <button
                  disabled={!pendingCarpetArea || isNaN(parseFloat(pendingCarpetArea)) || parseFloat(pendingCarpetArea) <= 0}
                  onClick={() => {
                    const area = parseFloat(pendingCarpetArea);
                    const base = area > 15 ? 0 : calcCarpetPrice(area) ?? 0;
                    setUpsellItems(prev => [...prev, { id: 'carpet', carpetArea: pendingCarpetArea, price: Math.round(base * 100) / 100, label: `Tapete ${pendingCarpetArea}m²` }]);
                    setUpsellSubStep('select');
                  }}
                  className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-sm disabled:opacity-35 touch-manipulation active:scale-[0.98] transition-all"
                >
                  Adicionar Tapete
                </button>
              </div>
            );
          })()}

          {/* Chairs config */}
          {pendingUpsellId === 'chairs' && (() => {
            const qty = pendingChairQtyNum;
            const sobOrç = qty > 10;
            const basePrice = calcChairClean(qty) ?? 0;
            const waterproofPrice = pendingWaterproof && !sobOrç ? (calcChairWaterproof(qty) ?? 0) : 0;
            const totalChairPrice = basePrice + waterproofPrice;
            return (
              <div className="w-full max-w-xs mx-auto">
                <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1 text-center w-full">ARTIGO EXTRA</p>
                <h3 className="font-playfair text-xl font-bold text-white text-center mb-1">Cadeiras</h3>
                <div className={cn(
                  'w-full rounded-sm border px-5 py-4 text-center mb-5 transition-all duration-300',
                  sobOrç ? 'bg-[#1a2a1a] border-white/20' : 'bg-[#1a2a1a] border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.10)]'
                )}>
                  <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Estimativa total</p>
                  <p
                    className={cn('font-playfair font-black leading-none mb-1', sobOrç ? 'text-white/60 text-2xl' : 'text-gold text-4xl')}
                    style={!sobOrç ? { textShadow: '0 0 28px rgba(212,175,55,0.55)' } : undefined}
                  >
                    {sobOrç ? 'Sob Orçamento' : `${totalChairPrice % 1 === 0 ? totalChairPrice : totalChairPrice.toFixed(1).replace('.', ',')}€`}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {sobOrç ? 'O nosso especialista entra em contacto' : `${qty} cadeira${qty > 1 ? 's' : ''}${pendingWaterproof ? ' + impermeabilização' : ''}`}
                  </p>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider text-center mb-2">Quantidade</p>
                <div className="flex items-center justify-center gap-6 mb-5">
                  <button
                    onClick={() => setPendingChairQtyNum(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >−</button>
                  <span className="text-4xl font-black text-gold w-10 text-center tabular-nums leading-none">{qty}</span>
                  <button
                    onClick={() => setPendingChairQtyNum(q => q + 1)}
                    className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                  >+</button>
                </div>
                {!sobOrç && (
                  <button
                    onClick={() => setPendingWaterproof(w => !w)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-sm border-2 transition-all touch-manipulation mb-4',
                      pendingWaterproof ? 'border-gold bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40'
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all', pendingWaterproof ? 'border-gold bg-gold' : 'border-white/30')}>
                      {pendingWaterproof && <Check className="w-3 h-3 text-[#12121e]" />}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-bold text-white">Adicionar Impermeabilização</p>
                      <p className="text-xs text-white/40">Proteção duradoura contra manchas</p>
                    </div>
                    <span className="text-gold font-bold text-sm flex-shrink-0">+{(calcChairWaterproof(qty) ?? 0) % 1 === 0 ? (calcChairWaterproof(qty) ?? 0) : (calcChairWaterproof(qty) ?? 0).toFixed(1).replace('.', ',')}€</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setUpsellItems(prev => [...prev, {
                      id: 'chairs',
                      chairQty: String(qty),
                      qty,
                      price: sobOrç ? 0 : totalChairPrice,
                      label: `${qty} Cadeira${qty > 1 ? 's' : ''}`,
                      waterproof: pendingWaterproof && !sobOrç,
                      waterproofPrice: pendingWaterproof && !sobOrç ? waterproofPrice : 0,
                    }]);
                    setUpsellSubStep('select');
                  }}
                  className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-bold rounded-sm touch-manipulation active:scale-[0.98] transition-all"
                >
                  {sobOrç ? `Adicionar ${qty} Cadeiras (sob orçamento)` : `Adicionar ${qty} Cadeira${qty > 1 ? 's' : ''}`}
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default QuizUpsellOverlay;
