import type { CarpetItem } from '@/components/quiz/QuizTypes';
import { carpetAddItem, carpetRemoveItem, carpetUpdateItem, carpetItemArea, carpetTotalArea } from '@/components/quiz/quizHelpers';

interface Props {
  carpetItems: CarpetItem[];
  carpetKind?: 'tapete' | 'alcatifa';
  setCarpetItems: React.Dispatch<React.SetStateAction<CarpetItem[]>>;
}

// Extraído de QuizStepConfig.tsx (2026-09-08, thinning do ficheiro monolítico
// de 417 linhas que misturava sofá/colchão/tapete/cadeiras no mesmo
// componente).
//
// Simulador (2026-09-06): sem estimativa de preço nenhuma — qualquer tapete é
// sempre sob orçamento. O cliente mede largura × comprimento por tapete, em
// vez de somar tudo numa única "área total", e pode adicionar quantos quiser
// (padrão "adicionar paragem" do Uber/Google Maps).
const QuizStepConfigCarpet = ({ carpetItems, setCarpetItems, carpetKind = 'tapete' }: Props) => {
  const hasMultiple = carpetItems.length > 1;
  const totalArea = carpetTotalArea(carpetItems);
  const hasAnyValid = totalArea > 0;

  return (
    <div className="flex flex-col gap-3 overflow-hidden items-center w-full">
      <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-0.5 text-center w-full">O QUE PRECISA?</p>
      <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center w-full">{carpetKind === 'alcatifa' ? 'Medidas da Alcatifa' : 'Detalhes do(s) Tapete(s)'}</h2>
      <p className="text-xs text-white/35 text-center leading-snug max-w-xs">
        Meça cada peça ou área e adicione quantas precisar. Sem preço fixo por m², cada peça é sempre orçamentada à parte.
      </p>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {carpetItems.some(item => carpetItemArea(item) === null) && <p className="text-xs text-white/65">Preencha as duas medidas de cada peça para continuar.</p>}
        {carpetItems.map((item, i) => {
          const area = carpetItemArea(item);
          return (
            <div key={item.id} className="rounded-sm border border-gold/15 bg-[#1a2a1a] p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">{carpetKind === 'alcatifa' ? 'Área' : 'Tapete'} {i + 1}</span>
                {carpetItems.length > 1 && (
                  <button
                    onClick={() => setCarpetItems(prev => carpetRemoveItem(prev, item.id))}
                    aria-label="Remover tapete"
                    className="w-5 h-5 rounded-sm flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors touch-manipulation"
                  >×</button>
                )}
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                    value={item.largura}
                    onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'largura', e.target.value))}
                    className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/25 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-center uppercase tracking-wide text-white/30">Largura (m)</span>
                </div>
                <span className="text-white/25 text-sm pb-4">×</span>
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
                    value={item.comprimento}
                    onChange={(e) => setCarpetItems(prev => carpetUpdateItem(prev, item.id, 'comprimento', e.target.value))}
                    className="w-full h-11 text-center text-base font-bold bg-white/[0.05] text-white placeholder:text-white/25 rounded-sm border-2 border-white/15 focus:border-gold focus:outline-none transition-colors"
                  />
                  <span className="text-[9px] text-center uppercase tracking-wide text-white/30">Comprimento (m)</span>
                </div>
              </div>
              <div className="text-right pt-1 border-t border-white/[0.06]">
                <span className="text-[10px] text-white/30">Área </span>
                <span className="text-sm font-bold text-gold tabular-nums">{area !== null ? `${area % 1 === 0 ? area : area.toFixed(2).replace('.', ',')} m²` : '0 m²'}</span>
              </div>
            </div>
          );
        })}
        <button
          onClick={() => setCarpetItems(prev => carpetAddItem(prev))}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border-2 border-dashed border-gold/30 text-gold/80 text-sm font-bold hover:border-gold/60 hover:bg-gold/[0.04] transition-all touch-manipulation"
        >
          <span className="w-5 h-5 rounded-full border border-gold/50 flex items-center justify-center text-xs leading-none">+</span>
          Adicionar outro tapete
        </button>
      </div>
      {hasMultiple && hasAnyValid && (
        <p className="text-xs text-white/35 text-center">
          Área total: <span className="text-white/60 font-semibold">{totalArea % 1 === 0 ? totalArea : totalArea.toFixed(2).replace('.', ',')} m²</span>
        </p>
      )}
      <p className="text-xs text-white/30 text-center leading-snug">
        O serviço é sempre sob orçamento. Confirmamos o preço certo na visita, sem compromisso.
      </p>
    </div>
  );
};

export default QuizStepConfigCarpet;
