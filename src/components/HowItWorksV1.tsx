import { DRYING_PROMISE, RESPONSE_PROMISE } from "@/constants/commercialPolicy";

const steps = [
  { title: "Peça o seu orçamento", text: "Diga-nos o que precisa de limpar. Estimativa sem compromisso.", note: RESPONSE_PROMISE },
  { title: "Combine a visita", text: "Confirmamos o preço, a deslocação e a disponibilidade antes de marcar." },
  { title: "Nós cuidamos do resto", text: "Limpeza em sua casa, com orientação sobre os cuidados finais.", note: DRYING_PROMISE },
];

export default function HowItWorksV1() {
  return (
    <section aria-labelledby="process-title" className="bg-[#071a12] text-white">
      <div className="mx-auto grid max-w-7xl gap-y-7 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-6 lg:py-14">
        <header className="lg:col-start-2 lg:row-start-1">
          <p className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#D4AF37]"><span className="h-px w-7 bg-[#D4AF37]" /> Como funciona</p>
          <h2 id="process-title" className="type-section-title font-playfair">Nós tratamos da limpeza.<br /><span className="text-[#D4AF37]">Você fica tranquilo.</span></h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">Orçamento claro, visita combinada e acompanhamento após o serviço.</p>
        </header>

        <figure className="relative overflow-hidden lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <img src="/images/services/sofa.webp" alt="Limpeza de um sofá com equipamento de extração" width="1280" height="720" loading="lazy" className="aspect-[16/9] w-full object-cover object-[56%_center] lg:absolute lg:h-full lg:aspect-auto" />
        </figure>

        <ol className="divide-y divide-white/10 border-t border-white/15 lg:col-start-2 lg:row-start-2">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 py-4 last:pb-0 sm:gap-5">
              <span className="pt-0.5 text-sm font-medium tabular-nums text-[#D4AF37]">0{index + 1}</span>
              <div>
                <h3 className="mb-1 type-card-title font-sans text-white">{step.title}</h3>
                <p className="text-base leading-relaxed text-white/75">{step.text}</p>
                {step.note && <p className="mt-1 text-sm leading-relaxed text-white/75">{step.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
