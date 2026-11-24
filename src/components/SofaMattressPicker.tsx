// Pack sofá + colchão (dono, 24 Nov): o cliente escolhe peça a peça, sem pacotes com nomes.
// Sofá: lugares + tratamento (só limpeza, Essencial, Premium). Colchão: tamanho + (só limpeza, anti-ácaros).
// Um só total, do motor do bot (botQuote), com a deslocação incluída. Nunca preços escritos à mão.
import { useMemo, useState } from 'react';
import { Check, MessageCircle, Plus } from 'lucide-react';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import premiumSofa from '@/assets/picker-premium-sofa.webp';
import essencialSofa from '@/assets/picker-essencial-sofa.webp';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';

const SEATS = [1, 2, 3, 4, 5, 6];
// Totais acabam sempre em 9, arredondados para cima (dono, 24 Nov: "acabaram-se os 4").
const up9 = (n: number) => Math.ceil((n + 1) / 10) * 10 - 1;
const MATTRESS = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King/Queen' }];
const pair = (cat: 'sofa' | 'colchao') => BEFORE_AFTER_POOL[cat].find(p => p.kind === 'pair') as { before: string; after: string } | undefined;

type T = { id: string; label: string; note: string; img?: string; wa: string };
const SOFA_T: T[] = [
  { id: 'clean', label: 'Só limpeza', note: 'Limpo a fundo', img: pair('sofa')?.after, wa: 'só limpeza' },
  { id: 'clean+essencial', label: 'Essencial', note: 'Proteção 1 a 2 anos', img: essencialSofa, wa: 'limpeza + impermeabilização Essencial' },
  { id: 'clean+premium', label: 'Premium', note: 'Proteção até 10 anos', img: premiumSofa, wa: 'limpeza + impermeabilização Premium' },
];
const MATTRESS_T: T[] = [
  { id: 'clean', label: 'Só limpeza', note: 'Limpo a fundo', img: pair('colchao')?.after, wa: 'só limpeza' },
  { id: 'clean+anti-acaros', label: 'Anti-ácaros', note: 'Limpeza + desinfeção', img: pair('colchao')?.before, wa: 'limpeza + anti-ácaros' },
];

function Choice({ items, value, onChange, label }: { items: T[]; value: string; onChange: (v: string) => void; label: string }) {
  return <div className={`grid gap-1.5 ${items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} role="radiogroup" aria-label={label}>
    {items.map(t => {
      const active = value === t.id;
      return <button key={t.id} type="button" role="radio" aria-checked={active} onClick={() => onChange(t.id)}
        className={`relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all ${active ? 'border-[#D4AF37] bg-[#FFFBEF] shadow-[0_6px_18px_-8px_rgba(212,175,55,0.6)]' : 'border-[#E5E0D3] bg-white'}`}>
        <img src={t.img} alt="" loading="lazy" decoding="async" className="h-[52px] w-full object-cover" />
        <span className="px-2 py-1.5">
          <span className="block text-[13px] font-bold leading-tight text-[#1A1A1A]">{t.label}</span>
          <span className="block text-[11px] leading-tight text-[#555]">{t.note}</span>
        </span>
        {active && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#D4AF37] text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>}
      </button>;
    })}
  </div>;
}

export default function SofaMattressPicker({ city, source, onMore }: { city: string; source: string; onMore?: () => void }) {
  const [seats, setSeats] = useState(3);
  const [sofaT, setSofaT] = useState('clean+premium');
  const [mattress, setMattress] = useState('casal');
  const [mattT, setMattT] = useState('clean+anti-acaros');

  const total = useMemo(() => {
    const sofa = seats === 6 ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment: sofaT } : { kind: 'sofa', size: `${seats}-${seats === 1 ? 'lugar' : 'lugares'}`, treatment: sofaT };
    const r = botQuote({ city, items: [sofa, { kind: 'mattress', size: mattress, treatment: mattT }] }) as { ok: boolean; quote?: boolean; total?: number | null };
    return r.ok && !r.quote && typeof r.total === 'number' ? up9(r.total) : null;
  }, [seats, sofaT, mattress, mattT, city]);

  // Preço cortado = o mesmo pedido feito em separado (cada serviço com a sua deslocação), pelo bot.
  // É a única comparação permitida: pack contra separado (dono, 19 Nov).
  const separate = useMemo(() => {
    const one = (item: Record<string, unknown>) => { const r = botQuote({ city, items: [item] }) as { ok: boolean; quote?: boolean; total?: number | null }; return r.ok && !r.quote && typeof r.total === 'number' ? r.total : null; };
    const sofaBase = seats === 6 ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto' } : { kind: 'sofa', size: `${seats}-${seats === 1 ? 'lugar' : 'lugares'}` };
    const parts = sofaT === 'clean' ? [one({ ...sofaBase, treatment: 'clean' })] : [one({ ...sofaBase, treatment: 'clean' }), one({ ...sofaBase, treatment: sofaT.replace('clean+', '') })];
    parts.push(one({ kind: 'mattress', size: mattress, treatment: mattT }));
    return parts.every(v => v !== null) ? (parts as number[]).reduce((a, b) => a + b, 0) : null;
  }, [seats, sofaT, mattress, mattT, city]);

  // Preço cortado acaba sempre em 9, arredondado para cima (dono, 24 Nov).
  const crossed = total !== null && separate !== null && separate > total ? up9(separate) : null;

  const mLabel = MATTRESS.find(m => m.id === mattress)!.label.toLowerCase();
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade do pack sofá e colchão em ${city}: sofá de ${seats} ${seats === 1 ? 'lugar' : 'lugares'} (${SOFA_T.find(t => t.id === sofaT)!.wa}) e colchão ${mLabel} (${MATTRESS_T.find(t => t.id === mattT)!.wa})${total ? `, por ${formatEuro(total)}` : ''}.`;
  const chip = (active: boolean) => `flex min-h-[36px] items-center justify-center rounded-xl border-2 font-semibold transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#1A1A1A]' : 'border-[#E5E0D3] bg-white text-[#555]'}`;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-3 md:grid-cols-2 md:gap-8">
      <div>
        <p className="mb-1.5 text-base font-semibold text-[#1A1A1A]">O sofá: quantos lugares?</p>
        <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Lugares">
          {SEATS.map(n => <button key={n} type="button" role="radio" aria-checked={seats === n} onClick={() => setSeats(n)} className={`${chip(seats === n)} text-lg`}>{n}</button>)}
        </div>
        <div className="mt-1.5"><Choice items={SOFA_T} value={sofaT} onChange={setSofaT} label="Tratamento do sofá" /></div>
      </div>
      <div>
        <p className="mb-1.5 text-base font-semibold text-[#1A1A1A]">O colchão: que tamanho?</p>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Tamanho do colchão">
          {MATTRESS.map(m => <button key={m.id} type="button" role="radio" aria-checked={mattress === m.id} onClick={() => setMattress(m.id)} className={`${chip(mattress === m.id)} text-sm`}>{m.label}</button>)}
        </div>
        <div className="mt-1.5"><Choice items={MATTRESS_T} value={mattT} onChange={setMattT} label="Tratamento do colchão" /></div>
      </div>
      <div className="md:col-span-2">
        <div className="flex items-end justify-between border-t border-[#E5E0D3] pt-2">
          <span className="text-sm text-[#555]">Total em {city}<br />
            {crossed !== null ? <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/60 bg-gradient-to-r from-[#F7E7B4] via-[#E9CD72] to-[#D4AF37] px-2.5 py-0.5 text-[12px] font-bold tracking-wide text-[#3A2E08] shadow-[0_4px_12px_-4px_rgba(212,175,55,0.7)]">Poupa {formatEuro(crossed - total!)}</span> : <span className="text-xs">deslocação incluída</span>}
          </span>
          <span className="flex items-baseline gap-2">{crossed !== null && <span className="text-xl font-semibold text-[#777] line-through decoration-[#D4AF37] decoration-2">{formatEuro(crossed)}</span>}<span className="text-3xl font-bold text-[#1A1A1A]">{total === null ? <span className="text-sm text-[#D4AF37]">Sob orçamento</span> : formatEuro(total)}</span></span>
        </div>
        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#16833e] px-3 py-3 text-base font-semibold text-white hover:bg-[#116b32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]">
          <MessageCircle className="h-5 w-5 shrink-0" />Pedir este orçamento no WhatsApp
        </a>
        {onMore && <button type="button" onClick={onMore} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 text-sm font-bold text-[#1A1A1A]"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>}
      </div>
    </div>
  );
}
