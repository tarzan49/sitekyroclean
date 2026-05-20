import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, HandCoins, Droplets, Star, CheckCircle } from "lucide-react";
import guaranteeImage from "@/assets/guarantee-technician.webp";

const GuaranteeSection = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const guarantees = [
    {
      icon: ShieldCheck,
      title: t('guarantee.item1.title', 'Satisfação garantida'),
      text: t('guarantee.item1.text', 'Se o resultado não corresponder às expectativas, repetimos o serviço sem custos.'),
    },
    {
      icon: HandCoins,
      title: t('guarantee.item2.title', 'Orçamento transparente'),
      text: t('guarantee.item2.text', 'O valor apresentado é o valor final. Sem surpresas.'),
    },
    {
      icon: Droplets,
      title: t('guarantee.item3.title', 'Tecnologia de proteção avançada'),
      text: t('guarantee.item3.text', 'Impermeabilização com proteção duradoura até 10 anos.'),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-kyro-green overflow-hidden py-24"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT: Trust Image */}
          <div
            className={`relative transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            {/* Capsule image frame */}
            <div className="relative rounded-[2.5rem] overflow-hidden" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4), 0 25px 60px rgba(0,0,0,0.5)' }}>
              <img
                src={guaranteeImage}
                alt="Técnico profissional a inspecionar tecido de sofá com atenção ao detalhe"
                className="w-full h-[380px] md:h-[480px] object-cover opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2F2A]/70 via-[#0B2F2A]/10 to-transparent" />
            </div>

            {/* Metallic gold "Qualidade Garantida" seal, top LEFT */}
            <div className="absolute top-5 left-5 z-10 group/seal">
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all duration-300 group-hover/seal:scale-[1.03]"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #F0DC8A 45%, #C9A84C 80%, #A8882A 100%)',
                  boxShadow: '0 0 0 1px rgba(201,168,76,0.5), 0 4px 20px rgba(201,168,76,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                <CheckCircle className="w-4 h-4 text-[#5a3800] flex-shrink-0" strokeWidth={2.5} />
                <span className="text-[#3d2600] text-[11px] font-extrabold tracking-[0.15em] uppercase leading-none">
                  Qualidade Garantida
                </span>
                {/* Hover shimmer line */}
                <span
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover/seal:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)',
                  }}
                />
              </div>
            </div>

            {/* Rating badge, bottom */}
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <div
                className="rounded-2xl px-5 py-4 border border-white/15"
                style={{
                  background: 'rgba(10,10,20,0.72)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                }}
              >
                <div className="flex items-center gap-4 mb-1.5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <div className="h-5 w-px bg-white/25" />
                  <span className="text-sm font-bold text-white">5.0</span>
                  <div className="h-5 w-px bg-white/25" />
                  <span className="text-xs text-white/60 font-medium">+50 avaliações</span>
                </div>
                <p className="text-xs text-white/55 font-medium tracking-wide">
                  5.0 no Google Maps&nbsp;&nbsp;•&nbsp;&nbsp;+50 avaliações verificadas
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Guarantee items */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="space-y-0">
              {guarantees.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index}>
                    <div
                      className={`flex items-start gap-5 py-7 px-4 rounded-xl transition-all duration-500 cursor-default hover:bg-white/[0.03] ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${300 + index * 150}ms` }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-playfair text-base md:text-lg font-semibold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm md:text-[15px] text-white/50 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                    {index < guarantees.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
