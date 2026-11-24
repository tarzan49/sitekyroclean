// Secções próprias dos packs de limpeza + tratamento (anti-ácaros no colchão e no sofá,
// anti-odor no tapete), no mesmo formato das de impermeabilização: 1. o que resolve,
// 2. antes e depois reais (história no telemóvel), 3. perguntas compactas.
// Anti-ácaros: só o que a ficha do Bactran diz; os ácaros saem com a extração.
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import { StoryPlayer, useAutoSlide, type StoryStep } from './WaterproofPackSections';
import type { TreatmentKind } from './TreatmentPackPicker';

const BACTRAN = 'O Bactran elimina 99,9% das bactérias, bolores e odores, segundo a ficha do produto.';
const CARDS: Record<TreatmentKind, { img: string; title: string; text: string }[]> = {
  mattress: [
    { img: 'colchao-residuos-07', title: 'Pó e ácaros', text: 'A extração a fundo retira das fibras o pó, a pele morta e os ácaros que lá vivem.' },
    { img: 'colchao-manchas-02', title: 'Suor e manchas', text: 'Anos de noites deixam suor e marcas amarelas no tecido. A limpeza tira-os.' },
    { img: 'colchao-odores-03', title: 'Bactérias e odores', text: BACTRAN },
    { img: 'colchao-cuidados-04', title: 'Quarto das crianças', text: 'Um colchão limpo e desinfetado, pronto a usar no mesmo dia.' },
  ],
  sofa: [
    { img: 'sofa-residuos-01', title: 'Pó e ácaros', text: 'A extração a fundo retira das almofadas o pó, a pele morta e os ácaros.' },
    { img: 'sofa-odores-05', title: 'Bactérias e odores', text: BACTRAN },
    { img: 'sofa-manchas-02', title: 'Manchas do dia a dia', text: 'Comida, bebida e marcas de uso saem com a limpeza antes do tratamento.' },
    { img: 'sofa-desgaste-06', title: 'Uso diário', text: 'O sofá onde se senta a família toda volta a estar limpo e desinfetado.' },
  ],
  rug: [
    { img: 'tapete-pelos-09', title: 'Animais', text: 'Pelo e cheiro de cão ou gato saem com a lavagem a fundo e o anti-odor.' },
    { img: 'tapete-manchas-07', title: 'Urina e acidentes', text: 'A lavagem tira a mancha; o anti-odor trata o cheiro que fica nas fibras.' },
    { img: 'tapete-residuos-04', title: 'Pó e sujidade', text: 'A extração retira o pó e a sujidade acumulados no fundo do pelo.' },
    { img: 'tapete-desgaste-10', title: 'Uso diário', text: 'O tapete da sala volta a ficar limpo e sem cheiro.' },
  ],
};
const TITLE: Record<TreatmentKind, [string, string]> = {
  mattress: ['Limpo por fora, ', 'desinfetado por dentro'],
  sofa: ['Limpo por fora, ', 'desinfetado por dentro'],
  rug: ['Lavado a fundo, ', 'sem cheiro'],
};

function storyFor(kind: TreatmentKind): StoryStep[] {
  const cat = kind === 'sofa' ? 'sofa' : kind === 'rug' ? 'tapete' : 'colchao';
  const pair = BEFORE_AFTER_POOL[cat].find(p => p.kind === 'pair') as { before: string; after: string } | undefined;
  const what = kind === 'sofa' ? 'sofá' : kind === 'rug' ? 'tapete' : 'colchão';
  return [
    { label: 'Antes', image: pair?.before, alt: `${what} antes da limpeza`, text: 'Como o encontrámos: sujidade e marcas acumuladas nas fibras.' },
    { label: 'Depois', image: pair?.after, alt: `${what} depois da limpeza`, text: kind === 'rug' ? 'Lavagem a fundo em sua casa, com extração. A cor volta.' : 'Pré-tratamento, escovagem e extração com água. Os ácaros saem com a extração.' },
  ];
}

export default function TreatmentPackSections({ kind, faqs }: { kind: TreatmentKind; faqs: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const item = kind === 'rug' ? 'os tapetes' : kind === 'sofa' ? 'os sofás' : 'os colchões';
  const story = storyFor(kind);
  const cardsRef = useAutoSlide<HTMLDivElement>();
  const alt = kind === 'rug' ? 'tapete' : kind === 'sofa' ? 'sofá' : 'colchão';
  return <>
    {/* 1. O que o tratamento resolve */}
    <section id="protecao" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="type-section-title font-playfair text-[#111111]">{TITLE[kind][0]}<em className="not-italic" style={{ color: "#D4AF37" }}>{TITLE[kind][1]}</em></h2>
        <div ref={cardsRef} className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {CARDS[kind].map(s => (
            <article key={s.title} className="w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#E5E0D3] bg-white sm:w-auto">
              <img src={`/images/service-examples/${s.img}-400.webp`} srcSet={`/images/service-examples/${s.img}-400.webp 400w, /images/service-examples/${s.img}-800.webp 800w`} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 72vw"
                alt={`${s.title}: ${alt}`} width={400} height={300} loading="lazy" decoding="async" className="aspect-[4/3] max-h-[28svh] w-full object-cover sm:max-h-none" />
              <div className="p-4">
                <h3 className="font-semibold text-[#1A1A1A]">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#555]">{s.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* 2. Antes e depois reais da mesma visita. */}
    <section id="como-funciona" className="scroll-mt-20 bg-kyro-green py-12 text-white md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="type-section-title font-playfair text-white">Assim ficam {item}, <em className="not-italic" style={{ color: "#D4AF37" }}>do antes ao depois</em></h2>
        <StoryPlayer story={story} />
        <div className="mt-7 hidden max-w-3xl gap-5 md:grid md:grid-cols-2">
          {story.map((p, i) => (
            <figure key={p.label}>
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/30">
                <img src={p.image} alt={p.alt} loading="lazy" decoding="async" className="aspect-square max-h-[46svh] w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#D4AF37]">{i + 1} · {p.label}</span>
              </div>
              <figcaption className="mt-3 text-sm leading-relaxed text-white/80">{p.text}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/55">Fotografias reais de serviços da nossa equipa.</p>
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
