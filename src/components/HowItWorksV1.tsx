import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, HandCoins, Droplets, Star } from "lucide-react";
import QuizButton from "./QuizButton";

const steps = [
  {
    number: "01",
    titleKey: "howItWorks.step1.title",
    titleFallback: "Peça orçamento",
    descKey: "howItWorks.step1.description",
    descFallback: "Quiz em 30 segundos. Preço imediato, sem compromisso.",
  },
  {
    number: "02",
    titleKey: "howItWorks.step2.title",
    titleFallback: "Agendamos a visita",
    descKey: "howItWorks.step2.description",
    descFallback: "Deslocamo-nos à sua casa na data que escolher.",
  },
  {
    number: "03",
    titleKey: "howItWorks.step3.title",
    titleFallback: "Resultados no momento",
    descKey: "howItWorks.step3.description",
    descFallback: "Estofos como novos no próprio dia da visita.",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    titleKey: "guarantee.item1.title",
    titleFallback: "Satisfação garantida",
    textKey: "guarantee.item1.text",
    textFallback: "Se não ficou satisfeito, repetimos sem custos.",
  },
  {
    icon: HandCoins,
    titleKey: "guarantee.item2.title",
    titleFallback: "Orçamento transparente",
    textKey: "guarantee.item2.text",
    textFallback: "O valor apresentado é o valor final. Sem surpresas.",
  },
  {
    icon: Droplets,
    titleKey: "guarantee.item3.title",
    titleFallback: "Proteção duradoura",
    textKey: "guarantee.item3.text",
    textFallback: "Impermeabilização com garantia até 10 anos.",
  },
];

const ITEM_MIN_H = "min-h-[72px]";

const HowItWorks = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="overflow-hidden scroll-mt-16 bg-kyro-green">

      {/* Two columns */}
      <div className="grid lg:grid-cols-2">

        {/* LEFT: Como funciona */}
        <div className="py-10 md:py-14 px-6 sm:px-10 lg:px-12 lg:border-r border-white/[0.06]">

          {/* Header */}
          <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
                O NOSSO PROCESSO
              </p>
            </div>
            <h2 className="font-playfair text-[1.6rem] md:text-[2rem] font-bold text-white leading-tight">
              {t('howItWorks.title', 'Como funciona')}
            </h2>
          </div>

          {/* Steps */}
          <div>
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex gap-4 ${ITEM_MIN_H} transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'}`}
                style={{ transitionDelay: `${(i + 1) * 120}ms` }}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0"
                    style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)' }}
                  >
                    <span className="font-mono text-[10px] font-bold text-white/50">{step.number}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="w-px flex-1 mt-1.5 mb-1.5 min-h-[1rem]"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)' }}
                    />
                  )}
                </div>
                <div className="pb-5 last:pb-0">
                  <h3 className="font-playfair text-sm md:text-base font-bold text-white mb-1 leading-snug">
                    {t(step.titleKey, step.titleFallback)}
                  </h3>
                  <p className="text-white/50 text-[13px] leading-relaxed">
                    {t(step.descKey, step.descFallback)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Qualidade garantida */}
        <div className="py-10 md:py-14 px-6 sm:px-10 lg:px-12">

          {/* Header */}
          <div className={`mb-8 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8" style={{ backgroundColor: '#D4AF37', opacity: 0.65 }} />
              <p className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: '#D4AF37', opacity: 0.85 }}>
                A NOSSA PROMESSA
              </p>
            </div>
            <h2 className="font-playfair text-[1.6rem] md:text-[2rem] font-bold text-white leading-tight">
              Qualidade garantida
            </h2>
          </div>

          {/* Guarantees */}
          <div>
            {guarantees.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i}>
                  <div
                    className={`flex items-start gap-3.5 ${ITEM_MIN_H} transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}
                    style={{ transitionDelay: `${300 + i * 120}ms` }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                    </div>
                    <div className="pb-5">
                      <h3 className="font-playfair font-bold text-white text-sm md:text-base mb-0.5 leading-snug">
                        {t(item.titleKey, item.titleFallback)}
                      </h3>
                      <p className="text-white/50 text-[13px] leading-relaxed">
                        {t(item.textKey, item.textFallback)}
                      </p>
                    </div>
                  </div>
                  {i < guarantees.length - 1 && (
                    <div className="h-px bg-gradient-to-r from-transparent via-gold/12 to-transparent mb-0" />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Bottom strip, full width, centered */}
      <div
        className={`border-t border-white/[0.06] py-5 px-6 flex flex-col items-center gap-4 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '600ms' }}
      >
        <QuizButton />
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
            ))}
          </div>
          <span className="text-white font-bold text-sm">5.0</span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-white/45 text-[12px]">+50 avaliações no Google</span>
        </div>
      </div>

    </section>
  );
};

export default HowItWorks;
