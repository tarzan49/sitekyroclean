import { Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { QuizFormData } from '@/components/quiz/QuizTypes';

interface QuizStepContactProps {
  formData: QuizFormData;
  updateFormData: (updates: Partial<QuizFormData>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const QuizStepContact = ({ formData, updateFormData, scrollContainerRef }: QuizStepContactProps) => {
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
      <div className="w-full max-w-sm">
        <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1 text-center">CONTACTO</p>
        <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white text-center mb-1 leading-[1.3]">
          Os seus dados
        </h2>
        <p className="text-center text-[11px] text-white/30 mb-5">
          Preenche em segundos. O pedido é enviado automaticamente.
        </p>

        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}
          </div>
          <span className="text-[11px] text-white/40">51 avaliações Google · 5.0</span>
        </div>
        <p className="flex items-center justify-center gap-2 text-center text-xs text-green-300 bg-[#0a2218] border border-green-500/50 rounded-xl px-3 py-2 mb-5 font-bold shadow-[0_0_10px_rgba(34,197,94,0.10)]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          Agenda quase cheia, confirme agora para garantir o seu horário
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Nome *</label>
            <Input
              placeholder="O seu nome"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              onFocus={(e) => scrollToVisible(e.target)}
              className="text-base h-13 bg-[#1a2a1a] border-gold/25 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Telemóvel / WhatsApp *</label>
            <Input
              type="tel"
              placeholder="9xx xxx xxx"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              autoComplete="off"
              inputMode="numeric"
              onFocus={(e) => scrollToVisible(e.target)}
              className="text-base h-13 bg-[#1a2a1a] border-gold/25 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-xl"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Email <span className="text-white/25 normal-case font-normal">(opcional)</span></label>
            <Input
              type="email"
              placeholder="o.seu@email.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              autoComplete="off"
              inputMode="email"
              onFocus={(e) => scrollToVisible(e.target)}
              className="text-base h-13 bg-[#1a2a1a] border-gold/25 text-white placeholder:text-white/20 focus-visible:ring-gold rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStepContact;
