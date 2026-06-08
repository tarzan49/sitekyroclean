import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Use real service images as "after" showcase
import sofaImg    from "@/assets/service-sofa-new.webp";
import mattressImg from "@/assets/service-mattress-branded.webp";
import carpetImg  from "@/assets/service-carpet-new.webp";
import chairsImg  from "@/assets/service-chairs-new.webp";

const results = [
  {
    label: "Sofá em tecido — Porto",
    testimonial: "\"Ficou melhor do que quando comprei. Não acreditei.\"",
    client: "Ana S., Porto",
    img: sofaImg,
    link: "/antes-depois-limpeza",
  },
  {
    label: "Colchão de casal — Matosinhos",
    testimonial: "\"Eliminaram o cheiro completamente. Dormimos muito melhor.\"",
    client: "Ricardo M., Matosinhos",
    img: mattressImg,
    link: "/antes-depois-limpeza",
  },
  {
    label: "Tapete persa — Vila Nova de Gaia",
    testimonial: "\"Estava convicto que ia ter de deitar o tapete fora. Enganei-me.\"",
    client: "Luísa F., Gaia",
    img: carpetImg,
    link: "/antes-depois-limpeza",
  },
  {
    label: "Cadeiras de jantar — Maia",
    testimonial: "\"Trabalho impecável. Vieram a casa e terminaram em menos de 1 hora.\"",
    client: "João T., Maia",
    img: chairsImg,
    link: "/antes-depois-limpeza",
  },
];

const ResultsSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="resultados"
      ref={ref}
      className="py-20 md:py-28 bg-white scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div
          className="mb-14 md:mb-20 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-px bg-[#D4AF37]" />
            <p className="text-[9px] font-semibold text-[#D4AF37] tracking-[0.35em] uppercase">
              Resultados Reais
            </p>
          </div>
          <div className="max-w-2xl">
            <h2
              className="font-playfair font-light text-[#1A1A2E] mb-5"
              style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
            >
              Transformações que<br />
              <em style={{ fontStyle: 'italic', color: '#1A4E30' }}>falam por si.</em>
            </h2>
            <p className="text-[#1A1A2E]/45 leading-relaxed max-w-lg" style={{ fontWeight: 300, fontSize: '0.95rem' }}>
              Não prometemos. Mostramos. Cada trabalho é fotografado antes e depois, sem filtros, sem edição.
            </p>
          </div>
        </div>

        {/* Results grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10">
          {results.map((r, i) => (
            <div
              key={i}
              className="group transition-all duration-700"
              style={{
                opacity:   visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-[4/3] bg-[#F5F4F0] mb-5">
                <img
                  src={r.img}
                  alt={r.label}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* "Depois" pill */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5">
                  <span className="text-[9px] font-semibold text-[#1A4E30] tracking-[0.20em] uppercase">Depois</span>
                </div>
              </div>

              {/* Caption */}
              <p className="text-[10px] font-medium text-[#1A1A2E]/35 tracking-[0.18em] uppercase mb-3">{r.label}</p>
              <p className="font-playfair font-light text-[#1A1A2E] text-lg md:text-xl leading-snug mb-2" style={{ letterSpacing: '-0.01em' }}>
                {r.testimonial}
              </p>
              <p className="text-[10px] text-[#1A1A2E]/35 tracking-wide">{r.client}</p>
            </div>
          ))}
        </div>

        {/* Link to full gallery */}
        <div
          className="transition-all duration-700 delay-500"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <Link
            to="/antes-depois-limpeza"
            className="inline-flex items-center gap-2.5 border border-[#1A1A2E]/15 text-[#1A1A2E] text-[10px] font-semibold tracking-[0.20em] uppercase px-7 py-4 hover:border-[#1A4E30] hover:text-[#1A4E30] transition-colors"
          >
            Ver Galeria Completa
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ResultsSection;
