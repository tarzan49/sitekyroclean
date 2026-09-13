import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { DRYING_PROMISE, RESPONSE_PROMISE } from "@/constants/commercialPolicy";
import QuizButton from "./QuizButton";

const steps = [
  { title: "Peça o seu orçamento", text: "Diga-nos o que precisa de limpar. Recebe uma estimativa sem compromisso.", note: RESPONSE_PROMISE },
  { title: "Combine a visita", text: "Confirmamos consigo o preço, os tratamentos e a deslocação antes de marcar.", note: "Data e disponibilidade confirmadas consigo" },
  { title: "Nós cuidamos do resto", text: "Limpamos em sua casa e explicamos os cuidados a ter após o serviço.", note: DRYING_PROMISE },
];

export default function HowItWorksPreview() {
  return (
    <section aria-labelledby="process-preview-title" className="bg-[#071a12] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="mb-9 flex flex-col justify-between gap-5 lg:mb-12 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF37]"><span className="h-px w-9 bg-[#D4AF37]" /> Do primeiro contacto à limpeza</p>
            <h2 id="process-preview-title" className="font-playfair text-[1.85rem] font-bold leading-[1.1] sm:text-4xl md:text-[2.6rem]">Nós tratamos da limpeza.<br /><span className="text-[#D4AF37]">Você fica tranquilo.</span></h2>
          </div>
          <p className="max-w-xs text-base leading-relaxed text-white/75">Orçamento claro, visita combinada e acompanhamento após o serviço.</p>
        </div>

        <div className="grid gap-9 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <figure className="relative min-h-60 overflow-hidden rounded-[3px] lg:min-h-[470px]">
            <img src="/images/services/sofa.webp" alt="Limpeza de um sofá com equipamento de extração" width="1280" height="720" className="h-64 w-full object-cover object-[56%_center] sm:h-80 lg:absolute lg:h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04110b]/90 via-transparent to-transparent" />
            <figcaption className="absolute bottom-6 left-6 right-6 border-l-2 border-[#D4AF37] pl-4 sm:bottom-8 sm:left-8">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">No conforto da sua casa</p>
              <p className="font-playfair text-2xl text-white">Cuidado em cada detalhe.</p>
            </figcaption>
          </figure>

          <ol className="flex flex-col justify-center">
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0 lg:pb-10">
                {index < steps.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[19px] top-11 w-px bg-[#D4AF37]/25" />}
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#10271d] text-sm font-semibold text-[#D4AF37]">0{index + 1}</span>
                <div className="pt-1">
                  <h3 className="mb-2 font-playfair text-[1.4rem] font-semibold leading-tight sm:text-2xl">{step.title}</h3>
                  <p className="max-w-md text-base leading-relaxed text-white/75">{step.text}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#E3CD85]">{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-col gap-7 border border-white/10 bg-[#10291e] p-6 sm:p-8 lg:mt-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-2xl items-start gap-4">
            <ShieldCheck aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-[#D4AF37]" strokeWidth={1.5} />
            <div>
              <h3 className="mb-2 font-playfair text-xl font-semibold sm:text-2xl">Não ficou satisfeito? Voltamos.</h3>
              <p className="text-base leading-relaxed text-white/75">Contacte-nos até 48 horas após o serviço para acionar a repetição gratuita.</p>
            </div>
          </div>
          <div className="shrink-0 text-center">
            <QuizButton ctaLabel="Pedir orçamento" className="[&>div]:hidden" buttonClassName="w-full !bg-none !bg-[#D4AF37] !shadow-none hover:!scale-100 hover:!bg-[#e0bf55] lg:w-auto" />
            <p className="mt-2 text-sm text-white/65">Sem compromisso</p>
          </div>
        </div>
        <a href="/#como-funciona" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-white/65 hover:text-white">Comparar com a secção atual <ArrowUpRight className="h-4 w-4" /></a>
      </div>
    </section>
  );
}
