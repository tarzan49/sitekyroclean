import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles, CheckCircle, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import sofaBefore from "@/assets/sofa-before-new.webp";
import sofaAfter from "@/assets/sofa-after-new.webp";
import QuizForm from './QuizFormLazy';

const BeforeAfterSection = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const openQuiz = () => {
    window.dispatchEvent(new CustomEvent('quizOpened'));
    sessionStorage.setItem('hasClickedQuote', '1');
    setIsQuizOpen(true);
  };

  const benefits = [
    { icon: CheckCircle, text: t('beforeAfter.benefit1', 'Remoção profunda de manchas e sujidade') },
    { icon: Shield, text: t('beforeAfter.benefit2', 'Eliminação de 99% de ácaros e bactérias') },
    { icon: Clock, text: t('beforeAfter.benefit3', 'Secagem rápida em poucas horas') },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-20 bg-gradient-to-b from-secondary/30 via-secondary/10 to-background overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Header - Unified Pattern */}
        <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-[#1A1A2E] font-semibold tracking-wide">{t('beforeAfter.badge')}</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#1A1A2E]">
            {t('beforeAfter.title')}
          </h2>
          <p className="text-[#1A1A2E]/55 text-base md:text-lg max-w-2xl mx-auto mt-3">
            {t('beforeAfter.subtitle')}
          </p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4"></div>
        </div>

        {/* 2-Column Master Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
          
          {/* Left Column - Text Content */}
          <div 
            className={`space-y-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Mini Label */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span className="text-gold font-semibold text-sm tracking-wide uppercase">
                {t('beforeAfter.label', 'Resultados Garantidos')}
              </span>
            </div>

            {/* Content Title */}
            <h3 className="text-2xl md:text-3xl font-bold text-[#1A1A2E] leading-tight">
              {t('beforeAfter.contentTitle', 'Transformação visível em cada limpeza')}
            </h3>

            {/* Intro */}
            <p className="text-[#1A1A2E]/80 leading-relaxed">
              {t('beforeAfter.contentIntro', 'Os nossos especialistas utilizam tecnologia avançada de extração para remover manchas, odores e alergénios. Veja a diferença com os seus próprios olhos.')}
            </p>

            {/* Benefits List - Unified Icon + Text Pattern */}
            <ul className="space-y-3">
              {benefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <li 
                    key={index}
                    className={`flex items-start gap-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    style={{ transitionDelay: `${(index + 2) * 100}ms` }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-turquoise/10 flex items-center justify-center mt-0.5">
                      <BenefitIcon className="w-3.5 h-3.5 text-turquoise" />
                    </div>
                    <span className="text-[#1A1A2E]/80 text-sm md:text-base leading-relaxed">
                      {benefit.text}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* CTA Button - Unified Style */}
            <div className="pt-2">
              <Button 
                onClick={openQuiz}
                className="group bg-gradient-to-r from-gold to-[#d4c78d] hover:from-[#d4c78d] hover:to-gold text-[#1A1A2E] font-semibold px-6 py-3 h-auto rounded-full shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
              >
                <span>{t('beforeAfter.cta', 'Pedir Orçamento Grátis')}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Right Column - Before/After Images */}
          <div 
            className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 via-turquoise/20 to-gold/20 rounded-3xl blur-xl opacity-50"></div>
            
            {/* Images Container */}
            <div className="relative bg-gradient-to-br from-white to-secondary/50 rounded-2xl p-6 md:p-8 shadow-2xl border border-gold/10">
              <div className="flex items-center justify-center gap-4 md:gap-6">
                {/* Before Image */}
                <div className="relative group flex-1">
                  <div className="overflow-hidden rounded-xl shadow-lg border-2 border-border/30">
                    <img
                      src={sofaBefore}
                      alt={t('beforeAfter.before')}
                      className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-destructive/10 to-transparent"></div>
                    <span className="absolute bottom-2 left-2 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg">
                      {t('beforeAfter.before')}
                    </span>
                  </div>
                </div>

                {/* Arrow Indicator */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-gold to-gold/80 flex items-center justify-center shadow-lg shadow-gold/30 animate-pulse">
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-[#1A1A2E]" />
                  </div>
                </div>

                {/* After Image */}
                <div className="relative group flex-1">
                  <div className="overflow-hidden rounded-xl shadow-lg border-2 border-gold/40">
                    <img
                      src={sofaAfter}
                      alt={t('beforeAfter.after')}
                      className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent"></div>
                    <span className="absolute bottom-2 right-2 bg-gold/95 text-[#1A1A2E] px-3 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg">
                      {t('beforeAfter.after')}
                    </span>
                    {/* Sparkle effect */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-80 animate-ping"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </section>
  );
};

export default BeforeAfterSection;
