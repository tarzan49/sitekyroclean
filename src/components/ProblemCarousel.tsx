import { Children, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

export default function ProblemCarousel({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const narrow = matchMedia('(max-width: 767px)');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setMobile(narrow.matches); setReduced(motion.matches); };
    update(); narrow.addEventListener('change', update); motion.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    if (track.current) observer.observe(track.current);
    return () => { narrow.removeEventListener('change', update); motion.removeEventListener('change', update); observer.disconnect(); };
  }, []);

  const go = (index: number, manual = false) => {
    const el = track.current;
    if (!el) return;
    if (manual) setPaused(true);
    const next = (index + items.length) % items.length;
    const child = el.children[next] as HTMLElement;
    if (child) el.scrollTo({ left: child.offsetLeft - (el.children[0] as HTMLElement).offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    if (!mobile || reduced || paused || hovered || !visible || items.length < 2) return;
    const timer = window.setInterval(() => { if (!document.hidden) go(active + 1); }, 6000);
    return () => clearInterval(timer);
    // go reads the same track and item count represented by these dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mobile, reduced, paused, hovered, visible, items.length]);

  return <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <div ref={track} id={id} aria-label="Problemas e tratamentos" role="region" aria-roledescription="carrossel"
      onPointerDown={() => setPaused(true)} onFocusCapture={() => setPaused(true)}
      onScroll={() => {
        const el = track.current;
        if (!el || !mobile) return;
        const first = el.children[0] as HTMLElement;
        let closest = 0;
        Array.from(el.children).forEach((child, i) => {
          if (Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - el.scrollLeft) < Math.abs((el.children[closest] as HTMLElement).offsetLeft - first.offsetLeft - el.scrollLeft)) closest = i;
        });
        setActive(closest);
      }}
      className="relative flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 -mx-5 px-5 pb-4 md:mx-0 md:px-0 md:overflow-visible md:grid md:grid-cols-2 md:gap-6">
      {items}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 md:hidden">
      <div className="flex items-center gap-1">
        {items.map((_, i) => <button key={i} type="button" aria-label={`Mostrar problema ${i + 1}`} aria-current={active === i ? 'true' : undefined} aria-controls={id} onClick={() => go(i, true)} className="w-8 h-11 flex items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"><span className={`h-1.5 rounded-full transition-all ${active === i ? 'w-6 bg-[#9b7a21]' : 'w-2 bg-[#173629]/25'}`} /></button>)}
      </div>
      <div className="flex gap-1.5">
        {!reduced && <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Retomar avanço automático' : 'Pausar avanço automático'} className="w-11 h-11 flex items-center justify-center text-[#173629] border border-[#173629]/20 rounded-sm">{paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}</button>}
        <button type="button" onClick={() => go(active - 1, true)} aria-label="Problema anterior" aria-controls={id} className="w-11 h-11 flex items-center justify-center border border-[#173629]/20 rounded-sm text-[#173629]"><ArrowLeft className="w-4 h-4" /></button>
        <button type="button" onClick={() => go(active + 1, true)} aria-label="Próximo problema" aria-controls={id} className="w-11 h-11 flex items-center justify-center bg-[#173629] rounded-sm text-white"><ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
    <p className="text-xs text-[#536259] mt-1 md:hidden">{active + 1} de {items.length} · {paused || reduced ? 'Explore com as setas ou deslize.' : 'Avança automaticamente a cada 6 segundos.'}</p>
  </div>;
}
