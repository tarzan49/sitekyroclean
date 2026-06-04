import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/quizTracking';

const MobileStickyBar = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 400;
      const nearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 120;
      setVisible(scrolled && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openQuiz = () => window.dispatchEvent(new CustomEvent('openQuiz'));

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-30 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-[#071a12]/95 backdrop-blur-md border-t border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto flex gap-2 px-3 pt-2.5 pb-3">
          <button
            onClick={openQuiz}
            className="flex-1 h-12 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-black text-sm rounded-xl touch-manipulation active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
          >
            Pedir Orçamento Grátis
          </button>
          <a
            href={`https://wa.me/351925530647?text=${encodeURIComponent('Olá, gostaria de pedir um orçamento para limpeza de estofos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('sticky_bar')}
            className="w-12 h-12 flex items-center justify-center bg-[#25D366]/20 border border-[#25D366]/30 rounded-xl flex-shrink-0 active:bg-[#25D366]/30 touch-manipulation"
            aria-label="Contactar via WhatsApp"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBar;
