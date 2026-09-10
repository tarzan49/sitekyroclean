import { useId, useState } from 'react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import SectionHeader from '@/components/SectionHeader';

const image = '/images/services/sofa-cleaning-process-guide.png';
const steps = [
  { label: 'Avaliação', title: 'Primeiro, conhecemos o tecido.', description: 'Observamos o material, as manchas e o estado do sofá para escolher o tratamento adequado.', y: 170, height: 210, alt: 'Inspeção do tecido e das costuras do sofá' },
  { label: 'Aplicação', title: 'O produto certo, no sítio certo.', description: 'Aplicamos o produto adequado ao tecido e às zonas que precisam de tratamento.', y: 395, height: 222, alt: 'Aplicação de produto no tecido com um pulverizador' },
  { label: 'Escovação', title: 'Soltamos a sujidade das fibras.', description: 'Escovamos o tecido para distribuir o produto e ajudar a desprender a sujidade.', y: 632, height: 225, alt: 'Escovação suave do tecido do sofá' },
  { label: 'Extração', title: 'Retiramos a sujidade e a água.', description: 'O equipamento de extração aspira a sujidade e a água do tecido, reduzindo a humidade que fica no sofá.', y: 875, height: 230, alt: 'Extração da água e sujidade com um bocal de estofos' },
  { label: 'Secagem', title: 'Depois, é deixar o tecido secar.', description: 'Normalmente demora 4 a 6 horas, conforme o tecido e a ventilação. Use o sofá apenas quando estiver completamente seco.', y: 1124, height: 270, alt: 'Sofá junto de uma janela aberta durante a secagem' },
];

export default function SofaProcessGuide({ city = 'Lisboa', cityPrep = 'em' }: { city?: string; cityPrep?: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const step = steps[active];
  return <section id="processo" className="scroll-mt-20 py-14 md:py-20 bg-[#FDFDF9]">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader overline="Como funciona" heading={`A limpeza do seu sofá, passo a passo ${cityPrep}`} goldWord={city} subtitle="Do primeiro cuidado à secagem. Explore as cinco etapas da nossa visita." />
      <div className="border border-[#173629]/15 bg-white rounded-sm overflow-hidden">
        <div className="grid grid-cols-5 border-b border-[#173629]/15" role="tablist" aria-label="Etapas da limpeza">
          {steps.map((item, i) => <button key={item.label} id={`${id}-tab-${i}`} role="tab" aria-selected={active === i} aria-controls={`${id}-panel`} tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)} onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (i + 1) % steps.length : event.key === 'ArrowLeft' ? (i + steps.length - 1) % steps.length : event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1 : null;
              if (next !== null) { event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
            }}
            className={`min-h-[72px] sm:min-h-20 px-1 py-3 border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-gold ${active === i ? 'border-gold bg-[#0c241a] text-white' : 'border-transparent text-[#536259] hover:bg-[#f4f5f0]'}`}>
            <span className={`block text-xs mb-1 ${active === i ? 'text-gold' : 'text-[#917634]'}`}>0{i + 1}</span>
            <span className="block text-[10px] sm:text-sm font-semibold">{item.label}</span>
          </button>)}
        </div>
        <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="grid md:grid-cols-2 focus-visible:outline focus-visible:outline-gold">
          <div className="relative overflow-hidden bg-[#efeee7] min-h-[190px] md:min-h-[340px]" style={{ aspectRatio: '560 / 300' }}>
            <div key={step.label} className="absolute inset-x-0 top-1/2 -translate-y-1/2 scale-150 overflow-hidden" style={{ aspectRatio: `560 / ${step.height}` }}>
              <img src={image} alt={step.alt} className="absolute !max-w-none" style={{ width: '182.8572%', left: '-4.6429%', top: `${-step.y / step.height * 100}%` }} />
            </div>
            <span className="absolute bottom-3 left-3 text-[10px] bg-white/90 px-2 py-1 text-[#536259]">Imagem ilustrativa</span>
          </div>
          <div className="p-5 sm:p-8 flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#94772b] mb-3">Etapa {active + 1} de {steps.length}</p>
            <h3 className="font-playfair text-2xl sm:text-3xl leading-tight text-[#173629] mb-3">{step.title}</h3>
            <p className="text-sm sm:text-base text-[#536259] leading-relaxed min-h-[84px]">{step.description}</p>
            <div className="flex items-center justify-between gap-3 mt-auto pt-6">
              <button type="button" aria-label="Etapa anterior" disabled={active === 0} onClick={() => setActive(a => a - 1)} className="w-12 h-12 flex items-center justify-center border border-[#173629]/25 text-[#173629] disabled:opacity-25"><ArrowLeft className="w-5 h-5" /></button>
              <button type="button" onClick={() => setActive(a => (a + 1) % steps.length)} className="min-h-12 flex items-center justify-center gap-3 px-5 bg-[#173629] text-white font-semibold text-sm hover:bg-[#254535]">{active === steps.length - 1 ? 'Ver desde o início' : 'Próxima etapa'}<ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
      <a href={image} download="Kyro-Clean-como-limpamos-o-seu-sofa.png" className="inline-flex items-center gap-2 min-h-11 mt-4 text-xs text-[#536259] underline underline-offset-4 hover:text-[#173629]"><Download className="w-4 h-4" />Guardar o resumo das cinco etapas</a>
    </div>
  </section>;
}
