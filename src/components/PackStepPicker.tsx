// Packs de várias peças e sofá com anti-ácaros, com a lógica do orçamento (dono, 25 Nov): uma pergunta de cada vez,
// peça a peça (material, tamanho, opção), nada escolhido à partida, fotografia real em cima e no fim o total do bot
// (botQuote) com a deslocação à parte (dono, 25 Nov), o riscado na mesma base e a oferta, como o bot os dá.
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { PriceCta, WhatsAppCta } from '@/components/Cta';
import { setPriceBar } from '@/lib/priceBar';
import { PhotoCards } from '@/components/StepPricePicker';
import QuizFurnitureImage from '@/components/quiz/QuizFurnitureImage';
import { groupGifts, type BasketGift, type BasketItem } from '@/components/quiz/VisitBasket';
import { botQuote } from '@/lib/botQuote';
import { priceSplit, splitText, travelLabel, type PriceSplit } from '@/lib/servicePrice';
import { cityPrep } from '@/data/serviceCatalog';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';
import baSofa from '@/assets/quiz-antes-depois/sofa.webp';
import baColchao from '@/assets/quiz-antes-depois/colchao.webp';
import baCadeiras from '@/assets/quiz-antes-depois/cadeiras.webp';
import baTapete from '@/assets/quiz-antes-depois/tapete.webp';
import matTecido from '@/assets/widget-materiais/sofa-tecido.webp';
import matPele from '@/assets/widget-materiais/sofa-pele.webp';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));
export type PieceKind = 'sofa' | 'mattress' | 'chairs' | 'rug';
type Opt = { id: string; name: string; note: string; wa: string };
type Sel = { material?: 'tecido' | 'pele'; seats?: number; size?: string; qty?: number; w?: string; l?: string; skip?: boolean; treat?: string };

const up9 = (n: number) => Math.ceil((n + 1) / 10) * 10 - 1;
const dim = (v?: string) => { const n = Number(String(v ?? '').replace(',', '.')); return n > 0 && n <= 10 ? n : null; };
const PACKS: Opt[] = [
  { id: 'clean+premium', name: 'Blindado', note: 'Limpeza + Premium, até 10 anos', wa: 'limpeza + impermeabilização Premium' },
  { id: 'clean+essencial', name: 'Protegido', note: 'Limpeza + Essencial, 1 a 2 anos', wa: 'limpeza + impermeabilização Essencial' },
  { id: 'clean', name: 'Renovado', note: 'Só limpeza', wa: 'só limpeza' },
];
const MITES: Opt[] = [
  { id: 'clean+anti-acaros', name: 'Com anti-ácaros', note: 'Limpeza e desinfeção com Bactran', wa: 'limpeza + anti-ácaros (produto Bactran)' },
  { id: 'clean', name: 'Só limpeza', note: 'Extração a fundo, seca em 2 a 5 h', wa: 'só limpeza' },
];
const LEATHER: Opt[] = [{ id: 'clean', name: 'Limpeza + tratamento da pele', note: 'Limpeza e hidratação', wa: 'limpeza e tratamento da pele' }];
const NAME: Record<PieceKind, string> = { sofa: 'Sofá', mattress: 'Colchão', chairs: 'Cadeiras', rug: 'Tapete' };
const PHOTO: Record<PieceKind, string> = { sofa: baSofa, mattress: baColchao, chairs: baCadeiras, rug: baTapete };
const SEATS = [1, 2, 3, 4, 5, 6];
const CHAIRS = [2, 4, 6, 8, 10, 12];
const MATTRESS = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King / Queen' }];
const RUGS = [{ label: 'Pequeno', w: '1,2', l: '1,7' }, { label: 'Médio', w: '1,6', l: '2,3' }, { label: 'Grande', w: '2', l: '3' }, { label: 'Muito grande', w: '2,5', l: '3,5' }];
const tile = (on: boolean) => `rounded-2xl border-2 font-bold text-[#1A1A1A] transition-all ${on ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#E8C964]' : 'border-[#E5E0D3] bg-white hover:border-[#D4AF37]'}`;

type Q = { ok: boolean; quote?: boolean; total?: number | null; rugCombo?: { ok: boolean; comboPrice?: number } | null; visitGifts?: { gifts: BasketGift[]; usual: number; total: number; withoutGift?: number | null } | null };

export default function PackStepPicker({ pieces, packName, city, source, mitesOnly = false }: { pieces: PieceKind[]; packName: string; city: string; source: string; mitesOnly?: boolean }) {
  const [sel, setSel] = useState<Partial<Record<PieceKind, Sel>>>({});
  const [at, setAt] = useState(0); // índice da peça; pieces.length = resumo
  const [basket, setBasket] = useState<BasketItem[] | null>(null);
  const set = (k: PieceKind, over: Partial<Sel>) => setSel(s => ({ ...s, [k]: { ...s[k], ...over } }));
  useEffect(() => { window.dispatchEvent(new Event('resize')); }, [at]);

  const optsOf = (k: PieceKind): Opt[] => k === 'rug' ? [] : k === 'mattress' || (k === 'sofa' && mitesOnly) ? MITES : k === 'sofa' && sel.sofa?.material === 'pele' ? LEATHER : PACKS;
  const asksMaterial = (k: PieceKind) => k === 'sofa' && !mitesOnly;
  const sized = (k: PieceKind, s?: Sel) => !!s && (k === 'sofa' ? !!s.seats : k === 'mattress' ? !!s.size : k === 'chairs' ? !!s.qty : !!s.skip || (!!dim(s.w) && !!dim(s.l)));
  const toItem = (k: PieceKind, s: Sel | undefined, treat?: string): Record<string, unknown> | null => {
    if (!s || !sized(k, s) || s.skip) return null;
    if (k === 'rug') return { kind: 'rug', width: dim(s.w), length: dim(s.l), treatment: 'clean' };
    const treatment = treat ?? s.treat;
    if (!treatment) return null;
    if (k === 'mattress') return { kind: 'mattress', size: s.size, treatment };
    if (k === 'chairs') return { kind: 'chairs', qty: s.qty, treatment };
    return { ...(s.seats === 6 ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto' } : { kind: 'sofa', size: `${s.seats}-${s.seats === 1 ? 'lugar' : 'lugares'}` }), treatment, ...(s.material === 'pele' ? { leather: true } : {}) };
  };
  // Um só pedido ao motor do bot, o mesmo que o cesto e o WhatsApp fazem.
  const priced = (items: Record<string, unknown>[], cleanOnly = false) => {
    if (!items.length) return { total: null as number | null, crossed: null as number | null, gifts: [] as BasketGift[], split: null as PriceSplit | null };
    const r = botQuote({ city, items }) as Q;
    if (!r.ok) return { total: null, crossed: null, gifts: [], split: null };
    const rug = items.some(i => i.kind === 'rug');
    // Sofá sozinho só com limpeza: o preço sem a oferta (dono, 25 Nov).
    const plain = cleanOnly && typeof r.visitGifts?.withoutGift === 'number' ? r.visitGifts.withoutGift : r.total;
    const raw = rug && items.length > 1 ? (r.rugCombo?.ok ? r.rugCombo.comboPrice : null) : !r.quote ? plain : null;
    const total = typeof raw === 'number' ? (items.length > 1 ? up9(raw) : raw) : null;
    const gifts = !cleanOnly && r.visitGifts ? r.visitGifts.gifts : [];
    // O número mostrado é o serviço; o total do motor (o que se paga) fica para o fim.
    const base = total === null ? null : priceSplit(city, items);
    const split = base && total !== null ? { ...base, total, service: Math.round((total - base.travel) * 100) / 100 } : null;
    const crossed = split && split.struck !== null && !cleanOnly && split.struck - split.service >= 5 ? split.struck : null;
    return { total: split ? split.service : total, crossed, gifts, split };
  };
  const before = (n: number) => pieces.slice(0, n).map(k => toItem(k, sel[k])).filter((x): x is Record<string, unknown> => !!x);

  const k = pieces[at];
  const s = k ? sel[k] : undefined;
  const done = at >= pieces.length;
  const all = useMemo(() => pieces.map(p => toItem(p, sel[p])).filter((x): x is Record<string, unknown> => !!x), [sel, pieces]); // eslint-disable-line react-hooks/exhaustive-deps
  const final = useMemo(() => (done ? priced(all, mitesOnly && sel.sofa?.treat === 'clean') : null), [done, all, city]); // eslint-disable-line react-hooks/exhaustive-deps

  const back = () => {
    if (!k) { setAt(pieces.length - 1); set(pieces[pieces.length - 1], { treat: undefined }); return; }
    if (sized(k, s)) { set(k, { seats: undefined, size: undefined, qty: undefined, w: undefined, l: undefined, skip: undefined, treat: undefined }); return; }
    if (asksMaterial(k) && s?.material) { set(k, { material: undefined }); return; }
    if (at > 0) { const p = pieces[at - 1]; setAt(at - 1); set(p, p === 'rug' ? { w: undefined, l: undefined, skip: undefined } : { treat: undefined }); }
  };
  const canBack = done || at > 0 || (!!s && (sized(k, s) || !!s.material));
  const describe = (p: PieceKind) => {
    const v = sel[p]!; const o = optsOf(p).find(x => x.id === v.treat);
    if (p === 'sofa') return `sofá ${v.material === 'pele' ? 'de pele ' : ''}de ${v.seats} ${v.seats === 1 ? 'lugar' : 'lugares'} (${o?.wa})`;
    if (p === 'mattress') return `colchão ${MATTRESS.find(m => m.id === v.size)!.label.toLowerCase()} (${o?.wa})`;
    if (p === 'chairs') return `${v.qty} ${v.qty === 1 ? 'cadeira' : 'cadeiras'} (${o?.wa})`;
    return `tapete de ${v.w} × ${v.l} m`;
  };
  const short = (p: PieceKind) => {
    const v = sel[p]!; const o = optsOf(p).find(x => x.id === v.treat);
    if (p === 'rug') return v.skip ? ['Tapete', 'Sem tapete'] : [`Tapete ${v.w} × ${v.l} m`, 'Lavagem em sua casa'];
    return [p === 'sofa' ? `Sofá de ${v.seats} ${v.seats === 1 ? 'lugar' : 'lugares'}${v.material === 'pele' ? ', pele' : ''}` : p === 'mattress' ? `Colchão ${MATTRESS.find(m => m.id === v.size)!.label}` : `${v.qty} ${v.qty === 1 ? 'cadeira' : 'cadeiras'}`, o ? o.name : ''];
  };
  const inVisit = pieces.filter(p => !sel[p]?.skip);
  const gifts = final ? groupGifts(final.gifts) : [];
  const msg = done ? `Olá! Gostaria de saber o preço e a disponibilidade para a ${packName.toLowerCase()} ${cityPrep(city)} ${city}: ${inVisit.map(describe).join(', ')}${final?.split ? `, por ${splitText(final.split)}${gifts.length ? ` (com ${gifts.map(g => g.text).join(' e ')} ${gifts.length > 1 ? 'oferecidos' : 'oferecido'})` : ''}` : ''}.` : '';
  const href = `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`;
  // Com total, o WhatsApp vive na barra fixa do telemóvel, ao lado do preço, e sai daqui para não haver dois iguais.
  const [barKey] = useState(() => ({}));
  const barTotal = done && final?.total != null ? formatEuro(final.total) : null;
  const barWas = barTotal && final!.crossed !== null ? formatEuro(final!.crossed) : undefined;
  const barTravel = final?.split ? travelLabel(final.split) : undefined;
  useEffect(() => { setPriceBar(barKey, barTotal ? { total: barTotal, was: barWas, travel: barTravel, href, source } : null); }, [barKey, barTotal, barWas, barTravel, href, source]);
  useEffect(() => () => setPriceBar(barKey, null), [barKey]);
  const toBasket = (): BasketItem[] => inVisit.map((p, i) => {
    const v = sel[p]!; const id = `p${Date.now()}_${i}`;
    if (p === 'rug') return { id, kind: 'rug', qty: 1, pack: 'none', width: v.w, length: v.l };
    const pack = v.treat === 'clean+premium' || v.treat === 'clean+anti-acaros' ? 'premium' : v.treat === 'clean+essencial' ? 'essencial' : 'none';
    if (p === 'mattress') return { id, kind: 'mattress', size: v.size, qty: 1, pack };
    if (p === 'chairs') return { id, kind: 'chairs', qty: v.qty!, pack };
    return { id, kind: 'sofa', size: v.seats === 6 ? '5-lugares' : `${v.seats}-${v.seats === 1 ? 'lugar' : 'lugares'}`, ...(v.seats === 6 ? { seats: 6 } : {}), qty: 1, pack: mitesOnly ? 'none' : pack, ...(v.material === 'pele' ? { leather: true } : {}) };
  });
  const row = (on: boolean) => `flex min-h-[58px] max-md:[@media(min-height:700px)]:min-h-[70px] w-full items-center justify-between gap-2 px-4 py-2 text-left md:min-h-[72px] md:px-5 ${tile(on)}`;
  const photo = k && <div className="relative mb-3 overflow-hidden rounded-2xl md:mx-auto md:max-w-xl">
    <img src={PHOTO[k]} alt="" width={520} height={440} loading="lazy" decoding="async" className="h-[150px] w-full object-cover [@media(max-height:699px)]:h-[112px] md:h-[220px]" />
    <span className="absolute left-2.5 top-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Antes</span>
    <span className="absolute right-2.5 top-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Depois</span>
  </div>;
  const ask = (t: string) => <p className="mb-2.5 text-lg font-semibold text-[#1A1A1A]">{t}</p>;

  return <div data-price-picker className="mx-auto w-full max-w-2xl">
    {/* Onde vai: uma barra por peça. */}
    <div className="mb-3 flex items-center gap-2">
      {canBack && <button type="button" onClick={back} aria-label="Voltar" className="grid h-9 min-h-0 w-9 min-w-0 shrink-0 place-items-center rounded-full border-2 border-[#E5E0D3] bg-white text-[#0B2F2A]"><ArrowLeft className="h-4 w-4" /></button>}
      <div className="flex flex-1 gap-1.5">{pieces.map((p, i) => <span key={p} className="min-w-0 flex-1"><span className={`block h-1.5 rounded-full ${i < at || done ? 'bg-[#D4AF37]' : i === at ? 'bg-[#E8C964]' : 'bg-[#E5E0D3]'}`} /><span className={`mt-1 block text-center text-[13px] font-semibold ${i === at ? 'text-[#1A1A1A]' : 'text-[#777]'}`}>{NAME[p]}</span></span>)}</div>
    </div>

    {!done && asksMaterial(k) && !s?.material && <PhotoCards ask="O seu sofá é de que material?" options={[{ id: 'tecido' as const, label: 'Tecido', photo: matTecido }, { id: 'pele' as const, label: 'Pele / couro', photo: matPele }]} onPick={m => set('sofa', { material: m })} wide />}

    {!done && (!asksMaterial(k) || s?.material) && !sized(k, s) && <>
      {k === 'sofa' && <>{ask('Quantos lugares tem o sofá?')}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">{SEATS.map(n => <button key={n} type="button" onClick={() => set('sofa', { seats: n })} className={`flex min-h-[104px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[17px] [@media(max-height:699px)]:min-h-[78px] md:min-h-[128px] ${tile(false)}`}><QuizFurnitureImage service="sofa" sizeId={`${Math.min(n, 4)}-${n === 1 ? 'lugar' : 'lugares'}`} className="h-[52px] w-24 [@media(max-height:699px)]:h-8 [@media(max-height:699px)]:w-20" />{n === 1 ? '1 lugar' : `${n} lugares`}</button>)}</div></>}
      {k === 'mattress' && <>{photo}{ask('Que tamanho tem o colchão?')}
        <div className="grid gap-2 md:grid-cols-3">{MATTRESS.map(m => <button key={m.id} type="button" onClick={() => set('mattress', { size: m.id })} className={`flex min-h-[84px] items-center justify-between px-5 text-lg md:flex-col md:justify-center md:gap-1 ${tile(false)}`}><QuizFurnitureImage service="mattress" sizeId={m.id} className="h-16 w-24 [@media(max-height:699px)]:h-12" />{m.label}<span aria-hidden className="w-6 md:hidden" /></button>)}</div></>}
      {k === 'chairs' && <>{photo}{ask('Quantas cadeiras?')}
        <div className="grid grid-cols-3 gap-2">{CHAIRS.map(n => <button key={n} type="button" onClick={() => set('chairs', { qty: n })} className={`min-h-[64px] text-[17px] ${tile(false)}`}>{n}</button>)}</div>
        <button type="button" onClick={() => set('chairs', { qty: 1 })} className={`mt-2 h-12 w-full text-base ${tile(false)}`}>Outro número</button></>}
      {k === 'rug' && <>{photo}{ask('Que tamanho tem o tapete?')}
        <div className="grid grid-cols-2 gap-2">{RUGS.map(r => <button key={r.label} type="button" onClick={() => { set('rug', { w: r.w, l: r.l, skip: undefined }); setAt(at + 1); }} className={`min-h-[64px] px-3 text-left ${tile(false)}`}><span className="block text-base">{r.label}</span><span className="block text-xs font-semibold text-[#666]">{r.w} × {r.l} m</span></button>)}</div>
        <RugSize onDone={(w, l) => { set('rug', { w, l, skip: undefined }); setAt(at + 1); }} />
        <button type="button" onClick={() => { set('rug', { skip: true }); setAt(at + 1); }} className="mt-1 min-h-11 w-full text-sm font-semibold text-[#555] underline underline-offset-4">Sem tapete nesta visita</button></>}
    </>}

    {!done && k !== 'rug' && sized(k, s) && <>
      {photo}
      {k === 'chairs' && <div className={`mb-2 flex h-12 items-center justify-between px-2 ${tile(false)}`}><button type="button" aria-label="Menos uma cadeira" onClick={() => set('chairs', { qty: Math.max(1, s!.qty! - 1) })} className="grid h-9 min-h-0 w-9 min-w-0 place-items-center rounded-lg bg-[#EEF1EE]"><Minus className="h-4 w-4" /></button><span>{s!.qty} {s!.qty === 1 ? 'cadeira' : 'cadeiras'}</span><button type="button" aria-label="Mais uma cadeira" onClick={() => set('chairs', { qty: Math.min(40, s!.qty! + 1) })} className="grid h-9 min-h-0 w-9 min-w-0 place-items-center rounded-lg bg-[#EEF1EE]"><Plus className="h-4 w-4" /></button></div>}
      {ask(`${short(k)[0]}: que opção prefere?`)}
      <div className="flex flex-col gap-2">{optsOf(k).map(o => { const it = toItem(k, s, o.id); return { o, p: it ? priced([...before(at), it], mitesOnly && o.id === 'clean') : null }; })
        // Quando o tratamento vem oferecido na visita, o total é o mesmo: só se mostra com ele (dono, 25 Nov: nunca a opção sem a oferta).
        .filter(({ o, p }, _, list) => !(o.id === 'clean' && list.length > 1 && p?.total != null && list.some(x => x.o.id !== 'clean' && x.p?.total === p.total))).map(({ o, p }) => { return <button key={o.id} type="button" aria-pressed={s?.treat === o.id} onClick={() => { set(k, { treat: o.id }); setAt(at + 1); }} className={row(s?.treat === o.id)}>
        <span className="min-w-0"><span className="block text-base font-bold leading-tight md:text-lg">{o.name}</span><span className="block text-xs font-normal leading-snug opacity-75 md:text-sm">{o.note}</span></span>
        <span className="shrink-0 text-right text-lg font-bold">{p?.total != null ? formatEuro(p.total) : ''}{at === 0 && p?.split && p.split.travel === 0 && !p.split.included && <span className="block text-[11px] font-semibold leading-snug">deslocação grátis</span>}</span>
      </button>; })}</div>
      {at > 0 && <p className="mt-2 text-xs text-[#666]">Valores da visita até aqui.</p>}
    </>}

    {done && <>
      <ul className="mb-3 divide-y divide-[#E5E0D3] overflow-hidden rounded-2xl border-2 border-[#E5E0D3] bg-white">{pieces.map((p, i) => { const [a, b] = short(p); return <li key={p} className="flex min-h-[60px] items-center justify-between gap-3 px-4 py-2"><span className="flex min-w-0 items-center gap-3"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${sel[p]?.skip ? 'bg-[#EEF1EE] text-[#777]' : 'bg-[#0B2F2A] text-[#D4AF37]'}`}>{!sel[p]?.skip && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span><span className="min-w-0"><span className="block font-semibold text-[#1A1A1A]">{a}</span><span className="block text-sm text-[#555]">{b}</span></span></span><button type="button" onClick={() => { setSel(x => ({ ...x, [p]: {} })); setAt(i); }} className="min-h-11 shrink-0 text-sm font-semibold text-[#0B2F2A] underline underline-offset-4">Mudar</button></li>; })}</ul>
      <div className="flex items-end justify-between border-t border-[#E5E0D3] pt-3">
        <span className="text-sm text-[#555]">Serviço {cityPrep(city)} {city}{final!.split && <span className="block text-xs">{travelLabel(final!.split)}{final!.split.travel > 0 && `, total ${formatEuro(final!.split.total)}`}</span>}</span>
        <span className="text-right"><span className="flex items-baseline justify-end gap-2">{final!.crossed !== null && <span className="text-lg font-semibold text-[#777] line-through">{formatEuro(final!.crossed)}</span>}<span className="text-3xl font-bold text-[#1A1A1A]">{final!.total === null ? <span className="text-base text-[#D4AF37]">Sob orçamento</span> : formatEuro(final!.total)}</span></span>
          {final!.crossed !== null && final!.total !== null && <span className="block text-sm font-bold text-[#D4AF37]">Poupa {formatEuro(Math.round((final!.crossed - final!.total) * 100) / 100)}</span>}</span>
      </div>
      {gifts.length > 0 && <ul className="mt-1.5 space-y-0.5 text-sm font-semibold text-[#D4AF37]">{gifts.map(g => <li key={g.key}>Oferecemos {g.text}, normalmente {formatEuro(g.normal)}</li>)}</ul>}
      <WhatsAppCta onLight href={href} source={source} total={final!.total !== null ? formatEuro(final!.total) : undefined} className={`mt-3 ${barTotal ? 'max-md:hidden' : ''}`} />
      <PriceCta onLight className="mt-2" onClick={() => setBasket(toBasket())}>Juntar mais artigos</PriceCta>
    </>}
    {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={basket} /></Suspense>}
  </div>;
}

/** Medida própria do tapete; só avança com as duas medidas válidas. */
function RugSize({ onDone }: { onDone: (w: string, l: string) => void }) {
  const [w, setW] = useState('');
  const [l, setL] = useState('');
  const box = 'h-12 min-w-0 w-full rounded-2xl border-2 border-[#E5E0D3] bg-white px-3 text-base font-semibold text-[#1A1A1A]';
  return <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
    <input aria-label="Largura em metros" inputMode="decimal" placeholder="Largura (2,0)" value={w} onChange={e => setW(e.target.value)} className={box} />
    <input aria-label="Comprimento em metros" inputMode="decimal" placeholder="Compr. (3,0)" value={l} onChange={e => setL(e.target.value)} className={box} />
    <button type="button" aria-label="Usar estas medidas" disabled={!dim(w) || !dim(l)} onClick={() => onDone(w, l)} className={`grid h-12 w-12 place-items-center disabled:opacity-40 ${tile(true)}`}><Check className="h-5 w-5" strokeWidth={3} /></button>
  </div>;
}
