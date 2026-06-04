import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackWhatsAppClick } from "@/lib/quizTracking";

const WhatsAppButton = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    const handleQuizState = (e: CustomEvent) => {
      setIsQuizOpen(e.detail.isOpen);
    };

    const handleStickyState = (e: CustomEvent) => {
      setIsStickyVisible(e.detail.isVisible);
    };

    window.addEventListener('quizStateChange', handleQuizState as EventListener);
    window.addEventListener('stickyCtaChange', handleStickyState as EventListener);
    return () => {
      window.removeEventListener('quizStateChange', handleQuizState as EventListener);
      window.removeEventListener('stickyCtaChange', handleStickyState as EventListener);
    };
  }, []);

  const handleClick = () => {
    trackWhatsAppClick('floating');
  };

  // Hide when quiz is open or sticky CTA is visible on mobile
  if (isQuizOpen) return null;

  return (
    <a
      href="https://wa.me/351925530647"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${
        isStickyVisible ? 'md:opacity-100 md:pointer-events-auto opacity-0 pointer-events-none' : ''
      }`}
    >
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-[0.04] pointer-events-none" style={{ animationDuration: '3.5s' }} />
      <span className="absolute inset-[-4px] rounded-full bg-[#25D366] animate-ping opacity-[0.02] pointer-events-none" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />

      <Button
        size="lg"
        className="relative h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="sr-only">Contactar via WhatsApp</span>
      </Button>
      
      {/* Tooltip */}
      <div className="absolute right-16 bottom-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Fale connosco
      </div>
    </a>
  );
};

export default WhatsAppButton;
