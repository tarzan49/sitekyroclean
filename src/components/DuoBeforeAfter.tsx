// Antes/depois de duas peças ao mesmo tempo, com um "+" no meio (dono, 24 Nov: pack sofá + colchão).
// Cada metade começa no "Antes" e o "Depois" entra da esquerda para a direita; a cada 4,5 s troca de par.
import { useEffect, useState } from 'react';
import { BEFORE_AFTER_POOL, type BeforeAfterCategory } from '@/data/beforeAfterPool';

type Pair = { before: string; after: string };
const pairs = (c: BeforeAfterCategory) => BEFORE_AFTER_POOL[c].filter(p => p.kind === 'pair') as unknown as Pair[];

function Half({ pair, run, label }: { pair: Pair; run: number; label: string }) {
  return <div className="relative aspect-[3/4] overflow-hidden bg-[#0c241a]">
    <img src={pair.before} alt={`${label} antes da limpeza`} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
    <img key={run} src={pair.after} alt={`${label} depois da limpeza`} decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ animation: 'kyro-reveal 4.5s ease-in-out forwards' }} />
  </div>;
}

export default function DuoBeforeAfter({ left, right, className = '' }: { left: { category: BeforeAfterCategory; label: string }; right: { category: BeforeAfterCategory; label: string }; className?: string }) {
  const a = pairs(left.category), b = pairs(right.category);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setRun(r => r + 1), 4500);
    return () => window.clearInterval(t);
  }, []);
  if (!a.length || !b.length) return null;
  return <div className={`relative grid grid-cols-2 gap-1 ${className}`}>
    <Half pair={a[run % a.length]} run={run} label={left.label} />
    <Half pair={b[run % b.length]} run={run} label={right.label} />
    <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#D4AF37] text-2xl font-bold text-[#0c241a] shadow-lg">+</span>
    <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">Antes · Depois</span>
  </div>;
}
