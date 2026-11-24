import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** Linha dourada por baixo do menu que mostra quanto falta ler do elemento com este `id`. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = 0;
      const target = document.getElementById(targetId);
      if (!target || !bar.current) return;
      const { top, height } = target.getBoundingClientRect();
      const start = 120;
      const done = Math.min(1, Math.max(0, (start - top) / Math.max(1, height - window.innerHeight + start)));
      bar.current.style.transform = `scaleX(${done})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); if (frame) cancelAnimationFrame(frame); };
  }, [targetId]);
  return <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 z-40 h-[3px]" style={{ top: 'var(--header-h, 57px)' }}><div ref={bar} className="h-full origin-left bg-[#D4AF37]" style={{ transform: 'scaleX(0)' }} /></div>;
}

export interface TocItem { id: string; label: string }

/** Índice de um texto corrido: fechado no telemóvel, ao lado e a acompanhar a leitura no computador. */
export default function ReadingToc({ title, items }: { title: string; items: TocItem[] }) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id); }, { rootMargin: '-15% 0px -75% 0px' });
    items.forEach(item => { const element = document.getElementById(item.id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [items]);
  return <>
    <details className="group border-b border-[#dfe5df] lg:hidden">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-base font-semibold text-[#173e2b] [&::-webkit-details-marker]:hidden">{title}<ChevronDown className="h-5 w-5 shrink-0 text-[#D4AF37] transition-transform group-open:rotate-180" /></summary>
      <ul className="pb-4">{items.map(item => <li key={item.id}><a href={`#${item.id}`} className="block py-2.5 text-base text-[#505650]">{item.label}</a></li>)}</ul>
    </details>
    <nav aria-label={title} className="sticky top-24 hidden max-h-[calc(100svh-7rem)] overflow-y-auto py-12 lg:block">
      <p className="mb-3 text-base font-semibold text-[#173e2b]">{title}</p>
      <ul className="border-l border-[#dfe5df]">{items.map(item => <li key={item.id}><a href={`#${item.id}`} aria-current={active === item.id ? 'true' : undefined} className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors hover:text-[#111111] ${active === item.id ? 'border-[#D4AF37] font-semibold text-[#111111]' : 'border-transparent text-[#505650] hover:border-[#D4AF37]'}`}>{item.label}</a></li>)}</ul>
    </nav>
  </>;
}
