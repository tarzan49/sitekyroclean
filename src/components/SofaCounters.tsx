// Sofás por tamanho nos widgets de preço (dono, 25 Nov: "em vez de uma bolinha de certo, colocas um mais e a
// pessoa pode escolher os que quiser... tem que haver um total em mini escrito"). Cada tamanho é um botão "+":
// cada toque junta um sofá desse tamanho; o "−" tira. Por baixo, o total em pequeno. Um só componente para
// todos os widgets (packs, impermeabilização, anti-ácaros, pele).
import { Minus, Plus } from 'lucide-react';

export const SOFA_SIZE_IDS = ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares', '6-lugares'] as const;
export type SofaCounts = Record<string, number>;

const seatsOf = (id: string) => Number(id.split('-')[0]);
const seatsLabel = (id: string) => `${seatsOf(id)} ${seatsOf(id) === 1 ? 'lugar' : 'lugares'}`;
const chosen = (counts: SofaCounts) => SOFA_SIZE_IDS.filter(id => (counts[id] ?? 0) > 0).map(id => ({ id, n: counts[id] }));

/** Os sofás escolhidos como itens do botQuote (6 lugares = 5-lugares com seats 6, como o bot). */
export function sofaItems(counts: SofaCounts, treatment: string, extra: Record<string, unknown> = {}) {
  return chosen(counts).map(({ id, n }) => id === '6-lugares'
    ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment, qty: n, ...extra }
    : { kind: 'sofa', size: id, treatment, qty: n, ...extra });
}

/** "um sofá de 3 lugares e 2 sofás de 2 lugares", para a mensagem de WhatsApp. */
export function sofaWhat(counts: SofaCounts, noun = 'sofá', nounPlural = 'sofás'): string {
  const parts = chosen(counts).map(({ id, n }) => `${n === 1 ? `um ${noun}` : `${n} ${nounPlural}`} de ${seatsLabel(id)}`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}` : parts[0] ?? '';
}

export const sofaTotal = (counts: SofaCounts) => chosen(counts).reduce((a, x) => a + x.n, 0);

/** O total em pequeno: "2 sofás: 1 de 3 lugares e 1 de 2 lugares". */
function summary(counts: SofaCounts): string {
  const list = chosen(counts);
  const total = sofaTotal(counts);
  if (!total) return 'Toque no tamanho do sofá para o juntar.';
  if (list.length === 1 && total === 1) return `1 sofá de ${seatsLabel(list[0].id)}`;
  const parts = list.map(({ id, n }) => `${n} de ${seatsLabel(id)}`);
  return `${total} sofás: ${parts.length > 1 ? `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}` : parts[0]}`;
}

export default function SofaCounters({ counts, onChange }: { counts: SofaCounts; onChange: (next: SofaCounts) => void }) {
  const bump = (id: string, d: number) => onChange({ ...counts, [id]: Math.max(0, Math.min(9, (counts[id] ?? 0) + d)) });
  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5 md:gap-2" aria-label="Sofás por tamanho">
        {SOFA_SIZE_IDS.map(id => {
          const n = counts[id] ?? 0;
          return n === 0 ? (
            <button key={id} type="button" onClick={() => bump(id, 1)} aria-label={`Juntar um sofá de ${seatsLabel(id)}`}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[#E5E0D3] bg-white text-[#555] transition-all md:h-12">
              <span className="whitespace-nowrap text-sm font-semibold">{seatsLabel(id)}</span>
              <Plus className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={3} aria-hidden />
            </button>
          ) : (
            <div key={id} className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 md:h-12">
              <span className="whitespace-nowrap text-[11px] font-semibold leading-none text-[#555]">{seatsLabel(id)}</span>
              <span className="mt-0.5 flex items-center gap-1">
                <button type="button" onClick={() => bump(id, -1)} aria-label={`Tirar um sofá de ${seatsLabel(id)}`} className="grid h-6 min-h-0 w-6 min-w-0 place-items-center rounded-md bg-white/80 text-[#1A1A1A]"><Minus className="h-3 w-3" /></button>
                <span className="w-4 text-center text-sm font-bold leading-none text-[#1A1A1A]">{n}</span>
                <button type="button" onClick={() => bump(id, 1)} aria-label={`Juntar mais um sofá de ${seatsLabel(id)}`} className="grid h-6 min-h-0 w-6 min-w-0 place-items-center rounded-md bg-white/80 text-[#1A1A1A]"><Plus className="h-3 w-3" /></button>
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-[#666]" aria-live="polite">{summary(counts)}</p>
    </div>
  );
}
