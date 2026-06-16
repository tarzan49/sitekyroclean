import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import painpointStains from "@/assets/painpoint-stains.webp";
import heroAcarosColchao from "@/assets/hero-p-acaros-colchao.webp";
import heroMauCheiroTapete from "@/assets/hero-p-mau-cheiro-tapete.webp";
import galeriaCadeiraResultado from "@/assets/galeria-cadeira-resultado.webp";

const PROBLEMS = [
  {
    image: painpointStains,
    alt: "Mancha de vinho num sofá",
    type: "Sofás",
    link: "/limpeza-sofas",
    title: "Manchas que\nficam para sempre",
    solution: "Extração profunda: resultado no próprio dia",
    pos: "center",
  },
  {
    image: heroAcarosColchao,
    alt: "Ácaros e bactérias microscópicas num colchão",
    type: "Colchões",
    link: "/limpeza-colchoes",
    title: "Ácaros e bactérias\ninvisíveis ao olho nu",
    solution: "Higienização antibacteriana: 99% eliminados",
    pos: "center",
  },
  {
    image: heroMauCheiroTapete,
    alt: "Odores acumulados num tapete",
    type: "Tapetes",
    link: "/limpeza-tapetes",
    title: "Odores que se\nacumulam meses a fio",
    solution: "Desodorização completa no mesmo dia",
    pos: "center",
  },
  {
    image: galeriaCadeiraResultado,
    alt: "Cadeira antes e depois da limpeza, tecido renovado",
    type: "Cadeiras",
    link: "/limpeza-cadeiras",
    title: "Desgaste acelerado\nsem proteção",
    solution: "Impermeabilização com garantia até 12 meses",
    pos: "center",
  },
];

const PainPointsSolutionsV1 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-14 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={`mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.8 }}>
              O QUE TRATAMOS
            </span>
          </div>
          <h2 className="font-playfair text-[1.85rem] sm:text-4xl md:text-[2.6rem] font-bold text-[#111111] leading-[1.1] max-w-xl">
            Os 4 problemas que{' '}
            <em className="not-italic" style={{ color: '#D4AF37' }}>
              resolvemos no próprio dia
            </em>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {PROBLEMS.map((problem, i) => (
            <Link
              key={i}
              to={problem.link}
              className={`relative overflow-hidden rounded-2xl group block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ height: "clamp(220px, 26vw, 300px)", transitionDelay: `${i * 90}ms` }}
            >
              <img
                src={problem.image}
                alt={problem.alt}
                className="absolute inset-0 w-full h-full object-cover saturate-[0.6] group-hover:saturate-[0.85] group-hover:scale-[1.03] transition-all duration-700 ease-out"
                style={{ objectPosition: problem.pos }}
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071a12]/90 via-[#071a12]/35 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#071a12]/60 to-transparent" />

              <div className="absolute top-4 left-5 md:top-5 md:left-7 flex items-center gap-2.5">
                <div className="h-px w-4" style={{ backgroundColor: "#D4AF37", opacity: 0.75 }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/85">
                  {problem.type}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                <div className="h-px w-8 mb-3" style={{ backgroundColor: "#D4AF37", opacity: 0.65 }} />
                <h3 className="font-playfair font-bold text-white leading-[1.2] mb-2 whitespace-pre-line text-lg md:text-xl">
                  {problem.title}
                </h3>
                <p className="text-white/60 text-[13px] leading-relaxed">
                  {problem.solution}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PainPointsSolutionsV1;
