import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import sofaImg         from "@/assets/service-sofa-new.webp";
import sofaImgM        from "@/assets/service-sofa-new-mobile.webp";
import waterproofImg   from "@/assets/hero-waterproofing.webp";
import waterproofImgM  from "@/assets/hero-waterproofing-mobile.webp";
import carpetImg       from "@/assets/service-carpet-new.webp";
import carpetImgM      from "@/assets/service-carpet-new-mobile.webp";
import mattressImg     from "@/assets/service-mattress-branded.webp";
import mattressImgM    from "@/assets/service-mattress-branded-mobile.webp";
import chairsImg       from "@/assets/service-chairs-new.webp";
import chairsImgM      from "@/assets/service-chairs-new-mobile.webp";
import rugsImg         from "@/assets/service-rugs-new.webp";
import rugsImgM        from "@/assets/service-rugs-new-mobile.webp";
import iconSofa      from "@/assets/icon-sofa.webp";
import iconWaterproof from "@/assets/icon-waterproof.webp";
import iconCarpet    from "@/assets/icon-carpet.webp";
import iconMattress  from "@/assets/icon-mattress.webp";
import iconChair     from "@/assets/icon-chair.webp";
import iconRug       from "@/assets/icon-rug.webp";

/* ─── Tune these ─────────────────────────────────────────────────── */
const GAP         = 28;    // px between cards
const AUTOPLAY_MS = 3000;  // ms per slide
const SLIDE_MS    = 720;   // transition duration
const CLONES      = 3;     // items cloned at each end
const N           = 6;     // total real items

/* ─── Helpers ────────────────────────────────────────────────────── */
function getLayout(w: number): { visibleCount: number; cardWidth: number } {
  // visibleCount drives how many full cards appear (1.2 on mobile = shows partial next)
  const vc  = w >= 1024 ? 3 : w >= 640 ? 2 : 1.2;
  const gaps = Math.ceil(vc) - 1;          // full gaps between visible cards
  const cw  = (w - gaps * GAP) / vc;
  return { visibleCount: vc, cardWidth: cw };
}

// Which slot in the visible window is the "hero" (most prominent)
function heroOffset(vc: number): number {
  return Math.floor((Math.floor(vc) - 1) / 2);
  // desktop (3): 1  → middle card
  // tablet  (2): 0  → first card
  // mobile (1.2): 0 → only full card
}

/* ─── ServiceCard ─────────────────────────────────────────────────── */
interface CardProps {
  service: {
    titleKey: string; priceKey: string;
    image: string; imageM: string; icon: string;
    link: string; altText: string; badge: string;
  };
  prominence: "hero" | "side" | "far";
}

const ServiceCard = ({ service, prominence }: CardProps) => {
  const { t } = useTranslation();
  const isHero = prominence === "hero";
  const isSide = prominence === "side";

  return (
    <Link
      to={service.link}
      className="block relative overflow-hidden rounded-2xl group select-none"
      style={{
        height: 358,
        boxShadow: isHero
          ? "0 20px 60px rgba(0,0,0,0.50), 0 0 0 1px rgba(212,175,55,0.20)"
          : isSide
          ? "0 8px 32px rgba(0,0,0,0.28)"
          : "0 4px 16px rgba(0,0,0,0.18)",
        transition: `box-shadow ${SLIDE_MS}ms ease`,
      }}
      tabIndex={isHero ? 0 : -1}
    >
      {/* Full-bleed image, mobile version below 768px */}
      <picture className="absolute inset-0 w-full h-full">
        <source media="(max-width: 767px)" srcSet={service.imageM} type="image/webp" />
        <source media="(min-width: 768px)" srcSet={service.image} type="image/webp" />
        <img
          src={service.image}
          alt={service.altText}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
      </picture>

      {/* Base gradient, warm deep green, no purple tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(4,16,11,0.97) 0%, rgba(4,16,11,0.82) 22%, rgba(4,16,11,0.44) 50%, rgba(4,16,11,0.10) 72%, transparent 100%)",
        }}
      />
      {/* Hover lift, subtle gold warmth on hover */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(to top, rgba(10,7,2,0.30) 0%, rgba(212,175,55,0.04) 50%, transparent 100%)",
        }}
      />

      {/* Hero gold line */}
      {isHero && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: "linear-gradient(90deg,transparent,#D4AF37 40%,#D4AF37 60%,transparent)" }}
        />
      )}

      {/* Badge */}
      <div className="absolute top-3.5 left-4 z-10">
        <span
          className="block text-[9px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "rgba(255,255,255,0.45)", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
        >
          {service.badge}
        </span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-8 z-10">
        {/* Gold accent line */}
        <div
          className="mb-3 rounded-full"
          style={{
            width: isHero ? "28px" : "16px",
            height: "1.5px",
            backgroundColor: "#D4AF37",
            opacity: isHero ? 0.85 : 0.45,
            transition: `width ${SLIDE_MS}ms ease`,
          }}
        />
        <h3
          className="font-playfair font-bold leading-tight text-white group-hover:text-[#D4AF37] transition-colors duration-300"
          style={{
            fontSize: isHero ? "1.2rem" : "1rem",
            textShadow: "0 1px 8px rgba(0,0,0,0.95), 0 2px 20px rgba(0,0,0,0.70)",
            transition: `font-size ${SLIDE_MS}ms ease`,
          }}
        >
          {t(service.titleKey)}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
            a partir de{" "}
            <span style={{ color: "#D4AF37", fontWeight: 700 }}>{t(service.priceKey)}</span>
          </p>
          {isHero && (
            <span className="text-[10px] font-semibold tracking-wide text-white/40 group-hover:text-gold/70 transition-colors duration-300">
              Ver serviço →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

/* ─── Main Section ────────────────────────────────────────────────── */
const Services = () => {
  const { t } = useTranslation();
  const sectionRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isVisible,    setIsVisible]    = useState(false);
  const [cardWidth,    setCardWidth]    = useState(0);
  const [containerW,   setContainerW]   = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [offsetIndex,  setOffsetIndex]  = useState(CLONES);   // extended index
  const [animated,     setAnimated]     = useState(true);
  const [isPaused,     setIsPaused]     = useState(false);

  /* Real index (0‥N-1) for dots */
  const realIndex = ((offsetIndex - CLONES) % N + N) % N;

  /* Measure + re-measure on resize */
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const { visibleCount: vc, cardWidth: cw } = getLayout(w);
      setContainerW(w);
      setCardWidth(cw);
      setVisibleCount(vc);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* Left-aligned translateX, simple and predictable */
  const translateX = -(offsetIndex * (cardWidth + GAP));

  /* Navigate ±1 */
  const navigate = useCallback((dir: 1 | -1) => {
    setAnimated(true);
    setOffsetIndex(prev => prev + dir);
  }, []);

  /* ── Infinite loop reset ─────────────────────────────────────────
     onTransitionEnd fires for every CSS transition that ends, INCLUDING
     child elements (scale, opacity, box-shadow). We MUST check that
     the event originates from the track itself AND is the 'transform'
     property, otherwise the silent jump fires incorrectly.           */
  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      // Ignore bubbled events from children
      if (e.target !== e.currentTarget) return;
      // Only act on the transform property (our slide)
      if (e.propertyName !== "transform") return;

      if (offsetIndex >= CLONES + N) {
        setAnimated(false);
        setOffsetIndex(CLONES);                // jump to real item 0
      } else if (offsetIndex < CLONES) {
        setAnimated(false);
        setOffsetIndex(CLONES + N - 1);        // jump to real item N-1
      }
    },
    [offsetIndex],
  );

  /* Re-enable animation one frame after silent jump */
  useEffect(() => {
    if (!animated) {
      const id = setTimeout(() => setAnimated(true), 30);
      return () => clearTimeout(id);
    }
  }, [animated]);

  /* Autoplay */
  useEffect(() => {
    if (isPaused || cardWidth === 0) return;
    const id = setInterval(() => navigate(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, navigate, cardWidth]);

  /* Section entrance */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  /* Services */
  const services = [
    { titleKey: "services.items.waterproofing.title", priceKey: "services.items.waterproofing.price", image: waterproofImg, imageM: waterproofImgM, icon: iconWaterproof, link: "/impermeabilizacao",  altText: "Impermeabilização de Estofos", badge: "Proteção invisível total"      },
    { titleKey: "services.items.mattresses.title",    priceKey: "services.items.mattresses.price",    image: mattressImg,   imageM: mattressImgM,   icon: iconMattress,   link: "/limpeza-colchoes",   altText: "Limpeza de Colchões",          badge: "Durma em ambiente puro"         },
    { titleKey: "services.items.sofas.title",         priceKey: "services.items.sofas.price",         image: sofaImg,       imageM: sofaImgM,       icon: iconSofa,       link: "/limpeza-sofas",      altText: "Limpeza de Sofás",             badge: "O seu sofá novo outra vez"      },
    { titleKey: "services.items.chairs.title",        priceKey: "services.items.chairs.price",        image: chairsImg,     imageM: chairsImgM,     icon: iconChair,      link: "/limpeza-cadeiras",   altText: "Limpeza de Cadeiras",          badge: "Detalhe e higiene profunda"     },
    { titleKey: "services.items.carpets.title",       priceKey: "services.items.carpets.price",       image: carpetImg,     imageM: carpetImgM,     icon: iconCarpet,     link: "/limpeza-tapetes",    altText: "Limpeza de Tapetes",           badge: "Cuidado delicado fibra a fibra" },
    { titleKey: "services.items.rugs.title",          priceKey: "services.items.rugs.price",          image: rugsImg,       imageM: rugsImgM,       icon: iconRug,        link: "/limpeza-alcatifas",  altText: "Limpeza de Alcatifas",         badge: "Renovação total do espaço"      },
  ];

  /* Extended array for infinite loop: [last CLONES, ...all N, first CLONES] */
  const extended = [
    ...services.slice(N - CLONES),
    ...services,
    ...services.slice(0, CLONES),
  ];

  /* Hero slot: which position within the visible window is "center" */
  const heroSlot = heroOffset(visibleCount);
  // Extended index of the hero card
  const heroExtIdx = offsetIndex + heroSlot;

  return (
    <section
      ref={sectionRef}
      id="servicos"
      className="py-24 bg-white overflow-hidden scroll-mt-16"
    >
      {/* ── Header ── */}
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className={`mb-10 md:mb-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: "#D4AF37", opacity: 0.85 }}>
              OS NOSSOS SERVIÇOS
            </p>
          </div>
          <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] text-[#111111] max-w-xl">
            Cada estofo tratado{" "}
            <em className="not-italic" style={{ color: "#D4AF37" }}>com precisão.</em>
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#111111]/50 max-w-lg leading-relaxed">
            Sofás, colchões, tapetes, cadeiras e alcatifas: higienização profissional ao domicílio, resultado garantido no próprio dia.
          </p>
        </div>
      </div>

      {/* ── Mobile Grid (2-col, shows all 6) ── */}
      <div className={`block md:hidden px-5 grid grid-cols-2 gap-3 transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        {services.map((service, i) => (
          <Link
            key={i}
            to={service.link}
            className="relative overflow-hidden rounded-xl block"
            style={{ height: 210 }}
          >
            <picture className="absolute inset-0 w-full h-full">
              <img
                src={service.imageM}
                alt={service.altText}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </picture>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(4,16,11,0.96) 0%, rgba(4,16,11,0.58) 42%, transparent 100%)" }}
            />
            <div className="absolute top-2.5 left-3">
              <span
                className="text-[8px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "rgba(255,255,255,0.38)", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
              >
                {service.badge}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
              <div className="mb-1.5 rounded-full" style={{ width: "14px", height: "1.5px", backgroundColor: "#D4AF37", opacity: 0.60 }} />
              <h3 className="font-playfair font-bold text-white leading-tight" style={{ fontSize: "0.88rem" }}>
                {t(service.titleKey)}
              </h3>
              <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                a partir de <span style={{ color: "#D4AF37", fontWeight: 700 }}>{t(service.priceKey)}</span>
              </p>
            </div>
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/[0.06] pointer-events-none" />
          </Link>
        ))}
      </div>

      {/* ── Carousel (desktop/tablet only) ── */}
      <div
        ref={containerRef}
        className={`hidden md:block relative w-full transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={()   => setIsPaused(false)}
      >
        {/* Track, translateX only; NO other transitions here so transitionend is clean */}
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(${translateX}px)`,
            transition: animated
              ? `transform ${SLIDE_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
              : "none",
            willChange: "transform",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extended.map((service, i) => {
            const dist = i - heroExtIdx;
            const prominence: CardProps["prominence"] =
              dist === 0 ? "hero" : Math.abs(dist) === 1 ? "side" : "far";

            return (
              <div
                key={i}
                style={{
                  width:       cardWidth || undefined,
                  flexShrink:  0,
                  transform:   dist === 0 ? "scale(1.03)" : Math.abs(dist) === 1 ? "scale(1)" : "scale(0.96)",
                  opacity:     dist === 0 ? 1 : Math.abs(dist) === 1 ? 0.76 : 0.42,
                  transition:  `transform ${SLIDE_MS}ms cubic-bezier(0.33,1,0.68,1), opacity ${SLIDE_MS}ms ease`,
                  transformOrigin: "center center",
                }}
              >
                <ServiceCard service={service} prominence={prominence} />
              </div>
            );
          })}
        </div>

        {/* ── Arrow Left ── */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Serviço anterior"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10
                     w-11 h-11 rounded-full flex items-center justify-center
                     border border-[#D4AF37]/25 text-[#D4AF37]/80
                     hover:border-[#D4AF37]/55 hover:text-[#D4AF37]
                     active:scale-95 transition-all duration-200"
          style={{
            background: "rgba(12,12,22,0.60)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.30)",
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
        </button>

        {/* ── Arrow Right ── */}
        <button
          onClick={() => navigate(1)}
          aria-label="Próximo serviço"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10
                     w-11 h-11 rounded-full flex items-center justify-center
                     border border-[#D4AF37]/25 text-[#D4AF37]/80
                     hover:border-[#D4AF37]/55 hover:text-[#D4AF37]
                     active:scale-95 transition-all duration-200"
          style={{
            background: "rgba(12,12,22,0.60)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.30)",
          }}
        >
          <ChevronRight size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Counter (desktop only) ── */}
      <div className="hidden md:flex justify-center mt-7">
        <span className="text-[10px] text-[#111111]/30 font-mono tracking-widest">
          {realIndex + 1}/{N}
        </span>
      </div>
    </section>
  );
};

export default Services;
