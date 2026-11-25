import { WhatsAppCta } from '@/components/Cta';
import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePriceBar } from '@/lib/priceBar';

import { useFillSections } from '@/hooks/useFillSections';
import { WHATSAPP_BASE } from '@/constants/business';

const MobileStickyBar = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const deal = usePriceBar();
  const [light, setLight] = useState(false);
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
      // Com preço, a barra veste a cor da secção que está no ecrã: clara no branco, verde-escura no verde (título claro).
      const rgb = current && getComputedStyle(current.querySelector('h1, h2, h3') ?? current).color.match(/\d+/g)?.map(Number);
      setLight(!!rgb && rgb[0] + rgb[1] + rgb[2] < 380);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
    schedule();
    // Páginas que demoram a montar: volta a ver, senão a barra ficava por cima do botão do topo até se mexer no ecrã.
    const late = [400, 1200, 2500, 4500, 8000].map(ms => window.setTimeout(schedule, ms));
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); late.forEach(t => window.clearTimeout(t)); if (frame) cancelAnimationFrame(frame); };
  }, [pathname, deal]);

  // A secção do widget deixa espaço para a barra com preço (index.css, html[data-price-bar]).
  useEffect(() => { document.documentElement.toggleAttribute('data-price-bar', !!deal); }, [deal]);

  if (pathname === '/obrigado' || pathname.startsWith('/admin')) return null;

  return (
    <div
      data-sticky-bar
      className={`fixed inset-x-0 z-30 transition-[transform,bottom] duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      // `--kyro-consent-h` é a altura do aviso de cookies enquanto está aberto
      // (CookieBanner.tsx). Com ele fechado vale 0 e a barra fica no fundo.
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', bottom: 'var(--kyro-consent-h, 0px)' }}
    >
      <div className={`backdrop-blur-md border-t transition-colors duration-300 ${deal && light ? 'bg-white/95 border-[#D4AF37]/45 shadow-[0_-6px_24px_rgba(11,47,42,0.10)]' : 'bg-[#071a12]/95 border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]'}`}>
        <div className="max-w-2xl mx-auto px-3 pt-2.5 pb-3">
          {deal
            ? <div className="flex items-center gap-3 min-[390px]:gap-4" >
                <p className="shrink-0 leading-none" aria-live="polite">
                  <span className="flex items-baseline gap-1.5"><span className={`font-playfair text-[27px] font-semibold leading-none tracking-[-0.02em] ${light ? 'text-[#0B2F2A]' : 'text-white'}`}>{deal.total}</span>{deal.was && <s className={`text-[13px] ${light ? 'text-[#0B2F2A]/50' : 'text-white/50'}`}>{deal.was}</s>}</span>
                  {deal.travel && <span className={`mt-1.5 block whitespace-nowrap text-[11px] leading-none ${light ? 'text-[#0B2F2A]/65' : 'text-white/60'}`}>{deal.travel}</span>}
                </p>
                <WhatsAppCta href={deal.href} source={`${deal.source}_bar`} className="cta-bar" />
              </div>
            : <WhatsAppCta href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage(isEn))}`} source="sticky_bar" en={isEn} />}
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBar;
