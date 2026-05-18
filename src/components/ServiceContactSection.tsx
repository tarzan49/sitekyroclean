import { Phone, Mail, MapPin, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackCallClick } from "@/lib/analytics";

interface ServiceContactSectionProps {
  title?: string;
  subtitle?: string;
}

const ServiceContactSection = ({ 
  title = "Prepare o seu espaço para impressionar.",
  subtitle = "A nossa equipa chega à hora marcada, com eficiência e atenção aos detalhes. Garantimos um serviço profissional adaptado ao seu ritmo e à sua casa."
}: ServiceContactSectionProps) => {
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

  const contacts = [
    {
      icon: Phone,
      title: "925 530 647",
      subtitle: "Ligue agora",
      href: "tel:925530647",
    },
    {
      icon: Mail,
      title: "cleansolutions.pt25@gmail.com",
      subtitle: "Envie email",
      href: "mailto:cleansolutions.pt25@gmail.com",
    },
    {
      icon: MapPin,
      title: "R. de António Cardoso 263",
      subtitle: "4150-081 Porto",
      href: null,
    },
  ];

  return (
    <section ref={sectionRef} className="py-14 md:py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-gold" />
            <span className="text-gold font-semibold tracking-wide uppercase text-sm">Contacto</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-3">
            {title}
          </h2>
          <p className="text-[#1A1A2E]/55 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-5"></div>
        </div>

        {/* Premium Contact Cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            const content = (
              <div 
                className={`group relative bg-[#FFFFFF] p-6 rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Hover glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-turquoise/20 rounded-[24px] blur-md opacity-0 group-hover:opacity-60 transition-opacity"></div>
                
                <div className="relative text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <p className={`font-bold text-[#1A1A2E] whitespace-nowrap ${contact.icon === Mail ? 'text-[8px] xs:text-[9px] sm:text-xs md:text-sm' : 'text-lg'}`}>
                    {contact.title}
                  </p>
                  <p className="text-sm text-[#1A1A2E]/55 mt-1">{contact.subtitle}</p>
                </div>
              </div>
            );

            return contact.href ? (
              <a 
                key={index} 
                href={contact.href} 
                onClick={() => contact.icon === Phone && trackCallClick('service_contact_section')}
                className="block"
              >
                {content}
              </a>
            ) : (
              <div key={index}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceContactSection;