import { WhatsAppCta } from '@/components/Cta';
import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useFillSections } from '@/hooks/useFillSections';
import { WHATSAPP_BASE } from '@/constants/business';

const MobileStickyBar = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  useFillSections();
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
    // Páginas que demoram a montar: volta a ver, senão a barra ficava por cima do botão do topo até se mexer no ecrã.
    const late = [400, 1200, 2500, 4500, 8000].map(ms => window.setTimeout(schedule, ms));
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); late.forEach(t => window.clearTimeout(t)); if (frame) cancelAnimationFrame(frame); };
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
          <WhatsAppCta href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage(isEn))}`} source="sticky_bar" en={isEn} />
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBar;
