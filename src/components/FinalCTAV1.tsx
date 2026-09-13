import { Phone, MapPin } from "lucide-react";
import { trackCallClick } from "@/lib/analytics";
import QuizForm from './QuizFormLazy';
import { PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";
import { useQuizLauncher } from "@/hooks/use-quiz-launcher";

const FinalCTA = () => {
  const { isQuizOpen, openQuiz, closeQuiz } = useQuizLauncher();

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
              <button
                onClick={openQuiz}
                className={[
                  'relative w-full border border-[#D4AF37]/70 bg-black/35 font-bold text-white touch-manipulation backdrop-blur-md',
                  'h-[48px] px-4 sm:w-auto sm:px-8',
                  'shadow-[0_8px_24px_rgba(0,0,0,0.22)]',
                  'hover:border-[#D4AF37] hover:bg-black/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.30)]',
                  'hover:scale-[1.025]',
                  'active:scale-[0.95]',
                  'transition-all duration-150',
                ].join(' ')}
              >
                <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Calcular o meu preço</span>
              </button>
            </div>

            {/* Separator desktop */}
            <span className="hidden sm:block w-px h-8 bg-white/10" />

            {/* Phone + Zone */}
            <div className="flex flex-col items-center sm:items-start gap-0.5">
              <a
                href={`tel:${PHONE_TEL}`}
                onClick={() => trackCallClick('final_cta')}
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                {`Ligue: ${PHONE_DISPLAY}`}
              </a>
              <span className="inline-flex items-center gap-1 text-white/35 text-[11px]">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                Servimos todo o Grande Porto e Norte de Portugal
              </span>
            </div>

          </div>
        </div>
      </section>

      <QuizForm isOpen={isQuizOpen} onClose={closeQuiz} />
    </>
  );
};

export default FinalCTA;
