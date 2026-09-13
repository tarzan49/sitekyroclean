import { useState, useId } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import SectionHeader from './SectionHeader';
import type { ProblemTreatmentGuide as Guide } from '@/data/problemTreatmentGuides';

export default function ProblemTreatmentGuide({ guide, slug }: { guide: Guide; slug: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const downloads = [...new Map(guide.steps.map(step => [step.image, step])).values()];
  return <section id="processo" className="scroll-mt-20 bg-kyro-green py-14 md:py-20">
    <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader overline="O nosso cuidado" heading="Como tratamos este" goldWord="problema" subtitle={guide.subtitle} light={false} />
      <div className="border-t border-white/20">
        {guide.steps.map((step, index) => <div key={step.label} className="border-b border-white/20">
          <h3><button id={`${id}-button-${index}`} aria-label={`${index + 1}. ${step.label}`} aria-expanded={active === index} aria-controls={`${id}-panel-${index}`} onClick={() => setActive(active === index ? -1 : index)} className="flex min-h-[68px] w-full items-center gap-4 py-4 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]">
            <span className="text-[#D4AF37] text-sm tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <span className="flex-1 text-base sm:text-lg font-semibold">{step.label}</span>
            <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${active === index ? 'rotate-180' : ''}`} />
          </button></h3>
          <div id={`${id}-panel-${index}`} role="region" aria-labelledby={`${id}-button-${index}`} hidden={active !== index}>
            <div className="grid md:grid-cols-2 gap-5 md:gap-9 pb-6">
              <div className={`relative ${step.cell === undefined ? "aspect-[4/3]" : "aspect-square"} overflow-hidden bg-[#e9e8df]`}>
                <img src={step.image} alt={step.alt} loading="lazy" decoding="async" className="absolute h-full w-full object-cover !max-w-none" style={step.cell === undefined ? undefined : { width: '300%', height: '200%', left: `${-(step.cell % 3) * 100}%`, top: `${-Math.floor(step.cell / 3) * 100}%` }} />
              </div>
              <div className="self-center">
                <p className="text-xl font-semibold leading-tight text-white mb-3">{step.title}</p>
                <p className="text-sm sm:text-base leading-relaxed text-white/75">{step.description}</p>
                <p className="mt-4 text-[11px] text-white/75">Imagem ilustrativa</p>
              </div>
            </div>
          </div>
        </div>)}
      </div>
      <details className="mt-4 text-white/75 text-xs">
        <summary className="cursor-pointer min-h-11 flex items-center gap-2"><Download className="h-4 w-4" />Guardar imagens das etapas<ChevronDown className="h-3 w-3" /></summary>
        <div className="flex flex-wrap gap-x-5 gap-y-1 pb-2">
          {downloads.map((step, index) => <a key={step.image} href={step.image} download={`Kyro-${slug}-${index + 1}.webp`} className="inline-flex min-h-11 items-center underline underline-offset-4">{downloads.length === 1 ? 'Guia visual completo' : step.label}</a>)}
        </div>
      </details>
    </div>
  </section>;
}
