import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { Link } from "react-router-dom";
import { MessageCircle, Phone } from "lucide-react";
import { WHATSAPP_BASE, PHONE_TEL, PHONE_DISPLAY } from "@/constants/business";

/** Minimal English-only header for the /en/ tourist pages. Deliberately no
 * dropdown mega-menu and no "book now" quiz button — the PT quiz flow is
 * Portuguese-only and out of scope for this audience. Just logo, phone, and
 * WhatsApp, matching the focused, high-intent nature of these landing pages. */
const EnHeader = () => {
  const waHref = `${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage(true))}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#111111]/8">
      <div className="mx-auto px-5 md:px-8 max-w-7xl h-14 md:h-[60px] flex items-center justify-between gap-4">
        <Link to="/en/emergency-stain-removal-porto" className="flex h-11 min-w-0 shrink items-center whitespace-nowrap font-playfair text-[15.5px] font-bold leading-none tracking-[-0.03em] text-[#111111] min-[400px]:text-[17px] md:text-[20px]">
          <span className="text-[#D4AF37]">KYRO</span>&nbsp;Clean Solutions
        </Link>

        <div className="flex shrink-0 items-center gap-1 md:gap-3">
          <a href={`tel:${PHONE_TEL}`} data-tracking-source="en_header" aria-label="Call" className="flex h-11 min-w-0 w-10 touch-manipulation items-center justify-center gap-2 whitespace-nowrap text-[15px] font-semibold text-[#111111] md:w-auto">
            <Phone className="h-[18px] w-[18px] shrink-0 text-[#0B2F2A] md:h-4 md:w-4 md:text-[#D4AF37]" strokeWidth={2.2} />
            <span className="hidden md:inline">{PHONE_DISPLAY}</span>
          </a>
          <a href={waHref} target="_blank" rel="noopener noreferrer" data-tracking-source="en_header" className="flex h-10 min-h-0 touch-manipulation items-center gap-2 whitespace-nowrap rounded-xl bg-[#25D366] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#20BD5A]">
            <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
};

export default EnHeader;
