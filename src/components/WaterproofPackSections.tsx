// Secções próprias das páginas de limpeza + impermeabilização (sofá e cadeiras):
// 1. o que a proteção evita (imagens reais do problema), 2. a visita em 4 passos
// com o nosso vídeo real, 3. perguntas compactas. Mobile-first.
import { useEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import imperVideo from '@/assets/before-after-pool/imper-agua-01.mp4';
import imperPoster from '@/assets/before-after-pool/imper-agua-01-poster.webp';
import chairVideo from '@/assets/before-after-pool/imper-agua-cadeira-01.mp4';
import chairPoster from '@/assets/before-after-pool/imper-agua-cadeira-01-poster.webp';

type Kind = 'sofa' | 'chairs';
const gold = 'text-[#D4AF37]';

const SPILLS: Record<Kind, { img: string; title: string; text: string }[]> = {
  sofa: [
    { img: 'protecao-vinho-10', title: 'Refrigerante', text: 'A garrafa entorna e o líquido escorre à superfície. Limpa-se com um pano.' },
    { img: 'protecao-cafe-08', title: 'Café', text: 'O café do pequeno-almoço deixa de ser uma nódoa para sempre.' },
    { img: 'protecao-patas-02', title: 'Água', text: 'Fica em gotas em cima do tecido, sem entrar nas fibras.' },
    { img: 'protecao-sumo-04', title: 'Sumo', text: 'Os sumos das crianças deixam de ser um susto no sofá da sala.' },
  ],
  chairs: [
    { img: 'protecao-sumo-04', title: 'Sumos', text: 'O que cai do copo fica à superfície e limpa-se com um pano.' },
    { img: 'protecao-vinho-10', title: 'Refrigerante', text: 'Jantares sem medo: o líquido fica à superfície.' },
    { img: 'protecao-cafe-08', title: 'Café', text: 'Gotas de café e de molho saem antes de manchar.' },
    { img: 'protecao-patas-02', title: 'Água', text: 'Fica em gotas em cima do tecido. As cadeiras da mesa ficam protegidas todos os dias.' },
  ],
};


/** Faixa que desliza sozinha (só quando tem scroll para o lado, ou seja, no telemóvel);
 *  avança um cartão a cada 3,5 s, em scroll suave, e pára de vez quando a pessoa lhe toca. */
export function useAutoSlide<T extends HTMLElement>(intervalMs = 3500) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stopped = false;
    const stop = () => { stopped = true; };
    el.addEventListener('pointerdown', stop, { passive: true });
    el.addEventListener('touchstart', stop, { passive: true });
    const timer = window.setInterval(() => {
      if (stopped || el.scrollWidth <= el.clientWidth + 4) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const card = el.firstElementChild as HTMLElement | null;
      const step = (card?.offsetWidth ?? el.clientWidth) + 12;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' });
    }, intervalMs);
    return () => { window.clearInterval(timer); el.removeEventListener('pointerdown', stop); el.removeEventListener('touchstart', stop); };
  }, [intervalMs]);
  return ref;
}

export function storyFor(kind: Kind) {
  const pair = BEFORE_AFTER_POOL[kind === 'sofa' ? 'sofa' : 'cadeiras'].find(p => p.kind === 'pair') as { before: string; after: string } | undefined;
  const what = kind === 'sofa' ? 'sofá' : 'cadeiras';
  return [
    { label: 'Antes', image: pair?.before, alt: `${what} antes da limpeza`, text: 'Como o encontrámos: nódoas e sujidade acumulada nas fibras.' },
    { label: 'Depois da limpeza', image: pair?.after, alt: `${what} depois da limpeza`, text: 'Pré-tratamento, escovagem e extração com água. A cor volta.' },
    { label: 'Com proteção', video: kind === 'chairs' ? chairVideo : imperVideo, poster: kind === 'chairs' ? chairPoster : imperPoster, text: 'O líquido fica à superfície e sai com um pano. 24 h e está pronto.' },
  ];
}

export type StoryStep = { label: string; text: string; image?: string; alt?: string; video?: string; poster?: string };

/** Os passos da visita no telemóvel, um de cada vez: 6 s por fotografia, o vídeo até acabar; toque avança. */
export function StoryPlayer({ story, light = false }: { story: StoryStep[]; light?: boolean }) {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    // Só conta quando a história está quase toda à vista; ao entrar, o passo recomeça do zero.
    const io = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); if (e.isIntersecting) setRun(r => r + 1); }, { threshold: 0.85 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const next = () => { setStep(i => (i + 1) % story.length); setRun(r => r + 1); };
  const current = story[step];
  useEffect(() => {
    if (!inView || current.video) return;
    const t = window.setTimeout(next, 6000);
    return () => window.clearTimeout(t);
  }, [inView, step, run]);
  return (
    <div ref={ref} className="mt-5 md:hidden">
      <button type="button" onClick={next} aria-label="Passo seguinte" className={`relative block w-full overflow-hidden rounded-2xl border text-left ${light ? "border-[#E5E0D3] bg-[#efeee7]" : "border-white/15 bg-black/30"}`}>
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1.5">
          {story.map((p, i) => (
            <span key={p.label} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <span key={`${i}-${run}`} className="block h-full bg-[#D4AF37]"
                style={{ width: i < step ? '100%' : '0%', animation: i === step && inView && !current.video ? 'kyro-story 6s linear forwards' : undefined, ...(i === step && current.video ? { width: '100%' } : {}) }} />
            </span>
          ))}
        </div>
        <span className="absolute left-3 top-7 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#D4AF37]">{step + 1} · {current.label}</span>
        {current.video
          ? <video key={`v-${run}`} src={current.video} poster={current.poster} autoPlay muted playsInline onEnded={next} className="aspect-[4/5] max-h-[48svh] w-full object-cover" />
          : <img key={`i-${step}`} src={current.image} alt={current.alt} decoding="async" className="aspect-[4/5] max-h-[48svh] w-full object-cover" />}
      </button>
      <p className={`mt-3 min-h-[2.75rem] text-sm leading-relaxed ${light ? "text-[#536259]" : "text-white/80"}`}>{current.text}</p>
    </div>
  );
}

export default function WaterproofPackSections({ kind, cityLabel, faqs }: { kind: Kind; cityLabel: string; faqs: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const item = kind === 'sofa' ? 'os sofás' : 'as cadeiras';
  const story = storyFor(kind);
  const spillsRef = useAutoSlide<HTMLDivElement>();
  return <>
    {/* 1. O que a proteção evita */}
    <section id="protecao" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="type-section-title font-playfair text-[#111111]">Limpo hoje, <em className="not-italic" style={{ color: "#D4AF37" }}>protegido amanhã</em></h2>
        <div ref={spillsRef} className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-3 lg:grid-cols-4">
          {SPILLS[kind].map(s => (
            <article key={s.title} className="min-w-0 overflow-hidden rounded-2xl border border-[#E5E0D3] bg-white sm:w-auto">
              <img src={`/images/service-examples/${s.img}-400.webp`} srcSet={`/images/service-examples/${s.img}-400.webp 400w, /images/service-examples/${s.img}-800.webp 800w`} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 72vw"
                alt={`${s.title} derramado num estofo`} width={400} height={300} loading="lazy" decoding="async" className="aspect-[4/3] max-h-[28svh] w-full object-cover sm:max-h-none" />
              <div className="p-2.5 sm:p-4">
                <h3 className="font-semibold text-[#1A1A1A]">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#555]">{s.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* 2. A mesma visita em 3 imagens reais: antes, depois da limpeza, com a proteção. */}
    <section id="como-funciona" className="scroll-mt-20 bg-kyro-green py-12 text-white md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="type-section-title font-playfair text-white">Assim ficam {item}, <em className="not-italic" style={{ color: "#D4AF37" }}>do antes à proteção</em></h2>
        {/* Telemóvel: um passo de cada vez, como uma história, com barras de progresso; toque = passo seguinte. */}
        <StoryPlayer story={story} />
        {/* Computador: os 3 passos lado a lado. */}
        <div className="mt-7 hidden gap-5 md:grid md:grid-cols-3">
          {story.map((p, i) => (
            <figure key={p.label}>
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/30">
                {p.video
                  ? <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="metadata" className="aspect-square max-h-[46svh] w-full object-cover" />
                  : <img src={p.image} alt={p.alt} loading="lazy" decoding="async" className="aspect-square max-h-[46svh] w-full object-cover" />}
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#D4AF37]">{i + 1} · {p.label}</span>
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-white/80">{p.text}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/55">Fotografias e vídeo reais de serviços da nossa equipa.</p>
      </div>
    </section>

    {/* 3. Perguntas: poucas, compactas */}
    <section id="perguntas" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12">
        <div>
          <h2 className="type-section-title font-playfair text-[#111111]">O que nos <em className="not-italic" style={{ color: "#D4AF37" }}>perguntam</em></h2>
        </div>
        <div className="divide-y divide-[#E5E0D3] overflow-hidden rounded-2xl border border-[#E5E0D3] bg-white">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.question}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left md:px-5 md:py-4">
                  <span className={`font-semibold ${isOpen ? 'text-[#1A1A1A]' : 'text-[#333]'}`}>{f.question}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${isOpen ? 'bg-[#D4AF37] text-white' : 'bg-[#F3F0E7] text-[#D4AF37]'}`}>{isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <p className="overflow-hidden px-5 text-[15px] leading-relaxed text-[#555]"><span className="block pb-4">{f.answer}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  </>;
}
