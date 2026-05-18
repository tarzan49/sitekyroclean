import { Shield, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { QuizFormData } from './QuizTypes';

interface QuizStep2ChairsProps {
  formData: QuizFormData;
  onUpdate: (updates: Partial<QuizFormData>) => void;
}

const CLEAN_TIERS = [
  { label: 'Até 3', sublabel: 'cadeiras', rate: 17.5, max: 3 },
  { label: '4 a 6', sublabel: 'cadeiras', rate: 15, max: 6 },
  { label: '7 a 10', sublabel: 'cadeiras', rate: 12.5, max: 10 },
  { label: '+10', sublabel: 'cadeiras', rate: null, max: Infinity },
];

function getActiveTierIndex(qty: number): number {
  if (qty <= 3) return 0;
  if (qty <= 6) return 1;
  if (qty <= 10) return 2;
  return 3;
}

export function calcChairCleanPrice(qty: number): number | null {
  if (qty <= 0) return null;
  if (qty <= 3) return qty * 17.5;
  if (qty <= 6) return Math.max(3 * 17.5, qty * 15);   // nunca inferior ao máx do escalão anterior
  if (qty <= 10) return Math.max(6 * 15, qty * 12.5);  // nunca inferior ao máx do escalão anterior
  return null;
}

export function calcChairWaterproofPrice(qty: number): number | null {
  if (qty <= 0) return null;
  if (qty > 10) return null;
  return qty * 7.5;
}

function fmtPrice(n: number): string {
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(2).replace('.', ',')}€`;
}

function fmtRate(n: number): string {
  return n % 1 === 0 ? `${n}€` : `${n.toFixed(2).replace('.', ',')}€`;
}

function getWaterproofRate(qty: number): number | null {
  if (qty <= 0 || qty > 10) return null;
  return 7.5;
}

const QuizStep2Chairs = ({ formData, onUpdate }: QuizStep2ChairsProps) => {
  const qty = parseInt(formData.chairQuantity);
  const validQty = !isNaN(qty) && qty > 0;
  const activeTierIdx = validQty ? getActiveTierIndex(qty) : -1;
  const cleanPrice = validQty ? calcChairCleanPrice(qty) : null;
  const waterPrice = validQty && formData.chairWaterproofing ? calcChairWaterproofPrice(qty) : null;
  const waterRate = validQty ? getWaterproofRate(qty) : null;
  const sob = validQty && qty > 10;

  const totalPrice = cleanPrice !== null && (!formData.chairWaterproofing || waterPrice !== null)
    ? (cleanPrice ?? 0) + (waterPrice ?? 0)
    : null;

  return (
    <div className="flex flex-col gap-2.5 overflow-hidden items-center w-full">

      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
      <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">
        Detalhes das Cadeiras
      </h2>

      {/* 2×2 cleaning price tier cards */}
      <div className="w-full max-w-sm mx-auto">
        <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest text-center mb-1.5">
          Limpeza + Higienização por cadeira
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {CLEAN_TIERS.map((tier, idx) => {
            const isActive = activeTierIdx === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-2 rounded-xl border-2 text-center transition-all duration-250",
                  isActive
                    ? "border-gold bg-gold/[0.10] shadow-[0_0_14px_rgba(212,175,55,0.25)] scale-[1.02]"
                    : "border-white/[0.08] bg-white/[0.03]"
                )}
              >
                <span className={cn("text-[9px] font-black uppercase tracking-wide leading-none mb-0.5", isActive ? "text-gold/90" : "text-white/30")}>
                  {tier.label}
                </span>
                <span className={cn("text-[8px] leading-none mb-1", isActive ? "text-white/45" : "text-white/15")}>
                  {tier.sublabel}
                </span>
                {tier.rate !== null ? (
                  <div className="flex items-end gap-0.5 leading-none">
                    <span className={cn("font-playfair text-xl font-bold tabular-nums leading-none", isActive ? "text-gold" : "text-white/35")}>
                      {fmtRate(tier.rate)}
                    </span>
                    <span className={cn("text-[9px] font-semibold pb-0.5", isActive ? "text-gold/55" : "text-white/20")}>/un.</span>
                  </div>
                ) : (
                  <span className={cn("font-playfair text-sm font-bold", isActive ? "text-gold" : "text-white/30")}>Orçamento</span>
                )}
                {isActive && (
                  <span className="mt-0.5 text-[7px] font-black uppercase tracking-widest text-gold/65 bg-gold/10 px-1.5 py-0.5 rounded-full leading-none">ativo</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quantity input */}
      <div className="w-full max-w-sm mx-auto">
        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider text-center mb-1">
          Quantas cadeiras deseja higienizar?
        </label>
        <div className="relative">
          <Input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="Ex: 5..."
            value={formData.chairQuantity}
            onChange={(e) => onUpdate({ chairQuantity: e.target.value, chairType: 'bulk_full' })}
            className={cn(
              "text-lg font-bold bg-white/[0.07] text-white placeholder:text-white/20 h-11 pr-16 rounded-xl border-2 transition-all duration-300",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              validQty ? "border-gold shadow-[0_0_12px_rgba(212,175,55,0.16)]" : "border-gold/40 animate-pulse-border"
            )}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gold/45 pointer-events-none">
            cadeiras
          </span>
        </div>
      </div>

      {/* Waterproofing upsell toggle */}
      {validQty && !sob && (
        <button
          onClick={() => onUpdate({ chairWaterproofing: !formData.chairWaterproofing })}
          className={cn(
            "relative w-full max-w-sm mx-auto rounded-xl border-2 px-3.5 py-2.5 text-left transition-all duration-300 touch-manipulation active:scale-[0.99]",
            formData.chairWaterproofing
              ? "border-gold bg-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.22)]"
              : "border-white/[0.12] bg-white/[0.03] hover:border-gold/40"
          )}
        >
          {/* RECOMENDADO badge */}
          <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-md">
            RECOMENDADO
          </span>

          <div className="flex items-center gap-3">
            <Shield className={cn("w-5 h-5 flex-shrink-0", formData.chairWaterproofing ? "text-gold" : "text-white/30")} />
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-bold leading-snug", formData.chairWaterproofing ? "text-white" : "text-white/75")}>
                Proteger contra manchas e líquidos?
              </p>
              <p className={cn("text-[10px] mt-0.5", formData.chairWaterproofing ? "text-white/50" : "text-white/30")}>
                Impermeabilização · {waterRate !== null ? `+${fmtRate(waterRate)}/un.` : 'Sob orçamento'}
              </p>
            </div>
            {/* Toggle visual */}
            <div className={cn(
              "w-10 h-5.5 rounded-full border-2 flex items-center transition-all duration-300 flex-shrink-0 px-0.5",
              formData.chairWaterproofing ? "border-gold bg-gold/20" : "border-white/20 bg-white/[0.05]"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full transition-all duration-300",
                formData.chairWaterproofing ? "bg-gold translate-x-[18px]" : "bg-white/30 translate-x-0"
              )} />
            </div>
          </div>
        </button>
      )}

      {/* Live result / receipt */}
      {validQty && (
        <div className={cn(
          "w-full max-w-sm mx-auto rounded-xl border-2 px-3.5 py-2.5 transition-all duration-300",
          totalPrice !== null
            ? "bg-kyro-green border-gold shadow-[0_0_14px_rgba(212,175,55,0.14)]"
            : "bg-kyro-green border-white/15"
        )}>
          {!sob && cleanPrice !== null ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-white/40 font-semibold">Limpeza ({qty} × {fmtRate(CLEAN_TIERS[activeTierIdx].rate!)})</span>
                <span className="text-sm font-bold text-white/70 tabular-nums">{fmtPrice(cleanPrice)}</span>
              </div>
              {formData.chairWaterproofing && waterPrice !== null && waterRate !== null && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-white/40 font-semibold">Impermeab. ({qty} × {fmtRate(waterRate)})</span>
                  <span className="text-sm font-bold text-white/70 tabular-nums">{fmtPrice(waterPrice)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.07]">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Total estimado</span>
                <div className="text-right">
                  <span className="font-playfair text-xl font-bold text-gold tabular-nums block leading-none">
                    {fmtPrice(totalPrice!)}
                  </span>
                  <span className="text-[8px] text-white/20 uppercase tracking-wide leading-none">IVA incl.</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-white/45 uppercase tracking-wider text-center py-0.5">
              <Mail className="w-3.5 h-3.5 inline mr-1" />+10 cadeiras — orçamento personalizado
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizStep2Chairs;
