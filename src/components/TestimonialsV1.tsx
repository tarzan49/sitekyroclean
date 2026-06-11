import { Star } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

const REVIEWS = [
  {
    name: "Paulo Henrique Cavalcante Silverio",
    initial: "P",
    text: "Serviço impecável! Atendimento ótimo dos rapazes.",
  },
  {
    name: "Beatriz Lança",
    initial: "B",
    text: "Fizeram um ótimo trabalho com um sofá super antigo e com alguma sujidade acumulada, recomendo muito!!!",
  },
  {
    name: "Stephany Rios",
    initial: "S",
    text: "Fizeram um ótimo trabalho na limpeza do sofá. Vi o serviço a ser feito hoje e as manchas desapareceram logo após a limpeza. O sofá ficou com um aspeto renovado, limpo e com um cheiro muito agradável. Estou muito satisfeita com o trabalho e recomendo o serviço!",
  },
  {
    name: "Guillermo Rumbos",
    initial: "G",
    text: "Ótimo trabalho.",
  },
  {
    name: "Vitor Lucena",
    initial: "V",
    text: "Incrível trabalho, recomendo 5⭐️",
  },
  {
    name: "Luisa Peixoto",
    initial: "L",
    text: "Excelente serviço.",
  },
  {
    name: "João Abreu",
    initial: "J",
    text: "Ótimo serviço, 100% recomendado!!",
  },
  {
    name: "PIFFEN",
    initial: "P",
    text: "Muito bom! Excelente serviço, sem dúvida irei voltar a contactar!",
  },
  {
    name: "Manuel Reis",
    initial: "M",
    text: "Serviço 5 estrelas!",
  },
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
        <div className={`mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
              O QUE DIZEM OS CLIENTES
            </p>
          </div>
          <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold leading-[1.1] text-[#111111] max-w-xl">
            A confiança das{" "}
            <em className="not-italic" style={{ color: '#D4AF37' }}>famílias portuguesas</em>
          </h2>
        </div>

        {/* Carousel */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 md:gap-7">
              {REVIEWS.map((review, i) => (
                <div
                  key={i}
                  className="flex-none w-[85vw] md:w-[calc((100%-56px)/3)] flex flex-col rounded-2xl overflow-hidden"
                  style={{
                    background: "#071a12",
                    border: "1px solid rgba(212,175,55,0.13)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                    minHeight: 270,
                  }}
                >
                  {/* Top gold hairline */}
                  <div className="h-px w-full flex-shrink-0" style={{ background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.40) 40%,rgba(212,175,55,0.40) 60%,transparent)" }} />

                  <div className="flex flex-col flex-1 p-6 md:p-7">
                    {/* Decorative quote */}
                    <div
                      className="font-playfair select-none mb-2 flex-shrink-0"
                      style={{ fontSize: "4.5rem", lineHeight: 0.75, color: "rgba(212,175,55,0.13)" }}
                    >
                      "
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3 flex-shrink-0">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-[13.5px] md:text-sm leading-relaxed flex-1 mb-5" style={{ color: "rgba(255,255,255,0.62)" }}>
                      {review.text}
                    </p>

                    {/* Divider */}
                    <div className="h-px w-full mb-4 flex-shrink-0" style={{ background: "rgba(212,175,55,0.14)" }} />

                    {/* Author */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #0d3c2a 0%, #1a6040 100%)" }}
                      >
                        {review.initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-semibold text-white/90 truncate">{review.name}</span>
                        <span className="text-[9.5px] font-medium tracking-wide" style={{ color: "rgba(212,175,55,0.52)" }}>
                          Avaliação Google ✓
                        </span>
                      </div>
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
              className="w-9 h-9 rounded-full border border-[#E8E4DE] bg-white flex items-center justify-center text-[#111111]/50 hover:text-[#111111] hover:border-[#D4AF37]/50 transition-all duration-200 flex-shrink-0"
              aria-label="Anterior"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>

            {/* Counter */}
            <span className="text-[10px] text-[#111111]/30 font-mono tracking-widest">
              {selectedIndex + 1}/{REVIEWS.length}
            </span>

            {/* Next */}
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="w-9 h-9 rounded-full border border-[#E8E4DE] bg-white flex items-center justify-center text-[#111111]/50 hover:text-[#111111] hover:border-[#D4AF37]/50 transition-all duration-200 flex-shrink-0"
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
