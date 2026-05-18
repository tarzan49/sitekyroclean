import { useEffect, useRef, useState } from "react";
import { Shield, Leaf, Layers, Zap } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Shield, label: "Técnicos Certificados", sub: "Formação especializada" },
  { icon: Leaf, label: "Produtos Seguros", sub: "Crianças & animais" },
  { icon: Layers, label: "Extração Profunda", sub: "Nível molecular" },
  { icon: Zap, label: "Resposta em 24h", sub: "Agendamento rápido" },
];

const WhyChooseUs = () => {
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

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-kyro-green">
      <div className="container mx-auto px-4">
        {/* Thin gold separator line top */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-10" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 max-w-4xl mx-auto">
          {TRUST_ITEMS.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: `${i * 130}ms` }}
            >
              {/* Icon ring */}
              <div className="relative w-14 h-14 md:w-16 md:h-16 mb-4">
                <div className="absolute inset-0 rounded-full border border-gold/20 bg-gold/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-gold" strokeWidth={1.4} />
                </div>
              </div>

              <p className="font-playfair text-sm md:text-[15px] font-semibold text-white leading-tight mb-1">
                {label}
              </p>
              <p className="text-[11px] md:text-xs text-white/40 font-medium tracking-wide">
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Thin gold separator line bottom */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
      </div>
    </section>
  );
};

export default WhyChooseUs;
