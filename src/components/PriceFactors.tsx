import { Sofa, Ruler, ScanLine, ShieldCheck, Check, Armchair, MapPin, Layers, type LucideIcon } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

import { PRICE_FACTORS as factors } from '@/data/priceFactors';
const icons: Record<string, LucideIcon> = { Sofa, Ruler, ScanLine, ShieldCheck, Armchair, MapPin, Layers };

export default function PriceFactors({ serviceSlug, embedded = false }: { serviceSlug: string; embedded?: boolean }) {
  const items = factors[serviceSlug];
  const Container = embedded ? 'div' : 'section';
  if (!items) return null;
  return (
    <Container aria-label="Como é calculado o preço" className={embedded ? 'mt-10 border-t border-[#173629]/15 pt-10' : 'bg-[#FDFDF9] py-14 md:py-20'}>
      <div className={embedded ? '' : 'mx-auto max-w-6xl px-5 sm:px-6 lg:px-8'}>
        <SectionHeader overline="O preço, explicado" heading="Cada peça é diferente." goldWord="O cuidado também." />
        <p className="-mt-5 mb-8 max-w-2xl text-base leading-relaxed text-[#46564e] md:-mt-7">Para chegar ao valor final, olhamos para estes detalhes. Assim, sabe o que estamos a avaliar.</p>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {items.map(({ icon, title, description, examples }, index) => {
            const Icon = icons[icon];
            return (
            <article key={title} className={`rounded-2xl border p-6 sm:p-7 ${index === 1 ? "border-[#0d241b] bg-[#0d241b] text-white" : "border-[#dce2da] bg-white text-[#0d241b]"}`}>
              <div className="mb-6 flex items-center justify-between">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${index === 1 ? "bg-white/10 text-[#D4AF37]" : "bg-[#f2f4ed] text-[#183e2e]"}`}>
                  <Icon aria-hidden="true" className="h-9 w-9" strokeWidth={1.4} />
                </div>
                <span aria-hidden="true" className={`text-xs font-semibold tracking-[0.15em] ${index === 1 ? "text-[#D4AF37]" : "text-[#637367]"}`}>0{index + 1}</span>
              </div>
              <h3 className="font-playfair text-2xl leading-tight">{title}</h3>
              <p className={`mt-3 text-base leading-relaxed ${index === 1 ? "text-[#d6e1da]" : "text-[#46564e]"}`}>{description}</p>
              <ul className={`mt-6 space-y-3 border-t pt-5 ${index === 1 ? "border-white/20" : "border-[#e5e9e2]"}`}>
                {examples.map(example => <li key={example} className="flex items-start gap-2.5 text-sm leading-relaxed"><Check aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${index === 1 ? "text-[#D4AF37]" : "text-[#326448]"}`} />{example}</li>)}
              </ul>
            </article>
          ); })}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#eef2ea] px-5 py-5 sm:items-center">
          <ShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-[#28523b]" />
          <p className="text-sm leading-relaxed text-[#344b3b]"><strong className="font-semibold text-[#0d241b]">Sabe o valor antes de marcar.</strong> Confirmamos os detalhes, os extras escolhidos e a deslocação no orçamento. Gratuito e sem compromisso.</p>
        </div>
      </div>
    </Container>
  );
}
