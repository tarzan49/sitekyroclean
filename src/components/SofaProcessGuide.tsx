import { Download, Expand } from 'lucide-react';

const image = '/images/services/sofa-cleaning-process-guide.png';

export default function SofaProcessGuide() {
  return <section id="processo" aria-labelledby="sofa-process-title" className="scroll-mt-20 py-10 sm:py-16 bg-[#f8f5ed]">
    <div className="max-w-2xl mx-auto px-3 sm:px-6">
      <h2 id="sofa-process-title" className="sr-only">Como limpamos o seu sofá</h2>
      <figure className="overflow-hidden border border-[#173629]/10 shadow-[0_12px_40px_rgba(23,54,41,0.08)]">
        <a href={image} target="_blank" rel="noopener noreferrer" aria-label="Ampliar o guia visual da limpeza de sofás" className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
          <img src={image} width="1024" height="1536" loading="lazy" decoding="async" className="block w-full h-auto" alt="Como limpamos o seu sofá: 1. Avaliamos o tecido e as manchas. 2. Aplicamos produto adequado ao tecido. 3. Escovamos para soltar a sujidade. 4. Extraímos a sujidade e a água. 5. Deixamos secar, normalmente 4 a 6 horas. A secagem varia com o tecido e a ventilação. Guia ilustrativo do serviço ao domicílio." />
        </a>
      </figure>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <a href={image} download="Kyro-Clean-como-limpamos-o-seu-sofa.png" className="min-h-12 px-3 flex items-center justify-center gap-2 rounded-sm bg-[#173629] text-white text-sm font-semibold hover:bg-[#254535] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"><Download className="w-4 h-4" />Guardar guia</a>
        <a href={image} target="_blank" rel="noopener noreferrer" className="min-h-12 px-3 flex items-center justify-center gap-2 rounded-sm border border-[#173629]/25 text-[#173629] text-sm font-semibold hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"><Expand className="w-4 h-4" />Ampliar</a>
      </div>
    </div>
  </section>;
}
