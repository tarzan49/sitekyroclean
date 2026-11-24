// Escolha simples para os packs de limpeza + impermeabilização (sofá e cadeiras).
// Mobile-first: uma pergunta (lugares ou nº de cadeiras), três opções com o
// total final já com deslocação, um botão. Preços pelo mesmo motor do
// bot (botQuote), nunca escritos à mão.
import { lazy, Suspense, useMemo, useState } from 'react';
import { choiceToItems } from '@/components/quiz/basketChoice';
import VisitGiftLine, { visitGiftFor } from '@/components/VisitGiftLine';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));
import { cityPrep } from '@/data/serviceCatalog';
import { Check, Minus, Plus, MessageCircle, Sofa, Armchair, Camera } from 'lucide-react';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import premiumSofa from '@/assets/picker-premium-sofa.webp';
import essencialSofa from '@/assets/picker-essencial-sofa.webp';
import premiumChair from '@/assets/picker-premium-cadeira.webp';
import essencialChair from '@/assets/picker-essencial-cadeira.webp';
import { type PackExtra } from '@/lib/customPack';
import { botQuote } from '@/lib/botQuote';
import { WHATSAPP_BASE } from '@/constants/business';
import { chairPackWas } from '@/constants/chairPricing';
import { formatEuro } from '@/data/enginePrices';
import SofaCounters from '@/components/SofaCounters';

type Kind = 'sofa' | 'chairs';
const SOFA_SIZES = ['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares', '6-lugares']; // até 6; canto/U/7+ pede-se no WhatsApp (dono, 24 Nov)
const PHOTO_SIZE = 'foto'; // canto, em U ou 7+ lugares: preço pela fotografia

const CHAIR_MAX = 20;

// Cada pack tem um nome que o define (dono, 24 Nov); "Premium"/"Essencial" ficam por baixo, como o bot diz.
const OPTIONS: { extra: PackExtra; name: string; title: string; note: string; top?: boolean }[] = [
  { extra: 'premium', name: 'Blindado', title: 'Limpeza + Premium', note: 'Anti-manchas e anti-líquidos, até 10 anos', top: true },
  { extra: 'essencial', name: 'Protegido', title: 'Limpeza + Essencial', note: 'A mesma proteção, mais económica: 1 a 2 anos' },
  { extra: 'none', name: 'Renovado', title: 'Só limpeza', note: 'Limpeza profunda, sem proteção' },
];

// Fotografia real que diz a escolha num olhar (dono, 24 Nov): o líquido em cima do tecido nas
// opções com proteção, o artigo limpo no "só limpeza".
const afterOf = (cat: 'sofa' | 'cadeiras') => (BEFORE_AFTER_POOL[cat].find(p => p.kind === 'pair') as { after: string } | undefined)?.after ?? '';
const PHOTO: Record<'sofa' | 'chairs', Record<string, string>> = {
  sofa: { premium: premiumSofa, essencial: essencialSofa, none: afterOf('sofa') },
  chairs: { premium: premiumChair, essencial: essencialChair, none: afterOf('cadeiras') },
};

export interface PackChoice { kind: Kind; size: string; qty: number; extra: PackExtra; sofas?: { size: string; qty: number }[] }
interface Props { kind: Kind; city: string; source: string; onMore?: (choice: PackChoice) => void; compact?: boolean }

export default function WaterproofPackPicker({ kind, city, source, onMore, compact = false }: Props) {
  // Um contador por tamanho, como nos colchões (dono, 24 Nov): combina-se à vontade e começa sem nada escolhido (nunca um preço de algo que o cliente não escolheu).
  const [sofaCounts, setSofaCounts] = useState<Record<string, number>>({});
  const bumpSofa = (id: string, d: number) => setSofaCounts(c => { const next = { ...c, [id]: Math.max(0, Math.min(9, (c[id] ?? 0) + d)) }; return next; });
  const sofas = SOFA_SIZES.filter(id => (sofaCounts[id] ?? 0) > 0).map(id => ({ size: id, qty: sofaCounts[id] }));
  const sofaKey = sofas.map(x => `${x.size}:${x.qty}`).join(',');
  const size = sofas[0]?.size ?? '3-lugares';
  const count = sofas.reduce((n, x) => n + x.qty, 0);
  // O pedido inteiro numa só chamada ao motor: uma linha por tamanho (6 lugares = 5 com seats 6, como o bot).
  const sofaItems = (treatment: string) => sofas.map(x => x.size === '6-lugares' ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment, qty: x.qty } : { kind: 'sofa', size: x.size, treatment, qty: x.qty });
  const [qty, setQty] = useState(6);
  // Sem cesto da página, o widget abre o seu (dono, 25 Nov: "em todas no site").
  const [basket, setBasket] = useState<PackChoice | null>(null);
  const more = (c: PackChoice) => onMore ? onMore(c) : setBasket(c);
  const [extra, setExtra] = useState<PackExtra>('premium');

  const byPhoto = kind === 'sofa' && size === PHOTO_SIZE;
  // Os mesmos totais que o bot dá no WhatsApp: a própria função do bot (botQuote), com a deslocação da cidade.
  const noSofa = kind === 'sofa' && sofas.length === 0;
  const totals = useMemo(() => Object.fromEntries(OPTIONS.map(o => {
    if (kind === 'sofa' && (size === PHOTO_SIZE || noSofa)) return [o.extra, null];
    const treatment = o.extra === 'premium' ? 'clean+premium' : o.extra === 'essencial' ? 'clean+essencial' : 'clean';
    const items = kind === 'sofa' ? sofaItems(treatment) : [{ kind: 'chairs', qty, treatment }];
    const r = botQuote({ city, items }) as { ok: boolean; quote?: boolean; total?: number | null; visitGifts?: { withoutGift?: number | null } | null };
    // "Renovado" é só a limpeza: sem a oferta que o motor junta com várias peças (dono, 25 Nov).
    const plain = o.extra === 'none' && typeof r.visitGifts?.withoutGift === 'number' ? r.visitGifts.withoutGift : r.total;
    return [o.extra, r.ok && !r.quote && typeof plain === 'number' ? plain : null];
  })) as Record<PackExtra, number | null>, [kind, sofaKey, qty, city]);

  // "Em vez de": a limpeza e a impermeabilização pedidas em separado (cada uma com a sua deslocação), pelo bot.
  // É a única comparação permitida (pack contra separado; regra do dono, 19 Nov).
  const separate = useMemo(() => {
    if (kind === 'sofa' && (size === PHOTO_SIZE || noSofa)) return {} as Record<string, number | null>;
    // Cadeiras: o riscado é o preço de 1 cadeira × a quantidade (dono, 24 Nov 2026: "em vez de 39 × 12, paga 359").
    if (kind === 'chairs') return { premium: chairPackWas(qty, 'premium'), essencial: chairPackWas(qty, 'essencial') } as Record<string, number | null>;
    // Sofás: o separatePrice do motor, o MESMO valor que o bot diz no WhatsApp (dono, 24 Nov 2026).
    const pick = (t: string) => {
      const r = botQuote({ city, items: sofaItems(t) }) as { separatePrice?: { separate: number } | null };
      return r.separatePrice?.separate ?? null;
    };
    return { premium: pick('clean+premium'), essencial: pick('clean+essencial') } as Record<string, number | null>;
  }, [kind, sofaKey, qty, city]);

  const gift = useMemo(() => kind !== 'sofa' || size === 'foto' || noSofa ? null : visitGiftFor(city, sofaItems('clean')), [kind, sofaKey, city]);
  const seatLabel = (id: string) => { const n = Number(id.split('-')[0]); return `${n} ${n === 1 ? 'lugar' : 'lugares'}`; };
  const sofaList = sofas.map(x => `${x.qty === 1 ? 'um sofá' : `${x.qty} sofás`} de ${seatLabel(x.size)}`);
  const what = byPhoto ? 'sofá de canto, em U ou com mais de 6 lugares (envio fotografia)' : kind === 'sofa' ? (sofaList.length > 1 ? `${sofaList.slice(0, -1).join(', ')} e ${sofaList[sofaList.length - 1]}` : sofaList[0] ?? 'um sofá') : `${qty} ${qty === 1 ? 'cadeira' : 'cadeiras'}`;
  const chosen = OPTIONS.find(o => o.extra === extra)!;
  const total = totals[extra];
  // Mensagem pronta no WhatsApp com a escolha completa (dono, 24 Nov): o nome do pack, o que inclui, a peça,
  // a cidade e o total que viu. O bot lê-a como um orçamento já escolhido e segue para as horas.
  const WHAT_INCLUDES: Record<string, string> = {
    premium: 'limpeza + impermeabilização Premium, proteção anti-manchas e anti-líquidos até 10 anos',
    essencial: 'limpeza + impermeabilização Essencial, proteção anti-manchas e anti-líquidos de 1 a 2 anos',
    none: 'só limpeza, sem impermeabilização',
  };
  const piece = byPhoto ? 'sofá de canto, em U ou com mais de 6 lugares' : what;
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade do pack ${chosen.name} (${WHAT_INCLUDES[extra]}) para ${piece}, ${cityPrep(city)} ${city}${total && !byPhoto ? `, por ${formatEuro(total)}` : ''}. Envio a fotografia ${kind === 'sofa' ? (count > 1 ? 'dos sofás' : 'do sofá') : 'das cadeiras'}.`;
  const ItemIcon = kind === 'sofa' ? Sofa : Armchair;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-3 md:gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      {/* 1. Uma só pergunta */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 1</p>
        <div className={`${compact && kind !== 'sofa' ? 'hidden md:flex ' : 'flex '}mb-2 items-center justify-between gap-2 md:mb-4 md:mt-1`}>
          <p className={`${compact ? 'hidden md:block ' : ''}text-base font-semibold text-[#1A1A1A] md:text-lg`}>{kind === 'sofa' ? 'Quantos lugares tem o sofá?' : 'Quantas cadeiras?'}</p>
        </div>
        {kind === 'sofa' ? (
          <SofaCounters counts={sofaCounts} onChange={setSofaCounts} />
        ) : (
          <div className="flex items-center justify-between rounded-2xl border-2 border-[#E5E0D3] bg-white p-1 md:p-2">
            <button type="button" aria-label="Menos uma cadeira" onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7] md:h-12 md:w-12 text-[#1A1A1A] hover:bg-[#E9E3D3]"><Minus className="h-5 w-5" /></button>
            <span className="flex items-center gap-2 text-2xl font-semibold text-[#1A1A1A]"><ItemIcon className="h-5 w-5 text-[#D4AF37]" />{qty}</span>
            <button type="button" aria-label="Mais uma cadeira" onClick={() => setQty(q => Math.min(CHAIR_MAX, q + 1))} className="grid h-10 w-10 place-items-center rounded-xl bg-[#F3F0E7] md:h-12 md:w-12 text-[#1A1A1A] hover:bg-[#E9E3D3]"><Plus className="h-5 w-5" /></button>
          </div>
        )}
        <button type="button" disabled={noSofa} onClick={() => more({ kind, size, qty: kind === 'sofa' ? count : qty, extra, sofas: kind === 'sofa' ? sofas : undefined })} className="mt-1.5 flex min-h-9 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 px-3 text-sm font-bold text-[#1A1A1A] transition-colors hover:bg-[#D4AF37]/20 md:mt-3 md:min-h-12 disabled:opacity-50"><Plus className="h-4 w-4 text-[#D4AF37]" strokeWidth={3} />Juntar mais artigos à mesma visita</button>
        <p className={`${kind === 'sofa' ? 'hidden md:block ' : ''}mt-1 text-center text-[11px] leading-snug text-[#666] md:text-sm`}>Junte outra peça à mesma visita e oferecemos-lhe um tratamento: anti-ácaros, anti-odor e outros.</p>
        <p className={`${byPhoto ? '' : 'hidden'} mt-2 text-xs leading-relaxed text-[#666] md:mt-3 md:text-sm`}>{kind === 'sofa' ? (byPhoto ? 'Envie-nos uma fotografia do sofá e dizemos-lhe o preço em menos de 1 minuto.' : 'Sofá de canto, em U ou com mais de 6 lugares: o preço é dado pela fotografia.') : `Mais de ${CHAIR_MAX} cadeiras: peça o preço no WhatsApp.`}</p>
      </div>

      {/* 2. Três opções com o total final, 3. um botão */}
      <div>
        <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37] md:block">Passo 2</p>
        <p className="mb-2 hidden text-base font-semibold text-[#1A1A1A] md:mb-4 md:mt-1 md:block md:text-lg">Escolha a opção</p>
        <div className="flex flex-col gap-2 pt-1.5 md:gap-3" role="radiogroup" aria-label="Opção">
          {OPTIONS.map(o => {
            const active = extra === o.extra;
            const value = totals[o.extra];
            return (
              <button key={o.extra} type="button" role="radio" aria-checked={active} onClick={() => setExtra(o.extra)}
                className={`relative flex min-h-[58px] items-stretch rounded-2xl border-2 text-left transition-all md:min-h-[84px] ${active ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEF] to-[#F7EFD6] shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]/50'}`}>
                {o.top && <span className="absolute -top-3 left-3 z-10 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">Mais escolhido</span>}
                <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2.5 text-left">
                  <span className="block text-lg font-bold leading-tight text-[#1A1A1A]">{o.name}</span>
                  <span className="block text-[12px] leading-snug text-[#555] sm:text-[13px]">{o.note}</span>
                </span>
                <span className="flex items-center gap-2 pr-3">
                  <span className="flex flex-col items-end leading-tight">
                    {value !== null && separate[o.extra] && separate[o.extra]! > value && <span className="text-[11px] text-[#888] line-through">{formatEuro(separate[o.extra]!)}</span>}
                    <span className={`whitespace-nowrap text-lg font-bold sm:text-xl ${active ? 'text-[#1A1A1A]' : 'text-[#444]'}`}>{value === null ? <span className="block w-[4.5rem] whitespace-normal text-right text-xs font-semibold leading-tight text-[#D4AF37]">{byPhoto ? 'Pela fotografia' : noSofa ? 'Escolha o tamanho' : 'Sob orçamento'}</span> : formatEuro(value)}</span>
                  </span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37] text-white' : 'border-[#CFC8B6]'}`}>{active && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                </span>
              </button>
            );
          })}
        </div>
        <VisitGiftLine gift={gift} />
        {!byPhoto && !compact && <p className={`${gift ? 'hidden md:block ' : ''}mt-2 text-xs text-[#666] md:mt-3 md:text-sm`}>Preço final {cityPrep(city)} {city}, deslocação incluída.</p>}

        <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" data-tracking-source={source}
          className="mt-3 flex min-h-12 w-full md:mt-5 md:min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#25D366] whitespace-nowrap px-3 text-center text-[15px] font-bold text-white sm:text-base shadow-[0_10px_24px_-10px_rgba(37,211,102,0.7)] transition-transform hover:-translate-y-0.5">
          {byPhoto ? <Camera className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />} {byPhoto ? 'Enviar fotografia no WhatsApp' : 'Pedir este orçamento no WhatsApp'}
        </a>
        <p className="hidden">Resposta em menos de 1 minuto</p>
      </div>
      {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={choiceToItems(basket)} /></Suspense>}
    </div>
  );
}
