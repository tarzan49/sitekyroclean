import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/quizTracking';
import { WHATSAPP_BASE } from '@/constants/business';

const MobileStickyBar = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const isEn = pathname.startsWith('/en/');

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 400;
      const nearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 120;
      setVisible(scrolled && !nearBottom);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-30 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-[#071a12]/95 backdrop-blur-md border-t border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto px-3 pt-2.5 pb-3">
          <a
            href={`${WHATSAPP_BASE}?text=${encodeURIComponent(isEn ? "Hi! I need help with a cleaning issue." : 'Olá! Gostaria de pedir um orçamento para limpeza de estofos.')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('sticky_bar')}
            className="flex items-center justify-center gap-2.5 w-full h-14 bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all touch-manipulation"
          >
            <MessageCircle className="w-4 h-4 text-white flex-shrink-0" strokeWidth={2} />
            <span className="text-white text-[13px] font-semibold tracking-[0.18em] uppercase">{isEn ? "Message on WhatsApp" : "Falar por WhatsApp"}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBar;
