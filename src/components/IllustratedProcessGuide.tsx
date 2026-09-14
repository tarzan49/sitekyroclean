import { useId, useState } from 'react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';
import type { ProcessGuide } from '@/data/serviceProcessGuides';

export default function IllustratedProcessGuide({ guide, heading, goldWord = '', downloadName, dark = false }: { guide: Omit<ProcessGuide, "steps"> & { steps: (ProcessGuide["steps"][number] & { image?: string; cell?: number })[] }; heading?: string; goldWord?: string; downloadName: string; dark?: boolean }) {
  const { steps, image } = guide;
  const [active, setActive] = useState(0);
  const id = useId();
  const step = steps[active];
  const cell = step.cell ?? active;
  const downloads = [...new Map(steps.filter(item => item.image).map(item => [item.image!, item])).values()];
  return <section id="processo" className={`scroll-mt-20 py-14 md:py-20 ${dark ? "bg-kyro-green" : "bg-[#FDFDF9]"}`}>
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader overline="Como funciona" heading={heading ?? `${guide.heading}, passo a passo`} goldWord={goldWord} subtitle={guide.subtitle} light={!dark} />
      <div className="border border-[#173629]/15 bg-white rounded-sm overflow-hidden">
        <div className={`grid ${steps.length === 6 ? "grid-cols-3 sm:grid-cols-6" : steps.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5"} border-b border-[#173629]/15`} role="tablist" aria-label="Etapas do serviço">
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
          <div className="relative min-w-0 w-full self-start overflow-hidden bg-[#efeee7]" style={{ aspectRatio: '560 / 340' }}>
            {step.image && step.cell === undefined ? <img src={step.image} alt={step.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" width={560} height={340} /> : <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 aspect-square">
              <img src={step.image ?? image} alt={step.alt} loading="lazy" decoding="async" className="absolute !max-w-none" style={{ width: '300%', height: '200%', left: `${-(cell % 3) * 100}%`, top: `${-Math.floor(cell / 3) * 100}%` }} width={400} height={400} />
            </div>}
            <span className="absolute bottom-3 left-3 text-[10px] bg-white/90 px-2 py-1 text-[#536259]">Imagem ilustrativa</span>
          </div>
          <div className="min-w-0 p-5 sm:p-8 flex flex-col">
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
      {downloads.length ? <details className={`mt-4 text-xs ${dark ? "text-white/75" : "text-[#536259]"}`}>
        <summary className="min-h-11 cursor-pointer flex items-center gap-2"><Download className="w-4 h-4" />Guardar imagens das etapas</summary>
        <div className="flex flex-wrap gap-x-5">{downloads.map((item, index) => <a key={item.image} href={item.image} download={`Kyro-${downloadName}-${index + 1}.webp`} className="min-h-11 inline-flex items-center underline underline-offset-4">{downloads.length === 1 ? 'Guia visual completo' : item.label}</a>)}</div>
      </details> : <a href={image} download={`Kyro-Clean-${downloadName}-etapas.webp`} className={`inline-flex items-center gap-2 min-h-11 mt-4 text-xs underline underline-offset-4 ${dark ? "text-white/70 hover:text-white" : "text-[#536259] hover:text-[#173629]"}`}><Download className="w-4 h-4" />Guardar as imagens das etapas</a>}
    </div>
  </section>;
}
