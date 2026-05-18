import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Home, Droplets, Shield, AlertCircle, Calculator, ThumbsUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs_data = [
  {
    icon: Home,
    questionKey: "homeFaq.q1",
    questionDefault: "Fazem o serviço na minha casa? (Porto e arredores)",
    answerKey: "homeFaq.a1",
    answerDefault:
      "Sim. Deslocamo-nos à sua casa ou escritório em todo o Grande Porto: Porto, Matosinhos, Vila Nova de Gaia, Maia, Gondomar, Valongo, Póvoa de Varzim e Vila do Conde. A deslocação está incluída no serviço, sem custos extra.",
  },
  {
    icon: Droplets,
    questionKey: "homeFaq.q2",
    questionDefault: "Quanto tempo demora a secar? (Pode usar o sofá no mesmo dia?)",
    answerKey: "homeFaq.a2",
    answerDefault:
      "Na maioria dos casos, o sofá fica seco entre 2 a 4 horas após o serviço. Com boa ventilação, pode utilizar o sofá no mesmo dia. Usamos equipamentos de extração de alta pressão que minimizam a humidade residual.",
  },
  {
    icon: Shield,
    questionKey: "homeFaq.q3",
    questionDefault: "Os produtos são seguros para bebés e animais de estimação?",
    answerKey: "homeFaq.a3",
    answerDefault:
      "Sim, totalmente. Utilizamos apenas produtos profissionais certificados e hipoalergénicos, seguros para crianças, bebés, cães, gatos e pessoas com alergias ou pele sensível.",
  },
  {
    icon: AlertCircle,
    questionKey: "homeFaq.q4",
    questionDefault: "Conseguem remover manchas de urina, vinho ou café?",
    answerKey: "homeFaq.a4",
    answerDefault:
      "Na grande maioria dos casos, sim. O nosso processo profissional elimina manchas de urina, vinho, café, gordura e outras substâncias orgânicas. Para manchas muito antigas ou tecidos específicos, avaliamos no local antes de garantir o resultado.",
  },
  {
    icon: Calculator,
    questionKey: "homeFaq.q5",
    questionDefault: "Como é calculado o valor da limpeza?",
    answerKey: "homeFaq.a5",
    answerDefault:
      "O preço depende do tipo de estofado (sofá, cadeira, colchão), número de lugares e tipo de tecido. A limpeza de sofás começa a partir de 39€. Peça um orçamento em 30 segundos: sem compromisso e sem surpresas.",
  },
  {
    icon: ThumbsUp,
    questionKey: "homeFaq.q6",
    questionDefault: "O que acontece se eu não ficar satisfeito com o resultado?",
    answerKey: "homeFaq.a6",
    answerDefault:
      "A sua satisfação é a nossa prioridade. Se não ficar 100% satisfeito, voltamos ao local sem custo adicional para corrigir qualquer situação. Trabalhamos com garantia de resultado: ou devolvemos o dinheiro.",
  },
];

const HomepageFAQ = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const faqs = faqs_data.map((f) => ({
    icon: f.icon,
    question: t(f.questionKey, f.questionDefault),
    answer: t(f.answerKey, f.answerDefault),
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section
        ref={sectionRef}
        className="py-24 bg-[#FDFDF9] overflow-hidden scroll-mt-16"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">

          {/* Header */}
          <div className={`text-center mb-10 md:mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: '#D4AF37' }}>
              Respostas Rápidas
            </p>
            <h2 className="font-playfair text-2xl md:text-4xl font-bold text-[#1A1A2E] leading-[1.3]">
              {t("homeFaq.title", "Perguntas frequentes")}
            </h2>
            <div className="w-10 h-px mx-auto mt-5" style={{ backgroundColor: '#D4AF37', opacity: 0.8 }} />
          </div>

          {/* 2-col grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {faqs.map((faq, i) => {
              const Icon = faq.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-500 border border-[rgba(26,78,48,0.08)]"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item" className="border-none">
                      <AccordionTrigger className="px-5 py-4 md:px-6 md:py-5 hover:no-underline group [&[data-state=open]]:ring-2 [&[data-state=open]]:ring-[#D4AF37]/50 rounded-2xl transition-all duration-200">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#E8F5EE]">
                            <Icon className="w-4 h-4" style={{ color: '#1A4E30' }} />
                          </div>
                          <span className="text-sm md:text-[15px] font-semibold text-[#1A1A2E] leading-snug group-data-[state=open]:text-[#D4AF37] transition-colors duration-200">
                            {faq.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 md:px-6 pb-5">
                        <p className="text-sm md:text-[15px] text-[#1A1A2E]/60 leading-relaxed pl-12">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
};

export default HomepageFAQ;
