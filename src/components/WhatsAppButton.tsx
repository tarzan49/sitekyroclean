import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/quizTracking";

const WhatsAppButton = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    const handleQuizState = (e: CustomEvent) => setIsQuizOpen(e.detail.isOpen);
    const handleStickyState = (e: CustomEvent) => setIsStickyVisible(e.detail.isVisible);
    window.addEventListener('quizStateChange', handleQuizState as EventListener);
    window.addEventListener('stickyCtaChange', handleStickyState as EventListener);
    return () => {
      window.removeEventListener('quizStateChange', handleQuizState as EventListener);
      window.removeEventListener('stickyCtaChange', handleStickyState as EventListener);
    };
  }, []);

  if (isQuizOpen) return null;

  return (
    <a
      href="https://wa.me/351925530647"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('floating')}
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 group ${
        isStickyVisible ? 'md:opacity-100 md:pointer-events-auto opacity-0 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center gap-2.5 bg-[#071a12] border border-[#25D366]/40 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.45)] hover:border-[#25D366]/70 hover:shadow-[0_6px_32px_rgba(37,211,102,0.18)] transition-all duration-200">
        <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" strokeWidth={2} />
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80 group-hover:text-white transition-colors">
          Falar por WhatsApp
        </span>
      </div>
    </a>
  );
};

export default WhatsAppButton;
