// Passo a passo dos sofás de pele (dono, 25 Nov): sem os vídeos de tecido (a pele não se lava por extração).
// Uma fotografia real de um sofá de pele nosso, depois do serviço, e as etapas próprias da pele (os mesmos textos
// do MATERIAL_PROCESS_GUIDES que o prerender escreve). Cabe num ecrã.
import SectionHeader from '@/components/SectionHeader';
import { MATERIAL_PROCESS_GUIDES } from '@/data/materialProcessGuides';
import leatherAfter from '@/assets/pele/sofa-pele-depois.jpg';

export default function LeatherProcessSection({ heading = 'Como cuidamos do seu sofá em', gold = 'pele' }: { heading?: string; gold?: string }) {
  const steps = MATERIAL_PROCESS_GUIDES['limpeza-sofa-pele']?.steps ?? [];
  return <section id="processo" className="scroll-mt-20 bg-[#FDFDF9] py-12 md:py-16">
    <div className="mx-auto grid max-w-6xl gap-3 px-4 sm:px-6 md:grid-cols-2 md:items-center md:gap-10">
      <div>
        <SectionHeader heading={heading} goldWord={gold} />
        <img src={leatherAfter} alt="Sofá de pele creme limpo e hidratado pela nossa equipa" loading="lazy" decoding="async" className="h-[11svh] w-full rounded-2xl object-cover object-[50%_60%] md:h-[40svh]" />
      </div>
      <ol className="space-y-1.5 md:space-y-2">
        {steps.map((s, i) => <li key={s.label} className="flex items-center gap-3 rounded-xl border border-[#E5E0D3] bg-white px-3 py-1.5 md:py-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#D4AF37] text-sm font-bold text-white">{i + 1}</span>
          <span className="min-w-0"><span className="block text-[14px] font-semibold text-[#1A1A1A]">{s.label}</span><span className="text-[12.5px] leading-snug text-[#555] line-clamp-1 md:line-clamp-2">{s.description}</span></span>
        </li>)}
      </ol>
    </div>
  </section>;
}
