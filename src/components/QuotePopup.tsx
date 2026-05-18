import { useState, useEffect, useCallback } from 'react';
import { X, Phone, Star, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import QuizForm from './QuizFormLazy';
import { usePopupStorage } from '@/hooks/usePopupStorage';
import { trackCallClick } from '@/lib/analytics';

const POPUP_DELAY_MS = 45000;
const CLICKED_QUOTE_KEY = 'hasClickedQuote';

const QuotePopup = () => {
  const { shouldShow, markSeen, markSubmitted, isQuoteClicked, markQuoteClicked } = usePopupStorage();
  const [isVisible, setIsVisible] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const shouldShowPopup = useCallback(() => shouldShow(), [shouldShow]);

  useEffect(() => {
    const handleQuizOpened = () => {
      markQuoteClicked();
      setIsBlocked(true);
      setIsVisible(false);
    };

    window.addEventListener('openQuiz', handleQuizOpened);
    window.addEventListener('quizOpened', handleQuizOpened);

    if (isQuoteClicked()) setIsBlocked(true);

    return () => {
      window.removeEventListener('openQuiz', handleQuizOpened);
      window.removeEventListener('quizOpened', handleQuizOpened);
    };
  }, [isQuoteClicked, markQuoteClicked]);

  useEffect(() => {
    if (isBlocked || !shouldShowPopup()) return;

    const timer = setTimeout(() => {
      if (sessionStorage.getItem(CLICKED_QUOTE_KEY) === '1') return;
      const quizElement = document.querySelector('[data-quiz-open="true"]');
      if (quizElement) return;
      setIsVisible(true);
      markSeen();
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [shouldShowPopup, isBlocked, markSeen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !isQuizOpen) handleClose();
    };
    if (isVisible) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isVisible, isQuizOpen]);

  const handleClose = () => setIsVisible(false);

  const handleStartQuiz = () => {
    setIsQuizOpen(true);
    setIsVisible(false);
  };

  const handleQuizClose = () => {
    setIsQuizOpen(false);
    markSubmitted();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isVisible && !isQuizOpen) return null;

  if (isQuizOpen) {
    return <QuizForm isOpen={isQuizOpen} onClose={handleQuizClose} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-popup-title"
    >
      <div
        className="relative w-full max-w-md rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] animate-fade-in bg-checker-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[180px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(26,78,48,0.35) 0%, transparent 70%)' }} />

        {/* Gold top line */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37 40%, #EDD96A 60%, transparent)' }} />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 px-7 pt-8 pb-3">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 bg-gold/10 border border-gold/25 rounded-full px-3.5 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-gold text-[11px] font-bold tracking-widest uppercase">Orçamento Grátis</span>
            </div>
          </div>

          {/* Heading */}
          <h2
            id="quote-popup-title"
            className="font-playfair text-[1.65rem] md:text-[1.9rem] font-bold text-white leading-tight text-center mb-3"
          >
            Qual o preço para<br />
            <span style={{ color: '#D4AF37' }}>os seus estofos?</span>
          </h2>

          {/* Subtitle */}
          <p className="text-white/55 text-sm leading-relaxed text-center mb-6">
            Descubra o preço exato em 30 segundos.<br />Sem visita, sem compromisso.
          </p>

          {/* Trust pills */}
          <div className="flex items-center justify-center gap-3 mb-7 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <span className="text-white/60 text-[11px] font-medium">5.0 · 50+ avaliações</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">
              <ShieldCheck className="w-3 h-3 text-gold" />
              <span className="text-white/60 text-[11px] font-medium">+1000 clientes</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5">
              <Clock className="w-3 h-3 text-gold" />
              <span className="text-white/60 text-[11px] font-medium">Resposta em 15 min</span>
            </div>
          </div>

          {/* Primary CTA — standard site button */}
          <div className="relative group/btn mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40 rounded-2xl blur-md opacity-60 group-hover/btn:opacity-90 transition-opacity" />
            <button
              onClick={handleStartQuiz}
              className="relative w-full bg-gradient-to-r from-gold to-[#d4c78d] hover:from-[#d4c78d] hover:to-gold text-[#1A1A2E] font-bold py-4 text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              Calcular o meu preço grátis →
            </button>
          </div>

          {/* Secondary: phone */}
          <a
            href="tel:925530647"
            onClick={() => trackCallClick('quote_popup')}
            className="flex items-center justify-center gap-2 w-full text-white/40 hover:text-white/70 text-sm py-2 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            ou liga: 925 530 647
          </a>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-7 pb-6 pt-2 text-center">
          <div className="h-px w-20 bg-white/10 mx-auto mb-3" />
          <p className="text-[11px] text-white/20">
            Porto · Matosinhos · Vila Nova de Gaia · Grande Porto
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotePopup;
