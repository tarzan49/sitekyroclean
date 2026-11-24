import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Home, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/SectionHeader";
import { PHONE_TEL, PHONE_DISPLAY, WHATSAPP_BASE } from "@/constants/business";
import { buildGeneralWaMessage } from "@/lib/whatsappMessages";
import { NOT_FOUND_H1, NOT_FOUND_LINKS, NOT_FOUND_LINKS_HEADING, NOT_FOUND_TEXT } from "@/data/supportPages";

const NotFound = () => {
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, follow');
    return () => { robotsMeta?.setAttribute('content', 'index, follow'); };
  }, []);

  const h1 = NOT_FOUND_H1.split(" ");
  const heading = NOT_FOUND_LINKS_HEADING.split(" ");

  return <><Header /><main className="bg-[#FDFDF9]">
    <section data-mobile-hero="text" className="flex min-h-[88svh] flex-col justify-center bg-kyro-green pb-12 pt-24 text-white lg:min-h-[560px]">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-[28px] font-semibold leading-tight text-white md:text-5xl">{h1.slice(0, -1).join(" ")} <em className="not-italic text-[#D4AF37]">{h1.slice(-1)}</em></h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">{NOT_FOUND_TEXT}</p>
        <div className="mt-8 max-w-md">
          <a href={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildGeneralWaMessage())}`} target="_blank" rel="noopener noreferrer" data-tracking-source="not_found_page" className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#16833e] px-4 py-3 text-base font-semibold text-white hover:bg-[#116b32]"><MessageCircle className="h-5 w-5 shrink-0" />Falar por WhatsApp</a>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link to="/" className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-2 text-sm font-semibold text-white"><Home className="h-4 w-4 shrink-0 text-[#D4AF37]" />Página inicial</Link>
            <a href={`tel:${PHONE_TEL}`} data-tracking-source="not_found_page" className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-2 text-sm font-semibold text-white"><Phone className="h-4 w-4 shrink-0 text-[#D4AF37]" />{PHONE_DISPLAY}</a>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#FDFDF9] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <SectionHeader heading={heading.slice(0, -1).join(" ")} goldWord={heading.slice(-1)[0]} className="!mb-5" />
        <div className="grid gap-x-10 border-t border-[#dfe5df] sm:grid-cols-2">
          {NOT_FOUND_LINKS.map(link => <Link key={link.href} to={link.href} className="flex min-h-14 items-center justify-between gap-4 border-b border-[#dfe5df] text-base font-semibold text-[#173e2b]">{link.label}<ArrowRight className="h-4 w-4 shrink-0 text-[#D4AF37]" /></Link>)}
        </div>
      </div>
    </section>
  </main><Footer /></>;
};

export default NotFound;
