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
    { img: 'protecao-vinho-10', title: 'Vinho', text: 'O copo vira e o vinho fica à superfície. Limpa-se com um pano antes de entrar no tecido.' },
    { img: 'protecao-cafe-08', title: 'Café', text: 'O café do pequeno-almoço deixa de ser uma nódoa para sempre.' },
    { img: 'protecao-patas-02', title: 'Animais', text: 'Patas e pelo ficam por cima das fibras e saem com mais facilidade.' },
    { img: 'protecao-sumo-04', title: 'Crianças', text: 'Sumos e iogurtes deixam de ser um susto no sofá da sala.' },
  ],
  chairs: [
    { img: 'protecao-sumo-04', title: 'Sumos', text: 'O que cai do copo fica à superfície e limpa-se com um pano.' },
    { img: 'protecao-vinho-10', title: 'Vinho', text: 'Jantares sem medo: o vinho não entra no tecido.' },
    { img: 'protecao-cafe-08', title: 'Café', text: 'Gotas de café e de molho saem antes de manchar.' },
    { img: 'protecao-patas-02', title: 'Uso diário', text: 'As cadeiras da mesa são as peças mais usadas da casa. Ficam protegidas todos os dias.' },
  ],
};


/** Faixa que desliza sozinha (só quando tem scroll para o lado, ou seja, no telemóvel);
 *  avança um cartão a cada 3,5 s, em scroll suave, e pára de vez quando a pessoa lhe toca. */
function useAutoSlide<T extends HTMLElement>(intervalMs = 3500) {
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

function storyFor(kind: Kind) {
  const pair = BEFORE_AFTER_POOL[kind === 'sofa' ? 'sofa' : 'cadeiras'].find(p => p.kind === 'pair') as { before: string; after: string } | undefined;
  const what = kind === 'sofa' ? 'sofá' : 'cadeiras';
  return [
    { label: 'Antes', image: pair?.before, alt: `${what} antes da limpeza`, text: 'Como o encontrámos: nódoas e sujidade acumulada nas fibras.' },
    { label: 'Depois da limpeza', image: pair?.after, alt: `${what} depois da limpeza`, text: 'Pré-tratamento, escovagem e extração com água. A cor volta.' },
    { label: 'Com proteção', video: kind === 'chairs' ? chairVideo : imperVideo, poster: kind === 'chairs' ? chairPoster : imperPoster, text: 'O líquido fica à superfície e sai com um pano. 24 h e está pronto.' },
  ];
}

export default function WaterproofPackSections({ kind, cityLabel, faqs }: { kind: Kind; cityLabel: string; faqs: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const item = kind === 'sofa' ? 'os sofás' : 'as cadeiras';
  const story = storyFor(kind);
  const spillsRef = useAutoSlide<HTMLDivElement>();
  const storyRef = useAutoSlide<HTMLDivElement>(6000);
  return <>
    {/* 1. O que a proteção evita */}
    <section id="protecao" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37]">Para que serve</p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-4xl text-[#1A1A1A] md:text-4xl">Limpo hoje, <span className={gold}>protegido amanhã</span></h2>
        <p className="mt-2 max-w-2xl text-sm text-[#555] md:mt-3 md:text-base">Depois da limpeza, a impermeabilização cria uma barreira invisível nas fibras: os líquidos ficam à superfície e limpam-se com um pano.</p>
        <div ref={spillsRef} className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {SPILLS[kind].map(s => (
            <article key={s.title} className="w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#E5E0D3] bg-white sm:w-auto">
              <img src={`/images/service-examples/${s.img}-400.webp`} srcSet={`/images/service-examples/${s.img}-400.webp 400w, /images/service-examples/${s.img}-800.webp 800w`} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 72vw"
                alt={`${s.title} derramado num estofo`} width={400} height={300} loading="lazy" decoding="async" className="aspect-[4/3] max-h-[28svh] w-full object-cover sm:max-h-none" />
              <div className="p-4">
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
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37]">Na mesma visita</p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-4xl">Assim ficam {item}, <span className={gold}>do antes à proteção</span></h2>
        <div ref={storyRef} className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-7 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
          {story.map((p, i) => (
            <figure key={p.label} className="w-[78%] shrink-0 snap-start md:w-auto">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/30">
                {p.video
                  ? <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="metadata" className="aspect-[4/5] max-h-[46svh] w-full object-cover md:aspect-square" />
                  : <img src={p.image} alt={p.alt} loading="lazy" decoding="async" className="aspect-[4/5] max-h-[46svh] w-full object-cover md:aspect-square" />}
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37]">Dúvidas</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-4xl text-[#1A1A1A]">O que nos <span className={gold}>perguntam</span></h2>
          <p className="mt-2 hidden text-[#555] md:block">Limpeza e impermeabilização {cityLabel}.</p>
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
