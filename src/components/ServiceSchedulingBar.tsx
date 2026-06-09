import { useState } from "react";
import { MessageCircle } from "lucide-react";
import QuizForm from './QuizFormLazy';
import { trackWhatsAppClick } from "@/lib/quizTracking";

const WA_MESSAGES: Record<string, string> = {
  "limpeza-sofas":     "Olá! Preciso de limpeza profissional de sofá. Qual é o preço e disponibilidade?",
  "limpeza-colchoes":  "Olá! Preciso de higienização profissional de colchão. Qual é o preço e disponibilidade?",
  "limpeza-cadeiras":  "Olá! Preciso de limpeza profissional de cadeiras. Qual é o preço e disponibilidade?",
  "limpeza-tapetes":   "Olá! Preciso de lavagem profissional de tapetes. Qual é o preço e disponibilidade?",
  "limpeza-alcatifas": "Olá! Preciso de limpeza profissional de alcatifas. Qual é o preço e disponibilidade?",
  "impermeabilizacao": "Olá! Tenho interesse em impermeabilizar os meus estofos. Qual é o preço e disponibilidade?",
};

const SERVICE_SLUG_TO_QUIZ: Record<string, string> = {
  'limpeza-sofas': 'sofa',
  'limpeza-colchoes': 'mattress',
  'limpeza-tapetes': 'carpet',
  'limpeza-cadeiras': 'chairs',
  'limpeza-alcatifas': 'carpet',
};

interface ServiceSchedulingBarProps {
  serviceSlug: string;
  label?: string;
}

const ServiceSchedulingBar = ({ serviceSlug }: ServiceSchedulingBarProps) => {
  const quizService = SERVICE_SLUG_TO_QUIZ[serviceSlug];
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const waMessage = WA_MESSAGES[serviceSlug] ?? "Olá! Gostaria de pedir um orçamento. Qual é o preço e disponibilidade?";
  const waUrl = `https://wa.me/351925530647?text=${encodeURIComponent(waMessage)}`;

  const handleVerificar = () => {
    window.dispatchEvent(new CustomEvent("quizOpened"));
    sessionStorage.setItem("hasClickedQuote", "1");
    setIsQuizOpen(true);
  };

  return (
    <>
      <div className="flex gap-3 max-w-md animate-fade-in" style={{ animationDelay: "0.2s" }}>
        {/* Quiz button */}
        <div className="relative flex-1 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
          <button
            type="button"
            onClick={handleVerificar}
            className="relative w-full h-[54px] font-bold text-[#2a1800] shadow-lg hover:shadow-[0_8px_28px_rgba(201,168,76,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            style={{ background: "linear-gradient(135deg, #C9A84C 0%, #F0DC8A 40%, #C9A84C 75%, #A8882A 100%)" }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)" }}
            />
            <span className="relative text-[13px] font-semibold tracking-[0.18em] uppercase">Calcular o meu preço</span>
          </button>
        </div>

        {/* WhatsApp button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick(`service_hero_${serviceSlug}`)}
          className="relative flex-1 inline-flex items-center justify-center gap-2 h-[54px] px-5 font-bold text-white bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851] shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_2px_6px_rgba(0,0,0,0.28)] hover:scale-[1.025] active:scale-[0.95] transition-all duration-200 touch-manipulation"
        >
          <MessageCircle className="w-[16px] h-[16px] text-white flex-shrink-0" strokeWidth={2} />
          <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
        </a>
      </div>

      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} initialService={quizService} />
    </>
  );
};

export default ServiceSchedulingBar;
