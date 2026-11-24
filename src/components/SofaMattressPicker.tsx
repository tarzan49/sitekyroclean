// Pack sofá + colchão, no formato dos packs aprovados (dono, 24 Nov): duas perguntas curtas
// (lugares do sofá, tamanho do colchão), três opções com o total final do bot (botQuote,
// deslocação incluída) e um botão de WhatsApp. Nunca preços escritos à mão.
import { useMemo, useState } from 'react';
import { Check, MessageCircle, Plus } from 'lucide-react';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import premiumSofa from '@/assets/picker-premium-sofa.webp';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';

const SEATS = [1, 2, 3, 4, 5, 6];
const MATTRESS = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King/Queen' }];
const afterOf = (cat: 'sofa' | 'colchao') => (BEFORE_AFTER_POOL[cat].find(p => p.kind === 'pair') as { after: string } | undefined)?.after ?? '';

type Opt = { id: string; name: string; note: string; sofa: string; mattress: string; photo: string; top?: boolean; wa: string };
const OPTIONS: Opt[] = [
  { id: 'protecao', name: 'Tudo protegido', note: 'Sofá com Premium + colchão anti-ácaros', sofa: 'clean+premium', mattress: 'clean+anti-acaros', photo: premiumSofa, top: true, wa: 'limpeza do sofá com impermeabilização Premium e limpeza do colchão com anti-ácaros' },
  { id: 'acaros', name: 'Limpeza + anti-ácaros', note: 'Os dois limpos, colchão desinfetado', sofa: 'clean', mattress: 'clean+anti-acaros', photo: afterOf('colchao'), wa: 'limpeza do sofá e limpeza do colchão com anti-ácaros' },
  { id: 'limpeza', name: 'Só limpeza', note: 'Limpeza profunda dos dois', sofa: 'clean', mattress: 'clean', photo: afterOf('sofa'), wa: 'limpeza do sofá e do colchão' },
];

export default function SofaMattressPicker({ city, source, onMore }: { city: string; source: string; onMore?: () => void }) {
  const [seats, setSeats] = useState(3);
  const [mattress, setMattress] = useState('casal');
  const [choice, setChoice] = useState('protecao');

  const totals = useMemo(() => Object.fromEntries(OPTIONS.map(o => {
    const sofa = seats === 6 ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment: o.sofa } : { kind: 'sofa', size: `${seats}-${seats === 1 ? 'lugar' : 'lugares'}`, treatment: o.sofa };
    const r = botQuote({ city, items: [sofa, { kind: 'mattress', size: mattress, treatment: o.mattress }] }) as { ok: boolean; quote?: boolean; total?: number | null };
    return [o.id, r.ok && !r.quote && typeof r.total === 'number' ? r.total : null];
  })) as Record<string, number | null>, [seats, mattress, city]);

  const chosen = OPTIONS.find(o => o.id === choice)!;
  const total = totals[choice];
  const mLabel = MATTRESS.find(m => m.id === mattress)!.label.toLowerCase();
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade do pack sofá e colchão (${chosen.wa}) para um sofá de ${seats} ${seats === 1 ? 'lugar' : 'lugares'} e um colchão ${mLabel}, em ${city}${total ? `, por ${formatEuro(total)}` : ''}.`;
  const chip = (active: boolean) => `flex min-h-[40px] items-center justify-center rounded-2xl border-2 font-semibold transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#1A1A1A]' : 'border-[#E5E0D3] bg-white text-[#555] hover:border-[#D4AF37]/50'}`;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      <div>
        <p className="mb-1.5 text-base font-semibold text-[#1A1A1A]">Quantos lugares tem o sofá?</p>
        <div className="grid grid-cols-6 gap-1.5 md:grid-cols-3 md:gap-2" role="radiogroup" aria-label="Lugares">
          {SEATS.map(n => <button key={n} type="button" role="radio" aria-checked={seats === n} onClick={() => setSeats(n)} className={`${chip(seats === n)} text-xl`}>{n}</button>)}
        </div>
        <p className="mb-1.5 mt-2 text-base font-semibold text-[#1A1A1A]">E o colchão?</p>
        <div className="grid grid-cols-3 gap-1.5 md:gap-2" role="radiogroup" aria-label="Tamanho do colchão">
          {MATTRESS.map(m => <button key={m.id} type="button" role="radio" aria-checked={mattress === m.id} onClick={() => setMattress(m.id)} className={`${chip(mattress === m.id)} text-sm`}>{m.label}</button>)}
        </div>
        {onMore && <button type="button" onClick={onMore} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-3 text-sm font-bold text-[#1A1A1A] hover:bg-[#D4AF37]/20 md:mt-3"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>}
      </div>

      <div>
        <div className="flex flex-col gap-2 pt-1.5 md:gap-3" role="radiogroup" aria-label="Opção">
          {OPTIONS.map(o => {
            const active = choice === o.id;
            const value = totals[o.id];
            return (
              <button key={o.id} type="button" role="radio" aria-checked={active} onClick={() => setChoice(o.id)}
                className={`relative flex min-h-[58px] items-stretch rounded-2xl border-2 text-left transition-all md:min-h-[84px] ${active ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
                {o.top && <span className="absolute -top-3 right-3 z-10 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Mais escolhido</span>}
                <img src={o.photo} alt="" loading="lazy" decoding="async" className="w-[76px] shrink-0 rounded-l-[14px] object-cover md:w-[100px]" />
                <span className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2">
                  <span className="block text-base font-bold leading-tight text-[#1A1A1A] sm:text-lg">{o.name}</span>
                  <span className="block text-[12px] leading-snug text-[#555] sm:text-[13px]">{o.note}</span>
                </span>
                <span className="flex items-center gap-2 pr-3">
                  <span className={`whitespace-nowrap text-lg font-bold sm:text-xl ${active ? 'text-[#1A1A1A]' : 'text-[#444]'}`}>{value === null ? <span className="text-xs text-[#D4AF37]">Sob orçamento</span> : formatEuro(value)}</span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-[#666] md:mt-3 md:text-sm">Preço final em {city}, deslocação incluída.</p>
        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-3 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] md:mt-5 md:min-h-14 sm:text-base">
          <MessageCircle className="h-5 w-5" /> Pedir este orçamento no WhatsApp
        </a>
      </div>
    </div>
  );
}
