import { Link } from "react-router-dom";
import { MessageCircle, Phone } from "lucide-react";
import { WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { trackCallClick } from "@/lib/analytics";

/** Minimal English-only header for the /en/ tourist pages. Deliberately no
 * dropdown mega-menu and no "book now" quiz button — the PT quiz flow is
 * Portuguese-only and out of scope for this audience. Just logo, phone, and
 * WhatsApp, matching the focused, high-intent nature of these landing pages. */
const EnHeader = () => {
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent("Hi! I need help with a cleaning issue.")}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#111111]/8">
      <div className="mx-auto px-5 md:px-8 max-w-7xl h-14 md:h-[60px] flex items-center justify-between gap-4">
        <Link to="/en/emergency-stain-removal-porto" className="font-playfair text-base md:text-[17px] font-normal text-[#111111] tracking-tight shrink-0 leading-none">
          Kyro Clean Solutions
        </Link>

        <div className="flex items-center gap-2 md:gap-2.5">
          <a
            href={`tel:${PHONE_TEL}`}
            onClick={() => trackCallClick("en_header")}
            className="w-11 h-11 md:w-auto md:h-auto border border-[#111111]/25 flex items-center justify-center md:px-4 md:py-2.5 gap-2 touch-manipulation text-[#111111] text-[10px] font-semibold tracking-[0.18em] uppercase hover:bg-[#111111]/4 transition-colors"
            aria-label="Call"
          >
            <Phone className="w-4 h-4 md:w-3.5 md:h-3.5 text-[#111111]/70 flex-shrink-0" strokeWidth={2} />
            <span className="hidden md:inline whitespace-nowrap">{PHONE_DISPLAY}</span>
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("en_header")}
            className="h-11 md:h-auto px-4 md:px-4 md:py-2.5 border border-[#25D366] flex items-center justify-center gap-2 touch-manipulation text-[#111111] text-[10px] font-semibold tracking-[0.18em] uppercase hover:bg-[#25D366]/6 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 md:w-3.5 md:h-3.5 text-[#25D366] flex-shrink-0" strokeWidth={2} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default EnHeader;
