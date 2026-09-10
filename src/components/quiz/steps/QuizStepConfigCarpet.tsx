import { useId } from 'react';
import { Plus, Ruler, Trash2 } from 'lucide-react';
import type { CarpetItem } from '@/components/quiz/QuizTypes';
import { carpetAddItem, carpetRemoveItem, carpetUpdateItem, carpetItemArea, carpetTotalArea } from '@/components/quiz/quizHelpers';

interface Props {
  carpetItems: CarpetItem[];
  setCarpetItems: React.Dispatch<React.SetStateAction<CarpetItem[]>>;
}

const formatArea = (area: number) => area.toLocaleString('pt-PT', { maximumFractionDigits: 2 });

const QuizStepConfigCarpet = ({ carpetItems, setCarpetItems }: Props) => {
  const fieldPrefix = useId();
  const totalArea = carpetTotalArea(carpetItems);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="space-y-1.5 text-center">
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">Os seus tapetes</h2>
      </div>

      <details className="w-full max-w-sm rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] px-3">
        <summary className="min-h-11 cursor-pointer py-3 text-left text-xs font-medium text-[#E8D58F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg">Medidas em metros <span className="font-normal text-white/70">· Como medir?</span></summary>
        <div className="flex items-center gap-3 pb-3">
          <svg viewBox="0 0 112 94" className="w-16 shrink-0 text-[#D4AF37]" role="img" aria-label="Meça a largura de um lado ao outro e o comprimento de cima a baixo do tapete">
            <path d="M12 16v-5m0 2h66m0-2v5M88 24h5m-2 0v58m-3 0h5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="12" y="24" width="66" height="58" rx="4" fill="currentColor" fillOpacity=".12" stroke="currentColor" />
            <rect x="19" y="31" width="52" height="44" rx="2" fill="none" stroke="currentColor" strokeOpacity=".45" />
            <path d="m45 40 13 13-13 13-13-13Z M18 21v-4m9 4v-4m9 4v-4m9 4v-4m9 4v-4m9 4v-4m9 4v-4M18 89v-4m9 4v-4m9 4v-4m9 4v-4m9 4v-4m9 4v-4m9 4v-4" fill="none" stroke="currentColor" strokeOpacity=".65" />
          </svg>
          <div className="min-w-0 text-left">
            <p className="flex items-center gap-2 text-sm font-semibold text-white"><Ruler size={16} aria-hidden="true" className="text-[#D4AF37]" />Como medir</p>
            <p className="mt-1 text-xs leading-relaxed text-white/70">Meça a largura e o comprimento em metros.</p>
            <p className="mt-1 text-xs text-[#E8D58F]">Exemplo: 200 cm = 2 m</p>
          </div>
        </div>
      </details>

      <div className="flex w-full max-w-sm flex-col gap-2">
        {carpetItems.map((item, i) => {
          const area = carpetItemArea(item);
          return (
            <fieldset key={item.id} className="min-w-0 rounded-xl border border-white/15 bg-[#183026] p-3 shadow-sm">
              <legend className="sr-only">Medidas do tapete {i + 1}</legend>
              <div className="mb-2 flex min-h-6 items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-white">Tapete {i + 1}</span>
                  <span className="text-xs text-[#E8D58F] tabular-nums" aria-live="polite">{area !== null ? `${formatArea(area)} m²` : ''}</span>
                </div>
                {carpetItems.length > 1 && (
                  <button type="button" onClick={() => setCarpetItems(prev => carpetRemoveItem(prev, item.id))} aria-label={`Remover tapete ${i + 1}`} className="-my-2 flex h-11 w-11 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] touch-manipulation">
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['largura', 'comprimento'] as const).map(field => (
                  <div key={field} className="min-w-0 text-left">
                    <label htmlFor={`${fieldPrefix}-${item.id}-${field}`} className="mb-1.5 block text-xs font-medium text-white/80">{field === 'largura' ? 'Largura' : 'Comprimento'}</label>
                    <div className="relative">
                      <input id={`${fieldPrefix}-${item.id}-${field}`} type="number" inputMode="decimal" min="0" step="0.01" placeholder={field === 'largura' ? 'Ex.: 2' : 'Ex.: 3'} value={item[field]} onChange={e => setCarpetItems(prev => carpetUpdateItem(prev, item.id, field, e.target.value))} aria-describedby={`${fieldPrefix}-units`} className="h-12 w-full min-w-0 rounded-xl border border-white/20 bg-[#0C2018] pl-3 pr-8 text-base font-semibold text-white placeholder:font-normal placeholder:text-white/45 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25 transition-colors" />
                      <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/60">m</span>
                    </div>
                  </div>
                ))}
              </div>

            </fieldset>
          );
        })}
        <span id={`${fieldPrefix}-units`} className="sr-only">Medidas em metros.</span>
        <button type="button" onClick={() => setCarpetItems(prev => carpetAddItem(prev))} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#D4AF37]/50 px-3 py-2.5 text-sm font-semibold text-[#E8D58F] transition-colors hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] touch-manipulation">
          <Plus size={18} aria-hidden="true" />Adicionar outro tapete
        </button>
        {carpetItems.length > 1 && totalArea > 0 && <p className="text-center text-xs text-white/70">Área total preenchida: <span className="font-semibold text-white">{formatArea(totalArea)} m²</span></p>}
      </div>


    </div>
  );
};

export default QuizStepConfigCarpet;
