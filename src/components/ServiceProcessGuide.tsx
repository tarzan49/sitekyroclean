import { useId, useState } from 'react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import { SERVICE_PROCESS_GUIDES, type ProcessServiceSlug } from '@/data/serviceProcessGuides';

export default function ServiceProcessGuide({ serviceSlug, city, cityPrep = 'em' }: { serviceSlug: ProcessServiceSlug; city?: string; cityPrep?: string }) {
  const guide = SERVICE_PROCESS_GUIDES[serviceSlug];
  const { steps, image } = guide;
  const [active, setActive] = useState(0);
  const id = useId();
  const step = steps[active];
  return <section id="processo" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader overline="Como funciona" heading={`${guide.heading}, passo a passo${city ? ` ${cityPrep}` : ""}`} goldWord={city || ""} subtitle={guide.subtitle} />
      <div className="border border-[#173629]/15 bg-white rounded-sm overflow-hidden">
        <div className="grid grid-cols-5 border-b border-[#173629]/15" role="tablist" aria-label="Etapas do serviço">
          {steps.map((item, i) => <button key={item.label} id={`${id}-tab-${i}`} role="tab" aria-selected={active === i} aria-controls={`${id}-panel`} tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)} onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (i + 1) % steps.length : event.key === 'ArrowLeft' ? (i + steps.length - 1) % steps.length : event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1 : null;
              if (next !== null) { event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
            }}
            className={`min-h-[72px] sm:min-h-20 px-1 py-3 border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#D4AF37] ${active === i ? 'border-[#D4AF37] bg-[#0c241a] text-white' : 'border-transparent text-[#536259] hover:bg-[#f4f5f0]'}`}>
            <span className={`block text-xs mb-1 ${active === i ? 'text-[#D4AF37]' : 'text-[#536259]' }`}>0{i + 1}</span>
            <span className="block text-[11px] sm:text-sm font-semibold">{item.label}</span>
          </button>)}
        </div>
        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="grid md:grid-cols-2 focus-visible:outline focus-visible:outline-[#D4AF37]">
          <div className="relative overflow-hidden bg-[#efeee7]" style={{ aspectRatio: '560 / 340' }}>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 aspect-square">
              <img src={image} alt={step.alt} loading="lazy" decoding="async" className="absolute !max-w-none" style={{ width: '300%', height: '200%', left: `${-(active % 3) * 100}%`, top: `${-Math.floor(active / 3) * 100}%` }} />
            </div>
            <span className="absolute bottom-3 left-3 text-[10px] bg-white/90 px-2 py-1 text-[#536259]">Imagem ilustrativa</span>
          </div>
          <div className="p-5 sm:p-8 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#536259] mb-3">Etapa {active + 1} de {steps.length}</p>
            <h3 className="font-playfair text-2xl sm:text-3xl leading-tight text-[#173629] mb-3">{step.title}</h3>
            <p className="text-sm sm:text-base text-[#536259] leading-relaxed min-h-[84px]">{step.description}</p>
            <div className="flex items-center justify-between gap-3 mt-auto pt-6">
              <button type="button" aria-label="Etapa anterior" disabled={active === 0} onClick={() => setActive(a => a - 1)} className="w-12 h-12 flex items-center justify-center border border-[#173629]/25 text-[#173629] disabled:opacity-25"><ArrowLeft className="w-5 h-5" /></button>
              <button type="button" onClick={() => setActive(a => (a + 1) % steps.length)} className="min-h-12 flex items-center justify-center gap-3 px-5 bg-[#173629] text-white font-semibold text-sm hover:bg-[#254535]">{active === steps.length - 1 ? 'Ver desde o início' : 'Próxima etapa'}<ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
      <a href={image} download={`Kyro-Clean-${serviceSlug}-etapas.webp`} className="inline-flex items-center gap-2 min-h-11 mt-4 text-xs text-[#536259] underline underline-offset-4 hover:text-[#173629]"><Download className="w-4 h-4" />Guardar as imagens das etapas</a>
    </div>
  </section>;
}
