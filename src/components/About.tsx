import { Sparkles, Heart, Target, Zap, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import portugalMap from "@/assets/portugal-map.webp";
import kyroLogo from "@/assets/kyro-logo.webp";

const About = () => {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const manifestoItems = [
    {
      icon: Heart,
      titleKey: "about.manifesto.belief.title",
      textKey: "about.manifesto.belief.text",
    },
    {
      icon: Target,
      titleKey: "about.manifesto.mission.title",
      textKey: "about.manifesto.mission.text",
    },
    {
      icon: Zap,
      titleKey: "about.manifesto.method.title",
      textKey: "about.manifesto.method.text",
    },
  ];

  // Map pins for Portugal
  const mapPins = [
    { top: "15%", left: "35%", label: "Braga" },
    { top: "22%", left: "30%", label: "Porto" },
    { top: "45%", left: "25%", label: "Lisboa" },
    { top: "75%", left: "40%", label: "Algarve" },
  ];

  return (
    <section 
      id="sobre-nos" 
      ref={sectionRef}
      className="py-16 md:py-20 bg-gradient-to-b from-secondary/30 via-secondary/10 to-background scroll-mt-32 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Header - Unified Pattern */}
        <div className={`text-center mb-10 md:mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-[#1A1A2E] font-semibold tracking-wide">{t('about.badge')}</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#1A1A2E] leading-tight">
            {t('about.title')}{t('about.title') && '. '}<span className="text-turquoise">{t('about.titleHighlight')}</span>
          </h2>
          <p className="text-[#1A1A2E]/55 text-base md:text-lg max-w-2xl mx-auto mt-3">
            {t('about.premiumSubtitle')}
          </p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-4"></div>
        </div>

        {/* 2-Column Master Layout - Text Left, Image Right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-5xl mx-auto mb-12 md:mb-16">
          
          {/* Left Column - Manifesto with Icon + Text pattern */}
          <div 
            className={`space-y-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '100ms' }}
          >
            {manifestoItems.map((item, index) => (
              <div 
                key={index}
                className={`flex items-start gap-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Icon Container - Unified Style */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                
                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="text-gold font-semibold text-lg md:text-xl mb-2 tracking-wide">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-[#1A1A2E]/80 text-base md:text-lg leading-relaxed">
                    {t(item.textKey)}
                  </p>
                </div>
              </div>
            ))}

            {/* CTA Button - Unified Style */}
            <div className="pt-4">
              <Link to="/nosso-processo">
                <Button 
                  className="group bg-gradient-to-r from-gold to-[#d4c78d] hover:from-[#d4c78d] hover:to-gold text-[#1A1A2E] font-semibold px-6 py-3 h-auto rounded-full shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                >
                  <span>{t('about.ctaButton')}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Map with Premium Styling */}
          <div 
            className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gold/20 via-turquoise/20 to-gold/20 rounded-3xl blur-xl opacity-50"></div>
            
            {/* Map Container */}
            <div className="relative bg-gradient-to-br from-white to-secondary/50 rounded-2xl p-6 md:p-8 shadow-2xl border border-gold/10 overflow-hidden">
              {/* Kyro Logo Badge */}
              <div className="absolute top-4 right-4 w-10 h-10 opacity-20">
                <img src={kyroLogo} alt="" className="w-full h-full object-contain" loading="lazy" />
              </div>
              
              {/* Title */}
              <h3 className="text-[#1A1A2E] font-bold text-xl md:text-2xl mb-6 text-center relative z-10">
                {t('about.mapTitle')}
              </h3>
              
              {/* Map Image with Pins */}
              <div className="relative aspect-[3/4] max-w-[220px] mx-auto">
                <img 
                  src={portugalMap} 
                  alt="Cobertura nacional Kyro Clean Solutions - Portugal"
                  width={220}
                  height={293}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
                
                {/* Animated Pins */}
                {mapPins.map((pin, index) => (
                  <div
                    key={index}
                    className="absolute group/pin"
                    style={{ top: pin.top, left: pin.left }}
                  >
                    {/* Pulse Ring */}
                    <div 
                      className="absolute -inset-2 bg-gold/30 rounded-full animate-ping"
                      style={{ animationDuration: '2s', animationDelay: `${index * 0.3}s` }}
                    ></div>
                    
                    {/* Pin */}
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-gold drop-shadow-lg transition-transform duration-300 group-hover/pin:scale-125" />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute left-6 top-0 bg-navy text-white text-xs px-2 py-1 rounded opacity-0 group-hover/pin:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
                      {pin.label}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Coverage Text */}
              <p className="text-center text-sm md:text-base text-[#1A1A2E]/70 mt-6 relative z-10">
                {t('about.mapSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
