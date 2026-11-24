// Perguntas frequentes no formato aprovado nos packs (dono, 24 Nov): título à esquerda no computador,
// caixa única com as perguntas fechadas, uma abre de cada vez. Mobile-first, cabe num ecrã.
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import ServiceFAQSchema from './ServiceFAQSchema';

interface Props {
  faqs: { question: string; answer: string }[];
  heading?: string;
  subtitle?: string;
  id?: string;
  // Fundo verde quando a secção anterior é clara (as cores alternam na página).
  dark?: boolean;
}

export default function CompactFAQ({ faqs, heading = 'Perguntas Frequentes', id = 'perguntas', dark = false }: Props) {
  const [open, setOpen] = useState<number | null>(() => { const i = faqs.length <= 4 ? faqs.findIndex(f => f.answer.length <= 240) : -1; return i < 0 ? null : i; });
  const words = heading.trim().split(' ');
  const gold = words.pop() ?? '';
  const rest = words.join(' ');
  return (
    <section id={id} className={`scroll-mt-20 py-12 md:py-16 ${dark ? 'bg-kyro-green' : 'bg-[#FDFDF9]'}`}>
      <ServiceFAQSchema faqs={faqs} />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12">
        {/* Cabeçalho editorial igual ao do resto do site (linha dourada, texto por cima, título, subtítulo). */}
        <div>
          <h2 className={`type-section-title font-playfair ${dark ? 'text-white' : 'text-[#111111]'}`}>{rest} <em className="not-italic" style={{ color: '#D4AF37' }}>{gold}</em></h2>
        </div>
        <div className="divide-y divide-[#E5E0D3] overflow-hidden rounded-2xl border border-[#E5E0D3] bg-white">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.question}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left md:px-5 md:py-4">
                  <span className={`font-semibold ${isOpen ? 'text-[#1A1A1A]' : 'text-[#333]'}`}>{f.question}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${isOpen ? 'bg-[#D4AF37] text-white' : 'bg-[#F3F0E7] text-[#D4AF37]'}`}>{isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
                </button>
                <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <p className="overflow-hidden px-5 text-[15px] leading-relaxed text-[#555]"><span className="block pb-4">{f.answer}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
