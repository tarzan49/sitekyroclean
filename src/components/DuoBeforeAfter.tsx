// Antes/depois de duas coisas ao mesmo tempo, com um "+" no meio (dono, 24 Nov: packs).
// Cada metade de fotografia começa no "Antes" e o "Depois" entra da esquerda; a cada 4,5 s troca de par.
// Uma metade pode ser vídeo (impermeabilização: o líquido no próprio artigo), que passa ao seguinte quando acaba.
import { useEffect, useState } from 'react';
import { BEFORE_AFTER_POOL, type BeforeAfterCategory } from '@/data/beforeAfterPool';

type Pair = { before: string; after: string };
type Video = { src: string; poster?: string };
export type DuoSide = { category: BeforeAfterCategory; video?: boolean };

function PairHalf({ items, run }: { items: Pair[]; run: number }) {
  const pair = items[run % items.length];
  return <div className="relative aspect-[3/4] overflow-hidden bg-[#0c241a]">
    <img src={pair.before} alt="Antes da limpeza" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
    <img key={run} src={pair.after} alt="Depois da limpeza" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ animation: 'kyro-reveal 4.5s ease-in-out forwards' }} />
  </div>;
}

function VideoHalf({ items }: { items: Video[] }) {
  const [i, setI] = useState(0);
  const v = items[i % items.length];
  return <div className="relative aspect-[3/4] overflow-hidden bg-[#0c241a]">
    <video key={i} src={v.src} poster={v.poster} autoPlay muted playsInline onEnded={() => setI(n => n + 1)} className="absolute inset-0 h-full w-full object-cover" />
  </div>;
}

export default function DuoBeforeAfter({ left, right, third, className = '' }: { left: DuoSide; right: DuoSide; third?: DuoSide; className?: string }) {
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setRun(r => r + 1), 4500);
    return () => window.clearInterval(t);
  }, []);
  const half = (side: DuoSide) => {
    const pool = BEFORE_AFTER_POOL[side.category] as unknown as ({ kind: string } & Partial<Pair & Video>)[];
    if (side.video) { const vids = pool.filter(p => p.kind === 'video') as unknown as Video[]; return vids.length ? <VideoHalf items={vids} /> : null; }
    const pairs = pool.filter(p => p.kind === 'pair') as unknown as Pair[];
    return pairs.length ? <PairHalf items={pairs} run={run} /> : null;
  };
  // Duas ou três peças lado a lado (sala completa = sofá + cadeiras + tapete), um "+" em cada junção.
  const halves = [left, right, ...(third ? [third] : [])].map(half);
  if (halves.some(h => !h)) return null;
  const n = halves.length;
  return <div className={`relative grid gap-1 ${n === 3 ? 'grid-cols-3' : 'grid-cols-2'} ${className}`}>
    {halves.map((h, i) => <div key={i}>{h}</div>)}
    {Array.from({ length: n - 1 }, (_, i) => <span key={i} aria-hidden="true" style={{ left: `${((i + 1) / n) * 100}%` }} className={`absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#D4AF37] font-bold text-[#0c241a] shadow-lg ${n === 3 ? 'h-8 w-8 text-xl' : 'h-10 w-10 text-2xl'}`}>+</span>)}
    <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">Antes · Depois</span>
  </div>;
}
