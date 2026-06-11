import { useState } from "react";
import { Star, MapPin, MessageCircle } from "lucide-react";
import QuizForm from "./QuizFormLazy";
import { trackWhatsAppClick } from "@/lib/quizTracking";
import { WHATSAPP_BASE, REVIEW_RATING, REVIEW_COUNT } from "@/constants/business";

import sofaD        from "@/assets/service-sofa-new.webp";
import sofaM        from "@/assets/service-sofa-new-mobile.webp";
import mattressD    from "@/assets/service-mattress-branded.webp";
import mattressM    from "@/assets/service-mattress-branded-mobile.webp";
import chairsD      from "@/assets/service-chairs-new.webp";
import chairsM      from "@/assets/service-chairs-new-mobile.webp";
import carpetD      from "@/assets/service-carpet-new.webp";
import carpetM      from "@/assets/service-carpet-new-mobile.webp";
import rugsD        from "@/assets/service-rugs-new.webp";
import rugsM        from "@/assets/service-rugs-new-mobile.webp";
import waterproofD  from "@/assets/hero-waterproofing.webp";
import waterproofM  from "@/assets/hero-waterproofing-mobile.webp";

const HERO_IMAGES: Record<string, { d: string; m: string }> = {
  "limpeza-sofas":     { d: sofaD,       m: sofaM },
  "limpeza-colchoes":  { d: mattressD,   m: mattressM },
  "limpeza-cadeiras":  { d: chairsD,     m: chairsM },
  "limpeza-tapetes":   { d: carpetD,     m: carpetM },
  "limpeza-alcatifas": { d: rugsD,       m: rugsM },
  "impermeabilizacao": { d: waterproofD, m: waterproofM },
};

const WA_MESSAGES: Record<string, string> = {
  "limpeza-sofas":     "Olá! Preciso de limpeza profissional de sofá. Qual é o preço e disponibilidade?",
  "limpeza-colchoes":  "Olá! Preciso de higienização profissional de colchão. Qual é o preço e disponibilidade?",
  "limpeza-cadeiras":  "Olá! Preciso de limpeza profissional de cadeiras. Qual é o preço e disponibilidade?",
  "limpeza-tapetes":   "Olá! Preciso de lavagem profissional de tapetes. Qual é o preço e disponibilidade?",
  "limpeza-alcatifas": "Olá! Preciso de limpeza profissional de alcatifas. Qual é o preço e disponibilidade?",
  "impermeabilizacao": "Olá! Tenho interesse em impermeabilizar os meus estofos. Qual é o preço e disponibilidade?",
};

const QUIZ_SERVICE: Record<string, string> = {
  "limpeza-sofas":    "sofa",
  "limpeza-colchoes": "mattress",
  "limpeza-tapetes":  "carpet",
  "limpeza-cadeiras": "chairs",
  "limpeza-alcatifas":"carpet",
};

const MAPS_URL = "https://share.google/nPsWWFXrUrF12rIXJ";

interface ServiceHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  serviceSlug: string;
}

const ServiceHero = ({
  badge = "KYRO CLEAN SOLUTIONS",
  title,
  subtitle,
  serviceSlug,
}: ServiceHeroProps) => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const imgs = HERO_IMAGES[serviceSlug];

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent("quizOpened"));
    sessionStorage.setItem("hasClickedQuote", "1");
    setIsQuizOpen(true);
  };

  const waUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(
    WA_MESSAGES[serviceSlug] ?? "Olá! Gostaria de pedir um orçamento."
  )}`;

  // Last 2 words go gold on the bottom line, rest stays white on top
  const words = title.trim().split(" ");
  const goldPart = words.slice(-2).join(" ");
  const whitePart = words.slice(0, -2).join(" ");

  return (
    <>
      <section
        className="relative min-h-[92vh] md:min-h-[88vh] flex items-center z-[1] pt-[56px] sm:pt-[70px] md:pt-[100px] pb-[60px] md:pb-[100px] overflow-hidden"
        aria-label={title}
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {imgs && (
            <picture>
              <source media="(max-width: 767px)" srcSet={imgs.m} type="image/webp" />
              <source srcSet={imgs.d} type="image/webp" />
              <img
                src={imgs.d}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="eager"
                decoding="sync"
              />
            </picture>
          )}
          <div className="absolute inset-0" style={{ background: "rgba(8,10,30,0.42)" }} />
        </div>

        {/* Left gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0B2F2A]/88 via-[#0B2F2A]/55 to-transparent pointer-events-none" />
        {/* Mobile overlay */}
        <div className="md:hidden absolute inset-0 z-[1] bg-kyro-green/72 pointer-events-none" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-5 md:px-8 relative z-10">
          <div className="max-w-2xl">

            {/* Overline */}
            <div className="inline-flex items-start mb-5">
              <div className="flex flex-col gap-1">
                <div className="w-7 h-px bg-gradient-to-r from-gold to-transparent" />
                <span
                  className="text-[10px] font-bold text-gold/90 tracking-[0.30em] uppercase"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                >
                  {badge}
                </span>
              </div>
            </div>

            {/* H1 */}
            <h1
              className="font-playfair text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.15] mb-4 md:mb-5"
              style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
            >
              {whitePart && <>{whitePart}<br /></>}
              <span style={{ color: "#D4AF37" }}>{goldPart}.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-sm sm:text-base md:text-lg text-white leading-relaxed mb-8 max-w-lg"
              style={{ textShadow: "0 1px 10px rgba(0,0,0,0.55)" }}
            >
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 w-full max-w-sm">

              {/* Primary — gold */}
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#C9A84C]/50 to-[#E8D070]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                <button
                  onClick={openQuiz}
                  className={[
                    "relative w-full font-bold text-[#12121e] touch-manipulation",
                    "h-[58px] md:h-[52px] px-8",
                    "bg-gradient-to-r from-[#C9A84C] via-[#EDD96A] to-[#C9A84C]",
                    "shadow-[0_6px_22px_rgba(201,168,76,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-2px_0_rgba(0,0,0,0.12)]",
                    "hover:shadow-[0_10px_32px_rgba(201,168,76,0.60),0_4px_10px_rgba(0,0,0,0.32)]",
                    "hover:scale-[1.025] active:scale-[0.95]",
                    "transition-all duration-150",
                  ].join(" ")}
                >
                  <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Calcular o meu preço</span>
                </button>
              </div>

              {/* Secondary — WhatsApp */}
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-[#25D366]/40 opacity-30 blur-lg group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(`service_hero_${serviceSlug}`)}
                  className={[
                    "relative flex items-center justify-center gap-2 w-full font-bold text-white touch-manipulation",
                    "h-[58px] md:h-[52px] px-8",
                    "bg-gradient-to-r from-[#1DA851] via-[#25D366] to-[#1DA851]",
                    "shadow-[0_6px_22px_rgba(37,211,102,0.42),0_2px_6px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-2px_0_rgba(0,0,0,0.12)]",
                    "hover:shadow-[0_10px_32px_rgba(37,211,102,0.60),0_4px_10px_rgba(0,0,0,0.32)]",
                    "hover:scale-[1.025] active:scale-[0.95]",
                    "transition-all duration-150",
                  ].join(" ")}
                >
                  <MessageCircle className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2} />
                  <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">Falar por WhatsApp</span>
                </a>
              </div>

              {/* Google Maps pill */}
              <div className="flex justify-center pt-1">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black/30 border border-white/[0.14] rounded-full px-4 py-2 backdrop-blur-sm hover:bg-black/45 transition-colors group"
                >
                  <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0 group-hover:scale-110 transition-transform" strokeWidth={2} />
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <span className="text-white/80 text-[11px] font-semibold tracking-wide">
                    {REVIEW_RATING} · {REVIEW_COUNT}+ avaliações Google
                  </span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      <QuizForm
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        initialService={QUIZ_SERVICE[serviceSlug]}
      />
    </>
  );
};

export default ServiceHero;
