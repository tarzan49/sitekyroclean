import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { BEFORE_AFTER_POOL, type BeforeAfterCategory } from "@/data/beforeAfterPool";

export default function ServiceResultsGallery({ category, light = false }: { category: BeforeAfterCategory; light?: boolean }) {
  const pool = BEFORE_AFTER_POOL[category];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const item = pool[index];
  const text = light ? "text-[#111111]" : "text-white";
  const control = `inline-flex h-11 min-w-11 items-center justify-center border rounded-full transition-colors hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${light ? "border-black/20" : "border-white/25"}`;

  useEffect(() => {
    if (!playing || dragging || hovered || focused || pool.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % pool.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [playing, dragging, hovered, focused, pool.length]);

  function select(next: number) {
    setPlaying(false);
    setIndex((next + pool.length) % pool.length);
  }

  return (
    <div className={text} role="region" aria-label="Galeria de antes e depois" aria-roledescription="carrossel"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className={`overflow-hidden bg-black/15 ${category === "cadeiras" ? "mx-auto w-[min(100%,348px)] aspect-[9/16]" : "w-full aspect-[4/3]"}`}>
        {item.kind === "pair" ? (
          <BeforeAfterSlider key={index} beforeImage={item.before} afterImage={item.after}
            beforeLabel={category === "impermeabilizacao" ? "Sem proteção" : "Antes"}
            afterLabel={category === "impermeabilizacao" ? "Com proteção" : "Depois"}
            noFrame illustrative={item.illustrative} onDraggingChange={setDragging} />
        ) : (
          <img src={item.image} alt="Resultado de limpeza de tapete, fotografia sem comparação" loading="lazy" decoding="async" className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="text-sm" aria-live={playing ? "off" : "polite"} aria-atomic="true">
          <span className="font-semibold text-gold">{index + 1} / {pool.length}</span>
          <span className="ml-3">{item.kind === "single" ? "Resultado da limpeza" : item.illustrative ? "Efeito ilustrativo" : "Antes e depois"}</span>
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className={control} aria-label="Exemplo anterior" onClick={() => select(index - 1)}><ChevronLeft size={20} /></button>
          <button type="button" className={control} aria-label={playing ? "Pausar galeria" : "Reproduzir galeria"} onClick={() => setPlaying(current => !current)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
          <button type="button" className={control} aria-label="Exemplo seguinte" onClick={() => select(index + 1)}><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2" aria-label="Escolher exemplo">
        {pool.map((example, i) => (
          <button key={i} type="button" aria-label={`Ver exemplo ${i + 1}${example.kind === "pair" && example.illustrative ? ", efeito ilustrativo" : ""}`}
            aria-pressed={i === index} onClick={() => select(i)}
            className={`relative min-h-11 aspect-[4/3] overflow-hidden border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${i === index ? "border-gold" : "border-transparent opacity-65 hover:opacity-100"}`}>
            <img src={example.kind === "pair" ? example.after : example.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 bg-black/75 text-white text-xs px-1.5 py-0.5">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
