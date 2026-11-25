import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getConsent, setConsent } from '@/lib/consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isEn = pathname.startsWith('/en/');

  // Enquanto o aviso está aberto, a sua altura fica em `--kyro-consent-h` no
  // <html>: a barra fixa de WhatsApp (MobileStickyBar) lê-a e sobe para cima do
  // aviso em vez de ficar tapada por ele na primeira visita.
  useEffect(() => {
    if (!visible) return;
    const el = panel.current;
    if (!el) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty('--kyro-consent-h', `${el.offsetHeight}px`);
    root.dataset.consent = 'open'; // a barra fixa do WhatsApp espera pela decisão (dono, 25 Nov: os dois juntos tapavam meio ecrã)
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => { observer.disconnect(); root.style.removeProperty('--kyro-consent-h'); delete root.dataset.consent; };
  }, [visible]);

  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener('kyro:open-consent', reopen);
    let t: ReturnType<typeof setTimeout>;
    // Show only when no decision has been recorded yet
    if (getConsent() === null) {
      // Slight delay so it doesn't flash immediately on load
      t = setTimeout(() => setVisible(true), 800);

    }
    return () => { clearTimeout(t); window.removeEventListener('kyro:open-consent', reopen); };
  }, []);

  if (!visible) return null;

  // O link da política de privacidade não fecha o aviso. Fechava, e como o
  // aviso só volta a abrir num carregamento novo da página, quem ia ler a
  // política ficava o resto da visita sem decisão: nem aceitava nem recusava,
  // e por isso nunca era medido nem voltava a ser perguntado.

  const accept = () => {
    setConsent('accepted');
    setVisible(false);
  };

  const decline = () => {
    setConsent('declined');
    setVisible(false);
  };

  return (
    <div
      ref={panel}
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[90] px-2 pb-2 sm:px-6 sm:pb-5"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-2xl mx-auto rounded-xl sm:rounded-2xl border border-gold/20 bg-kyro-green shadow-[0_-4px_32px_rgba(0,0,0,0.45)] px-3 py-2 sm:px-6 sm:py-4">
        {/* Uma só linha no telemóvel: texto curto à esquerda, as duas decisões à direita. */}
        <div className="flex items-center gap-2 sm:gap-4">
          <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-white/80 sm:text-base">
            {isEn ? 'Cookies to measure visits and campaigns. ' : 'Cookies para medir visitas e campanhas. '}
            <Link to="/politica-de-privacidade" className="text-[#D4AF37] underline underline-offset-2">{isEn ? 'Privacy Policy' : 'Privacidade'}</Link>
          </p>
          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
            <button
              onClick={decline}
              className="h-10 sm:h-11 px-3.5 sm:px-4 text-sm font-medium text-white/80 hover:text-white transition-colors touch-manipulation rounded-lg"
            >
              {isEn ? "Decline" : "Recusar"}
            </button>
            <button
              onClick={accept}
              className="cta cta-gold cta-sm"
            >
              {isEn ? "Accept" : "Aceitar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
