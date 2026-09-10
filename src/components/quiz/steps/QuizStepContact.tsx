import { Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { QuizFormData } from '@/components/quiz/QuizTypes';
import { REVIEW_RATING, REVIEW_COUNT } from '@/constants/business';

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
      <div className="w-full max-w-sm px-4">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1 text-center">CONTACTO</p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center mb-1 leading-[1.3]">
          Os seus dados
        </h2>
        <p className="text-center text-[11px] text-white/30 mb-5">
          {preview ? "Modo de teste: não precisa de preencher dados. Nenhum pedido será enviado." : "Confira o resumo e preencha os seus dados para enviar o pedido."}
        </p>

        <div className="relative flex items-center gap-4 bg-[#0c1d15] border border-gold/[0.15] rounded-sm pl-5 pr-4 py-3.5 mb-3 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold/20 via-gold to-gold/20" />
          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <span className="font-playfair text-3xl font-black text-gold leading-none" style={{ textShadow: "0 0 18px rgba(212,175,55,0.35)" }}>{REVIEW_RATING}</span>
            <div className="flex gap-0.5 mt-1.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}
            </div>
          </div>
          <div className="w-px self-stretch bg-white/[0.08] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[13px] font-bold text-white leading-none">Excelente</span>
            </div>
            <p className="text-[11px] text-white/45 leading-snug">{REVIEW_COUNT}+ avaliações verificadas no Google</p>
          </div>
        </div>

        <details className="mb-5 rounded-sm border border-gold/25 bg-white/[0.04] p-3 text-left" open>
          <summary className="cursor-pointer text-sm font-bold text-white">Resumo do seu pedido</summary>
          <div className="mt-3 space-y-2">
            {quoteLines.map((line, i) => <div key={i} className="flex items-start justify-between gap-3 text-xs text-white/75">
              <span className="min-w-0 break-words">{line.qty}× {line.label}</span>
              <span className="shrink-0">{line.total === null ? 'Sob orçamento' : `${line.total.toLocaleString('pt-PT')}€`}</span>
            </div>)}
            <p className="border-t border-white/10 pt-2 text-sm font-semibold text-[#D4AF37]">{quotePriceText}</p>
            <p className="text-xs text-white/60">Estimativa sujeita a confirmação. Pode voltar para alterar os artigos.</p>
          </div>
        </details>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="quote-name" className="block text-[11px] font-bold text-white/65 uppercase tracking-wider mb-1.5">Nome *</label>
            <Input
              id="quote-name"
              placeholder="O seu nome"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              onFocus={(e) => scrollToVisible(e.target)}
              className="text-base h-13 bg-[#1a2a1a] border-gold/25 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-sm"
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
              autoComplete="off"
              inputMode="tel"
              onFocus={(e) => scrollToVisible(e.target)}
              className="text-base h-13 bg-[#1a2a1a] border-gold/25 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-sm"
            />
          </div>
          {formData.phone && formData.phone.replace(/\D/g, '').length < 9 && <p className="text-xs text-amber-200 text-left">Introduza um contacto válido, com indicativo se for estrangeiro.</p>}
        </div>
      </div>
    </div>
  );
};

export default QuizStepContact;
