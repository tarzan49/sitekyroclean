// Passo a passo da limpeza de cadeiras no novo modelo (dono, 24 Nov): o mesmo formato do dos sofás
// (história no telemóvel, cinco cartões no computador), só com material real de cadeiras: par antes e
// depois da galeria e vídeos de pulverização, escovação (Porto 2, Trofa) e extração da equipa.
// Os textos são os do prerender (SERVICE_PROCESS_GUIDES['limpeza-cadeiras']).
import SectionHeader from '@/components/SectionHeader';
import { StoryPlayer, type StoryStep } from '@/components/WaterproofPackSections';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import { SERVICE_PROCESS_GUIDES } from '@/data/serviceProcessGuides';
import chairSpray from '@/assets/cadeiras-processo/pulverizacao.mp4';
import chairSprayPoster from '@/assets/cadeiras-processo/pulverizacao-poster.jpg';
import chairBrush from '@/assets/cadeiras-processo/escovacao.mp4';
import chairBrushPoster from '@/assets/cadeiras-processo/escovacao-poster.jpg';
import chairExtract from '@/assets/cadeiras-processo/extracao.mp4';
import chairExtractPoster from '@/assets/cadeiras-processo/extracao-poster.jpg';
// Colchões: um só serviço real da Porto 3 (Eunice, Porto, 21 Nov) para os três vídeos.
import mattressSpray from '@/assets/colchoes-processo/pulverizacao.mp4';
import mattressSprayPoster from '@/assets/colchoes-processo/pulverizacao-poster.jpg';
import mattressBrush from '@/assets/colchoes-processo/escovacao.mp4';
import mattressBrushPoster from '@/assets/colchoes-processo/escovacao-poster.jpg';
import mattressExtract from '@/assets/colchoes-processo/extracao.mp4';
import mattressExtractPoster from '@/assets/colchoes-processo/extracao-poster.jpg';

type Service = 'limpeza-cadeiras' | 'limpeza-colchoes';
const MEDIA: Record<Service, { pool: 'cadeiras' | 'colchao'; heading: string; videos: [string, string][] }> = {
  'limpeza-cadeiras': { pool: 'cadeiras', heading: 'A limpeza das cadeiras', videos: [[chairSpray, chairSprayPoster], [chairBrush, chairBrushPoster], [chairExtract, chairExtractPoster]] },
  'limpeza-colchoes': { pool: 'colchao', heading: 'A limpeza do seu colchão', videos: [[mattressSpray, mattressSprayPoster], [mattressBrush, mattressBrushPoster], [mattressExtract, mattressExtractPoster]] },
};

function story(service: Service, custom?: { label: string; description: string }[]): StoryStep[] {
  const m = MEDIA[service];
  const pair = BEFORE_AFTER_POOL[m.pool].find(p => p.kind === 'pair') as { before: string; after: string } | undefined;
  const media = [{ image: pair?.before }, ...m.videos.map(([video, poster]) => ({ video, poster })), { image: pair?.after }];
  const base = SERVICE_PROCESS_GUIDES[service].steps;
  const list = custom && custom.length ? custom.slice(0, media.length) : base;
  return list.map((s, i) => ({ label: s.label, text: s.description, alt: base[i]?.alt, ...media[i] }));
}

export default function ChairProcessStory({ city, cityPrep, service = 'limpeza-cadeiras', steps: custom, heading }: { city?: string; cityPrep: string; service?: Service; steps?: { label: string; description: string }[]; heading?: { text: string; gold: string } }) {
  const steps = story(service, custom);
  return <section id="processo" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeader heading={heading ? heading.text : `${MEDIA[service].heading}${city ? ` ${cityPrep}` : ''}`} goldWord={heading ? heading.gold : city || 'passo a passo'} light />
      <StoryPlayer story={steps} light />
      <div className="mt-6 hidden gap-4 md:grid md:grid-cols-5">
        {steps.map((p, i) => <figure key={p.label} className="min-w-0">
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
