import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import QuizForm from './QuizFormLazy';

interface QuizButtonProps {
  className?: string;
  buttonClassName?: string;
  problema?: string;
  ctaLabel?: string;
  initialLocation?: string;
  initialService?: string;
}

const QuizButton = ({ className = '', buttonClassName = '', problema, ctaLabel, initialLocation, initialService }: QuizButtonProps) => {
  const { t } = useTranslation();
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const label = ctaLabel ?? t('quiz.cta');

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent('quizOpened'));
    sessionStorage.setItem('hasClickedQuote', '1');
    setIsQuizOpen(true);
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
        <button
          onClick={openQuiz}
          className={[
            'relative rounded-full font-bold text-[#12121e] touch-manipulation',
            'bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]',
            'shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]',
            'hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.36)]',
            'hover:scale-[1.025] active:scale-[0.95]',
            'active:shadow-[0_2px_8px_rgba(201,168,76,0.30),inset_0_2px_4px_rgba(0,0,0,0.18)]',
            'transition-all duration-150',
            'px-8 py-3 text-sm',
            buttonClassName,
          ].join(' ')}
        >
          <span className="tracking-wide">{label}</span>
        </button>
      </div>

      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} problema={problema} initialLocation={initialLocation} initialService={initialService} />
    </>
  );
};

export default QuizButton;
