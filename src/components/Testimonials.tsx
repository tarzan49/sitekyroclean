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
    text: "Limpeza e serviço impecável! Achei o estilo do vídeo antes e depois muito criativo também, dá a entender que sabem o que fazem 🙌🏻",
  },
  {
    name: "Lumiere Restaurante",
    initial: "L",
    text: "Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso! Recomendo 5⭐️",
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
    <section ref={sectionRef} className="py-24 bg-[#FDFDF9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: '#D4AF37' }}>
            O Que Dizem os Clientes
          </p>
          <h2 className="font-playfair text-2xl md:text-4xl font-bold text-[#1A1A2E] leading-[1.3]">
            A confiança das famílias portuguesas
          </h2>
          <div className="w-10 h-px mx-auto mt-5" style={{ backgroundColor: '#D4AF37', opacity: 0.5 }} />
        </div>

        {/* Carousel */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 md:gap-7">
              {REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="flex-none w-[85vw] md:w-[calc((100%-56px)/3)] flex flex-col gap-4 bg-[#FAFAF8] rounded-2xl p-6 md:p-7 border border-[#E8E4DE] shadow-sm min-h-[240px] md:min-h-[260px]"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm md:text-[15px] text-[#1A1A2E]/75 leading-relaxed flex-1">
                    "{review.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#E8E4DE]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0d3c47] to-[#1a5c6e] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.initial}
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{review.name}</p>
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
              className="w-9 h-9 rounded-full border border-[#E8E4DE] bg-white flex items-center justify-center text-[#1A1A2E]/50 hover:text-[#1A1A2E] hover:border-[#D4AF37]/50 transition-all duration-200 flex-shrink-0"
              aria-label="Anterior"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`rounded-full transition-all duration-200 ${selectedIndex === i ? 'w-[5px] h-[2px] bg-[#D4AF37]' : 'w-[2px] h-[2px] bg-[#1A1A2E]/20 hover:bg-[#1A1A2E]/40'}`}
                  aria-label={`Ir para avaliação ${i + 1}`}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="w-9 h-9 rounded-full border border-[#E8E4DE] bg-white flex items-center justify-center text-[#1A1A2E]/50 hover:text-[#1A1A2E] hover:border-[#D4AF37]/50 transition-all duration-200 flex-shrink-0"
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
