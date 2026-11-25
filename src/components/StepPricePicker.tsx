// "O seu preço" nas páginas, com a mesma lógica do orçamento (dono, 25 Nov 2026: "deveria ser exatamente o mesmo que o
// do orçamento [...] deveria seguir a mesma lógica"): localidade, material, tamanho e só depois as opções com preço.
// Nada vem escolhido e o botão diz o passo que falta. Os números são os do cesto (funções do VisitBasket, que lêem o
// motor do bot), carregadas só quando a pessoa começa a escolher.
import { PriceCta, WhatsAppCta } from '@/components/Cta';
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronRight, Minus, Plus } from 'lucide-react';
import { WHATSAPP_BASE } from '@/constants/business';
import { formatEuro } from '@/data/enginePrices';
import { cities, cityPrep } from '@/data/serviceCatalog';
import SofaCounters, { sofaWhat, type SofaCounts } from '@/components/SofaCounters';
import QuizFurnitureImage from '@/components/quiz/QuizFurnitureImage';
import type { BasketItem, BasketPack } from '@/components/quiz/VisitBasket';
import baSofa from '@/assets/quiz-antes-depois/sofa.webp';
import baColchao from '@/assets/quiz-antes-depois/colchao.webp';
import baCadeiras from '@/assets/quiz-antes-depois/cadeiras.webp';
import baTapete from '@/assets/quiz-antes-depois/tapete.webp';
import carpetVideo from '@/assets/alcatifa-processo/extracao.mp4';
import imperVideo from '@/assets/before-after-pool/imper-agua-01.mp4';
import carpetPoster from '@/assets/quiz-videos-capas/alcatifa.jpg';
import imperPoster from '@/assets/quiz-videos-capas/imper.jpg';
import matTecido from '@/assets/widget-materiais/sofa-tecido.webp';
import matPele from '@/assets/widget-materiais/sofa-pele.webp';
import matComum from '@/assets/quiz-materiais/tapete-la-inteiro.webp';
import matJuta from '@/assets/quiz-materiais/tapete-juta-inteiro.webp';
import imperSofaPhoto from '@/assets/quiz-materiais/sofa-impermeabilizado.webp'; // sofá real impermeabilizado, água em gotas (dono, 25 Nov)
import imperChairPhoto from '@/assets/quiz-materiais/cadeiras-inteiras.webp';

const VisitBasketLazy = lazy(() => import('@/components/quiz/VisitBasket'));

export type StepKind = 'sofa' | 'chairs' | 'mattress' | 'rug' | 'carpet' | 'imper';
type Material = 'tecido' | 'pele' | 'comum' | 'natural';
interface Props { kind: StepKind; city: string; source: string; onCity?: (city: string) => void; material?: Material; piece?: 'sofa' | 'chairs' }

// As funções de preço do cesto: um só cálculo no site (nunca uma cópia).
type Calc = typeof import('@/components/quiz/VisitBasket');
let calcModule: Calc | null = null;
let calcPromise: Promise<Calc> | null = null;
const loadCalc = () => (calcPromise ??= import('@/components/quiz/VisitBasket').then(m => (calcModule = m)).catch(e => { calcPromise = null; throw e; }));

const PACKS: { pack: BasketPack; name: string; note: string; wa: string }[] = [
  { pack: 'premium', name: 'Blindado', note: 'Limpeza + Premium, até 10 anos', wa: 'limpeza + impermeabilização Premium, proteção anti-manchas e anti-líquidos até 10 anos' },
  { pack: 'essencial', name: 'Protegido', note: 'Limpeza + Essencial, 1 a 2 anos', wa: 'limpeza + impermeabilização Essencial, proteção anti-manchas e anti-líquidos de 1 a 2 anos' },
  { pack: 'none', name: 'Renovado', note: 'Só limpeza', wa: 'só limpeza, sem impermeabilização' },
];
const IMPER: typeof PACKS = [
  { pack: 'premium', name: 'Premium', note: 'À base de solvente, até 10 anos', wa: 'impermeabilização Premium' },
  { pack: 'essencial', name: 'Essencial', note: 'À base de água, 1 a 2 anos', wa: 'impermeabilização Essencial' },
];
const MATERIALS: Partial<Record<StepKind, { ask: string; options: { id: Material; label: string; photo: string }[] }>> = {
  sofa: { ask: 'O seu sofá é de que material?', options: [{ id: 'tecido', label: 'Tecido', photo: matTecido }, { id: 'pele', label: 'Pele / couro', photo: matPele }] },
  rug: { ask: 'O seu tapete é de que material?', options: [{ id: 'comum', label: 'Sintético ou lã', photo: matComum }, { id: 'natural', label: 'Juta ou sisal', photo: matJuta }] },
};
const SEATS = [1, 2, 3, 4, 5, 6];
const CHAIRS = [2, 4, 6, 8, 10, 12];
const CHAIR_MAX = 100;
const MATTRESS = [{ id: 'solteiro', label: 'Solteiro' }, { id: 'casal', label: 'Casal' }, { id: 'king', label: 'King / Queen' }];
const SIZES = {
  rug: [{ label: 'Pequeno', w: '1,2', l: '1,7' }, { label: 'Médio', w: '1,6', l: '2,3' }, { label: 'Grande', w: '2', l: '3' }, { label: 'Muito grande', w: '2,5', l: '3,5' }],
  carpet: [{ label: 'Quarto', w: '3', l: '4' }, { label: 'Sala', w: '4', l: '6' }, { label: 'Escritório', w: '6', l: '8' }, { label: 'Espaço grande', w: '10', l: '10' }],
};
const FIRST_CITIES = ['Lisboa', 'Porto', 'Vila Nova de Gaia', 'Sintra', 'Cascais', 'Braga'];
// Passo da localidade no telemóvel: a fotografia real do artigo em cima (as do antes e depois do orçamento), para o
// ecrã encher com conteúdo e nunca com botões esticados (dono, 25 Nov: "achas que a disposição disto é assim?").
// Impermeabilização e alcatifa: o vídeo real do trabalho a passar (dono, 25 Nov: "isto deveria ser vídeo").
const CITY_PHOTO: Record<StepKind, { src: string; pair: boolean; video?: string }> = { sofa: { src: baSofa, pair: true }, mattress: { src: baColchao, pair: true }, chairs: { src: baCadeiras, pair: true }, rug: { src: baTapete, pair: true }, carpet: { src: carpetPoster, pair: false, video: carpetVideo }, imper: { src: imperPoster, pair: false, video: imperVideo } };
const num = (v: string) => { const n = parseFloat(v.replace(',', '.')); return n > 0 ? n : 0; };
const seatId = (n: number) => `${n}-${n === 1 ? 'lugar' : 'lugares'}`;

function PriceTag({ shown, struck: raw, on = false }: { shown: number | null; struck: number | null; on?: boolean }) {
  if (shown === null) return <span className={`text-xs font-semibold ${on ? 'text-[#0B2F2A]' : 'text-[#D4AF37]'}`}>Sob orçamento</span>;
  const struck = raw !== null && raw - shown >= 5 ? raw : null; // poupança de trocos não se mostra (dono, 25 Nov)
  return <span className="flex shrink-0 flex-col items-end leading-tight">
    <span className="flex items-baseline gap-1.5 whitespace-nowrap">{struck !== null && <span className={`text-xs line-through ${on ? 'text-[#0B2F2A]/70' : 'text-[#888]'}`}>{formatEuro(struck)}</span>}<span className="text-lg font-bold">{formatEuro(shown)}</span></span>
    {struck !== null && <span className={`whitespace-nowrap text-[11px] font-bold ${on ? 'text-[#0B2F2A]' : 'text-[#D4AF37]'}`}>Poupa {formatEuro(Math.round((struck - shown) * 100) / 100)}</span>}
  </span>;
}

const tile = (on: boolean) => `rounded-2xl border-2 font-semibold transition-colors ${on ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#E8C964] text-[#0B2F2A]' : 'border-[#E5E0D3] bg-white text-[#1A1A1A] hover:border-[#D4AF37]'}`;

/** Cartões com fotografia (material, peça): a escolha é o próprio botão e enche o ecrã. Sofás sempre na horizontal
 *  (dono, 24 Nov 2026: "tem que ser 2 fotos horizontal se for sofá"); as outras peças, na vertical. */
function PhotoCards<T extends string>({ ask, options, onPick, wide = false }: { ask: string; options: { id: T; label: string; photo: string }[]; onPick: (id: T) => void; wide?: boolean }) {
  return <>
    <p className="mb-3 text-lg font-semibold text-[#1A1A1A] md:text-xl">{ask}</p>
    <div className={`grid gap-3 md:grid-cols-2 md:gap-5 ${wide ? '' : 'grid-cols-2'}`}>
      {options.map(o => <button key={o.id} type="button" onClick={() => onPick(o.id)} className={`group relative overflow-hidden ${wide ? 'h-[150px] w-full md:h-44' : 'h-44 md:h-52'} rounded-2xl text-left shadow-[0_18px_40px_-18px_rgba(11,47,42,0.55)] ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]`}>
        <img src={o.photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-[#071a12]/80 via-transparent to-transparent" aria-hidden />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-3 md:p-5"><span className="whitespace-nowrap font-playfair text-[17px] font-semibold leading-tight text-white md:text-2xl">{o.label}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br md:h-10 md:w-10 from-[#E8C964] to-[#D4AF37] text-[#0B2F2A]"><ChevronRight className="h-5 w-5" strokeWidth={2.5} aria-hidden /></span></span>
      </button>)}
    </div>
  </>;
}
/** Depois de escolher, os cartões encolhem para uma linha. */
function Pills<T extends string>({ label, options, value, onPick }: { label: string; options: { id: T; label: string }[]; value: T; onPick: (id: T) => void }) {
  return <div className="mb-2 grid grid-cols-2 gap-2 md:mb-3" role="group" aria-label={label}>
    {options.map(o => <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onPick(o.id)} className={`flex h-11 min-h-0 items-center justify-center gap-1.5 text-sm ${tile(value === o.id)}`}>{value === o.id && <Check className="h-4 w-4 shrink-0 text-[#0B2F2A]" strokeWidth={3} aria-hidden />}{o.label}</button>)}
  </div>;
}

export default function StepPricePicker({ kind, city, source, onCity, material: fixedMaterial, piece: fixedPiece }: Props) {
  const [piece, setPiece] = useState<'sofa' | 'chairs' | null>(fixedPiece ?? null);
  const [material, setMaterial] = useState<Material | null>(fixedMaterial ?? null);
  const [counts, setCounts] = useState<SofaCounts>({});
  const [mCounts, setMCounts] = useState<Record<string, number>>({});
  const [qty, setQty] = useState(0);
  const [ownQty, setOwnQty] = useState(false);
  const [dims, setDims] = useState({ w: '', l: '' });
  const [pack, setPack] = useState<BasketPack | null>(null);
  const [extra, setExtra] = useState(false); // anti-ácaros (colchão) ou anti-odor (tapete, alcatifa)
  const [basket, setBasket] = useState<BasketItem[] | null>(null);
  const [calc, setCalc] = useState<Calc | null>(calcModule);
  const uid = useRef(`p${Date.now()}`).current;

  const what: 'sofa' | 'chairs' | 'mattress' | 'rug' | 'carpet' | null = kind === 'imper' ? piece : kind;
  const imper = kind === 'imper';
  const leather = material === 'pele';
  const mat = MATERIALS[kind];
  const isRug = what === 'rug' || what === 'carpet';

  const group = (over: Partial<BasketItem> = {}): BasketItem[] => {
    const base = { pack: 'none' as BasketPack, ...(leather ? { leather: true } : {}), ...(imper ? { imperOnly: true } : {}), ...over };
    if (what === 'sofa') return SEATS.filter(n => (counts[seatId(n)] ?? 0) > 0).map(n => ({ id: `${uid}-${n}`, kind: 'sofa', size: n === 6 ? '5-lugares' : seatId(n), ...(n === 6 ? { seats: 6 } : {}), qty: counts[seatId(n)], ...base }));
    if (what === 'mattress') return MATTRESS.filter(m => (mCounts[m.id] ?? 0) > 0).map(m => ({ id: `${uid}-${m.id}`, kind: 'mattress', size: m.id, qty: mCounts[m.id], ...base }));
    if (what === 'chairs') return qty > 0 ? [{ id: uid, kind: 'chairs', qty, ...base }] : [];
    if (isRug) return num(dims.w) && num(dims.l) ? [{ id: uid, kind: what, qty: 1, width: dims.w, length: dims.l, ...(kind === 'rug' ? { rugMaterial: material === 'natural' ? 'juta ou sisal' : 'sintético ou lã' } : {}), ...base }] : [];
    return [];
  };
  const withExtra = (on: boolean): Partial<BasketItem> => (what === 'mattress' ? { pack: on ? 'premium' : 'none' } : isRug ? { odor: on } : {});

  const pieceOk = what !== null;
  const materialOk = !mat || material !== null;
  const sized = pieceOk && materialOk && group().length > 0;
  const needsPack = (what === 'sofa' || what === 'chairs') && !leather;
  const ready = !!city && sized && (!needsPack || pack !== null);
  const chosen: Partial<BasketItem> = needsPack ? { pack: pack ?? 'none' } : withExtra(extra);

  // O cálculo carrega quando se começa a escolher, para já lá estar quando os preços aparecem.
  const started = pieceOk && (materialOk || sized);
  useEffect(() => { if (started && !calc) loadCalc().then(setCalc).catch(() => undefined); }, [started, calc]);
  // A barra fixa do WhatsApp volta a ver se esta secção já tem botão.
  useEffect(() => { window.dispatchEvent(new Event('resize')); }, [ready]);
  const warm = () => { if (!calcModule) loadCalc().catch(() => undefined); };

  const price = (over: Partial<BasketItem>) => (calc && city && sized ? calc.optionPrice(city, [], group(over)) : { shown: null, struck: null });
  const total = ready ? price(chosen).shown : null;
  const add = () => { const on = price(withExtra(true)), off = price(withExtra(false)); const plus = on.shown !== null && off.shown !== null ? Math.max(0, Math.round((on.shown - off.shown) * 100) / 100) : null; const sum = (l: BasketItem[]) => l.reduce<number | null>((t, x) => { const v = calc!.struckOf(city, x); return t === null || v === null ? null : t + v; }, 0); const a = calc ? sum(group(withExtra(true))) : null, b = calc ? sum(group(withExtra(false))) : null; const was = a !== null && b !== null ? Math.round((a - b) * 100) / 100 : null; return { plus, was: was !== null && plus !== null && was - plus >= 5 ? was : null }; };
  const gift = calc && ready ? calc.giftsUnlocked(city, [], group(chosen)) : null;

  const pickMaterial = (m: Material) => { if (m === material) return; setMaterial(m); setPack(null); warm(); };
  const options = imper ? IMPER : PACKS;
  const option = options.find(o => o.pack === pack);

  const describe = () => {
    if (what === 'sofa') return leather ? sofaWhat(counts, 'sofá de pele', 'sofás de pele') : sofaWhat(counts);
    if (what === 'chairs') return `${qty} ${qty === 1 ? 'cadeira' : 'cadeiras'}`;
    if (what === 'mattress') return MATTRESS.filter(m => mCounts[m.id] > 0).map(m => `${mCounts[m.id]} ${mCounts[m.id] === 1 ? 'colchão' : 'colchões'} ${m.label.toLowerCase()}`).join(' e ');
    return `${what === 'carpet' ? 'uma alcatifa' : `um tapete (${material === 'natural' ? 'juta ou sisal' : 'sintético ou lã'})`} de mais ou menos ${dims.w} x ${dims.l} m`;
  };
  const service = () => {
    if (imper) return `da impermeabilização ${option?.name} para ${describe()}`;
    if (leather) return `da limpeza e tratamento da pele (limpeza e hidratação) para ${describe()}`;
    if (needsPack) return `do pack ${option?.name} (${option?.wa}) para ${describe()}`;
    if (what === 'mattress') return `da limpeza${extra ? ' com anti-ácaros (produto Bactran)' : ''} para ${describe()}`;
    return `da lavagem${extra ? ' com anti-odor' : ''} de ${describe()}`;
  };
  const photo = what === 'sofa' ? (group().reduce((n, x) => n + x.qty, 0) > 1 ? 'a fotografia dos sofás' : 'a fotografia do sofá') : what === 'chairs' ? 'a fotografia das cadeiras' : 'fotografias';
  const msg = `Olá! Gostaria de saber o preço e a disponibilidade ${service()}, ${cityPrep(city)} ${city}${total !== null ? `, por ${formatEuro(total)}` : ''}. Envio ${photo}.`;


  const title = (text: string, hint?: string) => <p className="mb-2 text-sm font-semibold text-[#1A1A1A] md:mb-3 md:text-base">{text}{hint && <span className="font-normal text-[#666]"> {hint}</span>}</p>;
  const bumpMattress = (id: string, d: number) => setMCounts(c => ({ ...c, [id]: Math.max(0, Math.min(9, (c[id] ?? 0) + d)) }));

  // ── Passos da esquerda ──
  let questions: ReactNode;
  if (!city) {
    questions = <>
      <div className="relative mb-4 overflow-hidden rounded-2xl md:hidden">
        {CITY_PHOTO[kind].video
          ? <video key={CITY_PHOTO[kind].video} src={CITY_PHOTO[kind].video} poster={CITY_PHOTO[kind].src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" className="h-[210px] w-full object-cover" style={kind === 'imper' ? { objectPosition: '50% 45%' } : undefined} />
          : <img src={CITY_PHOTO[kind].src} alt="" width={520} height={440} loading="lazy" decoding="async" className="h-[210px] w-full object-cover" />}
        {CITY_PHOTO[kind].pair && <><span className="absolute left-2.5 top-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Antes</span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Depois</span></>}
      </div>
      <p className="mb-2.5 text-lg font-semibold text-[#1A1A1A] md:mb-3">Onde é o serviço?</p>
      <div className="grid grid-cols-2 gap-2">{FIRST_CITIES.map(c => <button key={c} type="button" onClick={() => { warm(); onCity?.(c); }} className={`min-h-[52px] px-2 text-base ${tile(false)}`}>{c}</button>)}</div>
      <select aria-label="Outra localidade" value="" onChange={e => onCity?.(e.target.value)} className="mt-2 h-[52px] w-full rounded-2xl border-2 border-[#D4AF37] bg-white px-3 text-sm font-semibold text-[#1A1A1A]">
        <option value="" disabled>Outra localidade</option>
        {cities.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
      </select>
    </>;
  } else if (!pieceOk) {
    questions = <PhotoCards ask="O que quer impermeabilizar?" options={[{ id: 'sofa' as const, label: 'Sofá', photo: imperSofaPhoto }, { id: 'chairs' as const, label: 'Cadeiras', photo: imperChairPhoto }]} onPick={p => { setPiece(p); warm(); }} />;
  } else if (mat && material === null) {
    questions = <PhotoCards ask={mat.ask} options={mat.options} onPick={pickMaterial} wide={kind === 'sofa'} />;
  } else {
    questions = <>
      {imper && <Pills label="Peça" options={[{ id: 'sofa' as const, label: 'Sofá' }, { id: 'chairs' as const, label: 'Cadeiras' }]} value={piece!} onPick={p => { setPiece(p); setPack(null); }} />}
      {mat && !fixedMaterial && <Pills label={mat.ask} options={mat.options} value={material!} onPick={pickMaterial} />}
      {what === 'sofa' && (sized
        ? <SofaCounters counts={counts} onChange={setCounts} hideSummary />
        : <>
            {title('Quantos lugares?', 'Pode juntar vários')}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">{SEATS.map(n => <button key={n} type="button" onClick={() => setCounts(c => ({ ...c, [seatId(n)]: 1 }))} aria-label={`Juntar um sofá de ${n} ${n === 1 ? 'lugar' : 'lugares'}`} className={`flex min-h-[104px] [@media(max-height:699px)]:min-h-[76px] [@media(max-height:699px)]:py-1 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[17px] md:min-h-[128px] md:text-base ${tile(false)}`}>
              <QuizFurnitureImage service="sofa" sizeId={seatId(Math.min(n, 4))} className="h-[52px] w-24 [@media(max-height:699px)]:h-8 [@media(max-height:699px)]:w-20 md:h-12 md:w-16" />{n === 1 ? '1 lugar' : `${n} lugares`}
              <span className="flex items-center text-[11px] text-[#D4AF37]"><Plus className="mr-0.5 h-3 w-3" strokeWidth={3} aria-hidden />Juntar</span>
            </button>)}</div>
            <p className="mt-2 text-xs leading-snug text-[#666]">Canto, em U ou mais de 6 lugares: preço pela fotografia no WhatsApp.</p>
          </>)}
      {what === 'mattress' && <>
        {title('Que tamanho?', 'Pode juntar vários')}
        <div className={`grid gap-2 ${MATTRESS.some(x => (mCounts[x.id] ?? 0) > 0) ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>{MATTRESS.map(m => { const n = mCounts[m.id] ?? 0; const wide = !MATTRESS.some(x => (mCounts[x.id] ?? 0) > 0); return (
          <div key={m.id} role="button" tabIndex={0} aria-pressed={n > 0} onClick={() => { if (!n) bumpMattress(m.id, 1); }} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !n) { e.preventDefault(); bumpMattress(m.id, 1); } }} className={`flex cursor-pointer select-none items-center justify-center gap-0.5 px-1 py-2 text-center text-sm ${wide ? 'max-sm:min-h-[104px] max-sm:[@media(min-height:700px)]:min-h-[128px] max-sm:justify-between max-sm:px-5 max-sm:text-lg sm:flex-col' : 'flex-col'} ${tile(n > 0)}`}>
            <QuizFurnitureImage service="mattress" sizeId={m.id} className={wide ? 'h-20 w-28 sm:h-10 sm:w-14' : 'h-10 w-14'} />{m.label}
            {n > 0 ? <span className="mt-0.5 flex items-center gap-1">
              <button type="button" aria-label={`Menos um colchão ${m.label}`} onClick={e => { e.stopPropagation(); bumpMattress(m.id, -1); }} className="grid h-8 min-h-0 w-8 min-w-0 place-items-center rounded-full bg-white/80 text-[#0B2F2A]"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-4 text-center text-base font-bold">{n}</span>
              <button type="button" aria-label={`Mais um colchão ${m.label}`} onClick={e => { e.stopPropagation(); bumpMattress(m.id, 1); }} className="grid h-8 min-h-0 w-8 min-w-0 place-items-center rounded-full bg-[#0B2F2A] text-[#D4AF37]"><Plus className="h-3.5 w-3.5" strokeWidth={3} /></button>
            </span> : <span className="mt-0.5 flex h-8 items-center text-[11px] text-[#D4AF37]"><Plus className="mr-0.5 h-3 w-3" strokeWidth={3} aria-hidden />Juntar</span>}
          </div>); })}</div>
      </>}
      {what === 'chairs' && <>
        {title('Quantas cadeiras?')}
        <div className={`grid gap-2 md:grid-cols-3 ${sized ? 'grid-cols-3' : 'grid-cols-2'}`}>{CHAIRS.map(n => <button key={n} type="button" aria-pressed={!ownQty && qty === n} onClick={() => { setOwnQty(false); setQty(n); warm(); }} className={`${sized ? 'h-10 min-h-0 text-sm' : 'flex min-h-[112px] [@media(max-height:699px)]:min-h-[84px] flex-col items-center justify-center gap-1 text-[17px] md:min-h-[104px] md:text-base'} ${tile(!ownQty && qty === n)}`}>{!sized && <QuizFurnitureImage service="chairs" className="h-16 w-16 [@media(max-height:699px)]:h-10 [@media(max-height:699px)]:w-10 md:h-12 md:w-12" />}{n} cadeiras</button>)}</div>
        {!ownQty && !sized && <button type="button" onClick={() => { setOwnQty(true); setQty(0); warm(); }} className={`mt-2 h-12 w-full text-base ${tile(false)}`}>Outro número</button>}
        {ownQty && !sized && <label className="mt-2 flex items-center justify-between gap-3 rounded-2xl border-2 border-[#D4AF37]/60 bg-white px-3 py-1.5">
          <span className="text-sm font-semibold text-[#1A1A1A]">Número de cadeiras</span>
          <input autoFocus inputMode="numeric" enterKeyHint="done" maxLength={3} aria-label="Número de cadeiras" onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }} onBlur={e => { const n = Math.min(CHAIR_MAX, Number(e.target.value.replace(/\D/g, ''))); if (n > 0) setQty(n); else setOwnQty(false); }} className="h-11 w-24 rounded-xl border-2 border-[#E5E0D3] text-center text-lg font-bold outline-none focus:border-[#D4AF37]" />
        </label>}
        {sized && <div className="mt-2 flex items-center justify-between rounded-2xl border-2 border-[#E5E0D3] bg-white p-1">
          <button type="button" aria-label="Menos uma cadeira" onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-9 min-h-0 w-9 min-w-0 place-items-center rounded-xl bg-[#EEF1EE] text-[#0B2F2A]"><Minus className="h-4 w-4" /></button>
          <span className="text-base font-semibold text-[#1A1A1A]">{qty} {qty === 1 ? 'cadeira' : 'cadeiras'}</span>
          <button type="button" aria-label="Mais uma cadeira" onClick={() => setQty(q => Math.min(CHAIR_MAX, q + 1))} className="grid h-9 min-h-0 w-9 min-w-0 place-items-center rounded-xl bg-[#EEF1EE] text-[#0B2F2A]"><Plus className="h-4 w-4" /></button>
        </div>}
      </>}
      {isRug && <>
        {title(what === 'carpet' ? 'Qual é o espaço?' : 'Que tamanho tem?')}
        <div className="grid grid-cols-2 gap-2">{SIZES[what as 'rug' | 'carpet'].map(z => <button key={z.label} type="button" aria-pressed={dims.w === z.w && dims.l === z.l} onClick={() => { setDims({ w: z.w, l: z.l }); warm(); }} className={`flex flex-col items-start px-3 py-2 text-left text-sm leading-tight ${tile(dims.w === z.w && dims.l === z.l)}`}>{z.label}<span className="text-xs font-semibold opacity-70">{z.w} × {z.l} m</span></button>)}</div>
        <p className="mb-1 mt-2 text-xs font-semibold text-[#666]">Ou escreva a medida, em metros</p>
        <div className="grid grid-cols-2 gap-2">
          <input inputMode="decimal" aria-label="Largura em metros" placeholder="Largura (2,0)" value={dims.w} onChange={e => { setDims(d => ({ ...d, w: e.target.value })); warm(); }} className="h-11 rounded-xl border-2 border-[#E5E0D3] bg-white px-3 text-base outline-none focus:border-[#D4AF37]" />
          <input inputMode="decimal" aria-label="Comprimento em metros" placeholder="Comprimento (3,0)" value={dims.l} onChange={e => { setDims(d => ({ ...d, l: e.target.value })); warm(); }} className="h-11 rounded-xl border-2 border-[#E5E0D3] bg-white px-3 text-base outline-none focus:border-[#D4AF37]" />
        </div>
      </>}
    </>;
  }

  const row = (on: boolean) => `flex min-h-[54px] max-md:[@media(min-height:700px)]:min-h-[70px] w-full items-center justify-between gap-2 px-3.5 py-1.5 text-left md:min-h-[72px] md:px-5 ${tile(on)}`;
  const text = (name: string, note: string) => <span className="min-w-0"><span className="block text-base font-bold leading-tight md:text-lg">{name}</span><span className="block text-xs font-normal leading-snug opacity-75 md:text-sm">{note}</span></span>;
  const addOn = () => { const a = add(); return a.plus === null ? null : <span className="flex shrink-0 flex-col items-end leading-tight">{a.was !== null && <span className="text-[11px] opacity-60 line-through">+{formatEuro(a.was)}</span>}<span className="text-lg font-bold">{a.plus > 0 ? `+${formatEuro(a.plus)}` : 'Oferecido'}</span></span>; };
  const area = isRug ? (Math.round(num(dims.w) * num(dims.l) * 100) / 100).toLocaleString('pt-PT') : '';

  return (
    <div data-price-picker className={`mx-auto grid w-full gap-2.5 md:gap-8 ${sized ? 'max-w-4xl md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : 'max-w-2xl'}`} onPointerDown={warm}>
      <div>{questions}</div>
      {city && sized && <div className="flex flex-col">
        <div className="flex flex-col gap-2">
          {needsPack && options.map(o => <button key={o.pack} type="button" aria-pressed={pack === o.pack} onClick={() => setPack(o.pack)} className={row(pack === o.pack)}>
            {text(o.name, o.note)}
            <span className="flex items-center gap-2">{calc ? <PriceTag {...price({ pack: o.pack })} on={pack === o.pack} /> : <span className="h-5 w-14 animate-pulse rounded bg-[#E9EBE8]" aria-hidden />}<span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${pack === o.pack ? 'border-[#0B2F2A] bg-[#0B2F2A] text-[#D4AF37]' : 'border-[#D4AF37]'}`}>{pack === o.pack && <Check className="h-3 w-3" strokeWidth={3} />}</span></span>
          </button>)}
          {leather && <div className={row(true)}>{text('Limpeza + tratamento da pele', 'Limpeza e hidratação')}{calc && <PriceTag {...price({})} on />}</div>}
          {what === 'mattress' && <div className={row(!extra)}>{text('Limpeza', 'Extração a fundo, seca em 2 a 5 h')}{calc && <PriceTag {...price({})} on={!extra} />}</div>}
          {isRug && <div className={row(!extra)}>{text(`${what === 'carpet' ? 'Lavagem no local' : 'Lavagem em sua casa'}, ${area} m²`, 'Deslocação incluída, seca em 2 a 5 h')}{calc && <PriceTag {...price({})} on={!extra} />}</div>}
          {(what === 'mattress' || isRug) && <button type="button" aria-pressed={extra} onClick={() => setExtra(v => !v)} className={row(extra)}>
            {text(what === 'mattress' ? 'Com anti-ácaros' : 'Com anti-odor', what === 'mattress' ? 'Produto Bactran, desinfeta o colchão' : 'Para o cheiro de animais ou de urina')}
            <span className="flex items-center gap-2">{calc && addOn()}<span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${extra ? 'border-[#0B2F2A] bg-[#0B2F2A] text-[#D4AF37]' : 'border-[#D4AF37]'}`}>{extra && <Check className="h-3 w-3" strokeWidth={3} />}</span></span>
          </button>}
        </div>
        {gift && <p className="mt-1.5 text-xs font-semibold text-[#D4AF37]">Na mesma visita oferecemos {gift.text}, normalmente {formatEuro(gift.normal)}</p>}
        {ready && <WhatsAppCta href={`${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`} source={source} total={total !== null ? formatEuro(total) : undefined} className="mt-2" />}
        {ready && <PriceCta className="mt-2" icon={<Plus className="cta-icon" strokeWidth={3} aria-hidden="true" />} onClick={() => setBasket(group(chosen))}>Juntar mais artigos</PriceCta>}
        {ready && <p className="mt-1 hidden text-center text-sm text-[#666] md:block">Preço final {cityPrep(city)} {city}, deslocação incluída.</p>}
      </div>}
      {basket && <Suspense fallback={null}><VisitBasketLazy isOpen onClose={() => setBasket(null)} initialCity={city} initialItems={basket} /></Suspense>}
    </div>
  );
}
