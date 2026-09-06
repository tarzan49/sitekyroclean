import { Shield, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, SofaItem, MattressItem } from '@/components/quiz/QuizTypes';
import {
  sofaSetQty, sofaTogglePack,
  mattressSetQty, mattressTogglePack,
  calcCarpetPrice, calcChairClean, calcChairWaterproof, calcChairWaterproofPremium,
  calcPackPricing,
} from '@/components/quiz/quizHelpers';
import { WHATSAPP_BASE } from '@/constants/business';

// Escolha Essencial (água) vs Premium (diluente), só aparece quando o serviceType
// é 'waterproofing' standalone — o Pack (both) fica sempre Essencial, não há preço
// de combo definido para Premium+limpeza.
function WaterproofingTierPicker({ formData, updateFormData }: { formData: QuizFormData; updateFormData: (u: Partial<QuizFormData>) => void }) {
  const tier = formData.waterproofingTier;
  return (
    <div className="w-full max-w-sm grid grid-cols-2 gap-2 mb-1 pt-3 items-stretch">
      <button
        onClick={() => updateFormData({ waterproofingTier: 'premium' })}
        className={cn(
          'rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
          tier === 'premium'
            ? 'border-gold bg-[#1a2a1a] shadow-[0_0_18px_rgba(212,175,55,0.30)]'
            : 'border-gold/50 bg-[#1a2a1a] ring-1 ring-gold/20 hover:border-gold/75'
        )}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          {tier === 'premium' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-xs font-bold', tier === 'premium' ? 'text-white' : 'text-white/85')}>Premium</p>
          <span className="text-[8px] font-bold uppercase tracking-wide text-gold border border-gold/40 rounded-[3px] px-1 py-[1px] leading-none">Dura mais</span>
        </div>
        <p className={cn('text-[10px] leading-snug font-semibold', tier === 'premium' ? 'text-gold/70' : 'text-gold/45')}>Até 10 anos de proteção · até 5 lavagens</p>
      </button>
      <button
        onClick={() => updateFormData({ waterproofingTier: 'essencial' })}
        className={cn('rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation', tier === 'essencial' ? 'border-gold bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40')}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          {tier === 'essencial' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
          <p className={cn('text-xs font-bold', tier === 'essencial' ? 'text-white' : 'text-white/60')}>Essencial</p>
        </div>
        <p className="text-[10px] text-white/35 leading-snug">1 a 2 anos de proteção · até 2 lavagens</p>
      </button>
    </div>
  );
}

interface QuizStepConfigProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  sofaItems: SofaItem[];
  setSofaItems: React.Dispatch<React.SetStateAction<SofaItem[]>>;
  mattressItems: MattressItem[];
  setMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;
}

const QuizStepConfig = ({
  formData,
  updateFormData,
  sofaItems,
  setSofaItems,
  mattressItems,
  setMattressItems,
}: QuizStepConfigProps) => {

  // ── SOFÁS ──────────────────────────────────────────────────────────────────
  if (formData.service === 'sofa') {
    const hasSofas = sofaItems.some(i => i.qty > 0);
    const has4Plus = (sofaItems.find(i => i.sizeId === '4+-lugares')?.qty ?? 0) > 0;
    return (
      <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
        <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Detalhes do(s) Sofá(s)</h2>
        {formData.serviceType === 'waterproofing' && <WaterproofingTierPicker formData={formData} updateFormData={updateFormData} />}
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {sofaPrices.map(option => {
            const item = sofaItems.find(i => i.sizeId === option.id);
            const qty = item?.qty ?? 0;
            const packOn = item?.packEnabled ?? false;
            const isActive = qty > 0;
            const isWaterproofBase = formData.serviceType === 'waterproofing';
            const packTier = formData.waterproofingTier;
            const { isSob, basePrice, packDelta, displayPrice: dp } = calcPackPricing(option, packOn, isWaterproofBase, 40, packTier);
            const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Proteção Total VIP';
            const upsellSub = isWaterproofBase ? `+${packDelta}€/un. · Limpeza profunda incluída` : `+${packDelta}€/un. · Impermeabilização completa`;
            // Só faz sentido separar em 2 anos/10 anos quando se está a ADICIONAR proteção
            // a uma limpeza (o outro sentido, adicionar limpeza a uma proteção já escolhida
            // no seletor Essencial/Premium do topo, mantém-se um único toggle).
            const essencial = calcPackPricing(option, true, false, 40, 'essencial');
            const premium = calcPackPricing(option, true, false, 40, 'premium');
            const premiumExtraDelta = premium.packDelta !== null && essencial.packDelta !== null
              ? Math.round((premium.packDelta - essencial.packDelta) * 100) / 100 : null;
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
              <div key={option.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-gold/20 bg-[#1a2a1a]')}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm font-semibold text-white">{option.label}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">PACK</span>}
                      {isActive && packOn && typeof originalPackPrice === 'number' && (
                        <span className="text-sm text-white/30 line-through tabular-nums">{originalPackPrice}€</span>
                      )}
                      {!packOn && isWaterproofBase && packTier === 'premium' && !isSob && typeof dp === 'number' && (
                        <span className="text-sm text-white/30 line-through tabular-nums">{dp + 10}€</span>
                      )}
                      <span className={cn('text-sm font-bold tabular-nums', isSob ? isActive ? 'text-white/70' : 'text-white/35' : isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40')}>
                        {isSob ? 'Sob Orçamento' : `${dp}€/un.`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty - 1))} disabled={qty === 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                    <span className={cn('w-7 text-center font-bold tabular-nums text-base', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                    <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty + 1))} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                  </div>
                </div>
                {isActive && !isSob && basePrice !== null && packDelta !== null && (
                  <div className="px-4 pb-3">
                    {isWaterproofBase ? (
                      <button onClick={() => setSofaItems(sofaTogglePack(sofaItems, option.id))} className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border transition-all duration-200 touch-manipulation', packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-gold/15 bg-[#1a2a1a] hover:border-gold/40')}>
                        <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                        <div className="flex-1 text-left">
                          <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>{upsellLabel}</p>
                          <p className={cn('text-[11px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>{upsellSub}</p>
                        </div>
                        <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                          <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                        </div>
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {/* Proteção 10 anos (Premium) — preço e material em paralelo com a de 2 anos,
                            sem framing de desconto (evita dar a entender que a de 2 anos é má opção) */}
                        <button
                          onClick={() => {
                            const turningOn = !(packOn && packTier === 'premium');
                            setSofaItems(turningOn && packOn ? sofaItems : sofaTogglePack(sofaItems, option.id));
                            updateFormData({ waterproofingTier: 'premium' });
                          }}
                          className={cn('relative w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border-2 transition-all duration-200 touch-manipulation', packOn && packTier === 'premium' ? 'border-gold bg-gold/[0.10] shadow-[0_0_10px_rgba(212,175,55,0.18)]' : 'border-gold/30 bg-[#1a2a1a] hover:border-gold/55')}
                        >
                          <span className="absolute -top-2 left-3 bg-gradient-to-r from-[#C9A84C] to-[#F0DC8A] text-[#12121e] text-[8px] font-black px-2 py-0.5 rounded-full tracking-wide uppercase whitespace-nowrap shadow-sm">
                            Melhor Proteção
                          </span>
                          <Shield className={cn('w-4 h-4 flex-shrink-0', packOn && packTier === 'premium' ? 'text-gold' : 'text-gold/50')} />
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={cn('text-[11px] font-bold leading-none', packOn && packTier === 'premium' ? 'text-white' : 'text-white/60')}>Proteção 10 anos</p>
                              {premiumExtraDelta !== null && (
                                <span className={cn('text-[10px] font-black leading-none px-1.5 py-[3px] rounded-full whitespace-nowrap flex-shrink-0', packOn && packTier === 'premium' ? 'bg-gold text-[#12121e]' : 'bg-gold/20 text-gold')}>
                                  só +{premiumExtraDelta}€
                                </span>
                              )}
                            </div>
                            <p className={cn('text-[11px] mt-0.5 leading-none whitespace-nowrap', packOn && packTier === 'premium' ? 'text-gold/70' : 'text-gold/50')}>
                              +{premium.packDelta}€/un. · até 10 anos, 5 lavagens
                            </p>
                          </div>
                          <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn && packTier === 'premium' ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                            <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn && packTier === 'premium' ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                          </div>
                        </button>
                        {/* Proteção 2 anos (Essencial) */}
                        <button
                          onClick={() => {
                            const turningOn = !(packOn && packTier === 'essencial');
                            setSofaItems(turningOn && packOn ? sofaItems : sofaTogglePack(sofaItems, option.id));
                            updateFormData({ waterproofingTier: 'essencial' });
                          }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-sm border transition-all duration-200 touch-manipulation', packOn && packTier === 'essencial' ? 'border-gold/50 bg-gold/[0.08]' : 'border-gold/15 bg-[#1a2a1a] hover:border-gold/40')}
                        >
                          <Shield className={cn('w-4 h-4 flex-shrink-0', packOn && packTier === 'essencial' ? 'text-gold' : 'text-white/25')} />
                          <div className="flex-1 text-left">
                            <p className={cn('text-[11px] font-bold leading-none', packOn && packTier === 'essencial' ? 'text-white' : 'text-white/50')}>Proteção 2 anos</p>
                            <p className={cn('text-[11px] mt-0.5 leading-none', packOn && packTier === 'essencial' ? 'text-gold/60' : 'text-white/25')}>+{essencial.packDelta}€/un. · 1-2 anos</p>
                          </div>
                          <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0', packOn && packTier === 'essencial' ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                            <div className={cn('w-3 h-3 rounded-full transition-all duration-300', packOn && packTier === 'essencial' ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {has4Plus && <input type="number" inputMode="numeric" pattern="[0-9]*" placeholder="Nº de lugares (ex: 5)" className="w-full max-w-sm bg-white/[0.06] border border-white/15 focus:border-gold focus:outline-none text-white placeholder:text-white/25 rounded-sm h-12 px-4 text-base transition-colors" onChange={(e) => updateFormData({ description: `Sofá com ${e.target.value} lugares` })} />}
      </div>
    );
  }

  // ── COLCHÕES ───────────────────────────────────────────────────────────────
  if (formData.service === 'mattress') {
    const isWaterproofBase = formData.serviceType === 'waterproofing';
    return (
      <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
        <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Detalhes do(s) Colchão(ões)</h2>
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
              <div key={option.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive && packOn ? 'border-gold bg-[#1a2a1a] shadow-[0_0_12px_rgba(212,175,55,0.20)]' : isActive ? 'border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-gold/20 bg-[#1a2a1a]')}>
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
                    <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty - 1))} disabled={qty === 0} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                    <span className={cn('w-7 text-center font-bold tabular-nums text-base', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                    <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty + 1))} className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                  </div>
                </div>
                {isActive && !isSob && (
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
                      Elimina os ácaros e impede que voltem, prevenindo alergias e problemas respiratórios.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── TAPETES ────────────────────────────────────────────────────────────────
  if (formData.service === 'carpet') {
    const areaNum = parseFloat(formData.carpetArea);
    const validArea = !isNaN(areaNum) && areaNum > 0;
    const calculatedPrice = validArea ? calcCarpetPrice(areaNum) : null;
    const sob = validArea && areaNum > 15;
    return (
      <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Detalhes do Tapete</h2>
        <div className={cn(
          'w-full max-w-xs rounded-sm border px-5 py-4 text-center transition-all duration-300',
          sob ? 'bg-[#1a2a1a] border-white/20'
            : validArea ? 'bg-[#1a2a1a] border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.10)]'
            : 'bg-[#1a2a1a] border-gold/15'
        )}>
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Estimativa total</p>
          {validArea ? (
            <>
              <p
                className={cn('font-playfair font-black leading-none mb-1', sob ? 'text-white/50 text-2xl' : 'text-gold text-4xl')}
                style={!sob ? { textShadow: '0 0 28px rgba(212,175,55,0.55)' } : undefined}
              >
                {sob ? 'Sob Orçamento' : `${calculatedPrice !== null ? Math.round(calculatedPrice) : '0'}€`}
              </p>
              <p className="text-[10px] text-white/30">
                {sob ? 'O nosso especialista entra em contacto' : `${areaNum} m²`}
              </p>
            </>
          ) : (
            <p className="text-white/25 text-sm font-medium py-1">Insira a área para ver o preço</p>
          )}
        </div>
        <div className="w-full max-w-xs">
          <label className="block text-xs font-bold text-white/40 uppercase tracking-wider text-center mb-1.5">Área total de todos os tapetes</label>
          <div className="relative">
            <Input type="number" inputMode="decimal" min="0" step="0.5" placeholder="Ex: 12" value={formData.carpetArea} onChange={(e) => updateFormData({ carpetArea: e.target.value })} className={cn('text-lg font-bold bg-[#1a2a1a] text-white placeholder:text-white/25 h-11 pr-12 rounded-sm border-2 transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0', validArea ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.18)]' : 'border-gold/25')} />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gold/60 pointer-events-none">m²</span>
          </div>
          <p className="text-xs text-white/35 text-center mt-1 leading-snug">Se tiver vários tapetes, insira a soma total das áreas.</p>
        </div>
        <p className="text-xs text-white/30 text-center leading-snug">
          Preço por m² desce com a área: até 3m² 15€, até 5m² 12,5€, até 8m² 11,5€, até 10m² 10,5€, até 15m² 10€. Acima de 15m², sob orçamento.
        </p>
      </div>
    );
  }

  // ── CADEIRAS ───────────────────────────────────────────────────────────────
  if (formData.service === 'chairs') {
    const isWaterproofPrimary = formData.serviceType === 'waterproofing';
    const isPremiumTier = formData.waterproofingTier === 'premium';
    const calcWaterproof = isPremiumTier ? calcChairWaterproofPremium : calcChairWaterproof;
    const qty = Math.max(1, parseInt(formData.chairQuantity) || 1);
    const primaryPrice = isWaterproofPrimary ? calcWaterproof(qty) : calcChairClean(qty);
    const addonEnabled = formData.chairWaterproofing;
    const addonPrice = isWaterproofPrimary ? calcChairClean(qty) : calcWaterproof(qty);
    // "Sob orçamento" tem de propagar-se ao total assim que QUALQUER preço
    // ativo (primário ou addon ligado) não tem valor fixo — nunca cair para
    // 0/ignorar o addon em silêncio (bug real: 10 cadeiras Premium dava 160€
    // porque calcChairWaterproofPremium(10) é null e `?? 0` engolia-o,
    // enquanto 9 cadeiras dava 347,5€ — um pedido maior a custar menos).
    const sob = primaryPrice === null || (addonEnabled && addonPrice === null);
    const totalChairPrice = sob ? 0 : (primaryPrice ?? 0) + (addonEnabled ? (addonPrice ?? 0) : 0);
    const addonLabel = isWaterproofPrimary ? 'Adicionar Higienização' : 'Adicionar Impermeabilização';
    const addonRateHint = isWaterproofPrimary
      ? (qty <= 4 ? '20' : qty <= 6 ? '15' : '12,5')
      : isPremiumTier ? (qty <= 4 ? '20' : '15') : (qty <= 4 ? '15' : '10'); // Essencial 15/10 · Premium 20/15

    const setChairQty = (newQty: number) => {
      const clamped = Math.max(1, newQty);
      updateFormData({
        chairQuantity: String(clamped),
        chairType: 'bulk_full',
        ...(addonEnabled ? { chairWaterproofQty: clamped } : {}),
      });
    };

    const toggleAddon = () => {
      const next = !addonEnabled;
      updateFormData({ chairWaterproofing: next, chairWaterproofQty: next ? qty : 0 });
    };

    // Dual essencial/premium do addon de impermeabilização (quando limpeza é o
    // serviço principal) — espelha o padrão "Proteção 2/10 anos" do sofá, em vez de
    // um único checkbox só com a tarifa Água.
    const toggleAddonTier = (tier: 'essencial' | 'premium') => {
      const turningOff = addonEnabled && formData.waterproofingTier === tier;
      updateFormData({
        chairWaterproofing: !turningOff,
        chairWaterproofQty: !turningOff ? qty : 0,
        waterproofingTier: tier,
      });
    };
    const addonEssencialPrice = calcChairWaterproof(qty);
    const addonPremiumPrice = calcChairWaterproofPremium(qty);
    const chairPremiumExtraDelta = addonEssencialPrice !== null && addonPremiumPrice !== null
      ? Math.round((addonPremiumPrice - addonEssencialPrice) * 100) / 100 : null;
    const chairWhatsappMsg = encodeURIComponent('Olá, tenho cadeiras de um tipo diferente (sem tampo, costas ou braços) e gostava de um orçamento personalizado.');

    return (
      <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">Detalhes das Cadeiras</h2>
        {isWaterproofPrimary && <WaterproofingTierPicker formData={formData} updateFormData={updateFormData} />}
        <div className={cn(
          'w-full max-w-xs rounded-sm border px-5 py-4 text-center transition-all duration-300',
          sob ? 'bg-[#1a2a1a] border-white/20' : 'bg-[#1a2a1a] border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.10)]'
        )}>
          <p className="text-[10px] text-white/35 uppercase tracking-wider mb-1">Estimativa total</p>
          <p
            className={cn('font-playfair font-black leading-none mb-1', sob ? 'text-white/60 text-2xl' : 'text-gold text-4xl')}
            style={!sob ? { textShadow: '0 0 28px rgba(212,175,55,0.55)' } : undefined}
          >
            {sob ? 'Sob Orçamento' : `${totalChairPrice % 1 === 0 ? totalChairPrice : totalChairPrice.toFixed(1).replace('.', ',')}€`}
          </p>
          <p className="text-[10px] text-white/30">
            {sob
              ? 'O nosso especialista entra em contacto'
              : `${qty} cadeira${qty > 1 ? 's' : ''}${addonEnabled ? (isWaterproofPrimary ? ' + higienização' : ' + impermeabilização') : ''}`}
          </p>
        </div>
        <p className="text-xs text-white/40 uppercase tracking-wider text-center">Quantidade</p>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setChairQty(qty - 1)}
            disabled={qty <= 1}
            className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
          >−</button>
          <span className="text-4xl font-black text-gold w-10 text-center tabular-nums leading-none">{qty}</span>
          <button
            onClick={() => setChairQty(qty + 1)}
            className="w-14 h-14 rounded-sm border-2 border-white/20 bg-white/[0.05] text-white font-bold text-2xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
          >+</button>
        </div>
        {!sob && (
          <p className="text-xs text-white/30 text-center leading-snug">
            {isWaterproofPrimary
              ? (isPremiumTier ? '1ª–4ª: 20€ · 5ª–9ª: 15€ por cadeira' : '1ª–4ª: 15€ · 5ª–9ª: 10€ por cadeira')
              : '1ª–4ª: 20€ · 5ª–6ª: 15€ · 7ª–9ª: 12,5€ por cadeira'}
          </p>
        )}
        {!sob && isWaterproofPrimary && (
          <button
            onClick={toggleAddon}
            className={cn(
              'w-full max-w-xs flex items-center gap-3 px-4 py-3 rounded-sm border-2 transition-all touch-manipulation',
              addonEnabled
                ? 'border-gold bg-[#1a2a1a] shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40'
            )}
          >
            <div className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all', addonEnabled ? 'border-gold bg-gold' : 'border-white/30')}>
              {addonEnabled && <Check className="w-3 h-3 text-[#12121e]" />}
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-white">{addonLabel}</p>
              <p className="text-xs text-white/40">{addonRateHint}€/cadeira</p>
            </div>
            <span className="text-gold font-bold text-sm flex-shrink-0">
              +{addonPrice !== null
                ? `${addonPrice % 1 === 0 ? addonPrice : addonPrice.toFixed(1).replace('.', ',')}€`
                : 'orçamento'}
            </span>
          </button>
        )}
        {/* Impermeabilização como addon: Água vs Diluente lado a lado (mesmo padrão
            visual do seletor Essencial/Premium do topo do quiz), para a Premium
            parecer a melhor escolha por comparação direta (pedido explícito). */}
        {!sob && !isWaterproofPrimary && (
          <div className="w-full max-w-xs grid grid-cols-2 gap-2 pt-3">
            <button
              onClick={() => toggleAddonTier('premium')}
              className={cn(
                'relative rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
                addonEnabled && formData.waterproofingTier === 'premium'
                  ? 'border-gold bg-gold/[0.10] shadow-[0_0_16px_rgba(212,175,55,0.30)]'
                  : 'border-gold/50 bg-[#1a2a1a] ring-1 ring-gold/20 hover:border-gold/75'
              )}
            >
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C9A84C] to-[#F0DC8A] text-[#12121e] text-[8px] font-black px-2.5 py-0.5 rounded-full tracking-widest uppercase shadow-md whitespace-nowrap">
                Melhor Proteção
              </span>
              <div className="flex items-center gap-1.5 mb-0.5">
                {addonEnabled && formData.waterproofingTier === 'premium' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
                <p className={cn('text-xs font-bold', addonEnabled && formData.waterproofingTier === 'premium' ? 'text-white' : 'text-white/85')}>Premium</p>
                {chairPremiumExtraDelta !== null && (
                  <span className={cn('text-[9px] font-black leading-none px-1.5 py-[3px] rounded-full whitespace-nowrap flex-shrink-0', addonEnabled && formData.waterproofingTier === 'premium' ? 'bg-gold text-[#12121e]' : 'bg-gold/20 text-gold')}>
                    só +{chairPremiumExtraDelta}€
                  </span>
                )}
              </div>
              <p className={cn('text-[10px] leading-snug', addonEnabled && formData.waterproofingTier === 'premium' ? 'text-gold/60' : 'text-gold/45')}>
                até 10 anos, 5 lavagens
              </p>
            </button>
            <button
              onClick={() => toggleAddonTier('essencial')}
              className={cn(
                'rounded-sm border-2 px-3 py-2.5 text-left transition-all duration-200 touch-manipulation',
                addonEnabled && formData.waterproofingTier === 'essencial'
                  ? 'border-gold bg-gold/[0.08] shadow-[0_0_10px_rgba(212,175,55,0.18)]'
                  : 'border-gold/20 bg-[#1a2a1a] hover:border-gold/40'
              )}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {addonEnabled && formData.waterproofingTier === 'essencial' && <Check className="w-3 h-3 text-gold flex-shrink-0" />}
                <p className={cn('text-xs font-bold', addonEnabled && formData.waterproofingTier === 'essencial' ? 'text-white' : 'text-white/60')}>Essencial</p>
              </div>
              <p className="text-[10px] text-white/35 leading-snug">
                +{addonEssencialPrice !== null ? `${addonEssencialPrice % 1 === 0 ? addonEssencialPrice : addonEssencialPrice.toFixed(1).replace('.', ',')}€` : 'orç.'} · 1-2 anos
              </p>
            </button>
          </div>
        )}
        {/* Aviso de tipo de cadeira: discreto de propósito, é uma exceção, não a
            regra — não deve competir visualmente com o preço/opções acima. */}
        <p className="text-[10px] text-white/20 text-center leading-snug px-2">
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
      </div>
    );
  }

  return null;
};

export default QuizStepConfig;
