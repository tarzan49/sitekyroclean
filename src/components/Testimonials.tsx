import { Star } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

const REVIEWS = [
  {
    name: "Pedro Novais",
    initial: "P",
    text: "Serviço impecável! Dois jovens trabalhadores muito educados e profissionais fizeram a limpeza do meu sofá com grande cuidado e o resultado ficou excelente. Recomendo vivamente!",
  },
  {
    name: "Miriam Salomão",
    initial: "M",
    text: "Excelente trabalho no meu tapete branco, que ficou limpinho! A equipa também é muito educada e foram muito cuidadosos com os restantes móveis da casa. Eu os recomendo!",
  },
  {
    name: "Lucas Costa",
    initial: "L",
    text: "Estiveram em casa, Guilherme e Tomas, foram pontuais, profissionais, cordiais e fizeram um excelente trabalho trazendo nosso sofá de volta a vida. Recomendo.",
  },
  {
    name: "Sonya Marabyan",
    initial: "S",
    text: "We called the guys to clean the sofa, they did everything very quickly and efficiently. Literally an hour and everything was ready.",
  },
  {
    name: "Francisco Peixoto",
    initial: "F",
    text: "Limpeza e serviço impecável! Achei o estilo do vídeo antes e depois muito criativo também, dá a entender que sabem o que fazem.",
  },
  {
    name: "Lumiere Restaurante",
    initial: "L",
    text: "Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso! Recomendo.",
  },
  {
    name: "Jaime Guimarães",
    initial: "J",
    text: "Recorri a esta empresa para a limpeza de um sofá e fiquei muito agradado com o resultado final e com a simpatia da equipa. Serviço 5 estrelas.",
  },
  {
    name: "Vitor Lucena",
    initial: "V",
    text: "Profissionais! Deixaram o sofá como novo! Preço acessível e muito simpáticos. Recomendo muito.",
  },
  {
    name: "Clarinda Neves",
    initial: "C",
    text: "Fiquei muito satisfeita com o resultado. O meu sofá ficou completamente renovado. Equipa pontual, atenciosa e muito profissional. Voltarei a contratar com certeza!",
  },
];

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
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
    const timer = setInterval(() => emblaApi.scrollNext(), 3500);
    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-[#FAFAF7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div
          className="mb-12 md:mb-16 transition-all duration-700"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-px bg-[#D4AF37]" />
            <p className="text-[9px] font-semibold text-[#D4AF37] tracking-[0.35em] uppercase">
              O Que Dizem os Clientes
            </p>
          </div>
          <h2
            className="font-playfair font-light text-[#111111]"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
          >
            A confiança das<br />
            <em style={{ fontStyle: 'italic', color: '#1A4E30' }}>famílias portuguesas.</em>
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="transition-all duration-700"
          style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: '150ms' }}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-5">
              {REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="flex-none w-[82vw] md:w-[calc((100%-40px)/3)] flex flex-col gap-4 bg-white p-6 md:p-7 border border-[#111111]/6 min-h-[240px] md:min-h-[260px]"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-[#111111]/55 leading-relaxed flex-1" style={{ fontWeight: 300 }}>
                    "{review.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#111111]/6">
                    <div className="w-8 h-8 bg-[#1A4E30] flex items-center justify-center text-white text-[11px] font-medium flex-shrink-0">
                      {review.initial}
                    </div>
                    <p className="text-[12px] font-medium text-[#111111] tracking-wide">{review.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="w-9 h-9 border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/35 hover:text-[#111111] hover:border-[#111111]/20 transition-all duration-200 flex-shrink-0"
              aria-label="Anterior"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>

            {/* Dash indicators */}
            <div className="flex gap-1.5 items-center">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className="transition-all duration-300"
                  style={{
                    width: selectedIndex === i ? '20px' : '4px',
                    height: '1px',
                    backgroundColor: selectedIndex === i ? '#D4AF37' : 'rgba(26,26,46,0.15)',
                  }}
                  aria-label={`Ir para avaliação ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => emblaApi?.scrollNext()}
              className="w-9 h-9 border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/35 hover:text-[#111111] hover:border-[#111111]/20 transition-all duration-200 flex-shrink-0"
              aria-label="Próximo"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
