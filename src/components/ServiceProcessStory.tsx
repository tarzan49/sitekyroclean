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

type Service = 'limpeza-tapetes';
const MEDIA: Record<Service, { pool: 'tapete'; heading: string; videos: [string, string][] }> = {
  'limpeza-tapetes': { pool: 'tapete', heading: 'A lavagem do seu tapete', videos: [[rugSpray, rugSprayPoster], [rugBrush, rugBrushPoster], [rugExtract, rugExtractPoster]] },
};

function story(service: Service): StoryStep[] {
  const m = MEDIA[service];
  const pair = BEFORE_AFTER_POOL[m.pool].find(p => p.kind === 'pair') as { before: string; after: string } | undefined;
  const media: Partial<StoryStep>[] = [{ image: pair?.before }, ...m.videos.map(([video, poster]) => ({ video, poster })), { image: pair?.after }];
  const steps = SERVICE_PROCESS_GUIDES[service].steps;
  // O vídeo pelo nome da etapa; sem vídeo próprio, fica o anterior.
  const pick = (label: string, i: number) => /avalia|inspe/i.test(label) ? media[0] : /aplica|pulveri|trat|pré/i.test(label) ? media[1] : /escov/i.test(label) ? media[2] : /extra|lava/i.test(label) ? media[3] : /seca|final|confer|entrega/i.test(label) ? media[4] : i === 0 ? media[0] : null;
  let last = media[0];
  return steps.map((s, i) => { const x = pick(s.label, i) ?? last; last = x; return { label: s.label, text: s.description, alt: s.alt ?? s.label, ...x } as StoryStep; });
}

export function hasProcessStory(service: string): service is Service { return service in MEDIA; }

export default function ServiceProcessStory({ service, city, cityPrep = 'em' }: { service: Service; city?: string; cityPrep?: string }) {
  const steps = story(service);
  return <section id="processo" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeader heading={`${MEDIA[service].heading}${city ? ` ${cityPrep}` : ''}`} goldWord={city || 'passo a passo'} light />
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
