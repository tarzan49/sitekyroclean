import { ChevronLeft, ChevronRight, Check, X, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, UpsellItemConfig, SofaItem, MattressItem } from '@/components/quiz/QuizTypes';
import {
  sofaSetQty, sofaTogglePack,
  mattressSetQty, mattressTogglePack,
  calcCarpetPrice, calcChairClean, calcChairWaterproof, calcChairWaterproofPremium,
  calcPackPricing,
} from '@/components/quiz/quizHelpers';
import { WHATSAPP_BASE } from '@/constants/business';

interface QuizUpsellOverlayProps {
  formData: Pick<QuizFormData, 'serviceType' | 'waterproofingTier'>;
  updateFormData: (u: Partial<QuizFormData>) => void;
  upsellSubStep: 'prompt' | 'select' | 'config';
  setUpsellSubStep: (v: 'prompt' | 'select' | 'config') => void;
  upsellItems: UpsellItemConfig[];
  setUpsellItems: React.Dispatch<React.SetStateAction<UpsellItemConfig[]>>;
  totalPrice: number;
  packDiscountActive: boolean;
  /** true quando o total do pedido mostrado no ecrã (totalPrice, com deslocação
   *  incluída) já passa os 100€ — o mesmo número que a "Estimativa" no topo mostra. */
  serviceQualifiesForDiscount: boolean;
  /** Called when user confirms pack and wants to proceed to contact step. */
  onGoToContact: () => void;
  /** Called when user taps "Voltar" on the prompt sub-step. */
  onBack: () => void;
  // Estado do "artigo pendente" a ser configurado — vive em QuizForm.tsx (não aqui)
  // para que o preço no topo do quiz possa somar este valor em tempo real, ver
  // computePendingUpsellTotal em quizHelpers.ts.
  pendingUpsellId: string | null;
  setPendingUpsellId: (id: string | null) => void;
  pendingSofaItems: SofaItem[];
  setPendingSofaItems: React.Dispatch<React.SetStateAction<SofaItem[]>>;
  pendingMattressItems: MattressItem[];
  setPendingMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;
  pendingCarpetArea: string;
  setPendingCarpetArea: (v: string) => void;
  pendingChairQtyNum: number;
  setPendingChairQtyNum: React.Dispatch<React.SetStateAction<number>>;
  pendingWaterproof: boolean;
  setPendingWaterproof: React.Dispatch<React.SetStateAction<boolean>>;
  resetPending: () => void;
}


const QuizUpsellOverlay = ({
  formData,
  updateFormData,
  upsellSubStep,
  setUpsellSubStep,
  upsellItems,
  setUpsellItems,
  totalPrice,
  packDiscountActive,
  serviceQualifiesForDiscount,
  onGoToContact,
  onBack,
  pendingUpsellId, setPendingUpsellId,
  pendingSofaItems, setPendingSofaItems,
  pendingMattressItems, setPendingMattressItems,
  pendingCarpetArea, setPendingCarpetArea,
  pendingChairQtyNum, setPendingChairQtyNum,
  pendingWaterproof, setPendingWaterproof,
  resetPending,
}: QuizUpsellOverlayProps) => {

  return (
    <div className="flex-1 flex flex-col w-full items-center">

      {/* ── PROMPT: Yes/No ─────────────────────────────────────────────────── */}
      {upsellSubStep === 'prompt' && (
        <div className="flex flex-col w-full items-center text-center py-2">
          <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-2">PACK FAMÍLIA</p>

          {packDiscountActive ? (
            /* ── Desconto já ativo: foco na conveniência da visita ── */
            <>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold mb-3 leading-[1.2] whitespace-nowrap">
                <span className="text-gold" style={{ textShadow: '0 0 18px rgba(212,175,55,0.55)' }}>10% Ativo.</span>{' '}
                <span className="text-white">Aproveite Tudo.</span>
              </h2>
              <p className="text-[13px] text-white/50 max-w-[265px] mx-auto mb-6 leading-relaxed">
                Aproveite a deslocação para limpar mais artigos na mesma visita, sem custo extra de trajeto.
              </p>
              <button
                onClick={() => setUpsellSubStep('select')}
                className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-[15px] tracking-wide rounded-sm shadow-[0_4px_36px_rgba(212,175,55,0.45)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mb-3"
              >
                Aproveitar a visita
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : serviceQualifiesForDiscount ? (
            /* ── Desconto ainda não ativo, mas o pedido já qualifica: vender o Pack ──
               Um só bloco de texto (sem PackDiscountHint a repetir a mesma regra por
               baixo) e um framing de "está quase a ganhar", não de regulamento. */
            <>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold mb-3 leading-[1.2] whitespace-nowrap">
                <span className="text-white">A Um Passo dos</span>{' '}
                <span className="text-gold" style={{ textShadow: '0 0 18px rgba(212,175,55,0.55)' }}>10%.</span>
              </h2>
              <p className="text-[13px] text-white/50 max-w-[265px] mx-auto mb-6 leading-relaxed">
                Junte outro item de <span className="text-white/80 font-semibold">60€+</span> (colchão, tapete, cadeiras) e o desconto aplica-se ao pedido todo.
              </p>
              <button
                onClick={() => setUpsellSubStep('select')}
                className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-[15px] tracking-wide rounded-sm shadow-[0_4px_36px_rgba(212,175,55,0.45)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mb-3"
              >
                <Check className="w-5 h-5" />
                Sim, quero poupar 10%
              </button>
            </>
          ) : (
            /* ── Pedido ainda não qualifica para o desconto: vender a conveniência,
               com a regra do desconto mencionada uma só vez, sem bloco repetido ── */
            <>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 leading-[1.2]">
                Uma visita. Tudo limpo.
              </h2>
              <p className="text-[13px] text-white/50 max-w-[240px] mx-auto mb-6 leading-relaxed">
                Pedidos de <span className="text-white/80 font-semibold">100€+</span> com um item extra de <span className="text-white/80 font-semibold">60€+</span> ganham <span className="text-gold font-bold">10% de desconto em tudo</span>.
              </p>
              <button
                onClick={() => setUpsellSubStep('select')}
                className="w-full max-w-xs h-14 bg-gradient-to-r from-gold to-[#d4c57b] hover:from-[#d4c57b] hover:to-gold text-[#12121e] font-black text-[15px] tracking-wide rounded-sm shadow-[0_4px_36px_rgba(212,175,55,0.45)] touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mb-3"
              >
                Adicionar mais um artigo
                <ChevronRight className="w-5 h-5" />
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
          <h2 className={cn(
            "font-playfair text-2xl sm:text-3xl font-bold text-white leading-[1.3] whitespace-nowrap",
            serviceQualifiesForDiscount && !packDiscountActive ? "mb-3" : "mb-6"
          )}>
            {packDiscountActive
              ? 'Desconto de 10% ativado!'
              : serviceQualifiesForDiscount
              ? <><span className="text-white">A Um Passo dos</span> <span className="text-gold" style={{ textShadow: '0 0 18px rgba(212,175,55,0.55)' }}>10%.</span></>
              : 'Escolha o Próximo Item.'}
          </h2>
          {packDiscountActive && (
            <p className="text-[13px] text-gold/60 mb-6 -mt-2">Aplica-se a todo o pedido</p>
          )}
          {serviceQualifiesForDiscount && !packDiscountActive && (
            <p className="text-[13px] text-white/50 max-w-[265px] mx-auto mb-6 leading-relaxed">
              Junte outro item de <span className="text-white/80 font-semibold">60€+</span> (colchão, tapete, cadeiras) e o desconto aplica-se ao pedido todo.
            </p>
          )}

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

          <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] mx-auto mb-4">
            {([
              { id: 'sofa',     img: '/images/services/sofa.webp',    label: 'Sofá',     sublabel: 'a partir de 49€' },
              { id: 'mattress', img: '/images/services/colchao.webp', label: 'Colchão',  sublabel: 'a partir de 59€' },
              { id: 'carpet',   img: '/images/services/tapete.webp',  label: 'Tapete',   sublabel: 'a partir de 15€/m²' },
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

          {(packDiscountActive || serviceQualifiesForDiscount) && (
            <p className="text-xs text-white/25 text-center mb-3">Desconto não acumulável com outras promoções</p>
          )}
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
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 text-center">Detalhes do(s) Sofá(s)</h3>
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
                  const essencialSofa = calcPackPricing(opt, true, false, 40, 'essencial');
                  const premiumSofa = calcPackPricing(opt, true, false, 40, 'premium');
                  const premiumExtraDelta = premiumSofa.packDelta !== null && essencialSofa.packDelta !== null
                    ? Math.round((premiumSofa.packDelta - essencialSofa.packDelta) * 100) / 100 : null;
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
                      {isActive && isWaterproofBase && (
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
                          {!isSob && (
                            <p className="text-[10px] text-white/25 leading-snug mt-1.5 px-1">
                              Remove manchas, odores e ácaros em profundidade.
                            </p>
                          )}
                        </div>
                      )}
                      {isActive && !isWaterproofBase && !isSob && (
                        <div className="px-4 pb-3">
                          <div className="grid grid-cols-2 gap-2 pt-3">
                            <button
                              onClick={() => {
                                const turningOn = !(packOn && formData.waterproofingTier === 'essencial');
                                setPendingSofaItems(turningOn && packOn ? pendingSofaItems : sofaTogglePack(pendingSofaItems, opt.id));
                                updateFormData({ waterproofingTier: 'essencial' });
                              }}
                              className={cn(
                                'rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
                                packOn && formData.waterproofingTier === 'essencial'
                                  ? 'border-gold bg-gold/[0.08] shadow-[0_0_10px_rgba(212,175,55,0.18)]'
                                  : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40'
                              )}
                            >
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {packOn && formData.waterproofingTier === 'essencial' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
                                <p className={cn('text-xs font-bold', packOn && formData.waterproofingTier === 'essencial' ? 'text-white' : 'text-white/60')}>Essencial</p>
                              </div>
                              <p className="text-[10px] text-white/35 leading-snug">+{essencialSofa.packDelta}€ · 1-2 anos</p>
                            </button>
                            <button
                              onClick={() => {
                                const turningOn = !(packOn && formData.waterproofingTier === 'premium');
                                setPendingSofaItems(turningOn && packOn ? pendingSofaItems : sofaTogglePack(pendingSofaItems, opt.id));
                                updateFormData({ waterproofingTier: 'premium' });
                              }}
                              className={cn(
                                'relative rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
                                packOn && formData.waterproofingTier === 'premium'
                                  ? 'border-gold bg-gold/[0.10] shadow-[0_0_16px_rgba(212,175,55,0.30)]'
                                  : 'border-gold/50 bg-[#1a2a1a] ring-1 ring-gold/20 hover:border-gold/75'
                              )}
                            >
                              <span className="absolute -top-2 -right-2 z-10 flex w-9 h-9 flex-col items-center justify-center rounded-sm border-2 border-[#12121e] bg-gold shadow-md">
                                <Star className="w-3 h-3 fill-[#12121e] text-[#12121e]" />
                                <span className="text-[6px] font-black uppercase leading-none tracking-tight text-[#12121e]">Top</span>
                              </span>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {packOn && formData.waterproofingTier === 'premium' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
                                <p className={cn('text-xs font-bold', packOn && formData.waterproofingTier === 'premium' ? 'text-white' : 'text-white/85')}>Premium</p>
                                {premiumExtraDelta !== null && (
                                  <span className={cn('text-[9px] font-black leading-none px-1.5 py-[3px] rounded-full whitespace-nowrap flex-shrink-0', packOn && formData.waterproofingTier === 'premium' ? 'bg-gold text-[#12121e]' : 'bg-gold/20 text-gold')}>
                                    por apenas +{premiumExtraDelta}€
                                  </span>
                                )}
                              </div>
                              <p className={cn('text-[10px] leading-snug', packOn && formData.waterproofingTier === 'premium' ? 'text-gold/60' : 'text-gold/45')}>até 10 anos, 5 lavagens</p>
                            </button>
                          </div>
                          <p className="text-[10px] text-white/25 leading-snug mt-1.5 px-1">
                            Protege o tecido contra manchas e nódoas, prolongando a vida do estofo.
                          </p>
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
                    const { basePrice: baseP, packDelta } = calcPackPricing(opt, item.packEnabled, isWaterproofBase, 40, formData.waterproofingTier);
                    const bothP = baseP !== null && packDelta !== null ? baseP + packDelta : null;
                    const unitPrice = item.packEnabled && bothP !== null ? bothP : baseP;
                    const total = unitPrice !== null ? unitPrice * item.qty : 0;
                    const packExtra = item.packEnabled && packDelta !== null ? packDelta * item.qty : 0;
                    const tierTag = item.packEnabled && !isWaterproofBase ? (formData.waterproofingTier === 'premium' ? ' + Premium' : ' + Essencial') : '';
                    setUpsellItems(prev => [...prev, {
                      id: 'sofa',
                      sofaSize: item.sizeId,
                      qty: item.qty,
                      price: total,
                      label: `${item.qty}× Sofá ${opt.label}${item.packEnabled ? ` + Pack${tierTag}` : ''}`,
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
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-1 text-center">Colchão</h3>
              <p className="text-xs text-white/35 mb-3 text-center">Selecione tamanho e quantidade</p>
              <div className="flex flex-col gap-2 mb-4">
                {mattressPrices.map(opt => {
                  const item = pendingMattressItems.find(i => i.sizeId === opt.id);
                  const qty = item?.qty ?? 0;
                  const packOn = item?.packEnabled ?? false;
                  const isActive = qty > 0;
                  const isWaterproofBase = formData.serviceType === 'waterproofing';
                  const { isSob, packDelta, displayPrice: dp } = calcPackPricing(opt, packOn, isWaterproofBase, 30);
                  const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Anti Ácaros';
                  const upsellSub = isWaterproofBase ? `+${packDelta}€/un. · Limpeza profunda incluída` : `+${packDelta}€/un. · Tratamento anti-ácaros`;
                  return (
                    <div key={opt.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-gold/20 bg-[#1a2a1a]')}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <span className="text-sm font-semibold text-white">{opt.label}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">PACK</span>}
                            {isActive && packOn && typeof opt.originalBothPrice === 'number' && (
                              <span className="text-sm text-white/30 line-through tabular-nums">{opt.originalBothPrice}€</span>
                            )}
                            <span className={cn('text-sm font-bold tabular-nums', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/40')}>
                              {isSob ? 'Sob orç.' : `${dp}€/un.${qty > 1 ? ` × ${qty} = ${(dp ?? 0) * qty}€` : ''}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setPendingMattressItems(mattressSetQty(pendingMattressItems, opt.id, qty - 1))} disabled={qty === 0} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                          <span className={cn('w-6 text-center font-bold tabular-nums text-sm', isActive ? 'text-white/80' : 'text-white/30')}>{qty}</span>
                          <button onClick={() => setPendingMattressItems(mattressSetQty(pendingMattressItems, opt.id, qty + 1))} className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                        </div>
                      </div>
                      {isActive && !isSob && (
                        <div className="px-4 pb-3">
                          <button onClick={() => setPendingMattressItems(mattressTogglePack(pendingMattressItems, opt.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-gold/15 bg-[#1a2a1a] hover:border-gold/40')}>
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
                            Elimina os ácaros e impede que voltem, prevenindo alergias e problemas respiratórios.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                disabled={!pendingMattressItems.some(i => i.qty > 0)}
                onClick={() => {
                  const isWaterproofBase = formData.serviceType === 'waterproofing';
                  pendingMattressItems.filter(i => i.qty > 0).forEach(item => {
                    const opt = mattressPrices.find(p => p.id === item.sizeId)!;
                    const cleanP = typeof opt.cleaningPrice === 'number' ? (opt.cleaningPrice as number) : null;
                    const waterP = typeof opt.waterproofingPrice === 'number' ? (opt.waterproofingPrice as number) : null;
                    const baseP = isWaterproofBase ? waterP : cleanP;
                    const bothP = typeof opt.bothPrice === 'number' ? (opt.bothPrice as number) : (baseP !== null ? baseP + 30 : null);
                    const unitPrice = item.packEnabled && bothP !== null ? bothP : baseP;
                    const total = unitPrice !== null ? unitPrice * item.qty : 0;
                    const packExtra = item.packEnabled && bothP !== null && baseP !== null ? (bothP - baseP) * item.qty : 0;
                    setUpsellItems(prev => [...prev, {
                      id: 'mattress',
                      mattressSize: item.sizeId,
                      qty: item.qty,
                      price: total,
                      label: `${item.qty}× Colchão ${opt.label}${item.packEnabled ? ' + Anti Ácaros' : ''}`,
                      waterproof: item.packEnabled,
                      waterproofPrice: packExtra,
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
                <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-3 text-center">Tapete</h3>
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
                <p className="text-xs text-white/30 text-center mb-4">Preço por m² desce com a área: até 3m² 15€, até 5m² 12,5€, até 8m² 11,5€, até 10m² 10,5€, até 15m² 10€. Acima de 15m², sob orçamento.</p>
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
            const basePriceRaw = calcChairClean(qty);
            const isPremiumTier = formData.waterproofingTier === 'premium';
            const waterproofEssencialPriceRaw = calcChairWaterproof(qty);
            const waterproofPremiumPriceRaw = calcChairWaterproofPremium(qty);
            const activeWaterproofRaw = isPremiumTier ? waterproofPremiumPriceRaw : waterproofEssencialPriceRaw;
            // "Sob orçamento" tem de propagar-se assim que o preço base OU o
            // addon ligado não tem valor fixo — nunca cair para 0/ignorar o
            // addon em silêncio (mesmo bug do QuizStepConfig.tsx: a partir de
            // 10 cadeiras a impermeabilização é sob orçamento, mas a limpeza
            // sozinha ainda tem preço fixo até 10).
            const sobOrç = basePriceRaw === null || (pendingWaterproof && activeWaterproofRaw === null);
            const basePrice = basePriceRaw ?? 0;
            const waterproofEssencialPrice = waterproofEssencialPriceRaw ?? 0;
            const waterproofPremiumPrice = waterproofPremiumPriceRaw ?? 0;
            const waterproofPrice = pendingWaterproof && !sobOrç ? (isPremiumTier ? waterproofPremiumPrice : waterproofEssencialPrice) : 0;
            const totalChairPrice = basePrice + waterproofPrice;
            const chairWhatsappMsg = encodeURIComponent('Olá, tenho cadeiras de um tipo diferente (sem tampo, costas ou braços) e gostava de um orçamento personalizado.');
            return (
              <div className="w-full max-w-xs mx-auto">
                <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1 text-center w-full">ARTIGO EXTRA</p>
                <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center mb-1">Cadeiras</h3>
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
                  <div className="flex flex-col gap-1.5 w-full mt-3 mb-1">
                    <button
                      onClick={() => {
                        const turningOff = pendingWaterproof && formData.waterproofingTier === 'premium';
                        setPendingWaterproof(!turningOff);
                        updateFormData({ waterproofingTier: 'premium' });
                      }}
                      className={cn('relative w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border-2 transition-all duration-200 touch-manipulation', pendingWaterproof && formData.waterproofingTier === 'premium' ? 'border-gold bg-gold/[0.10] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/30 bg-[#1a2a1a] hover:border-gold/55')}
                    >
                      <span className="absolute -top-2 left-3 bg-gold text-[#12121e] text-[8px] font-black px-2 py-0.5 rounded-[3px] tracking-wide uppercase whitespace-nowrap shadow-sm border border-[#12121e]">
                        Melhor Proteção
                      </span>
                      <Shield className={cn('w-4 h-4 flex-shrink-0', pendingWaterproof && formData.waterproofingTier === 'premium' ? 'text-gold' : 'text-gold/50')} />
                      <div className="flex-1 text-left min-w-0">
                        <p className={cn('text-[11px] font-bold leading-none', pendingWaterproof && formData.waterproofingTier === 'premium' ? 'text-white' : 'text-white/60')}>Premium</p>
                        <p className="text-[11px] mt-0.5 leading-none whitespace-nowrap">
                          {waterproofPremiumPriceRaw !== null ? (
                            <>
                              <span className="text-white/30 line-through">{waterproofPremiumPriceRaw + 5}€</span>{' '}
                              <span className={cn('font-semibold', pendingWaterproof && formData.waterproofingTier === 'premium' ? 'text-gold' : 'text-gold/70')}>{waterproofPremiumPriceRaw}€</span>{' '}
                              <span className={pendingWaterproof && formData.waterproofingTier === 'premium' ? 'text-gold/70' : 'text-gold/45'}>· até 10 anos, 5 lavagens</span>
                            </>
                          ) : (
                            <span className={pendingWaterproof && formData.waterproofingTier === 'premium' ? 'text-gold/70' : 'text-gold/45'}>Sob orçamento · até 10 anos, 5 lavagens</span>
                          )}
                        </p>
                      </div>
                      <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', pendingWaterproof && formData.waterproofingTier === 'premium' ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                        <div className={cn('w-3 h-3 rounded-full transition-all duration-300', pendingWaterproof && formData.waterproofingTier === 'premium' ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        const turningOff = pendingWaterproof && formData.waterproofingTier === 'essencial';
                        setPendingWaterproof(!turningOff);
                        updateFormData({ waterproofingTier: 'essencial' });
                      }}
                      className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border transition-all duration-200 touch-manipulation', pendingWaterproof && formData.waterproofingTier === 'essencial' ? 'border-gold/50 bg-gold/[0.08]' : 'border-gold/15 bg-[#1a2a1a] hover:border-gold/40')}
                    >
                      <Shield className={cn('w-4 h-4 flex-shrink-0', pendingWaterproof && formData.waterproofingTier === 'essencial' ? 'text-gold' : 'text-white/25')} />
                      <div className="flex-1 text-left">
                        <p className={cn('text-[11px] font-bold leading-none', pendingWaterproof && formData.waterproofingTier === 'essencial' ? 'text-white' : 'text-white/50')}>Essencial</p>
                        <p className={cn('text-[11px] mt-0.5 leading-none', pendingWaterproof && formData.waterproofingTier === 'essencial' ? 'text-gold/60' : 'text-white/25')}>
                          {waterproofEssencialPriceRaw !== null ? `+${waterproofEssencialPriceRaw % 1 === 0 ? waterproofEssencialPriceRaw : waterproofEssencialPriceRaw.toFixed(1).replace('.', ',')}€` : 'orç.'} · 1-2 anos
                        </p>
                      </div>
                      <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', pendingWaterproof && formData.waterproofingTier === 'essencial' ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                        <div className={cn('w-3 h-3 rounded-full transition-all duration-300', pendingWaterproof && formData.waterproofingTier === 'essencial' ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                      </div>
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-white/20 text-center leading-snug px-2 mb-4">
                  Preço para cadeiras com tampo, costas e braços. Cadeira diferente?{' '}
                  <a
                    href={`${WHATSAPP_BASE}?text=${chairWhatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366]/70 hover:text-[#25D366] underline underline-offset-2 touch-manipulation whitespace-nowrap"
                  >
                    Pedir no WhatsApp
                  </a>
                </p>
                <button
                  onClick={() => {
                    setUpsellItems(prev => [...prev, {
                      id: 'chairs',
                      chairQty: String(qty),
                      qty,
                      price: sobOrç ? 0 : totalChairPrice,
                      label: `${qty} Cadeira${qty > 1 ? 's' : ''}${pendingWaterproof && !sobOrç ? (isPremiumTier ? ' + Impermeab. Premium' : ' + Impermeab. Essencial') : ''}`,
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
