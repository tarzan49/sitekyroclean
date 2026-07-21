import { Shield, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices } from '@/components/quiz/QuizTypes';
import type { QuizFormData, SofaItem, MattressItem } from '@/components/quiz/QuizTypes';
import {
  sofaSetQty, sofaTogglePack,
  mattressSetQty,
  calcCarpetPrice, calcChairClean, calcChairWaterproof,
  calcPackPricing,
} from '@/components/quiz/quizHelpers';

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
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do(s) Sofá(s)</h2>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {sofaPrices.map(option => {
            const item = sofaItems.find(i => i.sizeId === option.id);
            const qty = item?.qty ?? 0;
            const packOn = item?.packEnabled ?? false;
            const isActive = qty > 0;
            const isWaterproofBase = formData.serviceType === 'waterproofing';
            const { isSob, basePrice, packDelta, displayPrice: dp } = calcPackPricing(option, packOn, isWaterproofBase, 40);
            const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Proteção Total VIP';
            const upsellSub = isWaterproofBase ? `+${packDelta}€/un. · Limpeza profunda incluída` : `+${packDelta}€/un. · Impermeabilização completa`;
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
                    <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty - 1))} disabled={qty === 0} className="w-11 h-11 rounded-sm border border-white/20 bg-white/[0.05] text-white font-bold text-xl flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                    <span className={cn('w-7 text-center font-bold tabular-nums text-base', isActive ? (packOn ? 'text-gold' : 'text-white/80') : 'text-white/30')}>{qty}</span>
                    <button onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty + 1))} className="w-11 h-11 rounded-sm border border-white/20 bg-white/[0.05] text-white font-bold text-xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                  </div>
                </div>
                {isActive && !isSob && basePrice !== null && (
                  <div className="px-4 pb-3">
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
    return (
      <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
        <p className="text-gold text-[11px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do(s) Colchão(ões)</h2>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {mattressPrices.map(option => {
            const item = mattressItems.find(i => i.sizeId === option.id);
            const qty = item?.qty ?? 0;
            const isActive = qty > 0;
            const dp = typeof option.cleaningPrice === 'number' ? option.cleaningPrice : null;
            return (
              <div key={option.id} className={cn('rounded-sm border-2 transition-all duration-200 overflow-hidden', isActive ? 'border-gold/50 bg-[#1a2a1a] shadow-[0_0_8px_rgba(212,175,55,0.10)]' : 'border-gold/20 bg-[#1a2a1a]')}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm font-semibold text-white">{option.label}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn('text-sm font-bold tabular-nums', isActive ? 'text-white/80' : 'text-white/40')}>{dp !== null ? `${dp}€/un.` : 'Sob Orçamento'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty - 1))} disabled={qty === 0} className="w-11 h-11 rounded-sm border border-white/20 bg-white/[0.05] text-white font-bold text-xl flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50">−</button>
                    <span className={cn('w-7 text-center font-bold tabular-nums text-base', isActive ? 'text-white/80' : 'text-white/30')}>{qty}</span>
                    <button onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty + 1))} className="w-11 h-11 rounded-sm border border-white/20 bg-white/[0.05] text-white font-bold text-xl flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50">+</button>
                  </div>
                </div>
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
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do Tapete</h2>
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
          ≤5m²: 12€/m² · ≤10m²: 10€/m² · ≤15m²: 9€/m² · +15m²: sob orçamento
        </p>
      </div>
    );
  }

  // ── CADEIRAS ───────────────────────────────────────────────────────────────
  if (formData.service === 'chairs') {
    const isWaterproofPrimary = formData.serviceType === 'waterproofing';
    const qty = Math.max(1, parseInt(formData.chairQuantity) || 1);
    const sob = qty > 10;
    const primaryPrice = isWaterproofPrimary ? calcChairWaterproof(qty) : calcChairClean(qty);
    const addonEnabled = formData.chairWaterproofing;
    const addonPrice = isWaterproofPrimary ? calcChairClean(qty) : calcChairWaterproof(qty);
    const totalChairPrice = (primaryPrice ?? 0) + (addonEnabled && !sob ? (addonPrice ?? 0) : 0);
    const addonLabel = isWaterproofPrimary ? 'Adicionar Higienização' : 'Adicionar Impermeabilização';
    const addonRateHint = isWaterproofPrimary
      ? (qty <= 4 ? '20' : qty <= 6 ? '15' : '12,5')
      : (qty <= 4 ? '25' : '20');

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

    return (
      <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes das Cadeiras</h2>
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
              ? '1ª–4ª: 25€ · 5ª–10ª: 20€ por cadeira'
              : '1ª–4ª: 20€ · 5ª–6ª: 15€ · 7ª–10ª: 12,5€ por cadeira'}
          </p>
        )}
        {!sob && (
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
      </div>
    );
  }

  return null;
};

export default QuizStepConfig;
