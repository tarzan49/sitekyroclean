import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { QUIZ_STATE_CHANGE_EVENT } from "@/constants/quiz";

const GlobalPromoBanner = () => {
  const location = useLocation();
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Listen for quiz state changes
  useEffect(() => {
    const handleQuizState = (e: CustomEvent) => {
      setIsQuizOpen(e.detail.isOpen);
    };

    window.addEventListener(QUIZ_STATE_CHANGE_EVENT, handleQuizState as EventListener);
    return () => window.removeEventListener(QUIZ_STATE_CHANGE_EVENT, handleQuizState as EventListener);
  }, []);
  
  // Don't show on /packs page or when quiz is open
  if (location.pathname === "/packs" || isQuizOpen) {
    return null;
  }

  return (
    <Link 
      to="/packs"
      className="block bg-gradient-to-r from-[#0d3c47] via-[#1a5a7a] to-[#0d3c47] text-white py-2.5 md:py-3 px-4 hover:from-[#1a5a7a] hover:to-[#1a5a7a] transition-all shadow-sm"
    >
      <div className="container mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#beb47d]" />
            <span className="font-semibold text-sm">
              Packs exclusivos: Limpeza + Impermeabilização com 15% desconto
            </span>
          </div>
          <span className="font-bold text-sm text-[#beb47d] underline underline-offset-2 hover:no-underline transition-all">
            Ver Packs →
          </span>
        </div>
        
        {/* Mobile Layout - Compact */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className="h-4 w-4 text-[#beb47d] flex-shrink-0" />
            <span className="font-semibold text-xs leading-tight">
              Packs exclusivos: até 15% desconto
            </span>
          </div>
          <span className="font-bold text-xs text-[#beb47d] underline underline-offset-2 whitespace-nowrap flex-shrink-0">
            Ver Packs
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GlobalPromoBanner;