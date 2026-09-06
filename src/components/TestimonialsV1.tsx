import { Star, Quote } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ALL_REVIEWS } from "@/data/reviewsPool";

const GoogleG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 1 },
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 3000);
    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <section ref={sectionRef} className="py-24 bg-kyro-green overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={`mb-10 md:mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
              O QUE DIZEM OS CLIENTES
            </p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] text-white max-w-xl">
                A confiança das{" "}
                <em className="not-italic" style={{ color: '#D4AF37' }}>famílias portuguesas</em>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed max-w-2xl text-white/50">
                Mais de 1000 clientes em todo o país já confiaram os seus sofás, colchões e tapetes à Kyro Clean Solutions. Estas são as suas histórias.
              </p>
            </div>

            {/* Google rating badge */}
            <a
              href="https://www.google.com/search?q=Kyro+Clean+Solutions+Reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-5 py-4 rounded-2xl flex-shrink-0 transition-all hover:border-[#D4AF37]/40"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <GoogleG className="w-9 h-9 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-playfair text-2xl font-bold text-white leading-none">5.0</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-3 h-3 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-white/45 mt-1">100+ avaliações verificadas</p>
              </div>
            </a>
          </div>
        </div>

        {/* Carousel */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 md:gap-7">
              {ALL_REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="relative flex-none w-[85vw] md:w-[calc((100%-56px)/3)] flex flex-col p-6 md:p-7 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                    border: "1px solid rgba(212,175,55,0.18)",
                    borderTop: "2px solid #D4AF37",
                    boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Decorative quote mark */}
                  <Quote
                    className="absolute top-5 right-5 w-10 h-10 pointer-events-none select-none"
                    style={{ color: "rgba(212,175,55,0.12)" }}
                    fill="rgba(212,175,55,0.12)"
                  />

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4 flex-shrink-0 relative">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#D4AF37]" style={{ color: "#D4AF37" }} />
                    ))}
                  </div>

                  {/* Text */}
                  <div className="flex-1 mb-5 flex items-center relative">
                    <p className="text-[13.5px] md:text-sm leading-relaxed italic text-white/70">
                      "{review.text}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 flex-shrink-0 pt-4 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#12121e] font-bold text-xs"
                        style={{ background: "linear-gradient(135deg, #EDD96A, #D4AF37)" }}
                      >
                        {review.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: "0 0 0 2px #0a2922" }}>
                        <GoogleG className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-white truncate">{review.name}</span>
                      <span className="text-[9.5px] font-medium tracking-wide text-white/40">
                        Avaliação Google verificada
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Prev */}
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white hover:border-[#D4AF37]/40 transition-all duration-200 flex-shrink-0"
              aria-label="Anterior"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>

            {/* Counter */}
            <span className="text-[10px] text-white/30 font-mono tracking-widest">
              {selectedIndex + 1}/{ALL_REVIEWS.length}
            </span>

            {/* Next */}
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white hover:border-[#D4AF37]/40 transition-all duration-200 flex-shrink-0"
              aria-label="Próximo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
