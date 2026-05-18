import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, setConsent } from '@/lib/consent';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only when no decision has been recorded yet
    if (getConsent() === null) {
      // Slight delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
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
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 sm:px-6 sm:pb-5"
    >
      <div className="max-w-2xl mx-auto rounded-2xl border border-gold/20 bg-[#071a12]/95 backdrop-blur-md shadow-[0_-4px_32px_rgba(0,0,0,0.45)] px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Utilizamos cookies e o Google Analytics para melhorar a sua experiência e analisar o tráfego do site. Consulte a nossa{' '}
              <Link
                to="/politica-de-privacidade"
                className="text-[#D4AF37] underline underline-offset-2 hover:text-[#f0dc8a] transition-colors"
                onClick={() => setVisible(false)}
              >
                Política de Privacidade
              </Link>
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={decline}
              className="h-11 px-4 text-xs font-medium text-white/40 hover:text-white/70 transition-colors touch-manipulation rounded-lg"
            >
              Recusar
            </button>
            <button
              onClick={accept}
              className="h-11 px-5 text-xs font-bold rounded-full bg-[#D4AF37] hover:bg-[#f0dc8a] text-[#0B2F2A] transition-colors touch-manipulation shadow-md"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
