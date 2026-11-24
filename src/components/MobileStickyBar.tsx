import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_BASE } from '@/constants/business';

const MobileStickyBar = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const isEn = pathname.startsWith('/en/');

  // A barra acompanha sempre, em todas as páginas; só se esconde quando a parte da página
  // que está no ecrã já tem um botão de WhatsApp à vista (dono, 24 Nov).
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      // A secção que está no ecrã = a que ocupa mais altura visível. Se ela tem um botão de
      // WhatsApp (à vista ou ainda mais abaixo na mesma secção), a barra não aparece.
      const top = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      const bottom = window.innerHeight;
      const waSelector = 'a[href*="wa.me"], a[href*="whatsapp"]';
      let current: Element | null = null;
      let best = 0;
      const sections = [...document.querySelectorAll('main section')].filter(s => !s.parentElement?.closest('main section'));
      const footer = document.querySelector('footer');
      for (const s of footer ? [...sections, footer] : sections) {
        const r = s.getBoundingClientRect();
        const visibleHeight = Math.min(r.bottom, bottom) - Math.max(r.top, top);
        if (visibleHeight > best) { best = visibleHeight; current = s; }
      }
      const sectionHasButton = !!current && [...current.querySelectorAll<HTMLAnchorElement>(waSelector)].some(a => a.getClientRects().length > 0);
      setVisible(!sectionHasButton);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    schedule();
    const late = window.setTimeout(schedule, 1200);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.clearTimeout(late); if (frame) cancelAnimationFrame(frame); };
  }, [pathname]);

  if (pathname === '/obrigado' || pathname.startsWith('/admin')) return null;

  return (
    <div
      data-sticky-bar
      className={`fixed inset-x-0 z-30 transition-[transform,bottom] duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      // `--kyro-consent-h` é a altura do aviso de cookies enquanto está aberto
      // (CookieBanner.tsx). Com ele fechado vale 0 e a barra fica no fundo.
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', bottom: 'var(--kyro-consent-h, 0px)' }}
    >
      <div className="bg-[#071a12]/95 backdrop-blur-md border-t border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto px-3 pt-2.5 pb-3">
          <a
            href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage(isEn))}`}
            target="_blank"
            rel="noopener noreferrer"
            data-tracking-source="sticky_bar"
            className="flex items-center justify-center gap-2.5 w-full min-h-14 py-3 bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all touch-manipulation"
          >
            <MessageCircle className="w-4 h-4 text-[#071a12] flex-shrink-0" strokeWidth={2} />
            <span className="text-[#071a12] text-base font-semibold tracking-[0.04em] uppercase">{isEn ? "Message on WhatsApp" : "Falar por WhatsApp"}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBar;
