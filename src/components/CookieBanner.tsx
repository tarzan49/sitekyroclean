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
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => { observer.disconnect(); root.style.removeProperty('--kyro-consent-h'); };
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
      <div className="max-w-2xl mx-auto rounded-xl sm:rounded-2xl border border-gold/20 bg-kyro-green shadow-[0_-4px_32px_rgba(0,0,0,0.45)] px-3 py-2.5 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-snug sm:text-base sm:leading-relaxed text-white/75">
              {isEn ? (
                <>
                  With your permission, we use analytics and advertising cookies to measure visits and campaigns. See our{' '}
                  <Link
                    to="/politica-de-privacidade"
                    className="text-[#D4AF37] underline underline-offset-2 hover:text-[#f0dc8a] transition-colors"
                    onClick={() => setVisible(false)}
                  >
                    Privacy Policy
                  </Link>
                  .
                </>
              ) : (
                <>
                  Com a sua autorização, usamos cookies de análise e publicidade para medir visitas e campanhas. Consulte a nossa{' '}
                  <Link
                    to="/politica-de-privacidade"
                    className="text-[#D4AF37] underline underline-offset-2 hover:text-[#f0dc8a] transition-colors"
                    onClick={() => setVisible(false)}
                  >
                    Política de Privacidade
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={decline}
              className="h-10 sm:h-11 px-3.5 sm:px-4 text-sm font-medium text-white/80 hover:text-white transition-colors touch-manipulation rounded-lg"
            >
              {isEn ? "Decline" : "Recusar"}
            </button>
            <button
              onClick={accept}
              className="h-10 sm:h-11 px-5 text-sm font-bold rounded-full bg-[#D4AF37] hover:bg-[#f0dc8a] text-[#0B2F2A] transition-colors touch-manipulation shadow-md"
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
