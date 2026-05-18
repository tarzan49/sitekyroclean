import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { QuizFormData } from './QuizTypes';

interface QuizStep2CarpetProps {
  formData: QuizFormData;
  onUpdate: (updates: Partial<QuizFormData>) => void;
}

const CARPET_TIERS = [
  { label: 'Até 5 m²',   sublabel: 'Pequenos', rate: 10,   max: 5 },
  { label: '5 – 10 m²',  sublabel: 'Médios',   rate: 8,    max: 10 },
  { label: '10 – 15 m²', sublabel: 'Grandes',  rate: 7,    max: 15 },
  { label: '+15 m²',     sublabel: 'Extra',    rate: null, max: Infinity },
];

function getActiveTierIndex(area: number): number {
  if (area <= 5)  return 0;
  if (area <= 10) return 1;
  if (area <= 15) return 2;
  return 3;
}

function calcCarpetPrice(area: number): number | null {
  if (area <= 0)  return null;
  if (area <= 5)  return area * 10;
  if (area <= 10) return Math.max(5 * 10, area * 8);   // nunca inferior ao máx do escalão anterior
  if (area <= 15) return Math.max(10 * 8, area * 7);   // nunca inferior ao máx do escalão anterior
  return null;
}

const QuizStep2Carpet = ({ formData, onUpdate }: QuizStep2CarpetProps) => {
  const areaNum         = parseFloat(formData.carpetArea);
  const validArea       = !isNaN(areaNum) && areaNum > 0;
  const activeTierIdx   = validArea ? getActiveTierIndex(areaNum) : -1;
  const calculatedPrice = validArea ? calcCarpetPrice(areaNum) : null;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }}
      className="gap-3 py-1"
    >

      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
      <h2 className="font-playfair text-lg sm:text-xl font-bold text-white text-center w-full">
        Detalhes do Tapete
      </h2>

      {/* ── Price tier grid ── */}
      <div className="w-full max-w-[320px]">
        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest text-center mb-2">
          Tabela de preços por m² · IVA incl.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {CARPET_TIERS.map((tier, idx) => {
            const isActive = activeTierIdx === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 text-center transition-all duration-200",
                  isActive
                    ? "border-gold bg-gold/[0.12] shadow-[0_0_16px_rgba(212,175,55,0.26)] scale-[1.02]"
                    : "border-white/[0.10] bg-white/[0.03]"
                )}
              >
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wide leading-none mb-0.5",
                  isActive ? "text-gold" : "text-white"
                )}>
                  {tier.label}
                </span>
                <span className={cn(
                  "text-[9px] leading-none mb-1.5",
                  isActive ? "text-white/80" : "text-white/50"
                )}>
                  {tier.sublabel}
                </span>
                {tier.rate !== null ? (
                  <div className="flex items-end gap-0.5 leading-none">
                    <span className={cn(
                      "font-playfair text-2xl font-bold tabular-nums leading-none",
                      isActive ? "text-gold" : "text-white/70"
                    )}>
                      {tier.rate}€
                    </span>
                    <span className={cn(
                      "text-[9px] font-semibold pb-0.5",
                      isActive ? "text-gold/70" : "text-white/40"
                    )}>
                      /m²
                    </span>
                  </div>
                ) : (
                  <span className={cn(
                    "font-playfair text-sm font-bold",
                    isActive ? "text-gold" : "text-white/60"
                  )}>
                    Orçamento
                  </span>
                )}
                {isActive && (
                  <span className="mt-1 text-[7px] font-black uppercase tracking-widest text-gold/80 bg-gold/10 px-1.5 py-0.5 rounded-full leading-none">
                    ativo
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Area input ── */}
      <div className="w-full max-w-[320px]">
        <label className="block text-[10px] font-bold text-white uppercase tracking-wider text-center mb-1.5">
          Área total de todos os tapetes (m²)
        </label>
        <div className="relative">
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="Soma total (ex: 12)..."
            value={formData.carpetArea}
            onChange={(e) => onUpdate({ carpetArea: e.target.value })}
            className={cn(
              "text-lg font-bold bg-white/[0.07] text-white placeholder:text-white/25 h-11 pr-12 rounded-xl border-2 transition-all duration-300",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              validArea
                ? "border-gold shadow-[0_0_12px_rgba(212,175,55,0.18)]"
                : "border-white/20"
            )}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gold/60 pointer-events-none">
            m²
          </span>
        </div>
        <p className="text-[10px] text-white/40 text-center mt-1 leading-snug">
          Se tiver vários tapetes, insira a soma total das áreas.
        </p>
      </div>

      {/* ── Real-time receipt ── */}
      {validArea && (
        <div className={cn(
          "w-full max-w-[320px] rounded-xl border-2 px-4 py-2.5 transition-all duration-300",
          calculatedPrice !== null
            ? "bg-kyro-green border-gold shadow-[0_0_14px_rgba(212,175,55,0.18)]"
            : "bg-kyro-green border-white/15"
        )}>
          {calculatedPrice !== null ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60 leading-none mb-0.5">
                  Estimativa
                </span>
                <span className="text-xs font-semibold text-white">
                  {areaNum} m² × {CARPET_TIERS[activeTierIdx].rate}€/m²
                </span>
              </div>
              <div className="text-right">
                <span className="font-playfair text-2xl font-bold text-gold tabular-nums block leading-none">
                  {Math.round(calculatedPrice * 100) / 100}€
                </span>
                <span className="text-[8px] text-white/30 uppercase tracking-wide leading-none">IVA incl.</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider text-center py-0.5">
              <Mail className="w-3.5 h-3.5 inline mr-1" />+15 m² — orçamento personalizado
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default QuizStep2Carpet;
