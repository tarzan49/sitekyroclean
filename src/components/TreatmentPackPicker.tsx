// Escolha simples para os packs de limpeza + tratamento (anti-ácaros no colchão e no sofá,
// anti-odor no tapete). O mesmo formato do WaterproofPackPicker: passo 1 o tamanho, passo 2
// as opções com o total final do bot (botQuote), um botão. Sem símbolos nas opções (dono, 24 Nov).
import { lazy, Suspense, useMemo, useState } from 'react';
import { treatmentToItem } from '@/components/quiz/basketChoice';
import VisitGiftLine, { visitGiftFor } from '@/components/VisitGiftLine';
import type { BasketItem } from '@/components/quiz/VisitBasket';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));
import { Check, Minus, Plus, MessageCircle } from 'lucide-react';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';
import SofaCounters, { sofaItems, sofaWhat, sofaTotal, type SofaCounts } from '@/components/SofaCounters';
import { cityPrep } from '@/data/serviceCatalog';

export type TreatmentKind = 'sofa' | 'mattress' | 'rug';
const SOFA_SIZES = ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares', '6-lugares'];
const MATTRESS_SIZES = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King' }];

type Option = { id: 'treat' | 'clean'; title: string; note: string; top?: boolean };
// Anti-ácaros (produto Bactran): só o que a ficha diz; os ácaros saem com a extração.
const MITES: Option[] = [
  { id: 'treat', title: 'Limpeza + anti-ácaros', note: 'Com Bactran: bactérias, bolores e odores', top: true },
  { id: 'clean', title: 'Só limpeza', note: 'Extração a fundo, sem Bactran' },
];
// Anti-odor: só existe com a limpeza (dono, 18 Nov); 5€/m² (dono, 24 Nov).
const ODOR: Option[] = [
  { id: 'treat', title: 'Lavagem + anti-odor', note: 'Para cheiro de animais, urina ou humidade', top: true },
  { id: 'clean', title: 'Só lavagem', note: 'Lavagem a fundo em sua casa' },
];

export interface TreatmentChoice { kind: TreatmentKind; size: string; width: number; length: number; treat: boolean; qty?: number }
interface Props { kind: TreatmentKind; city: string; source: string; onMore?: (choice: TreatmentChoice) => void }

export default function TreatmentPackPicker({ kind, city, source, onMore }: Props) {
  const OPTIONS = kind === 'rug' ? ODOR : MITES;
  const [size, setSize] = useState(kind === 'mattress' ? 'casal' : '3-lugares');
  const [rugW, setRugW] = useState(2);
  const [rugL, setRugL] = useState(3);
  const [choice, setChoice] = useState<Option['id']>('treat');
  // Quantas peças iguais (dono, 25 Nov) e o cesto da visita quando a página não traz o seu ("em todas no site").
  // Sofás por tamanho, combináveis, com o total em pequeno (dono, 25 Nov).
  const [counts, setCounts] = useState<SofaCounts>({}) /* começa sem nada escolhido, como os packs (dono, 24 Nov) */;
  // Colchões: quantos de cada tamanho, cada um com o seu contador (dono, 25 Nov: "em cada tipo quantos colchões").
  const [mCounts, setMCounts] = useState<Record<string, number>>({ solteiro: 0, casal: 1, king: 0 });
  const bump = (id: string, d: number) => setMCounts(c => { const next = { ...c, [id]: Math.max(0, Math.min(9, (c[id] ?? 0) + d)) }; return Object.values(next).some(v => v > 0) ? next : c; });
  const mItems = (treatment: string) => MATTRESS_SIZES.filter(x => mCounts[x.id] > 0).map(x => ({ kind: 'mattress', size: x.id, treatment, qty: mCounts[x.id] }));
  const [basket, setBasket] = useState<BasketItem | null>(null);
  const more = (c: TreatmentChoice) => { const firstSize = kind === 'mattress' ? (MATTRESS_SIZES.find(x => mCounts[x.id] > 0)?.id ?? 'casal') : kind === 'sofa' ? (SOFA_SIZES.find(id => (counts[id] ?? 0) > 0) ?? '3-lugares') : c.size; const withQty = { ...c, size: firstSize, qty: kind === 'rug' ? 1 : kind === 'mattress' ? mCounts[firstSize] : (counts[firstSize] ?? 1) }; if (onMore) onMore(withQty); else setBasket(treatmentToItem(withQty)); };

  // Os mesmos totais que o bot dá no WhatsApp, com a deslocação da cidade.
  const totals = useMemo(() => Object.fromEntries(OPTIONS.map(o => {
    const treat = o.id === 'treat';
    if (kind === 'rug') {
      const r = botQuote({ city, items: [{ kind: 'rug', width: rugW, length: rugL, treatment: 'clean', odor: treat }] }) as { ok: boolean; rugEstimate?: { ok: boolean; homePrice?: number } };
      return [o.id, r.ok && r.rugEstimate?.ok && typeof r.rugEstimate.homePrice === 'number' ? r.rugEstimate.homePrice : null];
    }
    const treatment = treat ? 'clean+anti-acaros' : 'clean';
    const items = kind === 'mattress' ? mItems(treatment) : sofaItems(counts, treatment);
    const r = botQuote({ city, items }) as { ok: boolean; quote?: boolean; total?: number | null; visitGifts?: { withoutGift?: number | null } | null };
    // "Só limpeza" é mesmo só a limpeza: com várias peças o motor junta ofertas (escada A) ao total;
    // aqui usa-se o total sem a oferta, senão a opção sem tratamento já trazia o anti-ácaros (dono, 25 Nov).
    const plain = !treat && typeof r.visitGifts?.withoutGift === 'number' ? r.visitGifts.withoutGift : r.total;
    return [o.id, r.ok && !r.quote && typeof plain === 'number' ? plain : null];
  })) as Record<Option['id'], number | null>, [OPTIONS, kind, size, rugW, rugL, counts, mCounts, city]);
  const gift = useMemo(() => kind === 'rug' ? null : visitGiftFor(city, kind === 'mattress' ? mItems('clean') : sofaItems(counts, 'clean')), [kind, size, counts, mCounts, city]);
  // Preço riscado do bot: limpeza + anti-ácaros feito à parte (40€ por colchão; dono, 24 Nov).
  const struck = useMemo(() => {
    if (kind !== 'mattress') return null;
    const r = botQuote({ city, items: mItems('clean+anti-acaros') }) as { mattressMitePack?: { separate: number } | null };
    return r.mattressMitePack?.separate ?? null;
  }, [kind, size, counts, mCounts, city]);

  const m = (v: number) => String(v).replace('.', ',');
  const what = kind === 'rug' ? `um tapete de mais ou menos ${m(rugW)} x ${m(rugL)} m` : kind === 'mattress' ? MATTRESS_SIZES.filter(x => mCounts[x.id] > 0).map(x => `${mCounts[x.id]} ${mCounts[x.id] === 1 ? 'colchão' : 'colchões'} ${x.label.toLowerCase()}`).join(' e ') : `${sofaWhat(counts)}`;
  const chosen = OPTIONS.find(o => o.id === choice)!;
  const total = totals[choice];
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade: ${chosen.title.toLowerCase()}${kind !== 'rug' && choice === 'treat' ? ' (produto Bactran)' : ''} para ${what}, ${cityPrep(city)} ${city}${total ? `, por ${formatEuro(total)}` : ''}.`;
  const box = (active: boolean) => `flex min-h-[44px] items-center justify-center rounded-2xl border-2 transition-all md:min-h-[60px] ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_6px_20px_-8px_rgba(212,175,55,0.6)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 md:gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      {/* 1. Uma só pergunta */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 1</p>
        <div className="mb-2 flex items-center justify-between gap-2 md:mb-4 md:mt-1">
          <p className="text-base font-semibold text-[#1A1A1A] md:text-lg">{kind === 'rug' ? 'Medidas aproximadas do tapete' : kind === 'mattress' ? 'Quantos colchões de cada tamanho?' : 'Quantos lugares tem o sofá?'}</p>
        </div>
        {kind === 'rug' ? (
          <div className="grid grid-cols-2 gap-2">
            {([['Largura', rugW, setRugW], ['Comprimento', rugL, setRugL]] as const).map(([label, v, set]) => (
              <div key={label} className="rounded-2xl border-2 border-[#E5E0D3] bg-white p-2">
                <p className="text-center text-xs font-semibold text-[#666]">{label}</p>
                <div className="mt-1 flex items-center justify-between">
                  <button type="button" aria-label={`Menos ${label.toLowerCase()}`} onClick={() => set(x => Math.max(0.5, x - 0.5))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7] text-[#1A1A1A] hover:bg-[#E9E3D3]"><Minus className="h-4 w-4" /></button>
                  <span className="text-lg font-semibold text-[#1A1A1A]">{m(v)} m</span>
                  <button type="button" aria-label={`Mais ${label.toLowerCase()}`} onClick={() => set(x => Math.min(10, x + 0.5))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7] text-[#1A1A1A] hover:bg-[#E9E3D3]"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : kind === 'sofa' ? (
          <SofaCounters counts={counts} onChange={setCounts} />
        ) : (
          <div className={`grid gap-1.5 md:gap-2 ${kind === 'mattress' ? 'grid-cols-3' : 'grid-cols-6 md:grid-cols-3'}`} role="radiogroup" aria-label={kind === 'mattress' ? 'Tamanho' : 'Lugares'}>
            {kind === 'mattress' ? MATTRESS_SIZES.map(o => {
              const n = mCounts[o.id] ?? 0;
              return (
                <div key={o.id} className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2 transition-all ${n > 0 ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#E5E0D3] bg-white'}`}>
                  <span className={`text-base font-semibold leading-none ${n > 0 ? 'text-[#1A1A1A]' : 'text-[#555]'}`}>{o.label}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Menos um colchão ${o.label}`} onClick={() => bump(o.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg bg-[#F3F0E7] text-[#1A1A1A]"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-5 text-center text-base font-bold text-[#1A1A1A]">{n}</span>
                    <button type="button" aria-label={`Mais um colchão ${o.label}`} onClick={() => bump(o.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-[#F3F0E7] text-[#1A1A1A]"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              );
            }) : null}
          </div>
        )}
        <button type="button" onClick={() => more({ kind, size, width: rugW, length: rugL, treat: choice === 'treat' })} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-3 text-sm font-bold text-[#1A1A1A] transition-colors hover:bg-[#D4AF37]/20 md:mt-3 md:min-h-12"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>
      </div>

      {/* 2. Opções com o total final, 3. um botão */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 2</p>
        <p className="mb-2 hidden text-base font-semibold text-[#1A1A1A] md:mb-4 md:mt-1 md:block md:text-lg">Escolha a opção</p>
        <div className="flex flex-col gap-2.5 pt-1.5 md:gap-3" role="radiogroup" aria-label="Opção">
          {OPTIONS.map(o => {
            const active = choice === o.id;
            const value = totals[o.id];
            return (
              <button key={o.id} type="button" role="radio" aria-checked={active} onClick={() => setChoice(o.id)}
                className={`relative flex min-h-[58px] items-center rounded-2xl border-2 px-4 py-2.5 text-left transition-all md:min-h-[84px] ${active ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
                {o.top && <span className="absolute -top-3 left-4 z-10 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Mais escolhido</span>}
                <span className="flex min-w-0 flex-1 flex-col justify-center">
                  <span className="block text-lg font-bold leading-tight text-[#1A1A1A]">{o.title}</span>
                  <span className="block text-[12px] leading-snug text-[#555] sm:text-[13px]">{o.note}</span>
                </span>
                <span className="flex items-center gap-2 pl-2">
                  <span className="flex flex-col items-end leading-tight">
                  {o.id === 'treat' && struck !== null && value !== null && struck > value && <span className="mb-0.5 text-[12px] text-[#888] line-through">{formatEuro(struck)}</span>}
                  <span className={`whitespace-nowrap text-lg font-bold sm:text-xl ${active ? 'text-[#1A1A1A]' : 'text-[#444]'}`}>{value === null ? <span className="block w-[4.5rem] whitespace-normal text-right text-xs font-semibold leading-tight text-[#D4AF37]">{kind === 'sofa' && !sofaTotal(counts) ? 'Escolha o tamanho' : 'Sob orçamento'}</span> : formatEuro(value)}</span>
                  </span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                </span>
              </button>
            );
          })}
        </div>
        <VisitGiftLine gift={gift} />
        <p className="mt-2 text-xs text-[#666] md:mt-3 md:text-sm">{kind === 'rug' ? `Preço final ${cityPrep(city)} ${city}, lavagem em sua casa, deslocação incluída. Juta, sisal, seda ou persa: o valor é ajustado.` : `Preço final ${cityPrep(city)} ${city}, deslocação incluída.`}</p>

        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#25D366] px-3 text-center text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] transition-transform hover:-translate-y-0.5 sm:text-base md:mt-5 md:min-h-14">
          <MessageCircle className="h-5 w-5" /> Pedir este orçamento no WhatsApp
        </a>
      </div>
      {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={[basket]} /></Suspense>}
    </div>
  );
}
