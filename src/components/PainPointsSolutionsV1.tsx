import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
/** 900px copy of a landing-problem image, generated for this block only (public/images/home/). */
const homeVariant = (src: string) => `/images/home/${src.slice(src.lastIndexOf('/') + 1).replace(/\.webp$/, '-900.webp')}`;
const PROBLEMS = [
  {
    image: "/images/landing-problems/sofas/sofa-manchas-02.webp",
    alt: "Mancha de vinho num sofá",
    type: "Sofás",
    link: "/limpeza-sofas",
    title: "Manchas que\nficam para sempre",
    solution: "Extração profunda: resultado no próprio dia",
    pos: "center",
  },
  {
    image: "/images/landing-problems/colchoes/colchao-residuos-02.webp",
    alt: "Pormenor do tecido e das costuras de um colchão",
    type: "Colchões",
    link: "/limpeza-colchoes",
    title: "Ácaros e bactérias\ninvisíveis ao olho nu",
    solution: "Tratamentos anti-ácaros e desbacterização opcionais",
    pos: "center",
  },
  {
    image: "/images/landing-problems/tapetes/tapete-pelos-04.webp",
    alt: "Tapete numa sala com um cão ao fundo",
    type: "Tapetes",
    link: "/limpeza-tapetes",
    title: "Odores que se\nacumulam meses a fio",
    solution: "Desodorização completa no mesmo dia",
    pos: "center",
  },
  {
    image: "/images/landing-problems/cadeiras/cadeira-desgaste-04.webp",
    alt: "Cadeira estofada com marcas de uso no assento",
    type: "Cadeiras",
    link: "/limpeza-cadeiras",
    title: "Desgaste acelerado\nsem proteção",
    solution: "Impermeabilização com garantia de até 10 anos e 5 lavagens",
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
    <section id="problemas-home" ref={sectionRef} className="py-14 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={`mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
            <span className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#D4AF37', opacity: 0.8 }}>
              O QUE TRATAMOS
            </span>
          </div>
          <h2 className="type-section-title font-playfair     text-[#111111]  max-w-xl">
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
              className={`overflow-hidden rounded-2xl group flex flex-col bg-[#071a12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37] transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
                <img
                  src={problem.image}
                  srcSet={`${homeVariant(problem.image)} 900w, ${problem.image} 1200w`}
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 50vw, 25vw"
                  alt={problem.alt}
                  width={1200}
                  height={675}
                  className="w-full h-full object-cover motion-safe:group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  style={{ objectPosition: problem.pos }}
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white">
                  Imagem ilustrativa
                </span>
              </div>

              <div className="flex-1 p-5 md:p-7">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="h-px w-4 bg-[#D4AF37]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    {problem.type}
                  </span>
                </div>
                <h3 className="type-card-title font-playfair  text-white  mb-2 whitespace-pre-line  ">
                  {problem.title}
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
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
