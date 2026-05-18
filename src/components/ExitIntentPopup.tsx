import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { createPortal } from 'react-dom';

const ExitIntentPopup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already seen this session or if user already submitted
    if (
      sessionStorage.getItem('kyro_exit_shown') ||
      sessionStorage.getItem('kyro_receipt')
    ) return;

    let activated = false;
    let shown = false;

    const show = () => {
      if (shown) return;
      shown = true;
      sessionStorage.setItem('kyro_exit_shown', '1');
      setVisible(true);
    };

    // Desktop: mouse exits through the top of the viewport
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 5 && activated) show();
    };

    // Mobile: visibilitychange (back button / tab switch)
    let intentPending = false;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        intentPending = true;
      } else if (intentPending && activated) {
        intentPending = false;
        show();
      }
    };

    // Activate after 10s — avoids firing on accidental mouse movements
    const timer = setTimeout(() => {
      activated = true;
      document.addEventListener('mouseleave', onMouseLeave);
      document.addEventListener('visibilitychange', onVisibility);
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const openQuiz = () => {
    setVisible(false);
    window.dispatchEvent(new CustomEvent('openQuiz'));
  };

  const dismiss = () => setVisible(false);

  if (!visible) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,21,16,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_16px_60px_rgba(0,0,0,0.7)] border border-white/[0.12] animate-scale-in"
        style={{ background: 'linear-gradient(160deg, #0a2922 0%, #071a12 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top accent bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-5 pb-6 flex flex-col items-center text-center">

          {/* Emoji + label */}
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 text-2xl">
            🛋️
          </div>

          <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-2">
            Antes de sair
          </p>

          <h2 className="font-playfair text-xl font-bold text-white leading-tight mb-2">
            O seu sofá merece<br />uma segunda opinião.
          </h2>

          <p className="text-sm text-white/50 leading-relaxed mb-5">
            Peça um orçamento gratuito em menos de 60 segundos — sem compromisso, sem visita prévia.
          </p>

          {/* Stars */}
          <div className="flex items-center gap-1.5 mb-5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
              ))}
            </div>
            <span className="text-xs text-white/40">+50 avaliações · 5.0 no Google</span>
          </div>

          {/* CTA */}
          <button
            onClick={openQuiz}
            className="w-full h-12 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-black text-sm rounded-xl touch-manipulation active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.35)] mb-3"
          >
            Ver o meu preço — é grátis
          </button>

          <button
            onClick={dismiss}
            className="text-[11px] text-white/20 hover:text-white/40 transition-colors py-1"
          >
            Não, obrigado
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ExitIntentPopup;
