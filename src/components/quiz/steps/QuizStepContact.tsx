import { Input } from '@/components/ui/input';
import type { QuizFormData } from '@/components/quiz/QuizTypes';

interface QuizStepContactProps {
  preview?: boolean;
  quoteLines: Array<{ label: string; qty: number; total: number | null }>;
  quotePriceText: string;
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const QuizStepContact = ({ formData, updateFormData, scrollContainerRef, quoteLines, quotePriceText, preview = false }: QuizStepContactProps) => {
  const scrollToVisible = (el: HTMLElement) => {
    setTimeout(() => {
      const sc = scrollContainerRef.current;
      if (!sc) return;
      const scRect = sc.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      if (elRect.bottom > scRect.bottom - 16) {
        sc.scrollBy({ top: elRect.bottom - scRect.bottom + 24, behavior: 'smooth' });
      }
    }, 400);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
      className="flex-1"
    >
      <div className="w-full max-w-sm text-left">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1">CONTACTO</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white mb-2 leading-[1.3]">
          Os seus dados
        </h2>
        <p className="text-sm text-white/60 mb-6">
          {preview ? "Modo de teste: não precisa de preencher dados. Nenhum pedido será enviado." : "Deixe o seu contacto para confirmarmos o pedido."}
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="quote-name" className="block text-[11px] font-bold text-white/65 uppercase tracking-wider mb-1.5">Nome *</label>
            <Input
              id="quote-name"
              placeholder="O seu nome"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              autoComplete="name"
              autoCorrect="off"
              autoCapitalize="words"
              onFocus={(e) => scrollToVisible(e.target)}
              className="text-base h-12 bg-[#1a2a1a] border-gold/25 text-white placeholder:text-white/40 focus-visible:ring-gold rounded-sm"
            />
          </div>
          <div>
            <label htmlFor="quote-phone" className="block text-[11px] font-bold text-white/65 uppercase tracking-wider mb-1.5">Telemóvel / WhatsApp *</label>
            <Input
              id="quote-phone"
              type="tel"
              placeholder="9xx xxx xxx"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              autoComplete="tel"
              inputMode="tel"
              onFocus={(e) => scrollToVisible(e.target)}
              className="text-base h-12 bg-[#1a2a1a] border-gold/25 text-white placeholder:text-white/40 focus-visible:ring-gold rounded-sm"
            />
          </div>
          {formData.phone && formData.phone.replace(/\D/g, '').length < 9 && <p className="text-xs text-amber-200 text-left">Introduza um contacto válido, com indicativo se for estrangeiro.</p>}
        </div>
        <details className="mt-5 border-t border-white/10 text-left">
          <summary className="cursor-pointer py-3 text-sm text-white/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
            Ver resumo do pedido
          </summary>
          <div className="pb-3 space-y-2">
            {quoteLines.map((line, i) => <div key={i} className="flex items-start justify-between gap-3 text-xs text-white/75">
              <span className="min-w-0 break-words">{line.qty}× {line.label}</span>
              <span className="shrink-0">{line.total === null ? 'Sob orçamento' : `${line.total.toLocaleString('pt-PT')}€`}</span>
            </div>)}
            <p className="border-t border-white/10 pt-2 text-sm font-semibold text-[#D4AF37]">{quotePriceText}</p>
            <p className="text-xs text-white/60">Estimativa sujeita a confirmação.</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default QuizStepContact;
