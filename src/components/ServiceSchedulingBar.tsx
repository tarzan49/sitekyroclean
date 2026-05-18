import { useState } from "react";
import QuizForm from './QuizFormLazy';

interface ServiceSchedulingBarProps {
  serviceSlug: string;
  label?: string;
}

const ServiceSchedulingBar = ({
  serviceSlug: _serviceSlug,
}: ServiceSchedulingBarProps) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleVerificar = () => {
    window.dispatchEvent(new CustomEvent("quizOpened"));
    sessionStorage.setItem("hasClickedQuote", "1");
    setIsQuizOpen(true);
  };

  return (
    <>
      <div
        className="max-w-md mx-auto mb-3 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <button
          type="button"
          onClick={handleVerificar}
          className="relative group w-full h-[54px] font-bold text-[#2a1800] text-[15px] rounded-full shadow-lg hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #C9A84C 0%, #F0DC8A 40%, #C9A84C 75%, #A8882A 100%)",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
            }}
          />
          <span className="relative tracking-wide">
            Verificar agenda na minha cidade
          </span>
        </button>
      </div>

      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </>
  );
};

export default ServiceSchedulingBar;
