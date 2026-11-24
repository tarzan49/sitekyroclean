// Impermeabilização sozinha (dono, 24 Nov: o site todo no modelo novo). Uma pergunta (sofá: lugares; cadeiras:
// quantas), Premium / Essencial com o total do bot (botQuote, deslocação incluída), e a sugestão de juntar a
// limpeza (o pack). Só tecido: nunca pele. Mesmo desenho do WaterproofPackPicker.
import { lazy, Suspense, useMemo, useState } from 'react';
import { cityPrep } from '@/data/serviceCatalog';
import { Check, MessageCircle, Minus, Plus } from 'lucide-react';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));
type Kind = 'sofa' | 'chairs';
// Preço exposto acaba sempre em 9, arredondado para cima (dono, 24 Nov: "Sim, acaba em 9"; 155€ → 159€).
const up9 = (n: number) => Math.ceil((n + 1) / 10) * 10 - 1;
const OPTIONS = [
  { id: 'premium', name: 'Premium', note: 'Anti-manchas e anti-líquidos, até 10 anos', top: true },
  { id: 'essencial', name: 'Essencial', note: 'A mesma proteção, mais económica: 1 a 2 anos', top: false },
];

export default function ImperPricePicker({ city, source, initialKind = 'sofa' }: { city: string; source: string; initialKind?: Kind }) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [seats, setSeats] = useState(3);
  const [count, setCount] = useState(1); // quantos sofás iguais (dono, 25 Nov)
  const [qty, setQty] = useState(6);
  const [choice, setChoice] = useState('premium');
  const [basket, setBasket] = useState(false);
  const item = (treatment: string) => kind === 'chairs' ? { kind: 'chairs', qty, treatment }
    : seats === 6 ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment, qty: count } : { kind: 'sofa', size: seats === 1 ? '1-lugar' : `${Math.min(seats, 5)}-lugares`, treatment, qty: count };
  const totals = useMemo(() => Object.fromEntries(OPTIONS.map(o => {
    const r = botQuote({ city, items: [item(o.id)] }) as { ok: boolean; quote?: boolean; total?: number | null };
    return [o.id, r.ok && !r.quote && typeof r.total === 'number' ? up9(r.total) : null];
  })) as Record<string, number | null>, [kind, seats, qty, count, city]);
  const total = totals[choice];
  const what = kind === 'chairs' ? `${qty} ${qty === 1 ? 'cadeira' : 'cadeiras'}` : `${count > 1 ? `${count} sofás` : 'um sofá'} de ${seats} ${seats === 1 ? 'lugar' : 'lugares'}`;
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade da impermeabilização ${choice === 'premium' ? 'Premium' : 'Essencial'} para ${what}, ${cityPrep(city)} ${city}${total ? `, por ${formatEuro(total)}` : ''}. Envio a fotografia.`;
  const chip = (active: boolean) => `flex min-h-[44px] items-center justify-center rounded-2xl border-2 font-semibold transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#1A1A1A]' : 'border-[#E5E0D3] bg-white text-[#555]'}`;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      <div>
        <div className="mb-2 grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Peça">
          {(['sofa', 'chairs'] as const).map(k => <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`${chip(kind === k)} text-sm`}>{k === 'sofa' ? 'Sofá' : 'Cadeiras'}</button>)}
        </div>
        {kind === 'sofa' ? <>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-base font-semibold text-[#1A1A1A]">Quantos lugares tem o sofá?</p>
            <div className="flex shrink-0 items-center gap-1.5" aria-label="Quantos sofás">
              <button type="button" aria-label="Menos um sofá" onClick={() => setCount(c => Math.max(1, c - 1))} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F3F0E7]"><Minus className="h-3.5 w-3.5" /></button>
              <span className="min-w-[1.5rem] text-center text-sm font-semibold">×{count}</span>
              <button type="button" aria-label="Mais um sofá" onClick={() => setCount(c => Math.min(5, c + 1))} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F3F0E7]"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Lugares">
            {[1, 2, 3, 4, 5, 6].map(n => <button key={n} type="button" role="radio" aria-checked={seats === n} onClick={() => setSeats(n)} className={`${chip(seats === n)} text-xl`}>{n}</button>)}
          </div>
        </> : <div className="flex items-center justify-between rounded-2xl border-2 border-[#E5E0D3] bg-white p-1.5">
          <span className="pl-2 text-sm font-semibold text-[#555]">Quantas cadeiras?</span>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Menos uma cadeira" onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7]"><Minus className="h-4 w-4" /></button>
            <span className="w-8 text-center text-xl font-semibold">{qty}</span>
            <button type="button" aria-label="Mais uma cadeira" onClick={() => setQty(q => Math.min(20, q + 1))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7]"><Plus className="h-4 w-4" /></button>
          </div>
        </div>}
        <button type="button" onClick={() => setBasket(true)} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-3 text-sm font-bold text-[#1A1A1A] hover:bg-[#D4AF37]/20"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>
      </div>
      <div>
        <div className="flex flex-col gap-2.5 pt-1.5" role="radiogroup" aria-label="Opção">
          {OPTIONS.map(o => {
            const active = choice === o.id;
            const value = totals[o.id];
            return <button key={o.id} type="button" role="radio" aria-checked={active} onClick={() => setChoice(o.id)}
              className={`relative flex min-h-[58px] items-stretch rounded-2xl border-2 text-left transition-all ${active ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)]' : 'border-[#E5E0D3] bg-white'}`}>
              {o.top && <span className="absolute -top-3 left-3 z-10 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Mais escolhido</span>}
              <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2.5 text-left">
                <span className="block text-lg font-bold leading-tight text-[#1A1A1A]">{o.name}</span>
                <span className="block text-[12px] leading-snug text-[#555]">{o.note}</span>
              </span>
              <span className="flex items-center gap-2 pr-3">
                <span className={`whitespace-nowrap text-lg font-bold ${active ? 'text-[#1A1A1A]' : 'text-[#444]'}`}>{value === null ? <span className="text-xs text-[#D4AF37]">Sob orçamento</span> : formatEuro(value)}</span>
                <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
              </span>
            </button>;
          })}
        </div>
        <p className="mt-2 text-xs text-[#666]">Preço final {cityPrep(city)} {city}, deslocação incluída. Só em tecido: na pele não fazemos impermeabilização.</p>
        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#25D366] px-3 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)]">
          <MessageCircle className="h-5 w-5" /> Pedir este orçamento no WhatsApp
        </a>
      </div>
      {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(false)} initialCity={city} /></Suspense>}
    </div>
  );
}
