import { Phone, Mail, MapPin, HelpCircle, Sparkles, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import GlobalPromoBanner from "@/components/GlobalPromoBanner";
import Footer from "@/components/Footer";
import { sanitizeHtml } from "@/lib/sanitize";
import { trackCallClick } from "@/lib/analytics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
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

  const faqItems = [1, 2, 3, 4, 5, 6];
  const leftColumn = faqItems.filter((_, i) => i % 2 === 0);
  const rightColumn = faqItems.filter((_, i) => i % 2 === 1);

  const renderFaqItem = (num: number, index: number) => (
    <AccordionItem
      key={`item-${num}`}
      value={`item-${num}`}
      className={`border-0 bg-[#FFFFFF] rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <AccordionTrigger className="px-5 py-4 text-left hover:no-underline group [&[data-state=open]]:bg-secondary/20">
        <div className="flex items-start gap-3 w-full pr-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-4 h-4 text-gold" />
          </div>
          <span className="text-[15px] md:text-base font-semibold text-[#1A1A2E] leading-snug">
            {t(`faq.items.item${num}.question`)}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-5 pt-0">
        <div className="pl-12 text-[#1A1A2E]/70 text-sm md:text-[15px] leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(t(`faq.items.item${num}.answer`)) }} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <GlobalPromoBanner />
      <main>
        {/* Hero Section - Aligned with Packs page */}
        <section className="pt-24 md:pt-28 pb-6 md:pb-8 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-[1150px] mx-auto">
              {/* Title */}
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A2E] mb-3 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Perguntas Frequentes
              </h1>
              
              {/* Subtitle */}
              <p 
                className="text-base md:text-lg text-[#1A1A2E]/55 max-w-2xl mx-auto mb-4 animate-fade-in"
                style={{ animationDelay: "0.15s" }}
              >
                Encontre respostas claras e objetivas sobre os nossos serviços de limpeza profunda e manutenção de estofos.
              </p>
              
              {/* Golden line - thin and elegant */}
              <div 
                className="w-16 h-0.5 bg-gold mx-auto animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Centered & Premium */}
        <section ref={sectionRef} className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-[1150px] mx-auto">
              {/* Desktop Two Columns */}
              <div className="hidden md:grid md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Left Column */}
                <Accordion type="single" collapsible className="space-y-4">
                  {leftColumn.map((num, index) => renderFaqItem(num, index * 2))}
                </Accordion>
                
                {/* Right Column */}
                <Accordion type="single" collapsible className="space-y-4">
                  {rightColumn.map((num, index) => renderFaqItem(num, index * 2 + 1))}
                </Accordion>
              </div>

              {/* Mobile Single Column */}
              <div className="md:hidden px-1">
                <Accordion type="single" collapsible className="space-y-3">
                  {faqItems.map((num, index) => renderFaqItem(num, index))}
                </Accordion>
              </div>

              {/* Bottom Microcopy */}
              <div 
                className={`mt-8 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} 
                style={{ transitionDelay: '500ms' }}
              >
                <div className="inline-flex items-center gap-2 bg-gold/10 text-[#1A1A2E] px-5 py-2.5 rounded-full border border-gold/20">
                  <ChevronRight className="w-4 h-4 text-gold flex-shrink-0" />
                  <p className="text-sm font-medium">
                    Se não encontrou a resposta que procura, fale connosco: respondemos sempre no próprio dia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - Compact */}
        <section className="py-12 md:py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-[1150px] mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-2">
                  Os nossos serviços
                </h2>
                <p className="text-[#1A1A2E]/55 text-base max-w-2xl mx-auto">
                  A nossa equipa chega à hora marcada, com eficiência e atenção aos detalhes. Garantimos um serviço profissional adaptado ao seu ritmo e à sua casa.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <a 
                  href="tel:925530647" 
                  onClick={() => trackCallClick('faq_page')}
                  className="group relative bg-[#FFFFFF] p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-turquoise/20 rounded-3xl blur-md opacity-0 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Phone className="h-5 w-5 text-gold" />
                    </div>
                    <p className="font-bold text-lg text-[#1A1A2E]">925 530 647</p>
                    <p className="text-sm text-[#1A1A2E]/55">{t('common.callNow')}</p>
                  </div>
                </a>

                <a 
                  href="mailto:cleansolutions.pt25@gmail.com" 
                  className="group relative bg-[#FFFFFF] p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-turquoise/20 rounded-3xl blur-md opacity-0 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Mail className="h-5 w-5 text-gold" />
                    </div>
                    <p className="font-bold text-sm text-[#1A1A2E] break-all">cleansolutions.pt25@gmail.com</p>
                    <p className="text-sm text-[#1A1A2E]/55">{t('common.sendEmail')}</p>
                  </div>
                </a>

                <div className="group relative bg-[#FFFFFF] p-5 rounded-2xl shadow-md">
                  <div className="relative text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-gold" />
                    </div>
                    <p className="font-bold text-base text-[#1A1A2E]">R. de António Cardoso 263</p>
                    <p className="text-sm text-[#1A1A2E]/55">4150-081 Porto</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;