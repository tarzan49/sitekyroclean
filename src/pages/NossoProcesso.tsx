import { Search, SprayCanIcon as Spray, Droplets, Wind, Shield, ClipboardCheck, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from "react";
import Header from "@/components/Header";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import { trackCallClick } from "@/lib/analytics";
import { PHONE_TEL } from "@/constants/business";

interface ProcessStep {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
}

const AnimatedCard = ({ children, delay }: { children: React.ReactNode; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const NossoProcesso = () => {
  const { t } = useTranslation();

  const steps: ProcessStep[] = [
    {
      icon: Search,
      title: "Diagnóstico Inicial",
      subtitle: "Avaliação completa e personalizada",
      description: "Realizamos uma análise detalhada do seu sofá, colchão ou carpete. Identificamos o tipo de tecido, nível de sujidade e manchas específicas para definir o tratamento mais eficaz.",
    },
    {
      icon: Spray,
      title: "Preparação e Desinfeção",
      subtitle: "Produtos profissionais de alta performance",
      description: "Aplicamos soluções profissionais de qualidade premium que penetram nas fibras, eliminando ácaros, bactérias e alergénios. Tratamento cuidadoso e eficaz para resultados duradouros.",
    },
    {
      icon: Droplets,
      title: "Tratamento de Manchas",
      subtitle: "Técnicas especializadas para cada tipo",
      description: "Cada mancha exige uma abordagem única. Utilizamos técnicas profissionais e produtos específicos para remover café, vinho, gordura e outras marcas difíceis com precisão cirúrgica.",
    },
    {
      icon: Wind,
      title: "Limpeza Profunda",
      subtitle: "Extração profissional de alta potência",
      description: "Com equipamento de extração profissional, removemos toda a sujidade, resíduos e humidade das fibras. O resultado são tecidos verdadeiramente limpos, frescos e revitalizados.",
    },
    {
      icon: Shield,
      title: "Proteção Extra",
      subtitle: "Opcional para maior durabilidade",
      description: "Oferecemos um tratamento de impermeabilização que repele líquidos e sujidade. Ideal para prolongar a limpeza e proteger o seu investimento por muito mais tempo.",
    },
    {
      icon: ClipboardCheck,
      title: "Verificação Final",
      subtitle: "Garantia de satisfação total",
      description: "Antes de concluir, fazemos consigo uma inspeção detalhada. A sua aprovação é o nosso objetivo: só ficamos satisfeitos quando o resultado superar as suas expectativas.",
    },
  ];

  return (
    <>
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* Hero Section - Aligned with Packs page */}
        <section className="pt-24 md:pt-28 pb-8 md:pb-12 bg-background">
          <div className="container mx-auto px-4">
            {/* Title with gold accent */}
            <div className="text-center mb-6 md:mb-8">
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111] mb-3 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                {t('process.title')}
              </h1>
              <p 
                className="text-base md:text-lg text-[#111111]/55 max-w-2xl mx-auto mb-4 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                {t('process.subtitle')}
              </p>
              <div 
                className="w-16 h-0.5 bg-gold mx-auto animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>

          </div>
        </section>

        {/* Process Steps Section */}
        <section className="pb-20 bg-background">
          <div className="container mx-auto px-4">
            {/* Process Steps */}
            <div className="max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <AnimatedCard key={index} delay={index * 100}>
                  <div className="relative mb-10 last:mb-0">
                    {/* Connector Line with gold gradient */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[44px] top-[100px] w-px h-16 bg-gradient-to-b from-gold/40 via-teal/20 to-transparent hidden md:block" />
                    )}

                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      {/* Step Number + Icon */}
                      <div className="flex-shrink-0 relative">
                        {/* Outer ring with gold accent */}
                        <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-secondary via-background to-secondary border border-gold/20 flex items-center justify-center shadow-sm">
                          <div className="w-[72px] h-[72px] rounded-full bg-[#FFFFFF] border border-[rgba(26,78,48,0.12)] flex items-center justify-center shadow-inner">
                            <step.icon className="h-8 w-8 text-teal" strokeWidth={1.5} />
                          </div>
                        </div>
                        {/* Step number badge with gold */}
                        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-gold to-gold/80 text-white text-xs font-bold flex items-center justify-center shadow-md">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1">
                        <div className="bg-[#FFFFFF] p-5 md:p-6 rounded-xl border border-[rgba(26,78,48,0.10)] shadow-sm hover:shadow-lg hover:border-gold/30 transition-all duration-300 group">
                          {/* Title with gold underline on hover */}
                          <div className="mb-3">
                            <h3 className="text-xl md:text-2xl font-bold text-[#111111] group-hover:text-[#111111]/90 transition-colors">
                              {step.title}
                            </h3>
                            <p className="text-sm font-medium text-gold mt-1">
                              {step.subtitle}
                            </p>
                          </div>
                          <p className="text-[#111111]/70 leading-relaxed text-base">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            {/* Call to Action with gold accents */}
            <AnimatedCard delay={600}>
              <div className="mt-16 text-center">
                <div className="relative bg-gradient-to-r from-teal to-turquoise p-8 rounded-2xl shadow-xl max-w-3xl mx-auto overflow-hidden">
                  {/* Gold corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/50 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/50 rounded-br-2xl" />
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {t('process.cta.title')}
                  </h2>
                  <p className="text-white/90 mb-6 text-lg">
                    {t('process.cta.subtitle')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href={`tel:${PHONE_TEL}`}
                      onClick={() => trackCallClick('nosso_processo_cta')}
                      className="inline-flex items-center justify-center px-8 py-3 bg-[#FFFFFF] text-teal font-semibold rounded-lg hover:bg-[#FDFDF9] transition-colors shadow-md"
                    >
                      {t('process.cta.callNow')}
                    </a>
                    <a
                      href="/#orcamento"
                      className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white font-semibold rounded-lg hover:bg-gold/90 transition-colors shadow-md"
                    >
                      {t('process.cta.getQuote')}
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default NossoProcesso;
