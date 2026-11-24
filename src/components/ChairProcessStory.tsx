// Passo a passo da limpeza de cadeiras no novo modelo (dono, 24 Nov): o mesmo formato do dos sofás
// (história no telemóvel, cinco cartões no computador), só com material real de cadeiras: par antes e
// depois da galeria e vídeos de pulverização, escovação (Porto 2, Trofa) e extração da equipa.
// Os textos são os do prerender (SERVICE_PROCESS_GUIDES['limpeza-cadeiras']).
import SectionHeader from '@/components/SectionHeader';
import { StoryPlayer, type StoryStep } from '@/components/WaterproofPackSections';
import { BEFORE_AFTER_POOL } from '@/data/beforeAfterPool';
import { SERVICE_PROCESS_GUIDES } from '@/data/serviceProcessGuides';
import sprayVideo from '@/assets/cadeiras-processo/pulverizacao.mp4';
import sprayPoster from '@/assets/cadeiras-processo/pulverizacao-poster.jpg';
import brushVideo from '@/assets/cadeiras-processo/escovacao.mp4';
import brushPoster from '@/assets/cadeiras-processo/escovacao-poster.jpg';
import extractVideo from '@/assets/cadeiras-processo/extracao.mp4';
import extractPoster from '@/assets/cadeiras-processo/extracao-poster.jpg';

function story(): StoryStep[] {
  const pair = BEFORE_AFTER_POOL.cadeiras.find(p => p.kind === 'pair') as { before: string; after: string } | undefined;
  const media = [
    { image: pair?.before },
    { video: sprayVideo, poster: sprayPoster },
    { video: brushVideo, poster: brushPoster },
    { video: extractVideo, poster: extractPoster },
    { image: pair?.after },
  ];
  return SERVICE_PROCESS_GUIDES['limpeza-cadeiras'].steps.map((s, i) => ({ label: s.label, text: s.description, alt: s.alt, ...media[i] }));
}

export default function ChairProcessStory({ city, cityPrep }: { city?: string; cityPrep: string }) {
  const steps = story();
  return <section id="processo" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeader heading={`A limpeza das suas cadeiras${city ? ` ${cityPrep}` : ''}`} goldWord={city || 'passo a passo'} light />
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
