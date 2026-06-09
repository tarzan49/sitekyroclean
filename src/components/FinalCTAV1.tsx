import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Phone, MapPin } from "lucide-react";
import { trackCallClick } from "@/lib/analytics";
import QuizForm from './QuizFormLazy';

const FinalCTA = () => {
  const { t } = useTranslation();
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent('quizOpened'));
    sessionStorage.setItem('hasClickedQuote', '1');
    setIsQuizOpen(true);
  };

  return (
    <>
      <section
        data-section="final-cta"
        className="py-5 md:py-6 bg-kyro-green border-t border-white/5"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">

            {/* CTA Button */}
            <div className="relative group w-full sm:w-auto">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
              <button
                onClick={openQuiz}
                className={[
                  'relative w-full sm:w-auto rounded-full font-bold text-[#12121e] touch-manipulation',
                  'px-8 py-3 text-sm',
                  'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
                  'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
                  'hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]',
                  'hover:scale-[1.025] active:scale-[0.95]',
                  'active:shadow-[0_2px_8px_rgba(201,168,76,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
                  'transition-all duration-150',
                ].join(' ')}
              >
                <span className="tracking-wide">{t('finalCta.ctaPrimary', 'Orçamento rápido (30 seg)')}</span>
              </button>
            </div>

            {/* Separator desktop */}
            <span className="hidden sm:block w-px h-8 bg-white/10" />

            {/* Phone + Zone */}
            <div className="flex flex-col items-center sm:items-start gap-0.5">
              <a
                href="tel:925530647"
                onClick={() => trackCallClick('final_cta')}
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                {t('finalCta.ctaCall', 'Ligue: 925 530 647')}
              </a>
              <span className="inline-flex items-center gap-1 text-white/35 text-[11px]">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                Servimos todo o Grande Porto e Norte de Portugal
              </span>
            </div>

          </div>
        </div>
      </section>

      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </>
  );
};

export default FinalCTA;
