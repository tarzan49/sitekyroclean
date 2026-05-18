import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { Building2, Home, Hotel, CheckCircle, Shield, Clock, Sparkles, ArrowRight } from "lucide-react";
import serviceChairsImage from "@/assets/service-chairs.webp";
import residentialCleaningImage from "@/assets/residential-cleaning.webp";
import hotelCleaningImage from "@/assets/hotel-cleaning.webp";
import QuizForm from './QuizFormLazy';

const ClientTypes = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("empresas");
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

  const clientData = {
    empresas: {
      icon: Building2,
      label: t('clientTypes.companies.label'),
      title: t('clientTypes.companies.headline'),
      intro: t('clientTypes.companies.intro'),
      benefits: [
        { icon: Shield, text: t('clientTypes.companies.benefit1') },
        { icon: Clock, text: t('clientTypes.companies.benefit2') },
        { icon: CheckCircle, text: t('clientTypes.companies.benefit3') },
        { icon: Sparkles, text: t('clientTypes.companies.benefit4') },
      ],
      image: serviceChairsImage,
      alt: "Limpeza profissional de escritórios e empresas",
    },
    particulares: {
      icon: Home,
      label: t('clientTypes.residential.label'),
      title: t('clientTypes.residential.headline'),
      intro: t('clientTypes.residential.intro'),
      benefits: [
        { icon: Shield, text: t('clientTypes.residential.benefit1') },
        { icon: Clock, text: t('clientTypes.residential.benefit2') },
        { icon: CheckCircle, text: t('clientTypes.residential.benefit3') },
        { icon: Sparkles, text: t('clientTypes.residential.benefit4') },
      ],
      image: residentialCleaningImage,
      alt: "Limpeza profissional de sofá em residência",
    },
    hotelaria: {
      icon: Hotel,
      label: t('clientTypes.hospitality.label'),
      title: t('clientTypes.hospitality.headline'),
      intro: t('clientTypes.hospitality.intro'),
      benefits: [
        { icon: Shield, text: t('clientTypes.hospitality.benefit1') },
        { icon: Clock, text: t('clientTypes.hospitality.benefit2') },
        { icon: CheckCircle, text: t('clientTypes.hospitality.benefit3') },
        { icon: Sparkles, text: t('clientTypes.hospitality.benefit4') },
      ],
      image: hotelCleaningImage,
      alt: "Limpeza profissional de carpete em quarto de hotel",
    },
  };

  const renderTabContent = (key: keyof typeof clientData) => {
    const data = clientData[key];
    const Icon = data.icon;
    
    return (
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[400px]">
        {/* Text Column - Left */}
        <div 
          className={`space-y-6 transition-all duration-500 ${activeTab === key ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {/* Mini Label */}
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-gold" />
            <span className="text-gold font-semibold text-sm tracking-wide uppercase">
              {data.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-[#1A1A2E] leading-tight">
            {data.title}
          </h3>

          {/* Intro */}
          <p className="text-[#1A1A2E]/80 leading-relaxed">
            {data.intro}
          </p>

          {/* Benefits List */}
          <ul className="space-y-3">
            {data.benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <li 
                  key={index}
                  className={`flex items-start gap-3 transition-all duration-500 ${activeTab === key ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
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

          {/* CTA Button */}
          <div className="pt-2">
            <Button 
              onClick={openQuiz}
              className="group bg-gradient-to-r from-gold to-[#d4c78d] hover:from-[#d4c78d] hover:to-gold text-[#1A1A2E] font-semibold px-6 py-3 h-auto rounded-full shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            >
              <span>{t('clientTypes.ctaButton')}</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Image Column - Right */}
        <div 
          className={`relative transition-all duration-700 ${activeTab === key ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 via-turquoise/20 to-gold/20 rounded-3xl blur-xl opacity-50"></div>
          
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-secondary/10">
            <img
              src={data.image}
              alt={data.alt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-gradient-to-b from-secondary/30 via-secondary/20 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-[#1A1A2E] font-semibold tracking-wide">{t('clientTypes.badge')}</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#1A1A2E]">
            {t('clientTypes.title')}
          </h2>
        </div>

        {/* Mobile Layout - Premium Cards */}
        <div className="lg:hidden flex flex-col gap-5">
          {(Object.keys(clientData) as Array<keyof typeof clientData>).map((key, index) => {
            const data = clientData[key];
            const Icon = data.icon;
            return (
              <div
                key={key}
                onClick={openQuiz}
                className={`relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 bg-secondary/10">
                  <img
                    src={data.image}
                    alt={data.alt}
                    width={400}
                    height={224}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    sizes="100vw"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/50 to-navy/40" />
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-gold" />
                    <span className="text-gold font-medium text-xs uppercase tracking-wider">
                      {data.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                    {data.title}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2">
                    {data.intro}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Layout - Premium Tabs */}
        <div className={`hidden lg:block transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '200ms' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto bg-white/50 backdrop-blur-sm gap-2 p-2 rounded-2xl shadow-lg mb-12">
              {(Object.keys(clientData) as Array<keyof typeof clientData>).map((key) => {
                const data = clientData[key];
                const Icon = data.icon;
                return (
                  <TabsTrigger 
                    key={key}
                    value={key} 
                    className="flex items-center gap-2 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-[#1A1A2E] data-[state=inactive]:hover:bg-navy/5"
                  >
                    <Icon className="w-4 h-4" />
                    {t(`clientTypes.tabs.${key === 'empresas' ? 'companies' : key === 'particulares' ? 'residential' : 'hospitality'}`)}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="empresas" className="mt-0 focus-visible:outline-none">
              {renderTabContent('empresas')}
            </TabsContent>
            <TabsContent value="particulares" className="mt-0 focus-visible:outline-none">
              {renderTabContent('particulares')}
            </TabsContent>
            <TabsContent value="hotelaria" className="mt-0 focus-visible:outline-none">
              {renderTabContent('hotelaria')}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <QuizForm isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </section>
  );
};

export default ClientTypes;
