// Sofás de pele (dono, 24 Nov): nunca impermeabilização. Duas opções com o total do bot (botQuote, deslocação
// incluída): "Renovado" = só limpeza; "Renovado + Pele" = limpeza + tratamento da pele (limpeza e hidratação,
// +40€, +60€ em 5 e 6 lugares, `leather: true`). Mesmo desenho do WaterproofPackPicker.
import { lazy, Suspense, useMemo, useState } from 'react';
import { cityPrep } from '@/data/serviceCatalog';
import { Check, MessageCircle, Plus } from 'lucide-react';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';
import SofaCounters, { sofaItems, sofaWhat, sofaTotal, type SofaCounts } from '@/components/SofaCounters';
import { choiceToItems } from '@/components/quiz/basketChoice';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));
const OPTIONS = [
  { id: 'pele', name: 'Renovado + Pele', note: 'Limpeza e hidratação da pele', leather: true, top: true, wa: 'limpeza com tratamento e hidratação da pele' },
  { id: 'limpeza', name: 'Renovado', note: 'Só a limpeza', leather: false, top: false, wa: 'só limpeza' },
];

export default function LeatherSofaPicker({ city, source, syntheticOnly = false }: { city: string; source: string; syntheticOnly?: boolean }) {
  // Pele sintética/PU: só a limpeza (sem tratamento da pele nem impermeabilização).
  const options = syntheticOnly ? OPTIONS.filter(o => !o.leather) : OPTIONS;
  // Sofás por tamanho, combináveis, com o total em pequeno (dono, 25 Nov).
  const [counts, setCounts] = useState<SofaCounts>({}) /* começa sem nada escolhido, como os packs (dono, 24 Nov) */;
  const [choice, setChoice] = useState(syntheticOnly ? 'limpeza' : 'pele');
  const [basket, setBasket] = useState(false);
  const totals = useMemo(() => Object.fromEntries(options.map(o => {
    if (!sofaTotal(counts)) return [o.id, null];
    const r = botQuote({ city, items: sofaItems(counts, 'clean', { leather: o.leather }) }) as { ok: boolean; quote?: boolean; total?: number | null };
    return [o.id, r.ok && !r.quote && typeof r.total === 'number' ? r.total : null];
  })) as Record<string, number | null>, [counts, city]);
  const chosen = options.find(o => o.id === choice)!;
  const total = totals[choice];
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade para ${sofaWhat(counts, 'sofá de pele', 'sofás de pele')} (${chosen.wa}), ${cityPrep(city)} ${city}${total ? `, por ${formatEuro(total)}` : ''}. Envio a fotografia do sofá.`;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      <div>
        <p className="mb-2 text-base font-semibold text-[#1A1A1A]">Quantos lugares tem o sofá?</p>
        <SofaCounters counts={counts} onChange={setCounts} />
        <button type="button" onClick={() => setBasket(true)} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-3 text-sm font-bold text-[#1A1A1A] hover:bg-[#D4AF37]/20 md:mt-3 md:min-h-12"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>
      </div>
      <div>
        <div className="flex flex-col gap-2.5 pt-1.5 md:gap-3" role="radiogroup" aria-label="Opção">
          {options.map(o => {
            const active = choice === o.id;
            const value = totals[o.id];
            return <button key={o.id} type="button" role="radio" aria-checked={active} onClick={() => setChoice(o.id)}
              className={`relative flex min-h-[58px] items-stretch rounded-2xl border-2 text-left transition-all md:min-h-[84px] ${active ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)]' : 'border-[#E5E0D3] bg-white'}`}>
              {o.top && <span className="absolute -top-3 left-3 z-10 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Mais escolhido</span>}
              <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2.5 text-left">
                <span className="block text-lg font-bold leading-tight text-[#1A1A1A]">{o.name}</span>
                <span className="block text-[12px] leading-snug text-[#555] sm:text-[13px]">{o.note}</span>
              </span>
              <span className="flex items-center gap-2 pr-3">
                <span className={`whitespace-nowrap text-lg font-bold sm:text-xl ${active ? 'text-[#1A1A1A]' : 'text-[#444]'}`}>{value === null ? <span className="text-xs text-[#D4AF37]">{!sofaTotal(counts) ? 'Escolha o tamanho' : 'Sob orçamento'}</span> : formatEuro(value)}</span>
                <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
              </span>
            </button>;
          })}
        </div>
        <p className="mt-2 text-xs text-[#666] md:mt-3 md:text-sm">Preço final com a deslocação incluída. {syntheticOnly ? 'Pele sintética: só limpeza.' : 'Na pele não fazemos impermeabilização.'}</p>
        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#25D366] px-3 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] md:mt-5 md:min-h-14 sm:text-base">
          <MessageCircle className="h-5 w-5" /> Pedir este orçamento no WhatsApp
        </a>
      </div>
      {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(false)} initialCity={city} initialItems={choiceToItems({ kind: 'sofa', size: '3-lugares', qty: 1, extra: 'none', sofas: Object.entries(counts).filter(([, n]) => n > 0).map(([size, qty]) => ({ size, qty })) })} /></Suspense>}
    </div>
  );
}
