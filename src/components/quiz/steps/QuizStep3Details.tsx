/**
 * QuizStep3Details.tsx
 * Step 3 of the Kyro quiz: service-specific quantity/detail configuration.
 * Handles Sofá, Colchão, Tapete, and Cadeiras variants.
 */

import { Shield, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sofaPrices, mattressPrices, sofaChaisePrice } from '@/components/quiz/QuizTypes';
import type { QuizFormData } from '@/components/quiz/QuizTypes';
import type { SofaItem, MattressItem } from '@/components/quiz/QuizTypes';
import {
  CARPET_TIERS,
  CHAIR_TIERS,
  carpetActiveTier,
  calcCarpetPrice,
  calcChairClean,
} from '@/services/pricingService';

// ── Local helpers (pure, no side-effects) ────────────────────────────────────

function fmtN(n: number): string {
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(1).replace('.', ',')}€`;
}

function sofaSetQty(items: SofaItem[], sizeId: string, newQty: number): SofaItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
function sofaTogglePack(items: SofaItem[], sizeId: string): SofaItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}
function mattressSetQty(items: MattressItem[], sizeId: string, newQty: number): MattressItem[] {
  const clamped = Math.max(0, newQty);
  if (clamped === 0) return items.filter(i => i.sizeId !== sizeId);
  const existing = items.find(i => i.sizeId === sizeId);
  if (existing) return items.map(i => i.sizeId === sizeId ? { ...i, qty: clamped } : i);
  return [...items, { sizeId, qty: clamped, packEnabled: false }];
}
function mattressTogglePack(items: MattressItem[], sizeId: string): MattressItem[] {
  return items.map(i => i.sizeId === sizeId ? { ...i, packEnabled: !i.packEnabled } : i);
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuizStep3DetailsProps {
  formData: QuizFormData;
  /** Updates a subset of formData fields. */
  updateFormData: (updates: Partial<QuizFormData>) => void;

  sofaItems: SofaItem[];
  setSofaItems: React.Dispatch<React.SetStateAction<SofaItem[]>>;

  mattressItems: MattressItem[];
  setMattressItems: React.Dispatch<React.SetStateAction<MattressItem[]>>;

  chaiseLongueQty: number;
  setChaiseLongueQty: React.Dispatch<React.SetStateAction<number>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Service detail configuration step.
 * Renders the appropriate sub-UI for the selected service (sofa / mattress / carpet / chairs).
 */
const QuizStep3Details = ({
  formData,
  updateFormData,
  sofaItems,
  setSofaItems,
  mattressItems,
  setMattressItems,
  chaiseLongueQty,
  setChaiseLongueQty,
}: QuizStep3DetailsProps) => {

  // ── SOFÁS ──────────────────────────────────────────────────────────────────
  if (formData.service === 'sofa') {
    const hasSofas = sofaItems.some(i => i.qty > 0);
    const has4Plus = (sofaItems.find(i => i.sizeId === '4+-lugares')?.qty ?? 0) > 0;
    return (
      <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do(s) Sofá(s)</h2>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {sofaPrices.map(option => {
            const item = sofaItems.find(i => i.sizeId === option.id);
            const qty = item?.qty ?? 0;
            const packOn = item?.packEnabled ?? false;
            const isActive = qty > 0;
            const isSob = typeof option.cleaningPrice !== 'number';
            const isWaterproofBase = formData.serviceType === 'waterproofing';
            const cleanPrice = isSob ? null : (option.cleaningPrice as number);
            const waterPrice = (!isSob && typeof option.waterproofingPrice === 'number') ? (option.waterproofingPrice as number) : null;
            const basePrice = isWaterproofBase ? waterPrice : cleanPrice;
            const packPrice = basePrice !== null ? basePrice + 30 : null;
            const dp = packOn && packPrice !== null ? packPrice : basePrice;
            const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Proteção Total VIP';
            const upsellSub = isWaterproofBase ? '+30€/un. · Limpeza profunda incluída' : '+30€/un. · Impermeabilização completa';
            return (
              <div key={option.id} className={cn('rounded-xl border-2 transition-all duration-200 overflow-hidden',
                isActive && packOn ? 'border-gold bg-gold/10 shadow-[0_0_12px_rgba(212,175,55,0.20)]'
                : isActive ? 'border-white/30 bg-white/[0.05]'
                : 'border-white/[0.10] bg-white/[0.03]')}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm font-semibold text-white">{option.label}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">VIP</span>}
                      {isActive && packOn && basePrice !== null && (
                        <span className="text-sm text-white/30 line-through tabular-nums">{basePrice}€</span>
                      )}
                      <span className={cn('text-sm font-bold tabular-nums',
                        isSob ? isActive ? 'text-white/70' : 'text-white/35'
                        : isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40')}>
                        {isSob ? 'Sob Orçamento' : `${dp}€/un.`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty - 1))}
                      disabled={qty === 0}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                    >−</button>
                    <span className={cn('w-6 text-center font-bold tabular-nums text-sm',
                      isActive ? packOn ? 'text-gold' : 'text-white/80' : 'text-white/30')}>{qty}</span>
                    <button
                      onClick={() => setSofaItems(sofaSetQty(sofaItems, option.id, qty + 1))}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                    >+</button>
                  </div>
                </div>
                {isActive && !isSob && basePrice !== null && (
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => setSofaItems(sofaTogglePack(sofaItems, option.id))}
                      className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 touch-manipulation',
                        packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-gold/30')}
                    >
                      <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                      <div className="flex-1 text-left">
                        <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>{upsellLabel}</p>
                        <p className={cn('text-[9px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>{upsellSub}</p>
                      </div>
                      <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0',
                        packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                        <div className={cn('w-3 h-3 rounded-full transition-all duration-300',
                          packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {has4Plus && (
          <input
            placeholder="Indica quantos lugares tem o sofá"
            className="w-full max-w-sm bg-white/[0.06] border border-white/15 focus:border-gold focus:outline-none text-white placeholder:text-white/25 rounded-xl h-11 px-4 text-sm transition-colors"
            onChange={e => updateFormData({ description: `Sofá com ${e.target.value} lugares` })}
          />
        )}
        {/* Chaise Longue */}
        <div className={cn('w-full max-w-sm rounded-xl border-2 transition-all duration-200',
          !hasSofas ? 'border-white/[0.06] bg-white/[0.02] opacity-35'
          : chaiseLongueQty > 0 ? 'border-gold/60 bg-gold/[0.08]'
          : 'border-white/[0.10] bg-white/[0.03]')}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex-1 min-w-0 mr-3">
              <span className={cn('text-sm font-semibold', hasSofas && chaiseLongueQty > 0 ? 'text-white' : 'text-white/50')}>Chaise Longue</span>
              <div className="mt-0.5">
                <span className={cn('text-sm font-bold tabular-nums', hasSofas && chaiseLongueQty > 0 ? 'text-gold' : 'text-white/30')}>
                  +{sofaChaisePrice.cleaning}€/un.
                </span>
              </div>
              {!hasSofas && <p className="text-[10px] text-white/25 mt-0.5">Selecione pelo menos 1 sofá primeiro</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { if (hasSofas) setChaiseLongueQty(q => Math.max(0, q - 1)); }}
                disabled={chaiseLongueQty === 0 || !hasSofas}
                className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
              >−</button>
              <span className={cn('w-6 text-center font-bold tabular-nums text-sm',
                hasSofas && chaiseLongueQty > 0 ? 'text-gold' : 'text-white/30')}>{chaiseLongueQty}</span>
              <button
                onClick={() => { if (hasSofas) setChaiseLongueQty(q => q + 1); }}
                disabled={!hasSofas}
                className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50 disabled:opacity-20"
              >+</button>
            </div>
          </div>
        </div>
        <p className="text-[9px] text-white/20 text-center tracking-wide uppercase">Valores com IVA incluído</p>
      </div>
    );
  }

  // ── COLCHÕES ───────────────────────────────────────────────────────────────
  if (formData.service === 'mattress') {
    return (
      <div className="flex flex-col gap-3 w-full overflow-hidden items-center">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">QUANTIDADES</p>
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do(s) Colchão(ões)</h2>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {mattressPrices.map(option => {
            const item = mattressItems.find(i => i.sizeId === option.id);
            const qty = item?.qty ?? 0;
            const packOn = item?.packEnabled ?? false;
            const isActive = qty > 0;
            const isWaterproofBase = formData.serviceType === 'waterproofing';
            const cleanPrice = typeof option.cleaningPrice === 'number' ? (option.cleaningPrice as number) : null;
            const waterPrice = typeof option.waterproofingPrice === 'number' ? (option.waterproofingPrice as number) : null;
            const basePrice = isWaterproofBase ? waterPrice : cleanPrice;
            const packPrice = basePrice !== null ? basePrice + 30 : null;
            const dp = packOn && packPrice !== null ? packPrice : basePrice;
            const upsellLabel = isWaterproofBase ? 'Adicionar Higienização Profunda' : 'Adicionar Proteção Total VIP';
            const upsellSub = isWaterproofBase ? '+30€/un. · Limpeza profunda incluída' : '+30€/un. · Proteção até 10 anos';
            return (
              <div key={option.id} className={cn('rounded-xl border-2 transition-all duration-200 overflow-hidden',
                isActive && packOn ? 'border-gold bg-gold/10 shadow-[0_0_12px_rgba(212,175,55,0.20)]'
                : isActive ? 'border-white/30 bg-white/[0.05]'
                : 'border-white/[0.10] bg-white/[0.03]')}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm font-semibold text-white">{option.label}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isActive && packOn && <span className="text-[9px] bg-gold/15 text-gold/80 px-1.5 py-0.5 rounded-full font-bold leading-none">VIP</span>}
                      {isActive && packOn && basePrice !== null && (
                        <span className="text-sm text-white/30 line-through tabular-nums">{basePrice}€</span>
                      )}
                      <span className={cn('text-sm font-bold tabular-nums',
                        isActive && packOn ? 'text-gold' : isActive ? 'text-white/80' : 'text-white/40')}>
                        {dp !== null ? `${dp}€/un.` : 'Sob Orçamento'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty - 1))}
                      disabled={qty === 0}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center disabled:opacity-20 active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                    >−</button>
                    <span className={cn('w-6 text-center font-bold tabular-nums text-sm',
                      isActive ? packOn ? 'text-gold' : 'text-white/80' : 'text-white/30')}>{qty}</span>
                    <button
                      onClick={() => setMattressItems(mattressSetQty(mattressItems, option.id, qty + 1))}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.05] text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all touch-manipulation hover:border-gold/50"
                    >+</button>
                  </div>
                </div>
                {isActive && basePrice !== null && (
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => setMattressItems(mattressTogglePack(mattressItems, option.id))}
                      className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 touch-manipulation',
                        packOn ? 'border-gold/50 bg-gold/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-gold/30')}
                    >
                      <Shield className={cn('w-4 h-4 flex-shrink-0', packOn ? 'text-gold' : 'text-white/25')} />
                      <div className="flex-1 text-left">
                        <p className={cn('text-[11px] font-bold leading-none', packOn ? 'text-white' : 'text-white/50')}>{upsellLabel}</p>
                        <p className={cn('text-[9px] mt-0.5 leading-none', packOn ? 'text-gold/60' : 'text-white/25')}>{upsellSub}</p>
                      </div>
                      <div className={cn('w-8 h-4 rounded-full border flex items-center px-0.5 transition-all duration-300 flex-shrink-0',
                        packOn ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                        <div className={cn('w-3 h-3 rounded-full transition-all duration-300',
                          packOn ? 'bg-gold translate-x-[14px]' : 'bg-white/30 translate-x-0')} />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-white/20 text-center tracking-wide uppercase">Valores com IVA incluído</p>
      </div>
    );
  }

  // ── TAPETES ────────────────────────────────────────────────────────────────
  if (formData.service === 'carpet') {
    const areaNum = parseFloat(formData.carpetArea);
    const validArea = !isNaN(areaNum) && areaNum > 0;
    const activeTierIdx = validArea ? carpetActiveTier(areaNum) : -1;
    const calculatedPrice = validArea ? calcCarpetPrice(areaNum) : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }} className="gap-3 py-1">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes do Tapete</h2>
        <div className="w-full max-w-[320px]">
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest text-center mb-2">Tabela de preços por m² · IVA incl.</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CARPET_TIERS.map((tier, idx) => {
              const isActive = activeTierIdx === idx;
              return (
                <div key={idx} className={cn('flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 text-center transition-all duration-200',
                  isActive ? 'border-gold bg-gold/[0.12] shadow-[0_0_16px_rgba(212,175,55,0.26)] scale-[1.02]' : 'border-white/[0.10] bg-white/[0.03]')}>
                  <span className={cn('text-[10px] font-black uppercase tracking-wide leading-none mb-0.5', isActive ? 'text-gold' : 'text-white')}>{tier.label}</span>
                  <span className={cn('text-[9px] leading-none mb-1.5', isActive ? 'text-white/80' : 'text-white/50')}>{tier.sublabel}</span>
                  {tier.rate !== null ? (
                    <div className="flex items-end gap-0.5 leading-none">
                      <span className={cn('font-playfair text-2xl font-bold tabular-nums leading-none', isActive ? 'text-gold' : 'text-white/70')}>{tier.rate}€</span>
                      <span className={cn('text-[9px] font-semibold pb-0.5', isActive ? 'text-gold/70' : 'text-white/40')}>/m²</span>
                    </div>
                  ) : (
                    <span className={cn('font-playfair text-sm font-bold', isActive ? 'text-gold' : 'text-white/60')}>Orçamento</span>
                  )}
                  {isActive && <span className="mt-1 text-[7px] font-black uppercase tracking-widest text-gold/80 bg-gold/10 px-1.5 py-0.5 rounded-full leading-none">ativo</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full max-w-[320px]">
          <label className="block text-[10px] font-bold text-white uppercase tracking-wider text-center mb-1.5">Área total de todos os tapetes (m²)</label>
          <div className="relative">
            <Input
              type="number" inputMode="decimal" min="0" step="0.5"
              placeholder="Soma total (ex: 12)..."
              value={formData.carpetArea}
              onChange={e => updateFormData({ carpetArea: e.target.value })}
              className={cn('text-lg font-bold bg-white/[0.07] text-white placeholder:text-white/25 h-11 pr-12 rounded-xl border-2 transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0',
                validArea ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.18)]' : 'border-white/20')}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gold/60 pointer-events-none">m²</span>
          </div>
          <p className="text-[10px] text-white/40 text-center mt-1 leading-snug">Se tiver vários tapetes, insira a soma total das áreas.</p>
        </div>
        {validArea && (
          <div className={cn('w-full max-w-[320px] rounded-xl border-2 px-4 py-2.5 transition-all duration-300',
            calculatedPrice !== null ? 'bg-kyro-green border-gold shadow-[0_0_14px_rgba(212,175,55,0.18)]' : 'bg-kyro-green border-white/15')}>
            {calculatedPrice !== null ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/60 leading-none mb-0.5">Estimativa</span>
                  <span className="text-xs font-semibold text-white">{areaNum} m² × {CARPET_TIERS[activeTierIdx].rate}€/m²</span>
                </div>
                <div className="text-right">
                  <span className="font-playfair text-2xl font-bold text-gold tabular-nums block leading-none">{Math.round(calculatedPrice)}€</span>
                  <span className="text-[8px] text-white/30 uppercase tracking-wide leading-none">IVA incl.</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider text-center py-0.5 flex items-center justify-center gap-1"><Mail className="w-3.5 h-3.5" />+15 m² — orçamento personalizado</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── CADEIRAS ───────────────────────────────────────────────────────────────
  if (formData.service === 'chairs') {
    const qty = parseInt(formData.chairQuantity);
    const validQty = !isNaN(qty) && qty > 0;
    const activeTierIdx = validQty ? (qty <= 3 ? 0 : qty <= 6 ? 1 : qty <= 10 ? 2 : 3) : -1;
    const waterRate = validQty && qty <= 10 ? 7.5 : null;
    const sob = validQty && qty > 10;
    return (
      <div className="flex flex-col gap-2.5 overflow-hidden items-center w-full">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">Detalhes das Cadeiras</h2>
        <div className="w-full max-w-sm mx-auto">
          <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest text-center mb-1.5">Limpeza + Higienização por cadeira</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CHAIR_TIERS.map((tier, idx) => {
              const isActive = activeTierIdx === idx;
              return (
                <div key={idx} className={cn('flex flex-col items-center justify-center py-2 px-2 rounded-xl border-2 text-center transition-all duration-250',
                  isActive ? 'border-gold bg-gold/[0.10] shadow-[0_0_14px_rgba(212,175,55,0.25)] scale-[1.02]' : 'border-white/[0.08] bg-white/[0.03]')}>
                  <span className={cn('text-[9px] font-black uppercase tracking-wide leading-none mb-0.5', isActive ? 'text-gold/90' : 'text-white/30')}>{tier.label}</span>
                  <span className={cn('text-[8px] leading-none mb-1', isActive ? 'text-white/45' : 'text-white/15')}>{tier.sublabel}</span>
                  {tier.rate !== null ? (
                    <div className="flex items-end gap-0.5 leading-none">
                      <span className={cn('font-playfair text-xl font-bold tabular-nums leading-none', isActive ? 'text-gold' : 'text-white/35')}>{fmtN(tier.rate)}</span>
                      <span className={cn('text-[9px] font-semibold pb-0.5', isActive ? 'text-gold/55' : 'text-white/20')}>/un.</span>
                    </div>
                  ) : (
                    <span className={cn('font-playfair text-sm font-bold', isActive ? 'text-gold' : 'text-white/30')}>Orçamento</span>
                  )}
                  {isActive && <span className="mt-0.5 text-[7px] font-black uppercase tracking-widest text-gold/65 bg-gold/10 px-1.5 py-0.5 rounded-full leading-none">ativo</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full max-w-sm mx-auto">
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider text-center mb-1">Quantas cadeiras deseja higienizar?</label>
          <div className="relative">
            <Input
              type="number" inputMode="numeric" min="1" step="1"
              placeholder="Ex: 5..."
              value={formData.chairQuantity}
              onChange={e => updateFormData({ chairQuantity: e.target.value, chairType: 'bulk_full' })}
              className={cn('text-lg font-bold bg-white/[0.07] text-white placeholder:text-white/20 h-11 pr-16 rounded-xl border-2 transition-all duration-300 focus-visible:ring-0 focus-visible:ring-offset-0',
                validQty ? 'border-gold shadow-[0_0_12px_rgba(212,175,55,0.16)]' : 'border-gold/40')}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gold/45 pointer-events-none">cadeiras</span>
          </div>
        </div>
        {validQty && !sob && (
          <button
            onClick={() => updateFormData({ chairWaterproofing: !formData.chairWaterproofing })}
            className={cn('relative w-full max-w-sm mx-auto rounded-xl border-2 px-3.5 py-2.5 text-left transition-all duration-300 touch-manipulation active:scale-[0.99]',
              formData.chairWaterproofing ? 'border-gold bg-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.22)]' : 'border-white/[0.12] bg-white/[0.03] hover:border-gold/40')}
          >
            <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-md">RECOMENDADO</span>
            <div className="flex items-center gap-3">
              <Shield className={cn('w-5 h-5 flex-shrink-0', formData.chairWaterproofing ? 'text-gold' : 'text-white/30')} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-bold leading-snug', formData.chairWaterproofing ? 'text-white' : 'text-white/75')}>Proteger contra manchas e líquidos?</p>
                <p className={cn('text-[10px] mt-0.5', formData.chairWaterproofing ? 'text-white/50' : 'text-white/30')}>
                  Impermeabilização · {waterRate !== null ? `+${fmtN(waterRate)}/un.` : 'Sob orçamento'}
                </p>
              </div>
              <div className={cn('w-10 h-5 rounded-full border-2 flex items-center transition-all duration-300 flex-shrink-0 px-0.5',
                formData.chairWaterproofing ? 'border-gold bg-gold/20' : 'border-white/20 bg-white/[0.05]')}>
                <div className={cn('w-4 h-4 rounded-full transition-all duration-300',
                  formData.chairWaterproofing ? 'bg-gold translate-x-[18px]' : 'bg-white/30 translate-x-0')} />
              </div>
            </div>
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default QuizStep3Details;
