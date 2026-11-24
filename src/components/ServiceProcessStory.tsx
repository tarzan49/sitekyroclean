// Passo a passo com material real da equipa, em formato história no telemóvel (o mesmo StoryPlayer dos sofás):
// fotografia antes, três vídeos (pulverização, escovação, extração) e fotografia depois. Os textos são os do
// SERVICE_PROCESS_GUIDES, os mesmos que o prerender escreve. Tapetes (dono, 24 Nov).
import SectionHeader from '@/components/SectionHeader';
import { StoryPlayer, type StoryStep } from '@/components/WaterproofPackSections';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import { SERVICE_PROCESS_GUIDES } from '@/data/serviceProcessGuides';
import rugSpray from '@/assets/tapete-processo/pulverizacao.mp4';
import rugSprayPoster from '@/assets/tapete-processo/pulverizacao-poster.jpg';
import rugBrush from '@/assets/tapete-processo/escovacao.mp4';
import rugBrushPoster from '@/assets/tapete-processo/escovacao-poster.jpg';
import rugExtract from '@/assets/tapete-processo/extracao.mp4';
import rugExtractPoster from '@/assets/tapete-processo/extracao-poster.jpg';
import carpetExtract from '@/assets/alcatifa-processo/extracao.mp4';
import carpetExtractPoster from '@/assets/alcatifa-processo/extracao-poster.jpg';
import carpetBefore from '@/assets/alcatifa-processo/antes.jpg';
import imperApply from '@/assets/imper-processo/aplicacao.mp4';
import imperApplyPoster from '@/assets/imper-processo/aplicacao-poster.jpg';
import imperWater from '@/assets/before-after-pool/imper-agua-01.mp4';
import imperWaterPoster from '@/assets/before-after-pool/imper-agua-01-poster.webp';

type Service = 'limpeza-tapetes' | 'limpeza-alcatifas' | 'impermeabilizacao';
type Clip = [string, string] | null;
// Ordem: pulverização, escovação, extração. Alcatifas: só há vídeos reais de extração (a mancha a sair).
const MEDIA: Record<Service, { pool?: 'tapete' | 'sofa'; before?: string; end?: [string, string]; heading: string; videos: [Clip, Clip, Clip] }> = {
  'limpeza-tapetes': { pool: 'tapete', heading: 'A lavagem do seu tapete', videos: [[rugSpray, rugSprayPoster], [rugBrush, rugBrushPoster], [rugExtract, rugExtractPoster]] },
  // Impermeabilização: sofá limpo, a aplicação real com a lança, e no fim o líquido a escorrer (teste e cura).
  impermeabilizacao: { pool: 'sofa', heading: 'A proteção dos seus estofos', videos: [[imperApply, imperApplyPoster], null, null], end: [imperWater, imperWaterPoster] },
  'limpeza-alcatifas': { before: carpetBefore, heading: 'A limpeza da sua alcatifa', videos: [null, null, [carpetExtract, carpetExtractPoster]] },
};

function story(service: Service, custom?: { label: string; description: string; alt?: string }[]): StoryStep[] {
  const m = MEDIA[service];
  const pair = m.pool ? BEFORE_AFTER_POOL[m.pool].find(p => p.kind === 'pair') as { before: string; after: string } | undefined : undefined;
  const first = m.end && pair?.after ? pair.after : m.before ?? pair?.before; // imper: começa no sofá já limpo
  const media: (Partial<StoryStep> | null)[] = [{ image: first }, ...m.videos.map(c => c ? { video: c[0], poster: c[1] } : null), m.end ? { video: m.end[0], poster: m.end[1] } : pair?.after ? { image: pair.after } : null];
  const steps = custom && custom.length ? custom : SERVICE_PROCESS_GUIDES[service].steps;
  // O vídeo pelo nome da etapa; sem vídeo próprio, fica o anterior.
  const pick = (label: string, i: number) => /avalia|inspe/i.test(label) ? media[0] : /aplica|pulveri|trat|pré/i.test(label) ? media[1] : /escov/i.test(label) ? media[2] : /extra|lava/i.test(label) ? media[3] : /seca|final|confer|entrega|teste|cura/i.test(label) ? media[4] : i === 0 ? media[0] : null;
  let last = media[0];
  return steps.map((s, i) => { const x = pick(s.label, i) ?? last; last = x; return { label: s.label, text: s.description, alt: s.alt ?? s.label, ...x } as StoryStep; });
}

export function hasProcessStory(service: string): service is Service { return service in MEDIA; }

export default function ServiceProcessStory({ service, city, cityPrep = 'em', steps: custom, heading }: { service: Service; city?: string; cityPrep?: string; steps?: { label: string; description: string }[]; heading?: { text: string; gold: string } }) {
  const steps = story(service, custom);
  return <section id="processo" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeader heading={heading ? heading.text : `${MEDIA[service].heading}${city ? ` ${cityPrep}` : ''}`} goldWord={heading ? heading.gold : city || 'passo a passo'} light />
      <StoryPlayer story={steps} light />
      <div className="mt-6 hidden gap-4 md:grid md:grid-cols-5">
        {steps.map((p, i) => <figure key={p.label + i} className="min-w-0">
          <div className="relative overflow-hidden rounded-xl bg-[#efeee7]">
            {p.video
              ? <video src={p.video} poster={p.poster} autoPlay muted loop playsInline preload="metadata" className="aspect-[3/4] max-h-[44svh] w-full object-cover" />
              : <img src={p.image} alt={p.alt} loading="lazy" decoding="async" className="aspect-[3/4] max-h-[44svh] w-full object-cover" />}
            <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#D4AF37]">{i + 1} · {p.label}</span>
          </div>
          <figcaption className="mt-2 text-sm leading-snug text-[#536259]">{p.text}</figcaption>
        </figure>)}
      </div>
    </div>
  </section>;
}
