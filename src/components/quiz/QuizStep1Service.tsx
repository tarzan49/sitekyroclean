import { Check, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RESPONSE_PROMISE } from '@/constants/commercialPolicy';

interface QuizStep1ServiceProps {
  selectedService: string;
  onSelect: (service: string) => void;
}

const serviceOptions = [
  { id: 'sofa', label: 'Sofá', sublabel: 'a partir de 49€', image: 'sofa' },
  { id: 'mattress', label: 'Colchão', sublabel: 'a partir de 59€', image: 'colchao' },
  { id: 'carpet', label: 'Tapete', sublabel: 'Sob orçamento', image: 'tapete' },
  { id: 'chairs', label: 'Cadeiras', sublabel: 'a partir de 20€', image: 'cadeira' },
];

const QuizStep1Service = ({ selectedService, onSelect }: QuizStep1ServiceProps) => (
  <div className="w-full max-w-md mx-auto text-[#123c2d]">
    <div className="mb-6 sm:mb-7 text-center">
      <h2 className="font-playfair text-[1.85rem] sm:text-[2.2rem] leading-[1.15] font-bold tracking-tight">
        O que vamos deixar<br />como novo?
      </h2>
      <p className="mt-3 text-base leading-relaxed text-[#53665c]">
        Escolha um serviço para começar<br className="sm:hidden" /> o seu orçamento.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {serviceOptions.map(option => {
        const selected = selectedService === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(option.id)}
            className={cn(
              'group relative overflow-hidden rounded-xl border bg-white text-left transition-all duration-200 touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123c2d] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f7f2] motion-reduce:transition-none',
              selected ? 'border-[#123c2d] ring-2 ring-[#123c2d]' : 'border-[#123c2d]/10 hover:border-[#123c2d]/40 hover:shadow-md'
            )}
          >
            <img src={`/images/services/${option.image}.webp`} alt="" className="w-full aspect-[1.55] sm:aspect-[1.65] object-cover" />
            {selected && <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#123c2d] text-white"><Check aria-hidden="true" className="h-4 w-4" /></span>}
            <span className="block px-3 py-3 sm:px-4">
              <span className="block font-playfair text-xl font-bold leading-tight">{option.label}</span>
              <span className="mt-1 block text-sm leading-snug text-[#53665c]">{option.sublabel}</span>
            </span>
          </button>
        );
      })}
    </div>
    <div className="mt-6 flex flex-col items-center gap-1 text-center text-sm text-[#53665c]">
      <p className="flex items-center justify-center gap-2"><Clock3 aria-hidden="true" className="h-4 w-4 shrink-0" />{RESPONSE_PROMISE}</p>
      <p>Sem compromisso</p>
    </div>
  </div>
);

export default QuizStep1Service;
