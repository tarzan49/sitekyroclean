import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { BEFORE_AFTER_POOL, type BeforeAfterCategory } from "@/data/beforeAfterPool";

export default function ServiceResultsGallery({ category, light = false, intervalMs = 6000 }: { category: BeforeAfterCategory; light?: boolean; intervalMs?: number }) {
  const pool = BEFORE_AFTER_POOL[category];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const item = pool[index % pool.length];

  useEffect(() => {
    const rail = thumbnailsRef.current;
    const selected = rail?.children[index] as HTMLElement | undefined;
    if (rail && selected) {
      rail.scrollTo({ left: selected.offsetLeft - rail.offsetLeft - (rail.clientWidth - selected.clientWidth) / 2, behavior: "instant" });
    }
  }, [index]);
  const text = light ? "text-[#111111]" : "text-white";
  const control = "inline-flex h-11 min-w-11 items-center justify-center rounded-full transition-colors hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

  useEffect(() => {
    if (!playing || dragging || hovered || focused || pool.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % pool.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [playing, dragging, hovered, focused, pool.length, intervalMs]);

  function select(next: number) {
    setPlaying(false);
    setIndex((next + pool.length) % pool.length);
  }

  return (
    <div className={`w-full min-w-0 [contain:inline-size] ${text}`} role="region" aria-label="Galeria de antes e depois" aria-roledescription="carrossel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className={`overflow-hidden ${category === "cadeiras" ? "mx-auto w-[min(100%,270px)] aspect-[9/16]" : "w-full aspect-[4/3]"}`}>
        {item.kind === "pair" ? (
          <BeforeAfterSlider key={index} beforeImage={item.before} afterImage={item.after}
            beforeLabel={category === "impermeabilizacao" ? "Sem proteção" : "Antes"}
            afterLabel={category === "impermeabilizacao" ? "Com proteção" : "Depois"}
            noFrame illustrative={item.illustrative} onDraggingChange={setDragging} />
        ) : (
          <img src={item.image} alt="Resultado de limpeza de tapete, fotografia sem comparação" loading="lazy" decoding="async" className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 py-2">
        <p className="text-sm" aria-live={playing ? "off" : "polite"} aria-atomic="true">
          <span className="font-semibold text-gold">{index + 1} / {pool.length}</span>
          <span className="ml-2 opacity-60">{item.kind === "single" ? "Fotografia do resultado" : "Arraste para comparar"}</span>
        </p>
        <div className="flex items-center">
          <button type="button" className={control} aria-label="Exemplo anterior" onClick={() => select(index - 1)}><ChevronLeft size={20} /></button>
          <button type="button" className={control} aria-label={playing ? "Pausar galeria" : "Reproduzir galeria"} onClick={() => setPlaying(current => !current)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
          <button type="button" className={control} aria-label="Exemplo seguinte" onClick={() => select(index + 1)}><ChevronRight size={20} /></button>
        </div>
      </div>
      <div ref={thumbnailsRef} className="relative flex gap-2 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:thin]" aria-label="Escolher exemplo">
        {pool.map((example, i) => (
          <button key={i} type="button" aria-label={`Ver exemplo ${i + 1}${example.kind === "pair" && example.illustrative ? ", efeito ilustrativo" : ""}`}
            aria-pressed={i === index} onClick={() => select(i)}
            className={`relative h-12 w-16 shrink-0 overflow-hidden border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"}`}>
            <img src={example.kind === "pair" ? example.after : example.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 bg-black/75 text-white text-sm px-1.5 py-0.5">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
